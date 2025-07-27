# SRG774 Web Audio Player

https://srg774.github.io/audio-visualizer/

This project is a web-based audio player featuring a custom interface with a built-in visualizer and track controls. I designed it to allow users to play, pause, and switch between tracks, complete with a visually appealing frequency bar that reacts to the music. It also includes a custom seek bar for easy navigation.

This player is an ongoing personal project of discovery, where I'm constantly creating and learning about electronic music production and mixing within a basic, Ableton-based home setup.

![Screenshot of Music Player](https://github.com/srg774/audio-visualizer/blob/main/assets/Screenshot%202025-07-26%2009.35.35.png?raw=true)

---

## Features

* Play, pause, and skip tracks.
* Real-time audio frequency visualizer.
* Custom seek bar with progress indication.
* Responsive design for mobile and desktop.

---

## Technologies

* HTML5, CSS3, JavaScript
* Web Audio API for real-time audio visualization
* Flexbox for responsive layout

---

## Latest Updates

Here are the most recent improvements I've made to the player:

* **Bluetooth Media Control:** I've added Bluetooth media control functionality, allowing you to seamlessly skip tracks, play/pause, and navigate audio using car controls or other connected devices.
* **Offline Playback:** The music player now supports full **offline playback** thanks to a Service Worker.
* **Interface Streamlining:** I've streamlined the interface by replacing the simple "Now Playing" text with the track title itself, now enhanced with a subtle, engaging shimmer effect when music is playing.
* **Iconic Controls:** All the traditional text buttons for play, pause, next, and previous tracks have been swapped out for sleek, intuitive icons, offering a much cleaner and more modern look. I even made the play/pause button slightly larger to stand out!
* **Track Refresh:** To keep your music library always up-to-date, I've introduced a clever track check and refresh button, so any new additions are seamlessly integrated, all while maintaining the cool visualizer and smooth seek bar experience you already enjoy.
* **Track Updates & Fixes:** The player now includes the latest tracks, marked with 'NEW'. I've also applied improved compression and audio enhancements, and fixed the pause/play logic for a more intuitive experience.

---

## New Track Insert Format

To add new tracks, use the following format:

`{ title: "New Track Name", src: "assets/newtrack.mp3" }`
