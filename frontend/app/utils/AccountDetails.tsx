import { useState, useCallback, useEffect, useRef } from 'react';
import Link from "next/link";

interface AccountDetailsProps {
    userData: {
        username: string;
        email: string;
        is_superuser: boolean;
        groups: string[];
    };
}

const AccountMenu: React.FC<{ userData: AccountDetailsProps['userData'], onLogout: () => void }> = ({ userData, onLogout }) => (
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
            onClick={onLogout}
        >
            Logout
        </button>
    </div>
);

const AccountDetails: React.FC<AccountDetailsProps> = ({ userData }) => {
    const [showLogout, setShowLogout] = useState<boolean>(false);
    const menuRef = useRef<HTMLDivElement>(null);

    const handleLogout = useCallback((): void => {
        localStorage.removeItem('access_token');
        window.location.href = '/login';
    }, []);

    const handleClickOutside = useCallback((event: MouseEvent) => {
        if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
            setShowLogout(false);
        }
    }, []);

    useEffect(() => {
        if (showLogout) {
            document.addEventListener('mousedown', handleClickOutside);
        } else {
            document.removeEventListener('mousedown', handleClickOutside);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showLogout, handleClickOutside]);

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
                    aria-expanded={showLogout}
                    aria-controls="logout-menu"
                >
                    {userData.username.charAt(0).toUpperCase()}
                </div>
            ) : (
                null
            )}

            {showLogout && (
                <div ref={menuRef} id="logout-menu">
                    <AccountMenu userData={userData} onLogout={handleLogout} />
                </div>
            )}
        </div>
    );
};

export default AccountDetails;
