import { getInterviewsReviewedPercentage, getInterviewStats, getTotalInterviews } from './../../../util/database';
import { isAdmin, isStaff } from "src/util/permission";
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
import { getUserCollection } from 'src/util/mongodb';

const handler = async (req: NextIronRequest, res: NextApiResponse) => {
  const user = req.session.get("user");
  if (!isAdmin(user)) {
    res.status(403).json({ message: "Unauthorized" });
    return;
  }

  try {
    const { slug } = req.query;

    const userCol = await (await getUserCollection()).collection;
    const user = await userCol.findOne({ _id: slug as string });
    if (!user) {
        return res.status(404).json({ message: "User not found" });
    }

    await userCol.updateOne({ id: slug as string}, { lougout: true })
    return res.status(200).json({ message: "User logged out successfully. "});
  } catch (err: any) {
    console.log(err);
    return res.status(500).json({ message: err.message });
  }
};

export default withAuth(handler);
