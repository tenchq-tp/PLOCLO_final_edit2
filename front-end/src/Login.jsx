import React, { useState } from "react";
import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";
import axios from "axios";
import { jwtDecode } from "jwt-decode";

function Login({ setRole }) {
  const clientId = "958902418959-llvaof6d4td6cicvdd27fltshv63rudo.apps.googleusercontent.com";
  const [profile, setProfile] = useState(null);

  const fetchUserRole = async (email) => {
    try {
      const response = await axios.get("http://localhost:8000/getUserRole", { params: { email } });
      const role = response.data.role;
      setProfile((prevProfile) => ({ ...prevProfile, role }));
      setRole(role);
    } catch (error) {
      console.error("Error fetching role:", error);
    }
  };

  const onGoogleSuccess = async (credentialResponse) => {
    const decoded = jwtDecode(credentialResponse.credential);
    
    try {
      const response = await axios.post("http://localhost:8000/login", {
        id: decoded.sub,
        email: decoded.email,
        name: decoded.name,
        token: credentialResponse.credential,
      });

      const role = response.data.role;
      setProfile({ ...decoded, role });
      setRole(role);

      // Fetch updated role
      fetchUserRole(decoded.email);
    } catch (error) {
      console.error("Error during backend authentication:", error.message);
    }
  };

  const handleLogout = () => {
    setProfile(null);
    setRole(null);
    console.log("Logged out successfully");
  };

  return (
    <GoogleOAuthProvider clientId={clientId}>
      <div className="App">
        <header className="App-header">
          <h1>LOGIN</h1>
          <div className="login-buttons">
            {!profile ? (
              <GoogleLogin onSuccess={onGoogleSuccess} onError={() => console.log("Login Failed")} />
            ) : (
              <div>
                <h2>Welcome, {profile.name}</h2>
                <p>Email: {profile.email}</p>
                <p>Role: {profile.role}</p>
                <button onClick={handleLogout}>Logout</button>
              </div>
            )}
          </div>
        </header>
      </div>
    </GoogleOAuthProvider>
  );
}

export default Login;
