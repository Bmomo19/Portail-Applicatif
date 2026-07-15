-- Permet à l'admin de désactiver une campagne vidéo (masquée du portail public sans être supprimée)
ALTER TABLE t_campagne_com
    ADD COLUMN isactif TINYINT(1) NOT NULL DEFAULT 1 AFTER videoPath;
