import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";

// Pages
import Home from "./pages/Home";
import Chat from "./pages/Chat";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Login from "./pages/Login";
import Profile from "./pages/Profile";
import Plans from "./pages/Plans"; // ✅ Import the Plans page
import { auth } from "./firebase"; // Import Firebase auth for logout

function App() {
  const handleLogout = () => {
    auth.signOut().then(() => {
      localStorage.removeItem("user");
    }).catch((error) => {
      console.error("Logout failed:", error);
    });
  };

  return (
    <Router>
      <Navbar handleLogout={handleLogout} /> {/* Pass handleLogout to Navbar */}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/chat" element={<Chat />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/login" element={<Login handleLogin={() => {}} />} /> {/* No-op handleLogin */}
        <Route path="/profile" element={<Profile />} />
        <Route path="/plans" element={<Plans />} /> {/* ✅ Plans route added */}
      </Routes>
    </Router>
  );
}

export default App;