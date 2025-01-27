import React from "react";
import { BiComment } from "react-icons/bi";

interface SingleValuedFieldProps {
  status: string | null,
  fieldName: string;
  fieldValue: Record<string, any>;
  selectedField: string | null;
  handleFieldClick: (
    fieldName: string,
    index: number | null,
    colName: string | null,
    location: Record<string, any>
  ) => void;
  handleSingleValuedFieldChange: (
    fieldName: string,
    value: string | null,
    location: Record<string, any> | null,
    instruction: string
  ) => void;
}

const SingleValuedField: React.FC<SingleValuedFieldProps> = ({
  status,
  fieldName,
  fieldValue,
  selectedField,
  handleFieldClick,
  handleSingleValuedFieldChange,
}) => {

  interface AdjustTextareaHeight {
    (textarea: HTMLTextAreaElement): void;
  }

  const adjustTextareaHeight: AdjustTextareaHeight = (textarea) => {
    textarea.style.height = "auto"; // Reset height to auto to calculate the actual scroll height
    textarea.style.height = `${textarea.scrollHeight}px`; // Set height to the scroll height
  };

  return (
    <div
      className={`m-2 bg-gray-200 border border-gray-400 sm:text-xs md:text-xs lg:text-lg xl:text-lg cursor-default p-2 rounded-md shadow-md transition duration-300 ease-in-out hover:shadow-lg ${selectedField === fieldName ? "bg-red-200" : "bg-white"
        }`}
      key={fieldName}
      onFocus={() => {
        handleFieldClick(fieldName, null, null, fieldValue.location);
      }}
      onClick={() => {
        handleFieldClick(fieldName, null, null, fieldValue.location);
      }}
    >
      <div className="flex items-center justify-between">
        <p className="font-semibold m-1 text-indigo-700 text-center">
          {fieldName}{fieldValue.conf && <span className="text-sm m-2 text-blue-400">({fieldValue.conf?.toFixed(2)})</span>}
        </p>
        {(status == "uploaded" || status == "pre-labelled") ? fieldValue.location?.pageNo !== 0 && (
          <button
            onClick={(e) =>
              handleSingleValuedFieldChange(
                fieldName,
                fieldValue.text,
                null,
                "del bbox"
              )
            }
            disabled={fieldName !== selectedField}
            className="relative"
          >
            <img
              src="rect.png" // Replace with the actual path to your PNG image
              alt="Draw Box"
              className="h-4 w-5 m-2" // Adjust the height and width of the image as needed
            />
            {fieldName === selectedField && (
              <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center opacity-0 transition-opacity duration-300 ease-in-out hover:opacity-100">
                <div className="text-red-500">
                  <svg
                    className="h-7 w-7"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </div>
              </div>
            )}
          </button>
        ) :
          (selectedField === fieldName && status != 'accepted') ? (
            <textarea
              className="text-gray-800 bg-blue-50 rounded-md border overflow-hidden resize-none border-blue-300 p-2 focus:outline-none w-full"
              value={fieldValue.comment || ""}
              placeholder="Add comment"
              onChange={(e) => {
                handleSingleValuedFieldChange(
                  fieldName,
                  e.target.value,
                  null,
                  "add comment"
                );
                adjustTextareaHeight(e.target);
              }
              }
              rows={1} // Default row count
              ref={(el) => {
                if (el) adjustTextareaHeight(el); // Adjust height on initial render
              }}
            />
          ) : fieldValue.comment ? (
            <div className="flex items-center">
              <BiComment className="text-gray-700" />
            </div>
          ) : null}
      </div>

      <textarea
        className={`text-gray-800 bg-blue-50 rounded-md border overflow-hidden resize-none border-blue-300 p-2 focus:outline-none w-full ${selectedField === fieldName ? "border border-red-300" : ""
          }`}
        value={fieldValue.text}
        placeholder=""
        disabled={status != "uploaded" && status != "pre-labelled"}
        onChange={(e) => {
          handleSingleValuedFieldChange(
            fieldName,
            e.target.value,
            fieldValue.location,
            "update value"
          );
          adjustTextareaHeight(e.target); // Adjust height dynamically
        }}
        rows={1} // Default row count
        ref={(el) => {
          if (el) adjustTextareaHeight(el); // Adjust height on initial render
        }}
        wrap="soft"
      />
    </div>
  );
};

export default SingleValuedField;
