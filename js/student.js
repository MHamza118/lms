// Student Dashboard JavaScript

// DOM Elements
const studentName = document.getElementById('studentName');
const studentNameBanner = document.getElementById('studentNameBanner');
const notificationBell = document.getElementById('notificationBell');
const notificationPopup = document.getElementById('notificationPopup');
const upcomingClass = document.getElementById('upcomingClass');
const scheduleGrid = document.getElementById('scheduleGrid');
const skillLecturesList = document.getElementById('skillLecturesList');
const attendanceTableBody = document.getElementById('attendanceTableBody');
const lecturesGrid = document.getElementById('lecturesGrid');
const assignmentsGrid = document.getElementById('assignmentsGrid');

// Initialize the dashboard
document.addEventListener('DOMContentLoaded', function () {
    const userType = sessionStorage.getItem('currentUserType');
    if (userType !== 'Student') {
        window.location.href = '../index.html';
        return;
    }

    // Initialize event listeners
    initializeEventListeners();

    // Load initial data
    loadStudentData();
});

// Initialize all event listeners
function initializeEventListeners() {
    // Sidebar navigation
    document.querySelectorAll('.sidebar-nav a').forEach(link => {
        link.addEventListener('click', function (e) {
            e.preventDefault();
            const sectionId = this.parentElement.getAttribute('data-section');
            if (sectionId) {
                showSection(sectionId);
            }
        });
    });

    // Course filter for schedule
    document.getElementById('scheduleCourse').addEventListener('change', function (e) {
        const selectedCourse = e.target.value;
        loadMeetings(selectedCourse);
        loadAnnouncements(selectedCourse);
    });
}

// Load student's data
function loadStudentData() {
    const username = sessionStorage.getItem('currentUsername');

    // Set student name
    document.getElementById('studentName').textContent = username;
    document.getElementById('studentNameBanner').textContent = username;

    // Load courses
    loadCourses();

    // Load initial sections
    loadMeetings();
    loadAnnouncements();
    loadAssignments();
    loadLectures();

    // Load quick stats and recent activities
    loadQuickStats();
    loadRecentActivities();
}

// Load courses from localStorage
function loadCourses() {
    // Initialize default courses if not present
    if (!localStorage.getItem('courses')) {
        const defaultCourses = [
            { id: 1, name: 'Web Development', description: 'Learn web development', teacher: 'Arif Jan' },
            { id: 2, name: 'Graphic Designing', description: 'Learn graphic design', teacher: 'Farah Shammen' },
            { id: 3, name: 'Content Writing', description: 'Learn content writing', teacher: 'Shehla Javed' },
            { id: 4, name: 'YouTube Automation', description: 'Learn YouTube automation', teacher: 'Saf Khan Khattak' },
            { id: 5, name: 'E-commerce', description: 'Learn e-commerce', teacher: 'Yasir Sharrar' }
        ];
        localStorage.setItem('courses', JSON.stringify(defaultCourses));
    }

    const courses = JSON.parse(localStorage.getItem('courses'));
    const courseSelect = document.getElementById('scheduleCourse');

    // Clear existing options except the first one
    while (courseSelect.options.length > 1) {
        courseSelect.remove(1);
    }

    // Add courses from localStorage
    courses.forEach(course => {
        const option = document.createElement('option');
        option.value = course.name;
        option.textContent = course.name;
        courseSelect.appendChild(option);
    });
}

// Show section
function showSection(sectionId) {
    // Update active state in sidebar
    document.querySelectorAll('.sidebar-nav li').forEach(li => {
        li.classList.remove('active');
    });
    document.querySelector(`[data-section="${sectionId}"]`).classList.add('active');

    // Show selected section
    document.querySelectorAll('.section-container').forEach(section => {
        section.classList.remove('active');
    });
    document.getElementById(sectionId).classList.add('active');

    // Load section data if needed
    if (sectionId === 'schedule') {
        loadMeetings();
        loadAnnouncements();
    }
}

// Schedule Functions
function initializeSchedule() {
    loadSchedule();
    startScheduleNotifications();
}

function loadSchedule(course = '') {
    scheduleGrid.innerHTML = '';
    const schedules = getScheduledClasses(course);

    schedules.forEach(schedule => {
        const card = createScheduleCard(schedule);
        scheduleGrid.appendChild(card);
    });
}

