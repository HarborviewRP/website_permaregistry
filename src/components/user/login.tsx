import React from "react";
import { User } from "src/types";
import { lightenColor } from "src/util/discord";
import Image from "next/image";
import Link from "next/link";
import Container from "../Container";

interface Props {
  message?: string;
  style?: string;
}

const LoginBox: React.FC<Props> = ({
  message = "Login with Discord",
  style,
}) => {
  return (
    <>
      <div className="h-screen flex justify-center items-center">
        <Container className="p-6 max-w-sm mx-auto shadow-md flex flex-col items-center justify-between rounded-xl h-1/2 w-full sm:w-1/2 md:w-1/3 lg:w-1/4">
          <h1 className="text-white text-xl font-bold leading-tight tracking-tight">
            Login
          </h1>
          <div className="w-full flex-grow flex items-center justify-center">
            <div className="w-full flex justify-center">
              <Link href="/api/auth/login?next=apply" passHref>
                <button className="flex flex-row items-center px-6 py-2 text-sm justify-center rounded-xl items-start text-white bg-indigo-500 backdrop-blur-3xl bg-opacity-50 font-bold  border border-indigo-500 hover:bg-indigo-500 hover:text-gray-50 hover:border-transparent ">
                  <Image
                    className="mr-4"
                    src="https://brandlogos.net/wp-content/uploads/2021/11/discord-logo.png"
                    height={48}
                    width={48}
                    alt="Discord Logo"
                  ></Image>
                  {message}
                </button>
              </Link>
            </div>
          </div>
        </Container>
      </div>
    </>
  );
};

export default LoginBox;
