import React, { useEffect, useState } from "react";
import Image from "next/image";
import { Interview, convertStatus, User } from "src/types";
import moment from "moment";

interface InterviewProps {
  interview: Interview;
  applicant: User;
  staffMember?: User
}

const InterviewBar: React.FC<InterviewProps> = ({ interview, applicant, staffMember = undefined }) => {
  function truncate(str: string, maxLength = 19) {
    if (str.length <= maxLength) {
      return str;
    }
    return str.slice(0, maxLength - 3) + "...";
  }

  return (
    <>
      <div className="p-4 my-3 bg-slate-900 backdrop-blur-3xl bg-opacity-50 text-white rounded-xl shadow-lg items-center space-x-1 backdrop-blur">
        <div className="flex flex-row justify-between">
          <div className="flex flex-row items-center p-1">
            <div
              className="rounded-full mr-2 relative overflow-hidden"
              style={{ width: 36, height: 36 }}
            >
              <Image
                src={applicant.avatar}
                alt="User Avatar"
                height={36}
                width={36}
              />
            </div>
            <div className="flex flex-col">
              <h1 className="text-white font-thin text-lg">
                {truncate(applicant.nick ? applicant.nick : applicant.username)}
              </h1>
              <h1 className="text-sm text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-indigo-500 to-blue-600">
                {applicant.username}#{applicant.discriminator}
              </h1>
            </div>
          </div>
          <div className="flex flex-row items-center px-24">
            <h1 className="text-gray-500 text-sm">{(applicant as any)._id}</h1>
          </div>

          <div className="flex flex-row">
            <div className="flex flex-row items-center px-8">
              <p
                className={`${
                  interview?.status === 0
                    ? "text-gray-500"
                    : interview?.status === 1
                    ? "text-green-500"
                    : "text-red-500"
                } text-md`}
              >
                {convertStatus(interview?.status as number)}
              </p>
            </div>
            {interview.claimedById ? (
              <>
                <div className="flex flex-row items-center p-1">
                  <div className="flex flex-col text-right pr-2">
                    <h1 className="text-white font-thin text-lg ">
                      {truncate(
                        staffMember?.nick ? staffMember?.nick : staffMember?.username || ''
                      )}
                    </h1>
                    <h1 className="text-sm text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-indigo-500 to-blue-600">
                      {staffMember?.username}#{staffMember?.discriminator}
                    </h1>
                  </div>
                  <div
                    className="rounded-full mr-2 relative overflow-hidden"
                    style={{ width: 36, height: 36 }}
                  >
                    <Image
                      src={staffMember?.avatar || ''}
                      alt="User Avatar"
                      height={36}
                      width={36}
                    />
                  </div>
                </div>
              </>
            ) : (
                <div className="flex flex-row items-center px-8">
                <p className="text-gray-500">unclaimed</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default InterviewBar;
