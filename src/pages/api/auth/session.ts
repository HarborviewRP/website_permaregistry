import { NextApiResponse } from 'next';
import { NextIronRequest, withSession } from '../../../util/session';

const handler = async (req: NextIronRequest, res: NextApiResponse) => {
  const userSession = req.session.get('user');

  if (!userSession) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  res.status(200).json(userSession);
};

export default withSession(handler);