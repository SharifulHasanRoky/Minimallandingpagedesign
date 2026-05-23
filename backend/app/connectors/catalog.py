"""Connector catalog.

Each entry produces a Connector subclass. Most ship as STUBs in the
skeleton. The shape of the registry never changes when you flesh one
out into a real implementation - just override `health()` (and add
`actions`).
"""

from __future__ import annotations

from .base import Connector


def _make(
    *,
    name: str,
    description: str,
    category: str,
    required_credentials: list[str],
    free_tier: bool = True,
    docs_url: str = "",
) -> type[Connector]:
    return type(
        f"{name.title().replace('-', '').replace('_', '')}Connector",
        (Connector,),
        {
            "name": name,
            "description": description,
            "category": category,
            "free_tier": free_tier,
            "required_credentials": required_credentials,
            "docs_url": docs_url,
        },
    )


# ── Performance marketing ──────────────────────────────────────────────
GoogleAds = _make(
    name="google_ads",
    description="Google Ads API: campaign reads, performance, optimisation hints.",
    category="performance_marketing",
    required_credentials=["developer_token", "client_id", "client_secret", "refresh_token", "customer_id"],
    docs_url="https://developers.google.com/google-ads/api",
)
MetaAds = _make(
    name="meta_ads",
    description="Meta Marketing API: Facebook + Instagram ads.",
    category="performance_marketing",
    required_credentials=["access_token", "ad_account_id"],
    docs_url="https://developers.facebook.com/docs/marketing-apis/",
)
TikTokAds = _make(
    name="tiktok_ads",
    description="TikTok Ads API.",
    category="performance_marketing",
    required_credentials=["access_token", "advertiser_id"],
    docs_url="https://business-api.tiktok.com/portal/docs",
)
GA4 = _make(
    name="ga4",
    description="Google Analytics 4 Data API.",
    category="analytics",
    required_credentials=["service_account_json", "property_id"],
    docs_url="https://developers.google.com/analytics/devguides/reporting/data/v1",
)
GTM = _make(
    name="gtm",
    description="Google Tag Manager API.",
    category="analytics",
    required_credentials=["service_account_json", "account_id", "container_id"],
    docs_url="https://developers.google.com/tag-platform/tag-manager/api/v2",
)
SearchConsole = _make(
    name="search_console",
    description="Google Search Console API.",
    category="seo",
    required_credentials=["service_account_json", "site_url"],
    docs_url="https://developers.google.com/webmaster-tools",
)

# ── Commerce ────────────────────────────────────────────────────────────
Shopify = _make(
    name="shopify",
    description="Shopify Admin API.",
    category="commerce",
    required_credentials=["shop_domain", "access_token"],
    docs_url="https://shopify.dev/docs/api/admin",
)
WooCommerce = _make(
    name="woocommerce",
    description="WooCommerce REST API.",
    category="commerce",
    required_credentials=["site_url", "consumer_key", "consumer_secret"],
    docs_url="https://woocommerce.github.io/woocommerce-rest-api-docs/",
)
WordPress = _make(
    name="wordpress",
    description="WordPress REST API.",
    category="cms",
    required_credentials=["site_url", "username", "app_password"],
    docs_url="https://developer.wordpress.org/rest-api/",
)
YouTube = _make(
    name="youtube",
    description="YouTube Data API.",
    category="content",
    required_credentials=["api_key"],
    docs_url="https://developers.google.com/youtube/v3",
)

# ── Comms ───────────────────────────────────────────────────────────────
Gmail = _make(
    name="gmail",
    description="Gmail via Google API.",
    category="email",
    required_credentials=["client_id", "client_secret", "refresh_token"],
    docs_url="https://developers.google.com/gmail/api",
)
GoogleDrive = _make(
    name="google_drive",
    description="Google Drive API.",
    category="files",
    required_credentials=["client_id", "client_secret", "refresh_token"],
    docs_url="https://developers.google.com/drive",
)
Telegram = _make(
    name="telegram",
    description="Telegram Bot API.",
    category="messaging",
    required_credentials=["bot_token"],
    docs_url="https://core.telegram.org/bots/api",
)
Discord = _make(
    name="discord",
    description="Discord bot integration.",
    category="messaging",
    required_credentials=["bot_token"],
    docs_url="https://discord.com/developers/docs/intro",
)
Slack = _make(
    name="slack",
    description="Slack Web API.",
    category="messaging",
    required_credentials=["bot_token"],
    docs_url="https://api.slack.com/web",
)

