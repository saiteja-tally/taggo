"use client"
import { useState } from 'react';
import { useSearchParams } from 'next/navigation';

export default function SetPassword() {
    const searchParams = useSearchParams();
    const uid = searchParams.get('uid');
    const token = searchParams.get('token')
    const [password, setPassword] = useState('');
    const [reEnterPassword, setReEnterPassword] = useState('');
    const [message, setMessage] = useState('');

    interface SetPasswordResponse {
        error?: string;
    }

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
        e.preventDefault();
        if (password !== reEnterPassword) {
            setMessage('Passwords do not match');
            return;
        }
        const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
        if (!apiUrl) {
            setMessage('API base URL is not defined');
            return;
        }
        const response = await fetch(apiUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ uid, token, password }),
        });

        const data: SetPasswordResponse = await response.json();
        if (response.ok) {
            window.location.href = '/login';
        } else {
            setMessage(data.error || 'Failed to set password');
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <div className="bg-white p-8 rounded shadow-md w-full max-w-md">
                <h1 className="text-2xl font-bold mb-6">Set Password</h1>
                {message && <p className="mb-4 text-green-500">{message}</p>}
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <input
                            type="password"
                            placeholder="new password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="w-full px-3 py-2 border rounded"
                        />
                    </div>
                    <div className="mb-4">
                        <input
                            type="password"
                            placeholder="re-enter new password"
                            value={reEnterPassword}
                            onChange={(e) => setReEnterPassword(e.target.value)}
                            required
                            className="w-full px-3 py-2 border rounded"
                        />
                    </div>
                    <button type="submit" className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600">
                        Set Password
                    </button>
                </form>
            </div>
        </div>
    );
}
