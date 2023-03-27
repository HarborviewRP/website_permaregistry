import { Menu } from "@headlessui/react";
import { HiBan, HiOutlineClipboardList, HiX } from "react-icons/hi";
import { HiOutlineBookOpen } from "react-icons/hi";
import { HiOutlineClock } from "react-icons/hi";
import { HiOutlineExclamationCircle } from "react-icons/hi";
import moment from "moment";
import { GetServerSideProps } from "next";

import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import CommentBox from "src/components/application/CommentBox";
import Loader from "src/components/Loader";
import {
  Application,
  convertStatus,
  DISCORD,
  Interview,
  STATUS,
  User,
} from "src/types";
import { developerRoute } from "src/util/redirects";
import { withSession } from "src/util/session";
import { useRef } from "react";
import Link from "next/link";
import { isAdmin, isStaff as isStaffUtil } from "src/util/permission";
interface Props {
  user?: User;
}

export default function MainPage({ user }: Props) {
  const router = useRouter();
  const [application, setApplication] = useState<Application | null>(null);
  const [interview, setInterview] = useState<Interview | null>(null);
  const [applicationExists, setApplicationExists] = useState<boolean>(false);
  const [applicant, setApplicant] = useState<User | null>(null);
  const [applicantExists, setApplicantExists] = useState<boolean>(false);
  const [isStaff, setIsStaff] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [formData, setFormData] = useState({
    statusReason: "",
    status: 0,
  });
  const statusReasonRef = useRef<HTMLTextAreaElement>(null);

  const { slug } = router.query;

  const rejectionOptions = [
    {
      name: "Lack of Detail",
      reason:
        "Thank you for your interest in becoming a staff member on PGN:U. Unfortunately, we cannot accept your application at this time due to a lack of detail. When writing a staff application, it is important to include as much detail as possible and put effort into the application. We are looking to understand more about yourself and why you choose the routes you take during scenarios as a staff member. The best applications are those that take time and effort to write. We appreciate your interest in serving the community and encourage you to take this feedback into consideration when reapplying in 2 weeks from now. Thank you again for your interest, and we wish you the best in your future endeavors.",
      icon: HiOutlineClipboardList,
    },
    {
      name: "Lack of Knowledge",
      reason:
        "Thank you for your interest in becoming a staff member on PGN:U. Unfortunately, we cannot accept your application at this time because we believe that you do not have enough knowledge of the community's rules, guidelines, and values. We encourage you to take this time to learn more about the community and its values and consider reapplying when you feel more prepared. Thank you again for your interest, and we wish you the best in your future endeavors.",
      icon: HiOutlineBookOpen,
    },
    {
      name: "Applied too soon",
      reason:
        "Thank you for your interest in becoming a staff member on PGN:U. Unfortunately, we cannot accept your application at this time because you have applied within the last 2 weeks. We encourage you to take this time to develop your skills and consider reapplying when the time is right. Thank you again for your interest, and we wish you the best in your future endeavors.",
      icon: HiOutlineClock,
    },
    {
      name: "Underaged",
      reason:
        "Thank you for your interest in becoming a staff member on PGN:U. Unfortunately, we cannot accept your application at this time because you do not meet the minimum age requirement for the position. We appreciate your interest in serving the community and encourage you to consider applying again when you meet the age requirement. Thank you again for your interest, and we wish you the best in your future endeavors",
      icon: HiBan,
    },
    {
      name: "Catch-All",
      reason:
        "Thank you for your interest in becoming a staff member on PGN:U. Unfortunately, we cannot accept your application at this time. We received many qualified applications and had to make some tough decisions. We encourage you to continue to contribute positively to the community and develop your skills. Please feel free to reapply in 2 weeks from now. Thank you again for your interest, and we wish you the best in your future endeavors",
      icon: HiX,
    },
  ];

  useEffect(() => {
    if (!user) router.push("/");
  });

  useEffect(() => {
    const getApplication = async () => {
      if (applicationExists && applicantExists) return;
      if (!loading) return;
      try {
        const res = await fetch(`/api/application/${slug}`);
        if (res.ok) {
          const application: Application = await res.json();
          setApplication(application);
          setApplicationExists(true);

          const checkInterviewExists = await fetch(
            `/api/interview/${application.interviewId}`
          );

          if (checkInterviewExists.ok) {
            setInterview(await checkInterviewExists.json());
          }

          const checkUserExists = await fetch(
            `/api/user/${application.applicantId}`
          );
          if (checkUserExists.ok) {
            const user = await checkUserExists.json();
            if (isStaffUtil(user)) {
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
    let applicationForm: Partial<Application> = {
      lastUpdate: now,
      updatedById: (user as any)._id,
      status: formData.status,
      statusReason:
        formData.statusReason === "" ? undefined : formData.statusReason,
    };

    try {
      if (formData.status === STATUS.ACCEPTED && !application?.interviewId) {
        const interview: Interview = {
          applicationId: (application as any).id,
          applicantId: application!!.applicantId,
          creationDate: Date.now(),
          status: STATUS.PENDING,
          updatedById: (user as any).id,
          lastUpdate: Date.now(),
          claimedById: undefined,
          reason: undefined,
          notes: [
            {
              noteId: "0",
              authorId: user!!.id,
              timestamp: now,
              text: "Interview created...",
            },
          ],
          recording_path: undefined,
        };

        const res = await fetch("/api/interview/create", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(interview),
        });

        if (res.ok) {
          const response = await res.json();
          applicationForm = {
            ...applicationForm,
            interviewId: response.interview._id,
          };
        }
      }

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
    } catch (error) {
      console.error("An error occurred:", error);
    }
  };

  const handleButtonClick = (statusValue: number) => {
    formData["status"] = statusValue;
  };

  const staffElement = (
    <>
      <form onSubmit={handleSubmit}>
        <div className="flex flex-row relative">
          <textarea
            ref={statusReasonRef}
            id="statusSeason"
            name="statusReason"
            onChange={(e) => (formData["statusReason"] = e.target.value)}
            placeholder="Decision reasoning..."
            className={`max-w-lg w-1/4 p-2 mt-2 bg-slate-700 text-white bg-opacity-50 mb-4 rounded`}
            rows={4}
          />
          <div className="pt-2 px-12 flex flex-col">
            <div>
              <Menu>
                <Menu.Button className="py-1 bg-slate-700 bg-opacity-50 text-white font-thin text-sm p-1 px-4 py-3 rounded">
                  Rejection Options
                </Menu.Button>
                <Menu.Items className="text-white z-50 flex flex-col py-6 px-3 my-4 absolute bg-slate-700 backdrop-blur-sm bg-opacity-25 text-white rounded-xl space-y-2 font-thin transition-all duration-300  transform -translate-x-4">
                  {rejectionOptions.map((option) => (
                    <Menu.Item key={option.reason}>
                      {({ active }) => (
                        <button
                          className={`flex items-center text-left w-full ${
                            active && "text-gray-400"
                          }`}
                          onClick={() => {
                            statusReasonRef.current!!.value = option.reason;
                            formData["statusReason"] = option.reason;
                          }}
                        >
                          <option.icon className="mr-2" />
                          {option.name}
                        </button>
                      )}
                    </Menu.Item>
                  ))}
                </Menu.Items>
              </Menu>
            </div>
          </div>
        </div>
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
              <CommentBox obj={application!!} />
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
              Age:{" "}
              {application?.sections[0]?.questions[0]?.response?.value || 0}
            </p>
            <p className="text-white font-semibold italic px-2">
              {applicant?.email}
            </p>
            <p className="text-white font-thin px-2">
              <span className="font-semibold">Submitted: </span>
              {moment
                .unix(application!!.submissionDate / 1e3)
                .format("MMMM Do YYYY, h:mm:ss A")}
            </p>
          </div>
          <div className="flex flex-col">
            <div className="flex flex-row flex-wrap justify-between max-w-xl">
              {isStaff && (
                <>
                  <h1 className="text-gray-400 font-thin pb-2">
                    Last modfied by: {application?.updatedById}
                  </h1>
                  <h1 className="text-gray-400 font-thin ">
                    Last updated:{" "}
                    {moment
                      .unix(application!!.lastUpdate / 1e3)
                      .format("MMMM Do YYYY, h:mm:ss A")}
                  </h1>
                </>
              )}
              {interview && (
                    <p className="text-gray-400 font-thin">
                    Interview:{" "}
                    <Link
                      className={`${
                        interview?.status === 0
                          ? "text-gray-400"
                          : interview?.status === 1
                          ? "text-green-500"
                          : "text-red-500"
                      } font-thin`}
                      href={`/interviews/${(interview as any)._id}`}
                    >
                      {convertStatus((interview as any)?.status)}
                    </Link>
                  </p>
              )}
            </div>
            {isStaff && (
              <>
                <div className="flex flex-col">
                  {application!!.status === 0
                    ? staffElement
                    : isAdmin(user!!) && staffElement}
                </div>
              </>
            )}
          </div>
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
            {application?.sections.map((section) => (
              <div key={section.sectionId}>
                <h1 className="text-white font-semibold text-xl pt-6">
                  {section.sectionText}
                </h1>
                {section.questions
                  .filter((question: any) => question.questionId !== "age")
                  .map((question) => (
                    <div
                      key={question.questionId}
                      className="p-6 my-4 max-w-4xl bg-slate-900 backdrop-blur-3xl bg-opacity-50 text-white rounded-xl shadow-md items-center space-x-1 backdrop-blur"
                    >
                      <h1 className="text-white font-semibold text-sm">
                        {question.questionText}
                      </h1>
                      <p className="text-gray-400 font-thin text-sm">
                        {question.response?.value}
                      </p>
                    </div>
                  ))}
              </div>
            ))}
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
