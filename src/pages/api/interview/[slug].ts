import { DISCORD } from "src/types";
import { deleteApplication, deleteInterview, getApplicationById, getInterview } from "./../../../util/database";
import { NextApiResponse } from "next";
import { NextIronRequest, withAuth, withSession } from "../../../util/session";
import { isAdmin, isStaff } from "src/util/permission";

const handler = async (req: NextIronRequest, res: NextApiResponse) => {
  switch (req.method) {
    case "GET": get(req, res); break;
    case "DELETE": del(req, res); break;
  }
  
};

const get = async (req: any, res: any) => {
  const { slug } = req.query;
  const user = req.session.get("user");
  const interviewId = await getInterview(slug as string);

  if (!interviewId) {
    return res
      .status(404)
      .json({ message: `No interviewId with ID ${slug} found...` });
  }

  if (interviewId.applicantId === user.id || isStaff(user)) {
    return res.status(200).json(interviewId);
  }

  return res
    .status(403)
    .json({ message: `You are unable to view this interview...` });
}

const del = async (req: any, res: any) => {
  const body = JSON.parse(req.body);
  const interviewId = body.interviewId;
  const user = req.session.get("user");
  const interview = await getInterview(interviewId as string);
  if (!interview) {
    return res
      .status(404)
      .json({ message: `No interviewId with ID ${interviewId} found...` });
  }

  if (isAdmin(user)) {
    await deleteInterview(interviewId);
    return res.status(200).json({ message: "Interview deleted sucessfully" });
  }

  return res
    .status(403)
    .json({ message: `You are unable to modify this interview...` });
}

export default withAuth(handler);
