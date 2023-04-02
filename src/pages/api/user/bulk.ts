import { NextApiResponse } from "next";
import { getUsers } from "src/util/database";
import { isStaff } from "src/util/permission";
import { NextIronRequest, withAuth, withSession } from "../../../util/session";

const handler = async (req: NextIronRequest, res: NextApiResponse) => {
  if (req.method === "POST") {
    const userses = req.session.get("user");
    const users = req.body.users;

    const usersRes = await getUsers(users);
    const userMap = new Map();
    for (const user of usersRes) {
      if (!isStaff(userses)) {
        delete user.email;
        delete user.token;
        delete user.ip;
      }
      userMap.set(user._id.toString(), user);
    }
    res.status(200).json([...userMap]);
  } else {
    res.status(405).json({ message: "Method not allowed" });
  }
};

export default withAuth(handler);
