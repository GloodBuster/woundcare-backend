import { Patient } from '@prisma/client';

export type PatientDto = Patient & {
  user: {
    fullname: string;
  };
};
