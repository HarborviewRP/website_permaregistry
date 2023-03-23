import { NextApiResponse } from "next";
import { DISCORD } from "src/types";
import { dbConnect } from "src/util/mongodb";
import { NextIronRequest, withAuth, withSession } from "../../../util/session";

const handler = async (req: NextIronRequest, res: NextApiResponse) => {
  const { db, client } = await dbConnect();
  const user = req.session.get("user");
  const { slug } = req.query;
  try {
    const newUser = await db.collection("users").findOne({
      _id: slug,
    });

    if (!newUser) {
      return res.json({ status: 404, message: "User not found" });
    }

    if (
      user.id === newUser?._id ||
      user.roles.includes(DISCORD.STAFF_ROLE_ID)
    ) {
      return res.status(200).json(newUser);
    }

    delete newUser.email;
    delete newUser.token;
    delete newUser.ip;
    client.close();

    return res.status(200).json(newUser);
  } catch (err) {
    res.status(500).send("Internal Server Error");
  }
};

export default withAuth(handler);
