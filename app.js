const STORAGE_KEY = "healingTrackerEntries";

let selectedMood = "";
let selectedEmotions = [];

/* -----------------------------
   INITIALISE
----------------------------- */

document.addEventListener("DOMContentLoaded", () => {
  showTodayDate();
  setupNavigation();
  setupMoodButtons();
  setupEmotionTags();
  setupIntensity();
  setupSaveButton();

  loadHistory();
  updateInsights();
});


/* -----------------------------
   DATE
----------------------------- */

function showTodayDate() {
  const dateElement = document.getElementById("todayDate");

  const today = new Date();

  dateElement.textContent = today.toLocaleDateString(
    "en-GB",
    {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric"
    }
  );
}


/* -----------------------------
   NAVIGATION
----------------------------- */

function setupNavigation() {
  const buttons = document.querySelectorAll(".nav-btn");

  buttons.forEach(button => {

    button.addEventListener("click", () => {

      const target = button.dataset.section;

      buttons.forEach(btn => {
        btn.classList.remove("active");
      });

      button.classList.add("active");

      document.querySelectorAll(".section").forEach(section => {
        section.classList.remove("active");
      });

      document.getElementById(target).classList.add("active");

      if (target === "history") {
        loadHistory();
      }

      if (target === "insights") {
        updateInsights();
      }

      window.scrollTo({
        top: 0,
        behavior: "smooth"
      });

    });

  });
}


/* -----------------------------
   MOODS
----------------------------- */

function setupMoodButtons() {

  const buttons = document.querySelectorAll(".mood-btn");

  buttons.forEach(button => {

    button.addEventListener("click", () => {

      buttons.forEach(btn => {
        btn.classList.remove("selected");
      });

      button.classList.add("selected");

      selectedMood = button.dataset.mood;

    });

  });
}


/* -----------------------------
   EMOTIONS
----------------------------- */

function setupEmotionTags() {

  const tags = document.querySelectorAll(".tag");

  tags.forEach(tag => {

    tag.addEventListener("click", () => {

      const emotion = tag.dataset.emotion;

      if (selectedEmotions.includes(emotion)) {

        selectedEmotions = selectedEmotions.filter(
          item => item !== emotion
        );

        tag.classList.remove("selected");

      } else {

        selectedEmotions.push(emotion);

        tag.classList.add("selected");

      }

    });

  });
}


/* -----------------------------
   INTENSITY
----------------------------- */

function setupIntensity() {

  const slider = document.getElementById("intensity");
  const value = document.getElementById("intensityValue");

  slider.addEventListener("input", () => {

    value.textContent = `${slider.value} / 10`;

  });
}


/* -----------------------------
   SAVE
----------------------------- */

function setupSaveButton() {

  document
    .getElementById("saveBtn")
    .addEventListener("click", saveEntry);

}


function saveEntry() {

  if (!selectedMood) {

    showMessage("Choose a mood first.");

    return;
  }

  const entry = {

    id: Date.now(),

    date: new Date().toISOString(),

    mood: selectedMood,

    intensity: Number(
      document.getElementById("intensity").value
    ),

    emotions: [...selectedEmotions],

    reflection:
      document.getElementById("reflection").value.trim(),

    trigger:
      document.getElementById("trigger").value.trim(),

    helped:
      document.getElementById("helped").value.trim()

  };


  const entries = getEntries();

  entries.unshift(entry);

  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(entries)
  );


  showMessage("Your check-in has been saved.");

  clearForm();

  loadHistory();
  updateInsights();

}


function showMessage(message) {

  const element = document.getElementById("saveMessage");

  element.textContent = message;

  setTimeout(() => {
    element.textContent = "";
  }, 3000);

}


/* -----------------------------
   CLEAR FORM
----------------------------- */

function clearForm() {

  selectedMood = "";
  selectedEmotions = [];

  document.querySelectorAll(".mood-btn").forEach(button => {
    button.classList.remove("selected");
  });

  document.querySelectorAll(".tag").forEach(tag => {
    tag.classList.remove("selected");
  });

  document.getElementById("intensity").value = 5;
  document.getElementById("intensityValue").textContent = "5 / 10";

  document.getElementById("reflection").value = "";
  document.getElementById("trigger").value = "";
  document.getElementById("helped").value = "";

}


/* -----------------------------
   STORAGE
----------------------------- */

function getEntries() {

  try {

    return JSON.parse(
      localStorage.getItem(STORAGE_KEY)
    ) || [];

  } catch (error) {

    return [];

  }

}


/* -----------------------------
   HISTORY
----------------------------- */

