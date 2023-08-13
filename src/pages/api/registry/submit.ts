import { NextApiResponse } from "next";
import { createDeathRegistry } from "src/util/database";
import { dbConnect } from "src/util/mongodb";
import { Action, Application, ChangeLog, DeathReg, FormType } from "src/types";
import { NextIronRequest, withAuth } from "../../../util/session";
import { isStaff } from "src/util/permission";
import { ObjectId } from "mongodb";

const handler = async (req: NextIronRequest, res: NextApiResponse) => {
  switch (req.method) {
    case "POST": post(req, res); break;
  }
};

const post = async (req: any, res: any) => {
  const user = req.session.get("user");

  if (!isStaff(user)) {
    return res.status(403).json({ message: 'You must be a member of SAFR to do this...' })
  }

  const regId = new ObjectId();

  console.log(req.body)

  const reg: DeathReg = {
    ...req.body,
    _id: regId,
  };
  try {
    const result = await createDeathRegistry(reg);
    if (result.acknowledged) {
      res.status(200).json({
        message: "Application submitted successfully",
        application: reg,
      });
    } else {
      res.status(500).json({ message: "Failed to submit the application" });
    }
  } catch (error: any) {
    res.status(500).json({
      message: "Error submitting the application",
      error: error.message,
    });
  }
}

export default withAuth(handler);
