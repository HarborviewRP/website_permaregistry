import { NextRequest, NextResponse } from "next/server";
import { encrypt } from "src/util/crypt";
import { dbConnect } from "../../util/mongodb";
import { NextIronRequest, withSession } from "../../util/session";

export async function middleware(req: NextIronRequest) {
  const { db } = await dbConnect();

  const user = req.session.get("user");
  if (!user) {
    return new NextResponse(
      JSON.stringify({ success: false, message: "Unauthorised" }),
      { status: 401, headers: { "content-type": "application/json" } }
    );
  }

  const exists = await db
    .collection("users")
    .countDocuments({ token: encrypt(user.id) });

  if (!exists) {
    return new NextResponse(
      JSON.stringify({ success: false, message: "Unauthorised" }),
      { status: 401, headers: { "content-type": "application/json" } }
    );
  }
}

export default withSession(middleware)