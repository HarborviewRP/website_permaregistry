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
import { isAdmin, isStaff } from "src/util/permission";
import { developerRoute } from "src/util/redirects";
import { withSession } from "src/util/session";

interface Props {
  user?: User;
}

export default function MainPage({ user }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState<boolean>(false);
  const [users, setUsers] = useState<Map<string, User>>(
    new Map<string, User>()
  );
  const [text, setText] = useState<string | undefined>();

  useEffect(() => {
    if (!user) router.push("/");
    if (!isAdmin(user!!)) router.push("/");
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

  const logUserOut = (id: string) => {
    const func = async (id: string) => {
      try {
        const res = await fetch(`/api/logout/${id}`);
        if (res.ok) {
          setText(((await res.json()) as any).message);
          await new Promise(res => setTimeout(res, 5000))
          setText('');
        } else {
          setText(res.statusText)
        }
      } catch (err: any) {
        setText(err.message);
        router.push('/')
      }
    }
    func(id);
  }

  return (
    <>
      <div className="mx-28 my-10">
        <h1 className="text-white text-3xl">Staff Members (Admin Dashboard)</h1>
        {text ? <p className="text-green-500">{text}</p> : <></>}
      </div>
      {/* <div className="mx-28 my-10">
        <h1 className="text-white text-2xl font-thin">Coming soon...!</h1>
      </div> */}
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
              <div style={{ width: "80%" }}>
                <div className="flex flex-row items-center">
                  <Link
                    key={userId}
                    href={`/profile/${userId}`}
                    passHref={true}
                    style={{ width: "95%" }}
                  >
                    <div
                      className="flex-grow-0 flex-shrink-0 flex-basis-auto"
                      style={{ width: "95%" }}
                    >
                      <StaffBar user={userData} />
                    </div>
                  </Link>

                  <div
                    className="flex-grow-0 items-center justify-center flex-shrink-0 flex-basis-auto"
                    style={{ width: "5%" }}
                  >
                    <button className="text-red-600" onClick={() => logUserOut(userId)}>Logout</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      ) : (
        <>
          <div className="flex flex-wrap mx-28">
            <h1 className="text-gray-400 text-xl font-thin">
              There are no staff...
            </h1>
          </div>
        </>
      )}
    </>
  );
}

export const getServerSideProps: GetServerSideProps =
  withSession(developerRoute);
