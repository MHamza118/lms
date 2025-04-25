// Global variables
let users = [];
let courses = [];
let meetings = [];
let lectures = [];
let assignments = [];
let notifications = [];

// Check if user is logged in as an administrator
document.addEventListener('DOMContentLoaded', function () {
    const currentUserType = sessionStorage.getItem('currentUserType');
    if (currentUserType !== 'Administrator') {
        window.location.href = '../index.html';
        return;
    }

    // Initialize event listeners
    initializeEventListeners();

    // Load initial data
    loadInitialData();

    // Update dashboard stats
    updateDashboardStats();
});

// Initialize all event listeners
function initializeEventListeners() {
    // User Management Form
    const userForm = document.getElementById('userForm');
    if (userForm) {
        userForm.addEventListener('submit', handleAddUser);
    }

    // Attendance Filter Form
    const attendanceFilterForm = document.getElementById('attendanceFilterForm');
    if (attendanceFilterForm) {
        attendanceFilterForm.addEventListener('submit', handleAttendanceFilter);
    }

    // Lecture Upload Form
    const lectureUploadForm = document.getElementById('lectureUploadForm');
    if (lectureUploadForm) {
        lectureUploadForm.addEventListener('submit', handleLectureUpload);
    }

    // Assignment Filter Form
    const assignmentFilterForm = document.getElementById('assignmentFilterForm');
    if (assignmentFilterForm) {
        assignmentFilterForm.addEventListener('submit', handleAssignmentFilter);
    }

    // Notification Form
    const notificationForm = document.getElementById('notificationForm');
    if (notificationForm) {
        notificationForm.addEventListener('submit', handleSendNotification);
    }

    // Course Form
    const courseForm = document.getElementById('courseForm');
    if (courseForm) {
        courseForm.addEventListener('submit', handleAddCourse);
    }

    // Sidebar Navigation
    const navItems = document.querySelectorAll('.sidebar-nav li');
    navItems.forEach(item => {
        if (!item.classList.contains('logout')) {
            item.addEventListener('click', () => {
                const section = item.getAttribute('data-section');
                showSection(section);
            });
        }
    });
}

// Function to show selected section
function showSection(sectionId) {
    // Hide all sections
    const sections = document.querySelectorAll('.section-container');
    sections.forEach(section => {
        section.classList.remove('active');
    });

    // Update active nav item
    const navItems = document.querySelectorAll('.sidebar-nav li');
    navItems.forEach(item => {
        item.classList.remove('active');
        if (item.getAttribute('data-section') === sectionId) {
            item.classList.add('active');
        }
    });

    // Show the selected section
    const targetSection = document.getElementById(sectionId);
    if (targetSection) {
        targetSection.classList.add('active');
    }
}

// Function to handle logout
function logout() {
    sessionStorage.removeItem('currentUserType');
    sessionStorage.removeItem('currentUsername');
    window.location.href = '../index.html';
}

// Load initial data
function loadInitialData() {
    // Load users
    users = JSON.parse(localStorage.getItem('registeredUsers') || '[]');

    // Load courses
    courses = JSON.parse(localStorage.getItem('courses')) || [];

    // Populate teacher dropdown
    populateTeacherDropdown();

    // Load meetings
    meetings = JSON.parse(localStorage.getItem('meetings')) || [];

    // Load lectures
    lectures = JSON.parse(localStorage.getItem('lectures')) || [];

    // Load assignments
    assignments = JSON.parse(localStorage.getItem('assignments')) || [];

    // Load notifications
    notifications = JSON.parse(localStorage.getItem('notifications')) || [];

    // Update all tables
    updateUsersTable();

    // Update admin name in banner
    const adminName = sessionStorage.getItem('currentUsername');
    if (adminName) {
        const adminNameElement = document.getElementById('adminNameBanner');
        if (adminNameElement) {
            adminNameElement.textContent = adminName;
        }
    }
}

