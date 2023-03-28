import { getInterviewCollection } from "./../../../util/mongodb";
/**
 [
  {
    $project: {
      _id: 1,
      lastUpdate: 1,
      collection: { $literal: "interviews" },
    },
  },
  { $sort: { lastUpdate: -1 } },
  {
    $unionWith: {
      coll: "applications",
      pipeline: [
        {
          $project: {
            _id: 1,
            lastUpdate: 1,
            collection: {
              $literal: "applications",
            },
          },
        },
        { $sort: { lastUpdate: -1 } },
      ],
    },
  },
  { $sort: { lastUpdate: -1 } },
]
 */
import { isStaff } from "src/util/permission";
import { NextApiResponse } from "next";
import { NextIronRequest, withAuth } from "../../../util/session";
import { getApplicationCollection } from "src/util/mongodb";

const handler = async (req: NextIronRequest, res: NextApiResponse) => {
  const user = req.session.get("user");
  if (!isStaff(user)) {
    res.status(403).redirect("/403");
    return;
  }

  try {
    const interviewCollection = (await getInterviewCollection()).collection;

    const sorted = await interviewCollection.aggregate([
        {
          $project: {
            _id: 1,
            lastUpdate: 1,
            status: 1,
            applicantId: 1,
            collection: { $literal: "interviews" },
          },
        },
        { $sort: { lastUpdate: -1 } },
        {
          $unionWith: {
            coll: "applications",
            pipeline: [
              {
                $project: {
                  _id: { $toString: "$_id" },
                  lastUpdate: 1,
                  status: 1,
                  applicantId: 1,
                  collection: { $literal: "applications" },
                },
              },
              { $sort: { lastUpdate: -1 } },
            ],
          },
        },
        { $sort: { lastUpdate: -1 } },
        { $limit: 4 }
      ]).toArray();

    return res.status(200).json(sorted);
  } catch (err: any) {
    return res.status(500).json({ message: err.message });
  }
};

export default withAuth(handler);
