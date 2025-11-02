-- Index for searching Inventory by name and description
CREATE INDEX IF NOT EXISTS "Inventory_search_idx" 
ON "Inventory" 
USING GIN (to_tsvector('english', COALESCE(name, '') || ' ' || COALESCE(description, '')));

-- Index for searching Tags by name
CREATE INDEX IF NOT EXISTS "Tag_search_idx" 
ON "Tag" 
USING GIN (to_tsvector('english', name));

-- Index for searching Users by name and email
CREATE INDEX IF NOT EXISTS "User_search_idx" 
ON "User" 
USING GIN (to_tsvector('english', COALESCE(name, '') || ' ' || COALESCE(email, '')));

-- Index for searching InventoryItems by customId
CREATE INDEX IF NOT EXISTS "InventoryItem_customId_idx" 
ON "InventoryItem" 
USING GIN (to_tsvector('english', COALESCE("customId", '')));

-- Index for searching ItemFieldValues by value
CREATE INDEX IF NOT EXISTS "ItemFieldValue_value_idx" 
ON "ItemFieldValue" 
USING GIN (to_tsvector('english', COALESCE(value, '')));