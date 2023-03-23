import { GetServerSideProps } from "next";
import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import React, { useEffect } from "react";
import { User } from "src/types";
import { developerRoute } from "src/util/redirects";
import { withSession } from "src/util/session";

interface Props {
  user?: User;
}

export default function DiscordAuth({ user }: Props) {
  const router = useRouter();
  useEffect(() => {
    if (!user) router.push('/')
  })

  return (
    <>
     <div className="h-screen flex justify-center items-center">
      <div className="p-6 max-w-sm mx-auto bg-slate-900 backdrop-blur-3xl bg-opacity-50 rounded-xl shadow-md flex items-center space-x-4 backdrop-blur">
        {user && (
          <>
            <div className="flex-shrink-0">
              <Image
              className="rounded-full"
                src={user.avatar}
                alt="User Avatar"
                height={56}
                width={56}
              />
            </div>
            <h1 className="px-5 py-1 text-1xl font-semibold flex justify-center items-center text-white  border-indigo-500 hover:border-transparent focus:outline-none focus:ring-2 focus:ring-5555dd-200 focus:ring-offset-2">
              {user.username}#{user.discriminator}
            </h1>
            <Link href="/api/auth/logout" passHref>
              <button className="px-2.5 py-2 text-sm flex justify-start text-indigo-500 font-semibold rounded-full border border-indigo-500 hover:bg-indigo-500 hover:text-gray-50 hover:border-transparent focus:outline-none focus:ring-2 focus:ring-5555dd-200 focus:ring-offset-2">
                Logout
              </button>
            </Link>
          </>
        )}
      </div>
    </div>
    </>
  );
}

export const getServerSideProps: GetServerSideProps = withSession(developerRoute)
