const content = document.getElementById("content");

function loadPlans() {
  fetch('plans/cw27.json')
    .then(response => response.json())
    .then(data => {
      const allSessions = [];
      data.schedule.forEach(day => {
        const date = new Date(day.date);
        const dayName = date.toLocaleDateString('de-DE', { weekday: 'short' });
        const dateLabel = `${dayName}, ${date.toLocaleDateString('de-DE')}`;
        allSessions.push({ type: "header", label: dateLabel });
        day.appointments.forEach(app => {
          allSessions.push({ ...app, date: day.date });
        });
      });

      allSessions.forEach(entry => {
        const div = document.createElement("div");
        if (entry.type === "header") {
          div.className = "day-header";
          div.textContent = entry.label;
        } else {
          div.className = "card";
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