import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
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

const PREDEFINED_TAGS = [
  'vintage',
  'rare',
  'limited-edition',
  'antique',
  'modern',
  'handmade',
  'imported',
  'custom',
  'professional',
  'hobby',
  'collection'
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
  
  console.log(`✓ Seeded ${PREDEFINED_CATEGORIES.length} categories`);
};

const seedTags = async () => {
  console.log('Seeding tags...');
  
  for (const tagName of PREDEFINED_TAGS) {
    await prisma.tag.upsert({
      where: { name: tagName },
      update: {},
      create: { name: tagName }
    });
  }
  
  console.log(`✓ Seeded ${PREDEFINED_TAGS.length} tags`);
};

const seedUsers = async () => {
  console.log('Seeding users...');
  
  const hashedAdminPassword = await bcrypt.hash('admin123', 10);
  const hashedUserPassword = await bcrypt.hash('123', 10);
  
  const users = [];
  
  const admin = await prisma.user.upsert({
    where: { email: 'admin@inventory.com' },
    update: {},
    create: {
      email: 'admin@inventory.com',
      password: hashedAdminPassword,
      name: 'Admin',
      role: 'ADMIN'
    }
  });
  users.push(admin);
  
  const manager = await prisma.user.upsert({
    where: { email: 'manager@inventory.com' },
    update: {},
    create: {
      email: 'manager@inventory.com',
      password: hashedUserPassword,
      name: 'Manager',
      role: 'USER'
    }
  });
  users.push(manager);
  
  const additionalUsers = [
    { email: 'john@example.com', name: 'John Doe' },
    { email: 'sarah@example.com', name: 'Sarah Johnson' },
    { email: 'mike@example.com', name: 'Mike Chen' },
    { email: 'emma@example.com', name: 'Emma Wilson' },
    { email: 'alex@example.com', name: 'Alex Martinez' },
    { email: 'lisa@example.com', name: 'Lisa Anderson' },
    { email: 'david@example.com', name: 'David Brown' },
    { email: 'jessica@example.com', name: 'Jessica Lee' }
  ];
  
  for (const userData of additionalUsers) {
    const user = await prisma.user.upsert({
      where: { email: userData.email },
      update: {},
      create: {
        email: userData.email,
        password: hashedUserPassword,
        name: userData.name,
        role: 'USER'
      }
    });
    users.push(user);
  }
  
  console.log(`✓ Seeded ${users.length} users`);
  return users;
};

const getRandomTags = (tags, count = 2) => {
  const shuffled = [...tags].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
};

const getRandomUser = (users) => {
  return users[Math.floor(Math.random() * users.length)];
};

