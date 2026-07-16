import pool from '@/lib/db';
import { RowDataPacket } from 'mysql2';
import { NextRequest, NextResponse } from 'next/server';

// GET - Liste des personnes ayant visionné une campagne (admin)
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;

        const [campagneRows] = await pool.execute<RowDataPacket[]>(
            'SELECT id, titre FROM t_campagne_com WHERE id = ?',
            [id]
        );

        if (campagneRows.length === 0) {
            return NextResponse.json({ error: 'Campagne non trouvée' }, { status: 404 });
        }

        const [views] = await pool.execute<RowDataPacket[]>(
            'SELECT id, nomPrenom, email, nbVue, dateView FROM t_campagne_view WHERE videoId = ? ORDER BY dateView DESC',
            [id]
        );

        return NextResponse.json({ campagne: campagneRows[0], views });
    } catch (error) {
        console.error('Erreur lors de la récupération des visionnages:', error);
        return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
    }
}
