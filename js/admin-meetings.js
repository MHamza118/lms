// Load meetings when the admin dashboard loads
document.addEventListener('DOMContentLoaded', function () {
    // Check if we're on the admin page
    if (!document.getElementById('meetingsTableBody')) return;

    // Load all meetings
    loadMeetingsInAdminDashboard();
});

/**
 * Load all meetings from localStorage and display them in the admin dashboard
 */
function loadMeetingsInAdminDashboard() {
    // Get meetings from localStorage
    const meetings = JSON.parse(localStorage.getItem('meetings') || '[]');

    // Get the meetings table body
    const meetingsTableBody = document.getElementById('meetingsTableBody');
    if (!meetingsTableBody) return;

    // Clear existing content
    meetingsTableBody.innerHTML = '';

    // Check if there are any meetings
    if (meetings.length === 0) {
        const emptyRow = document.createElement('tr');
        emptyRow.innerHTML = '<td colspan="6" class="text-center">No meetings found</td>';
        meetingsTableBody.appendChild(emptyRow);
        return;
    }

    // Sort meetings by date (newest first)
    meetings.sort((a, b) => {
        const dateA = new Date(`${a.date}T${a.time}`);
        const dateB = new Date(`${b.date}T${b.time}`);
        return dateB - dateA;
    });

    // Add each meeting to the table
    meetings.forEach(meeting => {
        const row = document.createElement('tr');

        // Format date and time
        const meetingDate = new Date(`${meeting.date}T${meeting.time}`);
        const formattedDate = meetingDate.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        const formattedTime = meetingDate.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit'
        });

        // Determine meeting status
        const now = new Date();
        let status = 'Scheduled';
        if (meetingDate < now) {
            status = 'Completed';
        }

        // Create row content
        row.innerHTML = `
            <td>${meeting.id}</td>
            <td>${meeting.teacher}</td>
            <td>All students in ${meeting.courseName}</td>
            <td>${formattedDate} ${formattedTime}</td>
            <td>${status}</td>
            <td>
                <button class="view-btn" onclick="viewMeetingDetails('${meeting.id}')">
                    <i class="fas fa-eye"></i> View
                </button>
            </td>
        `;

        meetingsTableBody.appendChild(row);
    });
}

/**
 * View detailed information about a meeting
 * @param {string} meetingId - The ID of the meeting to view
 */
function viewMeetingDetails(meetingId) {
    // Get meetings from localStorage
    const meetings = JSON.parse(localStorage.getItem('meetings') || '[]');

    // Find the meeting
    const meeting = meetings.find(m => m.id === meetingId);
    if (!meeting) {
        alert('Meeting not found');
        return;
    }
    const meetingDate = new Date(`${meeting.date}T${meeting.time}`);
    const formattedDate = meetingDate.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    const formattedTime = meetingDate.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit'
    });
    alert(`Meeting Details:    
Title: ${meeting.title}
Course: ${meeting.courseName}
Teacher: ${meeting.teacher}
Date: ${formattedDate}
Time: ${formattedTime}
Duration: ${meeting.duration} minutes
Meeting Link: ${meeting.link || 'Not available'}
    `);
}
