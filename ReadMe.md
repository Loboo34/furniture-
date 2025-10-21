# Furniture E-Commerce Backend API

A robust Node.js/TypeScript backend API for a furniture e-commerce platform with integrated M-Pesa payment processing, user authentication, product management, shopping cart, orders, and reviews.

## 🚀 Features

### Core Functionality

- **User Management**: Registration, login, JWT-based authentication with role-based access (buyer/seller)
- **Product Management**: CRUD operations for furniture products with Cloudinary image uploads
- **Shopping Cart**: Add, update, remove items with automatic price calculations
- **Order Processing**: Complete order workflow with stock management and order tracking
- **Reviews System**: Anonymous and authenticated product reviews
- **Seller Listings**: Track and display products by seller
- **M-Pesa Integration**: STK Push payment initiation and callback handling

### Technical Features

- TypeScript for type safety
- MongoDB with Mongoose ODM
- JWT authentication & authorization
- Request validation with Joi
- File uploads with Multer and Cloudinary
- Comprehensive error handling and logging (Winston)
- Transaction support for critical operations
- CORS enabled for cross-origin requests

## 📋 Prerequisites

- Node.js (v18 or higher)
- MongoDB (v6.0 or higher, replica set for transactions)
- Cloudinary account
- M-Pesa Daraja API credentials (for payment integration)

## 🛠️ Installation

1. **Clone the repository**

```bash
git clone <repository-url>
cd funiture
```

2. **Install dependencies**

```bash
npm install
```

3. **Environment Configuration**

Create a `.env` file in the root directory:

```env
# Server
PORT=3000
NODE_ENV=development

# Database
MONGO_URI=mongodb://localhost:27017/furniture

# JWT
JWT_SECRET=your-super-secret-jwt-key

# Cloudinary
CLOUD_NAME=your-cloudinary-cloud-name
CLOUD_API_KEY=your-cloudinary-api-key
CLOUD_SECRET_KEY=your-cloudinary-secret-key

# M-Pesa (Daraja API)
MPESA_CONSUMER_KEY=your-mpesa-consumer-key
MPESA_CONSUMER_SECRET=your-mpesa-consumer-secret
MPESA_PASS_KEY=your-mpesa-passkey
MPESA_SHORTCODE=your-business-shortcode
MPESA_BASE_URL=https://sandbox.safaricom.co.ke  # or production URL
MPESA_CALLBACK_URL=https://your-domain.com/api/v1/mpesa/callback

# Optional - Development
SKIP_IMAGE_VALIDATION=false  # Set to true to skip image requirements during testing
```

4. **Build the project**

```bash
npm run build
```

## 🚦 Running the Application

### Development Mode

```bash
npm run dev
```

Uses nodemon and ts-node for hot-reloading during development.

### Production Mode

```bash
npm run build
npm start
```

The server will start on `http://localhost:3000` (or your configured PORT).

## 📁 Project Structure

```
funiture/
├── src/
│   ├── config/
│   │   ├── cloudinary.ts      # Cloudinary configuration
│   │   └── db.ts               # MongoDB connection
│   ├── controllers/
│   │   ├── cart.controller.ts     # Shopping cart logic
│   │   ├── order.controller.ts    # Order management
│   │   ├── product.controller.ts  # Product CRUD
│   │   ├── review.controller.ts   # Reviews
│   │   └── user.controller.ts     # Auth & user profile
│   ├── middleware/
│   │   ├── auth.ts            # JWT authentication
│   │   ├── multer.ts          # File upload handling
│   │   └── validator.ts       # Joi validation schemas
│   ├── models/
│   │   ├── cart.models.ts
│   │   ├── listings.models.ts
│   │   ├── mpesa.models.ts
│   │   ├── orde.models.ts
│   │   ├── product.models.ts
│   │   ├── reviews.models.ts
│   │   └── user.models.ts
│   ├── routes/
│   │   ├── auth.routes.ts
│   │   ├── cart.routes.ts
│   │   ├── order.routes.ts
│   │   ├── product.routes.ts
│   │   └── review.routes.ts
│   ├── services/
│   │   ├── callback.ts        # M-Pesa callback handler
│   │   ├── mpesa.controller.ts # M-Pesa payment service
│   │   └── token.ts            # M-Pesa token generation
│   ├── types/
│   │   └── express/
│   │       └── index.d.ts      # Express type augmentation
│   ├── utils/
│   │   ├── jwt.ts              # JWT utilities
│   │   └── logger.ts           # Winston logger
│   └── index.ts                # Application entry point
├── logs/                       # Application logs
├── dist/                       # Compiled JavaScript (production)
├── .env                        # Environment variables
├── package.json
├── tsconfig.json
└── README.md
```

## 📚 API Documentation

### Base URL

```
http://localhost:3000/api/v1
```

### Authentication

Most endpoints require a JWT token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

---

### 👤 User / Auth Endpoints

