import { Injectable } from '@angular/core';
import { MatDatepickerIntl } from '@angular/material/datepicker';

// MAT_DATE_LOCALE/LOCALE_ID traduzem o formato de data e os nomes de mês/dia no
// calendário, mas os rótulos de acessibilidade (aria-label dos botões de navegação) são
// strings fixas em inglês no MatDatepickerIntl padrão — precisam ser sobrescritas à parte.
@Injectable()
export class PtBrDatepickerIntl extends MatDatepickerIntl {
  override calendarLabel = 'Calendário';
  override openCalendarLabel = 'Abrir calendário';
  override closeCalendarLabel = 'Fechar calendário';
  override prevMonthLabel = 'Mês anterior';
  override nextMonthLabel = 'Próximo mês';
  override prevYearLabel = 'Ano anterior';
  override nextYearLabel = 'Próximo ano';
  override prevMultiYearLabel = '24 anos anteriores';
  override nextMultiYearLabel = 'Próximos 24 anos';
  override switchToMonthViewLabel = 'Escolher data';
  override switchToMultiYearViewLabel = 'Escolher mês e ano';
}
