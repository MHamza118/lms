// Teacher Attendance Management Functions

// Function to sync students from registeredUsers to students array
function syncStudentsForAttendance() {
    // Get all registered users
    const registeredUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');

    // Filter only student users
    const studentUsers = registeredUsers.filter(user => user.type === 'Student');

    // Get current students array or initialize empty array
    const currentStudents = JSON.parse(localStorage.getItem('students') || '[]');

    // Map student users to the format expected by the attendance system
    const mappedStudents = studentUsers.map(user => ({
        id: user.id.toString(),
        name: user.name,
        email: user.email,
        status: user.status
    }));

    // Merge existing students with new ones (avoid duplicates by id)
    const existingIds = currentStudents.map(student => student.id);
    const newStudents = mappedStudents.filter(student => !existingIds.includes(student.id));

    // Combine existing and new students
    const updatedStudents = [...currentStudents, ...newStudents];

    // Save updated students array
    localStorage.setItem('students', JSON.stringify(updatedStudents));

    console.log(`Synced ${newStudents.length} new students for attendance`);
    return updatedStudents;
}

// Function to load attendance list for teacher
function loadAttendanceList() {
    // First sync students to ensure we have the latest data
    const students = syncStudentsForAttendance();

    const courseId = document.getElementById('attendanceCourse').value;
    const date = document.getElementById('attendanceDate').value;

    if (!courseId || !date) return;

    // Get existing attendance records
    const attendances = JSON.parse(localStorage.getItem('attendances') || '[]');
    const existingAttendance = attendances.find(a => a.courseId === courseId && a.date === date);

    const attendanceList = document.getElementById('attendanceList');
    attendanceList.innerHTML = '';

    // Add filter controls
    const filterControls = document.createElement('div');
    filterControls.className = 'filter-controls';
    filterControls.innerHTML = `
        <div class="filter-group">
            <label>Filter by:</label>
            <select id="attendanceFilter" onchange="filterAttendanceList()">
                <option value="all">All Students</option>
                <option value="present">Present</option>
                <option value="absent">Absent</option>
            </select>
        </div>
        <div class="search-group">
            <input type="text" id="attendanceSearch" placeholder="Search students..." oninput="filterAttendanceList()">
        </div>
    `;
    attendanceList.appendChild(filterControls);

    // Add attendance list container
    const listContainer = document.createElement('div');
    listContainer.className = 'attendance-list-container';
    listContainer.id = 'attendanceListContainer';

    // Check if we have students
    if (students.length === 0) {
        listContainer.innerHTML = '<div class="empty-state"><p>No students found. Please add students in the admin panel.</p></div>';
        attendanceList.appendChild(listContainer);
        return;
    }

    // Display students for attendance
    students.forEach(student => {
        const isPresent = existingAttendance ? existingAttendance.present.includes(student.id) : false;
        const div = document.createElement('div');
        div.className = `attendance-item ${isPresent ? 'present' : 'absent'}`;
        div.innerHTML = `
            <div class="student-info">
                <span class="student-name">${student.name}</span>
                <span class="student-id">${student.email}</span>
            </div>
            <div class="attendance-status">
                <label class="status-toggle">
                    <input type="checkbox" name="attendance" value="${student.id}" ${isPresent ? 'checked' : ''}>
                    <span class="toggle-slider"></span>
                </label>
            </div>
        `;
        listContainer.appendChild(div);
    });

    attendanceList.appendChild(listContainer);
}

// Function to filter attendance list
function filterAttendanceList() {
    const filter = document.getElementById('attendanceFilter').value;
    const search = document.getElementById('attendanceSearch').value.toLowerCase();
    const items = document.querySelectorAll('.attendance-item');

    items.forEach(item => {
        const name = item.querySelector('.student-name').textContent.toLowerCase();
        const isPresent = item.classList.contains('present');
        const matchesSearch = name.includes(search);
        const matchesFilter = filter === 'all' ||
            (filter === 'present' && isPresent) ||
            (filter === 'absent' && !isPresent);

        item.style.display = matchesSearch && matchesFilter ? 'flex' : 'none';
    });
}

// Function to save attendance
function saveAttendance() {
    const courseId = document.getElementById('attendanceCourse').value;
    const date = document.getElementById('attendanceDate').value;
    const checkboxes = document.querySelectorAll('input[name="attendance"]:checked');

    if (!courseId || !date) {
        alert('Please select a course and date');
        return;
    }

    const attendance = {
        courseId,
        date,
        present: Array.from(checkboxes).map(cb => cb.value),
        teacher: sessionStorage.getItem('currentUsername')
    };

    const attendances = JSON.parse(localStorage.getItem('attendances') || '[]');
    const existingIndex = attendances.findIndex(a => a.courseId === courseId && a.date === date);

    if (existingIndex !== -1) {
        attendances[existingIndex] = attendance;
    } else {
        attendances.push(attendance);
    }

    localStorage.setItem('attendances', JSON.stringify(attendances));

    // Show success message
    const successMessage = document.createElement('div');
    successMessage.className = 'success-message';
    successMessage.textContent = 'Attendance saved successfully!';
    document.getElementById('attendanceList').appendChild(successMessage);

    setTimeout(() => {
        successMessage.remove();
    }, 3000);
}

// Function to get student attendance records
function getStudentAttendanceRecords(studentId) {
    const attendances = JSON.parse(localStorage.getItem('attendances') || '[]');
    return attendances.filter(attendance => attendance.present.includes(studentId));
}

// Function to calculate attendance percentage for a student
function calculateAttendancePercentage(studentId, courseId = null) {
    const attendances = JSON.parse(localStorage.getItem('attendances') || '[]');

    // Filter by course if specified
    const courseAttendances = courseId
        ? attendances.filter(a => a.courseId === courseId)
        : attendances;

    if (courseAttendances.length === 0) return 0;

    // Count how many times the student was present
    const presentCount = courseAttendances.filter(a => a.present.includes(studentId)).length;

    // Calculate percentage
    return Math.round((presentCount / courseAttendances.length) * 100);
}
