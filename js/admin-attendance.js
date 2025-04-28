// Load attendance data when the page loads
document.addEventListener('DOMContentLoaded', function () {
    // Check if we're on the admin page
    if (sessionStorage.getItem('currentUserType') !== 'Administrator') return;

    // Initialize attendance filter form
    const attendanceFilterForm = document.getElementById('attendanceFilterForm');
    if (attendanceFilterForm) {
        attendanceFilterForm.addEventListener('submit', handleAttendanceFilter);
    }

    // Initialize export buttons
    document.querySelectorAll('.export-options button').forEach(button => {
        button.addEventListener('click', function () {
            const format = this.getAttribute('data-format');
            exportAttendanceReport(format);
        });
    });

    // Load all attendance records by default
    loadAllAttendanceRecords();
});

/**
 * Load all attendance records when the page loads
 */
function loadAllAttendanceRecords() {
    // Get all attendance records without filtering
    const allAttendanceRecords = filterAttendanceData('', '');

    // Update the attendance table with all records
    updateAttendanceTable(allAttendanceRecords);

    console.log('Loaded all attendance records:', allAttendanceRecords.length);
}

/**
 * Handle attendance filter form submission
 * @param {Event} event - The form submission event
 */
function handleAttendanceFilter(event) {
    event.preventDefault();

    const course = document.getElementById('attendanceCourse').value;
    const date = document.getElementById('attendanceDate').value;

    // Filter attendance data based on criteria
    const filteredAttendance = filterAttendanceData(course, date);
    updateAttendanceTable(filteredAttendance);
}

/**
 * Filter attendance data based on course and date
 * @param {string} course - The course ID to filter by
 * @param {string} date - The date to filter by
 * @returns {Array} - Filtered attendance records
 */
function filterAttendanceData(course, date) {
    // Get all attendance records
    const attendances = JSON.parse(localStorage.getItem('attendances') || '[]');

    // Get all students
    const students = JSON.parse(localStorage.getItem('students') || '[]');

    // Filter records based on criteria
    let filteredAttendances = attendances;

    if (course) {
        filteredAttendances = filteredAttendances.filter(record => record.courseId === course);
    }

    if (date) {
        // If exact date is provided
        if (date.includes('-')) {
            filteredAttendances = filteredAttendances.filter(record => record.date === date);
        } else {
            // If only month is provided (future enhancement)
            const month = new Date(date).getMonth() + 1;
            filteredAttendances = filteredAttendances.filter(record => {
                const recordMonth = new Date(record.date).getMonth() + 1;
                return recordMonth === month;
            });
        }
    }

    // Format the data for display
    return filteredAttendances.map(record => {
        // Get course name
        const courses = JSON.parse(localStorage.getItem('courses') || '[]');
        const course = courses.find(c => c.id === record.courseId || c.name === record.courseId);
        const courseName = course ? course.name : record.courseId;

        // Get present students
        const presentStudents = students.filter(student => record.present.includes(student.id));

        // Get absent students
        const absentStudents = students.filter(student => !record.present.includes(student.id));

        return {
            id: record.courseId + '-' + record.date,
            course: courseName,
            date: record.date,
            teacher: record.teacher,
            presentCount: presentStudents.length,
            absentCount: absentStudents.length,
            totalStudents: students.length,
            presentStudents: presentStudents,
            absentStudents: absentStudents
        };
    });
}

/**
 * Update the attendance table with filtered data
 * @param {Array} attendanceData - The filtered attendance data
 */
function updateAttendanceTable(attendanceData) {
    const tbody = document.getElementById('attendanceTableBody');
    tbody.innerHTML = '';

    if (attendanceData.length === 0) {
        const emptyRow = document.createElement('tr');
        emptyRow.innerHTML = '<td colspan="4" class="empty-state">No attendance records found</td>';
        tbody.appendChild(emptyRow);
        return;
    }

    attendanceData.forEach(record => {
        const row = document.createElement('tr');

        // Calculate attendance percentage
        const attendancePercentage = Math.round((record.presentCount / record.totalStudents) * 100) || 0;

        row.innerHTML = `
            <td>${record.course}</td>
            <td>${formatDate(record.date)}</td>
            <td>${record.teacher}</td>
            <td>
                <div class="attendance-stats">
                    <span class="present">${record.presentCount} Present</span>
                    <span class="absent">${record.absentCount} Absent</span>
                    <div class="attendance-bar">
                        <div class="attendance-progress" style="width: ${attendancePercentage}%"></div>
                    </div>
                    <span class="attendance-percentage">${attendancePercentage}%</span>
                </div>
            </td>
        `;
        tbody.appendChild(row);
    });
}

/**
 * View detailed attendance for a specific record
 * @param {string} recordId - The ID of the attendance record
 */
