export type Student = {
  "Código": string,
  "Apellidos": string,
  "Nombres": string,
  "Grupo"?: string[],
};

export type StudentAPI = {
  status: "ok",
  items: Student[],
} | {
  error: string,
};

export const StudentIdRegex = /^[uU]?[^uU]{1}[a-zA-Z0-9]{8}$/;

export const isValidStudent = (id: string): boolean => {
  return StudentIdRegex.test(id);
};

export const normalizeStudentId = (id: string): string => {
  id = id.toLowerCase();
  return id.startsWith('u') ? id.substring(1) : id;
};

export const isEqualStudentId = (a: string, b: string): boolean => {
  return normalizeStudentId(a) === normalizeStudentId(b);
};
