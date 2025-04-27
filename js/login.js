// Default credentials
const defaultUsers = {
    Administrator: { username: "admin@example.com", password: "admin123" },
    Student: { username: "student@example.com", password: "student123" },
    ClassTeacher: { username: "teacher@example.com", password: "teacher123" }
};

// Handle login form submission
function handleLogin(event) {
    event.preventDefault();

    const userType = document.querySelector("select[name='userType']").value;
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    if (!userType || !username || !password) {
        alert("Please fill in all fields");
        return;
    }

    // First check if it's one of the default users
    if (defaultUsers[userType] && defaultUsers[userType].username === username && defaultUsers[userType].password === password) {
        console.log("Logging in with default credentials for " + userType);
        sessionStorage.setItem('currentUserType', userType);

        // Set appropriate username based on user type
        let displayName = userType;
        if (userType === 'Administrator') displayName = 'Administrator';
        else if (userType === 'Student') displayName = 'Default Student';
        else if (userType === 'ClassTeacher') displayName = 'Default Teacher';

        sessionStorage.setItem('currentUsername', displayName);
        redirectToUserDashboard(userType);
        return;
    }

    // Then check registered users
    const registeredUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
    console.log("Checking registered users:", registeredUsers.length);

    // Check for matching email and password with the selected user type
    const user = registeredUsers.find(u =>
        u.email === username &&
        u.password === password &&
        u.type === userType
    );

    if (user) {
        console.log("User found:", user.name, user.type);

        // Check if user is active
        if (user.status !== 'active') {
            alert("Your account is not active. Please contact the administrator.");
            return;
        }

        // Store user info in session storage
        sessionStorage.setItem('currentUserType', user.type);
        sessionStorage.setItem('currentUsername', user.name);
        sessionStorage.setItem('currentUserId', user.id);

        // Redirect to appropriate dashboard
        redirectToUserDashboard(user.type);
    } else {
        // Show more specific error message
        const userExists = registeredUsers.find(u => u.email === username);

        if (userExists) {
            if (userExists.type !== userType) {
                alert("Incorrect user type selected. Please select the correct user type.");
            } else {
                alert("Incorrect password. Please try again.");
            }
        } else {
            alert("User not found. Please check your email or contact the administrator.");
        }
    }
}

function redirectToUserDashboard(userType) {
    switch (userType) {
        case 'Administrator':
            window.location.href = 'users/admin.html';
            break;
        case 'ClassTeacher':
        case 'teacher':
            window.location.href = 'users/teacher.html';
            break;
        case 'Student':
        case 'student':
            window.location.href = 'users/student.html';
            break;
        default:
            alert("Error: Invalid user type");
    }
}

// Listen for test login messages from admin panel
window.addEventListener('message', function (event) {
    const data = event.data;

    // Check if this is a test login request
    if (data && data.action === 'test-login') {
        console.log('Received test login request:', data);

        // Fill in the login form
        document.getElementById('username').value = data.email;
        document.getElementById('password').value = data.password;

        // Select the correct user type
        const userTypeSelect = document.querySelector("select[name='userType']");
        for (let i = 0; i < userTypeSelect.options.length; i++) {
            if (userTypeSelect.options[i].value === data.userType) {
                userTypeSelect.selectedIndex = i;
                break;
            }
        }

        // Submit the form automatically
        setTimeout(function () {
            document.getElementById('loginForm').dispatchEvent(new Event('submit'));

            // Notify the opener that login test is complete
            if (window.opener) {
                window.opener.postMessage('login-test-complete', '*');
            }
        }, 1000);
    }
});

// Add event listener when DOM is loaded
document.addEventListener('DOMContentLoaded', function () {
    // Add visual feedback for login form
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');
    const userTypeSelect = document.querySelector("select[name='userType']");

    // Add focus styles
    [usernameInput, passwordInput, userTypeSelect].forEach(element => {
        element.addEventListener('focus', function () {
            this.parentElement.classList.add('focused');
        });

        element.addEventListener('blur', function () {
            if (!this.value) {
                this.parentElement.classList.remove('focused');
            }
        });

        // Check if field already has value on page load
        if (element.value) {
            element.parentElement.classList.add('focused');
        }
    });
});