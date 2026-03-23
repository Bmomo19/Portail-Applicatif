/* eslint-disable @typescript-eslint/no-explicit-any */
import pool from '@/lib/db';
import { RowDataPacket } from 'mysql2';
import { NextRequest, NextResponse } from 'next/server';

// PUT - Mettre à jour un rapport
export async function PUT(request: NextRequest, props: { params: Promise<{ id: string }> }) {
    try {
        const body = await request.json();
        const params = await props.params;
        const { title, description, category_id, jasper_url, display_order, isActive } = body;

        // Validation
        if (!title || !jasper_url) {
            return NextResponse.json(
                { error: 'Titre et URL JasperServer sont requis' },
                { status: 400 }
            );
        }

        const query = `
            UPDATE t_reports
            SET 
                title = ?,
                description = ?,
                category_id = ?,
                jasper_url = ?,
                display_order = ?,
                isActive = COALESCE(?, isActive)
            WHERE id = ?
            RETURNING *
        `;

        const [result] = await pool.execute<RowDataPacket[]>(query, [
            title,
            description || null,
            category_id || null,
            jasper_url,
            display_order || 0,
            isActive,
            params.id,
        ]);

        if (result.length === 0) {
            return NextResponse.json({ error: 'Rapport non trouvé' }, { status: 404 });
        }

        return NextResponse.json({ report: result });
    } catch (error: any) {
        console.error('Error:', error);
        return NextResponse.json(
            { error: error.message || 'Erreur lors de la mise à jour' },
            { status: 500 }
        );
    }
}

// DELETE - Supprimer un rapport
export async function DELETE(request: NextRequest, props: { params: Promise<{ id: string }> }) {
    try {
        const params = await props.params;
        const query = 'DELETE FROM t_reports WHERE id = ?';

        const [result] = await pool.execute<RowDataPacket[]>(query, [params.id]);

        if (result.length === 0) {
            return NextResponse.json({ error: 'Rapport non trouvé' }, { status: 404 });
        }

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('Error:', error);
        return NextResponse.json(
            { error: error.message || 'Erreur lors de la suppression' },
            { status: 500 }
        );
    }
}