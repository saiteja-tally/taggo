"use client";
import Image from "next/image";
import { useState, ChangeEvent } from "react";
import BACKEND_URLS from "../BackendUrls";
import axiosInstance from "../utils/axiosInstance";
import AccountDetails from "../utils/AccountDetails";
import { PlusIcon } from "@heroicons/react/24/outline";


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
            '/upload_document',
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
    <div className="flex justify-between bg-gradient-to-r from-blue-300 to-gray-200 p-1 shadow-lg">
      <div className="flex items-center space-x-2">
        <Image
          src={"/Tally-Logo.webp"}
          alt="Image"
          width={60}
          height={60}
          className=""
        />
      </div>
      <h1 className="text-xl font-bold text-teal-900 p-1">
        Taggo
      </h1>
      <div className="flex items-center space-x-2">
        <label
          htmlFor="file-upload"
          className={`cursor-pointer text-sm bg-gradient-to-r from-cyan-300 to-blue-500 hover:bg-gradient-to-bl text-black p-1 rounded-lg flex items-center transition duration-100 ${isLoading ? "opacity-50 pointer-events-none" : ""
            }`}
        >
          <PlusIcon className="h-4 w-4 mr-1 text-gray-600" />

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
          <div className="loader border-t-4 border-blue-500 rounded-full w-6 h-6 mx-auto animate-spin"></div>
        }
      </div>
    </div>
  );
}

export default HomeHeader;
