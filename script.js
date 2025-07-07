
const content = document.getElementById("content");
const countdownEl = document.getElementById("countdown");
const sessionStatusEl = document.getElementById("session-status");
const navEl = document.createElement("nav");
document.body.insertBefore(navEl, document.getElementById("app"));

const endDate = new Date("2025-08-05T00:00:00");

const sessionStyles = {
  "Einzel": { emoji: "🧑‍⚕️", color: "#fce4ec" },
  "Gruppe": { emoji: "🧑‍🤝‍🧑", color: "#e3f2fd" },
  "Sport": { emoji: "🏃‍♂️", color: "#e8f5e9" },
  "Gedanke": { emoji: "💭", color: "#fff3e0" },
  "default": { emoji: "📋", color: "#eeeeee" }
};

function detectForm(activity) {
  if (/einzel/i.test(activity)) return "Einzel";
  if (/gruppe/i.test(activity)) return "Gruppe";
  if (/sport|training|gymnastik|wassergymnastik|bewegung/i.test(activity)) return "Sport";
  if (/pmr|genuss|stress|gedanke|wahrnehmung|seminar|visite/i.test(activity)) return "Gedanke";
  return "default";
}

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

let activeButton = null;
let todaySessions = [];

function updateSessionStatus() {
  const now = new Date();
  const remaining = todaySessions.filter(app => {
    const sessionDate = new Date(app.fullDate + 'T' + app.time);
    return sessionDate > now;
  });

  if (remaining.length === 0) {
    sessionStatusEl.textContent = "Alles erledigt. Zeit zum Entspannen. 🧘‍♀️🌸";
  } else if (remaining.length === 1) {
    sessionStatusEl.textContent = "Du hast nur noch 1 Session vor dir.";
  } else {
    sessionStatusEl.textContent = `Du hast noch ${remaining.length} Sessions vor dir.`;
  }
}

setInterval(updateSessionStatus, 10000);

function isDayCollapsed(dateStr) {
  const state = JSON.parse(localStorage.getItem("collapsedDays") || "{}");
  return state[dateStr];
}

function setDayCollapsed(dateStr, collapsed) {
  const state = JSON.parse(localStorage.getItem("collapsedDays") || "{}");
  state[dateStr] = collapsed;
  localStorage.setItem("collapsedDays", JSON.stringify(state));
}

function loadPlan(filename) {
  fetch("plans/" + filename)
    .then(response => response.json())
    .then(data => {
      content.innerHTML = "";
      todaySessions = [];

      data.schedule.forEach(day => {
        const date = new Date(day.date);
        const dateStr = date.toISOString().split("T")[0];
        const todayStr = new Date().toISOString().split("T")[0];
        let hasOpenToday = dateStr === todayStr;

        const wrapper = document.createElement("div");
        wrapper.className = "day-card";

        const header = document.createElement("div");
        header.className = "day-card-header";
        header.innerHTML = `📅 ${date.toLocaleDateString("de-DE", { weekday: 'short' })}, ${date.toLocaleDateString("de-DE")}`;

        const toggle = document.createElement("span");
        toggle.className = "toggle";
        header.appendChild(toggle);

        const contentDiv = document.createElement("div");
        contentDiv.className = "day-card-content";

        let allPast = true;
        let openToday = [];

        day.appointments.forEach(app => {
          const sessionTime = new Date(day.date + "T" + app.time);
          const now = new Date();
          const isPast = sessionTime < now;
          if (!isPast) allPast = false;
          if (dateStr === todayStr && !isPast) openToday.push(app);

          const form = detectForm(app.activity);
          const style = sessionStyles[form] || sessionStyles["default"];
          const emoji = isPast ? "✅" : style.emoji;

          const card = document.createElement("div");
          card.className = "card" + (isPast ? " past" : "");
          card.style.backgroundColor = style.color;
          card.innerHTML = `<strong>${emoji} ${app.time}</strong> – ${app.activity}<br/>
            <em>${app.staff}</em><br/>
            <small>${app.location}</small>`;
          contentDiv.appendChild(card);
        });

        // Collapse logic
        const collapsedInitially = allPast || isDayCollapsed(dateStr);
        if (collapsedInitially) contentDiv.classList.add("collapsed");
        toggle.textContent = collapsedInitially ? "⏵" : "⏷";

        header.addEventListener("click", () => {
          const isCollapsed = contentDiv.classList.toggle("collapsed");
          toggle.textContent = isCollapsed ? "⏵" : "⏷";
          setDayCollapsed(dateStr, isCollapsed);
        });

        wrapper.appendChild(header);
        wrapper.appendChild(contentDiv);
        content.appendChild(wrapper);

        if (dateStr === todayStr) {
          todaySessions = openToday.map(app => ({ ...app, fullDate: day.date }));
        }
      });

      updateSessionStatus();
    })
    .catch(() => {
      content.innerHTML = "<p>Es konnten keine Pläne geladen werden.</p>";
    });
}

function setupNavigation() {
  fetch("plans/index.json")
    .then(response => response.json())
    .then(files => {
      navEl.innerHTML = "";
      files.forEach(file => {
        const match = file.match(/cw(\d+)\.json/i);
        const label = match ? `CW${match[1]}` : file;
        const button = document.createElement("button");
        button.textContent = label;
        button.onclick = () => {
          if (activeButton) activeButton.classList.remove("active");
          button.classList.add("active");
          activeButton = button;
          loadPlan(file);
        };
        navEl.appendChild(button);
      });
      if (files.length > 0) {
        navEl.firstChild.click();
      }
    });
}

window.onload = setupNavigation;
