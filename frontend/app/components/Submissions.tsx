"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import Select from "react-select";
import BACKEND_URLS from "../BackendUrls";
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
  const [groupsWithUsers, setGroupsWithUsers] = useState<{ [key: string]: string[] }>({});
  const [selectedAssignee, setSelectedAssignee] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [serachID, setSearchID] = useState<string | null>(null);

  // Filter states for each column
  const [triageReady, setTriageReady] = useState<boolean>(false);
  const [page, setPage] = useState<number>(1);
  const perPage = 20;

  const fetchAnnotations = async (assignee: string, status: string, page: number, searchID: string | null) => {
    setLoading(true);
    setError(null);
    if (searchID === "") {
      searchID = null;
    }
    try {
      const response = await axiosInstance.get(`${BACKEND_URLS.get_annotations}/${assignee}/${status}/${perPage}/${page}/${searchID}`);
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
    fetchAnnotations(selectedAssignee, selectedStatus, page, serachID);
  }, [page, selectedAssignee, selectedStatus, serachID]);

  useEffect(() => {
        const fetchGroupsWithUsers = async () => {
            const response = await axiosInstance.get('/get_groups_with_users');
            setGroupsWithUsers(response.data);
        };
        fetchGroupsWithUsers();
    }, []
    )

  // Extract unique values for dropdowns
  const uniqueStatuses = ['uploaded', 'pre-labelled', 'labelled', 'accepted', 'rejected', 'done', 'all'].map((status) => ({ value: status, label: status }));

  const handleUserChange = async (id: string, username: string | null) => {
    try {
      const response = await axiosInstance.post(BACKEND_URLS.assign_annotation, {
        id,
        username,
      });

      console.log(groupsWithUsers, id, username);
      if (response.status === 200) {
        console.log("User assigned successfully");
        setData((prevData: Annotation[]) =>
          prevData.map((annotation: Annotation) =>
            annotation.id === id
              ? { 
            ...annotation,
            assigned_to_user: Object.values(groupsWithUsers).flat().find((user: string) => user === username) || null 
          }
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

  if (triageReady) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="loader border-t-4 border-blue-500 rounded-full w-12 h-12 mx-auto animate-spin"></div>
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
        fetchAnnotations("all", "all", page, null);
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
    <div className="max-w-7xl mx-auto mt-4 relative">
      <div className="h-[80vh] overflow-y-auto">
        <div className="bg-blue-900 text-white rounded-md p-4 sticky top-0 z-10">
          <div className="grid grid-cols-3 gap-3 text-xl text-center">
            <div className="flex flex-col items-center">
              <h1 className="text-lg font-semibold mb-3">ID</h1>
              <input
                type="text"
                value={serachID || ""}
                onChange={(e) => setSearchID(e.target.value)}
                placeholder="Search by ID"
                className="text-black w-full rounded-md p-2"
              />
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
                {userData && userData.is_superuser && (<select 
                    id="user-select" 
                    className="select-user-dropdown text-black" 
                    onChange={(e) => setSelectedAssignee(e.target.value)}
                    value={selectedAssignee ?? ''}
                    >
                    <option value="" disabled>--select--</option>
                    {Object.entries(groupsWithUsers).map(([group, users]) => (
                        <optgroup key={group} label={group}>
                        {users.map((user: string) => (
                            <option key={user} value={user}>
                            {user}
                            </option>
                        ))}
                        </optgroup>
                    ))}
                    </select>)}
            </div>
            <div className="flex flex-col items-center">
              <h1 className="text-lg font-semibold mb-3">Status</h1>
              <Select
              options={uniqueStatuses.map(status => ({ ...status, label: `${status.label}` }))}
              onChange={(selectedOption) => {
                setSelectedStatus(selectedOption?.label || 'all');
              }}
              placeholder="Select status"
              className="text-black w-full"
              />
            </div>
          </div>
        </div>
        {isLoading ?
          <div className="flex items-center justify-center h-screen">
            <div className="loader border-t-4 border-blue-500 rounded-full w-12 h-12 mx-auto animate-spin"></div>
          </div> :
          <div className="">
            {data.map((item: Annotation) => (
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
                    <select 
                      id="user-select" 
                      className="select-user-dropdown text-black rounded-md p-2" 
                      onChange={(e) => handleUserChange(item.id, e.target.value ?? null)}
                      value={item.assigned_to_user ?? ''}
                    >
                      <option value="" disabled>--select--</option>
                      {Object.entries(groupsWithUsers).map(([group, users]) => (
                        <optgroup key={group} label={group}>
                          {users.map((user: string) => (
                            <option key={user} value={user}>
                              {user}
                            </option>
                          ))}
                        </optgroup>
                      ))}
                    </select>
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
                      : item.status === "pre-labelling"
                        ? "bg-blue-300"
                        : item.status === ""
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
                    {item.history.map((instance: any, index: number) => (
                      <div key={index} className="flex justify-between">
                        <p className="text-sm">{instance}</p>
                      </div>
                    ))}
                  </div>
                ) : item.history.length > 0 && (
                  <div className="text-blue-500">
                    <p className="text-sm">{item.history[item.history.length - 1]}</p>
                  </div>
                )}
              </div>
            ))}
          </div>}
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
