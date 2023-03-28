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

interface Props {
  user?: User;
}

export default function DiscordAuth({ user }: Props) {
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
  const [loading, setLoading] = useState<boolean>(true);

  const [users, setUsers] = useState<Map<String, User>>();
  const [recentForms, setRecentForms] = useState<any | undefined>();

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
        setTotalStaffMembers(summary.totalStaffMembers);

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
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
                <StatsCard
                  title="Total Applications"
                  value={totalApplications}
                  icon={HiFolderOpen}
                  iconColor="text-yellow-400"
                />
                <StatsCard
                  title="% of Apps Reviewed"
                  value={
                    Math.round(applicationsReviewedPercentage * 10) / 10 || 0
                  }
                  showPercentage={true}
                  icon={HiClipboard}
                  iconColor="text-blue-400"
                />
                <StatsCard
                  title="% of Apps Approved"
                  value={Math.round(applicationStats?.approved * 10) / 10 || 0}
                  showPercentage={true}
                  icon={HiCheck}
                  iconColor="text-green-400"
                />
                <StatsCard
                  title="% of Apps Denied"
                  value={Math.round(applicationStats?.denied * 10) / 10 || 0}
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
