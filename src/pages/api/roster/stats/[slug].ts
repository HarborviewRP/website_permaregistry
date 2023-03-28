import { NextApiResponse } from "next";
import { DISCORD } from "src/types";
import {
  getApplicationsStats,
  getInterviewStats,
  getTotalApplications,
  getTotalInterviews,
} from "src/util/database";
import {
  dbConnect,
  getApplicationCollection,
  getInterviewCollection,
} from "src/util/mongodb";
import { isStaff } from "src/util/permission";
import {
  NextIronRequest,
  withAuth,
  withSession,
} from "../../../../util/session";

const handler = async (req: NextIronRequest, res: NextApiResponse) => {
  const { db, client } = await dbConnect();
  const user = req.session.get("user");
  const { slug } = req.query;
  try {
    if (!isStaff(user)) {
      return res.status(403).json({ message: "Not authorized" });
    }

    const newUser = await db.collection("users").findOne({
      _id: slug,
    });

    if (!newUser) {
      return res.json({ status: 404, message: "User not found" });
    }

    const startOfWeek = new Date();
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());

    const endOfWeek = new Date();
    endOfWeek.setDate(endOfWeek.getDate() + (6 - endOfWeek.getDay()));

    const interviewCount = await getTotalInterviews();
    const applicationCount = await getTotalApplications();

    const applicationsCount = await (
      await getApplicationCollection()
    ).collection.countDocuments({
      updatedById: newUser._id,
      status: { $in: [1, 2] },
      lastUpdate: {
        $gte: startOfWeek.getTime(),
        $lte: endOfWeek.getTime(),
      },
    });

    const interviewsCount = await (
      await getInterviewCollection()
    ).collection.countDocuments({
      claimedById: newUser._id,
      recording_path: { $ne: undefined },
      status: { $in: [1, 2] },
      lastUpdate: {
        $gte: startOfWeek.getTime(),
        $lte: endOfWeek.getTime(),
      },
    });

    return res.status(200).json({
      application: {
        total: applicationCount,
        reviewed: applicationsCount,
      },
      interview: {
        total: interviewCount,
        reviewed: interviewsCount,
      },
    });
  } catch (err) {
    res.status(500).send("Internal Server Error");
  }
};

export default withAuth(handler);
