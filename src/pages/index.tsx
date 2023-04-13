import { GetServerSideProps } from "next";
import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import Layout from "src/components/layout";
import NoSidebar from "src/components/no-auth-layout";
import LoginBox from "src/components/user/login";
import { User } from "src/types";
import { isStaff } from "src/util/permission";
import { developerRoute } from "src/util/redirects";
import { withSession } from "src/util/session";

interface Props {
  user?: User;
  session?: any;
}

export default function MainPage({}: Props) {
  const router = useRouter();
  const [user, setUser] = useState<User | undefined>(undefined);

  const fetchSession = async () => {
    if (user) return; // prevent spamming API
    try {
      const res = await fetch("/api/auth/session");
      const userData = await res.json();
      if (userData.id) {
        setUser(userData);
      }
    } catch (err) {
      console.error("Failed to fetch session:", err);
    }
  };

  useEffect(() => {
    fetchSession();
  }, []);

  useEffect(() => {
    if (user) {
      if (isStaff(user)) router.push("/dashboard");
      else router.push("/profile");
    }
  });

  return !user ? (
    <>
      <LoginBox />
    </>
  ) : (
    <>
      <div className="w-screen h-screen flex justify-center items-center">
        <h1 className="text-while">Loading...</h1>
      </div>
    </>
  );
}

MainPage.getLayout = function (page: any) {
  return <NoSidebar>{page}</NoSidebar>;
};

export const getServerSideProps: GetServerSideProps =
  withSession(developerRoute);
