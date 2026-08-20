-- phpMyAdmin SQL Dump
-- version 5.2.2
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1:3306
-- Generation Time: Aug 20, 2026 at 11:31 AM
-- Server version: 11.8.8-MariaDB-log
-- PHP Version: 7.2.34

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `u960828787_csc`
--

-- --------------------------------------------------------

--
-- Table structure for table `activity_logs`
--

CREATE TABLE `activity_logs` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `user_id` bigint(20) UNSIGNED DEFAULT NULL,
  `activity_type` varchar(255) NOT NULL,
  `description` text NOT NULL,
  `ip_address` varchar(255) DEFAULT NULL,
  `user_agent` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `birth_records`
--

CREATE TABLE `birth_records` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `user_id` bigint(20) UNSIGNED DEFAULT NULL,
  `district` varchar(255) NOT NULL,
  `father_name` varchar(255) NOT NULL,
  `mother_name` varchar(255) NOT NULL,
  `permanent_address` text NOT NULL,
  `issuing_authority` varchar(255) NOT NULL,
  `record_year` varchar(255) NOT NULL,
  `registration_no` varchar(255) NOT NULL,
  `date_of_registration` date NOT NULL,
  `record_father_name` varchar(255) DEFAULT NULL,
  `record_mother_name` varchar(255) DEFAULT NULL,
  `child_name` varchar(255) NOT NULL,
  `gender` varchar(255) NOT NULL,
  `dob` date NOT NULL,
  `address_parents_birth` text NOT NULL,
  `school_child_name` varchar(255) DEFAULT NULL,
  `school_dob` date DEFAULT NULL,
  `school_father_name` varchar(255) DEFAULT NULL,
  `school_mother_name` varchar(255) DEFAULT NULL,
  `father_aadhar` varchar(255) DEFAULT NULL,
  `mother_aadhar` varchar(255) DEFAULT NULL,
  `child_document` varchar(255) DEFAULT NULL,
  `other_children` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`other_children`)),
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `birth_records`
--

INSERT INTO `birth_records` (`id`, `user_id`, `district`, `father_name`, `mother_name`, `permanent_address`, `issuing_authority`, `record_year`, `registration_no`, `date_of_registration`, `record_father_name`, `record_mother_name`, `child_name`, `gender`, `dob`, `address_parents_birth`, `school_child_name`, `school_dob`, `school_father_name`, `school_mother_name`, `father_aadhar`, `mother_aadhar`, `child_document`, `other_children`, `created_at`, `updated_at`) VALUES
(1, 9, 'Panipat', 'Abhishek', 'Sonam', 'Kuldeep Nagar Panipat', 'civil hospital Panipat', '2025', 'B202506900640001745', '2025-03-03', 'ABHISHEK', 'Sonam', 'Ishika', 'Female', '2025-02-21', 'Kuldeep Nagar Panipat', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '[]', '2026-06-09 14:27:38', '2026-06-09 14:27:38'),
(2, 9, 'Panipat', 'MOBIN', 'MUSKAN', 'new jagdish nagar kutani road panipat 132103', 'municipal corporation panipat', '2026', 'B20260690066000270', '2025-12-18', 'MOBIN', 'MUSKAN', 'AMAN', 'Male', '2025-12-18', 'new jagdish nagar kutani road panipat 132103', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '[]', '2026-06-17 12:50:13', '2026-06-17 12:54:17'),
(3, 9, 'Panipat', 'SANJAY KUMAR', 'MAMTA', 'KUTANI ROAD PANIPAT', 'MUNICUPAL CORPORATION PANIPAT', '2008', '408', '2008-01-16', 'SANJAY', 'MAMTA', 'ROHIT', 'Male', '2007-12-27', 'KUTANI ROAD PANIPAT', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '[]', '2026-06-20 11:51:14', '2026-06-20 11:51:14'),
(4, 9, 'panipat', 'satyam verma', 'upma', '6292 new jagdish nagar kutani road panipat', 'PULSE HOSPITAL NAGAR PALIKA UNNAO', '2026', 'NA', '2026-05-17', 'SATYAM VERMA', 'UPMA', 'Advika', 'Female', '2026-05-17', 'NEW JAGDISH NAGAR KUTANI ROAD PANIPAT', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '[]', '2026-06-30 13:09:06', '2026-06-30 13:09:06'),
(5, 9, 'Panipat', 'Dharmender', 'Manisha', 'tahrmal panipat', 'MC PANIPAT', '2006', '2704', '2006-04-17', 'DHARMENDER', 'MANISHA', 'KIRTI', 'Female', '2006-04-04', '1628 DHARMAL PANIPAT', 'kirti', '2006-04-04', 'dharmbir', 'manisha', NULL, NULL, NULL, '[]', '2026-07-07 09:41:48', '2026-07-07 09:41:48'),
(6, 9, 'Panipat', 'Deepak', 'Chakshika', 'Mastana Chowk, Panipat', 'MC PANIPAT', '2026', '03491', '2026-04-03', 'DEEPAK', 'Chakshika', 'Rudransh Verma', 'Male', '2026-04-03', 'Mastana Chowk, Panipat', 'Mastana Chowk, Panipat', '2026-04-03', 'DEEPAK', 'Chakshika', NULL, NULL, NULL, '[]', '2026-07-10 10:02:06', '2026-07-10 10:02:06'),
(7, 1, 'Panipat', 'Satpal', 'Munesh', '293/6 quila', 'Nahar nigam', '2019', '456789', '1991-03-18', 'Samu', 'AAUMi', 'Ravi', 'Male', '1995-11-03', 'Incidunt tempora ac', 'Shannon Mason', '1971-11-11', 'Colton Weber', 'Kuame Middleton', NULL, NULL, NULL, '[]', '2026-08-04 19:48:35', '2026-08-04 19:48:35'),
(8, 9, 'Panipat', 'Sagar', 'Aruna', 'Panipat', 'chc bapoli', '2026', 'B202606001370000276', '2026-03-21', 'Sagar', 'Aruna', 'Vaishnavi', 'Female', '2026-03-21', 'Panipat', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '[]', '2026-08-12 17:13:46', '2026-08-12 17:13:46'),
(9, 9, 'Panipat', 'Satpal', 'Kusum', 'Kutani Panipat', 'MC Panipat', '2014', '3414', '2014-03-03', 'Satpal', 'Kusum', 'Dev', 'Male', '2014-03-03', 'Kutani Panipat', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '[]', '2026-08-17 13:30:45', '2026-08-17 13:30:45');

-- --------------------------------------------------------

--
-- Table structure for table `cache`
--

