import React, { useState, useEffect } from "react";
import axios from "axios";

function ViewCourseInfo() {
  const [programs, setPrograms] = useState([]);
  const [selectedProgram, setSelectedProgram] = useState(null);
  const [courses, setCourses] = useState([]);

  useEffect(() => {
    axios.get("http://localhost:8000/api/program")
      .then(response => {
        setPrograms(response.data);
      })
      .catch(error => {
        console.error("There was an error fetching the data!", error);
      });
  }, []);

  const handleProgramClick = (program) => {
    setSelectedProgram(program);
    setCourses([]); // เคลียร์ courses ก่อนดึงข้อมูลใหม่
    fetchCourses(program.program_id);
  };

  const fetchCourses = async (programId) => {
    try {
      const response = await axios.get("http://localhost:8000/program_courses_detail", {
        params: { program_id: programId }
      });
      setCourses(response.data || []);
    } catch (err) {
      console.error("Error fetching courses:", err);
    }
  };

  return (
    <div>
      <h1>Course Information</h1>
      <ul>
        {programs.map((program, index) => (
          <li key={index} onClick={() => handleProgramClick(program)} style={{ cursor: "pointer", color: "blue" }}>
            {program.program_name}
          </li>
        ))}
      </ul>
      {selectedProgram && (
        <div>
          <h2>Courses in {selectedProgram.program_name}</h2>
          <ul>
            {courses.length > 0 ? (
              courses.map((course, index) => (
                <li key={index}>{course.course_name}</li>
              ))
            ) : (
              <li>No courses available</li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
}

export default ViewCourseInfo;