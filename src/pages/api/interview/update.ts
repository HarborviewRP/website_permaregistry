import { NextApiResponse } from "next";
import { compareForms, createChangeLog, getInterview, updateApplication, updateInterview } from "src/util/database";
import { dbConnect } from "src/util/mongodb";
import { Action, ChangeLog, DISCORD, FormType, Interview } from "src/types";
import { NextIronRequest, withAuth } from "../../../util/session";
import { isStaff } from "src/util/permission";
import { sendDm } from "src/util/discord";

const handler = async (req: NextIronRequest, res: NextApiResponse) => {
  if (req.method === "POST") {
    const interview: Interview = req.body.interview;
    const interviewId: string = req.body.interviewId;
    const user = req.session.get("user");

    if (!isStaff(user)) {
      return res
        .status(403)
        .json({ message: `You are unable to modify this interview...` });
    }

    if (!interview || !interviewId) {
      return res
        .status(400)
        .json({
          message:
            "Please provide a valid interview form and interview ID.",
        });
    }


    try {
      const oldInterview = await getInterview(interviewId);
      const result = await updateInterview(interviewId, interview);
      if (result.acknowledged) {

        const changeLog: ChangeLog = {
          userId: user.id,
          form: FormType.INTERVIEW,
          formId: interviewId,
          action: Action.MODIFIED,
          changes: compareForms(oldInterview!!, interview),
        }
        await createChangeLog(changeLog)

        if (req.body.statusUpdate) {
          await sendDm(interview.applicantId, {
            embeds: [
              {
                type: "rich",
                title: `Interview Update`,
                description: `Your PGN: Underground staff interview has been updated!`,
                color: interview.status === 2 ? 0xeb0909 : 0x0bef16 ,
                fields: [
                  {
                    name: `Status`,
                    value: interview.status === 1 ? "Approved" : "Rejected",
                    inline: true,
                  },
                  {
                    name: `Reason`,
                    value: interview.reason || "no reason given",
                  },
                ],
                footer: {
                  text: `This is an automated message regarding your PGN: Underground staff interview. Do not reply to this message as it is not monitored`,
                },
                url: `${process.env.DOMAIN}/interviews/${interviewId}`,
                timestamp: new Date(),
              },
            ],
          });
        }
        res.status(200).json({ message: "Interview updated successfully" });
      } else {
        res.status(500).json({ message: "Failed to update the interview" });
      }
    } catch (error: any) {
      res.status(500).json({
        message: "Error updating the interview",
        error: error.message,
      });
    }
  } else {
    res.status(405).json({ message: "Method not allowed" });
  }
};

export default withAuth(handler);
