import { GetServerSidePropsContext } from "next";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/router";
import { User } from "src/types";
import type { Session } from 'next-iron-session'


interface LayoutProps {
  user: User | null,
  children?: React.ReactNode
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { user } = children?.props
  const router = useRouter();

    const menuItems = [
        {
          href: '/dashboard',
          title: 'Dashboard',
        },
        {
          href: '/applications',
          title: 'Applications',
        },
        {
          href: '/roster',
          title: 'Staff Roster',
        },
      ];
      return (
        <div className="min-h-screen flex">
          <aside className="w-50 bg-slate-900 backdrop-blur-3xl bg-opacity-50">
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
                      height={20}
                      width={24}
                    />
                    <p className="text-sm text-transparent bg-clip-text bg-gradient-to-r from-blue-500 via-purple-400 to-pink-400">{`${user.username}#${user.discriminator}`}</p>
                  </div>
                  </Link>
                ) : (
                  <p>Not logged in</p>
                )}
              </div>
              <div>
                <ul>
                  {menuItems.map(({ href, title }) => (
                    <li className="m-2 py-3 mb-4 text-left" key={title}>
                      <Link
                        href={href}
                        className="pl-10 pr-10 rounded hover:backdrop-blur-3xl hover:bg-opacity-50 cursor-pointer text-white"
                      >
                        {title}
                      </Link>
                    </li>
                  ))}
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
          <main className='flex-1 mx-auto'>{children}</main>
        </div>
      );
  }

  export const getServerSideProps = async (
    context: GetServerSidePropsContext & { req: { session: Session } }
  ): Promise<{ props: LayoutProps }> => {
    const user = context.req.session.get<User | null>('user')
    console.log(user)
  
    return {
      props: {
        user: user || null,
      },
    }
  }

export default Layout
