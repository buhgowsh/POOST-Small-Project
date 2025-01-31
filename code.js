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
   SIGNUP API
****************************************************/
document.getElementById('signup-form').addEventListener('submit', async function (e) {
    e.preventDefault();

    const firstName = document.getElementById("signup-firstname").value;
    const lastName = document.getElementById("signup-lastname").value;
    const login = document.getElementById("signup-username").value;
    const password = document.getElementById("signup-password").value;

    let payload = {
        FirstName: firstName,
        LastName: lastName,
        Login: login,
        Password: password
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
   ADD CONTACT
****************************************************/
async function addContact() {
    // Prompt the user for contact details:
    const fn = prompt("Enter first name:");
    if (!fn) { alert("All fields are required to add a contact."); return; }

    const ln = prompt("Enter last name:");
    if (!ln) { alert("All fields are required to add a contact."); return; }

    const ph = prompt("Enter phone number:");
    if (!ph) { alert("All fields are required to add a contact."); return; }

    const em = prompt("Enter email address:");
    if (!em) { alert("All fields are required to add a contact."); return; }

    // Build payload (notice capital "UserID" to match your AddContact.php)
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
            // Reload the contacts so the new one shows
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
        UserID: userId,    // capital "UserID" for SearchContacts.php
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
        console.log("Search API Response:", result); // debugging

        if (response.ok && result.results) {
            displayContacts(result.results);
        } else {
            // If there's an error or no results, show empty
            displayContacts([]);
        }
    } catch (error) {
        console.error("Error searching contacts:", error);
        alert("An error occurred while searching. Please try again.");
    }
}

/***************************************************
   DELETE CONTACT
   (DeleteContact.php expects "FirstName")
****************************************************/
async function deleteContact(fn, ln, ph, em) {
    let confirmDelete = confirm(`Are you sure you want to delete ${fn} ${ln}?`);
    if (!confirmDelete) return;

    // The payload must match the 4 fields that DeleteContact.php expects
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
            loadContacts(); // Refresh the contact list
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
   (EditContact.php expects "UserID" and "ContactID")
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
        UserID: userId,         // Must match $inData["UserID"] in EditContact.php
        ContactID: contactID,    // Must match $inData["ContactID"] in EditContact.php
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
            loadContacts(); // Refresh
        } else {
            alert(result.error || "Failed to update contact.");
        }
    } catch (error) {
        console.error("Error updating contact:", error);
        alert("An error occurred while updating the contact.");
    }
}

/***************************************************
   DISPLAY CONTACTS (Fill the table)
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
                    <!-- EDIT pencil button (restore this part) -->
                    <button onclick="editContact(
                        '${contact.ContactID}', 
                        '${contact.FirstName}', 
                        '${contact.LastName}', 
                        '${contact.Phone}', 
                        '${contact.Email}'
                    )">
                        <i class="fa-solid fa-pencil"></i>
                    </button>

                    <!-- DELETE trash icon button -->
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
    searchContacts(); // Just calls search with an empty string
}

// Listen for clicks on the "Search" button:
document.getElementById("search-button").addEventListener("click", searchContacts);

// Listen for clicks on the "Show All" button:
document.getElementById("show-all-button").addEventListener("click", function() {
    // 1. Clear out any text in the search bar:
    document.getElementById("search-input").value = "";

    // 2. Reload all contacts:
    loadContacts();
});

document.getElementById("search-input").addEventListener("input", function () {
    if (this.value.trim() === "") {
        loadContacts(); // reload all contacts if search bar is cleared
    }
});

document.querySelector(".add-contact button").addEventListener("click", addContact);

/***************************************************
   TOOLTIPS
****************************************************/
function toggleTooltip(tooltipId) {
    const tooltip = document.getElementById(tooltipId);
    if (!tooltip) return; // Ensure tooltip exists

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
