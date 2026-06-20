export function setupMoviePlayer(streamUrl) {
  var video = document.querySelector(".movie-video");
  var overlay = document.querySelector(".player-overlay");
  if (!video || !streamUrl) {
    return;
  }
  var attached = false;
  var hls = null;
  function attach() {
    if (attached) {
      return;
    }
    attached = true;
    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = streamUrl;
    } else if (window.Hls && window.Hls.isSupported()) {
      hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hls.loadSource(streamUrl);
      hls.attachMedia(video);
    } else {
      video.src = streamUrl;
    }
  }
  function play() {
    attach();
    video.controls = true;
    if (overlay) {
      overlay.classList.add("is-hidden");
    }
    var promise = video.play();
    if (promise && typeof promise.catch === "function") {
      promise.catch(function () {});
    }
  }
  if (overlay) {
    overlay.addEventListener("click", play);
  }
  video.addEventListener("click", function () {
    if (!attached) {
      play();
    }
  });
  window.addEventListener("pagehide", function () {
    if (hls) {
      hls.destroy();
    }
  });
}
