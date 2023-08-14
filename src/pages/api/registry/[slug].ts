import { Action, ChangeLog, DISCORD, DeathRegWithId, FormType } from "src/types";
import { NextApiResponse } from "next";
import { NextIronRequest, noAuth, withAuth, withSession } from "../../../util/session";
import { isAdmin, isStaff } from "src/util/permission";
import { deleteRegistry, getDeathRegistryById, updateRegistry } from "src/util/database";
import axios from "axios";
import { INFRA_SECRET } from "src/util/discord";

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
  const { slug: regId } = req.query;
  const user = req.session.get("user");
  const reg: Partial<DeathRegWithId> | null = await getDeathRegistryById(regId as string);
  if (!reg) {
    return res
      .status(404)
      .json({ message: `No registry with ID ${regId} found...` });
  }

  if (isAdmin(user)) {
    await updateRegistry(regId as string, {
      ...reg,
      reverted: true,
    })
    // await deleteRegistry(regId);
    try {
      // const { csn, modified_by } = req.body;
      await axios.post("http://permareg.api.harborview.kcaz.io:3500/undo?token="+INFRA_SECRET, { csn: reg.csn, modified_by: Number.parseInt(user!!.id) })
    } catch(err) {
      res.status(400).json({ message: "Failed to undo the registration, the character is already alive/doesn't exist" });
      return;
    }
    
    return res.status(200).json({ message: "Registry deleted sucessfully" });
  }

  return res
    .status(403)
    .json({ message: `You are unable to modify this registry...` });
}

export default noAuth(handler);
