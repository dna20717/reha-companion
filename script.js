const endDate = new Date("2025-08-05T00:00:00");

function updateCountdown() {
  const now = new Date();
  const diff = endDate - now;
  if (diff <= 0) return;

  const d = String(Math.floor(diff / (1000 * 60 * 60 * 24))).padStart(2, "0");
  const h = String(Math.floor((diff / (1000 * 60 * 60)) % 24)).padStart(2, "0");
  const m = String(Math.floor((diff / (1000 * 60)) % 60)).padStart(2, "0");
  const s = String(Math.floor((diff / 1000) % 60)).padStart(2, "0");

  document.getElementById("countdown").textContent = \`\${d}:\${h}:\${m}:\${s}\`;
}

setInterval(updateCountdown, 1000);
updateCountdown();

document.addEventListener("DOMContentLoaded", () => {
  const content = document.getElementById("content");
  const today = new Date().toISOString().split("T")[0];

  fetch("./plans/cw27.json")
    .then(r => r.json())
    .then(data => {
      const flat = [];
      data.schedule.forEach(day => {
        const d = new Date(day.date);
        const readable = d.toLocaleDateString("de-DE", { weekday: "short", day: "2-digit", month: "2-digit", year: "numeric" });
        const container = document.createElement("div");
        container.className = "day-card" + (new Date(day.date) < new Date() ? " past" : "");
        const title = document.createElement("h3");
        title.textContent = readable;
        container.appendChild(title);

        day.appointments.forEach(app => {
          const sTime = new Date(day.date + "T" + app.time);
          const div = document.createElement("div");
          div.className = "session" + (sTime < new Date() ? " done" : "");
          div.textContent = (sTime < new Date() ? "✔️ " : "🧠 ") + \`\${app.time} – \${app.activity} @ \${app.location}\`;
          container.appendChild(div);
        });

        content.appendChild(container);
        flat.push(...day.appointments.map(a => ({ date: day.date, time: a.time })));
      });

      const remaining = flat.filter(({ date, time }) => {
        const dt = new Date(date + "T" + time);
        return dt > new Date();
      });

      document.getElementById("session-info").textContent = remaining.length === 0
        ? "Alles erledigt. Zeit zum Entspannen. 🧘‍♂️🪷"
        : \`Du hast heute noch \${remaining.length} Session\${remaining.length === 1 ? '' : 's'} vor dir.\`;
    });
});