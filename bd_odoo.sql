-- --------------------------------------------------------
-- Hôte:                         127.0.0.1
-- Version du serveur:           8.0.30 - MySQL Community Server - GPL
-- SE du serveur:                Win64
-- HeidiSQL Version:             12.1.0.6537
-- --------------------------------------------------------

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET NAMES utf8 */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;


-- Listage de la structure de la base pour bd_odoo
CREATE DATABASE IF NOT EXISTS `bd_odoo` /*!40100 DEFAULT CHARACTER SET armscii8 COLLATE armscii8_bin */ /*!80016 DEFAULT ENCRYPTION='N' */;
USE `bd_odoo`;

-- Listage de la structure de table bd_odoo. audit_logs
CREATE TABLE IF NOT EXISTS `audit_logs` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `user_id` bigint unsigned DEFAULT NULL,
  `societe_id` bigint unsigned DEFAULT NULL,
  `action` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `entity_type` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `entity_id` bigint unsigned DEFAULT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `old_values` json DEFAULT NULL,
  `new_values` json DEFAULT NULL,
  `ip_address` varchar(45) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `user_agent` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `audit_logs_entity_type_entity_id_index` (`entity_type`,`entity_id`),
  KEY `audit_logs_action_index` (`action`),
  KEY `audit_logs_user_id_index` (`user_id`),
  KEY `audit_logs_societe_id_index` (`societe_id`),
  CONSTRAINT `audit_logs_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `utilisateurs` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=126 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Listage des données de la table bd_odoo.audit_logs : ~87 rows (environ)
INSERT INTO `audit_logs` (`id`, `user_id`, `societe_id`, `action`, `entity_type`, `entity_id`, `description`, `old_values`, `new_values`, `ip_address`, `user_agent`, `created_at`, `updated_at`) VALUES
	(1, 1, 1, 'logout', 'Utilisateur', 1, 'Déconnexion de pierre@gmail.com', NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:151.0) Gecko/20100101 Firefox/151.0', '2026-07-12 07:30:06', '2026-07-12 07:30:06'),
	(2, NULL, NULL, 'login', 'Utilisateur', 1, 'Connexion de pierre@gmail.com', NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:151.0) Gecko/20100101 Firefox/151.0', '2026-07-12 07:30:20', '2026-07-12 07:30:20'),
	(3, 1, 1, 'logout', 'Utilisateur', 1, 'Déconnexion de pierre@gmail.com', NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:151.0) Gecko/20100101 Firefox/151.0', '2026-07-12 07:31:07', '2026-07-12 07:31:07'),
	(4, NULL, NULL, 'login', 'Utilisateur', 1, 'Connexion de pierre@gmail.com', NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:151.0) Gecko/20100101 Firefox/151.0', '2026-07-12 07:31:14', '2026-07-12 07:31:14'),
	(5, 1, 1, 'test', 'Test', 1, 'Test audit logging', NULL, NULL, '127.0.0.1', 'CLI', '2026-07-12 07:32:31', '2026-07-12 07:32:31'),
	(6, NULL, NULL, 'login', 'Utilisateur', 1, 'Connexion de pierre@gmail.com', NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36', '2026-07-12 07:32:35', '2026-07-12 07:32:35'),
	(7, 1, 1, 'logout', 'Utilisateur', 1, 'Déconnexion de pierre@gmail.com', NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:151.0) Gecko/20100101 Firefox/151.0', '2026-07-12 07:34:36', '2026-07-12 07:34:36'),
	(8, NULL, NULL, 'login', 'Utilisateur', 1, 'Connexion de pierre@gmail.com', NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:151.0) Gecko/20100101 Firefox/151.0', '2026-07-12 07:34:41', '2026-07-12 07:34:41'),
	(9, 1, 1, 'logout', 'Utilisateur', 1, 'Déconnexion de pierre@gmail.com', NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36', '2026-07-12 07:34:59', '2026-07-12 07:34:59'),
	(10, NULL, NULL, 'login', 'Utilisateur', 1, 'Connexion de pierre@gmail.com', NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36', '2026-07-12 07:35:02', '2026-07-12 07:35:02'),
	(11, 1, 1, 'logout', 'Utilisateur', 1, 'Déconnexion de pierre@gmail.com', NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36', '2026-07-12 07:41:45', '2026-07-12 07:41:45'),
	(12, NULL, NULL, 'login', 'Utilisateur', 1, 'Connexion de pierre@gmail.com', NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36', '2026-07-12 07:41:48', '2026-07-12 07:41:48'),
	(13, 1, 1, 'update', 'Categorie', 1, 'Modification catégorie Électronique', NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36', '2026-07-12 07:44:05', '2026-07-12 07:44:05'),
	(14, 1, 1, 'logout', 'Utilisateur', 1, 'Déconnexion de pierre@gmail.com', NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36', '2026-07-13 08:37:37', '2026-07-13 08:37:37'),
	(15, NULL, NULL, 'login', 'Utilisateur', 1, 'Connexion de pierre@gmail.com', NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36', '2026-07-13 08:37:41', '2026-07-13 08:37:41'),
	(16, 1, 1, 'logout', 'Utilisateur', 1, 'Déconnexion de pierre@gmail.com', NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36', '2026-07-13 09:01:09', '2026-07-13 09:01:09'),
	(17, NULL, NULL, 'login', 'Utilisateur', 1, 'Connexion de pierre@gmail.com', NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36', '2026-07-13 09:01:19', '2026-07-13 09:01:19'),
	(18, 1, 1, 'logout', 'Utilisateur', 1, 'Déconnexion de pierre@gmail.com', NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36', '2026-07-13 10:52:55', '2026-07-13 10:52:55'),
	(19, NULL, NULL, 'login', 'Utilisateur', 1, 'Connexion de pierre@gmail.com', NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36', '2026-07-13 10:53:04', '2026-07-13 10:53:04'),
	(20, NULL, NULL, 'login', 'Utilisateur', 1, 'Connexion de pierre@gmail.com', NULL, NULL, '192.168.20.59', 'Dart/3.9 (dart:io)', '2026-07-13 11:29:22', '2026-07-13 11:29:22'),
	(21, NULL, NULL, 'login', 'Utilisateur', 1, 'Connexion de pierre@gmail.com', NULL, NULL, '192.168.20.59', 'Dart/3.9 (dart:io)', '2026-07-13 11:33:35', '2026-07-13 11:33:35'),
	(22, NULL, NULL, 'login', 'Utilisateur', 1, 'Connexion de pierre@gmail.com', NULL, NULL, '192.168.20.59', 'Dart/3.9 (dart:io)', '2026-07-13 11:36:23', '2026-07-13 11:36:23'),
	(23, NULL, NULL, 'login', 'Utilisateur', 1, 'Connexion de pierre@gmail.com', NULL, NULL, '192.168.20.59', 'Dart/3.9 (dart:io)', '2026-07-13 11:42:29', '2026-07-13 11:42:29'),
	(24, NULL, NULL, 'login', 'Utilisateur', 1, 'Connexion de pierre@gmail.com', NULL, NULL, '192.168.20.59', 'Dart/3.9 (dart:io)', '2026-07-13 11:44:51', '2026-07-13 11:44:51'),
	(25, NULL, NULL, 'login', 'Utilisateur', 1, 'Connexion de pierre@gmail.com', NULL, NULL, '192.168.20.59', 'Dart/3.9 (dart:io)', '2026-07-13 11:45:19', '2026-07-13 11:45:19'),
	(26, NULL, NULL, 'login', 'Utilisateur', 1, 'Connexion de pierre@gmail.com', NULL, NULL, '192.168.20.59', 'Dart/3.9 (dart:io)', '2026-07-13 11:47:43', '2026-07-13 11:47:43'),
	(27, NULL, NULL, 'login', 'Utilisateur', 1, 'Connexion de pierre@gmail.com', NULL, NULL, '192.168.20.59', 'Dart/3.9 (dart:io)', '2026-07-13 11:49:37', '2026-07-13 11:49:37'),
	(28, NULL, NULL, 'login', 'Utilisateur', 1, 'Connexion de pierre@gmail.com', NULL, NULL, '192.168.20.59', 'Dart/3.9 (dart:io)', '2026-07-13 11:54:00', '2026-07-13 11:54:00'),
	(29, NULL, NULL, 'login', 'Utilisateur', 1, 'Connexion de pierre@gmail.com', NULL, NULL, '192.168.20.59', 'Dart/3.9 (dart:io)', '2026-07-13 11:56:14', '2026-07-13 11:56:14'),
	(30, NULL, NULL, 'login', 'Utilisateur', 1, 'Connexion de pierre@gmail.com', NULL, NULL, '192.168.20.61', 'Dart/3.9 (dart:io)', '2026-07-13 11:59:18', '2026-07-13 11:59:18'),
	(31, NULL, NULL, 'login', 'Utilisateur', 1, 'Connexion de pierre@gmail.com', NULL, NULL, '192.168.20.59', 'Dart/3.9 (dart:io)', '2026-07-13 12:01:57', '2026-07-13 12:01:57'),
	(32, NULL, NULL, 'login', 'Utilisateur', 1, 'Connexion de pierre@gmail.com', NULL, NULL, '192.168.20.59', 'Dart/3.9 (dart:io)', '2026-07-13 12:10:01', '2026-07-13 12:10:01'),
	(33, NULL, NULL, 'login', 'Utilisateur', 1, 'Connexion de pierre@gmail.com', NULL, NULL, '192.168.20.59', 'Dart/3.9 (dart:io)', '2026-07-13 12:12:04', '2026-07-13 12:12:04'),
	(34, NULL, NULL, 'login', 'Utilisateur', 1, 'Connexion de pierre@gmail.com', NULL, NULL, '192.168.20.59', 'Dart/3.9 (dart:io)', '2026-07-13 12:14:50', '2026-07-13 12:14:50'),
	(35, NULL, NULL, 'login', 'Utilisateur', 1, 'Connexion de pierre@gmail.com', NULL, NULL, '192.168.20.59', 'Dart/3.9 (dart:io)', '2026-07-13 12:24:01', '2026-07-13 12:24:01'),
	(36, 1, 1, 'logout', 'Utilisateur', 1, 'Déconnexion de pierre@gmail.com', NULL, NULL, '192.168.20.59', 'Dart/3.9 (dart:io)', '2026-07-13 12:28:51', '2026-07-13 12:28:51'),
	(37, NULL, NULL, 'login', 'Utilisateur', 1, 'Connexion de pierre@gmail.com', NULL, NULL, '192.168.20.59', 'Dart/3.9 (dart:io)', '2026-07-13 12:29:02', '2026-07-13 12:29:02'),
	(38, NULL, NULL, 'login', 'Utilisateur', 1, 'Connexion de pierre@gmail.com', NULL, NULL, '192.168.20.59', 'Dart/3.9 (dart:io)', '2026-07-13 12:39:06', '2026-07-13 12:39:06'),
	(39, NULL, NULL, 'login', 'Utilisateur', 1, 'Connexion de pierre@gmail.com', NULL, NULL, '192.168.20.59', 'Dart/3.9 (dart:io)', '2026-07-13 12:39:16', '2026-07-13 12:39:16'),
	(40, NULL, NULL, 'login', 'Utilisateur', 1, 'Connexion de pierre@gmail.com', NULL, NULL, '192.168.20.59', 'Dart/3.9 (dart:io)', '2026-07-13 12:39:57', '2026-07-13 12:39:57'),
	(41, NULL, NULL, 'login', 'Utilisateur', 1, 'Connexion de pierre@gmail.com', NULL, NULL, '192.168.20.59', 'Dart/3.9 (dart:io)', '2026-07-13 12:40:07', '2026-07-13 12:40:07'),
	(42, NULL, NULL, 'login', 'Utilisateur', 1, 'Connexion de pierre@gmail.com', NULL, NULL, '192.168.20.59', 'Dart/3.9 (dart:io)', '2026-07-13 12:40:11', '2026-07-13 12:40:11'),
	(43, NULL, NULL, 'login', 'Utilisateur', 1, 'Connexion de pierre@gmail.com', NULL, NULL, '192.168.20.59', 'Dart/3.9 (dart:io)', '2026-07-13 12:42:45', '2026-07-13 12:42:45'),
	(44, NULL, NULL, 'login', 'Utilisateur', 1, 'Connexion de pierre@gmail.com', NULL, NULL, '192.168.20.59', 'Dart/3.9 (dart:io)', '2026-07-13 12:43:49', '2026-07-13 12:43:49'),
	(45, NULL, NULL, 'login', 'Utilisateur', 1, 'Connexion de pierre@gmail.com', NULL, NULL, '192.168.20.59', 'Dart/3.9 (dart:io)', '2026-07-13 12:44:00', '2026-07-13 12:44:00'),
	(46, NULL, NULL, 'login', 'Utilisateur', 1, 'Connexion de pierre@gmail.com', NULL, NULL, '192.168.20.59', 'Dart/3.9 (dart:io)', '2026-07-13 12:46:17', '2026-07-13 12:46:17'),
	(47, 1, 1, 'logout', 'Utilisateur', 1, 'Déconnexion de pierre@gmail.com', NULL, NULL, '192.168.20.61', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36', '2026-07-13 13:33:26', '2026-07-13 13:33:26'),
	(48, NULL, NULL, 'login', 'Utilisateur', 1, 'Connexion de pierre@gmail.com', NULL, NULL, '192.168.20.61', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36', '2026-07-13 13:33:47', '2026-07-13 13:33:47'),
	(49, 1, 1, 'create', 'Partenaire', 6, 'Création partenaire Maweja', NULL, NULL, '192.168.20.59', 'Dart/3.9 (dart:io)', '2026-07-13 13:35:06', '2026-07-13 13:35:06'),
	(50, 1, 1, 'changer_etat', 'Facture', 1, 'Changement statut INV-2026-00001: → annulee', NULL, NULL, '192.168.20.59', 'Dart/3.9 (dart:io)', '2026-07-13 14:03:33', '2026-07-13 14:03:33'),
	(51, 1, 1, 'update', 'Lot', 1, 'Modification lot LOT-2026-002 (LOT-Ecran)', NULL, NULL, '192.168.20.59', 'Dart/3.9 (dart:io)', '2026-07-13 14:32:05', '2026-07-13 14:32:05'),
	(52, NULL, NULL, 'login', 'Utilisateur', 1, 'Connexion de pierre@gmail.com', NULL, NULL, '192.168.20.59', 'Dart/3.9 (dart:io)', '2026-07-14 08:39:45', '2026-07-14 08:39:45'),
	(53, 1, 1, 'logout', 'Utilisateur', 1, 'Déconnexion de pierre@gmail.com', NULL, NULL, '192.168.20.59', 'Dart/3.9 (dart:io)', '2026-07-14 09:08:30', '2026-07-14 09:08:30'),
	(54, NULL, NULL, 'login', 'Utilisateur', 1, 'Connexion de pierre@gmail.com', NULL, NULL, '192.168.20.59', 'Dart/3.9 (dart:io)', '2026-07-14 09:08:41', '2026-07-14 09:08:41'),
	(55, 1, 1, 'create', 'CommandeVente', 2, 'Création commande vente SO-2026-00002', NULL, NULL, '192.168.20.59', 'Dart/3.9 (dart:io)', '2026-07-14 09:12:16', '2026-07-14 09:12:16'),
	(56, 1, 1, 'changer_etat', 'CommandeVente', 2, 'Changement état commande vente SO-2026-00002: brouillon → confirme', NULL, NULL, '192.168.20.59', 'Dart/3.9 (dart:io)', '2026-07-14 09:26:14', '2026-07-14 09:26:14'),
	(57, 1, 1, 'changer_etat', 'CommandeVente', 2, 'Changement état commande vente SO-2026-00002: confirme → en_cours', NULL, NULL, '192.168.20.59', 'Dart/3.9 (dart:io)', '2026-07-14 09:27:03', '2026-07-14 09:27:03'),
	(58, 1, 1, 'changer_etat', 'CommandeVente', 2, 'Changement état commande vente SO-2026-00002: en_cours → termine', NULL, NULL, '192.168.20.59', 'Dart/3.9 (dart:io)', '2026-07-14 09:27:10', '2026-07-14 09:27:10'),
	(59, 1, 1, 'create', 'Facture', 2, 'Création facture_client INV-2026-00002', NULL, NULL, '192.168.20.59', 'Dart/3.9 (dart:io)', '2026-07-14 09:27:20', '2026-07-14 09:27:20'),
	(60, 1, 1, 'payer', 'Facture', 2, 'Paiement partiel de 1410€ sur INV-2026-00002', NULL, NULL, '192.168.20.59', 'Dart/3.9 (dart:io)', '2026-07-14 09:27:21', '2026-07-14 09:27:21'),
	(61, 1, 1, 'payer', 'Facture', 2, 'Paiement partiel de 282€ sur INV-2026-00002', NULL, NULL, '192.168.20.59', 'Dart/3.9 (dart:io)', '2026-07-14 09:27:54', '2026-07-14 09:27:54'),
	(62, 1, 1, 'create', 'CommandeVente', 3, 'Création commande vente SO-2026-00003', NULL, NULL, '192.168.20.59', 'Dart/3.9 (dart:io)', '2026-07-14 09:35:11', '2026-07-14 09:35:11'),
	(63, 1, 1, 'changer_etat', 'CommandeVente', 3, 'Changement état commande vente SO-2026-00003: brouillon → confirme', NULL, NULL, '192.168.20.59', 'Dart/3.9 (dart:io)', '2026-07-14 09:36:08', '2026-07-14 09:36:08'),
	(64, 1, 1, 'changer_etat', 'CommandeVente', 3, 'Changement état commande vente SO-2026-00003: confirme → en_cours', NULL, NULL, '192.168.20.59', 'Dart/3.9 (dart:io)', '2026-07-14 09:36:15', '2026-07-14 09:36:15'),
	(65, 1, 1, 'changer_etat', 'CommandeVente', 3, 'Changement état commande vente SO-2026-00003: en_cours → termine', NULL, NULL, '192.168.20.59', 'Dart/3.9 (dart:io)', '2026-07-14 09:36:19', '2026-07-14 09:36:19'),
	(66, 1, 1, 'create', 'Facture', 3, 'Création facture_client INV-2026-00003', NULL, NULL, '192.168.20.59', 'Dart/3.9 (dart:io)', '2026-07-14 09:36:23', '2026-07-14 09:36:23'),
	(67, 1, 1, 'payer', 'Facture', 3, 'Paiement partiel de 1590€ sur INV-2026-00003', NULL, NULL, '192.168.20.59', 'Dart/3.9 (dart:io)', '2026-07-14 09:36:24', '2026-07-14 09:36:24'),
	(68, 1, 1, 'create', 'Produit', 3, 'Création du produit vidéo projecteur', NULL, NULL, '192.168.20.59', 'Dart/3.9 (dart:io)', '2026-07-14 09:39:05', '2026-07-14 09:39:05'),
	(69, 1, 1, 'create', 'CommandeAchat', 2, 'Création commande achat PO-2026-00002', NULL, NULL, '192.168.20.59', 'Dart/3.9 (dart:io)', '2026-07-14 09:40:07', '2026-07-14 09:40:07'),
	(70, 1, 1, 'changer_etat', 'CommandeAchat', 2, 'Changement état commande achat PO-2026-00002: brouillon → confirme', NULL, NULL, '192.168.20.59', 'Dart/3.9 (dart:io)', '2026-07-14 09:40:20', '2026-07-14 09:40:20'),
	(71, 1, 1, 'changer_etat', 'CommandeAchat', 2, 'Changement état commande achat PO-2026-00002: confirme → envoye', NULL, NULL, '192.168.20.59', 'Dart/3.9 (dart:io)', '2026-07-14 09:45:14', '2026-07-14 09:45:14'),
	(72, 1, 1, 'changer_etat', 'CommandeAchat', 2, 'Changement état commande achat PO-2026-00002: envoye → recu', NULL, NULL, '192.168.20.59', 'Dart/3.9 (dart:io)', '2026-07-14 09:45:17', '2026-07-14 09:45:17'),
	(73, 1, 1, 'changer_etat', 'CommandeAchat', 1, 'Changement état commande achat PO-2026-00001: recu → termine', NULL, NULL, '192.168.20.59', 'Dart/3.9 (dart:io)', '2026-07-14 09:48:09', '2026-07-14 09:48:09'),
	(74, 1, 1, 'payer', 'Facture', 3, 'Paiement partiel de 318€ sur INV-2026-00003', NULL, NULL, '192.168.20.59', 'Dart/3.9 (dart:io)', '2026-07-14 09:51:15', '2026-07-14 09:51:15'),
	(75, NULL, NULL, 'login', 'Utilisateur', 1, 'Connexion de pierre@gmail.com', NULL, NULL, '192.168.20.59', 'Dart/3.9 (dart:io)', '2026-07-14 10:32:24', '2026-07-14 10:32:24'),
	(76, NULL, NULL, 'login', 'Utilisateur', 1, 'Connexion de pierre@gmail.com', NULL, NULL, '192.168.20.59', 'Dart/3.9 (dart:io)', '2026-07-14 10:43:02', '2026-07-14 10:43:02'),
	(77, 1, 1, 'changer_etat', 'CommandeAchat', 2, 'Changement état commande achat PO-2026-00002: recu → termine', NULL, NULL, '192.168.20.59', 'Dart/3.9 (dart:io)', '2026-07-14 10:56:26', '2026-07-14 10:56:26'),
	(78, NULL, NULL, 'login', 'Utilisateur', 1, 'Connexion de pierre@gmail.com', NULL, NULL, '192.168.20.59', 'Dart/3.9 (dart:io)', '2026-07-15 07:16:26', '2026-07-15 07:16:26'),
	(79, 1, 1, 'logout', 'Utilisateur', 1, 'Déconnexion de pierre@gmail.com', NULL, NULL, '192.168.20.59', 'Dart/3.9 (dart:io)', '2026-07-15 09:56:33', '2026-07-15 09:56:33'),
	(80, NULL, NULL, 'login', 'Utilisateur', 1, 'Connexion de pierre@gmail.com', NULL, NULL, '192.168.20.59', 'Dart/3.9 (dart:io)', '2026-07-15 09:56:58', '2026-07-15 09:56:58'),
	(81, 1, 1, 'logout', 'Utilisateur', 1, 'Déconnexion de pierre@gmail.com', NULL, NULL, '192.168.20.59', 'Dart/3.9 (dart:io)', '2026-07-15 10:40:47', '2026-07-15 10:40:47'),
	(82, NULL, NULL, 'login', 'Utilisateur', 1, 'Connexion de pierre@gmail.com', NULL, NULL, '192.168.20.59', 'Dart/3.9 (dart:io)', '2026-07-15 10:41:45', '2026-07-15 10:41:45'),
	(83, 1, 1, 'logout', 'Utilisateur', 1, 'Déconnexion de pierre@gmail.com', NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36', '2026-07-15 11:06:42', '2026-07-15 11:06:42'),
	(84, NULL, NULL, 'login', 'Utilisateur', 1, 'Connexion de pierre@gmail.com', NULL, NULL, '192.168.20.61', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36', '2026-07-15 11:11:11', '2026-07-15 11:11:11'),
	(85, NULL, NULL, 'login', 'Utilisateur', 1, 'Connexion de pierre@gmail.com', NULL, NULL, '192.168.20.61', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:153.0) Gecko/20100101 Firefox/153.0', '2026-07-15 11:13:10', '2026-07-15 11:13:10'),
	(86, 1, 1, 'logout', 'Utilisateur', 1, 'Déconnexion de pierre@gmail.com', NULL, NULL, '192.168.20.61', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36', '2026-07-15 12:50:36', '2026-07-15 12:50:36'),
	(87, NULL, NULL, 'login', 'Utilisateur', 1, 'Connexion de pierre@gmail.com', NULL, NULL, '192.168.20.61', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36', '2026-07-15 12:50:40', '2026-07-15 12:50:40'),
	(88, 1, 1, 'logout', 'Utilisateur', 1, 'Déconnexion de pierre@gmail.com', NULL, NULL, '192.168.20.61', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36', '2026-07-15 12:52:19', '2026-07-15 12:52:19'),
	(89, NULL, NULL, 'login', 'Utilisateur', 1, 'Connexion de pierre@gmail.com', NULL, NULL, '192.168.20.61', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36', '2026-07-15 12:52:26', '2026-07-15 12:52:26'),
	(90, NULL, NULL, 'login', 'Utilisateur', 1, 'Connexion de pierre@gmail.com', NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36', '2026-07-17 11:24:48', '2026-07-17 11:24:48'),
	(91, NULL, NULL, 'login', 'Utilisateur', 1, 'Connexion de pierre@gmail.com', NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:156.0) Gecko/20100101 Firefox/156.0', '2026-09-16 16:36:17', '2026-09-16 16:36:17'),
	(92, NULL, NULL, 'login', 'Utilisateur', 1, 'Connexion de pierre@gmail.com', NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36', '2026-09-16 17:16:48', '2026-09-16 17:16:48'),
	(93, 1, 1, 'update', 'Partenaire', 1, 'Modification partenaire Jean Dupont', NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36', '2026-09-16 17:27:33', '2026-09-16 17:27:33'),
	(94, NULL, NULL, 'login', 'Utilisateur', 6, 'Connexion de boutique.test@example.com', NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT; Windows NT 10.0; fr-FR) WindowsPowerShell/5.1.26100.9444', '2026-09-16 18:45:23', '2026-09-16 18:45:23'),
	(95, NULL, NULL, 'login', 'Utilisateur', 7, 'Connexion de admin2@example.com', NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT; Windows NT 10.0; fr-FR) WindowsPowerShell/5.1.26100.9444', '2026-09-16 18:54:03', '2026-09-16 18:54:03'),
	(96, 1, 1, 'create', 'CommandeVente', 4, 'Création commande vente SO-2026-00004', NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36', '2026-09-16 18:58:45', '2026-09-16 18:58:45'),
	(97, 1, 1, 'changer_etat', 'CommandeVente', 4, 'Changement état commande vente SO-2026-00004: brouillon → confirme', NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36', '2026-09-16 18:59:03', '2026-09-16 18:59:03'),
	(98, 1, 1, 'changer_etat', 'CommandeVente', 4, 'Changement état commande vente SO-2026-00004: confirme → en_cours', NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36', '2026-09-16 18:59:12', '2026-09-16 18:59:12'),
	(99, 1, 1, 'changer_etat', 'CommandeVente', 4, 'Changement état commande vente SO-2026-00004: en_cours → termine', NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36', '2026-09-16 18:59:23', '2026-09-16 18:59:23'),
	(100, 1, 1, 'vente_comptoir', 'CommandeVente', 5, 'Vente comptoir SO-2026-00005', NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT; Windows NT 10.0; fr-FR) WindowsPowerShell/5.1.26100.9444', '2026-09-16 19:05:36', '2026-09-16 19:05:36'),
	(101, 1, 1, 'logout', 'Utilisateur', 1, 'Déconnexion de pierre@gmail.com', NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:156.0) Gecko/20100101 Firefox/156.0', '2026-09-16 19:06:42', '2026-09-16 19:06:42'),
	(102, NULL, NULL, 'login', 'Utilisateur', 9, 'Connexion de kanza@gmail.com', NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:156.0) Gecko/20100101 Firefox/156.0', '2026-09-16 19:07:07', '2026-09-16 19:07:07'),
	(103, 9, 4, 'logout', 'Utilisateur', 9, 'Déconnexion de kanza@gmail.com', NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:156.0) Gecko/20100101 Firefox/156.0', '2026-09-16 19:11:28', '2026-09-16 19:11:28'),
	(104, NULL, NULL, 'login', 'Utilisateur', 1, 'Connexion de pierre@gmail.com', NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:156.0) Gecko/20100101 Firefox/156.0', '2026-09-16 19:11:35', '2026-09-16 19:11:35'),
	(105, NULL, NULL, 'login', 'Utilisateur', 10, 'Connexion de admin3@example.com', NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT; Windows NT 10.0; fr-FR) WindowsPowerShell/5.1.26100.9444', '2026-09-16 19:11:46', '2026-09-16 19:11:46'),
	(106, 1, 1, 'logout', 'Utilisateur', 1, 'Déconnexion de pierre@gmail.com', NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:156.0) Gecko/20100101 Firefox/156.0', '2026-09-16 19:14:02', '2026-09-16 19:14:02'),
	(107, NULL, NULL, 'login', 'Utilisateur', 1, 'Connexion de pierre@gmail.com', NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:156.0) Gecko/20100101 Firefox/156.0', '2026-09-16 19:14:08', '2026-09-16 19:14:08'),
	(108, NULL, NULL, 'login', 'Utilisateur', 11, 'Connexion de plateforme@gs-stock.com', NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT; Windows NT 10.0; fr-FR) WindowsPowerShell/5.1.26100.9444', '2026-09-16 19:15:59', '2026-09-16 19:15:59'),
	(109, 1, 1, 'logout', 'Utilisateur', 1, 'Déconnexion de pierre@gmail.com', NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36', '2026-09-16 19:16:58', '2026-09-16 19:16:58'),
	(110, NULL, NULL, 'login', 'Utilisateur', 1, 'Connexion de pierre@gmail.com', NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36', '2026-09-16 19:17:02', '2026-09-16 19:17:02'),
	(111, 1, 1, 'logout', 'Utilisateur', 1, 'Déconnexion de pierre@gmail.com', NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:156.0) Gecko/20100101 Firefox/156.0', '2026-09-16 19:17:27', '2026-09-16 19:17:27'),
	(112, 1, 1, 'logout', 'Utilisateur', 1, 'Déconnexion de pierre@gmail.com', NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36', '2026-09-16 19:18:07', '2026-09-16 19:18:07'),
	(113, NULL, NULL, 'login', 'Utilisateur', 11, 'Connexion de plateforme@gs-stock.com', NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36', '2026-09-16 19:18:54', '2026-09-16 19:18:54'),
	(114, 1, 1, 'update_profil', 'Utilisateur', 1, 'Mise à jour de son profil', NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT; Windows NT 10.0; fr-FR) WindowsPowerShell/5.1.26100.9444', '2026-09-16 19:22:07', '2026-09-16 19:22:07'),
	(115, 11, NULL, 'update_password', 'Utilisateur', 11, 'Changement de mot de passe', NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36', '2026-09-16 19:28:48', '2026-09-16 19:28:48'),
	(116, 11, NULL, 'logout', 'Utilisateur', 11, 'Déconnexion de plateforme@gs-stock.com', NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36', '2026-09-16 19:29:02', '2026-09-16 19:29:02'),
	(117, NULL, NULL, 'login', 'Utilisateur', 1, 'Connexion de pierre@gmail.com', NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36', '2026-09-16 19:29:05', '2026-09-16 19:29:05'),
	(118, 1, 1, 'logout', 'Utilisateur', 1, 'Déconnexion de pierre@gmail.com', NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36', '2026-09-16 19:31:41', '2026-09-16 19:31:41'),
	(119, NULL, NULL, 'login', 'Utilisateur', 1, 'Connexion de pierre@gmail.com', NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36', '2026-09-16 19:32:52', '2026-09-16 19:32:52'),
	(120, 1, 1, 'logout', 'Utilisateur', 1, 'Déconnexion de pierre@gmail.com', NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36', '2026-09-16 19:33:11', '2026-09-16 19:33:11'),
	(121, NULL, NULL, 'login', 'Utilisateur', 9, 'Connexion de kanza@gmail.com', NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36', '2026-09-16 19:33:39', '2026-09-16 19:33:39'),
	(122, 9, 4, 'logout', 'Utilisateur', 9, 'Déconnexion de kanza@gmail.com', NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36', '2026-09-16 19:44:07', '2026-09-16 19:44:07'),
	(123, NULL, 1, 'login', 'Utilisateur', 1, 'Connexion de pierre@gmail.com', NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36', '2026-09-16 19:44:10', '2026-09-16 19:44:10'),
	(124, 1, 1, 'vente_comptoir', 'CommandeVente', 6, 'Vente comptoir SO-2026-00005', NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36', '2026-09-16 19:55:20', '2026-09-16 19:55:20'),
	(125, 1, 1, 'vente_comptoir', 'CommandeVente', 7, 'Vente comptoir SO-2026-00006', NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/153.0.0.0 Safari/537.36 Edg/153.0.0.0', '2026-09-16 19:59:12', '2026-09-16 19:59:12');

-- Listage de la structure de table bd_odoo. categorie_produit
CREATE TABLE IF NOT EXISTS `categorie_produit` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `nom` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `parent_id` bigint unsigned DEFAULT NULL,
  `actif` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `societe_id` bigint unsigned DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `categorie_produit_nom_unique` (`nom`),
  KEY `categorie_produit_parent_id_foreign` (`parent_id`),
  KEY `categorie_produit_societe_id_index` (`societe_id`),
  CONSTRAINT `categorie_produit_parent_id_foreign` FOREIGN KEY (`parent_id`) REFERENCES `categorie_produit` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Listage des données de la table bd_odoo.categorie_produit : ~4 rows (environ)
INSERT INTO `categorie_produit` (`id`, `nom`, `description`, `parent_id`, `actif`, `created_at`, `updated_at`, `societe_id`) VALUES
	(1, 'Électronique', 'Produits électroniques', NULL, 1, '2026-07-12 06:19:06', '2026-07-12 07:44:05', 1),
	(2, 'Informatique', 'Matériel informatique', 1, 1, '2026-07-12 06:19:06', '2026-07-12 06:19:06', 1),
	(3, 'Bureau', 'Fournitures de bureau', NULL, 1, '2026-07-12 06:19:06', '2026-07-12 06:19:06', 1),
	(4, 'Alimentaire', 'Produits alimentaires', NULL, 1, '2026-07-12 06:19:06', '2026-07-12 06:19:06', 1);

-- Listage de la structure de table bd_odoo. commande_achat
CREATE TABLE IF NOT EXISTS `commande_achat` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `reference` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `partenaire_id` bigint unsigned NOT NULL,
  `date_commande` date NOT NULL,
  `date_livraison_prevue` date DEFAULT NULL,
  `date_livraison_reelle` date DEFAULT NULL,
  `etat` enum('brouillon','confirme','envoye','recu','termine','annule') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'brouillon',
  `montant_total_ht` decimal(16,2) NOT NULL DEFAULT '0.00',
  `montant_total_ttc` decimal(16,2) NOT NULL DEFAULT '0.00',
  `montant_remise` decimal(16,2) NOT NULL DEFAULT '0.00',
  `taux_remise` decimal(5,2) NOT NULL DEFAULT '0.00',
  `frais_livraison` decimal(16,2) NOT NULL DEFAULT '0.00',
  `notes` text COLLATE utf8mb4_unicode_ci,
  `adresse_livraison` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `adresse_facturation` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `mode_paiement` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `reference_commande_fournisseur` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `cree_par_utilisateur_id` bigint unsigned DEFAULT NULL,
  `modifie_par_utilisateur_id` bigint unsigned DEFAULT NULL,
  `actif` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `societe_id` bigint unsigned DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `commande_achat_reference_unique` (`reference`),
  KEY `commande_achat_cree_par_utilisateur_id_foreign` (`cree_par_utilisateur_id`),
  KEY `commande_achat_modifie_par_utilisateur_id_foreign` (`modifie_par_utilisateur_id`),
  KEY `commande_achat_reference_index` (`reference`),
  KEY `commande_achat_date_commande_index` (`date_commande`),
  KEY `commande_achat_etat_index` (`etat`),
  KEY `commande_achat_partenaire_id_etat_index` (`partenaire_id`,`etat`),
  KEY `commande_achat_societe_id_index` (`societe_id`),
  CONSTRAINT `commande_achat_cree_par_utilisateur_id_foreign` FOREIGN KEY (`cree_par_utilisateur_id`) REFERENCES `utilisateurs` (`id`) ON DELETE SET NULL,
  CONSTRAINT `commande_achat_modifie_par_utilisateur_id_foreign` FOREIGN KEY (`modifie_par_utilisateur_id`) REFERENCES `utilisateurs` (`id`) ON DELETE SET NULL,
  CONSTRAINT `commande_achat_partenaire_id_foreign` FOREIGN KEY (`partenaire_id`) REFERENCES `partenaire` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Listage des données de la table bd_odoo.commande_achat : ~2 rows (environ)
INSERT INTO `commande_achat` (`id`, `reference`, `partenaire_id`, `date_commande`, `date_livraison_prevue`, `date_livraison_reelle`, `etat`, `montant_total_ht`, `montant_total_ttc`, `montant_remise`, `taux_remise`, `frais_livraison`, `notes`, `adresse_livraison`, `adresse_facturation`, `mode_paiement`, `reference_commande_fournisseur`, `cree_par_utilisateur_id`, `modifie_par_utilisateur_id`, `actif`, `created_at`, `updated_at`, `societe_id`) VALUES
	(1, 'PO-2026-00001', 4, '2026-07-12', '2026-07-12', '2026-07-14', 'termine', 12000.00, 12000.00, 0.00, 0.00, 0.00, NULL, NULL, NULL, NULL, NULL, 1, 1, 1, '2026-07-12 07:01:04', '2026-07-14 09:48:09', 1),
	(2, 'PO-2026-00002', 3, '2026-07-14', '2026-07-09', '2026-07-14', 'termine', 21000.00, 21000.00, 0.00, 0.00, 0.00, NULL, 'Mongaka 12', NULL, NULL, NULL, 1, 1, 1, '2026-07-14 09:40:07', '2026-07-14 10:56:26', 1);

-- Listage de la structure de table bd_odoo. commande_vente
CREATE TABLE IF NOT EXISTS `commande_vente` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `reference` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `partenaire_id` bigint unsigned NOT NULL,
  `client_nom` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `date_commande` date NOT NULL,
  `date_livraison_souhaitee` date DEFAULT NULL,
  `date_livraison_prevue` date DEFAULT NULL,
  `date_livraison_reelle` date DEFAULT NULL,
  `etat` enum('brouillon','confirme','en_cours','termine','annule') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'brouillon',
  `montant_total_ht` decimal(16,2) NOT NULL DEFAULT '0.00',
  `montant_total_ttc` decimal(16,2) NOT NULL DEFAULT '0.00',
  `montant_remise` decimal(16,2) NOT NULL DEFAULT '0.00',
  `taux_remise` decimal(5,2) NOT NULL DEFAULT '0.00',
  `frais_livraison` decimal(16,2) NOT NULL DEFAULT '0.00',
  `notes` text COLLATE utf8mb4_unicode_ci,
  `adresse_livraison` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `adresse_facturation` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `mode_paiement` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `reference_commande_client` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `cree_par_utilisateur_id` bigint unsigned DEFAULT NULL,
  `modifie_par_utilisateur_id` bigint unsigned DEFAULT NULL,
  `actif` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `societe_id` bigint unsigned DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `commande_vente_reference_unique` (`reference`),
  KEY `commande_vente_cree_par_utilisateur_id_foreign` (`cree_par_utilisateur_id`),
  KEY `commande_vente_modifie_par_utilisateur_id_foreign` (`modifie_par_utilisateur_id`),
  KEY `commande_vente_reference_index` (`reference`),
  KEY `commande_vente_date_commande_index` (`date_commande`),
  KEY `commande_vente_etat_index` (`etat`),
  KEY `commande_vente_partenaire_id_etat_index` (`partenaire_id`,`etat`),
  KEY `commande_vente_societe_id_index` (`societe_id`),
  CONSTRAINT `commande_vente_cree_par_utilisateur_id_foreign` FOREIGN KEY (`cree_par_utilisateur_id`) REFERENCES `utilisateurs` (`id`) ON DELETE SET NULL,
  CONSTRAINT `commande_vente_modifie_par_utilisateur_id_foreign` FOREIGN KEY (`modifie_par_utilisateur_id`) REFERENCES `utilisateurs` (`id`) ON DELETE SET NULL,
  CONSTRAINT `commande_vente_partenaire_id_foreign` FOREIGN KEY (`partenaire_id`) REFERENCES `partenaire` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Listage des données de la table bd_odoo.commande_vente : ~3 rows (environ)
INSERT INTO `commande_vente` (`id`, `reference`, `partenaire_id`, `client_nom`, `date_commande`, `date_livraison_souhaitee`, `date_livraison_prevue`, `date_livraison_reelle`, `etat`, `montant_total_ht`, `montant_total_ttc`, `montant_remise`, `taux_remise`, `frais_livraison`, `notes`, `adresse_livraison`, `adresse_facturation`, `mode_paiement`, `reference_commande_client`, `cree_par_utilisateur_id`, `modifie_par_utilisateur_id`, `actif`, `created_at`, `updated_at`, `societe_id`) VALUES
	(1, 'SO-2026-00001', 2, NULL, '2026-07-12', '2026-07-12', NULL, '2026-07-12', 'termine', 7050.00, 7050.00, 0.00, 0.00, 0.00, NULL, NULL, NULL, NULL, NULL, 1, 1, 1, '2026-07-12 07:17:06', '2026-07-12 07:18:00', 1),
	(2, 'SO-2026-00002', 6, NULL, '2026-07-14', '2026-07-16', NULL, '2026-07-14', 'termine', 1410.00, 1410.00, 0.00, 0.00, 0.00, NULL, 'Kwalo 12', NULL, NULL, NULL, 1, 1, 1, '2026-07-14 09:12:16', '2026-07-14 09:27:10', 1),
	(3, 'SO-2026-00003', 1, NULL, '2026-07-14', '2026-07-14', NULL, '2026-07-14', 'termine', 1590.00, 1590.00, 0.00, 0.00, 0.00, NULL, 'Paris 12', NULL, NULL, NULL, 1, 1, 1, '2026-07-14 09:35:11', '2026-07-14 09:36:19', 1),
	(4, 'SO-2026-00004', 6, NULL, '2026-09-16', NULL, NULL, '2026-09-16', 'termine', 710.00, 710.00, 0.00, 0.00, 0.00, NULL, NULL, NULL, NULL, NULL, 1, 1, 1, '2026-09-16 18:58:45', '2026-09-16 18:59:23', 1),
	(6, 'SO-2026-00005', 7, NULL, '2026-09-16', NULL, NULL, NULL, 'termine', 1060.00, 1229.60, 0.00, 0.00, 0.00, 'Vente comptoir', NULL, NULL, 'especes', NULL, 1, NULL, 1, '2026-09-16 19:55:20', '2026-09-16 19:55:20', 1);

-- Listage de la structure de table bd_odoo. ecriture_comptable
CREATE TABLE IF NOT EXISTS `ecriture_comptable` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `reference` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `numero_facture` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `partenaire_id` bigint unsigned NOT NULL,
  `type` enum('facture_client','avoir_client','facture_fournisseur','avoir_fournisseur') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'facture_client',
  `date_emission` date NOT NULL,
  `date_echeance` date DEFAULT NULL,
  `date_paiement` date DEFAULT NULL,
  `montant_ht` decimal(16,2) NOT NULL DEFAULT '0.00',
  `montant_tva` decimal(16,2) NOT NULL DEFAULT '0.00',
  `montant_ttc` decimal(16,2) NOT NULL DEFAULT '0.00',
  `montant_remise` decimal(16,2) NOT NULL DEFAULT '0.00',
  `taux_remise` decimal(5,2) NOT NULL DEFAULT '0.00',
  `montant_paye` decimal(16,2) NOT NULL DEFAULT '0.00',
  `montant_restant` decimal(16,2) NOT NULL DEFAULT '0.00',
  `devise` varchar(3) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'EUR',
  `taux_change` decimal(10,4) NOT NULL DEFAULT '1.0000',
  `commande_vente_id` bigint unsigned DEFAULT NULL,
  `commande_achat_id` bigint unsigned DEFAULT NULL,
  `transfert_id` bigint unsigned DEFAULT NULL,
  `statut` enum('brouillon','validee','envoyee','payee','annulee') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'brouillon',
  `mode_paiement` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `notes` text COLLATE utf8mb4_unicode_ci,
  `adresse_facturation` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `adresse_livraison` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `societe_id` bigint unsigned DEFAULT NULL,
  `cree_par_utilisateur_id` bigint unsigned DEFAULT NULL,
  `modifie_par_utilisateur_id` bigint unsigned DEFAULT NULL,
  `actif` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `ecriture_comptable_reference_unique` (`reference`),
  UNIQUE KEY `ecriture_comptable_numero_facture_unique` (`numero_facture`),
  KEY `ecriture_comptable_commande_vente_id_foreign` (`commande_vente_id`),
  KEY `ecriture_comptable_commande_achat_id_foreign` (`commande_achat_id`),
  KEY `ecriture_comptable_transfert_id_foreign` (`transfert_id`),
  KEY `ecriture_comptable_cree_par_utilisateur_id_foreign` (`cree_par_utilisateur_id`),
  KEY `ecriture_comptable_modifie_par_utilisateur_id_foreign` (`modifie_par_utilisateur_id`),
  KEY `ecriture_comptable_reference_index` (`reference`),
  KEY `ecriture_comptable_numero_facture_index` (`numero_facture`),
  KEY `ecriture_comptable_type_index` (`type`),
  KEY `ecriture_comptable_statut_index` (`statut`),
  KEY `ecriture_comptable_date_emission_index` (`date_emission`),
  KEY `ecriture_comptable_partenaire_id_statut_index` (`partenaire_id`,`statut`),
  CONSTRAINT `ecriture_comptable_commande_achat_id_foreign` FOREIGN KEY (`commande_achat_id`) REFERENCES `commande_achat` (`id`) ON DELETE SET NULL,
  CONSTRAINT `ecriture_comptable_commande_vente_id_foreign` FOREIGN KEY (`commande_vente_id`) REFERENCES `commande_vente` (`id`) ON DELETE SET NULL,
  CONSTRAINT `ecriture_comptable_cree_par_utilisateur_id_foreign` FOREIGN KEY (`cree_par_utilisateur_id`) REFERENCES `utilisateurs` (`id`) ON DELETE SET NULL,
  CONSTRAINT `ecriture_comptable_modifie_par_utilisateur_id_foreign` FOREIGN KEY (`modifie_par_utilisateur_id`) REFERENCES `utilisateurs` (`id`) ON DELETE SET NULL,
  CONSTRAINT `ecriture_comptable_partenaire_id_foreign` FOREIGN KEY (`partenaire_id`) REFERENCES `partenaire` (`id`) ON DELETE RESTRICT,
  CONSTRAINT `ecriture_comptable_transfert_id_foreign` FOREIGN KEY (`transfert_id`) REFERENCES `transfert_stock` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Listage des données de la table bd_odoo.ecriture_comptable : ~3 rows (environ)
INSERT INTO `ecriture_comptable` (`id`, `reference`, `numero_facture`, `partenaire_id`, `type`, `date_emission`, `date_echeance`, `date_paiement`, `montant_ht`, `montant_tva`, `montant_ttc`, `montant_remise`, `taux_remise`, `montant_paye`, `montant_restant`, `devise`, `taux_change`, `commande_vente_id`, `commande_achat_id`, `transfert_id`, `statut`, `mode_paiement`, `notes`, `adresse_facturation`, `adresse_livraison`, `societe_id`, `cree_par_utilisateur_id`, `modifie_par_utilisateur_id`, `actif`, `created_at`, `updated_at`) VALUES
	(1, 'INV-2026-00001', 'FACT-2026-00001', 2, 'facture_client', '2026-07-12', '2026-08-11', '2026-07-12', 7050.00, 0.00, 7050.00, 0.00, 0.00, 7050.00, 0.00, 'EUR', 1.0000, 1, NULL, NULL, 'annulee', NULL, 'Paiement partiel de 7,050.00 € le 2026-07-12', NULL, NULL, 1, 1, 1, 1, '2026-07-12 07:18:56', '2026-07-13 14:03:33'),
	(2, 'INV-2026-00002', 'FACT-2026-00002', 6, 'facture_client', '2026-07-14', '2026-08-13', '2026-07-14', 1410.00, 282.00, 1692.00, 0.00, 0.00, 1692.00, 0.00, 'EUR', 1.0000, 2, NULL, NULL, 'payee', NULL, 'Paiement partiel de 1,410.00 € le 2026-07-14\nPaiement partiel de 282.00 € le 2026-07-14', NULL, NULL, 1, 1, 1, 1, '2026-07-14 09:27:20', '2026-07-14 09:27:54'),
	(3, 'INV-2026-00003', 'FACT-2026-00003', 1, 'facture_client', '2026-07-14', '2026-08-13', '2026-07-14', 1590.00, 318.00, 1908.00, 0.00, 0.00, 1908.00, 0.00, 'EUR', 1.0000, 3, NULL, NULL, 'payee', NULL, 'Paiement partiel de 1,590.00 € le 2026-07-14\nPaiement partiel de 318.00 € le 2026-07-14', NULL, NULL, 1, 1, 1, 1, '2026-07-14 09:36:23', '2026-07-14 09:51:15'),
	(5, 'INV-2026-00004', 'FACT-2026-00004', 7, 'facture_client', '2026-09-16', NULL, '2026-09-16', 1060.00, 169.60, 1229.60, 0.00, 0.00, 1229.60, 0.00, 'EUR', 1.0000, 6, NULL, NULL, 'payee', 'especes', 'Vente comptoir SO-2026-00005', NULL, NULL, 1, 1, NULL, 1, '2026-09-16 19:55:20', '2026-09-16 19:55:20');

-- Listage de la structure de table bd_odoo. emplacement_stock
CREATE TABLE IF NOT EXISTS `emplacement_stock` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `nom` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `code` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `emplacement_parent_id` bigint unsigned DEFAULT NULL,
  `usage` enum('fournisseur','client','interne','inventaire','approvisionnement','production','transit','vue') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'interne',
  `type` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'normal' COMMENT 'normal, reserve, qualite, quarantine',
  `est_entrepot` tinyint(1) NOT NULL DEFAULT '0',
  `est_zone` tinyint(1) NOT NULL DEFAULT '0',
  `est_rayon` tinyint(1) NOT NULL DEFAULT '0',
  `est_casier` tinyint(1) NOT NULL DEFAULT '0',
  `code_barres` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `capacite_maximale` decimal(16,2) DEFAULT NULL,
  `unite_capacite` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'm3, kg, pieces',
  `societe_id` bigint unsigned DEFAULT NULL,
  `actif` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `emplacement_stock_code_unique` (`code`),
  KEY `emplacement_stock_nom_index` (`nom`),
  KEY `emplacement_stock_code_index` (`code`),
  KEY `emplacement_stock_usage_index` (`usage`),
  KEY `emplacement_stock_emplacement_parent_id_usage_index` (`emplacement_parent_id`,`usage`),
  CONSTRAINT `emplacement_stock_emplacement_parent_id_foreign` FOREIGN KEY (`emplacement_parent_id`) REFERENCES `emplacement_stock` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Listage des données de la table bd_odoo.emplacement_stock : ~5 rows (environ)
INSERT INTO `emplacement_stock` (`id`, `nom`, `code`, `description`, `emplacement_parent_id`, `usage`, `type`, `est_entrepot`, `est_zone`, `est_rayon`, `est_casier`, `code_barres`, `capacite_maximale`, `unite_capacite`, `societe_id`, `actif`, `created_at`, `updated_at`) VALUES
	(1, 'Entrepôt Principal', 'EP01', NULL, NULL, 'interne', 'entrepot', 0, 0, 0, 0, NULL, NULL, NULL, 1, 1, '2026-07-12 06:19:06', '2026-07-12 06:19:06'),
	(2, 'Zone A - Informatique', 'EP01-A', NULL, 1, 'interne', 'rayonnage', 0, 0, 0, 0, NULL, NULL, NULL, 1, 1, '2026-07-12 06:19:06', '2026-07-12 06:19:06'),
	(3, 'Zone B - Bureau', 'EP01-B', NULL, 1, 'interne', 'rayonnage', 0, 0, 0, 0, NULL, NULL, NULL, 1, 1, '2026-07-12 06:19:06', '2026-07-12 06:19:06'),
	(4, 'Zone C - Alimentaire', 'EP01-C', NULL, 1, 'interne', 'rayonnage', 0, 0, 0, 0, NULL, NULL, NULL, 1, 1, '2026-07-12 06:19:06', '2026-07-12 06:19:06'),
	(5, 'Quai de réception', 'QR01', NULL, 1, 'interne', 'quai', 0, 0, 0, 0, NULL, NULL, NULL, 1, 1, '2026-07-12 06:19:06', '2026-07-12 06:19:06');

-- Listage de la structure de table bd_odoo. inventaires
CREATE TABLE IF NOT EXISTS `inventaires` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `reference` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `date_inventaire` date NOT NULL,
  `emplacement_id` bigint unsigned DEFAULT NULL,
  `statut` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'brouillon' COMMENT 'brouillon|en_cours|cloture',
  `notes` text COLLATE utf8mb4_unicode_ci,
  `utilisateur_id` bigint unsigned DEFAULT NULL,
  `date_cloture` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `societe_id` bigint unsigned DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `inventaires_reference_unique` (`reference`),
  KEY `inventaires_emplacement_id_foreign` (`emplacement_id`),
  KEY `inventaires_statut_index` (`statut`),
  KEY `inventaires_date_inventaire_index` (`date_inventaire`),
  KEY `inventaires_societe_id_index` (`societe_id`),
  CONSTRAINT `inventaires_emplacement_id_foreign` FOREIGN KEY (`emplacement_id`) REFERENCES `emplacement_stock` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Listage des données de la table bd_odoo.inventaires : ~1 rows (environ)
INSERT INTO `inventaires` (`id`, `reference`, `date_inventaire`, `emplacement_id`, `statut`, `notes`, `utilisateur_id`, `date_cloture`, `created_at`, `updated_at`, `societe_id`) VALUES
	(5, 'INV-202609-0001', '2026-09-16', NULL, 'cloture', NULL, 1, '2026-09-16 18:24:33', '2026-09-16 18:22:19', '2026-09-16 18:24:33', 1);

-- Listage de la structure de table bd_odoo. ligne_commande_achat
CREATE TABLE IF NOT EXISTS `ligne_commande_achat` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `commande_achat_id` bigint unsigned NOT NULL,
  `produit_id` bigint unsigned NOT NULL,
  `code_produit` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `nom_produit` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `quantite` decimal(16,2) NOT NULL,
  `quantite_recue` decimal(16,2) NOT NULL DEFAULT '0.00',
  `prix_unitaire_ht` decimal(16,2) NOT NULL,
  `prix_unitaire_ttc` decimal(16,2) NOT NULL DEFAULT '0.00',
  `taux_remise` decimal(5,2) NOT NULL DEFAULT '0.00',
  `montant_remise` decimal(16,2) NOT NULL DEFAULT '0.00',
  `montant_total_ht` decimal(16,2) NOT NULL DEFAULT '0.00',
  `montant_total_ttc` decimal(16,2) NOT NULL DEFAULT '0.00',
  `taux_tva` decimal(5,2) NOT NULL DEFAULT '0.00',
  `date_livraison_prevue` date DEFAULT NULL,
  `delai_livraison` int DEFAULT NULL COMMENT 'Délai en jours',
  `notes` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `ligne_commande_achat_produit_id_foreign` (`produit_id`),
  KEY `ligne_commande_achat_commande_achat_id_produit_id_index` (`commande_achat_id`,`produit_id`),
  KEY `ligne_commande_achat_code_produit_index` (`code_produit`),
  CONSTRAINT `ligne_commande_achat_commande_achat_id_foreign` FOREIGN KEY (`commande_achat_id`) REFERENCES `commande_achat` (`id`) ON DELETE CASCADE,
  CONSTRAINT `ligne_commande_achat_produit_id_foreign` FOREIGN KEY (`produit_id`) REFERENCES `variante_produit` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Listage des données de la table bd_odoo.ligne_commande_achat : ~0 rows (environ)
INSERT INTO `ligne_commande_achat` (`id`, `commande_achat_id`, `produit_id`, `code_produit`, `nom_produit`, `description`, `quantite`, `quantite_recue`, `prix_unitaire_ht`, `prix_unitaire_ttc`, `taux_remise`, `montant_remise`, `montant_total_ht`, `montant_total_ttc`, `taux_tva`, `date_livraison_prevue`, `delai_livraison`, `notes`, `created_at`, `updated_at`) VALUES
	(1, 1, 1, 'CLAV-CORSAIR-001', 'Corsair K70 RGB', NULL, 100.00, 100.00, 120.00, 120.00, 0.00, 0.00, 12000.00, 12000.00, 0.00, NULL, NULL, NULL, '2026-07-12 07:01:04', '2026-07-12 07:02:23'),
	(2, 2, 3, 'Code-video', 'hp-video', NULL, 70.00, 70.00, 300.00, 300.00, 0.00, 0.00, 21000.00, 21000.00, 0.00, NULL, NULL, NULL, '2026-07-14 09:40:07', '2026-07-14 09:45:17');

-- Listage de la structure de table bd_odoo. ligne_commande_vente
CREATE TABLE IF NOT EXISTS `ligne_commande_vente` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `commande_vente_id` bigint unsigned NOT NULL,
  `produit_id` bigint unsigned NOT NULL,
  `code_produit` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `nom_produit` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `quantite` decimal(16,2) NOT NULL,
  `quantite_livree` decimal(16,2) NOT NULL DEFAULT '0.00',
  `prix_unitaire_ht` decimal(16,2) NOT NULL,
  `prix_unitaire_ttc` decimal(16,2) NOT NULL DEFAULT '0.00',
  `taux_remise` decimal(5,2) NOT NULL DEFAULT '0.00',
  `montant_remise` decimal(16,2) NOT NULL DEFAULT '0.00',
  `montant_total_ht` decimal(16,2) NOT NULL DEFAULT '0.00',
  `montant_total_ttc` decimal(16,2) NOT NULL DEFAULT '0.00',
  `taux_tva` decimal(5,2) NOT NULL DEFAULT '0.00',
  `date_livraison_souhaitee` date DEFAULT NULL,
  `delai_livraison` int DEFAULT NULL COMMENT 'Délai en jours',
  `notes` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `ligne_commande_vente_produit_id_foreign` (`produit_id`),
  KEY `ligne_commande_vente_commande_vente_id_produit_id_index` (`commande_vente_id`,`produit_id`),
  KEY `ligne_commande_vente_code_produit_index` (`code_produit`),
  CONSTRAINT `ligne_commande_vente_commande_vente_id_foreign` FOREIGN KEY (`commande_vente_id`) REFERENCES `commande_vente` (`id`) ON DELETE CASCADE,
  CONSTRAINT `ligne_commande_vente_produit_id_foreign` FOREIGN KEY (`produit_id`) REFERENCES `variante_produit` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Listage des données de la table bd_odoo.ligne_commande_vente : ~6 rows (environ)
INSERT INTO `ligne_commande_vente` (`id`, `commande_vente_id`, `produit_id`, `code_produit`, `nom_produit`, `description`, `quantite`, `quantite_livree`, `prix_unitaire_ht`, `prix_unitaire_ttc`, `taux_remise`, `montant_remise`, `montant_total_ht`, `montant_total_ttc`, `taux_tva`, `date_livraison_souhaitee`, `delai_livraison`, `notes`, `created_at`, `updated_at`) VALUES
	(1, 1, 1, 'CLAV-CORSAIR-001', 'Corsair K70 RGB', NULL, 10.00, 0.00, 180.00, 180.00, 0.00, 0.00, 1800.00, 1800.00, 0.00, NULL, NULL, NULL, '2026-07-12 07:17:06', '2026-07-12 07:17:06'),
	(2, 1, 2, 'ECR-DELL-001', 'Dell S2722QC 4K', NULL, 15.00, 0.00, 350.00, 350.00, 0.00, 0.00, 5250.00, 5250.00, 0.00, NULL, NULL, NULL, '2026-07-12 07:17:06', '2026-07-12 07:17:06'),
	(3, 2, 2, 'ECR-DELL-001', 'Dell S2722QC 4K', NULL, 3.00, 0.00, 350.00, 350.00, 0.00, 0.00, 1050.00, 1050.00, 0.00, NULL, NULL, NULL, '2026-07-14 09:12:16', '2026-07-14 09:12:16'),
	(4, 2, 1, 'CLAV-CORSAIR-001', 'Corsair K70 RGB', NULL, 2.00, 0.00, 180.00, 180.00, 0.00, 0.00, 360.00, 360.00, 0.00, NULL, NULL, NULL, '2026-07-14 09:12:16', '2026-07-14 09:12:16'),
	(5, 3, 2, 'ECR-DELL-001', 'Dell S2722QC 4K', NULL, 3.00, 0.00, 350.00, 350.00, 0.00, 0.00, 1050.00, 1050.00, 0.00, NULL, NULL, NULL, '2026-07-14 09:35:11', '2026-07-14 09:35:11'),
	(6, 3, 1, 'CLAV-CORSAIR-001', 'Corsair K70 RGB', NULL, 3.00, 0.00, 180.00, 180.00, 0.00, 0.00, 540.00, 540.00, 0.00, NULL, NULL, NULL, '2026-07-14 09:35:11', '2026-07-14 09:35:11'),
	(7, 4, 1, 'CLAV-CORSAIR-001', 'Corsair K70 RGB', NULL, 2.00, 0.00, 180.00, 180.00, 0.00, 0.00, 360.00, 360.00, 0.00, NULL, NULL, NULL, '2026-09-16 18:58:45', '2026-09-16 18:58:45'),
	(8, 4, 2, 'ECR-DELL-001', 'Dell S2722QC 4K', NULL, 1.00, 0.00, 350.00, 350.00, 0.00, 0.00, 350.00, 350.00, 0.00, NULL, NULL, NULL, '2026-09-16 18:58:45', '2026-09-16 18:58:45'),
	(10, 6, 1, 'CLAV-CORSAIR-001', 'Corsair K70 RGB', NULL, 2.00, 0.00, 180.00, 208.80, 0.00, 0.00, 360.00, 417.60, 16.00, NULL, NULL, NULL, '2026-09-16 19:55:20', '2026-09-16 19:55:20'),
	(11, 6, 2, 'ECR-DELL-001', 'Dell S2722QC 4K', NULL, 1.00, 0.00, 350.00, 406.00, 0.00, 0.00, 350.00, 406.00, 16.00, NULL, NULL, NULL, '2026-09-16 19:55:20', '2026-09-16 19:55:20'),
	(12, 6, 3, 'Code-video', 'hp-video', NULL, 1.00, 0.00, 350.00, 406.00, 0.00, 0.00, 350.00, 406.00, 16.00, NULL, NULL, NULL, '2026-09-16 19:55:20', '2026-09-16 19:55:20');

-- Listage de la structure de table bd_odoo. ligne_ecriture_comptable
CREATE TABLE IF NOT EXISTS `ligne_ecriture_comptable` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `ecriture_comptable_id` bigint unsigned NOT NULL,
  `produit_id` bigint unsigned DEFAULT NULL,
  `code_produit` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `nom_produit` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `quantite` decimal(16,2) NOT NULL DEFAULT '1.00',
  `prix_unitaire_ht` decimal(16,2) NOT NULL,
  `prix_unitaire_ttc` decimal(16,2) NOT NULL DEFAULT '0.00',
  `taux_remise` decimal(5,2) NOT NULL DEFAULT '0.00',
  `montant_remise` decimal(16,2) NOT NULL DEFAULT '0.00',
  `montant_ht` decimal(16,2) NOT NULL DEFAULT '0.00',
  `montant_tva` decimal(16,2) NOT NULL DEFAULT '0.00',
  `montant_ttc` decimal(16,2) NOT NULL DEFAULT '0.00',
  `taux_tva` decimal(5,2) NOT NULL DEFAULT '0.00',
  `compte_comptable` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `compte_tva` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `notes` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `ligne_ecriture_comptable_ecriture_comptable_id_index` (`ecriture_comptable_id`),
  KEY `ligne_ecriture_comptable_produit_id_index` (`produit_id`),
  KEY `ligne_ecriture_comptable_code_produit_index` (`code_produit`),
  CONSTRAINT `ligne_ecriture_comptable_ecriture_comptable_id_foreign` FOREIGN KEY (`ecriture_comptable_id`) REFERENCES `ecriture_comptable` (`id`) ON DELETE CASCADE,
  CONSTRAINT `ligne_ecriture_comptable_produit_id_foreign` FOREIGN KEY (`produit_id`) REFERENCES `variante_produit` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Listage des données de la table bd_odoo.ligne_ecriture_comptable : ~6 rows (environ)
INSERT INTO `ligne_ecriture_comptable` (`id`, `ecriture_comptable_id`, `produit_id`, `code_produit`, `nom_produit`, `description`, `quantite`, `prix_unitaire_ht`, `prix_unitaire_ttc`, `taux_remise`, `montant_remise`, `montant_ht`, `montant_tva`, `montant_ttc`, `taux_tva`, `compte_comptable`, `compte_tva`, `notes`, `created_at`, `updated_at`) VALUES
	(1, 1, 1, NULL, 'Corsair K70 RGB', NULL, 10.00, 180.00, 180.00, 0.00, 0.00, 1800.00, 0.00, 1800.00, 0.00, NULL, NULL, NULL, '2026-07-12 07:18:56', '2026-07-12 07:18:56'),
	(2, 1, 2, NULL, 'Dell S2722QC 4K', NULL, 15.00, 350.00, 350.00, 0.00, 0.00, 5250.00, 0.00, 5250.00, 0.00, NULL, NULL, NULL, '2026-07-12 07:18:56', '2026-07-12 07:18:56'),
	(3, 2, 1, NULL, 'Corsair K70 RGB', NULL, 2.00, 180.00, 216.00, 0.00, 0.00, 360.00, 72.00, 432.00, 20.00, NULL, NULL, NULL, '2026-07-14 09:27:20', '2026-07-14 09:27:20'),
	(4, 2, 2, NULL, 'Dell S2722QC 4K', NULL, 3.00, 350.00, 420.00, 0.00, 0.00, 1050.00, 210.00, 1260.00, 20.00, NULL, NULL, NULL, '2026-07-14 09:27:20', '2026-07-14 09:27:20'),
	(5, 3, 1, NULL, 'Corsair K70 RGB', NULL, 3.00, 180.00, 216.00, 0.00, 0.00, 540.00, 108.00, 648.00, 20.00, NULL, NULL, NULL, '2026-07-14 09:36:23', '2026-07-14 09:36:23'),
	(6, 3, 2, NULL, 'Dell S2722QC 4K', NULL, 3.00, 350.00, 420.00, 0.00, 0.00, 1050.00, 210.00, 1260.00, 20.00, NULL, NULL, NULL, '2026-07-14 09:36:23', '2026-07-14 09:36:23'),
	(8, 5, 1, 'CLAV-CORSAIR-001', 'Corsair K70 RGB', NULL, 2.00, 180.00, 208.80, 0.00, 0.00, 360.00, 57.60, 417.60, 16.00, '411', '4457', NULL, '2026-09-16 19:55:20', '2026-09-16 19:55:20'),
	(9, 5, 2, 'ECR-DELL-001', 'Dell S2722QC 4K', NULL, 1.00, 350.00, 406.00, 0.00, 0.00, 350.00, 56.00, 406.00, 16.00, '411', '4457', NULL, '2026-09-16 19:55:20', '2026-09-16 19:55:20'),
	(10, 5, 3, 'Code-video', 'hp-video', NULL, 1.00, 350.00, 406.00, 0.00, 0.00, 350.00, 56.00, 406.00, 16.00, '411', '4457', NULL, '2026-09-16 19:55:20', '2026-09-16 19:55:20');

-- Listage de la structure de table bd_odoo. ligne_inventaires
CREATE TABLE IF NOT EXISTS `ligne_inventaires` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `inventaire_id` bigint unsigned NOT NULL,
  `produit_id` bigint unsigned NOT NULL,
  `emplacement_id` bigint unsigned DEFAULT NULL,
  `quantite_theorique` decimal(16,2) NOT NULL DEFAULT '0.00',
  `quantite_physique` decimal(16,2) NOT NULL DEFAULT '0.00',
  `ecart` decimal(16,2) NOT NULL DEFAULT '0.00',
  `ajuste` tinyint(1) NOT NULL DEFAULT '0',
  `notes` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_ligne_inventaire` (`inventaire_id`,`produit_id`,`emplacement_id`),
  KEY `ligne_inventaires_produit_id_foreign` (`produit_id`),
  KEY `ligne_inventaires_emplacement_id_foreign` (`emplacement_id`),
  KEY `ligne_inventaires_inventaire_id_index` (`inventaire_id`),
  CONSTRAINT `ligne_inventaires_emplacement_id_foreign` FOREIGN KEY (`emplacement_id`) REFERENCES `emplacement_stock` (`id`) ON DELETE SET NULL,
  CONSTRAINT `ligne_inventaires_inventaire_id_foreign` FOREIGN KEY (`inventaire_id`) REFERENCES `inventaires` (`id`) ON DELETE CASCADE,
  CONSTRAINT `ligne_inventaires_produit_id_foreign` FOREIGN KEY (`produit_id`) REFERENCES `variante_produit` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Listage des données de la table bd_odoo.ligne_inventaires : ~3 rows (environ)
