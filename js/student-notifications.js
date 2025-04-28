// Wait for the DOM to be fully loaded
window.onload = function () {
    console.log("Student notifications script loaded");

    // Load notifications
    loadStudentNotifications();

    // Set up auto-refresh for notifications (check every 30 seconds)
    setInterval(loadStudentNotifications, 30000);

    // Set up notification bell functionality
    setupNotificationBell();

    // Add CSS styles
    addStyles();
};

// Function to load and display notifications
function loadStudentNotifications() {
    console.log("Loading student notifications");

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

    // Filter notifications for students (all users or students only)
    const studentNotifications = notifications.filter(notification =>
        notification.type === 'all' || notification.type === 'students'
    );

    console.log("Student notifications:", studentNotifications);

    // Keep existing teacher announcements
    const existingAnnouncements = Array.from(announcementsList.querySelectorAll('.announcement-card:not(.admin-notification)'));

    // Clear admin notifications
    announcementsList.querySelectorAll('.admin-notification').forEach(el => el.remove());

    // Check if there are any notifications for students
    if (studentNotifications.length === 0) {
        console.log("No notifications for students");
        return;
    }

    // Sort notifications by date (newest first)
    studentNotifications.sort((a, b) => new Date(b.date) - new Date(a.date));

    // Add each notification to the announcements list
    studentNotifications.forEach(notification => {
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

    // Update notification bell
    updateNotificationBell(studentNotifications);

    console.log("Student notifications displayed");
}

// Function to set up notification bell
function setupNotificationBell() {
    const notificationBell = document.getElementById('notificationBell');
    const notificationPopup = document.getElementById('notificationPopup');

    if (!notificationBell || !notificationPopup) {
        console.error("Notification bell or popup not found");
        return;
    }

    console.log("Setting up notification bell");

    // Toggle notification popup when bell is clicked
    notificationBell.addEventListener('click', function () {
        notificationPopup.classList.toggle('show');

        // Mark notifications as read when popup is opened
        if (notificationPopup.classList.contains('show')) {
            const viewedNotifications = JSON.parse(sessionStorage.getItem('viewedNotifications') || '[]');

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

            // Filter notifications for students
            const studentNotifications = notifications.filter(notification =>
                notification.type === 'all' || notification.type === 'students'
            );

            // Add all notification IDs to viewed notifications
            studentNotifications.forEach(notification => {
                if (!viewedNotifications.includes(notification.id)) {
                    viewedNotifications.push(notification.id);
                }
            });

            // Save viewed notifications to sessionStorage
            sessionStorage.setItem('viewedNotifications', JSON.stringify(viewedNotifications));

            // Remove notification badge
            const badge = notificationBell.querySelector('.notification-badge');
            if (badge) {
                badge.remove();
            }
        }
    });

    // Close notification popup when clicking outside
    document.addEventListener('click', function (event) {
        if (!notificationBell.contains(event.target) && notificationPopup.classList.contains('show')) {
            notificationPopup.classList.remove('show');
        }
    });
}

// Function to update notification bell
function updateNotificationBell(notifications) {
    const notificationBell = document.getElementById('notificationBell');
    const notificationPopup = document.getElementById('notificationPopup');

    if (!notificationBell || !notificationPopup) {
        console.error("Notification bell or popup not found");
        return;
    }

    // Get viewed notifications from sessionStorage
    const viewedNotifications = JSON.parse(sessionStorage.getItem('viewedNotifications') || '[]');

    // Filter unread notifications
    const unreadNotifications = notifications.filter(notification =>
        !viewedNotifications.includes(notification.id)
    );

    console.log("Unread notifications:", unreadNotifications.length);

    // Update notification badge
    const existingBadge = notificationBell.querySelector('.notification-badge');
    if (existingBadge) {
        existingBadge.remove();
    }

    if (unreadNotifications.length > 0) {
        const badge = document.createElement('span');
        badge.className = 'notification-badge';
        badge.textContent = unreadNotifications.length;
        notificationBell.appendChild(badge);
    }

    // Update notification popup content
    notificationPopup.innerHTML = '';

    if (notifications.length === 0) {
        notificationPopup.innerHTML = '<div class="no-notifications">No notifications</div>';
        return;
    }

    // Add notification header
    const header = document.createElement('div');
    header.className = 'notification-header';
    header.innerHTML = '<h3>Notifications</h3>';
    notificationPopup.appendChild(header);

    // Add notifications to popup
    notifications.slice(0, 5).forEach(notification => {
        const item = document.createElement('div');
        item.className = 'notification-item';
        if (!viewedNotifications.includes(notification.id)) {
            item.classList.add('unread');
        }

        // Format date
        let formattedDate = "Unknown date";
        try {
            const date = new Date(notification.date);
            formattedDate = date.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric'
            });
        } catch (e) {
            console.error("Error formatting date:", e);
        }

        item.innerHTML = `
            <div class="notification-title">${notification.title}</div>
            <div class="notification-message">${notification.message.substring(0, 50)}${notification.message.length > 50 ? '...' : ''}</div>
            <div class="notification-date">${formattedDate}</div>
        `;

        notificationPopup.appendChild(item);
    });

    // Add view all link if there are more than 5 notifications
    if (notifications.length > 5) {
        const viewAll = document.createElement('div');
        viewAll.className = 'view-all-notifications';
        viewAll.innerHTML = '<a href="#dashboard">View All</a>';
        notificationPopup.appendChild(viewAll);
    }
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
        
        .notification-badge {
            position: absolute;
            top: -5px;
            right: -5px;
            background-color: #f44336;
            color: white;
            border-radius: 50%;
            width: 18px;
            height: 18px;
            font-size: 12px;
            display: flex;
            justify-content: center;
            align-items: center;
        }
        
        .notification-popup {
            display: none;
            position: absolute;
            top: 40px;
            right: 0;
            width: 300px;
            background-color: white;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
            z-index: 1000;
            max-height: 400px;
            overflow-y: auto;
        }
        
        .notification-popup.show {
            display: block;
        }
        
        .notification-header {
            padding: 10px 15px;
            border-bottom: 1px solid #eee;
        }
        
        .notification-header h3 {
            margin: 0;
            font-size: 16px;
        }
        
        .notification-item {
            padding: 10px 15px;
            border-bottom: 1px solid #eee;
            cursor: pointer;
        }
        
        .notification-item:hover {
            background-color: #f9f9f9;
        }
        
        .notification-item.unread {
            background-color: #f0f7ff;
        }
        
        .notification-title {
            font-weight: bold;
            margin-bottom: 5px;
        }
        
        .notification-message {
            font-size: 13px;
            color: #666;
            margin-bottom: 5px;
        }
        
        .notification-date {
            font-size: 12px;
            color: #999;
            text-align: right;
        }
        
        .no-notifications {
            padding: 15px;
            text-align: center;
            color: #666;
        }
        
        .view-all-notifications {
            padding: 10px 15px;
            text-align: center;
            border-top: 1px solid #eee;
        }
        
        .view-all-notifications a {
            color: #2196F3;
            text-decoration: none;
        }
    `;
    document.head.appendChild(style);
}
