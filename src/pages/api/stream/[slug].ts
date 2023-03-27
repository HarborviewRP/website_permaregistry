import type { NextApiRequest, NextApiResponse } from "next";
import path from "path";
import fs from "fs";
import { NextIronRequest, withAuth } from "src/util/session";
import { DISCORD } from "src/types";
import { isStaff } from "src/util/permission";

const handler = async (req: NextIronRequest, res: NextApiResponse) => {
  const { slug } = req.query
  const filePath = path.join(process.cwd(), "uploads", slug as string);
  
  const user = req.session.get("user");
  if (!isStaff(user)) {
    return res.status(403).json({ message: "Unauthorized" });
  }

  try {
    if (fs.existsSync(filePath)) {
      const stat = fs.statSync(filePath);
      res.setHeader("Content-Type", "audio/mpeg");
      res.setHeader("Content-Length", stat.size);
      const readStream = fs.createReadStream(filePath);
      readStream.pipe(res);
    } else {
      res.status(404).send({ message: "File not found" });
    }
  } catch (err: any) {
    console.log(err);
  }
};

export default withAuth(handler);
