export const DISCORD_API = "https://discord.com/api/v10";
export const ENDPOINT = {
  CREATE_DM: "/users/@me/channels",
  SEND_PM: (id: string) => {
    return `/channels/${id}/messages`;
  },
};
export const TOKEN = process.env.BOT_TOKEN || "";

export const INFRA_SECRET = process.env.INFRA_SECRET;
export const INFRA_URL = process.env.INFRA_URL || "";

/**
 const response = await fetch("/api/application/update", {
    method: "POST",
    headers: {
        "Content-Type": "application/json",
    },
    body: JSON.stringify({
        application: applicationForm,
        applicationId: (application as any)._id,
        statusUpdate: applicationForm.status !== application?.status
    }),
    });
 */
export const sendDm = async (userId: string, content: any) => {
  if (!process.env.SEND_STATUS_DM) return false;
  try {
    const res = await fetch(DISCORD_API + ENDPOINT.CREATE_DM, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bot ${TOKEN}`,
      },
      body: JSON.stringify({
        recipient_id: userId,
      }),
    });

    if (!res.ok) return false;

    const json = await res.json();
    const channelId = json.id;

    const res2 = await fetch(DISCORD_API + ENDPOINT.SEND_PM(channelId), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bot ${TOKEN}`,
      },
      body: JSON.stringify(content),
    });

    const json2 = await res2.json();
    if (!res2.ok) return false;
    return true;
  } catch (err: any) {
    console.error(err);
    return false;
  }
};

export function lightenColor(hexColor: string, amount: number) {
  var red = parseInt(hexColor.substring(1, 3), 16);
  var green = parseInt(hexColor.substring(3, 5), 16);
  var blue = parseInt(hexColor.substring(5, 7), 16);

  red = Math.round(Math.min(255, red + (255 - red) * amount));
  green = Math.round(Math.min(255, green + (255 - green) * amount));
  blue = Math.round(Math.min(255, blue + (255 - blue) * amount));

  var newHexColor = "#" + componentToHex(red) + componentToHex(green) + componentToHex(blue);

  return newHexColor;
}

function componentToHex(c: number) {
  var hex = c.toString(16);
  return hex.length == 1 ? "0" + hex : hex;
}