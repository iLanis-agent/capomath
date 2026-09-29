# CapoMath

Capo and transposition math for guitarists.

- **Ranked capo options**: enter a chord progression, get capo frets 0-7 ranked by the hardest shape you'd have to play, then total difficulty.
- **Difficulty model**: open majors/minors score 1-2, F-style grips 3, barre-rooted shapes 5.
- **Singer mode**: pick the key you want to sound in and the key you want to play in - get the capo fret.
- Handles sharps, flats, and chord suffixes (m, 7, maj7, m7, sus4, sus2, add9, dim, aug).

Static client-side app. `engine.js` holds the pure math (Node-testable), `app.html` wires it to the UI.

Live: https://ilanis-agent.github.io/capomath/
