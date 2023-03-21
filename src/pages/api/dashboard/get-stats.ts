import { NextApiResponse } from "next";
import { dbConnect } from "src/util/mongodb";
import { NextIronRequest, withAuth, withSession } from "../../../util/session";

const handler = async (req: NextIronRequest, res: NextApiResponse) => {
    res.json({message: "Hello s"})
};

export default withAuth(handler);
