import { NextApiRequest, NextApiResponse } from 'next';
import { ResultSetHeader } from 'mysql2';
import { DemandeAssistance } from '@/types/assistance';
import pool from '@/lib/db';
import { generateAssistanceEmailHTML, sendEmail } from '@/lib/email';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }

  try {
    const demande: DemandeAssistance = req.body;

    // Validation des données
    if (!demande.type || !demande.nom || !demande.email || !demande.sujet || !demande.description) {
      return res.status(400).json({ error: 'Tous les champs obligatoires doivent être remplis' });
    }

    // Validation de l'email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(demande.email)) {
      return res.status(400).json({ error: 'Email invalide' });
    }

    // Enregistrement en base de données
    const query = `
      INSERT INTO t_demande_assistance 
      (type, nom, email, telephone, sujet, description, priorite, statut, date_creation)
      VALUES (?, ?, ?, ?, ?, ?, ?, 'nouveau', NOW())
    `;

    const [result] = await pool.execute<ResultSetHeader>(
      query,
      [
        demande.type,
        demande.nom,
        demande.email,
        demande.telephone || null,
        demande.sujet,
        demande.description,
        demande.priorite
      ]
    );

    const demandeId = result.insertId;

    // Envoi de l'email
    try {
      const emailHTML = generateAssistanceEmailHTML(demande);
      const emailSubject = `[${demande.type.toUpperCase()}] ${demande.sujet} - #${demandeId}`;
      
      await sendEmail({
        to: process.env.ASSISTANCE_EMAIL || process.env.SMTP_USER || '',
        subject: emailSubject,
        html: emailHTML,
      });

      // Email de confirmation à l'utilisateur
      const confirmationHTML = `
        <!DOCTYPE html>
        <html>
        <body style="font-family: Arial, sans-serif; padding: 20px;">
          <h2>Confirmation de votre demande #${demandeId}</h2>
          <p>Bonjour ${demande.nom},</p>
          <p>Nous avons bien reçu votre ${demande.type === 'assistance' ? 'demande d\'assistance' : 'déclaration d\'incident'}.</p>
          <p><strong>Sujet:</strong> ${demande.sujet}</p>
          <p><strong>Numéro de ticket:</strong> #${demandeId}</p>
          <p>Notre équipe traitera votre demande dans les plus brefs délais.</p>
          <p>Cordialement,<br>L'équipe du Portail Phoenix</p>
        </body>
        </html>
      `;

      await sendEmail({
        to: demande.email,
        subject: `Confirmation de votre demande #${demandeId}`,
        html: confirmationHTML,
      });
    } catch (emailError) {
      console.error('Erreur envoi email:', emailError);
      // On continue même si l'email échoue, la demande est enregistrée
    }

    res.status(201).json({
      success: true,
      message: 'Demande enregistrée avec succès',
      id: demandeId
    });
  } catch (error) {
    console.error('Erreur lors de la création de la demande:', error);
    res.status(500).json({
      error: 'Erreur lors de la création de la demande'
    });
  }
}