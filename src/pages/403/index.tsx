import { GetServerSideProps } from "next";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import React, { useEffect } from "react";
import NoSidebar from "src/components/no-auth-layout";
import { User } from "src/types";
import { developerRoute } from "src/util/redirects";
import { withSession } from "src/util/session";
import styles from "./403.module.css";

interface Props {
  user?: User;
}

export default function MainPage({ user }: Props) {
  const router = useRouter();

  return (
    <>
      <div className={styles.content}>
        <div className="backdrop-blur-lg bg-opacity-50">
        <h1>Uh oh...</h1>
        <h2>You do not have permission to view this page...</h2>
          <div className="flex-shrink-0 flex justify-center items-center">
          </div>
          <Link href="/" passHref>
          <button
            className="my-10 px-6 py-2 text-sm justify-start items-start text-blue-500 font-bold border border-blue-500 rounded"
          >
            Go Home
          </button>
          </Link>
          </div>
        </div>
    </>
  );
}

MainPage.getLayout = function (page: any) {
  return <NoSidebar>{page}</NoSidebar>;
};

export const getServerSideProps: GetServerSideProps =
  withSession(developerRoute);
