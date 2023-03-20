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
		password: process.env.COOKIE_SECRET as string | 'owosecretneedstobelongeruwuhaha123412341234',
		cookieName: "session",
		ttl: 15 * 24 * 3600,
		cookieOptions: {
			secure: process.env.NODE_ENV === "production",
			sameSite: "strict",
			httpOnly: true,
		},
	});
}

export function withAuth(handler: NextIronHandler | NextRoute) {
	return withIronSession(
		(async (req: any, res: any) => {
			const { db } = await dbConnect();

			const user = req.session.get("user");
			if (!user) {
				res.statusCode = 403;
				res.end();
				return;
			}

			const exists = await db
				.collection("users")
				.countDocuments({ token: encrypt(user.id) });

			if (exists < 1) {
				res.statusCode = 403;
				res.end();
				return;
			}

			handler(req, res)
		}),
		{
			password: process.env.COOKIE_SECRET as string | 'owosecretneedstobelongeruwuhaha123412341234',
			cookieName: "session",
			ttl: 15 * 24 * 3600,
			cookieOptions: {
				secure: process.env.NODE_ENV === "production",
				sameSite: "strict",
				httpOnly: true,
			},
		}
	)
}