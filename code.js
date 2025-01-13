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
