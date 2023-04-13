import React, { useEffect, useState } from "react";
import Image from "next/image";
import { Application, FormType, Interview, Note, User } from "src/types";
import Loader from "../Loader";
import moment from "moment";
import { useRouter } from "next/router";
import { GetServerSideProps } from "next";
import { developerRoute } from "src/util/redirects";
import { withSession } from "src/util/session";
import Link from "next/link";
import UserGradient from "../user/UserGradient";
import { isAdmin } from "src/util/permission";
import { HiTrash } from "react-icons/hi";

interface CommentProps {
  obj: Application | Interview;
  type: FormType;
  author: User;
  text?: string | undefined;
}

const CommentBox: React.FC<CommentProps> = ({
  obj,
  type,
  author,
  text = undefined,
}) => {
  const [commentUsers, setCommentUsers] = useState<Map<String, User>>();
  const [loading, setLoading] = useState<boolean>(true);
  const [comment, setComment] = useState("");
  const router = useRouter();

  useEffect(() => {
    const func = async () => {
      if (!loading) return;
      try {
        const map = new Map<String, User>();
        const applicantIds = obj.notes.map((note) => note?.authorId);
        const usersResponse = await fetch("/api/user/bulk", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ users: applicantIds }),
        });
        if (usersResponse.ok) {
          const usersArray = await usersResponse.json();
          for (const [id, user] of usersArray) {
            map.set(id, user);
          }
          map.set(author.id, {...author, _id: author.id} as any);
        }
        setCommentUsers(map);
        setLoading(false);
      } catch (error) {
        console.error(error);
        setLoading(false);
      }
    };
    func();
  }, [loading, obj.notes]);

  const sendRequest = async (postForm: Partial<Application | Interview>) => {
    try {
      const response = await fetch(
        `/api/${type === FormType.INTERVIEW ? "interview" : "application"}/update`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(
            type === FormType.INTERVIEW
              ? {
                  interview: postForm,
                  interviewId: (obj as any)._id,
                }
              : {
                  application: postForm,
                  applicationId: (obj as any)._id,
                }
          ),
        }
      );
  
      if (response.ok) {
        obj.notes = postForm.notes || [];
      } else {
        router.push("/");
      }
    } catch (error) {
      console.error("An error occurred:", error);
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    const now = Date.now();
    let postForm: Partial<Application | Interview> = {
      lastUpdate: now,
      updatedById: author.id,
      notes:
        comment !== ""
          ? [
              ...(obj!.notes as Note[]),
              {
                noteId: obj!.notes.length + 1 + "",
                authorId: author.id,
                timestamp: now,
                text: comment,
              },
            ]
          : obj!.notes,
    };
    await sendRequest(postForm);
    obj.notes = postForm.notes || [];
    setComment("");
  };

  const handleDelete = async (id: string) => {
    const now = Date.now();
    let notes = (obj!.notes as Note[]).filter(note => note.noteId !== id);

    let postForm: Partial<Application | Interview> = {
      lastUpdate: now,
      updatedById: author.id,
      notes: notes
    };

    await sendRequest(postForm);
    setLoading(true)
    obj.notes = obj.notes.filter(note => note.noteId !== id);
  }

  return loading ? (
    <div className="max-w-4xl h-96 bg-slate-900 flex flex-row justify-center content-center backdrop-blur-3xl bg-opacity-50 text-white rounded-xl shadow-md items-center backdrop-blur">
      <Loader center={false} />
    </div>
  ) : (
    <>
      <div className="scrollable-container flex flex-col overflow-auto p-6 max-w-4xl h-96 bg-slate-900 backdrop-blur-3xl bg-opacity-50 text-white rounded-xl shadow-md backdrop-blur">
        {text && <h1 className="text-white font-semibold">{text}</h1>}
        {obj!!.notes
          .filter((note) => note.authorId)
          .map((note: any) => (
            <div
              key={note!!.noteId}
              className="my-2 flex flex-row items-center"
            >
              {(note!!.authorId === author.id || isAdmin(author)) && (
                <div className="mr-2 text-red-500">
                  <button onClick={() => handleDelete(note!!.noteId)}>
                    <HiTrash />
                  </button>
                </div>
              )}
              <div>
                <Link
                  href={`/profile/${
                    (commentUsers?.get(note!!.authorId!!) as any)?._id
                  }`}
                  passHref={true}
                >
                  <div className="flex flex-row items-center p-1">
                    <div
                      className="rounded-full mr-2 relative overflow-hidden"
                      style={{ width: 24, height: 24 }}
                    >
                      <Image
                        src={
                          commentUsers!!.get(note!!.authorId!!)?.avatar || ""
                        }
                        alt="User Avatar"
                        height={24}
                        width={24}
                      />
                    </div>
                    <div className="flex flex-col">
                      <h1>
                        <UserGradient
                          user={commentUsers!!.get(note!!.authorId!!)!!}
                        />
                      </h1>
                      <p className="text-gray-500 text-xs">
                        {moment
                          .unix(note!!.timestamp / 1e3)
                          .format("MMM Do, YYYY - h:mm A")}
                      </p>
                    </div>
                  </div>
                </Link>

                <p className="text-sm text-gray-500 mt-1">{note!!.text}</p>
              </div>
            </div>
          ))}
        <form className="mt-auto" onSubmit={handleSubmit}>
          <div className="mt-6 flex flex-row items-center border-solid border-x-red-100/0 border-y-red-100/0 border-t-gray-800 border-2">
            <div className="w-full pt-3 w-3/4">
              <textarea
                className="resize-none bg-opacity-0 bg-white focus:outline-none active:outline-none w-full"
                placeholder="Enter comment..."
                onChange={(e) => setComment(e.target.value)}
                value={comment}
                rows={1}
                required
              />
            </div>
            <button
              type="submit"
              className="w-1/4 mt-6 disabled:text-gray-500 disabled:cursor-not-allowed"
              disabled={comment.length < 1}
            >
              Post
            </button>
          </div>
        </form>
      </div>
    </>
  );
};

export default CommentBox;