# ── Productivity ────────────────────────────────────────────────────────
Notion = _make(
    name="notion",
    description="Notion API.",
    category="productivity",
    required_credentials=["integration_token"],
    docs_url="https://developers.notion.com",
)
Airtable = _make(
    name="airtable",
    description="Airtable API.",
    category="productivity",
    required_credentials=["personal_access_token", "base_id"],
    docs_url="https://airtable.com/developers/web/api/introduction",
)
ClickUp = _make(
    name="clickup",
    description="ClickUp API v2.",
    category="productivity",
    required_credentials=["api_token"],
    docs_url="https://clickup.com/api",
)
Trello = _make(
    name="trello",
    description="Trello REST API.",
    category="productivity",
    required_credentials=["api_key", "api_token"],
    docs_url="https://developer.atlassian.com/cloud/trello/rest/",
)

# ── Engineering ─────────────────────────────────────────────────────────
GitHub = _make(
    name="github",
    description="GitHub REST + GraphQL.",
    category="engineering",
    required_credentials=["personal_access_token"],
    docs_url="https://docs.github.com/en/rest",
)
GitLab = _make(
    name="gitlab",
    description="GitLab API.",
    category="engineering",
    required_credentials=["personal_access_token"],
    docs_url="https://docs.gitlab.com/ee/api/",
)

# ── Infra / data ────────────────────────────────────────────────────────
Supabase = _make(
    name="supabase",
    description="Supabase Postgres + Auth + Storage.",
    category="infra",
    required_credentials=["project_url", "service_role_key"],
    docs_url="https://supabase.com/docs",
)
Firebase = _make(
    name="firebase",
    description="Firebase Admin SDK.",
    category="infra",
    required_credentials=["service_account_json", "project_id"],
    docs_url="https://firebase.google.com/docs/admin/setup",
)
Postgres = _make(
    name="postgres",
    description="Direct PostgreSQL connection.",
    category="data",
    required_credentials=["dsn"],
    docs_url="https://www.postgresql.org/docs/",
)
MySQL = _make(
    name="mysql",
    description="Direct MySQL connection.",
    category="data",
    required_credentials=["dsn"],
    docs_url="https://dev.mysql.com/doc/",
)
Redis = _make(
    name="redis",
    description="Redis cache / queue.",
    category="data",
    required_credentials=["url"],
    docs_url="https://redis.io/docs/",
)
Docker = _make(
    name="docker",
    description="Local Docker daemon control.",
    category="infra",
    required_credentials=[],  # uses local socket
    docs_url="https://docs.docker.com/engine/api/",
)
LinuxSystem = _make(
    name="linux_system",
    description="Limited shell + systemd controls (gated by approval).",
    category="infra",
    required_credentials=[],
    docs_url="",
)
PlaywrightBrowser = _make(
    name="playwright",
    description="Local Playwright browser automation.",
    category="browser",
    required_credentials=[],
    docs_url="https://playwright.dev/python/",
)


CATALOG: list[type[Connector]] = [
    GoogleAds,
    MetaAds,
    TikTokAds,
    GA4,
    GTM,
    SearchConsole,
    Shopify,
    WooCommerce,
    WordPress,
    YouTube,
    Gmail,
    GoogleDrive,
    Telegram,
    Discord,
    Slack,
    Notion,
    Airtable,
    ClickUp,
    Trello,
    GitHub,
    GitLab,
    Supabase,
    Firebase,
    Postgres,
    MySQL,
    Redis,
    Docker,
    LinuxSystem,
    PlaywrightBrowser,
]