// User Management Functions
function handleAddUser(event) {
    event.preventDefault();

    const userType = document.getElementById('userType').value;
    const userName = document.getElementById('userName').value;
    const userEmail = document.getElementById('userEmail').value;
    const userPassword = document.getElementById('userPassword').value;

    if (!userType || !userName || !userEmail || !userPassword) {
        alert('Please fill in all fields');
        return;
    }

    // Convert userType to match login form values
    const loginUserType = userType === 'teacher' ? 'ClassTeacher' :
        userType === 'student' ? 'Student' : userType;

    const newUser = {
        id: Date.now(),
        name: userName,
        email: userEmail,
        type: loginUserType,
        password: userPassword,
        status: 'active',
        createdAt: new Date().toISOString()
    };

    // Get existing users or initialize empty array
    const registeredUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');

    // Check if user already exists
    if (registeredUsers.some(user => user.email === userEmail)) {
        alert('A user with this email already exists');
        return;
    }

    // Add new user
    registeredUsers.push(newUser);
    localStorage.setItem('registeredUsers', JSON.stringify(registeredUsers));

    // Update local users array
    users = registeredUsers;

    updateUsersTable();
    updateDashboardStats();
    event.target.reset();

    alert('User added successfully');
}

function sendCredentialsByEmail(user) {
    const subject = `Your Class Management System Credentials`;
    const body = `
Hello ${user.name},

Your account has been created in the Class Management System.

Here are your login credentials:
Email: ${user.email}
Password: ${user.password}
User Type: ${user.type}

Please login at: ${window.location.origin}/index.html

If you have any questions or Login issues, Please do not hesitate to contact us.

Best regards,
Admin Team
    `.trim();

    const mailtoLink = `mailto:${user.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.location.href = mailtoLink;
}

function updateUsersTable() {
    const tbody = document.getElementById('usersTableBody');
    if (!tbody) return;

    tbody.innerHTML = '';

    // Get users from localStorage
    const registeredUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');

    registeredUsers.forEach(user => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${user.name}</td>
            <td>${user.email}</td>
            <td>${user.type}</td>
            <td class="status-${user.status.toLowerCase()}">${user.status}</td>
            <td>
                <div class="action-buttons">
                    <button class="edit-btn" onclick="editUser(${user.id})"><i class="fas fa-edit"></i></button>
                    <button class="delete-btn" onclick="deleteUser(${user.id})"><i class="fas fa-trash"></i></button>
                    <button class="send-credentials-btn" onclick="sendCredentialsByEmail(${JSON.stringify(user).replace(/"/g, '&quot;')})">
                        <i class="fas fa-envelope"></i>
                    </button>
                </div>
            </td>
        `;
        tbody.appendChild(row);
    });
}

function editUser(userId) {
    const user = users.find(u => u.id === userId);
    if (!user) return;

    const newName = prompt('Enter new name:', user.name);
    const newEmail = prompt('Enter new email:', user.email);
    const newPassword = prompt('Enter new password:', user.password);

    if (newName && newEmail && newPassword) {
        user.name = newName;
        user.email = newEmail;
        user.password = newPassword;
        localStorage.setItem('users', JSON.stringify(users));
        updateUsersTable();
    }
}

function deleteUser(userId) {
    if (confirm('Are you sure you want to delete this user?')) {
        users = users.filter(u => u.id !== userId);
        localStorage.setItem('users', JSON.stringify(users));
        updateUsersTable();
        updateDashboardStats();
    }
}

// Course Management Functions
// Function to populate teacher dropdown
function populateTeacherDropdown() {
    const teacherSelect = document.getElementById('courseTeacher');
    const registeredUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
    const teachers = registeredUsers.filter(user => user.type === 'ClassTeacher');

    // Clear existing options
    teacherSelect.innerHTML = '<option value="">Select Teacher</option>';

    // Add teacher options
    teachers.forEach(teacher => {
        const option = document.createElement('option');
        option.value = teacher.name;
        option.textContent = teacher.name;
        teacherSelect.appendChild(option);
    });
}

