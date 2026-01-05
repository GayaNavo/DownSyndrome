# SyndromeTrack

A modern Next.js application for early detection and care management.

## Features

- Beautiful, responsive login page
- Modern UI with Tailwind CSS
- TypeScript support
- Next.js 14 with App Router

## Getting Started

### Prerequisites

- Node.js 18+ installed
- npm or yarn package manager

### Installation

1. Install dependencies:
```bash
npm install
# or
yarn install
```

2. Run the development server:
```bash
npm run dev
# or
yarn dev
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser to see the login page.

## Project Structure

```
├── app/
│   ├── globals.css      # Global styles with Tailwind
│   ├── layout.tsx       # Root layout
│   └── page.tsx         # Home page (login)
├── components/
│   ├── LoginPage.tsx    # Main login page component
│   ├── Navigation.tsx   # Navigation bar component
│   └── Logo.tsx         # Logo component
└── package.json         # Dependencies
```

## Technologies Used

- **Next.js 14** - React framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **React 18** - UI library

## Build for Production

```bash
npm run build
npm start
```