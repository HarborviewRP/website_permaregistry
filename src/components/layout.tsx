/* eslint-disable @next/next/link-passhref */
import { GetServerSidePropsContext } from "next";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/router";
import { DISCORD, User } from "src/types";
import type { Session } from "next-iron-session";
import { useEffect, useState } from "react";
import { isAdmin, isStaff as isStaffUtil } from "src/util/permission";

interface LayoutProps {
  user: User | null;
  children?: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const dbName = "pgn";

  useEffect(() => {
    verify();
  })
  const { user } = (children as any).props;
  const isStaff = isStaffUtil(user!);
  const router = useRouter();
  const [active, setActive] = useState(false);

  const verify = () => {
    const verify = verifyDbExists();
  
    if (!verify) {
      throw new Error("The database specific could not be found... Please ensure it exists and try again.");
    }
  }

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
      href: "/interviews",
      title: "Interviews",
    },
    {
      href: "/roster",
      title: "Staff Roster",
    },
  ];
  const guestMenu = [
    {
      href: "/applications",
      title: "My Applications",
    },
    {
      href: "/apply",
      title: "Apply",
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
    <div className="min-h-screen flex">
      <aside className="fixed top-0 left-0 z-40 w-64 h-screen w-50 bg-slate-900 backdrop-blur-3xl bg-opacity-50">
        <nav className="flex flex-col h-full justify-between p-6 text-center text-white">
          <div>
            <h1 className="text-3xl">PGN ATS</h1>
            {user ? (
              <Link href="/profile" passHref>
                <div className="flex justify-center mt-3">
                  <div>
                    <Image
                      className="rounded-full mr-2"
                      src={user.avatar}
                      alt="User Avatar"
                      height={24}
                      width={24}
                    />
                  </div>

                  <p className="text-sm break-words text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-indigo-500 to-blue-600">{`${user.username}#${user.discriminator}`}</p>
                </div>
              </Link>
            ) : (
              <p>Not logged in</p>
            )}
          </div>
          <div>
            <ul>
              <>
                {(isStaff ? menuItems : guestMenu).map(({ href, title }) => (
                  <li
                    className="text-left flex flex-col items-center"
                    key={title}
                    id={title}
                  >
                    <Link
                      href={href}
                      className={`text-center p-3 w-full rounded-xl hover:backdrop-blur-3xl hover:bg-opacity-50 hover:text-gray-500 ${
                        router.pathname === href
                          ? "bg-slate-500/25 backdrop-blur-3xl"
                          : "hover:backdrop-blur-3xl hover:bg-opacity-50 hover:text-gray-500"
                      }  cursor-pointer text-white`}
                    >
                      {title}
                    </Link>
                  </li>
                ))}
              </>
            </ul>
          </div>
          <div>
            {user ? (
              <>
                {/* {isAdmin(user) && (
                  <>
                    <li
                      className="text-left flex flex-col items-center"
                      key="Admin"
                    >
                      <Link
                        href={"/admin"}
                        className={`text-center p-3 w-full rounded-xl hover:backdrop-blur-3xl hover:bg-opacity-50 hover:text-gray-500 pb-5 cursor-pointer text-white`}
                      >
                        Admin Dashboard
                      </Link>
                    </li>
                  </>
                )} */}
                <Link href="/api/auth/logout">
                  <button id="btn" className="bg-transparent border-2 border-red-700/40 hover:bg-red-700 text-white font-medium py-2 px-4 rounded">
                    Logout
                  </button>
                </Link>
              </>
            ) : (
              <>
                <Link href="/api/auth/login">
                  <button className="px-6 py-2 text-sm justify-start items-start text-white bg-indigo-500 backdrop-blur-3xl bg-opacity-50 font-bold rounded-full border border-indigo-500 hover:bg-indigo-500 hover:text-gray-50 hover:border-transparent focus:outline-none focus:ring-2 focus:ring-5555dd-200 focus:ring-offset-2">
                    Login with Discord
                  </button>
                </Link>
              </>
            )}
            <p id="pgn" className="text-sm text-gray-600 pt-2">Website made by <Link id="pgn" className="text-transparent bg-opacity-10 bg-clip-text bg-gradient-to-r from-blue-500 to-pink-400" href="https://discord.com/users/359098534307299329">Zachery</Link></p>
          </div>
        </nav>
      </aside>
      {/* Child Content */}
      <main className="flex-1 mx-auto ml-60">{children}</main>
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
