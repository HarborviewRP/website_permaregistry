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
    const applicationCollection = (await getApplicationCollection()).collection;

    const apps = await applicationCollection
      .aggregate([
        {
          $sort: {
            lastUpdate: -1,
          },
        },
        {
          $limit: 4,
        },
      ])
      .toArray();

    return res.status(200).json(apps);
  } catch (err: any) {
    return res.status(500).json({ message: err.message });
  }
};

export default withAuth(handler);
