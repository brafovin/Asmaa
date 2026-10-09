// Gemeinsame Typen: werden vom Server UND von der Oberfläche benutzt.

export type AuftragStatus =
  | 'neu'
  | 'in_bearbeitung'
  | 'versandbereit'
  | 'unterwegs'
  | 'geliefert'
  | 'storniert';

export const AUFTRAG_STATUS_LABEL: Record<AuftragStatus, string> = {
  neu: 'Neu',
  in_bearbeitung: 'In Bearbeitung',
  versandbereit: 'Versandbereit',
  unterwegs: 'Unterwegs',
  geliefert: 'Geliefert',
  storniert: 'Storniert',
};

export type FahrzeugStatus = 'verfuegbar' | 'im_einsatz' | 'werkstatt';

export type TourStatus = 'geplant' | 'unterwegs' | 'abgeschlossen';

export type WarnStufe = 'kritisch' | 'warnung' | 'info';

export interface Kennzahlen {
  auftraegeHeute: number;
  auftraegeGestern: number;
  offeneAuftraege: number;
  unterwegs: number;
  umsatz30Tage: number;
  umsatzVorperiode: number;
  puenktlichkeit: number | null; // Prozent, null = noch keine Daten
  fahrzeugeVerfuegbar: number;
  fahrzeugeGesamt: number;
}

export interface TagesWert {
  datum: string; // YYYY-MM-DD
  anzahl: number;
}

export interface StatusAnzahl {
  status: AuftragStatus;
  anzahl: number;
}

export interface Warnung {
  id: string;
  stufe: WarnStufe;
  titel: string;
  text: string;
  link: string;
}

export interface AuftragKurz {
  id: number;
  nummer: string;
  kunde: string;
  zielOrt: string;
  status: AuftragStatus;
  gesamtwert: number;
  liefertermin: string;
}

export interface TourKurz {
  id: number;
  bezeichnung: string;
  status: TourStatus;
  fahrer: string;
  kennzeichen: string;
  stopps: number;
  datum: string;
}

export interface DashboardDaten {
  erstelltAm: string;
  kennzahlen: Kennzahlen;
  auftraegeProTag: TagesWert[];
  statusVerteilung: StatusAnzahl[];
  warnungen: Warnung[];
  letzteAuftraege: AuftragKurz[];
  aktiveTouren: TourKurz[];
}
