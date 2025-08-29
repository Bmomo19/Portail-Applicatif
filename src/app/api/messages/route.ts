import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { RowDataPacket } from "mysql2";
import { MessagePortail } from "@/types/message";

interface MessageRow extends RowDataPacket {
  id: number;
  contenu: string;
  isactif: boolean;
  datsaisie: Date;
  datmodif: Date;
}

export async function GET() {
  try {
    const query = `
      SELECT 
        id,
        contenu,
        isactif,
        datsaisie,
        datmodif
      FROM t_messagePortail 
      WHERE isactif = 1 OR isactif IS NULL
      ORDER BY datsaisie DESC
    `;

    const [rows] = await pool.execute<MessageRow[]>(query);

    const messages: MessagePortail[] = rows.map((row) => ({
      id: row.id,
      contenu: row.contenu,
      isactif: row.isactif,
      datsaisie: row.datsaisie,
      datmodif: row.datmodif,
    }));

    return NextResponse.json(messages, { status: 200 });
  } catch (error) {
    console.error("Erreur lors de la récupération des messages:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des messages" },
      { status: 500 }
    );
  }
}
