// Descobre o slug do tenant a partir do hostname atual do navegador — nunca de um campo
// preenchido pelo usuário. "crm.cmb.com" (== baseDomain) é o domínio do Owner/administrativo
// da CMB; qualquer subdomínio extra à esquerda (ex: "agencia-delta.cmb.com") é o slug.
export const resolveTenantSlug = (hostname: string, baseDomain: string): string | null => {
  const host = hostname.toLowerCase();
  const base = baseDomain.toLowerCase();

  if (host === base) {
    return null;
  }

  const suffix = `.${base}`;

  if (!host.endsWith(suffix)) {
    return null;
  }

  const slug = host.slice(0, -suffix.length);

  // Só o primeiro nível de subdomínio vira slug — "www.cmb.com" não é um tenant.
  if (!slug || slug.includes('.') || slug === 'www') {
    return null;
  }

  return slug;
};
