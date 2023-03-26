import { getInterview, updateInterview } from "./../../../util/database";
import { Interview } from "./../../../types";
import type { NextApiRequest, NextApiResponse } from "next";
import multer, { Multer, diskStorage } from "multer";
import { NextIronRequest, withAuth } from "src/util/session";
import { DISCORD } from "src/types";
import { ObjectID } from "bson";
import moment from "moment";
import fs from "fs";
import path from "path";
import { randomUUID } from "crypto";

interface ExtendedNextApiRequest extends NextApiRequest {
  file: {
    filename: string;
  };
}

const storage = diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads");
  },
  filename: (req, file, cb) => {
    console.log(file)
    cb(
      null,
      `${randomUUID()}_${Date.now()}`
    );
  },
});

const fileFilter = (req: any, file: any, cb: any) => {
  if (file.mimetype === "audio/mpeg") {
    cb(null, true);
  } else {
    cb(new Error("Invalid file type. Only MP3 files are allowed."), false);
  }
};

const upload = multer({
  storage,
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

const handler = async (req: NextIronRequest, res: NextApiResponse) => {
  if (req.method === "POST") {
    const uploadPath = path.join(process.cwd(), "uploads");
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath);
    }
    const user = req.session.get("user");
    if (!user.roles.includes(DISCORD.STAFF_ROLE_ID)) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    try {
      const extendedReq = await uploadMiddleware(req as unknown as ExtendedNextApiRequest, res);

      const interviewCheck = await getInterview(extendedReq.body.interviewId);
      if (!interviewCheck) {
        return res.status(404).json({ message: "No interview found" });
      }

      if (interviewCheck.recording_path) {
        return res.status(400).json({ message: "Interview has recording..."})
      }

      await updateInterview(extendedReq.body.interviewId, {
        recording_path: extendedReq.file.filename,
        lastUpdate: Date.now(),
        updatedById: user._id,
      });

      res.status(200).send({
        message: "File uploaded successfully",
        filename: extendedReq.file.filename,
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