/********************
  GLOBAL SETTINGS
*********************/
const urlBase = 'http://COP4331-1.online/LAMPAPI';
const extension = 'php';

// If the user is already logged in, we get their info from localStorage:
let userId = localStorage.getItem('userId') || 0;
let firstName = localStorage.getItem('firstName') || "";
let lastName = localStorage.getItem('lastName') || "";

/***************************************************
   TOGGLE BETWEEN LOGIN AND SIGNUP FORMS
****************************************************/
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

/***************************************************
   LOGIN API
****************************************************/
document.getElementById('login-form').addEventListener('submit', async function (e) {
    e.preventDefault();

    const login = document.getElementById("login-username").value;
    const password = document.getElementById("login-password").value;

    let payload = { Login: login, Password: password };
    let jsonPayload = JSON.stringify(payload);

    let url = `${urlBase}/Login.${extension}`;

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: jsonPayload
        });

        const result = await response.json();
        if (response.ok && result.ID > 0) {
            localStorage.setItem('userId', result.ID);
            localStorage.setItem('firstName', result.FirstName);
            localStorage.setItem('lastName', result.LastName);

            // Update global variables
            userId = result.ID;
            firstName = result.FirstName;
            lastName = result.LastName;

            alert(`Welcome, ${result.FirstName} ${result.LastName}!`);

            // Hide login/signup, show dashboard
            document.querySelector('.form-container').classList.add('hidden');
            document.querySelector('.dashboard-container').classList.remove('hidden');

            // Load contacts for the user
            setTimeout(loadContacts, 500);
        } else {
            alert(result.error || "Invalid login credentials. Please try again.");
        }
    } catch (error) {
        console.error("Error during login:", error);
        alert("An error occurred while logging in. Please try again later.");
    }
});

/***************************************************
   SIGNUP VALIDATION HELPERS
****************************************************/
// 1) Check username: 3–18 chars, at least one letter, only letters/numbers
function isValidUsername(u) {
    // length must be 3–18
    if (u.length < 3 || u.length > 18) {
        return false;
    }
    // must contain at least one letter
    const hasLetter = /[a-zA-Z]/.test(u);
    // must be only letters and digits
    const onlyLettersNumbers = /^[A-Za-z0-9]+$/.test(u);

    return hasLetter && onlyLettersNumbers;
}

// 2) Check password: 8–32 chars, at least one uppercase letter, one digit, one special char (@$!%*?&)
function isValidPassword(p) {
    // length 8–32
    if (p.length < 8 || p.length > 32) {
        return false;
    }
    // must have an uppercase letter
    const hasUpper = /[A-Z]/.test(p);
    // must have a digit
    const hasDigit = /\d/.test(p);
    // must have one of @$!%*?&
    const hasSpecial = /[@$!%*?&]/.test(p);

    return hasUpper && hasDigit && hasSpecial;
}

/***************************************************
   VERIFY USERNAME HELPER
****************************************************/
async function verifyUsername(login) {
    const verifyUrl = `${urlBase}/VerifyUsername.${extension}`;
    const payload = { Login: login };
    const jsonPayload = JSON.stringify(payload);

    try {
        const response = await fetch(verifyUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: jsonPayload
        });

        const result = await response.json();
        if (!response.ok || result.error) {
            console.error("Error from VerifyUsername:", result.error);
            throw new Error(result.error || "VerifyUsername failed");
        }

        // Return the number of matching logins found
        return result.foundContacts;
    }
    catch (error) {
        console.error("Exception in verifyUsername:", error);
        throw error;
    }
}

