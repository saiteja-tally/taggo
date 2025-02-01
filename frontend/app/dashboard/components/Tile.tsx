import React, { useState, useEffect } from 'react';
import axiosInstance from '@/app/utils/axiosInstance';

const Tile = () => {
    const [data, setData] = useState<{
        total: number;
        inprogress: {
            [key: string]: number;
        };
        done: number;
    } | null>(null);

    useEffect(() => {
        const fetchAnnotationsCount = async () => {
            const response = await axiosInstance.get('/get_annotations_count');
            setData(response.data);
        };
        fetchAnnotationsCount();
    }, []);

    return (
        <div className="tile bg-white shadow-md rounded-lg p-6">
            <h2 className="text-2xl text-center font-semibold text-gray-800 mb-4">
            Total Number of Annotations: {data ? data.total : 'Loading...'}
            </h2>
            <div className="flex justify-between mt-4">
            <div className="w-1/2 bg-blue-100 p-4 rounded-lg">
            <h3 className="text-lg font-medium text-blue-700 mb-2">
            In-Progress:
            {data
                ? Object.values(data.inprogress).reduce(
                (acc: number, count: number) => acc + count,
                0
                )
                : 'Loading...'}
            </h3>
            <ul className="list-disc list-inside text-blue-600">
            {data &&
                Object.entries(data.inprogress).map(([key, value]) => (
                <li key={key}>
                {key}: {value}
                </li>
                ))}
            </ul>
            </div>
            <div className="w-1/2 text-right bg-green-100 p-4 rounded-lg">
            <h3 className="text-lg font-medium text-green-700">
            Done: {data ? data.done : 'Loading...'}
            </h3>
            </div>
            </div>
        </div>
    );
};

export default Tile;