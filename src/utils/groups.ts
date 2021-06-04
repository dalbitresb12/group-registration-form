import { Student } from './students';

export type Group = {
  "Grupo": number,
  "Integrantes"?: Student[] | string[],
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
  group: Group,
} | {
  status?: undefined,
  error: string,
  eventId?: string,
};


export type AdminGroupAPI = {
  status: "ok",
  url: string,
} | {
  status?: undefined,
  error: string,
  eventId?: string,
};
