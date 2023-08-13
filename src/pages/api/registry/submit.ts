import { NextApiResponse } from "next";
import { createDeathRegistry } from "src/util/database";
import { dbConnect } from "src/util/mongodb";
import { Action, Application, ChangeLog, DeathReg, FormType } from "src/types";
import { NextIronRequest, withAuth } from "../../../util/session";
import { isStaff } from "src/util/permission";
import { ObjectId } from "mongodb";
import { INFRA_SECRET } from "src/util/discord";
import axios from "axios";

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
  const reg: DeathReg = {
    ...req.body,
    _id: regId,
  };
  
  const data = {
    csn: reg.csn, // Replace with the actual csn value
    modified_by: Number.parseInt(user!!.id)    // Replace with the actual modified_by value
  };
  try {
    await axios.post("http://permareg.api.harborview.kcaz.io:3500/submit?token="+INFRA_SECRET, data)
  } catch(err) {
    res.status(400).json({ message: "Failed to submit the registration, the character is already dead/doesn't exist" });
    return;
  }

  try {
    const result = await createDeathRegistry(reg);
    if (result.acknowledged) {
      res.status(200).json({
        message: "Application submitted successfully",
        application: reg,
      });
    } else {
      res.status(500).json({ message: "Failed to submit the registration" });
    }
  } catch (error: any) {
    res.status(500).json({
      message: "Error submitting the registration",
      error: error.message,
    });
  }
}

export default withAuth(handler);
