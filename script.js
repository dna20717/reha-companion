const content = document.getElementById("content");
const countdownEl = document.getElementById("countdown");
const endDate = new Date("2025-08-05T00:00:00");

function updateCountdown() {
  const now = new Date();
  const diff = endDate - now;
  if (diff <= 0) {
    countdownEl.textContent = "00:00:00:00";
    return;
  }
  const days = String(Math.floor(diff / (1000 * 60 * 60 * 24))).padStart(2, '0');
  const hours = String(Math.floor((diff / (1000 * 60 * 60)) % 24)).padStart(2, '0');
  const minutes = String(Math.floor((diff / (1000 * 60)) % 60)).padStart(2, '0');
  const seconds = String(Math.floor((diff / 1000) % 60)).padStart(2, '0');
  countdownEl.textContent = `${days}:${hours}:${minutes}:${seconds}`;
}

setInterval(updateCountdown, 1000);
updateCountdown();

function loadPlans() {
  fetch('plans/cw27.json')
    .then(response => response.json())
    .then(data => {
      const allSessions = [];
      data.schedule.forEach(day => {
        const date = new Date(day.date);
        const today = new Date();
        today.setHours(0,0,0,0);
        const isPast = date < today;
        const dayName = date.toLocaleDateString('de-DE', { weekday: 'short' });
        const dateLabel = `${dayName}, ${date.toLocaleDateString('de-DE')}`;
        allSessions.push({ type: "header", label: dateLabel, isPast });
        day.appointments.forEach(app => {
          allSessions.push({ ...app, date: day.date, isPast });
        });
      });

      allSessions.forEach(entry => {
        const div = document.createElement("div");
        if (entry.type === "header") {
          div.className = "day-header" + (entry.isPast ? " past" : "");
          div.textContent = entry.label;
        } else {
          div.className = "card" + (entry.isPast ? " past" : "");
          div.innerHTML = `<strong>${entry.time}</strong> – ${entry.activity}<br/>
            <em>${entry.staff}</em><br/>
            <small>${entry.location}</small>`;
        }
        content.appendChild(div);
      });
    })
    .catch(() => {
      content.innerHTML = "<p>Es konnten keine Pläne geladen werden.</p>";
    });
}

window.onload = loadPlans;