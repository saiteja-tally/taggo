import React, { useState, useEffect, useCallback } from "react";
import TableFields from "./TableFields";
import SingleValuedField from "./SingleValuedField";
import ToggleView from "./ToggleView";
import { FaExclamationCircle } from "react-icons/fa";
import AddField from "./AddField";
import ROIField from "./ROIField";


const predefinedFields = {
  "InvoiceDate": true,
  "InvoiceNumber": true,
  "SupplierName": true,
  "SupplierAddress": true,
  "SupplierContactNo": true,
  "SupplierEmail": true,
  "SupplierGSTIN": true,
  "SupplierPAN": true,
  "SupplierState": true,
  "BuyerName": true,
  "BuyerAddress": true,
  "BuyerContactNo": true,
  "BuyerEmail": false,
  "BuyerGSTIN": false,
  "BuyerOrderDate": false,
  "BuyerPAN": true,
  "BuyerState": true,
  "ConsigneeName": true,
  "ConsigneeAddress": true,
  "ConsigneeContactNo": true,
  "ConsigneeEmail": true,
  "ConsigneeGSTIN": true,
  "ConsigneePAN": true,
  "ConsigneeState": true,
  "Destination": false,
  "DispatchThrough": false,
  "DocumentType": false,
  "OrderNumber": false,
  "OtherReference": false,
  "PortofLoading": false,
  "ReferenceNumber": false,
  "ReferenceDate": false,
  "TermsofPayment": false,
  "SubAmount": true,
  "TotalAmount": true,
  "Table": false,
  "LedgerDetails": false,
  "ROI": false
};

interface ExtractedFieldsProps {
  doc_id: string | null;
  status: string | null;
  startAnnotation: () => void;
  handleFieldClick: (
    fieldName: string,
    index: number | null,
    colName: string | null,
    location: Record<string, any>
  ) => void;
  handleChangeView: (viewType: string) => void;
  viewType: string;
  selectedField: string | null;
  extractedData: { [key: string]: any } | null;
  handleSingleValuedFieldChange: (
    fieldName: string,
    value: string | null,
    location: Record<string, any> | null,
    instruction: string
  ) => void;
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
  isLoading: boolean;
  nodata: boolean;
  dataChanged: boolean;
  handleSave: (status: string) => void;
  handleDiscard: () => void;
}

interface DisplayFields {
  [key: string]: boolean;
}

