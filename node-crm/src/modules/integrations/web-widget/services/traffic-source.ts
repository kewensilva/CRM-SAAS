// Fonte (utm_source / utm_medium) de um lead do site quando a URL não trouxe UTM — deduzida,
// nesta ordem, dos identificadores de clique na URL da página e do site de onde o visitante
// veio (referrer). UTM informada sempre tem prioridade: só preenchemos o que faltou.

export type TrafficSource = {
    utmSource?: string | undefined;
    utmMedium?: string | undefined;
    utmCampaign?: string | undefined;
    utmTerm?: string | undefined;
    utmContent?: string | undefined;
};

type SourceRule = { source: string; medium: string };

// Domínio do referrer → fonte. Subdomínios contam: Instagram e Facebook passam por
// redirecionadores próprios (l.instagram.com, lm.facebook.com).
const REFERRER_RULES: { match: RegExp; rule: SourceRule }[] = [
    { match: /(^|\.)instagram\.com$/, rule: { source: "instagram", medium: "referral" } },
    { match: /(^|\.)(facebook\.com|fb\.com|fb\.me)$/, rule: { source: "facebook", medium: "referral" } },
    { match: /(^|\.)(google\.[a-z.]+)$/, rule: { source: "google", medium: "organic" } },
    { match: /(^|\.)bing\.com$/, rule: { source: "bing", medium: "organic" } },
    { match: /(^|\.)(yahoo\.com|duckduckgo\.com)$/, rule: { source: "busca", medium: "organic" } },
    { match: /(^|\.)(linkedin\.com|lnkd\.in)$/, rule: { source: "linkedin", medium: "referral" } },
    { match: /(^|\.)(youtube\.com|youtu\.be)$/, rule: { source: "youtube", medium: "referral" } },
    { match: /(^|\.)(whatsapp\.com|wa\.me)$/, rule: { source: "whatsapp", medium: "referral" } },
    { match: /(^|\.)(t\.co|twitter\.com|x\.com)$/, rule: { source: "twitter", medium: "referral" } },
    { match: /(^|\.)tiktok\.com$/, rule: { source: "tiktok", medium: "referral" } },
];

const safeUrl = (value: string | undefined): URL | null => {
    if (!value) {
        return null;
    }

    try {
        return new URL(value);
    } catch {
        return null;
    }
};

const hostOf = (url: URL | null): string | null => url?.hostname.replace(/^www\./, "").toLowerCase() ?? null;

const fromReferrer = (referrer: URL | null, page: URL | null): SourceRule | null => {
    const host = hostOf(referrer);

    // Sem referrer (acesso direto, app que não informa) ou navegação dentro do próprio site.
    if (!host || host === hostOf(page)) {
        return null;
    }

    return REFERRER_RULES.find(({ match }) => match.test(host))?.rule ?? { source: host, medium: "referral" };
};

// Identificador de clique de anúncio na URL. fbclid vale para Facebook e Instagram — o
// referrer decide qual dos dois.
const fromClickId = (page: URL | null, referrerRule: SourceRule | null): SourceRule | null => {
    const params = page?.searchParams;

    if (!params) {
        return null;
    }

    if (params.has("gclid") || params.has("gbraid") || params.has("wbraid")) {
        return { source: "google", medium: "cpc" };
    }

    if (params.has("msclkid")) {
        return { source: "bing", medium: "cpc" };
    }

    if (params.has("fbclid")) {
        return { source: referrerRule?.source === "instagram" ? "instagram" : "facebook", medium: "social" };
    }

    return null;
};

// UTMs que vieram na própria URL da página, caso o script não tenha conseguido enviá-las.
const fromPageUtm = (page: URL | null): TrafficSource | null => {
    const params = page?.searchParams;
    const source = params?.get("utm_source");

    if (!params || !source) {
        return null;
    }

    return {
        utmSource: source,
        utmMedium: params.get("utm_medium") ?? undefined,
        utmCampaign: params.get("utm_campaign") ?? undefined,
        utmTerm: params.get("utm_term") ?? undefined,
        utmContent: params.get("utm_content") ?? undefined,
    };
};

export const resolveTrafficSource = (
    submitted: TrafficSource,
    pageUrl: string | undefined,
    referrerUrl: string | undefined,
): TrafficSource => {
    if (submitted.utmSource) {
        return submitted;
    }

    const page = safeUrl(pageUrl);
    const pageUtm = fromPageUtm(page);

    if (pageUtm) {
        return pageUtm;
    }

    const referrerRule = fromReferrer(safeUrl(referrerUrl), page);
    const rule = fromClickId(page, referrerRule) ?? referrerRule;

    return rule ? { ...submitted, utmSource: rule.source, utmMedium: rule.medium } : submitted;
};
