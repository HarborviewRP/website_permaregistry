import { NextApiResponse } from "next";
import { NextIronRequest, withAuth, withSession } from "../../../util/session";

const handler = async (req: NextIronRequest, res: NextApiResponse) => {
    res.json({message: "Feature not implemented..."})
};

export default withAuth(handler);
