import { getInterview, updateInterview } from "./../../../util/database";
import { Interview } from "./../../../types";
import type { NextApiRequest, NextApiResponse } from "next";
import multer, { Multer } from "multer";
import { NextIronRequest, withAuth } from "src/util/session";
import { DISCORD } from "src/types";
import { ObjectID } from "bson";
import moment from "moment";
import { randomUUID } from "crypto";
import { isStaff } from "src/util/permission";
import AWS from "aws-sdk";

interface ExtendedNextApiRequest extends NextApiRequest {
  file: File & { buffer: Buffer };
}

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

const fileFilter = (req: any, file: any, cb: any) => {
  if (file.mimetype === "audio/mpeg") {
    cb(null, true);
  } else {
    cb(new Error("Invalid file type. Only MP3 files are allowed."), false);
  }
};

const upload = multer({
  limits: { fileSize: 500 * 1024 * 1024 },
  fileFilter,
});

const uploadMiddleware = (
  req: ExtendedNextApiRequest,
  res: any
): Promise<ExtendedNextApiRequest> =>
  new Promise((resolve, reject) =>
    upload.single("file")(req as any, res, (err: any) => {
      if (err) reject(err);
      else resolve(req);
    })
  );

const uploadToS3 = async (file: Express.Multer.File) => {
  const key = `${randomUUID()}_${Date.now()}`;
  const params = {
    Bucket: process.env.AWS_S3_BUCKET_NAME,
    Key: key,
    Body: file.buffer,
    ContentType: file.mimetype,
    ACL: "private",
  };

  await s3.upload(params as any).promise();
  return key;
};

const handler = async (req: NextIronRequest, res: NextApiResponse) => {
  if (req.method === "POST") {
    const user = req.session.get("user");
    if (!isStaff(user)) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    try {
      const extendedReq = await uploadMiddleware(
        req as unknown as ExtendedNextApiRequest,
        res
      );

      const interviewCheck = await getInterview(extendedReq.body.interviewId);
      if (!interviewCheck) {
        return res.status(404).json({ message: "No interview found" });
      }

      if (interviewCheck.recording_path) {
        return res.status(400).json({ message: "Interview has recording..." });
      }

      const s3Key = await uploadToS3(extendedReq.file as any);

      await updateInterview(extendedReq.body.interviewId, {
        recording_path: s3Key,
        lastUpdate: Date.now(),
        updatedById: user._id,
      });

      res.status(200).send({
        message: "File uploaded successfully",
        filename: s3Key,
      });
    } catch (error: any) {
      console.log(error);
      res
        .status(500)
        .send({ message: "Error uploading file", error: error.message });
    }
  } else {
    res.status(405).send({ message: "Method not allowed" });
  }
};

export const config = {
  api: {
    bodyParser: false,
  },
};

export default withAuth(handler);