/***************************************************
   SIGNUP API
****************************************************/
document.getElementById('signup-form').addEventListener('submit', async function (e) {
    e.preventDefault();

    const firstName = document.getElementById("signup-firstname").value;
    const lastName  = document.getElementById("signup-lastname").value;
    const login     = document.getElementById("signup-username").value;
    const password  = document.getElementById("signup-password").value;

    // 1) Check username format
    if (!isValidUsername(login)) {
        alert("Username must:\n" +
              "• Be 3-18 characters long\n" +
              "• Contain at least one letter\n" +
              "• Include only letters and numbers");
        return;
    }

    // 2) Check password format
    if (!isValidPassword(password)) {
        alert("Password must:\n" +
              "• Be 8-32 characters long\n" +
              "• Contain at least one uppercase letter\n" +
              "• Contain at least one number\n" +
              "• Contain at least one special character (@$!%*?&)");
        return;
    }

    // 3) Verify if username is already taken
    try {
        const matches = await verifyUsername(login);
        if (matches > 0) {
            alert("Username already in use. Please choose a different one.");
            return; // Stop signup
        }
    } catch (err) {
        console.error("Error verifying username:", err);
        alert("Error verifying username. Please try again later.");
        return;
    }

    // 4) If no duplicates, proceed with normal Sign Up
    let payload = {
        FirstName: firstName,
        LastName:  lastName,
        Login:     login,
        Password:  password
    };
    let jsonPayload = JSON.stringify(payload);

    let url = `${urlBase}/SignUp.${extension}`;

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: jsonPayload
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

/***************************************************
   LOGOUT
****************************************************/
document.getElementById("logout-button").addEventListener("click", function () {
    console.log("Logging out...");

    // Clear localStorage
    localStorage.removeItem("userId");
    localStorage.removeItem("firstName");
    localStorage.removeItem("lastName");

    // Hide dashboard, show login form
    document.querySelector(".dashboard-container").classList.add("hidden");
    document.querySelector(".form-container").classList.remove("hidden");

    // Reload to reset
    window.location.reload();
});

/***************************************************
   ADD CONTACT (Uses prompts)
****************************************************/
async function addContact() {
    const fn = prompt("Enter first name:");
    if (!fn) { alert("All fields are required to add a contact."); return; }

    const ln = prompt("Enter last name:");
    if (!ln) { alert("All fields are required to add a contact."); return; }

    const ph = prompt("Enter phone number:");
    if (!ph) { alert("All fields are required to add a contact."); return; }

    const em = prompt("Enter email address:");
    if (!em) { alert("All fields are required to add a contact."); return; }

    let payload = {
        UserID: userId,
        FirstName: fn,
        LastName: ln,
        Phone: ph,
        Email: em
    };

    let jsonPayload = JSON.stringify(payload);
    let url = `${urlBase}/AddContact.${extension}`;

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: jsonPayload
        });
        const result = await response.json();
        if (response.ok && !result.error) {
            alert("Contact added successfully!");
            loadContacts();
        } else {
            alert(result.error || "Failed to add contact.");
        }
    } catch (error) {
        console.error("Error adding contact:", error);
        alert("An error occurred while adding the contact.");
    }
}

/***************************************************
   SEARCH CONTACTS
****************************************************/
async function searchContacts() {
    const searchInput = document.getElementById("search-input").value.trim();

    let payload = {
        UserID: userId,
        searchInput: searchInput
    };

    let jsonPayload = JSON.stringify(payload);
    let url = `${urlBase}/SearchContacts.${extension}`;

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: jsonPayload
        });

        const result = await response.json();
        console.log("Search API Response:", result);

        if (response.ok && result.results) {
            displayContacts(result.results);
        } else {
            // If there's an error or no results, show an empty table
            displayContacts([]);
        }
    } catch (error) {
        console.error("Error searching contacts:", error);
        alert("An error occurred while searching. Please try again.");
    }
}

/***************************************************
   DELETE CONTACT
****************************************************/
async function deleteContact(fn, ln, ph, em) {
    let confirmDelete = confirm(`Are you sure you want to delete ${fn} ${ln}?`);
    if (!confirmDelete) return;

    let payload = {
        FirstName: fn,
        LastName: ln,
        Phone: ph,
        Email: em
    };

    let jsonPayload = JSON.stringify(payload);
    let url = urlBase + '/DeleteContact.' + extension;

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: jsonPayload
        });
        const result = await response.json();

        if (response.ok && !result.error) {
            alert(`Deleted contact: ${fn} ${ln}`);
            loadContacts();
        } else {
            alert(result.error || "Failed to delete contact.");
        }
    } catch (error) {
        console.error("Error deleting contact:", error);
        alert("An error occurred while deleting the contact.");
    }
}

