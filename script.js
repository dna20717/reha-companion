function updateTime() {
  const now = new Date();
  document.getElementById("time").textContent = `🕒 Aktuelle Zeit: ${
    now.getHours().toString().padStart(2, '0')
  }:${now.getMinutes().toString().padStart(2, '0')}`;
}
setInterval(updateTime, 1000);
updateTime();

function getCalendarWeek(d) {
  const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const dayNum = date.getUTCDay() || 7;
  date.setUTCDate(date.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(date.getUTCFullYear(),0,1));
  return Math.ceil((((date - yearStart) / 86400000) + 1)/7);
}

function loadCurrentWeek() {
  const today = new Date();
  const cw = getCalendarWeek(today);
  const url = `plans/cw${cw}.json`;

  fetch(url)
    .then(res => res.json())
    .then(data => {
      localStorage.setItem("reha-sessions", JSON.stringify(data.schedule));
      renderToday();
    })
    .catch(err => {
      console.error("Fehler beim Laden der Wochenplanung:", err);
    });
}

function renderToday() {
  const data = localStorage.getItem("reha-sessions");
  if (!data) return;

  try {
    const sessions = JSON.parse(data);
    const list = document.getElementById("session-list");
    list.innerHTML = "";

    const today = new Date().toISOString().split("T")[0];
    const daySessions = sessions.find(day => day.date === today);

    if (!daySessions) {
      list.innerHTML = "<p>Heute sind keine Sessions geplant.</p>";
      return;
    }

    daySessions.sessions.forEach(session => {
      const card = document.createElement("div");
      card.className = "session-card";
      card.innerHTML = `
        <h2>${session.time} – ${session.activity}</h2>
        <p>👤 ${session.staff}</p>
        <p>📍 ${session.location}</p>
      `;
      list.appendChild(card);
    });
  } catch (err) {
    alert("Fehler beim Anzeigen der Sessions.");
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

function clearData() {
  if (confirm("Möchtest du wirklich alle gespeicherten Daten löschen?")) {
    localStorage.clear();
    location.reload();
  }
}

function switchTab(id) {
  document.querySelectorAll(".tab").forEach(el => el.classList.remove("active"));
  document.querySelectorAll(".footer-nav button").forEach(btn => btn.classList.remove("active"));
  document.getElementById(id).classList.add("active");
  const index = ['home', 'calendar', 'user'].indexOf(id);
  if (index >= 0) {
    document.querySelectorAll(".footer-nav button")[index].classList.add("active");
  }
}

document.addEventListener("DOMContentLoaded", () => {
  loadCurrentWeek();
  switchTab("home");
});