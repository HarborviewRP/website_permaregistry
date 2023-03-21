import { GetServerSideProps } from "next";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import React, { useEffect } from "react";
import NoAuthLayout from "src/components/no-auth-layout";
import { User } from "src/types";
import { developerRoute } from "src/util/redirects";
import { withSession } from "src/util/session";
import styles from "./403.module.css";

interface Props {
  user?: User;
}

export default function MainPage({ user }: Props) {
  const router = useRouter();
  useEffect(() => {
    if (user) router.push("/dashboard");
  });

  return (
    <>
      <div className={styles.content}>
        <h1>Uh oh...</h1>
        <h2>You do not have permission to view this page...</h2>
          <div className="flex-shrink-0 flex justify-center items-center">
          </div>
          <Link href="/" passHref>
          <button
            className="my-10 px-6 py-2 text-sm justify-start items-start text-white bg-indigo-500 backdrop-blur-3xl bg-opacity-50 font-bold rounded-full border border-indigo-500 hover:bg-indigo-500 hover:text-gray-50 hover:border-transparent focus:outline-none focus:ring-2 focus:ring-5555dd-200 focus:ring-offset-2"
          >
            Go Home
          </button>
          </Link>
        </div>
    </>
  );
}

MainPage.getLayout = function (page: any) {
  return <NoAuthLayout>{page}</NoAuthLayout>;
};

export const getServerSideProps: GetServerSideProps =
  withSession(developerRoute);
