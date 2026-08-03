import { Lead, LeadSource, LeadStatus } from '../../models/lead.model';

export type DatePreset = 'THIS_MONTH' | 'LAST_30' | 'LAST_60' | 'LAST_90' | null;

export interface LeadsFilterValue {
  datePreset: DatePreset;
  startDate: Date | null;
  endDate: Date | null;
  statuses: LeadStatus[];
  sources: LeadSource[];
  responsibleUserId: string | null;
}

export const EMPTY_LEADS_FILTER: LeadsFilterValue = {
  datePreset: null,
  startDate: null,
  endDate: null,
  statuses: [],
  sources: [],
  responsibleUserId: null,
};

const startOfDay = (date: Date): Date => {
  const result = new Date(date);
  result.setHours(0, 0, 0, 0);
  return result;
};

const endOfDay = (date: Date): Date => {
  const result = new Date(date);
  result.setHours(23, 59, 59, 999);
  return result;
};

// Presets calculam o intervalo a partir de hoje; sem preset, usa as datas manuais
// escolhidas no diálogo (ou nenhum limite, se também vazias).
export const resolveDateRange = (filter: LeadsFilterValue): { start: Date | null; end: Date | null } => {
  if (!filter.datePreset) {
    return { start: filter.startDate, end: filter.endDate };
  }

  const today = new Date();
  const start = new Date(today);

  switch (filter.datePreset) {
    case 'THIS_MONTH':
      start.setDate(1);
      break;
    case 'LAST_30':
      start.setDate(start.getDate() - 29);
      break;
    case 'LAST_60':
      start.setDate(start.getDate() - 59);
      break;
    case 'LAST_90':
      start.setDate(start.getDate() - 89);
      break;
  }

  return { start: startOfDay(start), end: endOfDay(today) };
};

export const matchesLeadFilter = (lead: Lead, filter: LeadsFilterValue): boolean => {
  if (filter.statuses.length > 0 && !filter.statuses.includes(lead.status)) {
    return false;
  }

  if (filter.sources.length > 0 && !filter.sources.includes(lead.source)) {
    return false;
  }

  if (filter.responsibleUserId && lead.responsibleUserId !== filter.responsibleUserId) {
    return false;
  }

  const { start, end } = resolveDateRange(filter);
  const createdAt = new Date(lead.createdAt);

  if (start && createdAt < start) {
    return false;
  }

  if (end && createdAt > endOfDay(end)) {
    return false;
  }

  return true;
};
