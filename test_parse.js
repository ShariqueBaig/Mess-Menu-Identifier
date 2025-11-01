function parseMenu(text) {
  let menuData = { weeks: [] };
  text = text.replace(/\s+/g, " ");
  const weekPattern = /Week (\d+)(.*?)(?=Week \d+|$)/gs;
  const weekMatches = [...text.matchAll(weekPattern)];
  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

  for (let w = 0; w < weekMatches.length && w < 4; w++) {
    const weekText = weekMatches[w][2];
    const weekData = { days: [] };

    for (let d = 0; d < days.length; d++) {
      const day = days[d];
      const nextDay = days[d + 1];
      let pattern;

      if (nextDay) {
        pattern = new RegExp(day + "\\s+Breakfast\\*?\\s+(.*?)\\s+" + nextDay, "s");
      } else {
        pattern = new RegExp(day + "\\s+Breakfast\\*?\\s+(.*?)(?=Breakfast\\*\\s*:|Week|$)", "s");
      }

      const match = weekText.match(pattern);

      if (match) {
        let content = match[1].trim();
        content = content.replace(/\s+/g, " ").trim();

        let lunch = "Not available";
        let dinner = "Not available";

        // heuristics
        let splitIndex = -1;
        const dinnerMarker = content.search(/\bDinner\b|\bdinner\b/);
        if (dinnerMarker >= 0) splitIndex = dinnerMarker;
        if (splitIndex < 0) {
          const plusIdx = content.lastIndexOf('+');
          if (plusIdx >= 0) {
            const dinnerKeywordsBeforePlus = ["Daal", "Chawal", "Biryani", "Pulao", "Rice", "Murgh", "Gosht", "Nuggets"];
            let chosenBeforePlus = -1;
            for (const kw of dinnerKeywordsBeforePlus) {
              const re = new RegExp("\\b" + kw + "\\b", "ig");
              let m;
              while ((m = re.exec(content)) !== null) {
                if (m.index < plusIdx) {
                  if (chosenBeforePlus === -1 || m.index < chosenBeforePlus) chosenBeforePlus = m.index;
                }
              }
            }
            if (chosenBeforePlus >= 0) {
              splitIndex = chosenBeforePlus;
            } else {
              splitIndex = plusIdx;
            }
          }
        }
        if (splitIndex < 0) {
          const dinnerKeywords = [
            "Biryani", "Nihari", "Haleem", "Karahi", "Korma", "Handi", "Qeema", "Pulao", "Palak",
            "Murgh", "Special", "Nuggets", "Macaroni", "Pasta", "Gosht", "Rice", "Chawal", "Daal"
          ];
          const occurrences = [];
          for (const keyword of dinnerKeywords) {
            const re = new RegExp("\\b" + keyword + "\\b", "ig");
            let m;
            while ((m = re.exec(content)) !== null) {
              occurrences.push(m.index);
            }
          }
          if (occurrences.length > 0) {
            occurrences.sort((a, b) => a - b);
            for (const idx of occurrences) {
              const leftWords = content.substring(0, idx).trim().split(/\s+/).filter(Boolean).length;
              const rightWords = content.substring(idx).trim().split(/\s+/).filter(Boolean).length;
              if (leftWords >= 1 && rightWords >= 1) {
                splitIndex = idx;
                break;
              }
            }
          }
        }

        if (splitIndex > 0) {
          let splitAt = splitIndex;
          if (content[splitAt] === '+') {
            const left = content.substring(0, splitAt).trim();
            const right = content.substring(splitAt + 1).trim();
            if (!right) {
              const words = content.split(" ");
              const mid = Math.floor(words.length / 2);
              lunch = words.slice(0, mid).join(" ");
              dinner = words.slice(mid).join(" ");
            } else {
              lunch = left;
              dinner = right;
            }
          } else {
            let left = content.substring(0, splitAt).trim();
            let right = content.substring(splitAt).trim();
            right = right.replace(/^Dinner[:\-\s]*/i, "").trim();
            const remainingWords = right.split(/\s+/).filter(Boolean).length;
            if (remainingWords < 1) {
              const words = content.split(" ");
              const mid = Math.floor(words.length / 2);
              lunch = words.slice(0, mid).join(" ");
              dinner = words.slice(mid).join(" ");
            } else {
              lunch = left;
              dinner = right;
            }
          }
        } else {
          const words = content.split(" ");
          const mid = Math.floor(words.length / 2);
          lunch = words.slice(0, mid).join(" ");
          dinner = words.slice(mid).join(" ");
        }

        lunch = lunch || "Not available";
        dinner = dinner || "Not available";

        const dayData = { name: day, lunch, dinner };
        weekData.days.push(dayData);
      }
    }
    if (weekData.days.length > 0) menuData.weeks.push(weekData);
  }
  return menuData;
}

// Test string based on the screenshot
const sample = `Week 1
Monday Breakfast White Sauce Pasta Daal Chawal + Nuggets
Tuesday Breakfast X`;

const parsed = parseMenu(sample);
console.log(JSON.stringify(parsed, null, 2));