function createScheduleCard(schedule) {
    const card = document.createElement('div');
    card.className = 'schedule-card';

    const startTime = new Date(schedule.startTime);
    const endTime = new Date(schedule.endTime);

    card.innerHTML = `
        <h3>${schedule.course}</h3>
        <div class="time">
            ${formatTime(startTime)} - ${formatTime(endTime)}
        </div>
        <p class="schedule-date">${formatDate(startTime)}</p>
        <p class="instructor">Instructor: ${schedule.instructor}</p>
        ${schedule.meetingLink ?
            `<a href="${schedule.meetingLink}" class="meeting-link" target="_blank">
                <i class="fas fa-video"></i> Join Meeting
            </a>` :
            '<p class="no-link">Meeting link not available</p>'
        }
    `;
    return card;
}

function startScheduleNotifications() {
    setInterval(() => {
        const now = new Date();
        const schedules = getScheduledClasses();

        schedules.forEach(schedule => {
            const startTime = new Date(schedule.startTime);
            const timeDiff = (startTime - now) / (1000 * 60); // difference in minutes

            if (timeDiff === 30) {
                showNotification(`Your ${schedule.course} class will begin at ${formatTime(startTime)}`);
                sendEmailNotification(schedule);
            } else if (timeDiff === 0) {
                showNotification(`Your ${schedule.course} class has started!`);
            }
        });
    }, 60000); // Check every minute
}

function sendEmailNotification(schedule) {
    // This would be an API call to your backend
    const emailData = {
        to: 'xyz@example.com',
        subject: `Class Reminder: ${schedule.course}`,
        body: `
            Your class ${schedule.course} will begin at ${formatTime(new Date(schedule.startTime))}.
            Join using this link: ${schedule.meetingLink}
        `
    };
    // Send email API call would go here
    console.log('Email notification sent:', emailData);
}

// Skill Development Functions
function showSkillLectures(skillType) {
    // Clear previous lectures
    skillLecturesList.innerHTML = '';

    // Fetch and display lectures for the selected skill
    // This would typically be an API call
    const lectures = getSkillLectures(skillType);

    lectures.forEach(lecture => {
        const lectureCard = createLectureCard(lecture);
        skillLecturesList.appendChild(lectureCard);
    });
}

// Class Schedule Functions
function checkUpcomingClasses() {
    // Check for upcoming classes every minute
    setInterval(() => {
        const now = new Date();
        const upcomingClasses = getUpcomingClasses(); // This would be an API call

        upcomingClasses.forEach(class_ => {
            const classTime = new Date(class_.time);
            const timeDiff = (classTime - now) / (1000 * 60); // difference in minutes

            if (timeDiff === 30) {
                showNotification(`Your ${class_.course} class will begin at ${formatTime(classTime)}`);
            } else if (timeDiff === 0) {
                showNotification(`Your ${class_.course} class has started!`);
            }
        });
    }, 60000); // Check every minute
}