function viewAttendanceDetails(recordId) {
    // Parse the record ID to get course and date
    const [courseId, date] = recordId.split('-');

    // Get attendance record
    const attendances = JSON.parse(localStorage.getItem('attendances') || '[]');
    const record = attendances.find(r => r.courseId === courseId && r.date === date);

    if (!record) {
        alert('Attendance record not found');
        return;
    }

    // Get students
    const students = JSON.parse(localStorage.getItem('students') || '[]');

    // Get course name
    const courses = JSON.parse(localStorage.getItem('courses') || '[]');
    const course = courses.find(c => c.id === courseId || c.name === courseId);
    const courseName = course ? course.name : courseId;

    // Create modal for detailed view
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h2>Attendance Details</h2>
                <span class="close-modal">&times;</span>
            </div>
            <div class="modal-body">
                <div class="attendance-info">
                    <p><strong>Course:</strong> ${courseName}</p>
                    <p><strong>Date:</strong> ${formatDate(date)}</p>
                    <p><strong>Marked by:</strong> ${record.teacher}</p>
                </div>
                <div class="attendance-tabs">
                    <button class="tab-btn active" data-tab="present">Present (${record.present.length})</button>
                    <button class="tab-btn" data-tab="absent">Absent (${students.length - record.present.length})</button>
                </div>
                <div class="tab-content active" id="present-tab">
                    <div class="student-list">
                        ${students.filter(s => record.present.includes(s.id)).map(student => `
                            <div class="student-item">
                                <span class="student-name">${student.name}</span>
                                <span class="student-email">${student.email}</span>
                                <span class="status present">Present</span>
                            </div>
                        `).join('') || '<div class="empty-state">No students present</div>'}
                    </div>
                </div>
                <div class="tab-content" id="absent-tab">
                    <div class="student-list">
                        ${students.filter(s => !record.present.includes(s.id)).map(student => `
                            <div class="student-item">
                                <span class="student-name">${student.name}</span>
                                <span class="student-email">${student.email}</span>
                                <span class="status absent">Absent</span>
                            </div>
                        `).join('') || '<div class="empty-state">No students absent</div>'}
                    </div>
                </div>
            </div>
            <div class="modal-footer">
                <button onclick="exportSingleAttendance('${recordId}', 'pdf')">
                    <i class="fas fa-file-pdf"></i> Export as PDF
                </button>
                <button onclick="exportSingleAttendance('${recordId}', 'excel')">
                    <i class="fas fa-file-excel"></i> Export as Excel
                </button>
                <button class="close-btn">Close</button>
            </div>
        </div>
    `;

    document.body.appendChild(modal);

    // Add event listeners for modal
    modal.querySelector('.close-modal').addEventListener('click', () => modal.remove());
    modal.querySelector('.close-btn').addEventListener('click', () => modal.remove());

    // Tab switching
    modal.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', function () {
            const tabId = this.getAttribute('data-tab');

            // Update active tab button
            modal.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');

            // Update active tab content
            modal.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
            modal.querySelector(`#${tabId}-tab`).classList.add('active');
        });
    });

    // Close modal when clicking outside
    modal.addEventListener('click', function (e) {
        if (e.target === modal) {
            modal.remove();
        }
    });
}

/**
 * Export attendance report for a single record
 * @param {string} recordId - The ID of the attendance record
 * @param {string} format - The export format ('pdf' or 'excel')
 */
function exportSingleAttendance(recordId, format) {
    // Parse the record ID to get course and date
    const [courseId, date] = recordId.split('-');

    // Get attendance record
    const attendances = JSON.parse(localStorage.getItem('attendances') || '[]');
    const record = attendances.find(r => r.courseId === courseId && r.date === date);

    if (!record) {
        alert('Attendance record not found');
        return;
    }

    // Get students
    const students = JSON.parse(localStorage.getItem('students') || '[]');

    // Get course name
    const courses = JSON.parse(localStorage.getItem('courses') || '[]');
    const course = courses.find(c => c.id === courseId || c.name === courseId);
    const courseName = course ? course.name : courseId;

    // Prepare data for export
    const exportData = {
        course: courseName,
        date: formatDate(date),
        teacher: record.teacher,
        students: students.map(student => ({
            name: student.name,
            email: student.email,
            status: record.present.includes(student.id) ? 'Present' : 'Absent'
        }))
    };

    if (format === 'pdf') {
        generatePDF(exportData);
    } else {
        generateExcel(exportData);
    }
}

/**
 * Export attendance report for all filtered records
 * @param {string} format - The export format ('pdf' or 'excel')
 */
