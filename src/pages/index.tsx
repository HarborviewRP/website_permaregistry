import { GetServerSideProps } from "next";
import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect } from "react";
import NoAuthLayout from "src/components/no-auth-layout";
import { User } from "src/types";
import { developerRoute } from "src/util/redirects";
import { withSession } from "src/util/session";

interface Props {
  user?: User;
}


export default function MainPage({ user }: Props) {
  const router = useRouter();
  useEffect(() => {
    if (user) router.push('/dashboard')
  })

  return (
    <>
      <div className="w-screen h-screen flex justify-center items-center">
        <div className="p-6 max-w-sm mx-auto bg-slate-900 backdrop-blur-3xl bg-opacity-50 rounded-xl shadow-md items-center space-x-1 backdrop-blur">
          <div className="flex-shrink-0 flex justify-center items-center">
            <Image
              src={
                `https://brandlogos.net/wp-content/uploads/2021/11/discord-logo.png`
              }
              height={56}
              width={56}
              alt="Discord Logo"
            ></Image>
          </div>
          <Link href="/api/auth/login" passHref>
          <button
            className="px-6 py-2 text-sm justify-start items-start text-white bg-indigo-500 backdrop-blur-3xl bg-opacity-50 font-bold rounded-full border border-indigo-500 hover:bg-indigo-500 hover:text-gray-50 hover:border-transparent focus:outline-none focus:ring-2 focus:ring-5555dd-200 focus:ring-offset-2"
          >
            Login with Discord
          </button>
          </Link>
        </div>
      </div>
    </>
  );
}

MainPage.getLayout = function(page: any) {
  return <NoAuthLayout>{page}</NoAuthLayout>
}


export const getServerSideProps: GetServerSideProps = withSession(developerRoute)
