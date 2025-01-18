"use client";
import Image from "next/image";
import { useState, ChangeEvent } from "react";
import BACKEND_URLS from "../BackendUrls";
import axiosInstance from "../utils/axiosInstance";

interface HomeHeaderProps {
  username: string | null;
}

interface FileUploadEvent extends ChangeEvent<HTMLInputElement> {
  target: HTMLInputElement & EventTarget;
}

const HomeHeader = ({ username }: HomeHeaderProps) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showLogout, setShowLogout] = useState<boolean>(false);

  const handleLogout = (): void => {
    localStorage.removeItem('access_token');
    window.location.href = '/login';
  };

  const handleFileUpload = async (event: FileUploadEvent): Promise<void> => {
    const files = event.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      const formData = new FormData();
      formData.append("document", file);

      try {
        setIsLoading(true); // Set loading state to true

        const response = await axiosInstance.post(
          BACKEND_URLS.upload_document,
          formData, // Pass FormData directly
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );

        if (response.status === 200) {
          console.log("File uploaded successfully");
          window.location.reload(); // Reload the page
        } else {
          console.error("Failed to upload file:", response.statusText);
        }
      } catch (error: any) {
        console.error("Error during file upload:", error.response?.data.message || error.message);
        alert("Error during file upload: " + (error.response?.data.message || error.message));
      } finally {
        setIsLoading(false); // Set loading state back to false
      }
    }
  };

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
      <h1 className="text-2xl font-bold text-teal-900 sm:p-0 md:p-1 lg:p-2 xl:p-3">
        Tally-AI Invoice Parsing (In-House Model)
      </h1>
      <div className="flex items-center">
        <label
          htmlFor="file-upload"
          className={`cursor-pointer bg-gradient-to-r from-cyan-300 to-blue-500 hover:bg-gradient-to-bl text-black sm:p-0 md:p-1 lg:p-2 xl:p-3 rounded-xl flex items-center transition duration-100 ${isLoading ? "opacity-50 pointer-events-none" : ""
            }`}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6 mr-2"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M12 6v6m0 0v6m0-6h6m-6 0H6"
            ></path>
          </svg>
          {isLoading ? "Uploading..." : "Upload File"}
        </label>
        <input
          id="file-upload"
          type="file"
          accept=".pdf, .doc, .docx, .jpeg, .png, .jpg"
          className="hidden"
          onChange={handleFileUpload}
        />
        <div
          className="ml-4 text-lg font-semibold text-teal-900 flex items-center relative"
          title={username ? `Logged in as ${username}` : 'Welcome!'}
          aria-label={username ? `Logged in as ${username}` : 'Welcome!'}
        >
          {username ? (
            <div
              className="w-10 h-10 flex items-center justify-center bg-teal-900 text-white rounded-full cursor-pointer hover:bg-teal-800 transition duration-150"
              onClick={() => setShowLogout(!showLogout)}
            >
              {username.charAt(0).toUpperCase()}
            </div>
          ) : (
            <span>Welcome!</span>
          )}

          {showLogout && (
            <div className="absolute top-full mt-2 right-0 bg-white border border-gray-300 rounded-md shadow-lg p-4 w-48 z-50">
              <p className="text-gray-700 mb-4 text-center">
                Logged in as <strong>{username}</strong>
              </p>
              <button
                className="w-full bg-red-500 text-white py-1 rounded-md hover:bg-red-600 focus:ring-2 focus:ring-red-400 transition duration-150"
                onClick={handleLogout}
              >
                Logout
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

export default HomeHeader;
