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
  CONSTRAINT `audit_logs_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `utilisateurs` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Listage des données de la table bd_odoo.audit_logs : ~0 rows (environ)
INSERT INTO `audit_logs` (`id`, `user_id`, `action`, `entity_type`, `entity_id`, `description`, `old_values`, `new_values`, `ip_address`, `user_agent`, `created_at`, `updated_at`) VALUES
	(1, 1, 'logout', 'Utilisateur', 1, 'Déconnexion de pierre@gmail.com', NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:151.0) Gecko/20100101 Firefox/151.0', '2026-07-12 07:30:06', '2026-07-12 07:30:06'),
	(2, NULL, 'login', 'Utilisateur', 1, 'Connexion de pierre@gmail.com', NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:151.0) Gecko/20100101 Firefox/151.0', '2026-07-12 07:30:20', '2026-07-12 07:30:20'),
	(3, 1, 'logout', 'Utilisateur', 1, 'Déconnexion de pierre@gmail.com', NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:151.0) Gecko/20100101 Firefox/151.0', '2026-07-12 07:31:07', '2026-07-12 07:31:07'),
	(4, NULL, 'login', 'Utilisateur', 1, 'Connexion de pierre@gmail.com', NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:151.0) Gecko/20100101 Firefox/151.0', '2026-07-12 07:31:14', '2026-07-12 07:31:14'),
	(5, 1, 'test', 'Test', 1, 'Test audit logging', NULL, NULL, '127.0.0.1', 'CLI', '2026-07-12 07:32:31', '2026-07-12 07:32:31'),
	(6, NULL, 'login', 'Utilisateur', 1, 'Connexion de pierre@gmail.com', NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36', '2026-07-12 07:32:35', '2026-07-12 07:32:35'),
	(7, 1, 'logout', 'Utilisateur', 1, 'Déconnexion de pierre@gmail.com', NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:151.0) Gecko/20100101 Firefox/151.0', '2026-07-12 07:34:36', '2026-07-12 07:34:36'),
	(8, NULL, 'login', 'Utilisateur', 1, 'Connexion de pierre@gmail.com', NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:151.0) Gecko/20100101 Firefox/151.0', '2026-07-12 07:34:41', '2026-07-12 07:34:41'),
	(9, 1, 'logout', 'Utilisateur', 1, 'Déconnexion de pierre@gmail.com', NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36', '2026-07-12 07:34:59', '2026-07-12 07:34:59'),
	(10, NULL, 'login', 'Utilisateur', 1, 'Connexion de pierre@gmail.com', NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36', '2026-07-12 07:35:02', '2026-07-12 07:35:02'),
	(11, 1, 'logout', 'Utilisateur', 1, 'Déconnexion de pierre@gmail.com', NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36', '2026-07-12 07:41:45', '2026-07-12 07:41:45'),
	(12, NULL, 'login', 'Utilisateur', 1, 'Connexion de pierre@gmail.com', NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36', '2026-07-12 07:41:48', '2026-07-12 07:41:48'),
	(13, 1, 'update', 'Categorie', 1, 'Modification catégorie Électronique', NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36', '2026-07-12 07:44:05', '2026-07-12 07:44:05');

-- Listage de la structure de table bd_odoo. categorie_produit
CREATE TABLE IF NOT EXISTS `categorie_produit` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `nom` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `parent_id` bigint unsigned DEFAULT NULL,
  `actif` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `categorie_produit_nom_unique` (`nom`),
  KEY `categorie_produit_parent_id_foreign` (`parent_id`),
  CONSTRAINT `categorie_produit_parent_id_foreign` FOREIGN KEY (`parent_id`) REFERENCES `categorie_produit` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Listage des données de la table bd_odoo.categorie_produit : ~4 rows (environ)
INSERT INTO `categorie_produit` (`id`, `nom`, `description`, `parent_id`, `actif`, `created_at`, `updated_at`) VALUES
	(1, 'Électronique', 'Produits électroniques', NULL, 1, '2026-07-12 06:19:06', '2026-07-12 07:44:05'),
	(2, 'Informatique', 'Matériel informatique', 1, 1, '2026-07-12 06:19:06', '2026-07-12 06:19:06'),
	(3, 'Bureau', 'Fournitures de bureau', NULL, 1, '2026-07-12 06:19:06', '2026-07-12 06:19:06'),
	(4, 'Alimentaire', 'Produits alimentaires', NULL, 1, '2026-07-12 06:19:06', '2026-07-12 06:19:06');

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
  PRIMARY KEY (`id`),
  UNIQUE KEY `commande_achat_reference_unique` (`reference`),
  KEY `commande_achat_cree_par_utilisateur_id_foreign` (`cree_par_utilisateur_id`),
  KEY `commande_achat_modifie_par_utilisateur_id_foreign` (`modifie_par_utilisateur_id`),
  KEY `commande_achat_reference_index` (`reference`),
  KEY `commande_achat_date_commande_index` (`date_commande`),
  KEY `commande_achat_etat_index` (`etat`),
  KEY `commande_achat_partenaire_id_etat_index` (`partenaire_id`,`etat`),
  CONSTRAINT `commande_achat_cree_par_utilisateur_id_foreign` FOREIGN KEY (`cree_par_utilisateur_id`) REFERENCES `utilisateurs` (`id`) ON DELETE SET NULL,
  CONSTRAINT `commande_achat_modifie_par_utilisateur_id_foreign` FOREIGN KEY (`modifie_par_utilisateur_id`) REFERENCES `utilisateurs` (`id`) ON DELETE SET NULL,
  CONSTRAINT `commande_achat_partenaire_id_foreign` FOREIGN KEY (`partenaire_id`) REFERENCES `partenaire` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Listage des données de la table bd_odoo.commande_achat : ~0 rows (environ)
INSERT INTO `commande_achat` (`id`, `reference`, `partenaire_id`, `date_commande`, `date_livraison_prevue`, `date_livraison_reelle`, `etat`, `montant_total_ht`, `montant_total_ttc`, `montant_remise`, `taux_remise`, `frais_livraison`, `notes`, `adresse_livraison`, `adresse_facturation`, `mode_paiement`, `reference_commande_fournisseur`, `cree_par_utilisateur_id`, `modifie_par_utilisateur_id`, `actif`, `created_at`, `updated_at`) VALUES
	(1, 'PO-2026-00001', 4, '2026-07-12', '2026-07-12', '2026-07-12', 'recu', 12000.00, 12000.00, 0.00, 0.00, 0.00, NULL, NULL, NULL, NULL, NULL, 1, 1, 1, '2026-07-12 07:01:04', '2026-07-12 07:02:23');

-- Listage de la structure de table bd_odoo. commande_vente
CREATE TABLE IF NOT EXISTS `commande_vente` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `reference` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `partenaire_id` bigint unsigned NOT NULL,
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
  PRIMARY KEY (`id`),
  UNIQUE KEY `commande_vente_reference_unique` (`reference`),
  KEY `commande_vente_cree_par_utilisateur_id_foreign` (`cree_par_utilisateur_id`),
  KEY `commande_vente_modifie_par_utilisateur_id_foreign` (`modifie_par_utilisateur_id`),
  KEY `commande_vente_reference_index` (`reference`),
  KEY `commande_vente_date_commande_index` (`date_commande`),
  KEY `commande_vente_etat_index` (`etat`),
  KEY `commande_vente_partenaire_id_etat_index` (`partenaire_id`,`etat`),
  CONSTRAINT `commande_vente_cree_par_utilisateur_id_foreign` FOREIGN KEY (`cree_par_utilisateur_id`) REFERENCES `utilisateurs` (`id`) ON DELETE SET NULL,
  CONSTRAINT `commande_vente_modifie_par_utilisateur_id_foreign` FOREIGN KEY (`modifie_par_utilisateur_id`) REFERENCES `utilisateurs` (`id`) ON DELETE SET NULL,
  CONSTRAINT `commande_vente_partenaire_id_foreign` FOREIGN KEY (`partenaire_id`) REFERENCES `partenaire` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Listage des données de la table bd_odoo.commande_vente : ~0 rows (environ)
INSERT INTO `commande_vente` (`id`, `reference`, `partenaire_id`, `date_commande`, `date_livraison_souhaitee`, `date_livraison_prevue`, `date_livraison_reelle`, `etat`, `montant_total_ht`, `montant_total_ttc`, `montant_remise`, `taux_remise`, `frais_livraison`, `notes`, `adresse_livraison`, `adresse_facturation`, `mode_paiement`, `reference_commande_client`, `cree_par_utilisateur_id`, `modifie_par_utilisateur_id`, `actif`, `created_at`, `updated_at`) VALUES
	(1, 'SO-2026-00001', 2, '2026-07-12', '2026-07-12', NULL, '2026-07-12', 'termine', 7050.00, 7050.00, 0.00, 0.00, 0.00, NULL, NULL, NULL, NULL, NULL, 1, 1, 1, '2026-07-12 07:17:06', '2026-07-12 07:18:00');

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
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Listage des données de la table bd_odoo.ecriture_comptable : ~0 rows (environ)
INSERT INTO `ecriture_comptable` (`id`, `reference`, `numero_facture`, `partenaire_id`, `type`, `date_emission`, `date_echeance`, `date_paiement`, `montant_ht`, `montant_tva`, `montant_ttc`, `montant_remise`, `taux_remise`, `montant_paye`, `montant_restant`, `devise`, `taux_change`, `commande_vente_id`, `commande_achat_id`, `transfert_id`, `statut`, `mode_paiement`, `notes`, `adresse_facturation`, `adresse_livraison`, `societe_id`, `cree_par_utilisateur_id`, `modifie_par_utilisateur_id`, `actif`, `created_at`, `updated_at`) VALUES
	(1, 'INV-2026-00001', 'FACT-2026-00001', 2, 'facture_client', '2026-07-12', '2026-08-11', '2026-07-12', 7050.00, 0.00, 7050.00, 0.00, 0.00, 7050.00, 0.00, 'EUR', 1.0000, 1, NULL, NULL, 'payee', NULL, 'Paiement partiel de 7,050.00 € le 2026-07-12', NULL, NULL, NULL, 1, 1, 1, '2026-07-12 07:18:56', '2026-07-12 07:18:58');

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

-- Listage des données de la table bd_odoo.emplacement_stock : ~0 rows (environ)
INSERT INTO `emplacement_stock` (`id`, `nom`, `code`, `description`, `emplacement_parent_id`, `usage`, `type`, `est_entrepot`, `est_zone`, `est_rayon`, `est_casier`, `code_barres`, `capacite_maximale`, `unite_capacite`, `societe_id`, `actif`, `created_at`, `updated_at`) VALUES
	(1, 'Entrepôt Principal', 'EP01', NULL, NULL, 'interne', 'entrepot', 0, 0, 0, 0, NULL, NULL, NULL, NULL, 1, '2026-07-12 06:19:06', '2026-07-12 06:19:06'),
	(2, 'Zone A - Informatique', 'EP01-A', NULL, 1, 'interne', 'rayonnage', 0, 0, 0, 0, NULL, NULL, NULL, NULL, 1, '2026-07-12 06:19:06', '2026-07-12 06:19:06'),
	(3, 'Zone B - Bureau', 'EP01-B', NULL, 1, 'interne', 'rayonnage', 0, 0, 0, 0, NULL, NULL, NULL, NULL, 1, '2026-07-12 06:19:06', '2026-07-12 06:19:06'),
	(4, 'Zone C - Alimentaire', 'EP01-C', NULL, 1, 'interne', 'rayonnage', 0, 0, 0, 0, NULL, NULL, NULL, NULL, 1, '2026-07-12 06:19:06', '2026-07-12 06:19:06'),
	(5, 'Quai de réception', 'QR01', NULL, 1, 'interne', 'quai', 0, 0, 0, 0, NULL, NULL, NULL, NULL, 1, '2026-07-12 06:19:06', '2026-07-12 06:19:06');

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
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Listage des données de la table bd_odoo.ligne_commande_achat : ~0 rows (environ)
INSERT INTO `ligne_commande_achat` (`id`, `commande_achat_id`, `produit_id`, `code_produit`, `nom_produit`, `description`, `quantite`, `quantite_recue`, `prix_unitaire_ht`, `prix_unitaire_ttc`, `taux_remise`, `montant_remise`, `montant_total_ht`, `montant_total_ttc`, `taux_tva`, `date_livraison_prevue`, `delai_livraison`, `notes`, `created_at`, `updated_at`) VALUES
	(1, 1, 1, 'CLAV-CORSAIR-001', 'Corsair K70 RGB', NULL, 100.00, 100.00, 120.00, 120.00, 0.00, 0.00, 12000.00, 12000.00, 0.00, NULL, NULL, NULL, '2026-07-12 07:01:04', '2026-07-12 07:02:23');

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
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Listage des données de la table bd_odoo.ligne_commande_vente : ~0 rows (environ)
INSERT INTO `ligne_commande_vente` (`id`, `commande_vente_id`, `produit_id`, `code_produit`, `nom_produit`, `description`, `quantite`, `quantite_livree`, `prix_unitaire_ht`, `prix_unitaire_ttc`, `taux_remise`, `montant_remise`, `montant_total_ht`, `montant_total_ttc`, `taux_tva`, `date_livraison_souhaitee`, `delai_livraison`, `notes`, `created_at`, `updated_at`) VALUES
	(1, 1, 1, 'CLAV-CORSAIR-001', 'Corsair K70 RGB', NULL, 10.00, 0.00, 180.00, 180.00, 0.00, 0.00, 1800.00, 1800.00, 0.00, NULL, NULL, NULL, '2026-07-12 07:17:06', '2026-07-12 07:17:06'),
	(2, 1, 2, 'ECR-DELL-001', 'Dell S2722QC 4K', NULL, 15.00, 0.00, 350.00, 350.00, 0.00, 0.00, 5250.00, 5250.00, 0.00, NULL, NULL, NULL, '2026-07-12 07:17:06', '2026-07-12 07:17:06');

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
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Listage des données de la table bd_odoo.ligne_ecriture_comptable : ~0 rows (environ)
INSERT INTO `ligne_ecriture_comptable` (`id`, `ecriture_comptable_id`, `produit_id`, `code_produit`, `nom_produit`, `description`, `quantite`, `prix_unitaire_ht`, `prix_unitaire_ttc`, `taux_remise`, `montant_remise`, `montant_ht`, `montant_tva`, `montant_ttc`, `taux_tva`, `compte_comptable`, `compte_tva`, `notes`, `created_at`, `updated_at`) VALUES
	(1, 1, 1, NULL, 'Corsair K70 RGB', NULL, 10.00, 180.00, 180.00, 0.00, 0.00, 1800.00, 0.00, 1800.00, 0.00, NULL, NULL, NULL, '2026-07-12 07:18:56', '2026-07-12 07:18:56'),
	(2, 1, 2, NULL, 'Dell S2722QC 4K', NULL, 15.00, 350.00, 350.00, 0.00, 0.00, 5250.00, 0.00, 5250.00, 0.00, NULL, NULL, NULL, '2026-07-12 07:18:56', '2026-07-12 07:18:56');

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
	(1, 'LOT-2026-002', 'LOT-Ecran', 2, 'lot', '2026-07-12', NULL, NULL, 'NGOMA', NULL, 150.00, 135.00, 0.00, NULL, 'actif', NULL, NULL, 1, NULL, 1, '2026-07-12 07:07:03', '2026-07-12 07:18:00');

-- Listage de la structure de table bd_odoo. migrations
CREATE TABLE IF NOT EXISTS `migrations` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `migration` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `batch` int NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=25 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

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
	(24, '2026_07_11_143028_create_audit_logs_table', 1);

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
  PRIMARY KEY (`id`),
  KEY `mouvement_stock_produit_id_foreign` (`produit_id`),
  KEY `mouvement_stock_lot_id_foreign` (`lot_id`),
  KEY `mouvement_stock_emplacement_source_id_foreign` (`emplacement_source_id`),
  KEY `mouvement_stock_emplacement_destination_id_foreign` (`emplacement_destination_id`),
  KEY `mouvement_stock_emplacement_source_reel_id_foreign` (`emplacement_source_reel_id`),
  KEY `mouvement_stock_emplacement_destination_reel_id_foreign` (`emplacement_destination_reel_id`),
  KEY `idx_mvt_transfert_produit` (`transfert_id`,`produit_id`),
  KEY `idx_mvt_etat` (`etat`),
  CONSTRAINT `mouvement_stock_emplacement_destination_id_foreign` FOREIGN KEY (`emplacement_destination_id`) REFERENCES `emplacement_stock` (`id`) ON DELETE RESTRICT,
  CONSTRAINT `mouvement_stock_emplacement_destination_reel_id_foreign` FOREIGN KEY (`emplacement_destination_reel_id`) REFERENCES `emplacement_stock` (`id`) ON DELETE SET NULL,
  CONSTRAINT `mouvement_stock_emplacement_source_id_foreign` FOREIGN KEY (`emplacement_source_id`) REFERENCES `emplacement_stock` (`id`) ON DELETE RESTRICT,
  CONSTRAINT `mouvement_stock_emplacement_source_reel_id_foreign` FOREIGN KEY (`emplacement_source_reel_id`) REFERENCES `emplacement_stock` (`id`) ON DELETE SET NULL,
  CONSTRAINT `mouvement_stock_lot_id_foreign` FOREIGN KEY (`lot_id`) REFERENCES `lot_tracabilite` (`id`) ON DELETE SET NULL,
  CONSTRAINT `mouvement_stock_produit_id_foreign` FOREIGN KEY (`produit_id`) REFERENCES `variante_produit` (`id`) ON DELETE RESTRICT,
  CONSTRAINT `mouvement_stock_transfert_id_foreign` FOREIGN KEY (`transfert_id`) REFERENCES `transfert_stock` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Listage des données de la table bd_odoo.mouvement_stock : ~0 rows (environ)

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
  PRIMARY KEY (`id`),
  UNIQUE KEY `partenaire_code_unique` (`code`),
  KEY `partenaire_nom_index` (`nom`),
  KEY `partenaire_email_index` (`email`),
  KEY `partenaire_code_index` (`code`),
  KEY `partenaire_est_client_est_fournisseur_index` (`est_client`,`est_fournisseur`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Listage des données de la table bd_odoo.partenaire : ~0 rows (environ)
INSERT INTO `partenaire` (`id`, `nom`, `code`, `est_client`, `est_fournisseur`, `email`, `telephone`, `mobile`, `adresse`, `ville`, `code_postal`, `pays`, `numero_tva`, `siret`, `site_web`, `notes`, `remise`, `delai_paiement`, `actif`, `created_at`, `updated_at`) VALUES
	(1, 'Jean Dupont', NULL, 1, 0, 'jean.dupont@email.com', '0123456789', NULL, '12 rue de la Paix', 'Paris', '75001', 'France', NULL, NULL, NULL, 'Client fidèle', 0.00, 30, 1, '2026-07-12 06:19:06', '2026-07-12 06:19:06'),
	(2, 'SARL Martin', NULL, 1, 0, 'contact@sarlmartin.fr', '0987654321', NULL, '45 avenue des Champs', 'Lyon', '69001', 'France', 'FR12345678901', '12345678901234', NULL, 'Société de services', 0.00, 30, 1, '2026-07-12 06:19:06', '2026-07-12 06:19:06'),
	(3, 'TechDistrib', NULL, 0, 1, 'commandes@techdistrib.fr', '0147258369', NULL, '8 rue du Commerce', 'Paris', '75011', 'France', 'FR98765432109', '98765432109876', NULL, 'Fournisseur informatique', 0.00, 30, 1, '2026-07-12 06:19:06', '2026-07-12 06:19:06'),
	(4, 'FournBureau', NULL, 0, 1, 'ventes@fournbureau.fr', '0147258360', NULL, '25 rue des Écoles', 'Paris', '75005', 'France', 'FR45678912304', '45678912304567', NULL, 'Fournitures de bureau', 0.00, 30, 1, '2026-07-12 06:19:06', '2026-07-12 06:19:06'),
	(5, 'Sophie Bernard', NULL, 1, 0, 'sophie.b@email.fr', '0654789123', NULL, '3 rue des Lilas', 'Bordeaux', '33100', 'France', NULL, NULL, NULL, NULL, 0.00, 30, 1, '2026-07-12 06:19:06', '2026-07-12 06:19:06');

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
) ENGINE=InnoDB AUTO_INCREMENT=30 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Listage des données de la table bd_odoo.permissions : ~22 rows (environ)
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
	(29, 'gerer_stock', NULL, 'Gestion de stock', '2026-07-12 07:14:00', '2026-07-12 07:14:00');

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
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Listage des données de la table bd_odoo.personal_access_tokens : ~0 rows (environ)
INSERT INTO `personal_access_tokens` (`id`, `tokenable_type`, `tokenable_id`, `name`, `token`, `abilities`, `last_used_at`, `expires_at`, `created_at`, `updated_at`) VALUES
	(1, 'App\\Models\\Utilisateur', 1, 'auth_token', '34404ffed37a9985488c8813ce6fab1165425dcbd2380ac65aa2817c43c7a004', '["*"]', '2026-07-12 06:43:34', NULL, '2026-07-12 06:41:16', '2026-07-12 06:43:34'),
	(6, 'App\\Models\\Utilisateur', 1, 'auth_token', 'e31f9cc27abb880175946678a7158d9b2d4a3997bc48e26046581a8cc759a015', '["*"]', '2026-07-12 07:34:51', NULL, '2026-07-12 07:34:41', '2026-07-12 07:34:51'),
	(8, 'App\\Models\\Utilisateur', 1, 'auth_token', '84ee1c60b99fd9dedee9036d7d0d2f44be01ef77c7a624ffd983a08f5fcf983f', '["*"]', '2026-07-12 07:58:23', NULL, '2026-07-12 07:41:48', '2026-07-12 07:58:23');

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
  PRIMARY KEY (`id`),
  KEY `produit_modele_categorie_id_foreign` (`categorie_id`),
  KEY `produit_modele_unite_id_foreign` (`unite_id`),
  KEY `produit_modele_nom_index` (`nom`),
  CONSTRAINT `produit_modele_categorie_id_foreign` FOREIGN KEY (`categorie_id`) REFERENCES `categorie_produit` (`id`) ON DELETE SET NULL,
  CONSTRAINT `produit_modele_unite_id_foreign` FOREIGN KEY (`unite_id`) REFERENCES `unite_mesure` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Listage des données de la table bd_odoo.produit_modele : ~5 rows (environ)
INSERT INTO `produit_modele` (`id`, `nom`, `description`, `type`, `categorie_id`, `unite_id`, `actif`, `created_at`, `updated_at`) VALUES
	(1, 'Clavier Mécanique', NULL, 'stockable', 2, NULL, 1, '2026-07-12 06:54:26', '2026-07-12 06:54:26'),
	(2, 'Écran 27 pouces', NULL, 'stockable', 2, NULL, 1, '2026-07-12 06:57:54', '2026-07-12 06:57:54');

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
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Listage des données de la table bd_odoo.quantite_stock : ~0 rows (environ)
INSERT INTO `quantite_stock` (`id`, `produit_id`, `emplacement_id`, `lot_id`, `quantite_disponible`, `quantite_reservee`, `quantite_commande`, `quantite_controlee`, `seuil_minimum`, `seuil_maximum`, `societe_id`, `date_dernier_mouvement`, `date_prochaine_reception`, `notes`, `created_at`, `updated_at`) VALUES
	(1, 1, 1, NULL, 90.00, 0.00, 0.00, 0.00, NULL, NULL, NULL, '2026-07-12', NULL, NULL, '2026-07-12 07:02:23', '2026-07-12 07:18:00'),
	(2, 2, 1, 1, 170.00, 0.00, 0.00, 0.00, 10.00, 1000.00, NULL, '2026-07-12', '2026-07-26', NULL, '2026-07-12 07:15:00', '2026-07-12 07:54:29');

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

-- Listage des données de la table bd_odoo.roles : ~3 rows (environ)
INSERT INTO `roles` (`id`, `nom`, `description`, `societe_id`, `actif`, `created_at`, `updated_at`) VALUES
	(1, 'administrateur', 'Accès total à toutes les fonctionnalités', NULL, 1, '2026-07-12 06:19:06', '2026-07-12 07:14:13'),
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
) ENGINE=InnoDB AUTO_INCREMENT=57 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Listage des données de la table bd_odoo.role_permission : ~49 rows (environ)
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
	(56, 1, 29, '2026-07-12 07:14:13', '2026-07-12 07:14:13');

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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Listage des données de la table bd_odoo.transfert_stock : ~0 rows (environ)

-- Listage de la structure de table bd_odoo. unite_mesure
CREATE TABLE IF NOT EXISTS `unite_mesure` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `nom` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `symbole` varchar(10) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `actif` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unite_mesure_nom_symbole_unique` (`nom`,`symbole`),
  KEY `unite_mesure_nom_index` (`nom`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Listage des données de la table bd_odoo.unite_mesure : ~5 rows (environ)
INSERT INTO `unite_mesure` (`id`, `nom`, `symbole`, `description`, `actif`, `created_at`, `updated_at`) VALUES
	(1, 'Unité', 'u', NULL, 1, '2026-07-12 06:19:06', '2026-07-12 06:19:06'),
	(2, 'Kilogramme', 'kg', NULL, 1, '2026-07-12 06:19:06', '2026-07-12 06:19:06'),
	(3, 'Litre', 'L', NULL, 1, '2026-07-12 06:19:06', '2026-07-12 06:19:06'),
	(4, 'Mètre', 'm', NULL, 1, '2026-07-12 06:19:06', '2026-07-12 06:19:06'),
	(5, 'Boîte', 'bt', NULL, 1, '2026-07-12 06:19:06', '2026-07-12 06:19:06');

-- Listage de la structure de table bd_odoo. utilisateurs
CREATE TABLE IF NOT EXISTS `utilisateurs` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `nom` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `mot_de_passe` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `remember_token` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `telephone` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `actif` tinyint(1) NOT NULL DEFAULT '1',
  `derniere_connexion` datetime DEFAULT NULL,
  `societe_id` bigint unsigned DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `utilisateurs_email_unique` (`email`),
  KEY `utilisateurs_email_index` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Listage des données de la table bd_odoo.utilisateurs : ~5 rows (environ)
INSERT INTO `utilisateurs` (`id`, `nom`, `email`, `mot_de_passe`, `remember_token`, `telephone`, `actif`, `derniere_connexion`, `societe_id`, `created_at`, `updated_at`) VALUES
	(1, 'Pierre Famba', 'pierre@gmail.com', '$2y$10$s1wl7fuVy1MzUAr9/WANG.cVmwu4u5JgmYnBl2f5DUa6lM4axXxPe', NULL, NULL, 1, '2026-07-12 09:41:48', NULL, '2026-07-12 06:19:06', '2026-07-12 07:41:48'),
	(2, 'Jean Dupont', 'jean@exemple.com', '$2y$10$NH7Nm6RtOeU8tMLwghG8yOefhpDR6rfvimaoQneVZ6TFNp4DLn3w.', NULL, NULL, 1, NULL, NULL, '2026-07-12 06:19:06', '2026-07-12 06:19:06'),
	(3, 'Marie Martin', 'marie@exemple.com', '$2y$10$zg1V2gl6VlbfMP8iJSc.NeNJC9lG56VfYHBzfaeeDDZZ1H0zuSi32', NULL, NULL, 1, NULL, NULL, '2026-07-12 06:19:06', '2026-07-12 06:19:06'),
	(4, 'Pierre Durand', 'pierre.durand@exemple.com', '$2y$10$dgA7/Lz9OO0.J45nd0vrjOjI2vVPB15zXMsHoXE71jq01ujgDTFD2', NULL, NULL, 1, NULL, NULL, '2026-07-12 06:19:06', '2026-07-12 06:19:06'),
	(5, 'Sophie Lefèvre', 'sophie@exemple.com', '$2y$10$81h5JSKow.doxieYaFzba.2kTCnXzS4rLrJLXhfYCNOiFJuQUxbpW', NULL, NULL, 1, NULL, NULL, '2026-07-12 06:19:06', '2026-07-12 06:19:06');

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
  PRIMARY KEY (`id`),
  UNIQUE KEY `variante_produit_modele_produit_id_code_interne_unique` (`modele_produit_id`,`code_interne`),
  KEY `variante_produit_code_interne_index` (`code_interne`),
  KEY `variante_produit_nom_index` (`nom`),
  CONSTRAINT `variante_produit_modele_produit_id_foreign` FOREIGN KEY (`modele_produit_id`) REFERENCES `produit_modele` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Listage des données de la table bd_odoo.variante_produit : ~5 rows (environ)
INSERT INTO `variante_produit` (`id`, `modele_produit_id`, `code_interne`, `nom`, `prix_achat`, `prix_vente`, `poids`, `reference_fournisseur`, `actif`, `created_at`, `updated_at`) VALUES
	(1, 1, 'CLAV-CORSAIR-001', 'Corsair K70 RGB', 120.00, 180.00, NULL, 'COR-K70-RGB', 1, '2026-07-12 06:54:26', '2026-07-12 06:54:26'),
	(2, 2, 'ECR-DELL-001', 'Dell S2722QC 4K', 300.00, 350.00, NULL, 'DEL-S2722QC', 1, '2026-07-12 06:57:54', '2026-07-12 06:57:54');

/*!40103 SET TIME_ZONE=IFNULL(@OLD_TIME_ZONE, 'system') */;
/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IFNULL(@OLD_FOREIGN_KEY_CHECKS, 1) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40111 SET SQL_NOTES=IFNULL(@OLD_SQL_NOTES, 1) */;
