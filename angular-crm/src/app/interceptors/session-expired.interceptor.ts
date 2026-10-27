import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, switchMap, throwError } from 'rxjs';

import { AuthService } from '../core/auth/auth.service';

// Rotas em que 401 não é "sessão expirada": no login é só e-mail/senha inválidos (o usuário
// já está lá), e na própria renovação significa que o refresh token também não vale mais.
const isAuthEndpoint = (url: string): boolean =>
  url.includes('/auth/login') || url.includes('/auth/refresh-token');

// 401 em qualquer outra rota: o access token (curto) expirou. Tenta renovar uma vez com o
// refresh token e repete a requisição; se a renovação falhar, desloga e volta pra /login em
// todos os níveis de acesso.
export const sessionExpiredInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);

  return next(req).pipe(
    catchError((error: unknown) => {
      if (!(error instanceof HttpErrorResponse) || error.status !== 401 || isAuthEndpoint(req.url)) {
        return throwError(() => error);
      }

      return authService.refreshAccessToken().pipe(
        catchError(() => {
          authService.logout();

          return throwError(() => error);
        }),
        switchMap((accessToken) =>
          next(req.clone({ setHeaders: { Authorization: `Bearer ${accessToken}` } })),
        ),
      );
    }),
  );
};
