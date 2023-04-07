import { ObjectId } from "mongodb";
import { GetServerSideProps } from "next";
import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import React, { ChangeEvent, useEffect, useState } from "react";
import NoSidebar from "src/components/no-auth-layout";
import { User } from "src/types";
import { developerRoute } from "src/util/redirects";
import { withSession } from "src/util/session";
import { Application, STATUS } from "src/types";

interface Props {
  user?: User;
}

export default function DiscordAuth({ user }: Props) {
  const router = useRouter();
  type FormField = {
    label: string;
    name: string;
    type: string;
  };

  type FormSection = {
    title: string;
    id: string;
    fields: FormField[];
  };

  type FormStructure = {
    [key: number]: FormSection;
  };

  type FormFields = {
    age: string;
    motivation: string;
    otherServers: string;
    question1: string;
    question2: string;
    question3: string;
    question4: string;
    question5: string;
    metagaming: string;
    forceRP: string;
    powergaming: string;
    priority: string;
    passiveRP: string;
    agreement1: boolean;
    agreement2: boolean;
    acknowledgement: string;
  };

  const [formData, setFormData] = useState({
    age: "",
    motivation: "",
    otherServers: "",
    question1: "",
    question2: "",
    question3: "",
    question4: "",
    question5: "",
    metagaming: "",
    forceRP: "",
    powergaming: "",
    priority: "",
    passiveRP: "",
    agreement1: false,
    agreement2: false,
    acknowledgement: "",
  });
  const [statusMessage, setStatusMessage] = useState<String | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const [validationStatus, setValidationStatus] = useState<
    Partial<Record<keyof FormFields, boolean>>
  >({});
  const hasValidationErrors = () => {
    const currentSectionFields = formStructure[currentStep].fields;
    return currentSectionFields.some(
      (field) => !(validationStatus as any)[field.name]
    );
  };

  function setPropertySafe<T, K extends keyof T>(
    obj: T,
    key: K,
    value: T[K]
  ): T {
    return { ...obj, [key]: value };
  }

  const formStructure: FormStructure = {
    1: {
      title: "Section 1 - Preliminary Questions",
      id: "section1",
      fields: [
        {
          label: "Age",
          name: "age",
          type: "number",
        },
        {
          label: "Why do you want to be a staff member on PGN?",
          name: "motivation",
          type: "textarea",
        },
        {
          label:
            "Have you been a staff member on any other public servers? If yes, please list the server(s) and your role in them",
          name: "otherServers",
          type: "textarea",
        },
      ],
    },
    2: {
      title: "Section 2 - Scenario Questions",
      id: "section2",
      fields: [
        {
          label: "How would you deal with someone VDMing people on the server?",
          name: "question1",
          type: "textarea",
        },
        {
          label:
            "You have teleported someone to you to discuss their behaviour and they start being very abusive to you. How would you handle this?",
          name: "question2",
          type: "textarea",
        },
        {
          label:
            "Whilst trying to explain to someone why their conduct was incorrect, they promptly log off the server. You then see them playing again later on, what would you do?",
          name: "question3",
          type: "textarea",
        },
        {
          label:
            "You receive a report that someone is breaking rules but when you no clip over to the scene, they do not appear to be doing anything wrong. What would you do in this situation?",
          name: "question4",
          type: "textarea",
        },
        {
          label:
            "You receive a report that a player is RDMing, when you arrive on the scene you see a player shooting randomly. After teleporting them away to speak to them, they explain that someone was shooting at them first. How would you handle this?",
          name: "question5",
          type: "textarea",
        },
      ],
    },
    3: {
      title: "Section 3 - Roleplay Knowledge",
      id: "section3",
      fields: [
        {
          label:
            "What is metagaming? (Please give a description and at least 1 example)",
          name: "metagaming",
          type: "textarea",
        },
        {
          label:
            "What is ForceRP  (Please give a description and at least 1 example)",
          name: "forceRP",
          type: "textarea",
        },
        {
          label:
            "What is Powergaming? (Please give a description and at least 1 example)",
          name: "powergaming",
          type: "textarea",
        },
        {
          label:
            "What is considered a priority? (Please give a description and at least 1 example)",
          name: "priority",
          type: "textarea",
        },
        {
          label:
            "What is Passive RP?  (Please give a description and at least 1 example)",
          name: "passiveRP",
          type: "textarea",
        },
      ],
    },
    4: {
      title: "Section 4 - Acknowledgements",
      id: "section4",
      fields: [
        {
          label:
            'Due to a high volume of applicants it may take up to a month to respond to your application. If you understand this, please type the word "Acknowledged" below. ',
          name: "acknowledgement",
          type: "textarea",
        },
        {
          label: "Do you agree to abide by and uphold the rules of PGN?",
          name: "agreement1",
          type: "checkbox",
        },
        {
          label:
            "Do you understand that asking about your application status may lead to your application being rejected?",
          name: "agreement2",
          type: "checkbox",
        },
      ],
    },
  };

  const [currentStep, setCurrentStep] = useState(1);

  const handleChange = (event: any) => {
    const { name, value } = event.target;
    setFormData((prevState) => ({ ...prevState, [name]: value }));
    handleValidation(event); // Call handleValidation function here
  };

  const handleValidation = (event: any) => {
    const { name, value } = event.target;
    setValidationStatus((prevState) =>
      setPropertySafe(
        prevState,
        name as keyof FormFields,
        validateField(name as keyof FormFields, value)
      )
    );
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsSubmitting(true)

    // Check for any validation errors
    if (hasValidationErrors()) {
      setStatusMessage(
        "Please fill out each form correctly then try again..."
      );
      return;
    }

    // Convert form data to the Application structure
    const now = Date.now();
    const application: Application = {
      applicantId: user!!.id,
      status: STATUS.PENDING,
      statusReason: undefined,
      updatedById: user!!.id,
      submissionDate: now,
      lastUpdate: now,
      sections: formStructureToQuestions(formData),
      notes: [
        {
          noteId: "0",
          authorId: user!!.id,
          timestamp: now,
          text: "Application Submitted...",
        },
      ],
      interviewId: undefined,
    };

    // Submit the application
    try {
      const response = await fetch("/api/application/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(application),
      });

      if (response.ok) {
        router.push(`/applications/${(await response.json()).application._id}`);
      } else {
        setStatusMessage((await response.json()).message);
      }
    } catch (error: any) {
      console.error("Error submitting the application:", error);
      setStatusMessage(
        "There was an error submitting your application. Please try again later." +
          error.message
      );
    }
    setIsSubmitting(false);
  };

  const formStructureToQuestions = (
    formData: FormFields
  ): {
    sectionId: string;
    sectionText: string;
    questions: {
      questionId: string;
      questionText: string;
      responseType: string;
      choices: [{ choiceId: string; choiceText: string }] | undefined;
      response: { value: string; choiceId: string | undefined };
    }[];
  }[] => {
    const sections = [];
    for (const section of Object.values(formStructure)) {
      const questions = [];
      for (const field of section.fields) {
        if (field.name === "agreement1" || field.name === "agreement2") continue; 
        questions.push({
          questionId: field.name,
          questionText: field.label,
          responseType: field.type,
          choices: undefined, // Add choices if needed
          response: {
            value: formData[field.name as keyof FormFields] as string,
            choiceId: undefined, // Add choiceId if needed
          },
        });
      }
      sections.push({
        sectionId: section.id,
        sectionText: section.title,
        questions: questions,
      });
    }
    return sections;
  };

  const nextStep = () => {
    if (currentStep < 4) setCurrentStep(currentStep + 1);
  };

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const validateField = (name: any, value: any) => {
    if (name === 'age') {
      if (isNaN(value)) return false;
      if (value < 0) return false;
      if (value > 99) return false;
      if (value % 1 != 0) return false;
    }

    if (name === 'acknowledgement') {
      if (value.toLowerCase() !== 'acknowledged') return false;
    }
    if (value.trim() === "") {
      return false;
    }
    // Add more field validation cases here as needed
    return true;
  };

  const bannerStyle = {
    backgroundImage: `url(${user?.banner}?size=4096)`,
    backgroundRepeat: "no-repeat",
    backgroundSize: "cover",
    backgroundBlendMode: "multiply",
  };

  const renderStep = (step: any) => {
    const section = formStructure[step];

    if (!section) {
      return null;
    }

    return (
      <div key={step} className="p-4 items-center w-full rounded space-y-4">
        <h2 className="text-white text-xl font-bold  bg-slate-900 backdrop-blur-3xl bg-opacity-50 p-5 rounded">
          {section.title}
        </h2>

        <div>
          {section.fields.map((field) => (
            <div
              key={field.name}
              className="mb-4 bg-slate-900 backdrop-blur-3xl bg-opacity-50 p-5 rounded-xl"
            >
              <label htmlFor={field.name} className="text-white">
                {field.label}
              </label>
              {field.type === "textarea" ? (
                <textarea
                  id={field.name}
                  name={field.name}
                  value={(formData as any)[field.name]}
                  onChange={handleChange}
                  onBlur={handleValidation}
                  placeholder="Your response.."
                  className={`w-full p-2 mt-2 bg-slate-700 text-white bg-opacity-0 rounded ${
                    !(validationStatus as any)[field.name]
                      ? "border-red-500"
                      : ""
                  }`}
                  rows={4}
                  required
                />
              ) : field.type === "input" ? (
                <input
                  type={field.type}
                  id={field.name}
                  name={field.name}
                  value={(formData as any)[field.name]}
                  onChange={handleChange}
                  onBlur={handleValidation}
                  className={`w-full p-2 mt-2 bg-slate-700 text-white bg-opacity-50 rounded ${
                    !(validationStatus as any)[field.name]
                      ? "border-red-500"
                      : ""
                  }`}
                  required
                />
              ) : (
                <input
                  type={field.type}
                  id={field.name}
                  name={field.name}
                  value={(formData as any)[field.name]}
                  onChange={handleChange}
                  onBlur={handleValidation}
                  placeholder="Your response.."
                  className={`flex flex-column p-2 mt-2 bg-slate-700 text-white bg-opacity-0 rounded ${
                    !(validationStatus as any)[field.name]
                      ? "border-red-500"
                      : ""
                  }`}
                  required
                />
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <>
      {!user && (
        <div className="w-screen h-screen flex justify-center items-center">
          <div className="p-6 max-w-sm bg-slate-900 backdrop-blur-3xl bg-opacity-50 rounded-xl shadow-md items-center space-x-1 backdrop-blur">
            <div className="flex-shrink-0 flex justify-center items-center">
              <Image
                src={`https://brandlogos.net/wp-content/uploads/2021/11/discord-logo.png`}
                height={56}
                width={56}
                alt="Discord Logo"
              ></Image>
            </div>
            <Link href="/api/auth/login" passHref>
              <button className="px-6 py-2 text-sm justify-start items-start text-white bg-indigo-500 backdrop-blur-3xl bg-opacity-50 font-bold rounded-full border border-indigo-500 hover:bg-indigo-500 hover:text-gray-50 hover:border-transparent focus:outline-none focus:ring-2 focus:ring-5555dd-200 focus:ring-offset-2">
                Login with Discord to Apply
              </button>
            </Link>
          </div>
        </div>
      )}
      {user && (
        <>
          <div className="flex flex-col">
            <div
              className="flex flex-row flex-col max-h-48 items-center"
              style={bannerStyle}
            >
              <div className="h-64 min-h-full"></div>
              <div className="h-32 min-h-full w-64 min-w-full bg-slate-900 backdrop-blur-3xl bg-opacity-50 flex items-center border-b-8 border-slate-900">
                <div className="px-8">
                  <p className="text-center text-xl font-semibold text-white">
                    {`${user.username}#${user.discriminator}`}
                    <span className="font-light text-sm pl-2 italic">
                      ({user.id})
                    </span>
                  </p>
                </div>
              </div>
              <Image
                className="rounded-full absolute my-20 border-t-4 border-r-4 border-l-4 border-slate-900"
                src={user.avatar + "?size=512"}
                alt="User Avatar"
                height={175}
                width={175}
              />
              <div className="w-full bg-slate-900 backdrop-blur-3xl bg-opacity-50"></div>
            </div>
          </div>
          <div className="flex flex-col items-center p-20">
            <div className="w-2/5 items-center rounded-xl space-y-6">
              <div className="flex flex-col items-center w-full">
                <h1 className="text-white text-2xl font-bold mb-6">
                  PGN: Underground - Staff Application
                </h1>
                {statusMessage ? (
                  <p className="text-sm text-red-500 font-thin">
                    {statusMessage}
                  </p>
                ) : (
                  <></>
                )}
                <form onSubmit={handleSubmit}>
                  <div className="flex flex-col items-center w-full">
                    {renderStep(currentStep)}
                    <div className="flex items-center justify-between w-full">
                      <button
                        type="button"
                        onClick={prevStep}
                        disabled={currentStep === 1}
                        className={`py-2 px-4 rounded text-white ${
                          currentStep === 1
                            ? "bg-slate-700 text-gray-500"
                            : "bg-slate-500 hover:bg-slate-400"
                        }`}
                      >
                        Previous Page
                      </button>
                      {currentStep === 4 ? (
                        <button
                          type="submit"
                          className="py-2 px-4 bg-green-500 hover:bg-green-400 text-white rounded"
                          disabled={isSubmitting}
                        >
                          Submit Application
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={nextStep}
                          disabled={hasValidationErrors()}
                          className={`py-2 px-4 bg-blue-500 ${
                            hasValidationErrors()
                              ? "bg-opacity-50 cursor-not-allowed text-gray-500"
                              : "hover:bg-blue-400"
                          } text-white rounded`}
                        >
                          Next Page
                        </button>
                      )}
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}

DiscordAuth.getLayout = function (page: any) {
  return <NoSidebar>{page}</NoSidebar>;
};

export const getServerSideProps: GetServerSideProps =
  withSession(developerRoute);
