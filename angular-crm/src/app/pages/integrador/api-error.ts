// Mensagem devolvida pela API (com o motivo do Google/RD/Bitrix quando houver) ou o padrão.
export const apiErrorMessage = (error: unknown, fallback: string): string => {
  const body = (error as { error?: { message?: string; errors?: { message: string }[] } })?.error;
  const details = body?.errors?.map((item) => item.message).join(' ');

  return details || body?.message || fallback;
};
