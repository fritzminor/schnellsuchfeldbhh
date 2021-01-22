# Schnellsuchfeld - Prototyp

## Demonstration

* Beim leeren Suchfeld werden alle Haushaltsstellen des
  Bearbeiters angezeigt (hier die Einzelpläne des Bundespräsidenten -Epl 01- und des Bundestags -Epl 02-).
* Man sieht 
  - Titel (mit FKZ) Zweck, Betrag 2021
  - Summe Einnahmen und Ausgaben
  - Nach welchen Suchkriterien gefiltert wird.
  
* Eingrenzen auf Epl 02 Bundestag mit 
  - 02
  - Epl:02
  - Epl:2
* Suche nach Bezüge des Bundespräsidenten
  - Präsident
  - 4
  - Grp:4
* Kombination: nur im Epl 01
  - 01 Grp:4
* Suche nach Titeln mit Beträgen über 1 Mio. €
  - 1000 => Vorschlag "Soll1:1000"
  - Soll1:1000-
* Suche nach Titeln mit Beträgen zwischen 1 und 2 Mio. €
  - Soll1:1000-2000

* Einnahmen
  - Einnahmen?
  - "mehr" klicken, um weitere Vorschläge zu erhalten
  - besser: Vorschlag "Grp:0-3" annehmen

* Tipphilfe beim Stehenlassen des Mauszeigers auf Suchfeld

* Suche nach Ausgaben im Epl:02, jedoch ohne Personalausgaben



## TODO

- Sachhaushaltseinfachmaske
  * Volltextsuche
  * Von bis-Felder
    * Epl (1 wird zu Epl:01)
    * Kapitel (1 wird zu Kap:01, 101 wird zu Epl:01 Kap:01, 0102 wird zu Kap:0102)
    * Grp:
    * Titelgruppe:
    * Soll1:
  * Ohne-Knopf: zusätzliches Feld mit gleicher Auswahl

- Ausführlicher Hilfetext an einem Stück
- Bei fullTextMatch sollte Token hervorgehoben werden (notfalls nur im helptext etwa so "'Epl:13' in 'Grp:5 Epl:13' führt zu Suche nach ...", wobei "Epl:13" beides Mal unterstrichen wird)
- Weitere Suchvorschläge, wenn Grp:\d, nämlich Grp:$1\d und Grp:$1\d\d
- A und E als Schnelleingrenzung auf Ausgaben oder Einnahmen
- Kap:1004 als Epl:10 Kap:04 interpretieren
- Ignoriere Leerzeichen vor schließender Klammer

- Verweis auf Daten von bundeshaushalt.de in der App
- Verweis auf Code-Repository auf GitHub
