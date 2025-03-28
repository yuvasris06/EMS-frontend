import React, { useState, useEffect } from "react";
import { Link } from 'react-router-dom';
import { columns, AttendanceHelper } from '../../utils/AttendanceHelper'; 
import DataTable from 'react-data-table-component';
import axios from "axios";

const Attendance = ({ refreshReport }) => {
    const [attendance, setAttendance] = useState([]);
    const [loading, setLoading] = useState(false);
    const [filteredAttendance, setFilteredAttendance] = useState(null);

    const statusChange = () => {
        fetchAttendance();
        if (refreshReport) {
            refreshReport();  // Trigger a refresh on the AttendanceReport page
        }
    };

    const fetchAttendance = async () => {
        setLoading(true);
        try {
            const response = await axios.get('http://localhost:3001/api/attendance', {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                },
            });

            if (response.data.success) {
                let sno = 1;
                const data = await response.data.attendance.map((att) => ({
                    employeeId: att.employeeId.employeeId,
                    sno: sno++,
                    department: att.employeeId.department.dep_name,
                    name: att.employeeId.userId.name,
                    action: <AttendanceHelper
                        status={att.status}
                        employeeId={att.employeeId.employeeId}
                        statusChange={statusChange}
                    />
                }));
                setAttendance(data);
                setFilteredAttendance(data);
            }
        } catch (error) {
            console.error(error.message);
            if (error.response && !error.response.data.success) {
                alert(error.response.data.error);
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAttendance();
    }, []);

    const handleFilter = (e) => {
        const query = e.target.value.toLowerCase();
        const records = attendance.filter((emp) =>
            emp.employeeId.toLowerCase().includes(query) ||
            emp.name.toLowerCase().includes(query)
        );
        setFilteredAttendance(records);
    };

    if (!filteredAttendance) {
        return <div>Loading attendance data...</div>;
    }

    return (
        <div className="p-6">
            <div className="text-center">
                <h3 className="text-2xl font-bold">Manage Attendance</h3>
            </div>
            <div className="flex justify-between items-center mt-4">
                <input
                    type="text"
                    placeholder="Search By Employee Name"
                    className="px-4 py-0.5 border"
                    onChange={handleFilter}
                />
                <p className="2xl ">
                    Mark Employees for <span className="font-bold underline">{new Date().toISOString().split('T')[0]}{" "}</span>
                </p>
                <Link
                    to="/admin-dashboard/attendance-report"
                    className="px-4 py-1 bg-[#7F3F7F] hover:bg-[#9B4F9B] rounded text-white"
                >
                    Attendance Report
                </Link>
            </div>
            <div className="mt-6">
                <DataTable
                    columns={columns}
                    data={filteredAttendance}
                    pagination
                />
            </div>
        </div>
    );
};

export default Attendance;
