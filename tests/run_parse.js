const fs = require('fs');
const vm = require('vm');

const html = fs.readFileSync(__dirname + '/../index.html', 'utf8');
const startToken = 'function parseMenu(text)';
const endToken = 'function getCurrentMealTime';
const start = html.indexOf(startToken);
if (start === -1) {
  console.error('parseMenu start not found');
  process.exit(2);
}
const end = html.indexOf(endToken, start);
if (end === -1) {
  console.error('parseMenu end marker not found');
  process.exit(2);
}

const fnCode = html.slice(start, end);
const wrapper = `(() => {\n${fnCode}\n return { parseMenu };\n})()`;

const script = new vm.Script(wrapper, { filename: 'parseMenuFromHtml.vm.js' });
const context = vm.createContext({ console, require, module, process });
const exported = script.runInContext(context);
if (!exported || !exported.parseMenu) {
  console.error('Failed to load parseMenu');
  process.exit(3);
}

const parseMenu = exported.parseMenu;

// Craft a sample PDF-extracted text containing Week 1 and Wednesday content
const sample = `Week 1\nMonday Breakfast A\nTuesday Breakfast B\nWednesday Breakfast Daal Channa + Chipaati + Paratha + Salad + Achaar Special\nThursday Breakfast D\nFriday Breakfast E\nSaturday Breakfast F\nSunday Breakfast G\n`;

const parsed = parseMenu(sample);
if (!parsed || !parsed.weeks || parsed.weeks.length === 0) {
  console.error('No weeks parsed');
  console.log(JSON.stringify(parsed, null, 2));
  process.exit(4);
}

const w0 = parsed.weeks[0];
const wed = w0.days[2];
console.log('Parsed Wednesday:');
console.log('Lunch:', wed.lunch);
console.log('Dinner:', wed.dinner);

// Exit code 0
