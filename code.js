const urlBase = 'http://COP4331-1.online/LAMPAPI';
const extension = 'php';

let userId = 0;
let firstName = "";
let lastName = "";

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

// REMOVE LATER: Debug Dashboard Button Functionality
document.getElementById("debug-dashboard-button").addEventListener("click", function () {
    document.querySelector('.form-container').classList.add('hidden');
    document.querySelector('.dashboard-container').classList.remove('hidden');
});

// Logout Button Listener
document.getElementById("logout-button").addEventListener("click", function () {
    document.querySelector('.dashboard-container').classList.add('hidden');
    document.querySelector('.form-container').classList.remove('hidden');
    doLogout();
});

// Login API Integration
document.getElementById('login-form').addEventListener('submit', async function (e) {
    e.preventDefault();

    const login = document.getElementById("login-username").value;
    const password = document.getElementById("login-password").value;

    let payload = { Login: login, Password: password };
    let jsonPayload = JSON.stringify(payload);

    let url = urlBase + '/Login.' + extension;

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: jsonPayload,
        });

        const result = await response.json();

        if (response.ok && result.ID > 0) {
            userId = result.ID;
            firstName = result.FirstName;
            lastName = result.LastName;

            saveCookie();
            alert(`Welcome back, ${firstName} ${lastName}!`);
            document.querySelector('.form-container').classList.add('hidden');
            document.querySelector('.dashboard-container').classList.remove('hidden');
        } else {
            alert(result.error || "Invalid login credentials. Please try again.");
        }
    } catch (error) {
        console.error("Error during login:", error);
        alert("An error occurred while logging in. Please try again later.");
    }
});

// Signup API Integration
document.getElementById('signup-form').addEventListener('submit', async function (e) {
    e.preventDefault();

    const firstName = document.getElementById("signup-firstname").value;
    const lastName = document.getElementById("signup-lastname").value;
    const login = document.getElementById("signup-username").value;
    const password = document.getElementById("signup-password").value;

    let payload = { FirstName: firstName, LastName: lastName, Login: login, Password: password };
    let jsonPayload = JSON.stringify(payload);

    let url = urlBase + '/SignUp.' + extension;

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: jsonPayload,
        });

        const result = await response.json();

        if (response.ok && !result.error) {
            alert("Signup successful! Please log in.");
            toggleForm('login');
        } else {
            alert(result.error || "Signup failed. Please try again.");
        }
    } catch (error) {
        console.error("Error during signup:", error);
        alert("An error occurred while signing up. Please try again later.");
    }
});

// Save Cookie
function saveCookie() {
    let minutes = 20;
    let date = new Date();
    date.setTime(date.getTime() + minutes * 60 * 1000);
    document.cookie = `firstName=${firstName},lastName=${lastName},userId=${userId};expires=${date.toGMTString()}`;
}

// Logout Functionality
function doLogout() {
    userId = 0;
    firstName = "";
    lastName = "";
    document.cookie = "firstName= ; expires = Thu, 01 Jan 1970 00:00:00 GMT";
}
