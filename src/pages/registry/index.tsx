import { GetServerSideProps } from "next";
import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import ApplicationBar from "src/components/application/ApplicationBar";
import Loader from "src/components/Loader";
import PageSelector from "src/components/PageSector";
import {
  Application,
  DeathReg,
  DeathRegWithId,
  DISCORD,
  User,
} from "src/types";
import { isAdmin, isStaff } from "src/util/permission";
import { developerRoute } from "src/util/redirects";
import { withSession } from "src/util/session";

interface Props {
  user?: User;
}

export default function MainPage({ user }: Props) {
  const router = useRouter();
  const [registries, setReg] = useState<DeathRegWithId[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [users, setUsers] = useState<Map<String, User>>();
  const [page, setPage] = useState(
    router.query.page ? (router.query.page as unknown as number) : 1
  );
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
      const json = await res.json();
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

  const [search, setSearch] = useState("");

  const doSearchQuery = async () => {
    setLoading(true);
    const queryParams2 = new URLSearchParams(window.location.search);
    queryParams2.set("search", search);
    const newUrl = window.location.pathname + "?" + queryParams2.toString();
    window.history.pushState({ path: newUrl }, "", newUrl);
    const queryParams = new URLSearchParams();
    queryParams.append("page", page.toString());
    queryParams.append("pageLength", pageLength.toString());
    queryParams.append("search", search)
    const res = await fetch(
      `/api/registry/get-registries?${queryParams.toString()}`
    );
    if (res.ok) {
      const json = await res.json();
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
  };

  return (
    <>
      <div className="md:mx-28 md:my-10 sm:mx-8 sm:my-8">
        <h1 className="text-black md:text-3xl sm:text-lg">
          Registered Perma Deaths
        </h1>
      </div>
      {loading ? (
        <>
          <div className="flex flex-wrap justify-center items-center">
            <Loader center={false} />
          </div>
        </>
      ) : registries.length > 0 ? (
        <>
          <div className="w-full sm:w-1/2 mb-4 mx-16 max-w-md sm:max-w-lg justify-center flex flex-row">
            <input
              className="px-8 py-2 bg-gray-200 rounded mr-4"
              placeholder="Search..."
              onChange={e => setSearch(e.target.value)}
            ></input>
            <button onClick={doSearchQuery}>Search</button>
          </div>
          <div className="flex flex-col justify-center sm:flex-row flex-wrap">
            {registries.map((reg: DeathReg) => {
              // Check if the registry is reverted and the user is an admin
              const isReverted = reg.reverted;
              const isAdminUser = isAdmin(user!!);

              // If the registry is reverted and the user is not an admin, skip rendering
              if (isReverted && !isAdminUser) return null;

              // Determine the background color based on the reverted status
              const backgroundColor =
                isReverted && isAdminUser ? "bg-red-200" : "bg-gray-300";

              return (
                <>
                  <div
                    className="w-full sm:w-1/2 mb-4 mx-2 max-w-md sm:max-w-lg"
                    key={(reg as any)._id}
                  >
                    <Link
                      href={`/registry/${(reg as any)._id}`}
                      passHref={true}
                    >
                      <div
                        className={`cursor-pointer px-4 py-2 ${backgroundColor} w-full flex justify-between rounded-lg`}
                      >
                        <div className="flex flex-col">
                          <h1 className="text-black font-bold">
                            Name: {reg.name}
                          </h1>
                          <p className="text-black text-sm"><span className="font-bold">CSN: </span>{reg.csn}</p>
                          <p className="text-black text-sm">
                          <span className="font-bold">Date of Birth:{" "}</span>
                            {new Date(reg.dob).toLocaleDateString()}
                          </p>
                          <p className="text-black text-sm">
                          <span className="font-bold">
                            Date of Death:{" "}
                            </span>
                            {new Date(reg.dod).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex flex-col items-end mt-2">
                          <p className="text-black text-sm">
                          <span className="font-bold">
                            Certificate: CLICK TO VIEW
                            </span>
                          </p>
                          {reg.reverted && (
                            <p className="text-red-500 font-bold text-sm">
                              REVERTED BY ADMIN
                            </p>
                          )}
                        </div>
                      </div>
                    </Link>
                  </div>
                </>
              );
            })}
          </div>
          <div className="mx-2 sm:mx-32 my-4 flex text-black justify-between">
            <PageSelector
              currentPage={page}
              totalPages={Math.ceil(total / 18)}
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
