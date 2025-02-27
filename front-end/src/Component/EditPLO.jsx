import React, { useState, useEffect } from "react";
import * as XLSX from "xlsx";

const CoursePloManagement = () => {
  const [programs, setPrograms] = useState([]);
  const [selectedProgram, setSelectedProgram] = useState(null);
  const [plos, setPlos] = useState([]);
  const [courses, setCourses] = useState([]);
  const [scores, setScores] = useState({});
  const [weights, setWeights] = useState({});
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [newPlo, setNewPlo] = useState({
    PLO_code: "",
    PLO_name: "",
    PLO_engname: "",
  });
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [selectedPlo, setSelectedPlo] = useState(null);
  const [editingScores, setEditingScores] = useState(false);
  const [excelData, setExcelData] = useState(null);
  const [typeError, setTypeError] = useState(null);

  // Fetch programs
  useEffect(() => {
    fetch("http://localhost:8000/program")
      .then((response) => response.json())
      .then((data) => setPrograms(data))
      .catch((error) => console.error("Error fetching programs:", error));
  }, []);

  // Fetch PLOs and Courses based on selected program
  useEffect(() => {
    if (selectedProgram) {
      fetch(`http://localhost:8000/program_plo?program_id=${selectedProgram}`)
        .then((response) => response.json())
        .then((data) => setPlos(data.success ? data.message : []));

      fetch(`http://localhost:8000/course?program_id=${selectedProgram}`)
        .then((response) => response.json())
        .then((data) => setCourses(data.success ? data.message : []));

      fetch(`http://localhost:8000/course_plo?program_id=${selectedProgram}`)
        .then((response) => response.json())
        .then((data) => {
          console.log("API Response:", data);
          const weightsData = {};
          data.forEach((item) => {
            const key = `${item.course_id}-${item.plo_id}`;
            weightsData[key] = item.weight;
          });
          setWeights(weightsData);
        })
        .catch((error) => console.error("Error fetching weights:", error));
    }
  }, [selectedProgram]);

  // Handle deleting a PLO
  const handleDeletePlo = (ploId) => {
    if (window.confirm("Are you sure you want to delete this PLO?")) {
      fetch(
        `http://localhost:8000/program_plo?program_id=${selectedProgram}&plo_id=${ploId}`,
        {
          method: "DELETE",
        }
      )
        .then((response) => response.json())
        .then((data) => {
          if (data.success) {
            setPlos(plos.filter((plo) => plo.plo_id !== ploId));
            alert("PLO deleted successfully");
          } else {
            alert("Error deleting PLO: " + data.message);
          }
        })
        .catch((error) => {
          console.error("Error deleting PLO:", error);
          alert("An error occurred while deleting the PLO");
        });
    }
  };

  const handleInputChange = (courseId, ploId, value) => {
    if (editingScores) {
      const updatedScores = { ...scores };
      updatedScores[`${courseId}-${ploId}`] = value ? parseInt(value) : 0;
      setScores(updatedScores);
    }
  };

  const calculateTotal = (courseId) => {
    return plos.reduce((sum, plo) => {
      const key = `${courseId}-${plo.plo_id}`;
      if (editingScores) {
        return sum + (scores[key] || 0); // ใช้ scores ถ้าอยู่ในโหมดแก้ไข
      } else {
        return sum + (weights[key] || 0); // ใช้ weights ถ้าไม่ได้อยู่ในโหมดแก้ไข
      }
    }, 0);
  };

  const handleEditToggle = () => {
    setEditingScores(!editingScores);
  };

  const handlePostScores = () => {
    // ตรวจสอบว่ามี program_id ที่เลือกและ scores ที่ต้องการส่ง
    if (!selectedProgram) {
      alert("Please select a program before submitting scores.");
      return;
    }

    if (Object.keys(scores).length === 0) {
      alert("No scores to submit. Please input scores first.");
      return;
    }

    // แปลง scores object ให้เป็น array ตามรูปแบบที่ต้องการ
    const scoresArray = Object.keys(scores).map((key) => {
      const [course_id, plo_id] = key.split("-");
      return {
        course_id: parseInt(course_id, 10), // Convert string to integer
        plo_id: parseInt(plo_id, 10), // Convert string to integer
        weight: parseFloat(scores[key]) || 0, // Convert weight to float (default 0)
      };
    });

    // เรียก API POST เพื่อส่งข้อมูล
    fetch("http://localhost:8000/course_plo", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        program_id: selectedProgram, // Ensure correct program_id is included
        scores: scoresArray, // Payload for the API
      }),
    })
      .then((response) => {
        if (!response.ok) {
          return response.json().then((data) => {
            throw new Error(data.message || "Failed to submit scores.");
          });
        }
        return response.json();
      })
      .then((data) => {
        if (data.success) {
          alert("Scores submitted successfully!");
          setEditingScores(false); // ยกเลิกโหมดแก้ไข
        } else {
          alert(`Error: ${data.message}`);
        }
      })
      .catch((error) => {
        console.error("Error posting scores:", error.message);
        alert(`An error occurred while submitting scores: ${error.message}`);
      });
  };

  const handlePatchScores = () => {
    const updatedScores = Object.keys(scores).map((key) => {
      const [course_id, plo_id] = key.split("-");
      return {
        program_id: parseInt(selectedProgram), // แปลง program_id ให้เป็นตัวเลข
        course_id: parseInt(course_id), // แปลง course_id ให้เป็นตัวเลข
        plo_id: parseInt(plo_id), // แปลง plo_id ให้เป็นตัวเลข
        weight: parseFloat(scores[key]) || 0, // แปลง weight เป็น float พร้อมตั้งค่า default เป็น 0
      };
    });

    // ใช้ Promise.all เพื่อส่ง PATCH requests ทั้งหมดในคราวเดียว
    Promise.all(
      updatedScores.map((score) =>
        fetch("http://localhost:8000/course_plo", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(score),
        })
          .then((response) => {
            if (!response.ok) {
              return response.json().then((data) => {
                throw new Error(data.message || "Failed to update score");
              });
            }
            return response.json();
          })
          .then((data) => {
            // Handle success for each individual score update
            console.log(
              `Successfully updated Course ID: ${score.course_id}, PLO ID: ${score.plo_id}`
            );
          })
          .catch((error) => {
            console.error("Error updating score:", error.message);
            alert(
              `Error updating score for Course ID: ${score.course_id}, PLO ID: ${score.plo_id} - ${error.message}`
            );
          })
      )
    )
      .then(() => {
        alert("All scores updated successfully!");
        setEditingScores(false); // ยกเลิกโหมดแก้ไขเมื่อสำเร็จ
      })
      .catch((error) => {
        console.error("Error during batch update:", error.message);
        alert("Error updating scores. Please try again.");
      });
  };

  const handleFileUpload = (e) => {
    let fileTypes = [
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "text/csv",
    ];
    let selectedFile = e.target.files[0];

    if (selectedFile) {
      if (fileTypes.includes(selectedFile.type)) {
        setTypeError(null);
        let reader = new FileReader();
        reader.onload = (event) => {
          try {
            const data = event.target.result;
            const workbook = XLSX.read(data, { type: "binary" });
            const sheetName = workbook.SheetNames[0];
            const sheet = workbook.Sheets[sheetName];
            const jsonData = XLSX.utils.sheet_to_json(sheet);

            // เพิ่ม program_id ที่ผู้ใช้เลือกเข้าไปในแต่ละแถว
            const updatedData = jsonData.map((row) => ({
              ...row,
              program_id: selectedProgram, // เพิ่ม program_id ที่เลือกจาก UI
            }));

            setExcelData(updatedData); // เก็บข้อมูลจากไฟล์
            console.log(updatedData);
          } catch (error) {
            console.error("Error reading file:", error);
          }
        };
        reader.onerror = (error) => {
          console.error("Error reading file:", error);
        };
        reader.readAsBinaryString(selectedFile);
      } else {
        setTypeError("Please select only Excel file types");
        setExcelData(null);
      }
    } else {
      console.log("Please select your file");
    }
  };

  const handleUploadButtonClick = () => {
    if (excelData) {
      fetch("http://localhost:8000/plo/excel", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(excelData),
      })
        .then((response) => {
          if (!response.ok) {
            return response.text().then((text) => {
              throw new Error(text);
            });
          }
          return response.json();
        })
        .then((data) => {
          console.log("Success:", data);
          alert("Data Uploaded Successfully!");
        })
        .catch((error) => {
          console.error("Error:", error);
          alert("An error occurred: " + error.message);
        });
    } else {
      console.error("No data to upload");
    }
  };

  const handlePasteButtonClick = async () => {
    try {
      // อ่านข้อมูลจาก Clipboard
      const text = await navigator.clipboard.readText();
  
      // ใช้ XLSX เพื่อแปลงข้อมูลที่วางเป็น JSON
      const workbook = XLSX.read(text, { type: 'string' });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(sheet);
  
      // เพิ่ม program_id ให้กับทุกแถว
      const updatedData = jsonData.map(row => ({
        ...row,
        program_id: selectedProgram, // ใส่ program_id ที่เลือก
      }));
  
      setExcelData(updatedData); // อัปเดตข้อมูลใน State
      console.log("Pasted Data:", updatedData);
    } catch (err) {
      console.error("Failed to paste data:", err);
      alert("Failed to paste data. Make sure you copied valid Excel data.");
    }
  };
  
  const handleAddPlo = () => {
    fetch("http://localhost:8000/plo", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        PLO_name: newPlo.PLO_name,
        PLO_engname: newPlo.PLO_engname,
        PLO_code: newPlo.PLO_code,
        program_id: selectedProgram, // program ที่เลือกใน React
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          setPlos([...plos, data.newPlo]); // อัปเดต PLO ใหม่ใน state
          setShowAddModal(false); // ปิด modal
          alert("PLO added successfully");
        } else {
          alert("Error adding PLO: " + data.message);
        }
      })
      .catch((error) => {
        console.error("Error adding PLO:", error);
        alert("An error occurred while adding the PLO");
      });
  };

  const handleEditPlo = (plo) => {
    setNewPlo({
      PLO_code: plo.PLO_code,
      PLO_name: plo.PLO_name,
      PLO_engname: plo.PLO_engname,
    });
    setShowEditModal(true); // เปิด modal สำหรับการแก้ไข
  };

  const handleUpdatePlo = () => {
    const selectedPlo = plos.find((plo) => plo.PLO_code === newPlo.PLO_code);

    if (!selectedPlo) {
      alert("Invalid PLO code selected");
      return;
    }

    // Log the data to check the payload
    console.log("Updating PLO with data:", {
      program_id: selectedProgram,
      plo_id: selectedPlo.plo_id,
      PLO_name: newPlo.PLO_name,
      PLO_engname: newPlo.PLO_engname,
    });

    fetch("http://localhost:8000/program_plo", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        program_id: selectedProgram, // Ensure this is set correctly
        plo_id: selectedPlo.plo_id, // Ensure the PLO ID is correct
        PLO_name: newPlo.PLO_name, // Ensure this is set and not empty
        PLO_engname: newPlo.PLO_engname, // Ensure this is set and not empty
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          alert("PLO updated successfully");
          setShowEditModal(false); // Close the modal on success
        } else {
          console.error("Error from backend:", data);
          alert("Error updating PLO: " + (data.message || "Unknown error"));
        }
      })
      .catch((error) => {
        console.error("Error updating PLO:", error);
        alert("An error occurred while updating the PLO");
      });
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>Course-PLO Management</h1>

      <label>Select Program: </label>
      <select
        onChange={(e) => setSelectedProgram(e.target.value)}
        value={selectedProgram || ""}
      >
        <option value="">-- Select a Program --</option>
        {programs.map((program) => (
          <option key={program.program_id} value={program.program_id}>
            {program.program_name}
          </option>
        ))}
      </select>

      <div>
        <h2>PLO List</h2>
        <div style={{ marginBottom: "10px" }}>
          <button
            onClick={() => setShowAddModal(true)}
            style={{
              backgroundColor: "blue",
              color: "white",
              padding: "8px 16px",
              border: "none",
              cursor: "pointer",
              marginRight: "10px",
            }}
          >
            Add PLO
          </button>
        </div>

        <div style={{ marginBottom: "20px" }}>
          <input
            type="file"
            accept=".xlsx, .xls"
            onChange={handleFileUpload}
            style={{
              backgroundColor: "green",
              color: "white",
              padding: "8px 16px",
              border: "none",
              cursor: "pointer",
              marginBottom: "10px",
            }}
          />
          {typeError && (
            <div style={{ color: "red", marginTop: "10px" }}>{typeError}</div>
          )}

