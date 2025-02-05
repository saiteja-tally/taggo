"use client"
import { useState } from 'react';
import axios from 'axios';
import LoginHeader from './components/LoginHeader';

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(false);

    interface LoginResponse {
        access: string;
        refresh: string;
    }

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await axios.post<LoginResponse>("/token/", {
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

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen bg-gray-100 animate-fadeIn">
                <div className="p-8 rounded-lg shadow-lg bg-white max-w-md w-full text-center animate-pulse">
                    <h1 className="text-2xl text-gray-800 mb-4">Logging In as {username}...</h1>
                    <div className="loader border-t-4 border-blue-500 rounded-full w-12 h-12 mx-auto animate-spin"></div>
                </div>
            </div>
        );
    }

    return (
        <div>
            <LoginHeader />
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
        </div>
    );
};

export default Login;
