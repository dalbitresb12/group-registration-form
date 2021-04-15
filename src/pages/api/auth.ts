import type { NextApiRequest, NextApiResponse } from 'next';
import * as Sentry from '@sentry/node';
import { init, initTags } from '../../utils/sentry';
import { isAuthenticated } from '../../utils/auth';

// Initialize Sentry error logging
init();

export default async (req: NextApiRequest, res: NextApiResponse): Promise<void> => {
  // Initialize tags for Sentry
  initTags(req);

  if (req.method !== "GET") {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    const auth = await isAuthenticated(req);
  
    if (auth.authenticated) {
      res.status(200).json({ status: 'ok', user: auth.user });
    } else {
      const statusCode = auth.statusCode || 401;
      const message = auth.message || 'Unauthorized';

      res.status(statusCode).json({ error: message });
    }
  } catch (err) {
    const eventId = Sentry.captureException(err);
    res.status(500).json({ error: 'Internal Server Error', eventId });
    // Flushing before returning is necessary if deploying to Vercel, see
    // https://vercel.com/docs/platform/limits#streaming-responses
    await Sentry.flush(2000);
  }
};
