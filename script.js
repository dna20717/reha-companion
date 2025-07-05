function updateTime() {
  const now = new Date();
  document.getElementById("time").textContent = `🕒 Aktuelle Zeit: ${
    now.getHours().toString().padStart(2, '0')
  }:${now.getMinutes().toString().padStart(2, '0')}`;
}

setInterval(updateTime, 1000);
updateTime();

function loadSessions() {
  const data = localStorage.getItem("reha-sessions");
  if (!data) return;

  try {
    const sessions = JSON.parse(data);
    const list = document.getElementById("session-list");
    list.innerHTML = "";
    sessions.forEach(session => {
      const item = document.createElement("li");
      item.textContent = `${session.emoji} ${session.zeit} – ${session.typ} mit ${session.mitarbeiter} (${session.ort})`;
      list.appendChild(item);
    });
  } catch (err) {
    alert("Fehler beim Laden der Sessions.");
  }
}

function exportBackup() {
  const data = localStorage.getItem("reha-sessions") || "[]";
  const blob = new Blob([data], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  const timestamp = new Date().toISOString().split("T")[0];
  link.href = url;
  link.download = `reha-backup-${timestamp}.json`;
  link.click();
  URL.revokeObjectURL(url);
}

function importBackup(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function () {
    try {
      const imported = JSON.parse(reader.result);
      localStorage.setItem("reha-sessions", JSON.stringify(imported));
      loadSessions();
      alert("Backup erfolgreich importiert!");
    } catch (err) {
      alert("Import fehlgeschlagen: Keine gültige JSON.");
    }
  };
  reader.readAsText(file);
}

// Beispielhafte Initialisierung mit Dummy-Daten, falls leer
if (!localStorage.getItem("reha-sessions")) {
  const dummySessions = [
    { zeit: "09:00", typ: "Einzel", ort: "Raum 203", mitarbeiter: "Herr Brenner", emoji: "🧘" },
    { zeit: "11:00", typ: "Gruppe", ort: "Raum 101", mitarbeiter: "Frau Schwarz", emoji: "💬" }
  ];
  localStorage.setItem("reha-sessions", JSON.stringify(dummySessions));
}

document.addEventListener("DOMContentLoaded", loadSessions);
function showView(view) {
  document.querySelectorAll('.view').forEach(v => v.classList.add('hidden'));
  const el = document.getElementById(view + '-view');
  if (el) el.classList.remove('hidden');
}