const ExtractedFields: React.FC<ExtractedFieldsProps> = ({
  doc_id,
  status,
  startAnnotation,
  handleFieldClick,
  handleChangeView,
  viewType,
  selectedField,
  extractedData,
  handleSingleValuedFieldChange,
  handleNestedFieldChange,
  handleNestedRowDelete,
  handleNestedRowAdd,
  isLoading,
  dataChanged,
  handleSave,
  handleDiscard,
}) => {

  const [displayFields, setDisplayFields] = useState<DisplayFields>({});
  const [allowLabelling, setAllowLabelling] = useState<boolean>(false);
  const [allowReview, setAllowReview] = useState<boolean>(false);

  useEffect(() => {
    const initialDisplayFields: DisplayFields = {};

    if (extractedData == null) {
      return;
    }


    Object.keys(predefinedFields).forEach((field) => {
      if (!extractedData[field]) {
        if (field === "Table" || field === "LedgerDetails" || field == "ROI") {
          extractedData[field] = [{}];
        } else {
          extractedData[field] = {
            text: "",
            location: { pageNo: 0, ltwh: [0, 0, 0, 0] },
          };
        }
      }

      if (field !== "Table" && field !== "LedgerDetails") {
        initialDisplayFields[field] =
          extractedData[field].text !== "" ||
          extractedData[field].location.pageNo !== 0 ||
          predefinedFields[field as keyof typeof predefinedFields];
      }
    });

    setDisplayFields(initialDisplayFields);
  }, [extractedData]);

  useEffect(() => {
    if (status === "uploaded" || status === "pre-labelled") {
      setAllowLabelling(true);
      setAllowReview(false);
    } else if (status === "labelled") {
      setAllowLabelling(false);
      setAllowReview(true);
    }
  }, [status]);

  const handleAddField = useCallback((fieldName: string) => {
    setDisplayFields((prevData) => ({
      ...prevData,
      [fieldName]: !prevData[fieldName],
    }));
  }, []);

  const handleSelectAll = useCallback(
    (selectAll: boolean) => {
      const newDisplayCols = Object.keys(displayFields).reduce(
        (acc, fieldName) => {
          acc[fieldName] = selectAll;
          return acc;
        },
        {} as DisplayFields
      );
      setDisplayFields(newDisplayCols);
    },
    [displayFields]
  );

  const renderField = useCallback(
    (fieldName: string, fieldValue: any) => {
      if (fieldName?.toLowerCase() === "filename") {
        return null;
      }
      if (
        fieldName !== "Table" &&
        viewType === "General" &&
        fieldName !== "LedgerDetails" &&
        fieldName !== "ROI" &&
        displayFields[fieldName]
      ) {
        return (
          <SingleValuedField
            allowLabelling={allowLabelling}
            allowReview={allowReview}
            key={fieldName}
            fieldName={fieldName}
            fieldValue={fieldValue}
            selectedField={selectedField}
            handleFieldClick={handleFieldClick}
            handleSingleValuedFieldChange={handleSingleValuedFieldChange}
          />
        );
      }
      if (fieldName === "Table" && viewType === "Items") {
        return (
          <div className="text-xs" key={fieldName}>
            <TableFields
              allowLabelling={allowLabelling}
              allowReview={allowReview}
              fieldName={fieldName}
              fieldValue={fieldValue}
              handleNestedFieldChange={handleNestedFieldChange}
              handleNestedRowDelete={handleNestedRowDelete}
              handleNestedRowAdd={handleNestedRowAdd}
              handleFieldClick={handleFieldClick}
            />
          </div>
        );
      }
      if (fieldName === "LedgerDetails" && viewType === "Ledgers") {
        return (
          <div className="text-xs" key={fieldName}>
            <TableFields
              allowLabelling={allowLabelling}
              allowReview={allowReview}
              fieldName={fieldName}
              fieldValue={fieldValue}
              handleNestedFieldChange={handleNestedFieldChange}
              handleNestedRowDelete={handleNestedRowDelete}
              handleNestedRowAdd={handleNestedRowAdd}
              handleFieldClick={handleFieldClick}
            />
          </div>
        );
      }
      if (fieldName === "ROI" && viewType === "ROI") {
        return (
          <div className="text-xs" key={fieldName}>
            <ROIField
              allowLabelling={allowLabelling}
              allowReview={allowReview}
              fieldName={fieldName}
              fieldValue={fieldValue}
              handleNestedFieldChange={handleNestedFieldChange}
              handleNestedRowDelete={handleNestedRowDelete}
              handleNestedRowAdd={handleNestedRowAdd}
              handleFieldClick={handleFieldClick}
            />
          </div>
        );
      }
      return null;
    },
    [displayFields, viewType, selectedField]
  );

  const downloadJSON = useCallback(
    (data: { [key: string]: any } | null, filename: string) => {
      const json = JSON.stringify(data, null, 2);
      const blob = new Blob([json], { type: "application/json" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
    },
    []
  );

  return (
    <div
      className={`bg-white bg-opacity-0 ${viewType === "General" ? "w-[30vw]" : "mt-2"
        } text-center font-mono`}
    >
      {isLoading && <div className="flex items-center justify-center h-screen">
        <div className="loader border-t-4 border-blue-500 rounded-full w-12 h-12 mx-auto animate-spin"></div>

            </div>}
      <div
        className={`${viewType === "General"
          ? "sm:mt-2 md:mt-3 lg:mt-4 xl:mt-4 order-last"
          : ""
          }`}
      >
        <div className="flex justify-between sm:text-xs md:text-xs lg:text-lg xl:text-lg ml-auto">
          {viewType === "General" && (
            <AddField
              displayCols={displayFields}
              handleAddField={handleAddField}
              handleSelectAll={handleSelectAll}
            />
          )}
          <ToggleView viewType={viewType} handleChangeView={handleChangeView} />

          <div
            className="hover:bg-gray-200 rounded mr-2"
            title="Download JSON"
            onClick={() => downloadJSON(extractedData, `${doc_id}.json`)}
          >
            <svg
              className="h-5 w-5 mt-2 text-black "
              width="24"
              height="24"
              viewBox="0 0 24 24"
              strokeWidth="2"
              stroke="currentColor"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path stroke="none" d="M0 0h24v24H0z" />
              <path d="M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2 -2v-2" />
              <polyline points="7 11 12 16 17 11" />
              <line x1="12" y1="4" x2="12" y2="16" />
            </svg>
          </div>
        </div>
      </div>
      <div
        className={`${viewType === "General" ? "h-[80vh] overflow-y-auto" : ""
          } border shadow-inner`}
      >
        {extractedData ?
          Object.entries(extractedData).map(([fieldName, fieldValue]) =>
            renderField(fieldName, fieldValue)
          ) :
          !isLoading &&
          <div className="flex flex-col items-center justify-center h-screen w-[30vw]">
            <FaExclamationCircle className="text-5xl text-blue-400 mb-4" />
            <p className="text-xl text-blue-600 mb-4">No data available</p>
            <div className="space-x-4">
              <button
                onClick={() => startAnnotation()}
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
              >
                Annotate
              </button>
            </div>
          </div>}
      </div>
      {(status === "uploaded" || status === 'pre-labelled') &&
        (<div className="p-4 flex justify-center space-x-4">
          <div className="relative group">
            <button
              onClick={() => handleSave("labelled")}
              disabled={!dataChanged}
              className={`${dataChanged
                ? "bg-blue-500 hover:bg-blue-700"
                : "bg-gray-300 text-gray-400 cursor-not-allowed"
                } text-white py-2 px-4 rounded-md transition duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-300`}
            >
              Save
            </button>
            <div className="absolute left-1/2 transform -translate-x-1/2 bottom-full mb-2 hidden group-hover:block bg-black text-white text-xs rounded py-1 px-2">
              Alt+S
            </div>
          </div>
          <div className="relative group">
            <button
              onClick={handleDiscard}
              disabled={!dataChanged}
              className={`${dataChanged
                ? "bg-red-500 hover:bg-red-700"
                : "bg-gray-300 text-gray-400 cursor-not-allowed"
                } text-white py-2 px-4 rounded-md transition duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-red-300`}
            >
              Discard
            </button>
            <div className="absolute left-1/2 transform -translate-x-1/2 bottom-full mb-2 hidden group-hover:block bg-black text-white text-xs rounded py-1 px-2">
              Alt+D
            </div>
          </div>
        </div>)}
      {(status === 'labelled') && <div>
        <div className="p-4 flex justify-center space-x-4">
          <button
            onClick={() => handleSave("rejected")}
            disabled={!dataChanged}
            className={`${dataChanged
              ? "bg-red-500 hover:bg-red-700"
              : "bg-gray-300 text-gray-400 cursor-not-allowed"
              } text-white py-2 px-4 rounded-md transition duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-red-300`}
          >
            Reject
          </button>
          <button
            onClick={() => handleSave("accepted")}
            className="bg-blue-500 hover:bg-blue-700 text-white py-2 px-4 rounded-md transition duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-300"
            disabled={dataChanged}

          >
            Accept
          </button>
        </div>
      </div>}
    </div>
  );
};

export default ExtractedFields;
