# Project Name

A full-stack web application designed to streamline the recruitment process. This dashboard provides recruiters with a powerful interface to manage candidate lists, perform bulk actions, and automate communication workflows, all through a clean and intuitive user interface inspired by modern chat applications.

---
## 🔗 Live Demo

👉 [recruiter-copilot-tekp.vercel.app](https://recruiter-copilot-tekp.vercel.app/)

## ✨ Features

This application is packed with features designed to enhance recruiter productivity:

### 📋 Comprehensive List Management
- **Full CRUD**: Create, Read, Update, and Delete candidate lists.
- **Clickable Detail View**: View all candidates in a list via a detailed table.
- **Bulk CSV Upload**: Upload a CSV to create and populate a list. Candidates are deduplicated based on phone numbers.

### 👤 Advanced Candidate Actions
- **Multi-Select & Bulk Actions**: Select multiple candidates to perform actions like disable, nudge, or modify lists.
- **Enable/Disable Toggle**: One-click toggle for switching a candidate’s active status.
- **Tagging & Removal**: Easily add or remove candidates from one or more lists.

### 🔄 Automated Communication Workflow
- **Message Queue**: Backend queue handles all scheduled and bulk messages.
- **Auto Processing**: Server polls every 15 seconds to send pending messages like nudges.
- **Personalized Templates**: Uses pre-set templates to send individualized messages.
- **Cancel Pending Sends**: Instantly cancel all unsent messages for any candidate list.

---

## 🚀 Tech Stack

### Frontend
- **Framework:** React (Vite)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **UI Components:** [shadcn/ui](https://ui.shadcn.com)

### Backend
- **Framework:** Node.js with Express.js
- **Database:** File-based `db.json` (for prototyping)
- **Deployment:** Render

---

## 📦 Getting Started

### 1. Setup

```bash
# Navigate into the backend directory
cd backend

# Install dependencies
npm install

# Start the development server
npm start

# From the project root, open a new terminal

# Install frontend dependencies
npm install

# Start the Vite development server
npx vite

