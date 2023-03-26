import { NextApiResponse } from "next";
import { updateApplication, updateInterview } from "src/util/database";
import { dbConnect } from "src/util/mongodb";
import { DISCORD, Interview } from "src/types";
import { NextIronRequest, withAuth } from "../../../util/session";

const handler = async (req: NextIronRequest, res: NextApiResponse) => {
  if (req.method === "POST") {
    const interview: Interview = req.body.interview;
    const interviewId: string = req.body.interviewId;
    const user = req.session.get("user");

    if (!user.roles.includes(DISCORD.STAFF_ROLE_ID)) {
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
      const result = await updateInterview(interviewId, interview);
      if (result.acknowledged) {
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