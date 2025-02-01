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

const AccountMenu: React.FC<{ userData: AccountDetailsProps['userData'], dashboardLoading: boolean, onDashboardClick: () => void }> = ({ userData, dashboardLoading, onDashboardClick }) => {
    const [logingout, setLogingout] = useState<boolean>(false);
    
    const handleLogout = useCallback((): void => {
        setLogingout(true);
        localStorage.removeItem('access_token');
        window.location.href = '/login';
    }, []);
    
    return(
    <div className="absolute top-full mt-2 right-0 bg-white border border-gray-300 rounded-md shadow-lg p-4 w-48 z-50">
        <p className="text-gray-700 mb-4 text-center">
            <strong>{userData.username}</strong>
        </p>
        {userData.is_superuser && (
            <Link href="/dashboard"
                onClick={onDashboardClick}
                className="block text-lg font-semibold text-blue-700 hover:text-blue-900 transition duration-150 mb-2 text-center flex items-center justify-center"
            >
                Dashboard
                {dashboardLoading && (
                    <div className="loader border-t-4 border-blue-500 rounded-full w-4 h-4 ml-2 animate-spin"></div>
                )}
            </Link>
        )}
        <Link href="/set-password"
            className="block text-lg font-semibold text-blue-700 hover:text-blue-900 transition duration-150 mb-2 text-center">
            Change Password
        </Link>
        <button
            className="w-full bg-red-500 text-white py-2 rounded-md hover:bg-red-600 focus:ring-2 focus:ring-red-400 transition duration-150 flex items-center justify-center"
            onClick={handleLogout}
        >
            Logout
            {logingout && (
            <div className="loader border-t-4 border-white rounded-full w-4 h-4 ml-2 animate-spin"></div>
            )}
        </button>
    </div>
)};

const AccountDetails: React.FC<AccountDetailsProps> = ({ userData }) => {
    const [showLogout, setShowLogout] = useState<boolean>(false);
    const [dashboardLoading, setDashboardLoading] = useState<boolean>(false);
    const menuRef = useRef<HTMLDivElement>(null);

    

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

    const handleDashboardClick = () => {
        setDashboardLoading(true);
    }

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
                    <AccountMenu userData={userData} dashboardLoading={dashboardLoading} onDashboardClick={handleDashboardClick} />
                </div>
            )}
        </div>
    );
};

export default AccountDetails;
