/*
 AfyaChain Doctor Workspace Script
  Manages healthcare clinician panel interactions, patient data requests,
 and smart contract permission queues.
*/

document.addEventListener("DOMContentLoaded", () => {
  // Init mobile sidebar toggle interaction
  initializeMobileSidebar();

  // Populate doctor dashboard
  renderDoctorDashboard();

  // Handle clinical request form submission
  const reqForm = document.getElementById("request-access-form");
  if (reqForm) {
    reqForm.addEventListener("submit", handleAccessRequestSubmit);
  }
});

function initializeMobileSidebar() {
  const toggleBtn = document.querySelector(".nav-toggle-btn") || document.querySelector(".mobile-nav-toggle");
  const sidebar = document.querySelector(".sidebar");
  let overlay = document.querySelector(".mobile-overlay");

  if (!overlay && sidebar) {
    overlay = document.createElement("div");
    overlay.className = "mobile-overlay";
    document.body.appendChild(overlay);
  }

  if (toggleBtn && sidebar && overlay) {
    toggleBtn.addEventListener("click", () => {
      sidebar.classList.add("open");
      overlay.classList.add("open");
    });

    overlay.addEventListener("click", () => {
      sidebar.classList.remove("open");
      overlay.classList.remove("open");
    });
  }
}

function renderDoctorDashboard() {
  const requests = AfyaAPI.getRequests();
  const permissions = AfyaAPI.getPermissions();
  const logs = AfyaAPI.getLogs();

  // 1. Calculations & Dashboard stats
  const activePatients = new Set(requests.map(r => r.patientName)).size;
  const pendingRequestsCount = requests.filter(r => r.status === "Pending").length;
  const activePermissionsCount = permissions.filter(p => p.status === "Granted").length;
  
  const connectedPatientsEl = document.getElementById("stat-connected-patients");
  if (connectedPatientsEl) connectedPatientsEl.textContent = activePatients || "0";

  const pendingCountEl = document.getElementById("stat-pending-requests");
  if (pendingCountEl) pendingCountEl.textContent = pendingRequestsCount || "0";

  const verifiedRecordsEl = document.getElementById("stat-verified-access");
  if (verifiedRecordsEl) verifiedRecordsEl.textContent = activePermissionsCount || "0";

  // 2. Render Patient Requests & Permissions Queue Table
  const queueTableBody = document.getElementById("requests-queue-body");
  if (queueTableBody) {
    if (requests.length === 0) {
      queueTableBody.innerHTML = `
        <tr>
          <td colspan="5" style="text-align: center; padding: 3rem 1.5rem;">
            <div class="empty-state">
              <div class="empty-state-icon"></div>
              <p class="empty-state-title">No Access Requests in Queue</p>
              <p class="empty-state-desc">There are currently no outgoing patient authorization requests active on the blockchain.</p>
            </div>
          </td>
        </tr>
      `;
    } else {
      queueTableBody.innerHTML = requests.map(req => {
        let statusBadge = "";
        let actionButtons = "";

        if (req.status === "Pending") {
          statusBadge = `<span class="badge badge-warning">Pending Consent</span>`;
          actionButtons = `
            <div style="display: flex; gap: 0.5rem;">
              <button class="btn btn-sm btn-primary" onclick="updateDoctorRequest('${req.id}', 'Approved')">Approve (Demo)</button>
              <button class="btn btn-sm btn-outline btn-danger" onclick="updateDoctorRequest('${req.id}', 'Denied')">Deny</button>
            </div>
          `;
        } else if (req.status === "Approved") {
          statusBadge = `<span class="badge badge-success">Consent Granted</span>`;
          actionButtons = `
            <button class="btn btn-sm btn-secondary" onclick="viewClinicalRecord('${req.patientName}')">View File</button>
          `;
        } else {
          statusBadge = `<span class="badge badge-danger">Denied</span>`;
          actionButtons = `<span style="font-size:0.8rem; color:var(--text-muted); font-style:italic;">No Action Possible</span>`;
        }

        return `
          <tr id="req-row-${req.id}">
            <td><strong style="color:var(--primary-deep);">${req.patientName}</strong></td>
            <td><span class="permission-tag">${req.condition}</span></td>
            <td><strong>${req.accessType}</strong></td>
            <td>${statusBadge}</td>
            <td>${actionButtons}</td>
          </tr>
        `;
      }).join('');
    }
  }

  // 3. Render Hospital Audit Logs
  const auditTimeline = document.getElementById("doctor-audit-timeline");
  if (auditTimeline) {
    if (logs.length === 0) {
      auditTimeline.innerHTML = `<p style="color: var(--text-muted); text-align:center; padding: 1.5rem;">No transaction logs found.</p>`;
    } else {
      auditTimeline.innerHTML = logs.slice(0, 5).map(log => `
        <div class="timeline-item">
          <div class="timeline-dot ${log.status === 'danger' ? 'danger' : log.status === 'info' ? 'warning' : 'success'}"></div>
          <div class="timeline-content">
            <div class="timeline-time">${log.timestamp}</div>
            <div class="timeline-title">${log.event}</div>
            <p class="timeline-desc">${log.details}</p>
            <div class="blockchain-hash-container" style="margin-top:0.4rem;">
              <svg fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M10 2a8 8 0 100 16 8 8 0 000-16zm1 11H9v-2h2v2zm0-4H9V5h2v4z" clip-rule="evenodd"></path></svg>
              <span class="hash-text">${log.hash}</span>
            </div>
          </div>
        </div>
      `).join('');
    }
  }
}

