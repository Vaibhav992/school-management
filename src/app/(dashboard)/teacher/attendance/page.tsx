"use client";

import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { getStudents, getLessons, markAttendance } from "@/lib/actions";

const TeacherAttendancePage = () => {
  const { user } = useUser();
  const [students, setStudents] = useState<any[]>([]);
  const [lessons, setLessons] = useState<any[]>([]);
  const [selectedLesson, setSelectedLesson] = useState("");
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [attendance, setAttendance] = useState<{[key: string]: boolean}>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [studentsResult, lessonsResult] = await Promise.all([
        getStudents(),
        getLessons()
      ]);
      
      if (studentsResult.success) {
        setStudents(studentsResult.data || []);
      }
      
      if (lessonsResult.success) {
        // Filter lessons for this teacher
        const teacherLessons = (lessonsResult.data || []).filter(
          (lesson: any) => lesson.teacher?.id === user?.id
        );
        setLessons(teacherLessons);
      }
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAttendanceChange = (studentId: string, present: boolean) => {
    setAttendance(prev => ({
      ...prev,
      [studentId]: present
    }));
  };

  const handleSubmitAttendance = async () => {
    if (!selectedLesson) {
      alert("Please select a lesson");
      return;
    }

    try {
      const attendanceData = Object.entries(attendance).map(([studentId, present]) => ({
        studentId,
        lessonId: selectedLesson,
        date: selectedDate,
        present
      }));

      const result = await markAttendance(attendanceData);
      
      if (result.success) {
        alert("Attendance marked successfully!");
        setAttendance({});
      } else {
        alert("Failed to mark attendance");
      }
    } catch (error) {
      console.error("Error marking attendance:", error);
      alert("Failed to mark attendance");
    }
  };

  const getLessonStudents = () => {
    if (!selectedLesson) return [];
    
    const lesson = lessons.find((l: any) => l.id === selectedLesson);
    return lesson ? lesson.class?.students || [] : [];
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <div className="p-5">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">Mark Attendance</h1>
        <p className="text-gray-600">Select lesson and date to mark student attendance</p>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Lesson
            </label>
            <select
              value={selectedLesson}
              onChange={(e) => setSelectedLesson(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-lamaSky focus:border-transparent"
            >
              <option value="">Choose a lesson</option>
              {lessons.map((lesson: any) => (
                <option key={lesson.id} value={lesson.id}>
                  {lesson.subject?.name} - {lesson.class?.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Date
            </label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-lamaSky focus:border-transparent"
            />
          </div>

          <div className="flex items-end">
            <button
              onClick={handleSubmitAttendance}
              disabled={!selectedLesson || Object.keys(attendance).length === 0}
              className="w-full bg-lamaSky text-white py-3 px-4 rounded-md hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              Save Attendance
            </button>
          </div>
        </div>

        {selectedLesson && (
          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold mb-4">
              Students in {lessons.find((l: any) => l.id === selectedLesson)?.class?.name}
            </h3>
            
            <div className="space-y-3">
              {getLessonStudents().map((student: any) => (
                <div
                  key={student.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-lamaSky flex items-center justify-center text-white font-bold">
                      {student.name?.charAt(0) || "S"}
                    </div>
                    <div>
                      <p className="font-semibold">{student.name} {student.surname}</p>
                      <p className="text-sm text-gray-500">ID: {student.studentId}</p>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleAttendanceChange(student.id, true)}
                      className={`px-4 py-2 rounded-md text-sm font-medium ${
                        attendance[student.id] === true
                          ? "bg-green-500 text-white"
                          : "bg-gray-200 text-gray-700 hover:bg-green-100"
                      }`}
                    >
                      Present
                    </button>
                    <button
                      onClick={() => handleAttendanceChange(student.id, false)}
                      className={`px-4 py-2 rounded-md text-sm font-medium ${
                        attendance[student.id] === false
                          ? "bg-red-500 text-white"
                          : "bg-gray-200 text-gray-700 hover:bg-red-100"
                      }`}
                    >
                      Absent
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold mb-4">Attendance Summary</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-green-50 p-4 rounded-lg">
            <p className="text-green-800 font-semibold">Present</p>
            <p className="text-2xl font-bold text-green-600">
              {Object.values(attendance).filter(status => status === true).length}
            </p>
          </div>
          <div className="bg-red-50 p-4 rounded-lg">
            <p className="text-red-800 font-semibold">Absent</p>
            <p className="text-2xl font-bold text-red-600">
              {Object.values(attendance).filter(status => status === false).length}
            </p>
          </div>
          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-blue-800 font-semibold">Total</p>
            <p className="text-2xl font-bold text-blue-600">
              {Object.keys(attendance).length}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeacherAttendancePage;
