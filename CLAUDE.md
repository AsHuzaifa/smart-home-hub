# Smart Home Hub — ashuzaifa

Stack: React + Vite + TypeScript | 3D: React Three Fiber + drei | Rules UI: React Flow | State: Zustand
OS: Windows | Node: D:\Node.js | Deploy: not yet — working on localhost until 100% complete, then Vercel/Netlify

Read `.claude/rules/conventions.md` at the start of every session — it's the full build log and current status.

## Development

```
npm run dev -- --port 5183
```

Note: this repo lives outside the sandbox's default working directory, so shell commands
can't `cd` into it — prefix npm/npx commands with `--prefix "D:/smart-home-hub"` instead, e.g.
`npx --prefix "D:/smart-home-hub" tsc --noEmit -p "D:/smart-home-hub/tsconfig.app.json"`.

## Git

Remote is `https://github.com/AsHuzaifa/smart-home-hub.git`, branch `main`. The user pushes to
GitHub themselves — don't commit/push unless explicitly asked.
