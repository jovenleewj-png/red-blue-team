# server/routers/security.py
"""Security review rounds — store, retrieve, and record per-finding decisions."""
import json
import time
from pathlib import Path
from typing import Literal, Optional

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel

from server.main import get_current_user

router = APIRouter(prefix="/api/security", tags=["security"])

ROUNDS_DIR = Path.home() / ".nexus" / "security-rounds"
ROUNDS_DIR.mkdir(parents=True, exist_ok=True)


# ── helpers ──────────────────────────────────────────────────────────────────

def _round_path(round_id: str) -> Path:
    safe = Path(round_id).name
    if not safe or safe.startswith(".") or "/" in safe or "\\" in safe:
        raise HTTPException(400, "Invalid round_id")
    p = (ROUNDS_DIR / f"{safe}.json").resolve()
    if not str(p).startswith(str(ROUNDS_DIR.resolve())):
        raise HTTPException(400, "Invalid round_id")
    return p


def _load_round(round_id: str) -> dict:
    p = _round_path(round_id)
    if not p.exists():
        raise HTTPException(404, f"Round not found: {round_id}")
    return json.loads(p.read_text())


def _save_round(round_id: str, data: dict) -> None:
    _round_path(round_id).write_text(json.dumps(data, indent=2))


# ── models ───────────────────────────────────────────────────────────────────

class FindingDecision(BaseModel):
    decision: Literal["approved", "rejected", "deferred"]
    reason: str = ""


class RoundDecision(BaseModel):
    action: Literal["APPROVE", "APPROVE_CRITICAL_ONLY", "SKIP_ALL"]
    skip_ids: list[str] = []
    rating: Optional[int] = None


class RoundIngest(BaseModel):
    round_id: str
    date: str
    scan_coverage: str = ""
    agents_deployed: int = 0
    findings: list[dict]


# ── routes ───────────────────────────────────────────────────────────────────

@router.get("/rounds")
async def list_rounds(user: dict = Depends(get_current_user)):
    rounds = []
    for f in sorted(ROUNDS_DIR.glob("*.json"), reverse=True):
        try:
            data = json.loads(f.read_text())
            rounds.append({
                "round_id": data.get("round_id", f.stem),
                "date": data.get("date", ""),
                "status": data.get("status", "pending"),
                "finding_counts": data.get("finding_counts", {}),
                "total": len(data.get("findings", [])),
                "approved": sum(
                    1 for x in data.get("findings", [])
                    if x.get("decision") == "approved"
                ),
            })
        except Exception:
            pass
    return {"rounds": rounds}


@router.get("/rounds/{round_id}")
async def get_round(round_id: str, user: dict = Depends(get_current_user)):
    return _load_round(round_id)


@router.post("/rounds")
async def ingest_round(body: RoundIngest, user: dict = Depends(get_current_user)):
    p = _round_path(body.round_id)
    if p.exists():
        raise HTTPException(409, f"Round already exists: {body.round_id}")

    severity_order = {"critical": 0, "high": 1, "medium": 2, "low": 3, "info": 4}
    findings = sorted(body.findings, key=lambda f: severity_order.get(f.get("severity", "info").lower(), 4))

    counts: dict[str, int] = {}
    for f in findings:
        sev = f.get("severity", "info").lower()
        counts[sev] = counts.get(sev, 0) + 1
        f.setdefault("decision", "pending")
        f.setdefault("reason", "")
        f.setdefault("layman", _auto_layman(f))

    data = {
        "round_id": body.round_id,
        "date": body.date,
        "scan_coverage": body.scan_coverage,
        "agents_deployed": body.agents_deployed,
        "status": "pending",
        "rating": None,
        "ingested_at": int(time.time()),
        "finding_counts": counts,
        "findings": findings,
    }
    _save_round(body.round_id, data)
    return {"ok": True, "round_id": body.round_id, "total": len(findings)}


@router.post("/rounds/{round_id}/findings/{finding_id}/decide")
async def decide_finding(
    round_id: str,
    finding_id: str,
    body: FindingDecision,
    user: dict = Depends(get_current_user),
):
    data = _load_round(round_id)
    if data.get("status") == "dispatched":
        raise HTTPException(409, "Round already dispatched — no further changes allowed")

    match = next((f for f in data["findings"] if f.get("id") == finding_id), None)
    if match is None:
        raise HTTPException(404, f"Finding not found: {finding_id}")

    match["decision"] = body.decision
    match["reason"] = body.reason
    match["decided_at"] = int(time.time())
    _save_round(round_id, data)
    return {"ok": True}


