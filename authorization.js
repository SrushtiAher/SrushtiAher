// Function for Signup
async function signup() {
    const userId = document.getElementById('signupUserId').value;
    const password = document.getElementById('signupPassword').value;
    const reconfirmPassword = document.getElementById('reconfirmPassword').value;

    if (password !== reconfirmPassword) {
        alert('Passwords do not match.');
        return;
    }

    const response = await fetch('http://localhost:8000/signup', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: `userId=${userId}&password=${password}`
    });

    const data = await response.json();

    if (response.status === 201) {
        alert(data.message);
        localStorage.setItem('username', userId);  // Set username in local storage
        window.location.href = 'index.html';
    } else {
        alert('Signup failed.');
    }
}

// Function for Login
async function login() {
    const userId = document.getElementById('loginUserId').value;
    const password = document.getElementById('loginPassword').value;

    const response = await fetch('http://localhost:8000/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: `userId=${userId}&password=${password}`
    });

    const data = await response.json();

    if (response.status === 200 && data.status === "success") {
        alert(data.message);  // This should now show "Logged in successfully"
        localStorage.setItem('username', userId);  // Store the username in local storage
        window.location.href = 'index.html';
    } else {
        alert('Login failed.');
    }
}
