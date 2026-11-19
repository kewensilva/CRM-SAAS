// Lê o retorno do "Conectar com o Facebook". A Meta pode devolver os parâmetros na query
// (?code=...&state=...) ou no fragmento (#code=... — comum no Login do Facebook para
// Empresas), e em caso de erro manda o motivo em error_description / error_message. Antes só
// a query era lida: retorno pelo fragmento passava em silêncio e todo erro virava a mesma
// mensagem genérica.
export type FacebookReturn =
  | { kind: 'none' }
  | { kind: 'code'; code: string; state: string }
  | { kind: 'error'; message: string };

const USER_CANCELLED_REASONS = ['access_denied', 'user_denied'];

const toParams = (part: string): URLSearchParams => new URLSearchParams(part.replace(/^[?#]/, ''));

export const parseFacebookReturn = (search: string, hash: string): FacebookReturn => {
  const query = toParams(search);
  // "#_=_" é um resto que o Facebook acrescenta ao redirecionar — não é parâmetro.
  const fragment = toParams(hash === '#_=_' ? '' : hash);
  const get = (name: string): string | null => query.get(name) ?? fragment.get(name);

  const error = get('error') ?? get('error_code');

  if (error) {
    const reason = get('error_reason') ?? error;
    const detail = get('error_description') ?? get('error_message');

    if (USER_CANCELLED_REASONS.includes(reason) || USER_CANCELLED_REASONS.includes(error)) {
      return { kind: 'error', message: 'A autorização foi cancelada no Facebook. Clique em Conectar e aceite as permissões.' };
    }

    return { kind: 'error', message: `O Facebook recusou a autorização: ${detail ?? reason}` };
  }

  const code = get('code');
  const state = get('state');

  if (code && state) {
    return { kind: 'code', code, state };
  }

  if (code) {
    return { kind: 'error', message: 'Retorno do Facebook incompleto. Clique em Conectar com o Facebook novamente.' };
  }

  // Fluxo implícito: o Facebook devolveu um token direto, não o código que o CRM troca.
  if (get('access_token')) {
    return {
      kind: 'error',
      message:
        'O Facebook devolveu a autorização no formato de token, e o CRM espera um código. ' +
        'A Configuração do Login do Facebook para Empresas, no app da Meta da CMB, precisa permitir o retorno por código.',
    };
  }

  return { kind: 'none' };
};
