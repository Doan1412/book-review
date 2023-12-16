"use client";
import { usePathname, useSearchParams, useRouter } from "next/navigation";
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
import Translate from "@/language/translate";
import Popup from "@/components/Popup";
import { Review } from "@/model/Review";

export default function Detail_book() {
    const router = useRouter();
    const [loading, setLoading] = useState<boolean>(true);
    const [book, setBook] = useState<Book>();
    const searchParams = useSearchParams();
    const id = searchParams.get("id");
    const [rating, setRating] = useState<number>(0);
    const [comment, setComment] = useState<string>("");
    const [noti, setNoti] = useState<string | null>(null);
    const [editCommentId, setEditCommentId] = useState<string>("");
    const [editedComment, setEditedComment] = useState("");
    const [comments, setComments] = useState<Review[] | null>(null);
    const username = getCookie("username") as string;
    const role = getCookie("role") as string;
    console.log("Cookie: " + username);
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
                    console.log(data.data);
                    setBook(data.data);
                    setComments(data.data.reviews);
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
    const getComments = () => {
        const headers = new Headers();
        headers.append("Accept", "application/json");
        headers.append("Content-Type", "application/json");
        headers.append("Authorization", getCookie("token") as string);
        fetch(process.env.BACKEND_URL + `api/v1/comment/book/${book?.id}`, {
            method: "GET",
            headers: headers,
        })
            .then((response) => {
                if (!response.ok) console.error(response.status);
                return response.json();
            })
            .then((body) => {
                setComments(body.data as Review[]);
            });
    };
    const deleteBook = async () => {
        try {
            const headers = new Headers();
            headers.append("Accept", "application/json");
            headers.append("Content-Type", "application/json");
            headers.append("Authorization", getCookie("token") as string);
            const response = await fetch(
                process.env.BACKEND_URL + "api/v1/book/" + id,
                {
                    method: "DELETE",
                    headers: headers,
                }
            );

            if (!response.ok) {
                throw new Error("Failed to fetch data");
            }
            const data = await response.json();
            if (data.success === true) {
                router.push("/");
                setNoti("Xóa sách thành công");
            } else {
                setNoti("Xóa ko thành công");
                console.log("Failed to delete");
            }
        } catch (error) {
            console.error("Error:", error);
        }
    };
    const handleDeleteComment = (indexToRemove: string) => {
        console.log(indexToRemove);
        const headers = new Headers();
        headers.append("Accept", "application/json");
        headers.append("Content-Type", "application/json");
        headers.append("Authorization", getCookie("token") as string);
        fetch(process.env.BACKEND_URL + `/api/v1/comment/` + indexToRemove, {
            method: "DELETE",
            headers: headers,
        }).then((response) => {
            if (!response.ok) {
                console.error(response.status);
            } else {
                getComments();
                setNoti("Xóa comment thành công")
            }
            return;
        });
        return;
    };
    const handleEditComment = (commentId: string) => {
        setEditCommentId(commentId);
        if (comments) {
            const foundComment = comments.find(
                (comment) => comment.id === commentId
            );
            if (foundComment) {
                setEditedComment(foundComment.content.toString());
            } else {
                console.error(`Không tìm thấy comment với id: ${commentId}`);
            }
        } else {
            console.error("Không có danh sách comment");
        }
    };
    const handleSaveEdit = async (
        commentId: string,
        newComment: string,
        star: number
    ) => {
        const headers = new Headers();
        headers.append("Accept", "application/json");
        headers.append("Content-Type", "application/json");
        headers.append("Authorization", getCookie("token") as string);
        fetch(process.env.BACKEND_URL + `api/v1/comment/`+commentId, {
            method: "PUT",
            headers: headers,
            body: JSON.stringify({
                star: star,
                content: newComment,
            }),
        }).then((response) => {
            if (!response.ok) {
                console.error(response.status);
            } else {
                getComments();
            }
            setEditCommentId("");
            return;
        });
        setEditCommentId('');
        return;
    };

    const handleCancelEdit = () => {
        setEditCommentId(''); // Hủy chế độ chỉnh sửa
        // Đặt lại nội dung chỉnh sửa về rỗng để không giữ lại dữ liệu đã chỉnh sửa
        setEditedComment("");
    };
    const postComment = async () => {
        setComment(comment.trim());
        if (comment === "" || 0 > rating || 5 < rating || !book) {
        return;
        }
        try {
            const headers = new Headers();
            headers.append("Accept", "application/json");
            headers.append("Content-Type", "application/json");
            headers.append("Authorization", getCookie("token") as string);
            const response = await fetch(
                process.env.BACKEND_URL + "api/v1/comment",
                {
                    method: "POST",
                    headers: headers,
                    body: JSON.stringify({
                        star: rating,
                        content: comment,
                        book_id: book.id
                    }),
                }
            );

            if (!response.ok) {
                throw new Error("Failed to fetch data");
            }
            const data = await response.json();
            if (data.success === true) {
                setRating(0);
                setComment("");
                getComments();
            } else {
                console.error(response.status);
            }
        } catch (error) {
            console.error("Error:", error);
        }
    };

    if (!book || loading) {
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
                    {noti && (
                        <Popup message={noti} close={() => setNoti(null)} />
                    )}
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
                            {
                                role === "1" && (
                                    <div className="flex flex-row justify-end items-center px-6 pt-4 space-x-4">
                                        <Button className="iconButton">
                                            <Link href={`/book/edit?id=${book.id}`}>
                                                <FiEdit size={20} />
                                            </Link>
                                        </Button>

                                        <Button
                                            onClick={deleteBook}
                                            className="iconButton"
                                        >
                                            <AiOutlineDelete size={20} />
                                        </Button>
                                    </div>
                                )
                            }

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
                                            {comments?.map((value, index) => (
                                                <div
                                                    key={index}
                                                    className="flex flex-col bg-[#f0eee3] px-3 py-2 rounded-xl"
                                                >
                                                    <div className="flex flex-row justify-between">
                                                        <span className="font-bold">
                                                            {value.fullname}
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
                                                                                value.id,
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
                                                                            value.content
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
                                                            username && (
                                                            <div>
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
                                                                                value.id
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
