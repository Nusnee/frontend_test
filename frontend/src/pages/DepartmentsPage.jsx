import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { departmentService } from "../services/departmentService";

export default function DepartmentsPage() {
  const [departments, setDepartments] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  const glowAnimationCSS = `
    @keyframes glow {
      0% { text-shadow: 0 0 5px rgba(30, 58, 138, 0.4); color: #1e3a8a; }
      50% { text-shadow: 0 0 20px rgba(59, 130, 246, 0.8); color: #3b82f6; }
      100% { text-shadow: 0 0 5px rgba(30, 58, 138, 0.4); color: #1e3a8a; }
    }
    .glow-text { animation: glow 3s ease-in-out infinite; }
  `;

  const kanitStyle = { fontFamily: "'Kanit', sans-serif" };

  useEffect(() => {
    departmentService.getAll()
      .then(res => setDepartments(res.data.data))
      .finally(() => setLoading(false));
  }, []);

  const handleClick = (dept) => {
    departmentService.getById(dept.id)
      .then(res => {
        const data = res.data.data;
        if (data?.users) data.users.sort((a, b) => a.id - b.id);
        setSelected(data);
      })
      .catch(err => console.error("Error:", err));
  };

  if (loading) return (
    <div style={kanitStyle} className="min-h-screen flex items-center justify-center text-gray-400 text-sm">
      กำลังโหลดข้อมูลแผนก...
    </div>
  );

  return (
    <div style={kanitStyle} className="min-h-screen bg-gray-50 w-full">
      <style>{glowAnimationCSS}</style>

      {/* Navbar */}
      <nav className="flex justify-between items-center bg-white border-b-2 border-blue-900 px-10 py-4 sticky top-0 z-10 shadow-sm">
        <h1 className="text-lg font-bold tracking-wide glow-text">ManageUser</h1>
        <div className="flex items-center gap-2 bg-gray-100 rounded-full px-2 py-2">
          <Link to="/" className={`px-5 py-1.5 rounded-full font-medium text-sm transition ${location.pathname === "/" ? "bg-blue-900 text-white shadow" : "text-gray-600 hover:text-blue-900"
            }`}>Users</Link>
          <Link to="/departments" className={`px-5 py-1.5 rounded-full font-medium text-sm transition ${location.pathname === "/departments" ? "bg-blue-900 text-white shadow" : "text-gray-600 hover:text-blue-900"
            }`}>Departments</Link>
        </div>
      </nav>

      {/* Main */}
      <div className="w-full p-6">
        <div className="w-full bg-white shadow-xl rounded-2xl p-6 border border-gray-200">

          <div className="flex justify-between items-center mb-5">
            <h2 className="text-2xl font-bold text-blue-900">Departments Overview</h2>
            <span className="text-gray-400 text-sm">ทั้งหมด {departments.length} แผนก</span>
          </div>

          {/* Department Cards */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-4 mb-6">
            {departments.map(dept => (
              <div
                key={dept.id}
                onClick={() => handleClick(dept)}
                className={`border rounded-2xl p-5 cursor-pointer transition-all duration-300 flex flex-col items-center justify-center hover:scale-105 ${selected?.id === dept.id
                    ? "border-blue-500 bg-blue-50 shadow-md ring-1 ring-blue-100"
                    : "border-gray-200 bg-white shadow-sm hover:shadow-md hover:border-blue-300"
                  }`}
              >
                <h2 className="text-xs font-bold text-blue-900 mb-2 text-center w-full px-1">
                  {dept.name}
                </h2>
                <div className="flex items-center gap-1">
                  <span className={`w-1.5 h-1.5 rounded-full ${selected?.id === dept.id ? "bg-blue-400" : "bg-blue-200"}`} />
                  <span className={`text-sm font-medium ${selected?.id === dept.id ? "text-blue-700" : "text-gray-400"}`}>
                    {dept.user_count} คน
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* รายชื่อ users */}
          {selected && (
            <div className="mt-4 border-2 border-blue-50 rounded-2xl p-5 shadow bg-white animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex justify-between items-center mb-4 border-b border-gray-100 pb-3">
                <div>
                  <h2 className="text-base font-bold text-blue-900">แผนก: {selected.name}</h2>
                  <p className="text-gray-400 text-xs mt-1 uppercase tracking-widest">Employee List</p>
                </div>
                <button
                  onClick={() => setSelected(null)}
                  className="bg-red-100 text-red-500 hover:bg-red-500 hover:text-white w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all shadow active:scale-90">
                  ✕
                </button>
              </div>

              <div className="overflow-x-auto rounded-xl border border-gray-100">
                <table className="w-full text-center">
                  <thead>
                    <tr className="bg-blue-900 text-white">
                      <th className="p-3 text-sm font-semibold">ID</th>
                      <th className="p-3 text-sm font-semibold text-left pl-10">ชื่อ-นามสกุล</th>
                      <th className="p-3 text-sm font-semibold">อายุ</th>
                      <th className="p-3 text-sm font-semibold">เพศ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {selected.users.map(user => (
                      <tr key={user.id} className="hover:bg-blue-50/50 transition-colors group">
                        <td className="p-3 text-gray-400 text-sm">{user.id}</td>

                        {/* Interactive Name Column */}
                        <td className="p-3 text-left pl-6">
                          <Link
                            to={`/users/${user.id}`}
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-300 hover:bg-blue-600 hover:text-white hover:shadow-lg active:scale-95 group/link"
                          >
                            <span className="font-semibold text-sm transition-transform duration-300 group-hover/link:translate-x-1">
                              {user.first_name} {user.last_name}
                            </span>
                            <svg
                              className="w-4 h-4 opacity-0 -translate-x-2 transition-all duration-300 group-hover/link:opacity-100 group-hover/link:translate-x-0"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                            </svg>
                          </Link>
                        </td>

                        <td className="p-3 text-sm font-medium text-gray-600">{user.age} ปี</td>
                        <td className="p-3">
                          <span className={`px-3 py-1 rounded-full text-xs font-bold shadow-sm ${user.gender === "male" ? "bg-blue-100 text-blue-700" : "bg-pink-100 text-pink-700"
                            }`}>
                            {user.gender === "male" ? "ชาย" : "หญิง"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}