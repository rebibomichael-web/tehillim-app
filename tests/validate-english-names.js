#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, '..', 'data', 'english-names.json');
const raw = fs.readFileSync(file, 'utf8');
const errors = [];

function fail(msg) {
  errors.push(msg);
}

function duplicateKeys(text) {
  const stack = [];
  const found = [];
  let i = 0;
  while (i < text.length) {
    const c = text[i];
    if (c === '"') {
      i += 1;
      let s = '';
      while (i < text.length) {
        if (text[i] === '\\') {
          s += text[i + 1] || '';
          i += 2;
          continue;
        }
        if (text[i] === '"') break;
        s += text[i];
        i += 1;
      }
      i += 1;
      let j = i;
      while (j < text.length && /\s/.test(text[j])) j += 1;
      if (text[j] === ':' && stack.length) {
        const bag = stack[stack.length - 1];
        if (bag.has(s)) found.push(s);
        bag.add(s);
      }
      continue;
    }
    if (c === '{') stack.push(new Set());
    else if (c === '}') stack.pop();
    i += 1;
  }
  return found;
}

const sampleDupes = duplicateKeys('{"a":1,"a":2,"b":{"c":3,"c":4}}');
if (sampleDupes.join(',') !== 'a,c') {
  console.error('Duplicate-key check is broken: ' + sampleDupes.join(','));
  process.exit(1);
}
const dupes = duplicateKeys(raw);

let data;
try {
  data = JSON.parse(raw);
} catch (err) {
  console.error('Invalid JSON: ' + err.message);
  process.exit(1);
}
if (dupes.length) fail('Duplicate keys: ' + dupes.join(', '));

if (!data || data.version !== 1) fail('version must be 1');
if (!data.names || typeof data.names !== 'object') fail('names object missing');
if (!data.lookup || typeof data.lookup !== 'object') fail('lookup object missing');

const HEB = /^[\u05D0-\u05EA]+(?: [\u05D0-\u05EA]+)*$/;
const NIKUD = /[\u0591-\u05C7]/;
const FINALS = new Set(['ך', 'ם', 'ן', 'ף', 'ץ']);
const NONFINAL = new Set(['כ', 'מ', 'נ', 'פ', 'צ']);
const KEY = /^[a-z]+$/;
const GENDER = new Set(['m', 'f', 'u']);
const CONF = new Set(['common', 'loose']);

function checkHebrew(label, text) {
  if (typeof text !== 'string' || !HEB.test(text)) {
    fail(label + ' is not Hebrew letters: ' + JSON.stringify(text));
    return;
  }
  if (NIKUD.test(text)) fail(label + ' contains nikud: ' + text);
  for (const word of text.split(' ')) {
    for (let i = 0; i < word.length; i++) {
      const ch = word[i];
      const last = i === word.length - 1;
      if (FINALS.has(ch) && !last) fail(label + ' has a final letter inside ' + word);
      if (NONFINAL.has(ch) && last) fail(label + ' ends on a non-final letter: ' + word);
    }
  }
}

const byHe = Object.create(null);
const genderOf = Object.create(null);
for (const [id, entry] of Object.entries(data.names || {})) {
  if (!entry || typeof entry !== 'object') {
    fail('Bad name entry ' + id);
    continue;
  }
  checkHebrew('names.' + id, entry.he);
  if (!GENDER.has(entry.gender)) fail('names.' + id + ' gender must be m, f, or u');
  if (typeof entry.translit !== 'string' || !entry.translit.trim()) fail('names.' + id + ' needs a translit');
  if (entry.variants !== undefined) {
    if (!Array.isArray(entry.variants) || !entry.variants.length) fail('names.' + id + ' variants must be a non-empty array');
    entry.variants.forEach((v) => checkHebrew('names.' + id + ' variant', v));
  }
  if (entry.note !== undefined && typeof entry.note !== 'string') fail('names.' + id + ' note must be a string');
  if (byHe[entry.he]) fail('Duplicate Hebrew spelling ' + entry.he);
  byHe[entry.he] = id;
  genderOf[entry.he] = entry.gender;
}

for (const [id, entry] of Object.entries(data.names || {})) {
  for (const v of entry.variants || []) {
    if (!byHe[v]) fail('names.' + id + ' variant is not in the table: ' + v);
    if (v === entry.he) fail('names.' + id + ' lists itself as a variant');
  }
}

