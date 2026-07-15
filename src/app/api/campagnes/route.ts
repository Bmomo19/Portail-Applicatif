import pool from '@/lib/db';
import { RowDataPacket } from 'mysql2';
import { NextResponse } from 'next/server';

// GET - Liste des campagnes actives (espace public)
export async function GET() {
    try {
        const query = `
            SELECT
                c.id,
                c.titre,
                c.description,
                c.userSaisie,
                c.dateSaisie,
                c.userModif,
                c.dateModif,
                COUNT(v.id) as viewCount
            FROM t_campagne_com c
            LEFT JOIN t_campagne_view v ON v.videoId = c.id
            WHERE c.isactif = 1 OR c.isactif IS NULL
            GROUP BY c.id
            ORDER BY c.dateSaisie DESC
        `;

        const [rows] = await pool.execute<RowDataPacket[]>(query);

        return NextResponse.json({ campagnes: rows });
    } catch (error) {
        console.error('Erreur lors de la récupération des campagnes:', error);
        return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
    }
}
