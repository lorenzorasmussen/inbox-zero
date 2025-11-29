import { handleCalendarCallback } from '@/utils/calendar/handle-calendar-callback';
import { microsoftCalendarProvider } from '@/utils/calendar/providers/microsoft';
import { createScopedLogger } from '@/utils/logger';
import { withError } from '@/utils/middleware';

const logger = createScopedLogger('outlook/calendar/callback');

export const GET = withError(async (request) => {
  return handleCalendarCallback(request, microsoftCalendarProvider, logger);
});
