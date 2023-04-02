import { isStaff } from 'src/util/permission';
import {
  getAllApplications,
  getApplicationPage,
  getSortedApplications,
  getTotalApplications,
} from "./../../../util/database";
import { DISCORD } from "src/types";
import { NextApiResponse } from "next";
import { NextIronRequest, withAuth } from "../../../util/session";

const handler = async (req: NextIronRequest, res: NextApiResponse) => {
  const user = req.session.get("user");

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
        return res.status(200).json({ applications: await getSortedApplications(page, pageLength, sortStatus, !isStaff(user) ? user.id : undefined), total: await getTotalApplications(!isStaff(user) ? user.id : undefined)});
      } else {
        return res.status(200).json({ applications: await getApplicationPage(page, pageLength, !isStaff(user) ? user.id : undefined), total: await getTotalApplications(!isStaff(user) ? user.id : undefined)});
      }
    }

    return res.status(200).json(await getAllApplications());
  } catch (err: any) {
    return res.status(500).json({ message: err.message });
  }
};

export default withAuth(handler);