INSERT INTO `ligne_inventaires` (`id`, `inventaire_id`, `produit_id`, `emplacement_id`, `quantite_theorique`, `quantite_physique`, `ecart`, `ajuste`, `notes`, `created_at`, `updated_at`) VALUES
	(13, 5, 1, 1, 85.00, 85.00, 0.00, 1, NULL, '2026-09-16 18:22:19', '2026-09-16 18:24:33'),
	(14, 5, 2, 1, 164.00, 164.00, 0.00, 1, NULL, '2026-09-16 18:22:19', '2026-09-16 18:24:33'),
	(15, 5, 3, 1, 70.00, 70.00, 0.00, 1, NULL, '2026-09-16 18:22:19', '2026-09-16 18:24:33');

-- Listage de la structure de table bd_odoo. ligne_operation_stock
CREATE TABLE IF NOT EXISTS `ligne_operation_stock` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `mouvement_id` bigint unsigned NOT NULL,
  `produit_id` bigint unsigned NOT NULL,
  `lot_id` bigint unsigned DEFAULT NULL,
  `code_barres` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `quantite_traitee` decimal(16,2) NOT NULL,
  `emplacement_source_id` bigint unsigned NOT NULL,
  `emplacement_destination_id` bigint unsigned NOT NULL,
  `utilisateur_id` bigint unsigned DEFAULT NULL,
  `date_operation` datetime NOT NULL,
  `type_operation` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'prelevement, reception, scan, etc.',
  `notes` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `ligne_operation_stock_produit_id_foreign` (`produit_id`),
  KEY `ligne_operation_stock_lot_id_foreign` (`lot_id`),
  KEY `ligne_operation_stock_emplacement_source_id_foreign` (`emplacement_source_id`),
  KEY `ligne_operation_stock_emplacement_destination_id_foreign` (`emplacement_destination_id`),
  KEY `ligne_operation_stock_utilisateur_id_foreign` (`utilisateur_id`),
  KEY `ligne_operation_stock_mouvement_id_index` (`mouvement_id`),
  KEY `ligne_operation_stock_date_operation_index` (`date_operation`),
  KEY `ligne_operation_stock_type_operation_index` (`type_operation`),
  KEY `ligne_operation_stock_mouvement_id_type_operation_index` (`mouvement_id`,`type_operation`),
  CONSTRAINT `ligne_operation_stock_emplacement_destination_id_foreign` FOREIGN KEY (`emplacement_destination_id`) REFERENCES `emplacement_stock` (`id`) ON DELETE RESTRICT,
  CONSTRAINT `ligne_operation_stock_emplacement_source_id_foreign` FOREIGN KEY (`emplacement_source_id`) REFERENCES `emplacement_stock` (`id`) ON DELETE RESTRICT,
  CONSTRAINT `ligne_operation_stock_lot_id_foreign` FOREIGN KEY (`lot_id`) REFERENCES `lot_tracabilite` (`id`) ON DELETE SET NULL,
  CONSTRAINT `ligne_operation_stock_mouvement_id_foreign` FOREIGN KEY (`mouvement_id`) REFERENCES `mouvement_stock` (`id`) ON DELETE CASCADE,
  CONSTRAINT `ligne_operation_stock_produit_id_foreign` FOREIGN KEY (`produit_id`) REFERENCES `variante_produit` (`id`) ON DELETE RESTRICT,
  CONSTRAINT `ligne_operation_stock_utilisateur_id_foreign` FOREIGN KEY (`utilisateur_id`) REFERENCES `utilisateurs` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Listage des données de la table bd_odoo.ligne_operation_stock : ~0 rows (environ)

