import { Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import SignUp from "./pages/SignUp";
import Profile from "./pages/Profile";
import ProfileBusinesses from "./pages/ProfileBusinesses";
import RestaurantDetail from "./pages/RestaurantDetail";
import Home from "./pages/Home";

// React Router
export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<SignUp />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/profile/businesses" element={<ProfileBusinesses />} />
      <Route path="/restaurant/:id" element={<RestaurantDetail />} />
    </Routes>
  );
}
