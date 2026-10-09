import {
  ChartColumn,
  ClipboardList,
  LayoutDashboard,
  Settings,
  ShoppingCart,
  Truck,
  Undo2,
  Users,
  Wallet,
  Warehouse,
  UserRound,
  type LucideIcon,
} from 'lucide-react';

export interface NavEintrag {
  pfad: string;
  name: string;
  icon: LucideIcon;
  fertig: boolean;
  beschreibung: string;
  funktionen: string[];
}

export interface NavGruppe {
  titel: string;
  eintraege: NavEintrag[];
}

export const NAVIGATION: NavGruppe[] = [
  {
    titel: 'Übersicht',
    eintraege: [
      { pfad: '/', name: 'Dashboard', icon: LayoutDashboard, fertig: true, beschreibung: 'Alle wichtigen Kennzahlen auf einen Blick.', funktionen: [] },
    ],
  },
  {
    titel: 'Betrieb',
    eintraege: [
      {
        pfad: '/auftraege', name: 'Aufträge', icon: ClipboardList, fertig: false,
        beschreibung: 'Aufträge erfassen, bearbeiten und verfolgen.',
        funktionen: ['Aufträge erstellen, bearbeiten und löschen', 'Positionen mit Artikeln aus dem Lager', 'Statusverlauf von „Neu“ bis „Geliefert“', 'Suche und Filter nach Kunde, Status und Datum'],
      },
      {
        pfad: '/lager', name: 'Lager', icon: Warehouse, fertig: false,
        beschreibung: 'Artikel, Bestände und Lagerplätze verwalten.',
        funktionen: ['Artikelstamm mit Lagerplätzen', 'Wareneingang und Warenausgang', 'Automatische Bestandsführung beim Versand', 'Mindestbestände und Nachbestellvorschläge'],
      },
      {
        pfad: '/transport', name: 'Transport', icon: Truck, fertig: false,
        beschreibung: 'Fahrzeuge, Fahrer und Liefertouren planen.',
        funktionen: ['Fahrzeug- und Fahrerverwaltung', 'Touren planen und Aufträge zuweisen', 'Zugewiesene Fahrzeuge gelten nicht mehr als frei', 'TÜV- und Wartungstermine'],
      },
    ],
  },
  {
    titel: 'Partner',
    eintraege: [
      {
        pfad: '/kunden', name: 'Kunden', icon: UserRound, fertig: false,
        beschreibung: 'Kunden verwalten und Sendungen verfolgen.',
        funktionen: ['Kundenstamm mit Kontaktdaten', 'Sendungsverfolgung mit Statusverlauf', 'Auftragshistorie je Kunde'],
      },
      {
        pfad: '/einkauf', name: 'Einkauf', icon: ShoppingCart, fertig: false,
        beschreibung: 'Lieferanten und Bestellungen im Griff.',
        funktionen: ['Lieferantenstamm', 'Bestellungen anlegen und Wareneingang buchen', 'Automatische Bestandserhöhung beim Wareneingang'],
      },
      {
        pfad: '/retouren', name: 'Retouren', icon: Undo2, fertig: false,
        beschreibung: 'Rücksendungen und Beschwerden bearbeiten.',
        funktionen: ['Retouren zu Aufträgen erfassen', 'Reklamationen mit Bearbeitungsstatus', 'Rückbuchung ins Lager'],
      },
    ],
  },
  {
    titel: 'Verwaltung',
    eintraege: [
      {
        pfad: '/mitarbeiter', name: 'Mitarbeiter', icon: Users, fertig: false,
        beschreibung: 'Personal, Rollen und Schichtplanung.',
        funktionen: ['Mitarbeiterstamm mit Rollen', 'Schichtplanung pro Woche', 'Abwesenheiten und Urlaub'],
      },
      {
        pfad: '/finanzen', name: 'Finanzen', icon: Wallet, fertig: false,
        beschreibung: 'Kosten, Umsätze und Auswertungen.',
        funktionen: ['Einnahmen und Ausgaben', 'Kosten je Tour und Fahrzeug', 'Monatsauswertungen'],
      },
      {
        pfad: '/berichte', name: 'Berichte', icon: ChartColumn, fertig: false,
        beschreibung: 'Diagramme und Statistiken zu allen Bereichen.',
        funktionen: ['Auftrags- und Umsatzberichte', 'Lagerumschlag und Bestandsentwicklung', 'Export als CSV'],
      },
      {
        pfad: '/einstellungen', name: 'Einstellungen', icon: Settings, fertig: false,
        beschreibung: 'Unternehmensdaten und Benutzer.',
        funktionen: ['Firmendaten und Logo-Text', 'Benutzer und Rechte', 'Datensicherung'],
      },
    ],
  },
];

export const ALLE_EINTRAEGE = NAVIGATION.flatMap((g) => g.eintraege);
