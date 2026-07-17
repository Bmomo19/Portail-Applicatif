-- Permet à l'admin d'autoriser ou bloquer le téléchargement d'une vidéo (par campagne)
ALTER TABLE t_campagne_com
    ADD COLUMN telechargementAutorise TINYINT(1) NOT NULL DEFAULT 1 AFTER isactif;
