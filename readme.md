# Insurance Broker Platform

This project is a full-stack application for an insurance brokerage, featuring a backend API and a customer-facing frontend portal.

## Project Overview

The platform aims to provide:
*   A robust backend for brokers and administrators to manage customers, policies, claims, insurance products, and internal operations.
*   A user-friendly customer portal for clients to view their policies, file claims, get quotes, and manage their accounts.

## Tech Stack

*   **Backend:** Node.js, Express.js, MongoDB (with Mongoose) - *Note: Backend files are currently at the project root but should be in the `backend/` directory.*
*   **Frontend:** React.js, React Router - Located in the `frontend/` directory.
*   **Database:** MongoDB

## Current Status

The project has initial boilerplate setups for both the backend and frontend.
Refer to the [TODO.md](TODO.md) for a detailed list of features and their current implementation status.

## Backend API Endpoints

The backend API is the backbone of the platform, providing data and services to both the admin interface (to be built) and the customer portal.

### Implemented Endpoints:

*   **Health Check:**
    *   **GET** `/api/v1/health`
        *   Description: Checks the health and status of the API.
        *   Response:
            ```json
            {
              "success": true,
              "message": "API is healthy and running!",
              "uptime": 123.456, // Server uptime in seconds
              "timestamp": 1670000000000 // Current server timestamp
            }
            ```

More endpoints will be documented here as they are implemented. For a full list of planned API functionalities, please see the backend features section in [TODO.md](TODO.md).

## Directory Structure Suggestion

Ideally, the project root should be cleaner. The backend's `package.json` and `src` directory should be moved into a dedicated `backend/` folder.

**Current (Mixed Root):**
```
.
├── frontend/           # React.js frontend application
├── src/                # CURRENT Backend source
├── package.json        # CURRENT Backend package.json
├── TODO.md
└── README.md           # This file
```

**Target Structure:**
```
.
├── backend/            # Node.js/Express.js backend application
│   ├── src/
│   └── package.json
│   └── README.md       # Backend specific setup and details
├── frontend/           # React.js frontend application
│   ├── public/
│   ├── src/
│   └── package.json
│   └── README.md       # Frontend specific setup and details
├── TODO.md             # Detailed list of features and tasks
└── README.md           # This file (Project root README)
```

## Setup and Installation

Detailed setup instructions for each part of the application:

*   **Backend Setup:**
    *   *Assuming backend files are at project root for now:*
    *   Create a `.env` file in the project root (see `backend/src/config/env.js` for template, `backend/src/index.js` loads it).
    *   Run `npm install` in the project root.
    *   Run `npm run dev` or `npm start` in the project root.
    *   (Once backend files are moved to `backend/`, refer to `backend/README.md`)
*   **Frontend Setup:** [frontend/README.md](frontend/README.md)

## Contributing

Details on contributing to this project will be added later. For now, refer to the [TODO.md](TODO.md) for tasks that need attention.

## License

ISC (Placeholder - can be updated as needed)