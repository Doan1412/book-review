"use client";
import Button from "@/components/Button";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function Register() {
    const router = useRouter();
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [first_name, setFirstName] = useState<string>("");
    const [last_name, setLastName] = useState<string>("");
    const [username, setUsername] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const [retype, setRetype] = useState<string>("");

    const handleForm = (event: React.SyntheticEvent) => {
        event.preventDefault();
        setError(null);
        setLoading(true);
        if (
            first_name.trim() === "" ||
            last_name.trim() === "" ||
            username.trim() === "" ||
            password === "" ||
            retype === ""
        ) {
            setError("Vui lòng nhập đủ các trường.");
            setLoading(false);
            return;
        }
        if (password !== retype) {
            setError("Mật khẩu được nhập không khớp.");
            setLoading(false);
            return;
        }
        const headers = new Headers();
        headers.append("Accept", "application/json");
        headers.append("Content-Type", "application/json");
        fetch(process.env.BACKEND_URL + "api/v1/auth", {
            method: "POST",
            headers: headers,
            body: JSON.stringify({
                first_name: first_name,
                last_name: last_name,
                username: username,
                password: password,
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
                        Đăng ký
                    </h3>

                    <div className="inputWrap">
                        <label htmlFor="first_name" className="inputLabel">
                            <span>Tên</span>
                            <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            value={first_name}
                            onChange={(
                                e: React.ChangeEvent<HTMLInputElement>
                            ) => {
                                setError(null);
                                setFirstName(e.target.value);
                            }}
                            className="inputField w-96"
                        />
                    </div>

                    <div className="inputWrap">
                        <label htmlFor="last_name" className="inputLabel">
                            <span>Họ</span>
                            <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            value={last_name}
                            onChange={(
                                e: React.ChangeEvent<HTMLInputElement>
                            ) => {
                                setError(null);
                                setLastName(e.target.value);
                            }}
                            className="inputField w-96"
                        />
                    </div>

                    <div className="inputWrap">
                        <label htmlFor="username" className="inputLabel">
                            <span>Tên đăng nhập</span>
                            <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            value={username}
                            onChange={(
                                e: React.ChangeEvent<HTMLInputElement>
                            ) => {
                                setError(null);
                                setUsername(e.target.value);
                            }}
                            className="inputField w-96"
                        />
                    </div>

                    <div className="inputWrap">
                        <label htmlFor="password" className="inputLabel">
                            <span>Mật khẩu</span>
                            <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="password"
                            value={password}
                            onChange={(
                                e: React.ChangeEvent<HTMLInputElement>
                            ) => {
                                setError(null);
                                setPassword(e.target.value);
                            }}
                            className="inputField w-96"
                        />
                    </div>

                    <div className="inputWrap">
                        <label htmlFor="retype" className="inputLabel">
                            <span>Nhập lại mật khẩu</span>
                            <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="password"
                            value={retype}
                            onChange={(
                                e: React.ChangeEvent<HTMLInputElement>
                            ) => {
                                setError(null);
                                setRetype(e.target.value);
                            }}
                            className="inputField w-96"
                        />
                    </div>

                    <div className="h-4">
                        {error ? <p className="errorMessage">{error}</p> : null}
                    </div>

                    <Button type="submit" loading={loading}>
                        Đăng ký
                    </Button>
                </form>

                <div className="flex flex-row items-center space-x-1">
                    <div className="h-[1px] bg-gray-300 w-24"></div>
                    <p className="uppercase text-xs">Hoặc</p>
                    <div className="h-[1px] bg-gray-300 w-24"></div>
                </div>

                <Link href={"/login"}>
                    <Button type="button">Đăng nhập</Button>
                </Link>
            </div>
        </div>
    );
}
