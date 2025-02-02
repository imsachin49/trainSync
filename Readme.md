# IRCTC Railway Management API
This project is a **Railway Management System API** similar to IRCTC, built using **Node.js & Express.js** with **PostgreSQL** as the database. It allows users to check train availability, book seats, and manage train data while ensuring security and concurrency.

## Tech Stack
- **Backend:** Node.js, Express.js
- **Database:** PostgreSQL
- **Authentication:** JWT (JSON Web Token)
- **Concurrency:** Database Transactions(ACID Properties)
- **Middleware:** Express Middleware
- **Security:** API Key Protection for Admin Routes

## 📌 Features

### 🔹 User Authentication
- Register a new user (`/api/auth/register`)
- Login user (`/api/auth/login`)

### 🔹 Admin Operations (Protected by API Key)
- Add a new train (`/api/trains` - `POST`)
- Update train seat count (`/api/trains/:trainId/seats` - `PUT`)

### 🔹 User Operations (JWT Token Required)
- Get all trains (`/api/trains` - `GET`)
- Get seat availability (`/api/trains/availability` - `GET`)
- Book a seat (`/api/bookings` - `POST`)
- Get booking details (`/api/bookings/:bookingId` - `GET`)
- Cancel booking (`/api/bookings/:bookingId` - `DELETE`)

## 🚀 How to run locally?

### 1️⃣ Clone the Repository
```sh
git clone https://github.com/imsachin49/trainSync.git
cd trainSync
```

### 2️⃣ Install Dependencies
```sh
npm install
```

### 3️⃣ Configure Environment Variables
Create a `.env` file in the root directory and add the following environment variables:
```sh
JWT_SECRET=
ADMIN_API_KEY=
PORT=
DATABASE_URL= 
// PostgreSQL Connection URL: postgres://username:password@host:port/database (OR use one from NeonDB)
```

### 4️⃣ Start the Server
```sh
npm start
```

## 🔐 Authentication & Authorization
- **User Authentication:** Users must log in to get a JWT token.  
- **Admin Protection:** Admin routes require an API key in the headers.  
- **Booking Security:** Users need a valid JWT token to book or view bookings.  

## 📝 API Documentation

#### **Health Check**
- **GET `/health`**: Check if the server is running.
  - **Response**:
    ```json
    {
      "message": "Hello Sir! I am alive"
    }
    ```

---

### **Auth Routes** (`/api/v1/users`)

#### **POST `/register`**
- **Description**: Register a new user.
- **Body (Required)**:
  ```json
  {
    "username": "john_doe",       // Required
    "password": "securepassword123", // Required
    "email": "john.doe@example.com"  // Required
  }
  ```

#### **POST `/login`**
- **Description**: Authenticate user and return a JWT token.
- **Body (Required)**:
  ```json
  {
    "username": "john_doe",       // Required
    "password": "securepassword123" // Required
  }
  ```

---

### **Train Routes** (`/api/v1/trains`)

#### **POST `/`** (Admin Only)
- **Description**: Add a new train.
- **Body (Required)**:
  ```json
  {
    "name": "Express 101",        // Required
    "source": "New York",         // Required
    "destination": "Boston",      // Required
    "totalSeats": 100             // Required (Must be > 0)
  }
  ```
- **Headers**:
  - `x-api-key`: Admin API Key (Required)

#### **GET `/`**
- **Description**: Fetch all trains.

#### **PUT `/:trainId/seats`** (Admin Only)
- **Description**: Update total seats for a train.
- **Params**:
  - `trainId` (Required): ID of the train to update.
- **Body (Required)**:
  ```json
  {
    "totalSeats": 120             // Required (Must be > 0)
  }
  ```
- **Headers**:
  - `x-api-key`: Admin API Key (Required)

#### **GET `/availability`**
- **Description**: Check seat availability between `source` and `destination`.
- **Query Params (Required)**:
  - `source`: Source station (e.g., `New York`).
  - `destination`: Destination station (e.g., `Boston`).
- **Example Request**:
  ```
  GET /api/v1/trains/availability?source=New%20York&destination=Boston
  ```

### **Booking Routes** (`/api/v1/bookings`)

#### **POST `/`**
- **Description**: Book a seat on a train.
- **Body (Required)**:
  ```json
  {
    "trainId": 1                  // Required (ID of the train to book)
  }
  ```

#### **GET `/:bookingId`**
- **Description**: Fetch booking details by `bookingId`.
- **Params**:
  - `bookingId` (Required): ID of the booking to fetch.

#### **DELETE `/:bookingId`**
- **Description**: Cancel a booking by `bookingId`.
- **Params**:
  - `bookingId` (Required): ID of the booking to cancel.

---

## **Summary  of API Endpoints**
#### **Auth Routes**
- **POST `/register`**: Register a new user. Requires `username`, `password`, and `email`.
- **POST `/login`**: Authenticate user and return a JWT token. Requires `username` and `password`.

#### **Booking Routes**
- **POST `/`**: Book a seat on a train. Requires `trainId` and a valid JWT token.
- **GET `/:bookingId`**: Fetch booking details by `bookingId`. Requires a valid JWT token.
- **DELETE `/:bookingId`**: Cancel a booking by `bookingId`. Requires a valid JWT token.

#### **Train Routes**
- **POST `/`**: Add a new train (Admin only). Requires `name`, `source`, `destination`, and `totalSeats`.
- **GET `/`**: Fetch all trains. Requires a valid JWT token.
- **PUT `/:trainId/seats`**: Update total seats for a train (Admin only). Requires `trainId` and `totalSeats`.
- **GET `/availability`**: Check seat availability between `source` and `destination`. Requires valid JWT token.
