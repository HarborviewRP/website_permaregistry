import { getAllApplications } from './../../../util/database';
import { DISCORD } from 'src/util/types';
import { NextApiResponse } from "next";
import { NextIronRequest, withAuth } from "../../../util/session";

const handler = async (req: NextIronRequest, res: NextApiResponse) => {
    const user = req.session.get("user");
    if (!user.roles.includes(DISCORD.STAFF_ROLE_ID)) {
        return res.status(403).json({ message: "Unauthorized" })
    }

    return res.status(200).json(await getAllApplications());
};

export default withAuth(handler);