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
