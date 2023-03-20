export interface Application {
  applicantId: string;
  status: APPLICATION_STATUS;
  statusReason: string | undefined;
  updatedById: string
  submissionDate: number;
  questions: [
    {
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
    }
  ];
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
