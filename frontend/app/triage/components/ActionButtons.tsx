import React from 'react';

interface ActionButtonsProps {
  allowLabelling: boolean;
  allowReview: boolean;
  dataChanged: boolean;
  handleSave: (status: string) => void;
  handleReset: () => void;
}

const ActionButtons: React.FC<ActionButtonsProps> = ({ dataChanged, allowLabelling, allowReview, handleSave, handleReset }) => {
  return (
    <div className="p-4 flex justify-center items-center space-x-4 bg-blue-100 rounded-lg shadow-md">
      {allowReview && (
        <div className="flex space-x-2">
          <button
            onClick={() => handleSave("rejected")}
            disabled={!dataChanged}
            className={`${dataChanged
              ? "bg-red-500 hover:bg-red-700"
              : "bg-gray-300 text-gray-400 cursor-not-allowed"
              } text-white py-2 px-4 rounded-full transition duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-red-300`}
          >
            Reject
          </button>
          <button
            onClick={() => handleSave("accepted")}
            className="bg-blue-500 hover:bg-blue-700 text-white py-2 px-4 rounded-full transition duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-300"
            disabled={dataChanged}
          >
            Accept
          </button>
        </div>
      )}
      {allowLabelling && (
        <div className="flex space-x-2">
          <button
            onClick={() => handleSave("labelled")}
            disabled={!dataChanged}
            className={`${dataChanged
              ? "bg-blue-500 hover:bg-blue-700"
              : "bg-gray-300 text-gray-400 cursor-not-allowed"
              } text-white py-2 px-4 rounded-full transition duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-300`}
          >
            Save
          </button>
          <button
            onClick={handleReset}
            disabled={!dataChanged}
            className={`${dataChanged
              ? "bg-red-500 hover:bg-red-700"
              : "bg-gray-300 text-gray-400 cursor-not-allowed"
              } text-white py-2 px-4 rounded-full transition duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-red-300`}
          >
            Discard
          </button>
        </div>
      )}
    </div>
  );
};

export default ActionButtons;