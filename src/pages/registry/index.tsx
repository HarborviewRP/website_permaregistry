import { GetServerSideProps } from "next";
import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import ApplicationBar from "src/components/application/ApplicationBar";
import Loader from "src/components/Loader";
import PageSelector from "src/components/PageSector";
import { Application, DeathReg, DeathRegWithId, DISCORD, User } from "src/types";
import { isStaff } from "src/util/permission";
import { developerRoute } from "src/util/redirects";
import { withSession } from "src/util/session";

interface Props {
  user?: User;
}

export default function MainPage({ user }: Props) {
  const router = useRouter();
  const [applications, setReg] = useState<DeathRegWithId[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [users, setUsers] = useState<Map<String, User>>();
  const [page, setPage] = useState(router.query.page ? router.query.page as unknown as number : 1);
  const [pageLength, setPageLength] = useState(18);
  const [sortStatus, setSortStatus] = useState<string | null>("asc");
  const [hasNextPage, setHasNextPage] = useState<boolean>(true);
  const [total, setTotal] = useState(0);

  const onPageClick = (pageNumber: number) => {
    setPage(pageNumber);
  
    const queryParams = new URLSearchParams(window.location.search);
    queryParams.set("page", pageNumber.toString());
    const newUrl = window.location.pathname + "?" + queryParams.toString();
    window.history.pushState({ path: newUrl }, "", newUrl);
  };

  const fetchApplications = useCallback(async () => {
    setLoading(true);
    const queryParams = new URLSearchParams();
    queryParams.append("page", page.toString());
    queryParams.append("pageLength", pageLength.toString());
    if (sortStatus) {
      queryParams.append("sortStatus", sortStatus);
    }
    const res = await fetch(
      `/api/registry/get-registries?${queryParams.toString()}`
    );
    if (res.ok) {
      const json = (await res.json());
      const total = json.total;
      const registries: DeathRegWithId[] = json.registries;

      setReg(registries);
      setTotal(total);

      if (page > total / 12) {
        setHasNextPage(false);
      } else {
        setHasNextPage(true);
      }
      setLoading(false);
    } else {
      setLoading(false);
    }
  }, [page, pageLength, sortStatus]);

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  const toggleSortStatus = () => {
    setSortStatus((prevStatus) => (prevStatus === "asc" ? "desc" : "asc"));
  };

  const nextPage = () => {
    setPage((prevPage) => prevPage + 1);
  };

  const prevPage = () => {
    setPage((prevPage) => Math.max(prevPage - 1, 1));
  };


  return (
    <>
      <div className="md:mx-28 md:my-10 sm:mx-8 sm:my-8">
        <h1 className="text-black md:text-3xl sm:text-lg">Registered Perma Deaths</h1>
      </div>
      {loading ? (
        <>
          <div className="flex flex-wrap justify-center items-center">
            <Loader center={false} />
          </div>
        </>
      ) : applications.length > 0 ? (
<>
  <div className="flex flex-col justify-center sm:flex-row flex-wrap">
    {applications.map((reg: DeathReg) => (
      <div className="w-full sm:w-1/2 mb-4 mx-2 max-w-md sm:max-w-lg" >
        <Link href={`/registry/${(reg as any)._id}`} key={(reg as any)._id} passHref={true}>
          <div className="cursor-pointer px-4 py-2 bg-black bg-opacity-20 w-full flex justify-between">
            <div className="flex flex-col">
              <h1 className="text-black font-bold">Name: {reg.name}</h1>
              <p className="text-black text-sm">CSN: {reg.csn}</p>
              <p className="text-black text-sm">Date of Birth: {new Date(reg.dob).toLocaleDateString()}</p>
              <p className="text-black text-sm">Date of Death: {new Date(reg.dod).toLocaleDateString()}</p>
            </div>
            <div className="flex flex-col items-end mt-2">
              <p className="text-black text-sm">Certificate: CLICK TO VIEW</p>
            </div>
          </div>
        </Link>
      </div>
    ))}
  </div>
  <div className="mx-2 sm:mx-32 my-4 flex text-black justify-between">
    <PageSelector
      currentPage={page}
      totalPages={Math.ceil(total / 12)}
      adjacentPages={2}
      onPageClick={onPageClick}
    />
  </div>
</>
      ) : (
        <>
          <div className="flex flex-wrap mx-28">
            <h1 className="text-gray-400 text-xl font-thin">
              There are no registered deaths
            </h1>
          </div>
        </>
      )}
    </>
  );
}

export const getServerSideProps: GetServerSideProps =
  withSession(developerRoute);
