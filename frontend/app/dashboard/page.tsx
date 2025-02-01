"use client"
import React, { useState } from 'react';
import Tile from './components/Tile';
import UserAnnotationsData from './components/UserAnnotationsData';
import Link from "next/link";
import { HiHome } from "react-icons/hi";
import { FaSpinner } from "react-icons/fa";
import SelectUser from './components/SelectUser';

const Dashboard: React.FC = () => {
    const [homeReady, setHomeReady] = useState<boolean>(false);
    const [selectedUsername, setSelectedUsername] = useState<string | null>(null);

    if (homeReady) {
        return (
            <div className="flex justify-center items-center h-screen">
                <FaSpinner className="m-4 animate-spin text-4xl" />
            </div>
        )
    }

    const handleUserChange = (username: string) => {
        if (username === '') {
            setSelectedUsername(null);
            return;
        }
        else {
            setSelectedUsername(username);
        }
    }

    return (
        <div className="">
            <header className="flex justify-between items-center bg-white p-4 shadow-md bg-gradient-to-r from-blue-300 to-gray-200">
                <Link
                    href="/"
                    className="text-teal-900 hover:underline flex items-center"
                    onClick={() => setHomeReady(true)}
                >
                    <HiHome className="m-1 text-2xl" />
                    <p className="m-1 text-lg font-semibold">Home</p>
                </Link>
                <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
            </header>
            <main className="mt-4">
                <Tile />
                <div className="mt-4">
                    <SelectUser selectedUsername={selectedUsername} handleUserChange={handleUserChange} />
                </div>
                <div className="mt-4">
                    <UserAnnotationsData selectedUsername={selectedUsername} />
                </div>
            </main>
        </div>
    );
};

export default Dashboard;