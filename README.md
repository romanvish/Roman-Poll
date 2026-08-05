# Roman Poll

Roman Poll is a statically generated, voter-driven college football Top 25. It combines AP-style ballots into a weekly ranking while publishing every vote and the editorial context behind each edition.

## Development

Requires Node.js 20.19 or newer.

```bash
npm install
npm run dev
```

Quality checks:

```bash
npm run validate:data
npm run lint
npm run typecheck
npm test
npm run build
npm run verify:export
```

The production build is a static export in `out/`. GitHub Actions applies the `/Roman-Poll` base path and deploys that directory to GitHub Pages; local development uses `/`.

## Routes

- `/` renders the latest available edition.
- `/polls/<season>/week/<week>/` renders a permanent ranking edition.
- `/ballots/<season>/week/<week>/` renders the ballots behind that edition.
- `/compare/<season>/week/<week>/` compares two ballots; `left` and `right` query parameters make selections shareable.
- `/voters/<id>/` renders a professional voter profile and voter-versus-field analysis.
- `/teams/<id>/` renders a team’s ranking and points history.
- `/about/` explains the scoring method and voter panel.

## Publishing an edition

Add `data/<season>/Week<number>.json`. The build discovers files automatically, so there is no manifest to maintain. The folder, filename, and embedded `season` and `week` values must agree.

```json
{
  "season": 2026,
  "week": 3,
  "publishedAt": "2026-09-14",
  "editorial": {
    "headline": "Edition headline",
    "dek": "A short summary of the week.",
    "analysis": ["Analysis paragraph."],
    "highlights": [
      { "label": "Trend", "title": "Highlight title", "body": "Highlight detail." }
    ]
  },
  "voters": [
    {
      "voterId": "jane-doe",
      "ballot": [
        { "rank": 1, "team": "Georgia", "record": "3-0" }
      ]
    }
  ]
}
```

Each voter must exist in `data/voters.json`, and every ballot must contain exactly one entry for each rank from 1 through 25. Validation also rejects duplicate teams, duplicate voters, conflicting records, invalid editorial content, and season/week mismatches.

Rankings award 25 points for first place through one point for 25th. Ties are resolved by average ballot rank and then team name.

## Team logos

Team identity is managed once in `data/teams.json`:

```json
{
  "id": "georgia",
  "name": "Georgia",
  "abbreviation": "UGA",
  "logo": "/team-logos/georgia.svg"
}
```

Place supplied SVG, PNG, or WebP files in `public/team-logos/` and keep the path in the registry in sync. Every ballot team must have a registry entry. Image files themselves are optional: if a file has not been supplied, the UI displays the team abbreviation without failing the build. Public image URLs are automatically prefixed for GitHub Pages.

## Voter profiles

Voters live in `data/voters.json` and support structured profile content:

```json
{
  "id": "jane-doe",
  "name": "Jane Doe",
  "title": "Sports Editor",
  "affiliation": "Gridiron Weekly",
  "photo": "/voters/jane-doe.webp",
  "location": "Optional location",
  "specialties": ["Optional coverage specialty"],
  "bio": ["First biography paragraph.", "Additional paragraph."],
  "links": [{ "label": "Professional profile", "url": "https://example.com" }]
}
```

Place portraits in `public/voters/`. Missing photos fall back to initials. Biography paragraphs, location, specialties, and links are optional, so profile pages remain valid while content is being prepared.

## Viewer insights

The “higher/lower than the field” calculation removes the selected voter from the comparison, averages every other ballot, and treats an omitted team as rank 26. A positive difference means the voter placed that team higher than the rest of the panel; a negative difference means lower. Consensus indicators also treat omissions as rank 26 and use the full ballot rank range and standard deviation.

Team pages and sparklines are generated automatically from all available weekly editions. Comparison URLs use `?left=<voter-id>&right=<voter-id>` and safely fall back to the first two distinct voters when the requested pair is invalid.
