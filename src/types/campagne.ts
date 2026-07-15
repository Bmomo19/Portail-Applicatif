export interface Campagne {
  id: number;
  titre: string;
  description: string | null;
  userSaisie?: string | null;
  dateSaisie?: Date;
  userModif?: string | null;
  dateModif?: Date | null;
  viewCount?: number;
}

export interface CampagneView {
  id?: number;
  videoId: number;
  nomPrenom: string;
  email: string;
  dateView?: Date;
}
