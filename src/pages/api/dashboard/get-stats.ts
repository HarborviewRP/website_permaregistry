import { NextApiResponse } from "next";
import { dbConnect } from "src/util/mongodb";
import { NextIronRequest, withSession } from "../../../util/session";

const handler = async (req: NextIronRequest, res: NextApiResponse) => {
    const { db } = await dbConnect();
    
	const user = req.session.get('user');
    if (!user) {
        res.status(403);
        return;
    }
};

export default withSession(handler);