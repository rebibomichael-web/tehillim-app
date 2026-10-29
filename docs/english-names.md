# English to Hebrew names

Hand-built lookup for a future English name field. The app does not read this file. Prayer and Psalm text are unchanged.

`data/english-names.json` is the table. `node tests/validate-english-names.js` (or `npm run test:names`) checks it.

## Shape

```json
{
  "version": 1,
  "notes": "short description of the file",
  "names": {
    "shmuel": {"he": "שמואל", "gender": "m", "translit": "Shmuel"}
  },
  "lookup": {
    "sam": {"options": ["שמואל", "שמשון"], "gender": "m", "confidence": "common", "note": "optional"}
  }
}
```

- `names` is the catalog of Hebrew names. `he` is the spelling without nikud, with final letters (ך ם ן ף ץ). `gender` is `m`, `f`, or `u` (used for both).
- `variants` lists another spelling of the **same** name already in the catalog, when the letters differ (אהרן and אהרון). Different people are not variants. גרשון and גרשם are different names.
- `lookup` keys are lowercase ASCII. `options` is 1 to 3 Hebrew spellings from `names`, most likely first. `confidence` is `common` or `loose`.
- A `note` is a caution for the person maintaining the table. It is not text to show as a prayer.

## Rules

1. Cover common Jewish given names, English forms, nicknames, and the usual Hebrew transliterations, for men and women.
2. Do not match by sound. Every option is a real Hebrew name: a biblical or traditional name, or a standard kinnui (Zalman is שלמה, Hershel is צבי, Leib is אריה, Faiga is ציפורה, Pearl is פנינה). If the link is uncertain, omit the key or set `confidence` to `loose`.
3. Spellings that change the letters are separate options, with a short note. חים is an old spelling of חיים and is not common enough to offer.
4. No nikud. Use final letters.

`loose` means: show the options, and do not treat them as settled. `common` means the pairing is the usual one. The confirm step below still applies to both.

## Planned use

This is not built yet.

1. The person types an English name.
2. The app shows the 1–3 Hebrew options for that key. They tap one.
3. If the key is missing, they type the name on a Hebrew keyboard.
4. Before the booklet is built, a confirm screen shows the Hebrew name, its letters, and the stanzas those letters produce.
5. The screen asks them to use the spelling on the matzeivah or the ketubah, and to ask the family or a rabbi if they are unsure.

## Left out on purpose

Harry and Max are not keys. Each was used in American families for more than one Hebrew name, and a guess would be a sound-alike or a family habit, not a standard name.

These spellings are the same name as a key that is already listed, and do not have their own key yet: Aharon (see aaron), Benny, Boruch, Danny, Debbie, Esti, Feiga, Josh, Mendel, Meyer, Moti, Shimshon (offered under sam), Sruli, Suri, Velvel, Wolf, Yankel, Yosef (see joseph), Zipporah, Avigail, Devorah, Elisheva, Reuven, Shaul, Shimon, Yehoshua.

שמחה and בת שבע are real names and are not in this version.
