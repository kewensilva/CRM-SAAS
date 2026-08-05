// Branch de domínio único (static-domain): apiUrl é absoluto porque o backend fica num
// domínio separado (api.crm-cmb.com.br, no Render); o frontend (Vercel) sempre responde
// no mesmo domínio (crm-cmb.com.br) — baseDomain só existe pra igualar o hostname atual
// e nunca resolver nenhum slug (ver core/auth/tenant-slug.util.ts).
export const environment = {
  production: true,
  apiUrl: 'https://api.crm-cmb.com.br/api/v1',
  baseDomain: 'crm-cmb.com.br',
};