function loadHistory() {

  const entries = getEntries();

  const container =
    document.getElementById("historyList");

  const empty =
    document.getElementById("emptyHistory");


  container.innerHTML = "";


  if (entries.length === 0) {

    empty.style.display = "block";

    return;

  }


  empty.style.display = "none";


  entries.forEach(entry => {

    const article =
      document.createElement("article");

    article.className = "history-entry";


    const date = new Date(entry.date);

    const formattedDate =
      date.toLocaleDateString(
        "en-GB",
        {
          day: "numeric",
          month: "short",
          year: "numeric"
        }
      );


    const emotions =
      entry.emotions.length > 0
        ? entry.emotions.join(" · ")
        : "No emotions selected";


    article.innerHTML = `

      <div class="history-top">

        <div>
          <div class="history-mood">
            ${escapeHTML(entry.mood)}
            · ${entry.intensity}/10
          </div>

          <div class="history-date">
            ${formattedDate}
          </div>
        </div>

      </div>

      <div class="history-emotions">
        ${escapeHTML(emotions)}
      </div>

      ${
        entry.reflection
          ? `<div class="history-reflection">
              ${escapeHTML(entry.reflection)}
            </div>`
          : ""
      }

      <button
        class="delete-btn"
        onclick="deleteEntry(${entry.id})"
      >
        Delete entry
      </button>

    `;


    container.appendChild(article);

  });

}


/* -----------------------------
   DELETE
----------------------------- */

function deleteEntry(id) {

  const confirmed =
    confirm("Delete this check-in?");

  if (!confirmed) {
    return;
  }


  const entries =
    getEntries().filter(
      entry => entry.id !== id
    );


  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(entries)
  );


  loadHistory();
  updateInsights();

}


/* -----------------------------
   INSIGHTS
----------------------------- */

function updateInsights() {

  const entries = getEntries();


  document.getElementById("totalEntries")
    .textContent = entries.length;


  if (entries.length === 0) {

    document.getElementById("averageIntensity")
      .textContent = "—";

    document.getElementById("mostCommonMood")
      .textContent = "—";

    document.getElementById("emotionSummary")
      .innerHTML =
        `<p class="soft-text">
          Start checking in to discover your patterns.
        </p>`;

    document.getElementById("moodChart")
      .innerHTML =
        `<p class="soft-text">
          Your mood chart will appear here.
        </p>`;

    return;

  }


  /* Average intensity */

  const totalIntensity =
    entries.reduce(
      (total, entry) =>
        total + entry.intensity,
      0
    );


  const average =
    totalIntensity / entries.length;


  document.getElementById("averageIntensity")
    .textContent = average.toFixed(1);


  /* Most common mood */

  const moodCounts = {};


  entries.forEach(entry => {

    moodCounts[entry.mood] =
      (moodCounts[entry.mood] || 0) + 1;

  });


  const mostCommon =
    Object.entries(moodCounts)
      .sort((a, b) => b[1] - a[1])[0][0];


  document.getElementById("mostCommonMood")
    .textContent = mostCommon;


  createMoodChart(entries);
  createEmotionSummary(entries);

}


/* -----------------------------
   MOOD CHART
----------------------------- */

function createMoodChart(entries) {

  const chart =
    document.getElementById("moodChart");

  chart.innerHTML = "";


  const recentEntries =
    [...entries]
      .reverse()
      .slice(-14);


  recentEntries.forEach(entry => {

    const column =
      document.createElement("div");

    column.className = "chart-column";


    const bar =
      document.createElement("div");

    bar.className = "chart-bar";


    bar.style.height =
      `${entry.intensity * 12}px`;


    const date =
      document.createElement("div");

    date.className = "chart-date";


    const d =
      new Date(entry.date);


    date.textContent =
      d.toLocaleDateString(
        "en-GB",
        {
          day: "numeric",
          month: "short"
        }
      );


    column.appendChild(bar);
    column.appendChild(date);

    chart.appendChild(column);

  });

}


/* -----------------------------
   EMOTION SUMMARY
----------------------------- */

function createEmotionSummary(entries) {

  const container =
    document.getElementById("emotionSummary");


  const counts = {};


  entries.forEach(entry => {

    entry.emotions.forEach(emotion => {

      counts[emotion] =
        (counts[emotion] || 0) + 1;

    });

  });


  const sorted =
    Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6);


  if (sorted.length === 0) {

    container.innerHTML =
      `<p class="soft-text">
        You haven't selected any emotions yet.
      </p>`;

    return;

  }


  const highest =
    sorted[0][1];


  container.innerHTML = "";


  sorted.forEach(([emotion, count]) => {

    const row =
      document.createElement("div");

    row.className = "emotion-row";


    const percentage =
      (count / highest) * 100;


    row.innerHTML = `

      <span>
        ${escapeHTML(emotion)}
      </span>

      <div class="emotion-bar-background">

        <div
          class="emotion-bar"
          style="width: ${percentage}%"
        ></div>

      </div>

      <span>
        ${count}
      </span>

    `;


    container.appendChild(row);

  });

}


/* -----------------------------
   SECURITY
----------------------------- */

function escapeHTML(value) {

  const div =
    document.createElement("div");

  div.textContent = value;

  return div.innerHTML;

}
