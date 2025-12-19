import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const documentCategories = [
    // Document Types
    { name: 'Thông tư', type: 'document_type' },
    { name: 'Quyết định', type: 'document_type' },
    { name: 'Quy chế', type: 'document_type' },
    { name: 'Kế hoạch', type: 'document_type' },
    { name: 'Quy định', type: 'document_type' },
    { name: 'Hướng dẫn', type: 'document_type' },

    // Document Fields
    { name: 'Quản lý giáo dục', type: 'document_field' },
    { name: 'Tuyển sinh', type: 'document_field' },
    { name: 'Đánh giá', type: 'document_field' },
    { name: 'Kế hoạch', type: 'document_field' },
    { name: 'Học sinh', type: 'document_field' },
    { name: 'Chương trình', type: 'document_field' },
];

async function seedDocumentCategories() {
    console.log('🌱 Seeding document categories...');

    try {
        // Clear existing categories
        await prisma.documentCategory.deleteMany();
        console.log('✅ Cleared existing document categories');

        // Insert new categories
        for (const category of documentCategories) {
            await prisma.documentCategory.create({
                data: category,
            });
            console.log(`✅ Created category: ${category.name} (${category.type})`);
        }

        console.log('🎉 Document categories seeded successfully!');
        console.log(`📊 Total categories created: ${documentCategories.length}`);
    } catch (error) {
        console.error('❌ Error seeding document categories:', error);
        throw error;
    } finally {
        await prisma.$disconnect();
    }
}

// Run if called directly
if (require.main === module) {
    seedDocumentCategories().catch((error) => {
        console.error(error);
        process.exit(1);
    });
}

export default seedDocumentCategories;