const seedInventories = async (users, categories, tags) => {
  console.log('Seeding inventories...');
  
  const inventoryTemplates = [
    {
      name: 'Home Electronics Collection',
      description: 'My personal electronics and gadgets',
      category: 'Electronics',
      isPublic: true,
      fields: [
        { title: 'Brand', fieldType: 'SINGLE_LINE_TEXT', isRequired: true, showInTable: true, order: 0 },
        { title: 'Model', fieldType: 'SINGLE_LINE_TEXT', isRequired: false, showInTable: true, order: 1 },
        { title: 'Purchase Price', fieldType: 'NUMERIC', isRequired: false, showInTable: true, order: 2 },
        { title: 'Working', fieldType: 'BOOLEAN', isRequired: false, showInTable: true, order: 3 },
        { title: 'Notes', fieldType: 'MULTI_LINE_TEXT', isRequired: false, showInTable: false, order: 4 }
      ]
    },
    {
      name: 'Vintage Book Collection',
      description: 'Rare and vintage books from various authors',
      category: 'Books',
      isPublic: true,
      fields: [
        { title: 'Author', fieldType: 'SINGLE_LINE_TEXT', isRequired: true, showInTable: true, order: 0 },
        { title: 'Publication Year', fieldType: 'NUMERIC', isRequired: false, showInTable: true, order: 1 },
        { title: 'Condition', fieldType: 'SINGLE_LINE_TEXT', isRequired: false, showInTable: true, order: 2 },
        { title: 'Synopsis', fieldType: 'MULTI_LINE_TEXT', isRequired: false, showInTable: false, order: 3 }
      ]
    },
    {
      name: 'Trading Card Collection',
      description: 'Personal trading cards and collectibles',
      category: 'Collectibles',
      isPublic: false,
      fields: [
        { title: 'Card Name', fieldType: 'SINGLE_LINE_TEXT', isRequired: true, showInTable: true, order: 0 },
        { title: 'Rarity', fieldType: 'SINGLE_LINE_TEXT', isRequired: false, showInTable: true, order: 1 },
        { title: 'Estimated Value', fieldType: 'NUMERIC', isRequired: false, showInTable: true, order: 2 }
      ]
    },
    {
      name: 'Vintage Clothing Archive',
      description: 'Collection of vintage and designer clothing pieces',
      category: 'Clothing',
      isPublic: true,
      fields: [
        { title: 'Brand/Designer', fieldType: 'SINGLE_LINE_TEXT', isRequired: true, showInTable: true, order: 0 },
        { title: 'Size', fieldType: 'SINGLE_LINE_TEXT', isRequired: false, showInTable: true, order: 1 },
        { title: 'Year/Era', fieldType: 'SINGLE_LINE_TEXT', isRequired: false, showInTable: true, order: 2 },
        { title: 'Condition', fieldType: 'SINGLE_LINE_TEXT', isRequired: false, showInTable: true, order: 3 }
      ]
    },
    {
      name: 'Art Collection',
      description: 'Original artworks and prints',
      category: 'Art',
      isPublic: true,
      fields: [
        { title: 'Artist', fieldType: 'SINGLE_LINE_TEXT', isRequired: true, showInTable: true, order: 0 },
        { title: 'Medium', fieldType: 'SINGLE_LINE_TEXT', isRequired: false, showInTable: true, order: 1 },
        { title: 'Dimensions', fieldType: 'SINGLE_LINE_TEXT', isRequired: false, showInTable: true, order: 2 },
        { title: 'Provenance', fieldType: 'MULTI_LINE_TEXT', isRequired: false, showInTable: false, order: 3 }
      ]
    },
    {
      name: 'Vinyl Records Library',
      description: 'Vintage and modern vinyl record collection',
      category: 'Music',
      isPublic: true,
      fields: [
        { title: 'Artist/Band', fieldType: 'SINGLE_LINE_TEXT', isRequired: true, showInTable: true, order: 0 },
        { title: 'Album Title', fieldType: 'SINGLE_LINE_TEXT', isRequired: true, showInTable: true, order: 1 },
        { title: 'Year', fieldType: 'NUMERIC', isRequired: false, showInTable: true, order: 2 },
        { title: 'Condition', fieldType: 'SINGLE_LINE_TEXT', isRequired: false, showInTable: true, order: 3 }
      ]
    },
    {
      name: 'Sports Equipment Inventory',
      description: 'Sporting goods and equipment',
      category: 'Sports',
      isPublic: false,
      fields: [
        { title: 'Item Name', fieldType: 'SINGLE_LINE_TEXT', isRequired: true, showInTable: true, order: 0 },
        { title: 'Sport', fieldType: 'SINGLE_LINE_TEXT', isRequired: false, showInTable: true, order: 1 },
        { title: 'Purchase Date', fieldType: 'SINGLE_LINE_TEXT', isRequired: false, showInTable: true, order: 2 },
        { title: 'In Use', fieldType: 'BOOLEAN', isRequired: false, showInTable: true, order: 3 }
      ]
    },
    {
      name: 'Tool Workshop',
      description: 'Workshop tools and equipment',
      category: 'Tools',
      isPublic: false,
      fields: [
        { title: 'Tool Name', fieldType: 'SINGLE_LINE_TEXT', isRequired: true, showInTable: true, order: 0 },
        { title: 'Brand', fieldType: 'SINGLE_LINE_TEXT', isRequired: false, showInTable: true, order: 1 },
        { title: 'Purchase Price', fieldType: 'NUMERIC', isRequired: false, showInTable: true, order: 2 },
        { title: 'Condition', fieldType: 'SINGLE_LINE_TEXT', isRequired: false, showInTable: true, order: 3 }
      ]
    },
    {
      name: 'Board Game Collection',
      description: 'Modern and classic board games',
      category: 'Toys',
      isPublic: true,
      fields: [
        { title: 'Game Title', fieldType: 'SINGLE_LINE_TEXT', isRequired: true, showInTable: true, order: 0 },
        { title: 'Players', fieldType: 'SINGLE_LINE_TEXT', isRequired: false, showInTable: true, order: 1 },
        { title: 'Play Time', fieldType: 'SINGLE_LINE_TEXT', isRequired: false, showInTable: true, order: 2 },
        { title: 'Complete', fieldType: 'BOOLEAN', isRequired: false, showInTable: true, order: 3 }
      ]
    },
    {
      name: 'Kitchen Appliances',
      description: 'Kitchen gadgets and appliances inventory',
      category: 'Kitchen',
      isPublic: false,
      fields: [
        { title: 'Appliance Name', fieldType: 'SINGLE_LINE_TEXT', isRequired: true, showInTable: true, order: 0 },
        { title: 'Brand', fieldType: 'SINGLE_LINE_TEXT', isRequired: false, showInTable: true, order: 1 },
        { title: 'Working', fieldType: 'BOOLEAN', isRequired: false, showInTable: true, order: 2 }
      ]
    },
    {
      name: 'Jewelry Box',
      description: 'Personal jewelry collection',
      category: 'Jewelry',
      isPublic: false,
      fields: [
        { title: 'Item Type', fieldType: 'SINGLE_LINE_TEXT', isRequired: true, showInTable: true, order: 0 },
        { title: 'Material', fieldType: 'SINGLE_LINE_TEXT', isRequired: false, showInTable: true, order: 1 },
        { title: 'Estimated Value', fieldType: 'NUMERIC', isRequired: false, showInTable: true, order: 2 }
      ]
    },
    {
      name: 'Garden Plant Catalog',
      description: 'Plants and garden inventory',
      category: 'Garden',
      isPublic: true,
      fields: [
        { title: 'Plant Name', fieldType: 'SINGLE_LINE_TEXT', isRequired: true, showInTable: true, order: 0 },
        { title: 'Type', fieldType: 'SINGLE_LINE_TEXT', isRequired: false, showInTable: true, order: 1 },
        { title: 'Planted Date', fieldType: 'SINGLE_LINE_TEXT', isRequired: false, showInTable: true, order: 2 },
        { title: 'Notes', fieldType: 'MULTI_LINE_TEXT', isRequired: false, showInTable: false, order: 3 }
      ]
    }
  ];
  
  for (const template of inventoryTemplates) {
    const category = categories.find(c => c.name === template.category);
    if (!category) continue;
    
    const owner = getRandomUser(users);
    const selectedTags = getRandomTags(tags, Math.floor(Math.random() * 3) + 1);
    
    const inventory = await prisma.inventory.create({
      data: {
        name: template.name,
        description: template.description,
        userId: owner.id,
        categoryId: category.id,
        isPublic: template.isPublic,
        inventoryTags: {
          create: selectedTags.map(tag => ({ tagId: tag.id }))
        },
        fields: {
          create: template.fields
        }
      },
      include: { fields: true }
    });
    
    createdInventories.push(inventory);
  }
  
  console.log(`✓ Seeded ${createdInventories.length} inventories with custom fields`);
  return createdInventories;
};

