"use client";
import Button from "@/components/Button";
import Popup from "@/components/Popup";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { hasCookie, setCookie } from "cookies-next";
import { FormEvent, useEffect, useState } from "react";
import Translate from "@/language/translate";


export default function Login() {
  const router = useRouter();
  const [loading, setLoading] = useState<boolean>(false);
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [noti, setNoti] = useState<string | null>(null);

  useEffect(() => {
    if (hasCookie("token")) {
      router.push("/home");
      return;
    }
  }, [router]);
  
  const handleLogin = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    
    if (username.trim() === "" || password === "") {
      setNoti("Vui lòng nhập tên đăng nhập và mật khẩu");
      return;
    }
    
    setLoading(true);
    try {
      const response = await fetch(process.env.BACKEND_URL +"api/v1/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify({
          username: username.trim(),
          password: password,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch data");
      }

      const data = await response.json();

      if (data.success === true && data.data.token) {
        setCookie("token", data.data.token);
        setCookie("username", username.trim());
        setCookie("role", data.data.role);
        router.push("/");
      } else {
        const message = Translate("VI", data.msg);
        setNoti(message);
      }
    } catch (error) {
      setNoti("Đã xảy ra lỗi trong quá trình xử lý đăng nhập");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-row h-full justify-center items-center overflow-hidden">
      {noti && <Popup message={noti} close={() => setNoti(null)} />}

      <div className="flex-1 flex flex-col space-y-6 items-center justify-center">
        <form onSubmit={handleLogin}>
          <div className="flex flex-col items-center justify-center h-full space-y-6">
            <h3 className="text-center uppercase font-bold text-3xl mb-4">
              Đăng nhập
            </h3>

            <div className="flex flex-col space-y-6">
              <div className="inputWrap">
                <label htmlFor="username" className="inputLabel">
                  Tên đăng nhập
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setUsername(e.target.value)
                  }
                  className="inputField w-96"
                />
              </div>

              <div className="inputWrap">
                <label htmlFor="password" className="inputLabel">
                  Mật khẩu
                </label>

                <input
                  type="password"
                  value={password}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setPassword(e.target.value)
                  }
                  className="inputField w-96"
                />
              </div>
            </div>

            <Button type="submit" loading={loading}>
              Đăng nhập
            </Button>
          </div>
        </form>

        <div className="flex flex-row items-center space-x-1">
          <div className="h-[1px] bg-gray-300 w-24"></div>
          <p className="uppercase text-xs">Hoặc</p>
          <div className="h-[1px] bg-gray-300 w-24"></div>
        </div>

        <Link href={"/register"}>
          <Button type="button">Đăng ký</Button>
        </Link>
      </div>
    </div>
  );
}

