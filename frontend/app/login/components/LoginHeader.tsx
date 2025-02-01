import React from 'react';
import Image from "next/image";


const LoginHeader: React.FC = () => {
    return (
        <div className="flex justify-between bg-gradient-to-r from-blue-300 to-gray-200 rounded-md sm:p-1 md:p-2 lg:p-3 xl:p-4 shadow-lg">
            <div className="flex items-center">
                <Image
                    src={"/Tally-Logo.webp"}
                    alt="Image"
                    width={100}
                    height={100}
                    className="rounded-full"
                />
            </div>
            <h1 className="text-3xl font-bold text-teal-900 sm:p-0 md:p-1 lg:p-2 xl:p-3">
                Taggo
            </h1>
        </div>
    );
};

export default LoginHeader;