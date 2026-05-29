 //AfyaChain File Upload & Cryptographic Encryption Layer
 
document.addEventListener("DOMContentLoaded", () => {
  // Init mobile sidebar toggle interaction
  initializeMobileSidebar();

  const dropZone = document.getElementById("drop-zone");
  const fileInput = document.getElementById("file-input");
  const uploadForm = document.getElementById("health-upload-form");

  if (dropZone && fileInput) {
    // Configure click on drop zone to trigger standard file selector
    dropZone.addEventListener("click", () => {
      fileInput.click();
    });

    fileInput.addEventListener("change", handleFileSelection);

    // Setup drag-and-drop listener rules
    ["dragenter", "dragover"].forEach(eventName => {
      dropZone.addEventListener(eventName, (e) => {
        e.preventDefault();
        dropZone.classList.add("dragover");
      }, false);
    });

    ["dragleave", "drop"].forEach(eventName => {
      dropZone.addEventListener(eventName, (e) => {
        e.preventDefault();
        dropZone.classList.remove("dragover");
      }, false);
    });

    dropZone.addEventListener("drop", (e) => {
      const dt = e.dataTransfer;
      const files = dt.files;
      if (files.length > 0) {
        fileInput.files = files;
        handleFileSelection();
      }
    });
  }

  if (uploadForm) {
    uploadForm.addEventListener("submit", processFormSubmission);
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

let selectedFileSizeStr = "0 KB";

function handleFileSelection() {
  const fileInput = document.getElementById("file-input");
  const uploadText = document.getElementById("upload-text-indicator");
  const hashPreview = document.getElementById("hash-preview-container");

  if (!fileInput || !fileInput.files || fileInput.files.length === 0) return;

  const file = fileInput.files[0];
  const sizeMb = (file.size / (1024 * 1024)).toFixed(2);
  selectedFileSizeStr = sizeMb + " MB";

  // Trigger fake secure blockchain SHA-256 hash generation
  const hashGeneratorDigest = "0x" + Array.from({length: 32}, () => 
    Math.floor(Math.random()*16).toString(16)
  ).join('');

  if (uploadText) {
    uploadText.innerHTML = `<strong>Selected File:</strong> ${file.name} (${selectedFileSizeStr})`;
  }

  if (hashPreview) {
    hashPreview.style.display = "flex";
    const rawValEl = document.getElementById("raw-hash-value");
    if (rawValEl) rawValEl.textContent = hashGeneratorDigest;
  }
}

function processFormSubmission(event) {
  event.preventDefault();

  const titleVal = document.getElementById("record-title").value.trim();
  const hospitalVal = document.getElementById("hospital-name").value.trim();
  const categoryVal = document.getElementById("record-category").value;
  const dateVal = document.getElementById("record-date").value;
  const rawHashValEl = document.getElementById("raw-hash-value");
  
  const hashVal = rawHashValEl ? rawHashValEl.textContent : "0x" + Math.random().toString(16).substr(2, 32);

  if (!titleVal || !hospitalVal) {
    alert("Please complete the title, date and primary hospital elements.");
    return;
  }

  // Hide form container & display dynamic upload progress container
  const formBody = document.getElementById("upload-form-body");
  const progressContainer = document.getElementById("progress-status-container");
  
  if (formBody && progressContainer) {
    formBody.style.display = "none";
    progressContainer.style.display = "block";
    
    animateSimulation(hashVal, titleVal, hospitalVal, categoryVal, dateVal);
  }
}

function animateSimulation(hashVal, title, hospital, category, date) {
  const progressBar = document.getElementById("progress-bar-indicator");
  const statusLabel = document.getElementById("progress-status-label");
  const progressValueText = document.getElementById("progress-value-text");

  let percentage = 0;
  
  const encryptionStages = [
    { threshold: 15, msg: "Initiating Local Web3 Node Handshake..." },
    { threshold: 45, msg: "Deriving AES-256 Zero-Knowledge Encryptions..." },
    { threshold: 75, msg: "Relaying Secure Shards to IPFS Storage Nodes..." },
    { threshold: 95, msg: "Anchoring Integrity Hash on AfyaChain Ledger..." },
    { threshold: 100, msg: "Block Confirmed! Transaction Sealed Successfully." }
  ];

  const timer = setInterval(() => {
    percentage += 2;
    if (progressBar) progressBar.style.width = percentage + "%";
    if (progressValueText) progressValueText.textContent = percentage + "%";

    const stage = encryptionStages.find(s => percentage <= s.threshold);
    if (stage && statusLabel) {
      statusLabel.textContent = stage.msg;
    }

    if (percentage >= 100) {
      clearInterval(timer);
      
      // Save data record in DB
      const newRecord = {
        id: "REC-" + Math.floor(Math.random() * 10000),
        hospital,
        type: category,
        date: date || new Date().toISOString().split('T')[0],
        doctor: "Dr. Self Certified",
        status: "Encrypted",
        fileSize: selectedFileSizeStr !== "0 KB" ? selectedFileSizeStr : "2.1 MB",
        hash: hashVal
      };

      AfyaAPI.addRecord(newRecord);

      // Trigger dynamic successful receipt modal
      setTimeout(renderSuccessModal, 400);
    }
  }, 40);
}

function renderSuccessModal() {
  const overlay = document.createElement("div");
  overlay.className = "modal-backdrop";
  overlay.style.display = "flex";

  overlay.innerHTML = `
    <div class="modal">
      <div class="modal-header" style="background-color: var(--success-bg);">
        <h3 class="card-title text-success" style="color: var(--success);">✓ Verification Confirmed</h3>
      </div>
      <div class="modal-body" style="text-align:center; padding: 2rem;">
        <div style="font-size: 3rem; margin-bottom: 1rem;">🧬</div>
        <p style="font-weight: 800; color: var(--primary-deep); font-size:1.4rem; margin-bottom:0.5rem;">AfyaChain Block Created</p>
        <p style="color:var(--text-muted); font-size:0.9rem; margin-bottom: 1.5rem; line-height:1.5;">
          Your medical record file has been shredded, securely encrypted end-to-end, and anchored onto the ledger. Patient owns ultimate key sovereignty.
        </p>
        
        <button class="btn btn-secondary" style="width: 100%;" onclick="window.location.href='patient-dashboard.html'">Return to Patient Portal</button>
      </div>
    </div>
  `;

  document.body.appendChild(overlay);
}
