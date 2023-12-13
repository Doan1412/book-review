"use client";
import { deleteCookie, getCookie, hasCookie } from "cookies-next";
import Link from "next/link";
import { useEffect, useState } from "react";
import { FiLogIn, FiLogOut } from "react-icons/fi";
import { LuBookPlus } from "react-icons/lu";
import { TbHome } from "react-icons/tb";

export default function Navigation() {
  const navigateButton = [{ url: "/", icon: <TbHome size={25} /> }];
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    if (hasCookie("token")) {
      setToken(getCookie("token") as string);
    }
  }, []);

  return (
    <div className="h-full border-r border-gray-300 flex flex-col items-center justify-center p-2 space-y-2">
      {navigateButton.map((value, index) => {
        return (
          <Link href={value.url} key={index} className="iconButton">
            {value.icon}
          </Link>
        );
      })}

      {token ? (
        <div className="space-y-2 flex flex-col">
          <Link href={"/book/create"} className="iconButton">
            <LuBookPlus size={25} />
          </Link>

          <button
            onClick={() => {
              deleteCookie("token");
              setToken(null);
            }}
            className="iconButton"
          >
            <FiLogOut size={25} />
          </button>
        </div>
      ) : (
        <Link href={"/login"} className="iconButton">
          <FiLogIn size={25} />
        </Link>
      )}
    </div>
  );
}