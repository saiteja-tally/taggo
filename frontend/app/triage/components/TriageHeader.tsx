import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { HiHome } from "react-icons/hi";
import { FaSpinner, FaHistory } from "react-icons/fa";
import BACKEND_URLS from "@/app/BackendUrls";

interface TriageHeaderProps {
  doc_id: string | null;
  status: string | null;
  history: any[];
}

const TriageHeader: React.FC<TriageHeaderProps> = ({ doc_id, status, history }) => {
  const [homeReady, setHomeReady] = useState<boolean>(false);
  const [showHistory, setShowHistory] = useState<boolean>(false);

  const handleNextClick = async () => {
    if (!doc_id) {
      console.error("Document ID is missing");
      return;
    }
    try {
      const response = await fetch(`${BACKEND_URLS.getNextDocID}/${doc_id}/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status }),
      });

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const data = await response.json();
      if (data.status === "success") {
        const { next_doc_id } = data;
        window.location.href = `/triage?doc_id=${next_doc_id}&status=${status}`;
      } else {
        alert(`Failed to get next document: ${data.message}`);
      }
    } catch (error) {
      console.error("Failed to send option:", error);
    }
  };

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (event.altKey && event.key === "n") {
        event.preventDefault();
        handleNextClick();
      }
    },
    [handleNextClick]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleKeyDown]);

  if (homeReady) {
    return (
      <div className="flex items-center justify-center h-screen">
        <FaSpinner className="animate-spin text-4xl text-blue-600" />
      </div>
    );
  }

  return (
    <div className="flex justify-between items-center bg-gradient-to-r from-blue-300 to-gray-200 p-1 shadow-lg border-black border">
      <Link
        href="/"
        className="text-teal-900 hover:underline flex items-center"
        onClick={() => setHomeReady(true)}
      >
        <HiHome className="m-1 text-2xl" />
        <p className="m-1 text-lg font-semibold">Home</p>
      </Link>

      <h1 className="text-2xl font-bold text-teal-900">InPar</h1>
      <div className="flex items-center text-teal-900 relative">
        <div className="flex flex-col space-y-2">
          <div className="flex items-center space-x-2">
            <p className="font-semibold text-lg">Doc ID:</p>
            <p className="text-lg text-gray-700">{doc_id}</p>
          </div>
          <div className="flex m-1 items-center space-x-2">
            <FaHistory
              className="text-xl text-gray-700 hover:text-blue-500 cursor-pointer"
              onClick={() => setShowHistory(!showHistory)}
            />
            <p className="text-gray-700">{history ? `${history[history.length-1]}` : ""}</p>
          </div>

          {showHistory && (
            <div className="absolute top-16 left-0 right-0 z-50 bg-white border border-gray-300 shadow-lg p-4 rounded-lg max-h-64 overflow-y-auto">
              <h3 className="text-lg font-bold text-teal-900 mb-2">History</h3>
              {history && history.length > 0 ? (
          <ul className="text-gray-700">
            {history.map((item, index) => (
              <li key={index} className="py-1 border-b last:border-none">
                {item}
              </li>
            ))}
          </ul>
              ) : (
          <p className="text-gray-500">No history available.</p>
              )}
            </div>
          )}
        </div>
        <div className="p-1 relative group border">
          <button
            className="m-3 text-white bg-gradient-to-r from-cyan-300 to-blue-500 hover:bg-gradient-to-bl px-4 py-2 rounded-lg shadow-md"
            onClick={handleNextClick}
          >
            Next &gt;
          </button>
          <div className="absolute left-1/2 transform -translate-x-1/2 bottom-full mb-2 hidden group-hover:block bg-blue-900 text-white text-xs rounded py-1 px-2">
            Alt+N
          </div>
        </div>
      </div>
    </div>
  );
};

export default TriageHeader;
