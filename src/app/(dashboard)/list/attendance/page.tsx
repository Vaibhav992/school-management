"use client";

import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import Image from "next/image";
import Table from "@/components/Table";
import TableSearch from "@/components/TableSearch";
import Pagination from "@/components/Pagination";
import { getAttendance, updateAttendance, deleteAttendance, getStudents, getLessons } from "@/lib/actions";

const AttendanceListPage = () => {
  const { user } = useUser();
  const [attendance, setAttendance] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedAttendance, setSelectedAttendance] = useState<any>(null);
  const [students, setStudents] = useState<any[]>([]);
  const [lessons, setLessons] = useState<any[]>([]);

  const loadAttendance = async () => {
    try {
      setLoading(true);
      const result = await getAttendance();
      if (result.success) {
        setAttendance(result.data || []);
      }
    } catch (error) {
      console.error("Error loading attendance:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAttendance();
    loadStudentsAndLessons();
  }, []);


  const loadStudentsAndLessons = async () => {
    try {
      // Try to load students
      try {
        const studentsResult = await getStudents();
        if (studentsResult.success) {
          setStudents(studentsResult.data || []);
        } else {
          setStudents([]);
        }
      } catch (studentsError) {
        console.error("Error loading students:", studentsError);
        setStudents([]);
      }

      // Try to load lessons
      try {
        const lessonsResult = await getLessons();
        if (lessonsResult.success) {
          setLessons(lessonsResult.data || []);
        } else {
          setLessons([]);
        }
      } catch (lessonsError) {
        console.error("Error loading lessons:", lessonsError);
        setLessons([]);
      }
    } catch (error) {
      console.error("Error loading students and lessons:", error);
      setStudents([]);
      setLessons([]);
    }
  };

  const handleEdit = (item: any) => {
    setSelectedAttendance(item);
    setIsEditModalOpen(true);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAttendance) return;

    const formData = new FormData(e.target as HTMLFormElement);
    const updatedData = {
      id: selectedAttendance.id,
      studentId: formData.get('studentId') as string,
      lessonId: parseInt(formData.get('lessonId') as string),
      date: new Date(formData.get('date') as string),
      present: formData.get('present') === 'true'
    };

    try {
      await updateAttendance({ success: false, error: false }, updatedData);
      setIsEditModalOpen(false);
      setSelectedAttendance(null);
      loadAttendance();
    } catch (error) {
      console.error("Error updating attendance:", error);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this attendance record?")) {
      try {
        await deleteAttendance(id);
        loadAttendance();
      } catch (error) {
        console.error("Error deleting attendance:", error);
      }
    }
  };


  const filteredAttendance = attendance.filter((item: any) =>
    item.student?.name?.toLowerCase().includes(search.toLowerCase()) ||
    item.student?.surname?.toLowerCase().includes(search.toLowerCase()) ||
    item.lesson?.subject?.name?.toLowerCase().includes(search.toLowerCase())
  );

  const ITEMS_PER_PAGE = 10;
  const totalPages = Math.ceil(filteredAttendance.length / ITEMS_PER_PAGE);
  const paginatedAttendance = filteredAttendance.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE
  );

  const columns = [
    { header: "Student", accessor: "student" },
    { header: "Subject", accessor: "subject" },
    { header: "Date", accessor: "date" },
    { header: "Status", accessor: "present" },
    { header: "Actions", accessor: "actions" },
  ];

  const renderRow = (item: any) => (
    <tr key={item.id} className="border-b hover:bg-gray-50">
      <td className="py-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-lamaSky flex items-center justify-center text-white font-bold text-sm">
            {item.student?.name?.charAt(0) || "S"}
          </div>
          <div>
            <p className="font-semibold">{item.student?.name} {item.student?.surname}</p>
            <p className="text-xs text-gray-500">{item.student?.class?.name}</p>
          </div>
        </div>
      </td>
      <td className="py-4">
        <div>
          <p className="font-semibold">{item.lesson?.subject?.name}</p>
          <p className="text-xs text-gray-500">{item.lesson?.teacher?.name}</p>
        </div>
      </td>
      <td className="py-4">
        <span>{new Date(item.date).toLocaleDateString()}</span>
      </td>
      <td className="py-4">
        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
          item.present 
            ? "bg-green-100 text-green-800" 
            : "bg-red-100 text-red-800"
        }`}>
          {item.present ? "Present" : "Absent"}
        </span>
      </td>
      <td className="py-4">
        <div className="flex gap-2">
          <button
            onClick={() => handleEdit(item)}
            className="w-7 h-7 flex items-center justify-center rounded-full bg-lamaSky"
            title="Edit Attendance"
          >
            <Image src="/view.png" alt="Edit" width={16} height={16} />
          </button>
          <button
            onClick={() => handleDelete(item.id)}
            className="w-7 h-7 flex items-center justify-center rounded-full bg-red-500"
            title="Delete Attendance"
          >
            <Image src="/delete.png" alt="Delete" width={16} height={16} />
          </button>
        </div>
      </td>
    </tr>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading attendance...</div>
      </div>
    );
  }

  return (
    <div className="p-5">
      <div className="flex justify-between items-center mb-5">
        <h1 className="text-2xl font-bold">Attendance Management</h1>
      </div>

      <div className="bg-white rounded-md shadow-sm">
        <div className="p-4 border-b">
          <TableSearch />
        </div>
        
        <Table
          data={paginatedAttendance}
          columns={columns}
          renderRow={renderRow}
        />
        
        <div className="p-4 border-t">
          <Pagination
            page={page}
            count={filteredAttendance.length}
          />
        </div>
      </div>

      {/* Edit Modal */}
      {isEditModalOpen && selectedAttendance && (
        <div className="w-screen h-screen absolute left-0 top-0 bg-black bg-opacity-60 z-50 flex items-center justify-center">
          <div className="bg-white p-4 rounded-md relative w-[90%] md:w-[70%] lg:w-[60%] xl:w-[50%] 2xl:w-[40%]">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Edit Attendance</h2>
              <button
                onClick={() => {
                  setIsEditModalOpen(false);
                  setSelectedAttendance(null);
                }}
                className="w-7 h-7 flex items-center justify-center rounded-full bg-gray-300 hover:bg-gray-400"
              >
                <Image src="/close.png" alt="Close" width={14} height={14} />
              </button>
            </div>
            <div className="text-xs text-gray-500 mb-4 flex justify-between items-center">
              <span>Students: {students.length} | Lessons: {lessons.length}</span>
              <button
                type="button"
                onClick={loadStudentsAndLessons}
                className="text-lamaSky hover:text-blue-700 text-xs"
              >
                Refresh Data
              </button>
            </div>
            <form onSubmit={handleEditSubmit} className="flex flex-col gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Student
                </label>
                <select
                  name="studentId"
                  defaultValue={selectedAttendance.studentId}
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-lamaSky focus:border-transparent"
                  required
                >
                  <option value="">Select Student</option>
                  {students.length > 0 ? (
                    students.map((student) => (
                      <option key={student.id} value={student.id}>
                        {student.name} {student.surname} - {student.class?.name || 'No Class'}
                      </option>
                    ))
                  ) : (
                    <option value="" disabled>Loading students...</option>
                  )}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Lesson/Subject
                </label>
                <select
                  name="lessonId"
                  defaultValue={selectedAttendance.lessonId}
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-lamaSky focus:border-transparent"
                  required
                >
                  <option value="">Select Lesson</option>
                  {lessons.length > 0 ? (
                    lessons.map((lesson) => (
                      <option key={lesson.id} value={lesson.id}>
                        {lesson.subject?.name || 'No Subject'} - {lesson.class?.name || 'No Class'}
                      </option>
                    ))
                  ) : (
                    <option value="" disabled>Loading lessons...</option>
                  )}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date
                </label>
                <input
                  type="date"
                  name="date"
                  defaultValue={new Date(selectedAttendance.date).toISOString().split('T')[0]}
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-lamaSky focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <select
                  name="present"
                  defaultValue={selectedAttendance.present ? 'true' : 'false'}
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-lamaSky focus:border-transparent"
                  required
                >
                  <option value="true">Present</option>
                  <option value="false">Absent</option>
                </select>
              </div>

              <div className="flex gap-2 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-lamaSky text-white py-3 px-4 rounded-md hover:bg-blue-600 font-medium"
                >
                  Update
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsEditModalOpen(false);
                    setSelectedAttendance(null);
                  }}
                  className="flex-1 bg-gray-300 text-gray-700 py-3 px-4 rounded-md hover:bg-gray-400 font-medium"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AttendanceListPage;
