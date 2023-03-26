import { DISCORD } from "src/types";
import { getInterview } from "./../../../util/database";
import { NextApiResponse } from "next";
import { NextIronRequest, withAuth, withSession } from "../../../util/session";

const handler = async (req: NextIronRequest, res: NextApiResponse) => {
  const { slug } = req.query;
  const user = req.session.get("user");
  const interview = await getInterview(slug as string);
  if (!interview) {
    return res
      .status(404)
      .json({ message: `No interview with ID ${slug} found...` });
  }

  if (
    interview.applicantId === user.id ||
    user.roles.includes(DISCORD.STAFF_ROLE_ID)
  ) {
    return res.status(200).json(interview);
  }

  return res
    .status(403)
    .json({ message: `You are unable to view this interview...` });
};

export default withAuth(handler);
