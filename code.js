const urlBase = 'http://COP4331-1.online/LAMPAPI';
const extension = 'php';

let userId = localStorage.getItem('userId') || 0;
let firstName = localStorage.getItem('firstName') || "";
let lastName = localStorage.getItem('lastName') || "";

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
document.getElementById('debug-dashboard-button')?.addEventListener('click', function () {
    document.querySelector('.form-container').classList.add('hidden');
    document.querySelector('.dashboard-container').classList.remove('hidden');
});

// Save Cookie
function saveCookie() {
    let minutes = 20;
    let date = new Date();
    date.setTime(date.getTime() + minutes * 60 * 1000);
    document.cookie = `firstName=${firstName},lastName=${lastName},userId=${userId};expires=${date.toGMTString()}`;
}

// Logout Functionality
document.getElementById("logout-button").addEventListener("click", function () {
    console.log("Logging out...");

    // Clear stored user session
    localStorage.removeItem("userId");
    localStorage.removeItem("firstName");
    localStorage.removeItem("lastName");

    // Reset UI - Hide Dashboard, Show Login Form
    document.querySelector(".dashboard-container").classList.add("hidden");
    document.querySelector(".form-container").classList.remove("hidden");

    // Redirect to login
    window.location.reload(); 
});

// ** Add Contact Functionality **
async function addContact() {
    const firstName = document.getElementById("contact-firstname").value;
    const lastName = document.getElementById("contact-lastname").value;
    const phone = document.getElementById("contact-phone").value;
    const email = document.getElementById("contact-email").value;

    if (!firstName || !lastName || !phone || !email) {
        alert("All fields are required to add a contact.");
        return;
    }

    let payload = { UserID: userId, FirstName: firstName, LastName: lastName, Phone: phone, Email: email };
    let jsonPayload = JSON.stringify(payload);

    let url = urlBase + '/AddContact.' + extension;

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: jsonPayload,
        });

        const result = await response.json();

        if (response.ok && !result.error) {
            alert("Contact added successfully!");
            loadContacts(); // Reload contacts
        } else {
            alert(result.error || "Failed to add contact.");
        }
    } catch (error) {
        console.error("Error adding contact:", error);
        alert("An error occurred while adding the contact.");
    }
}

// ** Search Contact Functionality **
async function searchContacts() {
    const searchInput = document.getElementById("search-input").value.trim();

    let payload = { UserID: userId, searchInput: searchInput };
    let jsonPayload = JSON.stringify(payload);

    let url = urlBase + '/SearchContacts.' + extension;

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: jsonPayload,
        });

        const result = await response.json();

        if (response.ok && result.results) {
            displayContacts(result.results);
        } else {
            displayContacts([]); // Show no contacts found
        }
    } catch (error) {
        console.error("Error searching contacts:", error);
        alert("An error occurred while searching. Please try again.");
    }
}

// ** Delete Contact Functionality **
async function deleteContact(contactId) {
    let confirmDelete = confirm("Are you sure you want to delete this contact?");
    if (!confirmDelete) return;

    let payload = { contactId: contactId };
    let jsonPayload = JSON.stringify(payload);

    let url = urlBase + '/DeleteContact.' + extension;

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: jsonPayload,
        });

        const result = await response.json();

        if (response.ok && !result.error) {
            alert("Contact deleted successfully!");
            loadContacts(); // Refresh contacts
        } else {
            alert(result.error || "Failed to delete contact.");
        }
    } catch (error) {
        console.error("Error deleting contact:", error);
        alert("An error occurred while deleting the contact.");
    }
}

// ** Edit Contact Functionality **
async function editContact(contactId) {
    const firstName = prompt("Enter new first name:");
    const lastName = prompt("Enter new last name:");
    const phone = prompt("Enter new phone number:");
    const email = prompt("Enter new email:");

    if (!firstName || !lastName || !phone || !email) {
        alert("All fields are required to edit a contact.");
        return;
    }

    let payload = { userId: userId, contactId: contactId, FirstName: firstName, LastName: lastName, Phone: phone, Email: email };
    let jsonPayload = JSON.stringify(payload);

    let url = urlBase + '/EditContact.' + extension;

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: jsonPayload,
        });

        const result = await response.json();

        if (response.ok && !result.error) {
            alert("Contact updated successfully!");
            loadContacts(); // Refresh contacts
        } else {
            alert(result.error || "Failed to update contact.");
        }
    } catch (error) {
        console.error("Error updating contact:", error);
        alert("An error occurred while updating the contact.");
    }
}

// ** Display Contacts in Table **
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
                    <button onclick="editContact(${contact.ContactID})"><i class="fa-solid fa-pencil"></i></button>
                    <button onclick="deleteContact(${contact.ContactID})"><i class="fa-solid fa-trash"></i></button>
                </td>
            </tr>
        `;
        tableBody.insertAdjacentHTML("beforeend", row);
    });
}

// ** Load Contacts on Dashboard Load **
function loadContacts() {
    document.getElementById("search-input").value = "";
    searchContacts(); // Load all contacts
}

// ** Event Listeners **
document.querySelector(".search-bar button").addEventListener("click", searchContacts);
document.getElementById("search-input").addEventListener("input", function () {
    if (this.value.trim() === "") {
        loadContacts(); // Reload all contacts
    }
});
document.querySelector(".add-contact button").addEventListener("click", addContact);
