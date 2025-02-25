"use client"
import React, { useState, useEffect } from 'react';
import Tile from './components/Tile';
import { UserDashboard } from './components/UserAnnotationsData';
import Link from "next/link";
import { HiHome } from "react-icons/hi";
import SelectUser from './components/SelectUser';

interface UserData {
    is_superuser: boolean;
    username: string;
    groups: string[];
}

interface UserSelection {
    username: string;
    group: string;
}

const Dashboard: React.FC = () => {
    const [homeReady, setHomeReady] = useState<boolean>(false);
    const [selectedUserAndGroup, setSelectedUserAndGroup] = useState({ username: '', group: '' });
    const [userData, setUserData] = useState<UserData | null>(null);

    useEffect(() => {
        const storedUserData = localStorage.getItem('userData');

        if (storedUserData) {
            const parsedUserData: UserData = JSON.parse(storedUserData);
            setUserData(parsedUserData);
            console.log("storedUserData", parsedUserData);
        }
    }, []);

    if (homeReady) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="loader border-t-4 border-blue-500 rounded-full w-12 h-12 mx-auto animate-spin"></div>
            </div>
        )
    }

    const handleUserChange = (selection: UserSelection | null) => {
        if (selection === null) {
            setSelectedUserAndGroup({ username: '', group: '' });
        } else {
            setSelectedUserAndGroup(selection);
        }
    };


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
                {userData?.is_superuser ?
                    (
                        <>
                            <Tile />
                            <div className="mt-4">
                                <SelectUser handleUserChange={handleUserChange} />
                            </div>
                            <div className="mt-4">
                                <UserDashboard username={selectedUserAndGroup.username}
                                    role={selectedUserAndGroup.group}
                                />
                            </div>
                        </>
                    ) : (
                        <div className="mt-4">
                            <UserDashboard username={userData?.username ?? null}
                                role={userData?.groups[0] ?? null}
                            />
                        </div>
                    )
                }
            </main>
        </div>
    );
};

export default Dashboard;