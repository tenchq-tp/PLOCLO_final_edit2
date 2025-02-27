import React, { useState, useEffect } from "react";
import { FaBars } from "react-icons/fa";
import { Link } from "react-router-dom";
import * as XLSX from "xlsx"; 


function Assignment() {
  const [programs, setPrograms] = useState([]);
  const [course, setCourse] = useState("");  // เพิ่ม state สำหรับเก็บข้อมูล course
  //const [assignmentName, setAssignmentName] = useState(""); // เพิ่ม state สำหรับเก็บข้อมูล assignmentName
  const [year, setYear] = useState("");  // เพิ่ม state สำหรับเก็บข้อมูล year

  const [selectedProgram, setSelectedProgram] = useState("");
  const [selectedCourseId, setSelectedCourseId] = useState("");
  const [selectedSectionId, setSelectedSectionId] = useState("");
  const [selectedSemesterId, setSelectedSemesterId] = useState("");
  const [selectedYear, setSelectedYear] = useState("");
  const [assignmentName, setAssignmentName] = useState("");
  const [programCourseData, setProgramCourseData] = useState({
    courses: [],
    sections: [],
    semesters: [],
    years: [],
  });
  const [assignments, setAssignments] = useState([]);
  const [typeError, setTypeError] = useState(null);
  const [students, setStudents] = useState([]);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [selectedStudentName, setSelectedStudentName] = useState(""); // State สำหรับชื่อของนักเรียน
  //const [selectedCourse, setSelectedCourse] = useState(""); // State สำหรับหลักสูตร

  const [selectedCourse, setSelectedCourse] = useState("");
const [selectedAssignmentName, setSelectedAssignmentName] = useState("");
//const [selectedYear, setSelectedYear] = useState("");

// เมื่อดึงข้อมูลมาแล้ว ให้ตั้งค่าลงใน state
useEffect(() => {
  if (selectedProgram) {
    const selectedProgramData = programs.find(
      (program) => program.program_name === selectedProgram
    );
    if (selectedProgramData) {
      const programId = selectedProgramData.program_id;
      fetch(`http://localhost:8000/program_courses_detail?program_id=${programId}`)
        .then((response) => {
          if (!response.ok) throw new Error("Failed to fetch program_course data");
          return response.json();
        })
        .then((data) => {
          // สมมติว่าเราดึงข้อมูล course, assignmentName และ year จาก data
          setSelectedCourse(data.course_name); // สมมติว่าได้ course_name มาจาก data
          setSelectedAssignmentName(data.assignment_name); // assignment_name
          setSelectedYear(data.year); // year
        })
        .catch((error) => {
          console.error("Error fetching program_course data:", error);
        });
    }
  }
}, [selectedProgram]);


  

  useEffect(() => {
    fetch("http://localhost:8000/program")
      .then((response) => {
        if (!response.ok) throw new Error("Failed to fetch programs");
        return response.json();
      })
      .then((data) => setPrograms(data))
      .catch((error) => {
        console.error("Error fetching programs:", error);
        setPrograms([]);
      });
  }, []);

  useEffect(() => {
    if (selectedProgram) {
      const selectedProgramData = programs.find(
        (program) => program.program_name === selectedProgram
      );
      if (selectedProgramData) {
        const programId = selectedProgramData.program_id;
        fetch(`http://localhost:8000/program_courses_detail?program_id=${programId}`)
          .then((response) => {
            if (!response.ok) throw new Error("Failed to fetch program_course data");
            return response.json();
          })
          .then((data) => {
            const uniqueCourses = data.filter(
              (value, index, self) => index === self.findIndex((t) => t.course_id === value.course_id)
            );
            const uniqueSections = data.filter(
              (value, index, self) => index === self.findIndex((t) => t.section_id === value.section_id)
            );
            const uniqueSemesters = data.filter(
              (value, index, self) => index === self.findIndex((t) => t.semester_id === value.semester_id)
            );

            setProgramCourseData({
              courses: uniqueCourses.map((item) => item.course_name),
              sections: uniqueSections.map((item) => item.section_id),
              semesters: uniqueSemesters.map((item) => item.semester_id),
              years: [...new Set(data.map((item) => item.year))],
            });
          })
          .catch((error) => {
            console.error("Error fetching program_course data:", error);
            setProgramCourseData({
              courses: [],
              sections: [],
              semesters: [],
              years: [],
            });
          });
      }
    }
  }, [selectedProgram, programs]);

  useEffect(() => {
    fetch("http://localhost:8000/api/get_assignments")
      .then((response) => response.json())
      .then((data) => {
        // ตรวจสอบข้อมูลที่ได้รับ
        console.log(data);  // พิมพ์ข้อมูลที่ได้จาก API
        setAssignments(data);  // กำหนดให้ assignments เป็นข้อมูลจากฐานข้อมูลจริง
      })
      .catch((error) => console.error("Error fetching assignments:", error));
  }, []);
  
  

  const handleSelectProgram = (programName) => {
    setSelectedProgram(programName);
    setSelectedCourseId("");
    setSelectedSectionId("");
    setSelectedSemesterId("");
    setSelectedYear("");
  };

  const handleSaveAssignment = () => {
    if (
      !selectedProgram ||
      !selectedCourseId ||
      !selectedSectionId ||
      !selectedSemesterId ||
      !selectedYear ||
      !assignmentName
    ) {
      setTypeError("กรุณากรอกข้อมูลทั้งหมดก่อนบันทึก");
      return;
    }

    const newAssignment = {
      program: selectedProgram,
      courseName: selectedCourseId,
      sectionId: selectedSectionId,
      semesterId: selectedSemesterId,
      year: selectedYear,
      assignmentName: assignmentName,
    };

    fetch("http://localhost:8000/api/add_assignment", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(newAssignment),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.message) {
          alert("บันทึก Assignment สำเร็จ!");
          setAssignments([...assignments, newAssignment]);
          setAssignmentName("");
        }
      })
      .catch((error) => {
        console.error("Error saving Assignment:", error);
      });
  };

  const handleFetchStudents = () => {
    fetch("http://localhost:8000/students")
      .then((response) => response.json())
      .then((data) => {
        setStudents(data);
      })
      .catch((error) => console.error("Error fetching students:", error));
  };


  useEffect(() => {
    console.log("Course selected:", course);
    console.log("Assignment Name selected:", assignmentName);
    console.log("Year selected:", year);
  }, [course, assignmentName, year]);
  
  

  const handleAddStudentToAssignment = (studentId, assignmentId) => {
    // ตรวจสอบข้อมูลที่ต้องการจะใช้
    const student = students.find((s) => s.student_id === studentId);
    const assignment = assignments.find((a) => a.assignment_id === assignmentId);
  
    if (student && assignment) {
      console.log("Adding student to assignment...");
      console.log("Student ID:", student.student_id);
      console.log("Student Name:", student.name);
      console.log("Course:", assignment.course_name);
      console.log("Assignment Name:", assignment.assignment_name);
      console.log("Year:", assignment.year);
  
      // ส่งข้อมูลไปยัง API
      fetch("http://localhost:8000/api/add_student_to_assignment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          student_id: studentId,
          assignment_id: assignmentId,  // ใช้ assignment_id จากฐานข้อมูล
          name: student.name,
          course: assignment.course_name,
          assignment_name: assignment.assignment_name,
          year: assignment.year,
        }),
      })
        .then((response) => response.json())
        .then((data) => {
          if (data.message) {
            alert("Student added successfully!");
          }
        })
        .catch((error) => {
          console.error("Error adding student:", error);
        });
    }
  };

  
  

  return (
    <div className="container-fluid py-4" style={{ backgroundColor: "#f9f9f9" }}>
      {/* Header */}
      <div className="d-flex align-items-center mb-4">
        <button className="btn btn-outline-dark me-3">
          <FaBars />
        </button>
        <h5 className="mb-0">Assignment Management</h5>
      </div>

      {/* Program Selection */}
      <div className="card p-3 mb-4" style={{ backgroundColor: "#e0e4cc" }}>
        {programs.length === 0 ? (
          <p>No programs available</p>
        ) : (
          <select
            className="form-select"
            value={selectedProgram || ""}
            onChange={(e) => handleSelectProgram(e.target.value)}
          >
            <option value="" disabled>
              Select Program
            </option>
            {programs.map((program) => (
              <option key={program.program_id} value={program.program_name}>
                {program.program_name}
              </option>
            ))}
          </select>
        )}
      </div>

      {/* Course, Section, Semester, Year Selection */}
      <div className="row mb-3">
        <div className="col-md-3">
          <select
            className="form-select"
            value={selectedCourseId || ""}
            onChange={(e) => setSelectedCourseId(e.target.value)}
            disabled={!programCourseData.courses.length}
          >
            <option value="" disabled>Select Course</option>
            {programCourseData.courses.map((course) => (
              <option key={course} value={course}>
                {course}
              </option>
            ))}
          </select>
        </div>
        <div className="col-md-3">
          <select
            className="form-select"
            value={selectedSectionId || ""}
            onChange={(e) => setSelectedSectionId(e.target.value)}
            disabled={!programCourseData.sections.length}
          >
            <option value="" disabled>Select Section</option>
            {programCourseData.sections.map((section) => (
              <option key={section} value={section}>
                {section}
              </option>
            ))}
          </select>
        </div>
        <div className="col-md-3">
          <select
            className="form-select"
            value={selectedSemesterId || ""}
            onChange={(e) => setSelectedSemesterId(e.target.value)}
            disabled={!programCourseData.semesters.length}
          >
            <option value="" disabled>Select Semester</option>
            {programCourseData.semesters.map((semester) => (
              <option key={semester} value={semester}>
                {semester}
              </option>
            ))}
          </select>
        </div>
        <div className="col-md-3">
          <select
            className="form-select"
            value={selectedYear || ""}
            onChange={(e) => setSelectedYear(e.target.value)}
            disabled={!programCourseData.years.length}
          >
            <option value="" disabled>Select Year</option>
            {programCourseData.years.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Assignment Name Input */}
      <div className="mb-3">
        <label htmlFor="assignment-name" className="form-label">Assignment Name</label>
        <input
          type="text"
          className="form-control"
          id="assignment-name"
          value={assignmentName}
          onChange={(e) => setAssignmentName(e.target.value)}
          placeholder="Enter Assignment Name"
        />
      </div>

      {/* Save Button */}
      <div className="d-flex justify-content-end">
        <button
          onClick={handleSaveAssignment}
          className="btn btn-primary"
          disabled={
            !(
              selectedProgram &&
              selectedCourseId &&
              selectedSectionId &&
              selectedSemesterId &&
              selectedYear &&
              assignmentName
            )
          }
        >
          Save Assignment
        </button>
      </div>

      {/* Error Message */}
      {typeError && <p className="text-danger mt-3">{typeError}</p>}

      {/* Assignments List */}
      <div className="card mt-4">
  <div className="card-header">
    <h5>Assignments</h5>
  </div>
  <div className="card-body">
    {assignments.length > 0 ? (
      <ul className="list-group">
        {assignments.map((assignment) => (
          <li
            key={assignment.assignment_id}  // ใช้ assignment_id ที่มาจากฐานข้อมูลจริง
            className="list-group-item d-flex justify-content-between align-items-center"
          >
            <strong>
              {/* ใช้ assignment.assignment_id จากฐานข้อมูลจริง */}
              <Link to={`/assignment/${assignment.assignment_id}`} className="text-decoration-none">
                {assignment.assignment_name}
              </Link>
            </strong>
            <strong>{assignment.course_name}</strong>
            <strong>{assignment.section_id}</strong>
            <br />
            <small>{assignment.semester_id}</small>
            <small>{assignment.year}</small>
            <button
              className="btn btn-sm btn-success"
              onClick={() => {
                setSelectedAssignment(assignment);  // เลือก Assignment
                handleFetchStudents();  // ดึงข้อมูลนักเรียน
              }}
            >
              +
            </button>
          </li>
        ))}
      </ul>
    ) : (
      <p>No assignments available.</p>
    )}
  </div>
</div>





      {/* Students List */}
      {selectedAssignment && students.length > 0 && (
        <div className="mt-4">
          <h5>Students for Assignment: {selectedAssignment?.assignment_name}</h5>
          <ul className="list-group">
            {students.map((student) => (
              <li key={student.student_id} className="list-group-item d-flex justify-content-between align-items-center">
                <div>
                  <strong>{student.studentid}</strong> {/* Student ID */}
                  <strong>{student.name}</strong> {/* Student Name */}
                  <br />
                  <small>{student.course_name}</small> {/* Course */}
                </div>

                {/* Green Button with Plus Icon and Text */}
                <button
                  className="btn btn-sm btn-success d-flex align-items-center"
                  onClick={() => {
                    if (!selectedAssignment) return;
                    handleAddStudentToAssignment(student.student_id, selectedAssignment.assignment_id);
                  }}
                >
                  <i className="fas fa-plus me-2"></i>
                  Add Student
                </button>
                
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default Assignment;