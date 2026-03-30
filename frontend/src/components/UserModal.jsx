import { useState, useEffect } from "react";
import { userService } from "../services/userService";

const defaultForm = {
  first_name: "", last_name: "", age: "", gender: "male",
  email: "", phone: "", department_id: "",
  address: null,
};

const defaultAddress = {
  house_no: "", street: "", district: "", province: "", postal_code: ""
};

export default function UserModal({ user, departments, onClose, onSaved }) {
  const [form, setForm] = useState(defaultForm);
  const [hasAddress, setHasAddress] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setForm({
        first_name: user.first_name,
        last_name: user.last_name,
        age: user.age,
        gender: user.gender,
        email: user.email,
        phone: user.phone || "",
        department_id: user.department?.id || "",
        address: user.address || null,
      });
      setHasAddress(!!user.address);
    }
  }, [user]);

  const validateField = (name, value) => {
    switch (name) {
      case "first_name":
      case "last_name":
        if (!value || value.trim().length < 2 || value.trim().length > 50)
          return `${name === "first_name" ? "ชื่อ" : "นามสกุล"}ต้องมี 2–50 ตัวอักษร`;
        if (/\d/.test(value))
          return `${name === "first_name" ? "ชื่อ" : "นามสกุล"}ห้ามมีตัวเลข`;
        return "";
      case "age":
        const parsedAge = parseInt(value);
        if (isNaN(parsedAge) || parsedAge < 16 || parsedAge > 65)
          return "อายุต้องเป็นตัวเลข 16–65 ปี";
        return "";
      case "email":
        if (/[ก-๙]/.test(value))
          return "อีเมลห้ามมีภาษาไทย";
        if (!value || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value))
          return "รูปแบบอีเมลไม่ถูกต้อง";
        return "";
      case "phone":
        if (value && !/^[0-9\-+\s()]{8,20}$/.test(value))
          return "รูปแบบเบอร์โทรไม่ถูกต้อง";
        return "";
      default:
        return "";
    }
  };

  const validateAddressField = (name, value) => {
    switch (name) {
      case "house_no": return !value?.trim() ? "บ้านเลขที่ต้องไม่ว่าง" : "";
      case "district": return !value?.trim() ? "เขต/อำเภอต้องไม่ว่าง" : "";
      case "province": return !value?.trim() ? "จังหวัดต้องไม่ว่าง" : "";
      case "postal_code": return !/^\d{5}$/.test(value) ? "รหัสไปรษณีย์ต้องเป็นตัวเลข 5 หลัก" : "";
      default: return "";
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!form.first_name || form.first_name.trim().length < 2) newErrors.first_name = "ชื่อต้องมี 2–50 ตัวอักษร";
    if (/\d/.test(form.first_name)) newErrors.first_name = "ชื่อห้ามมีตัวเลข";
    if (!form.last_name || form.last_name.trim().length < 2) newErrors.last_name = "นามสกุลต้องมี 2–50 ตัวอักษร";
    if (/\d/.test(form.last_name)) newErrors.last_name = "นามสกุลห้ามมีตัวเลข";
    const parsedAge = parseInt(form.age);
    if (isNaN(parsedAge) || parsedAge < 16 || parsedAge > 65) newErrors.age = "อายุต้องเป็นตัวเลข 16–65 ปี";
    if (!form.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) newErrors.email = "รูปแบบอีเมลไม่ถูกต้อง";
    if (/[ก-๙]/.test(form.email)) newErrors.email = "อีเมลห้ามมีภาษาไทย";
    if (form.phone && !/^[0-9\-+\s()]{8,20}$/.test(form.phone)) newErrors.phone = "รูปแบบเบอร์โทรไม่ถูกต้อง";
    if (hasAddress) {
      if (!form.address?.house_no?.trim()) newErrors["address.house_no"] = "บ้านเลขที่ต้องไม่ว่าง";
      if (!form.address?.district?.trim()) newErrors["address.district"] = "เขต/อำเภอต้องไม่ว่าง";
      if (!form.address?.province?.trim()) newErrors["address.province"] = "จังหวัดต้องไม่ว่าง";
      if (!form.address?.postal_code || !/^\d{5}$/.test(form.address.postal_code)) newErrors["address.postal_code"] = "รหัสไปรษณีย์ต้องเป็นตัวเลข 5 หลัก";
    }
    return newErrors;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    setErrors({ ...errors, [name]: validateField(name, value) });
  };

  const handleAddressChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, address: { ...(form.address || defaultAddress), [name]: value } });
    setErrors({ ...errors, [`address.${name}`]: validateAddressField(name, value) });
  };

  const handleToggleAddress = (e) => {
    setHasAddress(e.target.checked);
    setForm({ ...form, address: e.target.checked ? defaultAddress : null });
  };

  const handleSubmit = async () => {
    const newErrors = validate();
    if (Object.keys(newErrors).length > 0) { setErrors(newErrors); return; }
    setLoading(true);
    try {
      const payload = {
        ...form,
        age: parseInt(form.age),
        department_id: form.department_id || null,
        phone: form.phone || null,
        address: hasAddress ? form.address : null,
      };
      if (user) await userService.update(user.id, payload);
      else await userService.create(payload);
      onSaved();
      onClose();
    } catch (err) {
      if (err.response?.data?.errors) {
        const errMap = {};
        err.response.data.errors.forEach(e => { errMap[e.field] = e.message; });
        setErrors(errMap);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-3xl max-h-[95vh] overflow-y-auto">

        {/* Header */}
        <div className="bg-linear-to-r from-blue-900 to-indigo-700 px-8 py-4 rounded-t-3xl">
          <h2 className="text-lg font-semibold text-white">
            {user ? "แก้ไขผู้ใช้" : "เพิ่มผู้ใช้"}
          </h2>
          <p className="text-blue-200 text-[10px] mt-1">กรอกข้อมูลให้ครบถ้วน</p>
        </div>

        <div className="px-8 py-4 space-y-3">

          {/* ชื่อ - นามสกุล */}
          <div className="grid grid-cols-2 gap-3">
            <Field label="ชื่อ *" error={errors.first_name}>
              <input name="first_name" value={form.first_name} onChange={handleChange}
                placeholder="ชื่อ"
                className={`w-full bg-gray-50 border rounded-2xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-300 transition ${errors.first_name ? "border-red-300" : "border-gray-200"}`} />
            </Field>
            <Field label="นามสกุล *" error={errors.last_name}>
              <input name="last_name" value={form.last_name} onChange={handleChange}
                placeholder="นามสกุล"
                className={`w-full bg-gray-50 border rounded-2xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-300 transition ${errors.last_name ? "border-red-300" : "border-gray-200"}`} />
            </Field>
          </div>

          {/* อายุ - เพศ */}
          <div className="grid grid-cols-2 gap-3">
            <Field label="อายุ *" error={errors.age}>
              <input name="age" type="number" value={form.age} onChange={handleChange}
                placeholder="อายุ"
                className={`w-full bg-gray-50 border rounded-2xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-300 transition ${errors.age ? "border-red-300" : "border-gray-200"}`} />
            </Field>
            <Field label="เพศ *">
              <select name="gender" value={form.gender} onChange={handleChange}
                className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-300 transition">
                <option value="male">ชาย</option>
                <option value="female">หญิง</option>
                <option value="unspecified">ไม่ระบุ</option>
              </select>
            </Field>
          </div>

          {/* Email */}
          <Field label="Email *" error={errors.email}>
            <input name="email" value={form.email} onChange={handleChange}
              placeholder="example@email.com"
              className={`w-full bg-gray-50 border rounded-2xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-300 transition ${errors.email ? "border-red-300" : "border-gray-200"}`} />
          </Field>

          {/* Phone */}
          <Field label="เบอร์โทร" error={errors.phone}>
            <input name="phone" value={form.phone} onChange={handleChange}
              placeholder="0xx-xxx-xxxx"
              className={`w-full bg-gray-50 border rounded-2xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-300 transition ${errors.phone ? "border-red-300" : "border-gray-200"}`} />
          </Field>

          {/* แผนก */}
          <Field label="แผนก">
            <select name="department_id" value={form.department_id} onChange={handleChange}
              className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-300 transition">
              <option value="">ไม่มีแผนก</option>
              {departments.map(d => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
          </Field>

          {/* Address Toggle */}
          <label className="flex items-center gap-3 cursor-pointer bg-gray-50 rounded-2xl px-3 py-2 border border-gray-200 hover:border-blue-300 transition">
            <div className={`w-8 h-5 rounded-full transition-colors relative ${hasAddress ? "bg-blue-900" : "bg-gray-300"}`}
              onClick={() => handleToggleAddress({ target: { checked: !hasAddress } })}>
              <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${hasAddress ? "translate-x-3.5" : "translate-x-0.5"}`} />
            </div>
            <span className="text-xs text-gray-600 font-medium">มีที่อยู่</span>
          </label>

          {/* Address Fields */}
          {hasAddress && (
            <div className="bg-blue-50 rounded-2xl p-3 border border-blue-100 space-y-2">
              <p className="text-[10px] font-semibold text-blue-900 uppercase tracking-widest">📍 ที่อยู่</p>
              <div className="grid grid-cols-2 gap-3">
                <Field label="บ้านเลขที่ *" error={errors["address.house_no"]}>
                  <input name="house_no" value={form.address?.house_no || ""} onChange={handleAddressChange}
                    placeholder="บ้านเลขที่"
                    className={`w-full bg-white border rounded-2xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-300 transition ${errors["address.house_no"] ? "border-red-300" : "border-gray-200"}`} />
                </Field>
                <Field label="ถนน">
                  <input name="street" value={form.address?.street || ""} onChange={handleAddressChange}
                    placeholder="ถนน"
                    className="w-full bg-white border border-gray-200 rounded-2xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-300 transition" />
                </Field>
                <Field label="เขต/อำเภอ *" error={errors["address.district"]}>
                  <input name="district" value={form.address?.district || ""} onChange={handleAddressChange}
                    placeholder="เขต/อำเภอ"
                    className={`w-full bg-white border rounded-2xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-300 transition ${errors["address.district"] ? "border-red-300" : "border-gray-200"}`} />
                </Field>
                <Field label="จังหวัด *" error={errors["address.province"]}>
                  <input name="province" value={form.address?.province || ""} onChange={handleAddressChange}
                    placeholder="จังหวัด"
                    className={`w-full bg-white border rounded-2xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-300 transition ${errors["address.province"] ? "border-red-300" : "border-gray-200"}`} />
                </Field>
                <Field label="รหัสไปรษณีย์ *" error={errors["address.postal_code"]}>
                  <input name="postal_code" value={form.address?.postal_code || ""} onChange={handleAddressChange}
                    placeholder="10100" maxLength={5}
                    className={`w-full bg-white border rounded-2xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-300 transition ${errors["address.postal_code"] ? "border-red-300" : "border-gray-200"}`} />
                </Field>
              </div>
            </div>
          )}

          {/* Buttons */}
          <div className="flex justify-end gap-3 pt-1">
            <button onClick={onClose}
              className="px-4 py-2 rounded-full border border-gray-200 text-gray-600 text-xs font-medium hover:bg-gray-50 transition">
              ยกเลิก
            </button>
            <button onClick={handleSubmit} disabled={loading}
              className="px-4 py-2 rounded-full bg-blue-900 text-white text-xs font-medium hover:bg-blue-800 disabled:opacity-40 transition shadow-md shadow-blue-900/20">
              {loading ? "กำลังบันทึก..." : "บันทึก"}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}

function Field({ label, error, children }) {
  return (
    <div>
      <label className="text-[10px] font-medium text-gray-500 mb-1 block">{label}</label>
      {children}
      {error && <p className="text-red-400 text-[10px] mt-1">{error}</p>}
    </div>
  );
}