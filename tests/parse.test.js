// Lightweight test runner for chunk-based split logic
// Runs with: node tests\parse.test.js

function splitContent(content) {
  let lunch = "Not available";
  let dinner = "Not available";
  let splitIndex = -1;
  const dinnerMarker = content.search(/\bDinner\b|\bdinner\b/);
  if (dinnerMarker >= 0) splitIndex = dinnerMarker;
  let chunkHandled = false;

  if (splitIndex < 0 && content.indexOf('+') >= 0) {
    const chunks = content.split('+').map(c => c.trim()).filter(Boolean);
    const strongDinnerKeywords = ["murgh","channa","chana","daal","chawal","nuggets","gosht","karahi","nihari","haleem"];
    const weakDinnerKeywords = ["biryani","pasta","macaroni","rice","pulao","special","korma","handi","qeema","palak"];
    let chunkBoundary = -1;
    let intraChunkSplit = null;

    for (let i = 1; i < chunks.length; i++) {
      const chunk = chunks[i];
      const lower = chunk.toLowerCase();
      for (const kw of strongDinnerKeywords) {
        const kidx = lower.indexOf(kw);
        if (kidx >= 0) {
          chunkBoundary = i;
          if (kidx > 0) {
            const leftCandidate = chunk.substring(0, kidx).trim().toLowerCase();
            const smallLeftWords = ['salad','raita','tang','rooh','afza','chutney','pickle','sauce'];
            const leftWords = leftCandidate.split(/\s+/).filter(Boolean);
            if (leftWords.some(w => smallLeftWords.includes(w)) || /[^a-zA-Z\s]/.test(leftCandidate)) {
              intraChunkSplit = { idx: kidx, chunkIndex: i, keyword: kw };
            }
          }
          break;
        }
      }
      if (chunkBoundary >= 0) break;
    }

    if (chunkBoundary < 0) {
      let firstWeak = -1;
      for (let i = 0; i < chunks.length; i++) {
        const chunk = chunks[i];
        const lower = chunk.toLowerCase();
          for (const kw of weakDinnerKeywords) {
            const kidx = lower.indexOf(kw);
            if (kidx >= 0) {
              if (firstWeak === -1) firstWeak = i;
              if (i > 0) {
                chunkBoundary = i;
                if (kidx > 0) {
                  const leftCandidate = chunk.substring(0, kidx).trim().toLowerCase();
                  const smallLeftWords = ['salad','raita','tang','rooh','afza','chutney','pickle','sauce'];
                  const leftWords = leftCandidate.split(/\s+/).filter(Boolean);
                  if (leftWords.some(w => smallLeftWords.includes(w)) || /[^a-zA-Z\s]/.test(leftCandidate)) {
                    intraChunkSplit = { idx: kidx, chunkIndex: i, keyword: kw };
                  }
                }
                break;
              }
            }
          }
        if (chunkBoundary >= 0) break;
      }
      if (chunkBoundary < 0 && firstWeak >= 0) chunkBoundary = firstWeak;
    }

    if (chunkBoundary >= 0) {
      const lunchChunks = chunks.slice(0, chunkBoundary);
      if (intraChunkSplit && intraChunkSplit.chunkIndex === chunkBoundary) {
        const chunkText = chunks[chunkBoundary];
        const idx = chunkText.toLowerCase().indexOf(intraChunkSplit.keyword);
        const leftPart = chunkText.substring(0, idx).trim();
        const rightPart = chunkText.substring(idx).trim();
        if (leftPart) lunchChunks.push(leftPart);
        lunch = lunchChunks.join(' + ');
        const dinnerChunks = [rightPart].concat(chunks.slice(chunkBoundary + 1));
        dinner = dinnerChunks.join(' + ');
        chunkHandled = true;
      } else {
        lunch = chunks.slice(0, chunkBoundary).join(' + ');
        dinner = chunks.slice(chunkBoundary).join(' + ');
        chunkHandled = true;
      }
    }
  }

  if (splitIndex > 0 && !chunkHandled) {
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
  } else if (!chunkHandled) {
    const words = content.split(" ");
    const mid = Math.floor(words.length / 2);
    lunch = words.slice(0, mid).join(" ");
    dinner = words.slice(mid).join(" ");
  }

  return { lunch, dinner };
}

const tests = [
  {
    input: "White Sauce Pasta Daal Chawal + Nuggets",
    expected: { lunch: "White Sauce Pasta Daal Chawal", dinner: "Nuggets" }
  },
  {
    // No '+' between Salad and Murgh — intra-chunk split should separate correctly
    input: "Chicken Biryani + Raita + Tang/Rooh Afza + Salad Murgh Channa + Chipaati + Salad",
    expected: { lunch: "Chicken Biryani + Raita + Tang/Rooh Afza + Salad", dinner: "Murgh Channa + Chipaati + Salad" }
  },
  {
    // Weak keyword in later chunk
    input: "Veg Pulao + Chicken Karahi + Salad",
    expected: { lunch: "Veg Pulao", dinner: "Chicken Karahi + Salad" }
  }
];

let failed = 0;
for (const t of tests) {
  const out = splitContent(t.input);
  const pass = out.lunch === t.expected.lunch && out.dinner === t.expected.dinner;
  console.log('\nTest input:', t.input);
  console.log('Expected:', t.expected);
  console.log('Got     :', out);
  console.log('Result  :', pass ? 'PASS' : 'FAIL');
  if (!pass) failed++;
}

if (failed > 0) {
  console.error(`\n${failed} test(s) failed.`);
  process.exit(1);
} else {
  console.log('\nAll tests passed ✅');
  process.exit(0);
}
