import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { HiHome } from "react-icons/hi";
import { FaHistory } from "react-icons/fa";
import axiosInstance from "@/app/utils/axiosInstance";

interface TriageHeaderProps {
  doc_id: string | null;
  history: any[];
  handlePrevClick: () => void;
  handleNextClick: () => void;
}

const TriageHeader: React.FC<TriageHeaderProps> = ({ doc_id,  history, handlePrevClick, handleNextClick}) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [showHistory, setShowHistory] = useState<boolean>(false);

  

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="loader border-t-4 border-blue-500 rounded-full w-12 h-12 mx-auto animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="flex justify-between items-center bg-gradient-to-r from-blue-300 to-gray-200 p-2 shadow-lg">
      <Link
        href="/"
        className="text-teal-900 hover:underline flex items-center"
        onClick={() => setLoading(true)}
      >
        <HiHome className="text-lg" />
        <p className="text-sm font-semibold">Home</p>
      </Link>

      <div className="flex items-center text-teal-900 relative">
        <button
          className="bg-gradient-to-r from-blue-500 to-cyan-300 hover:bg-gradient-to-br px-2 py-1 rounded-lg shadow-md text-sm"
          onClick={handlePrevClick}
        >
          &lt; Prev
        </button>
        <div className="flex flex-col mx-2">
          <div className="flex items-center space-x-1">
            <p className="font-semibold text-sm">Doc ID:</p>
            <p className="text-sm text-gray-700">{doc_id}</p>
          </div>
          <div className="flex items-center space-x-1">
            <FaHistory
              className="text-lg text-gray-700 hover:text-blue-500 cursor-pointer"
              onClick={() => setShowHistory(!showHistory)}
            />
            <p className="text-gray-700 text-sm">{history ? `${history[history.length - 1]}` : ""}</p>
          </div>

          {showHistory && (
            <div className="absolute top-16 left-0 right-0 z-50 bg-white border border-gray-300 shadow-lg p-2 rounded-lg max-h-64 overflow-y-auto">
              <h3 className="text-sm font-bold text-teal-900 mb-2">History</h3>
              {history && history.length > 0 ? (
                <ul className="text-gray-700 text-sm">
                  {history.map((item, index) => (
                    <li key={index} className="py-1 border-b last:border-none">
                      {item}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-500 text-sm">No history available.</p>
              )}
            </div>
          )}
        </div>
        <button
          className="bg-gradient-to-r from-cyan-300 to-blue-500 hover:bg-gradient-to-bl px-2 py-1 rounded-lg shadow-md text-sm"
          onClick={handleNextClick}
        >
          Next &gt;
        </button>
      </div>
    </div>
  );
};

export default TriageHeader;
