import "../styles/style.css";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "../contexts/AuthContext";
import { UserProfileProvider } from "../contexts/UserProfileContext";
import AppRoutes from "./routes";
import { Navbar } from "../components/Navbar";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <UserProfileProvider>
          <Navbar />
          <AppRoutes />
        </UserProfileProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App