function handleAddCourse(event) {
    event.preventDefault();

    const courseName = document.getElementById('courseName').value;
    const courseCode = document.getElementById('courseCode').value;
    const courseDescription = document.getElementById('courseDescription').value;
    const courseSyllabus = document.getElementById('courseSyllabus').value;
    const courseTeacher = document.getElementById('courseTeacher').value;

    const newCourse = {
        id: Date.now(),
        code: courseCode,
        name: courseName,
        description: courseDescription,
        syllabus: courseSyllabus,
        teacher: courseTeacher,
        status: 'active',
        createdAt: new Date().toISOString()
    };

    courses.push(newCourse);
    localStorage.setItem('courses', JSON.stringify(courses));

    updateCoursesTable();
    updateDashboardStats();
    event.target.reset();
}

function updateCoursesTable() {
    const tbody = document.getElementById('coursesTableBody');
    tbody.innerHTML = '';

    courses.forEach(course => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${course.code}</td>
            <td>${course.name}</td>
            <td>${course.teacher}</td>
            <td class="status-${course.status}">${course.status}</td>
            <td>
                <div class="action-buttons">
                    <button class="edit-btn" onclick="editCourse(${course.id})">Edit</button>
                    <button class="delete-btn" onclick="deleteCourse(${course.id})">Delete</button>
                </div>
            </td>
        `;
        tbody.appendChild(row);
    });
}

function editCourse(courseId) {
    const course = courses.find(c => c.id === courseId);
    if (!course) return;

    const newName = prompt('Enter new course name:', course.name);
    const newCode = prompt('Enter new course code:', course.code);
    const newDescription = prompt('Enter new description:', course.description);

    if (newName && newCode && newDescription) {
        course.name = newName;
        course.code = newCode;
        course.description = newDescription;
        localStorage.setItem('courses', JSON.stringify(courses));
        updateCoursesTable();
    }
}

function deleteCourse(courseId) {
    if (confirm('Are you sure you want to delete this course?')) {
        courses = courses.filter(c => c.id !== courseId);
        localStorage.setItem('courses', JSON.stringify(courses));
        updateCoursesTable();
        updateDashboardStats();
    }
}

// Update dashboard stats
function updateDashboardStats() {
    // Update total users
    const registeredUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
    const totalUsersElement = document.getElementById('totalUsers');
    if (totalUsersElement) {
        totalUsersElement.textContent = registeredUsers.length;
    }

    // Update active courses
    const activeCourses = courses.filter(course => course.status === 'active').length;
    document.getElementById('activeCourses').textContent = activeCourses;

    // Update system performance
    const performance = calculateSystemPerformance();
    document.getElementById('performance').textContent = `${performance}%`;
}

function calculateSystemPerformance() {
    const totalStudents = users.filter(user => user.type === 'student').length;
    const totalTeachers = users.filter(user => user.type === 'teacher').length;
    const activeMeetings = meetings.filter(meeting => meeting.status === 'active').length;
    const completedAssignments = assignments.filter(assignment => assignment.status === 'completed').length;

    const studentTeacherRatio = totalStudents / (totalTeachers || 1);
    const meetingUtilization = activeMeetings / (totalTeachers || 1);
    const assignmentCompletion = completedAssignments / (assignments.length || 1);

    const performance = Math.round(
        (studentTeacherRatio * 0.3 + meetingUtilization * 0.3 + assignmentCompletion * 0.4) * 100
    );

    return Math.min(performance, 100);
}

// Helper Functions
function updateAllTables() {
    updateUsersTable();
    updateCoursesTable();
    updateMeetingsTable();
    updateLecturesTable();
    updateAssignmentsTable(assignments);
    updateNotificationsTable();
}

// Export Functions
function exportAttendanceReport(format) {
    // Implement export functionality based on format (PDF/Excel)
    console.log(`Exporting attendance report as ${format}`);
}

// Attendance Functions
function handleAttendanceFilter(event) {
    event.preventDefault();

    const course = document.getElementById('attendanceCourse').value;
    const date = document.getElementById('attendanceDate').value;

    // Filter attendance data based on criteria
    const filteredAttendance = filterAttendanceData(course, date);
    updateAttendanceTable(filteredAttendance);
}

function filterAttendanceData(course, date) {
    // Example implementation - replace with actual data filtering
    return [];
}

function updateAttendanceTable(attendanceData) {
    const tbody = document.getElementById('attendanceTableBody');
    tbody.innerHTML = '';

    attendanceData.forEach(record => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${record.student}</td>
            <td>${record.course}</td>
            <td>${record.date}</td>
            <td>${record.status}</td>
            <td>
                <button onclick="viewAttendanceDetails(${record.id})">View</button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

// Meeting Functions
function handleMeetingActions(event) {
    if (event.target.classList.contains('end-meeting')) {
        const meetingId = event.target.dataset.meetingId;
        endMeeting(meetingId);
    }
}

function endMeeting(meetingId) {
    const meeting = meetings.find(m => m.id === meetingId);
    if (meeting) {
        meeting.status = 'ended';
        meeting.endTime = new Date().toISOString();
        localStorage.setItem('meetings', JSON.stringify(meetings));
        updateMeetingsTable();
    }
}

function updateMeetingsTable() {
    const tbody = document.getElementById('meetingsTableBody');
    tbody.innerHTML = '';

    meetings.forEach(meeting => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${meeting.id}</td>
            <td>${meeting.host}</td>
            <td>${meeting.participants.length}</td>
            <td>${new Date(meeting.startTime).toLocaleString()}</td>
            <td>${meeting.status}</td>
            <td>
                ${meeting.status === 'active' ?
                `<button class="end-meeting" data-meeting-id="${meeting.id}">End Meeting</button>` :
                'Meeting Ended'}
            </td>
        `;
        tbody.appendChild(row);
    });
}

