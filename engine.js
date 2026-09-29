// CapoMath engine - capo and transposition math for guitarists. Pure functions, no DOM.
(function (root) {
  'use strict';

  var NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
  var FLATS = { Db: 1, Eb: 3, Gb: 6, Ab: 8, Bb: 10 };

  function noteIndex(name) {
    if (name in FLATS) return FLATS[name];
    var i = NOTES.indexOf(name);
    if (i < 0) throw new Error('unknown note: ' + name);
    return i;
  }

  // Parse 'Bbmaj7' -> {root:'Bb', suffix:'maj7'}; 'F#m' -> {root:'F#', suffix:'m'}
  function parseChord(chord) {
    var m = /^([A-G](?:#|b)?)(.*)$/.exec(chord.trim());
    if (!m) throw new Error('bad chord: ' + chord);
    return { root: m[1], suffix: m[2] || '' };
  }

  // Transpose a chord by semitones (positive = up).
  function transposeChord(chord, semis) {
    var p = parseChord(chord);
    var idx = ((noteIndex(p.root) + semis) % 12 + 12) % 12;
    return NOTES[idx] + p.suffix;
  }

  // Shapes you play with a capo at fret N: sounding chord transposed DOWN N semitones.
  function shapesForCapo(progression, capo) {
    return progression.map(function (c) { return transposeChord(c, -capo); });
  }

  // Difficulty of one played shape. Open-position friendly chords score low.
  var EASY_ROOTS = { C: 1, G: 1, D: 1, A: 1, E: 1 };
  var EASY_MINORS = { Am: 1, Em: 1, Dm: 2 };
  function chordDifficulty(chord) {
    var p = parseChord(chord);
    var name = p.root + p.suffix;
    if (name in EASY_MINORS) return EASY_MINORS[name];
    if (p.suffix === '' || p.suffix === '7' || p.suffix === 'sus4' || p.suffix === 'sus2' || p.suffix === 'add9') {
      if (p.root in EASY_ROOTS) return p.suffix === '' ? 1 : 2;
    }
    if (p.suffix === 'm7' && (p.root === 'A' || p.root === 'E')) return 2;
    if (name === 'F' || name === 'Fmaj7') return 3;
    if (p.root === 'F' || p.root === 'B' || p.root.indexOf('#') >= 0 || p.root.indexOf('b') >= 0) return 5;
    if (p.suffix === 'm') return (p.root in EASY_ROOTS) ? 2 : 4;
    return 3;
  }

  // Score one capo option over a progression.
  function optionScore(progression, capo) {
    var shapes = shapesForCapo(progression, capo);
    var total = 0, hardest = 0;
    shapes.forEach(function (s) {
      var d = chordDifficulty(s);
      total += d;
      if (d > hardest) hardest = d;
    });
    return { capo: capo, shapes: shapes, total: total, hardest: hardest };
  }

  // Rank capo options 0..maxFret: sort by hardest chord, then total difficulty.
  function rankCapos(progression, maxFret) {
    var opts = [];
    for (var f = 0; f <= maxFret; f++) opts.push(optionScore(progression, f));
    opts.sort(function (a, b) {
      if (a.hardest !== b.hardest) return a.hardest - b.hardest;
      if (a.total !== b.total) return a.total - b.total;
      return a.capo - b.capo;
    });
    return opts;
  }

  // Singer mode: sounding key, target shape key -> capo fret (0-11, -1 if impossible to raise).
  function capoForKey(soundingKey, shapeKey) {
    var diff = (noteIndex(soundingKey) - noteIndex(shapeKey) + 12) % 12;
    return diff; // capo this many frets so shapeKey shapes sound in soundingKey
  }

  var api = {
    noteIndex: noteIndex,
    parseChord: parseChord,
    transposeChord: transposeChord,
    shapesForCapo: shapesForCapo,
    chordDifficulty: chordDifficulty,
    optionScore: optionScore,
    rankCapos: rankCapos,
    capoForKey: capoForKey
  };
  root.CapoMath = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof window !== 'undefined' ? window : globalThis);
