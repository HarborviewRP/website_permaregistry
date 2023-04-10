import { Action, ChangeLog, DISCORD, FormType, Interview } from "./../../../types";
import { NextApiResponse } from "next";
import { createChangeLog, createInterview } from "src/util/database";
import { NextIronRequest, withAuth } from "../../../util/session";
import { isStaff } from "src/util/permission";
import { ObjectId } from "mongodb";

const handler = async (req: NextIronRequest, res: NextApiResponse) => {
  if (req.method === "POST") {
    const interview: Interview = {
      ...req.body,
      _id: new ObjectId(),
    };
    const user = req.session.get("user");
    if (!isStaff(user)) {
      return res.status(403).json({ message: "Unauthorized" });
    }
    try {
      const result = await createInterview(interview);
      if (result.acknowledged) {
        const changeLog: ChangeLog = {
          userId: user.id,
          form: FormType.INTERVIEW,
          formId: (interview as any)._id,
          action: Action.CREATED,
          changes: [],
        }
        await createChangeLog(changeLog)
        res
          .status(200)
          .json({
            message: "Interview submitted successfully",
            interview: interview,
          });
      } else {
        res.status(500).json({ message: "Failed to submit the Interview" });
      }
    } catch (error: any) {
      res
        .status(500)
        .json({
          message: "Error submitting the Interview",
          error: error.message,
        });
    }
  } else {
    res.status(405).json({ message: "Method not allowed" });
  }
};

export default withAuth(handler);
