import { Application } from "./application";

export interface DemandeAssistance {
  id?: number;
  type: 'assistance' | 'incident';
  nom: string;
  app: Application;
  sujet: string;
  description: string;
  priorite: 'basse' | 'normale' | 'haute' | 'urgente';
  statut?: string;
  datsaisie?: Date;
}