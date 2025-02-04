import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

interface User {
  id: string;
  email: string;
  full_name: string;
  role: string;
  created_at: string;
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [role, setRole] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  async function fetchUsers() {
    try {
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        throw error;
      }

      if (data) {
        setUsers(data);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  }

  async function addUser(event: React.FormEvent) {
    event.preventDefault();
    try {
      const { data, error } = await supabase
        .from("users")
        .insert([{ email, full_name: fullName, role }]);

      if (error) {
        throw error;
      }

      // Update the user list with the newly added user
      setUsers((prevUsers) => [...prevUsers, ...data]);
      // Clear the form fields
      setEmail("");
      setFullName("");
      setRole("");
    } catch (error) {
      console.error("Error adding user:", error);
    } finally {
      setShowForm(false);
    }
  }

  async function deleteUser(userId: string) {
    try {
      const { error } = await supabase.from("users").delete().eq("id", userId);

      if (error) {
        throw error;
      }

      // Remove the deleted user from the list
      setUsers((prevUsers) => prevUsers.filter((user) => user.id !== userId));
    } catch (error) {
      console.error("Error deleting user:", error);
    }
  }

  async function updateUser(event: React.FormEvent) {
    event.preventDefault();
    if (!editingUser) return;

    try {
      const { data, error } = await supabase
        .from("users")
        .update({ email, full_name: fullName, role })
        .eq("id", editingUser.id);

      if (error) {
        throw error;
      }

      // Update the user list with the edited user
      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          user.id === editingUser.id
            ? { ...user, email, full_name: fullName, role }
            : user
        )
      );
      // Clear the form fields
      setEmail("");
      setFullName("");
      setRole("");
      setEditingUser(null);
    } catch (error) {
      console.error("Error updating user:", error);
    } finally {
      setShowForm(false);
    }
  }

  if (loading) {
    return <div>กำลังโหลด...</div>;
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-semibold text-gray-900 mb-6">
        รายชื่อผู้ใช้งาน
      </h1>

      <button
        onClick={() => setShowForm(true)}
        className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
      >
        Add User
      </button>

      {showForm && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded shadow-lg">
            <h2 className="text-xl mb-4">
              {editingUser ? "Edit User" : "Add New User"}
            </h2>
            <form onSubmit={editingUser ? updateUser : addUser}>
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="border p-2 mb-2 w-full"
              />
              <input
                type="text"
                placeholder="Full Name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                className="border p-2 mb-2 w-full"
              />
              <input
                type="text"
                placeholder="Role"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                required
                className="border p-2 mb-2 w-full"
              />
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditingUser(null);
                  }}
                  className="bg-gray-500 text-white p-2 mr-2"
                >
                  Cancel
                </button>
                <button type="submit" className="bg-blue-500 text-white p-2">
                  {editingUser ? "Update User" : "Add User"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                อีเมล
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                fullname
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                บทบาท
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                วันที่สร้าง
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {users.map((user) => (
              <tr key={user.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {user.email}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {user.full_name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {user.role}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {new Date(user.created_at).toLocaleDateString("th-TH")}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  <button
                    onClick={() => {
                      setEditingUser(user);
                      setEmail(user.email);
                      setFullName(user.full_name);
                      setRole(user.role);
                      setShowForm(true);
                    }}
                    className="text-indigo-600 hover:text-indigo-900 mr-4"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => deleteUser(user.id)}
                    className="text-red-600 hover:text-red-900"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
