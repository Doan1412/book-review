"use client";
import Button from "@/components/Button";
import { Book } from "@/model/Book";
import http from "../../utils/http";
import { getCookie, hasCookie } from "cookies-next";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

export default function Register() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const id = searchParams.get("id");
  const [author, setAuthor] = useState<string>("");
  const [title, setTitle] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [book, setBook] = useState<Book>();

  useEffect(() => {
    async function fetchBook() {
        if (!hasCookie("token")) {
            router.push("/login");
            return;
        }
        if (!id) {
            router.push("/");
            return;
        }
        // const token = getCookie("token")?.toString();
        try {
            const response = await http.get("api/v1/book/" + id);
            const data = await response.data;

            if (data.success === true) {
                const fetchedBook = data.data;
                setBook(data.data);
                setBook(fetchedBook);
                setAuthor(fetchedBook.author);
                setTitle(fetchedBook.title);
                setDescription(fetchedBook.description);
                setLoading(false);
            } else {
                console.log(data.error);
                router.push("/");
            }
        } catch (error) {
            console.error("Error:", error);
        }
    }
    fetchBook();
}, [id, router]);

  const handleForm = (event: React.SyntheticEvent) => {
    event.preventDefault();
    setError(null);
    setLoading(true);
    if (
      id.trim() === "" ||
      author.trim() === "" ||
      title.trim() === "" ||
      description === ""
    ) {
      setError("Vui lòng nhập đủ các trường.");
      setLoading(false);
      return;
    }
    const headers = new Headers();
    headers.append("Accept", "application/json");
    headers.append("Content-Type", "application/json");
    fetch(process.env.BACKEND_URL  + "api/v1/auth", {
      method: "POST",
      headers: headers,
      body: JSON.stringify({
        id: id,
        author: author,
        title: title,
        description: description,
      }),
    })
      .then((resp) => {
        if (!resp.ok) console.error(resp.status);
        return resp.json();
      })
      .then(() => {
        setLoading(false);
        router.push("/login");
      });
  };

  return (
    <div className="h-full flex flex-row overflow-hidden">

      <div className="flex flex-col items-center justify-center flex-1 space-y-6">
        <form
          onSubmit={handleForm}
          className="space-y-6 flex flex-col items-center justify-center"
        >
          <h3 className="text-center uppercase font-bold text-2xl mb-4">
            Cập nhật sách
          </h3>

          <div className="inputWrap">
            <label htmlFor="id" className="inputLabel">
              <span>ID</span>
              <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              defaultValue={id}
              readOnly
              className="inputField w-96"
            />
          </div>

          <div className="inputWrap">
            <label htmlFor="author" className="inputLabel">
              <span>Tác giả</span>
              <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={author}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                setError(null);
                setAuthor(e.target.value);
              }}
              className="inputField w-96"
            />
          </div>

          <div className="inputWrap">
            <label htmlFor="title" className="inputLabel">
              <span>Tiêu đề</span>
              <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                setError(null);
                setTitle(e.target.value);
              }}
              className="inputField w-96"
            />
          </div>

          <div className="inputWrap">
            <label htmlFor="description" className="inputLabel">
              <span>Mô tả</span>
              <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={description}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                setError(null);
                setDescription(e.target.value);
              }}
              className="inputField w-96"
            />
          </div>

          <div className="h-4">
            {error ? <p className="errorMessage">{error}</p> : null}
          </div>

          <Button type="submit" loading={loading}>
            Cập nhật
          </Button>
        </form>

        <div className="flex flex-row items-center space-x-1">
          <div className="h-[1px] bg-gray-300 w-24"></div>
          <div className="h-[1px] bg-gray-300 w-24"></div>
        </div>

        <Link href={"/book?id="+ id}>
          <Button type="button">Quay về</Button>
        </Link>
      </div>
    </div>
  );
}