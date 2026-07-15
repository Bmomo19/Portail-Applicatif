import fs from 'fs';
import { Readable } from 'stream';
import pool from '@/lib/db';
import { RowDataPacket } from 'mysql2';
import { NextRequest, NextResponse } from 'next/server';
import { ALLOWED_VIDEO_TYPES, resolveVideoPath } from '@/lib/campagneStorage';

// GET - Diffuse le fichier vidéo d'une campagne.
// Accès conditionné à la présence d'un `viewId` valide, obtenu via POST /api/campagnes/[id]/view
// (formulaire nom/prénom/email obligatoire avant visionnage). Ce n'est pas une authentification :
// un id de vue est un entier séquentiel, donc devinable — voir la documentation du projet.
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const viewId = request.nextUrl.searchParams.get('viewId');

        if (!viewId) {
            return NextResponse.json({ error: 'Accès refusé : formulaire de visionnage requis' }, { status: 403 });
        }

        const [viewRows] = await pool.execute<RowDataPacket[]>(
            'SELECT id FROM t_campagne_view WHERE id = ? AND videoId = ?',
            [viewId, id]
        );

        if (viewRows.length === 0) {
            return NextResponse.json({ error: 'Accès refusé : formulaire de visionnage requis' }, { status: 403 });
        }

        const [campagneRows] = await pool.execute<RowDataPacket[]>(
            'SELECT videoPath FROM t_campagne_com WHERE id = ?',
            [id]
        );

        if (campagneRows.length === 0) {
            return NextResponse.json({ error: 'Campagne non trouvée' }, { status: 404 });
        }

        const videoPath = resolveVideoPath(campagneRows[0].videoPath);

        let stat;
        try {
            stat = await fs.promises.stat(videoPath);
        } catch {
            return NextResponse.json({ error: 'Fichier vidéo introuvable' }, { status: 404 });
        }

        const ext = videoPath.slice(videoPath.lastIndexOf('.')).toLowerCase();
        const contentType = ALLOWED_VIDEO_TYPES[ext] || 'application/octet-stream';
        const range = request.headers.get('range');

        if (!range) {
            const stream = Readable.toWeb(fs.createReadStream(videoPath)) as unknown as ReadableStream;
            return new NextResponse(stream, {
                status: 200,
                headers: {
                    'Content-Type': contentType,
                    'Content-Length': String(stat.size),
                    'Accept-Ranges': 'bytes',
                },
            });
        }

        const match = /bytes=(\d*)-(\d*)/.exec(range);
        const start = match && match[1] ? parseInt(match[1], 10) : 0;
        const end = match && match[2] ? parseInt(match[2], 10) : stat.size - 1;
        const chunkSize = end - start + 1;

        const stream = Readable.toWeb(fs.createReadStream(videoPath, { start, end })) as unknown as ReadableStream;

        return new NextResponse(stream, {
            status: 206,
            headers: {
                'Content-Range': `bytes ${start}-${end}/${stat.size}`,
                'Accept-Ranges': 'bytes',
                'Content-Length': String(chunkSize),
                'Content-Type': contentType,
            },
        });
    } catch (error) {
        console.error('Erreur lors de la diffusion de la vidéo:', error);
        return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
    }
}
