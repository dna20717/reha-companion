const content = document.getElementById("content");
const countdownEl = document.getElementById("countdown");
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

function loadPlan(filename) {
  fetch("plans/" + filename)
    .then(response => response.json())
    .then(data => {
      content.innerHTML = "";
      data.schedule.forEach(day => {
        const date = new Date(day.date);
        const today = new Date();
        today.setHours(0,0,0,0);
        const isPast = date < today;

        const wrapper = document.createElement("div");
        wrapper.className = "day-card" + (isPast ? " past" : "");

        const header = document.createElement("div");
        header.className = "day-card-header";
        header.innerHTML = `📅 ${date.toLocaleDateString("de-DE", { weekday: 'short' })}, ${date.toLocaleDateString("de-DE")}`;

        const toggle = document.createElement("span");
        toggle.className = "toggle";
        toggle.textContent = isPast ? "⏵" : "⏷";
        header.appendChild(toggle);

        const contentDiv = document.createElement("div");
        contentDiv.className = "day-card-content";
        if (isPast) contentDiv.classList.add("collapsed");

        header.addEventListener("click", () => {
          const isCollapsed = contentDiv.classList.toggle("collapsed");
          toggle.textContent = isCollapsed ? "⏵" : "⏷";
        });

        wrapper.appendChild(header);

        day.appointments.forEach(app => {
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

        wrapper.appendChild(contentDiv);
        content.appendChild(wrapper);
      });
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
        const label = match ? `KW ${match[1]}` : file;
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