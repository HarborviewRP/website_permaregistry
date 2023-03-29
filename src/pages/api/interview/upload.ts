import { getInterview, updateInterview } from "./../../../util/database";
import { Interview } from "./../../../types";
import type { NextApiRequest, NextApiResponse } from "next";
import multer from "multer";
import { NextIronRequest, withAuth } from "src/util/session";
import { DISCORD } from "src/types";
import { ObjectID } from "bson";
import moment from "moment";
import { randomUUID } from "crypto";
import { isStaff } from "src/util/permission";
import AWS from "aws-sdk";
import multerS3 from "multer-s3";

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

const handler = async (req: NextIronRequest, res: NextApiResponse) => {
  if (req.method === "POST") {
    const user = req.session.get("user");
    if (!isStaff(user)) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    const interviewCheck = await getInterview(req.body.interviewId);
    if (!interviewCheck) {
      return res.status(404).json({ message: "No interview found" });
    }

    if (interviewCheck.recording_path) {
      return res.status(400).json({ message: "Interview has recording..." });
    }

    try {
      let { name, type } = req.body;
  
      const fileParams = {
        Bucket: process.env.AWS_S3_BUCKET_NAME || 'pgn-ats',
        Key: name,
        Expires: 900,
        ContentType: type,
        ACL: "public-read"
      };
  
      const url = await s3.getSignedUrlPromise("putObject", fileParams);

      await updateInterview(req.body.interviewId, {
        recording_path: fileParams.Key,
        lastUpdate: Date.now(),
        updatedById: user._id,
      });
  
      res.status(200).json({ url });
    } catch (err) {
      console.log(err);
      res.status(400).json({ message: err });
    }
  }
};

export const config = {
  api: {
    bodyParser: {
      sizeLimit: "500mb",
    },
  },
};

export default withAuth(handler);
