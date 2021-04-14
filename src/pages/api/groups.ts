import type { NextApiRequest, NextApiResponse } from 'next';
import { isEqualStudentId, Student } from '../../utils/students';
import type { Group, GroupCreationBody } from '../../utils/groups';
import Airtable from 'airtable';
import { init } from '../../utils/sentry';

// Initialize Sentry error logging
init();

const airtableApiKey = process.env.AIRTABLE_API_KEY;
const airtableBaseKey = process.env.AIRTABLE_BASE_KEY;

const ALLOWED_METHODS = ["GET", "POST"];

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const validateBody = (body: any): body is GroupCreationBody => {
  if (typeof body !== 'object') return false;
  const { students } = body;
  return Array.isArray(students) && students.length > 0 && students.every(item => typeof item === 'string');
};

export default async (req: NextApiRequest, res: NextApiResponse): Promise<void> => {
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
      const records = await groupsBase
        .select({
          fields: ["Grupo", "Número de integrantes"],
          maxRecords: 50,
          view: 'Grid view',
        })
        .all()
        .then(items => items.map(item => item.fields as Group));
    
      res.status(200).json({ status: 'ok', items: records });
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
    if (err instanceof Error) {
      res.status(500).json({ error: err.message });
    } else {
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }
};
