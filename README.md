# POSTGRES Suchfilter / Facetten

[Openproject Link](https://openproject.mint-vernetzt.de/projects/3/work_packages/943/activity)


## Als Inspiration dienten folgende Artikel, die ich im Rahmen der Recherche gefunden habe:
- [Creating facets from tags](https://bun.uptrace.dev/postgres/faceted-full-text-search-tsvector.html#creating-facets-from-tags)
- [How to implement a fulltext search](https://www.claritician.com/how-to-implement-full-text-search-in-prisma-with-postgresql)

## Vorgehen
Zuerst habe ich mir eine isolierte Testumgebung erzeugt. Als Basis dient eine frische Installation einer PostgreSQL
Datenbank. Um möglichst nah an den im Projekt verwendeten Technologien zu bleiben, habe ich den Stack entsprechend ausgewählt:

### Stack
- Docker
  - PostgreSQL
  - PG-Admin
- Runtime
  - Typescript
  - Prisma

### Schema
Das Schema habe ich aus dem Projekt übernommen, ich habe mir aber erlaubt es ein wenig zu kürzen. Dadurch konnte ich die Komplexität ein wenig reduzieren und den Seed-Prozess vereinfachen.
Das Schema hat eine Erweiterung erfahren:

```prisma
tsv                          Unsupported("tsvector")?
@@index([tsv])

```

Die daraus resultierende Migration habe ich noch angepasst:
```postgresql
ALTER TABLE "projects" ADD COLUMN     "tsv" tsvector;
CREATE INDEX "projects_tsv_idx" ON "projects"("tsv");
```

```postgresql
ALTER TABLE "projects" ADD COLUMN     "tsv" tsvector;
CREATE INDEX "projects_tsv_idx" ON "projects" USING GIN ("tsv");
```

Der Wechsel auf `gin` hatte eine Verbesserung der Query-Zeit zur Folge, die ich aber nicht genau quantisieren kann.

Leider unterstützt Prisma den Datentyp "vektor" und die zugehörigen Funktionen nicht. Ich bin aber zuversichtlich, dass 
man sich mit `raw queries` helfen können wird.

### Seed
Das Seed-Script aus dem Projekt war mir zu groß und hatte auch Abhängigkeiten zu Supabase.
Daher habe ich mich dazu entschieden, einen schlankes Seed-Script aufzusetzen. Siehe dazu:
`.../prisma/scripts/seed/*`

### Vektor
Um den Vektor zu befüllen, habe ich ein weiteres Script geschrieben `.../prisma/scripts/vector/*`.
Ein vergleichbares Script müsste beim Ausrollen des Features einmal laufen, um den Vektor und den Index zu befüllen.
Die weitere Pflege könnte man in eine `Stored Procedure` auslagern, die man an einen Trigger knüpft. Alternativ kann 
man das natürlich auch in den Server-Part des Stack auslagern.

Der Vektor ist ein Array, der mit Tupeln befüllt ist. In Pseudo Code:
```typescript
['fd:token-1', 'fd:token-2', '...', 'ff:token1', '...' ]
```
Ein Token definiert sich durch einen Prefix und einen Wert, wobei der Prefix exemplarisch folgende Werte annehmen kann:

| Prefix | Wert                |
|--------|---------------------|
| fd     | further disciplines |
| ff     | further formats     |
| ...    | ...                 |

Natürlich wäre es auch möglich, mehrere Vektoren anzulegen, falls sich dies als Vorteilhaft erweist.

## Ergebnisse
Ich habe mir zum Testen 100.000 Projekte erzeugen lassen und den Vektor der Datensätze im Nachhinein befüllt.

### Auslesen der Facetten

```postgresql
SELECT split_part(word, ':', 1) AS attr,
       split_part(word, ':', 2) AS value,
       ndoc                     AS count
FROM ts_stat($$ SELECT tsv FROM projects $$)
ORDER BY word;
```

Gekürzte Ausgabe

| attr | value                 | count |
|------|-----------------------|-------|
| fd   | Angewandte Mathematik | 13611 |
| fd   | Astronomie            | 13602 |
| ...  | ...                   | ...   |
| fd   | Bioinformatik         | 13557 |
| fd   | Biologie              | 13454 |
| fd   | Biotechnologie        | 13655 |
| ...  | ...                   | ...   |
| ff   | Ingenieurprojekt      | 32549 |
| ff   | Innovationsprojekt    | 32619 |
| ff   | Laborprojekt          | 32865 |
| ff   | Lehrprojekt           | 32424 |
| ...  | ...                   | ...   |

Nun wähle ich "fd:Biologie" aus:

```postgresql
SELECT
  split_part(word, ':', 1) AS attr,
  split_part(word, ':', 2) AS value,
  ndoc AS count
FROM ts_stat($$
  SELECT tsv FROM projects
  WHERE tsv @@ 'fd\:Biologie'::tsquery
$$)
ORDER BY attr, value;
```

 | attr | value                 | count |
|------|-----------------------|-------|
| fd   | Angewandte Mathematik | 1846  |
| fd   | Astronomie            | 1819  |
| ...  | ...                   | ...   |
| fd   | Bioinformatik         | 1810  |
| fd   | Biologie              | 13454 |
| fd   | Biotechnologie        | 1796  |
| ...  | ...                   | ...   |
| ff   | Ingenieurprojekt      | 4394  |
| ff   | Innovationsprojekt    | 4345  |
| ff   | Laborprojekt          | 4389  |
| ff   | Lehrprojekt           | 4374  |
| ...  | ...                   | ...   |


Nun noch "Chemie" dazu:

```postgresql
SELECT
  split_part(word, ':', 1) AS attr,
  split_part(word, ':', 2) AS value,
  ndoc AS count
FROM ts_stat($$
  SELECT tsv FROM projects
  WHERE tsv @@ 'fd\:Biologie'::tsquery
	AND tsv @@ 'fd\:Chemie'::tsquery		 
$$)
ORDER BY attr, value;
```

| attr | value                 | count |
|------|-----------------------|-------|
| fd   | Angewandte Mathematik | 241   |
| fd   | Astronomie            | 244   |
| ...  | ...                   | ...   |
| fd   | Bioinformatik         | 236   |
| fd   | Biologie              | 1751  |
| fd   | Biotechnologie        | 222   |
| ...  | ...                   | ...   |
| ff   | Ingenieurprojekt      | 556   |
| ff   | Innovationsprojekt    | 565   |
| ff   | Laborprojekt          | 559   |
| ff   | Lehrprojekt           | 556   |
| ...  | ...                   | ...   |


Der letzte Query benötigt auf meinem Rechner (Mac Pro, M1 max) 48ms.
