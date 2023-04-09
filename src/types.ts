export interface User {
  accent_color: string;
  avatar: string;
  banner: string;
  banner_color: string;
  discriminator: string;
  email: string;
  flags: number;
  id: string;
  isAdmin: boolean;
  isModerator: boolean;
  locale: string;
  mfa_enabled: boolean;
  premium_type: number;
  public_flags: number;
  token: string;
  username: string;
  nick: string;
  roles: string[];
  verified: boolean;
  access_level: ACCESS_LEVEL;
}

export interface UserData {
  id: string;
  name: string;
  discriminator: string;
  avatar: string;
  banner?: string;
  developer: boolean;
  moderator: boolean;
  botModerator: boolean;
  honorable: boolean;
}

export interface PageProps {
  user?: User;
}

export enum ACCESS_LEVEL {
  VISITOR = 0,
  FTA = 1,
  FTO = 2,
  ADMIN = 3,
}

export enum APP_INTERVIEW_STATUS {
  PENDING = 0,
  PASSED = 1,
  FAILED = 2,
}

export type Note = {
  noteId: string;
  authorId: string;
  timestamp: number;
  text: string;
};

export interface Application {
  _id: any | undefined;
  applicantId: string;
  status: STATUS;
  statusReason: string | undefined;
  updatedById: string;
  submissionDate: number;
  lastUpdate: number;
  sections: {
    sectionId: string;
    sectionText: string;
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
  }[];
  notes: Note[] | [];
  interviewId: string | undefined;
}

export interface Interview {
  _id: any | undefined;
  applicationId: string;
  applicantId: string;
  claimedById: string | undefined | null;
  creationDate: number;
  status: STATUS;
  reason: string | undefined;
  updatedById: string;
  lastUpdate: number;
  notes: Note[] | [];
  recording_path: string | undefined;
}

export interface ChangeLog {
  userId: string;
  form: FormType;
  formId: string;
  action: Action;
  changes: FormActionChange[] | undefined;
}

export enum Action {
  CREATED,
  DELETED,
  MODIFIED,
}

export interface FormActionChange {
  field: string;
  index?: number;
  previous: string;
  change: string;
}

export enum FormType {
  INTERVIEW,
  APPLICATION,
}

export enum STATUS {
  PENDING,
  ACCEPTED,
  REJECTED,
}

export class DISCORD {
  static readonly ID = process.env.DISCORD_ID || "605469902152663073";
  static readonly STAFF_ROLE_ID =
    process.env.STAFF_ROLE_ID || "1081002383905136662";
  static readonly SUPERADMIN_ROLE = process.env.SUPERADMIN__ROLE || "1050767934018035772";
  static readonly VERIFY_ROLE = process.env.VERIFY_ROLE || "995813347767365732";
}

export const convertStatus = (status: number) => {
  let str: string;
  switch (status) {
    case 0:
      str = "pending";
      break;
    case 1:
      str = "approved";
      break;
    case 2:
      str = "rejected";
      break;
    default:
      str = "unknown";
      break;
  }
  return str;
};
