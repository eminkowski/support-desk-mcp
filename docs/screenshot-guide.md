# Screenshot guide — final set

Primary case-study sequence (order on the page):

| File | Capture | Role |
|------|---------|------|
| `action-review.png` | 11:56:43 PM | **Hero** — review before confirm |
| `workspace.png` | 11:56:05 PM | Normal — six tickets, Duplicate invoice selected, Assist context, no proposal yet |
| `action-completed.png` | 11:57:16 PM | Completed — Assist Done + updated thread |

Published copies:

- `support-desk-mcp/docs/screenshots/`
- `minkow-ski/public/projects/support-desk-mcp/`

Audit architecture is covered in case-study copy. Keep `tool-log.png` in docs for reference; it is not one of the three main screenshots.

## Reshoot checklist

```bash
pnpm db:seed
```

Hard refresh → filters Any/Anyone/All → select Duplicate invoice notifications → capture normal → Draft → capture review → confirm → capture completed.
