import React from "react";
import TeamData from "./assets/TeamData.js";
import TeamMember from "./Component/TeamMember.jsx";

function AboutData() {
    return (
        <div className="bg-gray-100 min-h-screen py-5">
            <h1 className="mb-4">About</h1>
            <p className="mb-4" style={{ fontSize: "1.8rem"}}>version 1</p>
            {/* แถวที่ 1: 2 คน */}
            <div className="row justify-content-center">
                {TeamData.slice(0, 2).map(member => (
                    <div key={member.id} className="col-md-3 text-center">
                        <TeamMember image={member.image} name={member.name} role={member.role} />
                    </div>
                ))}
            </div>


            <div className="col-12 text-center my-4">
                <p className="mb-4" style={{ fontSize: "1.8rem"}}>version 2</p>
            </div>
            {/* แถวที่ 2: 3 คน */}
            <div className="row justify-content-center">
                {TeamData.slice(2, 5).map(member => (
                    <div key={member.id} className="col-md-3 text-center">
                        <TeamMember image={member.image} name={member.name} role={member.role} />
                    </div>
                ))}
            </div>
            <div className="col-12 text-center my-4">
            <p className="mb-4" style={{ fontSize: "1.8rem"}}>Advisor</p>
            </div>

            {/* แถวที่ 3: 1 คน */}
            <div className="row justify-content-center">
                {TeamData.slice(5, 6).map(member => (
                    <div key={member.id} className="col-md-12 text-center">
                        <TeamMember image={member.image} name={member.name} role={member.role} />
                    </div>
                ))}
            </div>
        </div>
    );
}

export default AboutData;
