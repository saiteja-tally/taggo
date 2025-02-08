"use client"
import { useState } from "react";
import axiosInstance from "../utils/axiosInstance";
import LoginHeader from "../login/components/LoginHeader";

export default function ChangePasswordForm() {
    const [oldPassword, setOldPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [reEnterPassword, setReEnterPassword] = useState("");
    const [message, setMessage] = useState("");
    const [isError, setIsError] = useState(false);

    interface ChangePasswordResponse {
        error?: string;
    }

    const handleChangePassword = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
        e.preventDefault();
        setMessage("");
        setIsError(false);

        if (newPassword !== reEnterPassword) {
            setMessage("New passwords do not match.");
            setIsError(true);
            return;
        }

        try {
            const response = await axiosInstance.post("/change_password/", 
                {
                    old_password: oldPassword,
                    new_password: newPassword,
                },
            );

            const data: ChangePasswordResponse = response.data;
            if (response.status === 200) {
                setMessage("Password changed successfully!");
                setIsError(false);
                window.location.href = "/login";
            } else {
                setMessage(data.error || "Error changing password");
                setIsError(true);
            }
        } catch (error) {
            setMessage("An error occurred. Please try again.");
            setIsError(true);
        }
    };

    return (
        <div>
        <LoginHeader />

        <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center">
            <div className="bg-white shadow-md rounded-lg p-8 max-w-md w-full">
                <h2 className="text-2xl font-bold mb-6 text-center">Change Password</h2>
                <form onSubmit={handleChangePassword} className="space-y-6">
                    <input
                        type="password"
                        placeholder="Old Password"
                        value={oldPassword}
                        onChange={(e) => setOldPassword(e.target.value)}
                        className="border border-gray-300 p-3 w-full rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                    />
                    <input
                        type="password"
                        placeholder="New Password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="border border-gray-300 p-3 w-full rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                    />
                    <input
                        type="password"
                        placeholder="Re-enter New Password"
                        value={reEnterPassword}
                        onChange={(e) => setReEnterPassword(e.target.value)}
                        className="border border-gray-300 p-3 w-full rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                    />
                    <button type="submit" className="bg-blue-500 text-white px-4 py-3 w-full rounded-lg hover:bg-blue-600 transition duration-300">
                        Change Password
                    </button>
                </form>
                {message && (
                    <p className={`mt-4 text-center ${isError ? 'text-red-500' : 'text-green-500'}`}>
                        {message}
                    </p>
                )}
            </div>
        </div>
        </div>
    );
}
