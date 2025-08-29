import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { Application } from "@/types/application";
import { RowDataPacket } from "mysql2";

interface ApplicationRow extends RowDataPacket {
  id: number;
  appname: string;
  applink: string;
  description: string;
  isactif: boolean;
  usersaisie?: string;
  datsaisie?: Date;
  usermodif?: string;
  datmodif?: Date;
}

export async function GET() {
  try {
    const query = `
      SELECT *
      FROM t_application 
      WHERE isactif = 1 OR isactif IS NULL
      ORDER BY appname ASC
    `;

    const [rows] = await pool.execute<ApplicationRow[]>(query);

    const applications: Application[] = rows.map((row) => ({
      id: row.id,
      appname: row.appname,
      applink: row.applink,
      description: row.description,
      isactif: row.isactif,
      usersaisie: row.usersaisie,
      datsaisie: row.datsaisie,
      usermodif: row.usermodif,
      datmodif: row.datmodif,
    }));

    return NextResponse.json(applications);
  } catch (error) {
    console.error("Erreur lors de la récupération des applications:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des applications" },
      { status: 500 }
    );
  }
}
