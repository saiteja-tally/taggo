import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { HiHome } from "react-icons/hi";
import { FaSpinner, FaHistory } from "react-icons/fa";
import BACKEND_URLS from "@/app/BackendUrls";
import AccountDetails from "@/app/utils/AccountDetails";
import axiosInstance from "@/app/utils/axiosInstance";

interface TriageHeaderProps {
  doc_id: string | null;
  status: string | null;
  username: string | null;
  history: any[];
}

const TriageHeader: React.FC<TriageHeaderProps> = ({ doc_id, status, history, username }) => {
  const [homeReady, setHomeReady] = useState<boolean>(false);
  const [showHistory, setShowHistory] = useState<boolean>(false);

  const handleNextClick = async () => {
    if (!doc_id) {
    console.error("Document ID is missing");
      return;
    }
    try {
      const response = await axiosInstance.get(`${BACKEND_URLS.get_next}/${doc_id}/`, {
        headers: {
          "Content-Type": "application/json",
        }
      });

      if (response.status !== 200) {
        throw new Error("Network response was not ok");
      }
      const data = response.data;
      if (data.status === "success") {
        const annotation = data.annotation;
        if (annotation){
        window.location.href = `/triage?doc_id=${annotation.id}&history=${JSON.stringify(annotation.history)}&status=${annotation.status}&username=${username}`;;
        }
        else{
          alert("You are at the last document");
        }
      } else {
        alert(`Failed to get next document: ${data.message}`);
      }
    } catch (error) {
      console.error("Failed to send option:", error);
    }
  };

  const handlePrevClick = async () => {
    if (!doc_id) {
      console.error("Document ID is missing");
      return;
    }
    try {
      const response = await axiosInstance.get(`${BACKEND_URLS.get_prev}/${doc_id}/`, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.status !== 200) {
        throw new Error("Network response was not ok");
      }

      const data = response.data;
      if (data.status === "success") {
        const annotation = data.annotation;
        if (annotation){
          window.location.href = `/triage?doc_id=${annotation.id}&history=${JSON.stringify(annotation.history)}&status=${annotation.status}&username=${username}`;;
          }
          else{
            alert("You are at the first document");
          }
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
    <div className="flex justify-between items-center bg-gradient-to-r from-blue-300 to-gray-200 p-1 sm:p-1 md:p-2 lg:p-3 xl:p-4 shadow-lg border-black border">
      <Link
        href="/"
        className="text-teal-900 hover:underline flex items-center"
        onClick={() => setHomeReady(true)}
      >
        <HiHome className="m-1 text-2xl" />
        <p className="m-1 text-lg font-semibold">Home</p>
      </Link>

      <h1 className="text-2xl font-bold text-teal-900">Taggo</h1>
      <div className="flex items-center text-teal-900 relative">
        <div className="p-1 relative group">
          <button
            className="m-1 text-white bg-gradient-to-r from-blue-500 to-cyan-300 hover:bg-gradient-to-br px-4 py-2 rounded-lg shadow-md"
            onClick={handlePrevClick}
          >
            &lt; Prev
          </button>
        </div>
        <div className="flex flex-col">

          <div className="flex items-center space-x-2">
            <p className="font-semibold text-lg">Doc ID:</p>
            <p className="text-lg text-gray-700">{doc_id}</p>
          </div>
          <div className="flex m-1 items-center space-x-2">
            <FaHistory
              className="text-xl text-gray-700 hover:text-blue-500 cursor-pointer"
              onClick={() => setShowHistory(!showHistory)}
            />
            <p className="text-gray-700">{history ? `${history[history.length - 1]}` : ""}</p>
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
            className="m-1 text-white bg-gradient-to-r from-cyan-300 to-blue-500 hover:bg-gradient-to-bl px-4 py-2 rounded-lg shadow-md"
            onClick={handleNextClick}
          >
            Next &gt;
          </button>
        </div>
        <AccountDetails username={username} />
      </div>
    </div>
  );
};

export default TriageHeader;
