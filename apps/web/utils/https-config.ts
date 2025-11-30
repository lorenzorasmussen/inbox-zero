import { readFileSync } from 'fs';
import { resolve } from 'path';

// HTTPS configuration for local development
const httpsConfig =
  process.env.NODE_ENV === 'development' && process.env.ENABLE_HTTPS === 'true'
    ? {
        key: readFileSync(resolve('./certs/example.com+4-key.pem')),
        cert: readFileSync(resolve('./certs/example.com+4.pem')),
      }
    : undefined;

export { httpsConfig };
