import moment from "moment";
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

    const startOfWeek = moment().startOf("week").toDate().getTime();

    const endOfWeek = moment().endOf("week").toDate().getTime();

    const interviewCount = await getTotalInterviews();
    const applicationCount = await getTotalApplications();

    const applicationsCount = await (
      await getApplicationCollection()
    ).collection.countDocuments({
      updatedById: newUser._id,
      status: { $in: [1, 2] },
      lastUpdate: {
        $gte: startOfWeek,
        $lte: endOfWeek,
      },
    });

    const interviewsCount = await (
      await getInterviewCollection()
    ).collection.countDocuments({
      claimedById: newUser._id,
      recording_path: { $ne: undefined },
      status: { $in: [1, 2] },
      lastUpdate: {
        $gte: startOfWeek,
        $lte: endOfWeek,
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
