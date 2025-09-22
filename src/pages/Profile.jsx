// src/pages/Profile.jsx
import React, { useEffect, useState } from "react";
import { auth, db } from "../firebase";
//import "../styles/Profile.css";
import { doc, getDoc, collection, getDocs } from "firebase/firestore";
import { signOut } from "firebase/auth";
import { useNavigate } from "react-router-dom";

const Profile = () => {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [chatCount, setChatCount] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      const user = auth.currentUser;
      if (!user) return;

      const userEmail = user.email;
      setEmail(userEmail);

      // Get name from email (before @)
      const extractedName = userEmail.split("@")[0];
      setName(extractedName);

      // Get chat count
      const chatsRef = collection(db, "users", user.uid, "chats");
      const chatsSnap = await getDocs(chatsRef);
      setChatCount(chatsSnap.size);
    };

    fetchProfile();
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/login"); // Redirect to login after logout
  };

  return (
    <div className="profile-container">
      <h2>User Profile</h2>

      <label>Name:</label>
      <input type="text" value={name} disabled />

      <label>Email:</label>
      <input type="text" value={email} disabled />

      <label>Total Chats:</label>
      <input type="text" value={chatCount} disabled />

      <button onClick={handleLogout} className="logout-button">
        Logout
      </button>
    </div>
  );
};

export default Profile;
