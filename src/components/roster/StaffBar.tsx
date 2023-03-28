import React, { useEffect, useState } from "react";
import Image from "next/image";
import { Application, convertStatus, User } from "src/types";
import moment from "moment";
import Loader from "../Loader";
import { isAdmin } from "src/util/permission";
import { calculateCredit, CREDIT } from "src/util/credit";

interface StaffProps {
  user: User;
}

const StaffBar: React.FC<StaffProps> = ({ user }) => {
  const [loading, setLoading] = useState<boolean>(true);
  const [data, setData] = useState<{
    application: { total: number; reviewed: number };
    interview: { total: number; reviewed: number };
  }>();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(`/api/roster/stats/${(user as any)._id}`);
        if (res.ok) {
          setData(await res.json());
          setLoading(false);
        }
      } catch (err) {
        setLoading(false);
      }
    };
    fetchData();
  }, [user]);

  function truncate(str: string, maxLength = 24) {
    if (str.length <= maxLength) {
      return str;
    }
    return str.slice(0, maxLength - 3) + "...";
  }

  return (
    <>
      <div className="p-4 my-3 bg-slate-900 backdrop-blur-3xl bg-opacity-50 text-white rounded-xl shadow-lg items-center space-x-1 backdrop-blur">
        {loading ? (
          <Loader center={false} />
        ) : (
          <div className="flex flex-row justify-between">
            <div
              className="flex flex-row items-center p-1"
              style={{
                width: "25%",
              }}
            >
              <div
                className="rounded-full mr-2 relative overflow-hidden"
                style={{ width: 36, height: 36 }}
              >
                <Image
                  src={user.avatar}
                  alt="User Avatar"
                  height={36}
                  width={36}
                />
              </div>
              <div className="flex flex-col">
                <h1 className="text-white font-thin text-lg truncate">
                  {user.nick ? user.nick : user.username}
                </h1>
                <h1 className="text-sm text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-indigo-500 to-blue-600">
                  {user.username}#{user.discriminator}
                </h1>
              </div>
            </div>
            <div className="flex flex-row items-center ">
              <h1 className="text-gray-500 text-sm">
                Weekly Credits:{" "}
                {calculateCredit(
                  data!!.application.reviewed,
                  data!!.interview.reviewed
                )}
                <span className="italic text-xs text-gray-700">
                  {" "}
                  ({data!!.application.reviewed} * {CREDIT.APPLICATION_REVIEW} +{" "}
                  {data!!.interview.reviewed} * {CREDIT.INTERVIEW_REVIEW} ={" "}
                  {calculateCredit(
                    data!!.application.reviewed,
                    data!!.interview.reviewed
                  )}
                  )
                </span>
              </h1>
            </div>
            <div
              className="flex flex-row items-center px-8"
              style={{
                width: "15%",
              }}
            >
              {isAdmin(user) ? (
                <p className="text-left font-thin text-red-600">
                  Website Admin
                </p>
              ) : (
                <p className="text-left font-thin text-yellow-500">
                  Recruitment Team
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default StaffBar;
