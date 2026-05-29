/**
 * AfyaChain Centralized API & Mock Database Layer
 * Resolves blockchain registry state using local storage persistence
 */

const API_BASE_URL = "/api";

// Initialize database 
function initMockDatabase() {
  const defaultRecords = [
    {
      id: "REC-9823",
      hospital: "Nairobi National Hospital",
      type: "Cardiorespiratory Exam",
      date: "2026-05-10",
      doctor: "Dr. Juma",
      status: "Encrypted",
      fileSize: "2.4 MB",
      hash: "0x7a3f8b02e9cf0a12e84c93da4e99f012"
    },
    {
      id: "REC-4412",
      hospital: "Aga Khan University Hospital",
      type: "Blood Panel (Complete)",
      date: "2026-04-18",
      doctor: "Dr. Michael Patel",
      status: "Encrypted",
      fileSize: "1.8 MB",
      hash: "0xdc97216a782b14f88be23871ab93d201"
    },
    {
      id: "REC-1051",
      hospital: "Kenyatta National Hospital",
      type: "MRI Brain Scan",
      date: "2026-01-22",
      doctor: "Dr. Amina Osei",
      status: "Encrypted",
      fileSize: "41.2 MB",
      hash: "0xbc854fd012176bfa3efab485acdec152"
    }
  ];

  const defaultPermissions = [
    {
      id: "PERM-1",
      doctor: "Dr. Juma Tonny",
      hospital: "Nairobi National Hospital",
      accessType: "Read Only",
      grantedDate: "2026-05-12",
      expiry: "2026-11-12",
      status: "Granted"
    },
    {
      id: "PERM-2",
      doctor: "Dr. Michael Patel",
      hospital: "Aga Khan University Hospital",
      accessType: "Full Control",
      grantedDate: "2026-04-20",
      expiry: "2026-10-20",
      status: "Granted"
    },
    {
      id: "PERM-3",
      doctor: "Dr. Amina Osei",
      hospital: "Kenyatta National Hospital",
      accessType: "Read Only",
      grantedDate: "2026-01-24",
      expiry: "2026-07-24",
      status: "Revoked"
    }
  ];

  const defaultRequests = [
    {
      id: "REQ-201",
      patientName: "Alex Mercer",
      condition: "Cardiorespiratory Follow-up",
      accessType: "Read Only",
      status: "Pending",
      date: "2026-05-27",
      hospital: "Nairobi National Hospital",
      doctor: "Dr. Juma"
    },
    {
      id: "REQ-202",
      patientName: "Alex Mercer",
      condition: "Genetic Sequencing Panel",
      accessType: "Full Control",
      status: "Approved",
      date: "2026-05-26",
      hospital: "Aga Khan University Hospital",
      doctor: "Dr. Michael Patel"
    },
    {
      id: "REQ-203",
      patientName: "Alex Mercer",
      condition: "Neurology Assessment",
      accessType: "Read Only",
      status: "Denied",
      date: "2026-05-24",
      hospital: "Kenyatta National Hospital",
      doctor: "Dr. Amina Osei"
    }
  ];

  const defaultLogs = [
    {
      id: "LOG-01",
      timestamp: "2026-05-28 14:23:10",
      event: "Access Granted",
      details: "Patient Alex Mercer granted record access to Dr. Juma Tonney.",
      hash: "0x89e2ad14f9d43bfbdca1203d98beccd8",
      status: "success"
    },
    {
      id: "LOG-02",
      timestamp: "2026-05-28 11:05:45",
      event: "Record Accessed",
      details: "Dr. Michael Patel successfully viewed CBC Blood Panel.",
      hash: "0x34a1bc2de93847fbad12daef93eecda1",
      status: "info"
    },
    {
      id: "LOG-03",
      timestamp: "2026-05-27 16:40:12",
      event: "Record Uploaded",
      details: "New record 'Cardiorespiratory Exam' successfully pinned to IPFS CID QmYwAP.",
      hash: "0xf210baef98dcd37c89ba12deced98ab2",
      status: "success"
    }
  ];

  if (!localStorage.getItem("afya_records")) {
    localStorage.setItem("afya_records", JSON.stringify(defaultRecords));
  }
  if (!localStorage.getItem("afya_permissions")) {
    localStorage.setItem("afya_permissions", JSON.stringify(defaultPermissions));
  }
  if (!localStorage.getItem("afya_requests")) {
    localStorage.setItem("afya_requests", JSON.stringify(defaultRequests));
  }
  if (!localStorage.getItem("afya_logs")) {
    localStorage.setItem("afya_logs", JSON.stringify(defaultLogs));
  }
}

// Ensure database seeded
initMockDatabase();

