## Project structure
<pre>
afyachain/
│
├── frontend/
│   ├── pages/
│   │   ├── index.html
│   │   ├── patient-dashboard.html
│   │   ├── doctor-dashboard.html
│   │   ├── upload-record.html
│   │   └── access-management.html
│   │
│   ├── js/
│   │   ├── api.js
│   │   ├── patient.js
│   │   ├── doctor.js
│   │   ├── upload.js
│   │   └── access.js
│   │
│   ├── css/
│   │   └── styles.css
│   │
│   └── assets/
│
├── backend/
│   ├── main.go
│   │
│   ├── routes/
│   │   ├── auth.go
│   │   ├── records.go
│   │   ├── access.go
│   │   └── audit.go
│   │
│   ├── controllers/
│   │   ├── authController.go
│   │   ├── recordController.go
│   │   ├── accessController.go
│   │   └── auditController.go
│   │
│   ├── models/
│   │   ├── user.go
│   │   ├── record.go
│   │   ├── access.go
│   │   └── audit.go
│   │
│   ├── utils/
│   │   ├── hash.go
│   │   ├── jwt.go
│   │   └── middleware.go
│   │
│   └── db/
│       └── db.go
│
├── storage/
│   └── uploads/
│
├── README.md
└── go.
</pre>