// Immediately invoked function to set up notifications
(function () {
    console.log("Admin notifications script loaded");

    // Function to initialize the notifications module
    function initNotifications() {
        console.log("Initializing notifications module");

        // Add event listener to the notification form
        const form = document.getElementById('notificationForm');
        if (form) {
            console.log("Found notification form, adding event listener");

            // Remove any existing event listeners
            const newForm = form.cloneNode(true);
            form.parentNode.replaceChild(newForm, form);

            // Add new event listener
            newForm.addEventListener('submit', function (e) {
                e.preventDefault();
                console.log("Form submitted");
                sendNotification();
                return false;
            });

            // Add a direct click handler to the submit button as a fallback
            const submitButton = newForm.querySelector('button[type="submit"]');
            if (submitButton) {
                console.log("Found submit button, adding click handler");
                submitButton.addEventListener('click', function (e) {
                    e.preventDefault();
                    console.log("Submit button clicked");
                    sendNotification();
                    return false;
                });
            } else {
                console.error("Submit button not found");
            }
        } else {
            console.error("Notification form not found");
        }

        // Load existing notifications
        displayNotifications();

        // Add CSS styles
        addStyles();
    }

    // Initialize when DOM is loaded
    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", initNotifications);
    } else {
        initNotifications();
    }
})();

// Function to send a notification
function sendNotification() {
    console.log("Send notification function called");

    try {
        // Get form elements
        const typeElement = document.getElementById('notificationType');
        const titleElement = document.getElementById('notificationTitle');
        const messageElement = document.getElementById('notificationMessage');

        if (!typeElement || !titleElement || !messageElement) {
            console.error("Form elements not found");
            alert("Error: Form elements not found. Please refresh the page and try again.");
            return;
        }

        // Get form values
        const type = typeElement.value;
        const title = titleElement.value;
        const message = messageElement.value;

        console.log("Form values:", { type, title, message });

        // Validate form
        if (!type) {
            alert('Please select a notification type');
            typeElement.focus();
            return;
        }

        if (!title) {
            alert('Please enter a notification title');
            titleElement.focus();
            return;
        }

        if (!message) {
            alert('Please enter a notification message');
            messageElement.focus();
            return;
        }

        // Create notification object
        const notification = {
            id: Date.now().toString(),
            type: type,
            title: title,
            message: message,
            date: new Date().toISOString()
        };

        console.log("Creating notification:", notification);

        // Get existing notifications or initialize empty array
        let notifications = [];
        try {
            const stored = localStorage.getItem('notifications');
            if (stored) {
                notifications = JSON.parse(stored);
            }
        } catch (e) {
            console.error("Error parsing notifications from localStorage:", e);
            notifications = []; // Reset to empty array if parsing fails
        }

        if (!Array.isArray(notifications)) {
            console.error("Notifications is not an array, resetting");
            notifications = [];
        }

        // Add new notification
        notifications.push(notification);

        // Save to localStorage
        try {
            localStorage.setItem('notifications', JSON.stringify(notifications));
            console.log("Notification saved to localStorage:", notifications);
        } catch (e) {
            console.error("Error saving notifications to localStorage:", e);
            alert("Error saving notification. Please try again.");
            return;
        }

        // Reset form
        typeElement.value = '';
        titleElement.value = '';
        messageElement.value = '';

        // Refresh the notifications display
        displayNotifications();

        // Show success message
        let recipientText = "Unknown";
        if (type === 'all') recipientText = "All Users";
        if (type === 'teachers') recipientText = "Teachers Only";
        if (type === 'students') recipientText = "Students Only";

        alert(`Notification sent successfully to ${recipientText}`);
    } catch (error) {
        console.error("Error in sendNotification function:", error);
        alert("An error occurred while sending the notification. Please try again.");
    }
}