// --- API SDK helper object ---
const AfyaAPI = {
  // DB query utilities
  getRecords() {
    return JSON.parse(localStorage.getItem("afya_records") || "[]");
  },
  saveRecords(records) {
    localStorage.setItem("afya_records", JSON.stringify(records));
  },
  addRecord(record) {
    const list = this.getRecords();
    list.unshift(record);
    this.saveRecords(list);
    this.addLog("Record Uploaded", `New record '${record.type}' uploaded & encrypted via Patient Portal.`, record.hash, "success");
  },

  getPermissions() {
    return JSON.parse(localStorage.getItem("afya_permissions") || "[]");
  },
  savePermissions(perms) {
    localStorage.setItem("afya_permissions", JSON.stringify(perms));
  },
  addPermission(perm) {
    const list = this.getPermissions();
    list.unshift(perm);
    this.savePermissions(list);
    const hash = "0x" + Math.random().toString(16).substr(2, 32);
    this.addLog("Access Granted", `Granted '${perm.accessType}' consent to ${perm.doctor} at ${perm.hospital}.`, hash, "success");
  },
  updatePermissionStatus(id, newStatus) {
    const list = this.getPermissions();
    const updated = list.map(p => {
      if (p.id === id) {
        p.status = newStatus;
        const event = newStatus === "Granted" ? "Access Restored" : "Access Revoked";
        const hash = "0x" + Math.random().toString(16).substr(2, 32);
        this.addLog(event, `Patient status change on ${p.doctor} access permissions: ${newStatus}.`, hash, newStatus === "Granted" ? "success" : "danger");
      }
      return p;
    });
    this.savePermissions(updated);
  },

  getRequests() {
    return JSON.parse(localStorage.getItem("afya_requests") || "[]");
  },
  saveRequests(reqs) {
    localStorage.setItem("afya_requests", JSON.stringify(reqs));
  },
  addRequest(req) {
    const list = this.getRequests();
    list.unshift(req);
    this.saveRequests(list);
  },
  updateRequestStatus(id, status) {
    const list = this.getRequests();
    const target = list.find(r => r.id === id);
    if (!target) return;
    
    target.status = status;
    this.saveRequests(list);

    if (status === "Approved") {
      // Automatically generate a core permission for this doctor
      const formattedDate = new Date().toISOString().split('T')[0];
      const expiryDate = new Date();
      expiryDate.setMonth(expiryDate.getMonth() + 6);
      const formattedExpiry = expiryDate.toISOString().split('T')[0];

      this.addPermission({
        id: "PERM-" + Math.floor(Math.random() * 10000),
        doctor: target.doctor,
        hospital: target.hospital,
        accessType: target.accessType,
        grantedDate: formattedDate,
        expiry: formattedExpiry,
        status: "Granted"
      });
    } else if (status === "Denied") {
      const hash = "0x" + Math.random().toString(16).substr(2, 32);
      this.addLog("Request Denied", `Denied access request from ${target.doctor} for path '${target.condition}'.`, hash, "danger");
    }
  },

  getLogs() {
    return JSON.parse(localStorage.getItem("afya_logs") || "[]");
  },
  addLog(event, details, hash, status) {
    const logs = this.getLogs();
    const now = new Date();
    const timestamp = now.toISOString().replace(/T/, ' ').replace(/\..+/, '');
    logs.unshift({
      id: "LOG-" + Math.floor(Math.random() * 10000),
      timestamp,
      event,
      details,
      hash,
      status
    });
    localStorage.setItem("afya_logs", JSON.stringify(logs));
  },

  // HTTP helper utilities requested
  async get(url) {
    console.log(`[AfyaChain API Mock GET]: Fetching ${url}`);
    return { ok: true, status: 200, json: async () => this.resolveMockRoutes(url, "GET") };
  },

  async post(url, body) {
    console.log(`[AfyaChain API Mock POST]: Submitting to ${url}`, body);
    return { ok: true, status: 201, json: async () => this.resolveMockRoutes(url, "POST", body) };
  },

  async put(url, body) {
    console.log(`[AfyaChain API Mock PUT]: Updating ${url}`, body);
    return { ok: true, status: 200, json: async () => this.resolveMockRoutes(url, "PUT", body) };
  },

  async delete(url) {
    console.log(`[AfyaChain API Mock DELETE]: Deleting ${url}`);
    return { ok: true, status: 200, json: async () => this.resolveMockRoutes(url, "DELETE") };
  },

  resolveMockRoutes(url, method, body = {}) {
    if (url.includes("/records")) {
      if (method === "POST") {
        this.addRecord(body);
        return { success: true, message: "Record uploaded successfully" };
      }
      return this.getRecords();
    }
    if (url.includes("/permissions")) {
      if (method === "POST") {
        this.addPermission(body);
        return { success: true, message: "Permission granted" };
      }
      return this.getPermissions();
    }
    if (url.includes("/requests")) {
      return this.getRequests();
    }
    if (url.includes("/logs")) {
      return this.getLogs();
    }
    return { status: "not found" };
  }
};
