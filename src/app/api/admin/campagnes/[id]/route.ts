import pool from '@/lib/db';
import { ResultSetHeader } from 'mysql2';
import { NextRequest, NextResponse } from 'next/server';

// PUT - Met à jour l'état d'une campagne (isactif et/ou telechargementAutorise)
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const body = await request.json();

        const fields: string[] = [];
        const values: number[] = [];

        if (typeof body.isactif === 'boolean') {
            fields.push('isactif = ?');
            values.push(body.isactif ? 1 : 0);
        }

        if (typeof body.telechargementAutorise === 'boolean') {
            fields.push('telechargementAutorise = ?');
            values.push(body.telechargementAutorise ? 1 : 0);
        }

        if (fields.length === 0) {
            return NextResponse.json(
                { error: 'isactif et/ou telechargementAutorise (booléen) sont requis' },
                { status: 400 }
            );
        }

        const [result] = await pool.execute<ResultSetHeader>(
            `UPDATE t_campagne_com SET ${fields.join(', ')} WHERE id = ?`,
            [...values, id]
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
