import { useState, useEffect } from "react";
import DocViewer from "@/app/triage/components/DocViewer";
import ExtractedFields from "@/app/triage/components/ExtractedFields";
import axiosInstance from "@/app/utils/axiosInstance";

interface InteractiveSpaceProps {
  doc_id: string;
  status: string;
  handleNextClick: () => void;
}

const InteractiveSpace: React.FC<InteractiveSpaceProps> = ({
  doc_id,
  status,
  handleNextClick 
}) => {
  const [boxLocation, setBoxLocation] = useState<Record<string, any> | null>(
    null
  );
  const [selectedField, setSelectedField] = useState<string | null>(null);
  const [selectedRow, setSelectedRow] = useState<number | null>(null);
  const [colName, setColName] = useState<string | null>(null);
  const [view, setView] = useState("General");

  const [extractedData, setExtractedData] = useState<{
    [key: string]: any;
  } | null>(null);

  const [noData, setNoData] = useState(false);
  const [isLoading, setLoading] = useState(true);
  const [dataChanged, setDataChanged] = useState(false);

  const handleSingleValuedFieldChange = (
    fieldName: string | null,
    value: string | null,
    location: Record<string, any> | null,
    instruction: string
  ) => {

    if (!fieldName) {
      return;
    }

    setExtractedData((prevValues: { [key: string]: any }) => {
      const newData = { ...prevValues };
      const fieldLevels = fieldName.split(".");
      let currentLevel = newData;
      for (let i = 0; i < fieldLevels.length - 1; i++) {
        const level = fieldLevels[i];
        currentLevel[level] = { ...(currentLevel[level] || {}) };
        currentLevel = currentLevel[level];
      }
      if (instruction === "update value") {
        currentLevel[fieldLevels[fieldLevels.length - 1]].text = value
          ? value
          : "";
      }
      if (instruction === "add bbox" || instruction === "del bbox") {
        currentLevel[fieldLevels[fieldLevels.length - 1]].location = location
          ? location
          : { pageNo: 0, ltwh: [0, 0, 0, 0] };

        setBoxLocation(location);
      }
      if (instruction === "add comment" || instruction === "del comment") {
        currentLevel[fieldLevels[fieldLevels.length - 1]].comment = value
          ? value
          : "";
      }
      return newData;
    });
    setDataChanged(true);
  };

  const handleNestedFieldChange = (
    fieldName: string,
    index: number | null,
    colName: string | null,
    value: string | null,
    location: Record<string, any> | null,
    instruction: string
  ) => {
    if (index == null || !colName) {
      return;
    }
    // console.log(fieldName, index, colName, value, instruction)

    setExtractedData((prevData) => {
      const newData = { ...prevData };
      const updatedItem = { ...newData[fieldName][index] };
      if (instruction === "update value") {
        updatedItem[colName] = {
          ...updatedItem[colName],
          text: value ? value : "",
        };
      }
      if (instruction === "add bbox" || instruction === "del bbox") {
        updatedItem[colName] = {
          ...updatedItem[colName],
          location: location ? location : { pageNo: 0, ltwh: [0, 0, 0, 0] },
        };
        setBoxLocation(location);
      }
      if (instruction === "add comment") {
        updatedItem[colName] = {
          ...updatedItem[colName],
          comment: value ? value : "",
        };
      }
      if (instruction === "del comment") {
        updatedItem[colName] = {
          ...updatedItem[colName],
          comment: "",
        };
      }
      newData[fieldName][index] = updatedItem;
      return newData;
    });
    setDataChanged(true);
  };

  const handleNestedRowDelete = (fieldName: string, index: number) => {
    setExtractedData((prevData) => {
      const newData = { ...prevData };
      const updatedTable = [...newData[fieldName]];

      if (updatedTable.length > 1) {
        updatedTable.splice(index, 1);
        newData[fieldName] = updatedTable;
      }
      else {
        handleNestedRowAdd(fieldName)
        handleNestedRowDelete(fieldName, index)
      }

      return newData;
    });

    setDataChanged(true);
  };


  const handleNestedRowAdd = (fieldName: string) => {
    setExtractedData((prevData) => {
      const newData = { ...prevData };
      const lastRowIndex = newData[fieldName].length - 1;

      const lastRow = newData[fieldName][lastRowIndex];

      const newRow = { ...lastRow };

      for (const field in lastRow) {
        newRow[field] = {
          text: "",
          location: {
            pageNo: 0,
            ltwh: [0, 0, 0, 0],
          },
        };
      }

      newData[fieldName] = [...newData[fieldName], { ...newRow }];

      return newData;
    });

    setDataChanged(true);
  };

  const handleAccept = async () => {
    try {
      const response = await axiosInstance.post(
        `/accept/${status}/${doc_id}/`,
        JSON.stringify(extractedData)
      );

      if (response.status >= 200 && response.status < 300) {
        setDataChanged(false);
        setNoData(false);
      } else {
        console.error("Failed to accept");
      }
    } catch (error) {
      console.error("Error accepting:", error);
    }

    handleNextClick();
  }

  const handleSubmit = async () => {
    let commentList = []
    for (const field in extractedData) {
      if (Array.isArray(extractedData[field])) {
        for (const item of extractedData[field]) {
          for (const subField in item) {
            if (item[subField].comment) {
              commentList.push(`${field}[${subField}]: ${item[subField].comment}`)
            }
          }
        }
      } else if (extractedData[field].comment) {
        commentList.push(`${field}: ${extractedData[field].comment}`)
      }
    }

    if (commentList.length > 0) {
      alert("Please remove all comment before rejecting:\n" + commentList.join("\n"))
      return
    }

    try {
      const response = await axiosInstance.post(
        `/submit/${status}/${doc_id}/`,
        JSON.stringify(extractedData)
      );

      if (response.status >= 200 && response.status < 300) {
        setDataChanged(false);
        setNoData(false);
      } else {
        console.error("Failed to submit");
      }
    } catch (error) {
      console.error("Error submitting:", error);
    }

    handleNextClick();
  }

  const handleReject = async () => {
    let commentList = []
    for (const field in extractedData) {
      if (Array.isArray(extractedData[field])) {
        for (const item of extractedData[field]) {
          for (const subField in item) {
            if (item[subField].comment) {
              commentList.push(`${field}[${subField}]: ${item[subField].comment}`)
            }
          }
        }
      } else if (extractedData[field].comment) {
        commentList.push(`${field}: ${extractedData[field].comment}`)
      }
    }

    if (commentList.length == 0) {
      alert("Please add a comment before rejecting")
      return
    }

    try {
      const response = await axiosInstance.post(
        `/reject/${status}/${doc_id}/`,
        JSON.stringify(extractedData)
      );

      if (response.status >= 200 && response.status < 300) {
        setDataChanged(false);
        setNoData(false);
      } else {
        console.error("Failed to reject");
      }
    } catch (error) {
      console.error("Error rejecting:", error);
    }

    handleNextClick();

  }

  const handleSave = async () => {
    try {
      const response = await axiosInstance.post(
        `save/${status}/${doc_id}/`,
        JSON.stringify(extractedData)
      );

      if (response.status >= 200 && response.status < 300) {
        console.log("Data saved successfully");
        setDataChanged(false);
        setNoData(false);
      } else {
        console.error("Failed to save data");
      }
    } catch (error) {
      console.error("Error saving data:", error);
    }
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get(`/get_json/${status}/${doc_id}`);
      const data = await response.data.data;
      if (data && !data.detail) {
        setExtractedData(data);
        setDataChanged(false);
      } else {
        setExtractedData(null);
        setNoData(true);
      }
      setLoading(false);
    } catch (error) {
      console.error("Error fetching data:", error);
      setLoading(false);
    }
  };

  const handleReset = async () => {
    fetchData();
  };

  useEffect(() => {
    fetchData();
  }, [doc_id]);

  const handleFieldClick = (
    fieldName: string,
    index: number | null,
    colName: string | null,
    location: Record<string, any>
  ) => {

    if (location.pageNo !== 0) {
      setSelectedRow(index);
      setBoxLocation(location);
      setSelectedField(fieldName);
      setColName(colName);
    } else {
      setSelectedRow(index);
      setBoxLocation(null);
      setSelectedField(fieldName);
      setColName(colName);
    }
  };

  const handleChangeView = (viewType: string) => {
    setView(viewType);
    setSelectedField(null)
  };

  const startAnnotation = () => {
    setExtractedData({});
    setNoData(false);
  }

  return (
    <div className={`${view === "General" ? "flex" : ""}`}>
      <DocViewer
        doc_id={doc_id}
        boxLocation={boxLocation}
        viewType={view}
        handleSingleValuedFieldChange={handleSingleValuedFieldChange}
        handleNestedFieldChange={handleNestedFieldChange}
        selectedRow={selectedRow}
        selectedField={selectedField}
        colName={colName}
        dataChanged={dataChanged}
      />
      <ExtractedFields
        doc_id={doc_id}
        status={status}
        startAnnotation={startAnnotation}
        handleFieldClick={handleFieldClick}
        handleChangeView={handleChangeView}
        viewType={view}
        selectedField={selectedField}
        extractedData={extractedData}
        handleSingleValuedFieldChange={handleSingleValuedFieldChange}
        handleNestedFieldChange={handleNestedFieldChange}
        handleNestedRowDelete={handleNestedRowDelete}
        handleNestedRowAdd={handleNestedRowAdd}
        isLoading={isLoading}
        nodata={noData}
        dataChanged={dataChanged}
        handleSave={handleSave}
        handleReset={handleReset}
        handleSubmit={handleSubmit}
        handleAccept={handleAccept}
        handleReject={handleReject}
      />
    </div>
  );
};

export default InteractiveSpace;
