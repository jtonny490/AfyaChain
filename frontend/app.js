const API = "http://localhost:8080/api";

// REGISTER
async function register() {
    const data = {
        first_name: document.getElementById("first_name").value.trim(),
        last_name: document.getElementById("last_name").value.trim(),
        email: document.getElementById("email").value.trim(),
        password: document.getElementById("password").value,
        role: "patient"
    };

    try {
        const res = await fetch(`${API}/register`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(data)
        });

        const result = await res.json();

        if (!res.ok) {
            alert("Registration failed: " + (result.error || res.statusText));
            return;
        }

        alert("Registered successfully!");
        window.location.href = "login.html";

    } catch (error) {
        alert("Network error: " + error.message);
    }
}

// LOGIN
async function login() {
    const data = {
        email: document.getElementById("email").value.trim(),
        password: document.getElementById("password").value
    };

    try {
        const res = await fetch(`${API}/login`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(data)
        });

        const result = await res.json();

        if (!res.ok) {
            alert("Login failed: " + (result.error || res.statusText));
            return;
        }

        if (!result.token) {
            alert("Login failed: No token received");
            return;
        }

        localStorage.setItem("token", result.token);
        window.location.href = "home.html";

    } catch (error) {
        alert("Network error: " + error.message);
    }
}

// LOAD USER
function loadUser() {
    const token = localStorage.getItem("token");

    if (!token) {
        window.location.href = "login.html";
        return;
    }

    try {
        const payload = JSON.parse(atob(token.split(".")[1]));

        document.getElementById("userId").innerText = payload.user_id || "N/A";
        document.getElementById("role").innerText = payload.role || "N/A";

        if (payload.role === "patient") {
            document.getElementById("recordFormContainer").style.display = "block";
            document.getElementById("recordsContainer").style.display = "block";
            loadRecords();
        }

    } catch (error) {
        console.error("Invalid token:", error);
        logout();
    }
}

// CREATE RECORD
async function createRecord(event) {
    event.preventDefault();

    const token = localStorage.getItem("token");

    if (!token) {
        alert("Please login again");
        return;
    }

    const payload = JSON.parse(atob(token.split(".")[1]));

    const data = {
        patient_id: parseInt(payload.user_id),

        // FIXED: use null instead of 0
        doctor_id: null,

        title: document.getElementById("title").value.trim(),
        description: document.getElementById("description").value.trim(),
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

        const result = await res.json();

        if (!res.ok) {
            console.error(result);
            alert("Failed to create record: " + (result.error || res.statusText));
            return;
        }

        let message = "Record created successfully!";

        if (result.token_id) {
            message += `

NFT Token ID: ${result.token_id}
Transaction Hash: ${result.tx_hash || "N/A"}
`;
        }

        alert(message);

        document.getElementById("recordForm").reset();

        loadRecords();

    } catch (error) {
        console.error(error);
        alert("Error creating record: " + error.message);
    }
}

// LOAD RECORDS
async function loadRecords() {
    const token = localStorage.getItem("token");

    if (!token) return;

    const payload = JSON.parse(atob(token.split(".")[1]));

    try {
        const res = await fetch(
            `${API}/records?patient_id=${payload.user_id}`,
            {
                method: "GET",
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            }
        );

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

    let html = `
        <table class="records-table">
            <tr>
                <th>Title</th>
                <th>Type</th>
                <th>Date</th>
                <th>NFT Token</th>
            </tr>
    `;

    records.forEach(record => {
        html += `
            <tr>
                <td>${record.title || "N/A"}</td>
                <td>${record.record_type || "N/A"}</td>
                <td>${record.date_of_event || "N/A"}</td>
                <td>
                    ${
                        record.token_id
                            ? `<span class="nft-badge">${record.token_id.substring(0, 8)}...</span>`
                            : "Not minted"
                    }
                </td>
            </tr>
        `;
    });

    html += `</table>`;

    container.innerHTML = html;
}

// LOGOUT
function logout() {
    localStorage.removeItem("token");
    window.location.href = "login.html";
}
