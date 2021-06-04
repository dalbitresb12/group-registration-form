import type { NextApiRequest, NextApiResponse } from 'next';
import { isEqualStudentId, Student } from '../../utils/students';
import type { Group, GroupCreationBody } from '../../utils/groups';
import Airtable from 'airtable';
import { init, initTags } from '../../utils/sentry';
import * as Sentry from '@sentry/node';
import { isAuthenticated } from '../../utils/auth';
import Table from 'airtable/lib/table';
import { QueryParams } from 'airtable/lib/query_params';

// Initialize Sentry error logging
init();

const airtableApiKey = process.env.AIRTABLE_API_KEY;
const airtableBaseKey = process.env.AIRTABLE_BASE_KEY;

const ALLOWED_METHODS = ["GET", "POST"];

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const validateBody = (body: any): body is GroupCreationBody => {
  if (typeof body !== 'object') return false;
  const { students } = body;
  return Array.isArray(students) && students.length > 0 && !students.some(item => typeof item !== "string");
};

const fetchRecords = async (base: Table, params: Omit<QueryParams, "view"> = {}) => {
  const query = base.select({ ...params, view: 'Grid view' });

};

export default async (req: NextApiRequest, res: NextApiResponse): Promise<void> => {
  // Initialize tags for Sentry
  initTags(req);

  if (req.method && !ALLOWED_METHODS.includes(req.method)) {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  if (!airtableApiKey || !airtableBaseKey) {
    res.status(500).json({ error: 'Invalid Airtable API keys.' });
    return;
  }

  try {
    const airtable = new Airtable({
      apiKey: airtableApiKey,
    }).base(airtableBaseKey);
    const studentsBase = airtable('Estudiantes');
    const groupsBase = airtable('Grupos');

    if (req.method === 'GET') {
      const auth = await isAuthenticated(req);

      if (auth.authenticated) {
        const students = await studentsBase
          .select({
            filterByFormula: 'NOT({Grupo} = BLANK())',
            maxRecords: 50,
            view: 'Grid view',
          })
          .all()
          .then(items => items.map(item => item.fields as Student));
        
        const processed = students.reduce<Record<string, Student[]>>((acc, student) => {
          const group = Array.isArray(student["Grupo"]) && student["Grupo"].length ? student["Grupo"][0] : undefined;
          if (!group) return acc;
          if (!Array.isArray(acc[group])) acc[group] = [];
          acc[group].push(student);
          return acc;
        }, {});

        const groups = await Promise.all(Object.keys(processed).map<Promise<Group>>(async (group) => {
          const fetchedGroup = await groupsBase.find(group);
          const fields = fetchedGroup.fields as Group;
          return {
            ...fields,
            "Integrantes": processed[group],
          };
        }));

        res.status(200).json({ status: 'ok', items: groups });
      } else {
        if (auth.tokenFound) {
          const statusCode = auth.statusCode || 401;
          const message = auth.message || 'Unauthorized';

          res.status(statusCode).json({ error: message });
        } else {
          const records = await groupsBase
            .select({
              fields: ["Grupo", "Número de integrantes"],
              maxRecords: 50,
              view: 'Grid view',
            })
            .all()
            .then(items => items.map(item => item.fields as Group));

          res.status(200).json({ status: 'ok', items: records });
        }
      }
    } else {
      if (!validateBody(req.body)) {
        res.status(400).json({ error: 'Invalid body.' });
        return;
      }

      const students = req.body.students.map(item => item.toLowerCase());
      const studentRecords = await studentsBase
        .select({
          fields: ["Código", "Apellidos", "Nombres"],
          filterByFormula: '{Grupo} = BLANK()',
          maxRecords: 50,
          view: 'Grid view',
        })
        .all();
      const matchingRecords = studentRecords.reduce<{ id: string, student: Student }[]>((acc, record) => {
        // Once we have found all the records needed, just ignore everything else
        if (acc.length === students.length) return acc;
        // Try to find the record matching the students
        const fields = record.fields as Student;
        const matches = students.some(item => isEqualStudentId(fields["Código"], item));
        if (matches) acc.push({ id: record.id, student: fields });
        return acc;
      }, []);

      if (matchingRecords.length === students.length) {
        const record = await groupsBase.create({
          "Integrantes": matchingRecords.map(item => item.id),
        });
        const fields = record.fields as Group;

        res.status(200).json({ status: 'ok', group: { ...fields, "Integrantes": matchingRecords.map(item => item.student) } });
      } else {
        res.status(400).json({ error: 'Invalid group.' });
      }
    }
  } catch (err) {
    const eventId = Sentry.captureException(err);
    res.status(500).json({ error: 'Internal Server Error', eventId });
    // Flushing before returning is necessary if deploying to Vercel, see
    // https://vercel.com/docs/platform/limits#streaming-responses
    await Sentry.flush(2000);
  }
};
