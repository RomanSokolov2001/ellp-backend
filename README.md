# ELLP Membership API Middleware & Backend

## 📌 Overview
This backend server acts as a middleware integrating with the WordPress Simple Membership Plugin API. It facilitates authentication and member data retrieval for mobile users of the **Erasmus Life Las Palmas (ELLP) mobile app**.

## 🚀 Features
- **Member Query**: Retrieve member details using email or member ID.
- **Member Login**: Authenticate users and return a JWT token.
- **Member Register**: Register a new user with pre-activation rights.
- **Create Payment Intent**: Create payment intent for further payment with Stripe.
- **JWT Support**: Gives client a JWT. Possibility to validate.
-  **Check subscription**: Used for QR scanning. Returns corresponding HTML. Used by collaborators to check subsription of the users.

## 🛠️ Libraries
- **Node.js & Express** - Backend framework.
- **Axios** - HTTP client for API requests.
- **Stripe** - Payments.
- **Crypto** - For JWT manipulations.

## 📡 API Endpoints for React Native client
Endpoints respond with this DTO pattern:
```json
{
  "result": "error" | "success",
  "message?": "Error details",
  "data": { ... },
}
```

### 1️⃣ Check subscription

As the mobile application users have QR codes to prove their subsription to collaborators, there is a endpoint for handling this, because QR code it basically an URL linked with this endpoint checking specific email.

**Possible Responses:**
- User not found
- Member has active subscription
- Activation required 

**Endpoint:**  
```
GET /api/members/check?email={email}
```
### 2️⃣ Query Member Profile
Retrieve a member's profile using an email or member ID. The developers must consider that initially WP Membership API query endpoint returns **hashed password** within the json! 

Current implementation handles it and removes sensetive data.

**Endpoint:**  
```
GET /api/members/query?email={email}&member_id={id}
```
**Response if success:**  
```json
{
    "result": "success",
    "data": {
                "memberId": "12345",
                "username": "johndoe",
                "firstName": "John",
                "lastName": "Doe",
                "memberSince": "2023-01-15",
                "accountState": "active",
                ...
            }
}
```
**Response if failure:**  
```json
{
    "result": "error",
    "message": "Email or memberId is required"
}
```
**Possible Errors:**
- Email or memberId is required
- Member not found


### 3️⃣ Member Login
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
**Possible Errors:**
- No user found with that username or email.
- Password empty or invalid
- Email and password required

### 4️⃣ Member Sign up
Register a new member giving pre-activation rights to log into ELLP mobile application.

**Endpoint:**  
```
POST /api/members/signup
```
**Body:**  
```json
{
  "email": "ryan.gosling@mail.ru",
  "username": "Ryan228",
  "password": "mypass228",
  "firstName": "Ryan",
  "lastName": "Gosling"
}
```
**Response:**  
```json
{
  "result": "success",
  "data": {
    "memberId": "69",
    "username": "Ryan228",
    "accountState": "activation_required",
    ...
  }
}
```
**Possible Errors:**
- Email, username, password, first and last names required.
- Email is already used.
- Wordpress account exists with given username. But the given account...

## 🔒 Work In Progress:
- **Stripe Payment Testing**.
- **Error handling**.

## 🔮 Future Enhancements
- ✅ **Improved Error Handling** - Enhance logging and debugging capabilities.
- ✅ **Stripe Live Payments Test** - Try out payment with real money.
- ✅ **Auto-tests** - Add test scripts.

## 🏁 Getting Started
1. Clone the repository:  
   ```sh
   git clone https://github.com/RomanSokolov2001/ellp-backend.git
   cd ellp-backend
   ```
2. Install dependencies:  
   ```sh
   npm install
   ```
3. Set up environment variables in `.env`:  
   ```sh
   API_KEY=""
   JWT_SECRET=""
   STRIPE_MERCHANT_ID=""
   STRIPE_SECRET=""
   STRIPE_PUBLISHABLE=""
   WEBHOOK_SECRET=""
   ```
4. Run the server:  
   ```sh
   npm start
   ```
5. The server will be running at `http://localhost:6000`.

## 📜 License
This project is licensed under the MIT License.

