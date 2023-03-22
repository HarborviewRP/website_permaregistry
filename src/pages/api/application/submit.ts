import { NextApiResponse } from "next";
import { createApplication } from "src/util/database";
import { dbConnect } from "src/util/mongodb";
import { Application } from "src/types";
import { NextIronRequest, withAuth } from "../../../util/session";
import { ObjectID } from "bson";

const handler = async (req: NextIronRequest, res: NextApiResponse) => {
    if (req.method === 'POST') {
    const application: Application = {
        ...req.body,
        _id: new ObjectID()
    };
    try {
        const result = await createApplication(application);
        if (result.acknowledged) {
        res.status(200).json({ message: 'Application submitted successfully', application: application });
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