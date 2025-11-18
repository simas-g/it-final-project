export const sanitizeSearchQuery = (query) => {
  if (!query || typeof query !== 'string') return '';
  const cleaned = query
    .trim()
    .replace(/[^\w\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  if (!cleaned) return '';
  const words = cleaned.split(' ').filter(word => word.length > 0);
  if (words.length === 0) return '';
  return words.join(' & ');
};

export const searchInventories = async (prisma, sanitizedQuery, limit, skip) => {
  const results = await prisma.$queryRaw`
    SELECT i.*, 
      ts_rank(to_tsvector('english', COALESCE(i.name, '') || ' ' || COALESCE(i.description, '')), 
              to_tsquery('english', ${sanitizedQuery})) as rank
    FROM "Inventory" i
    WHERE to_tsvector('english', COALESCE(i.name, '') || ' ' || COALESCE(i.description, ''))
      @@ to_tsquery('english', ${sanitizedQuery})
    ORDER BY rank DESC, i."createdAt" DESC
    LIMIT ${limit} OFFSET ${skip}
  `;
  const count = await prisma.$queryRaw`
    SELECT COUNT(*)::int as count
    FROM "Inventory" i
    WHERE to_tsvector('english', COALESCE(i.name, '') || ' ' || COALESCE(i.description, ''))
      @@ to_tsquery('english', ${sanitizedQuery})
  `;
  return { results, total: Number(count[0].count) };
};

export const searchItems = async (prisma, sanitizedQuery, limit, skip) => {
  const results = await prisma.$queryRaw`
    SELECT item.id,
      COALESCE(MAX(ts_rank(to_tsvector('english', COALESCE(item."customId", '')), 
                           to_tsquery('english', ${sanitizedQuery}))), 0) +
      COALESCE(MAX(ts_rank(to_tsvector('english', COALESCE(fv.value, '')), 
                           to_tsquery('english', ${sanitizedQuery}))), 0) as rank
    FROM "InventoryItem" item
    LEFT JOIN "ItemFieldValue" fv ON fv."itemId" = item.id
    WHERE to_tsvector('english', COALESCE(item."customId", '')) @@ to_tsquery('english', ${sanitizedQuery})
      OR EXISTS (
        SELECT 1 FROM "ItemFieldValue" fv2
        WHERE fv2."itemId" = item.id
        AND to_tsvector('english', COALESCE(fv2.value, '')) @@ to_tsquery('english', ${sanitizedQuery})
      )
    GROUP BY item.id
    ORDER BY rank DESC, item."createdAt" DESC
    LIMIT ${limit} OFFSET ${skip}
  `;
  const count = await prisma.$queryRaw`
    SELECT COUNT(DISTINCT item.id)::int as count
    FROM "InventoryItem" item
    LEFT JOIN "ItemFieldValue" fv ON fv."itemId" = item.id
    WHERE to_tsvector('english', COALESCE(item."customId", '')) @@ to_tsquery('english', ${sanitizedQuery})
      OR EXISTS (
        SELECT 1 FROM "ItemFieldValue" fv2
        WHERE fv2."itemId" = item.id
        AND to_tsvector('english', COALESCE(fv2.value, '')) @@ to_tsquery('english', ${sanitizedQuery})
      )
  `;
  return { results, total: Number(count[0].count) };
};

export const searchTags = async (prisma, sanitizedQuery, limit, skip) => {
  const results = await prisma.$queryRaw`
    SELECT i.id,
      MAX(ts_rank(to_tsvector('english', t.name), to_tsquery('english', ${sanitizedQuery}))) as rank
    FROM "Inventory" i
    INNER JOIN "InventoryTag" it ON it."inventoryId" = i.id
    INNER JOIN "Tag" t ON t.id = it."tagId"
    WHERE to_tsvector('english', t.name) @@ to_tsquery('english', ${sanitizedQuery})
    GROUP BY i.id
    ORDER BY rank DESC
    LIMIT ${limit} OFFSET ${skip}
  `;
  const count = await prisma.$queryRaw`
    SELECT COUNT(DISTINCT i.id)::int as count
    FROM "Inventory" i
    INNER JOIN "InventoryTag" it ON it."inventoryId" = i.id
    INNER JOIN "Tag" t ON t.id = it."tagId"
    WHERE to_tsvector('english', t.name) @@ to_tsquery('english', ${sanitizedQuery})
  `;
  return { results, total: Number(count[0].count) };
};

export const searchAdminUsers = async (prisma, query, limit = 10) => {
  if (!query || query.trim().length < 2) {
    return [];
  }
  
  const searchQuery = query.trim();
  const isEmailQuery = /@/.test(searchQuery);
  
  const users = await prisma.user.findMany({
    where: {
      role: 'ADMIN',
      isBlocked: false,
      OR: [
        { email: { contains: searchQuery, mode: 'insensitive' } },
        { name: { contains: searchQuery, mode: 'insensitive' } }
      ]
    },
    select: {
      name: true,
      email: true
    },
    take: limit,
    orderBy: isEmailQuery
      ? [
          { email: 'asc' }
        ]
      : [
          { name: 'asc' }
        ]
  });
  
  return users.map(user => ({
    type: 'user',
    text: user.name || user.email,
    email: user.email,
    name: user.name
  }));
};

export const searchSuggestions = async (prisma, sanitizedQuery) => {
  const [inventoryNames, tagNames, userNames] = await Promise.all([
    prisma.$queryRaw`
      SELECT name, ts_rank(to_tsvector('english', name), to_tsquery('english', ${sanitizedQuery})) as rank
      FROM "Inventory"
      WHERE to_tsvector('english', name) @@ to_tsquery('english', ${sanitizedQuery})
      ORDER BY rank DESC LIMIT 5
    `,
    prisma.$queryRaw`
      SELECT name, ts_rank(to_tsvector('english', name), to_tsquery('english', ${sanitizedQuery})) as rank
      FROM "Tag"
      WHERE to_tsvector('english', name) @@ to_tsquery('english', ${sanitizedQuery})
      ORDER BY rank DESC LIMIT 5
    `,
    prisma.$queryRaw`
      SELECT name, email,
        ts_rank(to_tsvector('english', COALESCE(name, '') || ' ' || COALESCE(email, '')),
                to_tsquery('english', ${sanitizedQuery})) as rank
      FROM "User"
      WHERE to_tsvector('english', COALESCE(name, '') || ' ' || COALESCE(email, ''))
        @@ to_tsquery('english', ${sanitizedQuery})
      ORDER BY rank DESC LIMIT 5
    `
  ]);
  return [
    ...inventoryNames.map(inv => ({ type: 'inventory', text: inv.name })),
    ...tagNames.map(tag => ({ type: 'tag', text: tag.name })),
    ...userNames.map(user => ({ type: 'user', text: user.name || user.email }))
  ];
};