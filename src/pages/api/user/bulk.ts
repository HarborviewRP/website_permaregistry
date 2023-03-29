import { NextApiResponse } from "next";
import { getUsers } from "src/util/database";
import { isStaff } from "src/util/permission";
import { NextIronRequest, withAuth, withSession } from "../../../util/session";

const handler = async (req: NextIronRequest, res: NextApiResponse) => {
  if (req.method === "POST") {
    const user = req.session.get("user");
    const users = req.body.users;

    if (!isStaff(user)) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    const usersRes = await getUsers(users);
    const userMap = new Map();
    for (const user of usersRes) {
      userMap.set(user._id.toString(), user);
    }
    res.status(200).json([...userMap]);
  } else {
    res.status(405).json({ message: "Method not allowed" });
  }
};

export default withAuth(handler);