-- Listage de la structure de table bd_odoo. lot_tracabilite
CREATE TABLE IF NOT EXISTS `lot_tracabilite` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `nom` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `code` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `produit_id` bigint unsigned NOT NULL,
  `type` enum('lot','serie') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'lot',
  `date_production` date DEFAULT NULL,
  `date_peremption` date DEFAULT NULL,
  `date_reception` date DEFAULT NULL,
  `fournisseur` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `reference_fournisseur` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `quantite_initiale` decimal(16,2) NOT NULL DEFAULT '0.00',
  `quantite_actuelle` decimal(16,2) NOT NULL DEFAULT '0.00',
  `quantite_reservee` decimal(16,2) NOT NULL DEFAULT '0.00',
  `unite` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `statut` enum('actif','epuise','perime','bloque') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'actif',
  `notes` text COLLATE utf8mb4_unicode_ci,
  `societe_id` bigint unsigned DEFAULT NULL,
  `cree_par_utilisateur_id` bigint unsigned DEFAULT NULL,
  `modifie_par_utilisateur_id` bigint unsigned DEFAULT NULL,
  `actif` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `lot_tracabilite_code_unique` (`code`),
  KEY `lot_tracabilite_cree_par_utilisateur_id_foreign` (`cree_par_utilisateur_id`),
  KEY `lot_tracabilite_modifie_par_utilisateur_id_foreign` (`modifie_par_utilisateur_id`),
  KEY `lot_tracabilite_nom_index` (`nom`),
  KEY `lot_tracabilite_code_index` (`code`),
  KEY `lot_tracabilite_produit_id_index` (`produit_id`),
  KEY `lot_tracabilite_date_peremption_index` (`date_peremption`),
  KEY `lot_tracabilite_statut_index` (`statut`),
  KEY `lot_tracabilite_produit_id_statut_index` (`produit_id`,`statut`),
  CONSTRAINT `lot_tracabilite_cree_par_utilisateur_id_foreign` FOREIGN KEY (`cree_par_utilisateur_id`) REFERENCES `utilisateurs` (`id`) ON DELETE SET NULL,
  CONSTRAINT `lot_tracabilite_modifie_par_utilisateur_id_foreign` FOREIGN KEY (`modifie_par_utilisateur_id`) REFERENCES `utilisateurs` (`id`) ON DELETE SET NULL,
  CONSTRAINT `lot_tracabilite_produit_id_foreign` FOREIGN KEY (`produit_id`) REFERENCES `variante_produit` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Listage des données de la table bd_odoo.lot_tracabilite : ~0 rows (environ)
