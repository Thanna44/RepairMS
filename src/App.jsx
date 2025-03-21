import { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import {
  Settings,
  PenTool as Tool,
  Package,
  History,
  BookOpenText,
  Users as UsersIcon,
} from "lucide-react";
import Navbar from "./components/Navbar";
import Dashboard from "./pages/Dashboard";
import RepairLogs from "./pages/RepairTasks";
import RepairGuide from "./pages/RepairManuals";
import SpareParts from "./pages/SpareParts";
import RepairHistory from "./pages/RepairHistory";
import UsersPage from "./pages/Users";
import Login from "./pages/Login";
import Signup from "./pages/Signup";

const navigation = [
  { name: "Dashboard", href: "/", icon: Settings },
  { name: "Repair Tasks", href: "/repair-tasks", icon: Tool },
  { name: "Repair Guide", href: "/repair-guide", icon: BookOpenText },
  { name: "Spare Parts", href: "/spare-parts", icon: Package },
  { name: "History", href: "/history", icon: History },
  { name: "Users", href: "/users", icon: UsersIcon },
];

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleMockLogin = (mockUser) => {
    setUser(mockUser);
  };

  const handleLogout = () => {
    setUser(null);
  };

  useEffect(() => {}, []);

  return (
    <BrowserRouter>
      {loading ? (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-gray-500">Loading...</div>
        </div>
      ) : !user ? (
        <Routes>
          <Route path="/login" element={<Login onLogin={handleMockLogin} />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      ) : (
        <div className="min-h-screen bg-gray-100">
          <Navbar navigation={navigation} onLogout={handleLogout} />
          <main className="p-8 pt-24">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/repair-tasks" element={<RepairLogs />} />
              <Route path="/spare-parts" element={<SpareParts />} />
              <Route path="/repair-guide" element={<RepairGuide />} />
              <Route path="/history" element={<RepairHistory />} />
              <Route path="/users" element={<UsersPage />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
        </div>
      )}
    </BrowserRouter>
  );
}

export default App;
