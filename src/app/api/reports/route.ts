export const dynamic = 'force-dynamic';
import pool from '@/lib/db';
import { RowDataPacket } from 'mysql2';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    try {
        const categoryId = request.nextUrl.searchParams.get('categoryId');

        let query = `
            SELECT 
                r.id,
                r.title,
                r.description,
                r.categoryId,
                r.jasperUrl,
                c.name as category_name
            FROM t_reports r
            LEFT JOIN t_report_categories c ON r.categoryId = c.id
            WHERE r.is_active = true
        `;

        const params: number[] = [];

        if (categoryId) {
            params.push(parseInt(categoryId));
            query += ` AND r.categoryId = ?`;
        }

        query += ` ORDER BY r.title`;

        const [rows] = await pool.execute<RowDataPacket[]>(query, params);

        return NextResponse.json({ reports: rows });
    } catch (error) {
        console.error('Error:', error);
        return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
    }
}