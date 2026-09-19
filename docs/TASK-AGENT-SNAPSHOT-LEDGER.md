# Task-agent snapshot ledger

**Reviewed:** September 19, 2026  
**Baseline:** local `main` at `9713900`

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