# SRG774 Web Audio Player

https://srg774.github.io/audio-visualizer/

This project is a web-based audio player featuring a custom interface with a built-in visualizer and track controls. The player allows users to play, pause, and switch between tracks, with a visually appealing frequency bar that reacts to the music. It includes a custom seek bar for easy navigation through tracks.

![Screenshot](Screenshot 2025-07-26 09.35.35.png)

Features:
Play, pause, and skip tracks.
Real-time audio frequency visualizer.
Custom seek bar with progress indication.
Responsive design for mobile and desktop.
Technologies:
HTML5, CSS3, JavaScript
Web Audio API for real-time audio visualization
Flexbox for responsive layout
Setup:
Clone this repository.
Open index.html in your browser.
Enjoy listening to your favorite tracks with dynamic visual effects!

**New**
I've streamlined the interface by replacing the simple "Now Playing" text with the track title itself, now enhanced with a subtle, engaging shimmer effect when your music is playing. All the traditional text buttons for play, pause, next, and previous tracks have been swapped out for sleek, intuitive icons, offering a much cleaner and more modern look, and we even made the play/pause button slightly larger to stand out. To keep your music library always up-to-date, we've introduced a clever track check and refresh button, so any new additions are seamlessly integrated, all while maintaining the cool visualizer and smooth seek bar experience you already enjoy.

This music player now supports full offline playback thanks to a Service Worker.
Now includes the latest tracks, marked with 'NEW'. Improved compression and audio enhancements applied. Fixed pause/play logic for a more intuitive experience.
This project includes Bluetooth media control functionality, allowing you to skip tracks, play/pause, and navigate audio seamlessly using car controls or other connected devices


New track Insert format: 

{ title: "New Track Name", src: "assets/newtrack.mp3" }
