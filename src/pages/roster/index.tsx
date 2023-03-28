import { GetServerSideProps } from "next";
import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import ApplicationBar from "src/components/application/ApplicationBar";
import Loader from "src/components/Loader";
import StaffBar from "src/components/roster/StaffBar";
import { Application, DISCORD, User } from "src/types";
import { isStaff } from "src/util/permission";
import { developerRoute } from "src/util/redirects";
import { withSession } from "src/util/session";

interface Props {
  user?: User;
}

export default function MainPage({ user }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState<boolean>(true);
  const [users, setUsers] = useState<Map<string, User>>(
    new Map<string, User>()
  );

  useEffect(() => {
    if (!user) router.push("/");
    if (!isStaff(user!!)) router.push("/");
  });

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    const res = await fetch(`/api/user/staff`);
    if (res.ok) {
      const usersData: [string, User][] = await res.json();
      const usersMap = new Map<string, User>(usersData);
      setUsers(usersMap);
      setLoading(false);
    } else {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  return (
    <>
      <div className="mx-28 my-10">
        <h1 className="text-white text-3xl">Recruitment Staff Team</h1>
      </div>
      {loading ? (
        <>
          <div className="flex flex-wrap justify-center items-center">
            <Loader center={false} />
          </div>
        </>
      ) : users.size > 0 ? (
        <>
          <div className="flex flex-col flex-wrap justify-center items-center">
            {Array.from(users).map(([userId, userData]) => (
              <Link key={userId} href={`/profile/${userId}`} passHref={true} style={{ width: "75%" }}>
                <div>
                  <StaffBar user={userData} />
                </div>
              </Link>
            ))}
          </div>
        </>
      ) : (
        <>
          <div className="flex flex-wrap mx-28">
            <h1 className="text-gray-400 text-xl font-thin">
              There are no recruitment staff...
            </h1>
          </div>
        </>
      )}
    </>
  );
}

export const getServerSideProps: GetServerSideProps =
  withSession(developerRoute);
