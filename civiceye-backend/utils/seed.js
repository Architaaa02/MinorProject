/**
 * Seeds a system_admin account and one admin per municipal department.
 * Run with: npm run seed
 *
 * Admin accounts are provisioned here rather than through the public
 * /api/auth/register endpoint to prevent privilege escalation.
 */
require('dotenv').config();
const bcrypt = require('bcryptjs');
const connectDB = require('../config/db');
const User = require('../models/User');
const { DEPARTMENTS } = require('../models/Issue');

async function seed() {
  await connectDB();

  const defaultPassword = process.env.SEED_ADMIN_PASSWORD || 'ChangeMe123!';
  const passwordHash = await bcrypt.hash(defaultPassword, 12);

  const accounts = [
    { name: 'System Administrator', email: 'sysadmin@civiceye.local', role: 'system_admin', department: null },
    ...DEPARTMENTS.map((dept) => ({
      name: `${dept} Admin`,
      email: `${dept.toLowerCase().replace(/[^a-z]+/g, '.')}@civiceye.local`,
      role: 'admin',
      department: dept,
    })),
  ];

  for (const acc of accounts) {
    const exists = await User.findOne({ email: acc.email });
    if (exists) {
      console.log(`[seed] already exists: ${acc.email}`);
      continue;
    }
    await User.create({ ...acc, passwordHash });
    console.log(`[seed] created ${acc.role}: ${acc.email}`);
  }

  console.log(`[seed] done. Default password for seeded accounts: ${defaultPassword}`);
  process.exit(0);
}

seed().catch((err) => {
  console.error('[seed] failed:', err);
  process.exit(1);
});
