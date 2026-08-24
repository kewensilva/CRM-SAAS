import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { MAT_DATE_LOCALE, provideNativeDateAdapter } from '@angular/material/core';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { authInterceptor } from './interceptors/auth.interceptor';
import { sessionExpiredInterceptor } from './interceptors/session-expired.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(withInterceptors([authInterceptor, sessionExpiredInterceptor])),
    provideAnimationsAsync(),
    // NativeDateAdapter usa Intl.DateTimeFormat (nativo do navegador) com esse locale —
    // não precisa de registerLocaleData do Angular (só necessário pros pipes do próprio
    // Angular, que aqui sempre usam formato numérico explícito). Sem isso, o calendário
    // do filtro de Leads renderiza em inglês (meses, dias da semana, formato MM/DD/YYYY).
    { provide: MAT_DATE_LOCALE, useValue: 'pt-BR' },
    provideNativeDateAdapter(),
    // MatDatepickerIntl (labels de acessibilidade do calendário) fica só no componente
    // que usa o datepicker (leads-filter-dialog), não aqui — evita puxar
    // @angular/material/datepicker inteiro pro bundle eager só por causa desse provider.
  ]
};
