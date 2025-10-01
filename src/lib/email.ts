import { DemandeAssistance } from '@/types/assistance';
import nodemailer from 'nodemailer';

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail({ to, subject, html }: EmailOptions) {
  // Configuration du transporteur d'email
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD,
    },
  });

  try {
    const info = await transporter.sendMail({
      from: `"${process.env.SMTP_FROM_NAME || 'Portail Phoenix'}" <${process.env.SMTP_USER}>`,
      to,
      subject,
      html,
    });

    console.log('Email envoyé:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Erreur envoi email:', error);
    throw error;
  }
}

export function generateAssistanceEmailHTML(demande: DemandeAssistance): string {
  const prioriteColors = {
    basse: '#10B981',
    normale: '#3B82F6',
    haute: '#F59E0B',
    urgente: '#EF4444'
  };

  const typeLabels = {
    assistance: 'Demande d\'assistance',
    incident: 'Déclaration d\'incident'
  };

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 10px 10px 0 0; }
        .content { background: #f9fafb; padding: 30px; border: 1px solid #e5e7eb; }
        .info-row { margin: 15px 0; padding: 10px; background: white; border-radius: 5px; }
        .label { font-weight: bold; color: #6b7280; display: inline-block; width: 120px; }
        .priority { display: inline-block; padding: 5px 15px; border-radius: 20px; color: white; font-weight: bold; }
        .footer { background: #374151; color: white; padding: 20px; text-align: center; border-radius: 0 0 10px 10px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1 style="margin: 0;">${typeLabels[demande.type]}</h1>
          <p style="margin: 10px 0 0 0; opacity: 0.9;">Portail Applicatif Phoenix</p>
        </div>
        <div class="content">
          <div class="info-row">
            <span class="label">Type:</span>
            <strong>${typeLabels[demande.type]}</strong>
          </div>
          <div class="info-row">
            <span class="label">Priorité:</span>
            <span class="priority" style="background-color: ${prioriteColors[demande.priorite]}">
              ${demande.priorite.toUpperCase()}
            </span>
          </div>
          <div class="info-row">
            <span class="label">Nom:</span>
            ${demande.nom}
          </div>
          <div class="info-row">
            <span class="label">Application concernée:</span>
            <a href="${demande.app.applink}">${demande.app.appname}</a>
          </div>
          
          <div class="info-row">
            <span class="label">Sujet:</span>
            <strong>${demande.sujet}</strong>
          </div>
          <div class="info-row">
            <span class="label">Description:</span>
            <p style="margin: 10px 0; white-space: pre-wrap;">${demande.description}</p>
          </div>
        </div>
        <div class="footer">
          <p style="margin: 0;">Ce message a été envoyé automatiquement depuis le Portail Phoenix</p>
          <p style="margin: 5px 0 0 0; font-size: 12px; opacity: 0.8;">
            Date: ${new Date().toLocaleString('fr-FR')}
          </p>
        </div>
      </div>
    </body>
    </html>
  `;
}