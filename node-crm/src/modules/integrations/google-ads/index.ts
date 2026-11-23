import { subscribeLeadEvents } from "../../../shared/events/lead-events";
import { conversionTriggerService } from "./services/conversion-trigger.service";

export { googleAdsRoutes } from "./routes/google-ads.routes";

// Momentos do Lead (criado, Em andamento, Vendido) viram conversões offline no Google Ads.
subscribeLeadEvents(conversionTriggerService.handleLeadEvent);
