import { NextApiResponse } from "next";
import { NextIronRequest, noAuth, withAuth } from "../../../util/session";
import { getDeathRegistries, getDeathRegistriesSearchByCsnOrName, getDeathRegistriesSearchByCsnOrNameWithPage, getRegistryPage, getTotalRegistries } from 'src/util/database';

const handler = async (req: NextIronRequest, res: NextApiResponse) => {
  try {
    const page = req.query.page
      ? parseInt(req.query.page as string, 10)
      : undefined;
    const pageLength = req.query.pageLength
      ? parseInt(req.query.pageLength as string, 10)
      : 16;
    const query = req.query.search;
    if (query !== undefined && page !== undefined && pageLength !== undefined) {
      return res.status(200).json({ registries: await getDeathRegistriesSearchByCsnOrNameWithPage(query as unknown as string, page, pageLength)}) // lol?
    }

    if (query !== undefined) {
      return res.status(200).json({ registries: await getDeathRegistriesSearchByCsnOrName(query as unknown as string)}) // lol?
    }

    if (page !== undefined && pageLength !== undefined) {
      return res.status(200).json({ registries: await getRegistryPage(page, pageLength), total: await getTotalRegistries()});
    }

    return res.status(200).json(await getDeathRegistries());
  } catch (err: any) {
    return res.status(500).json({ message: err.message });
  }
};

export default noAuth(handler);