const used = new Set();
for (const [key, entry] of Object.entries(data.lookup || {})) {
  if (!KEY.test(key)) fail('Lookup key must be lowercase ASCII: ' + JSON.stringify(key));
  if (!entry || !Array.isArray(entry.options)) {
    fail('lookup.' + key + ' needs options');
    continue;
  }
  if (entry.options.length < 1 || entry.options.length > 3) {
    fail('lookup.' + key + ' must have 1 to 3 options');
  }
  if (new Set(entry.options).size !== entry.options.length) fail('lookup.' + key + ' has duplicate options');
  if (!GENDER.has(entry.gender)) fail('lookup.' + key + ' gender must be m, f, or u');
  if (!CONF.has(entry.confidence)) fail('lookup.' + key + ' confidence must be common or loose');
  if (entry.note !== undefined && typeof entry.note !== 'string') fail('lookup.' + key + ' note must be a string');
  const genders = new Set();
  for (const opt of entry.options) {
    checkHebrew('lookup.' + key, opt);
    if (!byHe[opt]) fail('lookup.' + key + ' option is not in names: ' + opt);
    else genders.add(genderOf[opt]);
    used.add(opt);
  }
  if (entry.gender === 'm' && genders.has('f')) fail('lookup.' + key + ' is m but offers a feminine name');
  if (entry.gender === 'f' && genders.has('m')) fail('lookup.' + key + ' is f but offers a masculine name');
  if (genders.has('m') && genders.has('f') && entry.gender !== 'u') {
    fail('lookup.' + key + ' mixes m and f names');
  }
}

for (const [he, id] of Object.entries(byHe)) {
  if (!used.has(he)) fail('Hebrew name is never offered: ' + he + ' (' + id + ')');
}

function opt(key) {
  const entry = data.lookup[key];
  if (!entry) fail('Missing example key ' + key);
  return entry;
}
const examples = {
  sam: ['שמואל', 'שמשון'],
  mike: ['מיכאל'],
  mickey: ['מיכאל'],
  dave: ['דוד'],
  aaron: ['אהרן', 'אהרון'],
  isaac: ['יצחק'],
  ike: ['יצחק'],
  jack: ['יעקב'],
  jacob: ['יעקב'],
  jake: ['יעקב'],
  joe: ['יוסף'],
  moe: ['משה'],
  moshe: ['משה'],
  abe: ['אברהם'],
  sarah: ['שרה'],
  sally: ['שרה'],
  rachel: ['רחל'],
  leah: ['לאה'],
  chaya: ['חיה'],
  esther: ['אסתר'],
  mimi: ['מרים'],
  hannah: ['חנה'],
  ann: ['חנה'],
  yehuda: ['יהודה'],
  jude: ['יהודה'],
  hyman: ['חיים'],
  chaim: ['חיים'],
  shmuel: ['שמואל'],
  yitzchak: ['יצחק'],
  yaakov: ['יעקב'],
  yossi: ['יוסף'],
  avraham: ['אברהם'],
  rivky: ['רבקה', 'ריבקה'],
  chana: ['חנה'],
  mendy: ['מנחם']
};
for (const [key, options] of Object.entries(examples)) {
  const entry = opt(key);
  if (!entry) continue;
  if (JSON.stringify(entry.options) !== JSON.stringify(options)) {
    fail(key + ' options are ' + JSON.stringify(entry.options));
  }
}
const rebecca = opt('rebecca');
if (rebecca && rebecca.options[0] !== 'רבקה') fail('rebecca should list רבקה first');
const ida = opt('ida');
if (ida && (ida.confidence !== 'loose' || ida.options[0] !== 'חיה')) fail('ida should be a loose link to חיה');
const eli = opt('eli');
if (eli && eli.confidence !== 'loose') fail('eli should be loose');
if (data.lookup.harry || data.lookup.max) fail('Harry and Max must stay omitted');
if (opt('michael') && opt('michael').options.indexOf('מיכל') !== -1) fail('Michael must not offer מיכל');
if (opt('michal') && opt('michal').options[0] !== 'מיכל') fail('Michal must be מיכל');

const keys = Object.keys(data.lookup || {});
const names = Object.values(data.names || {});
const count = (g) => names.filter((n) => n.gender === g).length;

if (errors.length) {
  console.error(errors.join('\n'));
  process.exit(1);
}

console.log('English keys: ' + keys.length);
console.log('Distinct Hebrew names: ' + names.length);
console.log('Gender m/f/u: ' + count('m') + '/' + count('f') + '/' + count('u'));
console.log('Loose keys: ' + keys.filter((k) => data.lookup[k].confidence === 'loose').join(', '));
const variantIds = Object.entries(data.names).filter(([, n]) => n.variants && n.variants.length);
console.log('Names with variants: ' + variantIds.map(([id, n]) => n.he + ' [' + n.variants.join(', ') + ']').join('; '));
