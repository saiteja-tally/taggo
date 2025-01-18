"use client"
import { useState } from 'react';
import axios from 'axios';
import BACKEND_URLS from '../BackendUrls';

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);

    interface LoginResponse {
        access: string;
        refresh: string;
    }

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        try {
            const response = await axios.post<LoginResponse>(BACKEND_URLS.fetchAccessToken, {
                username,
                password,
            });
            localStorage.setItem('access_token', response.data.access);
            localStorage.setItem('refresh_token', response.data.refresh);
            window.location.href = '/';
        } catch (err) {
            setError('Invalid credentials');
        }
    };

    return (
        <div className="flex justify-center items-center h-screen bg-gray-100">
            <div className="p-8 rounded-lg shadow-lg bg-white max-w-md w-full">
            <h1 className="text-center mb-6 text-2xl text-gray-800">Login</h1>
            {error && <p className="text-red-500 text-center">{error}</p>}
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <input
                type="text"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="p-3 rounded border border-gray-300"
                />
                <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="p-3 rounded border border-gray-300"
                />
                <button type="submit" className="p-3 rounded bg-blue-500 text-white hover:bg-blue-600">
                Login
                </button>
            </form>
            </div>
        </div>
    );
};

export default Login;
