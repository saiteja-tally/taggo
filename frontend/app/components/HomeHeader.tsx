"use client";
import Image from "next/image";
import { useState, ChangeEvent } from "react";
import BACKEND_URLS from "../BackendUrls";
import axiosInstance from "../utils/axiosInstance";
import AccountDetails from "../utils/AccountDetails";

interface HomeHeaderProps {
  username: string | null;
}

interface FileUploadEvent extends ChangeEvent<HTMLInputElement> {
  target: HTMLInputElement & EventTarget;
}

const HomeHeader = ({ username }: HomeHeaderProps) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);

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
      <h1 className="text-3xl font-bold text-teal-900 sm:p-0 md:p-1 lg:p-2 xl:p-3">
        Taggo
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
        <AccountDetails username={username} />

      </div>
    </div>
  );
}

export default HomeHeader;