@router.post("/rounds/{round_id}/submit")
async def submit_round(
    round_id: str,
    body: RoundDecision,
    user: dict = Depends(get_current_user),
):
    data = _load_round(round_id)
    if data.get("status") == "dispatched":
        raise HTTPException(409, "Round already dispatched")

    if body.rating is not None:
        if not (1 <= body.rating <= 5):
            raise HTTPException(400, "Rating must be 1–5")
        data["rating"] = body.rating

    approved_ids: list[str] = []

    if body.action == "SKIP_ALL":
        for f in data["findings"]:
            if f.get("decision") == "pending":
                f["decision"] = "deferred"
        data["status"] = "skipped"

    elif body.action == "APPROVE_CRITICAL_ONLY":
        for f in data["findings"]:
            if f.get("severity", "").lower() == "critical" and f.get("decision") == "pending":
                f["decision"] = "approved"
                approved_ids.append(f["id"])
            elif f.get("decision") == "pending":
                f["decision"] = "deferred"
        data["status"] = "dispatched"

    else:  # APPROVE
        skip_set = set(body.skip_ids)
        for f in data["findings"]:
            if f.get("id") in skip_set:
                f["decision"] = "deferred"
            elif f.get("decision") == "pending":
                f["decision"] = "approved"
                approved_ids.append(f["id"])
        data["status"] = "dispatched"

    data["submitted_at"] = int(time.time())
    _save_round(round_id, data)

    return {
        "ok": True,
        "status": data["status"],
        "approved_count": len(approved_ids),
        "approved_ids": approved_ids,
    }


# ── layman explanation generator ─────────────────────────────────────────────

def _auto_layman(finding: dict) -> str:
    category = finding.get("category", "").lower()
    title = finding.get("title", "").lower()
    impact = finding.get("impact", "")
    sev = finding.get("severity", "").lower()

    templates = {
        "secret": "A password or API key is written directly in the code. Anyone who reads the code can steal it and impersonate the system.",
        "injection": "An attacker can insert malicious commands into the system by crafting a special input. This can let them take control of the server or read private data.",
        "traversal": "An attacker can trick the system into accessing files it shouldn't — like navigating up and out of a folder to reach sensitive system files.",
        "ssrf": "An attacker can make the server fetch internal pages or services it should never expose — like a back-office admin panel or cloud credentials endpoint.",
        "auth": "A protected page or action can be accessed without logging in. Anyone who knows the URL can bypass security checks.",
        "xss": "An attacker can inject code that runs in the browser of anyone who views the page — potentially stealing their session or redirecting them.",
        "cors": "The server allows any website on the internet to read its responses. A malicious site could silently call this API using a logged-in user's cookies.",
        "websocket": "The real-time connection doesn't verify who is connecting. An attacker could connect and impersonate a legitimate user.",
        "hmac": "A security token can be forged because there is no timestamp check. An attacker can replay an old legitimate token indefinitely.",
        "binding": "The server is exposed on all network interfaces (0.0.0.0), not just your local machine. Any device on the same network can reach it.",
        "prompt": "External text fed to the AI (emails, user messages, transcripts) is not isolated. A crafted message could manipulate the AI into doing something it shouldn't.",
        "memory": "Different sessions can read each other's memory. A low-trust external user could read information intended only for high-trust internal sessions.",
    }

    for key, explanation in templates.items():
        if key in category or key in title:
            return explanation

    severity_fallback = {
        "critical": f"This is a critical security hole. {impact or 'An attacker could cause severe damage.'}",
        "high": f"This is a significant vulnerability. {impact or 'An attacker could exploit this to gain unauthorized access or data.'}",
        "medium": f"This vulnerability could be combined with other issues to cause damage. {impact or ''}",
        "low": f"This is a minor security concern. While not immediately dangerous, it should be cleaned up.",
    }
    return severity_fallback.get(sev, impact or "A security issue was found that should be reviewed.")
