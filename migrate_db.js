const { PrismaClient } = require('@prisma/client');
const crypto = require('crypto');

const prisma = new PrismaClient();

async function main() {
  try {
    // 1. Rename column in documents table
    console.log("Checking if column 'field' exists...");
    const checkColumns = await prisma.$queryRaw`SHOW COLUMNS FROM documents LIKE 'field'`;
    
    if (checkColumns.length > 0) {
      console.log("Renaming 'field' to 'belongsTo'...");
      await prisma.$executeRaw`ALTER TABLE documents CHANGE COLUMN \`field\` \`belongsTo\` VARCHAR(255) NOT NULL`;
      console.log("Renamed 'field' to 'belongsTo' in documents table.");
    } else {
      console.log("Column 'field' not found in documents table, might have been already renamed.");
    }

    // 2. Map existing empty or null belongsTo to 'Nhà trường'
    console.log("Setting default 'Nhà trường' for empty belongsTo...");
    await prisma.$executeRaw`UPDATE documents SET belongsTo = 'Nhà trường' WHERE belongsTo IS NULL OR belongsTo = ''`;
    console.log("Default values set.");

    // 3. Delete old document_field categories and create new ones
    console.log("Deleting old document_field categories...");
    await prisma.$executeRaw`DELETE FROM document_categories WHERE type = 'document_field'`;
    console.log("Deleted old categories.");

    const categories = ['Cấp trên', 'Nhà trường'];
    for (const cat of categories) {
      const exists = await prisma.$queryRaw`SELECT id FROM document_categories WHERE name = ${cat} AND type = 'document_belongs_to'`;
      if (exists.length === 0) {
        const id = crypto.randomBytes(16).toString('hex');
        await prisma.$executeRaw`INSERT INTO document_categories (id, name, type, createdAt, updatedAt) VALUES (${id}, ${cat}, 'document_belongs_to', NOW(), NOW())`;
        console.log(`Inserted category: ${cat}`);
      }
    }

    console.log("Migration completed successfully!");
  } catch (error) {
    console.error("Error executing migration:", error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
