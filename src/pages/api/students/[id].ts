import type { NextApiRequest, NextApiResponse } from 'next';
import Airtable from 'airtable';
import * as Sentry from '@sentry/node';
import { StudentIdRegex } from '../../../utils/students';
import { init, initTags } from '../../../utils/sentry';

// Initialize Sentry error logging
init();

const airtableApiKey = process.env.AIRTABLE_API_KEY;
const airtableBaseKey = process.env.AIRTABLE_BASE_KEY;


export default async (req: NextApiRequest, res: NextApiResponse): Promise<void> => {
  // Initialize tags for Sentry
  initTags(req);

  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  if (!airtableApiKey || !airtableBaseKey) {
    res.status(500).json({ error: 'Invalid Airtable API keys.' });
    return;
  }
  
  try {
    const id = Array.isArray(req.query.id) ? req.query.id[0] : req.query.id;
    if (!req.query.id) {
      res.status(400).json({ error: 'No user ID was found.' });
      return;
    }
    if (!StudentIdRegex.test(id)) {
      res.status(400).json({ error: 'Invalid user ID.' });
      return;
    }

    const airtable = new Airtable({
      apiKey: airtableApiKey,
    }).base(airtableBaseKey);
    const base = airtable('Estudiantes');
  
    const records = await base
      .select({
        fields: ["Código", "Apellidos", "Nombres"],
        filterByFormula: `AND({Grupo} = BLANK(), FIND('${id.toLowerCase()}', LOWER({Código})))`,
        maxRecords: 1,
        view: 'Grid view',
      })
      .all()
      .then(items => items.map(item => item.fields));
  
    res.status(200).json({ status: 'ok', items: records });
  } catch (err) {
    const eventId = Sentry.captureException(err);
    res.status(500).json({ error: 'Internal Server Error', eventId });
    // Flushing before returning is necessary if deploying to Vercel, see
    // https://vercel.com/docs/platform/limits#streaming-responses
    await Sentry.flush(2000);
  }
};
