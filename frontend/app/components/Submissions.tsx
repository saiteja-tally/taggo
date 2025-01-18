"use client";
import { useState, useEffect, use } from "react";
import Link from "next/link";
import Select from "react-select";
import BACKEND_URLS from "../BackendUrls";
import { FaSpinner } from "react-icons/fa";
import { FaExclamationCircle } from "react-icons/fa"; // Import icon from react-icons library
import axiosInstance from "../utils/axiosInstance";

interface Annotation {
  id: string;
  assigned_to_user: string | null;
  assigned_to_user_id: number | null;
  status: string;
  history: any[];
}

interface Option {
  value: string;
  label: string;
}

const Submissions = () => {
  const [data, setData] = useState<Annotation[]>([]);
  const [isLoading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isLastPage, setIsLastPage] = useState(false);
  const [hoveredRowID, sethoveredRowID] = useState<string | null>(null);


  // Filter states for each column
  const [statusFilter, setStatusFilter] = useState<Option[]>([]);
  const [triageReady, setTriageReady] = useState<boolean>(false);
  const [page, setPage] = useState<number>(1);
  const perPage = 20;

  useEffect(() => {
    const fetchData = async (page: number) => {
      setLoading(true);
      setError(null);
      try {
        const response = await axiosInstance.get(`${BACKEND_URLS.get_annotations}/${perPage}/${page}`);
        if (response.status !== 200) {
          throw new Error("Failed to fetch data");
        }
        const data: Annotation[] = await response.data.annotations;
        setData(data);
        setLoading(false);
        setIsLastPage(data.length < perPage);
      } catch (error: any) {
        setError(error.message);
        setLoading(false);
      }
    };

    fetchData(page);
  }, [page]);

  // Extract unique values for dropdowns
  const uniqueStatuses = Array.from(new Set(data.map((item) => item.status)));

  const toOption = (value: string): Option => ({ value, label: value });

  // Filtering logic based on column values
  const filteredData = data.filter(
    (item) =>
    (statusFilter.length === 0 ||
      statusFilter.some((filter) => filter.value === item.status))
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <FaSpinner className="animate-spin text-4xl text-blue-600" />{" "}
        {/* Rotating spinner */}
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <p className="text-xl text-red-500 mb-4">Error: {error}</p>{" "}
        {/* Error message */}
        <button
          onClick={() => window.location.reload()} // Refresh the page on button click
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Refresh
        </button>
      </div>
    );
  }

  if (filteredData.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <FaExclamationCircle className="text-5xl text-blue-400 mb-4" />{" "}
        {/* Icon */}
        <p className="text-xl text-blue-600">No data available</p> {/* Text */}
      </div>
    );
  }

  if (triageReady) {
    return (
      <div className="flex items-center justify-center h-screen">
        <FaSpinner className="animate-spin text-4xl text-blue-600" />{" "}
        {/* Rotating spinner */}
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto mt-4 ">
      <div className="h-[80vh] overflow-y-auto">
        <div className="bg-blue-900 text-white rounded-md p-4 sticky top-0 z-10">
          <div className="grid grid-cols-3 gap-3 text-xl text-center">
            <div className="">
              <h1>ID</h1>
            </div>
            <div className="">
              <h1>Assignee</h1>
            </div>
            <div className="">
              <h1>Status</h1>
            </div>
          </div>
        </div>
        <div className="">
          {filteredData.map((item) => (
            <div
              className="my-4 p-4 bg-white border border-blue-300 rounded-md shadow-md hover:shadow-lg transition duration-300 ease-in-out"
              key={item.id}
              onMouseEnter={() => sethoveredRowID(item.id)}
              onMouseLeave={() => sethoveredRowID(null)}
            >
              <div className="grid grid-cols-3 gap-4 items-center">
                <div className="">
                  <p className="text-sm font-semibold">{item.id}</p>
                </div>
                <div className="flex justify-center">
                  <Select
                  value={item.assigned_to_user ? { value: item.assigned_to_user_id, label: item.assigned_to_user } : null}
                  options={[{ value: 1, label: "User 1" }, { value: 2, label: "User 2" }, { value: 3, label: "User 3" }]} // Example options
                  onChange={(selectedOption) => {
                    // Handle the change event
                    item.assigned_to_user = selectedOption?.label || null;
                  }}
                  placeholder="Select user"
                  className="w-1/2"
                  />
                </div>
                <div className="text-center" onClick={() => setTriageReady(true)}>
                  <Link
                    href={{
                      pathname: "/triage",
                      query: {
                        doc_id: item.id,
                        json_type: item.status === "verified" ? "gt" : "ai",
                        status: item.status,
                      },
                    }}
                    className={`text rounded-lg p-2 cursor-pointer ${item.status === "uploaded"
                      ? "bg-blue-200"
                      : item.status === "labelled"
                        ? "bg-blue-300"
                        : item.status === "revieved"
                          ? "bg-blue-400"
                          : item.status === "Done"
                            ? "bg-blue-500"
                            : item.status === "failed"
                              ? "bg-blue-600"
                              : "bg-blue-700"
                      }`}
                  >
                    {item.status}
                  </Link>
                </div>
              </div>
              {(item.id == hoveredRowID) && (
                <div className="text-blue-500">
                  {item.history.map((history, index) => (
                    <div key={index} className="flex justify-between">
                      <p className="text-sm">{history}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
      <div className="flex justify-between items-center mt-4">
        <button
          onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
          disabled={page === 1}
          className={`px-4 py-2 rounded-md ${page === 1
            ? "bg-gray-300 cursor-not-allowed"
            : "bg-blue-500 hover:bg-blue-700 text-white"
            }`}
        >
          Previous
        </button>
        <span className="text-lg">Page {page}</span>
        <button
          onClick={() => setPage((prev) => prev + 1)}
          disabled={isLastPage}
          className={`px-4 py-2 rounded-md ${isLastPage
            ? "bg-gray-300 cursor-not-allowed"
            : "bg-blue-500 hover:bg-blue-700 text-white"
            }`}
        >
          Next
        </button>
      </div>
    </div>
  );
}

export default Submissions;
