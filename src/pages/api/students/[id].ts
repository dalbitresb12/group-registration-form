import type { NextApiRequest, NextApiResponse } from 'next';
import Airtable from 'airtable';

const airtableApiKey = process.env.AIRTABLE_API_KEY;
const airtableBaseKey = process.env.AIRTABLE_BASE_KEY;
const studentIdRegex = /^[uU]?[^uU]{1}[a-zA-Z0-9]{8}$/;

export default async (req: NextApiRequest, res: NextApiResponse): Promise<void> => {
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  if (!airtableApiKey || !airtableBaseKey) {
    res.status(500).json({ error: 'Invalid Airtable API keys.' });
    return;
  }

  const id = Array.isArray(req.query.id) ? req.query.id[0] : req.query.id;
  if (!req.query.id) {
    res.status(400).json({ error: 'No user ID was found.' });
    return;
  }
  if (!studentIdRegex.test(id)) {
    res.status(400).json({ error: 'Invalid user ID.' });
    return;
  }

  try {
    const airtable = new Airtable({
      apiKey: airtableApiKey,
    }).base(airtableBaseKey);
    const base = airtable('Estudiantes');
  
    const records = await base
      .select({
        fields: ["Código", "Apellidos", "Nombres"],
        filterByFormula: `FIND('${id.toLowerCase()}', LOWER({Código}))`,
        maxRecords: 1,
        view: 'Grid view',
      })
      .all()
      .then(items => items.map(item => item.fields));
  
    res.status(200).json({ status: 'ok', items: records });
  } catch (err) {
    if (err instanceof Error) {
      res.status(500).json({ error: err.message });
    } else {
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }
};
