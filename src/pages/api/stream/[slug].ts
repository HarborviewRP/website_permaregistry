import type { NextApiRequest, NextApiResponse } from "next";
import { NextIronRequest, withAuth } from "src/util/session";
import { DISCORD } from "src/types";
import { isStaff } from "src/util/permission";
import AWS from "aws-sdk";

AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

const s3 = new AWS.S3();
const BUCKET_NAME = process.env.AWS_S3_BUCKET_NAME;

const handler = async (req: NextIronRequest, res: NextApiResponse) => {
  const { slug } = req.query;

  const user = req.session.get("user");
  if (!isStaff(user)) {
    return res.status(403).json({ message: "Unauthorized" });
  }

  try {
    const params: AWS.S3.GetObjectRequest = {
      Bucket: BUCKET_NAME!!,
      Key: slug as string,
    };

    const url = await s3.getSignedUrlPromise("getObject", params);

    res.status(200).json({ url: url });

    // s3.headObject(params, (err, data) => {
    //   if (err) {
    //     console.log(err);
    //     return res.status(404).send({ message: "File not found" });
    //   } else {
    //     res.setHeader("Content-Type", "audio/mpeg");
    //     res.setHeader("Content-Length", data.ContentLength as any);
    //     const readStream = s3.getObject(params).createReadStream();
    //     readStream.pipe(res);
    //   }
    // });
  } catch (err: any) {
    console.log(err);
    res.status(500).send({ message: "Error streaming file", error: err.message });
  }
};

export default withAuth(handler);