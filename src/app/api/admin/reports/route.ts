/* eslint-disable @typescript-eslint/no-explicit-any */
import pool from '@/lib/db';
import { ResultSetHeader, RowDataPacket } from 'mysql2';
import { NextRequest, NextResponse } from 'next/server';

// GET - Liste tous les rapports (même inactifs)
export async function GET() {
    try {
        const query = `
            SELECT 
                r.id,
                r.title,
                r.description,
                r.categoryId,
                r.jasperUrl,
                r.isActive,
                c.name as category_name
            FROM t_reports r
            LEFT JOIN t_report_categories c ON r.categoryId = c.id
            ORDER BY r.title
        `;

        const [result] = await pool.execute<RowDataPacket[]>(query);

        return NextResponse.json({ reports: result });
    } catch (error) {
        console.error('Error:', error);
        return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
    }
}

// POST - Créer un nouveau rapport
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { title, description, categoryId, jasperUrl } = body;

        // Validation
        if (!title || !jasperUrl) {
            return NextResponse.json(
                { error: 'Titre et URL JasperServer sont requis' },
                { status: 400 }
            );
        }

        const query = `
                INSERT INTO t_reports (title, description, categoryId, jasperUrl)
                VALUES (?, ?, ?, ?)
            `;

        const [result] = await pool.execute<ResultSetHeader>(query, [title, description || null, categoryId || null, jasperUrl]);

        return NextResponse.json({ report: result }, { status: 201 });
    } catch (error: any) {
        console.error('Error:', error);
        return NextResponse.json(
            { error: error.message || 'Erreur lors de la création' },
            { status: 500 }
        );
    }
}