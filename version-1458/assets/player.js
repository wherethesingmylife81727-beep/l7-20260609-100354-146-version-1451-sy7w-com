import { H as Hls } from './hls-dru42stk.js';

function ready(callback) {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', callback);
  } else {
    callback();
  }
}

function setupHlsPlayer(panel) {
  var video = panel.querySelector('video');
  var button = panel.querySelector('[data-play-button]');
  var source = panel.dataset.source;
  var initialized = false;
  var hlsInstance = null;

  function initialize() {
    if (initialized || !video || !source) {
      return;
    }
    initialized = true;

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = source;
    } else if (Hls && Hls.isSupported()) {
      hlsInstance = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 90
      });
      hlsInstance.loadSource(source);
      hlsInstance.attachMedia(video);
    } else {
      video.src = source;
    }
  }

  function play() {
    initialize();
    var playPromise = video.play();
    panel.classList.add('is-playing');
    if (playPromise && typeof playPromise.catch === 'function') {
      playPromise.catch(function () {
        panel.classList.remove('is-playing');
      });
    }
  }

  if (button) {
    button.addEventListener('click', play);
  }
  if (video) {
    video.addEventListener('play', function () {
      panel.classList.add('is-playing');
    });
    video.addEventListener('pause', function () {
      panel.classList.remove('is-playing');
    });
    video.addEventListener('emptied', function () {
      if (hlsInstance && typeof hlsInstance.destroy === 'function') {
        hlsInstance.destroy();
      }
      hlsInstance = null;
      initialized = false;
    });
  }
}

ready(function () {
  document.querySelectorAll('[data-hls-player]').forEach(setupHlsPlayer);
});
