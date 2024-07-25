-- MySQL dump 10.13  Distrib 8.0.36, for macos14 (x86_64)
--
-- Host: 127.0.0.1    Database: my_inventory
-- ------------------------------------------------------
-- Server version	8.3.0

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `category`
--

DROP TABLE IF EXISTS `category`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `category` (
  `category_id` int NOT NULL AUTO_INCREMENT,
  `category_name` varchar(45) DEFAULT NULL,
  `category_description` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`category_id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `category`
--

LOCK TABLES `category` WRITE;
/*!40000 ALTER TABLE `category` DISABLE KEYS */;
INSERT INTO `category` VALUES (1,'Outerwear','Anything that is worn over a T-Shirt or Shirt');
/*!40000 ALTER TABLE `category` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `inventory`
--

DROP TABLE IF EXISTS `inventory`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `inventory` (
  `inventory_id` int NOT NULL AUTO_INCREMENT,
  `quantity` int DEFAULT NULL,
  `minimum` int DEFAULT NULL,
  `maximum` int DEFAULT NULL,
  `product_id` int DEFAULT NULL,
  PRIMARY KEY (`inventory_id`),
  KEY `fk_product_id_idx` (`product_id`),
  CONSTRAINT `fk_product_id` FOREIGN KEY (`product_id`) REFERENCES `product` (`product_id`) ON UPDATE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `inventory`
--

LOCK TABLES `inventory` WRITE;
/*!40000 ALTER TABLE `inventory` DISABLE KEYS */;
/*!40000 ALTER TABLE `inventory` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `product`
--

DROP TABLE IF EXISTS `product`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `product` (
  `product_id` int NOT NULL AUTO_INCREMENT,
  `barcode` varchar(45) DEFAULT NULL,
  `product_name` varchar(45) DEFAULT NULL,
  `product_description` varchar(100) DEFAULT NULL,
  `product_category` int DEFAULT NULL,
  `variant_id` int DEFAULT NULL,
  PRIMARY KEY (`product_id`),
  KEY `fk_category_id_idx` (`product_category`),
  KEY `fk_variant_id_idx` (`variant_id`),
  CONSTRAINT `fk_category_id` FOREIGN KEY (`product_category`) REFERENCES `category` (`category_id`),
  CONSTRAINT `fk_variant_id` FOREIGN KEY (`variant_id`) REFERENCES `variant` (`variant_id`) ON UPDATE RESTRICT
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `product`
--

LOCK TABLES `product` WRITE;
/*!40000 ALTER TABLE `product` DISABLE KEYS */;
INSERT INTO `product` VALUES (1,'A07687','Hoodie','Oversized Hoodie, Drop Shoulder',1,1);
/*!40000 ALTER TABLE `product` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user`
--

DROP TABLE IF EXISTS `user`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user` (
  `first_name` varchar(45) DEFAULT NULL,
  `last_name` varchar(45) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `username` varchar(24) NOT NULL,
  `password` varchar(255) DEFAULT NULL,
  `address` varchar(45) DEFAULT NULL,
  `role` varchar(45) DEFAULT NULL,
  PRIMARY KEY (`username`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user`
--

LOCK TABLES `user` WRITE;
/*!40000 ALTER TABLE `user` DISABLE KEYS */;
INSERT INTO `user` VALUES ('Apple','Pie','applepie@gmail.com','applepie','$2b$12$xuf8RRDS64C.57ZS19X1eeMneLRHz23GZxPPUN1y9yhkZuLJtoXvm','34th Street','Boss'),('Ken Jennings',NULL,'kenjennings@gmail.com','goat','$2b$12$k.ULaXsFfli5GUuw30mmaOwQK00HsAeOIH9Kcom9Upl5v9qRYR.TG','222',''),('john',NULL,'john','john','john','22 earl street',''),('Johnny Appleseed',NULL,'johnny@gmail.com','Jonny','$2b$12$Vdrw5gU6ffgHexAp4HNFk.xtmEDtdqLKLxxF338dCviHs24DVzM3G','2222',''),('khoja',NULL,'khoja@gmail.com','khoja','$2b$12$LoZ2N7d/ZmD21kvkQE6hl.Ke6r0lJWjtrrGECo','moon',''),('Meryl','Streep','meryl@gmail.com','meryliscool','$2b$12$EpeiyisiquqVgoLElrqB1uJvanyjfsxjnHLb4dVJfrbdghA7RuzHG','555',''),('ronald',NULL,'ronald','ronald','$2b$12$KI3zIL218k6EjKzNdwXHkum6KBlCXV81mK2Yqn','ronald',''),('sally',NULL,'sally','sally','$2b$12$RyvWA5R6Fb4N1Z9mKNBs/uX/5SfkPqXFgL/VFbnCvz1kbi2x7B6nu','444',''),('samah',NULL,'samah','samah','$2b$12$Pd49GIfMG4DhHPJiA512Se1aglYxy28TkhfqvUic1kE0k5paI9xoW','samah',''),('samah',NULL,'samah@gmail.com','samahrocks','$2b$12$l//A6qn2zNrSCxs8X3rX9ugssnt/xI3ePDVgqH','moon',''),('Samah','Khoja','skhoja303@gmail.com','skhoja303','$2b$12$Plzr8WIhDlD3eQIFNHEjBOQlJ9UWFvUV17EaTw00gJzA1Ys22DdV6','Home','22'),('Suraiya','Khoja','khoja.suraiya1@gmail.com','suraiyakhoja','$2b$12$hTlXa0w1sFOMalZHxJmNVe3QtaBATXY.JtjS2wzzwuvsbJ9Uj5Z6W','Hunter','Student');
/*!40000 ALTER TABLE `user` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `username` varchar(50) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'samah','samah@gmail.com','samah'),(2,'khoja','khoja@gmail.com','khoja'),(3,'twilight','twilight@gmail.com','$2b$12$X1CP58stXZsz/uCfKP08Rulelg4OWnDYW3P4Htd9KFH.Mx0Hlsvju');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `variant`
--

DROP TABLE IF EXISTS `variant`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `variant` (
  `variant_id` int NOT NULL AUTO_INCREMENT,
  `variant_name` varchar(45) DEFAULT NULL,
  `variant_value` varchar(45) DEFAULT NULL,
  PRIMARY KEY (`variant_id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `variant`
--

LOCK TABLES `variant` WRITE;
/*!40000 ALTER TABLE `variant` DISABLE KEYS */;
INSERT INTO `variant` VALUES (1,'color','blue');
/*!40000 ALTER TABLE `variant` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2024-02-28 22:07:47