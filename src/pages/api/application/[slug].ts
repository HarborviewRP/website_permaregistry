import { Action, ChangeLog, DISCORD, FormType } from "src/types";
import { createChangeLog, deleteApplication, getApplicationById } from "./../../../util/database";
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
  const application = await getApplicationById(slug as string);

  if (!application) {
    return res
      .status(404)
      .json({ message: `No application with ID ${slug} found...` });
  }

  if (application.applicantId === user.id || isStaff(user)) {
    return res.status(200).json(application);
  }

  return res
    .status(403)
    .json({ message: `You are unable to view this application...` });
}

const del = async (req: any, res: any) => {
  const body = JSON.parse(req.body);
  const applicationId = body.applicationId;
  const user = req.session.get("user");
  const application = await getApplicationById(applicationId as string);
  if (!application) {
    return res
      .status(404)
      .json({ message: `No application with ID ${applicationId} found...` });
  }

  if (isAdmin(user)) {
    await deleteApplication(applicationId);

    const changeLog: ChangeLog = {
      userId: user.id,
      form: FormType.APPLICATION,
      formId: applicationId,
      action: Action.DELETED,
      changes: []
    }
    await createChangeLog(changeLog);
    
    return res.status(200).json({ message: "Application deleted sucessfully" });
  }

  return res
    .status(403)
    .json({ message: `You are unable to modify this application...` });
}

export default withAuth(handler);
