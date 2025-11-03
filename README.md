# Legal Dashboard

A comprehensive full-stack web application for legal services management, built with modern technologies. Features separate admin and client panels for managing legal products, orders, and client relationships.

## 🚀 Features

### Admin Panel
- **Dashboard**: Overview of key metrics and recent activity
- **Products Management**: Full CRUD operations for legal services
- **Orders Management**: View and update order statuses across all clients
- **Client Management**: User account overview and statistics
- **Analytics**: Business insights with charts and performance metrics

### Client Panel
- **Dashboard**: Personal order statistics and quick actions
- **Order Placement**: Browse services and place new orders
- **Order History**: Track order status and view completed work
- **Profile Management**: Update personal information and view account stats

### Security & Authentication
- JWT-based authentication with HTTP-only cookies
- Role-based access control (Admin/Client)
- Password hashing with bcrypt
- Route protection middleware
- Secure API endpoints
- "Remember Me" functionality (30-day extended sessions)

## 🛠 Tech Stack

- **Frontend**: Next.js 14 (App Router), TypeScript, TailwindCSS
- **Backend**: Next.js API Routes, Prisma ORM
- **Database**: SQLite (easily configurable to PostgreSQL/MySQL)
- **Authentication**: JWT + bcrypt
- **UI Components**: Custom components with Lucide React icons
- **Styling**: TailwindCSS for responsive design

## 📋 Prerequisites

- Node.js 18+
- npm or yarn

## 🚀 Quick Start

1. **Clone and Install**
   ```bash
   git clone <repository-url>
   cd legal-dashboard
   npm install
   ```

2. **Database Setup**
   ```bash
   # Generate Prisma client
   npx prisma generate

   # Run database migrations
   npx prisma migrate dev --name init

   # Seed with sample data
   npx tsx prisma/seed.ts
   ```

3. **Environment Configuration**
   ```bash
   # Copy environment file
   cp .env.example .env

   # Update JWT_SECRET in .env (required for production)
   JWT_SECRET=your-super-secret-jwt-key
   ```

4. **Start Development Server**
   ```bash
   npm run dev
   ```

5. **Access the Application**
   - Open [http://localhost:3000](http://localhost:3000)
   - Use the sample accounts below to login

## 👤 Sample Accounts

### Admin Account
- **Email**: admin@legaldashboard.com
- **Password**: admin123

### Client Accounts
- **Email**: john.doe@example.com / **Password**: client123
- **Email**: jane.smith@example.com / **Password**: client123

## 💰 Currency

This application uses **Indonesian Rupiah (IDR)** as the currency for all pricing and financial calculations. All prices are displayed in the format `Rp X.XXX.XXX` using proper Indonesian number formatting.

## 📁 Project Structure

```
legal-dashboard/
├── prisma/
│   ├── schema.prisma          # Database schema
│   └── seed.ts               # Sample data seeding
├── src/
│   ├── app/
│   │   ├── admin/            # Admin panel pages
│   │   ├── client/           # Client panel pages
│   │   ├── api/              # API routes
│   │   └── (auth)/           # Authentication pages
│   ├── components/           # Reusable UI components
│   ├── lib/                  # Database client
│   ├── utils/                # Utility functions
│   └── middleware.ts         # Route protection
├── public/                   # Static assets
└── package.json
```

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user info

### Products (Admin)
- `GET /api/products` - List all products
- `POST /api/products` - Create product
- `GET /api/products/[id]` - Get product details
- `PUT /api/products/[id]` - Update product
- `DELETE /api/products/[id]` - Delete product

### Orders
- `GET /api/orders` - List orders (filtered by role)
- `POST /api/orders` - Create order (clients only)
- `GET /api/orders/[id]` - Get order details
- `PUT /api/orders/[id]` - Update order status

## 🎨 UI Components

The application uses custom UI components built with TailwindCSS:

- Responsive navigation with mobile hamburger menu
- Modal dialogs for forms and confirmations
- Status badges and progress indicators
- Data tables with search and filtering
- Charts and analytics visualizations

## 🔒 Security Features

- **Authentication**: JWT tokens with secure HTTP-only cookies
- **Authorization**: Role-based access control for all routes
- **Data Validation**: Zod schemas for API input validation
- **Password Security**: bcrypt hashing with salt rounds
- **Route Protection**: Middleware for authenticated routes
- **SQL Injection Prevention**: Prisma ORM parameterized queries

## 📊 Database Schema

```prisma
model User {
  id        String   @id @default(cuid())
  name      String
  email     String   @unique
  password  String
  role      String   @default("client")
  createdAt DateTime @default(now())
  orders    Order[]
}

model Product {
  id          String   @id @default(cuid())
  title       String
  description String?
  price       Float
  category    String
  createdAt   DateTime @default(now())
  orders      Order[]
}

model Order {
  id            String   @id @default(cuid())
  userId        String
  productId     String
  status        String   @default("pending")
  paymentMethod String?
  invoiceUrl    String?
  createdAt     DateTime @default(now())
  user          User     @relation(fields: [userId], references: [id])
  product       Product  @relation(fields: [productId], references: [id])
}

model Analytics {
  id       String @id @default(cuid())
  visitors Int
  sales    Float
  profit   Float
  loss     Float
  month    Int
  year     Int
  @@unique([month, year])
}
```

## 🚀 Deployment

### Environment Variables
```env
DATABASE_URL="file:./dev.db"  # For SQLite
# DATABASE_URL="postgresql://..."  # For PostgreSQL
JWT_SECRET="your-production-secret-key"
```

### Build for Production
```bash
npm run build
npm start
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 📞 Support

For questions or support, please open an issue on GitHub or contact the development team.

---

**Built with ❤️ using Next.js, TypeScript, and modern web technologies.**
