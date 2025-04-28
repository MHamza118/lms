// Get the current student's attendance records
function getStudentAttendanceRecords() {
    // Get the current student's ID from session storage
    const studentName = sessionStorage.getItem('currentUsername');
    if (!studentName) {
        console.error('No student is currently logged in');
        return [];
    }

    // Get all registered users to find the student's ID
    const registeredUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
    const currentStudent = registeredUsers.find(user =>
        user.name === studentName && user.type === 'Student'
    );

    if (!currentStudent) {
        console.error('Current student not found in registered users');
        return [];
    }

    const studentId = currentStudent.id.toString();

    // Get all attendance records
    const attendances = JSON.parse(localStorage.getItem('attendances') || '[]');

    // Get all courses for display purposes
    const courses = JSON.parse(localStorage.getItem('courses') || '[]');

    // Filter attendance records where this student is marked present or absent
    const studentAttendances = attendances.map(attendance => {
        // Find the course name for this attendance record
        const course = courses.find(c => c.id.toString() === attendance.courseId || c.name === attendance.courseId);
        const courseName = course ? course.name : attendance.courseId;

        // Check if student was present
        const isPresent = attendance.present.includes(studentId);

        return {
            date: attendance.date,
            courseName: courseName,
            status: isPresent ? 'Present' : 'Absent',
            teacher: attendance.teacher
        };
    });

    // Sort by date (newest first)
    studentAttendances.sort((a, b) => new Date(b.date) - new Date(a.date));

    return studentAttendances;
}

// Calculate attendance statistics
function calculateAttendanceStats() {
    const attendanceRecords = getStudentAttendanceRecords();

    if (attendanceRecords.length === 0) {
        return {
            totalClasses: 0,
            present: 0,
            absent: 0,
            presentPercentage: 0,
            absentPercentage: 0
        };
    }

    const present = attendanceRecords.filter(record => record.status === 'Present').length;
    const total = attendanceRecords.length;
    const absent = total - present;

    return {
        totalClasses: total,
        present: present,
        absent: absent,
        presentPercentage: Math.round((present / total) * 100),
        absentPercentage: Math.round((absent / total) * 100)
    };
}

// Display attendance records in the student dashboard
function displayAttendanceRecords() {
    const attendanceRecords = getStudentAttendanceRecords();
    const attendanceStats = calculateAttendanceStats();

    // Get the attendance container
    const attendanceContainer = document.getElementById('attendanceRecords');
    if (!attendanceContainer) {
        console.error('Attendance container not found');
        return;
    }

    // Clear previous content
    attendanceContainer.innerHTML = '';

    // Add attendance statistics
    const statsDiv = document.createElement('div');
    statsDiv.className = 'attendance-stats';
    statsDiv.innerHTML = `
        <div class="stat-card">
            <div class="stat-value">${attendanceStats.totalClasses}</div>
            <div class="stat-label">Total Classes</div>
        </div>
        <div class="stat-card present">
            <div class="stat-value">${attendanceStats.present}</div>
            <div class="stat-label">Present</div>
        </div>
        <div class="stat-card absent">
            <div class="stat-value">${attendanceStats.absent}</div>
            <div class="stat-label">Absent</div>
        </div>
        <div class="stat-card percentage">
            <div class="stat-value">${attendanceStats.presentPercentage}%</div>
            <div class="stat-label">Attendance Rate</div>
        </div>
    `;
    attendanceContainer.appendChild(statsDiv);

    // Add attendance visualization
    const visualDiv = document.createElement('div');
    visualDiv.className = 'attendance-visual';
    visualDiv.innerHTML = `
        <div class="progress-bar">
            <div class="progress" style="width: ${attendanceStats.presentPercentage}%"></div>
        </div>
        <div class="progress-labels">
            <span>0%</span>
            <span>25%</span>
            <span>50%</span>
            <span>75%</span>
            <span>100%</span>
        </div>
    `;
    attendanceContainer.appendChild(visualDiv);

    // Add filter controls
    const filterDiv = document.createElement('div');
    filterDiv.className = 'filter-controls';
    filterDiv.innerHTML = `
        <div class="search-group">
            <input type="text" id="attendanceSearch" placeholder="Search by course..." oninput="filterAttendanceTable()">
        </div>
        <div class="filter-group">
            <select id="attendanceStatusFilter" onchange="filterAttendanceTable()">
                <option value="all">All Status</option>
                <option value="Present">Present</option>
                <option value="Absent">Absent</option>
            </select>
        </div>
    `;
    attendanceContainer.appendChild(filterDiv);

    // Create attendance table
    const tableDiv = document.createElement('div');
    tableDiv.className = 'attendance-table-container';

    if (attendanceRecords.length === 0) {
        tableDiv.innerHTML = '<div class="empty-state">No attendance records found</div>';
    } else {
        const table = document.createElement('table');
        table.className = 'attendance-table';
        table.id = 'attendanceTable';

        // Add table header
        const thead = document.createElement('thead');
        thead.innerHTML = `
            <tr>
                <th>Date</th>
                <th>Course</th>
                <th>Status</th>
                <th>Teacher</th>
            </tr>
        `;
        table.appendChild(thead);

        // Add table body
        const tbody = document.createElement('tbody');
        attendanceRecords.forEach(record => {
            const row = document.createElement('tr');
            row.className = record.status.toLowerCase();

            // Format date
            const date = new Date(record.date);
            const formattedDate = date.toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });

            row.innerHTML = `
                <td>${formattedDate}</td>
                <td>${record.courseName}</td>
                <td><span class="status-badge ${record.status.toLowerCase()}">${record.status}</span></td>
                <td>${record.teacher}</td>
            `;
            tbody.appendChild(row);
        });

        table.appendChild(tbody);
        tableDiv.appendChild(table);
    }

    attendanceContainer.appendChild(tableDiv);
}

// Filter attendance table based on search and filter values
function filterAttendanceTable() {
    const searchInput = document.getElementById('attendanceSearch');
    const statusFilter = document.getElementById('attendanceStatusFilter');
    const table = document.getElementById('attendanceTable');

    if (!searchInput || !statusFilter || !table) return;

    const searchValue = searchInput.value.toLowerCase();
    const statusValue = statusFilter.value;

    const rows = table.querySelectorAll('tbody tr');

    rows.forEach(row => {
        const course = row.cells[1].textContent.toLowerCase();
        const status = row.cells[2].textContent;

        const matchesSearch = course.includes(searchValue);
        const matchesStatus = statusValue === 'all' || status === statusValue;

        row.style.display = matchesSearch && matchesStatus ? '' : 'none';
    });
}

// Initialize attendance view when the page loads
document.addEventListener('DOMContentLoaded', function () {
    // Check if we're on the student dashboard page
    if (document.getElementById('attendanceRecords')) {
        displayAttendanceRecords();
    }
});
