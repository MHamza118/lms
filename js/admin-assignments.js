// Load assignments when the admin dashboard loads
document.addEventListener('DOMContentLoaded', function () {
    // Check if we're on the admin page
    if (!document.getElementById('assignmentsTableBody')) return;

    // Load all assignments and submissions
    loadAssignmentsInAdminDashboard();
});

/**
 * Load all assignments and submissions from localStorage and display them in the admin dashboard
 */
function loadAssignmentsInAdminDashboard() {
    // Get assignments from localStorage
    const assignments = JSON.parse(localStorage.getItem('assignments') || '[]');

    // Get the assignments table body
    const assignmentsTableBody = document.getElementById('assignmentsTableBody');
    if (!assignmentsTableBody) return;

    // Clear existing content
    assignmentsTableBody.innerHTML = '';

    // Check if there are any assignments
    if (assignments.length === 0) {
        const emptyRow = document.createElement('tr');
        emptyRow.innerHTML = '<td colspan="6" class="text-center">No assignments found</td>';
        assignmentsTableBody.appendChild(emptyRow);
        return;
    }

    // Process assignments and submissions
    let allSubmissions = [];

    // Collect all submissions from all assignments
    assignments.forEach(assignment => {
        if (assignment.submissions && assignment.submissions.length > 0) {
            assignment.submissions.forEach(submission => {
                allSubmissions.push({
                    assignmentId: assignment.id,
                    assignmentTitle: assignment.title,
                    courseName: assignment.courseName,
                    teacher: assignment.teacher,
                    dueDate: assignment.dueDate,
                    ...submission
                });
            });
        } else {
            // Add the assignment even if it has no submissions
            allSubmissions.push({
                assignmentId: assignment.id,
                assignmentTitle: assignment.title,
                courseName: assignment.courseName,
                teacher: assignment.teacher,
                dueDate: assignment.dueDate,
                studentName: 'No submissions yet',
                submissionDate: '',
                status: 'Pending',
                noSubmission: true
            });
        }
    });

    // Sort submissions by date (newest first)
    allSubmissions.sort((a, b) => {
        if (a.submissionDate && b.submissionDate) {
            return new Date(b.submissionDate) - new Date(a.submissionDate);
        } else if (a.submissionDate) {
            return -1;
        } else if (b.submissionDate) {
            return 1;
        } else {
            return new Date(b.dueDate) - new Date(a.dueDate);
        }
    });

    // Add each submission to the table
    allSubmissions.forEach(submission => {
        const row = document.createElement('tr');

        // Format dates
        const submissionDate = submission.submissionDate ? formatDate(submission.submissionDate) : 'N/A';

        // Determine status and score
        let status = submission.status || 'Submitted';
        if (submission.noSubmission) {
            status = 'Pending';
        } else if (submission.grade) {
            status = 'Graded';
        }

        const score = submission.grade ? `${submission.grade}/100` : 'Not graded';

        // Create row content
        row.innerHTML = `
            <td>${submission.studentName}</td>
            <td>${submission.courseName}</td>
            <td>${submission.assignmentTitle}</td>
            <td>${score}</td>
            <td>
                <span class="status-badge status-${status.toLowerCase()}">${status}</span>
            </td>
            <td>
                ${!submission.noSubmission ? `
                    <button class="download-btn" onclick="adminDownloadSubmission('${submission.assignmentId}', '${submission.id}')">
                        <i class="fas fa-download"></i> Download
                    </button>
                ` : ''}
                <button class="download-btn" onclick="adminDownloadAssignment('${submission.assignmentId}')">
                    <i class="fas fa-file-alt"></i> Assignment
                </button>
            </td>
        `;

        assignmentsTableBody.appendChild(row);
    });

    // Add CSS for status badges if not already added
    if (!document.getElementById('admin-assignments-styles')) {
        const style = document.createElement('style');
        style.id = 'admin-assignments-styles';
        style.textContent = `
            .status-badge {
                display: inline-block;
                padding: 4px 8px;
                border-radius: 4px;
                font-size: 12px;
                font-weight: bold;
            }

            .status-submitted {
                background-color:rgb(221, 248, 70);
                color: white;
            }

            .status-graded {
                background-color:rgb(149, 175, 76);
                color: white;
            }

            .status-pending {
                background-color: #FFC107;
                color: black;
            }

            .download-btn {
                padding: 5px 10px;
                background-color:rgb(0, 223, 67);
                color: white;
                border: none;
                border-radius: 4px;
                cursor: pointer;
                font-size: 12px;
                margin-right: 5px;
                display: inline-flex;
                align-items: center;
                gap: 5px;
            }

            .download-btn:hover {
                background-color:rgb(28, 218, 11);
            }
        `;
        document.head.appendChild(style);
    }
}

/**
 * Download a student's assignment submission
 * @param {string} assignmentId - The ID of the assignment
 * @param {string} submissionId - The ID of the submission
 */
function adminDownloadSubmission(assignmentId, submissionId) {
    // Get assignments from localStorage
    const assignments = JSON.parse(localStorage.getItem('assignments') || '[]');

    // Find the assignment
    const assignment = assignments.find(a => a.id === assignmentId);
    if (!assignment) {
        alert('Assignment not found');
        return;
    }

    // Find the submission
    const submission = assignment.submissions.find(s => s.id === submissionId);
    if (!submission) {
        alert('Submission not found');
        return;
    }

    // Create a download link
    const link = document.createElement('a');

    // Check if it's a large file with a URL
    if (submission.isLargeFile && submission.fileUrl) {
        link.href = submission.fileUrl;
    } else {
        // Get the file data from localStorage
        const fileData = localStorage.getItem(`submission_${submissionId}`);
        if (!fileData) {
            alert('File not found. It may have been removed or the browser was restarted.');
            return;
        }
        link.href = fileData;
    }

    // Set download attribute with the original filename
    link.download = submission.file.name;

    // Append to body, click, and remove
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Show success message
    alert(`Downloading submission from ${submission.studentName} for assignment: ${assignment.title}`);
}

/**
 * Download an assignment file
 * @param {string} assignmentId - The ID of the assignment to download
 */
function adminDownloadAssignment(assignmentId) {
    // Get assignments from localStorage
    const assignments = JSON.parse(localStorage.getItem('assignments') || '[]');

    // Find the assignment
    const assignment = assignments.find(a => a.id === assignmentId);
    if (!assignment) {
        alert('Assignment not found');
        return;
    }

    // Check if the assignment has a file
    if (!assignment.file) {
        alert('This assignment does not have an attached file');
        return;
    }

    // Get the file data from localStorage
    const fileData = localStorage.getItem(`assignment_${assignmentId}`);
    if (!fileData) {
        alert('File not found. It may have been removed or the browser was restarted.');
        return;
    }

    // Create a download link
    const link = document.createElement('a');
    link.href = fileData;
    link.download = assignment.file.name;

    // Append to body, click, and remove
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Show success message
    alert(`Downloading assignment: ${assignment.title}`);
}

/**
 * Format a date string to a more readable format
 * @param {string} dateString - The date string to format
 * @returns {string} - Formatted date string
 */
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}
