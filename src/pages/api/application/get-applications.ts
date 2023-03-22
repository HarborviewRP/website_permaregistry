import {
  getAllApplications,
  getApplicationPage,
  getSortedApplications,
} from "./../../../util/database";
import { DISCORD } from "src/types";
import { NextApiResponse } from "next";
import { NextIronRequest, withAuth } from "../../../util/session";

const handler = async (req: NextIronRequest, res: NextApiResponse) => {
  const user = req.session.get("user");
  if (!user.roles.includes(DISCORD.STAFF_ROLE_ID)) {
    res.status(403).redirect("/403");
    return;
  }

  try {
    const page = req.query.page
      ? parseInt(req.query.page as string, 10)
      : undefined;
    const pageLength = req.query.pageLength
      ? parseInt(req.query.pageLength as string, 10)
      : 16;
    const sortStatus = req.query.sortStatus as 'asc' | 'desc' | undefined;

    if (page !== undefined && pageLength !== undefined) {
      if (sortStatus) {
        return res.status(200).json(await getSortedApplications(page, pageLength, sortStatus));
      } else {
        return res.status(200).json(await getApplicationPage(page, pageLength));
      }
    }

    return res.status(200).json(await getAllApplications());
  } catch (err: any) {
    return res.status(500).json({ message: err.message });
  }
};

export default withAuth(handler);
