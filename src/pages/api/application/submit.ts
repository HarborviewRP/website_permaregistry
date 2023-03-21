import { NextApiResponse } from "next";
import { createApplication } from "src/util/database";
import { dbConnect } from "src/util/mongodb";
import { Application } from "src/util/types";
import { NextIronRequest, withAuth } from "../../../util/session";

const handler = async (req: NextIronRequest, res: NextApiResponse) => {
    if (req.method === 'POST') {
    const application: Application = req.body;
    try {
        const result = await createApplication(application);
        if (result.acknowledged) {
        res.status(200).json({ message: 'Application submitted successfully' });
        } else {
        res.status(500).json({ message: 'Failed to submit the application' });
        }
    } catch (error: any) {
        res.status(500).json({ message: 'Error submitting the application', error: error.message });
    }
    } else {
        res.status(405).json({ message: 'Method not allowed' });
    }
};

export default withAuth(handler);