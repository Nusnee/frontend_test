import { useEffect, useState } from "react";
import { userService } from "./services/userService";
import UserModal from "./components/UserModal";
import axios from "axios";
import { Link, useLocation } from "react-router-dom";

function Toast({ message, type, onClose }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, []);

  const colors = {
    success: "bg-green-500",
    error: "bg-red-500",
  };

  return (
    <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 ${colors[type]} text-white px-6 py-4 rounded-2xl shadow-2xl`}>
      <span className="text-lg">{type === "success" ? "" : ""}</span>
      <span className="text-sm font-medium">{message}</span>
      <button onClick={onClose} className="ml-2 text-white/70 hover:text-white">✕</button>
    </div>
  );
}

function App() {
  const [users, setUsers] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [page, setPage] = useState(1);
  const [departments, setDepartments] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editUser, setEditUser] = useState(null);
  const location = useLocation();
  const [search, setSearch] = useState("");
  const [gender, setGender] = useState("");
  const [departmentId, setDepartmentId] = useState("");
  const [sort, setSort] = useState("u.id");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [toast, setToast] = useState(null);

  const glowAnimationCSS = `
    @keyframes glow {
      0% { text-shadow: 0 0 5px rgba(30, 58, 138, 0.4); color: #1e3a8a; }
      50% { text-shadow: 0 0 20px rgba(59, 130, 246, 0.8), 0 0 30px rgba(59, 130, 246, 0.6); color: #3b82f6; }
      100% { text-shadow: 0 0 5px rgba(30, 58, 138, 0.4); color: #1e3a8a; }
    }
    .glow-text { animation: glow 3s ease-in-out infinite; }
  `;

  const showToast = (message, type = "success") => {
    setToast({ message, type });
  };

  useEffect(() => {
    axios.get("http://localhost:4000/departments")
      .then(res => setDepartments(res.data.data))
      .catch(err => console.error("dept error:", err));
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    const params = { page, limit: 10, sort, order: "asc" };
    if (debouncedSearch) params.search = debouncedSearch;
    if (gender) params.gender = gender;
    if (departmentId) params.department_id = departmentId;
    userService.getAll(params)
      .then(res => {
        setUsers(res.data.data.users);
        setPagination(res.data.data.pagination);
      })
      .catch(err => console.error(err));
  }, [page, debouncedSearch, gender, departmentId, sort]);

  const handleDelete = async (id) => {
    const user = users.find(u => u.id === id);
    if (!window.confirm(`ต้องการลบ ${user.first_name} ${user.last_name} ใช่หรือไม่?`)) return;
    try {
      await userService.remove(id);
      refreshUsers();
      showToast(`ลบ ${user.first_name} ${user.last_name} สำเร็จ`);
    } catch (err) {
      console.error(err);
      showToast("เกิดข้อผิดพลาด ลบไม่สำเร็จ", "error");
    }
  };

  const refreshUsers = () => {
    const params = { page, limit: 10, sort, order: "asc" };
    if (debouncedSearch) params.search = debouncedSearch;
    if (gender) params.gender = gender;
    if (departmentId) params.department_id = departmentId;
    userService.getAll(params)
      .then(res => {
        setUsers(res.data.data.users);
        setPagination(res.data.data.pagination);
      });
  };

  return (
    <div className="min-h-screen bg-gray-50 w-full">
      <style>{glowAnimationCSS}</style>

      {/* Toast */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {/* Header + Navbar */}
      <nav className="flex justify-between items-center bg-white border-b-2 border-blue-900 px-10 py-4 sticky top-0 z-10 shadow-sm">
        <h1 className="text-lg font-bold tracking-wide glow-text">ManageUser</h1>
        <div className="flex items-center gap-2 bg-gray-100 rounded-full px-2 py-2">
          <Link to="/" className={`px-5 py-1.5 rounded-full font-medium text-sm transition ${
            location.pathname === "/" ? "bg-blue-900 text-white shadow" : "text-gray-600 hover:text-blue-900"
          }`}>Users</Link>
          <Link to="/departments" className={`px-5 py-1.5 rounded-full font-medium text-sm transition ${
            location.pathname === "/departments" ? "bg-blue-900 text-white shadow" : "text-gray-600 hover:text-blue-900"
          }`}>Departments</Link>
        </div>
      </nav>

      {/* Main Content */}
      <div className="w-full p-6">
        <div className="bg-white shadow-xl rounded-2xl p-6 w-full border border-gray-200">

          {/* Title */}
          <div className="flex justify-between items-center mb-5">
            <h2 className="text-2xl font-bold text-blue-900">Users Management</h2>
            <button onClick={() => { setEditUser(null); setModalOpen(true); }}
              className="bg-green-600 hover:bg-green-700 text-white px-7 py-3 rounded-full font-medium text-base transition shadow">
              + เพิ่มผู้ใช้
            </button>
          </div>

          {/* Search & Filters */}
          <div className="flex flex-wrap gap-3 mb-5 bg-gray-50 p-4 rounded-2xl border border-gray-100">
            <input type="text" placeholder="🔍 ค้นหาชื่อ / อีเมล..."
              value={search} onChange={e => setSearch(e.target.value)}
              className="border rounded-full px-4 py-2 text-sm flex-1 min-w-50 focus:outline-none focus:border-blue-400" />
            <select value={gender} onChange={e => { setGender(e.target.value); setPage(1); }}
              className="border rounded-full px-4 py-2 text-sm bg-white focus:border-blue-400">
              <option value="">เพศ: ทั้งหมด</option>
              <option value="male">ชาย</option>
              <option value="female">หญิง</option>
              <option value="unspecified">ไม่ระบุ</option>
            </select>
            <select value={departmentId} onChange={e => { setDepartmentId(e.target.value); setPage(1); }}
              className="border rounded-full px-4 py-2 text-sm bg-white focus:border-blue-400">
              <option value="">แผนก: ทั้งหมด</option>
              {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
            </select>
            <select value={sort} onChange={e => { setSort(e.target.value); setPage(1); }}
              className="border rounded-full px-4 py-2 text-sm bg-white focus:border-blue-400">
              <option value="u.id">เรียงตาม: ID</option>
              <option value="u.first_name">ชื่อ</option>
              <option value="u.last_name">นามสกุล</option>
              <option value="u.age">อายุ</option>
              <option value="u.created_at">วันที่สร้าง</option>
              <option value="d.name">แผนก</option>
            </select>
          </div>

          {/* Table */}
          <div className="overflow-x-auto rounded-xl border border-gray-200">
            <table className="w-full text-center">
              <thead>
                <tr className="bg-blue-900 text-white">
                  <th className="p-3 text-sm font-semibold">ID</th>
                  <th className="p-3 text-sm font-semibold">ชื่อ-นามสกุล</th>
                  <th className="p-3 text-sm font-semibold">อายุ</th>
                  <th className="p-3 text-sm font-semibold">เพศ</th>
                  <th className="p-3 text-sm font-semibold">Email</th>
                  <th className="p-3 text-sm font-semibold">แผนก</th>
                  <th className="p-3 text-sm font-semibold">ที่อยู่</th>
                  <th className="p-3 text-sm font-semibold">จัดการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {users.map(user => (
                  <tr key={user.id} className="hover:bg-blue-50 transition">
                    <td className="p-3 text-gray-400 text-medium">{user.id}</td>
                    <td className="p-3 font-medium text-gray-800 text-sm whitespace-nowrap">{user.first_name} {user.last_name}</td>
                    <td className="p-3 text-sm">{user.age} ปี</td>
                    <td className="p-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        user.gender === "male" ? "bg-blue-100 text-blue-700"
                        : user.gender === "female" ? "bg-pink-100 text-pink-700"
                        : "bg-gray-100 text-gray-500"
                      }`}>
                        {user.gender === "male" ? "ชาย" : user.gender === "female" ? "หญิง" : "ไม่ระบุ"}
                      </span>
                    </td>
                    <td className="p-3 text-blue-600 text-sm">{user.email}</td>
                    <td className="p-3">
                      {user.department
                        ? <span className="bg-blue-50 text-blue-800 text-xs px-3 py-1 rounded-full border border-blue-100">{user.department.name}</span>
                        : <span className="bg-gray-100 text-gray-400 text-xs px-3 py-1 rounded-full">ไม่มีแผนก</span>
                      }
                    </td>
                    <td className="p-3">
                      {user.address?.province
                        ? <span className="text-gray-600 text-sm">{user.address.province}</span>
                        : <span className="bg-gray-100 text-gray-400 text-xs px-3 py-1 rounded-full">ไม่มีที่อยู่</span>
                      }
                    </td>
                    <td className="p-3">
                      <div className="flex gap-2 justify-center">
                        <button onClick={() => { setEditUser(user); setModalOpen(true); }}
                          className="bg-yellow-400 hover:bg-yellow-500 text-white px-3 py-1 rounded-full text-sm font-medium transition">
                          แก้ไข
                        </button>
                        <button onClick={() => handleDelete(user.id)}
                          className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-full text-sm font-medium transition">
                          ลบ
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pagination && (
            <div className="flex justify-center items-center gap-6 mt-6">
              <button onClick={() => setPage(p => p - 1)} disabled={page === 1}
                className="px-5 py-2 bg-blue-900 text-white rounded-full text-sm font-medium disabled:opacity-40 hover:bg-blue-800 transition">
                ← ก่อนหน้า
              </button>
              <span className="text-sm font-medium text-blue-900">หน้า {page} / {pagination.totalPages}</span>
              <button onClick={() => setPage(p => p + 1)} disabled={page === pagination.totalPages}
                className="px-5 py-2 bg-blue-900 text-white rounded-full text-sm font-medium disabled:opacity-40 hover:bg-blue-800 transition">
                ถัดไป →
              </button>
            </div>
          )}

        </div>
      </div>

      {modalOpen && (
        <UserModal
          user={editUser}
          departments={departments}
          onClose={() => setModalOpen(false)}
          onSaved={() => {
            refreshUsers();
            showToast(editUser ? "แก้ไขข้อมูลสำเร็จ" : "เพิ่มผู้ใช้สำเร็จ");
          }}
        />
      )}
    </div>
  );
}

export default App;