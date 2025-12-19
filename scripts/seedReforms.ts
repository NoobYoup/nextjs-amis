import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const reformsData = [
    {
        title: 'Thông tin về đội ngũ giáo viên, cán bộ quản lý và nhân viên',
        description: 'Công khai đầy đủ thông tin về đội ngũ nhân sự của nhà trường',
        details: [
            'Danh sách giáo viên với trình độ, chuyên môn',
            'Thông tin cán bộ quản lý và chức vụ',
            'Thông tin nhân viên hành chính, kỹ thuật',
            'Lịch sử công tác và bằng cấp',
            'Các giải thưởng, khen thưởng',
        ],
    },
    {
        title: 'Thông tin về cơ sở vật chất và tài liệu học tập sử dụng chung',
        description: 'Công khai thông tin về cơ sở vật chất và tài liệu học tập',
        details: [
            'Danh sách phòng học, phòng chuyên môn',
            'Trang thiết bị dạy học hiện có',
            'Thư viện, tài liệu tham khảo',
            'Phòng máy tính, phòng thí nghiệm',
            'Các tiện ích phục vụ học sinh',
        ],
    },
    {
        title: 'Thông tin về kết quả đánh giá và kiểm định chất lượng giáo dục',
        description: 'Công khai kết quả đánh giá chất lượng giáo dục định kỳ',
        details: [
            'Kết quả đánh giá chất lượng ngoài nhà trường',
            'Kết quả kiểm định chất lượng giáo dục',
            'Báo cáo tự đánh giá chất lượng',
            'Kết quả khảo sát sự hài lòng của phụ huynh',
            'Kế hoạch cải thiện chất lượng',
        ],
    },
    {
        title: 'Thông tin về kết quả giáo dục thực tế của năm học trước',
        description: 'Công khai kết quả học tập và rèn luyện của học sinh',
        details: [
            'Tỷ lệ học sinh đạt các mức độ học lực',
            'Tỷ lệ học sinh đạt các mức độ hạnh kiểm',
            'Kết quả thi tuyển sinh vào cấp trên',
            'Tỷ lệ học sinh hoàn thành chương trình',
            'Kết quả các cuộc thi, hội thi',
        ],
    },
];

async function seedReforms() {
    console.log('🌱 Seeding reforms...');

    try {
        // Clear existing reforms and files
        await prisma.reformFile.deleteMany();
        await prisma.reform.deleteMany();
        console.log('✅ Cleared existing reforms and files');

        // Insert new reforms
        for (const reformData of reformsData) {
            const reform = await prisma.reform.create({
                data: reformData,
            });
            console.log(`✅ Created reform: ${reform.title}`);
        }

        console.log('🎉 reforms seeded successfully!');
        console.log(`📊 Total reforms created: ${reformsData.length}`);
        console.log('💡 Note: No files were seeded. Use admin panel to upload files for each reform.');
    } catch (error) {
        console.error('❌ Error seeding reforms:', error);
        throw error;
    } finally {
        await prisma.$disconnect();
    }
}

// Run if called directly
if (require.main === module) {
    seedReforms().catch((error) => {
        console.error(error);
        process.exit(1);
    });
}

export default seedReforms;
