-- Un même visiteur (identifié par email) qui revoit une campagne ne crée plus une nouvelle ligne :
-- son compteur de vues (nbVue) est incrémenté et sa date de visionnage mise à jour.
ALTER TABLE t_campagne_view
    ADD COLUMN nbVue INT NOT NULL DEFAULT 1 AFTER email;
