"use client";

import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { getStudentAttendance } from "@/lib/actions";

const StudentAttendancePage = () => {
  const { user } = useUser();
  const [attendance, setAttendance] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  useEffect(() => {
    loadAttendance();
  }, [selectedMonth, selectedYear]);

  const loadAttendance = async () => {
    try {
      setLoading(true);
      if (!user?.id) {
        setAttendance([]);
        return;
      }
      const result = await getStudentAttendance(user.id, selectedMonth + 1, selectedYear);
      if (result.success) {
        setAttendance(result.data || []);
      }
    } catch (error) {
      console.error("Error loading attendance:", error);
    } finally {
      setLoading(false);
    }
  };

  const getAttendanceStats = () => {
    const total = attendance.length;
    const present = attendance.filter((record: any) => record.present).length;
    const absent = total - present;
    const percentage = total > 0 ? Math.round((present / total) * 100) : 0;
    
    return { total, present, absent, percentage };
  };

  const getAttendanceBySubject = () => {
    const subjectStats: any = {};
    
    attendance.forEach((record: any) => {
      const subjectName = record.lesson?.subject?.name || "Unknown Subject";
      if (!subjectStats[subjectName]) {
        subjectStats[subjectName] = { total: 0, present: 0 };
      }
      subjectStats[subjectName].total++;
      if (record.present) {
        subjectStats[subjectName].present++;
      }
    });
    
    return subjectStats;
  };

  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i);

  const stats = getAttendanceStats();
  const subjectStats = getAttendanceBySubject();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading your attendance...</div>
      </div>
    );
  }

  return (
    <div className="p-5">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">My Attendance</h1>
        <p className="text-gray-600">Track your attendance records and statistics</p>
      </div>

      {/* Month/Year Selector */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <div className="flex gap-4 items-center">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Month
            </label>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
              className="p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-lamaSky focus:border-transparent"
            >
              {months.map((month, index) => (
                <option key={index} value={index}>
                  {month}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Year
            </label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(parseInt(e.target.value))}
              className="p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-lamaSky focus:border-transparent"
            >
              {years.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Overall Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Total Classes</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Present</p>
              <p className="text-2xl font-bold text-green-600">{stats.present}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Absent</p>
              <p className="text-2xl font-bold text-red-600">{stats.absent}</p>
            </div>
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Attendance %</p>
              <p className="text-2xl font-bold text-lamaSky">{stats.percentage}%</p>
            </div>
            <div className="w-12 h-12 bg-lamaSkyLight rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-lamaSky" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Subject-wise Statistics */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <h3 className="text-lg font-semibold mb-4">Attendance by Subject</h3>
        <div className="space-y-4">
          {Object.entries(subjectStats).map(([subject, stats]: [string, any]) => {
            const percentage = stats.total > 0 ? Math.round((stats.present / stats.total) * 100) : 0;
            return (
              <div key={subject} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-semibold">{subject}</p>
                  <p className="text-sm text-gray-600">
                    {stats.present}/{stats.total} classes attended
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-lamaSky">{percentage}%</p>
                  <div className="w-32 bg-gray-200 rounded-full h-2 mt-1">
                    <div
                      className="bg-lamaSky h-2 rounded-full"
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent Attendance Records */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold mb-4">Recent Attendance Records</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-4">Date</th>
                <th className="text-left py-3 px-4">Subject</th>
                <th className="text-left py-3 px-4">Teacher</th>
                <th className="text-left py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody>
              {attendance.slice(0, 10).map((record: any, index: number) => (
                <tr key={index} className="border-b">
                  <td className="py-3 px-4">
                    {new Date(record.date).toLocaleDateString()}
                  </td>
                  <td className="py-3 px-4">
                    {record.lesson?.subject?.name || "N/A"}
                  </td>
                  <td className="py-3 px-4">
                    {record.lesson?.teacher?.name || "N/A"}
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      record.present 
                        ? "bg-green-100 text-green-800" 
                        : "bg-red-100 text-red-800"
                    }`}>
                      {record.present ? "Present" : "Absent"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {attendance.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No attendance records found for the selected period.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentAttendancePage;