INSERT INTO `lot_tracabilite` (`id`, `nom`, `code`, `produit_id`, `type`, `date_production`, `date_peremption`, `date_reception`, `fournisseur`, `reference_fournisseur`, `quantite_initiale`, `quantite_actuelle`, `quantite_reservee`, `unite`, `statut`, `notes`, `societe_id`, `cree_par_utilisateur_id`, `modifie_par_utilisateur_id`, `actif`, `created_at`, `updated_at`) VALUES
	(1, 'LOT-2026-002', 'LOT-Ecran', 2, 'lot', '2026-07-12', NULL, NULL, 'NGOMA', NULL, 150.00, 128.00, 0.00, NULL, 'actif', NULL, 1, 1, 1, 1, '2026-07-12 07:07:03', '2026-09-16 18:59:23');

-- Listage de la structure de table bd_odoo. migrations
CREATE TABLE IF NOT EXISTS `migrations` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `migration` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `batch` int NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=33 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Listage des données de la table bd_odoo.migrations : ~0 rows (environ)
INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES
	(1, '2019_12_14_000001_create_personal_access_tokens_table', 1),
	(2, '2026_06_30_110404_create_permissions_table', 1),
	(3, '2026_06_30_110404_create_roles_table', 1),
	(4, '2026_06_30_110404_create_utilisateurs_table', 1),
	(5, '2026_06_30_110405_create_role_permission_table', 1),
	(6, '2026_06_30_110405_create_utilisateur_role_table', 1),
	(7, '2026_06_30_121413_create_categorie_produit_table', 1),
	(8, '2026_06_30_125448_create_unite_mesure_table', 1),
	(9, '2026_06_30_130733_create_produit_modele_table', 1),
	(10, '2026_06_30_132513_create_variante_produit_table', 1),
	(11, '2026_06_30_134134_create_partenaires_table', 1),
	(12, '2026_06_30_140036_create_commande_vente_table', 1),
	(13, '2026_06_30_140922_create_ligne_commande_vente_table', 1),
	(14, '2026_06_30_151705_create_commande_achat_table', 1),
	(15, '2026_06_30_151804_create_ligne_commande_achat_table', 1),
	(16, '2026_06_30_154349_create_emplacement_stock_table', 1),
	(17, '2026_06_30_160143_create_lot_tracabilite_table', 1),
	(18, '2026_06_30_162319_create_quantite_stock_table', 1),
	(19, '2026_06_30_164813_create_transfert_stock_table', 1),
	(20, '2026_06_30_165809_create_mouvement_stock_table', 1),
	(21, '2026_06_30_172246_create_ligne_operation_stock_table', 1),
	(22, '2026_06_30_181715_create_ecriture_comptables_table', 1),
	(23, '2026_06_30_182023_create_ligne_ecriture_comptables_table', 1),
	(24, '2026_07_11_143028_create_audit_logs_table', 1),
	(25, '2026_09_16_000001_create_inventaires_table', 2),
	(26, '2026_09_16_000002_create_ligne_inventaires_table', 2),
	(27, '2026_09_16_000003_create_societes_and_scope_tables', 3),
	(28, '2026_09_16_000004_add_logo_to_societes_and_societe_permission', 4),
	(29, '2026_09_16_000005_create_parametres_table_and_pos_fields', 5),
	(30, '2026_09_16_000006_restrict_societe_permission', 6),
	(31, '2026_09_16_000007_add_societe_to_audit_logs', 7),
	(32, '2026_09_16_000008_seed_parametres_for_societes', 8);

