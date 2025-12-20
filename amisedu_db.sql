-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Dec 19, 2025 at 04:28 AM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.0.30

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `amisedu_db`
--

-- --------------------------------------------------------

--
-- Table structure for table `activities`
--

CREATE TABLE `activities` (
  `id` varchar(191) NOT NULL,
  `title` varchar(191) NOT NULL,
  `description` text NOT NULL,
  `categoryId` varchar(191) NOT NULL,
  `date` datetime(3) NOT NULL,
  `author` varchar(191) NOT NULL,
  `thumbnail` text DEFAULT NULL,
  `images` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`images`)),
  `videos` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`videos`)),
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `activities`
--

INSERT INTO `activities` (`id`, `title`, `description`, `categoryId`, `date`, `author`, `thumbnail`, `images`, `videos`, `createdAt`, `updatedAt`) VALUES
('97bcecde-5e0f-40b5-b8ba-09bcabf35ecb', 'HAPPY THE TEACHER’S DAY - LỄ CHÀO MỪNG NGÀY NHÀ GIÁO VIỆT NAM', 'kkk', '4a1bafc6-eebf-460b-ba4c-006947608e42', '2025-11-20 00:00:00.000', 'Đoàn trường', 'https://res.cloudinary.com/ddkwerwzg/image/upload/v1763914473/ofjkcwv1ob80bevuzbhf.jpg', '[\"https://res.cloudinary.com/ddkwerwzg/image/upload/v1763914473/ofjkcwv1ob80bevuzbhf.jpg\",\"https://res.cloudinary.com/ddkwerwzg/image/upload/v1763914475/kfzgdwao9trellsaywnk.jpg\",\"https://res.cloudinary.com/ddkwerwzg/image/upload/v1763914477/kxdd6us6algalttvct3b.jpg\",\"https://res.cloudinary.com/ddkwerwzg/image/upload/v1763914480/h3y5mpeaudfnroeyryuw.jpg\",\"https://res.cloudinary.com/ddkwerwzg/image/upload/v1763914483/nadyctjufyfgyrawqr69.jpg\",\"https://res.cloudinary.com/ddkwerwzg/image/upload/v1763914486/eraswsvvi6x8tg0jheyi.jpg\",\"https://res.cloudinary.com/ddkwerwzg/image/upload/v1763914489/clcb4nakr9seomxf6vwy.jpg\",\"https://res.cloudinary.com/ddkwerwzg/image/upload/v1763914492/ouq9dkak2jaewrudynex.jpg\",\"https://res.cloudinary.com/ddkwerwzg/image/upload/v1763914495/tcldx1stht9a5zwahlw7.jpg\",\"https://res.cloudinary.com/ddkwerwzg/image/upload/v1763914497/akg8tp8wo8cqzmanzpiv.jpg\",\"https://res.cloudinary.com/ddkwerwzg/image/upload/v1763914500/x6wzhwzb5bkkqghwjjw6.jpg\",\"https://res.cloudinary.com/ddkwerwzg/image/upload/v1763914503/q7jpc3jo49jyxk9lk2vx.jpg\"]', '[]', '2025-11-23 16:15:05.320', '2025-11-23 18:13:58.470');

-- --------------------------------------------------------

--
-- Table structure for table `activity_categories`
--

