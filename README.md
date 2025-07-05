# Insurance Broker Platform

A comprehensive full-stack insurance brokerage platform featuring a robust backend API, customer portal, and admin portal with advanced rating engine and premium calculation capabilities.

## 🚀 Project Overview

The platform provides:
*   **Backend API**: Complete insurance management system with rating engine, premium calculation, and business logic
*   **Admin Portal**: Full-featured management interface for brokers and administrators
*   **Customer Portal**: User-friendly interface for clients to manage policies, claims, and quotes
*   **Rating Engine**: Advanced premium calculation with dynamic rating factors and rate tables

## 🛠 Tech Stack

*   **Backend:** Node.js, Express.js, MongoDB (with Mongoose)
*   **Admin Portal:** React.js, Ant Design, React Router
*   **Customer Portal:** React.js, React Router
*   **Database:** MongoDB
*   **Authentication:** JWT-based authentication
*   **File Storage:** AWS S3 integration
*   **PDF Generation:** PDFKit for document generation

## 📊 Current Status

### ✅ **Completed Features**

#### **Backend API (Fully Functional)**
- **Authentication & Authorization**: JWT-based auth with role-based access control
- **User Management**: Unified user model (Admin, Agent, Customer) with full CRUD
- **Product Management**: Insurance products with coverage details and pricing
- **Rating Engine**: Advanced premium calculation with 26+ rating factors
- **Rate Tables**: Comprehensive rate management with versioning
- **Quote Management**: Quote creation, versioning, and PDF generation
- **Policy Management**: Policy issuance and lifecycle management
- **Claims Management**: Claims processing with file attachments
- **Email Templates**: Templated email system with Nodemailer
- **Insurer Management**: Carrier and insurer information management
- **Audit Logging**: Comprehensive system audit trails

#### **Admin Portal (Complete)**
- **Modern UI**: Ant Design components with consistent theming
- **Dashboard**: Analytics and key metrics display
- **User Management**: Complete user CRUD with role management
- **Product Management**: Product creation, editing, and management
- **Rating Factors**: Full CRUD for 26+ rating factors with search/filter
- **Rate Tables**: Complete rate table management with versioning
- **Quote Management**: Quote review, approval, and PDF generation
- **Policy Management**: Policy lifecycle and document management
- **Claims Management**: Claims processing with file uploads
- **Settings**: System configuration and email template management

#### **Customer Portal (Basic Structure)**
- **Dashboard**: Policy overview and quick actions
- **Profile Management**: User profile updates
- **Policy Viewing**: Policy details and document access
- **Claims Submission**: Claim filing with file uploads
- **Quote History**: Past quotes and status tracking

### 🔄 **In Progress**
- Customer portal quote creation with dynamic forms
- Advanced quote comparison features
- Automated follow-up systems

## 🏗 Architecture

```
Insurance Broker Platform
├── backend/                 # Node.js/Express.js API
│   ├── src/
│   │   ├── controllers/     # API controllers
│   │   ├── models/          # Mongoose models
│   │   ├── routes/          # API routes
│   │   ├── middleware/      # Auth & validation
│   │   ├── services/        # Business logic
│   │   └── utils/           # Utilities
│   └── package.json
├── admin-portal/            # React admin interface
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── pages/           # Admin pages
│   │   ├── services/        # API services
│   │   └── context/         # React context
│   └── package.json
├── frontend/                # React customer portal
│   ├── src/
│   │   ├── components/      # Customer components
│   │   ├── pages/           # Customer pages
│   │   └── services/        # API services
│   └── package.json
└── README.md
```

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or cloud instance)
- npm or yarn

### 1. Clone and Setup
```bash
git clone <repository-url>
cd NewBMG
```

### 2. Backend Setup
```bash
cd backend
npm install
cp .env.example .env
# Configure your .env file with MongoDB URI and other settings
npm run seed  # Creates admin user and sample data
npm start     # Starts on port 3004
```

### 3. Admin Portal Setup
```bash
cd admin-portal
npm install
npm start     # Starts on port 3002
```

### 4. Customer Portal Setup
```bash
cd frontend
npm install
npm start     # Starts on port 3003
```

### Default Admin Credentials
- **Email:** `admin@example.com`
- **Password:** `password123`

## 📚 API Documentation

### Core Endpoints

#### Authentication
- `POST /api/v1/auth/login` - User login
- `POST /api/v1/auth/register` - User registration
- `GET /api/v1/auth/me` - Get current user

