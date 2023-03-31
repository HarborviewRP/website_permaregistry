import { GetServerSideProps } from "next";
import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import { Application, User } from "src/types";
import { developerRoute } from "src/util/redirects";
import { withSession } from "src/util/session";
import StatsCard from "src/components/StatsCard";
import {
  HiCheck,
  HiClipboard,
  HiFolderOpen,
  HiUsers,
  HiX,
} from "react-icons/hi";
import RecentBar from "src/components/dashboard/RecentBar";
import { isStaff } from "src/util/permission";
import Loader from "src/components/Loader";
import LineChart from "src/components/dashboard/LineChart";
import { Chart } from "chart.js";
import DonutChart from "src/components/dashboard/DonutChart";

interface Props {
  user?: User;
}

export default function DiscordAuth({ user }: Props) {
  Chart.register(LineChart as any);
  const router = useRouter();
  useEffect(() => {
    if (!user) router.push("/");
    if (!isStaff(user!!)) router.push("/");
  });

  const [totalApplications, setTotalApplications] = useState<number>(0);
  const [applicationsReviewedPercentage, setApplicationsReviewedPercentage] =
    useState<number>(0);
  const [applicationStats, setApplicationStats] = useState({
    approved: 0,
    denied: 0,
  });
  const [totalStaffMembers, setTotalStaffMembers] = useState<number>(0);

  const [totalInterviews, setTotalInterviews] = useState<number>(0);
  const [interviewReviewedPercentage, setInterviewReviewedPercentage] =
    useState<number>(0);
  const [interviewStats, setInterviewStats] = useState({
    approved: 0,
    denied: 0,
  });

  const [loading, setLoading] = useState<boolean>(true);

  const [users, setUsers] = useState<Map<String, User>>();
  const [recentForms, setRecentForms] = useState<any | undefined>();
  const [toggleState, setToggleState] = useState(true);
  const [applicationsPerDay, setApplicationsPerDay] = useState<
    Array<{ _id: string; count: number }>
  >([]);
  const [interviewsPerDay, setInterviewsPerDay] = useState<
    Array<{ _id: string; count: number }>
  >([]);
  const [applicationStatusStats, setApplicationStatusStats] = useState<any>();
  const [interviewStatusStats, setInterviewStatusStats] = useState<any>();

  useEffect(() => {
    setLoading(true);
    const fetchData = async () => {
      try {
        const res = await fetch("/api/dashboard/summary");
        const summary = await res.json();

        setTotalApplications(summary.totalApplications);
        setApplicationsReviewedPercentage(
          summary.applicationsReviewedPercentage
        );
        setApplicationStats(summary.applicationsStats);
        setApplicationsPerDay(summary.applicationsSubmittedPerDay);
        setApplicationStatusStats(summary.applicationStatusStats);
        setTotalStaffMembers(summary.totalStaffMembers);
        setTotalInterviews(summary.totalInterviews);
        setInterviewReviewedPercentage(summary.interviewsReviewedPercentage);
        setInterviewStats(summary.interviewsStats);
        setInterviewsPerDay(summary.interviewsPerDay);
        setInterviewStatusStats(summary.interviewStatusStats);

        const recentRes = await fetch("/api/dashboard/recently-modified");
        if (recentRes.ok) {
          const recentlyMod = await recentRes.json();
          setRecentForms(recentlyMod);
          const applicantIds = recentlyMod.map(
            (recentlyMod: any) => recentlyMod.applicantId
          );
          const usersResponse = await fetch("/api/user/bulk", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ users: applicantIds }),
          });
          const map = new Map<String, User>();
          if (usersResponse.ok) {
            const usersArray = await usersResponse.json();
            for (const [id, user] of usersArray) {
              map.set(id, user);
            }
          }
          setUsers(map);
          setLoading(false);
        }
      } catch (err: any) {
        setLoading(false);
        alert("There was an error..." + err.message);
      }
    };

    fetchData();
  }, []);

  const handleToggle = () => {
    setToggleState(!toggleState);
  };

  return (
    <>
      <div className="mx-28 my-10">
        <h1 className="text-white text-3xl">Dashboard</h1>
      </div>
      {loading ? (
        <div className="flex justify-center">
          <Loader center={false} />
        </div>
      ) : (
        <>
          <div className="mx-28 my-10">
            <div className="container mx-auto my-8">
              <h1 className="text-white text-xl mb-3">
                <button onClick={handleToggle}>
                  <span
                    className={toggleState ? "text-white" : "text-gray-500"}
                  >
                    Application
                  </span>{" "}
                  /{" "}
                  <span
                    className={toggleState ? "text-gray-500" : "text-white"}
                  >
                    Interview
                  </span>{" "}
                  Stats{" "}
                </button>
              </h1>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
                <StatsCard
                  title={`Total ${toggleState ? "Applications" : "Interviews"}`}
                  value={toggleState ? totalApplications : totalInterviews}
                  icon={HiFolderOpen}
                  iconColor={toggleState ? "text-blue-400" : "text-yellow-400"}
                />
                <StatsCard
                  title={`% of ${toggleState ? "Apps" : "Interviews"} Reviewed`}
                  value={
                    Math.round(
                      (toggleState
                        ? applicationsReviewedPercentage
                        : interviewReviewedPercentage) * 10
                    ) / 10 || 0
                  }
                  showPercentage={true}
                  icon={HiClipboard}
                  iconColor={toggleState ? "text-blue-400" : "text-yellow-400"}
                />
                <StatsCard
                  title={`% of ${toggleState ? "Apps" : "Interviews"} Approved`}
                  value={
                    Math.round(
                      (toggleState
                        ? applicationStats.approved
                        : interviewStats.approved) * 10
                    ) / 10 || 0
                  }
                  showPercentage={true}
                  icon={HiCheck}
                  iconColor="text-green-400"
                />
                <StatsCard
                  title={`% of ${toggleState ? "Apps" : "Interviews"} Rejected`}
                  value={
                    Math.round(
                      (toggleState
                        ? applicationStats.denied
                        : interviewStats.denied) * 10
                    ) / 10 || 0
                  }
                  showPercentage={true}
                  icon={HiX}
                  iconColor="text-red-400"
                />
                <StatsCard
                  title="Total Staff Members"
                  value={totalStaffMembers || 0}
                  icon={HiUsers}
                  iconColor="text-blue-400"
                />
              </div>
              <div className="mt-8 flex flex-row">
                <div style={{ width: "70%" }} className="mx-2">
                  {toggleState ? (
                    <LineChart
                      data={applicationsPerDay}
                      label={"Applications Submitted / Day"}
                    />
                  ) : (
                    <LineChart
                      data={interviewsPerDay}
                      label={"Interviews Opened / Day"}
                    />
                  )}
                </div>
                <div style={{ width: "30%" }} className="mx-2">
                {toggleState ? (
                    <DonutChart
                      data={[(totalApplications - (applicationStatusStats[0].count + applicationStatusStats[1].count)), applicationStatusStats[0].count, applicationStatusStats[1].count]}
                      label={"# Of Applications"}
                    />
                  ) : (
                    <DonutChart
                    data={[(totalInterviews - (interviewStatusStats[0].count + interviewStatusStats[1].count)), interviewStatusStats[0].count, interviewStatusStats[1].count]}
                    label={"# Of Interviews"}
                    />
                  )}
                </div>
              </div>
              <div className="mt-16">
                <h1 className="text-white text-xl">Recently Updated</h1>
                {recentForms.length > 0 ? (
                  <>
                    {recentForms.map((form: any) => (
                      <Link
                        key={form.id}
                        passHref={true}
                        href={`/${
                          form.collection === "applications"
                            ? "applications"
                            : "interviews"
                        }/${form._id}`}
                      >
                        <div className="px-2">
                          <RecentBar
                            form={form}
                            applicant={users!!.get(form.applicantId)!!}
                          />
                        </div>
                      </Link>
                    ))}
                  </>
                ) : (
                  <>
                    <h1>No Recently Modified Applications or Interviews</h1>
                  </>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}

export const getServerSideProps: GetServerSideProps =
  withSession(developerRoute);
