import { handleCalendarCallback } from '@/utils/calendar/handle-calendar-callback';
import { googleCalendarProvider } from '@/utils/calendar/providers/google';
import { createScopedLogger } from '@/utils/logger';
import { withError } from '@/utils/middleware';

const logger = createScopedLogger('google/calendar/callback');

export const GET = withError(async (request) => {
  return handleCalendarCallback(request, googleCalendarProvider, logger);
});
