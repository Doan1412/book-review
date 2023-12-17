"use client";
import Navigation from "@/components/Navigation";
import Popup from "@/components/Popup";
import Spinner from "@/components/Spinner";
import { Book } from "@/model/Book";
import { Category } from "@/model/Category";
import { getCookie } from "cookies-next";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { CgSearch } from "react-icons/cg";
import { useSearchParams, useRouter } from "next/navigation";
export default function Home() {
    const router = useRouter();
    const [loading, setLoading] = useState<boolean>(true);
    const [books, setBooks] = useState<Book[] | null>(null);
    const [noti, setNoti] = useState<string | null>(null);
    const [category, setCategory] = useState<Category>();
    const searchParams = useSearchParams();
    const id = searchParams.get("id");
    useEffect(() => {
        if (!id) {
            router.push("/");
            return;
        }
        const headers = new Headers();
        headers.append("Accept", "application/json");
        headers.append("Content-Type", "application/json");
        headers.append("Authorization", getCookie("token") as string);
        fetch(process.env.BACKEND_URL + "api/v1/book/category/" + id, {
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
                setBooks(body.data.books as Book[]);
                setCategory(body.data.category as Category);
                setLoading(false);
            });
    }, [id, router]);
    console.log("Backend URL:", process.env.BACKEND_URL);

    return (
        <div className="h-full flex flex-row">
            <Navigation />
            <div className="flex-1 overflow-auto">
                {noti && <Popup message={noti} close={() => setNoti(null)} />}
                {loading && (
                    <div className="h-full flex items-center justify-center">
                        <Spinner />
                    </div>
                )}
                <div className="p-6">
                    <div className="h-full flex flex-col border-none p-4 flex-1">
                        <div className="flex items-center space-x-1">
                            <CgSearch size={20} />

                            <input
                                type="text"
                                placeholder="Tìm sách, tác giả, năm sản xuất, thể loại..."
                                className="p-1 bg-[#f0eee3] truncate outline-none flex-1"
                            />
                        </div>

                        {category && (
                            <div className="flex items-center space-x-1 pt-10">
                                <h1 className="font-bold text-xl mb-2">
                                    Sách có thể loại {category.name}
                                </h1>
                            </div>
                        )}
                        <div className="h-full flex flex-wrap gap-6 justify-center flex-1 p-4 overflow-auto">
                            <div className="h-full flex flex-wrap gap-6 justify-center flex-1 p-4 overflow-auto">
                                {books?.map((value, index) => {
                                    return (
                                        <Link
                                            key={index}
                                            href={{
                                                pathname: "book",
                                                query: {
                                                    id: value.id.toString(),
                                                },
                                            }}
                                            className="flex flex-col justify-center border outline-none shadow-xl rounded-xl w-72 h-fit overflow-hidden hover:opacity-80"
                                            title={`${value.title}`}
                                        >
                                            <div className="flex items-center justify-center overflow-hidden w-100 h-100">
                                                <Image
                                                    src={
                                                        process.env
                                                            .BACKEND_URL +
                                                        `static/${value.image}`
                                                    }
                                                    alt={`${value.title}`}
                                                    title={`${value.title}`}
                                                    width={500}
                                                    height={500}
                                                    className="w-auto object-cover"
                                                    priority
                                                />
                                            </div>
                                            <div className="flex flex-col p-2">
                                                <span className="font-bold uppercase truncate">
                                                    {value.title}
                                                </span>

                                                <span className="italic truncate">
                                                    {value.author}
                                                </span>
                                            </div>
                                        </Link>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}