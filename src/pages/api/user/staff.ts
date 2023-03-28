import { NextApiResponse } from "next";
import { getUsers, getUsersWhere } from "src/util/database";
import { isStaff } from "src/util/permission";
import { NextIronRequest, withAuth, withSession } from "../../../util/session";
import { DISCORD } from "src/types";

const handler = async (req: NextIronRequest, res: NextApiResponse) => {
  const user = req.session.get("user");

  if (!isStaff(user)) {
    return res.status(403).json({ message: "Unauthorized" });
  }

  const usersRes = await getUsersWhere({
    roles: { $in: [DISCORD.STAFF_ROLE_ID, DISCORD.SUPERADMIN_ROLE] },
  });
  
  const userMap = new Map();
  for (const user of usersRes) {
    userMap.set(user._id.toString(), user);
  }
  res.status(200).json([...userMap]);
};

export default withAuth(handler);
