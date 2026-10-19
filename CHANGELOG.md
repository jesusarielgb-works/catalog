# Changelog
Format: [Keep a Changelog](https://keepachangelog.com/en/1.0.0/) | [SemVer](https://semver.org/)

## [Unreleased]

## [1.1.0] - YYYY-MM-DD
### Added
- MIT `LICENSE`, `package-lock.json` and `npm ci`, tests with `node --test` that run on every pull request
- Version and status columns, read from each work's latest release and `status-*` topic
- `works.json`, the list the org profile is generated from
### Changed
- The catalog and the org profile are committed only when a work changed — a new date alone is not a change
- The org profile lists every work instead of a fixed text
- One secret, `CATALOG_TOKEN`; the workflow used `TOKEN_CATALOG`, which GitHub rejects with 401 since 2026-09-25
- Node 22
### Fixed
- The Pages site escapes repository fields before inserting them, and declares `lang="en"`
- The Pages site no longer claims every work is MIT
## [1.0.0] - 2026-08-24
### Added
- Catalog generator, org profile updater, nightly workflow and Pages site
