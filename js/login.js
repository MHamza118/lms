// Predefined user credentials
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

    // Validate credentials
    if (users[userType] && users[userType].username === username && users[userType].password === password) {
        // Save user information to session storage
        sessionStorage.setItem('currentUserType', userType);
        sessionStorage.setItem('currentUsername', username);

        // Redirect to appropriate dashboard
        switch(userType) {
            case 'Administrator':
                window.location.href = 'users/admin.html';
                break;
            case 'ClassTeacher':
                window.location.href = 'users/teacher.html';
                break;
            case 'Student':
                window.location.href = 'users/student.html';
                break;
            default:
                alert("Error: Invalid user type");
        }
    } else {
        alert("Invalid credentials. Please try again.");
    }
} 