const seedItems = async (inventories, users) => {
  console.log('Seeding items...');
  
  const item1 = await prisma.inventoryItem.create({
    data: {
      inventoryId: inventories.inventory1.id,
      userId: users.manager.id,
      customId: 'ELEC-001',
      fieldValues: {
        create: [
          { fieldId: inventories.inventory1.fields[0].id, value: 'Apple' },
          { fieldId: inventories.inventory1.fields[1].id, value: 'iPhone 13' },
          { fieldId: inventories.inventory1.fields[2].id, value: '999' },
          { fieldId: inventories.inventory1.fields[3].id, value: 'true' },
          { fieldId: inventories.inventory1.fields[4].id, value: 'Excellent condition, purchased in 2021' }
        ]
      }
    }
  });
  
  const item2 = await prisma.inventoryItem.create({
    data: {
      inventoryId: inventories.inventory1.id,
      userId: users.manager.id,
      customId: 'ELEC-002',
      fieldValues: {
        create: [
          { fieldId: inventories.inventory1.fields[0].id, value: 'Sony' },
          { fieldId: inventories.inventory1.fields[1].id, value: 'WH-1000XM4' },
          { fieldId: inventories.inventory1.fields[2].id, value: '349' },
          { fieldId: inventories.inventory1.fields[3].id, value: 'true' },
          { fieldId: inventories.inventory1.fields[4].id, value: 'Great noise cancelling headphones' }
        ]
      }
    }
  });
  
  const item3 = await prisma.inventoryItem.create({
    data: {
      inventoryId: inventories.inventory2.id,
      userId: users.john.id,
      customId: 'BOOK-001',
      fieldValues: {
        create: [
          { fieldId: inventories.inventory2.fields[0].id, value: 'Ernest Hemingway' },
          { fieldId: inventories.inventory2.fields[1].id, value: '1952' },
          { fieldId: inventories.inventory2.fields[2].id, value: 'Good' },
          { fieldId: inventories.inventory2.fields[3].id, value: 'The Old Man and the Sea - Classic first edition' }
        ]
      }
    }
  });
  
  const item4 = await prisma.inventoryItem.create({
    data: {
      inventoryId: inventories.inventory2.id,
      userId: users.john.id,
      customId: 'BOOK-002',
      fieldValues: {
        create: [
          { fieldId: inventories.inventory2.fields[0].id, value: 'George Orwell' },
          { fieldId: inventories.inventory2.fields[1].id, value: '1949' },
          { fieldId: inventories.inventory2.fields[2].id, value: 'Excellent' },
          { fieldId: inventories.inventory2.fields[3].id, value: '1984 - Dystopian classic novel' }
        ]
      }
    }
  });
  
  const item5 = await prisma.inventoryItem.create({
    data: {
      inventoryId: inventories.inventory3.id,
      userId: users.manager.id,
      customId: 'CARD-001',
      fieldValues: {
        create: [
          { fieldId: inventories.inventory3.fields[0].id, value: 'Charizard' },
          { fieldId: inventories.inventory3.fields[1].id, value: 'Holographic Rare' },
          { fieldId: inventories.inventory3.fields[2].id, value: '5000' }
        ]
      }
    }
  });
  
  console.log('✓ Seeded 5 items with field values');
  return { item1, item2, item3, item4, item5 };
};

