// Menu parsing and display logic
export let menuData = null;
export let pdfDataUrl = null;

export function setMenuData(data) {
  menuData = data;
}

export function setPdfDataUrl(url) {
  pdfDataUrl = url;
}

export function parseMenu(text) {
  menuData = {
    weeks: [],
  };

  // Clean up the text
  text = text.replace(/\s+/g, " ");

  // Find all week sections
  const weekPattern = /Week (\d+)(.*?)(?=Week \d+|$)/gs;
  const weekMatches = [...text.matchAll(weekPattern)];

  const days = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ];

  for (let w = 0; w < weekMatches.length && w < 4; w++) {
    const weekText = weekMatches[w][2];
    const weekData = { days: [] };

    // Extract the table content for each day
    for (let d = 0; d < days.length; d++) {
      const day = days[d];

      // Pattern to match: Day Breakfast* [lunch content] [dinner content]
      // Looking for content between current day and next day (or end)
      const nextDay = days[d + 1];
      let pattern;

      if (nextDay) {
        pattern = new RegExp(
          day + "\\s+Breakfast\\*?\\s+(.*?)\\s+" + nextDay,
          "s"
        );
      } else {
        pattern = new RegExp(
          day + "\\s+Breakfast\\*?\\s+(.*?)(?=Breakfast\\*\\s*:|Week|$)",
          "s"
        );
      }

      const match = weekText.match(pattern);

      if (match) {
        let content = match[1].trim();

        // Remove extra spaces and normalize
        content = content.replace(/\s+/g, " ").trim();

        let lunch = "Not available";
        let dinner = "Not available";

        // Split content into words and look for meal separators
        // The format is usually: [lunch items] [dinner items]
        // We need to find where lunch ends and dinner begins

        // Common dinner keywords to split on
        const dinnerKeywords = [
          "Biryani",
          "Nihari",
          "Haleem",
          "Karahi",
          "Korma",
          "Handi",
          "Qeema",
          "Pulao",
          "Palak",
          "Murgh Channa",
          "Special",
          "Nuggets",
          "Macaroni",
          "Pasta",
          "Gosht",
        ];

        // Try to intelligently split lunch and dinner
        let splitIndex = -1;

        // Look for the last occurrence of common meal items
        for (const keyword of dinnerKeywords) {
          const regex = new RegExp("\\b" + keyword + "\\b", "i");
          const keywordMatch = content.match(regex);
          if (keywordMatch) {
            const idx = content.lastIndexOf(keywordMatch[0]);
            if (idx > splitIndex) {
              splitIndex = idx;
            }
          }
        }

        if (splitIndex > 0) {
          // Find the start of the word containing the split
          let wordStart = splitIndex;
          while (wordStart > 0 && content[wordStart - 1] !== " ") {
            wordStart--;
          }

          lunch = content.substring(0, wordStart).trim();
          dinner = content.substring(wordStart).trim();
        } else {
          // Fallback: split roughly in half
          const words = content.split(" ");
          const mid = Math.floor(words.length / 2);
          lunch = words.slice(0, mid).join(" ");
          dinner = words.slice(mid).join(" ");
        }

        // Clean up the meals
        lunch = lunch || "Not available";
        dinner = dinner || "Not available";

        const dayData = {
          name: day,
          breakfast:
            day === "Sunday"
              ? "Special Breakfast (Halwa + Puri/Kulchay + Channa + Banana Shake/Lassi)"
              : "Standard Breakfast (Half fry, Full fry, Omlete, Khakina, Bread, Yoghurt, Blueband, Tea, Paratha, Chipati)",
          lunch: lunch,
          dinner: dinner,
        };

        weekData.days.push(dayData);
      }
    }

    if (weekData.days.length > 0) {
      menuData.weeks.push(weekData);
    }
  }
  
  return menuData;
}

export function getCurrentMealTime() {
  const now = new Date();
  const hour = now.getHours();
  const minute = now.getMinutes();
  const totalMinutes = hour * 60 + minute;
  const day = now.getDay(); // 0 = Sunday

  // Breakfast: 7:00-9:30 weekdays, 10:00-11:15 Sunday
  if (day === 0) {
    // Sunday
    if (totalMinutes >= 600 && totalMinutes < 675) {
      // 10:00 AM - 11:15 AM
      return "breakfast";
    }
  } else {
    // Weekdays
    if (totalMinutes >= 420 && totalMinutes < 570) {
      // 7:00 AM - 9:30 AM
      return "breakfast";
    }
  }

  // Lunch: 1:00 PM - 3:00 PM (13:00 - 15:00)
  if (totalMinutes >= 780 && totalMinutes < 900) {
    return "lunch";
  }

  // Dinner: 8:00 PM - 10:00 PM (20:00 - 22:00)
  if (totalMinutes >= 1200 && totalMinutes < 1320) {
    return "dinner";
  }

  return "none";
}

