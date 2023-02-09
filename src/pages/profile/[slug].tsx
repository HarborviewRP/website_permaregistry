import { GetServerSideProps } from "next";
import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect } from "react";
import { User } from "src/types";
import { developerRoute } from "src/util/redirects";
import { withSession } from "src/util/session";

interface Props {
  user?: User;
}

export default function MainPage({ user }: Props) {
  const router = useRouter();
  useEffect(() => {
    if (!user) router.push('/')
  })

  const { slug } = router.query
//   const otherUser = fetch(`http://localhost:3000/api/user/${slug}`)
//   console.log(otherUser);

  const bannerStyle = {
    backgroundImage: `url(${user?.banner}?size=4096)`,
    backgroundRepeat: "no-repeat",
    backgroundSize: "cover",
    backgroundBlendMode: "multiply",
  };

  return (
    <>
      {user && (
        <>
          <div className="flex flex-col">
            <div
              className="flex flex-row flex-col max-h-48 items-center"
              style={bannerStyle}
            >
              <div className="h-64 min-h-full"></div>
              <div className="h-32 min-h-full w-64 min-w-full bg-slate-900 backdrop-blur-3xl bg-opacity-50 flex items-center">
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
                className="rounded-full absolute my-20"
                src={user.avatar + "?size=512"}
                alt="User Avatar"
                height={150}
                width={150}
              />
              <div className="w-full bg-slate-900 backdrop-blur-3xl bg-opacity-50"></div>
            </div>
          </div>
        </>
      )}
    </>
  );
}

export const getServerSideProps: GetServerSideProps = withSession(developerRoute)
