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

    // Load announcements explicitly
    loadAnnouncements();
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

    // Course filter for lectures
    document.getElementById('lectureCourse').addEventListener('change', function (e) {
        const selectedCourse = e.target.value;
        loadLectures(selectedCourse);
    });

    // Course filter for assignments
    document.getElementById('assignmentCourse').addEventListener('change', function (e) {
        const selectedCourse = e.target.value;
        loadAssignments(selectedCourse);
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
    const courseSelects = [
        'scheduleCourse',
        'lectureCourse',
        'assignmentCourse',
        'attendanceCourse'
    ];

    // Update all course select dropdowns
    courseSelects.forEach(selectId => {
        const courseSelect = document.getElementById(selectId);
        if (courseSelect) {
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
    // Show the skill modal with details
    showSkillModal(skillType);

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

// Skill Modal Functions
function showSkillModal(skillType) {
    const skillData = getSkillData(skillType);

    // Update modal content
    document.getElementById('skillModalTitle').innerHTML = `<i class="${skillData.icon}"></i> ${skillData.title}`;
    document.getElementById('skillModalDescription').textContent = skillData.description;

    // Update features
    const featuresContainer = document.getElementById('skillFeatures');
    featuresContainer.innerHTML = '';

    skillData.features.forEach(feature => {
        const featureElement = document.createElement('div');
        featureElement.className = 'skill-feature';
        featureElement.innerHTML = `
            <i class="${feature.icon}"></i>
            <h4>${feature.title}</h4>
            <p>${feature.description}</p>
        `;
        featuresContainer.appendChild(featureElement);
    });

    // Show the modal
    document.getElementById('skillModalOverlay').classList.add('active');
}

function closeSkillModal() {
    document.getElementById('skillModalOverlay').classList.remove('active');
}

function getSkillData(skillType) {
    // Mock data for each skill type
    const skillsData = {
        freelancing: {
            title: 'Freelancing',
            icon: 'fas fa-globe',
            description: 'Learn how to build a successful freelancing career with Freelancing Society. Master the art of finding clients, managing projects, and growing your income as a freelancer.',
            features: [
                {
                    icon: 'fas fa-search',
                    title: 'Client Acquisition',
                    description: 'Learn strategies to find and attract high-quality clients'
                },
                {
                    icon: 'fas fa-dollar-sign',
                    title: 'Pricing Strategies',
                    description: 'Master the art of pricing your services for maximum profit'
                },
                {
                    icon: 'fas fa-tasks',
                    title: 'Project Management',
                    description: 'Efficiently manage multiple projects and deadlines'
                },
                {
                    icon: 'fas fa-chart-line',
                    title: 'Growth Strategies',
                    description: 'Scale your freelance business to new heights'
                }
            ]
        },
        graphicDesigning: {
            title: 'Graphic Designing',
            icon: 'fas fa-palette',
            description: 'Develop your graphic design skills with Freelancing Society. Learn industry-standard tools and techniques to create stunning visual content for various platforms.',
            features: [
                {
                    icon: 'fas fa-paint-brush',
                    title: 'Design Fundamentals',
                    description: 'Master color theory, typography, and composition'
                },
                {
                    icon: 'fas fa-laptop',
                    title: 'Software Mastery',
                    description: 'Become proficient in Adobe Photoshop, Illustrator, and more'
                },
                {
                    icon: 'fas fa-mobile-alt',
                    title: 'UI/UX Design',
                    description: 'Create user-friendly interfaces for web and mobile'
                },
                {
                    icon: 'fas fa-briefcase',
                    title: 'Portfolio Building',
                    description: 'Develop a compelling portfolio to attract clients'
                }
            ]
        },
        contentWriting: {
            title: 'Content Writing',
            icon: 'fas fa-pen-fancy',
            description: 'Enhance your content writing skills with Freelancing Society. Learn how to create engaging, SEO-friendly content that resonates with audiences and drives results.',
            features: [
                {
                    icon: 'fas fa-pencil-alt',
                    title: 'Writing Techniques',
                    description: 'Master various writing styles and formats'
                },
                {
                    icon: 'fas fa-search',
                    title: 'SEO Writing',
                    description: 'Create content optimized for search engines'
                },
                {
                    icon: 'fas fa-bullhorn',
                    title: 'Copywriting',
                    description: 'Write persuasive copy that converts readers into customers'
                },
                {
                    icon: 'fas fa-edit',
                    title: 'Editing Skills',
                    description: 'Polish your content to professional standards'
                }
            ]
        },
        webDevelopment: {
            title: 'Web Development',
            icon: 'fas fa-code',
            description: 'Build your web development expertise with Freelancing Society. Learn front-end and back-end technologies to create responsive, dynamic websites and web applications.',
            features: [
                {
                    icon: 'fas fa-html5',
                    title: 'Front-End Development',
                    description: 'Master HTML, CSS, and JavaScript'
                },
                {
                    icon: 'fas fa-database',
                    title: 'Back-End Development',
                    description: 'Learn server-side programming and databases'
                },
                {
                    icon: 'fas fa-mobile-alt',
                    title: 'Responsive Design',
                    description: 'Create websites that work on all devices'
                },
                {
                    icon: 'fas fa-cogs',
                    title: 'Web Frameworks',
                    description: 'Build with React, Angular, Node.js, and more'
                }
            ]
        }
    };

    return skillsData[skillType] || {
        title: 'Skill Information',
        icon: 'fas fa-info-circle',
        description: 'Information about this skill is not available at the moment.',
        features: []
    };
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
            title: lecture.title || 'Untitled Lecture',
            course: lecture.courseName || 'General',
            instructor: lecture.teacher || 'Unknown Instructor',
            date: lecture.uploadDate || new Date().toISOString(),
            fileType: lecture.fileType || 'Unknown Type',
            fileSize: lecture.fileSize || '0 KB',
            description: lecture.description || '',
            fileUrl: lecture.fileUrl || ''
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
    console.log('Downloading lecture:', lectureId);
    const lectures = JSON.parse(localStorage.getItem('lectures') || '[]');
    const lecture = lectures.find(l => String(l.id) === String(lectureId));

    if (!lecture) {
        console.error('Lecture not found:', lectureId);
        alert('Lecture not found. Please refresh the page and try again.');
        return;
    }

    if (!lecture.file) {
        console.error('No file attached to lecture:', lectureId);
        alert('No file attached to this lecture');
        return;
    }

    try {
        // Create a download link
        const link = document.createElement('a');

        // Check if it's a large file with a URL
        if (lecture.isLargeFile && lecture.fileUrl) {
            console.log('Using temporary URL for large file');
            link.href = lecture.fileUrl;
        } else {
            // Get the file data from localStorage
            const fileData = localStorage.getItem(`lecture_${lectureId}`);
            if (!fileData) {
                console.error('File data not found in localStorage for lecture:', lectureId);
                alert('File not found. It may have been removed or the browser was restarted.');
                return;
            }
            link.href = fileData;
        }

        link.download = lecture.file; // Use the original filename
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        showNotification('Downloading lecture: ' + lecture.title);
    } catch (error) {
        console.error('Error downloading lecture:', error);
        alert('Error downloading lecture. Please try again.');
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
                <span class="grade-value">Grade: ${assignment.grade}/100</span>
                ${assignment.gradedAt ? `<span class="graded-date">Graded on: ${formatDate(new Date(assignment.gradedAt))}</span>` : ''}
                <div class="feedback-container">
                    <h4>Feedback:</h4>
                    <p class="feedback">${assignment.feedback || 'No feedback provided'}</p>
                </div>
            </div>
        ` : ''}
        ${assignment.hasFile ? `
            <div class="assignment-file">
                <i class="fas fa-paperclip"></i>
                <span>${assignment.fileName} (${assignment.fileSize})</span>
                <button class="download-btn" onclick="downloadAssignment('${assignment.id}')">
                    <i class="fas fa-download"></i> Download
                </button>
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
    console.log('Submitting assignment:', assignmentId);

    const form = document.getElementById(`form-${assignmentId}`);
    const fileInput = document.getElementById(`file-${assignmentId}`);
    const file = fileInput.files[0];

    if (!file) {
        alert('Please select a file to submit');
        return;
    }

    // Show upload progress
    const submitBtn = form.querySelector('.submit-btn');
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Uploading...';
    submitBtn.disabled = true;

    // Get the assignments from localStorage
    const assignments = JSON.parse(localStorage.getItem('assignments') || '[]');
    console.log('All assignments:', assignments);

    const assignmentIndex = assignments.findIndex(a => String(a.id) === String(assignmentId));
    console.log('Assignment index:', assignmentIndex, 'for ID:', assignmentId);

    if (assignmentIndex === -1) {
        console.error('Assignment not found with ID:', assignmentId);
        alert('Assignment not found');
        submitBtn.innerHTML = '<i class="fas fa-paper-plane"></i> Submit Assignment';
        submitBtn.disabled = false;
        return;
    }

    const assignment = assignments[assignmentIndex];
    console.log('Found assignment:', assignment);

    // Create a unique submission ID
    const submissionId = Date.now().toString();

    // For smaller files, store in localStorage first
    const reader = new FileReader();

    reader.onload = function (e) {
        try {
            // Check file size - warn if over 5MB (localStorage limit)
            const MAX_SIZE = 5 * 1024 * 1024; // 5MB
            let fileUrl = '';
            let isLargeFile = false;
            let fileData = e.target.result;

            if (file.size > MAX_SIZE) {
                // For large files, create a temporary URL
                fileUrl = URL.createObjectURL(file);
                isLargeFile = true;
                console.log('Large file detected, using URL.createObjectURL');
            } else {
                // Save the file data to localStorage
                try {
                    localStorage.setItem(`submission_${submissionId}`, fileData);
                    console.log('File saved to localStorage');
                } catch (storageError) {
                    console.error('Error saving to localStorage:', storageError);
                    // If localStorage fails, use URL.createObjectURL as fallback
                    fileUrl = URL.createObjectURL(file);
                    isLargeFile = true;
                    console.log('Falling back to URL.createObjectURL due to localStorage error');
                }
            }

            // Create the submission object
            const studentUsername = sessionStorage.getItem('currentUsername');
            const submission = {
                id: submissionId,
                studentName: studentUsername,
                submissionDate: new Date().toISOString(),
                file: {
                    name: file.name,
                    type: file.type,
                    size: formatFileSize(file.size)
                },
                fileUrl: fileUrl,
                isLargeFile: isLargeFile
            };

            console.log('Created submission object:', submission);

            // Initialize submissions array if it doesn't exist
            if (!assignment.submissions) {
                assignment.submissions = [];
            }

            // Add the submission to the assignment
            assignment.submissions.push(submission);

            // Update the assignment in the assignments array
            assignments[assignmentIndex] = assignment;

            // Save the updated assignments back to localStorage
            localStorage.setItem('assignments', JSON.stringify(assignments));
            console.log('Updated assignments in localStorage');

            // Set a flag to indicate a new submission was made (for teacher dashboard)
            localStorage.setItem('new_submission_timestamp', Date.now().toString());
            localStorage.setItem('last_submitted_assignment', assignmentId);

            console.log('Assignment submitted successfully:', submission);
            console.log('Updated assignments:', assignments);

            // Show success message
            if (isLargeFile) {
                alert('Assignment submitted successfully! Note: This file is too large to store in browser. The download link will only work in this session.');
            } else {
                alert('Assignment submitted successfully!');
            }

            // Update the card to show "Submitted" status
            const card = form.closest('.assignment-card');
            if (card) {
                const statusDiv = card.querySelector('.status');
                if (statusDiv) {
                    statusDiv.className = 'status submitted';
                    statusDiv.textContent = 'Submitted';
                }

                // Remove the submission form
                form.remove();
            }

            // Reload assignments to refresh the UI
            loadAssignments();
        } catch (error) {
            console.error('Error in reader.onload:', error);
            alert('Error saving submission. Please try again.');
            submitBtn.innerHTML = '<i class="fas fa-paper-plane"></i> Submit Assignment';
            submitBtn.disabled = false;
        }
    };

    reader.onerror = function (error) {
        console.error('Error reading file:', error);
        alert('Error reading file. Please try again.');
        submitBtn.innerHTML = '<i class="fas fa-paper-plane"></i> Submit Assignment';
        submitBtn.disabled = false;
    };

    // Start reading the file
    try {
        reader.readAsDataURL(file);
    } catch (error) {
        console.error('Error starting file read:', error);
        alert('Error reading file. Please try again.');
        submitBtn.innerHTML = '<i class="fas fa-paper-plane"></i> Submit Assignment';
        submitBtn.disabled = false;
    }
}

function downloadAssignment(assignmentId) {
    console.log('Downloading assignment:', assignmentId);
    const assignments = JSON.parse(localStorage.getItem('assignments') || '[]');
    const assignment = assignments.find(a => String(a.id) === String(assignmentId));

    if (!assignment) {
        console.error('Assignment not found:', assignmentId);
        alert('Assignment not found. Please refresh the page and try again.');
        return;
    }

    if (!assignment.file) {
        console.error('No file attached to assignment:', assignmentId);
        alert('No file attached to this assignment');
        return;
    }

    try {
        // Check if it's a large file with a URL
        if (assignment.isLargeFile && assignment.fileUrl) {
            console.log('Using temporary URL for large file');
            const link = document.createElement('a');
            link.href = assignment.fileUrl;
            link.download = assignment.file.name;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } else {
            // Get the file data from localStorage
            const fileData = localStorage.getItem(`assignment_${assignmentId}`);
            if (!fileData) {
                console.error('File data not found in localStorage for assignment:', assignmentId);
                alert('File not found. It may have been removed or the browser was restarted.');
                return;
            }

            const link = document.createElement('a');
            link.href = fileData;
            link.download = assignment.file.name;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }

        showNotification('Downloading assignment: ' + assignment.title);
    } catch (error) {
        console.error('Error downloading assignment:', error);
        alert('Error downloading assignment. Please try again.');
    }
}

// Get assignments from localStorage
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

        // Determine status based on submission and grade
        let status = 'Pending';
        if (submission) {
            if (submission.status === 'Graded' || submission.grade) {
                status = 'Graded';
            } else {
                status = 'Submitted';
            }
        }

        return {
            id: assignment.id,
            title: assignment.title,
            course: assignment.courseName,
            instructor: assignment.teacher,
            dueDate: assignment.dueDate,
            description: assignment.description,
            status: status,
            grade: submission?.grade,
            feedback: submission?.feedback,
            submissionDate: submission?.submissionDate,
            gradedAt: submission?.gradedAt,
            hasFile: !!assignment.file,
            fileName: assignment.file?.name,
            fileSize: assignment.file?.size
        };
    });
}

// Helper Functions
function showNotification(message) {
    // Check if notificationPopup exists
    if (!notificationPopup) {
        console.error('Notification popup element not found');
        alert(message); // Fallback to alert if popup not found
        return;
    }

    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;

    notificationPopup.appendChild(notification);
    notificationPopup.classList.add('show');

    setTimeout(() => {
        notification.remove();
        if (notificationPopup && notificationPopup.children.length === 0) {
            notificationPopup.classList.remove('show');
        }
    }, 5000);
}

function toggleNotifications() {
    if (notificationPopup) {
        notificationPopup.classList.toggle('show');
    }
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
    // Return mock data based on skill type
    const mockLectures = {
        freelancing: [
            {
                id: 'fl-1',
                title: 'Getting Started with Freelancing',
                course: 'Freelancing',
                instructor: 'Saf Khan Khattak',
                date: new Date(2024, 1, 15),
                fileType: 'PDF',
                fileSize: '2.5 MB',
                description: 'Introduction to freelancing platforms and creating your profile.'
            },
            {
                id: 'fl-2',
                title: 'Building Your Freelance Portfolio',
                course: 'Freelancing',
                instructor: 'Saf Khan Khattak',
                date: new Date(2024, 1, 22),
                fileType: 'PDF',
                fileSize: '3.1 MB',
                description: 'Learn how to showcase your work effectively to attract clients.'
            }
        ],
        graphicDesigning: [
            {
                id: 'gd-1',
                title: 'Fundamentals of Graphic Design',
                course: 'Graphic Designing',
                instructor: 'Farah Shammen',
                date: new Date(2024, 1, 10),
                fileType: 'PDF',
                fileSize: '4.2 MB',
                description: 'Introduction to design principles and color theory.'
            },
            {
                id: 'gd-2',
                title: 'Adobe Photoshop Essentials',
                course: 'Graphic Designing',
                instructor: 'Farah Shammen',
                date: new Date(2024, 1, 17),
                fileType: 'Video',
                fileSize: '125 MB',
                description: 'Getting started with Adobe Photoshop tools and techniques.'
            }
        ],
        contentWriting: [
            {
                id: 'cw-1',
                title: 'Content Writing Basics',
                course: 'Content Writing',
                instructor: 'Shehla Javed',
                date: new Date(2024, 1, 12),
                fileType: 'PDF',
                fileSize: '1.8 MB',
                description: 'Introduction to different types of content writing.'
            },
            {
                id: 'cw-2',
                title: 'SEO Writing Techniques',
                course: 'Content Writing',
                instructor: 'Shehla Javed',
                date: new Date(2024, 1, 19),
                fileType: 'PDF',
                fileSize: '2.3 MB',
                description: 'Learn how to optimize your content for search engines.'
            }
        ],
        webDevelopment: [
            {
                id: 'wd-1',
                title: 'HTML & CSS Fundamentals',
                course: 'Web Development',
                instructor: 'Arif Jan',
                date: new Date(2024, 1, 14),
                fileType: 'PDF',
                fileSize: '3.5 MB',
                description: 'Introduction to HTML structure and CSS styling.'
            },
            {
                id: 'wd-2',
                title: 'JavaScript Basics',
                course: 'Web Development',
                instructor: 'Arif Jan',
                date: new Date(2024, 1, 21),
                fileType: 'Video',
                fileSize: '150 MB',
                description: 'Getting started with JavaScript programming for the web.'
            }
        ]
    };

    return mockLectures[skillType] || [];
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
    const scheduleGrid = document.getElementById('scheduleGrid');
    scheduleGrid.innerHTML = '';

    // Filter meetings by course if selected
    let filteredMeetings = meetings;
    if (selectedCourse) {
        filteredMeetings = meetings.filter(meeting => meeting.courseName === selectedCourse);
    }

    if (filteredMeetings.length === 0) {
        scheduleGrid.innerHTML = '<p class="no-data">No upcoming meetings</p>';
        return;
    }

    filteredMeetings.forEach(meeting => {
        const meetingElement = document.createElement('div');
        meetingElement.className = 'meeting-card';
        meetingElement.innerHTML = `
            <div class="meeting-header">
                <h4>${meeting.title || 'Untitled Meeting'}</h4>
                <span class="meeting-date">${formatDate(meeting.date || new Date())}</span>
            </div>
            <div class="meeting-details">
                <p><strong>Course:</strong> ${meeting.courseName || 'General'}</p>
                <p><strong>Time:</strong> ${meeting.time || 'TBA'}</p>
                <p><strong>Duration:</strong> ${meeting.duration || '60'} minutes</p>
                ${meeting.link ?
                `<a href="${meeting.link}" target="_blank" class="meeting-link">
                        <i class="fas fa-video"></i> Join Meeting
                    </a>` :
                '<p class="no-link">Meeting link not available</p>'
            }
            </div>
        `;
        scheduleGrid.appendChild(meetingElement);
    });
}

// Load and display announcements
function loadAnnouncements(selectedCourse = '') {
    const announcements = JSON.parse(localStorage.getItem('announcements') || '[]');
    const announcementsList = document.getElementById('announcementsList');

    if (!announcementsList) {
        console.error('Announcements list element not found');
        return;
    }

    announcementsList.innerHTML = '';

    // Filter announcements by course if selected
    let filteredAnnouncements = announcements;
    if (selectedCourse) {
        filteredAnnouncements = announcements.filter(announcement => announcement.course === selectedCourse);
    }

    if (filteredAnnouncements.length === 0) {
        announcementsList.innerHTML = '<p class="no-data">No announcements available</p>';
        return;
    }

    filteredAnnouncements.forEach(announcement => {
        const announcementElement = document.createElement('div');
        announcementElement.className = `announcement-card ${announcement.type || 'general'}`;
        announcementElement.innerHTML = `
            <div class="announcement-header">
                <h4>${announcement.title || 'Untitled Announcement'}</h4>
                <span class="announcement-date">${formatDate(announcement.timestamp || new Date())}</span>
            </div>
            <div class="announcement-details">
                <p><strong>Course:</strong> ${announcement.courseName || 'General'}</p>
                <p>${announcement.content || announcement.message || ''}</p>
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

// Helper function to format file size
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
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
        assignment.status === 'Pending'
    ).length;
    document.getElementById('pendingAssignmentsCount').textContent = pendingAssignments;

    // Overall Progress (based on completed assignments)
    const totalAssignments = assignments.length;
    const completedAssignments = assignments.filter(assignment =>
        assignment.status === 'Graded'
    ).length;
    const progress = totalAssignments > 0 ? Math.round((completedAssignments / totalAssignments) * 100) : 0;
    document.getElementById('overallProgress').textContent = `${progress}%`;

    // Attendance Stats
    const totalAttendance = attendanceRecords.length;
    const presentCount = attendanceRecords.filter(record => record.status === 'Present').length;
    const attendancePercentage = totalAttendance > 0 ? Math.round((presentCount / totalAttendance) * 100) : 0;

    // Update attendance percentage if element exists
    const attendanceElement = document.getElementById('attendancePercentage');
    if (attendanceElement) {
        attendanceElement.textContent = `${attendancePercentage}%`;
    }

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

// Get lectures from localStorage
function getLectures() {
    const lectures = JSON.parse(localStorage.getItem('lectures') || '[]');
    return lectures;
}

// Get recent lectures
function getRecentLectures() {
    const lectures = getLectures();
    return lectures.map(lecture => ({
        date: lecture.uploadDate,
        title: `New Lecture: ${lecture.title}`,
        description: `Course: ${lecture.courseName}`,
        icon: 'fas fa-book'
    }));
}

// Get attendance records from localStorage
function getAttendanceRecords() {
    // Return empty array for now
    return [];
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