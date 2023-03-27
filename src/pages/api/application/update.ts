import { NextApiResponse } from "next";
import { createApplication, updateApplication } from "src/util/database";
import { dbConnect } from "src/util/mongodb";
import { Application, DISCORD } from "src/types";
import { NextIronRequest, withAuth } from "../../../util/session";
import { isStaff } from "src/util/permission";

const handler = async (req: NextIronRequest, res: NextApiResponse) => {
  if (req.method === "POST") {
    const application: Application = req.body.application;
    const applicationId: string = req.body.applicationId;
    const user = req.session.get("user");

    if (!isStaff(user)) {
      return res
        .status(403)
        .json({ message: `You are unable to view this application...` });
    }

    if (!application || !applicationId) {
      return res
        .status(400)
        .json({
          message:
            "Please provide a valid application form and application ID.",
        });
    }

    try {
      const result = await updateApplication(applicationId, application);
      if (result.acknowledged) {
        res.status(200).json({ message: "Application updated successfully" });
      } else {
        res.status(500).json({ message: "Failed to update the application" });
      }
    } catch (error: any) {
      res.status(500).json({
        message: "Error updating the application",
        error: error.message,
      });
    }
  } else {
    res.status(405).json({ message: "Method not allowed" });
  }
};

export default withAuth(handler);
