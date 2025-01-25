import React, { use } from 'react';
import Select from "react-select";
import { useState, useEffect } from 'react';
import axiosInstance from './axiosInstance';

interface SmartAssignProps {
    handleCloseClick: () => void;
    handleSmartAssign: (status: string | null, userGroup: string | null, percentage: number | null) => void;
}

const SmartAssign: React.FC<SmartAssignProps> = ({ handleCloseClick, handleSmartAssign }) => {
    // define state variables
    const [status, setStatus] = useState<string | null>(null);
    const [userGroup, setUserGroup] = useState<string | null>(null);
    const [percentage, setPercentage] = useState<number | null>(50);
    const [groupsWithUsers, setGroupsWithUsers] = useState<Record<string, string[]> | null>(null);
    const [statusWithCount, setStatusWithCount] = useState<Record<string, number> | null>(null);
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        const fetchData = async () => {
            const response = await axiosInstance.get('/get_smart_assign_data');
            setGroupsWithUsers(response.data.groups);
            setStatusWithCount(response.data.status);
            setLoading(false);
        };
        fetchData();
    }, [])

    if (loading) {
        return <div className="text-center p-6">Loading...</div>;
    }

    return (
        <div className="w-full max-w-lg p-8 rounded-lg text-center shadow-lg bg-blue-50 text-blue-900 border border-blue-200 relative">
            <button
                className="absolute top-2 right-2 text-blue-500 hover:text-blue-700"
                onClick={() => handleCloseClick()}
            >
                &times;
            </button>
            <h2 className="text-3xl font-semibold mb-6">Smart Assign</h2>
            <div className="flex flex-col text-left mb-4">
                <h3 className="font-semibold text-xl mb-2">Status:</h3>
                <Select
                    placeholder="Select status"
                    options={statusWithCount ? Object.keys(statusWithCount).map((status) => ({ value: status, label: `${status} (${statusWithCount[status]})` })) : []}
                    onChange={(selectedOption) => setStatus(selectedOption?.value || null)}
                    className="w-full"
                />
            </div>
            <div className="mb-6">
                <input
                    type="range"
                    min="0"
                    max="100"
                    value={percentage || 50}
                    onChange={(e) => setPercentage(Number(e.target.value))}
                    className="w-full"
                />
                <div className="text-left mt-2">Percentage: <span className="font-bold">{percentage}%</span></div>
            </div>
            <div className="flex flex-col text-left mb-4">
                <h3 className="font-semibold text-xl mb-2">User Group:</h3>
                <Select
                    placeholder="Select user group"
                    options={groupsWithUsers ? Object.keys(groupsWithUsers).map((group) => ({ value: group, label: group })) : []}
                    onChange={(selectedOption) => setUserGroup(selectedOption?.value || null)}
                    className="w-full"
                />
            </div>
            {(userGroup && (groupsWithUsers?.[userGroup] || []).length > 0) && (
                <div className="mb-6 text-left">
                    <h3 className="font-semibold mb-2">Users in {userGroup}:</h3>
                    <ul className="list-disc list-inside text-sm text-blue-800">
                        {groupsWithUsers && groupsWithUsers[userGroup].map((user) => (
                            <li key={user}>{user}</li>
                        ))}
                    </ul>
                </div>
            )}
            <button
                onClick={() => handleSmartAssign(status, userGroup, percentage)}
                className={`px-6 py-3 rounded-lg transition duration-300 ${!status || !userGroup || !percentage ? 'bg-blue-300 cursor-not-allowed' : 'bg-blue-500 text-white hover:bg-blue-600'}`}
                disabled={!status || !userGroup || !percentage}
            >
                Assign
            </button>
        </div>
    )
}

export default SmartAssign;
