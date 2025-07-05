function updateTime() {
  const now = new Date();
  document.getElementById("time").textContent = `🕒 Aktuelle Zeit: ${
    now.getHours().toString().padStart(2, '0')
  }:${now.getMinutes().toString().padStart(2, '0')}`;
}

setInterval(updateTime, 1000);
updateTime();

// Dummy-Sessionliste
const sessions = [
  { zeit: "09:00", typ: "Einzel", ort: "Raum 203", mitarbeiter: "Herr Brenner", emoji: "🧘" },
  { zeit: "11:00", typ: "Gruppe", ort: "Raum 101", mitarbeiter: "Frau Schwarz", emoji: "💬" }
];

const list = document.getElementById("session-list");
sessions.forEach(session => {
  const item = document.createElement("li");
  item.textContent = `${session.emoji} ${session.zeit} – ${session.typ} mit ${session.mitarbeiter} (${session.ort})`;
  list.appendChild(item);
});