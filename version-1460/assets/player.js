(function () {
  const players = Array.from(document.querySelectorAll('[data-player]'));

  players.forEach(function (player) {
    const video = player.querySelector('video');
    const button = player.querySelector('[data-play-button]');
    const message = player.querySelector('[data-player-message]');
    let hlsInstance = null;
    let initialized = false;

    if (!video) {
      return;
    }

    const source = video.getAttribute('data-src');

    function setMessage(text) {
      if (message) {
        message.textContent = text || '';
      }
    }

    function initialize() {
      if (initialized || !source) {
        return;
      }

      initialized = true;

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
        setMessage('正在加载播放源');
        return;
      }

      if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 90
        });
        hlsInstance.loadSource(source);
        hlsInstance.attachMedia(video);
        hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
          setMessage('播放源已就绪');
        });
        hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
          if (data && data.fatal) {
            setMessage('播放源暂时无法加载，请刷新后重试');
            hlsInstance.destroy();
            hlsInstance = null;
            initialized = false;
          }
        });
        return;
      }

      video.src = source;
      setMessage('正在尝试使用浏览器播放器');
    }

    function playVideo() {
      initialize();
      const playPromise = video.play();

      if (playPromise && typeof playPromise.then === 'function') {
        playPromise
          .then(function () {
            if (button) {
              button.classList.add('is-hidden');
            }
            setMessage('');
          })
          .catch(function () {
            setMessage('请再次点击播放按钮开始播放');
          });
      }
    }

    if (button) {
      button.addEventListener('click', function (event) {
        event.preventDefault();
        playVideo();
      });
    }

    player.addEventListener('click', function (event) {
      if (event.target === button || (button && button.contains(event.target))) {
        return;
      }

      if (video.paused) {
        playVideo();
      }
    });

    video.addEventListener('play', function () {
      if (button) {
        button.classList.add('is-hidden');
      }
    });

    video.addEventListener('pause', function () {
      if (button && video.currentTime === 0) {
        button.classList.remove('is-hidden');
      }
    });
  });
})();
