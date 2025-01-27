"use client";
import { useState, useEffect, use } from "react";
import Link from "next/link";
import Select from "react-select";
import BACKEND_URLS from "../BackendUrls";
import { FaSpinner } from "react-icons/fa";
import { FaExclamationCircle } from "react-icons/fa"; // Import icon from react-icons library
import axiosInstance from "../utils/axiosInstance";
import SmartAssign from "../utils/SmartAssign";

interface Annotation {
  id: string;
  assigned_to_user: string | null;
  assigned_to_user_id: number | null;
  status: string;
  history: any[];
}

interface Option {
  value: number | null;
  label: string;
}

interface SubmissionsProps {
  userData: {
    username: string;
    email: string;
    is_superuser: boolean;
    groups: string[];
  } | null;
}

const Submissions: React.FC<SubmissionsProps> = ({ userData }) => {
  const [data, setData] = useState<Annotation[]>([]);
  const [isLoading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isLastPage, setIsLastPage] = useState<boolean>(false);
  const [hoveredRowID, sethoveredRowID] = useState<string | null>(null);
  const [users, setUsers] = useState<Option[]>([]);

  // Filter states for each column
  const [statusFilter, setStatusFilter] = useState<Option[]>([]);
  const [assigneeFilter, setAssigneeFilter] = useState<Option[]>([]);
  const [triageReady, setTriageReady] = useState<boolean>(false);
  const [page, setPage] = useState<number>(1);
  const perPage = 20;

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

  useEffect(() => {
    fetchData(page);
  }, [page]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axiosInstance.get(BACKEND_URLS.get_users);
        if (response.status !== 200) {
          throw new Error("Failed to fetch users");
        }
        const data = response.data;
        const usersData = data.data.map((user: any) => ({ value: user.id, label: user.username, group: user.groups }));
        setUsers([...usersData, { value: null, label: "Unassigned" }]);
      } catch (error: any) {
        setData([]);
        console.error("Failed to fetch users:", error);
      }
    };

    fetchUsers();
  }, []);

  // Extract unique values for dropdowns
  const uniqueStatuses = Array.from(new Set(data.map((item) => item.status))).map(status => ({ value: status, label: status }));

  const handleUserChange = async (id: string, user_id: number | null) => {
    try {
      const response = await axiosInstance.post(BACKEND_URLS.assign_annotation, {
        id,
        user_id,
      });
      if (response.status === 200) {
        console.log("User assigned successfully");
        setData((prevData) =>
          prevData.map((annotation) =>
            annotation.id === id
              ? { ...annotation, assigned_to_user_id: user_id, assigned_to_user: users.find(user => user.value === user_id)?.label || null }
              : annotation
          )
        );
        return true
      } else {
        console.error("Failed to assign user:", response.statusText);
        return false
      }
    } catch (error: any) {
      console.error("Error assigning user:", error.response?.data.message || error.message);
      return false
    }
  }

  const [showDialog, setShowDialog] = useState<boolean>(false);

  // Filtering logic based on column values
  const filteredData = data.filter(
    (item) =>
      (statusFilter.length === 0 || statusFilter.some((filter) => filter.label === item.status)) &&
      (assigneeFilter.length === 0 || assigneeFilter.some((filter) => filter.label === item.assigned_to_user))
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
      </div>
    );
  }

  function handleCloseClick(): void {
    setShowDialog(false);
  }

  const handleSmartAssign = async (status: string | null, userGroup: string | null, percentage: number | null) => {
    try {
      const response = await axiosInstance.post(BACKEND_URLS.smart_assign, { status, userGroup, percentage });
      if (response.status === 200) {
        fetchData(page);
        setShowDialog(false);
        alert("Smart assign successful: " + response.data.message);
      } else {
        throw new Error("Failed to perform smart assign");
      }
    } catch (error: any) {
      console.error("Error during smart assign:", error.response?.data.message || error.message);
      alert("Error during smart assign: " + (error.response?.data.message || error.message));
    }
  };

  return (
    <div className="max-w-5xl mx-auto mt-4 relative">
      <div className="h-[80vh] overflow-y-auto">
        <div className="bg-blue-900 text-white rounded-md p-4 sticky top-0 z-10">
          <div className="grid grid-cols-3 gap-3 text-xl text-center">
            <div className="">
              <h1>ID</h1>
            </div>
            <div className="flex flex-col items-center">
              <div className="flex items-center justify-center mb-2">
                <h1 className="text-lg font-semibold">Assignee</h1>
                {userData && userData.is_superuser && (
                  <button
                    className="bg-white rounded-md ml-2 p-1 shadow hover:shadow-lg transition duration-300"
                    onClick={() => setShowDialog(true)}
                    title="Smart Assign"
                  >
                    <img src="assign-user.svg" alt="Smart Assign" className="w-6 h-6" />
                  </button>
                )}
              </div>
              {userData && userData.is_superuser &&(<Select
                isMulti
                options={users.map(user => ({ ...user, label: `${user.label} (${data.filter(item => item.assigned_to_user_id === user.value).length})` }))}
                onChange={(selectedOptions) => setAssigneeFilter(selectedOptions as Option[])}
                placeholder="Select assignee"
                className="text-black"
              />)}
            </div>
            <div className="flex flex-col items-center">
              <h1 className="text-lg font-semibold mb-3">Status</h1>
              <Select
                isMulti
                options={uniqueStatuses.map(status => ({ ...status, label: `${status.label} (${data.filter(item => item.status === status.value).length})` }))}
                onChange={(selectedOptions) => setStatusFilter(selectedOptions as unknown as Option[])}
                placeholder="Select status"
                className="w-full text-black"
              />
            </div>
          </div>
        </div>
        <div className="">
          {filteredData.map((item) => (
            <div
              className="my-4 p-4 bg-white border border-blue-300 rounded-md shadow-md hover:shadow-lg transition duration-600 ease-in-out"
              key={item.id}
              onMouseEnter={() => sethoveredRowID(item.id)}
              onMouseLeave={() => sethoveredRowID(null)}
            >
              <div className="grid grid-cols-3 gap-4 items-center">
                <div className="">
                  <p className="text-sm font-semibold">{item.id}</p>
                </div>
                <div className="flex justify-center">
                  {(userData && userData.is_superuser) ? (<Select
                    value={item.assigned_to_user && item.assigned_to_user != "Unassigned" ? { value: item.assigned_to_user_id, label: item.assigned_to_user } : null}
                    options={users} // Example options
                    onChange={(selectedOption) => {
                      handleUserChange(item.id, selectedOption?.value || null)
                    }}
                    placeholder="Select user"
                    className="w-1/2"
                  />) :
                    <p className="text-sm text-bold">{item.assigned_to_user}</p>}
                </div>
                <Link
                  href={{
                    pathname: "/triage",
                    query: {
                      doc_id: item.id,
                      history: JSON.stringify(item.history),
                      status: item.status,
                      username: userData?.username || '',
                    },
                  }}
                  onClick={() => setTriageReady(true)}
                  className={`text-center rounded-lg p-2 cursor-pointer ${item.status === "uploaded"
                    ? "bg-blue-200"
                    : item.status === "labelled"
                      ? "bg-blue-300"
                      : item.status === "pre-labelled"
                        ? "bg-blue-400"
                        : item.status === "accepted"
                          ? "bg-blue-500"
                          : item.status === "rejected"
                            ? "bg-blue-600"
                            : "bg-blue-700"
                    }`}
                >
                  {item.status}
                </Link>
              </div>
              {(item.id == hoveredRowID) ? (
                <div className="text-blue-500">
                  {item.history.map((instance, index) => (
                    <div key={index} className="flex justify-between">
                      <p className="text-sm">{instance}</p>
                    </div>
                  ))}
                </div>
              ): item.history.length > 0 && (
                <div className="text-blue-500">
                  <p className="text-sm">{item.history[item.history.length - 1]}</p>
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
      {showDialog && (
        <div className="absolute inset-0 z-20 bg-white bg-opacity-75 flex items-center justify-center">
          <SmartAssign handleCloseClick={handleCloseClick} handleSmartAssign={handleSmartAssign} />
        </div>
      )}
    </div>
  );
}

export default Submissions;
