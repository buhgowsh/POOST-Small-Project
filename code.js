// Toggle between Login and Signup forms
function toggleForm(formType) {
    const loginBox = document.querySelector('.login-box');
    const signupBox = document.querySelector('.signup-box');

    if (formType === 'signup') {
        loginBox.classList.remove('active');
        signupBox.classList.add('active');
    } else if (formType === 'login') {
        signupBox.classList.remove('active');
        loginBox.classList.add('active');
    }
}

// Password validation for the Signup form
document.getElementById('signup-form').addEventListener('submit', function (e) {
    const passwordInput = document.getElementById('signup-password');
    const password = passwordInput.value;

    const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,12}$/;

    if (!passwordRegex.test(password)) {
        e.preventDefault();
        alert('Password must be 8-12 characters long, contain at least one capital letter, one number, and one special character.');
        passwordInput.focus();
    }
});

// Show the dashboard on login
document.getElementById('login-form').addEventListener('submit', function (e) {
    e.preventDefault(); // Prevent form submission to backend (for now)
    document.querySelector('.form-container').classList.add('hidden'); // Hide login/signup forms
    document.querySelector('.dashboard-container').classList.remove('hidden'); // Show the dashboard
});

// Logout functionality
document.getElementById('logout-button').addEventListener('click', function () {
    document.querySelector('.dashboard-container').classList.add('hidden'); // Hide dashboard
    document.querySelector('.form-container').classList.remove('hidden'); // Show login/signup forms
});
