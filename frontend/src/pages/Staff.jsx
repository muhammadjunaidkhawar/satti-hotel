// src/pages/Staff.jsx
import React, { useState, useMemo, useRef } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { toast } from "react-hot-toast";
import {
  useStaffQuery,
  useAddStaffMutation,
  useUpdateStaffMutation,
  useDeleteStaffMutation,
} from "../api/staff.api";
import {
  useAttendanceQuery,
  useAddAttendanceMutation,
} from "../api/attendance.api";
import { uploadFile } from "../api/file.api";
import Modal from "../components/common/Modal";
import ImageUpload from "../components/common/ImageUpload";
import { API_BASE_URL } from "../constants/env";

const ATTENDANCE_STATUSES = [
  { value: "present", label: "Present", color: "bg-green-500", hoverColor: "hover:bg-green-600" },
  { value: "absent", label: "Absent", color: "bg-red-500", hoverColor: "hover:bg-red-600" },
  { value: "late", label: "Late", color: "bg-yellow-500", hoverColor: "hover:bg-yellow-600" },
  { value: "half_day", label: "Half Day", color: "bg-blue-500", hoverColor: "hover:bg-blue-600" },
  { value: "leave", label: "Leave", color: "bg-purple-500", hoverColor: "hover:bg-purple-600" },
];

