export const dynamic = 'force-dynamic';
import pool from '@/lib/db';
import { RowDataPacket } from 'mysql2';
import { NextResponse } from 'next/server';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        console.log(id);
        const query = `
            SELECT 
                r.*,
                c.name as category_name        
            FROM t_reports r
            LEFT JOIN t_report_categories c ON r.categoryId = c.id
            WHERE r.id = ? AND r.is_active = true
        `;


        const [rows] = await pool.execute<RowDataPacket[]>(query, [id]);

        if (rows.length === 0) {
            return NextResponse.json(
                { error: 'Rapport non trouvé' },
                { status: 404 }
            );
        }

        return NextResponse.json({ report: rows[0] });
    } catch (error) {
        console.error('Error:', error);
        return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
    }
}