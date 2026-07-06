# Boyden – Digitalt refleksjonsskjema

Digitalt skjema med admin-område for innkomne besvarelser og PDF-nedlasting.
Bygget som statisk `index.html` + to Vercel-serverless-funksjoner + Upstash Redis.

## Struktur

```
index.html            Skjemaet og admin-området (alt i én fil)
api/submit.js         POST – tar imot innsendte besvarelser
api/submissions.js    GET/DELETE – henter og sletter besvarelser (krever passord)
package.json          Avhengighet: @upstash/redis
```

## Publisering – steg for steg

1. **GitHub:** Opprett et nytt repo og last opp alle filene i denne mappen
   (behold mappestrukturen, `api/` må ligge i rot).

2. **Vercel:** Gå til vercel.com → *Add New → Project* → importer repoet.
   Ikke endre noen innstillinger – trykk *Deploy*.

3. **Database:** I Vercel-prosjektet: *Storage*-fanen → *Create Database* →
   velg **Upstash for Redis** (gratisnivå holder). Koble den til prosjektet.
   Miljøvariablene (`UPSTASH_REDIS_REST_URL` m.fl.) settes automatisk.

4. **Admin-passord:** *Settings → Environment Variables* → legg til:
   - Name: `ADMIN_PASSWORD`
   - Value: passordet du vil bruke
   Lagre.

5. **Redeploy:** *Deployments*-fanen → tre prikker på siste deploy → *Redeploy*
   (slik at databasen og passordet plukkes opp).

6. Ferdig! Del adressen (`https://<prosjektnavn>.vercel.app`) med kandidatene.
   Admin-området finner du via «Administrasjon»-lenken nederst på siden.

Eget domene kan kobles på under *Settings → Domains*.

## Sikkerhet

- Passordet sjekkes på serversiden og ligger aldri i koden eller i nettleseren.
- Besvarelser kan bare hentes/slettes med riktig passord.
- Alt går over HTTPS via Vercel.
