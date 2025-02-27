import React, { useState, useEffect } from "react";
import axios from "axios";

export default function Course() {
  const [course, setCourse] = useState([]); // Array to store course data
  const [newCourse, setNewCourse] = useState({
    course_id: "",
    course_name: "",
    course_engname: "",
    program_id: "",
    year: "",
    section: "",
    semester_id: "",
  });
  const [editCourse, setEditCourse] = useState({
    course_id: "",
    course_name: "",
    course_engname: "",
    program_id: "",
    year: "",
    section: "",
    semester_id: "",
  });

  const [semesters, setSemesters] = useState([]); // Array to store semester data
  const [programs, setPrograms] = useState([]); // Array to store program data

  useEffect(() => {
    fetchPrograms(); // Fetch program data when the component loads
    fetchSemesters(); // Fetch semester data
  }, []);

  useEffect(() => {
    // Reset course state before fetching new data
    setCourse([]); // Clear old courses first
    if (newCourse.program_id && newCourse.semester_id) {
      fetchCourses(); // Fetch course data when program or semester is selected
    }
  }, [newCourse.program_id, newCourse.semester_id]);

  // Fetch courses based on selected program and semester
  const fetchCourses = async () => {
    try {
      const response = await axios.get(
        "http://localhost:8000/program_courses_detail",
        {
          params: {
            program_id: newCourse.program_id,
          },
        }
      );
      console.log("Fetched Courses: ", response.data);

      // Filter courses based on selected semester
      const filteredCourses = response.data.filter(
        (course) =>
          parseInt(course.semester_id) === parseInt(newCourse.semester_id)
      );
      setCourse(filteredCourses || []); // Set filtered courses
    } catch (err) {
      console.error("Error fetching courses:", err);
    }
  };

  // Fetch semesters and remove duplicates
  const fetchSemesters = async () => {
    try {
      const response = await axios.get("http://localhost:8000/semesters");
      console.log("Fetched Semesters:", response.data);

      const uniqueSemesters = getUniqueSemesters(response.data); // Get unique semesters
      setSemesters(uniqueSemesters || []);
    } catch (err) {
      console.error("Error fetching semesters:", err);
    }
  };

  // Helper function to filter out duplicate semesters
  const getUniqueSemesters = (semesters) => {
    const uniqueSemesterIds = [
      ...new Set(semesters.map((item) => item.semester_id)),
    ]; // Get unique semester_id
    return semesters.filter((semester) =>
      uniqueSemesterIds.includes(semester.semester_id)
    ); // Filter semesters
  };

  const fetchPrograms = async () => {
    try {
      const response = await axios.get("http://localhost:8000/program");
      if (response.data && Array.isArray(response.data)) {
        setPrograms(response.data); // Set programs from response
      } else {
        console.error("Invalid program data format");
      }
    } catch (err) {
      console.error("Error fetching programs:", err);
    }
  };

  const handleCourseChange = (e) => {
    setNewCourse({ ...newCourse, [e.target.name]: e.target.value });
  };

  const addCourse = async () => {
    try {
      const response = await axios.post(
        "http://localhost:8000/program_course",
        {
          program_id: newCourse.program_id,
          course_id: newCourse.course_id,
          course_name: newCourse.course_name, // ส่งข้อมูล course_name
          course_engname: newCourse.course_engname, // ส่งข้อมูล course_engname
          semester_id: newCourse.semester_id,
          year: newCourse.year,
          section_id: newCourse.section,
        }
      );

      // อัปเดต State ให้แสดงคอร์สใหม่ที่เพิ่มเข้ามา
      setCourse([...course, response.data.data]);

      // รีเซ็ตฟอร์ม
      setNewCourse({
        course_id: "",
        course_name: "",
        course_engname: "",
        program_id: "",
        year: "",
        section: "",
        semester_id: "",
      });

      alert("Course added successfully!");
    } catch (err) {
      console.error("Error adding course:", err);
    }
  };

  const updateCourse = async (updatedCourse) => {
    try {
        const response = await axios.put(
            `http://localhost:8000/program_course/${updatedCourse.course_id}`, // เปลี่ยนให้ใช้ course_id ใน URL
            {
                new_course_id: updatedCourse.new_course_id,
                course_name: updatedCourse.course_name,
                course_engname: updatedCourse.course_engname,
                program_id: updatedCourse.program_id,
                semester_id: updatedCourse.semester_id,
            }
        );
        setCourse(
            course.map((courseItem) =>
                courseItem.course_id === updatedCourse.course_id
                    ? response.data
                    : courseItem
            )
        );
        setEditCourse({
            course_id: "",
            new_course_id: "",
            course_name: "",
            course_engname: "",
            program_id: "",
        });

        alert("Course updated successfully!");
    } catch (err) {
        console.error("Error updating course:", err);
    }
};

  const deleteCourse = async (courseId) => {
    try {
      const response = await axios.delete(
        "http://localhost:8000/program_course",
        {
          params: {
            program_id: newCourse.program_id, // program ที่เลือก
            semester_id: newCourse.semester_id, // semester ที่เลือก
            course_id: courseId, // รหัส course ที่ต้องการลบ
          },
        }
      );
      console.log(response.data.message);
      // อัปเดต State เพื่อลบคอร์สที่ถูกลบออกจากตาราง
      setCourse(
        course.filter((courseItem) => courseItem.course_id !== courseId)
      );

      alert("Course deleted successfully!");
    } catch (err) {
      console.error("Error deleting course:", err);
    }
  };

  const handleEditCourse = (courseItem) => {
    setEditCourse({
      course_id: courseItem.course_id,
      course_name: courseItem.course_name,
      course_engname: courseItem.course_engname,
      program_id: courseItem.program_id,
      year: courseItem.year,
      section: courseItem.section,
      semester_id: courseItem.semester_id,
    });
  };

  return (
    <div style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>
      <h2 style={{ marginBottom: "20px" }}>Add, Edit, Delete Course</h2>

      {/* Add Course Section */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          marginBottom: "20px",
        }}
      >
        {/* Program Dropdown */}
        <select
          name="program_id"
          value={newCourse.program_id}
          onChange={handleCourseChange}
          style={{ marginRight: "10px", padding: "8px" }}
        >
          <option value="">Select Program</option>
          {programs && programs.length > 0 ? (
            programs.map((program) => (
              <option key={program.program_id} value={program.program_id}>
                {program.program_name}
              </option>
            ))
          ) : (
            <option value="">No programs available</option>
          )}
        </select>

        {/* Semester Dropdown */}
        <select
          name="semester_id"
          value={newCourse.semester_id}
          onChange={handleCourseChange}
          style={{ marginRight: "10px", padding: "8px" }}
        >
          <option value="">Select Semester</option>
          {semesters && semesters.length > 0 ? (
            semesters.map((semester) => (
              <option key={semester.semester_id} value={semester.semester_id}>
                {semester.semester_name}
              </option>
            ))
          ) : (
            <option value="">No semesters available</option>
          )}
        </select>

        <input
          style={{ marginRight: "10px", padding: "8px" }}
          placeholder="Course ID"
          name="course_id"
          value={newCourse.course_id}
          onChange={handleCourseChange}
        />
        <input
          style={{ marginRight: "10px", padding: "8px" }}
          placeholder="Course Name (Thai)"
          name="course_name"
          value={newCourse.course_name}
          onChange={handleCourseChange}
        />
        <input
          style={{ marginRight: "10px", padding: "8px" }}
          placeholder="Course Name (English)"
          name="course_engname"
          value={newCourse.course_engname}
          onChange={handleCourseChange}
        />
        <input
          style={{ marginRight: "10px", padding: "8px" }}
          placeholder="Year"
          name="year"
          value={newCourse.year}
          onChange={handleCourseChange}
        />
        <input
          style={{ marginRight: "10px", padding: "8px" }}
          placeholder="Section"
          name="section"
          value={newCourse.section}
          onChange={handleCourseChange}
        />

        <button
          onClick={addCourse}
          style={{
            padding: "8px 12px",
            backgroundColor: "#4CAF50",
            color: "#fff",
          }}
        >
          Insert
        </button>
      </div>

      {/* Edit Course Section */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          marginBottom: "20px",
        }}
      >
        {/* Select Course Dropdown */}
        <select
          name="course_id"
          value={editCourse.course_id}
          onChange={(e) =>
            setEditCourse({ ...editCourse, course_id: e.target.value })
          }
          style={{ marginRight: "10px", padding: "8px" }}
        >
          <option value="">Select Course</option>
          {course && course.length > 0 ? (
            course.map((courseItem) => (
              <option key={courseItem.course_id} value={courseItem.course_id}>
                {courseItem.course_id}- {courseItem.course_name}
              </option>
            ))
          ) : (
            <option value="">No courses available</option>
          )}
        </select>

        {/* Course ID Input */}
        <input
          style={{ marginRight: "10px", padding: "8px" }}
          placeholder="New Course ID"
          name="new_course_id"
          value={editCourse.new_course_id || ""}
          onChange={(e) =>
            setEditCourse({ ...editCourse, new_course_id: e.target.value })
          }
        />

        {/* Course Name (Thai) Input */}
        <input
          style={{ marginRight: "10px", padding: "8px" }}
          placeholder="Course Name (Thai)"
          name="course_name"
          value={editCourse.course_name}
          onChange={(e) =>
            setEditCourse({ ...editCourse, course_name: e.target.value })
          }
        />

        <input
          style={{ marginRight: "10px", padding: "8px" }}
          placeholder="Course Name (English)"
          name="course_engname"
          value={editCourse.course_engname}
          onChange={(e) =>
            setEditCourse({ ...editCourse, course_engname: e.target.value })
          }
        />

        <button
          onClick={() => updateCourse(editCourse)}
          style={{
            padding: "8px 12px",
            backgroundColor: "#FF9800",
            color: "#fff",
            cursor: "pointer",
          }}
        >
          Edit
        </button>
      </div>

      {/* Course Table */}
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th>Course ID</th>
            <th>Course Name</th>
            <th>Course engName</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {course && course.length > 0 ? (
            course.map((courseItem) => (
              <tr key={courseItem.course_id}>
                <td>{courseItem.course_id}</td>
                <td>{courseItem.course_name}</td>
                <td>{courseItem.course_engname}</td>
                <td>
                  <button onClick={() => deleteCourse(courseItem.course_id)}>
                    Delete
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="6">No courses available</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
