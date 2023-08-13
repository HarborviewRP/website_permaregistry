import { HiBan, HiCheck, HiOutlineClipboardList, HiX } from "react-icons/hi";
import { HiOutlineBookOpen } from "react-icons/hi";
import { HiOutlineClock } from "react-icons/hi";
import { HiOutlineExclamationCircle } from "react-icons/hi";
import moment from "moment";
import { GetServerSideProps } from "next";
import { Document } from 'react-pdf';

import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import Loader from "src/components/Loader";
import {
  DeathReg,
  FormType,
  Interview,
  User,
} from "src/types";
import { developerRoute } from "src/util/redirects";
import { withSession } from "src/util/session";
import { useRef } from "react";
import Link from "next/link";
import { isAdmin, isStaff as isStaffUtil } from "src/util/permission";
import { Page } from "react-pdf";
interface Props {
  user?: User;
}

export default function MainPage({ user }: Props) {
  const router = useRouter();
  const [reg, setReg] = useState<DeathReg | null>(null);
  const [regExists, setRegExists] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [certFile, setCertFile] = useState<any>();

  const { slug } = router.query;

  useEffect(() => {
    const getReg = async () => {    
      try {
        const res = await fetch(`/api/registry/${slug}`);
        if (res.ok) {
          const reg: DeathReg = await res.json();
          setReg(reg);
          setRegExists(true);
          if (reg?.cert) {
              const fileRes = await fetch(
                  `/api/stream/${reg.cert}`
                  );
            if (fileRes.ok) {
              const { url } = await fileRes.json();
              setCertFile(url);
            }
          }
          setLoading(false);
        } else {
          setRegExists(false);
          setLoading(false);
        }
      } catch (error) {
        console.error(error);
        setRegExists(false);
        setLoading(false);
      }
    };
    if (loading){
        getReg();
    }
    
  }, [regExists, loading, slug]);

  return (
    <>
      {loading ? (
        <Loader />
      ) : regExists ? (
        <div className="p-10 flex flex-col h-full">
            <div className="mb-6 bg-white p-4 rounded shadow-lg">
                <h1 className="text-black font-bold text-xl mb-2">Name: <span className="font-normal">{reg?.name}</span></h1>
                <p className="text-black text-sm mb-1">CSN: {reg?.csn}</p>
                <p className="text-black text-sm mb-1">Date of Birth: {new Date(reg!!.dob).toLocaleDateString()}</p>
                <p className="text-black text-sm mb-1">Date of Death: {new Date(reg!!.dod).toLocaleDateString()}</p>
                <p className="text-black text-sm mb-4">Record Number: HRP-PD-{(reg!! as any)._id}</p>
                <h2 className="text-black font-bold text-lg mb-2">Certificate File:</h2>
                    <iframe src={certFile} width="100%" height="1200px" className="border rounded" />
            </div>
        </div>
      ) : (
        <div className="pt-10 flex justify-center items-center">
          <h1 className="text-black">This registration does not exist.</h1>
        </div>
      )}
    </>
  );
}

export const getServerSideProps: GetServerSideProps =
  withSession(developerRoute);
