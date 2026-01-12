---
globs: scripts/*
description: All bootstrap scripts must be safe to re-run and enable immediate
  repo publication.
alwaysApply: false
---

Ensure bootstrap scripts support setting git remote and pushing (PS: -Origin/-Push, Bash: --origin/--push), and are idempotent