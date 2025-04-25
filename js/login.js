const users = {
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

    // First check hardcoded credentials
    if (users[userType] && users[userType].username === username && users[userType].password === password) {
        sessionStorage.setItem('currentUserType', userType);
        sessionStorage.setItem('currentUsername', username);
        redirectToUserDashboard(userType);
        return;
    }

    // Then check registered users
    const registeredUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
    const user = registeredUsers.find(u => u.email === username && u.password === password && u.type === userType);

    if (user) {
        sessionStorage.setItem('currentUserType', user.type);
        sessionStorage.setItem('currentUsername', user.name);
        redirectToUserDashboard(user.type);
    } else {
        alert("Invalid credentials. Please try again.");
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