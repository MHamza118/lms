// Check if user is logged in as a teacher
document.addEventListener('DOMContentLoaded', function () {
    const userType = sessionStorage.getItem('currentUserType');
    if (userType !== 'ClassTeacher') {
        window.location.href = '../index.html';
        return;
    }

    // Initialize event listeners
    initializeEventListeners();

    // Load initial data
    loadTeacherData();
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

    // Attendance form
    document.getElementById('attendanceCourse').addEventListener('change', loadAttendanceList);
    document.getElementById('attendanceDate').addEventListener('change', loadAttendanceList);
    document.getElementById('saveAttendance').addEventListener('click', saveAttendance);

    // Assignment form
    document.getElementById('assignmentForm').addEventListener('submit', handleAssignmentSubmit);

    // Lecture form
    document.getElementById('lectureForm').addEventListener('submit', handleLectureSubmit);

    // Announcement form
    document.getElementById('announcementForm').addEventListener('submit', handleAnnouncementSubmit);

    // Meeting form
    document.getElementById('meetingForm').addEventListener('submit', handleMeetingSubmit);
}

// Load teacher's data
function loadTeacherData() {
    const username = sessionStorage.getItem('currentUsername');
    const courses = JSON.parse(localStorage.getItem('courses') || '[]');
    const teacherCourses = courses.filter(course => course.teacher === username);

    // Set teacher name
    document.getElementById('teacherName').textContent = username;
    document.getElementById('teacherNameBanner').textContent = username;

    // Populate course selects
    populateCourseSelects(teacherCourses);

    // Load initial sections
    loadAttendanceList();
    loadAssignmentsList();
    loadLecturesList();
    loadAnnouncementsList();
    loadMeetingsList();

    // Update dashboard stats
    updateDashboardStats();

    // Set up auto-refresh for assignments (check every 5 seconds)
    setInterval(() => {
        // Check if there's a new submission
        const lastSubmissionTime = localStorage.getItem('new_submission_timestamp');
        const lastCheckedTime = sessionStorage.getItem('last_checked_submissions') || '0';

        if (lastSubmissionTime && lastSubmissionTime > lastCheckedTime) {
            console.log('New submission detected, refreshing assignments list');
            loadAssignmentsList();

            // Update the last checked time
            sessionStorage.setItem('last_checked_submissions', Date.now().toString());

            // Show notification about new submission
            const lastSubmittedAssignmentId = localStorage.getItem('last_submitted_assignment');
            if (lastSubmittedAssignmentId) {
                const assignments = JSON.parse(localStorage.getItem('assignments') || '[]');
                const assignment = assignments.find(a => String(a.id) === String(lastSubmittedAssignmentId));
                if (assignment) {
                    const latestSubmission = assignment.submissions[assignment.submissions.length - 1];
                    if (latestSubmission) {
                        showSuccessMessage(`New submission received from ${latestSubmission.studentName} for "${assignment.title}"`);
                    }
                }
            }
        }

        // Also refresh if the assignments section is active
        const activeSection = document.querySelector('.section-container.active');
        if (activeSection && activeSection.id === 'assignments') {
            loadAssignmentsList();
        }
    }, 5000);
}

// Populate all course select elements
function populateCourseSelects(courses) {
    const courseSelects = [
        'attendanceCourse',
        'lectureCourse',
        'assignmentCourse',
        'announcementCourse',
        'meetingCourse',
        'assignmentFilter',
        'announcementFilter',
        'meetingFilter'
    ];

    // Default courses if none exist
    if (!courses || courses.length === 0) {
        courses = [
            { id: 'web-dev', name: 'Web Development' },
            { id: 'graphic-design', name: 'Graphic Designing' },
            { id: 'content-writing', name: 'Content Writing' },
            { id: 'youtube-auto', name: 'YouTube Automation' },
            { id: 'ecommerce', name: 'E-commerce' }
        ];
    }

    courseSelects.forEach(selectId => {
        const select = document.getElementById(selectId);
        if (select) {
            select.innerHTML = '<option value="">Select Course</option>';
            courses.forEach(course => {
                // Use course name as value to ensure consistency between teacher and student views
                select.innerHTML += `<option value="${course.name}">${course.name}</option>`;
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
}

// Attendance Management
// Note: Attendance functions are now in attendance.js

// Assignment Management
function handleAssignmentSubmit(event) {
    event.preventDefault();

    const courseName = document.getElementById('assignmentCourse').value;
    const title = document.getElementById('assignmentTitle').value;
    const description = document.getElementById('assignmentDescription').value;
    const dueDate = document.getElementById('assignmentDueDate').value;
    const file = document.getElementById('assignmentFile').files[0];

    if (!courseName || !title || !dueDate) {
        alert('Please fill in all required fields');
        return;
    }

    const assignmentId = Date.now().toString();

    // Store file data if a file is uploaded
    if (file) {
        const reader = new FileReader();
        reader.onload = function (e) {
            localStorage.setItem(`assignment_${assignmentId}`, e.target.result);
        };
        reader.readAsDataURL(file);
    }

    const assignment = {
        id: assignmentId,
        courseName: courseName, // Ensure we use the course name, not ID
        title,
        description,
        dueDate,
        teacher: sessionStorage.getItem('currentUsername'),
        file: file ? {
            name: file.name,
            type: file.type,
            size: formatFileSize(file.size)
        } : null,
        createdAt: new Date().toISOString(),
        submissions: []
    };

    console.log('Creating new assignment:', assignment);

    const assignments = JSON.parse(localStorage.getItem('assignments') || '[]');
    assignments.push(assignment);
    localStorage.setItem('assignments', JSON.stringify(assignments));

    event.target.reset();
    loadAssignmentsList();
    updateDashboardStats();

    // Show success message
    showSuccessMessage('Assignment created successfully!');
}

function loadAssignmentsList() {
    const assignments = JSON.parse(localStorage.getItem('assignments') || '[]');
    const teacherAssignments = assignments.filter(assignment =>
        assignment.teacher === sessionStorage.getItem('currentUsername')
    );

    const assignmentsList = document.getElementById('assignmentsList');
    assignmentsList.innerHTML = '';

    if (teacherAssignments.length === 0) {
        assignmentsList.innerHTML = '<div class="empty-state"><p>No assignments created yet</p></div>';
        return;
    }

    // Sort assignments by creation date (newest first)
    teacherAssignments.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    teacherAssignments.forEach(assignment => {
        // Ensure submissions array exists
        if (!assignment.submissions) {
            assignment.submissions = [];
        }

        // Count submissions
        const submissionCount = assignment.submissions.length;
        const hasNewSubmissions = submissionCount > 0;

        const div = document.createElement('div');
        div.className = 'assignment-card';
        div.innerHTML = `
            <div class="assignment-header">
                <h3>${assignment.title}</h3>
                <span class="course-tag">${assignment.courseName}</span>
                <button class="delete-btn" onclick="deleteAssignment('${assignment.id}')">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
            <div class="assignment-meta">
                <div class="meta-item">
                    <i class="fas fa-calendar"></i>
                    <span>Due: ${formatDate(assignment.dueDate)}</span>
                </div>
                <div class="meta-item">
                    <i class="fas fa-users"></i>
                    <span>${submissionCount} Submissions</span>
                    ${hasNewSubmissions ? `<span class="badge">${submissionCount}</span>` : ''}
                </div>
            </div>
            <p class="assignment-description">${assignment.description || 'No description provided'}</p>
            ${assignment.file ? `
                <div class="assignment-file">
                    <i class="fas fa-paperclip"></i>
                    <span>${assignment.file.name} (${assignment.file.size})</span>
                </div>
            ` : ''}
            <div class="assignment-actions">
                <button class="view-btn" onclick="viewSubmissions('${assignment.id}')">
                    <i class="fas fa-eye"></i> View Submissions
                </button>
                <button class="download-btn" onclick="downloadAssignment('${assignment.id}')">
                    <i class="fas fa-download"></i> Download
                </button>
            </div>
        `;
        assignmentsList.appendChild(div);
    });

    console.log('Assignments list refreshed');
}

function filterAssignments() {
    const filter = document.getElementById('assignmentFilter').value;
    const search = document.getElementById('assignmentSearch').value.toLowerCase();
    const cards = document.querySelectorAll('.assignment-card');

    cards.forEach(card => {
        const title = card.querySelector('h3').textContent.toLowerCase();
        const course = card.querySelector('.course-tag').textContent.toLowerCase();
        const matchesSearch = title.includes(search) || course.includes(search);
        const matchesFilter = !filter || card.querySelector('.course-tag').textContent === filter;

        card.style.display = matchesSearch && matchesFilter ? 'block' : 'none';
    });
}

function viewSubmissions(assignmentId) {
    console.log('Viewing submissions for assignment:', assignmentId);
    const assignments = JSON.parse(localStorage.getItem('assignments') || '[]');
    const assignment = assignments.find(a => String(a.id) === String(assignmentId));

    if (!assignment) {
        console.error('Assignment not found:', assignmentId);
        return;
    }

    // Ensure submissions array exists
    if (!assignment.submissions) {
        assignment.submissions = [];
    }

    // Sort submissions by date (newest first)
    const sortedSubmissions = [...assignment.submissions].sort((a, b) =>
        new Date(b.submissionDate) - new Date(a.submissionDate)
    );

    const submissionsList = document.createElement('div');
    submissionsList.className = 'submissions-list';
    submissionsList.innerHTML = `
        <div class="submissions-header">
        <h3>Submissions for ${assignment.title}</h3>
            <button class="close-btn" onclick="this.parentElement.parentElement.remove()">
                <i class="fas fa-times"></i>
            </button>
        </div>
        <div class="submissions-grid">
            ${sortedSubmissions.length > 0 ? sortedSubmissions.map(submission => `
                <div class="submission-card">
                    <div class="submission-header">
                        <h4>${submission.studentName}</h4>
                        <span class="submission-date">${formatDate(submission.submissionDate)}</span>
                    </div>
                    <div class="submission-meta">
                        <div class="meta-item">
                            <i class="fas fa-file"></i>
                            <span>${submission.file.name}</span>
                        </div>
                        <div class="meta-item">
                            <i class="fas fa-weight-hanging"></i>
                            <span>${submission.file.size}</span>
                        </div>
                    </div>
                    ${submission.grade ? `
                        <div class="grade-info">
                            <span>Grade: ${submission.grade}/100</span>
                            <span>Graded by: ${submission.gradedBy || 'Unknown'}</span>
                            <span>Graded on: ${submission.gradedAt ? formatDate(submission.gradedAt) : 'Unknown'}</span>
                            ${submission.feedback ? `<div class="feedback"><strong>Feedback:</strong> ${submission.feedback}</div>` : ''}
                        </div>
                    ` : ''}
                    <div class="submission-actions">
                        <button class="grade-btn" onclick="gradeSubmission('${assignmentId}', '${submission.id}')">
                            <i class="fas fa-check"></i> ${submission.grade ? 'Update Grade' : 'Grade'}
                        </button>
                        <button class="download-btn" onclick="downloadSubmission('${assignmentId}', '${submission.id}')">
                            <i class="fas fa-download"></i> Download
                        </button>
                    </div>
                </div>
            `).join('') : '<div class="empty-state"><p>No submissions yet</p></div>'}
        </div>
    `;

    document.getElementById('assignmentsList').appendChild(submissionsList);

    // Mark as viewed
    sessionStorage.setItem('last_checked_submissions', Date.now().toString());
}

function downloadSubmission(assignmentId, submissionId) {
    console.log('Downloading submission:', submissionId, 'for assignment:', assignmentId);
    const assignments = JSON.parse(localStorage.getItem('assignments') || '[]');
    const assignment = assignments.find(a => String(a.id) === String(assignmentId));

    if (!assignment) {
        console.error('Assignment not found:', assignmentId);
        alert('Assignment not found. Please refresh the page and try again.');
        return;
    }

    if (!assignment.submissions) {
        console.error('No submissions array found for assignment:', assignmentId);
        alert('No submissions found for this assignment.');
        return;
    }

    const submission = assignment.submissions.find(s => String(s.id) === String(submissionId));

    if (!submission) {
        console.error('Submission not found:', submissionId);
        alert('Submission not found. It may have been removed.');
        return;
    }

    console.log('Found submission:', submission);

    // Create a download link
    const link = document.createElement('a');

    try {
        // Check if it's a large file with a URL
        if (submission.isLargeFile && submission.fileUrl) {
            console.log('Using temporary URL for large file');
            link.href = submission.fileUrl;
        } else {
            // Get the file data from localStorage
            const fileData = localStorage.getItem(`submission_${submissionId}`);
            if (!fileData) {
                console.error('File data not found in localStorage for submission:', submissionId);
                alert('File data not found. It may have been removed or the browser was restarted.');
                return;
            }
            link.href = fileData;
        }

        link.download = submission.file.name;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        // Show success message
        showSuccessMessage(`Downloading submission from ${submission.studentName}`);
    } catch (error) {
        console.error('Error downloading submission:', error);
        alert('Error downloading submission. Please try again.');
    }
}

function downloadAssignment(assignmentId) {
    console.log('Downloading assignment:', assignmentId);
    const assignments = JSON.parse(localStorage.getItem('assignments') || '[]');
    const assignment = assignments.find(a => String(a.id) === String(assignmentId));

    if (!assignment) {
        console.error('Assignment not found:', assignmentId);
        return;
    }

    if (!assignment.file) {
        alert('No file attached to this assignment');
        return;
    }

    // Get the file data from localStorage
    const fileData = localStorage.getItem(`assignment_${assignmentId}`);
    if (!fileData) {
        alert('File not found');
        return;
    }

    // Create a download link
    const link = document.createElement('a');
    link.href = fileData;
    link.download = assignment.file.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

function gradeSubmission(assignmentId, submissionId) {
    console.log('Grading submission:', submissionId, 'for assignment:', assignmentId);
    const assignments = JSON.parse(localStorage.getItem('assignments') || '[]');
    const assignmentIndex = assignments.findIndex(a => String(a.id) === String(assignmentId));

    if (assignmentIndex === -1) {
        console.error('Assignment not found:', assignmentId);
        return;
    }

    const assignment = assignments[assignmentIndex];

    if (!assignment.submissions) {
        assignment.submissions = [];
    }

    const submissionIndex = assignment.submissions.findIndex(s => String(s.id) === String(submissionId));

    if (submissionIndex === -1) {
        console.error('Submission not found:', submissionId);
        return;
    }

    const submission = assignment.submissions[submissionIndex];
    const currentGrade = submission.grade ? submission.grade : '';

    const grade = prompt('Enter grade for this submission (0-100):', currentGrade);
    if (grade === null) return; // User cancelled

    // Validate grade
    const numericGrade = parseFloat(grade);
    if (isNaN(numericGrade) || numericGrade < 0 || numericGrade > 100) {
        alert('Please enter a valid grade between 0 and 100');
        return;
    }

    // Get feedback from teacher
    const currentFeedback = submission.feedback || '';
    const feedback = prompt('Enter feedback for the student (optional):', currentFeedback);

    // Update the submission with the grade and feedback
    submission.grade = numericGrade;
    submission.feedback = feedback;
    submission.gradedAt = new Date().toISOString();
    submission.gradedBy = sessionStorage.getItem('currentUsername');
    submission.status = 'Graded'; // Add status field to indicate it's graded

    // Update the submission in the assignment
    assignment.submissions[submissionIndex] = submission;

    // Update the assignment in the assignments array
    assignments[assignmentIndex] = assignment;

    // Save the updated assignments
    localStorage.setItem('assignments', JSON.stringify(assignments));

    // Refresh the submissions view
    const submissionsList = document.querySelector('.submissions-list');
    if (submissionsList) {
        submissionsList.remove();
    }
    viewSubmissions(assignmentId);

    showSuccessMessage('Grade and feedback submitted successfully!');
}

// Lecture Management
function handleLectureSubmit(event) {
    event.preventDefault();

    const courseName = document.getElementById('lectureCourse').value;
    const title = document.getElementById('lectureTitle').value;
    const description = document.getElementById('lectureDescription').value;
    const file = document.getElementById('lectureFile').files[0];

    if (!courseName || !title || !file) {
        alert('Please fill in all required fields');
        return;
    }

    const lectureId = Date.now().toString();

    // Check file size - warn if over 5MB (localStorage limit)
    const MAX_SIZE = 5 * 1024 * 1024; // 5MB
    let fileUrl = '';

    if (file.size > MAX_SIZE) {
        // For large files, create a temporary URL
        fileUrl = URL.createObjectURL(file);
        showSuccessMessage('Note: This file is too large to store in browser. The download link will only work in this session.');
    } else {
        // For smaller files, store in localStorage
        const reader = new FileReader();
        reader.onload = function (e) {
            localStorage.setItem(`lecture_${lectureId}`, e.target.result);
        };
        reader.readAsDataURL(file);
    }

    const lecture = {
        id: lectureId,
        courseName,
        title,
        description,
        teacher: sessionStorage.getItem('currentUsername'),
        file: file.name,
        fileType: file.type,
        fileSize: formatFileSize(file.size),
        uploadDate: new Date().toISOString(),
        fileUrl: fileUrl, // Store the temporary URL for large files
        isLargeFile: file.size > MAX_SIZE
    };

    const lectures = JSON.parse(localStorage.getItem('lectures') || '[]');
    lectures.push(lecture);
    localStorage.setItem('lectures', JSON.stringify(lectures));

    event.target.reset();
    loadLecturesList();
    showSuccessMessage('Lecture uploaded successfully!');
}

function loadLecturesList() {
    const lectures = JSON.parse(localStorage.getItem('lectures') || '[]');
    const teacherLectures = lectures.filter(lecture =>
        lecture.teacher === sessionStorage.getItem('currentUsername')
    );

    const lecturesList = document.getElementById('lecturesList');
    lecturesList.innerHTML = '';

    if (teacherLectures.length === 0) {
        lecturesList.innerHTML = '<div class="empty-state"><p>No lectures uploaded yet</p></div>';
        return;
    }

    // Add filter controls
    const filterControls = document.createElement('div');
    filterControls.className = 'filter-controls';
    filterControls.innerHTML = `
        <div class="filter-group">
            <label>Filter by course:</label>
            <select id="lectureFilter" onchange="filterLecturesList()">
                <option value="">All Courses</option>
                ${getTeacherCourses().map(course =>
        `<option value="${course.name}">${course.name}</option>`
    ).join('')}
            </select>
        </div>
        <div class="search-group">
            <input type="text" id="lectureSearch" placeholder="Search lectures..." oninput="filterLecturesList()">
        </div>
    `;
    lecturesList.appendChild(filterControls);

    // Add lectures grid
    const lecturesGrid = document.createElement('div');
    lecturesGrid.className = 'lectures-grid';
    lecturesGrid.id = 'lecturesGrid';

    teacherLectures.forEach(lecture => {
        const div = document.createElement('div');
        div.className = 'lecture-card';
        div.innerHTML = `
            <div class="lecture-header">
                <h3>${lecture.title}</h3>
                <span class="course-tag">${lecture.courseName}</span>
                <button class="delete-btn" onclick="deleteLecture('${lecture.id}')">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
            <div class="lecture-meta">
                <div class="meta-item">
                    <i class="fas fa-calendar"></i>
                    <span>${formatDate(lecture.uploadDate)}</span>
                </div>
                <div class="meta-item">
                    <i class="fas fa-file"></i>
                    <span>${lecture.fileType}</span>
                </div>
                <div class="meta-item">
                    <i class="fas fa-weight-hanging"></i>
                    <span>${lecture.fileSize}</span>
                </div>
            </div>
            <p class="lecture-description">${lecture.description || 'No description provided'}</p>
            <div class="lecture-actions">
                <button class="download-btn" onclick="downloadLecture('${lecture.id}')">
                    <i class="fas fa-download"></i> Download
                </button>
            </div>
        `;
        lecturesGrid.appendChild(div);
    });

    lecturesList.appendChild(lecturesGrid);
}

function filterLecturesList() {
    const filter = document.getElementById('lectureFilter').value;
    const search = document.getElementById('lectureSearch').value.toLowerCase();
    const cards = document.querySelectorAll('.lecture-card');

    cards.forEach(card => {
        const title = card.querySelector('h3').textContent.toLowerCase();
        const course = card.querySelector('.course-tag').textContent.toLowerCase();
        const matchesSearch = title.includes(search) || course.includes(search);
        const matchesFilter = !filter || card.querySelector('.course-tag').textContent === filter;

        card.style.display = matchesSearch && matchesFilter ? 'block' : 'none';
    });
}

function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

function getTeacherCourses() {
    const username = sessionStorage.getItem('currentUsername');
    const courses = JSON.parse(localStorage.getItem('courses') || '[]');
    return courses.filter(course => course.teacher === username);
}

function getCourseById(courseId) {
    const courses = JSON.parse(localStorage.getItem('courses') || '[]');
    return courses.find(course => course.id === courseId) || { name: 'Unknown Course' };
}

function logout() {
    sessionStorage.clear();
    window.location.href = '../index.html';
}

// Announcements Management
function handleAnnouncementSubmit(event) {
    event.preventDefault();

    const courseName = document.getElementById('announcementCourse').value;
    const title = document.getElementById('announcementTitle').value;
    const content = document.getElementById('announcementContent').value;
    const type = document.getElementById('announcementType').value;

    if (!courseName || !title || !content) {
        alert('Please fill in all required fields');
        return;
    }

    const announcement = {
        id: Date.now().toString(),
        courseName,
        title,
        content,
        type,
        teacher: sessionStorage.getItem('currentUsername'),
        createdAt: new Date().toISOString()
    };

    const announcements = JSON.parse(localStorage.getItem('announcements') || '[]');
    announcements.push(announcement);
    localStorage.setItem('announcements', JSON.stringify(announcements));

    event.target.reset();
    loadAnnouncementsList();

    // Show success message
    const successMessage = document.createElement('div');
    successMessage.className = 'success-message';
    successMessage.textContent = 'Announcement sent successfully!';
    document.getElementById('announcementsList').appendChild(successMessage);

    setTimeout(() => {
        successMessage.remove();
    }, 3000);
}

function loadAnnouncementsList() {
    const announcements = JSON.parse(localStorage.getItem('announcements') || '[]');
    const teacherAnnouncements = announcements.filter(announcement =>
        announcement.teacher === sessionStorage.getItem('currentUsername')
    );

    const announcementsList = document.getElementById('announcementsList');
    announcementsList.innerHTML = '';

    if (teacherAnnouncements.length === 0) {
        announcementsList.innerHTML = '<div class="empty-state"><p>No announcements created yet</p></div>';
        return;
    }

    teacherAnnouncements.forEach(announcement => {
        const div = document.createElement('div');
        div.className = `announcement-card ${announcement.type}`;
        div.innerHTML = `
            <div class="announcement-header">
                <h3>${announcement.title}</h3>
                <span class="course-tag">${announcement.courseName}</span>
                <button class="delete-btn" onclick="deleteAnnouncement('${announcement.id}')">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
            <div class="announcement-meta">
                <div class="meta-item">
                    <i class="fas fa-calendar"></i>
                    <span>${formatDate(announcement.createdAt)}</span>
                </div>
                <div class="meta-item">
                    <i class="fas fa-tag"></i>
                    <span class="type-tag">${announcement.type}</span>
                </div>
            </div>
            <p class="announcement-content">${announcement.content}</p>
        `;
        announcementsList.appendChild(div);
    });
}

function filterAnnouncements() {
    const courseFilter = document.getElementById('announcementFilter').value;
    const typeFilter = document.getElementById('announcementTypeFilter').value;
    const cards = document.querySelectorAll('.announcement-card');

    cards.forEach(card => {
        const course = card.querySelector('.course-tag').textContent;
        const type = card.classList.contains(typeFilter);
        const matchesCourse = !courseFilter || course === courseFilter;
        const matchesType = !typeFilter || type;

        card.style.display = matchesCourse && matchesType ? 'block' : 'none';
    });
}

function updateDashboardStats() {
    const username = sessionStorage.getItem('currentUsername');
    const students = JSON.parse(localStorage.getItem('students') || '[]');
    const courses = JSON.parse(localStorage.getItem('courses') || '[]');
    const assignments = JSON.parse(localStorage.getItem('assignments') || '[]');

    // Update total students
    document.getElementById('totalStudents').textContent = students.length;

    // Update active courses
    const teacherCourses = courses.filter(course => course.teacher === username);
    const defaultCourses = [
        { id: 'web-dev', name: 'Web Development' },
        { id: 'graphic-design', name: 'Graphic Designing' },
        { id: 'content-writing', name: 'Content Writing' },
        { id: 'youtube-auto', name: 'YouTube Automation' },
        { id: 'ecommerce', name: 'E-commerce' }
    ];
    const activeCourses = teacherCourses.length > 0 ? teacherCourses : defaultCourses;
    document.getElementById('activeCourses').textContent = activeCourses.length;

    // Update pending assignments
    const pendingAssignments = assignments.filter(assignment =>
        assignment.teacher === username &&
        new Date(assignment.dueDate) > new Date()
    );
    document.getElementById('pendingAssignments').textContent = pendingAssignments.length;

    // Update today's classes
    const today = new Date().toISOString().split('T')[0];
    const todayClasses = assignments.filter(assignment =>
        assignment.teacher === username &&
        assignment.date === today
    );
    document.getElementById('todayClasses').textContent = todayClasses.length;
}

// Meeting Management
function handleMeetingSubmit(event) {
    event.preventDefault();

    const courseName = document.getElementById('meetingCourse').value;
    const title = document.getElementById('meetingTitle').value;
    const date = document.getElementById('meetingDate').value;
    const time = document.getElementById('meetingTime').value;
    const duration = document.getElementById('meetingDuration').value;

    if (!courseName || !title || !date || !time || !duration) {
        alert('Please fill in all required fields');
        return;
    }

    const meeting = {
        id: Date.now().toString(),
        courseName,
        title,
        date,
        time,
        duration,
        teacher: sessionStorage.getItem('currentUsername'),
        createdAt: new Date().toISOString(),
        link: `https://meet.jit.si/${generateMeetingId()}`
    };

    const meetings = JSON.parse(localStorage.getItem('meetings') || '[]');
    meetings.push(meeting);
    localStorage.setItem('meetings', JSON.stringify(meetings));

    event.target.reset();
    loadMeetingsList();
    sendMeetingNotification(meeting);

    // Show success message
    const successMessage = document.createElement('div');
    successMessage.className = 'success-message';
    successMessage.textContent = 'Meeting created successfully!';
    document.getElementById('meetingsList').appendChild(successMessage);

    setTimeout(() => {
        successMessage.remove();
    }, 3000);
}

function generateMeetingId() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let id = '';
    for (let i = 0; i < 10; i++) {
        id += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return id;
}

function loadMeetingsList() {
    const meetings = JSON.parse(localStorage.getItem('meetings') || '[]');
    const teacherMeetings = meetings.filter(meeting =>
        meeting.teacher === sessionStorage.getItem('currentUsername')
    );

    const meetingsList = document.getElementById('meetingsList');
    meetingsList.innerHTML = '';

    if (teacherMeetings.length === 0) {
        meetingsList.innerHTML = '<div class="empty-state"><p>No meetings scheduled yet</p></div>';
        return;
    }

    teacherMeetings.forEach(meeting => {
        const div = document.createElement('div');
        div.className = 'meeting-card';
        div.innerHTML = `
            <div class="meeting-header">
                <h3>${meeting.title}</h3>
                <span class="course-tag">${meeting.courseName}</span>
                <button class="delete-btn" onclick="deleteMeeting('${meeting.id}')">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
            <div class="meeting-meta">
                <div class="meta-item">
                    <i class="fas fa-calendar"></i>
                    <span>${formatDate(meeting.date)}</span>
                </div>
                <div class="meta-item">
                    <i class="fas fa-clock"></i>
                    <span>${meeting.time}</span>
                </div>
                <div class="meta-item">
                    <i class="fas fa-hourglass-half"></i>
                    <span>${meeting.duration} minutes</span>
                </div>
            </div>
            <div class="meeting-actions">
                <button class="join-btn" onclick="joinMeeting('${meeting.id}')">
                    <i class="fas fa-video"></i> Join Meeting
                </button>
                <button class="copy-btn" onclick="copyMeetingLink('${meeting.link}')">
                    <i class="fas fa-copy"></i> Copy Link
                </button>
            </div>
        `;
        meetingsList.appendChild(div);
    });
}

function filterMeetings() {
    const courseFilter = document.getElementById('meetingFilter').value;
    const dateFilter = document.getElementById('meetingDateFilter').value;
    const cards = document.querySelectorAll('.meeting-card');

    cards.forEach(card => {
        const course = card.querySelector('.course-tag').textContent;
        const date = new Date(card.querySelector('.meta-item span').textContent.split(' at ')[0]);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const matchesCourse = !courseFilter || course === courseFilter;
        const matchesDate = !dateFilter ||
            (dateFilter === 'today' && date.toDateString() === today.toDateString()) ||
            (dateFilter === 'upcoming' && date >= today) ||
            (dateFilter === 'past' && date < today);

        card.style.display = matchesCourse && matchesDate ? 'block' : 'none';
    });
}

function joinMeeting(meetingId) {
    const meetings = JSON.parse(localStorage.getItem('meetings') || '[]');
    const meeting = meetings.find(m => m.id === meetingId);

    if (!meeting) return;

    const domain = 'meet.jit.si';
    const options = {
        roomName: meetingId,
        width: '100%',
        height: '100%',
        parentNode: document.querySelector('#meet'),
        userInfo: {
            displayName: sessionStorage.getItem('currentUsername')
        }
    };

    // Create the Jitsi Meet API instance
    new JitsiMeetExternalAPI(domain, options);

    // Show meeting container
    document.querySelector('.meeting-container').style.display = 'block';
}

function copyMeetingLink(link) {
    navigator.clipboard.writeText(link).then(() => {
        const successMessage = document.createElement('div');
        successMessage.className = 'success-message';
        successMessage.textContent = 'Meeting link copied to clipboard!';
        document.getElementById('meetingsList').appendChild(successMessage);

        setTimeout(() => {
            successMessage.remove();
        }, 2000);
    });
}

function deleteMeeting(meetingId) {
    console.log('Attempting to delete meeting:', meetingId);
    const meetings = JSON.parse(localStorage.getItem('meetings') || '[]');
    console.log('Current meetings:', meetings);

    if (confirm('Are you sure you want to delete this meeting? This will remove it from both teacher and student dashboards.')) {
        const updatedMeetings = meetings.filter(m => String(m.id) !== String(meetingId));
        console.log('Updated meetings:', updatedMeetings);

        localStorage.setItem('meetings', JSON.stringify(updatedMeetings));
        loadMeetingsList();
        showSuccessMessage('Meeting deleted successfully!');

        // Force refresh student dashboard if it's open
        if (window.opener) {
            window.opener.location.reload();
        }
    }
}

function sendMeetingNotification(meeting) {
    const course = getCourseById(meeting.courseId);
    const students = JSON.parse(localStorage.getItem('students') || '[]');
    const courseStudents = students.filter(student =>
        student.courses.includes(course.id)
    );

    // In a real application, you would send emails to students
    // For now, we'll just log the notification
    console.log('Meeting notification sent to students:', {
        course: course.name,
        meeting: meeting.title,
        date: meeting.date,
        time: meeting.time,
        link: meeting.link,
        students: courseStudents.map(s => s.email)
    });
}

// Add delete functions
function deleteAssignment(assignmentId) {
    console.log('Attempting to delete assignment:', assignmentId);
    const assignments = JSON.parse(localStorage.getItem('assignments') || '[]');
    console.log('Current assignments:', assignments);

    if (confirm('Are you sure you want to delete this assignment? This will remove it from both teacher and student dashboards.')) {
        const updatedAssignments = assignments.filter(a => String(a.id) !== String(assignmentId));
        console.log('Updated assignments:', updatedAssignments);

        localStorage.setItem('assignments', JSON.stringify(updatedAssignments));
        loadAssignmentsList();
        showSuccessMessage('Assignment deleted successfully!');

        // Force refresh student dashboard if it's open
        if (window.opener) {
            window.opener.location.reload();
        }
    }
}

function downloadLecture(lectureId) {
    console.log('Downloading lecture:', lectureId);
    const lectures = JSON.parse(localStorage.getItem('lectures') || '[]');
    const lecture = lectures.find(l => String(l.id) === String(lectureId));

    if (!lecture) {
        console.error('Lecture not found:', lectureId);
        return;
    }

    // Create a download link
    const link = document.createElement('a');

    // Check if it's a large file with a URL
    if (lecture.isLargeFile && lecture.fileUrl) {
        link.href = lecture.fileUrl;
    } else {
        // Get the file data from localStorage
        const fileData = localStorage.getItem(`lecture_${lectureId}`);
        if (!fileData) {
            alert('File not found. It may have been removed or the browser was restarted.');
            return;
        }
        link.href = fileData;
    }

    link.download = lecture.file; // Use the original filename
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showSuccessMessage('Downloading lecture...');
}

function deleteLecture(lectureId) {
    console.log('Attempting to delete lecture:', lectureId);
    const lectures = JSON.parse(localStorage.getItem('lectures') || '[]');
    console.log('Current lectures:', lectures);

    if (confirm('Are you sure you want to delete this lecture? This will remove it from both teacher and student dashboards.')) {
        const updatedLectures = lectures.filter(l => String(l.id) !== String(lectureId));
        console.log('Updated lectures:', updatedLectures);

        localStorage.setItem('lectures', JSON.stringify(updatedLectures));
        loadLecturesList();
        showSuccessMessage('Lecture deleted successfully!');

        // Force refresh student dashboard if it's open
        if (window.opener) {
            window.opener.location.reload();
        }
    }
}

function deleteAnnouncement(announcementId) {
    console.log('Attempting to delete announcement:', announcementId);
    const announcements = JSON.parse(localStorage.getItem('announcements') || '[]');
    console.log('Current announcements:', announcements);

    if (confirm('Are you sure you want to delete this announcement? This will remove it from both teacher and student dashboards.')) {
        const updatedAnnouncements = announcements.filter(a => String(a.id) !== String(announcementId));
        console.log('Updated announcements:', updatedAnnouncements);

        localStorage.setItem('announcements', JSON.stringify(updatedAnnouncements));
        loadAnnouncementsList();
        showSuccessMessage('Announcement deleted successfully!');

        // Force refresh student dashboard if it's open
        if (window.opener) {
            window.opener.location.reload();
        }
    }
}

function showSuccessMessage(message) {
    const successMessage = document.createElement('div');
    successMessage.className = 'success-message';
    successMessage.textContent = message;
    document.body.appendChild(successMessage);

    setTimeout(() => {
        successMessage.remove();
    }, 3000);
}

// Add CSS for the submissions view
const style = document.createElement('style');
style.textContent = `
    .submissions-list {
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: white;
        padding: 20px;
        border-radius: 8px;
        box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        max-width: 90%;
        max-height: 90vh;
        overflow-y: auto;
        z-index: 1000;
    }

    .submissions-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 20px;
    }

    .submissions-header h3 {
        margin: 0;
    }

    .close-btn {
        background: none;
        border: none;
        font-size: 1.2em;
        cursor: pointer;
        color: #666;
    }

    .submissions-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
        gap: 20px;
    }

    .submission-card {
        background: #f8f9fa;
        padding: 15px;
        border-radius: 8px;
        box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    }

    .submission-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 10px;
    }

    .submission-meta {
        display: flex;
        gap: 15px;
        margin: 10px 0;
    }

    .submission-actions {
        display: flex;
        gap: 10px;
        margin-top: 10px;
    }

    .grade-btn, .download-btn {
        padding: 8px 15px;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 5px;
    }

    .grade-btn {
        background: #28a745;
        color: white;
    }

    .download-btn {
        background: #007bff;
        color: white;
    }

    .empty-state {
        text-align: center;
        padding: 20px;
        color: #666;
    }
`;
document.head.appendChild(style);