import React from "react";
import { PropTypes } from "prop-types";
import TeamData from "../assets/TeamData.js";


const TeamMember = ({ name, role, image }) => {
  return (
    <div className="p-4 bg-white shadow-md rounded-lg text-center">
      <img
        src={image}
        alt={name}
        className="mx-auto rounded-full object-cover"
        style={{ maxWidth: "100px", maxHeight: "100px" }}
      />
      <h5 className="mt-4 text-lg font-semibold">{name}</h5>
      <p className="text-gray-600 text-sm">{role}</p>
    </div>
  );
};

TeamMember.propTypes ={
    name: PropTypes.string.isRequired,
    role: PropTypes.string.isRequired,
    image: PropTypes.string.isRequired,
};

export default TeamMember;