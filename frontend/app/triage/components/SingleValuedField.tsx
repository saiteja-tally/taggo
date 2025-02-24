import React from "react";
import { BiComment } from "react-icons/bi";
import TextareaAutosize from "react-textarea-autosize";
import XIcon from "./XIcon";
import adjustTextareaHeight from "@/app/utils/adjustHeight";

interface SingleValuedFieldProps {
  allowReview: boolean;
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
  allowReview,
  fieldName,
  fieldValue,
  selectedField,
  handleFieldClick,
  handleSingleValuedFieldChange,
}) => {

  return (
    <div
      className={`bg-gray-200 border border-gray-400 sm:text-xs md:text-xs lg:text-lg xl:text-lg cursor-default p-2 rounded-md shadow-md transition duration-300 ease-in-out hover:shadow-lg ${selectedField === fieldName ? "bg-red-200" : "bg-white"
        }`}
      key={fieldName}
      onFocus={() => {
        handleFieldClick(fieldName, null, null, fieldValue.location);
      }}
      onClick={() => {
        handleFieldClick(fieldName, null, null, fieldValue.location);
      }}
    >
      <div className="flex justify-between">
        <div className="flex flex-col items-start">
          <p className="font-semibold text-indigo-700">
            {fieldName}
          </p>
          <div className="flex items-center">
            {fieldValue.comment && fieldValue.comment.length > 0 && (
              <button
                onClick={(e) => {
                  handleSingleValuedFieldChange(
                    fieldName,
                    "",
                    null,
                    "add comment"
                  );
                }}
                className="relative text-red-500 text-sm mr-2"
              >
                <BiComment className="text-gray-700" />
                <XIcon />
              </button>
            )}
            {fieldName === selectedField && allowReview ? (
              <TextareaAutosize
                className="text-gray-800 px-2 text-sm bg-red-50 rounded-md border overflow-hidden resize-none border-blue-300 p-1 focus:outline-none w-full hover:overflow-x-auto hover:whitespace-nowrap custom-scrollbar"
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
                }}
                rows={1} // Default row count
                ref={(el) => {
                  if (el) adjustTextareaHeight(el); // Adjust height on initial render
                }}
                wrap="off"
              />
            ) : (
              <div className="m-1 text-gray-800 text-left whitespace-nowrap overflow-x-hidden hover:overflow-x-auto hover:whitespace-nowrap custom-scrollbar">
                {fieldValue.comment}
              </div>
            )}
          </div>
        </div>
        {fieldValue.location?.pageNo !== 0 && (
          <div>
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
                <XIcon />
              )}
            </button>
          </div>
        )}
      </div>

      <TextareaAutosize
        className={`text-gray-800 bg-blue-50 rounded-md border overflow-hidden resize-none border-blue-300 p-2 focus:outline-none w-full 
    ${selectedField === fieldName ? "border border-red-300" : ""} 
    hover:overflow-x-auto hover:whitespace-nowrap custom-scrollbar`}
        value={fieldValue.text}
        placeholder=""
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
        wrap="off"
      />
    </div>
  );
};

export default SingleValuedField;
