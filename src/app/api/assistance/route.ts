import { NextResponse } from "next/server";
import { ResultSetHeader } from "mysql2";
import pool from "@/lib/db";
import { DemandeAssistance } from "@/types/assistance";
import { generateAssistanceEmailHTML, sendEmail } from "@/lib/email";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const demande: DemandeAssistance = body;

    // ✅ Validation des champs obligatoires
    if (
      !demande.type ||
      !demande.nom ||
      !demande.app ||
      !demande.sujet ||
      !demande.description
    ) {
      return NextResponse.json(
        { error: "Tous les champs obligatoires doivent être remplis" },
        { status: 400 }
      );
    }

    // ✅ Insertion en base
    const query = `
      INSERT INTO t_demande_assistance 
      (type, nom, app, sujet, description, priorite, statut, datsaisie)
      VALUES (?, ?, ?, ?, ?, ?, 'nouveau', NOW())
    `;

    const [result] = await pool.execute<ResultSetHeader>(query, [
      demande.type,
      demande.nom,
      JSON.stringify(demande.app),
      demande.sujet,
      demande.description,
      demande.priorite || "moyenne",
    ]);

    const demandeId = result.insertId;

    // ✅ Envoi des emails
    try {
      const emailHTML = generateAssistanceEmailHTML(demande);
      const emailSubject = `[${demande.type.toUpperCase()}] ${demande.sujet
        } - #${demandeId}`;

      // Envoi au support
      await sendEmail({
        to: process.env.ASSISTANCE_EMAIL || process.env.SMTP_USER || "",
        subject: emailSubject,
        html: emailHTML,
      });

      // Envoi confirmation au client (si email fourni)
      if (demande.app) {
        const confirmationHTML = `
          <!DOCTYPE html>
          <html>
          <body style="font-family: Arial, sans-serif; padding: 20px;">
            <h2>Confirmation de votre demande #${demandeId}</h2>
            <p>Bonjour ${demande.nom},</p>
            <p>Nous avons bien reçu votre ${demande.type === "assistance"
            ? "demande d'assistance"
            : "déclaration d'incident"
          }.</p>
            <p><strong>Sujet:</strong> ${demande.sujet}</p>
            <p><strong>Numéro de ticket:</strong> #${demandeId}</p>
            <p>Notre équipe traitera votre demande dans les plus brefs délais.</p>
            <p>Cordialement,<br>L'équipe du Portail Phoenix</p>
          </body>
          </html>
        `;

        await sendEmail({
          to: 'bouraima224@protonmail.com',
          subject: `Confirmation de votre demande #${demandeId}`,
          html: confirmationHTML,
        });
      }
    } catch (emailError) {
      console.error("Erreur envoi email:", emailError);
      // On n'échoue pas si email raté, car la demande est enregistrée
    }

    return NextResponse.json(
      {
        success: true,
        message: "Demande enregistrée avec succès",
        id: demandeId,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Erreur lors de la création de la demande:", error);
    return NextResponse.json(
      { error: "Erreur lors de la création de la demande" },
      { status: 500 }
    );
  }
}

// (Optionnel) Refus explicite des autres méthodes
export async function GET() {
  return NextResponse.json(
    { error: "Method GET Not Allowed" },
    { status: 405, headers: { Allow: "POST" } }
  );
}
