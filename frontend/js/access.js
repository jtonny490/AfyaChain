/*
 AfyaChain Access Control & Consent Contract Script
 Allows patients to grant, revoke, and inspect key permissions,
 and tracks real-time ledger audits.
 */

document.addEventListener("DOMContentLoaded", () => {
  // Init mobile sidebar toggle interaction
  initializeMobileSidebar();

  // Populate lists
  renderAccessManagement();

  // Handle create permission consent form
  const permissionForm = document.getElementById("grant-permission-form");
  if (permissionForm) {
    permissionForm.addEventListener("submit", handleGrantPermissionSubmit);
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

function renderAccessManagement() {
  const permissions = AfyaAPI.getPermissions();
  const logs = AfyaAPI.getLogs();

  // 1. Render Permissions Table
  const tableBody = document.getElementById("permissions-table-body");
  if (tableBody) {
    if (permissions.length === 0) {
      tableBody.innerHTML = `
        <tr>
          <td colspan="6" style="text-align: center; padding: 3rem 1.5rem;">
            <div class="empty-state">
              <div class="empty-state-icon"></div>
              <p class="empty-state-title">No Consent Entries Registered</p>
              <p class="empty-state-desc">You are completely autonomous. No clinicians can currently search, fetch, or view your medical profiles.</p>
            </div>
          </td>
        </tr>
      `;
    } else {
      tableBody.innerHTML = permissions.map(perm => {
        const isGranted = perm.status === "Granted";
        const statusBadge = isGranted 
          ? `<span class="badge badge-success">Consent Active</span>` 
          : `<span class="badge badge-danger">Revoked</span>`;

        const actionBtn = isGranted 
          ? `<button class="btn btn-sm btn-outline btn-danger" onclick="toggleLocalPermission('${perm.id}', 'Revoked')">Revoke</button>`
          : `<button class="btn btn-sm btn-primary" onclick="toggleLocalPermission('${perm.id}', 'Granted')">Authorize</button>`;

        return `
          <tr id="row-${perm.id}">
            <td><strong style="color:var(--primary-deep);">${perm.doctor}</strong></td>
            <td><span style="font-weight: 500;">${perm.hospital}</span></td>
            <td><span class="permission-tag">${perm.accessType}</span></td>
            <td style="font-family: var(--font-mono); font-size:0.85rem; color:var(--text-muted);">${perm.grantedDate}</td>
            <td style="font-family: var(--font-mono); font-size:0.85rem; color:var(--text-muted);">${perm.expiry}</td>
            <td>${statusBadge}</td>
            <td>
              <div style="display: flex; gap: 0.5rem;">
                ${actionBtn}
                <button class="btn btn-sm btn-outline" onclick="extendExpiryDate('${perm.id}')">Extend Block</button>
              </div>
            </td>
          </tr>
        `;
      }).join('');
    }
  }

  // 2. Render Global Audit Trail Timeline
  const timelineEl = document.getElementById("blockchain-audit-timeline");
  if (timelineEl) {
    if (logs.length === 0) {
      timelineEl.innerHTML = `<p style="color: var(--text-muted); text-align:center;">No audits reported.</p>`;
    } else {
      timelineEl.innerHTML = logs.map(log => `
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

window.toggleLocalPermission = function(permId, newStatus) {
  AfyaAPI.updatePermissionStatus(permId, newStatus);
  renderAccessManagement();
};

window.extendExpiryDate = function(permId) {
  const perms = AfyaAPI.getPermissions();
  const target = perms.find(p => p.id === permId);
  if (!target) return;

  const currentExpiry = new Date(target.expiry);
  currentExpiry.setMonth(currentExpiry.getMonth() + 6); // Extend by 6 months
  const newExpiryStr = currentExpiry.toISOString().split('T')[0];

  target.expiry = newExpiryStr;
  AfyaAPI.savePermissions(perms);
  
  const hash = "0x" + Math.random().toString(16).substr(2, 32);
  AfyaAPI.addLog("Permission Extended", `Patient elongated ${target.doctor}'s cryptographic viewing keys expiry block to ${newExpiryStr}.`, hash, "success");

  alert(`Consent block window extended for ${target.doctor}. Expiration rescheduled to ${newExpiryStr}.`);
  renderAccessManagement();
};

function handleGrantPermissionSubmit(event) {
  event.preventDefault();

  const doctorInput = document.getElementById("select-doctor").value.trim();
  const hospitalInput = document.getElementById("select-hospital").value.trim();
  const levelSelection = document.getElementById("select-access-level").value;
  const durationCount = document.getElementById("select-duration").value;

  if (!doctorInput || !hospitalInput) {
    alert("Please search and select a legitimate physician/hospital to continue keys delegation.");
    return;
  }

  // Calculate Expiry Date in months
  const monthsOffset = parseInt(durationCount) || 6;
  const expiryDate = new Date();
  expiryDate.setMonth(expiryDate.getMonth() + monthsOffset);
  const formattedExpiry = expiryDate.toISOString().split('T')[0];
  const formattedToday = new Date().toISOString().split('T')[0];

  const newPerm = {
    id: "PERM-" + Math.floor(Math.random() * 10000),
    doctor: doctorInput,
    hospital: hospitalInput,
    accessType: levelSelection,
    grantedDate: formattedToday,
    expiry: formattedExpiry,
    status: "Granted"
  };

  AfyaAPI.addPermission(newPerm);

  // Close grant permission modal
  closeGrantPermissionModal();
  
  // Re-render
  renderAccessManagement();

  alert(`Cryptographic consent granted for ${doctorInput} under standard compliance rules! Keys published successfully.`);
}

window.openGrantPermissionModal = function() {
  const modal = document.getElementById("grant-permission-modal");
  if (modal) modal.style.display = "flex";
};

window.closeGrantPermissionModal = function() {
  const modal = document.getElementById("grant-permission-modal");
  if (modal) modal.style.display = "none";
};
