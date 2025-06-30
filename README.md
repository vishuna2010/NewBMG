# Insurance Broker Platform

This project is a full-stack application for an insurance brokerage, featuring a backend API and a customer-facing frontend portal.

## Project Overview

The platform aims to provide:
*   A robust backend for brokers and administrators to manage customers, policies, claims, insurance products, and internal operations.
*   A user-friendly customer portal for clients to view their policies, file claims, get quotes, and manage their accounts.

## Tech Stack

*   **Backend:** Node.js, Express.js, MongoDB (with Mongoose) - Located in the `backend/` directory.
*   **Frontend:** React.js, React Router - Located in the `frontend/` directory.
*   **Database:** MongoDB

## Current Status

The project has initial boilerplate setups for both the backend and frontend, with backend files now correctly organized into the `backend/` directory.
Refer to the [TODO.md](TODO.md) for a detailed list of features and their current implementation status.

## Backend API Endpoints

The backend API is the backbone of the platform, providing data and services to both the admin interface (to be built) and the customer portal.

### Implemented Endpoints:

*   **Health Check:**
    *   **GET** `/api/v1/health`
        *   Description: Checks the health and status of the API. (Note: Base URL depends on how the backend is run from within its directory).
        *   Response:
            ```json
            {
              "success": true,
              "message": "API is healthy and running!",
              "uptime": 123.456, // Server uptime in seconds
              "timestamp": 1670000000000 // Current server timestamp
            }
            ```
*   **Product Management (`/api/v1/products`)**
    *   **POST** `/api/v1/products`
        *   Description: Create a new insurance product.
        *   Access: Private (Admin - currently unprotected)
        *   Request Body: JSON object with product details (e.g., `name`, `description`, `productType`, `basePrice`, `currency`, `coverageDetails`, `termsAndConditions`, `isActive`).
        *   Response: `201 Created` with the new product data.
    *   **GET** `/api/v1/products`
        *   Description: Get a list of all insurance products. Supports query parameters for filtering (e.g., `?isActive=true`).
        *   Access: Public (or as configured)
        *   Response: `200 OK` with a list of products.
    *   **GET** `/api/v1/products/:id`
        *   Description: Get a single insurance product by its ID.
        *   Access: Public (or as configured)
        *   Response: `200 OK` with the product data, or `404 Not Found`.
    *   **PUT** `/api/v1/products/:id`
        *   Description: Update an existing insurance product by its ID.
        *   Access: Private (Admin - currently unprotected)
        *   Request Body: JSON object with fields to update.
        *   Response: `200 OK` with the updated product data, or `404 Not Found`.
    *   **DELETE** `/api/v1/products/:id`
        *   Description: Delete an insurance product by its ID.
        *   Access: Private (Admin - currently unprotected)
        *   Response: `200 OK` with empty data, or `404 Not Found`.

More endpoints will be documented here as they are implemented. For a full list of planned API functionalities, please see the backend features section in [TODO.md](TODO.md).

## Directory Structure

The project is organized as follows:
```
.
├── backend/            # Node.js/Express.js backend application
│   ├── src/
│   ├── package.json
│   └── README.md       # Backend specific setup and details
├── frontend/           # React.js frontend application
│   ├── public/
│   ├── src/
│   ├── package.json
│   └── README.md       # Frontend specific setup and details
├── TODO.md             # Detailed list of features and tasks
└── README.md           # This file (Project root README)
```

## Setup and Installation

Detailed setup instructions for each part of the application can be found in their respective README files:

*   **Backend Setup:** See [backend/README.md](backend/README.md)
*   **Customer Portal Frontend Setup:** See [frontend/README.md](frontend/README.md)
*   **Admin Portal Frontend Setup:** See [admin-portal/README.md](admin-portal/README.md)

## Development Environment

For local development, the applications are configured to run on the following default ports:

*   **Customer Portal (Frontend):** `http://localhost:3003` (configured via `frontend/.env`)
*   **Backend API:** `http://localhost:3004` (configurable via `backend/.env` - you'll need to set this)
*   **Admin Portal (Frontend):** `http://localhost:3005` (configured via `admin-portal/.env`)

Ensure these ports are free or adjust the configurations in the respective `.env` files if needed. Refer to the README in each application's directory for more details on starting them.

A root `.gitignore` file is included to help prevent committing sensitive `.env` files and other common temporary files.

## Contributing

Details on contributing to this project will be added later. For now, refer to the [TODO.md](TODO.md) for tasks that need attention.

## License

ISC (Placeholder - can be updated as needed)