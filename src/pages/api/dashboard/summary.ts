import { getInterviewsReviewedPercentage, getInterviewStats, getTotalInterviews } from './../../../util/database';
import { isStaff } from "src/util/permission";
import {
  getTotalApplications,
  getApplicationsReviewedPercentage,
  getApplicationsStats,
  getTotalStaffMembers,
  getApplicationStatusStats,
  getInterviewStatusStats,
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
      totalStaffMembers: await getTotalStaffMembers(),

      totalApplications: await getTotalApplications(),
      applicationsReviewedPercentage: await getApplicationsReviewedPercentage(),
      applicationsStats: await getApplicationsStats(),
      applicationStatusStats: await getApplicationStatusStats(),

      totalInterviews: await getTotalInterviews(),
      interviewsReviewedPercentage: await getInterviewsReviewedPercentage(),
      interviewsStats: await getInterviewStats(),
      interviewStatusStats: await getInterviewStatusStats(),
    };    

    return res.status(200).json(dashboardSummary);
  } catch (err: any) {
    console.log(err);
    return res.status(500).json({ message: err.message });
  }
};

export default withAuth(handler);
