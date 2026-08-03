import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';

import { AuthService } from '../core/auth/auth.service';

// 401 na própria tela de login é só "e-mail/senha inválidos" (o usuário já está lá,
// não precisa de redirecionamento) — qualquer outro 401 significa sessão expirada ou
// token inválido, então desloga e volta pra /login em todos os níveis de acesso.
export const sessionExpiredInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);

  return next(req).pipe(
    catchError((error: unknown) => {
      if (error instanceof HttpErrorResponse && error.status === 401 && !req.url.includes('/auth/login')) {
        authService.logout();
      }

      return throwError(() => error);
    }),
  );
};
