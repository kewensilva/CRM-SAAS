// Período dos Relatórios em dias de Brasília. O Brasil não tem horário de verão desde 2019,
// então um offset fixo basta: o dia 15/10 começa às 15/10 03:00 UTC. Antes o mês era
// cortado em UTC e um lead das 22h do último dia caía no mês seguinte.
const BRAZIL_UTC_OFFSET_HOURS = 3;
const DAY_MS = 24 * 60 * 60 * 1000;

export type ReportPeriod = {
    // Datas do calendário pedidas, inclusive ("YYYY-MM-DD").
    startDate: string;
    endDate: string;
    // Instantes UTC para filtrar createdAt: [start, endExclusive).
    start: Date;
    endExclusive: Date;
    // Meses (dia 1, UTC) tocados pelo período — o budget é mensal e entra com o mês cheio.
    firstMonth: Date;
    lastMonth: Date;
    monthCount: number;
};

const dayStartUtc = (isoDate: string): Date =>
    new Date(Date.parse(`${isoDate}T00:00:00.000Z`) + BRAZIL_UTC_OFFSET_HOURS * 60 * 60 * 1000);

const monthOf = (isoDate: string): Date =>
    new Date(Date.UTC(Number(isoDate.slice(0, 4)), Number(isoDate.slice(5, 7)) - 1, 1));

const isoDay = (date: Date): string => date.toISOString().slice(0, 10);

export const monthLabel = (date: Date): string => date.toISOString().slice(0, 7);

export const addMonths = (date: Date, delta: number): Date =>
    new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + delta, 1));

export const buildReportPeriod = (startDate: string, endDate: string): ReportPeriod => {
    const firstMonth = monthOf(startDate);
    const lastMonth = monthOf(endDate);

    return {
        startDate,
        endDate,
        start: dayStartUtc(startDate),
        endExclusive: new Date(dayStartUtc(endDate).getTime() + DAY_MS),
        firstMonth,
        lastMonth,
        monthCount:
            (lastMonth.getUTCFullYear() - firstMonth.getUTCFullYear()) * 12 +
            (lastMonth.getUTCMonth() - firstMonth.getUTCMonth()) +
            1,
    };
};

// Mês inteiro de um "YYYY-MM-01" — mantém o filtro antigo por mês (?month=) funcionando.
export const monthPeriod = (month: Date): ReportPeriod => {
    const lastDay = new Date(Date.UTC(month.getUTCFullYear(), month.getUTCMonth() + 1, 0));

    return buildReportPeriod(isoDay(month), isoDay(lastDay));
};

// "Hoje" em Brasília, para o período padrão (mês corrente) quando nada é informado.
export const todayInBrazil = (now: Date = new Date()): string =>
    isoDay(new Date(now.getTime() - BRAZIL_UTC_OFFSET_HOURS * 60 * 60 * 1000));

// Período a partir da query já validada: dias informados > mês informado > mês corrente
// até hoje.
export const resolveReportPeriod = (query: {
    startDate?: string | undefined;
    endDate?: string | undefined;
    month?: Date | undefined;
}): ReportPeriod => {
    if (query.startDate && query.endDate) {
        return buildReportPeriod(query.startDate, query.endDate);
    }

    if (query.month) {
        return monthPeriod(query.month);
    }

    const today = todayInBrazil();

    return buildReportPeriod(`${today.slice(0, 7)}-01`, today);
};
