# Down Syndrome Support App

This is a Next.js application designed to support individuals with Down Syndrome and their families. The application follows an MVC (Model-View-Controller) architectural pattern.

## Folder Structure

```
├── app/                 # Next.js app router pages (Views)
│   ├── layout.tsx       # Root layout with navigation
│   ├── page.tsx         # Home page
│   ├── patients/page.tsx # Patients page
│   └── records/page.tsx # Medical records page
├── components/          # Reusable UI components
│   └── Navigation.tsx   # Navigation component
├── controllers/         # Controller layer
│   ├── BaseController.ts # Base controller class
│   ├── patientController.ts # Patient controller
│   └── medicalRecordController.ts # Medical record controller
├── models/              # Data models (MVC Models)
│   ├── Patient.ts       # Patient model
│   ├── MedicalRecord.ts # Medical record model
│   └── User.ts          # User model
├── services/            # Business logic layer (MVC Services)
│   ├── BaseService.ts   # Base service class
│   ├── patientService.ts # Patient service
│   ├── medicalRecordService.ts # Medical record service
│   └── userService.ts   # User service
├── utils/               # Utility functions
│   ├── apiUtils.ts      # API utilities
│   ├── dateUtils.ts     # Date utilities
│   └── validationUtils.ts # Validation utilities
├── public/              # Static assets
└── styles/              # Global styles
```

## Architecture

This application follows the MVC pattern:

### Models
Models represent the data structure and business logic for entities in the application:
- Patient: Represents individuals with Down Syndrome
- MedicalRecord: Represents medical information for patients
- User: Represents system users (doctors, administrators, etc.)

### Views
Views are the user interface components built with Next.js:
- Pages in the `app/` directory
- Reusable components in the `components/` directory

### Controllers
Controllers handle the interaction between views and services:
- Process user input from views
- Call appropriate service methods
- Return data to views

### Services
Services contain the business logic and data access:
- Handle data manipulation and validation
- Manage data persistence (simulated with in-memory storage)
- Provide a clean API for controllers

## Getting Started

First, install the dependencies:

```bash
npm install
```

Then, run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Features

- Patient management
- Medical record tracking
- User authentication (planned)
- Reporting (planned)

## Technologies Used

- [Next.js](https://nextjs.org/)
- [TypeScript](https://www.typescriptlang.org/)
- [Tailwind CSS](https://tailwindcss.com/)