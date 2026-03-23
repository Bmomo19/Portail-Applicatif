import pool from '@/lib/db';
import { RowDataPacket } from 'mysql2';
import { NextRequest, NextResponse } from 'next/server';

export async function PUT(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const { name } = await request.json();
        const { id } = await params;
        const [result] = await pool.execute<RowDataPacket[]>(
            'UPDATE t_report_categories SET name = ? WHERE id = ? RETURNING *',
            [name, id]
        );

        if (result.length === 0) {
            return NextResponse.json({ error: 'Catégorie non trouvée' }, { status: 404 });
        }

        return NextResponse.json({ category: result });
    } catch (error) {
        return NextResponse.json({ error: 'Erreur serveur ' + error }, { status: 500 });
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const { id } = await params;
        // Vérifier s'il y a des rapports dans cette catégorie
        const [checkResult] = await pool.execute<RowDataPacket[]>(
            'SELECT COUNT(*) as count FROM t_reports WHERE categoryId = ?',
            [id]
        );

        if (parseInt(checkResult[0].count) > 0) {
            return NextResponse.json(
                { error: 'Impossible de supprimer une catégorie contenant des rapports' },
                { status: 400 }
            );
        }

        const [result] = await pool.execute<RowDataPacket[]>(
            'DELETE FROM t_report_categories WHERE id = ? RETURNING id',
            [params.id]
        );

        if (result.length === 0) {
            return NextResponse.json({ error: 'Catégorie non trouvée' }, { status: 404 });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: 'Erreur serveur ' + error }, { status: 500 });
    }
}