import { GetServerSideProps } from "next";
import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import ApplicationBar from "src/components/application/ApplicationBar";
import Loader from "src/components/Loader";
import PageSelector from "src/components/PageSector";
import { Application, DISCORD, User } from "src/types";
import { isStaff } from "src/util/permission";
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
  const [page, setPage] = useState(router.query.page ? router.query.page as unknown as number : 1);
  const [pageLength, setPageLength] = useState(12);
  const [sortStatus, setSortStatus] = useState<string | null>("asc");
  const [hasNextPage, setHasNextPage] = useState<boolean>(true);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    if (!user) router.push("/");
    // if (!isStaff(user!!)) router.push("/");
  });

  const onPageClick = (pageNumber: number) => {
    setPage(pageNumber);
  
    const queryParams = new URLSearchParams(window.location.search);
    queryParams.set("page", pageNumber.toString());
    const newUrl = window.location.pathname + "?" + queryParams.toString();
    window.history.pushState({ path: newUrl }, "", newUrl);
  };

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
      const json = (await res.json());
      const total = json.total;
      const applications: Application[] = json.applications;

      setApplications(applications);
      setTotal(total);

      if (page > total / 12) {
        setHasNextPage(false);
      } else {
        setHasNextPage(true);
      }
      const map = new Map<String, User>();
      const applicantIds = applications.map((app) => app.applicantId);
      const usersResponse = await fetch("/api/user/bulk", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ users: applicantIds }),
      });
      if (usersResponse.ok) {
        const usersArray = await usersResponse.json();
        for (const [id, user] of usersArray) {
          map.set(id, user);
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
          Sort by{" "}
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
              <Link href={`/applications/${(app as any)._id}`} key={(app as any)._i} passHref={true}>
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
            <PageSelector
              currentPage={page}
              totalPages={Math.ceil(total / 12)}
              adjacentPages={2}
              onPageClick={onPageClick}
            />
          </div>
        </>
      ) : (
        <>
          <div className="flex flex-wrap mx-28">
            <h1 className="text-gray-400 text-xl font-thin">
              There are no applications
            </h1>
          </div>
        </>
      )}
    </>
  );
}

export const getServerSideProps: GetServerSideProps =
  withSession(developerRoute);
