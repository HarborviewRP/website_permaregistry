import { GetServerSideProps } from "next";
import Link from "next/link";
import { useRouter } from "next/router";
import { User } from "src/types";
import { developerRoute } from "src/util/redirects";
import { withSession } from "src/util/session";

interface Props {
    user?: User;
    children: any;
}

export default function Layout({ children, user }: Props) {
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
        <div className='min-h-screen flex flex-col'>
        <div className='flex flex-col md:flex-row flex-1'>
          <aside className='bg-slate-900 backdrop-blur-3xl bg-opacity-50 w-full md:w-60'>
            <nav className='justify-center text-center text-white'>
                <h1 className='text-2xl pt-6'>PGN ATS</h1>

              <ul className="pt-40">
                {menuItems.map(({ href, title }) => (
                  <li className='m-2 text-sm pt-6' key={title}>
                    <Link href={href} className='flex pl-10 pr-10 rounded hover:backdrop-blur-3xl hover:bg-opacity-50 cursor-pointer text-white'>
                        {title}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </aside>
          <main className='flex-1'>{children}</main>
        </div>
      </div>
    );
  }
