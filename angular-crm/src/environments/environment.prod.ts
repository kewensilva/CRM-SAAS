// apiUrl é absoluto (não "/api/v1") porque o backend fica num domínio fixo separado
// (api.crm-cmb.com.br, no Fly.io), diferente do frontend (Vercel), que responde em
// qualquer subdomínio de tenant (<slug>.crm-cmb.com.br).
export const environment = {
  production: true,
  apiUrl: 'https://api.crm-cmb.com.br/api/v1',
  baseDomain: 'crm-cmb.com.br',
};
