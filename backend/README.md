# Insurance Broker Platform - Backend API

This directory (`backend/`) contains the Node.js/Express.js backend application that powers the Insurance Broker Platform.

## Overview

The backend API serves as the central hub for:
*   Managing customer data, policies, and claims.
*   Handling business logic for insurance product configuration and underwriting rules.
*   Authenticating users (brokers, admins, customers via API tokens).
*   Providing data to the frontend customer portal and internal admin interfaces.
*   Integrating with third-party services (e.g., payment gateways, email services).

## Tech Stack

*   **Framework:** Express.js
*   **Language:** Node.js
*   **Database:** MongoDB (using Mongoose ODM)
*   **Authentication:** JWT (JSON Web Tokens)
*   **Environment Variables:** `dotenv` package

## Getting Started

### Prerequisites

*   Node.js (v16 or later recommended) and npm.
*   A running MongoDB instance (local or cloud-based like MongoDB Atlas).

### Setup and Installation

1.  **Navigate to this Directory:**
    Make sure your terminal is in this `backend/` directory:
    ```bash
    cd path/to/your/project/backend
    ```

2.  **Create a `.env` File:**
    In this `backend/` directory, create a `.env` file. This file will store your environment-specific configurations.
    You can copy `src/config/env.js` (which contains placeholder variable names) to `.env` as a template, then fill in your actual values. It's recommended to use port `3004` for consistency during local development:

    ```env
    MONGO_URI=your_mongodb_connection_string_here
    PORT=3004 # Recommended port for local development
    NODE_ENV=development # or 'production'
    JWT_SECRET=your_very_strong_jwt_secret_key # IMPORTANT: Use a strong, random key
    JWT_EXPIRE=30d # Example: token expiry time
    ```
    The `src/index.js` file is configured with `require('dotenv').config();`, so it will automatically load variables from the `.env` file located in this `backend/` directory (which becomes the root for the backend process).

3.  **Install Dependencies:**
    Run the following command from within this `backend/` directory:
    ```bash
    npm install
    ```
    This will install all necessary packages listed in `backend/package.json` and create a `package-lock.json` file.

4.  **Run the Development Server:**
    From within this `backend/` directory:
    *   To start the server with `nodemon` (for automatic restarts on file changes):
        ```bash
        npm run dev
        ```
    *   Alternatively, to run it normally:
        ```bash
        npm start
        ```
    The server should start, and you'll see console messages indicating the port it's running on and successful connection to MongoDB.

## API Endpoints

The primary API endpoint implemented so far is:

*   **Health Check:**
    *   **GET** `/api/v1/health`
        *   Description: Verifies that the API is running and accessible.
        *   Response: JSON object with success status, message, uptime, and timestamp.

Refer to the root `README.md` or `TODO.md` for a more comprehensive list of planned API endpoints and features.

## Project Structure (within `backend/src/`)

*   `config/`: Database connection, environment variable setup (`env.js` serves as a template/example).
*   `controllers/`: Request handlers that contain the logic for API endpoints.
*   `middleware/`: Custom middleware functions (e.g., for authentication, error handling).
*   `models/`: Mongoose schemas and models for MongoDB collections.
*   `routes/`: Express route definitions that map URLs to controller functions.
*   `services/`: Business logic that is too complex for controllers (optional, can be part of controllers for smaller apps).
*   `utils/`: Utility functions.
*   `index.js`: The main entry point for the backend application (located in `backend/src/index.js`).

The `package.json` in this `backend/` directory contains the scripts (`start`, `dev`) which correctly point to `src/index.js` relative to this directory.
