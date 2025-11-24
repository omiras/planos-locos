# Changelog

All notable changes to this project will be documented in this file.

## 2025-11-24

### Added
- **Setup Screen**: A new initial screen to configure game settings before starting.
- **Game Settings**:
    - **Allow Repeats**: Option to toggle whether planes can appear more than once in a session.
    - **Sound Control**: Option to enable or disable sound effects.
    - **Fullscreen Mode**: Option to start the game in fullscreen mode.
- **Local Image Support**:
    - Downloaded plane artwork images to `src/assets/images` for offline support and better performance.
    - Updated application to load images from the local directory.

### Changed
- **Fullscreen Logic**: Improved fullscreen toggle reliability and error handling.
- **Image Loading**: Application now prefers local images and falls back to remote URLs if necessary.

### Fixed
- **Start Button**: Fixed an issue where the start button in the setup screen was not triggering the game start.
