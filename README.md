# ELLP Membership API Middleware & Backend

## 📌 Overview
This backend server acts as a middleware integrating with the WordPress Simple Membership Plugin API. It facilitates authentication and member data retrieval for mobile users of the **Erasmus Life Las Palmas (ELLP) mobile app**.

## 🚀 Features
- **Member Query**: Retrieve member details using email or member ID.
- **Member Login**: Authenticate users and return a JWT token.
- **Member Register**: Register a new user with pre-activation rights.
- **Create Payment Intent**: Create payment intent for further payment with Stripe.
- **JWT Support**: Gives client a JWT. Possibility to validate.

## 🛠️ Libraries
- **Node.js & Express** - Backend framework.
- **Axios** - HTTP client for API requests.
- **Stripe** - Payments.
- **Crypto** - For JWT manipulations.

## 📡 API Endpoints
Endpoints respond with this DTO pattern:
```json
{
  "result": "error" | "success",
  "message?": "Error details",
  "data": { ... },
}
```
### 1️⃣ Query Member Profile
Retrieve a member's profile using an email or member ID. The developers must consider that initially WP Membership API query endpoint returns **hashed password** within the json!

**Endpoint:**  
```
GET /api/members/query?email={email}&member_id={id}
```
**Response if success:**  
```json
{
    "results": "success",
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
    "results": "error",
    "message": "Email or memberId is required"
}
```
**Possible Errors:**
- Email or memberId is required
- Member not found


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
**Possible Errors:**
- No user found with that username or email.
- Password empty or invalid
- Email and password required

### 3️⃣ Member Sign up
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
- Email is already used. (Ryan.Gosling@mail.ru)
- Wordpress account exists with given username. But the given account...

## 🔒 Work In Progress:
- **Stripe Payment**.
- **Error handling**.
- **API DTOs constructing.**.
- **Project structuring to MVC.**.

## 🔮 Future Enhancements
- ✅ **Stripe Payment Integration** - Manage membership payments.
- ✅ **Collaborator Validation** - Check user membership validity with partners.
- ✅ **Improved Error Handling** - Enhance logging and debugging capabilities.

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

