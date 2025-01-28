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
document.getElementById('debug-dashboard-button').addEventListener('click', function () {
    document.querySelector('.form-container').classList.add('hidden');
    document.querySelector('.dashboard-container').classList.remove('hidden');
});


// Toggle tooltip visibility
function toggleTooltip(tooltipId) {
    const tooltip = document.getElementById(tooltipId);

    // Close all other tooltips
    document.querySelectorAll('.tooltip').forEach((tip) => {
        if (tip.id !== tooltipId) {
            tip.classList.remove('active');
        }
    });

    // Toggle the selected tooltip
    tooltip.classList.toggle('active');
}

// Event listeners for username tooltip
document.getElementById('username-tooltip-btn').addEventListener('click', function (e) {
    e.preventDefault();
    toggleTooltip('username-tooltip');
});

// Event listeners for password tooltip
document.getElementById('password-tooltip-btn').addEventListener('click', function (e) {
    e.preventDefault();
    toggleTooltip('password-tooltip');
});

// Close tooltips when clicking outside
document.addEventListener('click', function (e) {
    const isTooltipButton = e.target.matches('.tooltip-btn');
    const isTooltip = e.target.matches('.tooltip') || e.target.closest('.tooltip');

    if (!isTooltipButton && !isTooltip) {
        document.querySelectorAll('.tooltip').forEach((tooltip) => {
            tooltip.classList.remove('active');
        });
    }
});


// Login API Integration
document.getElementById('login-form').addEventListener('submit', async function (e) {
    e.preventDefault();

    const login = document.getElementById('login-username').value;
    const password = document.getElementById('login-password').value;

    const apiUrl = 'http://COP4331-1.online/LAMPAPI/Login.php';

    const payload = {
        login: login,
        password: password
    };

    try {
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const result = await response.json();

        if (response.ok) {
            console.log('Login successful:', result);
            document.querySelector('.form-container').classList.add('hidden');
            document.querySelector('.dashboard-container').classList.remove('hidden');
        } else {
            alert('Invalid username or password. Please try again.');
        }
    } catch (error) {
        console.error('Error connecting to the login API:', error);
        alert('An error occurred while logging in. Please try again later.');
    }
});

// Signup API Integration
document.getElementById('signup-form').addEventListener('submit', async function (e) {
    e.preventDefault();

    const firstName = document.getElementById('signup-firstname').value;
    const lastName = document.getElementById('signup-lastname').value;
    const login = document.getElementById('signup-username').value;
    const password = document.getElementById('signup-password').value;

    const apiUrl = 'http://COP4331-1.online/LAMPAPI/SignUp.php';

    const payload = {
        firstName: firstName,
        lastName: lastName,
        login: login,
        password: password
    };

    try {
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const result = await response.json();

        if (response.ok) {
            alert('Signup successful! Please log in.');
            toggleForm('login');
        } else {
            alert('Signup failed. Please try again.');
        }
    } catch (error) {
        console.error('Error connecting to the signup API:', error);
        alert('An error occurred while signing up. Please try again later.');
    }
});

// Search Contacts
async function searchContacts(searchInput) {
    const apiUrl = 'http://COP4331-1.online/LAMPAPI/SearchContacts.php';
    const payload = { UserID: userId, searchInput: searchInput };

    try {
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        });

        const result = await response.json();

        if (response.ok) {
            console.log('Search Results:', result);
            displayContacts(result.contacts); // Replace with actual contact rendering logic
        } else {
            alert('Error searching contacts.');
        }
    } catch (error) {
        console.error('Error connecting to the search API:', error);
        alert('An error occurred while searching. Please try again.');
    }
}

// Add Contact
async function addContact(contact) {
    const apiUrl = 'http://COP4331-1.online/LAMPAPI/AddContact.php';

    try {
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(contact),
        });

        const result = await response.json();

        if (response.ok) {
            alert('Contact added successfully!');
            searchContacts(''); // Refresh contact list
        } else {
            alert('Failed to add contact.');
        }
    } catch (error) {
        console.error('Error connecting to the add contact API:', error);
        alert('An error occurred while adding the contact. Please try again.');
    }
}

// Edit Contact
async function editContact(contact) {
    const apiUrl = 'http://COP4331-1.online/LAMPAPI/EditContact.php';

    try {
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(contact),
        });

        const result = await response.json();

        if (response.ok) {
            alert('Contact updated successfully!');
            searchContacts(''); // Refresh contact list
        } else {
            alert('Failed to update contact.');
        }
    } catch (error) {
        console.error('Error connecting to the edit contact API:', error);
        alert('An error occurred while updating the contact. Please try again.');
    }
}

// Delete Contact
async function deleteContact(contactId) {
    const apiUrl = 'http://COP4331-1.online/LAMPAPI/DeleteContact.php';
    const payload = { contactId: contactId };

    try {
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        });

        const result = await response.json();

        if (response.ok) {
            alert('Contact deleted successfully!');
            searchContacts(''); // Refresh contact list
        } else {
            alert('Failed to delete contact.');
        }
    } catch (error) {
        console.error('Error connecting to the delete contact API:', error);
        alert('An error occurred while deleting the contact. Please try again.');
    }
}

// Display Contacts in Table
function displayContacts(contacts) {
    const tableBody = document.querySelector('.contact-table tbody');
    tableBody.innerHTML = ''; // Clear table

    contacts.forEach((contact) => {
        const row = `
            <tr>
                <td>${contact.firstName}</td>
                <td>${contact.lastName}</td>
                <td>${contact.phone}</td>
                <td>${contact.email}</td>
                <td>
                    <button onclick="editContact(${contact.contactId})"><i class="fa-solid fa-pencil"></i></button>
                    <button onclick="deleteContact(${contact.contactId})"><i class="fa-solid fa-trash"></i></button>
                </td>
            </tr>
        `;
        tableBody.insertAdjacentHTML('beforeend', row);
    });
}

// Event Listeners for Dashboard
document.getElementById('search-input').addEventListener('input', (e) => {
    const searchValue = e.target.value;
    searchContacts(searchValue);
});

document.querySelector('.add-contact button').addEventListener('click', () => {
    const newContact = {
        userId: userId,
        firstName: 'New',
        lastName: 'Contact',
        email: 'new.contact@example.com',
        phone: '123-456-7890',
    };
    addContact(newContact);
});

// Logout functionality
document.getElementById('logout-button').addEventListener('click', function () {
    document.querySelector('.dashboard-container').classList.add('hidden');
    document.querySelector('.form-container').classList.remove('hidden');
});
