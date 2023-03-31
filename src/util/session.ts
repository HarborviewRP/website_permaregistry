import {
  GetServerSidePropsContext,
  NextApiRequest,
  NextApiResponse,
} from "next";
import { withIronSession, Session } from "next-iron-session";
import { encrypt } from "./crypt";
import { dbConnect } from "./mongodb";

export type NextIronRequest = NextApiRequest & { session: Session };
export type NextIronHandler = (
  req: NextIronRequest,
  res: NextApiResponse
) => void | Promise<void>;

export type NextRoute = (
  ctx: GetServerSidePropsContext & { req: { session: Session } },
  redirect: string
) => any;

export function withSession(handler: NextIronHandler | NextRoute) {
  return withIronSession(handler, {
    password: process.env.COOKIE_SECRET as
      | string
      | "owosecretneedstobelongeruwuhaha123412341234",
    cookieName: "session",
    ttl: 43200,
    cookieOptions: {
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      httpOnly: true,
    },
  });
}

export function withAuth(handler: NextIronHandler | NextRoute) {
  return withIronSession(
    async (req: any, res: any) => {
      const { db } = await dbConnect();

      const user = req.session.get("user");
      if (!user) {
        res.redirect("/403");
        res.end();
        return;
      }

      const exists = await db
        .collection("users")
        .findOne({ token: encrypt(user.id) });

      if (!exists) {
        res.redirect("/403");
        return;
      }

    //   if (exists.logout) {
    //     (await db.collection("users")).updateOne(
    //       { token: encrypt(user.id) },
    //       { $set: { logout: false } }
    //     );
    //     req.session.destroy();
    //     res.redirect(`/`);
    //     return;
    //   }

      handler(req, res);
    },
    {
      password: process.env.COOKIE_SECRET as
        | string
        | "owosecretneedstobelongeruwuhaha123412341234",
      cookieName: "session",
      ttl: 43200,
      cookieOptions: {
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        httpOnly: true,
      },
    }
  );
}
