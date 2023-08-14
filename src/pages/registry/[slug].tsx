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
  DeathRegWithId,
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
import axios from "axios";
interface Props {
  user?: User;
}

export default function MainPage({ user }: Props) {
  const router = useRouter();
  const [reg, setReg] = useState<DeathRegWithId | null>(null);
  const [regExists, setRegExists] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [certFile, setCertFile] = useState<any>();
  const [confirm, setconfirm] = useState<boolean>(false);
  const [confirmMsg, setConfirmMsg] = useState<String>("Click again to confirm!");

  const { slug } = router.query;

  useEffect(() => {
    const getReg = async () => {    
      try {
        const res = await fetch(`/api/registry/${slug}`);
        if (res.ok) {
          const reg: DeathRegWithId = await res.json();
          setReg(reg);
          setRegExists((isAdmin(user!!) && (reg.reverted != null && reg.reverted)) || (reg.reverted == null || !reg.reverted));
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

  const confirmed = async () => {
    setconfirm(true);
    if (confirm) {
      setLoading(true);
      try {
        const res = await axios.delete(`/api/registry/${reg?._id}`)
        if (res.status != 200) {
          setLoading(false);
          setConfirmMsg("There was an error processing your request...");
          console.log(res.data);
          return;
        }
      } catch (err) {
        setLoading(false);
        setConfirmMsg("There was an error processing your request...");
        console.log(err);
        return;
      }
      router.push('/registry');
    }
  }

  return (
    <>
      {loading ? (
        <Loader />
      ) : regExists ? (
        <div className="p-10 flex flex-col h-full">
            <div className="mb-6 bg-white p-4 rounded shadow-lg">
                <div className="flex flex-row">
                <h1 className="text-black font-bold text-xl mb-2">Name: <span className="font-normal">{reg?.name}</span></h1>
                {reg?.reverted && (
                  <p className="text-red-500 font-bold text-xl px-4">REVERTED BY ADMIN</p>
                )}
                </div>
                <p className="text-black text-sm mb-1">CSN: {reg?.csn}</p>
                <p className="text-black text-sm mb-1">Date of Birth: {new Date(reg!!.dob).toLocaleDateString()}</p>
                <p className="text-black text-sm mb-1">Date of Death: {new Date(reg!!.dod).toLocaleDateString()}</p>
                <p className="text-black text-sm mb-4">Record Number: HRP-PD-{(reg!! as any)._id}</p>
                {isAdmin(user!!) && (
                  <>
                    {!reg?.reverted && (
                      <>
                      <button className="bg-red-500 px-4 py-1 text-white font-bold text-sm rounded-lg" onClick={confirmed}>Undo</button>
                      {confirm && (
                        <>
                          <p className="text-sm text-red-500 font-thin">{confirmMsg}</p>
                        </>
                      )}
                      </>
                    )}
                  </>
                )}
                <h2 className="text-black font-bold text-lg mb-2">Certificate File:</h2>
                    <iframe src={certFile} width="100%" height="1200px" className={`border rounded-xl ${reg?.reverted ? 'opacity-75 filter:blur blur-sm' : ''}`} />
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
