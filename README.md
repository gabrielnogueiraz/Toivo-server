# Toivo Backend

Backend for Toivo, a revolutionary productivity app that reimagines how we manage our time and tasks.

## 🚀 Features

- **Waitlist System**: Email collection with validation and duplicate prevention
- **Scheduled Emails**: Automatic launch announcement emails to waitlist subscribers
- **Modern Stack**: Built with Node.js, TypeScript, Fastify, Prisma, and PostgreSQL
- **Modular Architecture**: Clean separation of concerns with controllers, services, and repositories
- **Production Ready**: Includes error handling, logging, and environment configuration

## 🛠️ Prerequisites

- Node.js 18+
- PostgreSQL 14+
- pnpm (recommended) or npm/yarn

## 🏗️ Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/toivo-backend.git
   cd toivo-backend
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   # or
   npm install
   # or
   yarn install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   Update the `.env` file with your configuration.

4. **Set up database**
   - Create a PostgreSQL database
   - Update the `DATABASE_URL` in your `.env` file
   - Run migrations:
     ```bash
     pnpm prisma migrate dev --name init
     ```

## 🚦 Running the Application

### Development
```bash
# Start development server with hot-reload
pnpm dev
```

The server will be available at `http://localhost:3000`

### Production
```bash
# Build the application
pnpm build

# Start the production server
pnpm start
```

## 📚 API Documentation

Once the server is running, you can access the API documentation at:
- Swagger UI: `http://localhost:3000/documentation`
- JSON Schema: `http://localhost:3000/documentation/json`

## 🧪 Testing

```bash
# Run tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Run tests with coverage
pnpm test:coverage
```

## 🧰 Available Scripts

- `dev`: Start development server with hot-reload
- `build`: Build the application for production
- `start`: Start the production server
- `test`: Run tests
- `test:watch`: Run tests in watch mode
- `lint`: Run ESLint
- `format`: Format code with Prettier
- `migrate:dev`: Create and run database migrations
- `prisma:studio`: Open Prisma Studio for database management

## 📦 Dependencies

### Main Dependencies
- Fastify: Web framework
- Prisma: ORM for database access
- PostgreSQL: Database
- Zod: Schema validation
- Node-cron: Job scheduling
- Nodemailer: Email sending

### Development Dependencies
- TypeScript: Type checking
- ESLint: Linting
- Prettier: Code formatting
- Vitest: Testing framework
- tsx: TypeScript execution

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📞 Contact

For any questions or feedback, please contact us at [your-email@example.com](mailto:your-email@example.com)
