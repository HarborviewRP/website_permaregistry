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
}

export default function NoAuthLayout({ children, user }: Props) {
  const router = useRouter();

  const menuItems = [
    {
      href: "/dashboard",
      title: "Dashboard",
    },
    {
      href: "/applications",
      title: "Applications",
    },
    {
      href: "/roster",
      title: "Staff Roster",
    },
  ];
  return (
    <>
      <main className="flex-1">{children}</main>
    </>
  );
}
