import fs from 'fs';
import path from 'path';
import { randomUUID } from 'crypto';
import pool from '@/lib/db';
import { ResultSetHeader, RowDataPacket } from 'mysql2';
import { NextRequest, NextResponse } from 'next/server';
import { ALLOWED_VIDEO_TYPES, MAX_VIDEO_SIZE, VIDEO_DIR } from '@/lib/campagneStorage';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// GET - Liste de toutes les campagnes, actives ou non (admin)
export async function GET() {
    try {
        const query = `
            SELECT
                c.id,
                c.titre,
                c.description,
                c.isactif,
                c.telechargementAutorise,
                c.userSaisie,
                c.dateSaisie,
                c.userModif,
                c.dateModif,
                CAST(COALESCE(SUM(v.nbVue), 0) AS UNSIGNED) as viewCount
            FROM t_campagne_com c
            LEFT JOIN t_campagne_view v ON v.videoId = c.id
            GROUP BY c.id
            ORDER BY c.dateSaisie DESC
        `;

        const [rows] = await pool.execute<RowDataPacket[]>(query);

        // MySQL renvoie les TINYINT comme des nombres (0/1) : on les convertit
        // en booléens JS pour correspondre au type Campagne.
        const campagnes = rows.map((row) => ({
            ...row,
            isactif: Boolean(row.isactif),
            telechargementAutorise: Boolean(row.telechargementAutorise),
        }));

        return NextResponse.json({ campagnes });
    } catch (error) {
        console.error('Erreur lors de la récupération des campagnes:', error);
        return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
    }
}

// POST - Ajouter une campagne (admin, sans authentification : l'email est saisi manuellement)
export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();

        const titre = (formData.get('titre') as string | null)?.trim();
        const description = (formData.get('description') as string | null)?.trim() || null;
        const userSaisie = (formData.get('userSaisie') as string | null)?.trim();
        const video = formData.get('video') as File | null;

        if (!titre || !userSaisie || !video) {
            return NextResponse.json(
                { error: 'Titre, email et vidéo sont requis' },
                { status: 400 }
            );
        }

        if (!EMAIL_REGEX.test(userSaisie)) {
            return NextResponse.json({ error: 'Adresse email invalide' }, { status: 400 });
        }

        const ext = path.extname(video.name).toLowerCase();
        if (!ALLOWED_VIDEO_TYPES[ext]) {
            return NextResponse.json(
                { error: `Format vidéo non supporté. Formats acceptés : ${Object.keys(ALLOWED_VIDEO_TYPES).join(', ')}` },
                { status: 400 }
            );
        }

        if (video.size > MAX_VIDEO_SIZE) {
            return NextResponse.json(
                { error: `La vidéo dépasse la taille maximale autorisée (${MAX_VIDEO_SIZE / (1024 * 1024)} Mo)` },
                { status: 400 }
            );
        }

        await fs.promises.mkdir(VIDEO_DIR, { recursive: true });

        const fileName = `${Date.now()}-${randomUUID()}${ext}`;
        const filePath = path.join(VIDEO_DIR, fileName);
        const buffer = Buffer.from(await video.arrayBuffer());
        await fs.promises.writeFile(filePath, buffer);

        const query = `
            INSERT INTO t_campagne_com (titre, description, videoPath, userSaisie, dateSaisie)
            VALUES (?, ?, ?, ?, NOW())
        `;
        const [result] = await pool.execute<ResultSetHeader>(query, [titre, description, fileName, userSaisie]);

        return NextResponse.json({ id: result.insertId }, { status: 201 });
    } catch (error) {
        console.error('Erreur lors de la création de la campagne:', error);
        return NextResponse.json({ error: 'Erreur lors de la création de la campagne' }, { status: 500 });
    }
}
