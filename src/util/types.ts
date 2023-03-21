export interface Application {
  applicantId: string;
  status: APPLICATION_STATUS;
  statusReason: string | undefined;
  updatedById: string
  submissionDate: number;
  questions: {
    questionId: string;
    questionText: string;
    responseType: string;
    choices:
      | [
          {
            choiceId: string;
            choiceText: string;
          }
        ]
      | undefined;
    response: {
      value: string;
      choiceId: string | undefined;
    };
  }[];
  notes: [
    | {
        noteId: string;
        authorId: string;
        timestamp: number;
        text: string;
      }
    | undefined
  ];
  interviewId: string | undefined;
}

export enum APPLICATION_STATUS {
  PENDING,
  ACCEPTED,
  REJECTED,
}

export class DISCORD {
    static readonly ID = process.env.DISCORD_ID || '605469902152663073';
    static readonly STAFF_ROLE_ID = process.env.STAFF_ROLE_ID || '1081002383905136662';
    static readonly VERIFY_ROLE = process.env.VERIFY_ROLE || '995813347767365732';
}