#### Register

```http
POST /api/v1/auth/register
Content-Type: application/json

{
  "fullName": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "buyer"  // or "seller"
}
```

#### Login

```http
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:**

```json
{
	"user": {
		"_id": "...",
		"fullName": "John Doe",
		"email": "john@example.com",
		"role": "buyer"
	},
	"token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### Get User Profile

```http
GET /api/v1/auth/profile
Authorization: Bearer <token>
```

---

### 🛋️ Product Endpoints

#### Get All Products

```http
GET /api/v1/product
```

#### Get Product by ID

```http
GET /api/v1/product/:id
```

#### Add Product (Seller Only)

```http
POST /api/v1/product
Authorization: Bearer <token>
Content-Type: multipart/form-data

{
  "name": "Modern Sofa",
  "category": "Living Room",
  "description": "Comfortable 3-seater sofa",
  "price": 45000,
  "stock": 10,
  "image": <file>
}
```

#### Update Product (Seller Only)

```http
PUT /api/v1/product/:id
Authorization: Bearer <token>
Content-Type: multipart/form-data

{
  "name": "Updated Product Name",
  "price": 50000,
  "image": <file>  // optional
}
```

#### Update Product Stock

```http
PUT /api/v1/product/stock/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "stock": 15
}
```

#### Delete Product

```http
DELETE /api/v1/product/:id
Authorization: Bearer <token>
```

---

### 🛒 Cart Endpoints

#### Get Cart

```http
GET /api/v1/cart
Authorization: Bearer <token>
```

#### Add to Cart

```http
POST /api/v1/cart
Authorization: Bearer <token>
Content-Type: application/json

{
  "productId": "product-id-here",
  "quantity": 2
}
```

#### Update Cart Item

```http
PUT /api/v1/cart/:productId
Authorization: Bearer <token>
Content-Type: application/json

{
  "quantity": 3
}
```

#### Remove from Cart

```http
DELETE /api/v1/cart/:productId
Authorization: Bearer <token>
```

---

### 📦 Order Endpoints

#### Create Order

```http
POST /api/v1/order
Authorization: Bearer <token>
Content-Type: application/json

{
  "items": [
    {
      "product": "product-id",
      "quantity": 2
    }
  ],
  "paymentMethod": "mpesa",
  "phoneNumber": "254712345678",
  "shippingInfo": {
    "city": "Nairobi",
    "address": "123 Street Name"
  }
}
```

**Response (M-Pesa):**

```json
{
  "success": true,
  "order": { ... },
  "mpesa": {
    "CheckoutRequestID": "...",
    "MerchantRequestID": "...",
    "ResponseDescription": "Success. Request accepted for processing"
  }
}
```

#### Get Buyer Orders

```http
GET /api/v1/order/buyer/:id
Authorization: Bearer <token>
```

#### Get Seller Orders

```http
GET /api/v1/order/seller/:id
Authorization: Bearer <token>
```

#### Update Order Status

```http
PUT /api/v1/order/status/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "status": "shipped"  // pending, shipped, delivered, cancelled
}
```

#### Cancel Order

```http
PUT /api/v1/order/cancel/:id
Authorization: Bearer <token>
```

---

### ⭐ Review Endpoints

#### Leave a Review (Anonymous or Authenticated)

```http
POST /api/v1/review
Content-Type: application/json

{
  "product": "product-id",
  "content": "Great product! Very comfortable.",
  "stars": 5
}
```

#### Get Reviews by Product

```http
GET /api/v1/review/:productId
```

#### Get All Reviews

```http
GET /api/v1/review
```

---

### 📋 Listing Endpoints

#### Get Listings by Seller

```http
GET /api/v1/listings/seller/:sellerId
```

---

### 💳 M-Pesa Endpoints

#### Callback (Internal - Called by Safaricom)

```http
POST /api/v1/mpesa/callback
```

This endpoint is called by Safaricom after payment processing.

---

## 🔐 Authentication & Authorization

### User Roles

- **Buyer**: Can browse products, add to cart, place orders, leave reviews
- **Seller**: All buyer permissions + can add/update/delete products, view seller orders

### JWT Token

Tokens are valid for 1 hour and contain:

```json
{
	"id": "user-id",
	"email": "user@example.com",
	"role": "buyer"
}
```

### Protected Routes

Routes requiring authentication use the `authenticate` middleware which:

1. Validates the Bearer token
2. Verifies the token signature
3. Attaches `req.user` with user details
4. Returns 401 if authentication fails

---

## 💰 M-Pesa Payment Flow

1. **Customer places order** with `paymentMethod: "mpesa"`
2. **Backend initiates STK Push** to customer's phone
3. **Customer enters M-Pesa PIN** on their device
4. **Safaricom processes payment** and calls the callback URL
5. **Callback handler updates** order and transaction status
6. **Order status** changes to "paid" or remains "pending"

### Testing M-Pesa (Sandbox)

Use Safaricom's test credentials and the sandbox phone number `254708374149`.

---

## 🗄️ Database Models

### User

- `fullName`, `email`, `password` (hashed), `role`, `profilePic`, `listings`

### Product

- `seller` (ref User), `name`, `category`, `image`, `description`, `price`, `stock`, `reviewCount`

### Cart

- `user` (ref User), `items[]` (product, quantity, price), `subTotal`, `shipping`, `total`

### Order

- `buyer`, `seller`, `orderNumber`, `items[]`, `subTotal`, `shipping`, `total`, `paymentMethod`, `phoneNumber`, `shippingInfo`, `status`, `mpesaCheckoutRequestID`, `mpesaReceiptNumber`

### Review

- `user` (optional), `product`, `content`, `stars`, `likesCount`

### MpesaTransaction

- `amount`, `phoneNumber`, `status`, `products[]`, `order`, `checkoutRequestId`, `merchantRequestId`, `mpesaReceiptNumber`, `resultCode`, `resultDesc`

### Listing

- `seller`, `product`, `isActive`, `createdAt`

---

## 🧪 Testing

### Using Postman

1. **Import the collection** (if available) or create requests manually
2. **Register a user** and save the token
3. **Set Authorization** header for protected routes
4. **Test product CRUD** as a seller
5. **Add items to cart** and create an order
6. **Test M-Pesa** with sandbox credentials

### Manual Testing Checklist

- [ ] User registration and login
- [ ] Token-based authentication
- [ ] Product creation with image upload
- [ ] Add/update/remove cart items
- [ ] Place order with stock deduction
- [ ] M-Pesa payment initiation
- [ ] Order cancellation with stock restoration
- [ ] Leave and fetch reviews
- [ ] Seller order listings

---

## 🐛 Common Issues & Troubleshooting

### "Property 'user' does not exist on type 'Request'"

**Solution**: Ensure `src/types/express/index.d.ts` is included in your `tsconfig.json` and restart the TypeScript server.

### Requests hang or never return

**Causes**:

- Missing `next()` in middleware
- `express.json` not called as `express.json()`
- MongoDB connection not established
- Uncaught promise rejections

**Fix**: Check middleware chain and ensure all async operations have error handlers.

### M-Pesa callback not received

**Causes**:

- Callback URL not publicly accessible (use ngrok for local testing)
- Wrong credentials or misconfigured endpoint

**Fix**: Use ngrok to expose your local server and update the callback URL in M-Pesa settings.

### MongoDB transaction errors

**Cause**: Transactions require a MongoDB replica set.

**Fix**: Set up a replica set or remove transaction code for local development.

### Image upload fails

**Causes**:

- Missing Cloudinary credentials
- Multer not configured correctly
- File size/type restrictions

**Fix**: Verify `.env` has correct Cloudinary keys and check file size (<5MB) and type (image/\*).

---

## 📝 Logging

Application logs are stored in the `logs/` directory:

- `error.log`: Error-level logs
- `combined.log`: All logs

Winston logger levels: error, warn, info, http, debug

---

## 🚀 Deployment

### Environment Setup

1. Set `NODE_ENV=production`
2. Use production MongoDB URI (replica set recommended)
3. Set production M-Pesa credentials and callback URL
4. Ensure JWT_SECRET is secure and unique

### Build & Run

```bash
npm run build
npm start
```

### Recommended Hosting

- **Backend**: Railway, Render, Heroku, AWS EC2
- **Database**: MongoDB Atlas
- **File Storage**: Cloudinary (already integrated)

### Post-Deployment Checklist

- [ ] Update M-Pesa callback URL to production domain
- [ ] Enable HTTPS (required for M-Pesa)
- [ ] Set up monitoring and alerts
- [ ] Configure CORS for production frontend URL
- [ ] Set up database backups
- [ ] Review and tighten security settings

---

## 🔒 Security Best Practices

- JWT tokens expire in 1 hour
- Passwords are hashed with bcrypt (10 rounds)
- Input validation with Joi on all endpoints
- CORS enabled (configure allowed origins in production)
- File upload size limited to 5MB
- Stock updates use atomic operations where possible
- Sensitive data (passwords) excluded from responses

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the ISC License.

---

## 📞 Support

For issues, questions, or contributions, please open an issue on the repository.

---

## 🎯 Roadmap

- [ ] Add unit and integration tests
- [ ] Implement real-time order tracking with WebSockets
- [ ] Add email notifications for orders
- [ ] Support multiple payment methods (Stripe, PayPal)
- [ ] Implement product search and filtering
- [ ] Add admin dashboard endpoints
- [ ] Rate limiting and advanced security features
- [ ] API documentation with Swagger/OpenAPI
- [ ] Wishlist functionality
- [ ] Product recommendations engine

---

**Built with ❤️ using Node.js, TypeScript, MongoDB, and M-Pesa**
