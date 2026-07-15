import pool from '@/lib/db';
import { RowDataPacket } from 'mysql2';
import { NextRequest, NextResponse } from 'next/server';

// GET - Détail d'une campagne (sans exposer le chemin du fichier vidéo)
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;

        const query = `
            SELECT id, titre, description, userSaisie, dateSaisie, userModif, dateModif
            FROM t_campagne_com
            WHERE id = ? AND (isactif = 1 OR isactif IS NULL)
        `;

        const [rows] = await pool.execute<RowDataPacket[]>(query, [id]);

        if (rows.length === 0) {
            return NextResponse.json({ error: 'Campagne non trouvée' }, { status: 404 });
        }

        return NextResponse.json({ campagne: rows[0] });
    } catch (error) {
        console.error('Erreur:', error);
        return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
    }
}
