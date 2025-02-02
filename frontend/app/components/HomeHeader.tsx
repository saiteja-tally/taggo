"use client";
import Image from "next/image";
import { useState, ChangeEvent } from "react";
import BACKEND_URLS from "../BackendUrls";
import axiosInstance from "../utils/axiosInstance";
import AccountDetails from "../utils/AccountDetails";

interface HomeHeaderProps {
  userData: {
    username: string;
    email: string;
    groups: string[];
    is_superuser: boolean;
  } | null;
}

interface FileUploadEvent extends ChangeEvent<HTMLInputElement> {
  target: HTMLInputElement & EventTarget;
}

const HomeHeader = ({ userData }: HomeHeaderProps) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleFileUpload = async (event: FileUploadEvent): Promise<void> => {
    const files = event.target.files;
    if (files && files.length > 0) {
      setIsLoading(true); // Set loading state to true

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const formData = new FormData();
        formData.append("document", file);

        try {
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
          } else {
            console.error("Failed to upload file:", response.statusText);
          }
        } catch (error: any) {
          console.error("Error during file upload:", error.response?.data.message || error.message);
          alert("Error during file upload: " + (error.response?.data.message || error.message));
        }
      }
      setIsLoading(false); // Set loading state back to false
    }
    window.location.reload();
  };

  return (
    <div className="flex justify-between bg-gradient-to-r from-blue-300 to-gray-200 sm:p-1 md:p-2 lg:p-3 xl:p-4 shadow-lg">
        <Image
          src={"/Tally-Logo.webp"}
          alt="Image"
          width={100}
          height={100}
          className=""
        />
      <h1 className="text-3xl font-bold text-teal-900 sm:p-0 md:p-1 lg:p-2 xl:p-3">
        Taggo
      </h1>
      <div className="flex items-center space-x-4">

        <label
          htmlFor="file-upload"
          className={`cursor-pointer bg-gradient-to-r from-cyan-300 to-blue-500 hover:bg-gradient-to-bl text-black sm:p-1 md:p-2 lg:p-3 xl:p-4 rounded-xl flex items-center transition duration-100 ${isLoading ? "opacity-50 pointer-events-none" : ""
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
          {isLoading ? "Uploading..." : "Upload Files"}
        </label>
        <input
          id="file-upload"
          type="file"
          multiple
          accept=".pdf, .doc, .docx, .jpeg, .png, .jpg"
          className="hidden"
          onChange={handleFileUpload}
        />

        {userData ? (<AccountDetails userData={userData} />) :
          <div className="loader border-t-4 border-blue-500 rounded-full w-10 h-10 mx-auto animate-spin"></div>
        }
      </div>
    </div>
  );
}

export default HomeHeader;