// Attendance Functions
function loadAttendance(course = '', month = '') {
    attendanceTableBody.innerHTML = '';
    const records = getAttendanceRecords(course, month);
    updateAttendanceStats(records);

    records.forEach(record => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${formatDate(record.date)}</td>
            <td>${record.course}</td>
            <td><span class="status-badge ${record.status.toLowerCase()}">${record.status}</span></td>
            <td>${record.markedBy}</td>
            <td>${formatTime(record.time)}</td>
        `;
        attendanceTableBody.appendChild(row);
    });
}

function updateAttendanceStats(records) {
    const total = records.length;
    const present = records.filter(r => r.status === 'Present').length;
    const absent = records.filter(r => r.status === 'Absent').length;
    const leave = records.filter(r => r.status === 'Leave').length;
    const percentage = total > 0 ? Math.round((present / total) * 100) : 0;

    document.getElementById('presentCount').textContent = present;
    document.getElementById('absentCount').textContent = absent;
    document.getElementById('leaveCount').textContent = leave;
    document.getElementById('attendancePercentage').textContent = `${percentage}%`;
}

// Mock data function for attendance
function getAttendanceRecords(course = '', month = '') {
    const mockRecords = [
        {
            date: new Date(2024, 2, 1),
            course: 'Web Development',
            status: 'Present',
            markedBy: 'Arif Jan',
            time: new Date(2024, 2, 1, 9, 0)
        },
        {
            date: new Date(2024, 2, 1),
            course: 'Graphic Designing',
            status: 'Present',
            markedBy: 'Farah Shammen',
            time: new Date(2024, 2, 1, 11, 0)
        },
        {
            date: new Date(2024, 2, 1),
            course: 'Content Writing',
            status: 'Absent',
            markedBy: 'Shehla Javed',
            time: new Date(2024, 2, 1, 14, 0)
        },
        {
            date: new Date(2024, 2, 1),
            course: 'YouTube Automation',
            status: 'Leave',
            markedBy: 'Saf Khan Khattak',
            time: new Date(2024, 2, 1, 16, 0)
        },
        {
            date: new Date(2024, 2, 2),
            course: 'E-commerce',
            status: 'Present',
            markedBy: 'Yasir Sharrar',
            time: new Date(2024, 2, 2, 9, 0)
        }
    ];

    let filteredRecords = [...mockRecords];

    if (course) {
        filteredRecords = filteredRecords.filter(record => record.course === course);
    }

    if (month) {
        filteredRecords = filteredRecords.filter(record => record.date.getMonth() + 1 === parseInt(month));
    }

    return filteredRecords;
}

// Lectures Functions
function loadLectures(course = '') {
    lecturesGrid.innerHTML = '';
    const lectures = getLectures(course);

    lectures.forEach(lecture => {
        const lectureCard = createLectureCard(lecture);
        lecturesGrid.appendChild(lectureCard);
    });
}

function getLectures(course = '') {
    const lectures = JSON.parse(localStorage.getItem('lectures') || '[]');

    // Filter lectures by course if specified
    let filteredLectures = lectures;
    if (course) {
        filteredLectures = lectures.filter(lecture => lecture.courseName === course);
    }

    // Format lecture data for display
    return filteredLectures.map(lecture => {
        return {
            id: lecture.id,
            title: lecture.title,
            course: lecture.courseName,
            instructor: lecture.teacher,
            date: lecture.uploadDate,
            fileType: lecture.fileType,
            fileSize: lecture.fileSize,
            description: lecture.description
        };
    });
}

function createLectureCard(lecture) {
    const card = document.createElement('div');
    card.className = 'lecture-card';
    card.innerHTML = `
        <h3>${lecture.title}</h3>
        <div class="meta">
            <p><i class="fas fa-book"></i> ${lecture.course}</p>
            <p><i class="fas fa-user"></i> ${lecture.instructor}</p>
            <p><i class="fas fa-calendar"></i> ${formatDate(lecture.date)}</p>
            <p><i class="fas fa-file"></i> ${lecture.fileType}</p>
            <p><i class="fas fa-weight-hanging"></i> ${lecture.fileSize}</p>
        </div>
        ${lecture.description ? `<p class="description">${lecture.description}</p>` : ''}
        <button class="download-btn" onclick="downloadLecture('${lecture.id}')">
            <i class="fas fa-download"></i> Download Lecture
        </button>
    `;
    return card;
}

function downloadLecture(lectureId) {
    const lectures = JSON.parse(localStorage.getItem('lectures') || '[]');
    const lecture = lectures.find(l => l.id === lectureId);

    if (lecture) {
        // In a real application, this would download the actual file
        // For now, we'll just show a message
        alert(`Downloading lecture: ${lecture.title}`);
    }
}

// Assignments Functions
function loadAssignments(course = '') {
    const assignmentsGrid = document.getElementById('assignmentsGrid');
    assignmentsGrid.innerHTML = '';

    const assignments = getAssignments(course);

    if (assignments.length === 0) {
        assignmentsGrid.innerHTML = '<div class="empty-state"><p>No assignments available</p></div>';
        return;
    }

    assignments.forEach(assignment => {
        const card = createAssignmentCard(assignment);
        assignmentsGrid.appendChild(card);
    });
}

function createAssignmentCard(assignment) {
    const card = document.createElement('div');
    card.className = 'assignment-card';

    const dueDate = new Date(assignment.dueDate);
    const now = new Date();
    const isOverdue = dueDate < now && assignment.status === 'Pending';

    card.innerHTML = `
        <h3>${assignment.title}</h3>
        <div class="meta">
            <p><i class="fas fa-book"></i> ${assignment.course}</p>
            <p><i class="fas fa-user"></i> ${assignment.instructor}</p>
            <p class="due-date ${isOverdue ? 'overdue' : ''}">
                <i class="fas fa-clock"></i> Due: ${formatDate(dueDate)}
            </p>
        </div>
        ${assignment.description ? `<p class="description">${assignment.description}</p>` : ''}
        <div class="status ${assignment.status.toLowerCase()}">${assignment.status}</div>
        ${assignment.status === 'Graded' ? `
            <div class="grade">
                <span>Grade: ${assignment.grade}/100</span>
                <p class="feedback">${assignment.feedback || 'No feedback provided'}</p>
                </div>
        ` : ''}
        ${assignment.status === 'Pending' ? `
            <form class="submission-form" id="form-${assignment.id}" onsubmit="submitAssignment(event, '${assignment.id}')">
                <div class="file-upload">
                    <input type="file" id="file-${assignment.id}" required accept=".pdf,.doc,.docx,.zip" />
                    <label for="file-${assignment.id}">
                        <i class="fas fa-cloud-upload-alt"></i> Choose File
                    </label>
                </div>
                <button type="submit" class="submit-btn">
                    <i class="fas fa-paper-plane"></i> Submit Assignment
                </button>
            </form>
        ` : ''}
    `;
    return card;
}

function submitAssignment(event, assignmentId) {
    event.preventDefault();
    const form = document.getElementById(`form-${assignmentId}`);
    const fileInput = document.getElementById(`file-${assignmentId}`);
    const file = fileInput.files[0];

    if (!file) {
        alert('Please select a file to submit');
        return;
    }

    // Here you would typically upload the file to your server
    // For now, we'll just simulate the upload
    const formData = new FormData();
    formData.append('file', file);
    formData.append('assignmentId', assignmentId);

    // Simulate upload progress
    const submitBtn = form.querySelector('.submit-btn');
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Uploading...';
    submitBtn.disabled = true;

    setTimeout(() => {
        // Simulate successful upload
        alert('Assignment submitted successfully!');
        loadAssignments(); // Reload assignments to show updated status
    }, 2000);
}

// Mock data functions
function getAssignments(course = '') {
    const assignments = JSON.parse(localStorage.getItem('assignments') || '[]');
    const studentUsername = sessionStorage.getItem('currentUsername');

    // Filter assignments by course if specified
    let filteredAssignments = assignments;
    if (course) {
        filteredAssignments = assignments.filter(assignment => assignment.courseName === course);
    }

    // Add submission status for each assignment
    return filteredAssignments.map(assignment => {
        const submission = assignment.submissions?.find(sub => sub.studentName === studentUsername);
        return {
            id: assignment.id,
            title: assignment.title,
            course: assignment.courseName,
            instructor: assignment.teacher,
            dueDate: assignment.dueDate,
            description: assignment.description,
            status: submission ? 'Submitted' : 'Pending',
            grade: submission?.grade,
            feedback: submission?.feedback
        };
    });
}

// Helper Functions
function showNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;

    notificationPopup.appendChild(notification);
    notificationPopup.classList.add('show');

    setTimeout(() => {
        notification.remove();
        if (notificationPopup.children.length === 0) {
            notificationPopup.classList.remove('show');
        }
    }, 5000);
}

function toggleNotifications() {
    notificationPopup.classList.toggle('show');
}

function formatDate(date) {
    return new Date(date).toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

function formatTime(date) {
    return new Date(date).toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit'
    });
}

// Mock data functions (replace with actual API calls)
function getSkillLectures(skillType) {
    // Return mock data
    return [];
}

function getUpcomingClasses() {
    // Return mock data
    return [];
}

function getScheduledClasses(course = '') {
    // This would be replaced with an actual API call
    const mockSchedules = [
        {
            course: 'Web Development',
            startTime: new Date(new Date().getTime() + 30 * 60000), // 30 minutes from now
            endTime: new Date(new Date().getTime() + 90 * 60000),
            instructor: 'Arif Jan',
            meetingLink: 'https://meet.example.com/web-dev'
        },
        {
            course: 'Graphic Designing',
            startTime: new Date(new Date().getTime() + 120 * 60000), // 2 hours from now
            endTime: new Date(new Date().getTime() + 180 * 60000),
            instructor: 'Farah Shammen',
            meetingLink: 'https://meet.example.com/graphic-design'
        },
        {
            course: 'Content Writing',
            startTime: new Date(new Date().getTime() + 180 * 60000), // 3 hours from now
            endTime: new Date(new Date().getTime() + 240 * 60000),
            instructor: 'Shehla Javed',
            meetingLink: 'https://meet.example.com/content-writing'
        },
        {
            course: 'YouTube Automation',
            startTime: new Date(new Date().getTime() + 240 * 60000), // 4 hours from now
            endTime: new Date(new Date().getTime() + 300 * 60000),
            instructor: 'Saf Khan Khattak',
            meetingLink: 'https://meet.example.com/youtube'
        },
        {
            course: 'E-commerce',
            startTime: new Date(new Date().getTime() + 300 * 60000), // 5 hours from now
            endTime: new Date(new Date().getTime() + 360 * 60000),
            instructor: 'Yasir Sharrar',
            meetingLink: 'https://meet.example.com/ecommerce'
        }
    ];

    if (course) {
        return mockSchedules.filter(schedule => schedule.course === course);
    }
    return mockSchedules;
}

// Load schedule data (meetings and announcements)
function loadScheduleData() {
    loadMeetings();
    loadAnnouncements();
}

// Load and display meetings
function loadMeetings(selectedCourse = '') {
    const meetings = JSON.parse(localStorage.getItem('meetings') || '[]');
    const meetingsList = document.getElementById('meetingsList');
    meetingsList.innerHTML = '';

    // Filter meetings by course if selected
    let filteredMeetings = meetings;
    if (selectedCourse) {
        filteredMeetings = meetings.filter(meeting => {
            const course = getCourseById(meeting.courseId);
            return course && course.name === selectedCourse;
        });
    }

    if (filteredMeetings.length === 0) {
        meetingsList.innerHTML = '<p class="no-data">No upcoming meetings</p>';
        return;
    }

    filteredMeetings.forEach(meeting => {
        const course = getCourseById(meeting.courseId);
        const meetingElement = document.createElement('div');
        meetingElement.className = 'meeting-card';
        meetingElement.innerHTML = `
            <div class="meeting-header">
                <h4>${meeting.title}</h4>
                <span class="meeting-date">${formatDate(meeting.date)}</span>
            </div>
            <div class="meeting-details">
                <p><strong>Course:</strong> ${course ? course.name : 'Unknown Course'}</p>
                <p><strong>Time:</strong> ${meeting.time}</p>
                <p><strong>Duration:</strong> ${meeting.duration} minutes</p>
                ${meeting.link ?
                `<a href="${meeting.link}" target="_blank" class="meeting-link">
                        <i class="fas fa-video"></i> Join Meeting
                    </a>` :
                '<p class="no-link">Meeting link not available</p>'
            }
            </div>
        `;
        meetingsList.appendChild(meetingElement);
    });
}

// Load and display announcements
function loadAnnouncements(selectedCourse = '') {
    const announcements = JSON.parse(localStorage.getItem('announcements') || '[]');
    const announcementsList = document.getElementById('announcementsList');
    announcementsList.innerHTML = '';

    // Filter announcements by course if selected
    let filteredAnnouncements = announcements;
    if (selectedCourse) {
        filteredAnnouncements = announcements.filter(announcement => {
            const course = getCourseById(announcement.courseId);
            return course && course.name === selectedCourse;
        });
    }

    if (filteredAnnouncements.length === 0) {
        announcementsList.innerHTML = '<p class="no-data">No announcements</p>';
        return;
    }

    filteredAnnouncements.forEach(announcement => {
        const course = getCourseById(announcement.courseId);
        const announcementElement = document.createElement('div');
        announcementElement.className = 'announcement-card';
        announcementElement.innerHTML = `
            <div class="announcement-header">
                <h4>${announcement.title}</h4>
                <span class="announcement-date">${formatDate(announcement.date)}</span>
            </div>
            <div class="announcement-details">
                <p><strong>Course:</strong> ${course ? course.name : 'Unknown Course'}</p>
                <p>${announcement.content}</p>
            </div>
        `;
        announcementsList.appendChild(announcementElement);
    });
}

// Helper function to get course by ID
function getCourseById(courseId) {
    const courses = JSON.parse(localStorage.getItem('courses') || '[]');
    return courses.find(course => course.id === courseId);
}

// Helper function to format date
function formatDate(dateString) {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
}

// Filter schedule data by course
document.getElementById('scheduleCourse').addEventListener('change', function (e) {
    const selectedCourse = e.target.value;
    loadMeetings(selectedCourse);
    loadAnnouncements(selectedCourse);
});

// Helper function to filter data by course
function filterByCourse(data, course) {
    if (!course) return data;
    return data.filter(item => item.course === course);
}

// Logout function
function logout() {
    localStorage.removeItem('currentUser');
    window.location.href = '../index.html';
}

// Load quick stats
function loadQuickStats() {
    const courses = JSON.parse(localStorage.getItem('courses') || '[]');
    const assignments = getAssignments();
    const attendanceRecords = getAttendanceRecords();
    
    // Active Courses Count
    document.getElementById('activeCoursesCount').textContent = courses.length;
    
    // Pending Assignments Count
    const pendingAssignments = assignments.filter(assignment => 
        !assignment.submission || assignment.submission.status === 'Pending'
    ).length;
    document.getElementById('pendingAssignmentsCount').textContent = pendingAssignments;
    
    // Overall Progress (based on completed assignments)
    const totalAssignments = assignments.length;
    const completedAssignments = assignments.filter(assignment => 
        assignment.submission && assignment.submission.status === 'Graded'
    ).length;
    const progress = totalAssignments > 0 ? Math.round((completedAssignments / totalAssignments) * 100) : 0;
    document.getElementById('overallProgress').textContent = `${progress}%`;
    
    // Upcoming Classes Count
    const upcomingClasses = getUpcomingClasses();
    document.getElementById('upcomingClassesCount').textContent = upcomingClasses.length;
}

// Load recent activities
function loadRecentActivities() {
    const activitiesList = document.getElementById('activitiesList');
    activitiesList.innerHTML = '';

    // Get recent activities from various sources
    const activities = [
        ...getRecentAssignments(),
        ...getRecentLectures(),
        ...getRecentAttendance()
    ];

    // Sort activities by date (most recent first)
    activities.sort((a, b) => new Date(b.date) - new Date(a.date));

    // Display only the 5 most recent activities
    activities.slice(0, 5).forEach(activity => {
        const activityItem = document.createElement('div');
        activityItem.className = 'activity-item';
        
        activityItem.innerHTML = `
            <div class="activity-icon">
                <i class="${activity.icon}"></i>
            </div>
            <div class="activity-details">
                <h4>${activity.title}</h4>
                <p>${activity.description}</p>
            </div>
            <div class="activity-time">${formatTime(new Date(activity.date))}</div>
        `;
        
        activitiesList.appendChild(activityItem);
    });
}

// Get recent assignments
function getRecentAssignments() {
    const assignments = getAssignments();
    return assignments.map(assignment => ({
        date: assignment.dueDate,
        title: `New Assignment: ${assignment.title}`,
        description: `Due: ${formatDate(new Date(assignment.dueDate))}`,
        icon: 'fas fa-tasks'
    }));
}

// Get recent lectures
function getRecentLectures() {
    const lectures = getLectures();
    return lectures.map(lecture => ({
        date: lecture.uploadDate,
        title: `New Lecture: ${lecture.title}`,
        description: `Course: ${lecture.course}`,
        icon: 'fas fa-book'
    }));
}

// Get recent attendance records
function getRecentAttendance() {
    const records = getAttendanceRecords();
    return records.map(record => ({
        date: record.date,
        title: `Attendance Marked: ${record.status}`,
        description: `Course: ${record.course}`,
        icon: record.status === 'Present' ? 'fas fa-check-circle' : 
              record.status === 'Absent' ? 'fas fa-times-circle' : 'fas fa-calendar-minus'
    }));
}