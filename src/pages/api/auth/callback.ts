import { NextApiResponse } from "next";
import { stringify } from "querystring";
import { NextIronRequest, withSession } from "../../../util/session";
import axios from "axios";
import { dbConnect } from "../../../util/mongodb";
import { decrypt, encrypt } from "../../../util/crypt";
import { DISCORD } from "src/types";
import { getUser } from "src/util/database";

const OAuthScope = ["guilds.members.read", "email", "identify", "guilds", "guilds.join"].join(" ");

const handler = async (req: NextIronRequest, res: NextApiResponse) => {
  const { db } = await dbConnect();

  if (!req.query.code) {
    res.status(404).redirect("/404");
    return;
  }

  try {
    const { data } = await axios.post(
      "https://discordapp.com/api/v9/oauth2/token",
      stringify({
        client_id: process.env.CLIENT_ID,
        client_secret: process.env.CLIENT_SECRET,
        grant_type: "authorization_code",
        code: req.query.code,
        redirect_uri: `${process.env.DOMAIN}/api/auth/callback`,
      }),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

    // if (data.scope !== OAuthScope) {
    //   return res
    //     .status(403)
    //     .send(
    //       `Expected scope "${OAuthScope}" but received scope "${data.scope}"`
    //     );
    // }

    const { data: user } = await axios.get(
      "https://discordapp.com/api/v9/users/@me",
      {
        headers: {
          Authorization: `Bearer ${data.access_token}`,
        },
      }
    );

    const { data: discordData } = await axios.get(`https://discordapp.com/api/v9/users/@me/guilds/${DISCORD.ID}/member`,
    {
      headers: {
        Authorization: `Bearer ${data.access_token}`,
      }
    });

    if (user.email === null) {
      return res
        .status(400)
        .send("Please verify your Discord's account E-mail before logging in.");
    }

    const exists = await db
      .collection("users")
      .countDocuments({ _id: user.id });

    let accessLevel = 0;

    if (exists) {
      const user2 = await db.collection("users").updateOne(
        { _id: user.id },
        {
          $set: {
            email: user.email,
            username: user.username,
            discriminator: user.discriminator,
            banner: `https://cdn.discordapp.com/banners/${user.id}/${user.banner}`,
            avatar: `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}`,
            roles: discordData.roles || [],
            nick: discordData.nick
          },
          $addToSet: {
            ip: req.headers["cf-connecting-ip"],
          },
        }
      );

      accessLevel = (await getUser(user.id))!!.access_level;
    } else {
      db.collection("users").insertOne({
        _id: user.id,
        email: user.email,
        username: user.username,
        discriminator: user.discriminator,
        banner: `https://cdn.discordapp.com/banners/${user.id}/${user.banner}`,
        avatar: `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}`,
        ip: [req.headers["cf-connecting-ip"]],
        roles: discordData.roles || [],
        access_level: 0,
        token: encrypt(user.id),
        nick: discordData.nick
      });
    }

    const staffUser = await db.collection("staff").findOne({ _id: user.id });

    if (staffUser) {
      db.collection("staff").updateOne(
        { _id: user.id },
        {
          $set: {
            banner: `https://cdn.discordapp.com/banners/${user.id}/${user.banner}`,
            avatar: `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}`,
          },
        }
      );
    }

    await req.session.set("user", {
      ...user,
      roles: discordData.roles || [],
      token: encrypt(user.id),
      access_level: accessLevel,
      banner: `https://cdn.discordapp.com/banners/${user.id}/${user.banner}`,
      avatar: `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}`,
    });
  } catch (e) {
    res.redirect("/discord?r=true");
    return;
  }

  await req.session.save();
  res.redirect("/discord?r=true");
};

export default withSession(handler);
