"use client";
import Spinner from "@/components/Spinner";
import { Book } from "@/model/Book";
import { getCookie } from "cookies-next";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { CgSearch } from "react-icons/cg";

export default function Home() {
  const [loading, setLoading] = useState<boolean>(true);
  const [books, setBooks] = useState<Book[] | null>(null);

  useEffect(() => {
    const headers = new Headers();
    headers.append("Accept", "application/json");
    headers.append("Content-Type", "application/json");
    headers.append("Authorization", getCookie("token") as string);
    fetch(process.env.BACKEND_URL + "api/v1/book", {
      method: "GET",
      headers: headers,
    })
      .then((response) => {
        if (!response.ok) console.error(response.status);
        return response.json();
      })
      .then((body) => {
        setBooks(body.books as Book[]);
        setLoading(false);
      });
  }, []);

  return (
      <div className="h-full flex flex-col border-none p-4 flex-1">
        <div className="flex items-center space-x-1">
          <CgSearch size={20} />

          <input
            type="text"
            placeholder="Tìm sách, tác giả, năm sản xuất, thể loại..."
            className="p-1 bg-[#f0eee3] truncate outline-none flex-1"
          />
        </div>

        {loading && (
          <div className="h-full flex items-center justify-center">
            <Spinner />
          </div>
        )}

        <div className="h-full flex flex-wrap gap-6 justify-center flex-1 p-4 overflow-auto">
          {books?.map((value, index) => {
            return (
              <Link
                key={index}
                href={{
                  pathname: "book",
                  query: { id: value.id.toString() },
                }}
                className="flex flex-col justify-center border outline-none shadow-xl rounded-xl w-72 h-fit overflow-hidden hover:opacity-80"
                title={`${value.title}`}
              >
                <Image
                  src={`${value.image}`}
                  alt={`${value.title}`}
                  title={`${value.title}`}
                  width={500}
                  height={500}
                  className="w-auto object-contain"
                  priority
                />

                <div className="flex flex-col p-2">
                  <span className="font-bold uppercase truncate">
                    {value.title}
                  </span>

                  <span className="italic truncate">{value.author}</span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
  );
}
