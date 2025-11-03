import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

const PREDEFINED_CATEGORIES = [
  'Books',
  'Electronics',
  'Clothing',
  'Collectibles',
  'Art',
  'Music',
  'Sports',
  'Tools',
  'Toys',
  'Furniture',
  'Kitchen',
  'Garden',
  'Jewelry',
  'Documents',
  'Automotive',
  'Other'
];

const seedCategories = async () => {
  console.log('Seeding categories...');
  
  for (const categoryName of PREDEFINED_CATEGORIES) {
    await prisma.category.upsert({
      where: { name: categoryName },
      update: {},
      create: { name: categoryName }
    });
  }
  
  console.log(`Seeded ${PREDEFINED_CATEGORIES.length} categories`);
};

const main = async () => {
  try {
    await seedCategories();
    console.log('Seed completed successfully');
  } catch (error) {
    console.error('Error during seeding:', error);
    throw error;
  }
};

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

