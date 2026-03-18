/* eslint-disable @typescript-eslint/no-explicit-any */
import pool from '@/lib/db';
import { RowDataPacket } from 'mysql2';
import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
    try {
        const query = 'SELECT rc.*, COUNT(r.id) as report_count FROM t_report_categories rc LEFT JOIN t_reports r ON rc.id = r.categoryId GROUP BY rc.id ORDER BY name';
        const [result] = await pool.execute<RowDataPacket[]>(query);
        return NextResponse.json({ categories: result });
    } catch (error) {
        return NextResponse.json({ error: 'Erreur serveur ' + error }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const { name } = await request.json();

        if (!name) {
            return NextResponse.json({ error: 'Le nom est requis' }, { status: 400 });
        }

        const result = await pool.execute(
            'INSERT INTO t_report_categories (name) VALUES (?) RETURNING *',
            [name]
        );

        return NextResponse.json({ category: result[0] }, { status: 201 });
    } catch (error: any) {
        if (error.code === '23505') {
            return NextResponse.json({ error: 'Cette catégorie existe déjà' }, { status: 400 });
        }
        return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
    }
}