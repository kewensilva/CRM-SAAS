// TODO: trocar "cmb.com" pelo domínio real assim que for comprado. apiUrl é absoluto
// (não "/api/v1") porque o backend fica num domínio fixo separado (api.cmb.com),
// diferente do frontend, que responde em qualquer subdomínio de tenant.
export const environment = {
  production: true,
  apiUrl: 'https://api.cmb.com/api/v1',
  baseDomain: 'cmb.com',
};
