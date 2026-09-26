# Task-agent snapshot ledger

**Reviewed:** September 19, 2026  
**Baseline:** local `main` at `9713900`

The September 19 entries below are historical review decisions. See the
September 26 completion record at the end for verified archive execution and
the disposition of the newer task branches.

This ledger records the disposition of the 21 `subrepl-*` branches retained by
the September 19 safe cleanup. Branch names were not used as deletion evidence.
Each tip was compared with `main` by ancestry, patch identity, tree difference,
commit date, subject, and changed paths.

## Decision

All 21 retained snapshots are classified **ARCHIVE**.

- None is the checked-out branch.
- Their last commits date from June 22 through September 7, 2026.
- Every branch is behind the current `main`.
- Every branch has at least one commit that Git cannot prove patch-equivalent to
  `main`, so direct deletion would discard an unverified recovery path.
- Their application trees are substantially older than `main`; restoring one as
  a whole branch would remove later source, test, and documentation work.
- Protected refs under
  `refs/archive/2026-09-19/task-agent-snapshots/<branch>` preserve each exact tip
  before the corresponding local branch and task-agent remote are removed.

`ARCHIVE` means the live branch and its matching `subrepl-*` SSH remote can be
removed after the archive ref is verified. It does not mean the commit is
approved for merge.

## Snapshot dispositions

| Disposition | Branch | Tip | Last commit | Owner-visible evidence |
|---|---|---:|---:|---|
| ARCHIVE | `subrepl-2jrgbhf7` | `dc98226` | 2026-08-27 | Offline PWA/release-doc snapshot; 5 non-equivalent patches, 39 commits behind current `main`. |
| ARCHIVE | `subrepl-3wpfl1ts` | `04c3dab` | 2026-08-27 | Credential-revocation/sync-doc snapshot; ancestor of later archived variants, 9 non-equivalent patches. |
| ARCHIVE | `subrepl-4nkov54x` | `6c2298d` | 2026-08-27 | Same final tree as `subrepl-3wpfl1ts`, but a distinct 10-commit history; preserve the exact tip. |
| ARCHIVE | `subrepl-56e7mbfn` | `80c8fe4` | 2026-08-27 | Ownership-handoff evidence; ancestor of several later snapshots, 7 non-equivalent patches. |
| ARCHIVE | `subrepl-5mwfsrhj` | `067e3f9` | 2026-08-27 | Same final tree as `subrepl-56e7mbfn`, but its history includes 7 non-equivalent patches. |
| ARCHIVE | `subrepl-6qw9a8le` | `0a11e81` | 2026-08-27 | Privacy/OAuth readiness snapshot; 6 non-equivalent patches and an obsolete application tree. |
| ARCHIVE | `subrepl-c2svva3y` | `8a339fb` | 2026-09-03 | Account/date-isolation regression work; 1 non-equivalent patch, 26 commits behind. |
| ARCHIVE | `subrepl-dyfz1crs` | `1820d1b` | 2026-09-03 | Ritual recurrence overrides; 2 non-equivalent patches, 26 commits behind. |
| ARCHIVE | `subrepl-g62siryu` | `4eb52d5` | 2026-08-27 | Real-device PWA handoff evidence; 8 non-equivalent patches, 39 commits behind. |
| ARCHIVE | `subrepl-mksjmjej` | `a50954f` | 2026-09-03 | Release-truth reconciliation; 11 non-equivalent patches, 30 commits behind. |
| ARCHIVE | `subrepl-n88jpxod` | `a65c12a` | 2026-08-27 | Recurrence/celestial/oracle verification; 1 non-equivalent patch, 39 commits behind. |
| ARCHIVE | `subrepl-pcn8a8kp` | `9c5f14c` | 2026-09-04 | Optional evening wrap-up implementation; 2 non-equivalent patches, 24 commits behind. |
| ARCHIVE | `subrepl-pwns31ro` | `4e26e06` | 2026-09-07 | Hydration-history persistence protection; 2 non-equivalent patches, 15 commits behind. |
| ARCHIVE | `subrepl-q3sj358y` | `eb02bdf` | 2026-08-27 | Oracle-worker boundary evidence; 3 non-equivalent patches, 39 commits behind. |
| ARCHIVE | `subrepl-sz6166uw` | `88b5aa7` | 2026-06-22 | Empty repository commit recording an external Notion update; oldest snapshot and 167 commits behind. |
| ARCHIVE | `subrepl-t8kpzpls` | `515883c` | 2026-08-27 | Release/storage evidence snapshot; 6 non-equivalent patches, 39 commits behind. |
| ARCHIVE | `subrepl-wcuil4g4` | `f44261d` | 2026-09-01 | Offline-cache evidence; descendant of earlier handoff snapshots, 14 non-equivalent patches. |
| ARCHIVE | `subrepl-x44vqos6` | `b85dd55` | 2026-08-27 | Google read-only integration snapshot; 2 non-equivalent patches, 39 commits behind. |
| ARCHIVE | `subrepl-xy7q6dpw` | `874ade6` | 2026-08-31 | Release identity/workflow snapshot; descendant of earlier handoff snapshots, 11 non-equivalent patches. |
| ARCHIVE | `subrepl-yu47hifv` | `a1a18ab` | 2026-08-27 | Deployment-checklist snapshot; descendant of earlier handoff snapshots, 10 non-equivalent patches. |
| ARCHIVE | `subrepl-zvdfg7a2` | `c4f7ce9` | 2026-09-01 | Service-worker regression/CI snapshot; descendant of earlier handoff snapshots, 12 non-equivalent patches. |

