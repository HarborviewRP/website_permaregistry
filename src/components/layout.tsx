import { GetServerSidePropsContext } from "next";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/router";
import { DISCORD, User } from "src/types";
import type { Session } from "next-iron-session";
import { useState } from "react";

interface LayoutProps {
  user: User | null;
  children?: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { user } = children?.props;
  const isStaff = user?.roles.includes(DISCORD.STAFF_ROLE_ID);
  const router = useRouter();
  const [ active, setActive ] = useState(false);

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
    }
  ];
  const guestMenu = [
    {
      href: "/applications",
      title: "My Applications",
    },
    {
      href: "/apply",
      title: "Apply",
    }
  ];
  return (
    <div className="min-h-screen flex">
      <aside className="fixed top-0 left-0 z-40 w-64 h-screen w-50 bg-slate-900 backdrop-blur-3xl bg-opacity-50">
        <nav className="flex flex-col h-full justify-between p-6 text-center text-white">
          <div>
            <h1 className="text-3xl">PGN ATS</h1>
            {user ? (
              <Link href="/profile" passHref>
                <div className="flex justify-center mt-3 ">
                  <Image
                    className="rounded-full mr-2"
                    src={user.avatar}
                    alt="User Avatar"
                    height={24}
                    width={24}
                  />
                  <p className="text-sm text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-indigo-500 to-blue-600">{`${user.username}#${user.discriminator}`}</p>
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
                  <li className="text-left flex flex-col items-center" key={title}>
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
            <Link href="/api/auth/logout">
              <button className="bg-transparent border-2 border-red-700/40 hover:bg-red-700 text-white font-medium py-2 px-4 rounded">
                Logout
              </button>
            </Link>
          </div>
        </nav>
      </aside>
      {/* Child Content */}
      <main className="flex-1 mx-auto mx-64">{children}</main>
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
