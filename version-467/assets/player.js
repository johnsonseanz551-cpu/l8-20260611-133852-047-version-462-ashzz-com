(function () {
  var hlsLibraryPromise = null;

  function loadHlsLibrary() {
    if (window.Hls) {
      return Promise.resolve(window.Hls);
    }

    if (hlsLibraryPromise) {
      return hlsLibraryPromise;
    }

    hlsLibraryPromise = new Promise(function (resolve, reject) {
      var script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/hls.js@1/dist/hls.min.js';
      script.async = true;
      script.onload = function () {
        if (window.Hls) {
          resolve(window.Hls);
        } else {
          reject(new Error('HLS library did not initialize.'));
        }
      };
      script.onerror = function () {
        reject(new Error('Unable to load HLS library.'));
      };
      document.head.appendChild(script);
    });

    return hlsLibraryPromise;
  }

  function initializePlayer(wrapper) {
    var video = wrapper.querySelector('video[data-src]');
    var button = wrapper.querySelector('[data-play-button]');

    if (!video || !button) {
      return;
    }

    var source = video.getAttribute('data-src');
    var hlsInstance = null;
    var initialized = false;

    function hideCover() {
      button.hidden = true;
    }

    function showMessage(message) {
      button.hidden = false;
      button.innerHTML = '<strong>' + message + '</strong><em>请刷新页面或稍后重试</em>';
    }

    function attachSource() {
      if (initialized) {
        return Promise.resolve();
      }

      if (!source) {
        return Promise.reject(new Error('Missing video source.'));
      }

      initialized = true;

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
        return Promise.resolve();
      }

      return loadHlsLibrary().then(function (Hls) {
        if (!Hls.isSupported()) {
          video.src = source;
          return;
        }

        hlsInstance = new Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 90
        });

        hlsInstance.loadSource(source);
        hlsInstance.attachMedia(video);
        hlsInstance.on(Hls.Events.ERROR, function (event, data) {
          if (data && data.fatal) {
            if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
              hlsInstance.startLoad();
            } else if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
              hlsInstance.recoverMediaError();
            } else {
              hlsInstance.destroy();
              showMessage('视频暂时无法播放');
            }
          }
        });
      });
    }

    function play() {
      attachSource()
        .then(function () {
          hideCover();
          return video.play();
        })
        .catch(function () {
          showMessage('视频加载失败');
        });
    }

    button.addEventListener('click', play);
    video.addEventListener('click', function () {
      if (!initialized || video.paused) {
        play();
      }
    });
    video.addEventListener('play', hideCover);
    video.addEventListener('ended', function () {
      button.hidden = false;
    });
    window.addEventListener('pagehide', function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    Array.prototype.slice.call(document.querySelectorAll('[data-player]')).forEach(initializePlayer);
  });
})();
