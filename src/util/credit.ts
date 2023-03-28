export const calculateCredit = (applications: number, interviews: number) => {
  return (
    Math.max(applications, 0) * CREDIT.APPLICATION_REVIEW +
    Math.max(interviews, 0) * CREDIT.INTERVIEW_REVIEW
  );
};

export const CREDIT = {
  INTERVIEW_REVIEW: 1,
  APPLICATION_REVIEW: 0.25,
};
