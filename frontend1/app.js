const API = "http://localhost:8080/api";

// REGISTER
async function register() {
    try {
        // Form field lookup using your exact element IDs
        const firstNameEl = document.getElementById("first_name");
        const lastNameEl = document.getElementById("last_name");
        const emailEl = document.getElementById("email");
        const passwordEl = document.getElementById("password");

        // Safety check to ensure elements exist on the current page DOM context
        if (!firstNameEl || !lastNameEl || !emailEl || !passwordEl) {
            console.error("Critical Error: Missing HTML input fields. Check your registration ID properties.");
            alert("Registration layout error: Missing input fields on page.");
            return;
        }

        // Maintaining your exact data object variables and values
        const data = {
            first_name: firstNameEl.value.trim(),
            last_name: lastNameEl.value.trim(),
            email: emailEl.value.trim(),
            password: passwordEl.value,
            role: "patient"
        };

        // Simple check to prevent empty registration requests
        if (!data.first_name || !data.last_name || !data.email || !data.password) {
            alert("Please fill out all registration fields.");
            return;
        }

        console.log("Sending registration data payload:", data);

        const res = await fetch(`${API}/register`, {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify(data)
        });

        if (!res.ok) {
            let errorMessage = res.statusText;
            try {
                const error = await res.json();
                errorMessage = error.error || error.message || res.statusText;
            } catch (e) {
                console.warn("Could not parse backend error JSON metadata string response.");
            }
            alert("Registration failed: " + errorMessage);
            return;
        }

        alert("Registered successfully!");
        window.location.href = "login.html";

    } catch (catchErr) {
        console.error("Network or Runtime error inside register():", catchErr);
        alert("Network or connection error. Check if your Go server is active on port 8080.");
    }
}

// LOGIN
async function login() {
    try {
        const emailEl = document.getElementById("email");
        const passwordEl = document.getElementById("password");

        if (!emailEl || !passwordEl) {
            console.error("Critical Error: Login input element IDs not found in current view.");
            return;
        }

        const data = {
            email: emailEl.value.trim(),
            password: passwordEl.value
        };

        if (!data.email || !data.password) {
            alert("Please enter both email and password.");
            return;
        }

        const res = await fetch(`${API}/login`, {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify(data)
        });

        if (!res.ok) {
            let errorMessage = res.statusText;
            try {
                const error = await res.json();
                errorMessage = error.error || error.message || res.statusText;
            } catch (e) {}
            alert("Login failed: " + errorMessage);
            return;
        }

        const result = await res.json();

        if (result.token) {
            localStorage.setItem("token", result.token);
            window.location.href = "home.html";
        } else {
            alert("Login failed: No token received");
        }
    } catch (catchErr) {
        console.error("Network or Runtime error inside login():", catchErr);
        alert("Failed to communicate with authorization service.");
    }
}

// LOAD USER DATA (simple decode JWT)
function loadUser() {
    const token = localStorage.getItem("token");

    if (!token) {
        window.location.href = "login.html";
        return;
    }

    try {
        const payload = JSON.parse(atob(token.split(".")[1]));

        const userIdEl = document.getElementById("userId");
        const roleEl = document.getElementById("role");

        if (userIdEl) userIdEl.innerText = payload.user_id;
        if (roleEl) roleEl.innerText = payload.role;

        // Show record form for patients
        if (payload.role === "patient") {
            const formContainer = document.getElementById("recordFormContainer");
            const recordsContainer = document.getElementById("recordsContainer");
            
            if (formContainer) formContainer.style.display = "block";
            if (recordsContainer) recordsContainer.style.display = "block";
            loadRecords();
        }
    } catch (err) {
        console.error("JWT Session parsing failure:", err);
        localStorage.removeItem("token");
        window.location.href = "login.html";
    }
}

// CREATE PATIENT RECORD (NFT)
async function createRecord(event) {
    event.preventDefault();

    const token = localStorage.getItem("token");
    if (!token) return;

    try {
        const payload = JSON.parse(atob(token.split(".")[1]));

        const data = {
            patient_id: parseInt(payload.user_id),
            doctor_id: 0,
            title: document.getElementById("title").value,
            description: document.getElementById("description").value,
            record_type: document.getElementById("recordType").value,
            date_of_event: document.getElementById("dateOfEvent").value
        };

        const res = await fetch(`${API}/records`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify(data)
        });

        if (!res.ok) {
            const error = await res.json();
            alert("Failed to create record: " + (error.error || res.statusText));
            return;
        }

        const result = await res.json();
        
        let message = "Record created successfully!";
        if (result.token_id) {
            message += `\n\nNFT Token ID: ${result.token_id}\nTransaction: ${result.tx_hash}`;
        }
        alert(message);

        document.getElementById("recordForm").reset();
        loadRecords();
    } catch (error) {
        alert("Error creating record: " + error.message);
    }
}

// LOAD RECORDS
async function loadRecords() {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        const res = await fetch(`${API}/records?patient_id=${payload.user_id}`, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });

        if (!res.ok) {
            console.error("Failed to load records from backend ledger mapping engine endpoints.");
            return;
        }

        const records = await res.json();
        displayRecords(records);
    } catch (error) {
        console.error("Error loading records:", error);
    }
}

// DISPLAY RECORDS
function displayRecords(records) {
    const container = document.getElementById("recordsList");
    if (!container) return;
    
    if (!records || records.length === 0) {
        container.innerHTML = "<p>No records found.</p>";
        return;
    }

    let html = "<table class='records-table'><tr><th>Title</th><th>Type</th><th>Date</th><th>NFT Token</th></tr>";
    
    records.forEach(record => {
        html += `<tr>
            <td>${record.title || 'N/A'}</td>
            <td>${record.record_type || 'N/A'}</td>
            <td>${record.date_of_event || 'N/A'}</td>
            <td>${record.token_id ? `<span class="nft-badge">${String(record.token_id).substring(0, 8)}...</span>` : 'Not minted'}</td>
        </tr>`;
    });
    
    html += "</table>";
    container.innerHTML = html;
}

// LOGOUT
function logout() {
    localStorage.removeItem("token");
    window.location.href = "login.html";
}
