// LOGIN
async function login() {
    const data = {
        email: document.getElementById("email").value,
        password: document.getElementById("password").value
    };

    const res = await fetch(`${API}/login`, {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify(data)
    });

    if (!res.ok) {
        const error = await res.json();
        alert("Login failed: " + (error.error || res.statusText));
        return;
    }

    const result = await res.json();

    if (result.token) {
        localStorage.setItem("token", result.token);
        window.location.href = "home.html";
    } else {
        alert("Login failed: No token received");
    }
}

// LOAD USER DATA (simple decode JWT)
function loadUser() {
    const token = localStorage.getItem("token");

    if (!token) {
        window.location.href = "login.html";
        return;
    }

    const payload = JSON.parse(atob(token.split(".")[1]));

    document.getElementById("userId").innerText = payload.user_id;
    document.getElementById("role").innerText = payload.role;

    // Show record form for patients
    if (payload.role === "patient") {
        document.getElementById("recordFormContainer").style.display = "block";
        document.getElementById("recordsContainer").style.display = "block";
        loadRecords();
    }
}

// CREATE PATIENT RECORD (NFT)
async function createRecord(event) {
    event.preventDefault();

    const token = localStorage.getItem("token");
    const payload = JSON.parse(atob(token.split(".")[1]));

    const data = {
        patient_id: parseInt(payload.user_id),
        doctor_id: 0,
        title: document.getElementById("title").value,
        description: document.getElementById("description").value,
        record_type: document.getElementById("recordType").value,
        date_of_event: document.getElementById("dateOfEvent").value
    };

    try {
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
        
        // Display NFT information
        let message = "Record created successfully!";
        if (result.token_id) {
            message += `\n\nNFT Token ID: ${result.token_id}\nTransaction: ${result.tx_hash}`;
        }
        alert(message);

        // Reset form and reload records
        document.getElementById("recordForm").reset();
        loadRecords();
    } catch (error) {
        alert("Error creating record: " + error.message);
    }
}

// LOAD RECORDS
async function loadRecords() {
    const token = localStorage.getItem("token");
    const payload = JSON.parse(atob(token.split(".")[1]));

    try {
        const res = await fetch(`${API}/records?patient_id=${payload.user_id}`, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });

        if (!res.ok) {
            console.error("Failed to load records");
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
            <td>${record.token_id ? `<span class="nft-badge">${record.token_id.substring(0, 8)}...</span>` : 'Not minted'}</td>
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