// Lecture Functions
function handleLectureUpload(event) {
    event.preventDefault();

    const course = document.getElementById('lectureCourse').value;
    const file = document.getElementById('lectureFile').files[0];

    if (file) {
        const newLecture = {
            id: Date.now(),
            title: file.name,
            course: course,
            file: file,
            uploadDate: new Date().toISOString(),
            size: formatFileSize(file.size)
        };

        lectures.push(newLecture);
        localStorage.setItem('lectures', JSON.stringify(lectures));

        updateLecturesTable();
        event.target.reset();
    }
}

function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function updateLecturesTable() {
    const tbody = document.getElementById('lecturesTableBody');
    tbody.innerHTML = '';

    lectures.forEach(lecture => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${lecture.title}</td>
            <td>${lecture.course}</td>
            <td>${new Date(lecture.uploadDate).toLocaleDateString()}</td>
            <td>${lecture.size}</td>
            <td>
                <button onclick="downloadLecture(${lecture.id})">Download</button>
                <button onclick="deleteLecture(${lecture.id})">Delete</button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

// Assignment Functions
function handleAssignmentFilter(event) {
    event.preventDefault();

    const course = document.getElementById('assignmentCourse').value;
    const type = document.getElementById('assignmentType').value;

    const filteredAssignments = filterAssignments(course, type);
    updateAssignmentsTable(filteredAssignments);
}

function filterAssignments(course, type) {
    return assignments.filter(assignment => {
        if (course && assignment.course !== course) return false;
        if (type && assignment.type !== type) return false;
        return true;
    });
}

function updateAssignmentsTable(filteredAssignments) {
    const tbody = document.getElementById('assignmentsTableBody');
    tbody.innerHTML = '';

    filteredAssignments.forEach(assignment => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${assignment.student}</td>
            <td>${assignment.course}</td>
            <td>${assignment.title}</td>
            <td>${assignment.score || 'N/A'}</td>
            <td>${assignment.status}</td>
            <td>
                <button onclick="viewAssignmentDetails(${assignment.id})">View</button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

// Notification Functions
function handleSendNotification(event) {
    event.preventDefault();

    const type = document.getElementById('notificationType').value;
    const title = document.getElementById('notificationTitle').value;
    const message = document.getElementById('notificationMessage').value;

    const newNotification = {
        id: Date.now(),
        type: type,
        title: title,
        message: message,
        date: new Date().toISOString(),
        status: 'sent'
    };

    notifications.push(newNotification);
    localStorage.setItem('notifications', JSON.stringify(notifications));

    updateNotificationsTable();
    event.target.reset();
}

function updateNotificationsTable() {
    const tbody = document.getElementById('notificationsTableBody');
    tbody.innerHTML = '';

    notifications.forEach(notification => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${notification.title}</td>
            <td>${notification.type}</td>
            <td>${new Date(notification.date).toLocaleString()}</td>
            <td>${notification.status}</td>
            <td>
                <button onclick="viewNotificationDetails(${notification.id})">View</button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

// Report Generation Functions
function generateAttendanceReport() {
    const course = document.getElementById('attendanceReportCourse').value;
    const resultDiv = document.getElementById('attendanceReportResult');

    if (!course) {
        alert('Please select a course');
        return;
    }

    const users = JSON.parse(localStorage.getItem('users')) || {};
    const students = Object.entries(users).filter(([_, data]) => data.type === 'Student');

    let report = `<h4>Attendance Report for ${course}</h4>`;
    report += '<table><thead><tr><th>Student</th><th>Present</th><th>Absent</th><th>Total Classes</th></tr></thead><tbody>';

    students.forEach(([username, _]) => {
        const attendanceRecords = JSON.parse(localStorage.getItem(`attendanceRecords_${username}`)) || [];
        const courseRecords = attendanceRecords.filter(record => record.course === course);
        const present = courseRecords.filter(record => record.status === 'Present').length;
        const absent = courseRecords.filter(record => record.status === 'Absent').length;
        const total = present + absent;

        report += `
            <tr>
                <td>${username}</td>
                <td>${present}</td>
                <td>${absent}</td>
                <td>${total}</td>
            </tr>
        `;
    });

    report += '</tbody></table>';
    resultDiv.innerHTML = report;
}

function generateAssignmentReport() {
    const course = document.getElementById('assignmentReportCourse').value;
    const resultDiv = document.getElementById('assignmentReportResult');

    if (!course) {
        alert('Please select a course');
        return;
    }

    const assignments = JSON.parse(localStorage.getItem('assignments')) || [];
    const courseAssignments = assignments.filter(a => a.course === course);

    let report = `<h4>Assignment Report for ${course}</h4>`;
    report += '<table><thead><tr><th>Assignment</th><th>Total Students</th><th>Submitted</th><th>Not Submitted</th></tr></thead><tbody>';

    courseAssignments.forEach(assignment => {
        const totalStudents = Object.keys(JSON.parse(localStorage.getItem('users')) || {})
            .filter(username => {
                const user = JSON.parse(localStorage.getItem('users'))[username];
                return user.type === 'Student' && user.enrolledCourses && user.enrolledCourses.includes(course);
            }).length;

        const submitted = assignment.submissions ? assignment.submissions.length : 0;
        const notSubmitted = totalStudents - submitted;

        report += `
            <tr>
                <td>${assignment.title}</td>
                <td>${totalStudents}</td>
                <td>${submitted}</td>
                <td>${notSubmitted}</td>
            </tr>
        `;
    });

    report += '</tbody></table>';
    resultDiv.innerHTML = report;
}