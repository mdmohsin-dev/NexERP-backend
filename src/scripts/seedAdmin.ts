import { connectDB, disconnectDB } from '../config/db';
import { env } from '../config/env';
import { User } from '../modules/auth/user.model';
import { Role } from '../types';

const ADMIN_EMAIL = 'admin@minierp.com';
const ADMIN_PASSWORD = 'Admin@123';

const seed = async () => {
  await connectDB(env.mongoUri);

  const existing = await User.findOne({ email: ADMIN_EMAIL });
  if (existing) {
    console.log('Admin account already exists:', ADMIN_EMAIL);
  } else {
    await User.create({
      name: 'System Admin',
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
      role: Role.ADMIN,
    });
    console.log('Admin account created:');
    console.log('  Email:', ADMIN_EMAIL);
    console.log('  Password:', ADMIN_PASSWORD);
    console.log('  (Change this password after first login)');
  }

  await disconnectDB();
  process.exit(0);
};

seed().catch((err) => {
  console.error('Seeding failed:', err);
  process.exit(1);
});
