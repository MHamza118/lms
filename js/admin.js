// Check if user is logged in as an administrator
document.addEventListener('DOMContentLoaded', function() {
    const currentUserType = sessionStorage.getItem('currentUserType');
    if (currentUserType !== 'Administrator') {
        window.location.href = '../index.html';
        return;
    }

    // Initialize event listeners
    initializeEventListeners();
    
    // Show default section
    showSection('manageUsers');
    
    // Load initial data
    loadUsers();
    loadCourses();
    loadTeachers();
    loadStudents();
    loadLeaveRequests();
});

// Initialize all event listeners
function initializeEventListeners() {
    // Add User Form
    const addUserForm = document.getElementById('addUserForm');
    if (addUserForm) {
        addUserForm.addEventListener('submit', handleAddUser);
    }

    // Add Course Form
    const addCourseForm = document.getElementById('addCourseForm');
    if (addCourseForm) {
        addCourseForm.addEventListener('submit', handleAddCourse);
    }
}

// Function to show selected section
function showSection(sectionId) {
    // Hide all sections
    const sections = document.querySelectorAll('.section');
    sections.forEach(section => {
        section.style.display = 'none';
    });

    // Show the selected section
    const targetSection = document.getElementById(sectionId);
    if (targetSection) {
        targetSection.style.display = 'block';
    }
}

// Function to handle logout
function logout() {
    sessionStorage.removeItem('currentUserType');
    sessionStorage.removeItem('currentUsername');
    window.location.href = '../index.html';
}

// User Management Functions
function handleAddUser(event) {
    event.preventDefault();
    
    const userType = document.getElementById('newUserType').value;
    const username = document.getElementById('newUsername').value;
    const password = document.getElementById('newPassword').value;

    if (!userType || !username || !password) {
        alert('Please fill in all fields');
        return;
    }

    const users = JSON.parse(localStorage.getItem('users')) || {};
    users[username] = {
        type: userType,
        password: password
    };

    localStorage.setItem('users', JSON.stringify(users));
    loadUsers();
    event.target.reset();
}

