# Universalsuchfeld - Prototyp - Anleitung

Die Einstiegsseite für den Haushaltsplan unterteilt sich in folgende Bereiche:
* das Universalsuchfeld, das eher für erfahrenere Anwender gedacht ist
* der Suchfelder-/Vorschläge-Bereich
* die Anzeige der Haushaltsstellen - Diese verwendet Beispielsdaten von bundeshaushalt.de für die Einzelpläne 01 des Bundespräsidenten und 02 des Bundestags. Sie dient nur Demonstrationszwecken der anderen beiden Bereiche und ist nicht weiter interessant.

## Suchfelder

Lassen wir einmal das [Universalsuchfeld](#universalsuchfeld) außer Acht und wenden uns den darunter erscheinenden Suchfeldern zu. Falls diese nicht dargestellt werden, sollte  man auf "Suchfelder" links neben "Vorschläge" klicken.

### Suchfeld Einzelplan

Das erste Suchfeld betrifft die Suche nach Einzelplänen. Gibt man in das linke Feld, das mit "von" bezeichnet ist, einen Wert (wie z.B. "01") ein, werden im Anzeigebereich die Haushaltsstellen angezeigt, die zu diesem Einzelplan gehören.

Gibt man zusätzlich in das rechte Feld, das mit "bis" bezeichnet wird, einen Wert (z.B. "03") ein, werden alle Einzelpläne des gesamten Bereich (einschließlich der angegebenen Randwerte) angezeigt. 

Beispiel: "von" ist "01", "bis" ist "03". Es werden die Haushaltsstellen der Epl. "01", "02" und "03" angezeigt (wobei im Prototyp - wie auch bei einer entsprechenden Einschränkung des Anwenders in einem realen Haushaltsaufstellungssystem - grundsätzlich nur die [Daten](#daten) für die Einzelpläne 01 und 02 verfügbar sind).

### Suchfeld Kapitel

Mit dem Suchfeld für Kapitel kann man nach der zweistelligen Kapitelnummer suchen, also nach den zwei Ziffern, die bei einer Haushaltsstelle nach den ersten zwei Ziffern für den Einzelplan stehen.

In einigen Fällen kann der Prototyp auch vierstellige Kapitelnummern verarbeiten, also Kapitelnummern, die sich aus der Einzelplannummer und der Kapitelnummer zusammensetzen.

Das Suchfeld Kapitel funktioniert analog dem [Suchfeld Einzelplan](#suchfeld-einzelplan).

### Suchfeld Volltextsuche

Das Suchfeld Volltextsuche ist wahrscheinlich das einfachste. Man gibt ein Wort oder ein Wortteil ein und die angezeigten Haushaltsstellen werden auf diejenigen beschränkt, die dieses Wort oder diesen Teil in Zweckbestimmung, Erläuterung, Kapitelüberschrift oder Einzelplanüberschrift enthalten - in Theorie. Denn im Prototyp ist die Suche noch auf die Zweckbestimmung begrenzt. Aber das ist ja auch schon etwas.

Will man Haushaltsstellen finden, die das Wort nicht enthalten, muss man zu den [Ohne-Suchfeldern](#ohne-suchfelder) gehen.

### Suchfeld Gruppierungsnummer
...

### Ohne-Suchfelder
...

## Universalsuchfeld

Mit dem Universalsuchfeld kann man einerseits einfache Suchanfragen in sehr kurzer Form schreiben, andererseits bietet es auch die Möglichkeit für komplexe Filter. So können z.B. Schnittmengen aus verschiedenen Filtern gebildet werden.

Sinnvoll ist - jedenfalls für den Anfänger - bei der Eingabe in das Universalsuchfeld den [Vorschlägebereich](#vorschlägebereich) offen zu halten, indem man auf "Vorschläge" klickt. Dort werden Vorschläge gemacht, die bei der Eingabe helfen können.

...

## Vorschlägebereich

...

## Daten

Die Daten des Prototyps stammen von [bundeshaushalt.de](https://www.bundeshaushalt.de/download). Beim Aufruf wird so getan, als sei der Bearbeiter, der sich um die Einzelpläne 01 (Bundespräsident) und 02 (Bundestag) eingeloggt. 

Man kann aber auch den Bearbeiter wechseln, indem man rechts oben das Pulldown-Menü benützt. Ggf. muss es mit dem "Burger"-Menü (drei waagrechte Striche übereinander) erst angezeigt werden.