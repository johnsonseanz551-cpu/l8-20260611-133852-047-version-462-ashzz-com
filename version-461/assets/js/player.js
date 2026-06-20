(function () {
  function boot(box) {
    var video = box.querySelector('video');
    var cover = box.querySelector('.play-cover');
    if (!video || !cover) {
      return;
    }
    var source = cover.getAttribute('data-src') || video.getAttribute('data-src');
    var hls = null;
    function start() {
      cover.classList.add('is-hidden');
      video.controls = true;
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        if (video.src !== source) {
          video.src = source;
        }
        video.play().catch(function () {});
        return;
      }
      if (window.Hls && window.Hls.isSupported()) {
        if (!hls) {
          hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
          hls.loadSource(source);
          hls.attachMedia(video);
          hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
            video.play().catch(function () {});
          });
        } else {
          video.play().catch(function () {});
        }
        return;
      }
      video.src = source;
      video.play().catch(function () {});
    }
    cover.addEventListener('click', start);
    video.addEventListener('click', function () {
      if (!video.src || video.paused) {
        start();
      }
    });
  }
  Array.prototype.slice.call(document.querySelectorAll('.js-player')).forEach(boot);
})();
