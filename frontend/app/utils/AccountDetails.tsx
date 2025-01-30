import { useState } from 'react';
import Link from "next/link";

interface AccountDetailsProps {
    userData: {
        username: string;
        email: string;
        is_superuser: boolean;
        groups: string[];
    };
}

const AccountDetails: React.FC<AccountDetailsProps> = ({ userData }) => {
    const [showLogout, setShowLogout] = useState<boolean>(false);

    const handleLogout = (): void => {
        localStorage.removeItem('access_token');
        window.location.href = '/login';
    };

    return (
        <div
            className="ml-4 text-lg font-semibold text-blue-900 flex items-center relative"
            title={userData.username ? `Logged in as ${userData.username}` : 'Welcome!'}
            aria-label={userData.username ? `Logged in as ${userData.username}` : 'Welcome!'}
        >
            {userData.username ? (
                <div
                    className="w-10 h-10 flex items-center justify-center bg-blue-900 text-white rounded-full cursor-pointer hover:bg-blue-800 transition duration-150"
                    onClick={() => setShowLogout(!showLogout)}
                >
                    {userData.username.charAt(0).toUpperCase()}
                </div>
            ) : (
                <span>Welcome!</span>
            )}

            {showLogout && (
                <div className="absolute top-full mt-2 right-0 bg-white border border-gray-300 rounded-md shadow-lg p-4 w-48 z-50">
                    <p className="text-gray-700 mb-4 text-center">
                        <strong>{userData.username}</strong>
                    </p>
                    {userData.is_superuser && (
                        <Link href="/dashboard"
                            className="block text-lg font-semibold text-blue-700 hover:text-blue-900 transition duration-150 mb-2 text-center">
                                Dashboard
                        </Link>
                    )}
                    <Link href="/set-password"
                        className="block text-lg font-semibold text-blue-700 hover:text-blue-900 transition duration-150 mb-2 text-center">
                            Change Password
                    </Link>
                    <button
                        className="w-full bg-blue-500 text-white py-1 rounded-md hover:bg-blue-600 focus:ring-2 focus:ring-blue-400 transition duration-150"
                        onClick={handleLogout}
                    >
                        Logout
                    </button>
                </div>
            )}
        </div>
    );
};

export default AccountDetails;
