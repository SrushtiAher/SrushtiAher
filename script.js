function uploadFile() {
    const fileInput = document.getElementById('fileInput');
    const formData = new FormData();
    formData.append('file', fileInput.files[0]);
    formData.append('userId', localStorage.getItem('username'));
    fetch('http://localhost:8000/upload', {
        method: 'POST',
        body: formData,
    })
    .then(response => {
        if (response.status === 409) {
            const userResponse = window.confirm('File already exists. Do you want to replace it?');
            if (userResponse) {
                // Code to replace the file
            } else {
                // Code to rename and upload the file
            }
        } else if (response.status === 200) {
            return response.text();
        }
    })
       .then(data => {
    if (data) {
        // Log the upload action
        const timestamp = new Date().toLocaleString();
        const logMessage = `File uploaded: ${fileInput.files[0].name} on ${timestamp}`;
        // Send this log to your server
        logActivity('upload', fileInput.files[0].name);
    }
})
    .catch(error => console.error('Error:', error));
}

function loadFileList() {
    const username = localStorage.getItem('username');
    fetch(`http://localhost:8000/list?username=${username}`)
        .then(response => response.json())
        .then(data => {
            console.log(data);  // Debug statement to check the returned data
            const fileList = document.getElementById('fileList');
            fileList.innerHTML = '';
            let totalSize = 0;
            data.forEach(file => {
                const listItem = document.createElement('li');

                // Create a download link
                const downloadLink = document.createElement('a');
                downloadLink.href = '#';
                downloadLink.innerText = `Download ${file.name}`;
                downloadLink.addEventListener('click', (e) => {
                    e.preventDefault();
                    downloadFile(file.name);
                });
                listItem.appendChild(downloadLink);

                // Create a delete button
                const deleteButton = document.createElement('button');
                deleteButton.innerText = 'Delete';
                deleteButton.onclick = function () { deleteFile(file.name); };
                listItem.appendChild(deleteButton);

                fileList.appendChild(listItem);
                totalSize += file.size;
            });
        })
        .catch(error => console.error('Error:', error));
}


// Function to delete a file
function deleteFile(fileName) {
    const username = localStorage.getItem('username');
    fetch(`http://localhost:8000/delete/${fileName}?username=${username}`, {
        method: 'DELETE'
    })
        .then(response => response.text())
        .then(data => {
            // Handle successful deletion   const timestamp = new Date().toLocaleString();
    const logMessage = `File deleted: ${fileName} on ${timestamp}`;
    // Send this log to your server
    logActivity('delete', fileName);
})
        .catch(error => {
            console.error('Error:', error);
            alert(`Failed to delete the file: ${fileName}. Please try again.`);
        });
}

function toggleFileList() {
    const fileListDiv = document.getElementById('fileListDiv');
    if (fileListDiv.style.display === "none") {
        fileListDiv.style.display = "block";
        loadFileList();
    } else {
        fileListDiv.style.display = "none";
    }
}

function setUsername() {
    const username = localStorage.getItem('username');  // Retrieve the username from local storage
    if (username) {
        document.getElementById('username').innerText = `Welcome, ${username}`;
        fetch(`http://localhost:8000/get_plan?username=${username}`)  // Fetch the storage plan for this user
        .then(response => response.json())
        .then(data => {
            // Update the UI based on the user's storage plan
            // For example, you could update a progress bar showing used/total storage
        })
        .catch(error => console.error('Error:', error));
    } else {
        window.location.href = 'authorization.html';
    }
}

function logout() {
    localStorage.removeItem('username');
    window.location.href = 'authorization.html';
}

document.querySelectorAll('input[name="plan"]').forEach((elem) => {
    elem.addEventListener('change', function() {
        const selectedPlan = this.value;
        const username = localStorage.getItem('username');  // Retrieve the username from local storage
        fetch(`http://localhost:8000/set_plan/${selectedPlan}?username=${username}`, {  // Pass the username as a query parameter
            method: 'POST'
        })
        .then(response => response.text())
        .then(data => {
            alert(data);
            setUsername();  // Refresh the username and storage plan display
        })
        .catch(error => console.error('Error:', error));
    });
});