CREATE TABLE `activity_categories` (
  `id` varchar(191) NOT NULL,
  `name` varchar(191) NOT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL,
  `deletedAt` datetime(3) DEFAULT NULL,
  `deletedBy` varchar(191) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `activity_categories`
--

INSERT INTO `activity_categories` (`id`, `name`, `createdAt`, `updatedAt`, `deletedAt`, `deletedBy`) VALUES
('41cd43ef-05d4-4f3b-8e5e-6ab29d718edb', 'kkkk', '2025-11-09 05:53:38.979', '2025-11-09 05:53:50.811', '2025-11-09 05:53:50.808', NULL),
('4a1bafc6-eebf-460b-ba4c-006947608e42', 'Hoạt động ngoại khóa', '2025-11-09 02:30:25.406', '2025-11-09 06:01:58.104', NULL, NULL),
('5c438cac-5c31-4378-90e5-19767ed5c256', 'kakaka', '2025-11-09 05:57:56.674', '2025-11-09 05:59:23.810', '2025-11-09 05:59:23.808', NULL),
('89c2d7d8-ef22-4e7b-b6d3-06fe4793a2bc', 'Văn nghệ', '2025-11-09 02:30:25.406', '2025-11-09 02:30:25.406', NULL, NULL),
('c1d08adf-2eb4-486f-907e-1fe974333968', 'Học tập', '2025-11-09 02:30:25.406', '2025-11-09 02:30:25.406', NULL, NULL),
('c44914ac-54ce-4704-a063-01dc00b7396c', 'Thi đấu thể thao', '2025-11-09 02:30:25.406', '2025-11-09 02:30:25.406', NULL, NULL),
('c79db103-1ef6-4a2d-ab6c-217e17136224', 'Sự kiện học đường', '2025-11-09 02:30:25.406', '2025-11-09 02:30:25.406', NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `documents`
--

CREATE TABLE `documents` (
  `id` varchar(191) NOT NULL,
  `title` varchar(191) NOT NULL,
  `type` varchar(191) NOT NULL,
  `number` varchar(191) NOT NULL,
  `date` datetime(3) NOT NULL,
  `field` varchar(191) NOT NULL,
  `summary` text DEFAULT NULL,
  `isNew` tinyint(1) NOT NULL DEFAULT 0,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `documents`
--

INSERT INTO `documents` (`id`, `title`, `type`, `number`, `date`, `field`, `summary`, `isNew`, `createdAt`, `updatedAt`) VALUES
('00b4603c-ac87-4d9e-9a17-4e00bb459b51', 'V/v Thành lập ban chỉ đạo thực hiện Qui chế công khai trong Trung tâm Anh Ngữ Mỹ Úc theo Thông tư 09/2024/TT-BGD&ĐT năm học 2025-2026', 'Quyết định', '01/QĐ-QTMU', '2025-07-15 00:00:00.000', 'Quản lý giáo dục', '', 0, '2025-11-23 13:58:42.781', '2025-11-23 13:58:42.781'),
('b2127634-d040-4a87-87fd-846b83b641ff', 'V/v Dán niêm yết công khai cơ sở vật chất; Chất lượng giáo dục thực tế; Công tác tuyển sinh; Đội ngũ nhà giáo - CBQL năm học 2025-2026', 'Biên bản', '', '2025-06-15 00:00:00.000', 'Kế hoạch', '', 0, '2025-11-23 15:23:33.567', '2025-11-23 15:23:33.567'),
('c5909646-67a9-4a92-af4c-f5106a079edf', 'Thực hiện 03 công khai năm học 2025-2026', 'Kế hoạch', '01/KH-QTMU', '2025-06-15 00:00:00.000', 'Kế hoạch', '', 0, '2025-11-23 14:17:23.810', '2025-11-23 14:17:23.810'),
('f995d8c5-1e3c-4973-b9ce-30fa281a1001', 'Cam kết chất lượng giáo dục của Trung tâm Anh ngữ Mỹ Úc năm học 2025-2026', 'Thông báo', '', '2025-06-15 00:00:00.000', 'Quản lý giáo dục', '', 0, '2025-11-23 15:38:57.273', '2025-11-23 15:38:57.273'),
('fef89533-c308-4b2c-86fd-b5b6eb3024a4', 'Về việc tháo niêm yết công khai theo Thông tư 09/2024/TT-BGDĐT ngày 03/06/2024 của Bộ giáo dục và Đào tạo năm học 2025-2026', 'Biên bản', '', '2025-09-30 00:00:00.000', 'Quản lý giáo dục', '', 0, '2025-11-23 15:54:14.590', '2025-11-23 15:54:14.590');

-- --------------------------------------------------------

--
-- Table structure for table `document_categories`
--

CREATE TABLE `document_categories` (
  `id` varchar(191) NOT NULL,
  `name` varchar(191) NOT NULL,
  `type` varchar(191) NOT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `document_categories`
--

INSERT INTO `document_categories` (`id`, `name`, `type`, `createdAt`, `updatedAt`) VALUES
('1e816bcc-d46a-48ff-9c2d-886ced09a2cd', 'Kế hoạch', 'document_field', '2025-11-23 15:12:16.945', '2025-11-23 15:12:16.945'),
('37fe7cc9-ceb4-4246-8355-abe9d555f63b', 'Quyết định', 'document_type', '2025-11-23 15:12:16.909', '2025-11-23 15:12:16.909'),
('3b26ad1a-16d5-42e0-84f7-5083e276d0d5', 'Quy định', 'document_type', '2025-11-23 15:12:16.921', '2025-11-23 15:12:16.921'),
('3b577535-4b0b-48ec-9b24-2e50fbfc2906', 'Quản lý giáo dục', 'document_field', '2025-11-23 15:12:16.930', '2025-11-23 15:12:16.930'),
('55746c7a-d463-407a-aa96-7c19b11b6ad5', 'Chương trình', 'document_field', '2025-11-23 15:12:16.955', '2025-11-23 15:12:16.955'),
('5db1eb09-75e2-4b76-a204-c63a1fb48dbe', 'Học sinh', 'document_field', '2025-11-23 15:12:16.950', '2025-11-23 15:12:16.950'),
('7510a8dc-2f0f-4e65-834a-7348d4075bea', 'Biên bản', 'document_type', '2025-11-23 15:18:47.062', '2025-11-23 15:18:47.062'),
('a2e6a6d6-9682-4b24-be5b-febc63d23bc2', 'Thông báo', 'document_type', '2025-11-23 15:12:16.903', '2025-11-23 15:38:23.827'),
('b6c7ce63-19b3-4a7b-a886-17bd7b3d8fbe', 'Tuyển sinh', 'document_field', '2025-11-23 15:12:16.935', '2025-11-23 15:12:16.935'),
('ca8b7c8b-6ae0-4f5a-b18d-24cff4fa8781', 'Đánh giá', 'document_field', '2025-11-23 15:12:16.941', '2025-11-23 15:12:16.941'),
('f5d68339-3e07-481a-89c3-4c676bb97da3', 'Kế hoạch', 'document_type', '2025-11-23 15:12:16.916', '2025-11-23 15:12:16.916');

-- --------------------------------------------------------

--
-- Table structure for table `document_files`
--

CREATE TABLE `document_files` (
  `id` varchar(191) NOT NULL,
  `documentId` varchar(191) NOT NULL,
  `fileUrl` text NOT NULL,
  `fileType` varchar(191) NOT NULL DEFAULT 'pdf',
  `order` int(11) NOT NULL DEFAULT 0,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `document_files`
--

INSERT INTO `document_files` (`id`, `documentId`, `fileUrl`, `fileType`, `order`, `createdAt`, `updatedAt`) VALUES
('3c36c575-d995-43a9-9a1d-089cec768fab', 'f995d8c5-1e3c-4973-b9ce-30fa281a1001', 'https://res.cloudinary.com/ddkwerwzg/image/upload/v1763912342/documents/IMG_6148.jpg', 'image', 0, '2025-11-23 15:39:04.002', '2025-11-23 15:39:04.002'),
('3e7c65f0-90aa-4395-b104-ef3a1d9bdfcc', 'c5909646-67a9-4a92-af4c-f5106a079edf', 'https://res.cloudinary.com/ddkwerwzg/image/upload/v1763907447/documents/IMG_6143.jpg', 'image', 0, '2025-11-23 14:17:28.944', '2025-11-23 14:17:28.944'),
('568e5802-ba35-49cc-839f-845e5486920f', '00b4603c-ac87-4d9e-9a17-4e00bb459b51', 'https://res.cloudinary.com/ddkwerwzg/image/upload/v1763906325/documents/IMG_6142.jpg', 'image', 0, '2025-11-23 13:58:47.159', '2025-11-23 13:58:47.159'),
('754a0e6a-3382-4ced-b947-b78bc7548b05', 'c5909646-67a9-4a92-af4c-f5106a079edf', 'https://res.cloudinary.com/ddkwerwzg/image/upload/v1763907450/documents/IMG_6144.jpg', 'image', 1, '2025-11-23 14:17:32.081', '2025-11-23 14:17:32.081'),
('7f35d479-c27c-441e-be3b-c139bcb322a8', 'fef89533-c308-4b2c-86fd-b5b6eb3024a4', 'https://res.cloudinary.com/ddkwerwzg/image/upload/v1763913262/documents/IMG_6154.jpg', 'image', 1, '2025-11-23 15:54:24.067', '2025-11-23 15:54:24.067'),
('8a9b378b-b9a1-4b55-94f7-5c5e2fdcf11b', 'c5909646-67a9-4a92-af4c-f5106a079edf', 'https://res.cloudinary.com/ddkwerwzg/image/upload/v1763907453/documents/IMG_6145.jpg', 'image', 2, '2025-11-23 14:17:35.460', '2025-11-23 14:17:35.460'),
('8ea833fd-3f12-4a9f-9b02-67ea8f68c6e5', 'b2127634-d040-4a87-87fd-846b83b641ff', 'https://res.cloudinary.com/ddkwerwzg/image/upload/v1763911421/documents/IMG_6147.jpg', 'image', 1, '2025-11-23 15:23:42.650', '2025-11-23 15:23:42.650'),
('9a71769b-a699-4cc2-b134-9273d8abc1d5', 'fef89533-c308-4b2c-86fd-b5b6eb3024a4', 'https://res.cloudinary.com/ddkwerwzg/image/upload/v1763913259/documents/IMG_6153.jpg', 'image', 0, '2025-11-23 15:54:20.753', '2025-11-23 15:54:20.753'),
('a5d9722d-c15c-4942-bee9-db9dda8f784f', 'b2127634-d040-4a87-87fd-846b83b641ff', 'https://res.cloudinary.com/ddkwerwzg/image/upload/v1763911418/documents/IMG_6146.jpg', 'image', 0, '2025-11-23 15:23:39.844', '2025-11-23 15:23:39.844');

-- --------------------------------------------------------

--
-- Table structure for table `news`
--

CREATE TABLE `news` (
  `id` varchar(191) NOT NULL,
  `title` varchar(191) NOT NULL,
  `description` text NOT NULL,
  `content` text NOT NULL,
  `category` varchar(191) NOT NULL,
  `date` datetime(3) NOT NULL,
  `thumbnail` text DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `news_images`
--

CREATE TABLE `news_images` (
  `id` varchar(191) NOT NULL,
  `newsId` varchar(191) NOT NULL,
  `imageUrl` text NOT NULL,
  `order` int(11) NOT NULL DEFAULT 0,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `procedures`
--

CREATE TABLE `procedures` (
  `id` varchar(191) NOT NULL,
  `title` varchar(191) NOT NULL,
  `category` varchar(191) NOT NULL,
  `description` text NOT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `procedure_contents`
--

CREATE TABLE `procedure_contents` (
  `id` varchar(191) NOT NULL,
  `procedureId` varchar(191) NOT NULL,
  `title` varchar(191) NOT NULL,
  `items` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`items`)),
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `procedure_files`
--

CREATE TABLE `procedure_files` (
  `id` varchar(191) NOT NULL,
  `procedureId` varchar(191) NOT NULL,
  `fileUrl` text NOT NULL,
  `fileType` varchar(191) NOT NULL,
  `fileName` varchar(191) DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `reforms`
--

CREATE TABLE `reforms` (
  `id` varchar(191) NOT NULL,
  `title` varchar(191) NOT NULL,
  `description` text NOT NULL,
  `details` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`details`)),
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `reforms`
--

INSERT INTO `reforms` (`id`, `title`, `description`, `details`, `createdAt`, `updatedAt`) VALUES
('581c632e-7543-41d1-b300-5ba5d70db8d7', 'Công khai thông tin chất lượng giáo dục thực tế của Trung tâm Anh ngữ Mỹ Úc năm học 2024-2025', 'Kèm theo Thông tư 09/2024/TT-BGDĐT ngày 03 tháng 06 năm 2024 của Bộ giáo dục và Đào tạo', '[\"Thông tin về kết quả đánh giá và kiểm định chất lượng giáo dục.\"]', '2025-11-24 16:40:57.253', '2025-11-24 16:40:57.253'),
('8324eb37-f218-4ae3-9f6b-549879480542', 'Thông tin cơ sở vật chất của Trung tâm Anh ngữ Mỹ Úc năm học 2025-2026', 'Thông tin về cơ sở vật chất và tài liệu học tập sử dụng chung.', '[\"Thông tin về cơ sở vật chất và tài liệu học tập sử dụng chung.\"]', '2025-11-24 16:38:05.443', '2025-11-24 16:38:05.443'),
('922796c6-40a6-4134-93be-aac231960c1a', 'Thông tin về đội ngũ nhà giáo, cán bộ quản lý và nhân viên của Trung tâm Anh ngữ Mỹ Úc năm học 2025-2026.', 'Thông tin về đội ngũ giáo viên, cán bộ quản lý và nhân viên.', '[\"Thông tin về đội ngũ giáo viên, cán bộ quản lý và nhân viên.\"]', '2025-11-24 16:35:34.672', '2025-11-24 16:36:23.404');

-- --------------------------------------------------------

--
-- Table structure for table `reform_files`
--

CREATE TABLE `reform_files` (
  `id` varchar(191) NOT NULL,
  `fileUrl` varchar(191) NOT NULL,
  `fileType` varchar(191) NOT NULL,
  `order` int(11) NOT NULL DEFAULT 0,
  `reformId` varchar(191) NOT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `reform_files`
--

INSERT INTO `reform_files` (`id`, `fileUrl`, `fileType`, `order`, `reformId`, `createdAt`, `updatedAt`) VALUES
('279be508-80ac-44df-aaa5-e007b58d8e87', 'https://res.cloudinary.com/ddkwerwzg/image/upload/v1764002138/reforms/ttpnaiefxld1yotiiyum.jpg', 'image', 0, '922796c6-40a6-4134-93be-aac231960c1a', '2025-11-24 16:35:39.823', '2025-11-24 16:35:39.823'),
('4421e283-27cf-4daf-a5fb-b97e4bb8f9a2', 'https://res.cloudinary.com/ddkwerwzg/image/upload/v1764002295/reforms/vmo1nfmface0jju4z1zu.jpg', 'image', 1, '8324eb37-f218-4ae3-9f6b-549879480542', '2025-11-24 16:38:16.896', '2025-11-24 16:38:16.896'),
('62785f58-c702-4399-91bd-01c860baa174', 'https://res.cloudinary.com/ddkwerwzg/image/upload/v1764002290/reforms/zebwdi3faczq62isfb6o.jpg', 'image', 0, '8324eb37-f218-4ae3-9f6b-549879480542', '2025-11-24 16:38:12.431', '2025-11-24 16:38:12.431'),
('db936a4b-b4d5-4b20-ae71-8c1e52df24af', 'https://res.cloudinary.com/ddkwerwzg/image/upload/v1764002461/reforms/unckj5lupzrxjxiw2e9o.jpg', 'image', 0, '581c632e-7543-41d1-b300-5ba5d70db8d7', '2025-11-24 16:41:03.189', '2025-11-24 16:41:03.189');

-- --------------------------------------------------------

--
-- Table structure for table `tuitions`
--

CREATE TABLE `tuitions` (
  `id` varchar(191) NOT NULL,
  `type` varchar(191) NOT NULL,
  `description` text DEFAULT NULL,
  `grade` varchar(191) DEFAULT NULL,
  `level` varchar(191) DEFAULT NULL,
  `tuition` varchar(191) DEFAULT NULL,
  `discount` varchar(191) DEFAULT NULL,
  `period` varchar(191) DEFAULT NULL,
  `date` datetime(3) DEFAULT NULL,
  `months` varchar(191) DEFAULT NULL,
  `name` varchar(191) NOT NULL,
  `typeFee` varchar(191) DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `tuitions`
--

INSERT INTO `tuitions` (`id`, `type`, `description`, `grade`, `level`, `tuition`, `discount`, `period`, `date`, `months`, `name`, `typeFee`, `createdAt`, `updatedAt`) VALUES
('2da00107-2bed-4b53-b9f5-cd5012ddb969', 'fee', 'Bảo hiểm y tế bắt buộc cho học sinh', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Bảo hiểm y tế học sinh', 'included', '2025-11-09 02:30:25.443', '2025-11-09 02:30:25.443'),
('304b9001-6f3f-4d48-af0b-51244e4224df', 'fee', 'Chi phí sách giáo khoa và vở bài tập', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Sách giáo khoa', 'notIncluded', '2025-11-09 02:30:25.443', '2025-11-09 02:30:25.443'),
('3e38fc0f-a996-47f9-b5d8-f606256305dc', 'grade', 'Học phí cho học sinh lớp 6', 'Lớp 6', 'middle', '2,000,000 VNĐ/tháng', NULL, NULL, NULL, NULL, 'Học phí lớp 6', NULL, '2025-11-09 02:30:25.442', '2025-11-09 02:30:25.442'),
('4607f195-e8a7-4e5a-b3e8-d9e391c00d9e', 'schedule', 'Thời gian đóng học phí học kỳ 1 năm học 2024-2025', NULL, NULL, NULL, NULL, 'Học kỳ 1', '2024-09-15 00:00:00.000', 'Tháng 9-12/2024', 'Lịch đóng học phí học kỳ 1', NULL, '2025-11-09 02:30:25.443', '2025-11-09 02:30:25.443'),
('6439b317-4bb5-4bbb-840a-2833b495b2ed', 'grade', 'Học phí cho học sinh lớp 1', 'Lớp 1', 'elementary', '1,500,000 VNĐ/tháng', NULL, NULL, NULL, NULL, 'Học phí lớp 1', NULL, '2025-11-09 02:30:25.442', '2025-11-09 02:30:25.442'),
('67b5e8dd-c3ce-43d8-a68b-2151bbf3a2e3', 'schedule', 'Thời gian đóng học phí học kỳ 2 năm học 2024-2025', NULL, NULL, NULL, NULL, 'Học kỳ 2', '2025-01-15 00:00:00.000', 'Tháng 1-5/2025', 'Lịch đóng học phí học kỳ 2', NULL, '2025-11-09 02:30:25.443', '2025-11-09 02:30:25.443'),
('74a7fa1e-d231-4670-84a8-7187021edc1c', 'discount', 'Giảm 30% học phí cho học sinh đạt danh hiệu học sinh giỏi', NULL, NULL, NULL, '30%', NULL, NULL, NULL, 'Giảm học phí học sinh giỏi', NULL, '2025-11-09 02:30:25.443', '2025-11-09 02:30:25.443'),
('977d2614-057e-40b3-b83f-c86b2f5fa27b', 'fee', 'Chi phí bữa ăn trưa tại trường', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Tiền ăn trưa', 'notIncluded', '2025-11-09 02:30:25.443', '2025-11-09 02:30:25.443'),
('b49e9245-3a80-4893-b58f-51ec22c0a1d0', 'discount', 'Giảm 50% học phí cho con em cán bộ giáo viên', NULL, NULL, NULL, '50%', NULL, NULL, NULL, 'Giảm học phí con CBGV', NULL, '2025-11-09 02:30:25.442', '2025-11-09 02:30:25.442'),
('f8ebf9d9-cbf8-41f0-9de2-95622e9acae5', 'grade', 'Học phí cho học sinh lớp 2', 'Lớp 2', 'elementary', '1,500,000 VNĐ/tháng', NULL, NULL, NULL, NULL, 'Học phí lớp 2', NULL, '2025-11-09 02:30:25.442', '2025-11-09 02:30:25.442');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` varchar(191) NOT NULL,
  `name` varchar(191) NOT NULL,
  `email` varchar(191) NOT NULL,
  `password` varchar(191) NOT NULL,
  `role` varchar(191) NOT NULL DEFAULT 'admin',
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `name`, `email`, `password`, `role`, `createdAt`, `updatedAt`) VALUES
('3675eaaf-7c35-4e0f-9929-7c860cfa73a9', 'Administrator', 'admin@amis.edu.vn', '$2b$12$Y8YxCQ5riBomeQ7GOD.5yuVFqCI6pp5yD/g2RaTA8THKlY8f/Go2i', 'admin', '2025-11-08 17:04:30.834', '2025-11-23 13:36:02.730');

-- --------------------------------------------------------

--
-- Table structure for table `_prisma_migrations`
--

CREATE TABLE `_prisma_migrations` (
  `id` varchar(36) NOT NULL,
  `checksum` varchar(64) NOT NULL,
  `finished_at` datetime(3) DEFAULT NULL,
  `migration_name` varchar(255) NOT NULL,
  `logs` text DEFAULT NULL,
  `rolled_back_at` datetime(3) DEFAULT NULL,
  `started_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `applied_steps_count` int(10) UNSIGNED NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `_prisma_migrations`
--

INSERT INTO `_prisma_migrations` (`id`, `checksum`, `finished_at`, `migration_name`, `logs`, `rolled_back_at`, `started_at`, `applied_steps_count`) VALUES
('28b1da30-1e72-4ad3-8dd0-f9e36739e872', 'c21bc8bf64e06eb83f95b791dfc11380dad267a472dc13fc444781af39c5d501', '2025-11-08 16:39:46.469', '20251108163946_init', NULL, NULL, '2025-11-08 16:39:46.297', 1),
('42da69bc-556e-4c91-aad8-a7aadb99a586', '3a70e4368ef22af1a3558bf1e67520e822381408806f20ef7ecf7843f9302c30', '2025-11-24 04:08:35.497', '20251124040835_add_procedures_tables', NULL, NULL, '2025-11-24 04:08:35.413', 1),
('56f0cad8-ad90-4b48-8de9-efcea4cb1758', '1e25d5f696396c6e1e9b1cc76996c28af30a7d223e6276ff8b770bc0cb48af30', '2025-11-24 09:32:46.789', '20251124093246_add_news_models', NULL, NULL, '2025-11-24 09:32:46.740', 1),
('78f38e4d-d381-4552-a644-bebb946d4d01', '4813af979d42eb7767554bb08dc2a00681528f2876074e0f4667cf9a9a8d477f', '2025-11-23 14:50:37.225', '20251123145037_add_document_categories', NULL, NULL, '2025-11-23 14:50:37.192', 1),
('858b58e7-c021-4ca3-840c-65e6c9bdc1fe', '89a759c571d2d30432533b91e4ea020f210e7e5c18539b81bae18c3e5a9d552a', '2025-11-24 04:24:20.091', '20251124042420_remove_icon_isactive_order_from_procedures', NULL, NULL, '2025-11-24 04:24:20.056', 1),
('cc5b81d4-13c9-4674-a653-8fca56c303bb', '15c6ec080efe5ad87a3d3d4922e73a9c0007d63acf9cf069a6b7871c93dff265', '2025-11-23 15:09:57.535', '20251123150957_remove_order_from_document_categories', NULL, NULL, '2025-11-23 15:09:57.520', 1),
('ccbf21a7-9100-4993-b775-53b522845083', '9dba0df266a0500cf047e108009f96e1d89a55b7c46bd31fddd937b5b41f121f', '2025-11-23 16:39:09.095', '20251123163908_add_reforms_and_reform_files', NULL, NULL, '2025-11-23 16:39:08.989', 1),
('f374caad-099f-4335-93e2-2086dd9db232', 'ffc96de6f0e497039e9b211c6968a35fe7b56bde8b185fd31b0bf9027b0828fb', '2025-11-23 13:46:23.995', '20251113064522_add_document_file_table', NULL, NULL, '2025-11-23 13:46:23.900', 1);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `activities`
--
ALTER TABLE `activities`
  ADD PRIMARY KEY (`id`),
  ADD KEY `activities_categoryId_idx` (`categoryId`),
  ADD KEY `activities_date_idx` (`date`);

--
-- Indexes for table `activity_categories`
--
ALTER TABLE `activity_categories`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `activity_categories_name_key` (`name`),
  ADD KEY `activity_categories_name_idx` (`name`);

--
-- Indexes for table `documents`
--
ALTER TABLE `documents`
  ADD PRIMARY KEY (`id`),
  ADD KEY `documents_type_idx` (`type`),
  ADD KEY `documents_field_idx` (`field`),
  ADD KEY `documents_date_idx` (`date`);

--
-- Indexes for table `document_categories`
--
ALTER TABLE `document_categories`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `document_categories_name_type_key` (`name`,`type`),
  ADD KEY `document_categories_type_idx` (`type`);

--
-- Indexes for table `document_files`
--
ALTER TABLE `document_files`
  ADD PRIMARY KEY (`id`),
  ADD KEY `document_files_documentId_idx` (`documentId`);

--
-- Indexes for table `news`
--
ALTER TABLE `news`
  ADD PRIMARY KEY (`id`),
  ADD KEY `news_category_idx` (`category`),
  ADD KEY `news_date_idx` (`date`);

--
-- Indexes for table `news_images`
--
ALTER TABLE `news_images`
  ADD PRIMARY KEY (`id`),
  ADD KEY `news_images_newsId_idx` (`newsId`),
  ADD KEY `news_images_order_idx` (`order`);

--
-- Indexes for table `procedures`
--
ALTER TABLE `procedures`
  ADD PRIMARY KEY (`id`),
  ADD KEY `procedures_category_idx` (`category`);

--
-- Indexes for table `procedure_contents`
--
ALTER TABLE `procedure_contents`
  ADD PRIMARY KEY (`id`),
  ADD KEY `procedure_contents_procedureId_idx` (`procedureId`);

--
-- Indexes for table `procedure_files`
--
ALTER TABLE `procedure_files`
  ADD PRIMARY KEY (`id`),
  ADD KEY `procedure_files_procedureId_idx` (`procedureId`);

--
-- Indexes for table `reforms`
--
ALTER TABLE `reforms`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `reform_files`
--
ALTER TABLE `reform_files`
  ADD PRIMARY KEY (`id`),
  ADD KEY `reform_files_reformId_idx` (`reformId`);

--
-- Indexes for table `tuitions`
--
ALTER TABLE `tuitions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `tuitions_type_idx` (`type`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `users_email_key` (`email`);

--
-- Indexes for table `_prisma_migrations`
--
ALTER TABLE `_prisma_migrations`
  ADD PRIMARY KEY (`id`);

--
-- Constraints for dumped tables
--

--
-- Constraints for table `activities`
--
ALTER TABLE `activities`
  ADD CONSTRAINT `activities_categoryId_fkey` FOREIGN KEY (`categoryId`) REFERENCES `activity_categories` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `document_files`
--
ALTER TABLE `document_files`
  ADD CONSTRAINT `document_files_documentId_fkey` FOREIGN KEY (`documentId`) REFERENCES `documents` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `news_images`
--
ALTER TABLE `news_images`
  ADD CONSTRAINT `news_images_newsId_fkey` FOREIGN KEY (`newsId`) REFERENCES `news` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `procedure_contents`
--
ALTER TABLE `procedure_contents`
  ADD CONSTRAINT `procedure_contents_procedureId_fkey` FOREIGN KEY (`procedureId`) REFERENCES `procedures` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `procedure_files`
--
ALTER TABLE `procedure_files`
  ADD CONSTRAINT `procedure_files_procedureId_fkey` FOREIGN KEY (`procedureId`) REFERENCES `procedures` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `reform_files`
--
ALTER TABLE `reform_files`
  ADD CONSTRAINT `reform_files_reformId_fkey` FOREIGN KEY (`reformId`) REFERENCES `reforms` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
