import { GetServerSideProps } from "next";
import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import ApplicationBar from "src/components/application/ApplicationBar";
import InterviewBar from "src/components/application/InterviewBar";
import Loader from "src/components/Loader";
import { Application, DISCORD, Interview, User } from "src/types";
import { developerRoute } from "src/util/redirects";
import { withSession } from "src/util/session";
import { isStaff as isStaffUtil } from "src/util/permission";

interface Props {
  user?: User;
}

export default function MainPage({ user }: Props) {
  const router = useRouter();
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [users, setUsers] = useState<Map<String, User>>();
  const [page, setPage] = useState(router.query.page ? router.query.page as unknown as number : 1);
  const [pageLength, setPageLength] = useState(6);
  const [sortStatus, setSortStatus] = useState<string | null>("asc");
  const [hasNextPage, setHasNextPage] = useState<boolean>(true);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    if (!user) router.push("/");
    if (!isStaffUtil(user!!)) router.push("/");
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
      `/api/interview/get-interviews?${queryParams.toString()}`
    );
    if (res.ok) {
      const json = (await res.json());
      const interviews: Interview[] = json.interviews;
      setTotal(json.total);
      setInterviews(interviews);
      if (page > total / 12) {
        setHasNextPage(false);
      } else {
        setHasNextPage(true);
      }
      const map = new Map<String, User>();
      const applicantIds = [
        ...interviews.map((interview) => interview.applicantId),
        ...interviews
          .filter((interview) => interview.claimedById)
          .map((interview) => interview.claimedById),
      ];

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
      return interviews;
    }

    return [...interviews].sort((a, b) => {
      if (sortStatus === "asc") {
        return a.status - b.status;
      } else {
        return b.status - a.status;
      }
    });
  }, [interviews, sortStatus]);

  return (
    <>
      <div className="mx-28 my-10">
        <h1 className="text-white text-3xl">Interviews</h1>
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
          <div className="flex flex-col justify-center items-center">
            <Loader center={false} />
          </div>
        </>
      ) : interviews.length > 0 ? (
        <>
          <div className="flex flex-col justify-center items-center">
            {interviews.map((interview: any) => (
              // eslint-disable-next-line react/jsx-key, @next/next/link-passhref
              <Link href={`/interviews/${(interview as any)._id}`}>
                <div className="px-2">
                  <InterviewBar
                    interview={interview}
                    applicant={users!!.get(interview.applicantId)!!}
                    staffMember={users?.get(interview?.claimedById || '')}
                  />
                </div>
              </Link>
            ))}
          </div>
          <div className="mx-48 my-4 flex justify-between">
            <button
              onClick={prevPage}
              className={`text-white ${!hasNextPage ? "text-gray-600" : ""}`}
              disabled={page === 1}
            >
              Previous
            </button>
            <p className="text-white">Page {page} of {Math.round(total / 12)}</p>
            <button
              onClick={nextPage}
              className={`text-white ${!hasNextPage ? "text-gray-600" : ""}`}
              disabled={!hasNextPage}
            >
              Next
            </button>
          </div>
        </>
      ) : (
        <>
          <div className="flex flex-wrap mx-28">
            <h1 className="text-gray-400 text-xl font-thin">
              There are no interviews
            </h1>
          </div>
        </>
      )}
    </>
  );
}

export const getServerSideProps: GetServerSideProps =
  withSession(developerRoute);