export default function Staff() {
  const [activeTab, setActiveTab] = useState("staff");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [profileToShow, setProfileToShow] = useState(null);
  const [editingStaff, setEditingStaff] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const imageUploadRef = useRef(null);

  // Get current date in YYYY-MM-DD format
  const today = new Date().toISOString().split("T")[0];
  const [selectedDate, setSelectedDate] = useState(today);

  const methods = useForm();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setValue,
    watch,
  } = methods;

  // Fetch staff using React Query
  const { data: staffData, isLoading: staffLoading } = useStaffQuery();
  const staffList = staffData?.result?.staff || [];

  // Fetch attendance for selected date
  const { data: attendanceData, isLoading: attendanceLoading } = useAttendanceQuery(
    { date: selectedDate },
    { enabled: !!selectedDate }
  );
  const attendanceList = attendanceData?.result || [];

  // Create a map of staff ID to attendance for quick lookup
  const attendanceMap = useMemo(() => {
    const map = {};
    attendanceList.forEach((att) => {
      const staffId = typeof att.staff === "object" ? att.staff._id : att.staff;
      map[staffId] = att;
    });
    return map;
  }, [attendanceList]);

  const addStaffMutation = useAddStaffMutation({
    onSuccess: () => {
      handleCloseModal();
    },
  });

  const updateStaffMutation = useUpdateStaffMutation({
    onSuccess: () => {
      handleCloseModal();
    },
  });

  const deleteStaffMutation = useDeleteStaffMutation();

  const addAttendanceMutation = useAddAttendanceMutation({
    onSuccess: () => {
      // Attendance will be refetched automatically
    },
  });

  // Calculate age from date of birth
  const calculateAge = (dob) => {
    if (!dob) return null;
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  // Handle add new staff
  const handleAddNew = () => {
    setEditingStaff(null);
    imageUploadRef.current?.clearFile();
    reset({
      name: "",
      email: "",
      phone: "",
      dob: "",
      address: "",
      salary: "",
      shift_start: "",
      shift_end: "",
      notes: "",
      photo: "",
    });
    setIsModalOpen(true);
  };

  // Handle edit staff
  const handleEdit = (staff) => {
    setEditingStaff(staff);
    imageUploadRef.current?.clearFile();
    // Set photo URL - check if it's already a full URL or just a filename
    const photoUrl = staff.photo 
      ? (staff.photo.startsWith('http') ? staff.photo : `${API_BASE_URL}/uploads/${staff.photo}`)
      : '';
    setValue("name", staff.name || "");
    setValue("email", staff.email || "");
    setValue("phone", staff.phone || "");
    setValue("dob", staff.dob ? new Date(staff.dob).toISOString().slice(0, 10) : "");
    setValue("address", staff.address || "");
    setValue("salary", staff.salary || "");
    setValue("shift_start", staff.shift_start || "");
    setValue("shift_end", staff.shift_end || "");
    setValue("notes", staff.notes || "");
    setValue("photo", photoUrl);
    setIsModalOpen(true);
  };

  // Get current image value for preview in edit mode
  const currentImageUrl = watch('photo');

  // Handle delete staff
  const handleDelete = async (staff) => {
    if (!window.confirm(`Are you sure you want to delete "${staff.name}"?`)) {
      return;
    }
    try {
      await deleteStaffMutation.mutateAsync([staff._id]);
    } catch (error) {
      console.error("Delete error:", error);
    }
  };

  // Handle form submission
  const onSubmit = async (data) => {
    try {
      let photoUrl = data.photo;

      // Check if a new file was selected
      const selectedFile = imageUploadRef.current?.getFile();
      
      if (selectedFile) {
        // Upload the file first
        setUploadingImage(true);
        try {
          const response = await uploadFile(selectedFile);
          photoUrl = response?.result?.fileUrl;
          
          if (!photoUrl) {
            throw new Error('No file URL returned from server');
          }
          
          // Update the form value with the uploaded URL to clear any validation errors
          setValue('photo', photoUrl, { shouldValidate: true });
        } catch (error) {
          console.error('Upload error:', error);
          toast.error(error?.response?.data?.message || 'Failed to upload image');
          setUploadingImage(false);
          return;
        } finally {
          setUploadingImage(false);
        }
      } else {
        // No new file selected
        // For edit mode, if no new file and no photoUrl, use the original photo
        if (editingStaff && !photoUrl) {
          // Extract filename from existing photo URL if it's a local upload
          const existingPhoto = editingStaff.photo;
          if (existingPhoto && !existingPhoto.startsWith('http')) {
            photoUrl = existingPhoto; // Keep the filename for local uploads
          }
        }
      }

      // Prepare payload with the photo URL (send as JSON, not FormData)
      const payload = {
        name: data.name,
        email: data.email,
        phone: data.phone,
        dob: data.dob,
        address: data.address,
        salary: data.salary ? parseFloat(data.salary) : undefined,
        shift_start: data.shift_start,
        shift_end: data.shift_end,
        notes: data.notes || '',
        photo: photoUrl || '',
      };

      if (editingStaff) {
        await updateStaffMutation.mutateAsync({
          id: editingStaff._id,
          payload,
        });
      } else {
        await addStaffMutation.mutateAsync(payload);
      }
    } catch (error) {
      console.error("Submit error:", error);
    }
  };

  // Handle close modal
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingStaff(null);
    setUploadingImage(false);
    imageUploadRef.current?.clearFile();
    reset();
  };

  // Show profile modal
  const openProfileModal = (staff) => {
    setProfileToShow(staff);
    setShowProfileModal(true);
  };

  // Handle attendance marking
  const handleMarkAttendance = async (staffId, status) => {
    try {
      await addAttendanceMutation.mutateAsync({
        staff: staffId,
        date: new Date(selectedDate),
        status: status,
      });
    } catch (error) {
      console.error("Mark attendance error:", error);
    }
  };

  // Get attendance status for a staff member
  const getStaffAttendanceStatus = (staffId) => {
    const attendance = attendanceMap[staffId];
    return attendance ? attendance.status : null;
  };

  // Get status color
  const getStatusColor = (status) => {
    const statusConfig = ATTENDANCE_STATUSES.find((s) => s.value === status);
    return statusConfig ? statusConfig.color : "bg-gray-500";
  };

  // Get status label
  const getStatusLabel = (status) => {
    const statusConfig = ATTENDANCE_STATUSES.find((s) => s.value === status);
    return statusConfig ? statusConfig.label : status;
  };

  return (
    <>
      <div className="p-6 bg-[#0d0d0d] text-white min-h-screen">
        {/* Header with Tabs */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex gap-3">
            <button
              onClick={() => setActiveTab("staff")}
              className={`text-sm px-6 py-2 rounded-lg font-medium transition-all ${
                activeTab === "staff"
                  ? "bg-[#FF9500] text-black shadow-lg"
                  : "bg-[#2a2a2a] text-white hover:bg-[#3a3a3a]"
              }`}
            >
              <i className="fa-solid fa-users mr-2"></i>
              Staff Management
            </button>

            <button
              onClick={() => setActiveTab("attendance")}
              className={`text-sm px-6 py-2 rounded-lg font-medium transition-all ${
                activeTab === "attendance"
                  ? "bg-[#FF9500] text-black shadow-lg"
                  : "bg-[#2a2a2a] text-white hover:bg-[#3a3a3a]"
              }`}
            >
              <i className="fa-solid fa-calendar-check mr-2"></i>
              Attendance
            </button>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            {activeTab === "staff" && (
              <button
                onClick={handleAddNew}
                className="bg-[#FF9500] hover:bg-[#e68806] text-black px-4 py-2 rounded-lg font-medium transition-colors shadow-md"
              >
                <i className="fa-solid fa-plus mr-2"></i>
                Add Staff
              </button>
            )}
          </div>
        </div>

        {/* Staff Management Tab */}
        {activeTab === "staff" && (
          <div>
            <div className="overflow-x-auto -mx-6 px-6">
              <div className="min-w-full inline-block align-middle">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-[#1a1a1a] text-white text-left text-sm">
                      <th className="p-3 font-semibold whitespace-nowrap">ID</th>
                      <th className="p-3 font-semibold whitespace-nowrap">Name</th>
                      <th className="p-3 font-semibold whitespace-nowrap">Email</th>
                      <th className="p-3 font-semibold whitespace-nowrap">Phone</th>
                      <th className="p-3 font-semibold whitespace-nowrap">Age</th>
                      <th className="p-3 font-semibold whitespace-nowrap">Salary</th>
                      <th className="p-3 font-semibold whitespace-nowrap">Shift</th>
                      <th className="p-3 font-semibold text-right whitespace-nowrap">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {staffLoading || deleteStaffMutation.isPending ? (
                      <tr>
                        <td colSpan={8} className="p-6 text-center text-gray-400">
                          <i className="fa-solid fa-spinner fa-spin mr-2"></i>
                          Loading...
                        </td>
                      </tr>
                    ) : !staffList || staffList.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="p-6 text-center text-gray-400">
                          No staff members available
                        </td>
                      </tr>
                    ) : (
                      staffList.map((staff) => (
                        <tr
                          key={staff._id}
                          className="border-b border-gray-700 hover:bg-[#2f2f2f] transition-colors"
                        >
                          <td className="p-3 text-sm text-gray-300">
                            <span className="text-xs font-mono">{staff._id?.slice(-8) || "#--"}</span>
                          </td>
                          <td className="p-3 text-sm text-gray-300">
                            <div className="flex items-center gap-3">
                              <img
                                src={
                                  staff.photo
                                    ? `${API_BASE_URL}/uploads/${staff.photo}`
                                    : `https://ui-avatars.com/api/?name=${encodeURIComponent(
                                        staff.name || "Staff"
                                      )}&background=FF9500&color=000`
                                }
                                alt={staff.name}
                                className="w-10 h-10 rounded-full object-cover border-2 border-[#FF9500]/30"
                              />
                              <div>
                                <div className="text-sm font-medium">{staff.name}</div>
                              </div>
                            </div>
                          </td>
                          <td className="p-3 text-sm text-gray-300">{staff.email}</td>
                          <td className="p-3 text-sm text-gray-300">{staff.phone}</td>
                          <td className="p-3 text-sm text-gray-300">
                            {calculateAge(staff.dob) ? `${calculateAge(staff.dob)} years` : "--"}
                          </td>
                          <td className="p-3 text-sm text-gray-300">
                            {staff.salary ? `$${parseFloat(staff.salary).toFixed(2)}` : "--"}
                          </td>
                          <td className="p-3 text-sm text-gray-300">
                            {staff.shift_start && staff.shift_end
                              ? `${staff.shift_start} - ${staff.shift_end}`
                              : "--"}
                          </td>
                          <td className="p-3">
                            <div className="flex gap-2 justify-end">
                              <button
                                onClick={() => openProfileModal(staff)}
                                className="w-9 h-9 flex items-center justify-center rounded-full bg-gradient-to-br from-[#FFB84C] to-[#FF9500] text-black shadow-md hover:shadow-lg hover:scale-105 transition-all duration-200"
                                title="View Profile"
                              >
                                <i className="fa-solid fa-eye text-sm"></i>
                              </button>
                              <button
                                onClick={() => handleEdit(staff)}
                                className="w-9 h-9 flex items-center justify-center rounded-full bg-gradient-to-br from-[#2E8BFD] to-[#1E62D0] text-white shadow-md hover:shadow-lg hover:scale-105 transition-all duration-200"
                                title="Edit"
                              >
                                <i className="fa-solid fa-pen text-sm"></i>
                              </button>
                              <button
                                onClick={() => handleDelete(staff)}
                                className="w-9 h-9 flex items-center justify-center rounded-full bg-gradient-to-br from-red-600 to-red-800 text-white shadow-md hover:shadow-lg hover:scale-105 transition-all duration-200"
                                title="Delete"
                              >
                                <i className="fa-solid fa-trash text-sm"></i>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Attendance Tab */}
        {activeTab === "attendance" && (
          <div className="space-y-6">
            {/* Date Selector */}
            <div className="bg-[#1a1a1a] rounded-xl p-4 border border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-[#FF9500] mb-1">
                    <i className="fa-solid fa-calendar-days mr-2"></i>
                    Mark Attendance
                  </h3>
                  <p className="text-sm text-gray-400">
                    Select a date to mark attendance for staff members
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="px-4 py-2 bg-[#2a2a2a] border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#FF9500]"
                  />
                  {selectedDate === today && (
                    <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-xs font-medium">
                      Today
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Attendance Stats */}
            {!attendanceLoading && staffList.length > 0 && (
              <div className="grid grid-cols-4 gap-4">
                {ATTENDANCE_STATUSES.map((status) => {
                  const count = attendanceList.filter(
                    (att) => att.status === status.value
                  ).length;
                  return (
                    <div
                      key={status.value}
                      className="bg-[#1a1a1a] rounded-xl p-4 border border-gray-700"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs text-gray-400 mb-1">{status.label}</p>
                          <p className="text-2xl font-bold text-white">{count}</p>
                        </div>
                        <div
                          className={`w-12 h-12 rounded-lg ${status.color} flex items-center justify-center text-white text-xl`}
                        >
                          <i
                            className={`fa-solid ${
                              status.value === "present"
                                ? "fa-check"
                                : status.value === "absent"
                                ? "fa-times"
                                : status.value === "late"
                                ? "fa-clock"
                                : status.value === "half_day"
                                ? "fa-hourglass-half"
                                : "fa-calendar-xmark"
                            }`}
                          ></i>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Staff Cards Grid */}
            {attendanceLoading ? (
              <div className="text-center py-12">
                <i className="fa-solid fa-spinner fa-spin text-4xl text-[#FF9500] mb-4"></i>
                <p className="text-gray-400">Loading attendance...</p>
              </div>
            ) : staffList.length === 0 ? (
              <div className="text-center py-12 bg-[#1a1a1a] rounded-xl border border-gray-700">
                <i className="fa-solid fa-users text-4xl text-gray-600 mb-4"></i>
                <p className="text-gray-400">No staff members available</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {staffList.map((staff) => {
                  const currentStatus = getStaffAttendanceStatus(staff._id);
                  return (
                    <div
                      key={staff._id}
                      className={`bg-[#1a1a1a] rounded-xl p-5 border-2 transition-all hover:shadow-xl hover:scale-[1.02] ${
                        currentStatus
                          ? getStatusColor(currentStatus).replace("bg-", "border-") + "/50 bg-opacity-20"
                          : "border-gray-700 hover:border-[#FF9500]/50"
                      }`}
                      style={
                        currentStatus
                          ? {
                              backgroundColor: getStatusColor(currentStatus).includes("green")
                                ? "rgba(34, 197, 94, 0.1)"
                                : getStatusColor(currentStatus).includes("red")
                                ? "rgba(239, 68, 68, 0.1)"
                                : getStatusColor(currentStatus).includes("yellow")
                                ? "rgba(234, 179, 8, 0.1)"
                                : getStatusColor(currentStatus).includes("blue")
                                ? "rgba(59, 130, 246, 0.1)"
                                : "rgba(168, 85, 247, 0.1)",
                              borderColor:
                                getStatusColor(currentStatus).includes("green")
                                  ? "rgba(34, 197, 94, 0.5)"
                                  : getStatusColor(currentStatus).includes("red")
                                  ? "rgba(239, 68, 68, 0.5)"
                                  : getStatusColor(currentStatus).includes("yellow")
                                  ? "rgba(234, 179, 8, 0.5)"
                                  : getStatusColor(currentStatus).includes("blue")
                                  ? "rgba(59, 130, 246, 0.5)"
                                  : "rgba(168, 85, 247, 0.5)",
                            }
                          : {}
                      }
                    >
                      {/* Staff Photo and Name */}
                      <div className="flex items-center gap-3 mb-4">
                        <div className="relative">
                          <img
                            src={
                              staff.photo
                                ? `${API_BASE_URL}/uploads/${staff.photo}`
                                : `https://ui-avatars.com/api/?name=${encodeURIComponent(
                                    staff.name || "Staff"
                                  )}&background=FF9500&color=000&size=64`
                            }
                            alt={staff.name}
                            className="w-16 h-16 rounded-full object-cover border-2 border-[#FF9500]/50"
                          />
                          {currentStatus && (
                            <div
                              className={`absolute -bottom-1 -right-1 w-5 h-5 ${getStatusColor(
                                currentStatus
                              )} rounded-full border-2 border-[#1a1a1a]`}
                            ></div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-white truncate">{staff.name}</h4>
                          <p className="text-xs text-gray-400 truncate">
                            {staff.shift_start && staff.shift_end
                              ? `${staff.shift_start} - ${staff.shift_end}`
                              : "No shift"}
                          </p>
                        </div>
                      </div>

                      {/* Current Status Badge */}
                      {currentStatus && (
                        <div className="mb-4">
                          <span
                            className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                              currentStatus
                            )} text-white`}
                          >
                            {getStatusLabel(currentStatus)}
                          </span>
                        </div>
                      )}

                      {/* Quick Action Buttons */}
                      <div className="space-y-2">
                        {!currentStatus ? (
                          <p className="text-xs text-gray-500 mb-2 text-center">
                            Mark attendance
                          </p>
                        ) : (
                          <p className="text-xs text-gray-500 mb-2 text-center">
                            Change status
                          </p>
                        )}
                        <div className="grid grid-cols-2 gap-2">
                          {ATTENDANCE_STATUSES.slice(0, 4).map((status) => (
                            <button
                              key={status.value}
                              onClick={() => handleMarkAttendance(staff._id, status.value)}
                              disabled={addAttendanceMutation.isPending}
                              className={`px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                                currentStatus === status.value
                                  ? `${status.color} text-white shadow-lg scale-105`
                                  : "bg-[#2a2a2a] text-gray-300 hover:bg-[#3a3a3a] hover:text-white"
                              } ${status.hoverColor} disabled:opacity-50`}
                            >
                              {status.label}
                            </button>
                          ))}
                        </div>
                        <button
                          onClick={() => handleMarkAttendance(staff._id, "leave")}
                          disabled={addAttendanceMutation.isPending}
                          className={`w-full px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                            currentStatus === "leave"
                              ? "bg-purple-500 text-white shadow-lg"
                              : "bg-[#2a2a2a] text-gray-300 hover:bg-purple-500 hover:text-white"
                          } disabled:opacity-50`}
                        >
                          Leave
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Add/Edit Staff Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingStaff ? "Edit Staff" : "Add Staff"}
        size="lg"
      >
        <FormProvider {...methods}>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <ImageUpload
              ref={imageUploadRef}
              name="photo"
              label="Photo"
              required={false}
              existingImageUrl={editingStaff ? (currentImageUrl || (editingStaff.photo && !editingStaff.photo.startsWith('http') ? `${API_BASE_URL}/uploads/${editingStaff.photo}` : editingStaff.photo)) : null}
            />

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Full Name *
              </label>
              <input
                type="text"
                {...register("name", { required: "Name is required" })}
                className="w-full px-4 py-2 bg-[#1a1a1a] border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#FF9500]"
                placeholder="Enter full name"
              />
              {errors.name && (
                <p className="text-red-400 text-xs mt-1">{errors.name.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Email *
              </label>
              <input
                type="email"
                {...register("email", {
                  required: "Email is required",
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: "Invalid email address",
                  },
                })}
                className="w-full px-4 py-2 bg-[#1a1a1a] border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#FF9500]"
                placeholder="Enter email"
              />
              {errors.email && (
                <p className="text-red-400 text-xs mt-1">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Phone *
              </label>
              <input
                type="tel"
                {...register("phone", { required: "Phone is required" })}
                className="w-full px-4 py-2 bg-[#1a1a1a] border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#FF9500]"
                placeholder="Enter phone number"
              />
              {errors.phone && (
                <p className="text-red-400 text-xs mt-1">{errors.phone.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Date of Birth *
              </label>
              <input
                type="date"
                {...register("dob", { required: "Date of birth is required" })}
                className="w-full px-4 py-2 bg-[#1a1a1a] border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#FF9500]"
              />
              {errors.dob && (
                <p className="text-red-400 text-xs mt-1">{errors.dob.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Salary *
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                {...register("salary", {
                  required: "Salary is required",
                  min: { value: 0, message: "Salary must be 0 or greater" },
                })}
                className="w-full px-4 py-2 bg-[#1a1a1a] border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#FF9500]"
                placeholder="Enter salary"
              />
              {errors.salary && (
                <p className="text-red-400 text-xs mt-1">{errors.salary.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Shift Start *
              </label>
              <input
                type="time"
                {...register("shift_start", { required: "Shift start time is required" })}
                className="w-full px-4 py-2 bg-[#1a1a1a] border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#FF9500]"
              />
              {errors.shift_start && (
                <p className="text-red-400 text-xs mt-1">{errors.shift_start.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Shift End *
              </label>
              <input
                type="time"
                {...register("shift_end", { required: "Shift end time is required" })}
                className="w-full px-4 py-2 bg-[#1a1a1a] border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#FF9500]"
              />
              {errors.shift_end && (
                <p className="text-red-400 text-xs mt-1">{errors.shift_end.message}</p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Address *
            </label>
            <input
              type="text"
              {...register("address", { required: "Address is required" })}
              className="w-full px-4 py-2 bg-[#1a1a1a] border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#FF9500]"
              placeholder="Enter address"
            />
            {errors.address && (
              <p className="text-red-400 text-xs mt-1">{errors.address.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Notes
            </label>
            <textarea
              {...register("notes")}
              rows={3}
              className="w-full px-4 py-2 bg-[#1a1a1a] border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#FF9500] resize-none"
              placeholder="Enter additional notes"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={handleCloseModal}
              className="flex-1 px-4 py-2 bg-[#1a1a1a] hover:bg-[#2a2a2a] text-white rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={
                isSubmitting || addStaffMutation.isPending || updateStaffMutation.isPending || uploadingImage
              }
              className="flex-1 px-4 py-2 bg-[#FF9500] hover:bg-[#e68806] text-black rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting || addStaffMutation.isPending || updateStaffMutation.isPending || uploadingImage ? (
                <span className="flex items-center justify-center">
                  <i className="fa-solid fa-spinner fa-spin mr-2"></i>
                  {uploadingImage ? "Uploading image..." : editingStaff ? "Updating..." : "Creating..."}
                </span>
              ) : (
                editingStaff ? "Update" : "Create"
              )}
            </button>
          </div>
        </form>
        </FormProvider>
      </Modal>

      {/* Profile Modal */}
      {showProfileModal && profileToShow && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm transition-opacity duration-300"
            onClick={() => {
              setShowProfileModal(false);
              setProfileToShow(null);
            }}
          />

          <div className="relative bg-[#1a1a1a] w-[520px] rounded-2xl shadow-2xl border border-[#FF9500]/40 p-6 z-60 animate-fadeIn">
            <div className="flex justify-between items-start border-b border-gray-700 pb-3">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <img
                    src={
                      profileToShow.photo
                        ? `${API_BASE_URL}/uploads/${profileToShow.photo}`
                        : `https://ui-avatars.com/api/?name=${encodeURIComponent(
                            profileToShow.name || "Staff"
                          )}&background=FF9500&color=000`
                    }
                    alt={profileToShow.name}
                    className="w-20 h-20 rounded-full object-cover border-4 border-[#FF9500] shadow-lg"
                  />
                  <span className="absolute bottom-1 right-1 bg-[#FF9500] w-3 h-3 rounded-full border border-black"></span>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-white">
                    {profileToShow.name || "Staff Member"}
                  </h3>
                  <p className="text-sm text-gray-400">Staff Member</p>
                </div>
              </div>

              <button
                className="text-gray-400 hover:text-[#FF9500] transition-colors text-xl"
                onClick={() => {
                  setShowProfileModal(false);
                  setProfileToShow(null);
                }}
              >
                ✕
              </button>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-4 text-sm text-gray-200">
              <div>
                <b className="text-[#FF9500]">Staff ID:</b>{" "}
                {profileToShow._id?.slice(-8) || "#--"}
              </div>
              <div>
                <b className="text-[#FF9500]">Age:</b>{" "}
                {calculateAge(profileToShow.dob) || "--"} years
              </div>
              <div>
                <b className="text-[#FF9500]">Email:</b>
                <div className="text-gray-300">{profileToShow.email || "--"}</div>
              </div>
              <div>
                <b className="text-[#FF9500]">Phone:</b>
                <div className="text-gray-300">{profileToShow.phone || "--"}</div>
              </div>
              <div>
                <b className="text-[#FF9500]">Salary:</b>
                <div className="text-gray-300">
                  {profileToShow.salary
                    ? `$${parseFloat(profileToShow.salary).toFixed(2)}`
                    : "--"}
                </div>
              </div>
              <div>
                <b className="text-[#FF9500]">Shift:</b>
                <div className="text-gray-300">
                  {profileToShow.shift_start && profileToShow.shift_end
                    ? `${profileToShow.shift_start} - ${profileToShow.shift_end}`
                    : "--"}
                </div>
              </div>
              <div className="col-span-2">
                <b className="text-[#FF9500]">Address:</b>
                <div className="text-gray-300">{profileToShow.address || "--"}</div>
              </div>

              {profileToShow.notes && (
                <div className="col-span-2">
                  <b className="text-[#FF9500]">Notes:</b>
                  <div className="mt-2 p-3 bg-[#121212] rounded-lg border border-[#FF9500]/20 text-gray-300">
                    {profileToShow.notes}
                  </div>
                </div>
              )}
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => {
                  setShowProfileModal(false);
                  setProfileToShow(null);
                }}
                className="px-4 py-2 bg-[#FF9500] text-black font-semibold rounded-lg hover:bg-[#ffa733] transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
