import { GetServerSideProps } from "next";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect } from "react";
import { User } from "src/types";
import { developerRoute } from "src/util/redirects";
import { withSession } from "src/util/session";

interface Props {
  user?: User;
  children: any;
  background?: boolean;
}

export default function NoSidebar({ children, user, background = true }: Props) {

  const style = {
    backgroundImage: `url(/bg.png)`,
    backgroundRepeat: "no-repeat",
    backgroundPosition: "center",
    backgroundBlendMode: "multiply",
  }
  
  return (
    <div style={background ? style : {}}>
      <main className="flex-1">{children}</main>
    </div>
  );
}
