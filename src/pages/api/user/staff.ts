import { NextApiResponse } from "next";
import { getUsers } from "src/util/database";
import { getUserCollection } from "src/util/mongodb";
import { isStaff } from "src/util/permission";
import { NextIronRequest, withAuth, withSession } from "../../../util/session";
import { DISCORD } from "src/types";

const handler = async (req: NextIronRequest, res: NextApiResponse) => {
  const session = req.session.get("user");
  const collection = (await getUserCollection()).collection
  const usersRes = await collection.find({
    roles: { $in: [DISCORD.STAFF_ROLE_ID, DISCORD.SUPERADMIN_ROLE] },
  }).toArray();
  
  const userMap = new Map();
  for (const user of usersRes) {
    if (!isStaff(session)) {
      delete user.email;
      delete user.token;
      delete user.ip;
    }
    userMap.set(user._id.toString(), user);
  }
  res.status(200).json([...userMap]);
};

export default withAuth(handler);
