# Nexus - Full Stack Chat & Blog App

A production-ready full-stack application featuring real-time chat, a blog system with media uploads, and JWT authentication. Built with Node.js, Express, MongoDB, and Socket.IO.

## Features

-   **Authentication**: Secure Register/Login with JWT.
-   **Real-time Chat**: Private messaging with typing indicators and online status (Socket.IO).
-   **Blog System**: Create, read, and delete posts with image uploads (Cloudinary).
-   **Responsive UI**: Built with Bootstrap 5 and custom CSS.

## Tech Stack

-   **Backend**: Node.js, Express.js
-   **Database**: MongoDB (Mongoose)
-   **Real-time**: Socket.IO
-   **Storage**: Cloudinary (for images)
-   **Frontend**: HTML5, CSS3, Bootstrap 5

## Local Setup Guide

1.  **Clone the Repository**
    ```bash
    git clone <repository-url>
    cd nexus
    ```

2.  **Install Dependencies**
    ```bash
    npm install
    ```

3.  **Run the Application**
    ```bash
    npm run dev
    ```
    Access the app at `http://localhost:5000`.

## Deployment on Render

1.  **Push to GitHub**: Ensure your code is pushed to a GitHub repository.
2.  **Create New Web Service**: In Render dashboard, select "New Web Service" and connect your repo.
3.  **Use Blueprint (Optional)**: If Render supports it, it can auto-detect `render.yaml`.
4.  **Manual Setup**:
    -   **Build Command**: `npm install`
    -   **Start Command**: `node server/server.js`
5.  **Environment Variables**: Add the following in the Render dashboard:
    -   `MONGO_URI`: Your MongoDB Atlas connection string.
    -   `JWT_SECRET`: A random secret key.
    -   `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`: From your Cloudinary dashboard.

## How to Edit Logic

-   **Backend**: 
    -   Routes are in `server/routes/`.
    -   Controllers (business logic) are in `server/controllers/`.
    -   Models (DB schemas) are in `server/models/`.
-   **Frontend**:
    -   HTML files are in `public/`.
    -   CSS is in `public/css/style.css`.
    -   Client-side JS is embedded in the HTML files (at the bottom).

## API Endpoints

-   `POST /api/auth/register`: Create user.
-   `POST /api/auth/login`: Login user.
-   `GET /api/posts`: Get all posts.
-   `POST /api/posts`: Create post (Multipart form data).
-   `GET /api/messages/:userId`: Get chat history.
