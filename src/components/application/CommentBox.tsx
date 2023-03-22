import React, { useEffect, useState } from "react";
import Image from "next/image";
import { Application, User } from "src/types";
import Loader from "../Loader";

interface CommentProps {
  application: Application;
}

const CommentBar: React.FC<CommentProps> = ({ application }) => {
  const [commentUsers, setCommentUsers] = useState<Map<String, User>>();
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const getApplication = async () => {
      if (!loading) return;
      try {
        const map = new Map<String, User>();
        for (const note of application.notes) {
          const author = await fetch(`/api/user/${application.applicantId}`);
          if (author.ok) {
            const user = await author.json();
            map.set(note!!.authorId, user);
          }
        }
        setCommentUsers(map);
        setLoading(false);
      } catch (error) {
        console.error(error);
        setLoading(false);
      }
    };
    getApplication();
  }, []);

  function truncate(str: string, maxLength = 19) {
    if (str.length <= maxLength) {
      return str;
    }
    return str.slice(0, maxLength - 3) + "...";
  }

  return (loading ? (
    <div className="p-6 max-w-4xl h-96 bg-slate-900 backdrop-blur-3xl bg-opacity-50 text-white rounded-xl shadow-md items-center space-x-1 backdrop-blur"><Loader center={false}/></div>
  ) : (
    <>
      <div className="p-6 max-w-4xl h-96 bg-slate-900 backdrop-blur-3xl bg-opacity-50 text-white rounded-xl shadow-md items-center space-x-1 backdrop-blur">
        {application!!.notes.map((note) => (
          <div key={note!!.noteId} className="my-3">
            <div className="flex flex-row">
              <Image
                className="rounded-full mr-2"
                src={commentUsers!!.get(note!!.authorId!!)!!.avatar}
                alt="User Avatar"
                height={24}
                width={24}
              />
              <h1 className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-indigo-500 to-blue-600">
                {commentUsers!!.get(note!!.authorId!!)!!.username}#
                {commentUsers!!.get(note!!.authorId!!)!!.discriminator}
              </h1>
            </div>
            <p className="text-sm text-gray-500 mt-1">{note!!.text}</p>
          </div>
        ))}
      </div>
    </>
  ));
};

export default CommentBar;
