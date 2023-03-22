import { GetServerSideProps } from "next";
import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import ApplicationBar from "src/components/application/ApplicationBar";
import Loader from "src/components/Loader";
import { Application, DISCORD, User } from "src/types";
import { developerRoute } from "src/util/redirects";
import { withSession } from "src/util/session";

interface Props {
  user?: User;
}

export default function MainPage({ user }: Props) {
  const router = useRouter();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [users, setUsers] = useState<Map<String, User>>();
  const [page, setPage] = useState(1);
  const [pageLength, setPageLength] = useState(12);
  const [sortStatus, setSortStatus] = useState<string | null>("asc");
  const [hasNextPage, setHasNextPage] = useState<boolean>(true);

  useEffect(() => {
    if (!user) router.push("/");
    if (!user?.roles.includes(DISCORD.STAFF_ROLE_ID)) router.push("/");
  });

  const fetchApplications = useCallback(async () => {
    setLoading(true);
    const queryParams = new URLSearchParams();
    queryParams.append("page", page.toString());
    queryParams.append("pageLength", pageLength.toString());
    if (sortStatus) {
      queryParams.append("sortStatus", sortStatus);
    }
    const res = await fetch(
      `/api/application/get-applications?${queryParams.toString()}`
    );
    if (res.ok) {
      const applications: Application[] = await res.json();
      setApplications(applications);
      if (applications.length < pageLength) {
        setHasNextPage(false);
      } else {
        setHasNextPage(true);
      }
      const map = new Map<String, User>();
      for (const app of applications) {
        if (map.has(app.applicantId)) continue;

        const users = await fetch(`/api/user/${app.applicantId}`);
        if (users.ok) {
          const user = await users.json();
          map.set(app!!.applicantId, user);
        }
      }
      setUsers(map);
      setLoading(false);
    } else {
      setLoading(false);
    }
  }, [page, pageLength, sortStatus]);

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  const toggleSortStatus = () => {
    setSortStatus((prevStatus) => (prevStatus === "asc" ? "desc" : "asc"));
  };

  const nextPage = () => {
    setPage((prevPage) => prevPage + 1);
  };

  const prevPage = () => {
    setPage((prevPage) => Math.max(prevPage - 1, 1));
  };

  const sortedApplications = useMemo(() => {
    if (!sortStatus) {
      return applications;
    }

    return [...applications].sort((a, b) => {
      if (sortStatus === "asc") {
        return a.status - b.status;
      } else {
        return b.status - a.status;
      }
    });
  }, [applications, sortStatus]);

  return (
    <>
      <div className="mx-28 my-10">
        <h1 className="text-white text-3xl">Applications</h1>
        <button onClick={toggleSortStatus} className="text-gray-400">
          Sort by {" "}
          {sortStatus === "asc" ? (
            <span className="text-green-500">pending</span>
          ) : (
            <span className="text-red-500">reviewed</span>
          )}
        </button>
      </div>
      {loading ? (
        <>
          <div className="flex flex-wrap justify-center items-center">
            <Loader center={false} />
          </div>
        </>
      ) : applications.length > 0 ? (
        <>
          <div className="flex flex-wrap justify-center items-center">
            {applications.map((app) => (
              <Link href={`/applications/${(app as any)._id}`}>
                <div className="px-2">
                  <ApplicationBar
                    application={app}
                    applicant={users!!.get(app.applicantId)!!}
                  />
                </div>
              </Link>
            ))}
          </div>
          <div className="mx-32 my-4 flex justify-between">
            <button onClick={prevPage} className="text-white">
              Previous
            </button>
            <button
              onClick={nextPage}
              className="text-white"
              disabled={!hasNextPage}
            >
              Next
            </button>
          </div>
        </>
      ) : (
        <>
          <div className="flex flex-wrap mx-28">
            <h1 className="text-gray-400 text-xl font-thin">There are no applications</h1>
          </div>
        </>
      )}
    </>
  );
}

export const getServerSideProps: GetServerSideProps =
  withSession(developerRoute);
