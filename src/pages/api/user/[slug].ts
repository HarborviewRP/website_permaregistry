import { NextApiResponse } from "next";
import { dbConnect } from "src/util/mongodb";
import { NextIronRequest, withSession } from "../../../util/session";

const handler = async (req: NextIronRequest, res: NextApiResponse) => {
    const { db } = await dbConnect();
	const user = req.session.get('user');
    if (!user) {
        res.status(404);
        res.json({ status: 403, message: 'Not authenticated'});
        return;
    }

    const { slug } = req.query;
    const newUser = await db.collection("users").findOne({
        _id: slug
    })

    if (!newUser) {
        res.json({ status: 404, message: 'User not found' });
    }

    if (user.id === newUser?._id) {
        return res.json({ status: 200, user: user });
    }

    return res.json({ status: 200, user: {
        id: newUser?.id,
        username: newUser?.username,
        discriminator: newUser?.discriminator,
        avatar: newUser?.avatar,
        banner: newUser?.banner,
        banner_color: newUser?.banner_color,
        accent_color: newUser?.accent_color
    }})
};

export default withSession(handler);