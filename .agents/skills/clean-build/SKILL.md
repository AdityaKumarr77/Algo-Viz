---
name: clean-build
description: Cleans stale tsbuildinfo files and runs typecheck and production bundle builds with zero errors.
---

# Clean Build & Verify Skill

When validating or fixing build errors:
1. Clear any stale `*.tsbuildinfo` or cache files if schema changed.
2. Run `tsc -b` to verify strict TypeScript adherence with no unreferenced variables.
3. Run `vite build` to guarantee proper asset generation.