// Navigation state
export let manualView = false;
export let viewedOffsetDays = 0;
export let currentViewOffsetDays = 0;

export function setManualView(value) {
  manualView = value;
}

export function setViewedOffsetDays(offset) {
  viewedOffsetDays = offset;
  currentViewOffsetDays = offset;
}

export function showOffset(offset) {
  manualView = true;
  viewedOffsetDays = offset;
  currentViewOffsetDays = offset;
  displayMenu();
}

export function getCurrentViewOffset() {
  return currentViewOffsetDays;
}

export function displayMenu() {
  if (!menuData || !menuData.weeks || menuData.weeks.length === 0) {
    return;
  }

  const startDate = new Date(document.getElementById("startDate").value);
  // target date is today or the manual viewed offset
  const targetDate = new Date();
  if (manualView) {
    targetDate.setDate(targetDate.getDate() + viewedOffsetDays);
  }

  const diffTime = targetDate - startDate;
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  const totalDays = menuData.weeks.length * 7;

  if (diffDays < 0 || diffDays >= totalDays) {
    document.getElementById("message").innerHTML =
      '<div class="error">❌ Date is outside menu range</div>';
    updateNavButtons(diffDays, totalDays);
    return;
  }

  const weekIndex = Math.floor(diffDays / 7);
  const dayIndex = diffDays % 7;

  const week = menuData.weeks[weekIndex];
  if (!week || !week.days[dayIndex]) {
    document.getElementById("message").innerHTML =
      '<div class="error">❌ No menu data for this date</div>';
    updateNavButtons(diffDays, totalDays);
    return;
  }

  const today = week.days[dayIndex];
  const currentMeal = getCurrentMealTime();
  const isWeekend = targetDate.getDay() === 0;

  document.getElementById("weekNum").textContent = `Week ${weekIndex + 1}`;
  document.getElementById("dayName").textContent = today.name;
  document.getElementById("mealTime").textContent =
    currentMeal === "none"
      ? "No meal time"
      : currentMeal.charAt(0).toUpperCase() + currentMeal.slice(1);

  // show which date we're viewing
  const viewing = document.getElementById("viewingDate");
  if (viewing) {
    const opts = {
      weekday: "long",
      year: "numeric",
      month: "short",
      day: "numeric",
    };
    viewing.textContent =
      targetDate.toLocaleDateString("en-US", opts) +
      (manualView ? " (viewing)" : "");
  }

  const mealsContainer = document.getElementById("mealsContainer");
  mealsContainer.innerHTML = "";

  const breakfastTime = isWeekend
    ? "10:00 AM - 11:15 AM"
    : "7:00 AM - 9:30 AM";

  const meals = [
    { name: "Breakfast", time: breakfastTime, key: "breakfast" },
    { name: "Lunch", time: "1:00 PM - 3:00 PM", key: "lunch" },
    { name: "Dinner", time: "8:00 PM - 10:00 PM", key: "dinner" },
  ];

  meals.forEach((meal) => {
    const isActive = currentMeal === meal.key && !manualView;
    const card = document.createElement("div");
    card.className = "meal-card" + (isActive ? " active" : "");

    card.innerHTML = `
      <h3>
        ${meal.name}
        ${isActive ? '<span class="status-badge">NOW SERVING</span>' : ""}
      </h3>
      <p style="opacity: 0.8; margin-bottom: 15px;">${meal.time}</p>
      <div class="meal-items">${today[meal.key]}</div>
    `;

    mealsContainer.appendChild(card);
  });

  document.getElementById("menuDisplay").style.display = "block";

  // update nav button states
  updateNavButtons(diffDays, totalDays);
  currentViewOffsetDays = manualView ? viewedOffsetDays : 0;
}

export function updateNavButtons(diffDays, totalDays) {
  const prev = document.getElementById("prevDayBtn");
  const next = document.getElementById("nextDayBtn");
  if (prev) prev.disabled = diffDays <= 0;
  if (next) next.disabled = diffDays >= totalDays - 1;
}
