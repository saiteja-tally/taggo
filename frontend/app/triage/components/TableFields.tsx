import React, { useEffect, useState, useCallback, useRef } from "react";
import AddField from "./AddField";
import TextareaAutosize from "react-textarea-autosize";
import { BiComment } from "react-icons/bi";
import XIcon from "./XIcon";
import adjustTextareaHeight from "@/app/utils/adjustHeight";


interface TableFieldsProps {
  allowReview: boolean;
  fieldName: string;
  fieldValue: any[];
  handleNestedFieldChange: (
    fieldType: string,
    index: number | null,
    field: string | null,
    value: string | null,
    location: Record<string, any> | null,
    instruction: string
  ) => void;
  handleNestedRowDelete: (fieldName: string, index: number) => void;
  handleNestedRowAdd: (fieldName: string) => void;
  handleFieldClick: (
    fieldName: string,
    index: number | null,
    colName: string | null,
    location: Record<string, any>
  ) => void;
}

interface DisplayCols {
  [key: string]: boolean;
}

const TableFields: React.FC<TableFieldsProps> = ({
  allowReview,
  fieldName,
  fieldValue,
  handleNestedFieldChange,
  handleNestedRowDelete,
  handleNestedRowAdd,
  handleFieldClick,
}) => {
  const [currIndex, setCurrIndex] = useState<number | null>(null);
  const [currField, setCurrField] = useState<string | null>(null);
  const [displayCols, setDisplayCols] = useState<DisplayCols>({});
  const textAreaFocused = useRef<boolean>(false);

  const changeCurr = (index: number, fieldName: string) => {
    setCurrIndex(index);
    setCurrField(fieldName);
  };

  const handleAddField = useCallback((fieldName: string) => {
    setDisplayCols((prevData) => {
      const newData = { ...prevData, [fieldName]: !prevData[fieldName] };
      return newData;
    });
  }, []);

  const handleSelectAll = useCallback(
    (selectAll: boolean) => {
      const newDisplayCols = Object.keys(displayCols).reduce(
        (acc, fieldName) => {
          acc[fieldName] = selectAll;
          return acc;
        },
        {} as DisplayCols
      );
      setDisplayCols(newDisplayCols);
    },
    [displayCols]
  );

  useEffect(() => {
    let predefinedFields: Record<string, boolean> = {};
    if (fieldName === "LedgerDetails") {
      predefinedFields = { "LedgerName": true, "LedgerRate": true, "LedgerAmount": true };
    } else if (fieldName === "Table") {
      predefinedFields = {
        "ItemBox": true,
        "ItemName": false,
        "ItemDescription": false,
        "HSNSACCode": true,
        "BilledQty": false,
        "ActualQty": false,
        "DiscountAmount": false,
        "DiscountRate": false,
        "ItemRate": true,
        "ItemRateUOM": false,
        "SGSTRate": false,
        "SGSTAmount": false,
        "CGSTRate": false,
        "CGSTAmount": false,
        "IGSTRate": false,
        "IGSTAmount": false,
        "TaxRate": false,
        "TaxAmount": false,
        "ItemAmount": true,
      };}
    else if (fieldName === "ROI") {
      predefinedFields = {
        "Document_Info_block_pri":true,
        "Buyer_address":true,
        "Seller_address":true,
        "Buyer_shipping":true,
        "Table_pri":true,
        "Table_sec":true,
        "Amount_details":true,
        "Total_amount":true,
        "Document_Info_block_sec":true,
      };
    }


    const initialDisplayCols: DisplayCols = {};

    // Ensure all predefinedFields exist in every row, else add dummy value
    for (const field of Object.keys(predefinedFields)) {
      fieldValue.forEach((row: any) => {
        if (!row[field]) {
          row[field] = {
            text: "",
            location: { pageNo: 0, ltwh: [0, 0, 0, 0, 0] },
          };
        }
      });

      initialDisplayCols[field] = fieldValue.some(
        (row: any) => row[field]?.text !== "" || predefinedFields[field] || row[field]?.comment
      );
    }

    setDisplayCols(initialDisplayCols);
  }, [fieldValue]);


  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (currIndex === null || currField === null || textAreaFocused.current)
        return;

      const rowCount = fieldValue.length;
      const colNames = Object.keys(displayCols).filter(
        (colName) => displayCols[colName]
      );

      let newIndex = currIndex;
      let newField = currField;

      if (e.key === "ArrowUp") {
        newIndex = currIndex > 0 ? currIndex - 1 : currIndex;
      } else if (e.key === "ArrowDown") {
        newIndex = currIndex < rowCount - 1 ? currIndex + 1 : currIndex;
      } else if (e.key === "ArrowLeft") {
        const currentColIndex = colNames.indexOf(currField);
        newField =
          currentColIndex > 0 ? colNames[currentColIndex - 1] : currField;
      } else if (e.key === "ArrowRight") {
        const currentColIndex = colNames.indexOf(currField);
        newField =
          currentColIndex < colNames.length - 1
            ? colNames[currentColIndex + 1]
            : currField;
      }

      if (newIndex !== currIndex || newField !== currField) {
        setCurrIndex(newIndex);
        setCurrField(newField);
        handleFieldClick(
          fieldName,
          newIndex,
          newField,
          fieldValue[newIndex]?.[newField]?.location || {
            pageNo: 0,
            ltwh: [0, 0, 0, 0, 0],
          }
        );
      }
    },
    [currIndex, currField, displayCols, fieldValue, handleFieldClick, fieldName]
  );

  useEffect(() => {
    const handle = (e: KeyboardEvent) => handleKeyDown(e as any);
    window.addEventListener("keydown", handle);
    return () => window.removeEventListener("keydown", handle);
  }, [handleKeyDown]);

  const maxLength = (text: string) => {
    return text.split("\n").reduce((max, line) => Math.max(max, line.length), 0);
  };

  return (
    <div className="h-[25vh] overflow-auto sm:text-xs md:text-xs lg:text-lg xl:text-lg">
      <table className="min-w-full bg-white">
      <thead className="sticky top-0 z-10">
        <tr className="">
        <th className="sticky left-0 bg-gray-300 whitespace-nowrap w-16">
          <AddField
          displayCols={displayCols}
          handleAddField={handleAddField}
          handleSelectAll={handleSelectAll}
          />
        </th>
        {Object.entries(displayCols).map(
          ([fieldName, value]) =>
          value && (
            <th
            key={fieldName}
            className={`px-2 text-left text-indigo-700 font-md ${fieldName === currField
              ? "bg-red-200"
              : ""
              }`}
            >
            {fieldName}
            </th>
          )
        )}
        </tr>
      </thead>
      <tbody>
        {fieldValue.map((row: any, index: number) => (
        <tr
          key={index}
          className={`m-2 p-2`}
        >
          <td
          className={`sticky left-0 w-16 ${index === currIndex ? "bg-red-200" : "bg-gray-300"
            }`}
          >
          <button
            className={`px-3 text-xl font-bold rounded hover:bg-red-500 text-black focus:outline-none hover:text-white`}
            onClick={() => handleNestedRowDelete(fieldName, index)}
          >
            -
          </button>
          </td>
          {Object.entries(displayCols).map(
          ([colName, value]) =>
            value && (
            <td
              key={colName}
              onFocus={() => {
              handleFieldClick(
                fieldName,
                index,
                colName,
                row[colName].location
              );
              changeCurr(index, colName);
              }}
              onClick={() => {
              handleFieldClick(
                fieldName,
                index,
                colName,
                row[colName].location
              );
              changeCurr(index, colName);
              }}
              className={`p-0 border ${colName === currField && index === currIndex
              ? "bg-red-200"
              : ""
              }`}
            >
              <div className="flex">
              {row[colName].comment && <button
                onClick={() =>
                handleNestedFieldChange(
                  fieldName,
                  index,
                  colName,
                  "",
                  null,
                  "del comment"
                )
                }
                className="relative p-1 text-red-500 text-sm"><BiComment className="text-gray-700" /><XIcon />
              </button>}
              {(colName === currField && index === currIndex && allowReview) ?
                <TextareaAutosize
                className="text-gray-800 m-1 text-sm bg-red-50 rounded-md border overflow-hidden resize-none border-blue-300 p-1 focus:outline-none w-full hover:overflow-x-auto hover:whitespace-nowrap custom-scrollbar"
                value={row[colName].comment || ""}
                placeholder="Add comment"
                onChange={(e) => {
                  handleNestedFieldChange(
                  fieldName,
                  index,
                  colName,
                  e.target.value,
                  null,
                  "add comment"
                  )
                  adjustTextareaHeight(e.target);
                }
                }
                rows={1} // Default row count
                cols = {maxLength(row[colName]?.comment || "")}
                ref={(el) => {
                  if (el) adjustTextareaHeight(el); // Adjust height on initial render
                }}
                wrap="off"
                />
                : row[colName].comment && <div className="m-1 text-gray-800 text-sm text-left whitespace-nowrap overflow-x-hidden hover:overflow-x-auto hover:whitespace-nowrap custom-scrollbar">
                {row[colName].comment}
                </div>}
              </div>
              <div className="flex">
              {fieldName != 'ROI' ? <TextareaAutosize
                value={row[colName]?.text || ""}
                className="p-2 m-1 rounded-md border w-full border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none hover:overflow-x-auto overflow-hidden hover:whitespace-nowrap custom-scrollbar"
                onChange={(e) => {
                handleNestedFieldChange(
                  fieldName,
                  index,
                  colName,
                  e.target.value,
                  row[colName]?.location,
                  "update value"
                );
                adjustTextareaHeight(e.target); // Adjust height dynamically
                }}
                rows={1} // Default row count
                ref={(el) => {
                if (el) adjustTextareaHeight(el); // Adjust height on initial render
                }}
                wrap="off"
                cols={maxLength(row[colName]?.text || "")}
                onFocus={() => (textAreaFocused.current = true)}
                onBlur={() => (textAreaFocused.current = false)}
              />: <p className="m-2 text-gray-800 text-left whitespace-nowrap">page {index + 1}</p>}
              {row[colName]?.location?.pageNo !== 0 && (
                <button
                onClick={() =>
                  handleNestedFieldChange(
                  fieldName,
                  index,
                  colName,
                  row[colName].text,
                  null,
                  "del bbox"
                  )
                }
                disabled={
                  (colName !== currField || index !== currIndex)
                }
                className="relative"
                >
                <img
                  src="rect.png" // Replace with the actual path to your PNG image
                  alt="Draw Box"
                  className="h-4 w-5 m-2" // Adjust the height and width of the image as needed
                />
                {colName === currField && index === currIndex && (
                  <XIcon />
                )}
                </button>
              )}
              </div>
            </td>
            )
          )}
        </tr>
        ))}
      </tbody>
      </table>
      <button
      className="p-1 m-2 font-bold text-black rounded hover:bg-green-700 hover:text-white focus:outline-none"
      onClick={() => handleNestedRowAdd(fieldName)}
      >
      + Add Row
      </button>
    </div>
  );
};

export default TableFields;
