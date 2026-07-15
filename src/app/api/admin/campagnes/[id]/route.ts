import pool from '@/lib/db';
import { ResultSetHeader } from 'mysql2';
import { NextRequest, NextResponse } from 'next/server';

// PUT - Active/désactive une campagne (masque/affiche du portail public sans la supprimer)
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const body = await request.json();

        if (typeof body.isactif !== 'boolean') {
            return NextResponse.json({ error: 'isactif (booléen) est requis' }, { status: 400 });
        }

        const [result] = await pool.execute<ResultSetHeader>(
            'UPDATE t_campagne_com SET isactif = ? WHERE id = ?',
            [body.isactif ? 1 : 0, id]
        );

        if (result.affectedRows === 0) {
            return NextResponse.json({ error: 'Campagne non trouvée' }, { status: 404 });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Erreur lors de la mise à jour de la campagne:', error);
        return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
    }
}
