import { verifySignatureAppRouter } from '@upstash/qstash/nextjs';
import { handleBatchRequest } from '@/app/api/user/categorize/senders/batch/handle-batch';
import { withError } from '@/utils/middleware';

export const maxDuration = 300;

export const POST = withError(verifySignatureAppRouter(handleBatchRequest));
