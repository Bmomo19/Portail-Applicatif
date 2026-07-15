-- Espace Campagnes : campagnes vidéo diffusées sur le portail
-- Chaque campagne est uploadée par un admin (pas d'authentification, l'email est saisi manuellement)
-- Chaque visionnage nécessite la saisie préalable du nom/prénom/email du visiteur

CREATE TABLE IF NOT EXISTS t_campagne_com (
    id INT AUTO_INCREMENT PRIMARY KEY,
    titre VARCHAR(255) NOT NULL,
    description TEXT NULL,
    videoPath VARCHAR(500) NOT NULL,
    userSaisie VARCHAR(255) NULL,
    dateSaisie DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    userModif VARCHAR(255) NULL,
    dateModif DATETIME NULL ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS t_campagne_view (
    id INT AUTO_INCREMENT PRIMARY KEY,
    videoId INT NOT NULL,
    nomPrenom VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    dateView DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_campagne_view_video
        FOREIGN KEY (videoId) REFERENCES t_campagne_com(id) ON DELETE CASCADE,
    INDEX idx_campagne_view_videoId (videoId)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
