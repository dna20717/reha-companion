async function loadPlans() {
  const container = document.getElementById("schedule-container");
  try {
    const res = await fetch("plans/index.json");
    const planFiles = await res.json();
    let allSessions = [];

    for (const file of planFiles) {
      const planRes = await fetch("plans/" + file);
      const plan = await planRes.json();
      for (const day of plan.schedule) {
        for (const s of day.sessions || day.appointments || []) {
          allSessions.push({
            date: day.date,
            ...s
          });
        }
      }
    }

    allSessions.sort((a, b) => {
      const dtA = new Date(a.date + "T" + a.time);
      const dtB = new Date(b.date + "T" + b.time);
      return dtA - dtB;
    });

    let lastDate = "";
    container.innerHTML = "";
    for (const s of allSessions) {
      if (s.date !== lastDate) {
        const label = document.createElement("div");
        label.className = "day-label";
        label.textContent = new Date(s.date).toLocaleDateString("de-DE", { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
        container.appendChild(label);
        lastDate = s.date;
      }

      const card = document.createElement("div");
      card.className = "card";
      card.innerHTML = `<strong>${s.time}</strong> – ${s.activity}<br><em>${s.staff}</em><br><small>${s.location}</small>`;
      container.appendChild(card);
    }
  } catch (e) {
    container.innerHTML = "<p>Fehler beim Laden der Pläne 😢</p>";
    console.error(e);
  }
}
loadPlans();