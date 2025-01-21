import { useState } from 'react';

const AccountDetails = ({ username }: { username: string | null }) => {
    const [showLogout, setShowLogout] = useState<boolean>(false);

    const handleLogout = (): void => {
        localStorage.removeItem('access_token');
        window.location.href = '/login';
    };

    return (
        <div
            className="ml-4 text-lg font-semibold text-teal-900 flex items-center relative"
            title={username ? `Logged in as ${username}` : 'Welcome!'}
            aria-label={username ? `Logged in as ${username}` : 'Welcome!'}
        >
            {username ? (
                <div
                    className="w-10 h-10 flex items-center justify-center bg-teal-900 text-white rounded-full cursor-pointer hover:bg-teal-800 transition duration-150"
                    onClick={() => setShowLogout(!showLogout)}
                >
                    {username.charAt(0).toUpperCase()}
                </div>
            ) : (
                <span>Welcome!</span>
            )}

            {showLogout && (
                <div className="absolute top-full mt-2 right-0 bg-white border border-gray-300 rounded-md shadow-lg p-4 w-48 z-50">
                    <p className="text-gray-700 mb-4 text-center">
                        Logged in as <strong>{username}</strong>
                    </p>
                    <button
                        className="w-full bg-red-500 text-white py-1 rounded-md hover:bg-red-600 focus:ring-2 focus:ring-red-400 transition duration-150"
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