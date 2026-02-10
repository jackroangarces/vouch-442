import { Routes, Route } from "react-router-dom";

// Placeholder component DELETE LATER
function Placeholder({ name }: { name: string }) {
  return <div className="main">{name} — placeholder</div>;
}

// React Router
export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Placeholder name="Home" />} />
      <Route path="/profile" element={<Placeholder name="Profile" />} />
      <Route path="/settings" element={<Placeholder name="Settings" />} />
      <Route path="/restaurant/dashboard" element={<Placeholder name="Restaurant Dashboard" />} />
    </Routes>
  );
}
