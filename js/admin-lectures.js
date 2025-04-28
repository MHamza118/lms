// Load lectures when the admin dashboard loads
document.addEventListener('DOMContentLoaded', function () {
    // Check if we're on the admin page
    if (!document.getElementById('lecturesTableBody')) return;

    // Load all lectures
    loadLecturesInAdminDashboard();
});

/**
 * Load all lectures from localStorage and display them in the admin dashboard
 */
function loadLecturesInAdminDashboard() {
    // Get lectures from localStorage
    const lectures = JSON.parse(localStorage.getItem('lectures') || '[]');

    // Get the lectures table body
    const lecturesTableBody = document.getElementById('lecturesTableBody');
    if (!lecturesTableBody) return;

    // Clear existing content
    lecturesTableBody.innerHTML = '';

    // Check if there are any lectures
    if (lectures.length === 0) {
        const emptyRow = document.createElement('tr');
        emptyRow.innerHTML = '<td colspan="5" class="text-center">No lectures found</td>';
        lecturesTableBody.appendChild(emptyRow);
        return;
    }

    // Sort lectures by upload date (newest first)
    lectures.sort((a, b) => new Date(b.uploadDate) - new Date(a.uploadDate));

    // Add each lecture to the table
    lectures.forEach(lecture => {
        const row = document.createElement('tr');

        // Format date
        const uploadDate = new Date(lecture.uploadDate);
        const formattedDate = uploadDate.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });

        // Create row content
        row.innerHTML = `
            <td>${lecture.title}</td>
            <td>${lecture.courseName}</td>
            <td>${formattedDate}</td>
            <td>${lecture.fileSize}</td>
            <td>
                <button class="download-btn" onclick="adminDownloadLecture('${lecture.id}')">
                    <i class="fas fa-download"></i> Download
                </button>
            </td>
        `;

        lecturesTableBody.appendChild(row);
    });
}

/**
 * Download a lecture file
 * @param {string} lectureId - The ID of the lecture to download
 */
function adminDownloadLecture(lectureId) {
    // Get lectures from localStorage
    const lectures = JSON.parse(localStorage.getItem('lectures') || '[]');

    // Find the lecture
    const lecture = lectures.find(l => l.id === lectureId);
    if (!lecture) {
        alert('Lecture not found');
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

    // Set download attribute with the original filename
    link.download = lecture.file;

    // Append to body, click, and remove
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Show success message
    alert('Downloading lecture: ' + lecture.title);
}