<button
      onClick={handlePasteButtonClick}
      style={{
        backgroundColor: "purple",
        color: "white",
        padding: "8px 16px",
        border: "none",
        cursor: "pointer",
        marginLeft: "10px",
      }}
    >
      Paste Data
    </button>

          <button
            onClick={handleUploadButtonClick}
            style={{
              backgroundColor: "orange",
              color: "white",
              padding: "8px 16px",
              border: "none",
              cursor: "pointer",
              marginTop: "10px",
            }}
          >
            Upload Data
          </button>
        </div>

        {/* แสดงข้อมูลที่ได้จากไฟล์ Excel */}
        {excelData && (
          <div>
            <h3>Preview Uploaded Data:</h3>
            <pre>{JSON.stringify(excelData, null, 2)}</pre>
          </div>
        )}

        <table border="1">
          <thead>
            <tr>
              <th>PLO Code</th>
              <th>PLO Name</th>
              <th>PLO English Name</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {plos.map((plo) => (
              <tr key={plo.plo_id}>
                <td>{plo.PLO_code}</td>
                <td>{plo.PLO_name}</td>
                <td>{plo.PLO_engname}</td>
                <td>
                  <button onClick={() => handleDeletePlo(plo.plo_id)}>
                    Delete
                  </button>
                  <button onClick={() => handleEditPlo(plo)}>Edit</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h2>Course-PLO Mapping</h2>
      <button onClick={handleEditToggle}>
        {editingScores ? "Cancel Edit" : "Edit"}
      </button>
      <button onClick={handlePatchScores} disabled={!editingScores}>
        Confirm
      </button>
      <button onClick={handlePostScores} disabled={!editingScores}>
        Submit New Scores
      </button>

      <table border="1" cellPadding="10">
        <thead>
          <tr>
            <th>Course</th>
            {plos.map((plo) => (
              <th key={plo.plo_id}>{plo.PLO_code}</th>
            ))}
            <th>Total</th>
          </tr>
        </thead>
        <tbody>
          {courses.map((course) => (
            <tr key={course.course_id}>
              <td>
                {course.course_id} {course.course_name}
              </td>
              {plos.map((plo) => {
                const key = `${course.course_id}-${plo.plo_id}`;
                return (
                  <td key={plo.plo_id}>
                    {editingScores ? (
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={scores[key] || ""}
                        onChange={(e) =>
                          handleInputChange(
                            course.course_id,
                            plo.plo_id,
                            e.target.value
                          )
                        }
                      />
                    ) : (
                      (weights[key] !== undefined ? weights[key] : "-") || "-"
                    )}
                  </td>
                );
              })}
              <td>{calculateTotal(course.course_id)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Modal for Add PLO */}
      {showAddModal && (
        <div
          style={{
            position: "fixed",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            backgroundColor: "white",
            padding: "20px",
            boxShadow: "0 2px 10px rgba(0, 0, 0, 0.1)",
            zIndex: 1000,
            width: "300px",
          }}
        >
          <h3>Add New PLO</h3>
          <label>PLO Code:</label>
          <input
            type="text"
            value={newPlo.PLO_code}
            onChange={(e) => setNewPlo({ ...newPlo, PLO_code: e.target.value })}
            style={{ width: "100%" }}
          />
          <label>PLO Name:</label>
          <input
            type="text"
            value={newPlo.PLO_name}
            onChange={(e) => setNewPlo({ ...newPlo, PLO_name: e.target.value })}
            style={{ width: "100%" }}
          />
          <label>PLO English Name:</label>
          <input
            type="text"
            value={newPlo.PLO_engname}
            onChange={(e) =>
              setNewPlo({ ...newPlo, PLO_engname: e.target.value })
            }
            style={{ width: "100%" }}
          />
          <button
            onClick={handleAddPlo}
            style={{
              backgroundColor: "blue",
              color: "white",
              padding: "8px 16px",
              border: "none",
              cursor: "pointer",
              marginTop: "10px",
              width: "100%",
            }}
          >
            Add PLO
          </button>
          <button
            onClick={() => setShowAddModal(false)}
            style={{
              backgroundColor: "red",
              color: "white",
              padding: "8px 16px",
              border: "none",
              cursor: "pointer",
              marginTop: "10px",
              width: "100%",
            }}
          >
            Close
          </button>
        </div>
      )}

      {showEditModal && (
        <div
          style={{
            position: "fixed",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            backgroundColor: "white",
            padding: "20px",
            boxShadow: "0 2px 10px rgba(0, 0, 0, 0.1)",
            zIndex: 1000,
            width: "300px",
          }}
        >
          <h3>Edit PLO</h3>
          <label>PLO Code:</label>
          <input
            type="text"
            value={newPlo.PLO_code}
            onChange={(e) => setNewPlo({ ...newPlo, PLO_code: e.target.value })}
            style={{ width: "100%" }}
          />
          <label>PLO Name:</label>
          <input
            type="text"
            value={newPlo.PLO_name}
            onChange={(e) => setNewPlo({ ...newPlo, PLO_name: e.target.value })}
            style={{ width: "100%" }}
          />
          <label>PLO English Name:</label>
          <input
            type="text"
            value={newPlo.PLO_engname}
            onChange={(e) =>
              setNewPlo({ ...newPlo, PLO_engname: e.target.value })
            }
            style={{ width: "100%" }}
          />
          <div style={{ marginTop: "10px" }}>
            <button onClick={handleUpdatePlo} style={{ marginRight: "10px" }}>
              Update
            </button>
            <button onClick={() => setShowEditModal(false)}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CoursePloManagement;
