export type ConversationDto = {
  id: number;
  userId: string;
  nurseId: string;
  medicalFileId: number;
  lastMessageText: string | null;
  lastMessageDate: Date | null;
  nurse: {
    fullname: string;
  };
  user: {
    fullname: string;
  };
};

export type ConversationQuery = {
  id: number;
  userId: string;
  nurseId: string;
  medicalFileId: number;
  userfullname: string;
  nursefullname: string;
  lastmessagedate: Date | null;
  lastmessagecontent: string | null;
};
