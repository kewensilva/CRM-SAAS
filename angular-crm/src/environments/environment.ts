export const environment = {
  production: false,
  apiUrl: 'http://localhost:3333/api/v1',
  // Domínio base sem tenant (ex: "cmb.com" quando o domínio real for comprado) — qualquer
  // label extra à esquerda dele no hostname atual é lido como o slug do tenant (ver
  // core/auth/tenant-slug.util.ts). "*.localhost" resolve pra 127.0.0.1 sem configurar
  // DNS/hosts, então em dev basta abrir http://agencia-delta.localhost:4200 para testar.
  baseDomain: 'localhost',
};
