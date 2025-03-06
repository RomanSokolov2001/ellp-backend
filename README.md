# ELLP Membership API Middleware & Backend

## 📌 Overview
This backend server acts as a middleware integrating with the WordPress Simple Membership Plugin API. It facilitates authentication and member data retrieval for mobile users of the **Erasmus Life Las Palmas (ELLP) mobile app**.

## 🚀 Features
- **Member Query**: Retrieve member details using email or member ID.
- **Member Login**: Authenticate users and return a JWT token.
- **Error Handling**: Handles unexpected API responses and server errors.
- **Security**: Utilizes encryption for token generation and validation.
- **Scalability**: Built with Express.js, allowing easy future enhancements.

## 🛠️ Tech Stack
- **Node.js & Express** - Backend framework
- **Axios** - HTTP client for API requests
- **Cors** - Cross-origin resource sharing
- **Dotenv** - Environment variable management
- **Encryption Service** - Secure token management

## 📡 API Endpoints
### 1️⃣ Query Member Profile
Retrieve a member's profile using an email or member ID.

**Endpoint:**  
```
GET /api/members/query?email={email}&member_id={id}
```
**Response:**  
```json
{
  "memberId": "12345",
  "username": "johndoe",
  "firstName": "John",
  "lastName": "Doe",
  "memberSince": "2023-01-15",
  "accountState": "active"
}
```

### 2️⃣ Member Login
Authenticate a member and return a JWT token.

**Endpoint:**  
```
POST /api/members/login
```
**Body:**  
```json
{
  "email": "user@example.com",
  "password": "securepassword"
}
```
**Response:**  
```json
{
  "result": "success",
  "data": {
    "memberId": "12345",
    "username": "johndoe",
    "jwt": "your-generated-token"
  }
}
```

## 🔒 Security & Error Handling
- **Handles uncaught exceptions and promise rejections**.
- **Prevents server crashes with structured error responses**.
- **Ensures API integrity with encryption services**.

## 🔮 Future Enhancements
- ✅ **Stripe Payment Integration** - Manage membership payments.
- ✅ **Collaborator Validation** - Check user membership validity with partners.
- ✅ **Improved Error Handling** - Enhance logging and debugging capabilities.

## 🏁 Getting Started
1. Clone the repository:  
   ```sh
   git clone https://github.com/your-repo.git
   cd your-repo
   ```
2. Install dependencies:  
   ```sh
   npm install
   ```
3. Set up environment variables in `.env`:  
   ```sh
   PORT=5000
   API_KEY=your_api_key_here
   ```
4. Run the server:  
   ```sh
   npm start
   ```
5. The server will be running at `http://localhost:5000`.

## 📜 License
This project is licensed under the MIT License.

