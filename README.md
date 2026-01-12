# SRG774 Web Audio Player

[View the Live Site](https://srg774.github.io/audio-visualizer/)

This project is a web-based audio player featuring a custom interface with a built-in visualizer and track controls. I designed it to allow users to play, pause, and switch between tracks, complete with a visually appealing frequency bar that reacts to the music. It also includes a custom seek bar for easy navigation.

This player is an ongoing personal project of discovery, where I'm constantly creating and learning about electronic music production and mixing within a basic, Ableton-based home setup.

![Screenshot of Music Player](assets/Screenshot%202026-01-12%2018.11.00.png)

---

## Features

* **Visualizer:** Real-time audio frequency bars using the Web Audio API.
* **Smart Controls:** Sleek icon-based interface with a large, intuitive Play/Pause toggle.
* **Media Session API:** Full Bluetooth and Lock Screen control (skip/pause from your car or headphones).
* **PWA Enabled:** Supports **offline playback** and "Add to Home Screen" via Service Workers.
* **Responsive:** Optimized for both desktop monitors and mobile devices.

---

## Latest Updates

* **Bluetooth Media Control:** Seamless track navigation using connected hardware controls.
* **Offline Playback:** Service Worker integration ensures the music doesn't stop even when the signal does.
* **Shimmer Interface:** Replaced static text with a dynamic, shimmering "Now Playing" title.
* **Iconic UI:** Swapped text buttons for modern SVG icons and a centralized "Big Play" button.
* **Smart Refresh:** Added a track check/refresh button to sync the latest uploads without a full page reload.
* **Optimized Audio:** Improved compression for faster loading and fixed play/pause logic for better reliability.

---

## Google Sites Integration (Mini Player)

This repository also hosts a "Lite" version designed specifically to be embedded into Google Sites as a header or footer bar. It fetches data directly from the main `tracks.json` to stay synced.

* **Lite URL:** `https://srg774.github.io/audio-visualizer/lite.html`

---

## New Track Insert Format

To add new tracks to the library, add an entry to the `tracks.json` file:

```json
{ 
  "title": "New Track Name", 
  "src": "assets/newtrack.mp3",
  "isNew": true 
}
