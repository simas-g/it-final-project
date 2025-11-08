import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

const PREDEFINED_CATEGORIES = [
  'Books', 'Electronics', 'Clothing', 'Collectibles', 'Art', 'Music',
  'Sports', 'Tools', 'Toys', 'Furniture', 'Kitchen', 'Garden',
  'Jewelry', 'Documents', 'Automotive', 'Other'
];

const PREDEFINED_TAGS = [
  'vintage', 'rare', 'limited-edition', 'antique', 'modern',
  'handmade', 'imported', 'custom', 'professional', 'hobby', 'collection'
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
  
  const additionalUsers = [
    { email: 'manager@inventory.com', name: 'Manager' },
    { email: 'john@example.com', name: 'John Doe' },
    { email: 'sarah@example.com', name: 'Sarah Johnson' },
    { email: 'mike@example.com', name: 'Mike Chen' },
    { email: 'emma@example.com', name: 'Emma Wilson' },
    { email: 'alex@example.com', name: 'Alex Martinez' },
    { email: 'lisa@example.com', name: 'Lisa Anderson' },
    { email: 'david@example.com', name: 'David Brown' },
    { email: 'jessica@example.com', name: 'Jessica Lee' },
    { email: 'tom@example.com', name: 'Tom Harris' },
    { email: 'rachel@example.com', name: 'Rachel Green' }
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

const getRandomItems = (arr, count) => {
  const shuffled = [...arr].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
};

const getRandomUser = (users) => users[Math.floor(Math.random() * users.length)];

const itemDataByCategory = {
  Electronics: [
    ['Apple', 'iPhone 14 Pro', '1099', 'true', 'Latest model with excellent camera'],
    ['Samsung', 'Galaxy S23', '899', 'true', 'Android flagship phone'],
    ['Sony', 'WH-1000XM5', '399', 'true', 'Premium noise-canceling headphones'],
    ['Apple', 'MacBook Pro M2', '2499', 'true', '16-inch, 512GB'],
    ['Dell', 'XPS 15', '1899', 'true', 'High-performance laptop'],
    ['Apple', 'iPad Air', '599', 'true', '256GB with keyboard'],
    ['Amazon', 'Echo Dot', '49', 'true', '5th generation smart speaker'],
    ['Nintendo', 'Switch OLED', '349', 'true', 'Gaming console with enhanced screen'],
    ['Sony', 'PS5', '499', 'true', 'Latest PlayStation console'],
    ['LG', 'OLED TV 55"', '1499', 'true', '4K OLED display']
  ],
  Books: [
    ['Ernest Hemingway', '1952', 'Good', 'The Old Man and the Sea - Classic first edition'],
    ['George Orwell', '1949', 'Excellent', '1984 - Dystopian masterpiece'],
    ['F. Scott Fitzgerald', '1925', 'Very Good', 'The Great Gatsby - First edition'],
    ['Harper Lee', '1960', 'Good', 'To Kill a Mockingbird - Classic'],
    ['J.D. Salinger', '1951', 'Excellent', 'The Catcher in the Rye'],
    ['Jane Austen', '1813', 'Fair', 'Pride and Prejudice - Vintage edition'],
    ['J.R.R. Tolkien', '1954', 'Very Good', 'The Lord of the Rings - Complete set'],
    ['Gabriel García Márquez', '1967', 'Excellent', 'One Hundred Years of Solitude'],
    ['Toni Morrison', '1987', 'Good', 'Beloved - Pulitzer Prize winner'],
    ['Ray Bradbury', '1953', 'Very Good', 'Fahrenheit 451 - First edition']
  ],
  Collectibles: [
    ['Charizard', 'Holographic Rare', '5000'],
    ['Pikachu', 'First Edition', '2500'],
    ['Mewtwo', 'Shadowless', '3000'],
    ['Blastoise', 'Holo Rare', '1800'],
    ['Venusaur', 'Limited', '1500'],
    ['Dragonite', 'Rare', '800'],
    ['Snorlax', 'Promo', '600'],
    ['Gyarados', 'Holo', '450'],
    ['Alakazam', 'Rare', '350'],
    ['Gengar', 'Holo Rare', '950']
  ],
  Clothing: [
    ['Gucci', 'M', '1980s', 'Excellent'],
    ['Chanel', 'S', '1990s', 'Very Good'],
    ['Versace', 'L', '1995', 'Good'],
    ['Prada', 'M', '2000s', 'Excellent'],
    ['Dior', 'S', '1970s', 'Fair'],
    ['Yves Saint Laurent', 'M', '1985', 'Very Good'],
    ['Burberry', 'L', '1990s', 'Excellent'],
    ['Hermès', 'M', '1980s', 'Good'],
    ['Valentino', 'S', '1995', 'Very Good'],
    ['Armani', 'L', '2005', 'Excellent']
  ],
  Art: [
    ['Vincent van Gogh', 'Oil on Canvas', '24x36"', 'Museum provenance'],
    ['Pablo Picasso', 'Watercolor', '18x24"', 'Private collection'],
    ['Claude Monet', 'Oil Paint', '30x40"', 'Gallery authenticated'],
    ['Andy Warhol', 'Screen Print', '20x24"', 'Numbered edition'],
    ['Banksy', 'Spray Paint', '36x48"', 'Street art original'],
    ['Frida Kahlo', 'Mixed Media', '16x20"', 'Estate verified'],
    ['Salvador Dalí', 'Lithograph', '22x30"', 'Limited edition print'],
    ['Georgia O\'Keeffe', 'Oil on Canvas', '24x30"', 'Museum quality'],
    ['Jackson Pollock', 'Acrylic', '48x60"', 'Authenticated drip painting'],
    ['Keith Haring', 'Ink on Paper', '18x24"', 'Estate stamped']
  ],
  Music: [
    ['The Beatles', 'Abbey Road', '1969', 'Near Mint'],
    ['Pink Floyd', 'Dark Side of the Moon', '1973', 'Excellent'],
    ['Led Zeppelin', 'Led Zeppelin IV', '1971', 'Very Good'],
    ['The Rolling Stones', 'Sticky Fingers', '1971', 'Good'],
    ['Bob Dylan', 'Highway 61 Revisited', '1965', 'Excellent'],
    ['David Bowie', 'The Rise and Fall of Ziggy Stardust', '1972', 'Near Mint'],
    ['Nirvana', 'Nevermind', '1991', 'Excellent'],
    ['Miles Davis', 'Kind of Blue', '1959', 'Very Good'],
    ['The Velvet Underground', 'The Velvet Underground & Nico', '1967', 'Good'],
    ['Radiohead', 'OK Computer', '1997', 'Near Mint']
  ],
  Sports: [
    ['Wilson Basketball', 'Basketball', '2022', 'true'],
    ['Spalding Volleyball', 'Volleyball', '2021', 'true'],
    ['Nike Soccer Ball', 'Soccer', '2023', 'true'],
    ['Rawlings Baseball Glove', 'Baseball', '2020', 'true'],
    ['Prince Tennis Racket', 'Tennis', '2022', 'false'],
    ['Yonex Badminton Racket', 'Badminton', '2023', 'true'],
    ['HEAD Ski Set', 'Skiing', '2019', 'true'],
    ['Burton Snowboard', 'Snowboarding', '2021', 'true'],
    ['Callaway Golf Clubs', 'Golf', '2020', 'true'],
    ['Speedo Swim Gear', 'Swimming', '2023', 'true']
  ],
  Tools: [
    ['DeWalt Drill', 'DeWalt', '299', 'Excellent'],
    ['Milwaukee Saw', 'Milwaukee', '189', 'Very Good'],
    ['Makita Sander', 'Makita', '149', 'Good'],
    ['Bosch Router', 'Bosch', '229', 'Excellent'],
    ['Ryobi Impact Driver', 'Ryobi', '129', 'Very Good'],
    ['Craftsman Wrench Set', 'Craftsman', '79', 'Excellent'],
    ['Stanley Tool Box', 'Stanley', '59', 'Good'],
    ['Black+Decker Jigsaw', 'Black+Decker', '89', 'Very Good'],
    ['Irwin Clamp Set', 'Irwin', '49', 'Excellent'],
    ['WORX Leaf Blower', 'WORX', '119', 'Good']
  ],
  Toys: [
    ['Catan', '3-4', '60-90 min', 'true'],
    ['Ticket to Ride', '2-5', '45-60 min', 'true'],
    ['Pandemic', '2-4', '45 min', 'true'],
    ['Azul', '2-4', '30-45 min', 'true'],
    ['Wingspan', '1-5', '40-70 min', 'true'],
    ['Codenames', '4-8', '15 min', 'true'],
    ['7 Wonders', '2-7', '30 min', 'true'],
    ['Dominion', '2-4', '30 min', 'true'],
    ['Splendor', '2-4', '30 min', 'true'],
    ['Carcassonne', '2-5', '35 min', 'true']
  ],
  Kitchen: [
    ['KitchenAid Mixer', 'KitchenAid', 'true'],
    ['Ninja Blender', 'Ninja', 'true'],
    ['Instant Pot', 'Instant Pot', 'true'],
    ['Cuisinart Food Processor', 'Cuisinart', 'true'],
    ['Breville Toaster Oven', 'Breville', 'true'],
    ['All-Clad Cookware Set', 'All-Clad', 'true'],
    ['Vitamix Blender', 'Vitamix', 'true'],
    ['Lodge Cast Iron Skillet', 'Lodge', 'true'],
    ['OXO Utensil Set', 'OXO', 'true'],
    ['Zwilling Knife Set', 'Zwilling', 'true']
  ],
  Jewelry: [
    ['Diamond Ring', 'White Gold', '2500'],
    ['Pearl Necklace', 'Cultured Pearl', '800'],
    ['Gold Bracelet', '14K Gold', '1200'],
    ['Sapphire Earrings', 'Sterling Silver', '450'],
    ['Ruby Pendant', 'Rose Gold', '950'],
    ['Emerald Ring', 'Platinum', '3200'],
    ['Topaz Brooch', 'Yellow Gold', '320'],
    ['Amethyst Necklace', 'Silver', '280'],
    ['Opal Ring', 'White Gold', '650'],
    ['Turquoise Bracelet', 'Sterling Silver', '180']
  ],
  Garden: [
    ['Tomato', 'Vegetable', '2023-04-15', 'Producing well, needs staking'],
    ['Rose Bush', 'Flower', '2022-10-01', 'Blooming beautifully in spring'],
    ['Basil', 'Herb', '2023-05-20', 'Great for cooking'],
    ['Lavender', 'Herb', '2022-08-10', 'Fragrant and attracts bees'],
    ['Sunflower', 'Flower', '2023-03-25', 'Growing tall, needs support'],
    ['Mint', 'Herb', '2023-06-01', 'Very invasive, contained in pot'],
    ['Japanese Maple', 'Tree', '2020-04-01', 'Beautiful fall colors'],
    ['Hostas', 'Perennial', '2021-09-15', 'Shade loving plant'],
    ['Strawberry', 'Fruit', '2023-02-20', 'First harvest coming soon'],
    ['Oregano', 'Herb', '2022-07-10', 'Hardy perennial herb']
  ]
};

const seedInventoriesAndItems = async (users, categories, tags) => {
  console.log('Seeding inventories and items...');
  
  const inventories = [];
  const allItems = [];
  
  for (const [categoryName, itemData] of Object.entries(itemDataByCategory)) {
    const category = categories.find(c => c.name === categoryName);
    if (!category) continue;
    
    const owner = getRandomUser(users);
    const selectedTags = getRandomItems(tags, Math.floor(Math.random() * 3) + 1);
    
    let fields = [];
    if (categoryName === 'Electronics') {
      fields = [
        { title: 'Brand', fieldType: 'SINGLE_LINE_TEXT', isRequired: true, showInTable: true, order: 0 },
        { title: 'Model', fieldType: 'SINGLE_LINE_TEXT', isRequired: false, showInTable: true, order: 1 },
        { title: 'Price', fieldType: 'NUMERIC', isRequired: false, showInTable: true, order: 2 },
        { title: 'Working', fieldType: 'BOOLEAN', isRequired: false, showInTable: true, order: 3 },
        { title: 'Notes', fieldType: 'MULTI_LINE_TEXT', isRequired: false, showInTable: false, order: 4 }
      ];
    } else if (categoryName === 'Books') {
      fields = [
        { title: 'Author', fieldType: 'SINGLE_LINE_TEXT', isRequired: true, showInTable: true, order: 0 },
        { title: 'Year', fieldType: 'NUMERIC', isRequired: false, showInTable: true, order: 1 },
        { title: 'Condition', fieldType: 'SINGLE_LINE_TEXT', isRequired: false, showInTable: true, order: 2 },
        { title: 'Description', fieldType: 'MULTI_LINE_TEXT', isRequired: false, showInTable: false, order: 3 }
      ];
    } else if (categoryName === 'Collectibles') {
      fields = [
        { title: 'Name', fieldType: 'SINGLE_LINE_TEXT', isRequired: true, showInTable: true, order: 0 },
        { title: 'Rarity', fieldType: 'SINGLE_LINE_TEXT', isRequired: false, showInTable: true, order: 1 },
        { title: 'Value', fieldType: 'NUMERIC', isRequired: false, showInTable: true, order: 2 }
      ];
    } else if (categoryName === 'Clothing') {
      fields = [
        { title: 'Designer', fieldType: 'SINGLE_LINE_TEXT', isRequired: true, showInTable: true, order: 0 },
        { title: 'Size', fieldType: 'SINGLE_LINE_TEXT', isRequired: false, showInTable: true, order: 1 },
        { title: 'Era', fieldType: 'SINGLE_LINE_TEXT', isRequired: false, showInTable: true, order: 2 },
        { title: 'Condition', fieldType: 'SINGLE_LINE_TEXT', isRequired: false, showInTable: true, order: 3 }
      ];
    } else if (categoryName === 'Art') {
      fields = [
        { title: 'Artist', fieldType: 'SINGLE_LINE_TEXT', isRequired: true, showInTable: true, order: 0 },
        { title: 'Medium', fieldType: 'SINGLE_LINE_TEXT', isRequired: false, showInTable: true, order: 1 },
        { title: 'Dimensions', fieldType: 'SINGLE_LINE_TEXT', isRequired: false, showInTable: true, order: 2 },
        { title: 'Provenance', fieldType: 'MULTI_LINE_TEXT', isRequired: false, showInTable: false, order: 3 }
      ];
    } else {
      fields = [
        { title: 'Item Name', fieldType: 'SINGLE_LINE_TEXT', isRequired: true, showInTable: true, order: 0 },
        { title: 'Details', fieldType: 'SINGLE_LINE_TEXT', isRequired: false, showInTable: true, order: 1 },
        { title: 'Info', fieldType: 'SINGLE_LINE_TEXT', isRequired: false, showInTable: true, order: 2 },
        { title: 'Status', fieldType: 'SINGLE_LINE_TEXT', isRequired: false, showInTable: true, order: 3 }
      ];
    }
    
    const inventory = await prisma.inventory.create({
      data: {
        name: `${categoryName} Collection`,
        description: `My ${categoryName.toLowerCase()} inventory`,
        userId: owner.id,
        categoryId: category.id,
        isPublic: Math.random() > 0.3,
        inventoryTags: {
          create: selectedTags.map(tag => ({ tagId: tag.id }))
        },
        fields: { create: fields }
      },
      include: { fields: true }
    });
    
    inventories.push(inventory);
    
    for (let i = 0; i < itemData.length; i++) {
      const customId = `${categoryName.substring(0, 4).toUpperCase()}-${String(i + 1).padStart(3, '0')}`;
      const fieldValues = itemData[i].map((value, idx) => ({
        fieldId: inventory.fields[idx].id,
        value: String(value)
      }));
      
      const item = await prisma.inventoryItem.create({
        data: {
          inventoryId: inventory.id,
          userId: owner.id,
          customId,
          fieldValues: { create: fieldValues }
        }
      });
      
      allItems.push(item);
    }
  }
  
  console.log(`✓ Seeded ${inventories.length} inventories with ${allItems.length} items`);
  return { inventories, items: allItems };
};

const seedDiscussionsAndLikes = async (inventories, items, users) => {
  console.log('Seeding discussions and likes...');
  
  const discussionTemplates = [
    'Great collection! Really impressed with the variety.',
    'Do you have any tips for maintaining these items?',
    'Where did you find some of these rare pieces?',
    'Amazing! How long have you been collecting?',
    'I have a similar collection. Would love to trade sometime!',
    'This is inspiring! Might start my own collection.',
    'Beautiful items! What\'s your favorite piece?',
    'Very organized! What system do you use?',
    'Impressive collection! Any plans to expand?',
    'Love this! Thanks for sharing.'
  ];
  
  const discussions = [];
  for (const inv of inventories.slice(0, Math.min(inventories.length, 10))) {
    const numPosts = Math.floor(Math.random() * 4) + 1;
    for (let i = 0; i < numPosts; i++) {
      const user = getRandomUser(users);
      const content = discussionTemplates[Math.floor(Math.random() * discussionTemplates.length)];
      discussions.push({
        inventoryId: inv.id,
        userId: user.id,
        content
      });
    }
  }
  
  if (discussions.length > 0) {
    await prisma.discussionPost.createMany({ data: discussions });
  }
  
  const likes = [];
  const itemsToLike = getRandomItems(items, Math.min(items.length, 50));
  for (const item of itemsToLike) {
    const numLikes = Math.floor(Math.random() * 5) + 1;
    const likingUsers = getRandomItems(users, numLikes);
    for (const user of likingUsers) {
      likes.push({
        itemId: item.id,
        userId: user.id
      });
    }
  }
  
  if (likes.length > 0) {
    await prisma.itemLike.createMany({ data: likes, skipDuplicates: true });
  }
  
  console.log(`✓ Seeded ${discussions.length} discussions and ${likes.length} likes`);
};

const main = async () => {
  console.log('🌱 Starting large database seed...\n');
  
  try {
    await seedCategories();
    await seedTags();
    
    const users = await seedUsers();
    const categories = await prisma.category.findMany();
    const tags = await prisma.tag.findMany();
    
    const { inventories, items } = await seedInventoriesAndItems(users, categories, tags);
    await seedDiscussionsAndLikes(inventories, items, users);
    
    console.log('\n✅ Large seed completed successfully!');
    console.log(`\n📊 Summary:`);
    console.log(`   Users: ${users.length}`);
    console.log(`   Inventories: ${inventories.length}`);
    console.log(`   Items: ${items.length}`);
    console.log('\n📝 Test Credentials:');
    console.log('   Admin: admin@inventory.com / admin123');
    console.log('   User: manager@inventory.com / 123\n');
    
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

