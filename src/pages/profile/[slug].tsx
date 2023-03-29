import { GetServerSideProps } from "next";
import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import Loader from "src/components/Loader";
import { User } from "src/types";
import { isAdmin, isStaff } from "src/util/permission";
import { developerRoute } from "src/util/redirects";
import { withSession } from "src/util/session";

interface Props {
  user?: User;
}

export default function MainPage({ user }: Props) {
  const router = useRouter();
  useEffect(() => {
    if (!user) router.push("/");
  });
  const { slug } = router.query;
  const [otherUser, setOtherUser] = useState<User | undefined>();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (otherUser) return;
    const fetchUser = async () => {
      const otherUserRes = await fetch(`/api/user/${slug}`);
      if (otherUserRes.ok) {
        setOtherUser(await otherUserRes.json());
      }
      setLoading(false);
    };
    fetchUser();
  });

  const bannerStyle = {
    backgroundImage: `url(${user?.banner}?size=4096)`,
    backgroundRepeat: "no-repeat",
    backgroundSize: "cover",
    backgroundBlendMode: "multiply",
  };

  return loading ? (
    <Loader />
  ) : (
    <>
      {otherUser && (
        <>
          <div className="flex flex-col">
            <div
              className="flex flex-row flex-col max-h-48 items-center"
              style={bannerStyle}
            >
              <div className="h-64 min-h-full"></div>
              <div className="h-32 flex flex-row justify-between items-center min-h-full min-w-full bg-slate-900 backdrop-blur-3xl bg-opacity-50 flex items-center border-b-8 border-slate-900">
                <div className="px-16">
                  <p className="text-center text-xl font-semibold text-white">
                    {`${otherUser.username}#${otherUser.discriminator}`}
                    <span className="font-light text-sm pl-2 italic">
                      ({(otherUser as any)._id})
                    </span>
                  </p>
                </div>
                {isStaff(otherUser) ? (
                  <div className="px-16">
                    {isAdmin(otherUser) ? <><p className="text-center text-xl font-bold text-red-800">
                    Website Admin
                  </p></> : <p className="text-center text-xl font-bold text-yellow-500">
                    Recruitment Team
                  </p>}
                  
                </div>
                ) : <p className="px-16 text-center text-xl font-bold text-gray-500">
                Visitor
              </p>}
              </div>
              <Image
                className="rounded-full absolute my-20 border-t-4 border-r-4 border-l-4 border-slate-900"
                src={otherUser.avatar + "?size=512"}
                alt="User Avatar"
                height={175}
                width={175}
              />
              <div className="w-full bg-slate-900 backdrop-blur-3xl bg-opacity-50"></div>
            </div>
          </div>
        </>
      )}
    </>
  );
}

export const getServerSideProps: GetServerSideProps =
  withSession(developerRoute);
