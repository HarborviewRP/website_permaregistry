import { useEffect, useRef, useState } from "react";
import axios from "axios";
import {
  Application,
  convertStatus,
  DISCORD,
  Interview,
  User,
} from "src/types";
import { useRouter } from "next/router";
import { GetServerSideProps } from "next";
import { withSession } from "src/util/session";
import { developerRoute } from "src/util/redirects";
import Loader from "src/components/Loader";
import CommentBox from "src/components/application/CommentBox";
import moment from "moment";
import Link from "next/link";
import { Menu } from "@headlessui/react";
import AudioPlayer from "src/components/AudioPlayer";
import { isAdmin, isStaff as isStaffUtil } from "src/util/permission";
import { randomUUID } from "crypto";

interface Props {
  user?: User;
}

export default function Home({ user }: Props) {
  const router = useRouter();

  useEffect(() => {
    if (!user) router.push("/");
  });

  const [application, setApplication] = useState<Application | null>(null);
  const [interview, setInterview] = useState<Interview | null>(null);
  const [interviewExists, setInterviewExists] = useState<boolean>(false);
  const [applicant, setApplicant] = useState<User | null>(null);
  const [applicantExists, setApplicantExists] = useState<boolean>(false);
  const [isStaff, setIsStaff] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [uploading, setUploading] = useState<boolean>(false);
  const [formData, setFormData] = useState({
    note: "",
    status: 0,
  });
  const [uploadMessage, setUploadMessage] = useState("");
  const statusReasonRef = useRef<HTMLTextAreaElement>(null);
  const [file, setFile] = useState<any>();
  const [fileUrl, setFileUrl] = useState<any>();
  const { slug } = router.query;

  useEffect(() => {
    const getApplication = async () => {
      if (interviewExists && applicantExists) return;
      if (!loading) return;
      try {
        const res = await fetch(`/api/interview/${slug}`);
        if (res.ok) {
          const interview: Interview = await res.json();
          setInterview(interview);
          setInterviewExists(true);

          const checkApplicationExists = await fetch(
            `/api/application/${interview.applicationId}`
          );

          if (checkApplicationExists.ok) {
            setApplication(await checkApplicationExists.json());
          }

          const checkUserExists = await fetch(
            `/api/user/${interview.applicantId}`
          );
          if (checkUserExists.ok) {
            const user = await checkUserExists.json();
            if (isStaffUtil(user!)) {
              setIsStaff(true);
            }
            setApplicant(user);
            setApplicantExists(true);
          } else {
            setApplicantExists(false);
          }
        } else {
          setInterviewExists(false);
        }

        if (interview?.recording_path) {
          const fileRes = await fetch(`/api/stream/${interview.recording_path}`);
          if (fileRes.ok) {
            const { url } = await fileRes.json()
            setFileUrl(url);
          }
        } 
      } catch (error) {
        console.error(error);
        setInterviewExists(false);
        setLoading(false);
      }
      setLoading(false);
    };
    getApplication();
  }, [applicantExists, interviewExists, loading, slug]);

  const claim = async (e: any) => {
    e.preventDefault();

    const now = Date.now();
    let interviewForm: Partial<Interview> = {
      lastUpdate: now,
      updatedById: (user as any).id,
      claimedById: (user as any).id,
    };

    try {
      const response = await fetch("/api/interview/update", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          interview: interviewForm,
          interviewId: (interview as any)._id,
        }),
      });

      if (response.ok) {
        router.reload();
      } else {
        alert(
          "There was an error updating this application. Please try again later."
        );
      }
    } catch (error) {}
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();

    const now = Date.now();
    let interviewForm: Partial<Interview> = {
      lastUpdate: now,
      updatedById: (user as any).id,
      status: formData.status,
      notes:
        formData.note !== ""
          ? [
              ...interview!.notes,
              {
                noteId: interview!.notes.length + 1 + "",
                authorId: (user as any).id,
                timestamp: now,
                text: formData.note,
              },
            ]
          : [...interview!.notes],
    };

    try {
      const response = await fetch("/api/interview/update", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          interview: interviewForm,
          interviewId: (interview as any)._id,
        }),
      });

      if (response.ok) {
        router.reload();
      } else {
        alert(
          "There was an error updating this application. Please try again later."
        );
      }
    } catch (error) {}
  };

  const uploadFile = async (e: any) => {
    e.preventDefault();

    setUploading(true);

    try {
      const filename = `${(interview as any)._id}_${(user as any).id}_${Date.now()}`;
      const newfile = new File([file], filename, { type: `${file.type}` })
      let { data } = await axios.post("/api/interview/upload", {
        name: filename,
        type: newfile.type,
        interviewId: (interview as any)._id,
      });
      
      const url = data.url;
      await fetch(url, {
        method: "PUT",
        headers: {
          "Content-type": file.type,
          "Access-Control-Allow-Origin": "*",
        },
        body: newfile
      })

      setUploading(false);
      setFile(null);
      router.reload();
    } catch (err) {
      console.log(err)
      setUploadMessage(
        "There was an error uploading your file. Please try again later."
      );
      setUploading(false);
    }

    // const form = new FormData();
    // form.append("file", (fileInputRef as any).current.files[0]);
    // form.append("interviewId", (interview as any)._id);
    // try {
    //   const response = await axios.post("/api/interview/upload", form);
    //   setUploadMessage(response.data.message);
    //   router.reload();
    // } catch (error) {
    //   console.error("Error uploading file:", error);
    //   setUploadMessage(
    //     "There was an error uploading your file. Please try again later."
    //   );
    // }
  };

  const handleButtonClick = (statusValue: number) => {
    formData["status"] = statusValue;
  };

  const staffElement = (
    <>
      <div className="flex flex-col relative">
        {interview?.claimedById ? (
          <>
            {((interview.claimedById === (user as any).id &&
              interview.status === 0) ||
              isAdmin(user!!)) && (
              <>
                <form onSubmit={handleSubmit}>
                  <div className="flex flex-row justify-between w-40 mb-6 mt-3">
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
            )}

            {interview?.recording_path ? (
              <>
                <div
                  className={`max-w-lg w-3/6 p-2 mt-2 bg-slate-900 text-white bg-opacity-50 mb-4 rounded-xl`}
                >
                  <h1 className="text-white pl-2 font-semibold mb-3">
                    Interview Recording
                  </h1>
                  <AudioPlayer
                    src={fileUrl}
                  />
                </div>
              </>
            ) : (
              user!.id === interview.claimedById && (
                <>
                  <form onSubmit={uploadFile}>
                    <div
                      className={`max-w-lg w-3/6 p-2 p-4 mt-2 bg-slate-900 text-white bg-opacity-50 mb-4 rounded-xl`}
                    >
                      <h1 className="text-white font-semibold">
                        Interview Recording
                      </h1>
                      <p className="text-sm text-gray-500">
                        Click or Drag & Drop to upload a file.
                      </p>
                      <p className="text-xs italic font-thin text-gray-500">
                        MP3 (Max 500mb)
                      </p>
                      {uploadMessage && (
                        <p className="text-red-500 text-sm">{uploadMessage}</p>
                      )}
                      <div className="border-dashed m-2 mt-5 border-2 border-slate-700">
                        {uploading ? (
                          <Loader center={false} />
                        ) : (
                          <>
                            <input
                              className="block w-full p-8 text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:border-0 file:bg-opacity-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-500"
                              type="file"
                              onChange={(e: any) => setFile(e.target.files[0])}
                              accept="audio/mp3"
                            />
                          </>
                        )}
                      </div>
                    </div>
                    <div className="pl-2">
                      <button
                        className={`max-w-lg text-red-500 bg-opacity-50 mb-4 rounded-xl`}
                        type="submit"
                      >
                        Save
                      </button>
                    </div>
                  </form>
                </>
              )
            )}
          </>
        ) : (
          <>
            <form onSubmit={claim}>
              <div className="flex flex-row justify-between w-40 mb-6 mt-3">
                <button
                  type="submit"
                  className="bg-gradient-to-b from-green-500 to-green-700 text-white font-thin text-sm p-1 px-3 rounded"
                >
                  Claim
                </button>
              </div>
            </form>
          </>
        )}
        {isStaff && (
          <div className="max-w-lg w-3/6">
            <CommentBox
              obj={interview!!}
              author={user as User}
              text="Interview Notes"
            />
          </div>
        )}
      </div>
    </>
  );

  return (
    <>
      {loading ? (
        <Loader />
      ) : interviewExists && applicantExists ? (
        <div className="p-10">
          <div className="flex flex-row">
            <h1 className="text-white text-3xl font-semibold">
              {applicant?.nick
                ? applicant.nick
                : `${applicant?.username}#${applicant?.discriminator}`}
              &apos;s Interview
            </h1>
            <p
              className={`${
                interview?.status === 0
                  ? "text-gray-500"
                  : interview?.status === 1
                  ? "text-green-500"
                  : "text-red-500"
              } text-xl px-5 font-thin`}
            >
              ({convertStatus(interview?.status as number)})
            </p>
          </div>
          <div className="flex flex-row py-2">
          <Link href={`/profile/${((applicant as any)._id)}`} passHref={true}>
            <div className="flex flex-row">
            <h1 className="text-white font-semibold">{`${applicant?.username}#${applicant?.discriminator}`}</h1>
            <p className="text-white font-thin italic px-2">
              ({(applicant as any)._id})
            </p>
            </div>
            </Link>
            <p className="text-white font-semibold italic px-2">
              Age:{" "}
              {application?.sections[0]?.questions[0]?.response?.value || 0}
            </p>
            <p className="text-white font-semibold italic px-2">
              {applicant?.email}
            </p>
            <p className="text-white font-thin px-2">
              <span className="font-semibold">Created: </span>
              {moment
                .unix(interview!!.creationDate / 1e3)
                .format("MMMM Do YYYY, h:mm:ss A")}
            </p>
          </div>
          <div className="flex flex-col">
            <div className="flex flex-row flex-wrap justify-between max-w-xl">
              <div className="space-y-1">
                {interview!.claimedById && (
                  <h1 className="text-gray-400 font-thin">
                    Claimed By:{" "}
                    <Link href={`/profile/${interview?.claimedById}`}>
                      {interview?.claimedById}
                    </Link>
                  </h1>
                )}

                {isStaff && (
                  <>
                    <h1 className="text-gray-400 font-thin">
                      Last modified by:{" "}
                      <Link href={`/profile/${interview?.updatedById}`}>
                        {interview?.updatedById}
                      </Link>
                    </h1>
                    <h1 className="text-gray-400 font-thin">
                      Last updated:{" "}
                      {moment
                        .unix(interview!!.lastUpdate / 1e3)
                        .format("MMMM Do YYYY, h:mm:ss A")}
                    </h1>
                  </>
                )}
              </div>

              {application && (
                <div className="space-y-1">
                  <>
                    <p className="text-gray-400 font-thin">
                      Application:{" "}
                      <Link
                        className={`${
                          application?.status === 0
                            ? "text-gray-400"
                            : application?.status === 1
                            ? "text-green-500"
                            : "text-red-500"
                        } font-thin`}
                        href={`/applications/${(application as any)._id}`}
                      >
                        {convertStatus((application as any)?.status)}
                      </Link>
                    </p>
                  </>
                </div>
              )}
            </div>
            {isStaff && <div className="flex flex-col">{staffElement}</div>}
          </div>
          {interview?.reason && (
            <>
              <div className="p-6 my-4 max-w-4xl bg-slate-700 backdrop-blur-3xl bg-opacity-50 text-white rounded-xl shadow-md items-center space-x-1 backdrop-blur">
                <h1 className="text-white font-semibold text-sm">
                  Decision Reasoning
                </h1>
                <p className="text-gray-400 font-thin text-sm">
                  {interview?.reason}
                </p>
              </div>
            </>
          )}
        </div>
      ) : (
        <div className="h-screen flex justify-center items-center">
          <h1 className="text-white">This interview does not exist.</h1>
        </div>
      )}
    </>
  );
}

export const getServerSideProps: GetServerSideProps =
  withSession(developerRoute);
