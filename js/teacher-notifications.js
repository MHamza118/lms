// Wait for the DOM to be fully loaded
window.onload = function () {
    console.log("Teacher notifications script loaded");

    // Load notifications
    loadTeacherNotifications();

    // Set up auto-refresh for notifications (check every 30 seconds)
    setInterval(loadTeacherNotifications, 30000);

    // Add CSS styles
    addStyles();
};

// Function to load and display notifications
function loadTeacherNotifications() {
    console.log("Loading teacher notifications");

    // Get the announcements list container
    const announcementsList = document.getElementById('announcementsList');
    if (!announcementsList) {
        console.error("Announcements list not found");
        return;
    }

    // Get notifications from localStorage
    let notifications = [];
    try {
        const stored = localStorage.getItem('notifications');
        if (stored) {
            notifications = JSON.parse(stored);
        }
    } catch (e) {
        console.error("Error parsing notifications from localStorage:", e);
        return;
    }

    console.log("Retrieved notifications:", notifications);

    // Filter notifications for teachers (all users or teachers only)
    const teacherNotifications = notifications.filter(notification =>
        notification.type === 'all' || notification.type === 'teachers'
    );

    console.log("Teacher notifications:", teacherNotifications);

    // Keep existing teacher announcements
    const existingAnnouncements = Array.from(announcementsList.querySelectorAll('.announcement-card:not(.admin-notification)'));

    // Clear admin notifications
    announcementsList.querySelectorAll('.admin-notification').forEach(el => el.remove());

    // Check if there are any notifications for teachers
    if (teacherNotifications.length === 0) {
        console.log("No notifications for teachers");
        return;
    }

    // Sort notifications by date (newest first)
    teacherNotifications.sort((a, b) => new Date(b.date) - new Date(a.date));

    // Add each notification to the announcements list
    teacherNotifications.forEach(notification => {
        const div = document.createElement('div');
        div.className = 'announcement-card admin-notification alert';

        // Format date
        let formattedDate = "Unknown date";
        try {
            const date = new Date(notification.date);
            formattedDate = date.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            });
        } catch (e) {
            console.error("Error formatting date:", e);
        }

        div.innerHTML = `
            <div class="announcement-header">
                <h3>${notification.title}</h3>
                <span class="admin-badge">From Admin</span>
            </div>
            <div class="announcement-meta">
                <div class="meta-item">
                    <i class="fas fa-calendar"></i>
                    <span>${formattedDate}</span>
                </div>
                <div class="meta-item">
                    <i class="fas fa-tag"></i>
                    <span class="type-tag">System Notification</span>
                </div>
            </div>
            <p class="announcement-content">${notification.message}</p>
        `;

        // Add to the beginning of the announcements list
        if (announcementsList.firstChild) {
            announcementsList.insertBefore(div, announcementsList.firstChild);
        } else {
            announcementsList.appendChild(div);
        }
    });

    console.log("Teacher notifications displayed");
}

// Function to add CSS styles
function addStyles() {
    const style = document.createElement('style');
    style.textContent = `
        .admin-notification {
            border-left: 4px solid #ff9800;
            background-color: rgba(255, 152, 0, 0.1);
            margin-bottom: 15px;
            padding: 15px;
            border-radius: 4px;
        }
        
        .admin-badge {
            background-color: #ff9800;
            color: white;
            padding: 3px 8px;
            border-radius: 4px;
            font-size: 12px;
            font-weight: bold;
            margin-left: 10px;
        }
        
        .announcement-header {
            display: flex;
            align-items: center;
            margin-bottom: 10px;
        }
        
        .announcement-header h3 {
            margin: 0;
            font-size: 18px;
        }
        
        .announcement-meta {
            display: flex;
            margin-bottom: 10px;
            font-size: 14px;
            color: #666;
        }
        
        .meta-item {
            display: flex;
            align-items: center;
            margin-right: 15px;
        }
        
        .meta-item i {
            margin-right: 5px;
        }
        
        .type-tag {
            font-weight: bold;
        }
        
        .announcement-content {
            margin: 0;
            font-size: 15px;
            line-height: 1.5;
        }
    `;
    document.head.appendChild(style);
}
