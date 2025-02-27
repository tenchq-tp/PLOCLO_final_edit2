// app.jsx
import 'bootstrap/dist/css/bootstrap.min.css';
import React, { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import ViewCourseInfo from "./ViewCourseInfo.jsx";
import ViewChart from './ViewChart.jsx';
import Login from './Login.jsx';
import Navbar from './Component/Navbar.jsx';
import './styles.css';
import './i18n.js';
import AboutData from './aboutData.jsx';
import NotFound from './Component/NotFound.jsx'; 
import EditProgram from './Component/EditProgram.jsx';
import EditPLO from './Component/EditPLO.jsx';
import EditCourse from './Component/EditCourse.jsx';
import EditCLO from './Component/EditCLO.jsx';
import StudentData from './Component/StudentData.jsx';
import Assigment from './Component/Assignment.jsx';
import AssignmentDetail from './Component/AssignmentDetail.jsx';


function App() {
    const [role, setRole] = useState(null);

    return (
        <>
            <Navbar role={role} />
            <div className="container">
                <Routes>
                    <Route path="/" element={<Login setRole={setRole} />} /> 
                    <Route path="/ViewCourseInfo" element={<ViewCourseInfo />} />
                    <Route path="/ViewChart" element={<ViewChart />} />
                    <Route path="/StudentData" element={<StudentData />} />
                    <Route path="/aboutData" element={<AboutData />} />
                    <Route path="/editprogram" element={<EditProgram/>} />
                    <Route path="/editplo" element={<EditPLO/>} />
                    <Route path="/editcourse" element={<EditCourse />} />
                    <Route path="/editclo" element={<EditCLO />} />
                    <Route path="*" element={<NotFound />} />
                    <Route path="/assignment/:id" element={<AssignmentDetail/>} />
                    <Route path="/assigment" element={<Assigment/>} />
                    
            </Routes>
            </div>
        </>
    );
}

export default App;
