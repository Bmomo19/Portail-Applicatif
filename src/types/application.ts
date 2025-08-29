export interface Application {
  id: number;
  appname: string;
  applink: string;
  description: string;
  isactif?: boolean;
  usersaisie?: string;
  datsaisie?: Date;
  usermodif?: string;
  datmodif?: Date;
}