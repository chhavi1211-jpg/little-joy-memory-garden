<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

## Architecture rules
- All user data goes through `src/lib/app-data.tsx` (one provider): guests use localStorage, signed-in users use Cloud tables with owner-only RLS. Why: guest mode and sync share one API.
- Memories carry a `source` field; future importers (e.g. Google Photos) must add rows via the same provider and require explicit user approval per photo. Why: keeps imports pluggable and consent-driven.
- Photos live in the private `memories` bucket under `<user_id>/...`, shown via signed URLs; images are downscaled client-side (strips EXIF/GPS). Why: privacy by default.
- Never surface archived or "avoid" memories anywhere (use `resurfaceable`). Why: core user trust rule.
- Activity check-ins store the latest response per catalog slug in private preferences through the shared data provider; shared Completion resolves its activity from the catalog path. Why: guest/account storage, export and deletion stay consistent without tracking completion history.
