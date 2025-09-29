export interface DemandeAssistance {
  id?: number;
  type: 'assistance' | 'incident';
  nom: string;
  email: string;
  telephone?: string;
  sujet: string;
  description: string;
  priorite: 'basse' | 'normale' | 'haute' | 'urgente';
  statut?: string;
  date_creation?: Date;
}