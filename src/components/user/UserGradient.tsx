import React from "react";
import { User } from "src/types";
import { lightenColor } from "src/util/discord";

interface UserGradientProps {
  user: User;
  style?: string;
}

const UserGradient: React.FC<UserGradientProps> = ({ user, style }) => {
    const gradient = {
    backgroundImage: `-webkit-linear-gradient(180deg, ${lightenColor(user.banner_color ? user.banner_color : '#5865F2', 0.3)}, ${lightenColor(user.banner_color ? user.banner_color : '#454D99', 0.5)})`,
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    }
  return (
    <>
        <span className={style ? style : ""} style={gradient}>{`${user.username}#${user.discriminator}`}</span>
    </>
  )
};

export default UserGradient;
