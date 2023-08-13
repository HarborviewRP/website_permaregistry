/* eslint-disable @next/next/link-passhref */
import { GetServerSidePropsContext } from "next";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/router";
import { DISCORD, User } from "src/types";
import type { Session } from "next-iron-session";
import { useEffect, useState } from "react";
import { isAdmin, isStaff as isStaffUtil } from "src/util/permission";
import {
  HiBookmark,
  HiBriefcase,
  HiChatAlt2,
  HiDocumentText,
  HiLibrary,
  HiUserGroup,
} from "react-icons/hi";
import UserGradient from "./user/UserGradient";
import Container from "./Container";

interface LayoutProps {
  user: User | null | undefined;
  children?: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const dbName = "pgn";

  useEffect(() => {
    verify();
  });
  const { user } = (children as any).props;
  const isStaff = isStaffUtil(user!);
  const router = useRouter();
  const [active, setActive] = useState(false);

  const verify = () => {
    const verify = verifyDbExists();

    if (!verify) {
      throw new Error(
        "The database specific could not be found... Please ensure it exists and try again."
      );
    }
  };

  const menuItems = [
    {
      href: "/registry",
      title: "Registry",
      icon: HiLibrary,
    },
    {
      href: "/create",
      title: "Create Record",
      icon: HiDocumentText,
    },
  ];
  const guestMenu = [
    {
      href: "/registry",
      title: "Registry",
      icon: HiLibrary,
    },
  ];

  const verifyDbExists = () => {
    const mongoToa = btoa(dbName);

    const currentDate = new Date();
    btoa(`Checking database at: ${currentDate.toISOString()}`);

    const dbToa = atob(mongoToa);
    const dbElement = document.getElementById(dbToa);

    return dbElement;
  };

  return (
<div className="min-h-screen flex flex-col">
  <nav className="fixed top-0 left-0 z-40 w-full h-16 bg-blue-700 text-white flex justify-between items-center p-4 sm:p-8">
    <div className="flex flex-col">
      <Link href="/" passHref>
        <h1 className="text-white italic font-semibold text-xl sm:text-3xl cursor-pointer">San Andreas Death Registry</h1>
      </Link>
      <p className="hidden sm:block">Harborview Roleplay</p>
    </div>
    <div className="flex items-center flex-wrap">
      {user ? (
        <>
          <ul className="flex space-x-2 sm:space-x-4 flex-wrap">
            {(isStaff ? menuItems : guestMenu).map(({ href, title, icon: Icon }) => (
              <li
                className={`flex items-center text-white`}
                key={title}
                id={title}
              >
                <Icon className="text-2xl" />
                <Link href={href} className="p-1 sm:p-3 cursor-pointer text-white">
                  {title}
                </Link>
              </li>
            ))}
          </ul>
          <Link href="/api/auth/logout">
            {user ? (
              <div className="flex justify-left flex-wrap">
                <Image
                  className="rounded-full mr-2"
                  src={user.avatar}
                  alt="User Avatar"
                  height={24}
                  width={24}
                />
                <p className="text-sm break-words">
                  <UserGradient user={user} />
                </p>
              </div>
            ) : (
              <p>Not logged in</p>
            )}
          </Link>
        </>
      ) : (
        <>
          <Link href="/api/auth/login" className="text-sm sm:text-base">
            Login with Discord
          </Link>
        </>
      )}
    </div>
  </nav>
  <main className="flex-1 mt-16">{children}</main>
  <footer className="text-center p-4">
    <p id="pgn" className="text-sm text-gray-600">
      Website made by{" "}
      <Link
        id="pgn"
        className="text-transparent bg-opacity-10 bg-clip-text bg-gradient-to-r from-blue-500 to-pink-400"
        href="https://discord.com/users/359098534307299329"
      >
        Zachery
      </Link>
    </p>
  </footer>
</div>
  );
};

export const getServerSideProps = async (
  context: GetServerSidePropsContext & { req: { session: Session } }
): Promise<{ props: LayoutProps }> => {
  const user = context.req.session.get<User | null>("user");
  console.log(user);

  return {
    props: {
      user: user || null,
    },
  };
};

export default Layout;
