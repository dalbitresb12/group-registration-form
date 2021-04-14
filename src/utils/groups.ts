import { Student } from './students';

export type Group = {
  "Grupo": number,
  "Integrantes"?: string[],
  "Número de integrantes": number,
};

export type GroupCreationBody = {
  students: string[],
};

export type GroupFormValues = {
  students: {
    value: string,
  }[],
};

export type GroupAPI = {
  status: "ok",
  group: {
    "Grupo": number,
    "Integrantes": Student[],
    "Número de integrantes": number,
  },
};
