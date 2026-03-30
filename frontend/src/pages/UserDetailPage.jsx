import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { userService } from "../services/userService";

export default function UserDetailPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        userService.getById(id)
            .then(res => setUser(res.data.data))
            .finally(() => setLoading(false));
    }, [id]);

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center text-gray-400 text-lg">
            กำลังโหลด...
        </div>
    );

    if (!user) return (
        <div className="min-h-screen flex items-center justify-center text-red-400 text-lg">
            ไม่พบผู้ใช้
        </div>
    );

    return (
        <div className="min-h-screen bg-white p-10" style={{ fontFamily: "'Kanit', sans-serif" }}>
            <div className="max-w-4xl mx-auto">

                {/* Header Banner */}
                <div className="bg-linear-to-b from-blue-900 to-blue-800 rounded-3xl px-12 py-16 relative text-center shadow-2xl mb-10">
                    
                    <button
                        onClick={() => navigate(-1)}
                        className="absolute top-6 left-8 text-sm text-white font-medium px-4 py-2 rounded-full bg-white/20 hover:bg-white/30 border border-white/30 transition backdrop-blur tracking-widest">
                        ← กลับ
                    </button>

                    <p className="text-blue-300 text-xs tracking-[0.5em] uppercase mb-3 opacity-60">
                        ข้อมูลผู้ใช้
                    </p>

                    <h1 className="text-white text-5xl font-light tracking-wide">
                        {user.first_name} {user.last_name}
                    </h1>

                    <p className="text-blue-200 text-lg mt-3 opacity-70 tracking-widest">
                        {user.department?.name || "ไม่มีแผนก"}
                    </p>

                    <div className="mt-4 flex justify-center gap-6 text-sm text-blue-200/50 tracking-widest uppercase">
                        <span>ID: {user.id}</span>
                        <span>/</span>
                        <span>{user.gender === "male" ? "ชาย" : user.gender === "female" ? "หญิง" : "ไม่ระบุ"}</span>
                    </div>
                </div>

                {/* Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">

                    {/* Contact */}
                    <div>
                        <h3 className="text-lg font-semibold text-blue-900 tracking-widest uppercase border-b border-gray-100 pb-3 mb-6">
                            ข้อมูลติดต่อ
                        </h3>
                        <div className="grid grid-cols-2 gap-6">
                            <InfoItem label="อายุ" value={`${user.age} ปี`} />
                            <InfoItem label="เพศ" value={user.gender === "male" ? "ชาย" : user.gender === "female" ? "หญิง" : "ไม่ระบุ"} />
                            <InfoItem label="Email" value={user.email} />
                            <InfoItem label="เบอร์โทร" value={user.phone || "–"} />
                        </div>
                    </div>

                    {/* Location */}
                    <div>
                        <h3 className="text-lg font-semibold text-blue-900 tracking-widest uppercase border-b border-gray-100 pb-3 mb-6">
                            ที่อยู่
                        </h3>
                        {user.address ? (
                            <div className="grid grid-cols-2 gap-6">
                                <InfoItem label="บ้านเลขที่" value={user.address.house_no} />
                                <InfoItem label="ถนน" value={user.address.street || "–"} />
                                <InfoItem label="เขต/อำเภอ" value={user.address.district} />
                                <InfoItem label="จังหวัด" value={user.address.province} />
                                <InfoItem label="รหัสไปรษณีย์" value={user.address.postal_code} />
                            </div>
                        ) : (
                            <p className="text-gray-400 text-base">ไม่มีข้อมูลที่อยู่</p>
                        )}
                    </div>

                </div>
            </div>
        </div>
    );
}

function InfoItem({ label, value }) {
    return (
        <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
            <p className="text-sm font-semibold text-gray-400 uppercase tracking-widest mb-1">
                {label}
            </p>
            <p className="text-lg font-medium text-gray-700">
                {value}
            </p>
        </div>
    );
}