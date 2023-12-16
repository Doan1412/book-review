"use client";
import Button from "@/components/Button";
import { Book } from "@/model/Book";
import http from "../../utils/http";
import { getCookie, hasCookie } from "cookies-next";
import { ChangeEvent, useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import Navigation from "@/components/Navigation";
import Popup from "@/components/Popup";
import { Select, Spinner } from "@nextui-org/react";
import { FiUploadCloud } from "react-icons/fi";
import { Category } from "@/model/Category";

export default function Register() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const id = searchParams.get("id");
    const [author, setAuthor] = useState<string>("");
    const [title, setTitle] = useState<string>("");
    const [price, setPrice] = useState<number>(0);
    const [description, setDescription] = useState<string>("");
    const [book, setBook] = useState<Book>();
    const [image, setImage] = useState<File | null>(null);
    const [createObjectURL, setCreateObjectURL] = useState<string>();
    const [categories, setCategories] = useState<Category[]| null>(null);
    const [noti, setNoti] = useState<string | null>(null);
    const [selectedCategories, setSelectedCategories] = useState<Category[]| null>(null);
    const uploadToClient = (event: ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files[0]) {
            const i = event.target.files[0];
            setImage(i);
            setCreateObjectURL(URL.createObjectURL(i));
        }
    };

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
            setLoading(true);
            // const token = getCookie("token")?.toString();
            try {
                const response = await http.get("api/v1/book/" + id);
                const data = await response.data;

                if (data.success === true) {
                    const fetchedBook = data.data;
                    setBook(fetchedBook);
                    setAuthor(fetchedBook.author);
                    setTitle(fetchedBook.title);
                    setDescription(fetchedBook.description);
                    setPrice(fetchedBook.price);
                    setCreateObjectURL(
                        process.env.BACKEND_URL + `static/` + fetchedBook.image
                    );
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
        async function fetchCategories() {
            try{
              const headers = new Headers();
              headers.append("Accept", "application/json");
              headers.append("Content-Type", "application/json");
              fetch(process.env.BACKEND_URL + "/api/v1/category", {
                method: "GET",
                headers: headers,
              })
                .then((response) => {
                  if (!response.ok) {
                    console.error(response.status);
                  }
                  return response.json();
                })
                .then((body) => {
                  setCategories(body.data.categories as Category[]);
                  setLoading(false);
                });
                } catch (error) {
                console.error("Error:", error);
            }
        }
        fetchCategories();
    }, [id, router]);

    const handleForm = async (event: React.SyntheticEvent) => {
        event.preventDefault();
        setError(null);
        setLoading(true);
        if (
            !id ||
            id.trim() === "" ||
            author.trim() === "" ||
            title.trim() === "" ||
            description.trim() === ""
        ) {
            setError("Vui lòng nhập đủ các trường.");
            setLoading(false);
            return;
        }
        const headers = new Headers();
        headers.append("Accept", "application/json");
        headers.append("Authorization", getCookie("token") as string);
        const body = new FormData();
        if (image) {
            body.append("image", image);
        }
        body.append("author", author);
        body.append("title", title);
        body.append("description", description);
        body.append("price", price.toString());
        const response = await fetch(process.env.BACKEND_URL + "api/v1/book/" + id, {
            method: "POST",
            headers: headers,
            body: body,
        });
        if (!response.ok) {
            throw new Error("Failed to fetch data");
        }
        const data = await response.json();
        if (data.success === true) {
            setNoti("Cập nhật sách thành công");
            router.push("/");
        } else {
            setNoti("Cập nhật không thành công");
            console.log("Failed to delete");
        }
    };
    return (
        <div className="h-full flex flex-row">
            <Navigation />
            <div className="flex-1 overflow-auto">
                {loading && (
                    <div className="h-full flex items-center justify-center">
                        <Spinner />
                    </div>
                )}
                {noti && <Popup message={noti} close={() => setNoti(null)} />}
                {book && (
                    <div className="p-6">
                        <div className="flex flex-col items-center justify-center flex-1 space-y-6">
                            <form
                                encType="multipart/form-data"
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
                                        defaultValue={id ?? ""}
                                        readOnly
                                        className="inputField w-96"
                                    />
                                </div>

                                <div className="inputWrap">
                                    <label
                                        htmlFor="author"
                                        className="inputLabel"
                                    >
                                        <span>Tác giả</span>
                                        <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={author}
                                        onChange={(
                                            e: React.ChangeEvent<HTMLInputElement>
                                        ) => {
                                            setError(null);
                                            setAuthor(e.target.value);
                                        }}
                                        className="inputField w-96"
                                    />
                                </div>

                                <div className="inputWrap">
                                    <label
                                        htmlFor="title"
                                        className="inputLabel"
                                    >
                                        <span>Tiêu đề</span>
                                        <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={title}
                                        onChange={(
                                            e: React.ChangeEvent<HTMLInputElement>
                                        ) => {
                                            setError(null);
                                            setTitle(e.target.value);
                                        }}
                                        className="inputField w-96"
                                    />
                                </div>
                                <div className="inputWrap">
                                    <label
                                        htmlFor="title"
                                        className="inputLabel"
                                    >
                                        <span>Giá</span>
                                        <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="number"
                                        value={price}
                                        onChange={(
                                            e: React.ChangeEvent<HTMLInputElement>
                                        ) => {
                                            setError(null);
                                            setTitle(e.target.value);
                                        }}
                                        className="inputField w-96"
                                    />
                                </div>

                                <div className="inputWrap">
                                    <label
                                        htmlFor="description"
                                        className="inputLabel"
                                    >
                                        <span>Mô tả</span>
                                        <span className="text-red-500">*</span>
                                    </label>
                                    <textarea
                                        rows={4}
                                        value={description}
                                        onChange={(
                                            e: React.ChangeEvent<HTMLTextAreaElement>
                                        ) => {
                                            setError(null);
                                            setDescription(e.target.value);
                                        }}
                                        className="inputField w-96"
                                    />
                                </div>
                                <div className="inputWrap w-96">
                                    <label
                                        htmlFor="description"
                                        className="inputLabel"
                                    >
                                        <span>Ảnh</span>
                                        <span className="text-red-500">*</span>
                                    </label>
                                    {book && book.image && (
                                        <div>
                                            {createObjectURL ? (
                                                <Image
                                                    alt={`Bìa sách ${book.title}`}
                                                    src={createObjectURL} // Ensure createObjectURL is a valid URL string
                                                    width={250}
                                                    height={250}
                                                    className="object-contain rounded-xl shadow-lg z-50"
                                                    priority
                                                />
                                            ) : (
                                                <p>No image available</p>
                                            )}
                                        </div>
                                    )}
                                    <div >
                                        <label
                                            htmlFor="image"
                                            className="flex items-center justify-center w-32 h-10 bg-[#c7c4bd] text-white rounded-lg shadow-md cursor-pointer hover:bg-opacity-80"
                                        >
                                            <FiUploadCloud
                                                size={25}
                                                color="black"
                                            />
                                            <input
                                                onChange={uploadToClient}
                                                type="file"
                                                id="image"
                                                name="files"
                                                accept="image/*"
                                                className="hidden"
                                            />
                                        </label>
                                    </div>

                                    <div className="h-4">
                                        {error ? (
                                            <p className="errorMessage">
                                                {error}
                                            </p>
                                        ) : null}
                                    </div>
                                </div>

                                <Button type="submit" loading={loading}>
                                    Cập nhật
                                </Button>
                            </form>

                            <div className="flex flex-row items-center space-x-1">
                                <div className="h-[1px] bg-gray-300 w-24"></div>
                                <div className="h-[1px] bg-gray-300 w-24"></div>
                            </div>

                            <Link href={"/book?id=" + id}>
                                <Button type="button">Quay về</Button>
                            </Link>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
