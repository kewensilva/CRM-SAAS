import { Lead } from '../../models/lead.model';

// Fonte do Lead ("instagram / anuncio", "google / cpc"), diferente da Origem (Site, Meta ou
// Manual = por onde o Lead entrou no CRM). Vem da UTM da URL nos leads do site e da
// plataforma do Meta Lead Ads; leads manuais não têm Fonte. Nunca editável.
export const formatLeadFonte = (lead: Pick<Lead, 'utmSource' | 'utmMedium'>): string | null => {
  if (!lead.utmSource) {
    return null;
  }

  return lead.utmMedium ? `${lead.utmSource} / ${lead.utmMedium}` : lead.utmSource;
};
