"use client";
import { useEffect, useState } from "react";
import { getCookie, hasCookie } from "cookies-next";
import http from "../utils/http";
import { Button, Spinner, User } from "@nextui-org/react";
import Navigation from "@/components/Navigation";
import Popup from "@/components/Popup";
import { useRouter } from "next/navigation";
import { Userr } from "@/model/Userr";

export default function Profile() {
    const router = useRouter();
    const [loading, setLoading] = useState<boolean>(true);
    const [user, setUser] = useState<Userr>();
    useEffect(() => {
        async function fetchUserProfile() {
            if (!hasCookie("token")) {
                router.push("/login");
                return;
            }
            try {
                const headers = new Headers();
                headers.append("Accept", "application/json");
                headers.append("Content-Type", "application/json");
                headers.append("Authorization", getCookie("token") as string);
                const response = await fetch(
                    process.env.BACKEND_URL + "api/v1/user",
                    {
                        method: "GET",
                        headers: headers,
                    }
                );
                if (!response.ok) {
                    throw new Error("Failed to fetch data");
                }
                const data = await response.json();

                if (data.success === true) {
                    console.log(data.data);
                    setUser(data.data);
                    setLoading(false);
                } else {
                    console.log(data.error);
                    router.push("/");
                }
            } catch (error) {
                console.error("Error fetching user data:", error);
            }
        }

        fetchUserProfile();
    }, [router]);
    return (
        <div className="h-full flex flex-row">
            <Navigation />
            <div className="flex-1 overflow-auto">
                <div className="p-20">
                    <div className="flex flex-col items-center justify-center mt-20">
                        {user ? (
                            <div className="max-w-md w-full rounded-lg shadow-md overflow-hidden">
                                <div className="bg-gray-800 py-6 px-4">
                                <h1 className="text-2xl font-semibold text-white text-center">{user.last_name}'s Profile</h1>
                                </div>
                                <div className="p-6">
                                <div className="mb-4">
                                    <p className="text-gray-700 font-bold">Name:</p>
                                    <p className="text-gray-900">{user.first_name} {user.last_name}</p>
                                </div>
                                <div className="mb-4">
                                    <p className="text-gray-700 font-bold">Username:</p>
                                    <p className="text-gray-900">{user.username}</p>
                                </div>
                                <div className="mb-4">
                                    <p className="text-gray-700 font-bold">Role:</p>
                                    <p className="text-gray-900">{user.role === '0' ? 'User' : 'Admin'}</p>
                                </div>
                                <div className="mb-4">
                                    <p className="text-gray-700 font-bold">Created At:</p>
                                    <p className="text-gray-900">{user.created_at.toLocaleString()}</p>
                                </div>
                                <div className="mb-4">
                                    <p className="text-gray-700 font-bold">Updated At:</p>
                                    <p className="text-gray-900">{user.updated_at.toLocaleString()}</p>
                                </div>
                                {/* Add more user details as needed */}
                                </div>
                            </div>

                            ) : (
                                <div>
                                    {loading && (
                                        <div className="h-full flex items-center justify-center">
                                            < Spinner />
                                        </div>
                                    )}

                                </div>
                            )
                        }
                    </div>
                </div>
            </div>
        </div>
    );
}
