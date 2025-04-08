import { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import {
  Settings,
  PenTool as Tool,
  Package,
  History,
  BookOpenText,
  Users as UsersIcon,
  UserCog,
} from "lucide-react";
import Navbar from "./components/Navbar";
import Dashboard from "./pages/Dashboard";
import RepairLogs from "./pages/RepairTasks";
import RepairManuals from "./pages/RepairManuals";
import SpareParts from "./pages/SpareParts";
import RepairHistory from "./pages/RepairHistory";
import UsersPage from "./pages/UsersProfile";
import AssignmentRules from "./pages/AssignmentRules";
import Login from "./pages/Login";
import Signup from "./pages/Signup";

const navigation = [
  { name: "Dashboard", href: "/", icon: Settings },
  { name: "Repair Tasks", href: "/repair-tasks", icon: Tool },
  { name: "Repair Manuals", href: "/repair-manuals", icon: BookOpenText },
  { name: "Spare Parts", href: "/spare-parts", icon: Package },
  { name: "History", href: "/history", icon: History },
  { name: "Users Profile", href: "/users-profile", icon: UsersIcon },
  { name: "Task Assignment Rules", href: "/assignment-rules", icon: UserCog },
];

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);

  // Filter navigation items based on user role
  const filteredNavigation = navigation.filter((item) => {
    if (!user || user.role !== "admin") {
      return !["/users-profile", "/assignment-rules", "/"].includes(item.href);
    }
    return true;
  });

  const handleLogin = (userData) => {
    setUser(userData);
  };

  const handleLogout = () => {
    setUser(null);
  };

  // Get default redirect path based on role
  const getDefaultPath = () => {
    return user?.role === "admin" ? "/" : "/repair-tasks";
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
          <Route path="/login" element={<Login onLogin={handleLogin} />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      ) : (
        <div className="min-h-screen bg-gray-100">
          <Navbar navigation={filteredNavigation} onLogout={handleLogout} />
          <main className="p-8 pt-24">
            <Routes>
              {user.role === "admin" && (
                <>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/users-profile" element={<UsersPage />} />
                  <Route
                    path="/assignment-rules"
                    element={<AssignmentRules />}
                  />
                </>
              )}
              <Route path="/repair-tasks" element={<RepairLogs />} />
              <Route path="/spare-parts" element={<SpareParts />} />
              <Route path="/repair-manuals" element={<RepairManuals />} />
              <Route path="/history" element={<RepairHistory />} />
              <Route
                path="*"
                element={<Navigate to={getDefaultPath()} replace />}
              />
            </Routes>
          </main>
        </div>
      )}
    </BrowserRouter>
  );
}

export default App;
