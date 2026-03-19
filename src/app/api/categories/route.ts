import pool from '@/lib/db';
import { RowDataPacket } from 'mysql2';
import { NextResponse } from 'next/server';

export async function GET() {
    try {
        const query = `
            SELECT 
                c.id,
                c.name,
                COUNT(r.id) as report_count
            FROM t_report_categories c
            LEFT JOIN t_reports r ON c.id = r.categoryId AND r.isActive = true
            GROUP BY c.id
            ORDER BY c.name
        `;

        const [rows] = await pool.execute<RowDataPacket[]>(query);

        return NextResponse.json({ categories: rows });
    } catch (error) {
        console.error('Error:', error);
        return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
    }
}