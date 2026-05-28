/**
 * AfyaChain Patient Portal Script
 * Manages medical records table, status badges, active provider cards,
 * and smart-contract quick actions.
 */

document.addEventListener("DOMContentLoaded", () => {
  // Init mobile sidebar toggle interaction
  initializeMobileSidebar();

  // Populate dashboards
  renderPatientDashboard();

  // Attach interactive emergency access trigger
  const emergencyBtn = document.getElementById("emergency-access-btn");
  if (emergencyBtn) {
    emergencyBtn.addEventListener("click", triggerEmergencyOverride);
  }

  // Attach interactive QR scanner trigger
  const qrHeaderBtn = document.getElementById("scan-qr-btn-header");
  const qrUtilBtn = document.getElementById("scan-qr-btn-utilities");
  if (qrHeaderBtn) {
    qrHeaderBtn.addEventListener("click", openQRScannerModal);
  }
  if (qrUtilBtn) {
    qrUtilBtn.addEventListener("click", openQRScannerModal);
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

function renderPatientDashboard() {
  const records = AfyaAPI.getRecords();
  const permissions = AfyaAPI.getPermissions();
  const logs = AfyaAPI.getLogs();

  // 1. Update counter stats
  const recordCountEl = document.getElementById("records-count");
  if (recordCountEl) recordCountEl.textContent = records.length;

  const activePermsEl = document.getElementById("active-perms-count");
  if (activePermsEl) {
    const activePermsCount = permissions.filter(p => p.status === "Granted").length;
    activePermsEl.textContent = activePermsCount;
  }

  const logsCountEl = document.getElementById("logs-count");
  if (logsCountEl) logsCountEl.textContent = logs.length;

  // 2. Render Medical Records Table
  const tableBody = document.getElementById("records-table-body");
  if (tableBody) {
    if (records.length === 0) {
      tableBody.innerHTML = `
        <tr>
          <td colspan="5" style="text-align: center; padding: 3rem 1.5rem;">
            <div class="empty-state">
              <div class="empty-state-icon"></div>
              <p class="empty-state-title">No Records Registered</p>
              <p class="empty-state-desc">You haven't uploaded any secure health records on the chain yet.</p>
            </div>
          </td>
        </tr>
      `;
    } else {
      tableBody.innerHTML = records.map(rec => `
        <tr id="row-${rec.id}">
          <td>
            <div style="font-weight: 700; color: var(--primary-deep);">${rec.id}</div>
          </td>
          <td>
            <div style="font-weight: 500;">${rec.hospital}</div>
            <div class="blockchain-hash-container" title="Smart Contract Address">
              <svg fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M10 2a8 8 0 100 16 8 8 0 000-16zm1 11H9v-2h2v2zm0-4H9V5h2v4z" clip-rule="evenodd"></path></svg>
              <span class="hash-text">${rec.hash.substring(0, 10)}...</span>
            </div>
          </td>
          <td>
            <span class="permission-tag">${rec.type}</span>
          </td>
          <td style="font-family: var(--font-mono); font-size: 0.85rem; color: var(--text-muted);">${rec.date}</td>
          <td>
            <span class="badge badge-success">
              <svg fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
              ${rec.status}
            </span>
          </td>
          <td>
            <div style="display: flex; gap: 0.5rem;">
              <button class="btn btn-sm btn-outline" onclick="viewMedicalRecord('${rec.id}')">View</button>
              <button class="btn btn-sm btn-primary" onclick="downloadMedicalRecord('${rec.id}')">Download</button>
            </div>
          </td>
        </tr>
      `).join('');
    }
  }

  // 3. Render Active Permission Cards
  const permissionsGrid = document.getElementById("permissions-grid");
  if (permissionsGrid) {
    const activeDocs = permissions.filter(p => p.status === "Granted");
    if (activeDocs.length === 0) {
      permissionsGrid.innerHTML = `
        <div class="card" style="grid-column: 1/-1; text-align: center;">
          <div class="empty-state">
            <div class="empty-state-icon"></div>
            <p class="empty-state-title">No Active Access Permissions</p>
            <p class="empty-state-desc">No third-party healthcare providers currently have active cryptographic access keys to your files.</p>
            <a href="access-management.html" class="btn btn-sm btn-outline" style="margin-top: 0.5rem;">Grant Access</a>
          </div>
        </div>
      `;
    } else {
      permissionsGrid.innerHTML = activeDocs.map(perm => `
        <div class="card" id="perm-card-${perm.id}">
          <div style="display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 1rem;">
            <div>
              <p style="font-weight:700; color:var(--primary-deep); font-size: 1.1rem; margin-bottom:0.15rem;">${perm.doctor}</p>
              <p style="font-size:0.8rem; color:var(--text-muted); font-weight:500;">${perm.hospital}</p>
            </div>
            <span class="badge badge-success">Active</span>
          </div>
          <div style="font-size:0.85rem; color:var(--text-muted); display:flex; flex-direction:column; gap:0.4rem; margin-bottom: 1.25rem;">
            <div style="display:flex; justify-content:space-between;">
              <span>Authorization Level:</span>
              <strong style="color:var(--primary-deep);">${perm.accessType}</strong>
            </div>
            <div style="display:flex; justify-content:space-between;">
              <span>Expiration Block:</span>
              <span style="font-family: var(--font-mono); font-size:0.8rem;">${perm.expiry}</span>
            </div>
          </div>
          <div style="display: flex; gap: 0.5rem; justify-content: flex-end;">
            <button class="btn btn-sm btn-outline btn-danger" onclick="revokePermissionImmediately('${perm.id}')">Revoke Consent</button>
          </div>
        </div>
      `).join('');
    }
  }
}

// Interactive record decrypter modal
window.viewMedicalRecord = function(recordId) {
  const records = AfyaAPI.getRecords();
  const record = records.find(r => r.id === recordId);
  if (!record) return;

  // Render a dramatic decryption validation flow
  const overlay = document.createElement("div");
  overlay.className = "modal-backdrop";
  overlay.style.display = "flex";

  overlay.innerHTML = `
    <div class="modal">
      <div class="modal-header">
        <h3 class="card-title">Securing Secure IPFS Ledger Connection</h3>
        <button class="modal-close" onclick="this.closest('.modal-backdrop').remove()">✕</button>
      </div>
      <div class="modal-body" style="text-align: center; padding: 2rem;">
        <div id="decrypt-loading">
          <div style="margin: 1.5rem auto; width: 50px; height: 50px; border: 4px solid var(--border-color); border-top-color: var(--blockchain-blue); border-radius: 50%; animation: decrypt-spin 1s linear infinite;"></div>
          <p style="font-weight: 700; color: var(--primary-deep); margin-bottom: 0.25rem;">Querying Smart Contract Registry...</p>
          <p style="font-size:0.8rem; color: var(--text-muted); font-family: var(--font-mono);">${record.hash}</p>
        </div>
        
        <div id="decrypt-success" style="display: none;">
          <div style="width: 56px; height: 56px; line-height: 56px; background-color: var(--success-bg); color: var(--success); font-size: 1.5rem; border-radius: 50%; margin: 0 auto 1.5rem; display: flex; align-items: center; justify-content: center;">✓</div>
          <p style="font-weight: 700; color: var(--primary-deep); font-size: 1.25rem; margin-bottom: 0.75rem;">Decryption Complete</p>
          
          <div style="text-align: left; background-color: var(--bg-light); border-radius: var(--radius-md); padding: 1.25rem; margin-bottom: 1.5rem; border: 1px solid var(--border-color);">
            <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem; font-size:0.9rem;">
              <span style="color: var(--text-muted);">Record Hash Class:</span>
              <strong style="font-family:var(--font-mono); font-size:0.8rem;">AES-256 GCM</strong>
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem; font-size:0.9rem;">
              <span style="color: var(--text-muted);">Registered Category:</span>
              <strong>${record.type}</strong>
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem; font-size:0.9rem;">
              <span style="color: var(--text-muted);">Attesting Provider:</span>
              <strong>${record.doctor}</strong>
            </div>
            <div style="display: flex; justify-content: space-between; font-size:0.9rem;">
              <span style="color: var(--text-muted);">Hospital Anchor:</span>
              <strong>${record.hospital}</strong>
            </div>
          </div>
          <button class="btn btn-primary w-full" style="width:100%" onclick="this.closest('.modal-backdrop').remove()">Close Safe View</button>
        </div>
      </div>
    </div>
  `;

  document.body.appendChild(overlay);

  // Animate the fake secure contract interaction verification
  setTimeout(() => {
    const loadingEl = document.getElementById("decrypt-loading");
    const successEl = document.getElementById("decrypt-success");
    if (loadingEl && successEl) {
      loadingEl.style.display = "none";
      successEl.style.display = "block";
    }
  }, 1600);
};

window.downloadMedicalRecord = function(recordId) {
  const records = AfyaAPI.getRecords();
  const record = records.find(r => r.id === recordId);
  if (!record) return;

  alert(`Initializing secure ledger payload download for ${record.id} (${record.type}). File size: ${record.fileSize}. Blockchain anchor verified.`);
  AfyaAPI.addLog("Record Downloaded", `Patient downloaded copy of ${record.type} from ledger anchor.`, record.hash, "info");
};

window.revokePermissionImmediately = function(permId) {
  if (confirm("Are you absolutely sure you want to cryptographically revoke access consent for this clinician? They will instantly lose all capabilities to fetch your records.")) {
    AfyaAPI.updatePermissionStatus(permId, "Revoked");
    renderPatientDashboard();
  }
};

function triggerEmergencyOverride() {
  const overlay = document.createElement("div");
  overlay.className = "modal-backdrop";
  overlay.style.display = "flex";

  overlay.innerHTML = `
    <div class="modal" style="border: 2px solid var(--danger);">
      <div class="modal-header" style="background-color: var(--danger-bg);">
        <h3 class="card-title text-danger" style="color: var(--danger); display: flex; align-items: center; gap: 0.5rem;">
          Cryptographic Emergency Access Override
        </h3>
        <button class="modal-close" onclick="this.closest('.modal-backdrop').remove()">✕</button>
      </div>
      <div class="modal-body">
        <p style="font-size:0.95rem; line-height: 1.5; color: var(--text-dark); margin-bottom: 1.25rem;">
          This initiates an <strong>Emergency Multi-sig Overwrite</strong> bypass protocol. This action instantly grants temporary unrestricted emergency read permissions to all attending clinical doctors at any certified emergency clinic, valid for <strong>24 hours</strong>.
        </p>
        <div class="alert alert-info" style="border-radius: var(--radius-md); border-color: rgba(13, 110, 253, 0.1); margin-bottom: 1.25rem;">
          <div style="font-size:0.85rem; line-height: 1.4;">
            <strong>Blockchain Accountability Audit:</strong> This bypass event is permanently embedded as a high-severity block into the ledger audit database. Overwriting is strictly bound by compliance laws and hospital board verification.
          </div>
        </div>
        <div class="form-group">
          <label class="form-label">Authorized Clinician Pin (Optional)</label>
          <input type="text" class="form-control" id="emergency-bypasser" placeholder="e.g. MS-99120" style="font-family: var(--font-mono);"></input>
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn btn-outline" onclick="this.closest('.modal-backdrop').remove()">Cancel</button>
        <button class="btn btn-danger" onclick="confirmEmergencyOverride(this)">Execute Override Block</button>
      </div>
    </div>
  `;

  document.body.appendChild(overlay);
}

window.confirmEmergencyOverride = function(btn) {
  const clinicianEl = document.getElementById("emergency-bypasser");
  const clinician = (clinicianEl && clinicianEl.value.trim()) || "EMERGENCY CLINICIAN ID";
  
  const hash = "0x" + Math.round(Math.random() * 1e16).toString(16).padEnd(32, "a");
  AfyaAPI.addLog("EMERGENCY OVERRIDE BYPASS", `Emergency consent bypass triggered for attending team under code: ${clinician}. Temporary read access enabled.`, hash, "danger");
  
  // Create a corresponding granted authorization
  AfyaAPI.addPermission({
    id: "PERM-" + Math.floor(Math.random() * 10000),
    doctor: `Emergency Attending (${clinician})`,
    hospital: "AfyaChain Unified trauma Desk",
    accessType: "Emergency Read-All",
    grantedDate: new Date().toISOString().split('T')[0],
    expiry: new Date(Date.now() + 86400000).toISOString().split('T')[0], // 24 hours
    status: "Granted"
  });

  btn.closest('.modal-backdrop').remove();
  alert("Emergency blockchain override state has been published to local nodes! Consent granted unconditionally for 24 hours.");
  renderPatientDashboard();
};

// Insert basic animation styles dynamically
const style = document.createElement('style');
style.textContent = `
  @keyframes decrypt-spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
  .qr-target-box {
    position: absolute;
    width: 200px;
    height: 200px;
    display: flex;
    align-items: center;
    justify-content: center;
    pointer-events: none;
    z-index: 5;
  }
  .qr-target-box .corner {
    position: absolute;
    width: 24px;
    height: 24px;
    border: 3.5px solid transparent;
  }
  .qr-target-box .top-left {
    top: 0;
    left: 0;
    border-top-color: #12b5ff;
    border-left-color: #12b5ff;
    border-top-left-radius: 8px;
  }
  .qr-target-box .top-right {
    top: 0;
    right: 0;
    border-top-color: #12b5ff;
    border-right-color: #12b5ff;
    border-top-right-radius: 8px;
  }
  .qr-target-box .bottom-left {
    bottom: 0;
    left: 0;
    border-bottom-color: #12b5ff;
    border-left-color: #12b5ff;
    border-bottom-left-radius: 8px;
  }
  .qr-target-box .bottom-right {
    bottom: 0;
    right: 0;
    border-bottom-color: #12b5ff;
    border-right-color: #12b5ff;
    border-bottom-right-radius: 8px;
  }
  .qr-scan-laser {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 3px;
    background: linear-gradient(90deg, transparent, #12b5ff 50%, transparent);
    box-shadow: 0 0 10px #12b5ff;
    animation: laserScan 2.5s infinite linear;
  }
  @keyframes laserScan {
    0% { top: 3%; }
    50% { top: 97%; }
    100% { top: 3%; }
  }
  @keyframes pulse-radar {
    0%, 100% { transform: scale(1.0); opacity: 0.95; }
    50% { transform: scale(1.1); opacity: 0.7; }
  }
`;
document.head.appendChild(style);

let qrCameraStream = null;

window.openQRScannerModal = function() {
  // Create modal layout
  const overlay = document.createElement("div");
  overlay.className = "modal-backdrop";
  overlay.id = "qr-scanner-modal-backdrop";
  overlay.style.display = "flex";

  overlay.innerHTML = `
    <div class="modal" style="max-width: 500px; border: 1px solid rgba(18, 181, 255, 0.3);">
      <div class="modal-header" style="background-color: #0b1c3d; color: white;">
        <h3 class="card-title" style="color: white; display: flex; align-items: center; gap: 0.5rem; font-size: 1.15rem;">
          <span style="font-size:1.3rem;"></span> Instant Cryptographic QR Scanner
        </h3>
        <button class="modal-close" style="color: rgba(255,255,255,0.7); background: transparent;" onclick="closeQRScannerModal()">✕</button>
      </div>
      <div class="modal-body" id="qr-modal-view-container" style="padding: 1.5rem;">
        <!-- STEP 1: LOADING SECURE WEB CAMERA HARDWARE -->
        <div id="qr-step-init" style="text-align: center; padding: 2.5rem 1.5rem;">
          <div style="margin: 0 auto 1.5rem; width: 45px; height: 45px; border: 3px solid rgba(13, 110, 253, 0.1); border-top-color: var(--blockchain-blue); border-radius: 50%; animation: decrypt-spin 0.8s linear infinite;"></div>
          <p style="font-weight: 700; color: var(--primary-deep); margin-bottom: 0.35rem; font-size:1rem;">Booting Diagnostic Camera Hardware...</p>
          <p style="font-size: 0.8rem; color: var(--text-muted);">Allocating safe ledger-proxy node stream</p>
        </div>

        <!-- STEP 2: LIVE PREVIEW & INTERACTIVE DELEGATOR -->
        <div id="qr-step-scanning" style="display: none; text-align: center;">
          <p style="font-size: 0.88rem; color: var(--text-muted); margin-bottom: 1.25rem;">
            Align a partner doctor's public license key QR code with the frame below:
          </p>

          <div style="position: relative; width: 100%; max-width: 320px; height: 260px; margin: 0 auto 1.5rem; background-color: #0d1e3a; border-radius: 12px; overflow: hidden; display: flex; align-items: center; justify-content: center; border: 2px solid var(--border-color);">
            <video id="qr-video-feed" style="width: 100%; height: 100%; object-fit: cover; transform: scaleX(-1);"></video>
            
            <!-- Webcam Access Blocked fallback UI element -->
            <div id="qr-fallback-view" style="position: absolute; inset: 0; background: linear-gradient(135deg, #07132b, #11254a); display: none; flex-direction: column; align-items: center; justify-content: center; padding: 1rem; color: #a4b3cd;">
              <span style="font-size: 2.5rem; margin-bottom: 0.5rem; animation: pulse-radar 2s infinite;"></span>
              <p style="font-size: 0.85rem; font-weight:700; color: #fff; margin-bottom: 0.25rem;">Diagnostic Feed Active</p>
              <p style="font-size: 0.75rem; opacity: 0.8; max-width: 240px; text-align: center; line-height:1.4;">Webcam stream running in test-net sandbox. Select a clinician below to parse instantly.</p>
            </div>

            <!-- Glowing Grid target overlay -->
            <div class="qr-target-box">
              <div class="corner top-left"></div>
              <div class="corner top-right"></div>
              <div class="corner bottom-left"></div>
              <div class="corner bottom-right"></div>
              <!-- Running vertical laser line -->
              <div class="qr-scan-laser"></div>
            </div>

            <span class="badge badge-success" style="position: absolute; top: 10px; right: 10px; font-size: 0.75rem; background: rgba(40, 167, 69, 0.95);">
               LEDGER ONLINE
            </span>
          </div>

          <!-- Quick Test Simulation presets -->
          <div style="text-align: left; background: var(--bg-light); border-radius: var(--radius-md); padding: 1rem; border: 1px solid var(--border-color); margin-bottom: 1rem;">
            <p style="font-size: 0.8rem; font-weight: 700; color: var(--primary-deep); margin-bottom: 0.6rem; display: flex; align-items: center; gap: 0.4rem;">
              <span>⚡</span> Fast Sandbox Simulation Controls:
            </p>
            <div style="display: grid; grid-template-columns: 1fr; gap: 0.5rem;">
              <button class="btn btn-sm btn-outline" style="font-size: 0.8rem; text-align: left; justify-content: flex-start; width: 100%;" onclick="simulateDoctorQRScan('Dr. Amina Osei', 'Kenyatta National Hospital', '0x9a38fbdc99e2fada012bcda98f82173e')">
                Scan Dr. Amina Osei (Kenyatta)
              </button>
              <button class="btn btn-sm btn-outline" style="font-size: 0.8rem; text-align: left; justify-content: flex-start; width: 100%;" onclick="simulateDoctorQRScan('Dr. Sarah Jenkins', 'Nairobi National Hospital', '0x5bb4fd0283ffca83eb012a9efda83011')">
                Scan Dr. Sarah Jenkins (Nairobi)
              </button>
              <button class="btn btn-sm btn-outline" style="font-size: 0.8rem; text-align: left; justify-content: flex-start; width: 100%;" onclick="simulateDoctorQRScan('Dr. Michael Patel', 'Aga Khan University Hospital', '0xdc97216a782b14f88be23871ab93d201')">
                Scan Dr. Michael Patel (Aga Khan)
              </button>
            </div>
          </div>
          <p style="font-size: 0.75rem; color: var(--text-muted); font-style: italic;">
            Waiting to register QR patterns via live hardware camera loop...
          </p>
        </div>

        <!-- STEP 3: SUCCESS & FORM DELEGATION -->
        <div id="qr-step-signing" style="display: none;">
          <div style="display: flex; align-items: center; gap: 0.75rem; background-color: rgba(40, 167, 69, 0.08); border: 1px solid rgba(40, 167, 69, 0.2); padding: 0.95rem; border-radius: 8px; margin-bottom: 1.25rem;">
            <div style="font-size: 1.5rem; color: var(--success);">✓</div>
            <div>
              <p style="font-weight: 700; color: var(--success); font-size: 0.95rem; margin-bottom: 0.1rem;">Cryptographic Node Verification Complete</p>
              <p style="font-size: 0.75rem; color: var(--text-muted); line-height: 1.1;">Direct doctor identity matching confirmed via private registry block.</p>
            </div>
          </div>

          <div style="background-color: var(--bg-light); border: 1px solid var(--border-color); border-radius: 8px; padding: 1rem; margin-bottom: 1.25rem;">
            <p style="font-size: 0.75rem; color: var(--text-muted); font-weight: 600; text-transform: uppercase; margin-bottom: 0.4rem; letter-spacing: 0.05em;">Verified Registry Block</p>
            
            <div style="display:flex; justify-content:space-between; margin-bottom:0.4rem; font-size:0.9rem;">
              <span style="color:var(--text-muted);">Clinician:</span>
              <strong id="qr-scanned-doctor-name"></strong>
            </div>
            <div style="display:flex; justify-content:space-between; margin-bottom:0.4rem; font-size:0.9rem;">
              <span style="color:var(--text-muted);">Clinic:</span>
              <strong id="qr-scanned-doctor-hospital"></strong>
            </div>
            <div style="display:flex; flex-direction:column; gap:0.2rem; font-size:0.8rem; border-top: 1px dashed var(--border-color); padding-top:0.4rem;">
              <span style="color:var(--text-muted);">Node Public Key:</span>
              <span id="qr-scanned-doctor-key" style="font-family: var(--font-mono); font-size:0.75rem; word-break: break-all; color: var(--primary-deep); background: rgba(13, 110, 253, 0.05); padding: 0.35rem; border-radius: 4px; border: 1px dashed rgba(13, 110, 253, 0.15);"></span>
            </div>
          </div>

          <!-- Configuration parameters -->
          <form id="qr-delegation-form" onsubmit="executeQRConsentDelegation(event)">
            <input type="hidden" id="qr-form-doctor-name" />
            <input type="hidden" id="qr-form-doctor-hospital" />
            <input type="hidden" id="qr-form-doctor-key" />

            <div class="form-group" style="margin-bottom: 1rem;">
              <label class="form-label" style="display: block; margin-bottom: 0.35rem; font-weight: 600; font-size: 0.88rem;">Authorization Access Level</label>
              <select class="form-control" id="qr-form-access" style="width: 100%;">
                <option value="Read Only">Read Only (AES cryptographic decryption only)</option>
                <option value="Full Control">Full Control (Permit updates and additions)</option>
              </select>
            </div>

            <div class="form-group" style="margin-bottom: 1.25rem;">
              <label class="form-label" style="display: block; margin-bottom: 0.35rem; font-weight: 600; font-size: 0.88rem;">Sovereign Consent Lock Expiry</label>
              <select class="form-control" id="qr-form-expiry" style="width: 100%;">
                <option value="3 Months">3 Months (Smart lock expiration)</option>
                <option value="6 Months" selected>6 Months (Default ledger recommendation)</option>
                <option value="12 Months">12 Months (Long term clinical care)</option>
                <option value="Permanent">Unrestricted (Requires explicit revocation block)</option>
              </select>
            </div>

            <button type="submit" class="btn btn-primary" style="width: 100%; display: flex; align-items: center; justify-content: center; gap: 0.5rem; padding: 0.75rem; font-weight: 700;">
            <span></span> Cryptographically Sign & Publish Consent
            </button>
          </form>
        </div>

        <!-- STEP 4: BLOCK PUBLISHING SUCCESS -->
        <div id="qr-step-success" style="display: none; text-align: center; padding: 2rem 1rem;">
          <div style="margin: 0 auto 1.25rem; width: 56px; height: 56px; line-height: 56px; background-color: var(--success-bg); color: var(--success); font-size: 1.5rem; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-left: auto; margin-right: auto;">✓</div>
          <p style="font-weight: 700; color: var(--primary-deep); font-size: 1.25rem; margin-bottom: 0.5rem;">Consent Published Successfully</p>
          <p style="font-size:0.85rem; color: var(--text-muted); margin-bottom: 1.5rem; max-width: 320px; margin-left:auto; margin-right:auto;">
            The diagnostic grant block has been written and broadcasted to local blockchain nodes. Clinician keys are authorized immediately.
          </p>
          <div style="display: flex; flex-direction: column; gap:0.5rem; background: var(--bg-light); padding:0.8rem; border-radius: 8px; border:1px solid var(--border-color); font-family: var(--font-mono); font-size: 0.75rem; max-width:340px; margin:0 auto 1.5rem; text-align: left;">
            <div style="display:flex; justify-content:space-between;">
              <span style="opacity:0.75;">TX BLOCKHASH:</span>
              <strong id="qr-success-blockhash" style="color:var(--blockchain-blue);"></strong>
            </div>
            <div style="display:flex; justify-content:space-between;">
              <span style="opacity:0.75;">METHOD:</span>
              <strong>delegateSovereignConsent()</strong>
            </div>
          </div>
          <button class="btn btn-primary" style="width: 100%;" onclick="closeQRScannerModal()">Return to Registry</button>
        </div>
      </div>
    </div>
  `;

  document.body.appendChild(overlay);

  // Switch display views and initial load timer
  setTimeout(async () => {
    const initEl = document.getElementById("qr-step-init");
    const scanEl = document.getElementById("qr-step-scanning");
    if (!initEl || !scanEl) return;
    
    initEl.style.display = "none";
    scanEl.style.display = "block";

    // Try camera
    const videoObj = document.getElementById("qr-video-feed");
    const fallbackObj = document.getElementById("qr-fallback-view");
    try {
      qrCameraStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" }
      });
      if (videoObj) {
        videoObj.srcObject = qrCameraStream;
        videoObj.setAttribute("playsinline", true);
        videoObj.play();
      }
    } catch (err) {
      console.warn("Could not acquire actual video stream:", err);
      // Fallback
      if (fallbackObj) {
        fallbackObj.style.display = "flex";
      }
    }
  }, 1000);
};

window.closeQRScannerModal = function() {
  // Stop camera if running
  if (qrCameraStream) {
    qrCameraStream.getTracks().forEach(track => track.stop());
    qrCameraStream = null;
  }
  
  const modal = document.getElementById("qr-scanner-modal-backdrop");
  if (modal) {
    modal.remove();
  }
};

window.simulateDoctorQRScan = function(doctorName, hospital, pKey) {
  // Turn off camera
  if (qrCameraStream) {
    qrCameraStream.getTracks().forEach(track => track.stop());
    qrCameraStream = null;
  }

  // Switch steps
  const scanEl = document.getElementById("qr-step-scanning");
  const signEl = document.getElementById("qr-step-signing");
  if (scanEl && signEl) {
    scanEl.style.display = "none";
    signEl.style.display = "block";
  }

  // Populate data
  const docNameEl = document.getElementById("qr-scanned-doctor-name");
  const docHospEl = document.getElementById("qr-scanned-doctor-hospital");
  const docKeyEl = document.getElementById("qr-scanned-doctor-key");

  if (docNameEl) docNameEl.textContent = doctorName;
  if (docHospEl) docHospEl.textContent = hospital;
  if (docKeyEl) docKeyEl.textContent = pKey;

  // Form values
  document.getElementById("qr-form-doctor-name").value = doctorName;
  document.getElementById("qr-form-doctor-hospital").value = hospital;
  document.getElementById("qr-form-doctor-key").value = pKey;
};

window.executeQRConsentDelegation = function(event) {
  event.preventDefault();

  const doctor = document.getElementById("qr-form-doctor-name").value;
  const hospital = document.getElementById("qr-form-doctor-hospital").value;
  const keyKey = document.getElementById("qr-form-doctor-key").value;
  const accessType = document.getElementById("qr-form-access").value;
  const expirySelect = document.getElementById("qr-form-expiry").value;

  // Format Expiry date
  const formattedDate = new Date().toISOString().split('T')[0];
  let expiryDateString = "";
  if (expirySelect === "Permanent") {
    expiryDateString = "Unlimited Lock";
  } else {
    const months = parseInt(expirySelect);
    const d = new Date();
    d.setMonth(d.getMonth() + (isNaN(months) ? 6 : months));
    expiryDateString = d.toISOString().split('T')[0];
  }

  // Generate unique permission ID
  const permID = "PERM-" + Math.floor(Math.random() * 10000);

  // Complete addition to Registry database
  AfyaAPI.addPermission({
    id: permID,
    doctor,
    hospital,
    accessType,
    grantedDate: formattedDate,
    expiry: expiryDateString,
    status: "Granted"
  });

  const txHex = "0x" + Math.round(Math.random() * 1e16).toString(16).padEnd(32, "9") + "tx";
  
  // Transition steps UI
  const signEl = document.getElementById("qr-step-signing");
  const finalEl = document.getElementById("qr-step-success");
  if (signEl && finalEl) {
    signEl.style.display = "none";
    finalEl.style.display = "block";
  }

  const successHashEl = document.getElementById("qr-success-blockhash");
  if (successHashEl) {
    successHashEl.textContent = txHex.substring(0, 18) + "...";
  }

  // Refresh Parent Dashboard UI counters & grid
  renderPatientDashboard();
};
