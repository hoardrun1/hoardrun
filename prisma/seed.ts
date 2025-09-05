import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Create demo user
  const hashedPassword = await bcrypt.hash('demo123', 12);
  
  const demoUser = await prisma.user.upsert({
    where: { email: 'demo@hoardrun.com' },
    update: {},
    create: {
      email: 'demo@hoardrun.com',
      password: hashedPassword,
      name: 'Demo User',
      emailVerified: true,
      phoneNumber: '+1234567890',
      address: '123 Demo Street, Demo City, DC 12345',
    },
  });

  console.log('✅ Created demo user:', demoUser.email);

  // Create accounts for demo user
  const savingsAccount = await prisma.account.upsert({
    where: { number: 'ACC1234567890SAVINGS' },
    update: {},
    create: {
      userId: demoUser.id,
      type: 'SAVINGS',
      number: 'ACC1234567890SAVINGS',
      balance: 5000.00,
      currency: 'USD',
    },
  });

  const checkingAccount = await prisma.account.upsert({
    where: { number: 'ACC1234567890CHECKING' },
    update: {},
    create: {
      userId: demoUser.id,
      type: 'CHECKING',
      number: 'ACC1234567890CHECKING',
      balance: 2500.00,
      currency: 'USD',
    },
  });

  console.log('✅ Created accounts for demo user');

  // Create sample transactions
  const transactions = [
    {
      userId: demoUser.id,
      accountId: savingsAccount.id,
      type: 'DEPOSIT' as const,
      amount: 1000.00,
      description: 'Initial deposit',
      category: 'Income',
      status: 'COMPLETED' as const,
    },
    {
      userId: demoUser.id,
      accountId: checkingAccount.id,
      type: 'WITHDRAWAL' as const,
      amount: 50.00,
      description: 'ATM withdrawal',
      category: 'Cash',
      status: 'COMPLETED' as const,
    },
    {
      userId: demoUser.id,
      accountId: checkingAccount.id,
      type: 'PAYMENT' as const,
      amount: 25.99,
      description: 'Coffee shop',
      category: 'Food & Dining',
      merchant: 'Starbucks',
      status: 'COMPLETED' as const,
    },
  ];

  for (const transaction of transactions) {
    await prisma.transaction.create({ data: transaction });
  }

  console.log('✅ Created sample transactions');

  // Create savings goals
  const savingsGoals = [
    {
      userId: demoUser.id,
      name: 'Emergency Fund',
      targetAmount: 10000.00,
      currentAmount: 3000.00,
      deadline: new Date('2024-12-31'),
      category: 'Emergency',
      description: '6 months of expenses',
      isAutoSave: true,
      autoSaveAmount: 500.00,
    },
    {
      userId: demoUser.id,
      name: 'Vacation Fund',
      targetAmount: 5000.00,
      currentAmount: 1200.00,
      deadline: new Date('2024-08-01'),
      category: 'Travel',
      description: 'Summer vacation to Europe',
      isAutoSave: false,
    },
  ];

  for (const goal of savingsGoals) {
    await prisma.savingsGoal.create({ data: goal });
  }

  console.log('✅ Created savings goals');

  // Create beneficiaries
  const beneficiaries = [
    {
      userId: demoUser.id,
      name: 'John Smith',
      accountNumber: '1234567890',
      bankName: 'Demo Bank',
      bankCode: 'DEMO001',
      email: 'john@example.com',
      phoneNumber: '+1987654321',
    },
    {
      userId: demoUser.id,
      name: 'Jane Doe',
      accountNumber: '0987654321',
      bankName: 'Another Bank',
      bankCode: 'ANOT002',
      email: 'jane@example.com',
    },
  ];

  for (const beneficiary of beneficiaries) {
    await prisma.beneficiary.create({ data: beneficiary });
  }

  console.log('✅ Created beneficiaries');

  // Create sample investment
  await prisma.investment.create({
    data: {
      userId: demoUser.id,
      type: 'STOCK',
      amount: 2000.00,
      return: 150.00,
      risk: 'MEDIUM',
      description: 'Tech stock portfolio',
      status: 'ACTIVE',
      performance: [
        { date: '2024-01-01', value: 2000 },
        { date: '2024-01-15', value: 2050 },
        { date: '2024-02-01', value: 2150 },
      ],
    },
  });

  console.log('✅ Created sample investment');

  console.log('🎉 Database seeding completed successfully!');
  console.log('');
  console.log('Demo user credentials:');
  console.log('Email: demo@hoardrun.com');
  console.log('Password: demo123');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