// Function to display notifications
function displayNotifications() {
    console.log("Display notifications function called");

    const tableBody = document.getElementById('notificationsTableBody');
    if (!tableBody) {
        console.error("Notifications table body not found");
        return;
    }

    // Clear existing content
    tableBody.innerHTML = '';

    // Get notifications from localStorage
    let notifications = [];
    try {
        const stored = localStorage.getItem('notifications');
        if (stored) {
            notifications = JSON.parse(stored);
        }
    } catch (e) {
        console.error("Error parsing notifications from localStorage:", e);
    }

    console.log("Retrieved notifications:", notifications);

    // Check if there are any notifications
    if (!notifications || notifications.length === 0) {
        const emptyRow = document.createElement('tr');
        emptyRow.innerHTML = '<td colspan="4" style="text-align: center;">No notifications found</td>';
        tableBody.appendChild(emptyRow);
        return;
    }

    // Sort notifications by date (newest first)
    notifications.sort((a, b) => new Date(b.date) - new Date(a.date));

    // Add each notification to the table
    notifications.forEach(notification => {
        const row = document.createElement('tr');

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

        // Get recipient text
        let recipientText = "Unknown";
        if (notification.type === 'all') recipientText = "All Users";
        if (notification.type === 'teachers') recipientText = "Teachers Only";
        if (notification.type === 'students') recipientText = "Students Only";

        // Create row content
        row.innerHTML = `
            <td>${notification.title}</td>
            <td>${recipientText}</td>
            <td>${formattedDate}</td>
            <td>
                <button class="delete-btn" onclick="deleteNotification('${notification.id}')">Delete</button>
            </td>
        `;

        tableBody.appendChild(row);
    });
}

// Function to delete a notification
function deleteNotification(id) {
    console.log("Delete notification function called for ID:", id);

    // Get notifications from localStorage
    let notifications = [];
    try {
        const stored = localStorage.getItem('notifications');
        if (stored) {
            notifications = JSON.parse(stored);
        }
    } catch (e) {
        console.error("Error parsing notifications from localStorage:", e);
    }

    // Filter out the notification to delete
    notifications = notifications.filter(notification => notification.id !== id);

    // Save updated notifications to localStorage
    try {
        localStorage.setItem('notifications', JSON.stringify(notifications));
        console.log("Updated notifications saved to localStorage");
    } catch (e) {
        console.error("Error saving updated notifications to localStorage:", e);
        alert("Error deleting notification. Please try again.");
        return;
    }

    // Refresh the notifications display
    displayNotifications();

    // Show success message
    alert('Notification deleted successfully');
}

// Function to add CSS styles
function addStyles() {
    const style = document.createElement('style');
    style.textContent = `
        #notificationsTable {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
        }

        #notificationsTable th, #notificationsTable td {
            padding: 12px;
            text-align: left;
            border-bottom: 1px solid #ddd;
        }

        #notificationsTable th {
            background-color: #f2f2f2;
            font-weight: bold;
        }

        #notificationsTable tr:hover {
            background-color: #f5f5f5;
        }

        .delete-btn {
            background-color: #f44336;
            color: white;
            border: none;
            padding: 6px 12px;
            border-radius: 4px;
            cursor: pointer;
            font-size: 14px;
        }

        .delete-btn:hover {
            background-color: #d32f2f;
        }

        #notificationForm {
            margin-bottom: 20px;
        }

        #notificationForm .form-group {
            margin-bottom: 15px;
        }

        #notificationForm label {
            display: block;
            margin-bottom: 5px;
            font-weight: bold;
        }

        #notificationForm select,
        #notificationForm input,
        #notificationForm textarea {
            width: 100%;
            padding: 8px;
            border: 1px solid #ddd;
            border-radius: 4px;
        }

        #notificationForm button {
            background-color: #4CAF50;
            color: white;
            border: none;
            padding: 10px 15px;
            border-radius: 4px;
            cursor: pointer;
            font-size: 16px;
        }

        #notificationForm button:hover {
            background-color: #45a049;
        }
    `;
    document.head.appendChild(style);
}
