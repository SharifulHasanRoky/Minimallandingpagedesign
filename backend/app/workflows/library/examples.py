"""Reference workflow templates the user can clone in the UI.

These are NOT loaded automatically - they're returned by GET
/api/workflows/templates so the UI can offer "Start from template".
"""

from __future__ import annotations

EXAMPLES = [
    {
        "name": "Daily KPI digest",
        "description": "Every morning, summarise yesterday's KPIs and post to Telegram.",
        "trigger": {"kind": "schedule", "interval_seconds": 86400},
        "steps": [
            {
                "id": "pull",
                "kind": "connector",
                "label": "Pull yesterday's GA4 metrics",
                "effect_class": "read",
                "inputs": {
                    "connector": "ga4",
                    "action": "run_report",
                    "args": {"metrics": ["sessions", "totalRevenue"], "dateRange": "yesterday"},
                },
            },
            {
                "id": "analyse",
                "kind": "agent",
                "label": "Analytics agent interprets the numbers",
                "needs": ["pull"],
                "effect_class": "compute",
                "inputs": {
                    "agent": "analytics",
                    "task": "Summarise yesterday's KPIs and flag anomalies.",
                },
            },
            {
                "id": "report",
                "kind": "agent",
                "label": "Reporting agent drafts the digest",
                "needs": ["analyse"],
                "effect_class": "compute",
                "inputs": {
                    "agent": "reporting",
                    "task": "Write a 5-line digest of yesterday's performance.",
                },
            },
            {
                "id": "send",
                "kind": "connector",
                "label": "Send to Telegram (REQUIRES APPROVAL)",
                "needs": ["report"],
                "effect_class": "mutate_external",
                "inputs": {
                    "connector": "telegram",
                    "action": "send_message",
                    "args": {"chat_id": "{{user_chat}}", "text": "{{report.reply}}"},
                },
            },
        ],
    },
    {
        "name": "Meta Ads ROAS guardrail",
        "description": "Detect ROAS drops and suggest fixes; never spends without approval.",
        "trigger": {"kind": "schedule", "interval_seconds": 3600},
        "steps": [
            {
                "id": "pull",
                "kind": "connector",
                "effect_class": "read",
                "inputs": {"connector": "meta_ads", "action": "fetch_campaigns"},
            },
            {
                "id": "audit",
                "kind": "agent",
                "needs": ["pull"],
                "effect_class": "compute",
                "inputs": {
                    "agent": "marketing",
                    "task": "Find campaigns with ROAS below threshold and recommend fixes.",
                },
            },
            {
                "id": "remember",
                "kind": "memory",
                "needs": ["audit"],
                "effect_class": "mutate_internal",
                "inputs": {
                    "op": "remember",
                    "kind": "kpi",
                    "text": "ROAS audit ran",
                },
            },
        ],
    },
]
