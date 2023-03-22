import { GetServerSideProps } from "next";
import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import Loader from "src/components/Loader";
import {
  Application,
  APPLICATION_STATUS,
  convertStatus,
  DISCORD,
  User,
} from "src/types";
import { developerRoute } from "src/util/redirects";
import { withSession } from "src/util/session";

interface Props {
  user?: User;
}

export default function MainPage({ user }: Props) {
  const router = useRouter();
  const [application, setApplication] = useState<Application | null>(null);
  const [applicationExists, setApplicationExists] = useState<boolean>(false);
  const [applicant, setApplicant] = useState<User | null>(null);
  const [applicantExists, setApplicantExists] = useState<boolean>(false);
  const [isStaff, setIsStaff] = useState<boolean>(false);
  const [commentUsers, setCommentUsers] = useState<Map<String, User>>();
  const [loading, setLoading] = useState<boolean>(true);
  const [formData, setFormData] = useState({
    statusReason: "",
    status: 0,
  });

  const { slug } = router.query;

  useEffect(() => {
    if (!user) router.push("/");
  });

  useEffect(() => {
    console.log(user);
    const getApplication = async () => {
      if (applicationExists && applicantExists) return;
      if (!loading) return;
      try {
        const res = await fetch(`/api/application/${slug}`);
        console.log(res);
        if (res.ok) {
          const application: Application = await res.json();
          setApplication(application);
          setApplicationExists(true);
          const checkUserExists = await fetch(
            `/api/user/${application.applicantId}`
          );
          const map = new Map<String, User>();
          for (const note of application.notes) {
            const author = await fetch(`/api/user/${application.applicantId}`);
            if (author.ok) {
              const user = await author.json();
              map.set(note!!.authorId, user);
            }
          }
          setCommentUsers(map);
          if (checkUserExists.ok) {
            const user = await checkUserExists.json();
            if (user.roles.includes(DISCORD.STAFF_ROLE_ID)) {
              setIsStaff(true);
            }
            setApplicant(user);
            setApplicantExists(true);
            setLoading(false);
          } else {
            setApplicantExists(false);
            setLoading(false);
          }
        } else {
          setApplicationExists(false);
          setLoading(false);
        }
      } catch (error) {
        console.error(error);
        setApplicationExists(false);
        setLoading(false);
      }
    };
    getApplication();
  }, []);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    const now = Date.now();
    const applicationForm: Partial<Application> = {
      lastUpdate: now,
      updatedById: (user as any)._id,
      status: formData.status,
      statusReason:
        formData.statusReason === "" ? undefined : formData.statusReason,
    };

    try {
      const response = await fetch("/api/application/update", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          application: applicationForm,
          applicationId: (application as any)._id,
        }),
      });

      if (response.ok) {
        router.reload();
      } else {
        alert(
          "There was an error updating this application. Please try again later."
        );
      }
    } catch (error: any) {
      console.error("Error updating the application:", error);
      alert(
        "There was an error updating this application. Please try again later." +
          error.message
      );
    }
  };

  const handleButtonClick = (statusValue: number) => {
    formData["status"] = statusValue;
  };

  const staffElement = (
    <>
      <form onSubmit={handleSubmit}>
        <textarea
          id="statusSeason"
          name="statusReason"
          onChange={(e) => (formData["statusReason"] = e.target.value)}
          placeholder="Decision reasoning..."
          className={`max-w-lg w-1/4 p-2 mt-2 bg-slate-700 text-white bg-opacity-50 mb-4 rounded`}
          rows={4}
          required
        />
        <div className="flex flex-row justify-between w-40">
          <button
            type="submit"
            onClick={() => handleButtonClick(1)}
            className="bg-gradient-to-b from-green-500 to-green-700 text-white font-thin text-sm p-1 px-3 rounded"
          >
            Approve
          </button>
          <button
            type="submit"
            onClick={() => handleButtonClick(2)}
            className="bg-gradient-to-b from-red-500 to-red-700 text-white font-thin text-sm p-1 px-5 rounded"
          >
            Reject
          </button>
        </div>
      </form>
    </>
  );

  return (
    <>
      {loading ? (
        <Loader />
      ) : applicationExists && applicantExists ? (
        <div className="p-10">
          {isStaff && (
            <div className="fixed right-0 m-20 max-w-4xl w-96">
              <h1 className="text-white text-xl font-semibold">Comments</h1>
              <div className="p-6 max-w-4xl h-96 bg-slate-900 backdrop-blur-3xl bg-opacity-50 text-white rounded-xl shadow-md items-center space-x-1 backdrop-blur">
                {application!!.notes.map((note) => (
                  <div key={note!!.noteId} className="my-3">
                    <div className="flex flex-row">
                      <Image
                        className="rounded-full mr-2"
                        src={commentUsers!!.get(note!!.authorId!!)!!.avatar}
                        alt="User Avatar"
                        height={24}
                        width={24}
                      />
                      <h1 className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-indigo-500 to-blue-600">
                        {commentUsers!!.get(note!!.authorId!!)!!.username}#
                        {commentUsers!!.get(note!!.authorId!!)!!.discriminator}
                      </h1>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">{note!!.text}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
          <div className="flex flex-row">
            <h1 className="text-white text-3xl font-semibold">
              {applicant?.nick
                ? applicant.nick
                : `${applicant?.username}#${applicant?.discriminator}`}
              's Staff Application
            </h1>
            <p
              className={`${
                application?.status === 0
                  ? "text-gray-500"
                  : application?.status === 1
                  ? "text-green-500"
                  : "text-red-500"
              } text-xl px-5 font-thin`}
            >
              ({convertStatus(application?.status as number)})
            </p>
          </div>
          <div className="flex flex-row py-2">
            <h1 className="text-white font-semibold">{`${applicant?.username}#${applicant?.discriminator}`}</h1>
            <p className="text-white font-thin italic px-2">
              ({(applicant as any)._id})
            </p>
            <p className="text-white font-semibold italic px-2">
              Age: {application?.questions[0]?.response?.value || 0}
            </p>
            <p className="text-white font-semibold italic px-2">
              {applicant?.email}
            </p>
          </div>
          {isStaff && (
            <div className="flex flex-col">
              <div className="flex flex-row justify-between max-w-md">
                <h1 className="text-gray-400 font-thin pb-6">
                  Last modfied by: {application?.updatedById}
                </h1>
              </div>
              <div className="flex flex-col">
                {application!!.status === 0
                  ? staffElement
                  : user!!.access_level > 0 && staffElement}
              </div>
            </div>
          )}
          {application!!.statusReason && (
            <>
              <div className="p-6 my-4 max-w-4xl bg-slate-700 backdrop-blur-3xl bg-opacity-50 text-white rounded-xl shadow-md items-center space-x-1 backdrop-blur">
                <h1 className="text-white font-semibold text-sm">
                  Decision Reasoning
                </h1>
                <p className="text-gray-400 font-thin text-sm">
                  {application?.statusReason}
                </p>
              </div>
            </>
          )}
          <div className="flex flex-col">
            <h1 className="text-white font-semibold text-xl pt-6">
              General Questions
            </h1>
            <div className="p-6 my-4 max-w-4xl bg-slate-900 backdrop-blur-3xl bg-opacity-50 text-white rounded-xl shadow-md items-center space-x-1 backdrop-blur">
              <h1 className="text-white font-semibold text-sm">
                {application?.questions[1]?.questionText}
              </h1>
              <p className="text-gray-400 font-thin text-sm">
                {application?.questions[1]?.response?.value}
              </p>
            </div>
            <div className="p-6 max-w-4xl bg-slate-900 backdrop-blur-3xl bg-opacity-50 text-white rounded-xl shadow-md items-center space-x-1 backdrop-blur">
              <h1 className="text-white font-semibold text-sm">
                {application?.questions[2]?.questionText}
              </h1>
              <p className="text-gray-400 font-thin text-sm">
                {application?.questions[2]?.response?.value}
              </p>
            </div>
            <h1 className="text-white font-semibold text-xl pt-6">
              Scenario Questions
            </h1>
            <div className="p-6 my-4 max-w-4xl bg-slate-900 backdrop-blur-3xl bg-opacity-50 text-white rounded-xl shadow-md items-center space-x-1 backdrop-blur">
              <h1 className="text-white font-semibold text-sm">
                {application?.questions[3]?.questionText}
              </h1>
              <p className="text-gray-400 font-thin text-sm">
                {application?.questions[3]?.response?.value}
              </p>
            </div>
            <div className="p-6 max-w-4xl bg-slate-900 backdrop-blur-3xl bg-opacity-50 text-white rounded-xl shadow-md items-center space-x-1 backdrop-blur">
              <h1 className="text-white font-semibold text-sm">
                {application?.questions[4]?.questionText}
              </h1>
              <p className="text-gray-400 font-thin text-sm">
                {application?.questions[4]?.response?.value}
              </p>
            </div>
            <div className="p-6 my-4 max-w-4xl bg-slate-900 backdrop-blur-3xl bg-opacity-50 text-white rounded-xl shadow-md items-center space-x-1 backdrop-blur">
              <h1 className="text-white font-semibold text-sm">
                {application?.questions[5]?.questionText}
              </h1>
              <p className="text-gray-400 font-thin text-sm">
                {application?.questions[5]?.response?.value}
              </p>
            </div>
            <div className="p-6 max-w-4xl bg-slate-900 backdrop-blur-3xl bg-opacity-50 text-white rounded-xl shadow-md items-center space-x-1 backdrop-blur">
              <h1 className="text-white font-semibold text-sm">
                {application?.questions[6]?.questionText}
              </h1>
              <p className="text-gray-400 font-thin text-sm">
                {application?.questions[6]?.response?.value}
              </p>
            </div>
            <div className="p-6 my-4 max-w-4xl bg-slate-900 backdrop-blur-3xl bg-opacity-50 text-white rounded-xl shadow-md items-center space-x-1 backdrop-blur">
              <h1 className="text-white font-semibold text-sm">
                {application?.questions[7]?.questionText}
              </h1>
              <p className="text-gray-400 font-thin text-sm">
                {application?.questions[7]?.response?.value}
              </p>
            </div>
          </div>
          <h1 className="text-white font-semibold text-xl pt-6">
            Roeplay Knowledge Questions
          </h1>
          <div className="p-6 my-4 max-w-4xl bg-slate-900 backdrop-blur-3xl bg-opacity-50 text-white rounded-xl shadow-md items-center space-x-1 backdrop-blur">
            <h1 className="text-white font-semibold text-sm">
              {application?.questions[8]?.questionText}
            </h1>
            <p className="text-gray-400 font-thin text-sm">
              {application?.questions[8]?.response?.value}
            </p>
          </div>
          <div className="p-6 max-w-4xl bg-slate-900 backdrop-blur-3xl bg-opacity-50 text-white rounded-xl shadow-md items-center space-x-1 backdrop-blur">
            <h1 className="text-white font-semibold text-sm">
              {application?.questions[9]?.questionText}
            </h1>
            <p className="text-gray-400 font-thin text-sm">
              {application?.questions[9]?.response?.value}
            </p>
          </div>
          <div className="p-6 my-4 max-w-4xl bg-slate-900 backdrop-blur-3xl bg-opacity-50 text-white rounded-xl shadow-md items-center space-x-1 backdrop-blur">
            <h1 className="text-white font-semibold text-sm">
              {application?.questions[10]?.questionText}
            </h1>
            <p className="text-gray-400 font-thin text-sm">
              {application?.questions[10]?.response?.value}
            </p>
          </div>
          <div className="p-6 max-w-4xl bg-slate-900 backdrop-blur-3xl bg-opacity-50 text-white rounded-xl shadow-md items-center space-x-1 backdrop-blur">
            <h1 className="text-white font-semibold text-sm">
              {application?.questions[11]?.questionText}
            </h1>
            <p className="text-gray-400 font-thin text-sm">
              {application?.questions[11]?.response?.value}
            </p>
          </div>
          <div className="p-6 my-4 max-w-4xl bg-slate-900 backdrop-blur-3xl bg-opacity-50 text-white rounded-xl shadow-md items-center space-x-1 backdrop-blur">
            <h1 className="text-white font-semibold text-sm">
              {application?.questions[12]?.questionText}
            </h1>
            <p className="text-gray-400 font-thin text-sm">
              {application?.questions[12]?.response?.value}
            </p>
          </div>
        </div>
      ) : (
        <div className="h-screen flex justify-center items-center">
          <h1 className="text-white">This application does not exist.</h1>
        </div>
      )}
    </>
  );
}

export const getServerSideProps: GetServerSideProps =
  withSession(developerRoute);
