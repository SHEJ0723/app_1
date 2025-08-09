-- MySQL dump 10.13  Distrib 8.0.34, for Win64 (x86_64)
--
-- Host: localhost    Database: parking_automation_system
-- ------------------------------------------------------
-- Server version	8.0.34

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `admins`
--

DROP TABLE IF EXISTS `admins`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `admins` (
  `id` int NOT NULL AUTO_INCREMENT,
  `employee_id` varchar(10) COLLATE utf8mb4_unicode_ci NOT NULL,
  `password_hash` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(120) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `role` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `department` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL,
  `last_login` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `ix_admins_employee_id` (`employee_id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `admins`
--

LOCK TABLES `admins` WRITE;
/*!40000 ALTER TABLE `admins` DISABLE KEYS */;
INSERT INTO `admins` VALUES (1,'admin','scrypt:32768:8:1$1AlpyKrHUhapnJ2k$9391690fa9916d1f9acbfa49767eb28746e5f2e8d8a37e20125c88ea63751118d25390988c15343cbba56d1187566172412ddd615d9ba7b66919ee86d7289f1c','系统管理员','admin@example.com','super_admin','系统管理部','active','2025-06-29 10:04:25','2025-08-02 15:05:08','2025-08-02 15:05:08');
/*!40000 ALTER TABLE `admins` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `bills`
--

DROP TABLE IF EXISTS `bills`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `bills` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `order_id` int NOT NULL,
  `amount` float NOT NULL,
  `pay_time` datetime DEFAULT NULL,
  `status` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `pay_method` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `ix_bills_order_id` (`order_id`),
  KEY `ix_bills_user_id` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `bills`
--

LOCK TABLES `bills` WRITE;
/*!40000 ALTER TABLE `bills` DISABLE KEYS */;
/*!40000 ALTER TABLE `bills` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `feedbacks`
--

DROP TABLE IF EXISTS `feedbacks`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `feedbacks` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `content` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` datetime DEFAULT NULL,
  `reply` text COLLATE utf8mb4_unicode_ci,
  `reply_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `ix_feedbacks_user_id` (`user_id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `feedbacks`
--

LOCK TABLES `feedbacks` WRITE;
/*!40000 ALTER TABLE `feedbacks` DISABLE KEYS */;
INSERT INTO `feedbacks` VALUES (1,6,'一直登录失败','2025-07-21 07:53:53','在看看情况','2025-07-23 02:51:21');
/*!40000 ALTER TABLE `feedbacks` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `license_plates`
--

DROP TABLE IF EXISTS `license_plates`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `license_plates` (
  `id` int NOT NULL AUTO_INCREMENT,
  `plate_number` varchar(10) COLLATE utf8mb4_unicode_ci NOT NULL,
  `vehicle_type` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_id` int NOT NULL,
  `is_default` tinyint(1) DEFAULT NULL,
  `status` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `ix_license_plates_plate_number` (`plate_number`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `license_plates_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `license_plates`
--

LOCK TABLES `license_plates` WRITE;
/*!40000 ALTER TABLE `license_plates` DISABLE KEYS */;
/*!40000 ALTER TABLE `license_plates` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `messages`
--

DROP TABLE IF EXISTS `messages`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `messages` (
  `id` int NOT NULL AUTO_INCREMENT,
  `sender_id` int DEFAULT NULL,
  `receiver_id` int NOT NULL,
  `content` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` datetime DEFAULT NULL,
  `is_read` tinyint(1) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `messages`
--

LOCK TABLES `messages` WRITE;
/*!40000 ALTER TABLE `messages` DISABLE KEYS */;
INSERT INTO `messages` VALUES (1,1,2,'收到扣1','2025-07-20 14:59:22',0),(2,1,4,'收到扣1','2025-07-20 14:59:22',0),(3,1,5,'收到扣1','2025-07-20 14:59:22',0),(5,1,6,'因为','2025-07-23 02:14:15',0),(6,1,6,'11','2025-07-23 02:44:41',0),(7,1,6,'1.1活动优惠','2025-07-23 02:51:35',0),(8,1,7,'1.1活动优惠','2025-07-23 02:51:35',0),(9,1,6,'123','2025-07-23 02:51:43',0);
/*!40000 ALTER TABLE `messages` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `orders`
--

DROP TABLE IF EXISTS `orders`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `orders` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `spot_id` int NOT NULL,
  `start_time` datetime NOT NULL,
  `end_time` datetime DEFAULT NULL,
  `status` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `amount` float NOT NULL,
  `pay_method` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `ix_orders_user_id` (`user_id`),
  KEY `ix_orders_spot_id` (`spot_id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `orders`
--

LOCK TABLES `orders` WRITE;
/*!40000 ALTER TABLE `orders` DISABLE KEYS */;
INSERT INTO `orders` VALUES (1,6,7,'2025-07-21 00:00:00',NULL,'未支付',0,NULL,'2025-07-20 11:34:16','2025-07-20 11:34:16');
/*!40000 ALTER TABLE `orders` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `parking_spots`
--

DROP TABLE IF EXISTS `parking_spots`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `parking_spots` (
  `id` int NOT NULL AUTO_INCREMENT,
  `spot_number` varchar(10) COLLATE utf8mb4_unicode_ci NOT NULL,
  `zone` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `type` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `is_active` tinyint(1) DEFAULT NULL,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL,
  `special_attribute` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `coordinates` varchar(10) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `ix_parking_spots_spot_number` (`spot_number`)
) ENGINE=InnoDB AUTO_INCREMENT=48 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `parking_spots`
--

LOCK TABLES `parking_spots` WRITE;
/*!40000 ALTER TABLE `parking_spots` DISABLE KEYS */;
INSERT INTO `parking_spots` VALUES (7,'A1','A','普通','占用',1,'2025-07-20 07:47:26','2025-07-20 11:34:16',NULL,NULL),(8,'A2','B','无障碍','空闲',1,'2025-07-20 07:47:26','2025-07-23 02:49:33',NULL,NULL),(9,'A3','A','普通','维修',1,'2025-07-20 07:47:26','2025-07-23 02:49:42',NULL,NULL),(10,'A4','A','普通','空闲',1,'2025-07-20 07:47:26','2025-07-20 07:47:26',NULL,NULL),(11,'A5','A','普通','空闲',1,'2025-07-20 07:47:26','2025-07-20 07:47:26',NULL,NULL),(12,'A6','A','普通','空闲',1,'2025-07-20 07:47:26','2025-07-20 07:47:26',NULL,NULL),(13,'A7','A','普通','空闲',1,'2025-07-20 07:47:26','2025-07-20 07:47:26',NULL,NULL),(14,'A8','A','普通','空闲',1,'2025-07-20 07:47:26','2025-07-20 07:47:26',NULL,NULL),(15,'A9','A','普通','空闲',1,'2025-07-20 07:47:26','2025-07-20 07:47:26',NULL,NULL),(16,'A10','A','普通','空闲',1,'2025-07-20 07:47:26','2025-07-20 07:47:26',NULL,NULL),(17,'B1','B','普通','空闲',1,'2025-07-20 07:47:26','2025-07-20 07:47:26',NULL,NULL),(18,'B2','B','普通','空闲',1,'2025-07-20 07:47:26','2025-07-20 07:47:26',NULL,NULL),(19,'B3','B','普通','空闲',1,'2025-07-20 07:47:26','2025-07-20 07:47:26',NULL,NULL),(20,'B4','B','普通','空闲',1,'2025-07-20 07:47:26','2025-07-20 07:47:26',NULL,NULL),(21,'B5','B','普通','空闲',1,'2025-07-20 07:47:26','2025-07-20 07:47:26',NULL,NULL),(22,'B6','B','普通','空闲',1,'2025-07-20 07:47:26','2025-07-20 07:47:26',NULL,NULL),(23,'B7','B','普通','空闲',1,'2025-07-20 07:47:26','2025-07-20 07:47:26',NULL,NULL),(24,'B8','B','普通','空闲',1,'2025-07-20 07:47:26','2025-07-20 07:47:26',NULL,NULL),(25,'B9','B','普通','空闲',1,'2025-07-20 07:47:26','2025-07-20 07:47:26',NULL,NULL),(26,'B10','B','普通','空闲',1,'2025-07-20 07:47:26','2025-07-20 07:47:26',NULL,NULL),(27,'C1','C','普通','空闲',1,'2025-07-20 07:47:26','2025-07-20 07:47:26',NULL,NULL),(28,'C2','C','普通','空闲',1,'2025-07-20 07:47:26','2025-07-20 07:47:26',NULL,NULL),(29,'C3','C','普通','空闲',1,'2025-07-20 07:47:26','2025-07-20 07:47:26',NULL,NULL),(30,'C4','C','普通','空闲',1,'2025-07-20 07:47:26','2025-07-20 07:47:26',NULL,NULL),(31,'C5','C','普通','空闲',1,'2025-07-20 07:47:26','2025-07-20 07:47:26',NULL,NULL),(32,'C6','C','大型','空闲',1,'2025-07-20 07:47:26','2025-07-20 07:47:26','Large',NULL),(33,'C7','C','大型','空闲',1,'2025-07-20 07:47:26','2025-07-20 07:47:26','Large',NULL),(34,'C8','C','大型','空闲',1,'2025-07-20 07:47:26','2025-07-20 07:47:26','Large',NULL),(35,'C9','C','大型','空闲',1,'2025-07-20 07:47:26','2025-07-20 07:47:26','Large',NULL),(36,'C10','C','大型','空闲',1,'2025-07-20 07:47:26','2025-07-20 07:47:26','Large',NULL),(37,'D1','D','新能源','空闲',1,'2025-07-20 07:47:26','2025-07-20 07:47:26','Electric',NULL),(38,'D2','D','新能源','空闲',1,'2025-07-20 07:47:26','2025-07-20 07:47:26','Electric',NULL),(39,'D3','D','新能源','空闲',1,'2025-07-20 07:47:26','2025-07-20 07:47:26','Electric',NULL),(40,'D4','D','新能源','空闲',1,'2025-07-20 07:47:26','2025-07-20 07:47:26','Electric',NULL),(41,'D5','D','新能源','空闲',1,'2025-07-20 07:47:26','2025-07-20 07:47:26','Electric',NULL),(42,'D6','D','新能源','空闲',1,'2025-07-20 07:47:26','2025-07-20 07:47:26','Electric',NULL),(43,'D7','D','新能源','空闲',1,'2025-07-20 07:47:26','2025-07-20 07:47:26','Electric',NULL),(44,'D8','D','新能源','空闲',1,'2025-07-20 07:47:26','2025-07-20 07:47:26','Electric',NULL),(45,'D9','D','新能源','空闲',1,'2025-07-20 07:47:26','2025-07-20 07:47:26','Electric',NULL),(46,'D10','D','新能源','空闲',1,'2025-07-20 07:47:26','2025-07-20 07:47:26','Electric',NULL),(47,'F5','A','新能源','空闲',1,'2025-07-23 02:50:23','2025-07-23 02:50:23',NULL,NULL);
/*!40000 ALTER TABLE `parking_spots` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `phone` varchar(11) COLLATE utf8mb4_unicode_ci NOT NULL,
  `password_hash` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(120) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `avatar_url` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL,
  `last_login` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `ix_users_phone` (`phone`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (6,'13697078191','pbkdf2:sha256:600000$XLIGn2TSl58sb5Wi$cb874ab4daa98899ca6c73cb520eaa9a9706e8e0f3f425e1b2394271cff13cb1','谢x','3182000783@qq.com',NULL,'active','2025-07-04 16:52:15','2025-07-23 02:49:16','2025-07-20 14:59:34'),(7,'3303649391','pbkdf2:sha256:600000$TZ7JO28QGjI4hlVr$fd36597671cff656ec9c7772683defe74a447a586459365ed8f3f4a250445b95','3303649391','3303649391@example.com',NULL,'active','2025-07-21 09:54:25','2025-07-21 09:54:25',NULL);
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping routines for database 'parking_automation_system'
--
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-08-08  0:38:22
