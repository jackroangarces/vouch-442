import { Routes, Route } from "react-router-dom";
import Home from './Home'

// React Router
export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/profile" element={<div className="main">Profile — placeholder</div>} />
      <Route path="/settings" element={<div className="main">Settings — placeholder</div>} />
      <Route path="/restaurant/dashboard" element={<div className="main">Restaurant Dashboard — placeholder</div>} />
    </Routes>
  );
}
