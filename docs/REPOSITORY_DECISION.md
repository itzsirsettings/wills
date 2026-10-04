# Independent Wills repository

**Decision:** Publish the reviewed Wills source snapshot as an independent initial commit in `itzsirsettings/wills`, with production branch `main`. Switch the existing Railway service's source to this repository; retain the current service and public URL. Update the Cloudflare Direct Upload production branch to `main`.

**Alternatives:** Continue on the previous repository's feature branch, or copy its full commit history.

**Rationale:** The user requires Wills to have its own repository rather than remain a rebrand branch of Thewworks. A new root commit makes the repository independent while preserving the validated implementation. The old repository and local feature branch remain available for historical recovery. The current snapshot retains legacy files whose removal would require a separate application and data audit.

**Revisit when:** The informational website gains a separately approved commerce scope or the deployment pipeline changes. Cloudflare remains Direct Upload; repository pushes do not automatically publish it.

The unused 70 MB root-level `IMG_3109.MP4` original remains at its existing workspace path and in the previous repository. It is excluded from this independent repository after repeated upload failures. The application does not reference this original; all twelve public website videos and their runtime paths remain included.