-- Listage de la structure de table bd_odoo. mouvement_stock
CREATE TABLE IF NOT EXISTS `mouvement_stock` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `transfert_id` bigint unsigned NOT NULL,
  `produit_id` bigint unsigned NOT NULL,
  `lot_id` bigint unsigned DEFAULT NULL,
  `code_produit` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `nom_produit` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `quantite_demandee` decimal(16,2) NOT NULL,
  `quantite_traitee` decimal(16,2) NOT NULL DEFAULT '0.00',
  `quantite_reservee` decimal(16,2) NOT NULL DEFAULT '0.00',
  `emplacement_source_id` bigint unsigned NOT NULL,
  `emplacement_destination_id` bigint unsigned NOT NULL,
  `emplacement_source_reel_id` bigint unsigned DEFAULT NULL,
  `emplacement_destination_reel_id` bigint unsigned DEFAULT NULL,
  `etat` enum('brouillon','attente','confirme','assigne','termine','annule') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'brouillon',
  `unite` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `poids_unitaire` decimal(16,4) DEFAULT NULL,
  `volume_unitaire` decimal(16,4) DEFAULT NULL,
  `date_prelevement` date DEFAULT NULL,
  `date_reception` date DEFAULT NULL,
  `notes` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `societe_id` bigint unsigned DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `mouvement_stock_produit_id_foreign` (`produit_id`),
  KEY `mouvement_stock_lot_id_foreign` (`lot_id`),
  KEY `mouvement_stock_emplacement_source_id_foreign` (`emplacement_source_id`),
  KEY `mouvement_stock_emplacement_destination_id_foreign` (`emplacement_destination_id`),
  KEY `mouvement_stock_emplacement_source_reel_id_foreign` (`emplacement_source_reel_id`),
  KEY `mouvement_stock_emplacement_destination_reel_id_foreign` (`emplacement_destination_reel_id`),
  KEY `idx_mvt_transfert_produit` (`transfert_id`,`produit_id`),
  KEY `idx_mvt_etat` (`etat`),
  KEY `mouvement_stock_societe_id_index` (`societe_id`),
  CONSTRAINT `mouvement_stock_emplacement_destination_id_foreign` FOREIGN KEY (`emplacement_destination_id`) REFERENCES `emplacement_stock` (`id`) ON DELETE RESTRICT,
  CONSTRAINT `mouvement_stock_emplacement_destination_reel_id_foreign` FOREIGN KEY (`emplacement_destination_reel_id`) REFERENCES `emplacement_stock` (`id`) ON DELETE SET NULL,
  CONSTRAINT `mouvement_stock_emplacement_source_id_foreign` FOREIGN KEY (`emplacement_source_id`) REFERENCES `emplacement_stock` (`id`) ON DELETE RESTRICT,
  CONSTRAINT `mouvement_stock_emplacement_source_reel_id_foreign` FOREIGN KEY (`emplacement_source_reel_id`) REFERENCES `emplacement_stock` (`id`) ON DELETE SET NULL,
  CONSTRAINT `mouvement_stock_lot_id_foreign` FOREIGN KEY (`lot_id`) REFERENCES `lot_tracabilite` (`id`) ON DELETE SET NULL,
  CONSTRAINT `mouvement_stock_produit_id_foreign` FOREIGN KEY (`produit_id`) REFERENCES `variante_produit` (`id`) ON DELETE RESTRICT,
  CONSTRAINT `mouvement_stock_transfert_id_foreign` FOREIGN KEY (`transfert_id`) REFERENCES `transfert_stock` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Listage des données de la table bd_odoo.mouvement_stock : ~0 rows (environ)

