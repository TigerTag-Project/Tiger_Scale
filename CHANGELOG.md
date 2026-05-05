# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project follows [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Placeholder for upcoming changes.

### Changed
- Placeholder for upcoming changes.

### Fixed
- Placeholder for upcoming changes.

## [2.0.0] - 2026-05-05

### Added
- Organized V2 project structure for GitHub:
  - `firmware/`
  - `web/data/www/`
  - `docs/`
- Firebase auth endpoints:
  - `POST /api/firebase/auth`
  - `GET /api/firebase/auth`
  - `DELETE /api/firebase/auth`
- Firebase status fields in API/UI:
  - `firebaseConfigured`
  - `firebaseEmail`
- Documentation files:
  - `docs/WIRING.md`
  - `docs/UPLOAD.md`

### Changed
- Wi-Fi portal flow moved to Firebase-first usage.
- UI flow aligned to Firebase-only configuration path.
- Auto-tare residual behavior tuned for low positive residual values.

### Fixed
- Servo/auto-tare workflow edge cases after spool removal.
- Persistence and reload behavior for Firebase credentials.

[Unreleased]: https://github.com/SEU_USER/SEU_REPO/compare/v2.0.0...HEAD
[2.0.0]: https://github.com/SEU_USER/SEU_REPO/releases/tag/v2.0.0