function showHome() {
    // Hide other sections
    document.getElementById('logs-content').style.display = "none";
    document.getElementById('subscription-content').style.display = "none";

    // Show main content
    document.getElementById('main-content').style.display = "block";
}
window.onload = function () {
    setUsername();
    loadFileList();
    fetchStorageInfo(); // Call this once, not twice
    document.querySelectorAll('input[name="plan"]').forEach((elem) => {
        elem.addEventListener('change', function () {
            const selectedPlan = this.value;
            const username = localStorage.getItem('username');
            fetch(`http://localhost:8000/set_plan/${selectedPlan}?username=${username}`, {
                method: 'POST'
            })
                .then(response => response.text())
                .then(data => {
                    alert(data);
                })
                .catch(error => console.error('Error:', error));
        });
    });
    document.getElementById('subscriptionLink').addEventListener('click', function () {
        const subscriptionContent = document.getElementById('subscription-content');
        subscriptionContent.style.display = subscriptionContent.style.display === 'none' ? 'block' : 'none';
    });
};


function showSubscription() {
    // Hide other sections
    document.getElementById('main-content').style.display = "none";
    document.getElementById('logs-content').style.display = "none";

    // Show subscription content
    document.getElementById('subscription-content').style.display = "block";
}
async function fetchStorageInfo() {
    const username = localStorage.getItem('username');
    const response = await fetch(`http://localhost:8000/get_storage_info?username=${username}`);
    const data = await response.json();
    if (response.status === 200) {
        const limit = data.limit / (1024 * 1024); // Convert to MB
        const used = data.used / (1024 * 1024); // Convert to MB
        document.getElementById('storageInfo').innerText = `Storage Used: ${used.toFixed(2)} MB / ${limit.toFixed(2)} MB`;
    } else {
        console.error('Failed to fetch storage info');
    }
}
// Function to update the logs displayed
function updateLogs() {
    const logsElement = document.getElementById('activityLogs');
    logsElement.innerHTML = ''; // Clear existing logs

    // Sample logs (Replace this with actual logs from your server)
    let activityLogs = [
        { action: 'Uploaded', filename: 'file1.txt', date: '2022-01-01' },
        { action: 'Deleted', filename: 'file2.txt', date: '2022-01-02' }
    ];

    activityLogs.forEach(log => {
        const logItem = document.createElement('li');
        logItem.textContent = `${log.action} ${log.filename} on ${log.date}`;
        logsElement.appendChild(logItem);
    });
}
// Existing part of your code

function downloadFile(fileName) {
    const username = localStorage.getItem('username');
    if (!username) {
        alert('User is not logged in.');
        return;
    }

    // Construct the download URL
    const downloadUrl = `http://localhost:8000/download/${fileName}?username=${username}`;

    // Trigger the file download
    fetch(downloadUrl)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.blob();
        })
        .then(blob => {
            // Create a link element, use it for download, and remove it
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = fileName;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
            const timestamp = new Date().toLocaleString();
    const logMessage = `File downloaded: ${fileName} on ${timestamp}`;
    // Send this log to your server
    logActivity('download', fileName);
})
        .catch(error => {
            console.error('Error:', error);
            alert(`Failed to download the file: ${fileName}. Please try again.`);
        });
}
function redirectToHomePage() {
    // Hide other sections
    document.getElementById('logs-content').style.display = "none";
    document.getElementById('subscription-content').style.display = "none";

    // Show main content
    document.getElementById('main-content').style.display = "block";
}

function showLogs() {
    fetch('http://localhost:8000/logs')
        .then(response => response.json())
        .then(logs => {
             logs.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))
            const logsContent = document.getElementById('logs-content');
            logsContent.innerHTML = '<h3 style="color: white; margin-bottom: 20px;">Activity Logs:</h3>';
            const ul = document.createElement('ul');
            ul.style = "color: white; font-size: 18px; margin-left: 10px;";

            logs.forEach(log => {
                const li = document.createElement('li');
                li.textContent = `${log.timestamp} - ${log.action} - ${log.filename}`;
                ul.appendChild(li);
            });

            logsContent.appendChild(ul);

            // Hide other content and show logs
            document.getElementById('main-content').style.display = "none";
            document.getElementById('subscription-content').style.display = "none";
            logsContent.style.display = 'block';
        })
        .catch(error => console.error('Error:', error));
}

function logActivity(action, fileName) {
    const timestamp = new Date().toLocaleString();
    const username = localStorage.getItem('username');
    const logData = { action, fileName, timestamp, username };

    fetch('http://localhost:8000/log_activity', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(logData),
    })
    .then(response => response.json())
    .then(data => console.log('Activity logged:', data))
    .catch(error => console.error('Error logging activity:', error));
}


