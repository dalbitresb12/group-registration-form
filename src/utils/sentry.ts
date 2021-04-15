import type { NextApiRequest } from 'next';
import * as Sentry from '@sentry/node';
import { RewriteFrames } from '@sentry/integrations';

const NEXT_PUBLIC_SENTRY_DSN = process.env.NEXT_PUBLIC_SENTRY_DSN;
const NEXT_IS_SERVER = process.env.NEXT_IS_SERVER;
const NEXT_PUBLIC_SENTRY_SERVER_ROOT_DIR = process.env.NEXT_PUBLIC_SENTRY_SERVER_ROOT_DIR;

export const init = (): void => {
  if (NEXT_PUBLIC_SENTRY_DSN) {
    const integrations = [];
    if (NEXT_IS_SERVER === 'true' && NEXT_PUBLIC_SENTRY_SERVER_ROOT_DIR) {
      // For Node.js, rewrite Error.stack to use relative paths, so that source
      // maps starting with ~/_next map to files in Error.stack with path
      // app:///_next
      integrations.push(
        new RewriteFrames({
          iteratee: (frame) => {
            frame.filename = frame.filename?.replace(
              NEXT_PUBLIC_SENTRY_SERVER_ROOT_DIR,
              'app:///'
            );
            frame.filename = frame.filename?.replace('.next', '_next');
            return frame;
          }
        }),
      );
    }

    Sentry.init({
      enabled: process.env.NODE_ENV === 'production',
      integrations,
      dsn: NEXT_PUBLIC_SENTRY_DSN,
      release: process.env.NEXT_PUBLIC_COMMIT_SHA,
    });
  }
};

export const initTags = (req: NextApiRequest): void => {
  Sentry.setTags({
    api: true,
    url: req.url,
    method: req.method,
    httpVersion: req.httpVersion,
    query: JSON.stringify(req.query),
  });
};
