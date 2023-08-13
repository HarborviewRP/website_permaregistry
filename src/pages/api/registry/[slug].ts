import { Action, ChangeLog, DISCORD, FormType } from "src/types";
import { NextApiResponse } from "next";
import { NextIronRequest, noAuth, withAuth, withSession } from "../../../util/session";
import { isAdmin, isStaff } from "src/util/permission";
import { deleteRegistry, getDeathRegistryById } from "src/util/database";

const handler = async (req: NextIronRequest, res: NextApiResponse) => {
  switch (req.method) {
    case "GET": get(req, res); break;
    case "DELETE": del(req, res); break;
  }
};

const get = async (req: any, res: any) => {
  const { slug } = req.query;
  const reg = await getDeathRegistryById(slug as string);

  if (!reg) {
    return res
      .status(404)
      .json({ message: `No registry with ID ${slug} found...` });
  }

  return res.status(200).json(reg);
}

const del = async (req: any, res: any) => {
  const body = JSON.parse(req.body);
  const regId = body.regId;
  const user = req.session.get("user");
  const reg = await getDeathRegistryById(regId as string);
  if (!reg) {
    return res
      .status(404)
      .json({ message: `No registry with ID ${regId} found...` });
  }

  if (isAdmin(user)) {
    await deleteRegistry(regId);
    return res.status(200).json({ message: "Registry deleted sucessfully" });
  }

  return res
    .status(403)
    .json({ message: `You are unable to modify this registry...` });
}

export default noAuth(handler);