/***************************************************
   EDIT CONTACT
****************************************************/
async function editContact(contactID, oldFirst, oldLast, oldPhone, oldEmail) {
    const newFirst = prompt("Enter new first name:", oldFirst);
    if (newFirst === null) return;

    const newLast = prompt("Enter new last name:", oldLast);
    if (newLast === null) return;

    const newPhone = prompt("Enter new phone number:", oldPhone);
    if (newPhone === null) return;

    const newEmail = prompt("Enter new email:", oldEmail);
    if (newEmail === null) return;

    if (!newFirst || !newLast || !newPhone || !newEmail) {
        alert("All fields are required to edit a contact.");
        return;
    }

    let payload = {
        UserID: userId,
        ContactID: contactID,
        FirstName: newFirst,
        LastName: newLast,
        Phone: newPhone,
        Email: newEmail
    };

    let jsonPayload = JSON.stringify(payload);
    let url = `${urlBase}/EditContact.${extension}`;

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: jsonPayload
        });
        const result = await response.json();

        if (response.ok && !result.error) {
            alert("Contact updated successfully!");
            loadContacts();
        } else {
            alert(result.error || "Failed to update contact.");
        }
    } catch (error) {
        console.error("Error updating contact:", error);
        alert("An error occurred while updating the contact.");
    }
}

/***************************************************
   DISPLAY CONTACTS
****************************************************/
function displayContacts(contacts) {
    const tableBody = document.querySelector('.contact-table tbody');
    tableBody.innerHTML = "";

    if (!contacts || contacts.length === 0) {
        tableBody.innerHTML = "<tr><td colspan='5'>No contacts found.</td></tr>";
        return;
    }

    contacts.forEach((contact) => {
        const row = `
            <tr>
                <td>${contact.FirstName}</td>
                <td>${contact.LastName}</td>
                <td>${contact.Phone}</td>
                <td>${contact.Email}</td>
                <td>
                    <button onclick="editContact(
                        '${contact.ContactID}',
                        '${contact.FirstName}',
                        '${contact.LastName}',
                        '${contact.Phone}',
                        '${contact.Email}'
                    )">
                        <i class="fa-solid fa-pencil"></i>
                    </button>

                    <button onclick="deleteContact(
                        '${contact.FirstName}',
                        '${contact.LastName}',
                        '${contact.Phone}',
                        '${contact.Email}'
                    )">
                        <i class="fa-solid fa-trash"></i>
                    </button>
                </td>
            </tr>
        `;
        tableBody.insertAdjacentHTML("beforeend", row);
    });
}

/***************************************************
   LOAD ALL CONTACTS (Helper)
****************************************************/
function loadContacts() {
    console.log("Loading contacts...");
    document.getElementById("search-input").value = "";
    searchContacts();
}

// "Search" button
document.getElementById("search-button").addEventListener("click", searchContacts);

// "Show All" button
document.getElementById("show-all-button").addEventListener("click", function() {
    document.getElementById("search-input").value = "";
    loadContacts();
});

// Clear search => reload
document.getElementById("search-input").addEventListener("input", function () {
    if (this.value.trim() === "") {
        loadContacts();
    }
});

// "Add New Contact" button
document.querySelector(".add-contact button").addEventListener("click", addContact);

/***************************************************
   TOOLTIPS
****************************************************/
function toggleTooltip(tooltipId) {
    const tooltip = document.getElementById(tooltipId);
    if (!tooltip) return;

    // Close all other tooltips
    document.querySelectorAll('.tooltip').forEach((tip) => {
        if (tip.id !== tooltipId) {
            tip.classList.remove('active');
        }
    });

    // Toggle the selected tooltip
    tooltip.classList.toggle('active');
}

document.addEventListener("DOMContentLoaded", function () {
    const usernameTooltipBtn = document.getElementById("username-tooltip-btn");
    const passwordTooltipBtn = document.getElementById("password-tooltip-btn");

    if (usernameTooltipBtn) {
        usernameTooltipBtn.addEventListener("click", function (e) {
            e.preventDefault();
            toggleTooltip("username-tooltip");
        });
    }

    if (passwordTooltipBtn) {
        passwordTooltipBtn.addEventListener("click", function (e) {
            e.preventDefault();
            toggleTooltip("password-tooltip");
        });
    }

    // Close tooltips when clicking outside
    document.addEventListener("click", function (e) {
        const isTooltipButton = e.target.matches(".tooltip-btn");
        const isTooltip = e.target.closest(".tooltip");

        if (!isTooltipButton && !isTooltip) {
            document.querySelectorAll(".tooltip").forEach((tooltip) => {
                tooltip.classList.remove("active");
            });
        }
    });
});
