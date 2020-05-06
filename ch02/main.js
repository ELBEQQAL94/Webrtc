// Look after different browser vendors' ways of calling the getUserMedia()
// API method:
// Opera --> getUserMedia
// Chrome --> webkitGetUserMedia
// Firefox --> mozGetUserMedia

navigator.getUserMedia =
  navigator.getUserMedia ||
  navigator.webkitGetUserMedia ||
  navigator.mozGetUserMedia;

// Use constraints to ask for a video-only, if you want to allow audio make audio true MediaStream:
const constraints = {
  audio: false,
  video: true,
};

// Constraints object for low resolution video
const qvgaConstraints = {
  video: {
    mandatory: {
      maxWidth: 320,
      maxHeight: 240,
    },
  },
};

// Constraints object for standard resolution video
const vgaConstraints = {
  video: {
    mandatory: {
      maxWidth: 640,
      maxHeight: 480,
    },
  },
};

// Constraints object for high resolution video
const hdConstraints = {
  video: {
    mandatory: {
      minWidth: 1280,
      minHeight: 960,
    },
  },
};

const video = document.querySelector("video");

// Callback to be called in case of success...
function successCallback(stream) {
  // Note: make the returned stream available to console for inspection
  window.stream = stream;

  video.srcObject = stream;
  // We're all set. Let's just play the video out!
  video.play();
}

// Callback to be called in case of failures...
function errorCallback(error) {
  console.log("navigator.getUserMedia error:", error);
}

const button = document.querySelector("button");

button.addEventListener("click", () => {
  // Main action: just call getUserMedia() on the navigator object
  navigator.getUserMedia(constraints, successCallback, errorCallback);
});

// buttons in the HTML page
const vgaButton = document.querySelector("button#vga");
const qvgaButton = document.querySelector("button#qvga");
const hdButton = document.querySelector("button#hd");

// The local MediaStream to play with
let stream;

// Associate actions with buttons:
vgaButton.addEventListener("click", () => getMedia(vgaConstraints));
qvgaButton.addEventListener("click", () => getMedia(qvgaConstraints));
hdButton.addEventListener("click", () => getMedia(hdConstraints));

// Simple wrapper for getUserMedia() with constraints object as
// an input parameter
function getMedia(constraints) {
  if (!!stream) {
    video.src = null;
    stream.stop();
  }
  navigator.getUserMedia(constraints, successCallback, errorCallback);
}
