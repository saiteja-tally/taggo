import React from "react";
import { BiComment } from "react-icons/bi";
import TextareaAutosize from "react-textarea-autosize";
import XIcon from "./XIcon";
import adjustTextareaHeight from "@/app/utils/adjustHeight";

interface SingleValuedFieldProps {
  allowLabelling: boolean;
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
  allowLabelling,
  allowReview,
  fieldName,
  fieldValue,
  selectedField,
  handleFieldClick,
  handleSingleValuedFieldChange,
}) => {

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
      {allowLabelling ? fieldValue.location?.pageNo !== 0 && (
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
      ) :
        (selectedField === fieldName && allowReview) ? (
        <TextareaAutosize
          className="text-gray-800 bg-blue-50 rounded-md border overflow-hidden resize-none border-blue-300 p-2 focus:outline-none w-full hover:overflow-x-auto hover:whitespace-nowrap custom-scrollbar"
          value={fieldValue.comment || ""}
          placeholder="Add comment"
          onChange={(e) => {
          handleSingleValuedFieldChange(
            fieldName,
            e.target.value,
            null,
            "add comment"
          )
          adjustTextareaHeight(e.target);
          }
          }
          rows={1} // Default row count
          ref={(el) => {
            if (el) adjustTextareaHeight(el); // Adjust height on initial render
          }}
          wrap="off"
        />
        ) : fieldValue.comment ? (
        <div className="flex items-center">
          <BiComment className="text-gray-700" />
        </div>
        ) : null}
      </div>

      {allowLabelling ? <TextareaAutosize
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
      :
      <div className="m-1 p-1 text-gray-800 text-left whitespace-nowrap overflow-x-hidden hover:overflow-x-auto hover:whitespace-nowrap custom-scrollbar">
        {fieldValue.text}
      </div>}
    </div>
  );
};

export default SingleValuedField;