## Protected work outside this review

The following newer branches were created after the original cleanup inventory
and are not part of this 21-snapshot decision:

- `subrepl-6ultcqod`
- `subrepl-ev09pfdl`
- `subrepl-fsws2c47`
- `subrepl-gex6i0s4`
- `subrepl-rbcofnei`
- `subrepl-t9v7a6mo`
- `subrepl-upnelqsn`
- `subrepl-y9cxg44h`

They remain live so recent task work and recovery paths are not affected.

## Recovery

To inspect an archived snapshot without moving `main`:

```bash
git show refs/archive/2026-09-19/task-agent-snapshots/subrepl-2jrgbhf7
git diff main refs/archive/2026-09-19/task-agent-snapshots/subrepl-2jrgbhf7
```

To restore one as a review branch:

```bash
git branch review/subrepl-2jrgbhf7 \
  refs/archive/2026-09-19/task-agent-snapshots/subrepl-2jrgbhf7
```

Do not merge an archived snapshot wholesale. Review and recover the specific
patch or file needed because every archived tree predates substantial work on
`main`.

## September 26, 2026 completion record

The owner delegated selection and publication of the best file versions to
`origin/main`. A fresh comparison found Windows, GitHub, and Replit main at
`6cb6320afc3ebf58501576452caae6c2ab79aff0`, with clean working trees. Replit still
had 35 non-main branches, and the September 19 task-snapshot archive namespace
contained no refs. The prior ledger was therefore a decision record, not proof
that its cleanup had executed.

Review covered all 35 branch tips: commit divergence, patch equivalence,
changed paths, exact file contents at the tips, and files absent from current
main. The newer calendar, habits, storage, evening-review, and recurrence work
was already incorporated into main. Older whole-branch trees would remove later
application, testing, and skill updates. Old-only files were retired skills,
the superseded Archive page, an old skill lockfile, and historical pasted
attachments; they remain recoverable rather than being restored into the app.

### Executed preservation and cleanup

- Preserved all 35 exact tips under
  `refs/archive/2026-09-26/reviewed-branches/<original-branch-name>`.
- Created and successfully verified a 22,085,766-byte Git bundle containing
  all refs before deleting any branch:
  `/home/runner/workspace/.cache/reconciliation-2026-09-26/replit-all-refs.bundle`.
- Recorded the full before-state and exact archive-ref mappings in
  `branches-before.json` and `archive-ledger.json` in that same Replit directory.
- Removed each redundant local branch only after verifying its archive ref,
  using an expected-old-SHA guard. Replit's sole remaining working branch is
  `main`. No stash, archive ref, source file, or worktree was discarded.
- Set `skipFetchAll=true` on 46 `subrepl-*` remotes so routine fetch-all does
  not contact historical task-agent SSH endpoints. Their definitions and refs
  remain preserved; the canonical origin and platform backup were retained.

This includes the 21 older snapshots listed above, the eight newer branches
previously protected from review, `subrepl-s4dd03ji`, and these five older
integration/recovery branches:

- `backup/main-before-ec025-reconcile`
- `backup/main-before-reconcile`
- `backup/reconcile-origin-before-merge`
- `reconcile-origin-main`
- `replit-agent`

The archive refs and bundle are **Replit-local recovery material**, not GitHub
branches or files. Keep them when migrating/replacing that workspace. Restore
an individual tip into a separate review branch with:

```bash
git branch review/<name> refs/archive/2026-09-26/reviewed-branches/<name>
```

### Validation repair

[PR #17](https://github.com/OKHP3/kierans-lifetrkr/pull/17) repaired the browser
harness: Windows entry-point detection, Edge startup/private mode, bounded
DevTools requests, guarded profile cleanup, and the stale expected date for
persisted intervals normalized to 99. It keeps the current application behavior
and version. All five browser journeys passed on Windows Edge and Replit
Chromium. Replit also passed 26 logic tests, the harness guards, installation,
build, and artifact validation. Its stale preview process had to be restarted
after reinstalling dependencies; the initial blank-page results were not passes.
The new
entry-point/cleanup guard tests run in CI and the latest-Node-LTS canary.
The merged repair is `9b16969ba4f525da7f5eced2ac429bce4d3ef3fd`.
