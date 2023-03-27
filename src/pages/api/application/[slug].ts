import { DISCORD } from "src/types";
import { getApplicationById } from "./../../../util/database";
import { NextApiResponse } from "next";
import { NextIronRequest, withAuth, withSession } from "../../../util/session";
import { isStaff } from "src/util/permission";

const handler = async (req: NextIronRequest, res: NextApiResponse) => {
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
};

export default withAuth(handler);