CREATE TABLE `cache` (
  `key` varchar(255) NOT NULL,
  `value` mediumtext NOT NULL,
  `expiration` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `cache_locks`
--

CREATE TABLE `cache_locks` (
  `key` varchar(255) NOT NULL,
  `owner` varchar(255) NOT NULL,
  `expiration` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `coin_purchase_requests`
--

CREATE TABLE `coin_purchase_requests` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `package_amount` int(11) NOT NULL,
  `coins_requested` int(11) NOT NULL,
  `utr_number` varchar(255) DEFAULT NULL,
  `payment_screenshot` varchar(255) DEFAULT NULL,
  `status` enum('pending','approved','rejected') NOT NULL DEFAULT 'pending',
  `admin_notes` text DEFAULT NULL,
  `approved_by` bigint(20) UNSIGNED DEFAULT NULL,
  `approved_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `coin_purchase_requests`
--

INSERT INTO `coin_purchase_requests` (`id`, `user_id`, `package_amount`, `coins_requested`, `utr_number`, `payment_screenshot`, `status`, `admin_notes`, `approved_by`, `approved_at`, `created_at`, `updated_at`) VALUES
(1, 9, 100, 100, 'N/A', 'coin-requests/cLN4jp2xGMa4RVhY9HZn2ftvDxqpffKl1tEZBBK1.png', 'approved', NULL, 1, '2026-05-14 06:08:41', '2026-05-14 06:07:46', '2026-05-14 06:08:41'),
(2, 13, 49, 49, NULL, 'coin-screenshots/yqvqgqCyPsZCXEbeNXb8q0ZZ9MdCPFIoviEDMsfE.jpg', 'rejected', 'MULTI', NULL, NULL, '2026-08-12 14:43:18', '2026-08-12 14:53:10'),
(3, 13, 49, 49, NULL, 'coin-screenshots/eRDBVeijIGHTeAnN8HpU9IcqvIAWtwRbwtOgeNPw.jpg', 'approved', NULL, 1, '2026-08-12 14:53:13', '2026-08-12 14:43:22', '2026-08-12 14:53:13'),
(4, 13, 49, 49, NULL, 'coin-screenshots/1bs8tswOGKJJlTxScVszJTHFwpY7wDYIDtg5RK3h.jpg', 'approved', NULL, 1, '2026-08-12 14:53:15', '2026-08-12 14:48:21', '2026-08-12 14:53:15'),
(6, 13, 49, 49, NULL, 'coin-screenshots/bKdz4LrpnROr8GumkY3FVhdSEeDU2vgPQ7EeadiO.png', 'approved', NULL, 1, '2026-08-12 15:05:00', '2026-08-12 15:04:47', '2026-08-12 15:05:00'),
(7, 15, 799, 959, NULL, 'coin-screenshots/12i8Qi2WSE0mrRUD2bQgolHc45UCxPYT8j8laBRj.png', 'rejected', NULL, NULL, NULL, '2026-08-13 16:57:48', '2026-08-13 16:58:09'),
(8, 15, 799, 959, NULL, 'coin-screenshots/8cjf8V5OPpLih9MDw0HZipq2Ceq6aubBTBVZSUG7.png', 'rejected', NULL, NULL, NULL, '2026-08-13 16:57:50', '2026-08-13 16:58:14'),
(9, 15, 799, 959, NULL, 'coin-screenshots/iwcHEd8JU4p3MqzPnk8fsvYq0vQaJLFNcRLpqVxs.png', 'rejected', NULL, NULL, NULL, '2026-08-13 16:57:51', '2026-08-13 16:58:11'),
(10, 15, 799, 959, NULL, 'coin-screenshots/TXDcFU8KmsuG4aSWY0ehutlukiihVpmH0cBhygmH.png', 'rejected', NULL, NULL, NULL, '2026-08-13 16:57:51', '2026-08-13 16:58:12'),
(11, 15, 799, 959, NULL, 'coin-screenshots/qeu1JT8otA7yQrp5hfZgkp2vgY06qKAUNyBRnUAV.png', 'approved', NULL, 1, '2026-08-13 16:58:21', '2026-08-13 16:57:52', '2026-08-13 16:58:21'),
(12, 15, 799, 959, NULL, 'coin-screenshots/tw3ITKNCbB9GURIXr9upx9Gt9JbCyC2TLAan1YVo.png', 'approved', NULL, 1, '2026-08-13 16:58:20', '2026-08-13 16:57:52', '2026-08-13 16:58:20'),
(13, 15, 99, 105, NULL, 'coin-screenshots/PnGFEF0p8LjHoTWth0ApaCsg0g6rM8xTLvwtyqAr.png', 'rejected', NULL, NULL, NULL, '2026-08-13 17:05:03', '2026-08-13 17:05:41'),
(14, 15, 799, 959, NULL, 'coin-screenshots/CJrSOratQKTH5IRPbKLGRNI9pkx5yvwWnxGg6Nqv.png', 'approved', NULL, 1, '2026-08-14 16:08:49', '2026-08-14 14:20:35', '2026-08-14 16:08:49'),
(15, 15, 799, 959, NULL, 'coin-screenshots/F8FlvrdyyDRHsqoxZxQnk2PyPjJVrltrZllJ6yaC.png', 'approved', NULL, 1, '2026-08-14 16:08:48', '2026-08-14 14:20:39', '2026-08-14 16:08:48'),
(16, 15, 799, 959, NULL, 'coin-screenshots/CZbiZEFk8obcIVnatJKFmHC5zKPOsKzy71dtvkwO.png', 'approved', NULL, 1, '2026-08-14 16:08:46', '2026-08-14 14:20:40', '2026-08-14 16:08:46'),
(17, 15, 799, 959, NULL, 'coin-screenshots/6RyzGktU0Ei68UFa6kABEGa1P6EMkiZ0i9RR0yQa.png', 'approved', NULL, 1, '2026-08-14 16:08:45', '2026-08-14 14:20:41', '2026-08-14 16:08:45'),
(18, 15, 799, 959, NULL, 'coin-screenshots/3NF9BsXQvvMR9dsbiRrnSkywZYj4dcOJa0Dr43hO.png', 'approved', NULL, 1, '2026-08-14 16:08:43', '2026-08-14 14:20:42', '2026-08-14 16:08:43'),
(19, 15, 799, 959, NULL, 'coin-screenshots/CbQ0dyffTyXikHCAlPASgx4jY0CqnGteF4hTYSUJ.png', 'approved', NULL, 1, '2026-08-14 16:08:42', '2026-08-14 14:20:42', '2026-08-14 16:08:42'),
(20, 15, 799, 959, NULL, 'coin-screenshots/KUvkz9J3hgwjqPb7tR1RlXtqKqvweCYAnpuU5W8q.png', 'approved', NULL, 1, '2026-08-14 16:08:40', '2026-08-14 14:20:43', '2026-08-14 16:08:40'),
(21, 23, 99, 105, NULL, 'coin-screenshots/b6Bm33ZDcUV9pk1sAOsJWIs2HjN1sP0Keay0WcFD.pdf', 'approved', NULL, 1, '2026-08-17 13:36:25', '2026-08-17 13:36:08', '2026-08-17 13:36:25'),
(22, 27, 49, 49, NULL, 'coin-screenshots/72700Ucm4U9KGUq6F1sk4px1kwlMjNO5qNSW2U73.jpg', 'approved', NULL, 1, '2026-08-18 14:30:18', '2026-08-18 14:30:07', '2026-08-18 14:30:18'),
(23, 28, 199, 219, NULL, 'coin-screenshots/W1LLv1xD4Yd7x68hd66aYfmy1iyzFmfCAGbO3JEx.jpg', 'approved', NULL, 1, '2026-08-19 17:10:27', '2026-08-19 13:48:58', '2026-08-19 17:10:27'),
(24, 29, 49, 49, NULL, 'coin-screenshots/mHf7Tv86R5mJhS95rzOebrUaTJvUuu7JMJBxQUWS.png', 'approved', NULL, 1, '2026-08-19 17:15:14', '2026-08-19 17:15:07', '2026-08-19 17:15:14');

-- --------------------------------------------------------

--
-- Table structure for table `coin_transactions`
--

CREATE TABLE `coin_transactions` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `amount` bigint(20) NOT NULL,
  `balance_after` bigint(20) NOT NULL,
  `type` enum('purchase','admin_credit','service_deduction','refund') NOT NULL,
  `coin_type` enum('trial','paid') DEFAULT NULL,
  `service_type` varchar(255) DEFAULT NULL,
  `service_id` bigint(20) UNSIGNED DEFAULT NULL,
  `description` text NOT NULL,
  `created_by` bigint(20) UNSIGNED DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `coin_transactions`
--

INSERT INTO `coin_transactions` (`id`, `user_id`, `amount`, `balance_after`, `type`, `coin_type`, `service_type`, `service_id`, `description`, `created_by`, `created_at`, `updated_at`) VALUES
(1, 1, 999999, 1009999, 'admin_credit', NULL, NULL, NULL, 'Added by Admin', 1, '2026-05-12 18:58:56', '2026-05-12 18:58:56'),
(11, 8, 1000, 1000, 'admin_credit', NULL, NULL, NULL, 'Welcome Bonus', 8, '2026-05-13 09:43:09', '2026-05-13 09:43:09'),
(12, 9, 100, 150, 'purchase', NULL, NULL, NULL, 'Coin Purchase - 100 Coins', 1, '2026-05-14 06:08:41', '2026-05-14 06:08:41'),
(13, 9, 10000000, 10000150, 'admin_credit', NULL, NULL, NULL, 'Added by Admin', 1, '2026-05-16 15:07:53', '2026-05-16 15:07:53'),
(14, 9, -20, 10000130, 'service_deduction', NULL, NULL, NULL, 'Created Record: Haryana Domicile', 9, '2026-05-16 15:11:58', '2026-05-16 15:11:58'),
(15, 9, -20, 10000110, 'service_deduction', NULL, NULL, NULL, 'Created Record: Haryana Domicile', 9, '2026-05-16 15:24:57', '2026-05-16 15:24:57'),
(16, 9, -20, 10000090, 'service_deduction', NULL, NULL, NULL, 'Created Record: Haryana Domicile', 9, '2026-05-16 15:26:46', '2026-05-16 15:26:46'),
(17, 9, -20, 10000070, 'service_deduction', NULL, NULL, NULL, 'Created Record: Haryana Domicile', 9, '2026-05-16 15:27:56', '2026-05-16 15:27:56'),
(18, 9, -20, 10000050, 'service_deduction', NULL, NULL, NULL, 'Created Record: Haryana Domicile', 9, '2026-05-18 04:56:20', '2026-05-18 04:56:20'),
(19, 9, -20, 10000030, 'service_deduction', NULL, NULL, NULL, 'Created Record: Haryana Domicile', 9, '2026-05-21 14:12:14', '2026-05-21 14:12:14'),
(20, 9, -20, 10000010, 'service_deduction', NULL, NULL, NULL, 'Created Record: Haryana Domicile', 9, '2026-05-21 14:13:54', '2026-05-21 14:13:54'),
(21, 9, -20, 9999990, 'service_deduction', NULL, NULL, NULL, 'Created Record: Haryana Domicile', 9, '2026-05-23 15:44:52', '2026-05-23 15:44:52'),
(22, 9, -20, 9999970, 'service_deduction', NULL, NULL, NULL, 'Created Record: Haryana Domicile', 9, '2026-05-26 14:05:02', '2026-05-26 14:05:02'),
(23, 9, -20, 9999950, 'service_deduction', NULL, NULL, NULL, 'Created Record: Haryana Domicile', 9, '2026-05-26 14:06:26', '2026-05-26 14:06:26'),
(24, 9, -20, 9999930, 'service_deduction', NULL, NULL, NULL, 'Created Record: Haryana Domicile', 9, '2026-05-26 14:57:05', '2026-05-26 14:57:05'),
(25, 9, -20, 9999910, 'service_deduction', NULL, NULL, NULL, 'Created Record: Birth Record', 9, '2026-06-09 14:27:38', '2026-06-09 14:27:38'),
(26, 9, -20, 9999890, 'service_deduction', NULL, NULL, NULL, 'Created Record: Birth Record', 9, '2026-06-17 12:50:13', '2026-06-17 12:50:13'),
(27, 9, -20, 9999870, 'service_deduction', NULL, NULL, NULL, 'Created Record: Birth Record', 9, '2026-06-20 11:51:14', '2026-06-20 11:51:14'),
(28, 9, -20, 9999850, 'service_deduction', NULL, NULL, NULL, 'Created Record: Haryana Domicile', 9, '2026-06-23 05:43:19', '2026-06-23 05:43:19'),
(29, 9, -20, 9999830, 'service_deduction', NULL, NULL, NULL, 'Created Record: Haryana Domicile', 9, '2026-06-23 05:47:04', '2026-06-23 05:47:04'),
(30, 9, -30, 9999800, 'service_deduction', NULL, NULL, NULL, 'Vehicle Detail Request - No: HR06AB2200', 9, '2026-06-30 08:03:54', '2026-06-30 08:03:54'),
(31, 9, -20, 9999780, 'service_deduction', NULL, NULL, NULL, 'Created Record: Haryana Domicile', 9, '2026-06-30 08:07:28', '2026-06-30 08:07:28'),
(32, 9, -20, 9999760, 'service_deduction', NULL, NULL, NULL, 'Created Record: Birth Record', 9, '2026-06-30 13:09:06', '2026-06-30 13:09:06'),
(33, 9, -20, 9999740, 'service_deduction', NULL, NULL, NULL, 'Created Record: Haryana Domicile', 9, '2026-06-30 15:34:44', '2026-06-30 15:34:44'),
(34, 9, -20, 9999720, 'service_deduction', NULL, NULL, NULL, 'Created Record: Haryana Domicile', 9, '2026-06-30 15:36:17', '2026-06-30 15:36:17'),
(35, 9, -20, 9999700, 'service_deduction', NULL, NULL, NULL, 'Created Record: Haryana Domicile', 9, '2026-07-02 07:42:39', '2026-07-02 07:42:39'),
(36, 9, -20, 9999680, 'service_deduction', NULL, NULL, NULL, 'Created Record: Birth Record', 9, '2026-07-07 09:41:48', '2026-07-07 09:41:48'),
(37, 9, -20, 9999660, 'service_deduction', NULL, NULL, NULL, 'Created Record: Haryana Domicile', 9, '2026-07-07 16:06:59', '2026-07-07 16:06:59'),
(38, 9, -20, 9999640, 'service_deduction', NULL, NULL, NULL, 'Created Record: Haryana Domicile', 9, '2026-07-07 16:08:03', '2026-07-07 16:08:03'),
(39, 9, -20, 9999620, 'service_deduction', NULL, NULL, NULL, 'Created Record: Haryana Domicile', 9, '2026-07-07 16:24:27', '2026-07-07 16:24:27'),
(40, 9, -20, 9999600, 'service_deduction', NULL, NULL, NULL, 'Created Record: Haryana Domicile', 9, '2026-07-07 16:35:45', '2026-07-07 16:35:45'),
(41, 9, -20, 9999580, 'service_deduction', NULL, NULL, NULL, 'Created Record: Haryana Domicile', 9, '2026-07-09 06:19:45', '2026-07-09 06:19:45'),
(42, 9, -20, 9999560, 'service_deduction', NULL, NULL, NULL, 'Created Record: Birth Record', 9, '2026-07-10 10:02:06', '2026-07-10 10:02:06'),
(43, 9, -20, 9999540, 'service_deduction', NULL, NULL, NULL, 'Created Record: Haryana Domicile', 9, '2026-07-12 14:22:27', '2026-07-12 14:22:27'),
(44, 9, -20, 9999520, 'service_deduction', NULL, NULL, NULL, 'Created Record: Haryana Domicile', 9, '2026-07-12 14:25:05', '2026-07-12 14:25:05'),
(45, 9, -20, 9999500, 'service_deduction', NULL, NULL, NULL, 'Created Record: Haryana Domicile', 9, '2026-07-12 14:27:18', '2026-07-12 14:27:18'),
(46, 9, -20, 9999480, 'service_deduction', NULL, NULL, NULL, 'Created Record: Haryana Domicile', 9, '2026-07-12 14:29:57', '2026-07-12 14:29:57'),
(47, 9, -20, 9999460, 'service_deduction', NULL, NULL, NULL, 'Created Record: Haryana Domicile', 9, '2026-07-16 14:56:08', '2026-07-16 14:56:08'),
(48, 9, -20, 9999440, 'service_deduction', NULL, NULL, NULL, 'Created Record: Haryana Domicile', 9, '2026-07-16 14:57:24', '2026-07-16 14:57:24'),
(49, 9, -20, 9999420, 'service_deduction', NULL, NULL, NULL, 'Created Record: Haryana Domicile', 9, '2026-07-18 13:58:30', '2026-07-18 13:58:30'),
(50, 9, -20, 9999400, 'service_deduction', NULL, NULL, NULL, 'Created Record: Haryana Domicile', 9, '2026-07-19 08:44:47', '2026-07-19 08:44:47'),
(51, 9, -20, 9999380, 'service_deduction', NULL, NULL, NULL, 'Created Record: Haryana Domicile', 9, '2026-07-19 12:04:10', '2026-07-19 12:04:10'),
(52, 9, -20, 9999360, 'service_deduction', NULL, NULL, NULL, 'Created Record: Haryana Domicile', 9, '2026-07-20 14:30:40', '2026-07-20 14:30:40'),
(53, 9, -20, 9999340, 'service_deduction', NULL, NULL, NULL, 'Created Record: Haryana Domicile', 9, '2026-07-23 15:34:28', '2026-07-23 15:34:28'),
(54, 9, -20, 9999320, 'service_deduction', NULL, NULL, NULL, 'Created Record: Haryana Domicile', 9, '2026-07-23 15:36:10', '2026-07-23 15:36:10'),
(55, 9, -20, 9999300, 'service_deduction', NULL, NULL, NULL, 'Created Record: Haryana Domicile', 9, '2026-07-29 04:43:48', '2026-07-29 04:43:48'),
(56, 9, -20, 9999280, 'service_deduction', NULL, NULL, NULL, 'Created Record: Haryana Domicile', 9, '2026-07-29 12:34:31', '2026-07-29 12:34:31'),
(57, 9, -20, 9999260, 'service_deduction', NULL, NULL, NULL, 'Created Record: Haryana Domicile', 9, '2026-08-01 06:11:07', '2026-08-01 06:11:07'),
(58, 9, -30, 9999230, 'service_deduction', NULL, NULL, NULL, 'Vehicle Owner Request: HR06AQ6025', 9, '2026-08-01 13:24:39', '2026-08-01 13:24:39'),
(59, 9, -20, 9999210, 'service_deduction', NULL, NULL, NULL, 'Created Record: Haryana Domicile', 9, '2026-08-01 15:00:39', '2026-08-01 15:00:39'),
(60, 9, -20, 9999190, 'service_deduction', NULL, NULL, NULL, 'Created Record: Haryana Domicile', 9, '2026-08-04 14:47:19', '2026-08-04 14:47:19'),
(61, 9, -20, 9999170, 'service_deduction', NULL, NULL, NULL, 'Created Record: Haryana Domicile', 9, '2026-08-04 14:48:56', '2026-08-04 14:48:56'),
(62, 1, -20, 11019899, 'service_deduction', NULL, NULL, NULL, 'Created Record: Haryana Domicile', 1, '2026-08-04 19:10:21', '2026-08-04 19:10:21'),
(63, 1, -20, 11019879, 'service_deduction', NULL, NULL, NULL, 'Created Record: Birth Record', 1, '2026-08-04 19:48:35', '2026-08-04 19:48:35'),
(64, 9, -99, 9999031, 'service_deduction', NULL, 'mobile-no-to-aadhar-number', 9, 'Mobile no. To aadhar Number request #9', 9, '2026-08-12 14:37:34', '2026-08-12 14:37:34'),
(65, 13, 49, 49, 'purchase', 'paid', NULL, NULL, 'Coin Purchase - 49 Coins (₹49)', 1, '2026-08-12 14:53:13', '2026-08-12 14:53:13'),
(66, 13, 49, 98, 'purchase', 'paid', NULL, NULL, 'Coin Purchase - 49 Coins (₹49)', 1, '2026-08-12 14:53:15', '2026-08-12 14:53:15'),
(69, 13, 49, 147, 'purchase', 'paid', NULL, NULL, 'Coin Purchase - 49 Coins (₹49)', 1, '2026-08-12 15:05:00', '2026-08-12 15:05:00'),
(70, 13, -99, 48, 'service_deduction', NULL, 'mobile-no-to-aadhar-number', 11, 'Mobile no. To aadhar Number request #11', 13, '2026-08-12 15:05:21', '2026-08-12 15:05:21'),
(71, 9, -19, 9999012, 'service_deduction', NULL, 'birth_record', 8, 'Birth Certificate #8', 9, '2026-08-12 17:13:46', '2026-08-12 17:13:46'),
(72, 9, -9, 9999003, 'service_deduction', NULL, 'passport-size-photo-set-a4-4x6-as-u-req', 12, 'Passport Size Photo Set A4 & 4x6 as u req. request #12', 9, '2026-08-12 17:16:09', '2026-08-12 17:16:09'),
(73, 9, 9, 9999012, 'refund', NULL, NULL, NULL, 'Refund for rejected Passport Size Photo Set A4 & 4x6 as u req. request #12', 1, '2026-08-12 17:16:36', '2026-08-12 17:16:36'),
(74, 9, -30, 9998982, 'service_deduction', NULL, 'haryana_domicile', 53, 'Haryana Domicile #53', 9, '2026-08-13 16:48:30', '2026-08-13 16:48:30'),
(75, 9, -30, 9998952, 'service_deduction', NULL, 'haryana_domicile', 54, 'Haryana Domicile #54', 9, '2026-08-13 16:50:10', '2026-08-13 16:50:10'),
(76, 9, -30, 9998922, 'service_deduction', NULL, 'haryana_domicile', 55, 'Haryana Domicile #55', 9, '2026-08-13 16:51:18', '2026-08-13 16:51:18'),
(77, 9, -30, 9998892, 'service_deduction', NULL, 'haryana_domicile', 56, 'Haryana Domicile #56', 9, '2026-08-13 16:52:24', '2026-08-13 16:52:24'),
(78, 9, -30, 9998862, 'service_deduction', NULL, 'haryana_domicile', 57, 'Haryana Domicile #57', 9, '2026-08-13 16:53:14', '2026-08-13 16:53:14'),
(79, 9, -30, 9998832, 'service_deduction', NULL, 'haryana_domicile', 58, 'Haryana Domicile #58', 9, '2026-08-13 16:54:16', '2026-08-13 16:54:16'),
(80, 9, -30, 9998802, 'service_deduction', NULL, 'haryana_domicile', 59, 'Haryana Domicile #59', 9, '2026-08-13 16:55:28', '2026-08-13 16:55:28'),
(81, 15, 959, 959, 'purchase', 'paid', NULL, NULL, 'Coin Purchase - 959 Coins (₹799)', 1, '2026-08-13 16:58:20', '2026-08-13 16:58:20'),
(82, 15, 959, 1918, 'purchase', 'paid', NULL, NULL, 'Coin Purchase - 959 Coins (₹799)', 1, '2026-08-13 16:58:21', '2026-08-13 16:58:21'),
(83, 15, -299, 1619, 'service_deduction', NULL, 'aadhar-card-address-change', 13, 'Aadhar Card Address Change request #13', 15, '2026-08-13 17:00:09', '2026-08-13 17:00:09'),
(84, 15, -299, 1320, 'service_deduction', NULL, 'aadhar-card-address-change', 14, 'Aadhar Card Address Change request #14', 15, '2026-08-13 17:00:20', '2026-08-13 17:00:20'),
(85, 15, -299, 1021, 'service_deduction', NULL, 'aadhar-card-address-change', 15, 'Aadhar Card Address Change request #15', 15, '2026-08-13 17:00:29', '2026-08-13 17:00:29'),
(86, 15, -299, 722, 'service_deduction', NULL, 'aadhar-card-address-change', 16, 'Aadhar Card Address Change request #16', 15, '2026-08-13 17:00:36', '2026-08-13 17:00:36'),
(87, 15, -299, 423, 'service_deduction', NULL, 'aadhar-card-address-change', 17, 'Aadhar Card Address Change request #17', 15, '2026-08-13 17:00:46', '2026-08-13 17:00:46'),
(88, 15, -299, 124, 'service_deduction', NULL, 'aadhar-card-address-change', 18, 'Aadhar Card Address Change request #18', 15, '2026-08-13 17:00:52', '2026-08-13 17:00:52'),
(89, 15, -99, 25, 'service_deduction', NULL, 'puc-certificate-with-otp', 19, 'Puc Certificate With otp request #19', 15, '2026-08-13 17:01:11', '2026-08-13 17:01:11'),
(90, 15, -9, 16, 'service_deduction', NULL, 'aadhaar-pdf-to-pvc-card-instant', 20, 'Aadhaar Pdf to Pvc Card Instant request #20', 15, '2026-08-13 17:01:29', '2026-08-13 17:01:29'),
(91, 15, -9, 7, 'service_deduction', NULL, 'aadhaar-pdf-to-pvc-card-instant', 21, 'Aadhaar Pdf to Pvc Card Instant request #21', 15, '2026-08-13 17:01:35', '2026-08-13 17:01:35'),
(92, 15, 9, 16, 'refund', NULL, NULL, NULL, 'Refund for rejected Aadhaar Pdf to Pvc Card Instant request #20', 1, '2026-08-13 17:02:16', '2026-08-13 17:02:16'),
(93, 13, 99, 147, 'refund', NULL, NULL, NULL, 'Refund for rejected Mobile no. To aadhar Number request #11', 1, '2026-08-13 17:02:33', '2026-08-13 17:02:33'),
(94, 13, -99, 48, 'service_deduction', NULL, 'mobile-no-to-aadhar-number', 22, 'Sim No. To Aadhar Number request #22', 13, '2026-08-13 21:39:35', '2026-08-13 21:39:35'),
(95, 13, 99, 147, 'refund', NULL, NULL, NULL, 'Refund for rejected Sim No. To Aadhar Number request #22', 1, '2026-08-14 05:37:05', '2026-08-14 05:37:05'),
(96, 9, -30, 9998772, 'service_deduction', NULL, 'haryana_domicile', 60, 'Haryana Domicile #60', 9, '2026-08-14 11:23:43', '2026-08-14 11:23:43'),
(97, 13, -99, 48, 'service_deduction', NULL, 'mobile-no-to-aadhar-number', 23, 'Sim No. To Aadhar Number request #23', 13, '2026-08-14 12:33:36', '2026-08-14 12:33:36'),
(98, 9, -30, 9998742, 'service_deduction', NULL, 'haryana_domicile', 61, 'Haryana Domicile #61', 9, '2026-08-14 13:19:41', '2026-08-14 13:19:41'),
(99, 15, 959, 975, 'purchase', 'paid', NULL, NULL, 'Coin Purchase - 959 Coins (₹799)', 1, '2026-08-14 16:08:40', '2026-08-14 16:08:40'),
(100, 15, 959, 1934, 'purchase', 'paid', NULL, NULL, 'Coin Purchase - 959 Coins (₹799)', 1, '2026-08-14 16:08:42', '2026-08-14 16:08:42'),
(101, 15, 959, 2893, 'purchase', 'paid', NULL, NULL, 'Coin Purchase - 959 Coins (₹799)', 1, '2026-08-14 16:08:43', '2026-08-14 16:08:43'),
(102, 15, 959, 3852, 'purchase', 'paid', NULL, NULL, 'Coin Purchase - 959 Coins (₹799)', 1, '2026-08-14 16:08:45', '2026-08-14 16:08:45'),
(103, 15, 959, 4811, 'purchase', 'paid', NULL, NULL, 'Coin Purchase - 959 Coins (₹799)', 1, '2026-08-14 16:08:46', '2026-08-14 16:08:46'),
(104, 15, 959, 5770, 'purchase', 'paid', NULL, NULL, 'Coin Purchase - 959 Coins (₹799)', 1, '2026-08-14 16:08:48', '2026-08-14 16:08:48'),
(105, 15, 959, 6729, 'purchase', 'paid', NULL, NULL, 'Coin Purchase - 959 Coins (₹799)', 1, '2026-08-14 16:08:49', '2026-08-14 16:08:49'),
(106, 15, -99, 6630, 'service_deduction', NULL, 'mobile-no-to-aadhar-number', 24, 'Sim No. To Aadhar Number request #24', 15, '2026-08-14 16:10:43', '2026-08-14 16:10:43'),
(107, 15, -199, 6431, 'service_deduction', NULL, 'vehicle-number-to-info', 25, 'Vehicle Number to Info request #25', 15, '2026-08-14 16:14:01', '2026-08-14 16:14:01'),
(108, 15, -59, 6372, 'service_deduction', NULL, 'aadhar-to-pan-find-instant', 26, 'Aadhar to Pan Find Instant request #26', 15, '2026-08-14 16:16:00', '2026-08-14 16:16:00'),
(109, 15, 59, 6431, 'refund', NULL, NULL, NULL, 'Refund for rejected Aadhar to Pan Find Instant request #26', 1, '2026-08-14 16:17:14', '2026-08-14 16:17:14'),
(110, 15, -99, 6332, 'service_deduction', NULL, 'pan-to-aadhar', 27, 'Pan To Aadhar request #27', 15, '2026-08-15 06:52:55', '2026-08-15 06:52:55'),
(111, 15, -899, 5433, 'service_deduction', NULL, 'aadhar-number-to-aadhar-pdf', 28, 'Aadhar Number To AADHAR PDF request #28', 15, '2026-08-15 06:56:59', '2026-08-15 06:56:59'),
(112, 15, -3000, 2433, 'service_deduction', NULL, 'marriage-certificate-apply-only-panipat', 29, 'Marriage Certificate Apply only Panipat request #29', 15, '2026-08-15 06:57:55', '2026-08-15 06:57:55'),
(113, 15, -799, 1634, 'service_deduction', NULL, 'aadhar-card-number-to-pdf', 30, 'Aadhar Card Number to Pdf request #30', 15, '2026-08-15 06:58:29', '2026-08-15 06:58:29'),
(114, 15, -9, 1625, 'service_deduction', NULL, 'aadhaar-pdf-to-pvc-card-instant', 31, 'Aadhaar Pdf to Pvc Card Instant request #31', 15, '2026-08-15 06:58:35', '2026-08-15 06:58:35'),
(115, 15, -799, 826, 'service_deduction', NULL, 'aadhar-card-number-to-pdf', 32, 'Aadhar Card Number to Pdf request #32', 15, '2026-08-15 06:58:41', '2026-08-15 06:58:41'),
(116, 15, -799, 27, 'service_deduction', NULL, 'aadhar-card-number-to-pdf', 33, 'Aadhar Card Number to Pdf request #33', 15, '2026-08-15 06:58:43', '2026-08-15 06:58:43'),
(117, 9, -10, 9998732, 'service_deduction', NULL, 'marriage_affidavit', 2, 'New Marriage Certificate #2', 9, '2026-08-15 16:08:44', '2026-08-15 16:08:44'),
(118, 9, -30, 9998702, 'service_deduction', NULL, 'haryana_domicile', 62, 'Haryana Domicile #62', 9, '2026-08-16 08:58:54', '2026-08-16 08:58:54'),
(119, 9, -30, 9998672, 'service_deduction', NULL, 'haryana_domicile', 63, 'Haryana Domicile #63', 9, '2026-08-16 09:05:10', '2026-08-16 09:05:10'),
(120, 9, -30, 9998642, 'service_deduction', NULL, 'haryana_domicile', 64, 'Haryana Domicile #64', 9, '2026-08-16 12:15:49', '2026-08-16 12:15:49'),
(121, 9, -30, 9998612, 'service_deduction', NULL, 'haryana_domicile', 65, 'Haryana Domicile #65', 9, '2026-08-16 16:38:15', '2026-08-16 16:38:15'),
(122, 9, -19, 9998593, 'service_deduction', NULL, 'birth_record', 9, 'Birth Certificate #9', 9, '2026-08-17 13:30:45', '2026-08-17 13:30:45'),
(123, 23, 105, 105, 'purchase', 'paid', NULL, NULL, 'Coin Purchase - 105 Coins (₹99)', 1, '2026-08-17 13:36:25', '2026-08-17 13:36:25'),
(124, 9, -30, 9998563, 'service_deduction', NULL, 'haryana_domicile', 66, 'Haryana Domicile #66', 9, '2026-08-18 12:36:43', '2026-08-18 12:36:43'),
(125, 9, -30, 9998533, 'service_deduction', NULL, 'haryana_domicile', 67, 'Haryana Domicile #67', 9, '2026-08-18 12:38:07', '2026-08-18 12:38:07'),
(126, 9, -30, 9998503, 'service_deduction', NULL, 'haryana_domicile', 68, 'Haryana Domicile #68', 9, '2026-08-18 12:39:32', '2026-08-18 12:39:32'),
(127, 9, -30, 9998473, 'service_deduction', NULL, 'haryana_domicile', 69, 'Haryana Domicile #69', 9, '2026-08-18 12:41:28', '2026-08-18 12:41:28'),
(128, 9, -30, 9998443, 'service_deduction', NULL, 'haryana_domicile', 70, 'Haryana Domicile #70', 9, '2026-08-18 13:38:25', '2026-08-18 13:38:25'),
(129, 9, -30, 9998413, 'service_deduction', NULL, 'haryana_domicile', 71, 'Haryana Domicile #71', 9, '2026-08-18 14:13:27', '2026-08-18 14:13:27'),
(130, 27, 49, 49, 'purchase', 'paid', NULL, NULL, 'Coin Purchase - 49 Coins (₹49)', 1, '2026-08-18 14:30:18', '2026-08-18 14:30:18'),
(131, 27, -9, 40, 'service_deduction', NULL, 'passport-size-photo-set-a4-4x6-as-u-req', 34, 'Passport Size Photo Set A4 & 4x6 as u req. request #34', 27, '2026-08-18 14:30:53', '2026-08-18 14:30:53'),
(132, 27, -9, 31, 'service_deduction', NULL, 'passport-size-photo-set-a4-4x6-as-u-req', 35, 'Passport Size Photo Set A4 & 4x6 as u req. request #35', 27, '2026-08-18 14:31:11', '2026-08-18 14:31:11'),
(133, 27, -9, 22, 'service_deduction', NULL, 'passport-size-photo-set-a4-4x6-as-u-req', 36, 'Passport Size Photo Set A4 & 4x6 as u req. request #36', 27, '2026-08-18 14:31:19', '2026-08-18 14:31:19'),
(134, 27, -10, 12, 'service_deduction', NULL, 'marriage_affidavit', 3, 'New Marriage Certificate #3', 27, '2026-08-18 14:36:12', '2026-08-18 14:36:12'),
(135, 28, 219, 219, 'purchase', 'paid', NULL, NULL, 'Coin Purchase - 219 Coins (₹199)', 1, '2026-08-19 17:10:27', '2026-08-19 17:10:27'),
(136, 29, 49, 49, 'purchase', 'paid', NULL, NULL, 'Coin Purchase - 49 Coins (₹49)', 1, '2026-08-19 17:15:14', '2026-08-19 17:15:14');

-- --------------------------------------------------------

--
-- Table structure for table `failed_jobs`
--

CREATE TABLE `failed_jobs` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `uuid` varchar(255) NOT NULL,
  `connection` text NOT NULL,
  `queue` text NOT NULL,
  `payload` longtext NOT NULL,
  `exception` longtext NOT NULL,
  `failed_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `haryana_domiciles`
--

CREATE TABLE `haryana_domiciles` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `user_id` bigint(20) UNSIGNED DEFAULT NULL,
  `pincode` varchar(255) DEFAULT NULL,
  `tehsil` varchar(255) NOT NULL,
  `district` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `father_name` varchar(255) NOT NULL,
  `village` varchar(255) NOT NULL,
  `ward_no` varchar(255) DEFAULT NULL,
  `age` int(11) NOT NULL,
  `mobile` varchar(10) NOT NULL,
  `aadhar` varchar(12) NOT NULL,
  `caste` varchar(255) NOT NULL,
  `religion` varchar(255) DEFAULT NULL,
  `ration_card_no` varchar(255) DEFAULT NULL,
  `child_name` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `haryana_domiciles`
--

INSERT INTO `haryana_domiciles` (`id`, `user_id`, `pincode`, `tehsil`, `district`, `name`, `father_name`, `village`, `ward_no`, `age`, `mobile`, `aadhar`, `caste`, `religion`, `ration_card_no`, `child_name`, `created_at`, `updated_at`) VALUES
(4, NULL, NULL, 'Panipat', 'Panipat', 'Neelam', 'W/o Surender', 'Vikas Nagar', '12', 34, '8816078444', '910016173515', 'Dhakot', 'Hindu', '066006592763', 'Neelam', '2026-01-13 11:06:22', '2026-01-13 11:06:22'),
(5, NULL, NULL, 'Panipat', 'Panipat', 'Santosh', 'W/o Krishan', 'Bharat Nagar', '12', 46, '8168425239', '384867816262', 'Hindu', 'Hindu', '9ESV7989', 'Santosh', '2026-01-13 11:23:18', '2026-01-13 11:23:18'),
(6, NULL, NULL, 'Panipat', 'Panipat', 'Farid', 'S/o Fakrudin', '40, Hali Colony', '12', 28, '9050990876', '254137978015', 'Ansari', 'Muslim', '066009494262', 'Farid', '2026-01-13 11:24:44', '2026-01-13 11:24:44'),
(7, NULL, NULL, 'Panipat', 'Panipat', 'Surender Kumar', 'S/o Subhash', '1195 Vikas nagar', '12', 38, '8816078444', '883287294276', 'Dakot', 'Hindu', '066006592763', 'Surender Kumar', '2026-01-13 11:26:53', '2026-01-13 11:26:53'),
(8, NULL, NULL, 'Panipat', 'Panipat', 'Ved Prakash', 'S/o Satpal', '293/6 Quila Near police chowky', '10', 33, '9802244899', '770166559303', 'kabiri', 'Hindu', '2576898', NULL, '2026-01-17 10:56:34', '2026-01-17 10:56:34'),
(9, NULL, '132103', 'Panipat', 'Panipat', 'Rakhi', 'W/o Vijender', '10381 hali Colony', '12', 41, '9254000386', '856730478028', 'GEN', 'Hindu', '066000209716', 'Rakhi', '2026-05-13 05:46:42', '2026-05-13 05:46:42'),
(10, 9, '132103', 'Panipat', 'Panipat', 'Anil kumar', 'S/o Om Parkash', 'Chawla Colony', '12', 46, '8398855654', '947642866054', 'GEN', 'Hindu', '066008810092', 'VISHAKHA', '2026-05-16 15:11:58', '2026-05-16 15:11:58'),
(11, 9, '132103', 'Panipat', 'Panipat', 'Roshtash', 'S/o Pala Ram', 'Raj Colony', '12', 39, '9050046437', '986816856064', 'SC', 'Hindu', '066001457844', 'Khushbu', '2026-05-16 15:24:57', '2026-05-16 15:24:57'),
(12, 9, '132103', 'Panipat', 'Panipat', 'Vicky', 'S/o Ramlakhan Lal', 'Rajiv Colony', '12', 43, '8668679874', '290502813801', 'SC', 'Hindu', '066001445554', 'Rakhi', '2026-05-16 15:26:46', '2026-05-16 15:26:46'),
(13, 9, '132103', 'Panipat', 'Panipat', 'Nitin', 'S/o Banarasi Das', 'Dalbir Nagar', '12', 20, '9546574687', '983650614207', 'Saini', 'Hindu', '066000130515', 'Nitin', '2026-05-16 15:27:56', '2026-05-16 15:27:56'),
(14, 9, '132103', 'Panipat', 'Panipat', 'Pal', 'W/o Sonu', 'Bharat Nagar', '12', 42, '9946898984', '271452136801', 'BCA', 'Hindu', '066000438287', 'Pal', '2026-05-18 04:56:20', '2026-05-18 04:56:20'),
(15, 9, '132103', 'Panipat', 'Panipat', 'Noorjahan', 'W/o Mohd Nabi', 'New Jagdish Nagar', '12', 49, '9671715592', '783368651603', 'Muslim', 'Muslim', '066010375014', 'Noorjahan', '2026-05-21 14:12:14', '2026-05-21 14:12:14'),
(16, 9, '132103', 'Panipat', 'Panipat', 'Jainab', 'D/o Mohd Nabi', 'New Jagdish Nagar', '12', 28, '9671715591', '311407495753', 'Muslim', 'Muslim', '06601037501', 'Jainab', '2026-05-21 14:13:54', '2026-05-21 14:13:54'),
(17, 9, '132103', 'Panipat', 'Panipat', 'Kartik', 'S/o Ravinder', 'dabar colony', '12', 18, '9464568768', '745407383417', 'Saini', 'Hindu', '066000315316', 'Kartik', '2026-05-23 15:44:52', '2026-05-23 15:44:52'),
(18, 9, '132103', 'Panipat', 'Panipat', 'Anil Kumar', 'S/o Randhir', 'Dalbir Nagar', '12', 27, '9567486565', '457456489535', 'Kumhar', 'Hindu', '066009849276', 'Anil Kumar', '2026-05-26 14:05:02', '2026-05-26 14:05:02'),
(19, 9, '132103', 'Panipat', 'Panipat', 'Ravinder Kumar', 'S/o Jai Karan', 'Ashok Vihar Colony', '12', 38, '9645764468', '274019995950', 'Jangra', 'Hindu', '00109250', 'Shruti Ravinder Kumar Jangra', '2026-05-26 14:06:26', '2026-05-26 14:06:26'),
(20, 9, '132103', 'Panipat', 'Panipat', 'Sagar', 'S/o Surender', 'Ashok vihar Colony', '12', 24, '7498746846', '507441255972', 'Verma', 'Hindu', '06600456545', 'Sagar', '2026-05-26 14:57:05', '2026-05-26 14:57:05'),
(21, 9, '132103', 'Panipat', 'Panipat', 'Krishan Lal', 'S/o Phoola', 'saini Colony', '12', 58, '9264654654', '424385756076', 'BCB', 'Hindu', '066009065539', 'Krishan Lal', '2026-06-23 05:43:19', '2026-06-23 05:43:19'),
(22, 9, '132103', 'Panipat', 'Panipat', 'Bushra', 'S/o Asraf', 'Kaptan Nagar', '12', 49, '9567468765', '683299883142', 'BCB', 'Hindu', '369289', 'Bushra', '2026-06-23 05:47:04', '2026-06-23 05:47:04'),
(23, 9, '132103', 'Panipat', 'Panipat', 'Neetu', 'W/o Mintoo Kumar', 'Kashyap colony', '12', 37, '9565746846', '423471941119', 'BCA', 'Hindu', '06600746468', 'Neetu', '2026-06-30 08:07:28', '2026-06-30 08:07:28'),
(24, 9, '132103', 'Panipat', 'Panipat', 'Pinki', 'W/o Yogesh Taneja', 'Near Mahavir Mandir', '12', 39, '9465487446', '654213904145', 'GEN', 'Hindu', '0660447886', 'Pinki', '2026-06-30 15:34:44', '2026-06-30 15:34:44'),
(25, 9, '132103', 'Panipat', 'Panipat', 'varun', 'S/o Suresh', 'Dhoop Singh Nagar', '12', 30, '9267598434', '829535851155', 'BCA', 'Hindu', '066006887360', 'varun', '2026-06-30 15:36:17', '2026-06-30 15:36:17'),
(26, 9, '132103', 'Panipat', 'Panipat', 'Shagun', 'D/o Raman', 'Valmiki basti', '12', 20, '9554455341', '767298959319', 'SC', 'Hindu', '0664646557', 'Shagun', '2026-07-02 07:42:39', '2026-07-02 07:42:39'),
(27, 9, '132103', 'Panipat', 'Panipat', 'Sonu', 'S/o Rashid', 'purewal colony', '12', 26, '9965746576', '977812093272', 'BCA', 'Muslim', '415157', 'Sonu', '2026-07-07 16:06:59', '2026-07-07 16:06:59'),
(28, 9, '132103', 'Panipat', 'Panipat', 'Khusnuda', 'W/o Yamin', 'Purewal COlony', '12', 51, '9665765746', '938063566646', 'BCA', 'Muslim', '411517', 'Khusnuda', '2026-07-07 16:08:03', '2026-07-07 16:08:03'),
(29, 9, '132103', 'Panipat', 'Panipat', 'Aasmin', 'D/o Yamin', 'Batra Colony', '12', 32, '9565468746', '248207530100', 'BCA', 'Muslim', '06600446846', 'Aasmin', '2026-07-07 16:24:27', '2026-07-07 16:24:27'),
(30, 9, '132103', 'Panipat', 'Panipat', 'Nasrin', 'W/o Gul Mohammad', 'Purewal COlony', '12', 30, '9546868541', '657700195866', 'BCA', 'Muslim', '06600465465', 'Nasrin', '2026-07-07 16:35:45', '2026-07-07 16:35:45'),
(31, 9, '132103', 'Panipat', 'Panipat', 'Geeta', 'W/o Rajesh Kumar', 'Rajeev Colony', '12', 45, '9564568746', '305656167246', 'BCA', 'Hindu', '066007911990', 'Geeta', '2026-07-09 06:19:45', '2026-07-09 06:19:45'),
(32, 9, '132103', 'Panipat', 'Panipat', 'Kajal', 'D/o vijay Pal', 'Vikas Nagar ', '12', 20, '9265465465', '996650636108', 'SC', 'Hindu', '1REF6050', 'Kajal', '2026-07-12 14:22:27', '2026-07-12 14:22:27'),
(33, 9, '132103', 'Panipat', 'Panipat', 'Sunil', 'S/o Budh Pal', 'Durga Colony', '12', 32, '9775454541', '643830726578', 'BCB', 'Hindu', '06604654651', 'Renu', '2026-07-12 14:25:05', '2026-07-12 14:44:06'),
(34, 9, '132103', 'Panipat', 'Panipat', 'Rajni', 'W/o Shubham', 'Bharat Nagar', '12', 23, '9966565657', '366201181552', 'BCA', 'Hindu', '066009816432', 'Rajni', '2026-07-12 14:27:18', '2026-07-12 14:27:18'),
(35, 9, '132103', 'Panipat', 'Panipat', 'Manisha Saini', 'W/o Gourav Saini', 'Saini Colony', '12', 35, '9565748848', '370717631281', 'BCB', 'Hindu', '37', 'Manisha Saini', '2026-07-12 14:29:57', '2026-07-12 14:29:57'),
(36, 9, '132103', 'Panipat', 'Panipat', 'Geeta', 'W/o Vicky', 'Ram lal School', '12', 39, '9898798654', '490237689221', 'BCA', 'Hindu', '06656546565', 'Geeta', '2026-07-16 14:56:08', '2026-07-16 14:56:08'),
(37, 9, '132103', 'Panipat', 'Panipat', 'Soniya', 'W/o Gourav Dhiman', 'Bharat Nagar', '12', 25, '9729737329', '910943259520', 'BCA', 'Hindu', '066124847845', 'Soniya', '2026-07-16 14:57:24', '2026-07-16 14:57:24'),
(38, 9, '132103', 'Panipat', 'Panipat', 'Mamtesh', 'W/o RamKumar', 'Dhoop Singh Nagar', '12', 40, '9263746546', '230453965823', 'BCA', 'Hindu', '06601241566', 'Mamtesh', '2026-07-18 13:58:30', '2026-07-18 13:58:30'),
(39, 9, '132103', 'Panipat', 'Panipat', 'Riya Saini', 'W/o Sharavan', 'Mahadev Colony', '12', 25, '9553746877', '206670051537', 'Saini', 'Hindu', '066009263089', 'Riya Saini', '2026-07-19 08:44:47', '2026-07-19 08:44:47'),
(40, 9, '132103', 'Panipat', 'Panipat', 'Dharmender Saini', 'W/o Nathu Saini', 'Dhoop Singh Nagar', '12', 40, '9345654654', '314679414284', 'SAINI', 'Hindu', '066006782928', 'YASH', '2026-07-19 12:04:10', '2026-07-19 12:04:10'),
(41, 9, '132103', 'Panipat', 'Panipat', 'Seema', 'W/o Deepak', 'Saini Colony', '12', 22, '9548804646', '718132169812', 'Saini', 'Hindu', '066000402287', 'Seema', '2026-07-20 14:30:41', '2026-07-20 14:30:41'),
(42, 9, '132103', 'Panipat', 'Panipat', 'Arun Arora', 'S/o Krishan Lal Arora', 'Sector 11-12', '12', 45, '9656456565', '984619292738', 'GEN', 'Hindu', '066004565464', 'Armaan Arora', '2026-07-23 15:34:28', '2026-07-23 15:34:28'),
(43, 9, '132130', 'Panipat', 'Panipat', 'Saniya', 'D/o Shakil', 'Dubasi Nagar', '12', 19, '9728711897', '566577003651', 'BCA', 'Muslim', '066001485852', 'Saniya', '2026-07-23 15:36:10', '2026-07-23 15:36:10'),
(44, 9, '132103', 'Panipat', 'Panipat', 'Suraj', 'S/o Bijender', 'Rajiv Colony', '12', 38, '8708254060', '996669162107', 'BCB', 'Hindu', '06600145578', 'Divya', '2026-07-29 04:43:48', '2026-07-29 04:43:48'),
(45, 9, '132103', 'Panipat', 'Panipat', 'Prrami', 'W/o Karan Singh', 'Dalbir Nagar', '12', 81, '9265465468', '933394000499', 'Saini', 'Hindu', '145654', 'Prrami', '2026-07-29 12:34:31', '2026-07-29 12:34:31'),
(46, 9, '132103', 'Panipat', 'Panipat', 'Vanshika Chugh', 'W/o Virennder chugh', 'N H B C Panipat', '12', 43, '9565465446', '509730383631', 'GEN', 'Hindu', '066007969851', 'Vanshika Chugh', '2026-08-01 06:11:07', '2026-08-01 06:11:07'),
(47, 9, '132103', 'Panipat', 'Panipat', 'Babooram', 'S/o Sita Ram', 'Ashok vihar colony', '12', 68, '9565464654', '750791992087', 'sc', 'Hindu', '672821', 'Babooram', '2026-08-01 15:00:39', '2026-08-01 15:00:39'),
(48, 9, '132103', 'Panipat', 'Panipat', 'Gourav', 'S/o Ramesh kumar', 'Kutani Road', '12', 27, '9687645646', '527977572746', 'Gen', 'Hindu', '066010791769', 'Gourav', '2026-08-04 14:47:19', '2026-08-04 14:47:19'),
(49, 9, '132103', 'panipat', 'Panipat', 'Kamal', 'S/o Ramesh Kumar', 'batra Colony', '12', 27, '9565465484', '388531396835', 'Gen', 'Hindu', '066010944584', 'Kamal', '2026-08-04 14:48:56', '2026-08-04 14:48:56'),
(50, 1, '132103', 'Panipat', 'Panipat', 'Ved Prakash', 'D/o Satpal', '293/6 QUila Panipat', '8', 98, '9802244899', '776612345678', 'Kabir panthi', 'Muslim', '89789843', 'Yuri Patton', '2026-08-04 19:10:21', '2026-08-04 19:27:20'),
(51, 9, '132103', 'Panipat', 'Panipat', 'Naman', 'W/o Ravi Kumar', 'Ashok Vihar Colony', '12', 21, '8930921052', '247640305266', 'Sc', 'Hindu', '0661485874', 'Naman', '2026-08-05 06:22:16', '2026-08-05 06:22:16'),
(52, 9, '132103', 'panipat', 'Panipat', 'Ravi Kumar', 'S/o Rakesh Kumar', 'Ashok Vihar Colony', '12', 26, '8930921052', '428663348102', 'sc', 'Hindu', '066015454545', 'Ravi Kumar', '2026-08-05 06:23:29', '2026-08-05 06:23:29'),
(53, 9, '132103', 'Panipat', 'Panipat', 'Rakesh Giri', 'S/o Sawaliya Giri', 'Rajiv Colony', '12', 42, '9992888293', '292802641312', 'Gen', 'Hindu', '066001354565', 'Rakesh Giri', '2026-08-13 16:48:30', '2026-08-13 16:48:30'),
(54, 9, '132103', 'Panipat', 'Panipat', 'Babli', 'W/o Ramkumar', 'Saini Colony', '12', 53, '9145656454', '754696532049', 'Gen', 'Hindu', '066004154544', 'Babli', '2026-08-13 16:50:10', '2026-08-13 16:50:10'),
(55, 9, '132103', 'Panipat', 'Panipat', 'Firdos', 'W/o Izhar', 'Rajiv Colony', '12', 31, '9053785392', '394228874901', 'BCA', 'Muslim', '066006949713', 'Firdos', '2026-08-13 16:51:18', '2026-08-13 16:51:18'),
(56, 9, '132103', 'Panipat', 'Panipat', 'Nafis', 'S/oLillu', 'Rajiv Colony', '12', 45, '9248741258', '431838864939', 'BCA', 'Muslim', '1458525', 'Nafis', '2026-08-13 16:52:24', '2026-08-13 16:52:24'),
(57, 9, '132103', 'Panipat', 'Panipat', 'Mahrunisha', 'W/o Nafis', 'Rajiv Colony', '12', 43, '9548474582', '209872953242', 'BCA', 'Muslim', '06600478574', 'Mahrunisha', '2026-08-13 16:53:14', '2026-08-13 16:53:14'),
(58, 9, '132103', 'Panipat', 'Panipat', 'Nasima', 'W/oShamshad', 'Rajiv Colony', '12', 44, '9874547845', '986160927118', 'BCA', 'Muslim', '066009058643', 'Nasima', '2026-08-13 16:54:16', '2026-08-13 16:54:16'),
(59, 9, '132103', 'Panipat', 'Panipat', 'Vidhi Devi', 'W/o Rakesh Giri', 'Rajiv Colony', '12', 39, '9992888293', '555987128830', 'Gen', 'Hindu', '06600145584', 'Vidhi Devi', '2026-08-13 16:55:28', '2026-08-13 16:55:28'),
(60, 9, '132103', 'Panipat', 'Panipat', 'Sanjana', 'D/o Mahender', 'Jagjiwan Ram Colony', '12', 20, '9554465545', '311379112263', 'SC', 'Hindu', '06600054554', 'Sanjana', '2026-08-14 11:23:43', '2026-08-14 11:23:43'),
(61, 9, '132103', 'Panipat', 'Panipat', 'Juma', 'W/o Mohmmad Ali', 'Shastri Colony', '12', 39, '9145454454', '747596104476', 'BCA', 'Muslim', '06600145565', 'Juma', '2026-08-14 13:19:41', '2026-08-14 13:19:41'),
(62, 9, '132103', 'Panipat', 'Panipat', 'Rakhi', 'Sanjeev Kumar', 'Kishan Pura', '12', 43, '9548451252', '344338603712', 'BCA', 'Hindu', '066001179488', 'Rakhi', '2026-08-16 08:58:54', '2026-08-16 08:58:54'),
(63, 9, '132103', 'Panipat', 'Panipat', 'Nargis Jahan', 'Faishal', 'Baljeet nagar', '12', 41, '9548485212', '391795878399', 'BCA', 'Muslim', '066009498438', 'Nargis Jahan', '2026-08-16 09:05:10', '2026-08-16 09:05:10'),
(64, 9, '132103', 'Panipat', 'Panipat', 'Sandeep Kumar', 'Vikram Singh', 'Jagdish Nagar', '12', 30, '9992699659', '467782003794', 'Nai', 'Hindu', '066008038709', 'Sandeep Kumar', '2026-08-16 12:15:49', '2026-08-16 12:17:12'),
(65, 9, '132103', 'Panipat', 'Panipat', 'Heena', 'Kamal', 'Batra Colony', '12', 26, '9544587485', '978875980426', 'GEN', 'Hindu', '06610494584', 'Heena', '2026-08-16 16:38:15', '2026-08-16 16:38:15'),
(66, 9, '132103', 'Panipat', 'Panipat', 'Kumkum', 'Amit Kumar', 'Desraj Colony', '12', 41, '9541236585', '223752135544', 'Gen', 'Hindu', '103780', 'Kumkum', '2026-08-18 12:36:43', '2026-08-18 12:36:43'),
(67, 9, '132103', 'Panipat', 'Panipat', 'Mamta', 'Sanjay Kumar', 'Ashok Vihar Colony', '12', 45, '9578741511', '627803711165', 'Sc', 'Hindu', '066000355410', 'Mamta', '2026-08-18 12:38:07', '2026-08-18 12:38:07'),
(68, 9, '132103', 'Panipat', 'Panipat', 'Guddi', 'Virender', 'Rajiv Colony', '12', 47, '9671337463', '870420406741', 'Gen', 'Hindu', '066000215567', 'Guddi', '2026-08-18 12:39:32', '2026-08-18 12:39:32'),
(69, 9, '132103', 'Panipat', 'Panipat', 'Pooja', 'Sonu', 'Desraj Colony', '12', 41, '9541254566', '283721395319', 'BCA', 'Hindu', '145844', 'Pooja', '2026-08-18 12:41:28', '2026-08-18 12:41:28'),
(70, 9, '132103', 'Panipat', 'Panipat', 'Suman Rani', 'Vicky', 'Chawla Colony', '12', 36, '9547584544', '561353209125', 'BCA', 'Hindu', '066008577957', 'Suman Rani', '2026-08-18 13:38:25', '2026-08-18 13:38:25'),
(71, 9, '132103', 'Panipat', 'Panipat', 'Mohmmad Mukeem', 'Harun', 'Ashok Vihar Colony', '12', 21, '9541254584', '249467431539', 'BCA', 'Muslim', '145845', 'Mohmmad Mukeem', '2026-08-18 14:13:27', '2026-08-18 14:13:27');

-- --------------------------------------------------------

--
-- Table structure for table `jobs`
--

CREATE TABLE `jobs` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `queue` varchar(255) NOT NULL,
  `payload` longtext NOT NULL,
  `attempts` tinyint(3) UNSIGNED NOT NULL,
  `reserved_at` int(10) UNSIGNED DEFAULT NULL,
  `available_at` int(10) UNSIGNED NOT NULL,
  `created_at` int(10) UNSIGNED NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `job_batches`
--

CREATE TABLE `job_batches` (
  `id` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `total_jobs` int(11) NOT NULL,
  `pending_jobs` int(11) NOT NULL,
  `failed_jobs` int(11) NOT NULL,
  `failed_job_ids` longtext NOT NULL,
  `options` mediumtext DEFAULT NULL,
  `cancelled_at` int(11) DEFAULT NULL,
  `created_at` int(11) NOT NULL,
  `finished_at` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `marriage_affidavits`
--

CREATE TABLE `marriage_affidavits` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `user_id` bigint(20) UNSIGNED DEFAULT NULL,
  `marriage_date` date DEFAULT NULL,
  `marriage_venue` varchar(255) DEFAULT NULL,
  `religion` varchar(255) DEFAULT NULL,
  `groom_name` varchar(255) DEFAULT NULL,
  `groom_father_name` varchar(255) DEFAULT NULL,
  `groom_address` varchar(255) DEFAULT NULL,
  `groom_dob` date DEFAULT NULL,
  `groom_age` varchar(255) DEFAULT NULL,
  `bride_name` varchar(255) DEFAULT NULL,
  `bride_father_name` varchar(255) DEFAULT NULL,
  `bride_address` varchar(255) DEFAULT NULL,
  `bride_dob` date DEFAULT NULL,
  `bride_age` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `marriage_affidavits`
--

INSERT INTO `marriage_affidavits` (`id`, `user_id`, `marriage_date`, `marriage_venue`, `religion`, `groom_name`, `groom_father_name`, `groom_address`, `groom_dob`, `groom_age`, `bride_name`, `bride_father_name`, `bride_address`, `bride_dob`, `bride_age`, `created_at`, `updated_at`) VALUES
(2, 9, '2026-08-15', 'Panipat', 'Hindu', 'Anil', 'subhash', 'jagdish', '2001-02-07', '25', 'khushi', 'verma', 'kurar', '1999-12-28', '26', '2026-08-15 16:08:44', '2026-08-15 16:08:44'),
(3, 27, '2026-08-20', 'Hotel gupta', 'Hindu', 'Rajesh', 'Bhushan', 'Des raj colony panipat', '1975-08-18', '51', 'Rani', 'Rahul', 'Verma chowk panipat', '1963-08-18', '63', '2026-08-18 14:36:12', '2026-08-18 14:36:12');

-- --------------------------------------------------------

--
-- Table structure for table `marriage_forms`
--

CREATE TABLE `marriage_forms` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `user_id` bigint(20) UNSIGNED DEFAULT NULL,
  `groom_name` varchar(255) DEFAULT NULL,
  `groom_father_name` varchar(255) DEFAULT NULL,
  `groom_father_father_name` varchar(255) DEFAULT NULL,
  `groom_mother_name` varchar(255) DEFAULT NULL,
  `groom_address` varchar(255) DEFAULT NULL,
  `groom_father_address` varchar(255) DEFAULT NULL,
  `groom_age` varchar(255) DEFAULT NULL,
  `groom_dob` date DEFAULT NULL,
  `bride_name` varchar(255) DEFAULT NULL,
  `bride_father_name` varchar(255) DEFAULT NULL,
  `bride_father_father_name` varchar(255) DEFAULT NULL,
  `bride_mother_name` varchar(255) DEFAULT NULL,
  `bride_address` varchar(255) DEFAULT NULL,
  `bride_father_address` varchar(255) DEFAULT NULL,
  `bride_age` varchar(255) DEFAULT NULL,
  `bride_dob` date DEFAULT NULL,
  `marriage_date` date DEFAULT NULL,
  `marriage_venue` varchar(255) DEFAULT NULL,
  `district` varchar(255) DEFAULT NULL,
  `religion` varchar(255) DEFAULT NULL,
  `nationality` varchar(255) DEFAULT NULL,
  `groom_witness_name` varchar(255) DEFAULT NULL,
  `groom_witness_father_name` varchar(255) DEFAULT NULL,
  `groom_witness_address` varchar(255) DEFAULT NULL,
  `bride_witness_name` varchar(255) DEFAULT NULL,
  `bride_witness_father_name` varchar(255) DEFAULT NULL,
  `bride_witness_address` varchar(255) DEFAULT NULL,
  `pandit_name` varchar(255) DEFAULT NULL,
  `pandit_father_name` varchar(255) DEFAULT NULL,
  `pandit_address` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `groom_affidavit_by` varchar(255) NOT NULL DEFAULT 'father',
  `bride_affidavit_by` varchar(255) NOT NULL DEFAULT 'father'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `migrations`
--

CREATE TABLE `migrations` (
  `id` int(10) UNSIGNED NOT NULL,
  `migration` varchar(255) NOT NULL,
  `batch` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `migrations`
--

INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES
(1, '0001_01_01_000000_create_users_table', 1),
(2, '0001_01_01_000001_create_cache_table', 1),
(3, '0001_01_01_000002_create_jobs_table', 1),
(4, '0001_01_01_000003_create_password_reset_tokens_table', 1),
(5, '0001_01_01_000004_create_sessions_table', 1),
(6, '0001_01_01_000005_create_cache_locks_table', 1),
(7, '0001_01_01_000006_create_job_batches_table', 1),
(8, '0001_01_01_000007_create_failed_jobs_table', 1),
(9, '2025_12_30_123703_create_haryana_domiciles_table', 1),
(10, '2026_01_10_093511_create_pdf_coordinates_table', 1),
(11, '2026_01_20_220324_create_birth_records_table', 1),
(12, '2026_02_11_155351_create_pdf_converters_table', 1),
(13, '2026_02_12_091635_create_coin_transactions_table', 1),
(14, '2026_02_12_094546_create_coin_purchase_requests_table', 1),
(15, '2026_02_12_103112_create_pan_requests_table', 1),
(16, '2026_02_12_104950_create_pan_details_requests_table', 1),
(17, '2026_02_12_110000_create_service_requests_table', 1),
(18, '2026_03_06_153438_create_permissions_table', 1),
(19, '2026_03_06_153439_create_roles_table', 1),
(20, '2026_03_06_153440_create_model_has_permissions_table', 1),
(21, '2026_03_06_153441_create_model_has_roles_table', 1),
(22, '2026_03_06_153442_create_role_has_permissions_table', 1),
(23, '2026_04_28_000000_create_activity_logs_table', 1),
(24, '2026_05_13_085742_remove_unique_from_utr_number_in_coin_purchase_requests', 2),
(25, '2026_08_02_170449_create_marriage_forms_table', 2),
(26, '2026_08_02_182710_add_is_active_to_users_table', 2),
(27, '2026_08_02_184103_modify_users_table_for_phone_and_nullable_fields', 2),
(28, '2026_08_02_191433_add_coin_type_to_coin_transactions_table', 2),
(29, '2026_08_02_194958_create_settings_table', 2),
(30, '2026_08_04_170131_add_extra_fields_to_marriage_forms_table', 2),
(31, '2026_08_05_161642_add_parent_details_to_marriage_forms_table', 3),
(32, '2026_08_08_084755_add_affidavit_by_fields_to_marriage_forms_table', 4),
(33, '2026_08_08_120000_create_services_table', 4),
(34, '2026_08_08_120100_extend_service_requests_table', 4),
(35, '2026_08_08_120200_create_notifications_table', 4),
(36, '2026_08_14_175641_add_visibility_to_services_table', 5),
(37, '2026_08_14_175642_create_service_user_table', 5),
(38, '2026_08_14_182227_add_logo_to_services_table', 6),
(39, '2026_08_14_185138_create_marriage_affidavits_table', 7);

-- --------------------------------------------------------

--
-- Table structure for table `model_has_permissions`
--

CREATE TABLE `model_has_permissions` (
  `permission_id` bigint(20) UNSIGNED NOT NULL,
  `model_type` varchar(255) NOT NULL,
  `model_id` bigint(20) UNSIGNED NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `model_has_roles`
--

CREATE TABLE `model_has_roles` (
  `role_id` bigint(20) UNSIGNED NOT NULL,
  `model_type` varchar(255) NOT NULL,
  `model_id` bigint(20) UNSIGNED NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `model_has_roles`
--

INSERT INTO `model_has_roles` (`role_id`, `model_type`, `model_id`) VALUES
(3, 'App\\Models\\User', 8),
(3, 'App\\Models\\User', 9),
(4, 'App\\Models\\User', 10),
(5, 'App\\Models\\User', 11),
(3, 'App\\Models\\User', 12),
(3, 'App\\Models\\User', 13),
(3, 'App\\Models\\User', 15),
(3, 'App\\Models\\User', 19),
(3, 'App\\Models\\User', 20),
(3, 'App\\Models\\User', 21),
(3, 'App\\Models\\User', 22),
(3, 'App\\Models\\User', 23),
(3, 'App\\Models\\User', 24),
(3, 'App\\Models\\User', 25),
(3, 'App\\Models\\User', 26),
(3, 'App\\Models\\User', 27),
(3, 'App\\Models\\User', 28),
(3, 'App\\Models\\User', 29);

-- --------------------------------------------------------

--
-- Table structure for table `notifications`
--

CREATE TABLE `notifications` (
  `id` char(36) NOT NULL,
  `type` varchar(255) NOT NULL,
  `notifiable_type` varchar(255) NOT NULL,
  `notifiable_id` bigint(20) UNSIGNED NOT NULL,
  `data` text NOT NULL,
  `read_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `notifications`
--

INSERT INTO `notifications` (`id`, `type`, `notifiable_type`, `notifiable_id`, `data`, `read_at`, `created_at`, `updated_at`) VALUES
('00ecf06c-6986-4332-9264-ed0b2d8d1d05', 'App\\Notifications\\SystemAlert', 'App\\Models\\User', 14, '{\"title\":\"Request Accepted\",\"body\":\"Your Mobile no. To aadhar Number request #10 is now accepted. Note: 643398047131\",\"url\":\"\\/admin\\/service-requests\\/10\",\"level\":\"info\"}', NULL, '2026-08-12 14:57:01', '2026-08-12 14:57:01'),
('0395377d-cb25-4012-8d3a-a8aed09379ef', 'App\\Notifications\\SystemAlert', 'App\\Models\\User', 10, '{\"title\":\"New service request\",\"body\":\"ankit requested Sim No. To Aadhar Number (#23).\",\"url\":\"\\/admin\\/service-requests\\/23\",\"level\":\"info\"}', NULL, '2026-08-14 12:33:36', '2026-08-14 12:33:36'),
('041ee775-f41e-4af6-8f80-469edb3151d9', 'App\\Notifications\\SystemAlert', 'App\\Models\\User', 10, '{\"title\":\"New service request\",\"body\":\"Deepak Kumar requested Pan To Aadhar (#27).\",\"url\":\"\\/admin\\/service-requests\\/27\",\"level\":\"info\"}', NULL, '2026-08-15 06:52:55', '2026-08-15 06:52:55'),
('0500ca99-b36f-4c4e-a81a-2875c9a7e51a', 'App\\Notifications\\SystemAlert', 'App\\Models\\User', 11, '{\"title\":\"New coin purchase request\",\"body\":\"RAJESH paid \\u20b949 for 49 coins.\",\"url\":\"\\/admin\\/coin-requests\",\"level\":\"info\"}', NULL, '2026-08-18 14:30:07', '2026-08-18 14:30:07'),
('05b131e7-aada-44e2-977c-1c8f7fa62da5', 'App\\Notifications\\SystemAlert', 'App\\Models\\User', 1, '{\"title\":\"New coin purchase request\",\"body\":\" paid \\u20b9199 for 219 coins.\",\"url\":\"\\/admin\\/coin-requests\",\"level\":\"info\"}', '2026-08-19 15:10:06', '2026-08-19 13:48:58', '2026-08-19 15:10:06'),
('07720992-5052-4afa-9674-e2db2224cf84', 'App\\Notifications\\SystemAlert', 'App\\Models\\User', 1, '{\"title\":\"New coin purchase request\",\"body\":\"Deepak Verma paid \\u20b9799 for 959 coins.\",\"url\":\"\\/admin\\/coin-requests\",\"level\":\"info\"}', '2026-08-15 07:11:38', '2026-08-13 16:57:50', '2026-08-15 07:11:38'),
('07c8c53e-f862-4a93-b2ce-762b76811b9c', 'App\\Notifications\\SystemAlert', 'App\\Models\\User', 11, '{\"title\":\"New coin purchase request\",\"body\":\"Deepak Verma paid \\u20b9799 for 959 coins.\",\"url\":\"\\/admin\\/coin-requests\",\"level\":\"info\"}', NULL, '2026-08-13 16:57:52', '2026-08-13 16:57:52'),
('07e575e6-f2b3-49f4-8027-76c965494191', 'App\\Notifications\\SystemAlert', 'App\\Models\\User', 10, '{\"title\":\"New service request\",\"body\":\"Rajesh requested Mobile no. To aadhar Number (#10).\",\"url\":\"\\/admin\\/service-requests\\/10\",\"level\":\"info\"}', NULL, '2026-08-12 14:54:15', '2026-08-12 14:54:15'),
('0e565ec5-9f86-4e4c-b15f-819c567683f3', 'App\\Notifications\\SystemAlert', 'App\\Models\\User', 15, '{\"title\":\"Request Accepted\",\"body\":\"Your Marriage Certificate Apply only Panipat request #29 is now accepted.\",\"url\":\"\\/admin\\/service-requests\\/29\",\"level\":\"info\"}', NULL, '2026-08-15 06:59:45', '2026-08-15 06:59:45'),
('0eb5b7e1-4575-4b4d-8840-55747618c9f7', 'App\\Notifications\\SystemAlert', 'App\\Models\\User', 1, '{\"title\":\"New service request\",\"body\":\"Deepak Verma requested Aadhaar Pdf to Pvc Card Instant (#20).\",\"url\":\"\\/admin\\/service-requests\\/20\",\"level\":\"info\"}', '2026-08-15 07:11:38', '2026-08-13 17:01:30', '2026-08-15 07:11:38'),
('0ed4f489-0e74-4b5c-acd6-33b866bf702b', 'App\\Notifications\\SystemAlert', 'App\\Models\\User', 10, '{\"title\":\"New service request\",\"body\":\"Deepak Verma requested Aadhar Card Address Change (#18).\",\"url\":\"\\/admin\\/service-requests\\/18\",\"level\":\"info\"}', NULL, '2026-08-13 17:00:52', '2026-08-13 17:00:52'),
('1063fa67-2c05-4949-8249-02dececc43b5', 'App\\Notifications\\SystemAlert', 'App\\Models\\User', 10, '{\"title\":\"New coin purchase request\",\"body\":\"Deepak Verma paid \\u20b9799 for 959 coins.\",\"url\":\"\\/admin\\/coin-requests\",\"level\":\"info\"}', NULL, '2026-08-14 14:20:43', '2026-08-14 14:20:43'),
('115294f2-5c5c-4e80-8b2c-86910ebecc6b', 'App\\Notifications\\SystemAlert', 'App\\Models\\User', 10, '{\"title\":\"New service request\",\"body\":\"Deepak Verma requested Aadhar Card Address Change (#13).\",\"url\":\"\\/admin\\/service-requests\\/13\",\"level\":\"info\"}', NULL, '2026-08-13 17:00:09', '2026-08-13 17:00:09'),
('12d9e751-988a-4dc0-ab16-b4f3931a2626', 'App\\Notifications\\SystemAlert', 'App\\Models\\User', 11, '{\"title\":\"New service request\",\"body\":\"ankit requested Mobile no. To aadhar Number (#11).\",\"url\":\"\\/admin\\/service-requests\\/11\",\"level\":\"info\"}', NULL, '2026-08-12 15:05:21', '2026-08-12 15:05:21'),
('1442a283-3c21-4dea-8dd5-bc4a3409d242', 'App\\Notifications\\SystemAlert', 'App\\Models\\User', 11, '{\"title\":\"New service request\",\"body\":\"Deepak Kumar requested Aadhar Card Number to Pdf (#33).\",\"url\":\"\\/admin\\/service-requests\\/33\",\"level\":\"info\"}', NULL, '2026-08-15 06:58:43', '2026-08-15 06:58:43'),
('14f85e8d-aa14-4ef3-a3e9-69e28f64effc', 'App\\Notifications\\SystemAlert', 'App\\Models\\User', 11, '{\"title\":\"New service request\",\"body\":\"Deepak Verma requested Puc Certificate With otp (#19).\",\"url\":\"\\/admin\\/service-requests\\/19\",\"level\":\"info\"}', NULL, '2026-08-13 17:01:11', '2026-08-13 17:01:11'),
('158a9b24-b703-4fe1-8075-a20bee7d9e62', 'App\\Notifications\\SystemAlert', 'App\\Models\\User', 11, '{\"title\":\"New service request\",\"body\":\"Deepak Verma requested Aadhar Card Address Change (#17).\",\"url\":\"\\/admin\\/service-requests\\/17\",\"level\":\"info\"}', NULL, '2026-08-13 17:00:46', '2026-08-13 17:00:46'),
('16098868-f6c2-4875-a4bb-e4ecc0091560', 'App\\Notifications\\SystemAlert', 'App\\Models\\User', 15, '{\"title\":\"Coins added\",\"body\":\"Your purchase of 959 coins (\\u20b9799) was approved. New balance: 5770 coins.\",\"url\":\"\\/dashboard\",\"level\":\"success\"}', '2026-08-15 06:58:52', '2026-08-14 16:08:48', '2026-08-15 06:58:52'),
('16198ad7-66ae-43be-b5a9-11ae272d652f', 'App\\Notifications\\SystemAlert', 'App\\Models\\User', 1, '{\"title\":\"New service request\",\"body\":\"Deepak Kumar requested Aadhar Number To AADHAR PDF (#28).\",\"url\":\"\\/admin\\/service-requests\\/28\",\"level\":\"info\"}', '2026-08-15 07:11:38', '2026-08-15 06:56:59', '2026-08-15 07:11:38'),
('18b36ab1-0999-410f-834e-f784872eb6e7', 'App\\Notifications\\SystemAlert', 'App\\Models\\User', 1, '{\"title\":\"New coin purchase request\",\"body\":\"Deepak Verma paid \\u20b9799 for 959 coins.\",\"url\":\"\\/admin\\/coin-requests\",\"level\":\"info\"}', '2026-08-15 07:11:38', '2026-08-14 14:20:43', '2026-08-15 07:11:38'),
('18d08f89-c046-422b-9c6b-f5a1289dd595', 'App\\Notifications\\SystemAlert', 'App\\Models\\User', 10, '{\"title\":\"New service request\",\"body\":\"Deepak Kumar requested Marriage Certificate Apply only Panipat (#29).\",\"url\":\"\\/admin\\/service-requests\\/29\",\"level\":\"info\"}', NULL, '2026-08-15 06:57:55', '2026-08-15 06:57:55'),
('1974bd73-a666-40f1-9ee9-e380d3957c7f', 'App\\Notifications\\SystemAlert', 'App\\Models\\User', 11, '{\"title\":\"New coin purchase request\",\"body\":\"Deepak Verma paid \\u20b9799 for 959 coins.\",\"url\":\"\\/admin\\/coin-requests\",\"level\":\"info\"}', NULL, '2026-08-14 14:20:35', '2026-08-14 14:20:35'),
('19830245-2b0c-476e-9406-acf6834647e0', 'App\\Notifications\\SystemAlert', 'App\\Models\\User', 15, '{\"title\":\"Request Accepted\",\"body\":\"Your Sim No. To Aadhar Number request #24 is now accepted. Note: OWNER NAME     : MR  DEEPAK KUMAR\\nFATHER NAME    : PAWAN KUMAR\\nMOBILE NO      : 8398853485\\nALT MOBILE     : 9729673885\\nAADHAR CARD NO : 874656388362\\nCIRCLE         : VI HAR\\nADDRESS        : S\\/O PAWAN KUMAR 23 KAIMLAKAIMLA KAIMLA KAIMLA 25KARNAL GARUNDAKARNAL KARNAL HARYANA 132114\",\"url\":\"\\/admin\\/service-requests\\/24\",\"level\":\"info\"}', '2026-08-15 06:58:52', '2026-08-14 16:11:41', '2026-08-15 06:58:52'),
('1a3ce579-cdce-47e7-b7ff-47013dd8460e', 'App\\Notifications\\SystemAlert', 'App\\Models\\User', 11, '{\"title\":\"New service request\",\"body\":\"Deepak Verma requested Aadhar Card Address Change (#16).\",\"url\":\"\\/admin\\/service-requests\\/16\",\"level\":\"info\"}', NULL, '2026-08-13 17:00:36', '2026-08-13 17:00:36'),
('1c55312a-4dd1-4acf-898c-89e3fc0bf59b', 'App\\Notifications\\SystemAlert', 'App\\Models\\User', 27, '{\"title\":\"Request Accepted\",\"body\":\"Your Passport Size Photo Set A4 & 4x6 as u req. request #34 is now accepted.\",\"url\":\"\\/admin\\/service-requests\\/34\",\"level\":\"info\"}', NULL, '2026-08-18 14:31:59', '2026-08-18 14:31:59'),
('1ea4c102-2a0c-4b41-8f50-b36a9dd09690', 'App\\Notifications\\SystemAlert', 'App\\Models\\User', 10, '{\"title\":\"New coin purchase request\",\"body\":\"Deepak Verma paid \\u20b9799 for 959 coins.\",\"url\":\"\\/admin\\/coin-requests\",\"level\":\"info\"}', NULL, '2026-08-14 14:20:39', '2026-08-14 14:20:39'),
('1f4be78b-3819-4902-96ac-905e2e1c7c52', 'App\\Notifications\\SystemAlert', 'App\\Models\\User', 1, '{\"title\":\"New coin purchase request\",\"body\":\"Deepak Verma paid \\u20b9799 for 959 coins.\",\"url\":\"\\/admin\\/coin-requests\",\"level\":\"info\"}', '2026-08-15 07:11:38', '2026-08-14 14:20:41', '2026-08-15 07:11:38'),
('20f06b08-a1f4-4e0d-b463-94d34e86f114', 'App\\Notifications\\SystemAlert', 'App\\Models\\User', 10, '{\"title\":\"New service request\",\"body\":\"Deepak Verma requested Vehicle Number to Info (#25).\",\"url\":\"\\/admin\\/service-requests\\/25\",\"level\":\"info\"}', NULL, '2026-08-14 16:14:01', '2026-08-14 16:14:01'),
('247d4e2c-d87f-46bf-a545-355199ba7034', 'App\\Notifications\\SystemAlert', 'App\\Models\\User', 1, '{\"title\":\"New coin purchase request\",\"body\":\"Deepak Verma paid \\u20b9799 for 959 coins.\",\"url\":\"\\/admin\\/coin-requests\",\"level\":\"info\"}', '2026-08-15 07:11:38', '2026-08-13 16:57:52', '2026-08-15 07:11:38'),
('2888d302-8a2c-4952-9f5d-5210148c72bb', 'App\\Notifications\\SystemAlert', 'App\\Models\\User', 10, '{\"title\":\"New service request\",\"body\":\"ankit requested Sim No. To Aadhar Number (#22).\",\"url\":\"\\/admin\\/service-requests\\/22\",\"level\":\"info\"}', NULL, '2026-08-13 21:39:35', '2026-08-13 21:39:35'),
('288ccfe6-39bc-4404-b307-50cfe3e44a00', 'App\\Notifications\\SystemAlert', 'App\\Models\\User', 15, '{\"title\":\"Request Accepted\",\"body\":\"Your Aadhaar Pdf to Pvc Card Instant request #20 is now accepted.\",\"url\":\"\\/admin\\/service-requests\\/20\",\"level\":\"info\"}', '2026-08-15 06:58:52', '2026-08-13 17:01:52', '2026-08-15 06:58:52'),
('28a50fa4-3d0d-4fa5-bebb-e486488bef6f', 'App\\Notifications\\SystemAlert', 'App\\Models\\User', 15, '{\"title\":\"Coins added\",\"body\":\"Your purchase of 959 coins (\\u20b9799) was approved. New balance: 6729 coins.\",\"url\":\"\\/dashboard\",\"level\":\"success\"}', '2026-08-15 06:58:52', '2026-08-14 16:08:49', '2026-08-15 06:58:52'),
('29491ec2-58a4-4b6c-b349-91b0fd718b40', 'App\\Notifications\\SystemAlert', 'App\\Models\\User', 1, '{\"title\":\"New service request\",\"body\":\"sam requested Mobile no. To aadhar Number (#9).\",\"url\":\"\\/admin\\/service-requests\\/9\",\"level\":\"info\"}', '2026-08-15 07:11:38', '2026-08-12 14:37:34', '2026-08-15 07:11:38'),
('2b17f2ff-547e-438c-bb27-ffefc5c10f60', 'App\\Notifications\\SystemAlert', 'App\\Models\\User', 13, '{\"title\":\"Coin request rejected\",\"body\":\"Your request for 49 coins was rejected. Reason: MULTI\",\"url\":\"\\/admin\\/coin-requests\",\"level\":\"error\"}', NULL, '2026-08-12 14:53:10', '2026-08-12 14:53:10'),
('2befa0e4-acf3-4449-9bd3-a65577440cbb', 'App\\Notifications\\SystemAlert', 'App\\Models\\User', 11, '{\"title\":\"New coin purchase request\",\"body\":\"Deepak Verma paid \\u20b9799 for 959 coins.\",\"url\":\"\\/admin\\/coin-requests\",\"level\":\"info\"}', NULL, '2026-08-14 14:20:42', '2026-08-14 14:20:42'),
('2d2b3f5a-90be-49e6-b428-b2003eab58c8', 'App\\Notifications\\SystemAlert', 'App\\Models\\User', 10, '{\"title\":\"New service request\",\"body\":\"Deepak Verma requested Aadhaar Pdf to Pvc Card Instant (#21).\",\"url\":\"\\/admin\\/service-requests\\/21\",\"level\":\"info\"}', NULL, '2026-08-13 17:01:35', '2026-08-13 17:01:35'),
('2ed58786-a715-4627-add3-f04a2ff4628c', 'App\\Notifications\\SystemAlert', 'App\\Models\\User', 10, '{\"title\":\"New service request\",\"body\":\"Deepak Verma requested Sim No. To Aadhar Number (#24).\",\"url\":\"\\/admin\\/service-requests\\/24\",\"level\":\"info\"}', NULL, '2026-08-14 16:10:43', '2026-08-14 16:10:43'),
('2f208086-b6b4-47fa-bdf0-8e03c59008e4', 'App\\Notifications\\SystemAlert', 'App\\Models\\User', 10, '{\"title\":\"New coin purchase request\",\"body\":\"Deepak Verma paid \\u20b9799 for 959 coins.\",\"url\":\"\\/admin\\/coin-requests\",\"level\":\"info\"}', NULL, '2026-08-14 14:20:42', '2026-08-14 14:20:42'),
('2f22e394-c5a4-49e2-80b3-6db32279dcdc', 'App\\Notifications\\SystemAlert', 'App\\Models\\User', 1, '{\"title\":\"New service request\",\"body\":\"Deepak Kumar requested Aadhar Card Number to Pdf (#30).\",\"url\":\"\\/admin\\/service-requests\\/30\",\"level\":\"info\"}', '2026-08-15 07:11:38', '2026-08-15 06:58:29', '2026-08-15 07:11:38'),
('2fff0e3f-62db-43af-ab86-bcc6cd6a2e5a', 'App\\Notifications\\SystemAlert', 'App\\Models\\User', 1, '{\"title\":\"New coin purchase request\",\"body\":\"Shanu paid \\u20b999 for 105 coins.\",\"url\":\"\\/admin\\/coin-requests\",\"level\":\"info\"}', '2026-08-17 13:37:15', '2026-08-17 13:36:08', '2026-08-17 13:37:15'),
('303bda09-e3ba-4bf8-b321-4376323e058a', 'App\\Notifications\\SystemAlert', 'App\\Models\\User', 1, '{\"title\":\"New coin purchase request\",\"body\":\"Deepak Verma paid \\u20b999 for 105 coins.\",\"url\":\"\\/admin\\/coin-requests\",\"level\":\"info\"}', '2026-08-15 07:11:38', '2026-08-13 17:05:03', '2026-08-15 07:11:38'),
('30cb84ac-7189-402a-aab0-e325268e10d4', 'App\\Notifications\\SystemAlert', 'App\\Models\\User', 11, '{\"title\":\"New service request\",\"body\":\"Deepak Kumar requested Marriage Certificate Apply only Panipat (#29).\",\"url\":\"\\/admin\\/service-requests\\/29\",\"level\":\"info\"}', NULL, '2026-08-15 06:57:55', '2026-08-15 06:57:55'),
('33ef4cb8-3afe-4d12-9d73-4325f34f5975', 'App\\Notifications\\SystemAlert', 'App\\Models\\User', 11, '{\"title\":\"New coin purchase request\",\"body\":\" paid \\u20b9199 for 219 coins.\",\"url\":\"\\/admin\\/coin-requests\",\"level\":\"info\"}', NULL, '2026-08-19 13:48:58', '2026-08-19 13:48:58'),
('361453ef-8d9d-40c9-9f0d-29d91098c43e', 'App\\Notifications\\SystemAlert', 'App\\Models\\User', 15, '{\"title\":\"Request Accepted\",\"body\":\"Your Aadhaar Pdf to Pvc Card Instant request #21 is now accepted.\",\"url\":\"\\/admin\\/service-requests\\/21\",\"level\":\"info\"}', '2026-08-15 06:58:52', '2026-08-13 17:01:48', '2026-08-15 06:58:52'),
('36562c7f-0a64-48ac-98f6-1ac2df9ec0f8', 'App\\Notifications\\SystemAlert', 'App\\Models\\User', 9, '{\"title\":\"Request Accepted\",\"body\":\"Your Vehicle Detail request #7 is now accepted. Note: \\\"chassis_last5\\\": \\\"17541\\\",\\n    \\\"mobile\\\": \\\"9215818900\\\",\\n    \\\"reg_no\\\": \\\"HR06AQ6025\\\",\\n    \\\"success\\\": true\\n}\",\"url\":\"\\/admin\\/service-requests\\/7\",\"level\":\"info\"}', '2026-08-15 06:08:56', '2026-08-12 11:46:14', '2026-08-15 06:08:56'),
('38f04153-7cae-4f3e-9bab-dc2bac71be6c', 'App\\Notifications\\SystemAlert', 'App\\Models\\User', 11, '{\"title\":\"New service request\",\"body\":\"RAJESH requested Passport Size Photo Set A4 & 4x6 as u req. (#34).\",\"url\":\"\\/admin\\/service-requests\\/34\",\"level\":\"info\"}', NULL, '2026-08-18 14:30:53', '2026-08-18 14:30:53'),
('39008b9f-b8a5-4fba-b8ee-071e44cdbf77', 'App\\Notifications\\SystemAlert', 'App\\Models\\User', 1, '{\"title\":\"New service request\",\"body\":\"Deepak Verma requested Aadhar Card Address Change (#17).\",\"url\":\"\\/admin\\/service-requests\\/17\",\"level\":\"info\"}', '2026-08-15 07:11:38', '2026-08-13 17:00:46', '2026-08-15 07:11:38'),
('3916bfd5-ea0f-46f5-b2e2-59538f1c30f7', 'App\\Notifications\\SystemAlert', 'App\\Models\\User', 11, '{\"title\":\"New coin purchase request\",\"body\":\"pooja paid \\u20b949 for 49 coins.\",\"url\":\"\\/admin\\/coin-requests\",\"level\":\"info\"}', NULL, '2026-08-19 17:15:07', '2026-08-19 17:15:07'),
('3978d6bf-72a4-4e7d-a654-96f5c68664a6', 'App\\Notifications\\SystemAlert', 'App\\Models\\User', 11, '{\"title\":\"New coin purchase request\",\"body\":\"ankit paid \\u20b949 for 49 coins.\",\"url\":\"\\/admin\\/coin-requests\",\"level\":\"info\"}', NULL, '2026-08-12 14:43:22', '2026-08-12 14:43:22'),
('3a893ec6-9fc9-43d0-8e5c-3b9f43ef6c05', 'App\\Notifications\\SystemAlert', 'App\\Models\\User', 1, '{\"title\":\"New coin purchase request\",\"body\":\"pooja paid \\u20b949 for 49 coins.\",\"url\":\"\\/admin\\/coin-requests\",\"level\":\"info\"}', '2026-08-20 05:27:24', '2026-08-19 17:15:07', '2026-08-20 05:27:24'),
('3aca29a6-12b9-48f3-bfaa-16bb57877c68', 'App\\Notifications\\SystemAlert', 'App\\Models\\User', 13, '{\"title\":\"Request Rejected\",\"body\":\"Your Mobile no. To aadhar Number request #11 is now rejected. 99 coins have been refunded to your account.\",\"url\":\"\\/admin\\/service-requests\\/11\",\"level\":\"error\"}', NULL, '2026-08-13 17:02:33', '2026-08-13 17:02:33'),
('3bd33a01-be59-496e-8f3d-85018d691d97', 'App\\Notifications\\SystemAlert', 'App\\Models\\User', 10, '{\"title\":\"New service request\",\"body\":\"Deepak Verma requested Aadhar Card Address Change (#14).\",\"url\":\"\\/admin\\/service-requests\\/14\",\"level\":\"info\"}', NULL, '2026-08-13 17:00:20', '2026-08-13 17:00:20'),
('3cf192fc-14ab-48f9-a280-4d7e278546d9', 'App\\Notifications\\SystemAlert', 'App\\Models\\User', 1, '{\"title\":\"New service request\",\"body\":\"Deepak Verma requested Aadhaar Pdf to Pvc Card Instant (#21).\",\"url\":\"\\/admin\\/service-requests\\/21\",\"level\":\"info\"}', '2026-08-15 07:11:38', '2026-08-13 17:01:35', '2026-08-15 07:11:38'),
('3d4db811-f209-414d-a24b-fe6125284190', 'App\\Notifications\\SystemAlert', 'App\\Models\\User', 1, '{\"title\":\"New service request\",\"body\":\"Deepak Kumar requested Pan To Aadhar (#27).\",\"url\":\"\\/admin\\/service-requests\\/27\",\"level\":\"info\"}', '2026-08-15 07:11:38', '2026-08-15 06:52:55', '2026-08-15 07:11:38'),
('3db68a1d-8d0e-49c2-889d-62a9b9238f13', 'App\\Notifications\\SystemAlert', 'App\\Models\\User', 27, '{\"title\":\"Request Accepted\",\"body\":\"Your Passport Size Photo Set A4 & 4x6 as u req. request #35 is now accepted.\",\"url\":\"\\/admin\\/service-requests\\/35\",\"level\":\"info\"}', NULL, '2026-08-18 14:31:54', '2026-08-18 14:31:54'),
('421ac7f2-3e22-4856-a312-0e9272e8273c', 'App\\Notifications\\SystemAlert', 'App\\Models\\User', 23, '{\"title\":\"Coins added\",\"body\":\"Your purchase of 105 coins (\\u20b999) was approved. New balance: 105 coins.\",\"url\":\"\\/dashboard\",\"level\":\"success\"}', NULL, '2026-08-17 13:36:25', '2026-08-17 13:36:25'),
('4259fe37-cbde-41b0-9446-eef10b147130', 'App\\Notifications\\SystemAlert', 'App\\Models\\User', 1, '{\"title\":\"New coin purchase request\",\"body\":\"Deepak Verma paid \\u20b9799 for 959 coins.\",\"url\":\"\\/admin\\/coin-requests\",\"level\":\"info\"}', '2026-08-15 07:11:38', '2026-08-14 14:20:39', '2026-08-15 07:11:38'),
('435353e3-6dd1-44c7-b31d-50be67f3f65c', 'App\\Notifications\\SystemAlert', 'App\\Models\\User', 1, '{\"title\":\"New coin purchase request\",\"body\":\"Rajesh paid \\u20b999 for 105 coins.\",\"url\":\"\\/admin\\/coin-requests\",\"level\":\"info\"}', '2026-08-15 07:11:38', '2026-08-12 14:53:48', '2026-08-15 07:11:38'),
('4481b5cb-28a8-44de-8c33-e0e23736cda7', 'App\\Notifications\\SystemAlert', 'App\\Models\\User', 11, '{\"title\":\"New coin purchase request\",\"body\":\"Deepak Verma paid \\u20b9799 for 959 coins.\",\"url\":\"\\/admin\\/coin-requests\",\"level\":\"info\"}', NULL, '2026-08-14 14:20:40', '2026-08-14 14:20:40'),
('4519b031-9174-4b6c-8a6d-fa98900c71ea', 'App\\Notifications\\SystemAlert', 'App\\Models\\User', 11, '{\"title\":\"New service request\",\"body\":\"Deepak Verma requested Vehicle Number to Info (#25).\",\"url\":\"\\/admin\\/service-requests\\/25\",\"level\":\"info\"}', NULL, '2026-08-14 16:14:01', '2026-08-14 16:14:01'),
('45f4c5a9-3048-4496-b036-333dc8ad8d5a', 'App\\Notifications\\SystemAlert', 'App\\Models\\User', 15, '{\"title\":\"Request Accepted\",\"body\":\"Your Aadhar Card Number to Pdf request #32 is now accepted.\",\"url\":\"\\/admin\\/service-requests\\/32\",\"level\":\"info\"}', NULL, '2026-08-15 06:59:32', '2026-08-15 06:59:32'),
('490c8e0b-8d2d-4451-9fda-85807b5547b1', 'App\\Notifications\\SystemAlert', 'App\\Models\\User', 1, '{\"title\":\"New coin purchase request\",\"body\":\"ankit paid \\u20b949 for 49 coins.\",\"url\":\"\\/admin\\/coin-requests\",\"level\":\"info\"}', '2026-08-15 07:11:38', '2026-08-12 14:43:22', '2026-08-15 07:11:38'),
('4923fb24-2d63-48b7-84ad-b5627552df75', 'App\\Notifications\\SystemAlert', 'App\\Models\\User', 11, '{\"title\":\"New service request\",\"body\":\"Deepak Verma requested Aadhar Card Address Change (#14).\",\"url\":\"\\/admin\\/service-requests\\/14\",\"level\":\"info\"}', NULL, '2026-08-13 17:00:20', '2026-08-13 17:00:20'),
('4a245cdf-cfda-4334-8490-e8fe6de5ac32', 'App\\Notifications\\SystemAlert', 'App\\Models\\User', 1, '{\"title\":\"New service request\",\"body\":\"Deepak Verma requested Aadhar Card Address Change (#14).\",\"url\":\"\\/admin\\/service-requests\\/14\",\"level\":\"info\"}', '2026-08-15 07:11:38', '2026-08-13 17:00:20', '2026-08-15 07:11:38'),
('4aa4d24b-9dcb-48c6-acfc-3be9d0f32338', 'App\\Notifications\\SystemAlert', 'App\\Models\\User', 11, '{\"title\":\"New coin purchase request\",\"body\":\"ankit paid \\u20b949 for 49 coins.\",\"url\":\"\\/admin\\/coin-requests\",\"level\":\"info\"}', NULL, '2026-08-12 14:43:18', '2026-08-12 14:43:18'),
('4c63ad29-98e4-4d9a-a50e-06ce7ad5a443', 'App\\Notifications\\SystemAlert', 'App\\Models\\User', 1, '{\"title\":\"New coin purchase request\",\"body\":\"RAJESH paid \\u20b949 for 49 coins.\",\"url\":\"\\/admin\\/coin-requests\",\"level\":\"info\"}', '2026-08-19 06:44:54', '2026-08-18 14:30:07', '2026-08-19 06:44:54'),
('4d0cbefe-c598-4603-bed4-34a81abf31c2', 'App\\Notifications\\SystemAlert', 'App\\Models\\User', 11, '{\"title\":\"New service request\",\"body\":\"ankit requested Sim No. To Aadhar Number (#23).\",\"url\":\"\\/admin\\/service-requests\\/23\",\"level\":\"info\"}', NULL, '2026-08-14 12:33:36', '2026-08-14 12:33:36'),
('4f622e57-9252-40a8-9807-62024c3538ca', 'App\\Notifications\\SystemAlert', 'App\\Models\\User', 10, '{\"title\":\"New service request\",\"body\":\"RAJESH requested Passport Size Photo Set A4 & 4x6 as u req. (#36).\",\"url\":\"\\/admin\\/service-requests\\/36\",\"level\":\"info\"}', NULL, '2026-08-18 14:31:19', '2026-08-18 14:31:19'),
('4f830e2e-b17d-4805-baa6-a0e98af47031', 'App\\Notifications\\SystemAlert', 'App\\Models\\User', 11, '{\"title\":\"New service request\",\"body\":\"Deepak Kumar requested Aadhar Card Number to Pdf (#30).\",\"url\":\"\\/admin\\/service-requests\\/30\",\"level\":\"info\"}', NULL, '2026-08-15 06:58:29', '2026-08-15 06:58:29'),
('50f3a13f-c672-4b20-a2c7-245eb13aa6a1', 'App\\Notifications\\SystemAlert', 'App\\Models\\User', 11, '{\"title\":\"New service request\",\"body\":\"RAJESH requested Passport Size Photo Set A4 & 4x6 as u req. (#36).\",\"url\":\"\\/admin\\/service-requests\\/36\",\"level\":\"info\"}', NULL, '2026-08-18 14:31:19', '2026-08-18 14:31:19'),
('52335a1e-6630-474c-a013-268811be8c83', 'App\\Notifications\\SystemAlert', 'App\\Models\\User', 15, '{\"title\":\"Coin request rejected\",\"body\":\"Your request for 959 coins was rejected.\",\"url\":\"\\/admin\\/coin-requests\",\"level\":\"error\"}', '2026-08-15 06:58:52', '2026-08-13 16:58:09', '2026-08-15 06:58:52'),
('5268e985-0dcf-4d7f-b81a-341b49f52cd1', 'App\\Notifications\\SystemAlert', 'App\\Models\\User', 15, '{\"title\":\"Request Accepted\",\"body\":\"Your Aadhar Card Number to Pdf request #30 is now accepted.\",\"url\":\"\\/admin\\/service-requests\\/30\",\"level\":\"info\"}', NULL, '2026-08-15 06:59:41', '2026-08-15 06:59:41'),
('53307a3b-d6df-4aec-bf33-f4ff5fdc7847', 'App\\Notifications\\SystemAlert', 'App\\Models\\User', 10, '{\"title\":\"New service request\",\"body\":\"Deepak Verma requested Aadhar Card Address Change (#15).\",\"url\":\"\\/admin\\/service-requests\\/15\",\"level\":\"info\"}', NULL, '2026-08-13 17:00:29', '2026-08-13 17:00:29'),
('538e7ff8-56b3-4d5c-aa4e-404275fbb352', 'App\\Notifications\\SystemAlert', 'App\\Models\\User', 1, '{\"title\":\"New service request\",\"body\":\"Deepak Kumar requested Aadhar Card Number to Pdf (#33).\",\"url\":\"\\/admin\\/service-requests\\/33\",\"level\":\"info\"}', '2026-08-15 07:11:38', '2026-08-15 06:58:43', '2026-08-15 07:11:38'),
('53db71c7-8fc5-4d20-9bf4-7841c80bd751', 'App\\Notifications\\SystemAlert', 'App\\Models\\User', 11, '{\"title\":\"New service request\",\"body\":\"ankit requested Sim No. To Aadhar Number (#22).\",\"url\":\"\\/admin\\/service-requests\\/22\",\"level\":\"info\"}', NULL, '2026-08-13 21:39:35', '2026-08-13 21:39:35'),
('54bd18f0-7c9a-49f2-9606-fb1e249794b4', 'App\\Notifications\\SystemAlert', 'App\\Models\\User', 9, '{\"title\":\"Request Accepted\",\"body\":\"Your Passport Size Photo Set A4 & 4x6 as u req. request #12 is now accepted.\",\"url\":\"\\/admin\\/service-requests\\/12\",\"level\":\"info\"}', '2026-08-15 06:08:56', '2026-08-13 17:02:27', '2026-08-15 06:08:56'),
('57dfded1-8bb2-4184-9879-d6b444fd68cb', 'App\\Notifications\\SystemAlert', 'App\\Models\\User', 10, '{\"title\":\"New service request\",\"body\":\"RAJESH requested Passport Size Photo Set A4 & 4x6 as u req. (#34).\",\"url\":\"\\/admin\\/service-requests\\/34\",\"level\":\"info\"}', NULL, '2026-08-18 14:30:53', '2026-08-18 14:30:53'),
('57e68f06-1245-4b16-84fb-3a08c4fd2541', 'App\\Notifications\\SystemAlert', 'App\\Models\\User', 15, '{\"title\":\"Request Accepted\",\"body\":\"Your Aadhar Card Address Change request #14 is now accepted.\",\"url\":\"\\/admin\\/service-requests\\/14\",\"level\":\"info\"}', '2026-08-15 06:58:52', '2026-08-13 17:02:20', '2026-08-15 06:58:52'),
('598b1f04-e7c1-4e39-806b-f105b1c6b71e', 'App\\Notifications\\SystemAlert', 'App\\Models\\User', 29, '{\"title\":\"Coins added\",\"body\":\"Your purchase of 49 coins (\\u20b949) was approved. New balance: 49 coins.\",\"url\":\"\\/dashboard\",\"level\":\"success\"}', NULL, '2026-08-19 17:15:14', '2026-08-19 17:15:14'),
('5a2312c2-5765-45a6-b11b-fa656c2871ec', 'App\\Notifications\\SystemAlert', 'App\\Models\\User', 1, '{\"title\":\"New coin purchase request\",\"body\":\"ankit paid \\u20b949 for 49 coins.\",\"url\":\"\\/admin\\/coin-requests\",\"level\":\"info\"}', '2026-08-15 07:11:38', '2026-08-12 15:04:47', '2026-08-15 07:11:38'),
('5af3fa0a-1c15-4055-8018-a7170ad9848b', 'App\\Notifications\\SystemAlert', 'App\\Models\\User', 1, '{\"title\":\"New service request\",\"body\":\"ankit requested Sim No. To Aadhar Number (#22).\",\"url\":\"\\/admin\\/service-requests\\/22\",\"level\":\"info\"}', '2026-08-15 07:11:38', '2026-08-13 21:39:35', '2026-08-15 07:11:38'),
('5c3e05e2-6c7c-43fe-bfc1-ae030c7505f9', 'App\\Notifications\\SystemAlert', 'App\\Models\\User', 1, '{\"title\":\"New service request\",\"body\":\"RAJESH requested Passport Size Photo Set A4 & 4x6 as u req. (#34).\",\"url\":\"\\/admin\\/service-requests\\/34\",\"level\":\"info\"}', '2026-08-19 06:44:54', '2026-08-18 14:30:53', '2026-08-19 06:44:54'),
('605772d4-8c1c-4945-9541-46a4b9e324c9', 'App\\Notifications\\SystemAlert', 'App\\Models\\User', 11, '{\"title\":\"New service request\",\"body\":\"Deepak Verma requested Aadhar to Pan Find Instant (#26).\",\"url\":\"\\/admin\\/service-requests\\/26\",\"level\":\"info\"}', NULL, '2026-08-14 16:16:00', '2026-08-14 16:16:00'),
('608960ff-aa1d-4e55-9b0a-1232d6be3945', 'App\\Notifications\\SystemAlert', 'App\\Models\\User', 11, '{\"title\":\"New service request\",\"body\":\"Deepak Kumar requested Aadhar Card Number to Pdf (#32).\",\"url\":\"\\/admin\\/service-requests\\/32\",\"level\":\"info\"}', NULL, '2026-08-15 06:58:41', '2026-08-15 06:58:41'),
('63c97484-d9fe-47c7-b8e3-0a5b440e848d', 'App\\Notifications\\SystemAlert', 'App\\Models\\User', 1, '{\"title\":\"New service request\",\"body\":\"RAJESH requested Passport Size Photo Set A4 & 4x6 as u req. (#35).\",\"url\":\"\\/admin\\/service-requests\\/35\",\"level\":\"info\"}', '2026-08-19 06:44:54', '2026-08-18 14:31:11', '2026-08-19 06:44:54'),
('64547e58-4afd-4e65-8f84-36a25efa0c22', 'App\\Notifications\\SystemAlert', 'App\\Models\\User', 10, '{\"title\":\"New service request\",\"body\":\"ankit requested Mobile no. To aadhar Number (#11).\",\"url\":\"\\/admin\\/service-requests\\/11\",\"level\":\"info\"}', NULL, '2026-08-12 15:05:21', '2026-08-12 15:05:21'),
('64905d13-53ec-4ef8-b93a-9d784b88cff8', 'App\\Notifications\\SystemAlert', 'App\\Models\\User', 1, '{\"title\":\"New coin purchase request\",\"body\":\"Deepak Verma paid \\u20b9799 for 959 coins.\",\"url\":\"\\/admin\\/coin-requests\",\"level\":\"info\"}', '2026-08-15 07:11:38', '2026-08-14 14:20:42', '2026-08-15 07:11:38'),
('65598b99-ceca-416f-bb85-1df346832b19', 'App\\Notifications\\SystemAlert', 'App\\Models\\User', 10, '{\"title\":\"New coin purchase request\",\"body\":\"Deepak Verma paid \\u20b9799 for 959 coins.\",\"url\":\"\\/admin\\/coin-requests\",\"level\":\"info\"}', NULL, '2026-08-13 16:57:52', '2026-08-13 16:57:52'),
('6656f40a-a2cd-414a-9faf-299dbd03f9e1', 'App\\Notifications\\SystemAlert', 'App\\Models\\User', 11, '{\"title\":\"New coin purchase request\",\"body\":\"Deepak Verma paid \\u20b9799 for 959 coins.\",\"url\":\"\\/admin\\/coin-requests\",\"level\":\"info\"}', NULL, '2026-08-14 14:20:42', '2026-08-14 14:20:42'),
('684e29d9-b951-411e-85a3-940ed94b8e2a', 'App\\Notifications\\SystemAlert', 'App\\Models\\User', 10, '{\"title\":\"New service request\",\"body\":\"RAJESH requested Passport Size Photo Set A4 & 4x6 as u req. (#35).\",\"url\":\"\\/admin\\/service-requests\\/35\",\"level\":\"info\"}', NULL, '2026-08-18 14:31:11', '2026-08-18 14:31:11'),
('69377aac-3999-4b3a-b911-30a88ebd02e7', 'App\\Notifications\\SystemAlert', 'App\\Models\\User', 11, '{\"title\":\"New coin purchase request\",\"body\":\"Deepak Verma paid \\u20b9799 for 959 coins.\",\"url\":\"\\/admin\\/coin-requests\",\"level\":\"info\"}', NULL, '2026-08-14 14:20:41', '2026-08-14 14:20:41'),
('694aad7a-039b-4390-a9aa-688dc243ea49', 'App\\Notifications\\SystemAlert', 'App\\Models\\User', 10, '{\"title\":\"New service request\",\"body\":\"Deepak Verma requested Aadhar Card Address Change (#16).\",\"url\":\"\\/admin\\/service-requests\\/16\",\"level\":\"info\"}', NULL, '2026-08-13 17:00:36', '2026-08-13 17:00:36'),
('69d979ef-db3d-411d-9fc9-44ff7e5d116c', 'App\\Notifications\\SystemAlert', 'App\\Models\\User', 9, '{\"title\":\"Request Rejected\",\"body\":\"Your Passport Size Photo Set A4 & 4x6 as u req. request #12 is now rejected. 9 coins have been refunded to your account.\",\"url\":\"\\/admin\\/service-requests\\/12\",\"level\":\"error\"}', '2026-08-15 06:08:56', '2026-08-12 17:16:36', '2026-08-15 06:08:56'),
('6a203c8b-6707-4e46-9f21-e1f6ba55a5a8', 'App\\Notifications\\SystemAlert', 'App\\Models\\User', 1, '{\"title\":\"New service request\",\"body\":\"Deepak Kumar requested Marriage Certificate Apply only Panipat (#29).\",\"url\":\"\\/admin\\/service-requests\\/29\",\"level\":\"info\"}', '2026-08-15 07:11:38', '2026-08-15 06:57:55', '2026-08-15 07:11:38'),
('6d1ca5ed-3c8c-4f21-99fa-f67a38b894e5', 'App\\Notifications\\SystemAlert', 'App\\Models\\User', 1, '{\"title\":\"New service request\",\"body\":\"Rajesh requested Mobile no. To aadhar Number (#10).\",\"url\":\"\\/admin\\/service-requests\\/10\",\"level\":\"info\"}', '2026-08-15 07:11:38', '2026-08-12 14:54:15', '2026-08-15 07:11:38'),
('6d7f8130-6a05-40ba-a69d-ce9f23f8a6c0', 'App\\Notifications\\SystemAlert', 'App\\Models\\User', 11, '{\"title\":\"New service request\",\"body\":\"Deepak Kumar requested Aadhaar Pdf to Pvc Card Instant (#31).\",\"url\":\"\\/admin\\/service-requests\\/31\",\"level\":\"info\"}', NULL, '2026-08-15 06:58:35', '2026-08-15 06:58:35'),
('6e68fc89-d63a-4a63-a8c6-98340e3c9bd1', 'App\\Notifications\\SystemAlert', 'App\\Models\\User', 10, '{\"title\":\"New coin purchase request\",\"body\":\"Deepak Verma paid \\u20b9799 for 959 coins.\",\"url\":\"\\/admin\\/coin-requests\",\"level\":\"info\"}', NULL, '2026-08-13 16:57:51', '2026-08-13 16:57:51'),
('6eda0a84-3055-4bac-b2d3-b1c003b863ba', 'App\\Notifications\\SystemAlert', 'App\\Models\\User', 10, '{\"title\":\"New service request\",\"body\":\"Deepak Verma requested Aadhaar Pdf to Pvc Card Instant (#20).\",\"url\":\"\\/admin\\/service-requests\\/20\",\"level\":\"info\"}', NULL, '2026-08-13 17:01:30', '2026-08-13 17:01:30'),
('6f8baa8c-25cc-4ccc-8420-53fd6a110bf4', 'App\\Notifications\\SystemAlert', 'App\\Models\\User', 27, '{\"title\":\"Request Accepted\",\"body\":\"Your Passport Size Photo Set A4 & 4x6 as u req. request #36 is now accepted.\",\"url\":\"\\/admin\\/service-requests\\/36\",\"level\":\"info\"}', NULL, '2026-08-18 14:31:48', '2026-08-18 14:31:48'),
('6fecc11f-a888-4fd9-a65c-9e05e00b915f', 'App\\Notifications\\SystemAlert', 'App\\Models\\User', 10, '{\"title\":\"New coin purchase request\",\"body\":\" paid \\u20b9199 for 219 coins.\",\"url\":\"\\/admin\\/coin-requests\",\"level\":\"info\"}', NULL, '2026-08-19 13:48:58', '2026-08-19 13:48:58'),
('71753f1e-b5cc-4fd5-b4ad-665ed3ae5848', 'App\\Notifications\\SystemAlert', 'App\\Models\\User', 15, '{\"title\":\"Request Accepted\",\"body\":\"Your Aadhar Card Address Change request #15 is now accepted.\",\"url\":\"\\/admin\\/service-requests\\/15\",\"level\":\"info\"}', '2026-08-15 06:58:52', '2026-08-13 17:02:12', '2026-08-15 06:58:52'),
('7221be13-35a7-4d94-a163-cf5e93da2a15', 'App\\Notifications\\SystemAlert', 'App\\Models\\User', 11, '{\"title\":\"New service request\",\"body\":\"Deepak Verma requested Aadhar Card Address Change (#18).\",\"url\":\"\\/admin\\/service-requests\\/18\",\"level\":\"info\"}', NULL, '2026-08-13 17:00:52', '2026-08-13 17:00:52'),
('75198d1e-f920-47ba-9368-fd07d0e1bcd7', 'App\\Notifications\\SystemAlert', 'App\\Models\\User', 1, '{\"title\":\"New service request\",\"body\":\"Deepak Verma requested Vehicle Number to Info (#25).\",\"url\":\"\\/admin\\/service-requests\\/25\",\"level\":\"info\"}', '2026-08-15 07:11:38', '2026-08-14 16:14:01', '2026-08-15 07:11:38'),
('7733a842-bae2-4ef2-ba91-dfa6aa6b4fa2', 'App\\Notifications\\SystemAlert', 'App\\Models\\User', 11, '{\"title\":\"New coin purchase request\",\"body\":\"Deepak Verma paid \\u20b9799 for 959 coins.\",\"url\":\"\\/admin\\/coin-requests\",\"level\":\"info\"}', NULL, '2026-08-14 14:20:43', '2026-08-14 14:20:43'),
('7e895a85-a8e4-4516-b452-91b3cfbc7185', 'App\\Notifications\\SystemAlert', 'App\\Models\\User', 15, '{\"title\":\"Request Accepted\",\"body\":\"Your Aadhar Number To AADHAR PDF request #28 is now accepted.\",\"url\":\"\\/admin\\/service-requests\\/28\",\"level\":\"info\"}', NULL, '2026-08-15 06:59:48', '2026-08-15 06:59:48'),
('7eb4e119-d29e-408f-ae56-84763a0181aa', 'App\\Notifications\\SystemAlert', 'App\\Models\\User', 10, '{\"title\":\"New coin purchase request\",\"body\":\"ankit paid \\u20b949 for 49 coins.\",\"url\":\"\\/admin\\/coin-requests\",\"level\":\"info\"}', NULL, '2026-08-12 15:04:47', '2026-08-12 15:04:47'),
('818d41cd-8242-49ff-b0dd-ab0c1ade1bec', 'App\\Notifications\\SystemAlert', 'App\\Models\\User', 15, '{\"title\":\"Coins added\",\"body\":\"Your purchase of 959 coins (\\u20b9799) was approved. New balance: 3852 coins.\",\"url\":\"\\/dashboard\",\"level\":\"success\"}', '2026-08-15 06:58:52', '2026-08-14 16:08:45', '2026-08-15 06:58:52'),
('81d77227-53aa-438f-b19d-5d3f5abe52d0', 'App\\Notifications\\SystemAlert', 'App\\Models\\User', 15, '{\"title\":\"Request Accepted\",\"body\":\"Your Aadhaar Pdf to Pvc Card Instant request #31 is now accepted.\",\"url\":\"\\/admin\\/service-requests\\/31\",\"level\":\"info\"}', NULL, '2026-08-15 06:59:35', '2026-08-15 06:59:35'),
('824c6014-c910-4a79-8db0-1e2c0be2e4c6', 'App\\Notifications\\SystemAlert', 'App\\Models\\User', 15, '{\"title\":\"Request Accepted\",\"body\":\"Your Aadhar Card Number to Pdf request #33 is now accepted.\",\"url\":\"\\/admin\\/service-requests\\/33\",\"level\":\"info\"}', NULL, '2026-08-15 06:59:28', '2026-08-15 06:59:28'),
('825399ee-628e-4c39-8580-6a8df0b3ad58', 'App\\Notifications\\SystemAlert', 'App\\Models\\User', 15, '{\"title\":\"Coins added\",\"body\":\"Your purchase of 959 coins (\\u20b9799) was approved. New balance: 1918 coins.\",\"url\":\"\\/dashboard\",\"level\":\"success\"}', '2026-08-15 06:58:52', '2026-08-13 16:58:21', '2026-08-15 06:58:52'),
('85f3f514-72ca-471a-89ca-e457a5ba8003', 'App\\Notifications\\SystemAlert', 'App\\Models\\User', 1, '{\"title\":\"New coin purchase request\",\"body\":\"ankit paid \\u20b949 for 49 coins.\",\"url\":\"\\/admin\\/coin-requests\",\"level\":\"info\"}', '2026-08-15 07:11:38', '2026-08-12 14:48:21', '2026-08-15 07:11:38'),
('86221b67-fd15-443f-bc13-51c9a3ec6af3', 'App\\Notifications\\SystemAlert', 'App\\Models\\User', 13, '{\"title\":\"Coins added\",\"body\":\"Your purchase of 49 coins (\\u20b949) was approved. New balance: 49 coins.\",\"url\":\"\\/dashboard\",\"level\":\"success\"}', NULL, '2026-08-12 14:53:13', '2026-08-12 14:53:13'),
('8840be5e-d943-4c9c-b912-b37591ab6e1b', 'App\\Notifications\\SystemAlert', 'App\\Models\\User', 15, '{\"title\":\"Coin request rejected\",\"body\":\"Your request for 959 coins was rejected.\",\"url\":\"\\/admin\\/coin-requests\",\"level\":\"error\"}', '2026-08-15 06:58:52', '2026-08-13 16:58:12', '2026-08-15 06:58:52'),
('888599a3-3f3f-483a-99ee-c16ab8896661', 'App\\Notifications\\SystemAlert', 'App\\Models\\User', 14, '{\"title\":\"Coins added\",\"body\":\"Your purchase of 105 coins (\\u20b999) was approved. New balance: 105 coins.\",\"url\":\"\\/dashboard\",\"level\":\"success\"}', NULL, '2026-08-12 14:53:54', '2026-08-12 14:53:54'),
('8ab781e0-62c1-4aeb-bdc4-308034e7fb0f', 'App\\Notifications\\SystemAlert', 'App\\Models\\User', 11, '{\"title\":\"New coin purchase request\",\"body\":\"Deepak Verma paid \\u20b9799 for 959 coins.\",\"url\":\"\\/admin\\/coin-requests\",\"level\":\"info\"}', NULL, '2026-08-13 16:57:48', '2026-08-13 16:57:48'),
('8b75c2af-3de9-43ad-9647-85c82da801de', 'App\\Notifications\\SystemAlert', 'App\\Models\\User', 11, '{\"title\":\"New service request\",\"body\":\"Deepak Verma requested Sim No. To Aadhar Number (#24).\",\"url\":\"\\/admin\\/service-requests\\/24\",\"level\":\"info\"}', NULL, '2026-08-14 16:10:43', '2026-08-14 16:10:43'),
('8cd5e6c1-b204-4fd1-99c9-ef2aaf623053', 'App\\Notifications\\SystemAlert', 'App\\Models\\User', 11, '{\"title\":\"New coin purchase request\",\"body\":\"Deepak Verma paid \\u20b999 for 105 coins.\",\"url\":\"\\/admin\\/coin-requests\",\"level\":\"info\"}', NULL, '2026-08-13 17:05:03', '2026-08-13 17:05:03'),
('8d3f9416-3845-4fef-bcec-aa4819003637', 'App\\Notifications\\SystemAlert', 'App\\Models\\User', 15, '{\"title\":\"Request Accepted\",\"body\":\"Your Puc Certificate With otp request #19 is now accepted.\",\"url\":\"\\/admin\\/service-requests\\/19\",\"level\":\"info\"}', '2026-08-15 06:58:52', '2026-08-13 17:01:55', '2026-08-15 06:58:52'),
('8d453bbc-18a7-483e-819d-52caa24e49de', 'App\\Notifications\\SystemAlert', 'App\\Models\\User', 11, '{\"title\":\"New service request\",\"body\":\"Deepak Verma requested Aadhar Card Address Change (#13).\",\"url\":\"\\/admin\\/service-requests\\/13\",\"level\":\"info\"}', NULL, '2026-08-13 17:00:09', '2026-08-13 17:00:09'),
('8e9bfcbb-e56e-4f31-98d9-f21b12728b37', 'App\\Notifications\\SystemAlert', 'App\\Models\\User', 28, '{\"title\":\"Coins added\",\"body\":\"Your purchase of 219 coins (\\u20b9199) was approved. New balance: 219 coins.\",\"url\":\"\\/dashboard\",\"level\":\"success\"}', NULL, '2026-08-19 17:10:27', '2026-08-19 17:10:27'),
('8f4b2375-d5e9-447c-a23b-77167cabc170', 'App\\Notifications\\SystemAlert', 'App\\Models\\User', 15, '{\"title\":\"Request Accepted\",\"body\":\"Your Aadhar Card Address Change request #18 is now accepted.\",\"url\":\"\\/admin\\/service-requests\\/18\",\"level\":\"info\"}', '2026-08-15 06:58:52', '2026-08-13 17:01:59', '2026-08-15 06:58:52'),
('92724426-4742-40dd-873d-c134665b35f5', 'App\\Notifications\\SystemAlert', 'App\\Models\\User', 11, '{\"title\":\"New service request\",\"body\":\"Deepak Verma requested Aadhaar Pdf to Pvc Card Instant (#20).\",\"url\":\"\\/admin\\/service-requests\\/20\",\"level\":\"info\"}', NULL, '2026-08-13 17:01:30', '2026-08-13 17:01:30'),
('940387b9-2f1d-4474-896b-586712de73d7', 'App\\Notifications\\SystemAlert', 'App\\Models\\User', 1, '{\"title\":\"New coin purchase request\",\"body\":\"ankit paid \\u20b949 for 49 coins.\",\"url\":\"\\/admin\\/coin-requests\",\"level\":\"info\"}', '2026-08-15 07:11:38', '2026-08-12 14:43:18', '2026-08-15 07:11:38'),
('95bd40de-184b-414a-8490-e00e946d078c', 'App\\Notifications\\SystemAlert', 'App\\Models\\User', 10, '{\"title\":\"New coin purchase request\",\"body\":\"Deepak Verma paid \\u20b9799 for 959 coins.\",\"url\":\"\\/admin\\/coin-requests\",\"level\":\"info\"}', NULL, '2026-08-14 14:20:40', '2026-08-14 14:20:40'),
('972db578-1493-454a-b647-64d76963f5b4', 'App\\Notifications\\SystemAlert', 'App\\Models\\User', 15, '{\"title\":\"Request Accepted\",\"body\":\"Your Pan To Aadhar request #27 is now accepted.\",\"url\":\"\\/admin\\/service-requests\\/27\",\"level\":\"info\"}', '2026-08-15 16:29:21', '2026-08-15 07:00:04', '2026-08-15 16:29:21'),
('98d8f48e-e31e-4a8c-a33f-721c37bac807', 'App\\Notifications\\SystemAlert', 'App\\Models\\User', 1, '{\"title\":\"New service request\",\"body\":\"Deepak Kumar requested Aadhar Card Number to Pdf (#32).\",\"url\":\"\\/admin\\/service-requests\\/32\",\"level\":\"info\"}', '2026-08-15 07:11:38', '2026-08-15 06:58:41', '2026-08-15 07:11:38'),
('99621716-ad44-4e8c-a66e-c79b64656ba1', 'App\\Notifications\\SystemAlert', 'App\\Models\\User', 1, '{\"title\":\"New coin purchase request\",\"body\":\"Deepak Verma paid \\u20b9799 for 959 coins.\",\"url\":\"\\/admin\\/coin-requests\",\"level\":\"info\"}', '2026-08-15 07:11:38', '2026-08-14 14:20:35', '2026-08-15 07:11:38'),
('9b251a5b-f7a3-4169-83f3-4ef82a2dd84a', 'App\\Notifications\\SystemAlert', 'App\\Models\\User', 1, '{\"title\":\"New service request\",\"body\":\"Deepak Verma requested Puc Certificate With otp (#19).\",\"url\":\"\\/admin\\/service-requests\\/19\",\"level\":\"info\"}', '2026-08-15 07:11:38', '2026-08-13 17:01:11', '2026-08-15 07:11:38'),
('9b7c9b3f-070d-445f-b40b-7efd8fc9af37', 'App\\Notifications\\SystemAlert', 'App\\Models\\User', 11, '{\"title\":\"New service request\",\"body\":\"Deepak Kumar requested Aadhar Number To AADHAR PDF (#28).\",\"url\":\"\\/admin\\/service-requests\\/28\",\"level\":\"info\"}', NULL, '2026-08-15 06:56:59', '2026-08-15 06:56:59'),
('9d184025-124b-4b33-9552-2b463b224246', 'App\\Notifications\\SystemAlert', 'App\\Models\\User', 9, '{\"title\":\"Request Accepted\",\"body\":\"Your Mobile no. To aadhar Number request #9 is now accepted.\",\"url\":\"\\/admin\\/service-requests\\/9\",\"level\":\"info\"}', '2026-08-15 06:08:56', '2026-08-12 15:05:38', '2026-08-15 06:08:56'),
('9d5affed-4f53-48a4-be49-760b5bde33cb', 'App\\Notifications\\SystemAlert', 'App\\Models\\User', 1, '{\"title\":\"New service request\",\"body\":\"Deepak Verma requested Aadhar to Pan Find Instant (#26).\",\"url\":\"\\/admin\\/service-requests\\/26\",\"level\":\"info\"}', '2026-08-15 07:11:38', '2026-08-14 16:16:00', '2026-08-15 07:11:38'),
('9dd5b594-5760-4463-af46-94647f0cd788', 'App\\Notifications\\SystemAlert', 'App\\Models\\User', 15, '{\"title\":\"Coins added\",\"body\":\"Your purchase of 959 coins (\\u20b9799) was approved. New balance: 4811 coins.\",\"url\":\"\\/dashboard\",\"level\":\"success\"}', '2026-08-15 06:58:52', '2026-08-14 16:08:46', '2026-08-15 06:58:52'),
('9e4c9a79-e808-4eaa-a2f6-94ff79d95400', 'App\\Notifications\\SystemAlert', 'App\\Models\\User', 1, '{\"title\":\"New service request\",\"body\":\"ankit requested Sim No. To Aadhar Number (#23).\",\"url\":\"\\/admin\\/service-requests\\/23\",\"level\":\"info\"}', '2026-08-15 07:11:38', '2026-08-14 12:33:36', '2026-08-15 07:11:38'),
('a143c1e9-8b3a-47d8-8e17-f6322ac0a0a4', 'App\\Notifications\\SystemAlert', 'App\\Models\\User', 1, '{\"title\":\"New coin purchase request\",\"body\":\"Deepak Verma paid \\u20b9799 for 959 coins.\",\"url\":\"\\/admin\\/coin-requests\",\"level\":\"info\"}', '2026-08-15 07:11:38', '2026-08-14 14:20:42', '2026-08-15 07:11:38'),
('a18bda17-572c-4ffe-b2a5-c9fbaf44cc2c', 'App\\Notifications\\SystemAlert', 'App\\Models\\User', 10, '{\"title\":\"New coin purchase request\",\"body\":\"Deepak Verma paid \\u20b9799 for 959 coins.\",\"url\":\"\\/admin\\/coin-requests\",\"level\":\"info\"}', NULL, '2026-08-14 14:20:42', '2026-08-14 14:20:42'),
('a1efec57-f9f4-42e1-9f4f-6469ffd07335', 'App\\Notifications\\SystemAlert', 'App\\Models\\User', 11, '{\"title\":\"New service request\",\"body\":\"sam requested Passport Size Photo Set A4 & 4x6 as u req. (#12).\",\"url\":\"\\/admin\\/service-requests\\/12\",\"level\":\"info\"}', NULL, '2026-08-12 17:16:09', '2026-08-12 17:16:09'),
('a4391fbb-53f3-44a3-9229-e605166fa22d', 'App\\Notifications\\SystemAlert', 'App\\Models\\User', 10, '{\"title\":\"New service request\",\"body\":\"Deepak Kumar requested Aadhar Number To AADHAR PDF (#28).\",\"url\":\"\\/admin\\/service-requests\\/28\",\"level\":\"info\"}', NULL, '2026-08-15 06:56:59', '2026-08-15 06:56:59'),
('a4e13a59-52ab-4dc3-9807-63049d5de750', 'App\\Notifications\\SystemAlert', 'App\\Models\\User', 15, '{\"title\":\"Coin request rejected\",\"body\":\"Your request for 959 coins was rejected.\",\"url\":\"\\/admin\\/coin-requests\",\"level\":\"error\"}', '2026-08-15 06:58:52', '2026-08-13 16:58:14', '2026-08-15 06:58:52'),
('a5529bbd-2f02-4fcb-acce-77d8e0abe1ee', 'App\\Notifications\\SystemAlert', 'App\\Models\\User', 10, '{\"title\":\"New service request\",\"body\":\"Deepak Kumar requested Aadhar Card Number to Pdf (#33).\",\"url\":\"\\/admin\\/service-requests\\/33\",\"level\":\"info\"}', NULL, '2026-08-15 06:58:43', '2026-08-15 06:58:43'),
('a5ccafaa-f6b0-4e4a-ae9c-954a2e0be6c8', 'App\\Notifications\\SystemAlert', 'App\\Models\\User', 1, '{\"title\":\"New service request\",\"body\":\"Deepak Verma requested Sim No. To Aadhar Number (#24).\",\"url\":\"\\/admin\\/service-requests\\/24\",\"level\":\"info\"}', '2026-08-15 07:11:38', '2026-08-14 16:10:43', '2026-08-15 07:11:38'),
('a5f4460f-fb86-484b-a66d-c4bb17d76ea8', 'App\\Notifications\\SystemAlert', 'App\\Models\\User', 9, '{\"title\":\"Request In Progress\",\"body\":\"Your Mobile no. To aadhar Number request #9 is now in progress.\",\"url\":\"\\/admin\\/service-requests\\/9\",\"level\":\"info\"}', '2026-08-15 06:08:56', '2026-08-12 14:37:50', '2026-08-15 06:08:56'),
('a67439c0-807e-485a-a8cc-5e901708dfed', 'App\\Notifications\\SystemAlert', 'App\\Models\\User', 10, '{\"title\":\"New service request\",\"body\":\"Deepak Kumar requested Aadhar Card Number to Pdf (#32).\",\"url\":\"\\/admin\\/service-requests\\/32\",\"level\":\"info\"}', NULL, '2026-08-15 06:58:41', '2026-08-15 06:58:41'),
('a77a4bb6-73cf-4c88-9bda-d725d69cff5a', 'App\\Notifications\\SystemAlert', 'App\\Models\\User', 1, '{\"title\":\"New service request\",\"body\":\"Deepak Verma requested Aadhar Card Address Change (#13).\",\"url\":\"\\/admin\\/service-requests\\/13\",\"level\":\"info\"}', '2026-08-15 07:11:38', '2026-08-13 17:00:09', '2026-08-15 07:11:38'),
('a8cbc755-b6e2-4ada-b13d-776f0c7e7c5f', 'App\\Notifications\\SystemAlert', 'App\\Models\\User', 10, '{\"title\":\"New coin purchase request\",\"body\":\"ankit paid \\u20b949 for 49 coins.\",\"url\":\"\\/admin\\/coin-requests\",\"level\":\"info\"}', NULL, '2026-08-12 14:43:22', '2026-08-12 14:43:22'),
('a9912f59-2206-4ed3-9dc2-cf94396fe936', 'App\\Notifications\\SystemAlert', 'App\\Models\\User', 11, '{\"title\":\"New coin purchase request\",\"body\":\"Deepak Verma paid \\u20b9799 for 959 coins.\",\"url\":\"\\/admin\\/coin-requests\",\"level\":\"info\"}', NULL, '2026-08-13 16:57:51', '2026-08-13 16:57:51'),
('aa7fce4f-6600-45b3-9eba-689d719d821d', 'App\\Notifications\\SystemAlert', 'App\\Models\\User', 1, '{\"title\":\"New coin purchase request\",\"body\":\"Deepak Verma paid \\u20b9799 for 959 coins.\",\"url\":\"\\/admin\\/coin-requests\",\"level\":\"info\"}', '2026-08-15 07:11:38', '2026-08-13 16:57:51', '2026-08-15 07:11:38'),
('ab0144bc-71a7-4665-b2d1-4d0950754e91', 'App\\Notifications\\SystemAlert', 'App\\Models\\User', 11, '{\"title\":\"New coin purchase request\",\"body\":\"Rajesh paid \\u20b999 for 105 coins.\",\"url\":\"\\/admin\\/coin-requests\",\"level\":\"info\"}', NULL, '2026-08-12 14:53:48', '2026-08-12 14:53:48'),
('ab69896b-e755-4140-a9f7-e985f6cf577b', 'App\\Notifications\\SystemAlert', 'App\\Models\\User', 1, '{\"title\":\"New service request\",\"body\":\"Deepak Kumar requested Aadhaar Pdf to Pvc Card Instant (#31).\",\"url\":\"\\/admin\\/service-requests\\/31\",\"level\":\"info\"}', '2026-08-15 07:11:38', '2026-08-15 06:58:35', '2026-08-15 07:11:38'),
('aba0989e-92a8-46e9-adc5-c9dd6ba76537', 'App\\Notifications\\SystemAlert', 'App\\Models\\User', 1, '{\"title\":\"New coin purchase request\",\"body\":\"Deepak Verma paid \\u20b9799 for 959 coins.\",\"url\":\"\\/admin\\/coin-requests\",\"level\":\"info\"}', '2026-08-15 07:11:38', '2026-08-14 14:20:40', '2026-08-15 07:11:38'),
('ac025f22-38b0-42b6-9437-c0d6d23c3dd2', 'App\\Notifications\\SystemAlert', 'App\\Models\\User', 10, '{\"title\":\"New coin purchase request\",\"body\":\"Shanu paid \\u20b999 for 105 coins.\",\"url\":\"\\/admin\\/coin-requests\",\"level\":\"info\"}', NULL, '2026-08-17 13:36:08', '2026-08-17 13:36:08'),
('ac26f1f4-589b-4b7d-b84e-3b2ac8f2f7ba', 'App\\Notifications\\SystemAlert', 'App\\Models\\User', 10, '{\"title\":\"New coin purchase request\",\"body\":\"Deepak Verma paid \\u20b9799 for 959 coins.\",\"url\":\"\\/admin\\/coin-requests\",\"level\":\"info\"}', NULL, '2026-08-14 14:20:41', '2026-08-14 14:20:41');
INSERT INTO `notifications` (`id`, `type`, `notifiable_type`, `notifiable_id`, `data`, `read_at`, `created_at`, `updated_at`) VALUES
('ac79d831-11dd-4e17-bf01-04f935646824', 'App\\Notifications\\SystemAlert', 'App\\Models\\User', 1, '{\"title\":\"New service request\",\"body\":\"Deepak Verma requested Aadhar Card Address Change (#18).\",\"url\":\"\\/admin\\/service-requests\\/18\",\"level\":\"info\"}', '2026-08-15 07:11:38', '2026-08-13 17:00:52', '2026-08-15 07:11:38'),
('ace092bd-846c-48ea-b85c-f4b2fc1603fc', 'App\\Notifications\\SystemAlert', 'App\\Models\\User', 10, '{\"title\":\"New coin purchase request\",\"body\":\"Rajesh paid \\u20b999 for 105 coins.\",\"url\":\"\\/admin\\/coin-requests\",\"level\":\"info\"}', NULL, '2026-08-12 14:53:48', '2026-08-12 14:53:48'),
('adb3fa1b-27c4-4d76-a8d9-e23dd4ca7311', 'App\\Notifications\\SystemAlert', 'App\\Models\\User', 15, '{\"title\":\"Request In Progress\",\"body\":\"Your Aadhar to Pan Find Instant request #26 is now in progress. Note: PENDING FOR SIET\",\"url\":\"\\/admin\\/service-requests\\/26\",\"level\":\"info\"}', '2026-08-15 06:58:52', '2026-08-14 16:16:58', '2026-08-15 06:58:52'),
('afed02e7-1b96-46d3-a55b-3ccd59374474', 'App\\Notifications\\SystemAlert', 'App\\Models\\User', 11, '{\"title\":\"New coin purchase request\",\"body\":\"ankit paid \\u20b949 for 49 coins.\",\"url\":\"\\/admin\\/coin-requests\",\"level\":\"info\"}', NULL, '2026-08-12 14:48:21', '2026-08-12 14:48:21'),
('b0cc94b9-bafb-4b8c-9567-2341683075d7', 'App\\Notifications\\SystemAlert', 'App\\Models\\User', 10, '{\"title\":\"New coin purchase request\",\"body\":\"Deepak Verma paid \\u20b9799 for 959 coins.\",\"url\":\"\\/admin\\/coin-requests\",\"level\":\"info\"}', NULL, '2026-08-13 16:57:48', '2026-08-13 16:57:48'),
('b3e00194-91e8-4748-9efc-1f35812700d3', 'App\\Notifications\\SystemAlert', 'App\\Models\\User', 1, '{\"title\":\"New coin purchase request\",\"body\":\"Deepak Verma paid \\u20b9799 for 959 coins.\",\"url\":\"\\/admin\\/coin-requests\",\"level\":\"info\"}', '2026-08-15 07:11:38', '2026-08-13 16:57:51', '2026-08-15 07:11:38'),
('b4e4f191-fbd5-4772-8d3d-e242c18b40c6', 'App\\Notifications\\SystemAlert', 'App\\Models\\User', 1, '{\"title\":\"New service request\",\"body\":\"Deepak Verma requested Aadhar Card Address Change (#16).\",\"url\":\"\\/admin\\/service-requests\\/16\",\"level\":\"info\"}', '2026-08-15 07:11:38', '2026-08-13 17:00:36', '2026-08-15 07:11:38'),
('b4f0454c-4952-4f2c-ba09-d10f4c197930', 'App\\Notifications\\SystemAlert', 'App\\Models\\User', 15, '{\"title\":\"Coins added\",\"body\":\"Your purchase of 959 coins (\\u20b9799) was approved. New balance: 2893 coins.\",\"url\":\"\\/dashboard\",\"level\":\"success\"}', '2026-08-15 06:58:52', '2026-08-14 16:08:43', '2026-08-15 06:58:52'),
('b52231fe-264d-4dff-a75b-8c737ad0316d', 'App\\Notifications\\SystemAlert', 'App\\Models\\User', 1, '{\"title\":\"New service request\",\"body\":\"sam requested Passport Size Photo Set A4 & 4x6 as u req. (#12).\",\"url\":\"\\/admin\\/service-requests\\/12\",\"level\":\"info\"}', '2026-08-12 17:23:12', '2026-08-12 17:16:09', '2026-08-12 17:23:12'),
('b6032844-63ae-4fb6-b1a6-ddd5e000c710', 'App\\Notifications\\SystemAlert', 'App\\Models\\User', 15, '{\"title\":\"Request Accepted\",\"body\":\"Your Aadhar to Pan Find Instant request #26 is now accepted. Note: GDKPK7001K\",\"url\":\"\\/admin\\/service-requests\\/26\",\"level\":\"info\"}', '2026-08-15 06:58:52', '2026-08-14 16:16:27', '2026-08-15 06:58:52'),
('b7986754-5152-4579-9a33-cf03056482b6', 'App\\Notifications\\SystemAlert', 'App\\Models\\User', 11, '{\"title\":\"New service request\",\"body\":\"Deepak Verma requested Aadhar Card Address Change (#15).\",\"url\":\"\\/admin\\/service-requests\\/15\",\"level\":\"info\"}', NULL, '2026-08-13 17:00:29', '2026-08-13 17:00:29'),
('b83a5e91-bdc8-4732-b8a1-491e96a905ab', 'App\\Notifications\\SystemAlert', 'App\\Models\\User', 10, '{\"title\":\"New service request\",\"body\":\"Deepak Kumar requested Aadhar Card Number to Pdf (#30).\",\"url\":\"\\/admin\\/service-requests\\/30\",\"level\":\"info\"}', NULL, '2026-08-15 06:58:29', '2026-08-15 06:58:29'),
('bbf225f9-b31c-4c5a-9802-16adb6d909c5', 'App\\Notifications\\SystemAlert', 'App\\Models\\User', 15, '{\"title\":\"Request Accepted\",\"body\":\"Your Vehicle Number to Info request #25 is now accepted. Note: {\\n    \\\"chassis_last5\\\": \\\"06635\\\",\\n    \\\"mobile\\\": \\\"9729673885\\\",\\n    \\\"reg_no\\\": \\\"HR91D0775\\\",\\n    \\\"success\\\": true\",\"url\":\"\\/admin\\/service-requests\\/25\",\"level\":\"info\"}', '2026-08-15 06:58:52', '2026-08-14 16:14:17', '2026-08-15 06:58:52'),
('bcf01a19-78f7-4e24-a58d-3f407ea90d52', 'App\\Notifications\\SystemAlert', 'App\\Models\\User', 10, '{\"title\":\"New service request\",\"body\":\"Deepak Verma requested Puc Certificate With otp (#19).\",\"url\":\"\\/admin\\/service-requests\\/19\",\"level\":\"info\"}', NULL, '2026-08-13 17:01:11', '2026-08-13 17:01:11'),
('c0502977-9378-47da-a203-616cf5cd7544', 'App\\Notifications\\SystemAlert', 'App\\Models\\User', 10, '{\"title\":\"New coin purchase request\",\"body\":\"Deepak Verma paid \\u20b9799 for 959 coins.\",\"url\":\"\\/admin\\/coin-requests\",\"level\":\"info\"}', NULL, '2026-08-13 16:57:51', '2026-08-13 16:57:51'),
('c23494f6-0af9-467e-b8b2-3c1a085ada55', 'App\\Notifications\\SystemAlert', 'App\\Models\\User', 1, '{\"title\":\"New coin purchase request\",\"body\":\"Deepak Verma paid \\u20b9799 for 959 coins.\",\"url\":\"\\/admin\\/coin-requests\",\"level\":\"info\"}', '2026-08-15 07:11:38', '2026-08-13 16:57:52', '2026-08-15 07:11:38'),
('c23d8109-cbee-42c7-b9fd-6ff4617d59c0', 'App\\Notifications\\SystemAlert', 'App\\Models\\User', 10, '{\"title\":\"New service request\",\"body\":\"sam requested Passport Size Photo Set A4 & 4x6 as u req. (#12).\",\"url\":\"\\/admin\\/service-requests\\/12\",\"level\":\"info\"}', NULL, '2026-08-12 17:16:09', '2026-08-12 17:16:09'),
('c45cfc22-6357-472e-a0af-22c2de9387b6', 'App\\Notifications\\SystemAlert', 'App\\Models\\User', 11, '{\"title\":\"New service request\",\"body\":\"RAJESH requested Passport Size Photo Set A4 & 4x6 as u req. (#35).\",\"url\":\"\\/admin\\/service-requests\\/35\",\"level\":\"info\"}', NULL, '2026-08-18 14:31:11', '2026-08-18 14:31:11'),
('c57baac7-c392-4be5-a52a-7e7f760071c7', 'App\\Notifications\\SystemAlert', 'App\\Models\\User', 10, '{\"title\":\"New coin purchase request\",\"body\":\"pooja paid \\u20b949 for 49 coins.\",\"url\":\"\\/admin\\/coin-requests\",\"level\":\"info\"}', NULL, '2026-08-19 17:15:07', '2026-08-19 17:15:07'),
('c58449bc-f286-482e-9605-510dc5017d76', 'App\\Notifications\\SystemAlert', 'App\\Models\\User', 11, '{\"title\":\"New service request\",\"body\":\"Deepak Kumar requested Pan To Aadhar (#27).\",\"url\":\"\\/admin\\/service-requests\\/27\",\"level\":\"info\"}', NULL, '2026-08-15 06:52:55', '2026-08-15 06:52:55'),
('c7185963-2289-4fc0-a53e-f3b0c5437b11', 'App\\Notifications\\SystemAlert', 'App\\Models\\User', 15, '{\"title\":\"Request Rejected\",\"body\":\"Your Aadhar to Pan Find Instant request #26 is now rejected. 59 coins have been refunded to your account. Note: PENDING FOR SIET\",\"url\":\"\\/admin\\/service-requests\\/26\",\"level\":\"error\"}', '2026-08-15 06:58:52', '2026-08-14 16:17:14', '2026-08-15 06:58:52'),
('c74d540d-b093-4780-a323-e1249dd13c3d', 'App\\Notifications\\SystemAlert', 'App\\Models\\User', 11, '{\"title\":\"New service request\",\"body\":\"Rajesh requested Mobile no. To aadhar Number (#10).\",\"url\":\"\\/admin\\/service-requests\\/10\",\"level\":\"info\"}', NULL, '2026-08-12 14:54:15', '2026-08-12 14:54:15'),
('c7b81825-7fa5-4cf8-b727-3eaca67718af', 'App\\Notifications\\SystemAlert', 'App\\Models\\User', 11, '{\"title\":\"New coin purchase request\",\"body\":\"Shanu paid \\u20b999 for 105 coins.\",\"url\":\"\\/admin\\/coin-requests\",\"level\":\"info\"}', NULL, '2026-08-17 13:36:08', '2026-08-17 13:36:08'),
('c84a3c54-3dda-48b3-ac31-ec6155c9d98a', 'App\\Notifications\\SystemAlert', 'App\\Models\\User', 10, '{\"title\":\"New service request\",\"body\":\"Deepak Verma requested Aadhar to Pan Find Instant (#26).\",\"url\":\"\\/admin\\/service-requests\\/26\",\"level\":\"info\"}', NULL, '2026-08-14 16:16:00', '2026-08-14 16:16:00'),
('c8f43ba7-e722-42ba-a204-b1ebabeef351', 'App\\Notifications\\SystemAlert', 'App\\Models\\User', 10, '{\"title\":\"New coin purchase request\",\"body\":\"ankit paid \\u20b949 for 49 coins.\",\"url\":\"\\/admin\\/coin-requests\",\"level\":\"info\"}', NULL, '2026-08-12 14:48:21', '2026-08-12 14:48:21'),
('c97dfdba-d45e-4fc1-b5f9-2fdfb32835b0', 'App\\Notifications\\SystemAlert', 'App\\Models\\User', 15, '{\"title\":\"Coins added\",\"body\":\"Your purchase of 959 coins (\\u20b9799) was approved. New balance: 975 coins.\",\"url\":\"\\/dashboard\",\"level\":\"success\"}', '2026-08-15 06:58:52', '2026-08-14 16:08:40', '2026-08-15 06:58:52'),
('c98fe870-df05-439c-bd4e-a7187e30a303', 'App\\Notifications\\SystemAlert', 'App\\Models\\User', 10, '{\"title\":\"New coin purchase request\",\"body\":\"RAJESH paid \\u20b949 for 49 coins.\",\"url\":\"\\/admin\\/coin-requests\",\"level\":\"info\"}', NULL, '2026-08-18 14:30:07', '2026-08-18 14:30:07'),
('cb6feeee-ff7f-4d46-b8d3-19f96fcb8b84', 'App\\Notifications\\SystemAlert', 'App\\Models\\User', 15, '{\"title\":\"Request Rejected\",\"body\":\"Your Aadhaar Pdf to Pvc Card Instant request #20 is now rejected. 9 coins have been refunded to your account.\",\"url\":\"\\/admin\\/service-requests\\/20\",\"level\":\"error\"}', '2026-08-15 06:58:52', '2026-08-13 17:02:16', '2026-08-15 06:58:52'),
('cc191f29-db61-496e-aed8-3c2c2e68ce35', 'App\\Notifications\\SystemAlert', 'App\\Models\\User', 1, '{\"title\":\"New coin purchase request\",\"body\":\"Deepak Verma paid \\u20b9799 for 959 coins.\",\"url\":\"\\/admin\\/coin-requests\",\"level\":\"info\"}', '2026-08-15 07:11:38', '2026-08-13 16:57:48', '2026-08-15 07:11:38'),
('cdd109f2-f07d-4ff0-a012-54e098de7689', 'App\\Notifications\\SystemAlert', 'App\\Models\\User', 10, '{\"title\":\"New coin purchase request\",\"body\":\"Deepak Verma paid \\u20b999 for 105 coins.\",\"url\":\"\\/admin\\/coin-requests\",\"level\":\"info\"}', NULL, '2026-08-13 17:05:03', '2026-08-13 17:05:03'),
('ceae829a-b3d5-4d5c-9c8d-5f7cb06a1e28', 'App\\Notifications\\SystemAlert', 'App\\Models\\User', 11, '{\"title\":\"New coin purchase request\",\"body\":\"Deepak Verma paid \\u20b9799 for 959 coins.\",\"url\":\"\\/admin\\/coin-requests\",\"level\":\"info\"}', NULL, '2026-08-13 16:57:51', '2026-08-13 16:57:51'),
('d2c23996-0852-499c-9b42-39d4843a0cb9', 'App\\Notifications\\SystemAlert', 'App\\Models\\User', 10, '{\"title\":\"New coin purchase request\",\"body\":\"Deepak Verma paid \\u20b9799 for 959 coins.\",\"url\":\"\\/admin\\/coin-requests\",\"level\":\"info\"}', NULL, '2026-08-13 16:57:52', '2026-08-13 16:57:52'),
('d329d71d-758f-409f-aae2-6fd65ab8581f', 'App\\Notifications\\SystemAlert', 'App\\Models\\User', 10, '{\"title\":\"New service request\",\"body\":\"Deepak Verma requested Aadhar Card Address Change (#17).\",\"url\":\"\\/admin\\/service-requests\\/17\",\"level\":\"info\"}', NULL, '2026-08-13 17:00:46', '2026-08-13 17:00:46'),
('d425902b-0eb2-42d5-937c-7fc87112af74', 'App\\Notifications\\SystemAlert', 'App\\Models\\User', 15, '{\"title\":\"Request Accepted\",\"body\":\"Your Aadhar Card Address Change request #13 is now accepted.\",\"url\":\"\\/admin\\/service-requests\\/13\",\"level\":\"info\"}', '2026-08-15 06:58:52', '2026-08-13 17:02:46', '2026-08-15 06:58:52'),
('d44c00a8-7b0a-4d3a-a909-7c778228c5c1', 'App\\Notifications\\SystemAlert', 'App\\Models\\User', 15, '{\"title\":\"Coin request rejected\",\"body\":\"Your request for 105 coins was rejected.\",\"url\":\"\\/admin\\/coin-requests\",\"level\":\"error\"}', '2026-08-15 06:58:52', '2026-08-13 17:05:41', '2026-08-15 06:58:52'),
('d7ae5e48-64c2-409f-8aee-7a995e5cc58a', 'App\\Notifications\\SystemAlert', 'App\\Models\\User', 9, '{\"title\":\"Request Accepted\",\"body\":\"Your Vehicle Owner request #8 is now accepted. Estimated time: Done. Note: \\\"chassis_last5\\\": \\\"17541\\\",\\n    \\\"mobile\\\": \\\"9215818900\\\",\\n    \\\"reg_no\\\": \\\"HR06AQ6025\\\",\\n    \\\"success\\\": true\\n}\",\"url\":\"\\/admin\\/service-requests\\/8\",\"level\":\"info\"}', '2026-08-15 06:08:56', '2026-08-12 11:46:05', '2026-08-15 06:08:56'),
('d7afa627-f8f6-4f5f-8a9f-7a63a2cbe6c8', 'App\\Notifications\\SystemAlert', 'App\\Models\\User', 13, '{\"title\":\"Request In Progress\",\"body\":\"Your Mobile no. To aadhar Number request #11 is now in progress.\",\"url\":\"\\/admin\\/service-requests\\/11\",\"level\":\"info\"}', NULL, '2026-08-12 15:05:31', '2026-08-12 15:05:31'),
('d816eb08-359d-4ad9-bdd8-04a7c4b139cb', 'App\\Notifications\\SystemAlert', 'App\\Models\\User', 11, '{\"title\":\"New coin purchase request\",\"body\":\"Deepak Verma paid \\u20b9799 for 959 coins.\",\"url\":\"\\/admin\\/coin-requests\",\"level\":\"info\"}', NULL, '2026-08-13 16:57:50', '2026-08-13 16:57:50'),
('dd78f937-2efc-4830-8975-2c09124dba23', 'App\\Notifications\\SystemAlert', 'App\\Models\\User', 13, '{\"title\":\"Request Rejected\",\"body\":\"Your Sim No. To Aadhar Number request #22 is now rejected. 99 coins have been refunded to your account.\",\"url\":\"\\/admin\\/service-requests\\/22\",\"level\":\"error\"}', NULL, '2026-08-14 05:37:05', '2026-08-14 05:37:05'),
('df281d26-da3e-4328-bbb1-8d9682da50fb', 'App\\Notifications\\SystemAlert', 'App\\Models\\User', 1, '{\"title\":\"New service request\",\"body\":\"Deepak Verma requested Aadhar Card Address Change (#15).\",\"url\":\"\\/admin\\/service-requests\\/15\",\"level\":\"info\"}', '2026-08-15 07:11:38', '2026-08-13 17:00:29', '2026-08-15 07:11:38'),
('df84e9c0-59d7-4c17-9b26-b2098a32f61d', 'App\\Notifications\\SystemAlert', 'App\\Models\\User', 13, '{\"title\":\"Coins added\",\"body\":\"Your purchase of 49 coins (\\u20b949) was approved. New balance: 147 coins.\",\"url\":\"\\/dashboard\",\"level\":\"success\"}', NULL, '2026-08-12 15:05:00', '2026-08-12 15:05:00'),
('e348c9f1-cb95-4609-b155-871de0f15006', 'App\\Notifications\\SystemAlert', 'App\\Models\\User', 15, '{\"title\":\"Coins added\",\"body\":\"Your purchase of 959 coins (\\u20b9799) was approved. New balance: 959 coins.\",\"url\":\"\\/dashboard\",\"level\":\"success\"}', '2026-08-15 06:58:52', '2026-08-13 16:58:20', '2026-08-15 06:58:52'),
('e9494673-b11a-4939-947e-8001642a890e', 'App\\Notifications\\SystemAlert', 'App\\Models\\User', 11, '{\"title\":\"New coin purchase request\",\"body\":\"Deepak Verma paid \\u20b9799 for 959 coins.\",\"url\":\"\\/admin\\/coin-requests\",\"level\":\"info\"}', NULL, '2026-08-14 14:20:39', '2026-08-14 14:20:39'),
('e968c08c-db43-44ce-b534-bfa55a36d149', 'App\\Notifications\\SystemAlert', 'App\\Models\\User', 1, '{\"title\":\"New service request\",\"body\":\"RAJESH requested Passport Size Photo Set A4 & 4x6 as u req. (#36).\",\"url\":\"\\/admin\\/service-requests\\/36\",\"level\":\"info\"}', '2026-08-19 06:44:54', '2026-08-18 14:31:19', '2026-08-19 06:44:54'),
('ea9736f2-18c0-49d4-ab16-6b7931a8fddf', 'App\\Notifications\\SystemAlert', 'App\\Models\\User', 11, '{\"title\":\"New coin purchase request\",\"body\":\"Deepak Verma paid \\u20b9799 for 959 coins.\",\"url\":\"\\/admin\\/coin-requests\",\"level\":\"info\"}', NULL, '2026-08-13 16:57:52', '2026-08-13 16:57:52'),
('eb2193ee-6558-4804-85f4-e6c36778cba1', 'App\\Notifications\\SystemAlert', 'App\\Models\\User', 10, '{\"title\":\"New coin purchase request\",\"body\":\"Deepak Verma paid \\u20b9799 for 959 coins.\",\"url\":\"\\/admin\\/coin-requests\",\"level\":\"info\"}', NULL, '2026-08-13 16:57:50', '2026-08-13 16:57:50'),
('ebb3eb6c-89ba-40c6-ba59-9cf1e381cbd6', 'App\\Notifications\\SystemAlert', 'App\\Models\\User', 11, '{\"title\":\"New service request\",\"body\":\"Deepak Verma requested Aadhaar Pdf to Pvc Card Instant (#21).\",\"url\":\"\\/admin\\/service-requests\\/21\",\"level\":\"info\"}', NULL, '2026-08-13 17:01:35', '2026-08-13 17:01:35'),
('ec2c07e2-477c-408c-af37-e96c0de04f51', 'App\\Notifications\\SystemAlert', 'App\\Models\\User', 11, '{\"title\":\"New service request\",\"body\":\"sam requested Mobile no. To aadhar Number (#9).\",\"url\":\"\\/admin\\/service-requests\\/9\",\"level\":\"info\"}', NULL, '2026-08-12 14:37:34', '2026-08-12 14:37:34'),
('ee146a4a-3bf7-444f-8395-1b23a74501f2', 'App\\Notifications\\SystemAlert', 'App\\Models\\User', 10, '{\"title\":\"New service request\",\"body\":\"sam requested Mobile no. To aadhar Number (#9).\",\"url\":\"\\/admin\\/service-requests\\/9\",\"level\":\"info\"}', NULL, '2026-08-12 14:37:34', '2026-08-12 14:37:34'),
('ee888ca2-e10c-4d8b-af8a-d366a0fb295a', 'App\\Notifications\\SystemAlert', 'App\\Models\\User', 11, '{\"title\":\"New coin purchase request\",\"body\":\"ankit paid \\u20b949 for 49 coins.\",\"url\":\"\\/admin\\/coin-requests\",\"level\":\"info\"}', NULL, '2026-08-12 15:04:47', '2026-08-12 15:04:47'),
('ee91b03c-158e-4a00-ba08-28cf5766a182', 'App\\Notifications\\SystemAlert', 'App\\Models\\User', 15, '{\"title\":\"Request Accepted\",\"body\":\"Your Aadhar Card Address Change request #17 is now accepted.\",\"url\":\"\\/admin\\/service-requests\\/17\",\"level\":\"info\"}', '2026-08-15 06:58:52', '2026-08-13 17:02:02', '2026-08-15 06:58:52'),
('f2ead8fc-2c72-4508-80a1-2cb643dda933', 'App\\Notifications\\SystemAlert', 'App\\Models\\User', 10, '{\"title\":\"New coin purchase request\",\"body\":\"ankit paid \\u20b949 for 49 coins.\",\"url\":\"\\/admin\\/coin-requests\",\"level\":\"info\"}', NULL, '2026-08-12 14:43:18', '2026-08-12 14:43:18'),
('f3e88681-d5c9-47f4-8332-e7059ef74cec', 'App\\Notifications\\SystemAlert', 'App\\Models\\User', 1, '{\"title\":\"New service request\",\"body\":\"ankit requested Mobile no. To aadhar Number (#11).\",\"url\":\"\\/admin\\/service-requests\\/11\",\"level\":\"info\"}', '2026-08-15 07:11:38', '2026-08-12 15:05:21', '2026-08-15 07:11:38'),
('f41db037-cc8a-47a8-bd65-9a0373181ee0', 'App\\Notifications\\SystemAlert', 'App\\Models\\User', 15, '{\"title\":\"Request Accepted\",\"body\":\"Your Aadhar Card Address Change request #16 is now accepted.\",\"url\":\"\\/admin\\/service-requests\\/16\",\"level\":\"info\"}', '2026-08-15 06:58:52', '2026-08-13 17:02:07', '2026-08-15 06:58:52'),
('f79d8138-89d3-4a6b-8b2d-f7b209ad33ff', 'App\\Notifications\\SystemAlert', 'App\\Models\\User', 15, '{\"title\":\"Coins added\",\"body\":\"Your purchase of 959 coins (\\u20b9799) was approved. New balance: 1934 coins.\",\"url\":\"\\/dashboard\",\"level\":\"success\"}', '2026-08-15 06:58:52', '2026-08-14 16:08:42', '2026-08-15 06:58:52'),
('f7b5fe74-1f21-4a8b-af06-7c1ab8929b9d', 'App\\Notifications\\SystemAlert', 'App\\Models\\User', 10, '{\"title\":\"New service request\",\"body\":\"Deepak Kumar requested Aadhaar Pdf to Pvc Card Instant (#31).\",\"url\":\"\\/admin\\/service-requests\\/31\",\"level\":\"info\"}', NULL, '2026-08-15 06:58:35', '2026-08-15 06:58:35'),
('f8f45046-d0a1-434b-b05c-3570347bd929', 'App\\Notifications\\SystemAlert', 'App\\Models\\User', 13, '{\"title\":\"Request Completed\",\"body\":\"Your Sim No. To Aadhar Number request #23 is now completed.\",\"url\":\"\\/admin\\/service-requests\\/23\",\"level\":\"success\"}', NULL, '2026-08-14 17:49:13', '2026-08-14 17:49:13'),
('fa0f9be2-b087-4fb7-a277-8176c00d50ce', 'App\\Notifications\\SystemAlert', 'App\\Models\\User', 27, '{\"title\":\"Coins added\",\"body\":\"Your purchase of 49 coins (\\u20b949) was approved. New balance: 49 coins.\",\"url\":\"\\/dashboard\",\"level\":\"success\"}', NULL, '2026-08-18 14:30:18', '2026-08-18 14:30:18'),
('fb6ecba4-b713-437e-86d6-409983834945', 'App\\Notifications\\SystemAlert', 'App\\Models\\User', 15, '{\"title\":\"Coin request rejected\",\"body\":\"Your request for 959 coins was rejected.\",\"url\":\"\\/admin\\/coin-requests\",\"level\":\"error\"}', '2026-08-15 06:58:52', '2026-08-13 16:58:11', '2026-08-15 06:58:52'),
('fd16d094-0602-415e-a6e0-69344654e604', 'App\\Notifications\\SystemAlert', 'App\\Models\\User', 13, '{\"title\":\"Coins added\",\"body\":\"Your purchase of 49 coins (\\u20b949) was approved. New balance: 98 coins.\",\"url\":\"\\/dashboard\",\"level\":\"success\"}', NULL, '2026-08-12 14:53:15', '2026-08-12 14:53:15'),
('ffe7e7d4-cf2d-4658-b010-fd878d81e072', 'App\\Notifications\\SystemAlert', 'App\\Models\\User', 10, '{\"title\":\"New coin purchase request\",\"body\":\"Deepak Verma paid \\u20b9799 for 959 coins.\",\"url\":\"\\/admin\\/coin-requests\",\"level\":\"info\"}', NULL, '2026-08-14 14:20:35', '2026-08-14 14:20:35');

-- --------------------------------------------------------

--
-- Table structure for table `pan_details_requests`
--

CREATE TABLE `pan_details_requests` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `pan_requests`
--

CREATE TABLE `pan_requests` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `aadhar_number` varchar(12) DEFAULT NULL,
  `name` varchar(255) DEFAULT NULL,
  `mobile` varchar(20) DEFAULT NULL,
  `pan_number` varchar(10) DEFAULT NULL,
  `status` varchar(50) NOT NULL DEFAULT 'pending',
  `utr_number` varchar(255) DEFAULT NULL,
  `admin_notes` text DEFAULT NULL,
  `photo` varchar(255) DEFAULT NULL,
  `signature` varchar(255) DEFAULT NULL,
  `aadhar_card_doc` varchar(255) DEFAULT NULL,
  `additional_document` varchar(255) DEFAULT NULL,
  `slip_document` varchar(255) DEFAULT NULL,
  `final_pdf` varchar(255) DEFAULT NULL,
  `completed_by` bigint(20) UNSIGNED DEFAULT NULL,
  `completed_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `password_reset_tokens`
--

CREATE TABLE `password_reset_tokens` (
  `email` varchar(255) NOT NULL,
  `token` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `pdf_converters`
--

CREATE TABLE `pdf_converters` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `user_id` bigint(20) UNSIGNED DEFAULT NULL,
  `original_filename` varchar(255) NOT NULL,
  `pdf_path` varchar(255) NOT NULL,
  `front_image_path` varchar(255) DEFAULT NULL,
  `back_image_path` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `pdf_coordinates`
--

CREATE TABLE `pdf_coordinates` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `page` int(11) NOT NULL DEFAULT 1,
  `field_name` varchar(255) NOT NULL,
  `x` int(11) NOT NULL DEFAULT 0,
  `y` int(11) NOT NULL DEFAULT 0,
  `font_size` int(11) NOT NULL DEFAULT 20,
  `spacing` int(11) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `pdf_coordinates`
--

INSERT INTO `pdf_coordinates` (`id`, `page`, `field_name`, `x`, `y`, `font_size`, `spacing`, `created_at`, `updated_at`) VALUES
(1, 1, 'district_top', 1256, 550, 50, NULL, '2026-05-12 17:48:56', '2026-05-12 17:48:56'),
(2, 1, 'null', 0, 0, 50, NULL, '2026-05-12 17:48:56', '2026-05-12 17:48:56'),
(3, 1, 'doc_tehsil', 847, 2905, 40, NULL, '2026-05-12 17:48:56', '2026-05-12 17:48:56'),
(4, 1, 'doc_ward', 1956, 2729, 40, NULL, '2026-05-12 17:48:56', '2026-05-12 17:48:56'),
(5, 1, 'doc_address', 943, 2764, 40, NULL, '2026-05-12 17:48:56', '2026-05-12 17:48:56'),
(6, 1, 'doc_father_name', 1793, 2631, 40, NULL, '2026-05-12 17:48:56', '2026-05-12 17:48:56'),
(7, 1, 'doc_applicant_name', 804, 2622, 40, NULL, '2026-05-12 17:48:56', '2026-05-12 17:48:56'),
(8, 1, 'child_name', 1162, 1898, 50, NULL, '2026-05-12 17:48:56', '2026-05-12 17:48:56'),
(9, 1, 'caste', 1061, 1079, 50, NULL, '2026-05-12 17:48:56', '2026-05-12 17:48:56'),
(10, 1, 'district', 1144, 1508, 50, NULL, '2026-05-12 17:48:56', '2026-05-12 17:48:56'),
(11, 1, 'ward_no', 1659, 1376, 50, NULL, '2026-05-12 17:48:56', '2026-05-12 17:48:56'),
(12, 1, 'doc_district', 1650, 2912, 40, NULL, '2026-05-12 17:48:56', '2026-05-12 17:48:56'),
(13, 1, 'tehsil', 557, 1503, 50, NULL, '2026-05-12 17:48:56', '2026-05-12 17:48:56'),
(14, 1, 'tehsil_top', 565, 547, 50, NULL, '2026-05-12 17:48:56', '2026-05-12 17:48:56'),
(15, 1, 'mobile_start', 655, 818, 50, 90, '2026-05-12 17:48:56', '2026-05-12 17:48:56'),
(16, 1, 'name', 425, 1307, 50, NULL, '2026-05-12 17:48:56', '2026-05-12 17:48:56'),
(17, 1, 'age', 1933, 1369, 50, NULL, '2026-05-12 17:48:56', '2026-05-12 17:48:56'),
(18, 1, 'address', 532, 1414, 50, NULL, '2026-05-12 17:48:56', '2026-05-12 17:48:56'),
(19, 1, 'aadhar_start', 655, 932, 50, 90, '2026-05-12 17:48:56', '2026-05-12 17:48:56'),
(20, 1, 'father_name', 1610, 1307, 50, NULL, '2026-05-12 17:48:56', '2026-05-12 17:48:56'),
(21, 2, 'ward_no', 1286, 884, 50, NULL, '2026-05-12 17:48:56', '2026-05-12 17:48:56'),
(22, 2, 'tehsil', 1720, 911, 50, NULL, '2026-05-12 17:48:56', '2026-05-12 17:48:56'),
(23, 2, 'address', 402, 920, 50, NULL, '2026-05-12 17:48:56', '2026-05-12 17:48:56'),
(24, 2, 'religion', 1795, 804, 50, NULL, '2026-05-12 17:48:56', '2026-05-12 17:48:56'),
(25, 2, 'caste', 1286, 804, 50, NULL, '2026-05-12 17:48:56', '2026-05-12 17:48:56'),
(26, 2, 'age', 789, 777, 50, NULL, '2026-05-12 17:48:56', '2026-05-12 17:48:56'),
(27, 2, 'father_name', 1765, 699, 50, NULL, '2026-05-12 17:48:56', '2026-05-12 17:48:56'),
(28, 2, 'name', 410, 699, 50, NULL, '2026-05-12 17:48:56', '2026-05-12 17:48:56'),
(29, 2, 'ration_card_no', 1593, 1423, 50, NULL, '2026-05-12 17:48:56', '2026-05-12 17:48:56'),
(30, 2, 'aadhar_2', 1014, 1530, 50, NULL, '2026-05-12 17:48:56', '2026-05-12 17:48:56'),
(31, 2, 'age_2', 507, 1635, 50, NULL, '2026-05-12 17:48:56', '2026-05-12 17:48:56'),
(32, 2, 'district', 362, 1024, 50, NULL, '2026-05-12 17:48:56', '2026-05-12 17:48:56'),
(33, 3, 'name', 874, 515, 50, NULL, '2026-05-12 17:48:56', '2026-05-12 17:48:56'),
(34, 3, 'father_name', 1733, 517, 50, NULL, '2026-05-12 17:48:56', '2026-05-12 17:48:56'),
(35, 3, 'age', 235, 599, 50, NULL, '2026-05-12 17:48:56', '2026-05-12 17:48:56'),
(36, 3, 'address', 802, 637, 50, NULL, '2026-05-12 17:48:56', '2026-05-12 17:48:56'),
(37, 3, 'ward_no', 1965, 597, 50, NULL, '2026-05-12 17:48:56', '2026-05-12 17:48:56'),
(38, 3, 'tehsil', 317, 737, 50, NULL, '2026-05-12 17:48:56', '2026-05-12 17:48:56'),
(39, 3, 'district', 976, 732, 50, NULL, '2026-05-12 17:48:56', '2026-05-12 17:48:56'),
(40, 3, 'child_name', 986, 839, 50, NULL, '2026-05-12 17:48:56', '2026-05-12 17:48:56');

-- --------------------------------------------------------

--
-- Table structure for table `permissions`
--

CREATE TABLE `permissions` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(255) NOT NULL,
  `guard_name` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `permissions`
--

INSERT INTO `permissions` (`id`, `name`, `guard_name`, `created_at`, `updated_at`) VALUES
(1, 'view_birth::record', 'web', '2026-05-12 17:48:55', '2026-05-12 17:48:55'),
(2, 'view_any_birth::record', 'web', '2026-05-12 17:48:55', '2026-05-12 17:48:55'),
(3, 'create_birth::record', 'web', '2026-05-12 17:48:55', '2026-05-12 17:48:55'),
(4, 'update_birth::record', 'web', '2026-05-12 17:48:55', '2026-05-12 17:48:55'),
(5, 'restore_birth::record', 'web', '2026-05-12 17:48:55', '2026-05-12 17:48:55'),
(6, 'restore_any_birth::record', 'web', '2026-05-12 17:48:55', '2026-05-12 17:48:55'),
(7, 'replicate_birth::record', 'web', '2026-05-12 17:48:55', '2026-05-12 17:48:55'),
(8, 'reorder_birth::record', 'web', '2026-05-12 17:48:55', '2026-05-12 17:48:55'),
(9, 'delete_birth::record', 'web', '2026-05-12 17:48:55', '2026-05-12 17:48:55'),
(10, 'delete_any_birth::record', 'web', '2026-05-12 17:48:55', '2026-05-12 17:48:55'),
(11, 'force_delete_birth::record', 'web', '2026-05-12 17:48:55', '2026-05-12 17:48:55'),
(12, 'force_delete_any_birth::record', 'web', '2026-05-12 17:48:55', '2026-05-12 17:48:55'),
(13, 'view_coin::purchase::request', 'web', '2026-05-12 17:48:55', '2026-05-12 17:48:55'),
(14, 'view_any_coin::purchase::request', 'web', '2026-05-12 17:48:55', '2026-05-12 17:48:55'),
(15, 'create_coin::purchase::request', 'web', '2026-05-12 17:48:55', '2026-05-12 17:48:55'),
(16, 'update_coin::purchase::request', 'web', '2026-05-12 17:48:55', '2026-05-12 17:48:55'),
(17, 'restore_coin::purchase::request', 'web', '2026-05-12 17:48:55', '2026-05-12 17:48:55'),
(18, 'restore_any_coin::purchase::request', 'web', '2026-05-12 17:48:55', '2026-05-12 17:48:55'),
(19, 'replicate_coin::purchase::request', 'web', '2026-05-12 17:48:55', '2026-05-12 17:48:55'),
(20, 'reorder_coin::purchase::request', 'web', '2026-05-12 17:48:55', '2026-05-12 17:48:55'),
(21, 'delete_coin::purchase::request', 'web', '2026-05-12 17:48:55', '2026-05-12 17:48:55'),
(22, 'delete_any_coin::purchase::request', 'web', '2026-05-12 17:48:55', '2026-05-12 17:48:55'),
(23, 'force_delete_coin::purchase::request', 'web', '2026-05-12 17:48:55', '2026-05-12 17:48:55'),
(24, 'force_delete_any_coin::purchase::request', 'web', '2026-05-12 17:48:55', '2026-05-12 17:48:55'),
(25, 'view_haryana::domicile', 'web', '2026-05-12 17:48:55', '2026-05-12 17:48:55'),
(26, 'view_any_haryana::domicile', 'web', '2026-05-12 17:48:55', '2026-05-12 17:48:55'),
(27, 'create_haryana::domicile', 'web', '2026-05-12 17:48:55', '2026-05-12 17:48:55'),
(28, 'update_haryana::domicile', 'web', '2026-05-12 17:48:55', '2026-05-12 17:48:55'),
(29, 'restore_haryana::domicile', 'web', '2026-05-12 17:48:55', '2026-05-12 17:48:55'),
(30, 'restore_any_haryana::domicile', 'web', '2026-05-12 17:48:55', '2026-05-12 17:48:55'),
(31, 'replicate_haryana::domicile', 'web', '2026-05-12 17:48:55', '2026-05-12 17:48:55'),
(32, 'reorder_haryana::domicile', 'web', '2026-05-12 17:48:55', '2026-05-12 17:48:55'),
(33, 'delete_haryana::domicile', 'web', '2026-05-12 17:48:55', '2026-05-12 17:48:55'),
(34, 'delete_any_haryana::domicile', 'web', '2026-05-12 17:48:55', '2026-05-12 17:48:55'),
(35, 'force_delete_haryana::domicile', 'web', '2026-05-12 17:48:55', '2026-05-12 17:48:55'),
(36, 'force_delete_any_haryana::domicile', 'web', '2026-05-12 17:48:55', '2026-05-12 17:48:55'),
(37, 'view_pan::request', 'web', '2026-05-12 17:48:55', '2026-05-12 17:48:55'),
(38, 'view_any_pan::request', 'web', '2026-05-12 17:48:55', '2026-05-12 17:48:55'),
(39, 'create_pan::request', 'web', '2026-05-12 17:48:55', '2026-05-12 17:48:55'),
(40, 'update_pan::request', 'web', '2026-05-12 17:48:55', '2026-05-12 17:48:55'),
(41, 'restore_pan::request', 'web', '2026-05-12 17:48:55', '2026-05-12 17:48:55'),
(42, 'restore_any_pan::request', 'web', '2026-05-12 17:48:55', '2026-05-12 17:48:55'),
(43, 'replicate_pan::request', 'web', '2026-05-12 17:48:55', '2026-05-12 17:48:55'),
(44, 'reorder_pan::request', 'web', '2026-05-12 17:48:55', '2026-05-12 17:48:55'),
(45, 'delete_pan::request', 'web', '2026-05-12 17:48:55', '2026-05-12 17:48:55'),
(46, 'delete_any_pan::request', 'web', '2026-05-12 17:48:55', '2026-05-12 17:48:55'),
(47, 'force_delete_pan::request', 'web', '2026-05-12 17:48:55', '2026-05-12 17:48:55'),
(48, 'force_delete_any_pan::request', 'web', '2026-05-12 17:48:55', '2026-05-12 17:48:55'),
(49, 'view_pdf::converter', 'web', '2026-05-12 17:48:55', '2026-05-12 17:48:55'),
(50, 'view_any_pdf::converter', 'web', '2026-05-12 17:48:55', '2026-05-12 17:48:55'),
(51, 'create_pdf::converter', 'web', '2026-05-12 17:48:55', '2026-05-12 17:48:55'),
(52, 'update_pdf::converter', 'web', '2026-05-12 17:48:55', '2026-05-12 17:48:55'),
(53, 'restore_pdf::converter', 'web', '2026-05-12 17:48:55', '2026-05-12 17:48:55'),
(54, 'restore_any_pdf::converter', 'web', '2026-05-12 17:48:55', '2026-05-12 17:48:55'),
(55, 'replicate_pdf::converter', 'web', '2026-05-12 17:48:55', '2026-05-12 17:48:55'),
(56, 'reorder_pdf::converter', 'web', '2026-05-12 17:48:55', '2026-05-12 17:48:55'),
(57, 'delete_pdf::converter', 'web', '2026-05-12 17:48:55', '2026-05-12 17:48:55'),
(58, 'delete_any_pdf::converter', 'web', '2026-05-12 17:48:55', '2026-05-12 17:48:55'),
(59, 'force_delete_pdf::converter', 'web', '2026-05-12 17:48:55', '2026-05-12 17:48:55'),
(60, 'force_delete_any_pdf::converter', 'web', '2026-05-12 17:48:55', '2026-05-12 17:48:55'),
(61, 'view_service::request', 'web', '2026-05-12 17:48:55', '2026-05-12 17:48:55'),
(62, 'view_any_service::request', 'web', '2026-05-12 17:48:55', '2026-05-12 17:48:55'),
(63, 'create_service::request', 'web', '2026-05-12 17:48:55', '2026-05-12 17:48:55'),
(64, 'update_service::request', 'web', '2026-05-12 17:48:55', '2026-05-12 17:48:55'),
(65, 'restore_service::request', 'web', '2026-05-12 17:48:55', '2026-05-12 17:48:55'),
(66, 'restore_any_service::request', 'web', '2026-05-12 17:48:55', '2026-05-12 17:48:55'),
(67, 'replicate_service::request', 'web', '2026-05-12 17:48:55', '2026-05-12 17:48:55'),
(68, 'reorder_service::request', 'web', '2026-05-12 17:48:55', '2026-05-12 17:48:55'),
(69, 'delete_service::request', 'web', '2026-05-12 17:48:55', '2026-05-12 17:48:55'),
(70, 'delete_any_service::request', 'web', '2026-05-12 17:48:55', '2026-05-12 17:48:55'),
(71, 'force_delete_service::request', 'web', '2026-05-12 17:48:55', '2026-05-12 17:48:55'),
(72, 'force_delete_any_service::request', 'web', '2026-05-12 17:48:55', '2026-05-12 17:48:55'),
(73, 'page_AadharCardAddressForm', 'web', '2026-05-12 17:48:55', '2026-05-12 17:48:55'),
(74, 'page_AdminDashboard', 'web', '2026-05-12 17:48:55', '2026-05-12 17:48:55'),
(75, 'page_CustomDashboard', 'web', '2026-05-12 17:48:55', '2026-05-12 17:48:55'),
(76, 'page_CustomerSupport', 'web', '2026-05-12 17:48:55', '2026-05-12 17:48:55'),
(77, 'page_FamilyDataSearch', 'web', '2026-05-12 17:48:55', '2026-05-12 17:48:55'),
(78, 'page_FasalSearch', 'web', '2026-05-12 17:48:55', '2026-05-12 17:48:55'),
(79, 'page_ManualService', 'web', '2026-05-12 17:48:55', '2026-05-12 17:48:55'),
(80, 'page_PdfCoordinates', 'web', '2026-05-12 17:48:55', '2026-05-12 17:48:55'),
(81, 'page_PhoneToAadhar', 'web', '2026-05-12 17:48:55', '2026-05-12 17:48:55'),
(82, 'page_PhoneToDetail', 'web', '2026-05-12 17:48:55', '2026-05-12 17:48:55'),
(83, 'page_VehicleDetail', 'web', '2026-05-12 17:48:55', '2026-05-12 17:48:55');

-- --------------------------------------------------------

--
-- Table structure for table `roles`
--

CREATE TABLE `roles` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(255) NOT NULL,
  `guard_name` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `roles`
--

INSERT INTO `roles` (`id`, `name`, `guard_name`, `created_at`, `updated_at`) VALUES
(3, 'Public', 'web', '2026-05-12 17:48:59', '2026-05-12 17:48:59'),
(4, 'super_admin', 'web', '2026-08-04 23:23:30', '2026-08-04 23:23:30'),
(5, 'admin', 'web', '2026-08-04 23:23:30', '2026-08-04 23:23:30');

-- --------------------------------------------------------

--
-- Table structure for table `role_has_permissions`
--

CREATE TABLE `role_has_permissions` (
  `permission_id` bigint(20) UNSIGNED NOT NULL,
  `role_id` bigint(20) UNSIGNED NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `role_has_permissions`
--

INSERT INTO `role_has_permissions` (`permission_id`, `role_id`) VALUES
(1, 3),
(2, 3),
(3, 3),
(4, 3),
(9, 3),
(10, 3),
(25, 3),
(26, 3),
(27, 3),
(28, 3),
(33, 3),
(34, 3),
(37, 3),
(38, 3),
(39, 3),
(40, 3),
(45, 3),
(46, 3),
(49, 3),
(50, 3),
(51, 3),
(52, 3),
(57, 3),
(58, 3),
(61, 3),
(62, 3),
(63, 3),
(64, 3),
(69, 3),
(70, 3),
(75, 3),
(77, 3),
(78, 3),
(79, 3),
(81, 3),
(82, 3),
(83, 3);

-- --------------------------------------------------------

--
-- Table structure for table `services`
--

CREATE TABLE `services` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(255) NOT NULL,
  `slug` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `icon` varchar(255) DEFAULT NULL,
  `logo` varchar(255) DEFAULT NULL,
  `coin_cost` int(10) UNSIGNED NOT NULL DEFAULT 0,
  `kind` varchar(255) NOT NULL DEFAULT 'manual',
  `module_key` varchar(255) DEFAULT NULL,
  `fields` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`fields`)),
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `visibility` varchar(255) NOT NULL DEFAULT 'public',
  `sort_order` int(10) UNSIGNED NOT NULL DEFAULT 0,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `services`
--

INSERT INTO `services` (`id`, `name`, `slug`, `description`, `icon`, `logo`, `coin_cost`, `kind`, `module_key`, `fields`, `is_active`, `visibility`, `sort_order`, `created_at`, `updated_at`) VALUES
(1, 'Marriage Certificate', 'marriage-certificate', 'Fill the marriage certificate form and print it instantly.', '💍', NULL, 20, 'module', 'marriage_form', NULL, 1, 'private', 1, '2026-08-08 16:20:53', '2026-08-17 14:09:01'),
(2, 'Birth Certificate', 'birth-certificate', 'Create and print a birth record.', '👶', NULL, 19, 'module', 'birth_record', NULL, 1, 'private', 1, '2026-08-08 16:20:53', '2026-08-17 14:08:09'),
(3, 'Haryana Domicile File', 'haryana-domicile', 'Generate a Haryana domicile certificate.', '📜', NULL, 30, 'module', 'haryana_domicile', NULL, 1, 'private', 1, '2026-08-08 16:20:53', '2026-08-18 12:34:10'),
(4, 'Pan Card Without Dob Prof', 'pan-card', 'Submit a PAN card application.\r\n1. Aadhr card\r\n2. Photo\r\n3. Signature\r\n4. Abha Id', '💳', NULL, 249, 'module', 'pan_request', NULL, 1, 'public', 1, '2026-08-08 16:20:53', '2026-08-17 15:14:10'),
(5, 'Sim No. To Aadhar Number', 'mobile-no-to-aadhar-number', 'Fill the number and name and get Detail it instantly.', '📄', 'service-logos/jEa4hrslI92RfFAOwUNMUsz1lKNEdpdylEgYvyC6.png', 99, 'manual', NULL, '[{\"label\":\"Number & Name\",\"type\":\"textarea\",\"required\":\"1\"}]', 1, 'public', 1, '2026-08-12 14:36:54', '2026-08-17 15:14:55'),
(6, 'Pan Card With Dob Prof', 'pan-card-with-dob-prof', 'Submit a PAN card application.\r\n1. Aadhr card\r\n2. Photo\r\n3. Signature\r\n4. 10th Dmc, Birth Certificate', '📄', 'service-logos/MOv9iyVGVM5V4vVneaAGVE4GPTUYMMumQHM6YA3B.png', 149, 'manual', NULL, '[{\"label\":\"Aaadhar card\",\"type\":\"file\",\"required\":\"1\"},{\"label\":\"Photo\",\"type\":\"file\",\"required\":\"1\"},{\"label\":\"Signature\",\"type\":\"file\",\"required\":\"1\"},{\"label\":\"Other Document Dob\",\"type\":\"file\",\"required\":\"0\"}]', 1, 'public', 1, '2026-08-12 16:44:52', '2026-08-17 15:14:02'),
(7, 'Aadhar Card Address Change', 'aadhar-card-address-change', 'Upload the image & Aadhar Card write the address with the pin code and state and mobile number link with aadhr card', '📄', 'service-logos/sEJZALpjULIVwqplXLHTRT1HXEnzjg7ctP6LJCIs.png', 299, 'manual', NULL, '[{\"label\":\"image\",\"type\":\"file\",\"required\":\"1\"},{\"label\":\"Aadhar Card Frent & Back\",\"type\":\"file\",\"required\":\"1\"},{\"label\":\"Write the address\",\"type\":\"textarea\",\"required\":\"0\"}]', 1, 'private', 1, '2026-08-12 16:49:12', '2026-08-17 14:07:25'),
(8, 'Aadhaar Pdf to Pvc Card Instant', 'aadhaar-pdf-to-pvc-card-instant', 'upload Aadhr Card orignal Pdf with Passward', '📄', 'service-logos/4RMoikwaVQCYG2Cw4LpI92T4hfJw31TtDWZ5GePQ.png', 9, 'manual', NULL, '[{\"label\":\"Aadhaar Pdf With Pdf Name Passward\",\"type\":\"file\",\"required\":\"1\"}]', 1, 'private', 1, '2026-08-12 16:50:22', '2026-08-17 13:35:26'),
(9, 'Aadhar to Pan Find Instant', 'aadhar-to-pan-find-instant', 'Upload Aadhar Card Frent & Back', '📄', 'service-logos/1DJIUweQ0BLUwzQObkXbpGvDDdJ9C75awwT6pkxk.png', 59, 'manual', NULL, '[{\"label\":\"Write Aadhar Card Number\",\"type\":\"textarea\",\"required\":\"1\"}]', 1, 'private', 1, '2026-08-12 16:51:22', '2026-08-17 14:07:55'),
(10, 'Pan Card menual Pdf', 'pan-card-menual-pdf', 'Upload Image and Signature', '📄', 'service-logos/LztKp4THe1qf1lz71JrcXv8ignjCzBtbC3RXrSDh.png', 49, 'manual', NULL, '[{\"label\":\"Upload Image\",\"type\":\"file\",\"required\":\"1\"},{\"label\":\"Upload Signature\",\"type\":\"file\",\"required\":\"1\"},{\"label\":\"Upload old Pan Photo\",\"type\":\"text\",\"required\":\"0\"},{\"label\":\"Upload Aadhar Card frent and Back\",\"type\":\"text\",\"required\":\"1\"},{\"label\":\"Write Name, Dob, Father Name, Pan Number\",\"type\":\"textarea\",\"required\":\"1\"}]', 1, 'private', 1, '2026-08-12 16:53:34', '2026-08-17 14:09:47'),
(11, 'Pan Card to Pan Details', 'pan-card-to-pan-details', 'Enter Pan Number', '📄', 'service-logos/Q63kHtEKinnsR9MZ2oySqkyKqmscYDGRvJVJmVSR.png', 29, 'manual', NULL, '[{\"label\":\"Enter Pan Number\",\"type\":\"textarea\",\"required\":\"0\"}]', 1, 'private', 1, '2026-08-12 16:55:57', '2026-08-17 14:10:10'),
(12, 'Mobile to Info Find  Instant', 'mobile-to-info-find-instant', 'Enter Mobile Number find details.', '📄', 'service-logos/lVGO0FfjUSD2BfAGQE6t34DMYIPNyIIR6GjL1A3z.png', 99, 'manual', NULL, '[{\"label\":\"Mobile Number\",\"type\":\"number\",\"required\":\"1\"}]', 1, 'private', 1, '2026-08-12 16:56:37', '2026-08-17 14:09:15'),
(14, 'DL Pdf instant', 'dl-pdf-instant', 'Driving License Number and Date of Birth', '📄', 'service-logos/Gci0KFomPKxrm1Vob6OepXeTKsYWnyNzIaMHlUiL.png', 149, 'manual', NULL, '[{\"label\":\"Driving License Number and Date of Birth\",\"type\":\"textarea\",\"required\":\"1\"}]', 1, 'private', 1, '2026-08-12 16:59:27', '2026-08-17 14:08:14'),
(15, 'Vehicle Number to Mobile Number', 'vehicle-number-to-mobile-number', 'TIME 10-15 MIN', '📄', 'service-logos/WvTvmRXsxykfC41GRkRCn1g6sKNfIyclOsMwvszS.png', 149, 'manual', NULL, '[{\"label\":\"Vehicle Number\",\"type\":\"textarea\",\"required\":\"1\"}]', 1, 'public', 1, '2026-08-12 16:59:55', '2026-08-17 15:15:03'),
(17, 'Passport Size Photo Set A4 & 4x6 as u req.', 'passport-size-photo-set-a4-4x6-as-u-req', 'mantion kr do ki kitni photo print krni hai apko a4 per 6 4x6 per 6 ya 8 jaisa apko acha lage', '📄', 'service-logos/4sKSFOOAuWSOBaje8YpQoTCgx5I1UeKhK9cnv3JQ.jpg', 9, 'manual', NULL, '[{\"label\":\"Image Upload\",\"type\":\"file\",\"required\":\"1\"}]', 1, 'public', 1, '2026-08-12 17:15:45', '2026-08-15 05:41:44'),
(18, 'insurance policy', 'insurance-policy', 'detail add kro', '📄', 'service-logos/gefnHyIdEiQEMvMGWZRBJSgH52elBTsaEIBj3uUK.jpg', 249, 'manual', NULL, '[{\"label\":\"upload insurance policy\",\"type\":\"file\",\"required\":\"1\"}]', 1, 'private', 1, '2026-08-12 17:23:07', '2026-08-17 15:11:52'),
(19, 'Haryana Domocile Apply', 'haryana-domocile', 'upload Document \r\n1. Aadhar Card\r\n2. Famliy id\r\n3. Ration Card\r\n4. 15-Year-Old Prof\r\n5. Live Photo\r\n6. under 18 10th marksheet and result', '📄', 'service-logos/jcySx3X8ylANn8ZINDL212maIqVMbjcrbmjcLFv0.jpg', 499, 'manual', NULL, '[{\"label\":\"upload Document  1. Aadhar Card 2. Famliy id 3. Ration Card 4. 15-Year-Old Prof in one pdf\",\"type\":\"file\",\"required\":\"1\"}]', 1, 'private', 1, '2026-08-12 17:27:16', '2026-08-17 15:11:35'),
(20, 'Marriage Certificate Apply only Panipat', 'marriage-certificate-apply-only-panipat', 'Marriage Certificate Application Only in Panipat 15 Working Day', '📄', 'service-logos/UEvmz6NQzM8jVgX2vdtxIa79EhT9Yd2o7ADrkPdo.jpg', 3000, 'manual', NULL, '[{\"label\":\"Aaadhar Card Boy\",\"type\":\"file\",\"required\":\"1\"},{\"label\":\"Aaadhar Card Girl\",\"type\":\"file\",\"required\":\"1\"},{\"label\":\"Boy 10th\\/Birth Certificate\",\"type\":\"file\",\"required\":\"1\"},{\"label\":\"Girl 10th\\/Birth Certificate\",\"type\":\"file\",\"required\":\"1\"},{\"label\":\"Couple Standing Photo\",\"type\":\"file\",\"required\":\"1\"},{\"label\":\"Wedding Photo Mang Bharte Hue\",\"type\":\"file\",\"required\":\"1\"},{\"label\":\"Wedding Photo fare Lete Hue\",\"type\":\"file\",\"required\":\"1\"}]', 1, 'private', 1, '2026-08-13 16:18:51', '2026-08-17 14:09:09'),
(22, 'New Marriage Certificate', 'new-marriage-certificate', 'Generate the joint, bride, and groom marriage affidavits as a single PDF.', '💑', NULL, 10, 'module', 'marriage_affidavit', NULL, 1, 'private', 1, '2026-08-14 18:59:53', '2026-08-17 14:09:41'),
(24, 'EID ID TO AADHAR NUMBER WITHOUT DOB (GUARENTED)', 'eid-id-to-aadhar-number-without-dob-guarented', 'Working time 2 days', '📄', 'service-logos/m5z19HuUflB9SOI0iYaLIjrBNxEv4x4QMRKVV0TS.png', 899, 'manual', NULL, '[{\"label\":\"Name\",\"type\":\"text\",\"required\":\"1\"},{\"label\":\"EID NUMBER\",\"type\":\"text\",\"required\":\"1\"},{\"label\":\"Date\",\"type\":\"text\",\"required\":\"1\"},{\"label\":\"Time\",\"type\":\"text\",\"required\":\"1\"}]', 1, 'private', 1, '2026-08-15 06:44:59', '2026-08-18 05:08:27'),
(25, 'Aadhar Number To AADHAR PDF', 'aadhar-number-to-aadhar-pdf', NULL, '📄', 'service-logos/dh4rJZ9ErB0BDYspzDdKygtEk8W6pixPIQBJCk7f.png', 899, 'manual', NULL, '[{\"label\":\"Aadhaar Number\",\"type\":\"text\",\"required\":\"1\"},{\"label\":\"WhatsApp Number\",\"type\":\"text\",\"required\":\"1\"}]', 1, 'private', 1, '2026-08-15 06:46:07', '2026-08-17 14:07:39'),
(26, 'Aadhar Number To FULL Mobile Number FIND', 'aadhar-number-to-full-mobile-number-find', 'Sahi jaankari bharein — request submit ke baad change nahi hoti.', '📄', 'service-logos/eon70PLyD9mPHQ2qHmJ0elEYJpQzvdCuXPu9sK6Y.png', 199, 'manual', NULL, '[{\"label\":\"AADHAR NUMBER\",\"type\":\"text\",\"required\":\"1\"}]', 1, 'private', 1, '2026-08-15 06:47:07', '2026-08-17 14:07:43'),
(27, 'Pan To Aadhar', 'pan-to-aadhar', 'Charge sirf successful result par katega.', '📄', 'service-logos/02HQBw9oeGjP6jeNw4mhBSHvaGiOK4PN265ZJr0y.png', 99, 'manual', NULL, '[{\"label\":\"PAN Number\",\"type\":\"text\",\"required\":\"1\"}]', 1, 'public', 1, '2026-08-15 06:48:39', '2026-08-17 15:14:39'),
(28, 'Pan Orignal PDF NSDL', 'pan-orignal-pdf-nsdl', 'TIME-- 25-50 MIN (AADHAR CARD ME MOBILE NUMBER LINK HONA CHHIYE)', '📄', 'service-logos/BJF2ThCjatedj9kw04Ckj3BL4f7kfJtg5jeDERIi.png', 99, 'manual', NULL, '[{\"label\":\"PAN CARD NUMBER\",\"type\":\"text\",\"required\":\"1\"},{\"label\":\"AADHAR NUMBER\",\"type\":\"text\",\"required\":\"1\"},{\"label\":\"DATE OF BIRTH\",\"type\":\"text\",\"required\":\"1\"},{\"label\":\"AADHAR REGISTER MOBILE NUMBER\",\"type\":\"text\",\"required\":\"1\"},{\"label\":\"RETRAILER WHATSHAPP NUMBER\",\"type\":\"text\",\"required\":\"1\"}]', 1, 'public', 1, '2026-08-15 06:50:35', '2026-08-17 15:14:25'),
(29, 'Voter Orignal PDF', 'voter-orignal-pdf', 'TIME 10-15 MIN', '📄', 'service-logos/zrpAVMq38AvDrtM9c8UIb9vOYNh7oi2Q9bs24549.png', 149, 'manual', NULL, '[{\"label\":\"VOTER CARD NUMBER\",\"type\":\"text\",\"required\":\"1\"}]', 1, 'public', 1, '2026-08-15 06:51:49', '2026-08-15 06:51:49'),
(30, 'Udhyam Registration', 'udhyam-registration', 'Timing 2-3 Hour\r\nFor Business Use | Company • Bank Csp • CSC • Cyber Cafe -- Or Bhi Details WhatsApp Per Li Jaugi', '📄', 'service-logos/zaoIC6hj8aJqu12jLh3pPIkgEb9lQ6EqkzigfPwf.png', 149, 'manual', NULL, '[{\"label\":\"Name\",\"type\":\"text\",\"required\":\"1\"},{\"label\":\"Aadhar\",\"type\":\"text\",\"required\":\"1\"},{\"label\":\"Pan card\",\"type\":\"text\",\"required\":\"1\"},{\"label\":\"Gmail\",\"type\":\"text\",\"required\":\"1\"},{\"label\":\"WhatsApp Number\",\"type\":\"text\",\"required\":\"1\"}]', 1, 'public', 1, '2026-08-15 06:54:00', '2026-08-15 06:54:00'),
(31, 'Electric Bill PDF', 'electric-bill-pdf', 'Fetch electricity bill PDF using AC Number', '📄', 'service-logos/lSykC0AdS1WprRwR05JOasR3eoN88nqhr98wf2Gr.png', 49, 'manual', NULL, '[{\"label\":\"AC Number UHBVN\",\"type\":\"text\",\"required\":\"1\"}]', 1, 'private', 1, '2026-08-15 06:55:30', '2026-08-17 14:08:27'),
(33, 'Aadhar Card number to Famliy id number', 'aadhar-card-number-to-famliy-id-number', 'enter aadhr card number', '📄', NULL, 10, 'manual', NULL, '[{\"label\":\"aadhar card number\",\"type\":\"number\",\"required\":\"1\"}]', 1, 'private', 1, '2026-08-16 07:49:57', '2026-08-17 14:07:32'),
(34, 'Famliy id number to Pdf without otp', 'famliy-id-number-to-pdf-without-otp', 'enter aadhr number ya famliy id number time 10-15 Min', '📄', NULL, 15, 'manual', NULL, '[{\"label\":\"Famliy id number ya aadhr card number\",\"type\":\"number\",\"required\":\"1\"}]', 1, 'public', 1, '2026-08-19 05:08:18', '2026-08-19 05:08:18'),
(35, 'Famliy id to aadhar card', 'famliy-id-to-aadhar-card', 'enter famliy id number', '📄', NULL, 249, 'manual', NULL, '[{\"label\":\"Famliy id number\",\"type\":\"number\",\"required\":\"1\"}]', 1, 'public', 1, '2026-08-20 05:40:39', '2026-08-20 05:40:39');

-- --------------------------------------------------------

--
-- Table structure for table `service_requests`
--

CREATE TABLE `service_requests` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `service_id` bigint(20) UNSIGNED DEFAULT NULL,
  `service_name` varchar(255) NOT NULL,
  `input_data` text DEFAULT NULL,
  `coins_charged` int(10) UNSIGNED NOT NULL DEFAULT 0,
  `status` varchar(20) NOT NULL DEFAULT 'pending',
  `admin_response` text DEFAULT NULL,
  `estimated_time` varchar(255) DEFAULT NULL,
  `attachment` varchar(255) DEFAULT NULL,
  `completed_by` bigint(20) UNSIGNED DEFAULT NULL,
  `completed_at` timestamp NULL DEFAULT NULL,
  `refunded_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `service_requests`
--

INSERT INTO `service_requests` (`id`, `user_id`, `service_id`, `service_name`, `input_data`, `coins_charged`, `status`, `admin_response`, `estimated_time`, `attachment`, `completed_by`, `completed_at`, `refunded_at`, `created_at`, `updated_at`) VALUES
(7, 9, NULL, 'Vehicle Detail', '{\"vehicle_number\":\"HR06AB2200\"}', 0, 'accepted', '\"chassis_last5\": \"17541\",\n    \"mobile\": \"9215818900\",\n    \"reg_no\": \"HR06AQ6025\",\n    \"success\": true\n}', NULL, NULL, NULL, NULL, NULL, '2026-06-30 08:03:54', '2026-08-12 11:46:12'),
(8, 9, NULL, 'Vehicle Owner', '{\"query\":\"HR06AQ6025\"}', 0, 'accepted', '\"chassis_last5\": \"17541\",\n    \"mobile\": \"9215818900\",\n    \"reg_no\": \"HR06AQ6025\",\n    \"success\": true\n}', 'Done', NULL, NULL, NULL, NULL, '2026-08-01 13:24:39', '2026-08-12 11:46:05'),
(9, 9, 5, 'Mobile no. To aadhar Number', '{\"Note\":\"9541230611\"}', 99, 'accepted', NULL, NULL, NULL, NULL, NULL, NULL, '2026-08-12 14:37:34', '2026-08-12 15:05:38'),
(11, 13, 5, 'Mobile no. To aadhar Number', '{\"Note\":\"8814892904\"}', 99, 'rejected', NULL, NULL, NULL, 1, '2026-08-13 17:02:33', '2026-08-13 17:02:33', '2026-08-12 15:05:21', '2026-08-13 17:02:33'),
(12, 9, 17, 'Passport Size Photo Set A4 & 4x6 as u req.', '{\"Image Upload\":{\"type\":\"file\",\"path\":\"service-documents\\/wGIooi9oWl4hjt46VoPKc2B6AS60KVY2Fb6EUMzt.jpg\",\"name\":\"SADABAD - Copy.jpg\"},\"Note\":\"a4\"}', 9, 'accepted', NULL, NULL, NULL, 1, '2026-08-12 17:16:36', '2026-08-12 17:16:36', '2026-08-12 17:16:09', '2026-08-13 17:02:27'),
(13, 15, 7, 'Aadhar Card Address Change', '{\"image\":{\"type\":\"file\",\"path\":\"service-documents\\/vy13cXzBBUe13QRr9mmV8cpEIkv8wCcn7KmzcPR6.png\",\"name\":\"Screenshot 2026-08-13 221839.png\"},\"Aadhar Card Frent & Back\":{\"type\":\"file\",\"path\":\"service-documents\\/fsbGKPsfBbYqdicvESIXhvVx8hHWwlnBb5A6QfMP.png\",\"name\":\"Screenshot 2026-08-13 221839.png\"},\"Write the address\":null}', 299, 'accepted', NULL, NULL, NULL, NULL, NULL, NULL, '2026-08-13 17:00:09', '2026-08-13 17:02:46'),
(14, 15, 7, 'Aadhar Card Address Change', '{\"image\":{\"type\":\"file\",\"path\":\"service-documents\\/pDEGO2q68GodjvduiOGk2IQ0zMA1BQwQ8O8hPPZ7.png\",\"name\":\"Screenshot 2026-08-13 221839.png\"},\"Aadhar Card Frent & Back\":{\"type\":\"file\",\"path\":\"service-documents\\/mj5WRr0T9UCjGIAixnC6ZcK6JKDINDuszLomrQwb.png\",\"name\":\"Screenshot 2026-08-13 221839.png\"},\"Write the address\":null}', 299, 'accepted', NULL, NULL, NULL, NULL, NULL, NULL, '2026-08-13 17:00:20', '2026-08-13 17:02:20'),
(15, 15, 7, 'Aadhar Card Address Change', '{\"image\":{\"type\":\"file\",\"path\":\"service-documents\\/ct80ADYofVd7Js4benlP7hxwHUtjK4zb059amA0X.png\",\"name\":\"Screenshot 2026-08-13 221839.png\"},\"Aadhar Card Frent & Back\":{\"type\":\"file\",\"path\":\"service-documents\\/5Y1mugDkqLJdNxqdUTvcu9BkTaxWKsrtgH4C8Y50.png\",\"name\":\"Screenshot 2026-08-13 221839.png\"},\"Write the address\":null}', 299, 'accepted', NULL, NULL, NULL, NULL, NULL, NULL, '2026-08-13 17:00:29', '2026-08-13 17:02:12'),
(16, 15, 7, 'Aadhar Card Address Change', '{\"image\":{\"type\":\"file\",\"path\":\"service-documents\\/STF6ESQlBFW2Vj5yBUXVhjCUmAy68223gpzDxAVx.png\",\"name\":\"Screenshot 2026-08-13 221839.png\"},\"Aadhar Card Frent & Back\":{\"type\":\"file\",\"path\":\"service-documents\\/JWb2b0QF740pJiU0MZHlFXhHLBR3ySjg15vDFsew.png\",\"name\":\"Screenshot 2026-08-13 221839.png\"},\"Write the address\":null}', 299, 'accepted', NULL, NULL, NULL, NULL, NULL, NULL, '2026-08-13 17:00:36', '2026-08-13 17:02:07'),
(17, 15, 7, 'Aadhar Card Address Change', '{\"image\":{\"type\":\"file\",\"path\":\"service-documents\\/ErmWZsuhLypB65u5GxEILnj9KsRSrR2TUPgOUM1O.png\",\"name\":\"Screenshot 2026-08-13 221839.png\"},\"Aadhar Card Frent & Back\":{\"type\":\"file\",\"path\":\"service-documents\\/4Sa1jbVEmlvgzG0m327kNe3dj1w4oNNKfAihrzMS.png\",\"name\":\"Screenshot 2026-08-13 221839.png\"},\"Write the address\":null}', 299, 'accepted', NULL, NULL, NULL, NULL, NULL, NULL, '2026-08-13 17:00:46', '2026-08-13 17:02:02'),
(18, 15, 7, 'Aadhar Card Address Change', '{\"image\":{\"type\":\"file\",\"path\":\"service-documents\\/A1MZbjmhJlp4pdJeUAcFBu5n4m1yJ7comTMQQvpY.png\",\"name\":\"Screenshot 2026-08-13 221839.png\"},\"Aadhar Card Frent & Back\":{\"type\":\"file\",\"path\":\"service-documents\\/F9jXsChI7gi8i6KxNZwAApUmOJwPb1CR9Ta9FbdH.png\",\"name\":\"Screenshot 2026-08-13 221839.png\"},\"Write the address\":null}', 299, 'accepted', NULL, NULL, NULL, NULL, NULL, NULL, '2026-08-13 17:00:52', '2026-08-13 17:01:59'),
(19, 15, NULL, 'Puc Certificate With otp', '{\"number Plate\":{\"type\":\"file\",\"path\":\"service-documents\\/qlpaAqU2ewIOvkYf8D4tJomJcaa5mRMPSLLIqt3X.png\",\"name\":\"Screenshot 2026-08-13 221839.png\"}}', 99, 'accepted', NULL, NULL, NULL, NULL, NULL, NULL, '2026-08-13 17:01:11', '2026-08-13 17:01:55'),
(20, 15, 8, 'Aadhaar Pdf to Pvc Card Instant', '{\"Aadhaar Pdf With Pdf Name Passward\":{\"type\":\"file\",\"path\":\"service-documents\\/mX8jIELCGW3v2GJZfBwBIB7Oh2gT8fZD9FDwHjbJ.png\",\"name\":\"Screenshot 2026-08-13 221839.png\"}}', 9, 'rejected', NULL, NULL, NULL, 1, '2026-08-13 17:02:16', '2026-08-13 17:02:16', '2026-08-13 17:01:29', '2026-08-13 17:02:16'),
(21, 15, 8, 'Aadhaar Pdf to Pvc Card Instant', '{\"Aadhaar Pdf With Pdf Name Passward\":{\"type\":\"file\",\"path\":\"service-documents\\/x4XQS60fQ7aIi9UhwIoRyPWrhraPV5hSHlGCiigZ.png\",\"name\":\"Screenshot 2026-08-13 221839.png\"}}', 9, 'accepted', NULL, NULL, NULL, NULL, NULL, NULL, '2026-08-13 17:01:35', '2026-08-13 17:01:48'),
(22, 13, 5, 'Sim No. To Aadhar Number', '{\"Number & Name\":\"8814892904\"}', 99, 'rejected', NULL, 'NOT FOUND DATA', NULL, 1, '2026-08-14 05:37:05', '2026-08-14 05:37:05', '2026-08-13 21:39:35', '2026-08-14 05:37:05'),
(23, 13, 5, 'Sim No. To Aadhar Number', '{\"Number & Name\":\"8814892904\"}', 99, 'completed', NULL, NULL, NULL, 11, '2026-08-14 17:49:13', NULL, '2026-08-14 12:33:36', '2026-08-14 17:49:13'),
(24, 15, 5, 'Sim No. To Aadhar Number', '{\"Number & Name\":\"9729673885\\nDEEPAK\"}', 99, 'accepted', 'OWNER NAME     : MR  DEEPAK KUMAR\nFATHER NAME    : PAWAN KUMAR\nMOBILE NO      : 8398853485\nALT MOBILE     : 9729673885\nAADHAR CARD NO : 874656388362\nCIRCLE         : VI HAR\nADDRESS        : S/O PAWAN KUMAR 23 KAIMLAKAIMLA KAIMLA KAIMLA 25KARNAL GARUNDAKARNAL KARNAL HARYANA 132114', NULL, NULL, NULL, NULL, NULL, '2026-08-14 16:10:43', '2026-08-14 16:11:41'),
(25, 15, NULL, 'Vehicle Number to Info', '{\"Vehicle Number\":\"HR91D0775\\nNUMBER\"}', 199, 'accepted', '{\n    \"chassis_last5\": \"06635\",\n    \"mobile\": \"9729673885\",\n    \"reg_no\": \"HR91D0775\",\n    \"success\": true', NULL, NULL, NULL, NULL, NULL, '2026-08-14 16:14:01', '2026-08-14 16:14:17'),
(26, 15, 9, 'Aadhar to Pan Find Instant', '{\"Write Aadhar Card Number\":\"649493447467\"}', 59, 'rejected', 'PENDING FOR SIET', NULL, NULL, 1, '2026-08-14 16:17:14', '2026-08-14 16:17:14', '2026-08-14 16:16:00', '2026-08-14 16:17:14'),
(27, 15, 27, 'Pan To Aadhar', '{\"PAN Number\":\"jogpk3303k\"}', 99, 'accepted', NULL, NULL, NULL, NULL, NULL, NULL, '2026-08-15 06:52:55', '2026-08-15 07:00:04'),
(28, 15, 25, 'Aadhar Number To AADHAR PDF', '{\"Aadhaar Number\":\"874656388362\",\"WhatsApp Number\":\"9729673885\"}', 899, 'accepted', NULL, NULL, NULL, NULL, NULL, NULL, '2026-08-15 06:56:59', '2026-08-15 06:59:48'),
(29, 15, 20, 'Marriage Certificate Apply only Panipat', '{\"Aaadhar Card Boy\":{\"type\":\"file\",\"path\":\"service-documents\\/gFGXIpZgcJ5v0uwWDtMfdtoFxzbZTJXeOtU1QB02.png\",\"name\":\"Screenshot 2026-08-15 122500.png\"},\"Aaadhar Card Girl\":{\"type\":\"file\",\"path\":\"service-documents\\/HUCgaDAbm72bjJj7SeY1ch0zR1SkUh4bJTxsOkZB.png\",\"name\":\"Screenshot 2026-08-15 122500.png\"},\"Boy 10th\\/Birth Certificate\":{\"type\":\"file\",\"path\":\"service-documents\\/qdg4UxudUxGrZtUxkcj6qxd3wir3znTcb8eDTvQl.png\",\"name\":\"Screenshot 2026-08-15 122500.png\"},\"Girl 10th\\/Birth Certificate\":{\"type\":\"file\",\"path\":\"service-documents\\/hX7YeMw3XXDD59gdNyzrW1ZjrZALcpnDdtvtRQQD.png\",\"name\":\"Screenshot 2026-08-15 122500.png\"},\"Couple Standing Photo\":{\"type\":\"file\",\"path\":\"service-documents\\/mkLht4CDChhXtVwcaLzRuW1rS7pqGKItRqplmNlP.png\",\"name\":\"Screenshot 2026-08-15 122500.png\"},\"Wedding Photo Mang Bharte Hue\":{\"type\":\"file\",\"path\":\"service-documents\\/Lm5k5LXkhmGEpNHf7Fzf2nbYDtX39sfpvkArjO79.png\",\"name\":\"Screenshot 2026-08-15 122500.png\"},\"Wedding Photo fare Lete Hue\":{\"type\":\"file\",\"path\":\"service-documents\\/nTw4b6ewn7UqYi0C1DMxTFmZzZcdsYCpVl1fGczn.png\",\"name\":\"Screenshot 2026-08-15 122500.png\"}}', 3000, 'accepted', NULL, NULL, NULL, NULL, NULL, NULL, '2026-08-15 06:57:55', '2026-08-15 06:59:45'),
(30, 15, NULL, 'Aadhar Card Number to Pdf', '[]', 799, 'accepted', NULL, NULL, NULL, NULL, NULL, NULL, '2026-08-15 06:58:29', '2026-08-15 06:59:41'),
(31, 15, 8, 'Aadhaar Pdf to Pvc Card Instant', '{\"Aadhaar Pdf With Pdf Name Passward\":{\"type\":\"file\",\"path\":\"service-documents\\/cSERY7DVeXGWEU2mIqpMzdmW7y0iBGuLrUBYjIh5.png\",\"name\":\"Screenshot 2026-08-15 122116.png\"}}', 9, 'accepted', NULL, NULL, NULL, NULL, NULL, NULL, '2026-08-15 06:58:35', '2026-08-15 06:59:35'),
(32, 15, NULL, 'Aadhar Card Number to Pdf', '[]', 799, 'accepted', NULL, NULL, NULL, NULL, NULL, NULL, '2026-08-15 06:58:41', '2026-08-15 06:59:32'),
(33, 15, NULL, 'Aadhar Card Number to Pdf', '[]', 799, 'accepted', NULL, NULL, NULL, NULL, NULL, NULL, '2026-08-15 06:58:43', '2026-08-15 06:59:28'),
(34, 27, 17, 'Passport Size Photo Set A4 & 4x6 as u req.', '{\"Image Upload\":{\"type\":\"file\",\"path\":\"service-documents\\/FwpCnzf7VLcgqJVfeuhf3RcU0KbRVGTm9atOGbNF.jpg\",\"name\":\"A.jpg\"}}', 9, 'accepted', NULL, NULL, NULL, NULL, NULL, NULL, '2026-08-18 14:30:53', '2026-08-18 14:31:59'),
(35, 27, 17, 'Passport Size Photo Set A4 & 4x6 as u req.', '{\"Image Upload\":{\"type\":\"file\",\"path\":\"service-documents\\/z6IAc1IdhC1CdZVSnSLbYg1BxOfTAm3wwmrLrDDr.jpg\",\"name\":\"A.jpg\"}}', 9, 'accepted', NULL, NULL, NULL, NULL, NULL, NULL, '2026-08-18 14:31:11', '2026-08-18 14:31:54'),
(36, 27, 17, 'Passport Size Photo Set A4 & 4x6 as u req.', '{\"Image Upload\":{\"type\":\"file\",\"path\":\"service-documents\\/TVH5714wDpBLureLybnRurC43EbkLkZaKbZ76Pi5.jpg\",\"name\":\"A.jpg\"}}', 9, 'accepted', NULL, NULL, NULL, NULL, NULL, NULL, '2026-08-18 14:31:19', '2026-08-18 14:31:48');

-- --------------------------------------------------------

--
-- Table structure for table `service_user`
--

CREATE TABLE `service_user` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `service_id` bigint(20) UNSIGNED NOT NULL,
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `service_user`
--

INSERT INTO `service_user` (`id`, `service_id`, `user_id`, `created_at`, `updated_at`) VALUES
(8, 8, 23, NULL, NULL),
(9, 2, 9, NULL, NULL),
(10, 2, 23, NULL, NULL),
(11, 3, 9, NULL, NULL),
(12, 33, 9, NULL, NULL),
(13, 9, 9, NULL, NULL),
(14, 31, 22, NULL, NULL),
(15, 31, 13, NULL, NULL),
(16, 31, 19, NULL, NULL),
(17, 31, 20, NULL, NULL),
(18, 31, 15, NULL, NULL),
(19, 31, 9, NULL, NULL),
(20, 31, 12, NULL, NULL),
(21, 31, 23, NULL, NULL),
(22, 31, 21, NULL, NULL),
(23, 31, 8, NULL, NULL),
(24, 19, 22, NULL, NULL),
(25, 19, 13, NULL, NULL),
(26, 19, 19, NULL, NULL),
(27, 19, 20, NULL, NULL),
(28, 19, 15, NULL, NULL),
(29, 19, 9, NULL, NULL),
(30, 19, 12, NULL, NULL),
(31, 19, 8, NULL, NULL),
(32, 19, 21, NULL, NULL),
(33, 18, 22, NULL, NULL),
(34, 18, 13, NULL, NULL),
(35, 18, 19, NULL, NULL),
(36, 18, 20, NULL, NULL),
(37, 18, 15, NULL, NULL),
(38, 18, 9, NULL, NULL),
(39, 18, 12, NULL, NULL),
(40, 18, 21, NULL, NULL),
(41, 18, 8, NULL, NULL),
(42, 1, 9, NULL, NULL),
(43, 20, 9, NULL, NULL),
(44, 12, 9, NULL, NULL),
(45, 22, 9, NULL, NULL),
(46, 10, 9, NULL, NULL),
(47, 11, 9, NULL, NULL),
(48, 22, 24, NULL, NULL),
(49, 24, 24, NULL, NULL),
(50, 24, 9, NULL, NULL),
(51, 12, 26, NULL, NULL),
(52, 22, 27, NULL, NULL),
(53, 22, 29, NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `sessions`
--

CREATE TABLE `sessions` (
  `id` varchar(255) NOT NULL,
  `user_id` bigint(20) UNSIGNED DEFAULT NULL,
  `ip_address` varchar(45) DEFAULT NULL,
  `user_agent` text DEFAULT NULL,
  `payload` longtext NOT NULL,
  `last_activity` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `sessions`
--

INSERT INTO `sessions` (`id`, `user_id`, `ip_address`, `user_agent`, `payload`, `last_activity`) VALUES
('LHfQNRytNbs4Q0fm3qBRXZTVWhEYF4IkrB9RojAK', 1, '2401:4900:8832:478c:a67d:dbe8:117a:aeba', 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', 'YTo0OntzOjY6Il90b2tlbiI7czo0MDoiUnRkYU12Rk5jRkY3dlhXdnRaMHRibzhhN3oyM0U2ZXZOWXZXUGpJaiI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6MjI6Imh0dHBzOi8vY3NwamFhbmthcmkuaW4iO3M6NToicm91dGUiO047fXM6NjoiX2ZsYXNoIjthOjI6e3M6Mzoib2xkIjthOjA6e31zOjM6Im5ldyI7YTowOnt9fXM6NTA6ImxvZ2luX3dlYl81OWJhMzZhZGRjMmIyZjk0MDE1ODBmMDE0YzdmNThlYTRlMzA5ODlkIjtpOjE7fQ==', 1787224343),
('nG1xnMdLZg2UwQQVSEj5Z2Q5mHLRvvV9Y54tBLoQ', NULL, '185.116.241.164', 'Mozilla/5.0 (Linux; Android 12; SAMSUNG SM-A415F) AppleWebKit/537.36 (KHTML, like Gecko) SamsungBrowser/23.0 Chrome/115.0.0.0 Mobile Safari/537.3', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoiWmRNeWFZZmZQbWtNUmxSblRIQzBxMEZXVlpNSTZFTnNPZ2xMdmdBUyI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6MjI6Imh0dHBzOi8vY3NwamFhbmthcmkuaW4iO3M6NToicm91dGUiO047fXM6NjoiX2ZsYXNoIjthOjI6e3M6Mzoib2xkIjthOjA6e31zOjM6Im5ldyI7YTowOnt9fX0=', 1787224204),
('SmNa0gcCLsC3RP1U4jyoyhJ9fGwDnBLzKa5hZhIw', NULL, '34.135.201.242', 'python-requests/2.32.5', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoiTjVuQVpOelQ1M0plb09mS09SY2hUUzgzaGFVc2xTVUY3TzlVMXdwSSI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6MjI6Imh0dHBzOi8vY3NwamFhbmthcmkuaW4iO3M6NToicm91dGUiO047fXM6NjoiX2ZsYXNoIjthOjI6e3M6Mzoib2xkIjthOjA6e31zOjM6Im5ldyI7YTowOnt9fX0=', 1787220547),
('UotCrliZsDuYP5TJ8JrHs4dWgnvltMzqF2YfR8f4', 1, '2401:4900:8832:478c:25f3:18db:f1c:e12f', 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', 'YTo0OntzOjY6Il90b2tlbiI7czo0MDoiNjFrWUZnVWd2MXc3Qnp6dzFVMWNKNkdLMVBacWRndGpQaFZ3R25kSiI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6MzI6Imh0dHBzOi8vY3NwamFhbmthcmkuaW4vZGFzaGJvYXJkIjtzOjU6InJvdXRlIjtzOjk6ImRhc2hib2FyZCI7fXM6NjoiX2ZsYXNoIjthOjI6e3M6Mzoib2xkIjthOjA6e31zOjM6Im5ldyI7YTowOnt9fXM6NTA6ImxvZ2luX3dlYl81OWJhMzZhZGRjMmIyZjk0MDE1ODBmMDE0YzdmNThlYTRlMzA5ODlkIjtpOjE7fQ==', 1787225093);

-- --------------------------------------------------------

--
-- Table structure for table `settings`
--

CREATE TABLE `settings` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `key` varchar(255) NOT NULL,
  `value` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `settings`
--

INSERT INTO `settings` (`id`, `key`, `value`, `created_at`, `updated_at`) VALUES
(1, 'upi_id', 'cspjankari.cc@ptaxis', '2026-08-04 18:24:28', '2026-08-05 06:14:28'),
(2, 'upi_name', 'CSP Jaankari', '2026-08-04 18:24:28', '2026-08-04 18:24:28');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(255) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `phone` varchar(255) DEFAULT NULL,
  `coins` bigint(20) NOT NULL DEFAULT 0,
  `email_verified_at` timestamp NULL DEFAULT NULL,
  `password` varchar(255) NOT NULL,
  `type` varchar(255) NOT NULL DEFAULT 'user',
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `remember_token` varchar(100) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `name`, `email`, `phone`, `coins`, `email_verified_at`, `password`, `type`, `is_active`, `remember_token`, `created_at`, `updated_at`) VALUES
(1, 'White Devil', 'whitedevilkiler@gmail.com', NULL, 11019879, NULL, '$2y$12$s23MiZaXMrpW.HopXv.Oxenc1GeLC11BOXFxOQ0QnsjMjosXhTQW6', 'admin', 1, NULL, '2026-05-12 17:48:55', '2026-08-15 05:28:49'),
(8, 'ved', 'vedtomer@gmail.com', NULL, 10000080, NULL, '$2y$12$N5bL/V3DEYNWQnvaNgZFqup9oZ4aY4yvUxBmQrsD/H2x7NECOKh5u', 'user', 1, NULL, '2026-05-13 09:43:09', '2026-08-12 11:49:34'),
(9, 'sam', 'vandnadigigraphics@gmail.com', NULL, 9998413, NULL, '$2y$12$R8oAYMRjGGTku0.ZEIdBmO.6AyhX6k9HZOnTe8x6GzXqAyGuH82um', 'user', 1, 'PXShalkdzaQCkKljtzg7Xny6WQuv29c8L1m8lPo47s2Qy2Fb6QChDJMcDUYO', '2026-05-14 06:04:58', '2026-08-18 14:13:27'),
(10, 'Super Admin', 'superadmin@cspjaankari.in', NULL, 10000, NULL, '$2y$12$ZeJe.kfljsCpfqde1aHBGu8Tr2zzabe0XvgrYfrvV/UFzyHZxVhHu', 'super_admin', 1, NULL, '2026-08-04 23:23:31', '2026-08-04 23:23:31'),
(11, 'System Admin', 'admin@cspjaankari.in', NULL, 5000, NULL, '$2y$12$lHSWXvrfzzTsh45oXmXCOumCMOWJpZV3m1HxgHa4U3gcBBpn8n0LK', 'admin', 1, NULL, '2026-08-04 23:23:31', '2026-08-04 23:23:31'),
(12, 'Sanjeev', 'sanjeevcsc@gmail.com', 'sanjeevcsc@gmail.com', 0, NULL, '$2y$12$uoX8dfzklbsnuwOFgFUzuuz9og..kj.FvPIljQEwRi8mp7G9PtHs2', 'user', 1, NULL, '2026-08-12 14:19:51', '2026-08-12 14:19:51'),
(13, 'ankit', 'ankitambala90@gmail.com', NULL, 48, NULL, '$2y$12$QRWxxw4ngRzm9R6sque6/.Wu.bK5LI9.V7nDbOaPnjMhpoKAYCSRC', 'user', 1, NULL, '2026-08-12 14:28:42', '2026-08-15 05:30:40'),
(15, 'Deepak Kumar', 'shriganeshjewelaryandcsccenter@gmail.com', NULL, 27, NULL, '$2y$12$xek577iE9ENDqbrxxQmCJOWwWayRD4Dz5aioPOiVczuXOWD0EaCPC', 'user', 1, NULL, '2026-08-13 16:57:26', '2026-08-15 06:58:43'),
(19, 'deepak', 'vermagovtservicecenter@gmail.com', NULL, 0, NULL, '$2y$12$NFReKONBK9944fXBu2TVbe2/nlhehBY9xymUDwMocNtxx9IHwtT.W', 'user', 1, NULL, '2026-08-15 05:32:32', '2026-08-15 14:07:02'),
(20, 'deepak', NULL, '7206206615', 0, NULL, '$2y$12$u.edkmF1ZXQr6p/v2AkW3.rHf6odZrIk90ZXTG5B2VGLJXUZ/cK36', 'user', 1, NULL, '2026-08-15 07:30:51', '2026-08-15 14:06:51'),
(21, 'sid', NULL, '9306513935', 0, NULL, '$2y$12$pQPP2FnxWGadD4yn5FoWp.HJMPxMX0WI4B3MLhiSqcVXfiTTm1ECm', 'user', 1, NULL, '2026-08-15 13:06:24', '2026-08-15 14:06:42'),
(22, NULL, 'mrf93772@gmail.com', NULL, 0, NULL, '$2y$12$5pqwwJ2KYSUXbZ8DHYRGhOTkgYFf8agAIxvwcGrgyNUITZEqUNg9W', 'user', 1, NULL, '2026-08-16 17:11:12', '2026-08-16 17:11:12'),
(23, 'Shanu', NULL, '7988528032', 105, NULL, '$2y$12$C4loD4GpSBo8ZZ2uadveCu60GZKQN0Cd1JuKq8Dp3Xr363Jr/HOqC', 'user', 1, NULL, '2026-08-17 13:33:46', '2026-08-17 13:36:25'),
(24, 'rohit', NULL, '9817649658', 0, NULL, '$2y$12$ua8L1RM7Vc8QyxG2a7By6ecNzKFBbghi6KMfctmDbkSCFB1fwNqSS', 'user', 1, NULL, '2026-08-17 16:25:13', '2026-08-17 16:25:13'),
(25, NULL, NULL, '8199003967', 0, NULL, '$2y$12$ZL4iAQkiQcSqnLSyTFhcTOUVd670vRWPjLUxG7w6aVpF0jJIIEvIS', 'user', 1, NULL, '2026-08-18 05:20:42', '2026-08-18 05:20:42'),
(26, 'KAPIL', NULL, '8199930043', 0, NULL, '$2y$12$gC7P0pwVAH8rPCIFWqM/xeSm0JdRP03gKOeqiLtFLYcdxZujVxSb.', 'user', 1, NULL, '2026-08-18 11:51:09', '2026-08-18 11:51:09'),
(27, 'RAJESH', NULL, '9896256580', 12, NULL, '$2y$12$Dlzi2sjmYvEMdYCjqKElm.UmjpSSkIeFwBDPwNKVIdJESHE3j.Xg6', 'user', 1, NULL, '2026-08-18 14:29:20', '2026-08-18 14:36:12'),
(28, NULL, 'parasstudio25@gmail.com', NULL, 219, NULL, '$2y$12$2l39.q66zdDruJsqOwRtxeIySBS6YBcSw04hEFPNM76z8oOiQq8FS', 'user', 1, NULL, '2026-08-19 04:31:58', '2026-08-19 17:10:27'),
(29, 'pooja', NULL, '8396986164', 49, NULL, '$2y$12$hVSNXpvZY/eWx4DW8O6VVe7srDFSbQ7.I6usw3KVHZhSodsm3Soom', 'user', 1, NULL, '2026-08-19 17:10:40', '2026-08-19 17:15:14');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `activity_logs`
--
ALTER TABLE `activity_logs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `activity_logs_user_id_foreign` (`user_id`);

--
-- Indexes for table `birth_records`
--
ALTER TABLE `birth_records`
  ADD PRIMARY KEY (`id`),
  ADD KEY `birth_records_user_id_index` (`user_id`);

--
-- Indexes for table `cache`
--
ALTER TABLE `cache`
  ADD PRIMARY KEY (`key`);

--
-- Indexes for table `cache_locks`
--
ALTER TABLE `cache_locks`
  ADD PRIMARY KEY (`key`);

--
-- Indexes for table `coin_purchase_requests`
--
ALTER TABLE `coin_purchase_requests`
  ADD PRIMARY KEY (`id`),
  ADD KEY `coin_purchase_requests_approved_by_foreign` (`approved_by`),
  ADD KEY `coin_purchase_requests_user_id_status_index` (`user_id`,`status`),
  ADD KEY `coin_purchase_requests_created_at_index` (`created_at`);

--
-- Indexes for table `coin_transactions`
--
ALTER TABLE `coin_transactions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `coin_transactions_created_by_foreign` (`created_by`),
  ADD KEY `coin_transactions_user_id_created_at_index` (`user_id`,`created_at`),
  ADD KEY `coin_transactions_type_index` (`type`);

--
-- Indexes for table `failed_jobs`
--
ALTER TABLE `failed_jobs`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `failed_jobs_uuid_unique` (`uuid`);

--
-- Indexes for table `haryana_domiciles`
--
ALTER TABLE `haryana_domiciles`
  ADD PRIMARY KEY (`id`),
  ADD KEY `haryana_domiciles_user_id_index` (`user_id`);

--
-- Indexes for table `jobs`
--
ALTER TABLE `jobs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `jobs_queue_index` (`queue`);

--
-- Indexes for table `job_batches`
--
ALTER TABLE `job_batches`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `marriage_affidavits`
--
ALTER TABLE `marriage_affidavits`
  ADD PRIMARY KEY (`id`),
  ADD KEY `marriage_affidavits_user_id_foreign` (`user_id`);

--
-- Indexes for table `marriage_forms`
--
ALTER TABLE `marriage_forms`
  ADD PRIMARY KEY (`id`),
  ADD KEY `marriage_forms_user_id_foreign` (`user_id`);

--
-- Indexes for table `migrations`
--
ALTER TABLE `migrations`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `model_has_permissions`
--
ALTER TABLE `model_has_permissions`
  ADD PRIMARY KEY (`permission_id`,`model_id`,`model_type`),
  ADD KEY `model_has_permissions_model_id_model_type_index` (`model_id`,`model_type`);

--
-- Indexes for table `model_has_roles`
--
ALTER TABLE `model_has_roles`
  ADD PRIMARY KEY (`role_id`,`model_id`,`model_type`),
  ADD KEY `model_has_roles_model_id_model_type_index` (`model_id`,`model_type`);

--
-- Indexes for table `notifications`
--
ALTER TABLE `notifications`
  ADD PRIMARY KEY (`id`),
  ADD KEY `notifications_notifiable_type_notifiable_id_index` (`notifiable_type`,`notifiable_id`);

--
-- Indexes for table `pan_details_requests`
--
ALTER TABLE `pan_details_requests`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `pan_requests`
--
ALTER TABLE `pan_requests`
  ADD PRIMARY KEY (`id`),
  ADD KEY `pan_requests_completed_by_foreign` (`completed_by`),
  ADD KEY `pan_requests_user_id_status_index` (`user_id`,`status`),
  ADD KEY `pan_requests_aadhar_number_index` (`aadhar_number`);

--
-- Indexes for table `password_reset_tokens`
--
ALTER TABLE `password_reset_tokens`
  ADD PRIMARY KEY (`email`);

--
-- Indexes for table `pdf_converters`
--
ALTER TABLE `pdf_converters`
  ADD PRIMARY KEY (`id`),
  ADD KEY `pdf_converters_user_id_index` (`user_id`);

--
-- Indexes for table `pdf_coordinates`
--
ALTER TABLE `pdf_coordinates`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `pdf_coordinates_page_field_name_unique` (`page`,`field_name`);

--
-- Indexes for table `permissions`
--
ALTER TABLE `permissions`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `permissions_name_guard_name_unique` (`name`,`guard_name`);

--
-- Indexes for table `roles`
--
ALTER TABLE `roles`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `roles_name_guard_name_unique` (`name`,`guard_name`);

--
-- Indexes for table `role_has_permissions`
--
ALTER TABLE `role_has_permissions`
  ADD PRIMARY KEY (`permission_id`,`role_id`),
  ADD KEY `role_has_permissions_role_id_foreign` (`role_id`);

--
-- Indexes for table `services`
--
ALTER TABLE `services`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `services_slug_unique` (`slug`),
  ADD KEY `services_is_active_sort_order_index` (`is_active`,`sort_order`);

--
-- Indexes for table `service_requests`
--
ALTER TABLE `service_requests`
  ADD PRIMARY KEY (`id`),
  ADD KEY `service_requests_completed_by_foreign` (`completed_by`),
  ADD KEY `service_requests_user_id_status_index` (`user_id`,`status`),
  ADD KEY `service_requests_service_name_index` (`service_name`),
  ADD KEY `service_requests_service_id_foreign` (`service_id`);

--
-- Indexes for table `service_user`
--
ALTER TABLE `service_user`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `service_user_service_id_user_id_unique` (`service_id`,`user_id`),
  ADD KEY `service_user_user_id_foreign` (`user_id`);

--
-- Indexes for table `sessions`
--
ALTER TABLE `sessions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `sessions_user_id_index` (`user_id`),
  ADD KEY `sessions_last_activity_index` (`last_activity`);

--
-- Indexes for table `settings`
--
ALTER TABLE `settings`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `settings_key_unique` (`key`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `users_email_unique` (`email`),
  ADD UNIQUE KEY `users_phone_unique` (`phone`),
  ADD KEY `users_coins_index` (`coins`),
  ADD KEY `users_type_index` (`type`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `activity_logs`
--
ALTER TABLE `activity_logs`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `birth_records`
--
ALTER TABLE `birth_records`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT for table `coin_purchase_requests`
--
ALTER TABLE `coin_purchase_requests`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=25;

--
-- AUTO_INCREMENT for table `coin_transactions`
--
ALTER TABLE `coin_transactions`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=137;

--
-- AUTO_INCREMENT for table `failed_jobs`
--
ALTER TABLE `failed_jobs`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `haryana_domiciles`
--
ALTER TABLE `haryana_domiciles`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=72;

--
-- AUTO_INCREMENT for table `jobs`
--
ALTER TABLE `jobs`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `marriage_affidavits`
--
ALTER TABLE `marriage_affidavits`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `marriage_forms`
--
ALTER TABLE `marriage_forms`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `migrations`
--
ALTER TABLE `migrations`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=40;

--
-- AUTO_INCREMENT for table `pan_details_requests`
--
ALTER TABLE `pan_details_requests`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `pan_requests`
--
ALTER TABLE `pan_requests`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `pdf_converters`
--
ALTER TABLE `pdf_converters`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `pdf_coordinates`
--
ALTER TABLE `pdf_coordinates`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=41;

--
-- AUTO_INCREMENT for table `permissions`
--
ALTER TABLE `permissions`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=84;

--
-- AUTO_INCREMENT for table `roles`
--
ALTER TABLE `roles`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `services`
--
ALTER TABLE `services`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=36;

--
-- AUTO_INCREMENT for table `service_requests`
--
ALTER TABLE `service_requests`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=37;

--
-- AUTO_INCREMENT for table `service_user`
--
ALTER TABLE `service_user`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=54;

--
-- AUTO_INCREMENT for table `settings`
--
ALTER TABLE `settings`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=30;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `activity_logs`
--
ALTER TABLE `activity_logs`
  ADD CONSTRAINT `activity_logs_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `birth_records`
--
ALTER TABLE `birth_records`
  ADD CONSTRAINT `birth_records_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `coin_purchase_requests`
--
ALTER TABLE `coin_purchase_requests`
  ADD CONSTRAINT `coin_purchase_requests_approved_by_foreign` FOREIGN KEY (`approved_by`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `coin_purchase_requests_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `coin_transactions`
--
ALTER TABLE `coin_transactions`
  ADD CONSTRAINT `coin_transactions_created_by_foreign` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `coin_transactions_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `haryana_domiciles`
--
ALTER TABLE `haryana_domiciles`
  ADD CONSTRAINT `haryana_domiciles_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `marriage_affidavits`
--
ALTER TABLE `marriage_affidavits`
  ADD CONSTRAINT `marriage_affidavits_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `marriage_forms`
--
ALTER TABLE `marriage_forms`
  ADD CONSTRAINT `marriage_forms_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `model_has_permissions`
--
ALTER TABLE `model_has_permissions`
  ADD CONSTRAINT `model_has_permissions_permission_id_foreign` FOREIGN KEY (`permission_id`) REFERENCES `permissions` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `model_has_roles`
--
ALTER TABLE `model_has_roles`
  ADD CONSTRAINT `model_has_roles_role_id_foreign` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `pan_requests`
--
ALTER TABLE `pan_requests`
  ADD CONSTRAINT `pan_requests_completed_by_foreign` FOREIGN KEY (`completed_by`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `pan_requests_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `pdf_converters`
--
ALTER TABLE `pdf_converters`
  ADD CONSTRAINT `pdf_converters_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `role_has_permissions`
--
ALTER TABLE `role_has_permissions`
  ADD CONSTRAINT `role_has_permissions_permission_id_foreign` FOREIGN KEY (`permission_id`) REFERENCES `permissions` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `role_has_permissions_role_id_foreign` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `service_requests`
--
ALTER TABLE `service_requests`
  ADD CONSTRAINT `service_requests_completed_by_foreign` FOREIGN KEY (`completed_by`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `service_requests_service_id_foreign` FOREIGN KEY (`service_id`) REFERENCES `services` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `service_requests_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `service_user`
--
ALTER TABLE `service_user`
  ADD CONSTRAINT `service_user_service_id_foreign` FOREIGN KEY (`service_id`) REFERENCES `services` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `service_user_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
