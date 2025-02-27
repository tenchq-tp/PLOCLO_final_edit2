import React, { useState, useEffect } from "react";
import axios from "axios";

export default function Program() {
  const [program, setProgram] = useState([]);
  const [newProgram, setNewProgram] = useState("");
  const [editProgram, setEditProgram] = useState(null);
  const [editName, setEditName] = useState("");

  // Fetch program from the API when the component loads
  useEffect(() => {
    axios
      .get("http://localhost:8000/program") // Changed port to 8000
      .then((response) => {
        setProgram(response.data);
      })
      .catch((error) => console.error("Error fetching program:", error));
  }, []);

  // Function to add a new program
  const handleAddProgram = () => {
    if (newProgram.trim() === "") return;

    axios
      .post("http://localhost:8000/program", { program_name: newProgram }) // Changed port to 8000
      .then((response) => {
        setProgram([...program, { program_id: response.data.program_id, program_name: newProgram }]);
        setNewProgram("");
      })
      .catch((error) => console.error("Error adding program:", error));
  };

  // Function to edit an existing program
  const handleEditProgram = () => {
    if (editName.trim() === "" || !editProgram) return;

    axios
      .put(`http://localhost:8000/program/${editProgram.program_id}`, {
        program_name: editName,
      }) // Changed port to 8000
      .then(() => {
        const updatedProgram = program.map((p) =>
          p.program_id === editProgram.program_id
            ? { ...p, program_name: editName }
            : p
        );
        setProgram(updatedProgram);
        setEditProgram(null);
        setEditName("");
      })
      .catch((error) => console.error("Error editing program:", error));
  };

  // Function to delete a program
  const handleDeleteProgram = (program_id) => {
    axios
      .delete(`http://localhost:8000/program/${program_id}`) // Changed port to 8000
      .then(() => {
        const updatedProgram = program.filter((p) => p.program_id !== program_id);
        setProgram(updatedProgram);
      })
      .catch((error) => console.error("Error deleting program:", error));
  };

  return (
    <div className="card p-4 position-relative">
      <h3>Add Edit Delete Program</h3>

      {/* Section to add a new program */}
      <div className="mb-3">
        <label className="form-label text-start">Add Program</label>
        <div className="d-flex align-items-center">
          <input
            type="text"
            className="form-control me-2"
            placeholder="Name"
            value={newProgram}
            onChange={(e) => setNewProgram(e.target.value)}
          />
          <button
            className="btn btn-primary"
            onClick={handleAddProgram}
            style={{ width: "100px" }}
            disabled={newProgram.trim() === ""} // Disable if no input
          >
            Insert
          </button>
        </div>
      </div>

      {/* Section to edit an existing program */}
      <div className="mb-3">
        <label className="form-label text-start">Edit Program</label>
        <div className="d-flex align-items-center justify-content-between">
          <div className="d-flex flex-grow-1 me-0">
            <select
              className="form-select me-0"
              value={editProgram ? editProgram.program_id : ""}
              onChange={(e) => {
                const selectedId = parseInt(e.target.value, 10);
                const selectedProgram = program.find((p) => p.program_id === selectedId);
                setEditProgram(selectedProgram);
                setEditName(selectedProgram ? selectedProgram.program_name : "");
              }}
            >
              <option value="" disabled>
                Select Program
              </option>
              {program.map((p) => (
                <option key={p.program_id} value={p.program_id}>
                  {p.program_name}
                </option>
              ))}
            </select>
            <input
              type="text"
              className="form-control me-0"
              placeholder="New Name"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              disabled={!editProgram}
            />
          </div>
          <button
            className="btn btn-primary"
            onClick={handleEditProgram}
            disabled={!editProgram}
            style={{ width: "100px" }}
          >
            Edit
          </button>
        </div>
      </div>

      {/* Program list */}
      <h5>Program</h5>
      <table className="table table-bordered mt-3">
        <thead>
          <tr>
            <th>Program</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {program.map((p) => (
            <tr key={p.program_id}>
              <td>{p.program_name}</td>
              <td>
                <button
                  className="btn btn-danger btn-sm"
                  onClick={() => handleDeleteProgram(p.program_id)}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
