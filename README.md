# Bug Bounty

## Obiectiv general
Realizarea unei aplicații de tip Bug Bounty cu front-end SPA realizat în **React.js** și back-end **Node.js + Express**, care oferă o interfață REST pentru gestionarea bounty-urilor. Datele sunt stocate într-o bază relațională.

---

## Tehnologii care vor putea fi folosite

### Frontend
- React.js (SPA bazat pe componente)
- Axios (apeluri către API-ul REST)
- CSS (stilizare rapidă)

### Backend
- Node.js + Express
- PostgreSQL(sau SQLite)
- CORS
- dotenv (pentru variabile de mediu)

### Altele
- Git pentru versionare
- Postman pentru testarea API-ului

---

proiect-web/
│
├── server/
│ ├── server.js # punctul de intrare Express
│ ├── routes/ # rute API
│ ├── db/ # configurarea bazei de date
│ └── middleware/ # autentificare, erori
│
├── client/
│ ├── src/
│ ├── App.js
│ └── components/ # componente React reutilizabile
│ 
│ 
│
└── README.md

## Funcționalități principale

- CRUD complet pentru bounty-uri:
  - GET `/api/bounties` – listează toate bounty-urile
  - POST `/api/bounties` – adaugă un bounty nou
  - PUT `/api/bounties/:id` – actualizează un bounty
  - DELETE `/api/bounties/:id` – șterge un bounty
- Frontend-ul afișează lista bounty-urilor și permite adăugarea unui bounty nou
- Logica de business este coerentă și ușor de extins

