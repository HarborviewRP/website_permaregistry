import { DISCORD, Interview } from "./../../../types";
import { NextApiResponse } from "next";
import { createInterview } from "src/util/database";
import { NextIronRequest, withAuth } from "../../../util/session";
import { ObjectID } from "bson";

const handler = async (req: NextIronRequest, res: NextApiResponse) => {
  if (req.method === "POST") {
    const interview: Interview = {
      ...req.body,
      _id: new ObjectID().toString(),
    };
    const user = req.session.get("user");
    if (!user.roles.includes(DISCORD.STAFF_ROLE_ID)) {
      return res.status(403).json({ message: "Unauthorized" });
    }
    try {
      const result = await createInterview(interview);
      if (result.acknowledged) {
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
