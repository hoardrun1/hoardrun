# PostgreSQL Database Setup Guide

## 🎯 Overview

This guide will help you connect your HoardRun application to a PostgreSQL database for persistent data storage.

## 📋 Prerequisites

- PostgreSQL installed locally or access to a cloud PostgreSQL instance
- Node.js and npm installed
- Your HoardRun application

## 🛠️ Step 1: Install PostgreSQL

### Option A: Local Installation

#### Windows:
1. Download PostgreSQL from https://www.postgresql.org/download/windows/
2. Run the installer and follow the setup wizard
3. Remember your superuser password
4. Default port is 5432

#### macOS:
```bash
# Using Homebrew
brew install postgresql
brew services start postgresql
```

#### Linux (Ubuntu/Debian):
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

### Option B: Cloud PostgreSQL

#### Supabase (Recommended for development):
1. Go to https://supabase.com
2. Create a new project
3. Get your connection string from Settings > Database

#### Railway:
1. Go to https://railway.app
2. Create a new PostgreSQL database
3. Get your connection string

#### Neon:
1. Go to https://neon.tech
2. Create a new database
3. Get your connection string

## 🔧 Step 2: Configure Environment Variables

Update your `.env.local` file with your PostgreSQL connection string:

```env
# Database Configuration
# Replace with your actual PostgreSQL connection details
DATABASE_URL="postgresql://username:password@localhost:5432/hoardrun_db?schema=public"

# For cloud databases, use the provided connection string:
# DATABASE_URL="postgresql://user:pass@host:port/dbname?sslmode=require"
```

### Connection String Format:
```
postgresql://[username]:[password]@[host]:[port]/[database_name]?[parameters]
```

Example configurations:

#### Local PostgreSQL:
```env
DATABASE_URL="postgresql://postgres:yourpassword@localhost:5432/hoardrun_db?schema=public"
```

#### Supabase:
```env
DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres"
```

#### Railway:
```env
DATABASE_URL="postgresql://postgres:[PASSWORD]@[HOST]:[PORT]/railway"
```

## 🗄️ Step 3: Create Database

### For Local PostgreSQL:

1. Connect to PostgreSQL:
```bash
psql -U postgres
```

2. Create database:
```sql
CREATE DATABASE hoardrun_db;
```

3. Exit psql:
```sql
\q
```

### For Cloud Databases:
The database is usually created automatically. Check your provider's documentation.

## 🚀 Step 4: Run Database Migration

1. Generate Prisma client:
```bash
npx prisma generate
```

2. Push the schema to your database:
```bash
npx prisma db push
```

3. (Optional) Seed the database:
```bash
npx prisma db seed
```

## ✅ Step 5: Test Database Connection

1. Start your development server:
```bash
npm run dev
```

2. Test the database connection:
```bash
curl http://localhost:3001/api/test-db
```

Expected response:
```json
{
  "status": "success",
  "message": "Database connection successful",
  "database": "PostgreSQL",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

## 📊 Step 6: Verify Database Schema

Check if all tables were created:

### Using Prisma Studio:
```bash
npx prisma studio
```

### Using psql:
```bash
psql -U postgres -d hoardrun_db
\dt
```

You should see tables like:
- User
- Account
- Transaction
- SavingsGoal
- Beneficiary
- Investment
- And more...

## 🔍 Troubleshooting

### Common Issues:

#### 1. Connection Refused
```
Error: connect ECONNREFUSED 127.0.0.1:5432
```
**Solution**: Make sure PostgreSQL is running
```bash
# Windows (if installed as service)
net start postgresql-x64-14

# macOS
brew services start postgresql

# Linux
sudo systemctl start postgresql
```

#### 2. Authentication Failed
```
Error: password authentication failed for user "postgres"
```
**Solution**: Check your username and password in DATABASE_URL

#### 3. Database Does Not Exist
```
Error: database "hoardrun_db" does not exist
```
**Solution**: Create the database first (see Step 3)

#### 4. SSL Connection Issues (Cloud)
**Solution**: Add SSL parameters to your connection string:
```env
DATABASE_URL="postgresql://user:pass@host:port/db?sslmode=require"
```

## 🎉 Next Steps

Once your database is connected:

1. **Test User Creation**: Use the `/api/users` endpoint to create test users
2. **Explore Prisma Studio**: View and edit your data at http://localhost:5555
3. **Set up Authentication**: Connect your auth system to use the database
4. **Add Sample Data**: Create test accounts, transactions, and savings goals

## 📚 Useful Commands

```bash
# View database schema
npx prisma db pull

# Reset database (⚠️ Deletes all data)
npx prisma migrate reset

# View database in browser
npx prisma studio

# Generate Prisma client after schema changes
npx prisma generate

# Apply schema changes to database
npx prisma db push
```

## 🔐 Security Notes

1. **Never commit** your actual DATABASE_URL to version control
2. **Use environment variables** for all sensitive data
3. **Enable SSL** for production databases
4. **Use connection pooling** for production applications
5. **Regular backups** are essential for production data

---

Your PostgreSQL database is now ready to store your application data! 🚀
