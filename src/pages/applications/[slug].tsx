import { GetServerSideProps } from "next";
import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect } from "react";
import { User } from "src/types";
import { developerRoute } from "src/util/redirects";
import { withSession } from "src/util/session";

interface Props {
  user?: User;
}

export default function MainPage({ user }: Props) {
  const router = useRouter();
  useEffect(() => {
    if (!user) router.push('/')
  })
  const { slug } = router.query

  return (
    <>
    {slug && (
      <div className="h-screen flex justify-center items-center">
      <div className="p-6 max-w-sm mx-auto bg-slate-900 backdrop-blur-3xl bg-opacity-50 text-white rounded-xl shadow-md items-center space-x-1 backdrop-blur">
        Application ID: {slug}
      </div>
    </div>
    )}

    </>
  );
}

export const getServerSideProps: GetServerSideProps = withSession(developerRoute)