function loadUsers() {
    const users = JSON.parse(localStorage.getItem('users')) || {};
    const tbody = document.getElementById('usersTableBody');
    
    if (!tbody) return;
    
    tbody.innerHTML = '';
    
    Object.entries(users).forEach(([username, data]) => {
        if (data.type !== 'Administrator') {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${username}</td>
                <td>${data.type}</td>
                <td>
                    <div class="action-buttons">
                        <button class="edit-btn" onclick="editUser('${username}')">Edit</button>
                        <button class="delete-btn" onclick="deleteUser('${username}')">Delete</button>
                    </div>
                </td>
            `;
            tbody.appendChild(row);
        }
    });
}

function editUser(username) {
    const users = JSON.parse(localStorage.getItem('users')) || {};
    const user = users[username];
    
    if (!user) return;
    
    const newPassword = prompt('Enter new password:');
    if (newPassword) {
        users[username].password = newPassword;
        localStorage.setItem('users', JSON.stringify(users));
        loadUsers();
    }
}

function deleteUser(username) {
    if (confirm(`Are you sure you want to delete user ${username}?`)) {
        const users = JSON.parse(localStorage.getItem('users')) || {};
        delete users[username];
        localStorage.setItem('users', JSON.stringify(users));
        loadUsers();
    }
}

// Course Management Functions
function handleAddCourse(event) {
    event.preventDefault();
    
    const courseName = document.getElementById('courseName').value;
    const courseDescription = document.getElementById('courseDescription').value;
    const courseTeacher = document.getElementById('courseTeacher').value;

    if (!courseName || !courseDescription || !courseTeacher) {
        alert('Please fill in all fields');
        return;
    }

    const courses = JSON.parse(localStorage.getItem('courses')) || [];
    courses.push({
        id: Date.now().toString(),
        name: courseName,
        description: courseDescription,
        teacher: courseTeacher
    });

    localStorage.setItem('courses', JSON.stringify(courses));
    loadCourses();
    event.target.reset();
}

function loadCourses() {
    const courses = JSON.parse(localStorage.getItem('courses')) || [];
    const tbody = document.getElementById('coursesTableBody');
    const courseSelect = document.getElementById('courseTeacher');
    
    if (!tbody) return;
    
    tbody.innerHTML = '';
    
    // Update teacher select options
    if (courseSelect) {
        const teachers = JSON.parse(localStorage.getItem('users')) || {};
        courseSelect.innerHTML = '<option value="">Select Teacher</option>';
        Object.entries(teachers).forEach(([username, data]) => {
            if (data.type === 'ClassTeacher') {
                courseSelect.innerHTML += `<option value="${username}">${username}</option>`;
            }
        });
    }
    
    courses.forEach(course => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${course.name}</td>
            <td>${course.description}</td>
            <td>${course.teacher}</td>
            <td>
                <div class="action-buttons">
                    <button class="edit-btn" onclick="editCourse('${course.id}')">Edit</button>
                    <button class="delete-btn" onclick="deleteCourse('${course.id}')">Delete</button>
                </div>
            </td>
        `;
        tbody.appendChild(row);
    });
}

function editCourse(courseId) {
    const courses = JSON.parse(localStorage.getItem('courses')) || [];
    const course = courses.find(c => c.id === courseId);
    
    if (!course) return;
    
    const newName = prompt('Enter new course name:', course.name);
    if (newName) {
        course.name = newName;
        localStorage.setItem('courses', JSON.stringify(courses));
        loadCourses();
    }
}

function deleteCourse(courseId) {
    if (confirm('Are you sure you want to delete this course?')) {
        const courses = JSON.parse(localStorage.getItem('courses')) || [];
        const filteredCourses = courses.filter(c => c.id !== courseId);
        localStorage.setItem('courses', JSON.stringify(filteredCourses));
        loadCourses();
    }
}

// Teacher Management Functions
function loadTeachers() {
    const users = JSON.parse(localStorage.getItem('users')) || {};
    const courses = JSON.parse(localStorage.getItem('courses')) || [];
    const tbody = document.getElementById('teachersTableBody');
    
    if (!tbody) return;
    
    tbody.innerHTML = '';
    
    Object.entries(users).forEach(([username, data]) => {
        if (data.type === 'ClassTeacher') {
            const teacherCourses = courses.filter(c => c.teacher === username);
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${username}</td>
                <td>${username}</td>
                <td>${teacherCourses.map(c => c.name).join(', ') || 'No courses assigned'}</td>
                <td>
                    <div class="action-buttons">
                        <button class="edit-btn" onclick="editTeacher('${username}')">Edit</button>
                        <button class="delete-btn" onclick="deleteTeacher('${username}')">Delete</button>
                    </div>
                </td>
            `;
            tbody.appendChild(row);
        }
    });
}

function editTeacher(username) {
    const users = JSON.parse(localStorage.getItem('users')) || {};
    const user = users[username];
    
    if (!user) return;
    
    const newPassword = prompt('Enter new password:');
    if (newPassword) {
        users[username].password = newPassword;
        localStorage.setItem('users', JSON.stringify(users));
        loadTeachers();
    }
}

function deleteTeacher(username) {
    if (confirm(`Are you sure you want to delete teacher ${username}?`)) {
        const users = JSON.parse(localStorage.getItem('users')) || {};
        delete users[username];
        localStorage.setItem('users', JSON.stringify(users));
        loadTeachers();
    }
}

// Student Management Functions
function loadStudents() {
    const users = JSON.parse(localStorage.getItem('users')) || {};
    const tbody = document.getElementById('studentsTableBody');
    
    if (!tbody) return;
    
    tbody.innerHTML = '';
    
    Object.entries(users).forEach(([username, data]) => {
        if (data.type === 'Student') {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${username}</td>
                <td>${username}</td>
                <td>${data.enrolledCourses ? data.enrolledCourses.join(', ') : 'No courses enrolled'}</td>
                <td>
                    <div class="action-buttons">
                        <button class="edit-btn" onclick="editStudent('${username}')">Edit</button>
                        <button class="delete-btn" onclick="deleteStudent('${username}')">Delete</button>
                    </div>
                </td>
            `;
            tbody.appendChild(row);
        }
    });
}

function editStudent(username) {
    const users = JSON.parse(localStorage.getItem('users')) || {};
    const user = users[username];
    
    if (!user) return;
    
    const newPassword = prompt('Enter new password:');
    if (newPassword) {
        users[username].password = newPassword;
        localStorage.setItem('users', JSON.stringify(users));
        loadStudents();
    }
}

function deleteStudent(username) {
    if (confirm(`Are you sure you want to delete student ${username}?`)) {
        const users = JSON.parse(localStorage.getItem('users')) || {};
        delete users[username];
        localStorage.setItem('users', JSON.stringify(users));
        loadStudents();
    }
}

// Leave Request Management Functions
function loadLeaveRequests() {
    const users = JSON.parse(localStorage.getItem('users')) || {};
    const tbody = document.getElementById('leaveRequestsTableBody');
    
    if (!tbody) return;
    
    tbody.innerHTML = '';
    
    Object.entries(users).forEach(([username, data]) => {
        if (data.type === 'Student' && data.leaveRequests) {
            data.leaveRequests.forEach(request => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${username}</td>
                    <td>${request.date}</td>
                    <td>${request.reason}</td>
                    <td class="status-${request.status.toLowerCase()}">${request.status}</td>
                    <td>
                        ${request.status === 'Pending' ? `
                            <div class="action-buttons">
                                <button class="edit-btn" onclick="approveLeaveRequest('${username}', '${request.date}')">Approve</button>
                                <button class="delete-btn" onclick="rejectLeaveRequest('${username}', '${request.date}')">Reject</button>
                            </div>
                        ` : ''}
                    </td>
                `;
                tbody.appendChild(row);
            });
        }
    });
}

function approveLeaveRequest(username, date) {
    const users = JSON.parse(localStorage.getItem('users')) || {};
    const user = users[username];
    
    if (user && user.leaveRequests) {
        const request = user.leaveRequests.find(r => r.date === date);
        if (request) {
            request.status = 'Approved';
            localStorage.setItem('users', JSON.stringify(users));
            loadLeaveRequests();
        }
    }
}

function rejectLeaveRequest(username, date) {
    const users = JSON.parse(localStorage.getItem('users')) || {};
    const user = users[username];
    
    if (user && user.leaveRequests) {
        const request = user.leaveRequests.find(r => r.date === date);
        if (request) {
            request.status = 'Rejected';
            localStorage.setItem('users', JSON.stringify(users));
            loadLeaveRequests();
        }
    }
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