window.updateDoctorRequest = function(requestId, newStatus) {
  AfyaAPI.updateRequestStatus(requestId, newStatus);
  renderDoctorDashboard();
};

window.viewClinicalRecord = function(patientName) {
  alert(`Verifying multi-sig clinic license keys... Cryptographic tunnel established for Patient ${patientName}. Decrypting health payload...`);
  // Open the simulated health file view
  const overlay = document.createElement("div");
  overlay.className = "modal-backdrop";
  overlay.style.display = "flex";

  overlay.innerHTML = `
    <div class="modal">
      <div class="modal-header">
        <h3 class="card-title">Secured Clinician View - EMR Decrypted</h3>
        <button class="modal-close" onclick="this.closest('.modal-backdrop').remove()">✕</button>
      </div>
      <div class="modal-body">
        <div class="alert alert-success" style="margin-bottom: 1.25rem;">
          <div>
            <strong>Decryption Successful:</strong> Validated patient cryptographic agreement blocks over Nairobi Nodes.
          </div>
        </div>
        <div style="background-color: var(--bg-light); padding:1.25rem; border-radius:var(--radius-md); border:1px solid var(--border-color); font-size: 0.9rem;">
          <p style="margin-bottom:0.75rem;"><strong>Patient Name:</strong> ${patientName}</p>
          <p style="margin-bottom:0.75rem;"><strong>Clinical Diagnosis Code:</strong> ICD-10-CM I10 (Essential Hypertension)</p>
          <p style="margin-bottom:0.75rem;"><strong>Recorded Notes:</strong> Patient is showing responsive improvements after blockchain trial prescription protocol. BP registered at 120/80 on 2026-05-24.</p>
          <p style="margin-bottom:0px; font-family:var(--font-mono); font-size:0.75rem; color: var(--text-muted);">Payload Hash: 0xaefbc8294ba12dec89cde930129a3dec2a3eb</p>
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn btn-primary" onclick="this.closest('.modal-backdrop').remove()">Close Encrypted Console</button>
      </div>
    </div>
  `;
  document.body.appendChild(overlay);
};

function handleAccessRequestSubmit(event) {
  event.preventDefault();
  
  const pName = document.getElementById("clinical-patient-name").value.trim();
  const condition = document.getElementById("clinical-purpose").value;
  const accessLevel = document.getElementById("clinical-access-level").value;

  if (!pName || !condition) {
    alert("Please complete all patient clinical data fields before transmitting request.");
    return;
  }

  const newRequest = {
    id: "REQ-" + Math.floor(Math.random() * 1000),
    patientName: pName,
    condition,
    accessType: accessLevel,
    status: "Pending",
    date: new Date().toISOString().split('T')[0],
    hospital: "Aga Khan University Hospital",
    doctor: "Dr. Juma Tonny",
  };

  AfyaAPI.addRequest(newRequest);

  // Close modal if open
  closeRequestAccessModal();
  
  // Re-render
  renderDoctorDashboard();

  alert(`Consent Request published to the blockchain for ${pName}. Patient needs to approve before you can view.`);
}

window.openRequestAccessModal = function() {
  const modal = document.getElementById("request-access-modal");
  if (modal) {
    modal.style.display = "flex";
  }
};

window.closeRequestAccessModal = function() {
  const modal = document.getElementById("request-access-modal");
  if (modal) {
    modal.style.display = "none";
  }
};