-- Listage de la structure de table bd_odoo. parametres
CREATE TABLE IF NOT EXISTS `parametres` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `societe_id` bigint unsigned DEFAULT NULL,
  `cle` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `valeur` text COLLATE utf8mb4_unicode_ci,
  `description` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_parametre_societe` (`societe_id`,`cle`),
  KEY `parametres_societe_id_index` (`societe_id`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Listage des données de la table bd_odoo.parametres : ~0 rows (environ)
INSERT INTO `parametres` (`id`, `societe_id`, `cle`, `valeur`, `description`, `created_at`, `updated_at`) VALUES
	(1, 1, 'tva_taux', '16', 'Taux de TVA par défaut (%)', '2026-09-16 19:04:50', '2026-09-16 19:04:50'),
	(2, 1, 'entreprise_nom', '', 'Nom affiché sur le ticket', '2026-09-16 19:04:50', '2026-09-16 19:04:50'),
	(3, 1, 'entreprise_adresse', '', 'Adresse affichée sur le ticket', '2026-09-16 19:04:50', '2026-09-16 19:04:50'),
	(4, 1, 'entreprise_telephone', '', 'Téléphone affiché sur le ticket', '2026-09-16 19:04:50', '2026-09-16 19:04:50'),
	(5, 1, 'ticket_message', 'Merci de votre visite !', 'Message de bas de ticket', '2026-09-16 19:04:50', '2026-09-16 19:04:50'),
	(6, 4, 'tva_taux', '16', 'Taux de TVA par défaut (%)', '2026-09-16 19:51:40', '2026-09-16 19:51:57'),
	(7, 4, 'entreprise_nom', 'ALIMA', 'Nom affiché sur le ticket', '2026-09-16 19:51:40', '2026-09-16 19:51:40'),
	(8, 4, 'entreprise_adresse', '', 'Adresse affichée sur le ticket', '2026-09-16 19:51:40', '2026-09-16 19:51:40'),
	(9, 4, 'entreprise_telephone', '', 'Téléphone affiché sur le ticket', '2026-09-16 19:51:40', '2026-09-16 19:51:40'),
	(10, 4, 'ticket_message', 'Merci de votre visite !', 'Message de bas de ticket', '2026-09-16 19:51:40', '2026-09-16 19:51:40');

-- Listage de la structure de table bd_odoo. partenaire
CREATE TABLE IF NOT EXISTS `partenaire` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `nom` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `code` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `est_client` tinyint(1) NOT NULL DEFAULT '0',
  `est_fournisseur` tinyint(1) NOT NULL DEFAULT '0',
  `email` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `telephone` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `mobile` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `adresse` text COLLATE utf8mb4_unicode_ci,
  `ville` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `code_postal` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `pays` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `numero_tva` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `siret` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `site_web` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `notes` text COLLATE utf8mb4_unicode_ci,
  `remise` decimal(5,2) NOT NULL DEFAULT '0.00',
  `delai_paiement` int NOT NULL DEFAULT '30' COMMENT 'Délai de paiement en jours',
  `actif` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `societe_id` bigint unsigned DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `partenaire_code_unique` (`code`),
  KEY `partenaire_nom_index` (`nom`),
  KEY `partenaire_email_index` (`email`),
  KEY `partenaire_code_index` (`code`),
  KEY `partenaire_est_client_est_fournisseur_index` (`est_client`,`est_fournisseur`),
  KEY `partenaire_societe_id_index` (`societe_id`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Listage des données de la table bd_odoo.partenaire : ~5 rows (environ)
INSERT INTO `partenaire` (`id`, `nom`, `code`, `est_client`, `est_fournisseur`, `email`, `telephone`, `mobile`, `adresse`, `ville`, `code_postal`, `pays`, `numero_tva`, `siret`, `site_web`, `notes`, `remise`, `delai_paiement`, `actif`, `created_at`, `updated_at`, `societe_id`) VALUES
	(1, 'Jean Dupont', NULL, 1, 0, 'jean.dupont@email.com', '0123456789', NULL, '12 rue de la Paix', 'Paris', '75001', 'France', NULL, NULL, NULL, 'Client fidèle', 0.00, 30, 1, '2026-07-12 06:19:06', '2026-07-12 06:19:06', 1),
	(2, 'SARL Martin', NULL, 1, 0, 'contact@sarlmartin.fr', '0987654321', NULL, '45 avenue des Champs', 'Lyon', '69001', 'France', 'FR12345678901', '12345678901234', NULL, 'Société de services', 0.00, 30, 1, '2026-07-12 06:19:06', '2026-07-12 06:19:06', 1),
	(3, 'TechDistrib', NULL, 0, 1, 'commandes@techdistrib.fr', '0147258369', NULL, '8 rue du Commerce', 'Paris', '75011', 'France', 'FR98765432109', '98765432109876', NULL, 'Fournisseur informatique', 0.00, 30, 1, '2026-07-12 06:19:06', '2026-07-12 06:19:06', 1),
	(4, 'FournBureau', NULL, 0, 1, 'ventes@fournbureau.fr', '0147258360', NULL, '25 rue des Écoles', 'Paris', '75005', 'France', 'FR45678912304', '45678912304567', NULL, 'Fournitures de bureau', 0.00, 30, 1, '2026-07-12 06:19:06', '2026-09-16 17:32:25', 1),
	(5, 'Sophie Bernard', NULL, 1, 0, 'sophie.b@email.fr', '0654789123', NULL, '3 rue des Lilas', 'Bordeaux', '33100', 'France', NULL, NULL, NULL, NULL, 0.00, 30, 1, '2026-07-12 06:19:06', '2026-07-12 06:19:06', 1),
	(6, 'Maweja', 'CLI-00001', 1, 0, 'maweja@gmail.com', '096523584', NULL, 'Kingu 2', 'Kinshasa', NULL, 'Autre', NULL, NULL, NULL, NULL, 0.00, 30, 1, '2026-07-13 13:35:06', '2026-09-16 18:08:28', 1),
	(7, 'Client test', 'COMPTOIR', 1, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0.00, 30, 1, '2026-09-16 19:05:36', '2026-09-16 19:05:36', 1);

-- Listage de la structure de table bd_odoo. permissions
CREATE TABLE IF NOT EXISTS `permissions` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `nom` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `garde` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `permissions_nom_unique` (`nom`)
) ENGINE=InnoDB AUTO_INCREMENT=32 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Listage des données de la table bd_odoo.permissions : ~26 rows (environ)
INSERT INTO `permissions` (`id`, `nom`, `garde`, `description`, `created_at`, `updated_at`) VALUES
	(1, 'creer_produits', 'produit', 'Créer des produits', '2026-07-12 06:19:06', '2026-07-12 06:19:06'),
	(2, 'modifier_produits', 'produit', 'Modifier des produits', '2026-07-12 06:19:06', '2026-07-12 06:19:06'),
	(3, 'supprimer_produits', 'produit', 'Supprimer des produits', '2026-07-12 06:19:06', '2026-07-12 06:19:06'),
	(4, 'voir_produits', 'produit', 'Voir les produits', '2026-07-12 06:19:06', '2026-07-12 06:19:06'),
	(5, 'creer_commandes', 'commande', 'Créer des commandes', '2026-07-12 06:19:06', '2026-07-12 06:19:06'),
	(6, 'modifier_commandes', 'commande', 'Modifier des commandes', '2026-07-12 06:19:06', '2026-07-12 06:19:06'),
	(7, 'valider_commandes', 'commande', 'Valider des commandes', '2026-07-12 06:19:06', '2026-07-12 06:19:06'),
	(8, 'annuler_commandes', 'commande', 'Annuler des commandes', '2026-07-12 06:19:06', '2026-07-12 06:19:06'),
	(9, 'voir_commandes', 'commande', 'Voir les commandes', '2026-07-12 06:19:06', '2026-07-12 06:19:06'),
	(10, 'transferer_stock', 'stock', 'Effectuer des transferts de stock', '2026-07-12 06:19:06', '2026-07-12 06:19:06'),
	(11, 'valider_transferts', 'stock', 'Valider des transferts de stock', '2026-07-12 06:19:06', '2026-07-12 06:19:06'),
	(12, 'inventorier_stock', 'stock', 'Effectuer des inventaires', '2026-07-12 06:19:06', '2026-07-12 06:19:06'),
	(13, 'voir_stock', 'stock', 'Voir les niveaux de stock', '2026-07-12 06:19:06', '2026-07-12 06:19:06'),
	(14, 'creer_factures', 'facture', 'Créer des factures', '2026-07-12 06:19:06', '2026-07-12 06:19:06'),
	(15, 'modifier_factures', 'facture', 'Modifier des factures', '2026-07-12 06:19:06', '2026-07-12 06:19:06'),
	(16, 'valider_factures', 'facture', 'Valider des factures', '2026-07-12 06:19:06', '2026-07-12 06:19:06'),
	(17, 'annuler_factures', 'facture', 'Annuler des factures', '2026-07-12 06:19:06', '2026-07-12 06:19:06'),
	(18, 'voir_factures', 'facture', 'Voir les factures', '2026-07-12 06:19:06', '2026-07-12 06:19:06'),
	(19, 'gerer_utilisateurs', 'admin', 'Gérer les utilisateurs', '2026-07-12 06:19:06', '2026-07-12 06:19:06'),
	(20, 'gerer_roles', 'admin', 'Gérer les rôles', '2026-07-12 06:19:06', '2026-07-12 06:19:06'),
	(21, 'gerer_permissions', 'admin', 'Gérer les permissions', '2026-07-12 06:19:06', '2026-07-12 06:19:06'),
	(22, 'assigner_roles', 'admin', 'Assigner des rôles', '2026-07-12 06:19:06', '2026-07-12 06:19:06'),
	(23, 'gerer_achats', NULL, 'Gestion des achats', '2026-07-12 06:50:11', '2026-07-12 06:50:11'),
	(24, 'gerer_categories', NULL, 'Gestion des catégories', '2026-07-12 06:50:37', '2026-07-12 06:50:37'),
	(25, 'gerer_factures', NULL, 'Gestion des factures', '2026-07-12 06:50:59', '2026-07-12 06:50:59'),
	(26, 'gerer_commandes', NULL, 'Gestion des commandes', '2026-07-12 06:51:28', '2026-07-12 06:51:28'),
	(27, 'gerer_lots', NULL, 'Gestion des lots', '2026-07-12 06:51:46', '2026-07-12 06:51:46'),
	(28, 'gerer_produits', NULL, 'Gestion des produits', '2026-07-12 06:52:16', '2026-07-12 06:52:16'),
	(29, 'gerer_stock', NULL, 'Gestion de stock', '2026-07-12 07:14:00', '2026-07-12 07:14:00'),
	(30, 'gerer_partenaires', NULL, 'Gestion de partenaires', '2026-07-13 13:34:47', '2026-07-13 13:34:47'),
	(31, 'gerer_societes', 'admin', 'Créer/désactiver des sociétés (boutiques) et gérer les abonnements', '2026-09-16 18:57:34', '2026-09-16 18:57:34');

-- Listage de la structure de table bd_odoo. personal_access_tokens
CREATE TABLE IF NOT EXISTS `personal_access_tokens` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `tokenable_type` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `tokenable_id` bigint unsigned NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `token` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `abilities` text COLLATE utf8mb4_unicode_ci,
  `last_used_at` timestamp NULL DEFAULT NULL,
  `expires_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `personal_access_tokens_token_unique` (`token`),
  KEY `personal_access_tokens_tokenable_type_tokenable_id_index` (`tokenable_type`,`tokenable_id`)
) ENGINE=InnoDB AUTO_INCREMENT=113 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Listage des données de la table bd_odoo.personal_access_tokens : ~32 rows (environ)
INSERT INTO `personal_access_tokens` (`id`, `tokenable_type`, `tokenable_id`, `name`, `token`, `abilities`, `last_used_at`, `expires_at`, `created_at`, `updated_at`) VALUES
	(1, 'App\\Models\\Utilisateur', 1, 'auth_token', '34404ffed37a9985488c8813ce6fab1165425dcbd2380ac65aa2817c43c7a004', '["*"]', '2026-07-12 06:43:34', NULL, '2026-07-12 06:41:16', '2026-07-12 06:43:34'),
	(6, 'App\\Models\\Utilisateur', 1, 'auth_token', 'e31f9cc27abb880175946678a7158d9b2d4a3997bc48e26046581a8cc759a015', '["*"]', '2026-07-12 09:02:29', NULL, '2026-07-12 07:34:41', '2026-07-12 09:02:29'),
	(12, 'App\\Models\\Utilisateur', 1, 'auth_token', '14516e22e02c2ca138f9b3932753903a822e41b0e76feff3eb6d99540fc4759c', '["*"]', '2026-07-13 11:33:14', NULL, '2026-07-13 11:29:22', '2026-07-13 11:33:14'),
	(13, 'App\\Models\\Utilisateur', 1, 'auth_token', '17780d60f9b36806196f74b2880038ec49202938b843fba5b2c074c7cdb81037', '["*"]', '2026-07-13 11:36:03', NULL, '2026-07-13 11:33:35', '2026-07-13 11:36:03'),
	(14, 'App\\Models\\Utilisateur', 1, 'auth_token', '37b6501aeb4d9f88acfd33c9572b224c6dce390d66062a9f229d90b834a1d01c', '["*"]', '2026-07-13 11:42:12', NULL, '2026-07-13 11:36:23', '2026-07-13 11:42:12'),
	(15, 'App\\Models\\Utilisateur', 1, 'auth_token', '9c808dec31e6b6c04d4ff5f00b466cc73c8d76458124a54b95dc4e65d5df5011', '["*"]', '2026-07-13 11:44:32', NULL, '2026-07-13 11:42:29', '2026-07-13 11:44:32'),
	(16, 'App\\Models\\Utilisateur', 1, 'auth_token', 'e25a519ad0389623ef2401a2ffa1606a35966f95fb2ae1e30285a46d03fa7f61', '["*"]', '2026-07-13 11:44:58', NULL, '2026-07-13 11:44:51', '2026-07-13 11:44:58'),
	(17, 'App\\Models\\Utilisateur', 1, 'auth_token', '6887576ab45824b45634e8e4f3e2250573ac051008a932b68a4722e6f4ff3785', '["*"]', '2026-07-13 11:47:24', NULL, '2026-07-13 11:45:19', '2026-07-13 11:47:24'),
	(18, 'App\\Models\\Utilisateur', 1, 'auth_token', '7b45d788f0ba817254175b20aa26f02a717e511d1318de256838d5cd423ac574', '["*"]', '2026-07-13 11:47:45', NULL, '2026-07-13 11:47:43', '2026-07-13 11:47:45'),
	(19, 'App\\Models\\Utilisateur', 1, 'auth_token', '4522e8cf05b9ad2208e7afa7f2353b4b6e9e3b18267ad4461a8eb40162a1a559', '["*"]', '2026-07-13 11:50:54', NULL, '2026-07-13 11:49:37', '2026-07-13 11:50:54'),
	(20, 'App\\Models\\Utilisateur', 1, 'auth_token', '54ab913750103bc5e327fc5724857d3d0f253bc6b8b6bd55c6762299e01feb4a', '["*"]', '2026-07-13 11:55:52', NULL, '2026-07-13 11:54:00', '2026-07-13 11:55:52'),
	(21, 'App\\Models\\Utilisateur', 1, 'auth_token', 'cafdf41f29c521464f9fcfb79d37cbf549c8723021c4b3b706323ac3986e7763', '["*"]', '2026-07-13 12:01:45', NULL, '2026-07-13 11:56:14', '2026-07-13 12:01:45'),
	(22, 'App\\Models\\Utilisateur', 1, 'auth_token', '6f99b71395b2040b8c6d029850bf32f64ab818919d5e800a90283f39bcc4a4bd', '["*"]', '2026-07-13 11:59:22', NULL, '2026-07-13 11:59:18', '2026-07-13 11:59:22'),
	(23, 'App\\Models\\Utilisateur', 1, 'auth_token', '1fe2a62c4421dd21ec6476e913c1c9a4c8343e000943e41886c977244a9ce268', '["*"]', '2026-07-13 12:09:48', NULL, '2026-07-13 12:01:57', '2026-07-13 12:09:48'),
	(24, 'App\\Models\\Utilisateur', 1, 'auth_token', '16a3fd25b191e28a441800449ba5b547c1a41ca49479850172981a2b65cc1d75', '["*"]', '2026-07-13 12:11:34', NULL, '2026-07-13 12:10:01', '2026-07-13 12:11:34'),
	(25, 'App\\Models\\Utilisateur', 1, 'auth_token', 'bb8be2c314b568b524be22ef6fb6827ebd4eb789dcea195e5458b366506c72f2', '["*"]', '2026-07-13 12:14:37', NULL, '2026-07-13 12:12:04', '2026-07-13 12:14:37'),
	(26, 'App\\Models\\Utilisateur', 1, 'auth_token', 'a03eedb665eebf5798a7a1a77333cfd61b86d7e8a78550864e10dff050e4ab29', '["*"]', '2026-07-13 12:23:44', NULL, '2026-07-13 12:14:50', '2026-07-13 12:23:44'),
	(28, 'App\\Models\\Utilisateur', 1, 'auth_token', '15bb3c75f96fda31e34ab8f231e8111376befd9b77e6ca6f95740eafe0054bbd', '["*"]', '2026-07-13 12:38:48', NULL, '2026-07-13 12:29:02', '2026-07-13 12:38:48'),
	(29, 'App\\Models\\Utilisateur', 1, 'auth_token', 'ac5371d515931eb07c3134f8d72d77215b4ec006939b5555f0e59617ddd56b8c', '["*"]', NULL, NULL, '2026-07-13 12:39:06', '2026-07-13 12:39:06'),
	(30, 'App\\Models\\Utilisateur', 1, 'auth_token', '5698b4e4817f1ba69d1a374009dd6a217b6e356c4181e1587b5db8841b971a45', '["*"]', NULL, NULL, '2026-07-13 12:39:16', '2026-07-13 12:39:16'),
	(31, 'App\\Models\\Utilisateur', 1, 'auth_token', 'cc0a5afdfeb1b7c9820afb32879a18bba8fd82b455d94ee0d25ba7644402abe0', '["*"]', NULL, NULL, '2026-07-13 12:39:57', '2026-07-13 12:39:57'),
	(32, 'App\\Models\\Utilisateur', 1, 'auth_token', 'e6f3184d165ea5e6ecb4c394167bf287bff707a8aa6aca7fb4a0da4c9782a078', '["*"]', NULL, NULL, '2026-07-13 12:40:07', '2026-07-13 12:40:07'),
	(33, 'App\\Models\\Utilisateur', 1, 'auth_token', 'a84dd07df101ff4e32b0c1aee93212af617a8102ee12708d10520134ef744d00', '["*"]', NULL, NULL, '2026-07-13 12:40:11', '2026-07-13 12:40:11'),
	(34, 'App\\Models\\Utilisateur', 1, 'auth_token', 'c0849626d375f49a7c61268902ed4a14c90607f777126896e4edece438ddcbe0', '["*"]', NULL, NULL, '2026-07-13 12:42:45', '2026-07-13 12:42:45'),
	(35, 'App\\Models\\Utilisateur', 1, 'auth_token', '212447496d93b4aad2c236867968971a1c287a7203199de0bcc4df32b2c2bf22', '["*"]', NULL, NULL, '2026-07-13 12:43:49', '2026-07-13 12:43:49'),
	(36, 'App\\Models\\Utilisateur', 1, 'auth_token', 'befbe96713794e9bf0525b266934a1606648cc1ee4c27325fba0f5187199ac7b', '["*"]', NULL, NULL, '2026-07-13 12:44:00', '2026-07-13 12:44:00'),
	(37, 'App\\Models\\Utilisateur', 1, 'auth_token', 'cf97137ddf6954cddf4df39f7a9a9903ba4f7e7963892b4cece36f38e0d7c4a2', '["*"]', '2026-07-13 15:36:39', NULL, '2026-07-13 12:46:17', '2026-07-13 15:36:39'),
	(40, 'App\\Models\\Utilisateur', 1, 'auth_token', '1257e50ed9a54d9bdc37c318b2011ee9d839b65841a53666195c6a65dba0bdc8', '["*"]', '2026-07-14 10:30:33', NULL, '2026-07-14 09:08:41', '2026-07-14 10:30:33'),
	(41, 'App\\Models\\Utilisateur', 1, 'auth_token', '9b44e4b1929ff60396cd304f26340a76e90153a096de491ff827b46582f3689e', '["*"]', '2026-07-14 10:38:15', NULL, '2026-07-14 10:32:24', '2026-07-14 10:38:15'),
	(42, 'App\\Models\\Utilisateur', 1, 'auth_token', '069092f57b21ae381361eae7a6e5bdc4c1713a4c7d11ebde07df75200b5606bf', '["*"]', '2026-07-14 14:00:19', NULL, '2026-07-14 10:43:02', '2026-07-14 14:00:19'),
	(45, 'App\\Models\\Utilisateur', 1, 'auth_token', '7924d6d867774f576bf0348503bb15acdea49b98a878b5aeef3d969e19c536fc', '["*"]', '2026-07-15 13:10:38', NULL, '2026-07-15 10:41:45', '2026-07-15 13:10:38'),
	(47, 'App\\Models\\Utilisateur', 1, 'auth_token', '24fd89355077c5d0ad4ddb4b5d9684adfcda446694537d123f536c691af99af4', '["*"]', '2026-07-16 06:33:39', NULL, '2026-07-15 11:13:10', '2026-07-16 06:33:39'),
	(49, 'App\\Models\\Utilisateur', 1, 'auth_token', 'e8f16d0956d8ff4a7b52445d7056c8ac5c37a7aff31dcc1ed0ef815ed86370e2', '["*"]', '2026-07-16 06:33:45', NULL, '2026-07-15 12:52:26', '2026-07-16 06:33:45'),
	(50, 'App\\Models\\Utilisateur', 1, 'auth_token', '998a7b7fb6e45acf97f77bf5dcc16919650de07b0b2a8d84370a2448245a3e80', '["*"]', '2026-07-17 11:25:51', NULL, '2026-07-17 11:24:48', '2026-07-17 11:25:51'),
	(77, 'App\\Models\\Utilisateur', 11, 'auth_token', 'c2fde285d29f1fb4289375cf538cf545e5477ee9bc4505e6b79001a87b90876c', '["*"]', '2026-09-16 19:15:59', NULL, '2026-09-16 19:15:59', '2026-09-16 19:15:59'),
	(102, 'App\\Models\\Utilisateur', 1, 'auth_token', '664f5a169dd535975f0a80c0401fb588a735029679d0db77d7da99d28d5fe1b4', '["*"]', '2026-09-16 20:02:17', NULL, '2026-09-16 19:44:10', '2026-09-16 20:02:17');

