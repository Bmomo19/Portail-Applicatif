import pool from '@/lib/db';
import { ResultSetHeader, RowDataPacket } from 'mysql2';
import { NextRequest, NextResponse } from 'next/server';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// POST - Enregistre l'identité du visiteur avant de lui donner accès à la vidéo
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const body = await request.json();
        const nomPrenom = (body.nomPrenom as string | undefined)?.trim();
        const email = (body.email as string | undefined)?.trim();

        if (!nomPrenom || !email) {
            return NextResponse.json({ error: 'Nom, prénom et email sont requis' }, { status: 400 });
        }

        if (!EMAIL_REGEX.test(email)) {
            return NextResponse.json({ error: 'Adresse email invalide' }, { status: 400 });
        }

        const [campagneRows] = await pool.execute<RowDataPacket[]>(
            'SELECT id, isactif FROM t_campagne_com WHERE id = ?',
            [id]
        );

        if (campagneRows.length === 0 || campagneRows[0].isactif === 0) {
            return NextResponse.json({ error: 'Campagne non trouvée' }, { status: 404 });
        }

        const emailNormalized = email.toLowerCase();

        // Un même email qui revoit une vidéo n'ajoute pas de ligne : on incrémente son compteur
        const [existingRows] = await pool.execute<RowDataPacket[]>(
            'SELECT id FROM t_campagne_view WHERE videoId = ? AND email = ?',
            [id, emailNormalized]
        );

        let viewId: number;

        if (existingRows.length > 0) {
            viewId = existingRows[0].id;
            await pool.execute(
                'UPDATE t_campagne_view SET nbVue = nbVue + 1, nomPrenom = ?, dateView = NOW() WHERE id = ?',
                [nomPrenom, viewId]
            );
        } else {
            const [result] = await pool.execute<ResultSetHeader>(
                'INSERT INTO t_campagne_view (videoId, nomPrenom, email, dateView) VALUES (?, ?, ?, NOW())',
                [id, nomPrenom, emailNormalized]
            );
            viewId = result.insertId;
        }

        return NextResponse.json({ viewId }, { status: 201 });
    } catch (error) {
        console.error('Erreur lors de l\'enregistrement de la vue:', error);
        return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
    }
}
