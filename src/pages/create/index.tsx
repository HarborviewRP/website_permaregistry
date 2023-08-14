import { ObjectId } from "mongodb";
import { GetServerSideProps } from "next";
import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import React, { ChangeEvent, useEffect, useState } from "react";
import NoSidebar from "src/components/no-auth-layout";
import { DISCORD, DeathReg, User } from "src/types";
import { developerRoute } from "src/util/redirects";
import { withSession } from "src/util/session";
import { Application, STATUS } from "src/types";
import { isUndefined } from "util";
import Loader from "src/components/Loader";
import LoginBox from "src/components/user/login";
import { isStaff } from "src/util/permission";
import axios from "axios";
import { INFRA_SECRET, INFRA_URL } from "src/util/discord";

interface Props {
  user?: User;
  session?: any;
}

export default function DiscordAuth({ session }: Props) {
  const [user, setUser] = useState<User | undefined>(undefined);
  const [checked, setChecked] = useState<boolean>(false);

  const fetchSession = async () => {
    if (user) return; // prevent spamming API
    try {
      const res = await fetch("/api/auth/session");
      const userData = await res.json();
      if (userData.id) {
        setUser(userData);
        setChecked(true);
      }
    } catch (err) {
      console.error("Failed to fetch session:", err);
    }
  };

  useEffect(() => {
    if (user && !isStaff(user)) {
      router.push("/")
    }
    fetchSession();
  }, []);

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
    firstlast: string;
    dob: string;
    csn: string;
    dod: string;
    certfile: string;
    incfile: string;
  };

  const [formData, setFormData] = useState({
    firstlast: "",
    dob: "",
    csn: "",
    dod: "",
    certfile: "",
  });
  const [statusMessage, setStatusMessage] = useState<String | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [deathCertFile, setDeathCertFile] = useState<any>();
  const [deathCertFileUploading, setDeathCertFileUploading] = useState<boolean>(false);

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
      title: "Perma Death Registration",
      id: "section1",
      fields: [
        {
          label: "First and Last Name",
          name: "firstlast",
          type: "text",
        },
        {
          label: "Date of Birth",
          name: "dob",
          type: "date",
        },
        {
          label:
            "CSN (Exactly as written!)",
          name: "csn",
          type: "text",
        },
        {
          label: "Date of Death",
          name: "dod",
          type: "date",
        },
        {
          label:
            "Death Certificate",
          name: "certlink",
          type: "certfile",
        }
      ],
    }
  };

  const [currentStep, setCurrentStep] = useState(1);

  const handleChange = (event: any) => {
    const { name, value } = event.target;
    setFormData((prevState) => ({ ...prevState, [name]: value }));
    localStorage.setItem('formData', JSON.stringify(formData))
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
    setIsSubmitting(true);

    // Check for any validation errors
    // if (hasValidationErrors()) {
    //   setStatusMessage("Please fill out each form correctly then try again...");
    //   return;
    // }

    if (!deathCertFile) {
      setStatusMessage("Please upload a death certificate!");
      return;
    }

    // Convert form data to the Application structure
    const reg: Partial<DeathReg> = {
      name: formData.firstlast,
      dob: formData.dob,
      csn: formData.csn,
      dod: formData.dod,
    };

    // Submit the application
    try {
      const filename = `${reg.csn}_deathcert_${Date.now()}`;
      const newfile = new File([deathCertFile], filename, { type: `${deathCertFile.type}` });
      let { data } = await axios.post("/api/registry/upload", {
        name: filename,
        type: newfile.type,
        inctype: 'certificate'
      });

      const url = data.url;
      await fetch(url, {
        method: "PUT",
        headers: {
          "Content-type": deathCertFile.type,
          "Access-Control-Allow-Origin": "*",
        },
        body: newfile,
      });

      reg.cert = filename;
      const response = await fetch("/api/registry/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(reg),
      });

      if (response.ok) {
        router.push(`/registry/${(await response.json()).application._id}`);
        localStorage.setItem('formData', '{}') // clear local storage
      } else {
        setIsSubmitting(false);
        setStatusMessage((await response.json()).message);
      }
    } catch (error: any) {
      console.error("Error submitting the registration:", error);
      setStatusMessage(
        "There was an error submitting your registration. Please try again later." +
          error.message
      );
    }
    setIsSubmitting(false);
  };

  const validateField = (name: any, value: any) => {
    if (value.trim() === "") {
      return false;
    }
    // Add more field validation cases here as needed
    return true;
  };

  const renderStep = (step: any) => {
    const section = formStructure[step];

    if (!section) {
      return null;
    }

    return (
      <div key={step} className="w-full rounded space-y-4">
        <h2 className="text-black text-xl font-bold rounded">
          {section.title}
        </h2>

        <div>
          {section.fields.map((field) => (
            <div
              key={field.name}
              className=" p-4 rounded"
            >
              <label htmlFor={field.name} className="text-black">
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
                  className={`w-full p-2 mt-2 bg-black text-black bg-opacity-20 rounded ${
                    !(validationStatus as any)[field.name]
                      ? "border-red-500"
                      : ""
                  }`}
                  rows={4}
                  required
                />
              ) : field.type === "certfile" ? (
                deathCertFileUploading ? (
                  <Loader center={false} />
                ) : (
                <input
                  type="file"
                  id={field.name}
                  name={field.name}
                  onChange={(e: any) => setDeathCertFile(e.target.files[0])}
                  accept="application/pdf,application/vnd.ms-excel"
                  className={`w-full p-2 mt-2 bg-black text-black bg-opacity-20 rounded ${
                    !(validationStatus as any)[field.name]
                      ? "border-red-500"
                      : ""
                  }`}
                  required
                />
                )
                
              ) : field.type === "input" ? (
                <input
                  type={field.type}
                  id={field.name}
                  name={field.name}
                  value={(formData as any)[field.name]}
                  onChange={handleChange}
                  onBlur={handleValidation}
                  className={`w-full p-2 mt-2 bg-black text-black bg-opacity-20 rounded ${
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
                  className={`w-full p-2 mt-2 bg-black text-black bg-opacity-20 rounded ${
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
      {user && (
        <>
          <div className="flex flex-col items-center p-8">
            <div className="items-center rounded-xl space-y-6">
              <div className="flex flex-col items-center w-full">
                {!checked ? <div><Loader center={false}/> </div>: <>
                {statusMessage ? (
                  <div className="flex flex-col text-center">
                    <h1 className="text-lg font-semibold text-red-700">
                      You are unable to submit a death registration!
                    </h1>
                    <p className="text-sm text-red-500 font-thin">
                      {statusMessage}
                    </p>
                  </div>
                ) : (
                  isSubmitting ? (
                    <>
                      <h1>Submitting...</h1>
                      <Loader center={false}/>
                    </>
                  ) : (
                    <form onSubmit={handleSubmit}>
                    {renderStep(currentStep)}
                    <div className="flex items-right justify-between w-full">
                      <button
                        type="submit"
                        className="py-2 px-4 bg-green-500 hover:bg-green-400 text-white rounded"
                        disabled={isSubmitting}
                      >
                        Submit Registration
                      </button>
                    </div>
                  </form>
                  )
                )}</>}
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
