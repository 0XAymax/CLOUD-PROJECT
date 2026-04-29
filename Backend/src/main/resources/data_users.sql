-- Script SQL pour insérer des utilisateurs : Admin (Employé), Analyste (Employé) et Investisseur
-- Note: Les RÔLES sont uniquement pour les EMPLOYÉS, pas pour les Investisseurs
-- Avec mots de passe hashés (BCrypt) : tous utilisent le mot de passe "password123"
-- Hash BCrypt valide de "password123" : $2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy

-- ===============================================
-- 1. INSERTION DES RÔLES (pour les Employés uniquement)
-- ===============================================

-- Supprimer les rôles existants si nécessaire (optionnel)
-- DELETE FROM Role WHERE name_role IN ('ADMIN', 'ANALYST', 'VENDEUR', 'CLIENT');

-- Insertion des rôles pour les employés
INSERT INTO Role (name_role, description) VALUES 
('ADMIN', 'Administrateur système avec tous les privilèges'),
('ANALYST', 'Analyste de données avec accès aux rapports et ETL'),
('VENDEUR', 'Vendeur avec accès à la gestion des ventes et produits')
ON DUPLICATE KEY UPDATE description = VALUES(description);

-- ===============================================
-- 2. INSERTION DES PERSONNES (Table parent)
-- ===============================================

-- Admin (Employé)
INSERT INTO Personne (nom, prenom, numero_tel, email, address, photo_url, password) 
VALUES (
    'Martin',
    'Sophie',
    '+212 6 12 34 56 78',
    'admin@gestionventes.com',
    '123 Avenue Mohammed V, Casablanca',
    'https://ui-avatars.com/api/?name=Sophie+Martin&background=3b82f6&color=fff',
    '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy'
);

-- Analyste (Employé)
INSERT INTO Personne (nom, prenom, numero_tel, email, address, photo_url, password) 
VALUES (
    'Dupont',
    'Jean',
    '+212 6 98 76 54 32',
    'analyste@gestionventes.com',
    '456 Boulevard Zerktouni, Casablanca',
    'https://ui-avatars.com/api/?name=Jean+Dupont&background=10b981&color=fff',
    '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy'
);

-- Investisseur (PAS un employé, donc PAS de rôle)
INSERT INTO Personne (nom, prenom, numero_tel, email, address, photo_url, password) 
VALUES (
    'Benali',
    'Karim',
    '+212 6 55 44 33 22',
    'investisseur@gestionventes.com',
    '789 Rue Prince Héritier, Rabat',
    'https://ui-avatars.com/api/?name=Karim+Benali&background=f59e0b&color=fff',
    '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy'
);

-- ===============================================
-- 3. INSERTION DES EMPLOYÉS (Admin et Analyste)
-- ===============================================

-- Récupérer les IDs des personnes et rôles
SET @admin_person_id = (SELECT id FROM Personne WHERE email = 'admin@gestionventes.com');
SET @analyst_person_id = (SELECT id FROM Personne WHERE email = 'analyste@gestionventes.com');
SET @admin_role_id = (SELECT id_role FROM Role WHERE name_role = 'ADMIN');
SET @analyst_role_id = (SELECT id_role FROM Role WHERE name_role = 'ANALYST');

-- Insertion Employé Admin
INSERT INTO Employe (id_employe, id_role, salaire, etat, id_admin) 
VALUES (
    @admin_person_id,
    @admin_role_id,
    15000.00,
    'ACTIF',
    NULL
);

-- Insertion Employé Analyste
INSERT INTO Employe (id_employe, id_role, salaire, etat, id_admin) 
VALUES (
    @analyst_person_id,
    @analyst_role_id,
    12000.00,
    'ACTIF',
    @admin_person_id
);

-- ===============================================
-- 4. INSERTION DE L'INVESTISSEUR
-- ===============================================

SET @investisseur_person_id = (SELECT id FROM Personne WHERE email = 'investisseur@gestionventes.com');

INSERT INTO Investisseur (
    id_investisseur, 
    ice, 
    nom_entreprise, 
    adresse_entreprise, 
    numero_entreprise, 
    email_entreprise, 
    logo_url, 
    domaine_entreprise, 
    capital_disponible
) VALUES (
    @investisseur_person_id,
    'ICE123456789',
    'Benali Investment Group',
    '789 Rue Prince Héritier, Rabat',
    '+212 5 37 12 34 56',
    'contact@benaligroup.ma',
    'https://ui-avatars.com/api/?name=BIG&background=f59e0b&color=fff&bold=true',
    'Finance et Investissement',
    5000000.00
);

-- ===============================================
-- 5. VÉRIFICATION DES DONNÉES INSÉRÉES
-- ===============================================

-- Afficher tous les employés avec leurs rôles
SELECT 
    p.id,
    p.nom,
    p.prenom,
    p.email,
    r.name_role AS role,
    e.salaire,
    e.etat
FROM 
    Employe e
    INNER JOIN Personne p ON e.id_employe = p.id
    INNER JOIN Role r ON e.id_role = r.id_role
ORDER BY 
    p.id;

-- Afficher les investisseurs
SELECT 
    p.id,
    p.nom,
    p.prenom,
    p.email,
    i.nom_entreprise,
    i.capital_disponible
FROM 
    Investisseur i
    INNER JOIN Personne p ON i.id_investisseur = p.id;

-- ===============================================
-- INFORMATIONS DE CONNEXION
-- ===============================================
-- Admin (Employé):
--   Email: admin@gestionventes.com
--   Mot de passe: password123
--   Rôle: ADMIN
--   Type: Employé
--
-- Analyste (Employé):
--   Email: analyste@gestionventes.com
--   Mot de passe: password123
--   Rôle: ANALYST
--   Type: Employé
--
-- Investisseur:
--   Email: investisseur@gestionventes.com
--   Mot de passe: password123
--   Type: Investisseur (pas de rôle, ce n'est pas un employé)
-- ===============================================

-- Note: Le hash BCrypt ci-dessus est un exemple. 
-- Pour générer un vrai hash BCrypt de "password123", utilisez:
-- https://bcrypt-generator.com/ avec 10 rounds
-- Ou en Java: BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
--             String hash = encoder.encode("password123");
