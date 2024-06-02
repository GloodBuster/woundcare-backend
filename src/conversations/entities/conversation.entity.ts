import {  Genre, Role } from '@prisma/client';

export type Conversation = {
  id: number;
  userId: string;
  user: {
    fullname: string;
    role: Role;
    patient: {
      genre: Genre;
    }[];
    doctor: {
      genre: Genre;
    }[];
  };
  nurseId: string;
  nurse: {
    genre: Genre;
    user: {
      fullname: string;
    };
  };
  medicalFileId: number;
};