const seedDiscussions = async (inventories, users) => {
  console.log('Seeding discussion posts...');
  
  await prisma.discussionPost.createMany({
    data: [
      {
        inventoryId: inventories.inventory1.id,
        userId: users.john.id,
        content: 'Great collection! What do you think about the new iPhone models?'
      },
      {
        inventoryId: inventories.inventory1.id,
        userId: users.manager.id,
        content: 'Thanks! I\'m waiting to see what the next generation brings before upgrading.'
      },
      {
        inventoryId: inventories.inventory2.id,
        userId: users.manager.id,
        content: 'Amazing collection of vintage books! Do you have any Fitzgerald?'
      },
      {
        inventoryId: inventories.inventory2.id,
        userId: users.john.id,
        content: 'Not yet, but The Great Gatsby is on my wishlist!'
      }
    ]
  });
  
  console.log('✓ Seeded 4 discussion posts');
};

const seedLikes = async (items, users) => {
  console.log('Seeding item likes...');
  
  await prisma.itemLike.createMany({
    data: [
      { itemId: items.item1.id, userId: users.john.id },
      { itemId: items.item2.id, userId: users.john.id },
      { itemId: items.item3.id, userId: users.manager.id },
      { itemId: items.item4.id, userId: users.manager.id }
    ]
  });
  
  console.log('✓ Seeded 4 item likes');
};

const main = async () => {
  console.log('🌱 Starting database seed...\n');
  
  try {
    await seedCategories();
    await seedTags();
    
    const existingAdmin = await prisma.user.findUnique({ 
      where: { email: 'admin@inventory.com' } 
    });
    const existingManager = await prisma.user.findUnique({ 
      where: { email: 'manager@inventory.com' } 
    });
    const existingJohn = await prisma.user.findUnique({ 
      where: { email: 'john@example.com' } 
    });
    
    let users;
    if (!existingAdmin || !existingManager || !existingJohn) {
      users = await seedUsers();
    } else {
      console.log('✓ Users already seeded, fetching existing users...');
      users = {
        admin: existingAdmin,
        manager: existingManager,
        john: existingJohn
      };
    }
    
    const testInventory = await prisma.inventory.findFirst({
      where: {
        name: 'Home Electronics Collection',
        userId: users.manager?.id
      }
    });
    
    if (!testInventory) {
      const allCategories = await prisma.category.findMany();
      const allTags = await prisma.tag.findMany();
      
      const inventories = await seedInventories(users, allCategories, allTags);
      const items = await seedItems(inventories, users);
      await seedDiscussions(inventories, users);
      await seedLikes(items, users);
    } else {
      console.log('✓ Test inventories already exist, skipping inventory seed');
    }
    
    console.log('\n✅ Seed completed successfully!');
    console.log('\n📝 Test Credentials:');
    console.log('   Admin: admin@inventory.com / admin123');
    console.log('   User: manager@inventory.com / 123');
    console.log('   User: john@example.com / 123\n');
    
  } catch (error) {
    console.error('❌ Error during seeding:', error);
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