-- Listage de la structure de table bd_odoo. produit_modele
CREATE TABLE IF NOT EXISTS `produit_modele` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `nom` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `type` enum('consommable','service','stockable') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'stockable',
  `categorie_id` bigint unsigned DEFAULT NULL,
  `unite_id` bigint unsigned DEFAULT NULL,
  `actif` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `societe_id` bigint unsigned DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `produit_modele_categorie_id_foreign` (`categorie_id`),
  KEY `produit_modele_unite_id_foreign` (`unite_id`),
  KEY `produit_modele_nom_index` (`nom`),
  KEY `produit_modele_societe_id_index` (`societe_id`),
  CONSTRAINT `produit_modele_categorie_id_foreign` FOREIGN KEY (`categorie_id`) REFERENCES `categorie_produit` (`id`) ON DELETE SET NULL,
  CONSTRAINT `produit_modele_unite_id_foreign` FOREIGN KEY (`unite_id`) REFERENCES `unite_mesure` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Listage des données de la table bd_odoo.produit_modele : ~2 rows (environ)
INSERT INTO `produit_modele` (`id`, `nom`, `description`, `type`, `categorie_id`, `unite_id`, `actif`, `created_at`, `updated_at`, `societe_id`) VALUES
	(1, 'Clavier Mécanique', NULL, 'stockable', 2, NULL, 1, '2026-07-12 06:54:26', '2026-07-12 06:54:26', 1),
	(2, 'Écran 27 pouces', NULL, 'stockable', 2, NULL, 1, '2026-07-12 06:57:54', '2026-07-12 06:57:54', 1),
	(3, 'vidéo projecteur', NULL, 'stockable', 1, 1, 1, '2026-07-14 09:39:05', '2026-07-14 09:39:05', 1);

