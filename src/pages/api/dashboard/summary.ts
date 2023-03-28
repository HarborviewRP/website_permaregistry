import { isStaff } from "src/util/permission";
import {
  getTotalApplications,
  getApplicationsReviewedPercentage,
  getApplicationsStats,
  getTotalStaffMembers,
  getApplicationStatusStats,
} from "../../../util/database";
import { NextApiResponse } from "next";
import { NextIronRequest, withAuth } from "../../../util/session";

const handler = async (req: NextIronRequest, res: NextApiResponse) => {
  const user = req.session.get("user");
  if (!isStaff(user)) {
    res.status(403).json({ message: "Unauthorized" });
    return;
  }

  try {
    const dashboardSummary = {
      totalApplications: await getTotalApplications(),
      applicationsReviewedPercentage: await getApplicationsReviewedPercentage(),
      applicationsStats: await getApplicationsStats(),
      totalStaffMembers: await getTotalStaffMembers(),
      applicationStatusStats: await getApplicationStatusStats(),
    };    

    return res.status(200).json(dashboardSummary);
  } catch (err: any) {
    console.log(err);
    return res.status(500).json({ message: err.message });
  }
};

export default withAuth(handler);