#### Rating Engine
- `GET /api/v1/rating-factors` - Get all rating factors
- `POST /api/v1/rating-factors` - Create rating factor
- `GET /api/v1/rate-tables` - Get all rate tables
- `POST /api/v1/rate-tables` - Create rate table
- `POST /api/v1/premium/calculate` - Calculate premium

#### Underwriting Rules
- `POST /api/v1/products/:productId/underwritingrules` - Create an underwriting rule for a product
- `GET /api/v1/products/:productId/underwritingrules` - Get all underwriting rules for a product
- `GET /api/v1/underwritingrules/:id` - Get a specific underwriting rule by its ID
- `PUT /api/v1/underwritingrules/:id` - Update an underwriting rule
- `DELETE /api/v1/underwritingrules/:id` - Delete an underwriting rule

#### Quotes & Policies
- `GET /api/v1/quotes` - Get all quotes
- `POST /api/v1/quotes` - Create quote
- `GET /api/v1/policies` - Get all policies
- `POST /api/v1/policies` - Create policy

#### Management
- `GET /api/v1/users` - User management
- `GET /api/v1/products` - Product management
- `GET /api/v1/claims` - Claims management
- `GET /api/v1/insurers` - Insurer management

### Authentication
All protected endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

## 🎯 Key Features

### **Advanced Rating Engine**
- **26+ Rating Factors**: Age, driving record, vehicle type, home construction, etc.
- **Dynamic Rate Tables**: Product-specific rates with versioning
- **Real-time Premium Calculation**: Live premium updates as users input data
- **Geographic Adjustments**: Location-based pricing factors
- **Discounts & Surcharges**: Multi-car, safe driver, bundling discounts

### **Comprehensive Admin Portal**
- **Modern UI**: Ant Design components with responsive design
- **Role-based Access**: Admin, agent, and staff permissions
- **Real-time Data**: Live updates and notifications
- **Document Management**: PDF generation and file handling
- **Audit Trail**: Complete system activity logging

### **Customer Self-Service**
- **Policy Management**: View policies and download documents
- **Claims Filing**: Submit claims with file attachments
- **Quote History**: Track quote status and history
- **Profile Management**: Update personal information

## 🔧 Configuration

### Environment Variables

#### Backend (.env)
```env
PORT=3004
MONGO_URI=mongodb://localhost:27017/insurance_broker
JWT_SECRET=your-jwt-secret
NODE_ENV=development
```

#### Admin Portal (.env)
```env
REACT_APP_API_BASE_URL=http://localhost:3004/api/v1
```

#### Customer Portal (.env)
```env
REACT_APP_API_BASE_URL=http://localhost:3004/api/v1
```

## 📊 Data Seeding

The backend includes comprehensive data seeding:

```bash
cd backend
npm run seed  # Creates admin user, products, rating factors, rate tables
```

**Seeded Data:**
- Admin user with full permissions
- Sample insurance products (Auto, Home, Life)
- 26 rating factors with comprehensive options
- 3 rate tables with base rates and adjustments
- Sample insurers and email templates

## 🧪 Testing

### Backend Testing
```bash
cd backend
npm test
```

### Premium Calculation Testing
```bash
cd backend
node test-premium-calculation.js
```

## 📈 Performance & Scalability

- **Database Indexing**: Optimized MongoDB queries
- **Caching**: Redis integration ready
- **File Storage**: S3 integration for scalable file handling
- **API Rate Limiting**: Built-in request throttling
- **Error Handling**: Comprehensive error management

## 🔒 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Role-based Authorization**: Granular permission control
- **Input Validation**: Comprehensive data validation
- **SQL Injection Protection**: Mongoose ODM protection
- **XSS Prevention**: Input sanitization
- **CORS Configuration**: Secure cross-origin requests

## 🚀 Deployment

### Production Setup
1. Configure production environment variables
2. Set up MongoDB Atlas or production MongoDB
3. Configure AWS S3 for file storage
4. Set up SSL certificates
5. Configure reverse proxy (nginx)

### Docker Support
```bash
docker-compose up -d
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📝 License

This project is licensed under the ISC License.

## 📞 Support

For support and questions:
- Check the [TODO.md](TODO.md) for current development status
- Review the API documentation above
- Check the individual component README files

---

**Current Version**: 1.0.0
**Last Updated**: December 2024
**Status**: Production Ready (Core Features)