-- Listage de la structure de table bd_odoo. quantite_stock
CREATE TABLE IF NOT EXISTS `quantite_stock` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `produit_id` bigint unsigned NOT NULL,
  `emplacement_id` bigint unsigned NOT NULL,
  `lot_id` bigint unsigned DEFAULT NULL,
  `quantite_disponible` decimal(16,2) NOT NULL DEFAULT '0.00',
  `quantite_reservee` decimal(16,2) NOT NULL DEFAULT '0.00',
  `quantite_commande` decimal(16,2) NOT NULL DEFAULT '0.00' COMMENT 'Quantité commandée mais pas encore reçue',
  `quantite_controlee` decimal(16,2) NOT NULL DEFAULT '0.00' COMMENT 'Quantité en contrôle qualité',
  `seuil_minimum` decimal(16,2) DEFAULT NULL,
  `seuil_maximum` decimal(16,2) DEFAULT NULL,
  `societe_id` bigint unsigned DEFAULT NULL,
  `date_dernier_mouvement` date DEFAULT NULL,
  `date_prochaine_reception` date DEFAULT NULL,
  `notes` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_stock_quant` (`produit_id`,`emplacement_id`,`lot_id`),
  KEY `quantite_stock_produit_id_index` (`produit_id`),
  KEY `quantite_stock_emplacement_id_index` (`emplacement_id`),
  KEY `quantite_stock_lot_id_index` (`lot_id`),
  KEY `quantite_stock_date_dernier_mouvement_index` (`date_dernier_mouvement`),
  CONSTRAINT `quantite_stock_emplacement_id_foreign` FOREIGN KEY (`emplacement_id`) REFERENCES `emplacement_stock` (`id`) ON DELETE RESTRICT,
  CONSTRAINT `quantite_stock_lot_id_foreign` FOREIGN KEY (`lot_id`) REFERENCES `lot_tracabilite` (`id`) ON DELETE SET NULL,
  CONSTRAINT `quantite_stock_produit_id_foreign` FOREIGN KEY (`produit_id`) REFERENCES `variante_produit` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Listage des données de la table bd_odoo.quantite_stock : ~2 rows (environ)
INSERT INTO `quantite_stock` (`id`, `produit_id`, `emplacement_id`, `lot_id`, `quantite_disponible`, `quantite_reservee`, `quantite_commande`, `quantite_controlee`, `seuil_minimum`, `seuil_maximum`, `societe_id`, `date_dernier_mouvement`, `date_prochaine_reception`, `notes`, `created_at`, `updated_at`) VALUES
	(1, 1, 1, NULL, 81.00, 0.00, 0.00, 0.00, NULL, NULL, 1, '2026-09-16', NULL, NULL, '2026-07-12 07:02:23', '2026-09-16 19:59:20'),
	(2, 2, 1, 1, 162.00, 0.00, 0.00, 0.00, 10.00, 1000.00, 1, '2026-09-16', '2026-07-26', NULL, '2026-07-12 07:15:00', '2026-09-16 19:55:20'),
	(3, 3, 1, NULL, 69.00, 0.00, 0.00, 0.00, NULL, NULL, 1, '2026-09-16', NULL, NULL, '2026-07-14 09:45:17', '2026-09-16 19:55:20');

-- Listage de la structure de table bd_odoo. roles
CREATE TABLE IF NOT EXISTS `roles` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `nom` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `societe_id` bigint unsigned DEFAULT NULL,
  `actif` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `roles_nom_unique` (`nom`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Listage des données de la table bd_odoo.roles : ~5 rows (environ)
INSERT INTO `roles` (`id`, `nom`, `description`, `societe_id`, `actif`, `created_at`, `updated_at`) VALUES
	(1, 'administrateur', 'Accès total à toutes les fonctionnalités', NULL, 1, '2026-07-12 06:19:06', '2026-07-13 13:35:02'),
	(2, 'gestionnaire_stock', 'Gestion des stocks, transferts et mouvements', NULL, 1, '2026-07-12 06:19:06', '2026-07-12 06:19:06'),
	(3, 'commercial', 'Gestion des commandes clients et devis', NULL, 1, '2026-07-12 06:19:06', '2026-07-12 06:19:06'),
	(4, 'comptable', 'Gestion de la facturation et des paiements', NULL, 1, '2026-07-12 06:19:06', '2026-07-12 06:19:06'),
	(5, 'lecteur', 'Accès en lecture seule', NULL, 1, '2026-07-12 06:19:06', '2026-07-12 06:19:06');

-- Listage de la structure de table bd_odoo. role_permission
CREATE TABLE IF NOT EXISTS `role_permission` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `role_id` bigint unsigned NOT NULL,
  `permission_id` bigint unsigned NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `role_permission_role_id_permission_id_unique` (`role_id`,`permission_id`),
  KEY `role_permission_permission_id_foreign` (`permission_id`),
  CONSTRAINT `role_permission_permission_id_foreign` FOREIGN KEY (`permission_id`) REFERENCES `permissions` (`id`) ON DELETE CASCADE,
  CONSTRAINT `role_permission_role_id_foreign` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=59 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Listage des données de la table bd_odoo.role_permission : ~56 rows (environ)
INSERT INTO `role_permission` (`id`, `role_id`, `permission_id`, `created_at`, `updated_at`) VALUES
	(1, 1, 8, '2026-07-12 06:19:06', '2026-07-12 06:19:06'),
	(2, 1, 17, '2026-07-12 06:19:06', '2026-07-12 06:19:06'),
	(3, 1, 22, '2026-07-12 06:19:06', '2026-07-12 06:19:06'),
	(4, 1, 5, '2026-07-12 06:19:06', '2026-07-12 06:19:06'),
	(5, 1, 14, '2026-07-12 06:19:06', '2026-07-12 06:19:06'),
	(6, 1, 1, '2026-07-12 06:19:06', '2026-07-12 06:19:06'),
	(7, 1, 21, '2026-07-12 06:19:06', '2026-07-12 06:19:06'),
	(8, 1, 20, '2026-07-12 06:19:06', '2026-07-12 06:19:06'),
	(9, 1, 19, '2026-07-12 06:19:06', '2026-07-12 06:19:06'),
	(10, 1, 12, '2026-07-12 06:19:06', '2026-07-12 06:19:06'),
	(11, 1, 6, '2026-07-12 06:19:06', '2026-07-12 06:19:06'),
	(12, 1, 15, '2026-07-12 06:19:06', '2026-07-12 06:19:06'),
	(13, 1, 2, '2026-07-12 06:19:06', '2026-07-12 06:19:06'),
	(14, 1, 3, '2026-07-12 06:19:06', '2026-07-12 06:19:06'),
	(15, 1, 10, '2026-07-12 06:19:06', '2026-07-12 06:19:06'),
	(16, 1, 7, '2026-07-12 06:19:06', '2026-07-12 06:19:06'),
	(17, 1, 16, '2026-07-12 06:19:06', '2026-07-12 06:19:06'),
	(18, 1, 11, '2026-07-12 06:19:06', '2026-07-12 06:19:06'),
	(19, 1, 9, '2026-07-12 06:19:06', '2026-07-12 06:19:06'),
	(20, 1, 18, '2026-07-12 06:19:06', '2026-07-12 06:19:06'),
	(21, 1, 4, '2026-07-12 06:19:06', '2026-07-12 06:19:06'),
	(22, 1, 13, '2026-07-12 06:19:06', '2026-07-12 06:19:06'),
	(23, 2, 1, '2026-07-12 06:19:06', '2026-07-12 06:19:06'),
	(24, 2, 2, '2026-07-12 06:19:06', '2026-07-12 06:19:06'),
	(25, 2, 3, '2026-07-12 06:19:06', '2026-07-12 06:19:06'),
	(26, 2, 4, '2026-07-12 06:19:06', '2026-07-12 06:19:06'),
	(27, 2, 10, '2026-07-12 06:19:06', '2026-07-12 06:19:06'),
	(28, 2, 11, '2026-07-12 06:19:06', '2026-07-12 06:19:06'),
	(29, 2, 12, '2026-07-12 06:19:06', '2026-07-12 06:19:06'),
	(30, 2, 13, '2026-07-12 06:19:06', '2026-07-12 06:19:06'),
	(31, 3, 4, '2026-07-12 06:19:06', '2026-07-12 06:19:06'),
	(32, 3, 5, '2026-07-12 06:19:06', '2026-07-12 06:19:06'),
	(33, 3, 6, '2026-07-12 06:19:06', '2026-07-12 06:19:06'),
	(34, 3, 7, '2026-07-12 06:19:06', '2026-07-12 06:19:06'),
	(35, 3, 8, '2026-07-12 06:19:06', '2026-07-12 06:19:06'),
	(36, 3, 9, '2026-07-12 06:19:06', '2026-07-12 06:19:06'),
	(37, 3, 13, '2026-07-12 06:19:06', '2026-07-12 06:19:06'),
	(38, 4, 14, '2026-07-12 06:19:06', '2026-07-12 06:19:06'),
	(39, 4, 15, '2026-07-12 06:19:06', '2026-07-12 06:19:06'),
	(40, 4, 16, '2026-07-12 06:19:06', '2026-07-12 06:19:06'),
	(41, 4, 17, '2026-07-12 06:19:06', '2026-07-12 06:19:06'),
	(42, 4, 18, '2026-07-12 06:19:06', '2026-07-12 06:19:06'),
	(43, 4, 4, '2026-07-12 06:19:06', '2026-07-12 06:19:06'),
	(44, 4, 9, '2026-07-12 06:19:06', '2026-07-12 06:19:06'),
	(45, 4, 13, '2026-07-12 06:19:06', '2026-07-12 06:19:06'),
	(46, 5, 9, '2026-07-12 06:19:06', '2026-07-12 06:19:06'),
	(47, 5, 18, '2026-07-12 06:19:06', '2026-07-12 06:19:06'),
	(48, 5, 4, '2026-07-12 06:19:06', '2026-07-12 06:19:06'),
	(49, 5, 13, '2026-07-12 06:19:06', '2026-07-12 06:19:06'),
	(50, 1, 28, '2026-07-12 06:52:43', '2026-07-12 06:52:43'),
	(51, 1, 25, '2026-07-12 06:52:43', '2026-07-12 06:52:43'),
	(52, 1, 23, '2026-07-12 06:52:43', '2026-07-12 06:52:43'),
	(53, 1, 26, '2026-07-12 06:52:43', '2026-07-12 06:52:43'),
	(54, 1, 24, '2026-07-12 06:52:43', '2026-07-12 06:52:43'),
	(55, 1, 27, '2026-07-12 06:52:43', '2026-07-12 06:52:43'),
	(56, 1, 29, '2026-07-12 07:14:13', '2026-07-12 07:14:13'),
	(57, 1, 30, '2026-07-13 13:35:02', '2026-07-13 13:35:02');

-- Listage de la structure de table bd_odoo. societes
CREATE TABLE IF NOT EXISTS `societes` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `nom` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `code` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `logo` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `email` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `telephone` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `adresse` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `actif` tinyint(1) NOT NULL DEFAULT '1',
  `date_abonnement` date DEFAULT NULL,
  `date_expiration` date DEFAULT NULL,
  `notes` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `societes_code_unique` (`code`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Listage des données de la table bd_odoo.societes : ~0 rows (environ)
INSERT INTO `societes` (`id`, `nom`, `code`, `logo`, `email`, `telephone`, `adresse`, `actif`, `date_abonnement`, `date_expiration`, `notes`, `created_at`, `updated_at`) VALUES
	(1, 'Pompage', 'PM', NULL, 'pomgage@gmail.com', '0898596501', NULL, 1, '2026-09-16', '2027-03-19', NULL, '2026-09-16 18:44:31', '2026-09-16 19:32:05'),
	(4, 'ALIMA', 'AL', '/logos/societe-4-1789593906.png', 'alima@gmail.com', '0898596501', NULL, 1, '2026-09-16', '2026-10-16', NULL, '2026-09-16 19:06:22', '2026-09-16 19:25:06');

-- Listage de la structure de table bd_odoo. transfert_stock
CREATE TABLE IF NOT EXISTS `transfert_stock` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `reference` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `origine` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Référence d''origine: commande, fabrication, etc.',
  `commande_vente_id` bigint unsigned DEFAULT NULL,
  `commande_achat_id` bigint unsigned DEFAULT NULL,
  `emplacement_source_id` bigint unsigned NOT NULL,
  `emplacement_destination_id` bigint unsigned NOT NULL,
  `type` enum('reception','livraison','interne','production') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'interne',
  `etat` enum('brouillon','attente','confirme','assigne','termine','annule') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'brouillon',
  `date_transfert` date DEFAULT NULL,
  `date_prevue` date DEFAULT NULL,
  `date_reelle` date DEFAULT NULL,
  `notes` text COLLATE utf8mb4_unicode_ci,
  `adresse_livraison` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `adresse_expedition` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `mode_transport` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `num_facture_transport` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `poids_total` decimal(16,2) DEFAULT NULL,
  `volume_total` decimal(16,2) DEFAULT NULL,
  `societe_id` bigint unsigned DEFAULT NULL,
  `cree_par_utilisateur_id` bigint unsigned DEFAULT NULL,
  `modifie_par_utilisateur_id` bigint unsigned DEFAULT NULL,
  `actif` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `transfert_stock_reference_unique` (`reference`),
  KEY `transfert_stock_commande_vente_id_foreign` (`commande_vente_id`),
  KEY `transfert_stock_commande_achat_id_foreign` (`commande_achat_id`),
  KEY `transfert_stock_emplacement_destination_id_foreign` (`emplacement_destination_id`),
  KEY `transfert_stock_cree_par_utilisateur_id_foreign` (`cree_par_utilisateur_id`),
  KEY `transfert_stock_modifie_par_utilisateur_id_foreign` (`modifie_par_utilisateur_id`),
  KEY `idx_transfert_ref` (`reference`),
  KEY `idx_transfert_type` (`type`),
  KEY `idx_transfert_etat` (`etat`),
  KEY `idx_transfert_src_dest` (`emplacement_source_id`,`emplacement_destination_id`),
  CONSTRAINT `transfert_stock_commande_achat_id_foreign` FOREIGN KEY (`commande_achat_id`) REFERENCES `commande_achat` (`id`) ON DELETE SET NULL,
  CONSTRAINT `transfert_stock_commande_vente_id_foreign` FOREIGN KEY (`commande_vente_id`) REFERENCES `commande_vente` (`id`) ON DELETE SET NULL,
  CONSTRAINT `transfert_stock_cree_par_utilisateur_id_foreign` FOREIGN KEY (`cree_par_utilisateur_id`) REFERENCES `utilisateurs` (`id`) ON DELETE SET NULL,
  CONSTRAINT `transfert_stock_emplacement_destination_id_foreign` FOREIGN KEY (`emplacement_destination_id`) REFERENCES `emplacement_stock` (`id`) ON DELETE RESTRICT,
  CONSTRAINT `transfert_stock_emplacement_source_id_foreign` FOREIGN KEY (`emplacement_source_id`) REFERENCES `emplacement_stock` (`id`) ON DELETE RESTRICT,
  CONSTRAINT `transfert_stock_modifie_par_utilisateur_id_foreign` FOREIGN KEY (`modifie_par_utilisateur_id`) REFERENCES `utilisateurs` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Listage des données de la table bd_odoo.transfert_stock : ~1 rows (environ)

-- Listage de la structure de table bd_odoo. unite_mesure
CREATE TABLE IF NOT EXISTS `unite_mesure` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `nom` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `symbole` varchar(10) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `actif` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `societe_id` bigint unsigned DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unite_mesure_nom_symbole_unique` (`nom`,`symbole`),
  KEY `unite_mesure_nom_index` (`nom`),
  KEY `unite_mesure_societe_id_index` (`societe_id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Listage des données de la table bd_odoo.unite_mesure : ~5 rows (environ)
INSERT INTO `unite_mesure` (`id`, `nom`, `symbole`, `description`, `actif`, `created_at`, `updated_at`, `societe_id`) VALUES
	(1, 'Unité', 'u', NULL, 1, '2026-07-12 06:19:06', '2026-07-12 06:19:06', 1),
	(2, 'Kilogramme', 'kg', NULL, 1, '2026-07-12 06:19:06', '2026-07-12 06:19:06', 1),
	(3, 'Litre', 'L', NULL, 1, '2026-07-12 06:19:06', '2026-07-12 06:19:06', 1),
	(4, 'Mètre', 'm', NULL, 1, '2026-07-12 06:19:06', '2026-07-12 06:19:06', 1),
	(5, 'Boîte', 'bt', NULL, 1, '2026-07-12 06:19:06', '2026-07-12 06:19:06', 1);

-- Listage de la structure de table bd_odoo. utilisateurs
CREATE TABLE IF NOT EXISTS `utilisateurs` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `nom` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `mot_de_passe` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `remember_token` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `telephone` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `actif` tinyint(1) NOT NULL DEFAULT '1',
  `est_super_admin` tinyint(1) NOT NULL DEFAULT '0',
  `derniere_connexion` datetime DEFAULT NULL,
  `societe_id` bigint unsigned DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `utilisateurs_email_unique` (`email`),
  KEY `utilisateurs_email_index` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Listage des données de la table bd_odoo.utilisateurs : ~5 rows (environ)
INSERT INTO `utilisateurs` (`id`, `nom`, `email`, `mot_de_passe`, `remember_token`, `telephone`, `actif`, `est_super_admin`, `derniere_connexion`, `societe_id`, `created_at`, `updated_at`) VALUES
	(1, 'Pierre Famba', 'pierre@gmail.com', '$2y$10$s1wl7fuVy1MzUAr9/WANG.cVmwu4u5JgmYnBl2f5DUa6lM4axXxPe', NULL, NULL, 1, 0, '2026-09-16 21:44:10', 1, '2026-07-12 06:19:06', '2026-09-16 19:44:10'),
	(2, 'Jean Dupont', 'jean@exemple.com', '$2y$10$NH7Nm6RtOeU8tMLwghG8yOefhpDR6rfvimaoQneVZ6TFNp4DLn3w.', NULL, NULL, 1, 0, NULL, 1, '2026-07-12 06:19:06', '2026-07-15 10:42:32'),
	(3, 'Marie Martin', 'marie@exemple.com', '$2y$10$zg1V2gl6VlbfMP8iJSc.NeNJC9lG56VfYHBzfaeeDDZZ1H0zuSi32', NULL, NULL, 1, 0, NULL, 1, '2026-07-12 06:19:06', '2026-07-12 06:19:06'),
	(4, 'Pierre Durand', 'pierre.durand@exemple.com', '$2y$10$dgA7/Lz9OO0.J45nd0vrjOjI2vVPB15zXMsHoXE71jq01ujgDTFD2', NULL, NULL, 1, 0, NULL, 1, '2026-07-12 06:19:06', '2026-07-12 06:19:06'),
	(5, 'Sophie Lefèvre', 'sophie@exemple.com', '$2y$10$81h5JSKow.doxieYaFzba.2kTCnXzS4rLrJLXhfYCNOiFJuQUxbpW', NULL, NULL, 1, 0, NULL, 1, '2026-07-12 06:19:06', '2026-07-12 06:19:06'),
	(9, 'Kanza', 'kanza@gmail.com', '$2y$10$gK.TAqf./2PoTY2Yr6paxOz5n6WKavQrzWv8fogJovkPGhDzEOYum', NULL, NULL, 1, 0, '2026-09-16 21:33:39', 4, '2026-09-16 19:06:22', '2026-09-16 19:33:39'),
	(11, 'Administrateur Plateforme', 'plateforme@gs-stock.com', '$2y$10$4Krn694DzUgWjApkuTUdlO3USzGbGSvxjnnC1gzSEEk0Qwg2FfWMS', NULL, NULL, 1, 1, '2026-09-16 21:18:54', NULL, '2026-09-16 19:15:41', '2026-09-16 19:28:48');

-- Listage de la structure de table bd_odoo. utilisateur_role
CREATE TABLE IF NOT EXISTS `utilisateur_role` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `utilisateur_id` bigint unsigned NOT NULL,
  `role_id` bigint unsigned NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `utilisateur_role_utilisateur_id_role_id_unique` (`utilisateur_id`,`role_id`),
  KEY `utilisateur_role_role_id_foreign` (`role_id`),
  CONSTRAINT `utilisateur_role_role_id_foreign` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`) ON DELETE CASCADE,
  CONSTRAINT `utilisateur_role_utilisateur_id_foreign` FOREIGN KEY (`utilisateur_id`) REFERENCES `utilisateurs` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Listage des données de la table bd_odoo.utilisateur_role : ~5 rows (environ)
INSERT INTO `utilisateur_role` (`id`, `utilisateur_id`, `role_id`, `created_at`, `updated_at`) VALUES
	(1, 1, 1, '2026-07-12 06:19:06', '2026-07-12 06:19:06'),
	(2, 2, 2, '2026-07-12 06:19:06', '2026-07-12 06:19:06'),
	(3, 3, 3, '2026-07-12 06:19:06', '2026-07-12 06:19:06'),
	(4, 4, 4, '2026-07-12 06:19:06', '2026-07-12 06:19:06'),
	(5, 5, 5, '2026-07-12 06:19:06', '2026-07-12 06:19:06');

-- Listage de la structure de table bd_odoo. variante_produit
CREATE TABLE IF NOT EXISTS `variante_produit` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `modele_produit_id` bigint unsigned NOT NULL,
  `code_interne` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `nom` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Nom spécifique de la variante ex: Rouge, XL, 128GB',
  `prix_achat` decimal(16,2) NOT NULL DEFAULT '0.00',
  `prix_vente` decimal(16,2) NOT NULL DEFAULT '0.00',
  `poids` decimal(10,2) DEFAULT NULL COMMENT 'Poids en kg',
  `reference_fournisseur` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `actif` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `societe_id` bigint unsigned DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `variante_produit_modele_produit_id_code_interne_unique` (`modele_produit_id`,`code_interne`),
  KEY `variante_produit_code_interne_index` (`code_interne`),
  KEY `variante_produit_nom_index` (`nom`),
  KEY `variante_produit_societe_id_index` (`societe_id`),
  CONSTRAINT `variante_produit_modele_produit_id_foreign` FOREIGN KEY (`modele_produit_id`) REFERENCES `produit_modele` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Listage des données de la table bd_odoo.variante_produit : ~2 rows (environ)
INSERT INTO `variante_produit` (`id`, `modele_produit_id`, `code_interne`, `nom`, `prix_achat`, `prix_vente`, `poids`, `reference_fournisseur`, `actif`, `created_at`, `updated_at`, `societe_id`) VALUES
	(1, 1, 'CLAV-CORSAIR-001', 'Corsair K70 RGB', 120.00, 180.00, NULL, 'COR-K70-RGB', 1, '2026-07-12 06:54:26', '2026-07-12 06:54:26', 1),
	(2, 2, 'ECR-DELL-001', 'Dell S2722QC 4K', 300.00, 350.00, NULL, 'DEL-S2722QC', 1, '2026-07-12 06:57:54', '2026-07-12 06:57:54', 1),
	(3, 3, 'Code-video', 'hp-video', 300.00, 350.00, NULL, 'Ref-6788', 1, '2026-07-14 09:39:05', '2026-07-14 09:39:05', 1);

/*!40103 SET TIME_ZONE=IFNULL(@OLD_TIME_ZONE, 'system') */;
/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IFNULL(@OLD_FOREIGN_KEY_CHECKS, 1) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40111 SET SQL_NOTES=IFNULL(@OLD_SQL_NOTES, 1) */;
