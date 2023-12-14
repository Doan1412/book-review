"use client";
import { useRouter } from "next/navigation";
import { usePathname, useSearchParams } from 'next/navigation'
import { Book } from "@/model/Book";
import { useEffect, useState } from "react";
import { getCookie, hasCookie } from "cookies-next";
import http from "../utils/http";
import { Button, Spinner } from "@nextui-org/react";
import Navigation from "@/components/Navigation";
import Image from "next/image";
import Link from "next/link";
import { FiEdit } from "react-icons/fi";
import { AiOutlineDelete } from "react-icons/ai";
import Rating from "@/components/Rating";
import { BsSend } from "react-icons/bs";
export default function Detail_book() {
    const router = useRouter();
    const [loading, setLoading] = useState<boolean>(true);
    const [book, setBook] = useState<Book>();
    const searchParams = useSearchParams()
    const id = searchParams.get('id');
    const [rating, setRating] = useState<number>(0);
    const [comment, setComment] = useState<string>("");
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
                    setBook(data.data);
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
    }, [id,router]);

    if (!book) {
        return (
            <div className="w-full h-full flex items-center justify-center">
                <Spinner />
            </div>
        );
    } else {
        return (
            <div className="h-full flex flex-row">
                <Navigation />
                <div className="flex-1 overflow-auto">
                    <div className="p-6">
                        <div className="w-full bg-[#f0eee3] flex flex-row items-center justify-center space-x-16">
                            {book &&
                                book.image && ( // Check if book and book.img are defined
                                    <Image
                                        src={
                                            process.env.BACKEND_URL +
                                            `static/${book.image}`
                                        }
                                        alt={`Bìa sách ${book.title}`}
                                        title={`Bìa sách ${book.title}`}
                                        width={250}
                                        height={250}
                                        className="object-contain rounded-xl shadow-lg z-50"
                                        priority
                                    />
                                )}

                            <div className="flex flex-col justify-center">
                                <span className="font-bold uppercase text-2xl truncate leading-loose">
                                    {book.title}
                                </span>
                                <span className="italic truncate text-xl text-[#848484]">
                                    {book.author}
                                </span>
                            </div>
                        </div>

                        <div className="bg-[#fdfcf8] w-full rounded-xl -mt-12">
                            <div className="flex flex-row justify-end items-center px-6 pt-4 space-x-4">
                                <Button className="iconButton">
                                    <Link href={`/book/edit?id=${book.id}`}>
                                        <FiEdit size={20} />
                                    </Link>
                                </Button>

                                <Button
                                    // onClick={deleteBook}
                                    className="iconButton"
                                >
                                    <AiOutlineDelete size={20} />
                                </Button>
                            </div>

                            <div className="flex flex-row space-x-10 overflow-auto px-6 py-4">
                                <div className="flex-1 space-y-2">
                                    {book && book.price && (
                                        <div className="flex items-center justify-between">
                                            <h5 className="font-bold text-base">
                                                Giá tham khảo
                                            </h5>
                                            <p className="italic">
                                                {book.price.toLocaleString()}{" "}
                                                VNĐ
                                            </p>
                                        </div>
                                    )}

                                    <div className="flex flex-col space-y-1">
                                        {book && book.description && (
                                            <>
                                                <h5 className="font-bold text-base">
                                                    Mô tả sách
                                                </h5>
                                                {book.description
                                                    .trim()
                                                    .split("\n")
                                                    .map((value, index) => {
                                                        return (
                                                            <p key={index}>
                                                                {value}
                                                            </p>
                                                        );
                                                    })}
                                            </>
                                        )}
                                    </div>
                                </div>

                                <div className="flex-1 space-y-2">
                                    <div className="flex flex-col space-y-1">
                                        <h5 className="font-bold text-base">
                                            Danh mục
                                        </h5>
                                        <div className="flex flex-row flex-wrap gap-2">
                                            {book.categories?.map(
                                                (value, index) => {
                                                    return (
                                                        <div
                                                            key={index}
                                                            className="px-3 py-2 bg-[#c7c4bd] rounded-full"
                                                        >
                                                            {value.name}
                                                        </div>
                                                    );
                                                }
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex flex-col space-y-2 justify-center">
                                        <h5 className="font-bold text-base">
                                            Đánh giá
                                        </h5>

                                        <div className="flex flex-row items-center space-x-2">
                                            <input
                                                type="text"
                                                value={comment}
                                                onChange={(
                                                    e: React.ChangeEvent<HTMLInputElement>
                                                ) => setComment(e.target.value)}
                                                className="inputField flex-1"
                                                placeholder="Thêm đánh giá..."
                                            />

                                            <Rating
                                                count={5}
                                                value={rating}
                                                edit={true}
                                                onChange={(value) =>
                                                    setRating(value)
                                                }
                                            />

                                            <Button
                                                onClick={postComment}
                                                className="h-full"
                                            >
                                                <BsSend size={20} />
                                            </Button>
                                        </div>

                                        <div className="space-y-2">
                                            {book.reviews?.map((value, index) => (
                                                <div
                                                    key={index}
                                                    className="flex flex-col bg-[#f0eee3] px-3 py-2 rounded-xl"
                                                >
                                                    <div className="flex flex-row justify-between">
                                                        <span className="font-bold">
                                                            {value.username}
                                                        </span>
                                                        <span className="italic">
                                                            {value.create_at}
                                                        </span>
                                                    </div>
                                                    <div className="flex flex-row justify-between">
                                                        <div>
                                                            {editCommentId ===
                                                            value.id ? (
                                                                <div>
                                                                    <textarea
                                                                        value={
                                                                            editedComment
                                                                        }
                                                                        onChange={(
                                                                            e
                                                                        ) =>
                                                                            setEditedComment(
                                                                                e
                                                                                    .target
                                                                                    .value
                                                                            )
                                                                        }
                                                                        cols={
                                                                            30
                                                                        }
                                                                        className="bg-[#f0eee3]"
                                                                    />
                                                                    <br />
                                                                    <button
                                                                        className="iconButton"
                                                                        onClick={() =>
                                                                            handleSaveEdit(
                                                                                value.id.valueOf(),
                                                                                editedComment,
                                                                                value.star.valueOf()
                                                                            )
                                                                        }
                                                                    >
                                                                        Save
                                                                    </button>
                                                                    <button
                                                                        className="iconButton"
                                                                        onClick={
                                                                            handleCancelEdit
                                                                        }
                                                                    >
                                                                        Cancel
                                                                    </button>
                                                                </div>
                                                            ) : (
                                                                <div>
                                                                    <span>
                                                                        {
                                                                            value.comment
                                                                        }
                                                                    </span>
                                                                    <Rating
                                                                        count={
                                                                            5
                                                                        }
                                                                        value={
                                                                            value.star as number
                                                                        }
                                                                        edit={
                                                                            false
                                                                        }
                                                                    />
                                                                </div>
                                                            )}
                                                        </div>
                                                        {value.username ===
                                                            getCookie(
                                                                "username"
                                                            ) && (
                                                            <div>
                                                                {!editCommentId && (
                                                                    <>
                                                                        <button
                                                                            className="iconButton"
                                                                            onClick={() =>
                                                                                handleEditComment(
                                                                                    value.id.valueOf()
                                                                                )
                                                                            }
                                                                        >
                                                                            <FiEdit
                                                                                size={
                                                                                    20
                                                                                }
                                                                            />
                                                                        </button>
                                                                        <button
                                                                            className="iconButton"
                                                                            onClick={() =>
                                                                                handleDeleteComment(
                                                                                    value.id.valueOf()
                                                                                )
                                                                            }
                                                                        >
                                                                            <AiOutlineDelete
                                                                                size={
                                                                                    21
                                                                                }
                                                                            />
                                                                        </button>
                                                                    </>
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}