function exportAttendanceReport(format) {
    const course = document.getElementById('attendanceCourse').value;
    const date = document.getElementById('attendanceDate').value;

    // Get filtered attendance data
    const filteredAttendance = filterAttendanceData(course, date);

    if (filteredAttendance.length === 0) {
        alert('No attendance records to export');
        return;
    }

    // Prepare data for export
    const exportData = {
        title: 'Attendance Report',
        dateGenerated: formatDate(new Date().toISOString().split('T')[0]),
        filters: {
            course: course || 'All Courses',
            date: date ? formatDate(date) : 'All Dates'
        },
        records: filteredAttendance.map(record => ({
            course: record.course,
            date: formatDate(record.date),
            teacher: record.teacher,
            presentCount: record.presentCount,
            absentCount: record.absentCount,
            totalStudents: record.totalStudents,
            attendancePercentage: Math.round((record.presentCount / record.totalStudents) * 100) || 0
        }))
    };

    if (format === 'pdf') {
        generatePDF(exportData, true);
    } else {
        generateExcel(exportData, true);
    }
}

/**
 * Generate PDF report
 * @param {Object} data - The data to include in the PDF
 * @param {boolean} isSummary - Whether this is a summary report or detailed report
 */
function generatePDF(data, isSummary = false) {
    // Create a new window for the PDF
    const printWindow = window.open('', '_blank');

    // Generate HTML content for the PDF
    let htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
            <title>Attendance Report</title>
            <style>
                body {
                    font-family: Arial, sans-serif;
                    margin: 20px;
                    color: #333;
                }
                .header {
                    text-align: center;
                    margin-bottom: 20px;
                    padding-bottom: 10px;
                    border-bottom: 2px solid #4CAF50;
                }
                .header h1 {
                    color: #4CAF50;
                    margin-bottom: 5px;
                }
                .info-section {
                    margin-bottom: 20px;
                }
                .info-section p {
                    margin: 5px 0;
                }
                table {
                    width: 100%;
                    border-collapse: collapse;
                    margin-bottom: 20px;
                }
                th, td {
                    border: 1px solid #ddd;
                    padding: 8px;
                    text-align: left;
                }
                th {
                    background-color: #f2f2f2;
                    font-weight: bold;
                }
                tr:nth-child(even) {
                    background-color: #f9f9f9;
                }
                .present {
                    color: #4CAF50;
                }
                .absent {
                    color: #f44336;
                }
                .footer {
                    margin-top: 30px;
                    text-align: center;
                    font-size: 12px;
                    color: #666;
                }
                .attendance-bar {
                    width: 100%;
                    height: 10px;
                    background-color: #f1f1f1;
                    border-radius: 5px;
                    margin: 5px 0;
                }
                .attendance-progress {
                    height: 100%;
                    background-color: #4CAF50;
                    border-radius: 5px;
                }
            </style>
        </head>
        <body>
            <div class="header">
                <h1>Attendance Report</h1>
                <p>Generated on ${formatDate(new Date().toISOString().split('T')[0])}</p>
            </div>
    `;

    if (isSummary) {
        // Summary report
        htmlContent += `
            <div class="info-section">
                <p><strong>Course:</strong> ${data.filters.course}</p>
                <p><strong>Date Range:</strong> ${data.filters.date}</p>
            </div>

            <table>
                <thead>
                    <tr>
                        <th>Course</th>
                        <th>Date</th>
                        <th>Teacher</th>
                        <th>Present</th>
                        <th>Absent</th>
                        <th>Attendance %</th>
                    </tr>
                </thead>
                <tbody>
                    ${data.records.map(record => `
                        <tr>
                            <td>${record.course}</td>
                            <td>${record.date}</td>
                            <td>${record.teacher}</td>
                            <td>${record.presentCount}</td>
                            <td>${record.absentCount}</td>
                            <td>
                                <div class="attendance-bar">
                                    <div class="attendance-progress" style="width: ${record.attendancePercentage}%"></div>
                                </div>
                                ${record.attendancePercentage}%
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
    } else {
        // Detailed report for a single attendance record
        htmlContent += `
            <div class="info-section">
                <p><strong>Course:</strong> ${data.course}</p>
                <p><strong>Date:</strong> ${data.date}</p>
                <p><strong>Teacher:</strong> ${data.teacher}</p>
            </div>

            <table>
                <thead>
                    <tr>
                        <th>Student Name</th>
                        <th>Email</th>
                        <th>Status</th>
                    </tr>
                </thead>
                <tbody>
                    ${data.students.map(student => `
                        <tr>
                            <td>${student.name}</td>
                            <td>${student.email}</td>
                            <td class="${student.status.toLowerCase()}">${student.status}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
    }

    // Add footer
    htmlContent += `
            <div class="footer">
                <p>This is an automatically generated report. Please do not reply.</p>
            </div>
        </body>
        </html>
    `;

    // Write the HTML content to the new window
    printWindow.document.open();
    printWindow.document.write(htmlContent);
    printWindow.document.close();

    // Wait for the content to load before printing
    printWindow.onload = function () {
        printWindow.print();
    };
}

/**
 * Generate Excel report
 * @param {Object} data - The data to include in the Excel file
 * @param {boolean} isSummary - Whether this is a summary report or detailed report
 */
function generateExcel(data, isSummary = false) {
    // Create a CSV string
    let csvContent = '';

    if (isSummary) {
        // Summary report
        csvContent = 'Course,Date,Teacher,Present,Absent,Total,Attendance %\n';

        data.records.forEach(record => {
            csvContent += `"${record.course}","${record.date}","${record.teacher}",${record.presentCount},${record.absentCount},${record.totalStudents},${record.attendancePercentage}%\n`;
        });
    } else {
        // Detailed report for a single attendance record
        csvContent = 'Student Name,Email,Status\n';

        data.students.forEach(student => {
            csvContent += `"${student.name}","${student.email}","${student.status}"\n`;
        });
    }

    // Create a Blob with the CSV content
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });

    // Create a download link
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    // Set link properties
    link.setAttribute('href', url);
    link.setAttribute('download', isSummary ? 'attendance_summary.csv' : `attendance_${data.course}_${data.date.replace(/\//g, '-')}.csv`);
    link.style.visibility = 'hidden';

    // Add link to document, click it, and remove it
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

/**
 * Format date string to a more readable format
 * @param {string} dateString - The date string to format
 * @returns {string} - Formatted date string
 */
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

// Add CSS styles for the attendance module
const style = document.createElement('style');
style.textContent = `
    /* Attendance Table Styles */
    .attendance-stats {
        display: flex;
        flex-direction: column;
        gap: 5px;
    }

    .attendance-stats .present {
        color: #4CAF50;
    }

    .attendance-stats .absent {
        color: #f44336;
    }

    .attendance-bar {
        width: 100%;
        height: 10px;
        background-color: #f1f1f1;
        border-radius: 5px;
        margin: 5px 0;
    }

    .attendance-progress {
        height: 100%;
        background-color: #4CAF50;
        border-radius: 5px;
    }

    .attendance-percentage {
        font-weight: bold;
    }

    /* Export Options Styles */
    .export-options {
        display: flex;
        gap: 10px;
        margin-bottom: 15px;
        justify-content: flex-end;
    }

    .export-options button {
        padding: 8px 15px;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 5px;
        font-weight: bold;
    }

    .export-options button[data-format="pdf"] {
        background-color: #f44336;
        color: white;
    }

    .export-options button[data-format="excel"] {
        background-color: #4CAF50;
        color: white;
    }

    /* Modal Styles */
    .modal {
        display: flex;
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0, 0, 0, 0.5);
        z-index: 1000;
        justify-content: center;
        align-items: center;
    }

    .modal-content {
        background-color: white;
        border-radius: 8px;
        width: 80%;
        max-width: 800px;
        max-height: 90vh;
        overflow: auto;
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
    }

    .modal-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 15px 20px;
        border-bottom: 1px solid #eee;
    }

    .modal-header h2 {
        margin: 0;
        color: #333;
    }

    .close-modal {
        font-size: 24px;
        cursor: pointer;
        color: #888;
    }

    .close-modal:hover {
        color: #333;
    }

    .modal-body {
        padding: 20px;
    }

    .modal-footer {
        padding: 15px 20px;
        border-top: 1px solid #eee;
        display: flex;
        justify-content: flex-end;
        gap: 10px;
    }

    .attendance-info {
        margin-bottom: 20px;
    }

    .attendance-tabs {
        display: flex;
        gap: 10px;
        margin-bottom: 15px;
    }

    .tab-btn {
        padding: 8px 15px;
        border: none;
        background-color: #f1f1f1;
        border-radius: 4px;
        cursor: pointer;
    }

    .tab-btn.active {
        background-color: #4CAF50;
        color: white;
    }

    .tab-content {
        display: none;
    }

    .tab-content.active {
        display: block;
    }

    .student-list {
        display: flex;
        flex-direction: column;
        gap: 10px;
        max-height: 400px;
        overflow-y: auto;
    }

    .student-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 10px;
        background-color: #f9f9f9;
        border-radius: 4px;
    }

    .student-name {
        font-weight: bold;
    }

    .status {
        padding: 4px 8px;
        border-radius: 4px;
    }

    .status.present {
        background-color: rgba(76, 175, 80, 0.1);
        color: #4CAF50;
    }

    .status.absent {
        background-color: rgba(244, 67, 54, 0.1);
        color: #f44336;
    }

    .empty-state {
        text-align: center;
        padding: 20px;
        color: #888;
    }
`;

document.head.appendChild(style);
