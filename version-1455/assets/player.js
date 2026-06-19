(function () {
    var video = document.querySelector('video[data-src]');
    var playButton = document.querySelector('[data-play-button]');
    var message = document.querySelector('[data-video-message]');

    if (!video || !playButton) {
        return;
    }

    var source = video.getAttribute('data-src');
    var hls = null;

    function showMessage(text) {
        if (!message) {
            return;
        }
        message.textContent = text;
        message.classList.add('show');
        window.setTimeout(function () {
            message.classList.remove('show');
        }, 3600);
    }

    function attachSource() {
        if (video.getAttribute('data-ready') === '1') {
            return;
        }

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = source;
        } else if (window.Hls && window.Hls.isSupported()) {
            hls = new window.Hls({
                enableWorker: true,
                lowLatencyMode: true,
                backBufferLength: 90
            });
            hls.loadSource(source);
            hls.attachMedia(video);
            window.currentHlsPlayer = hls;
        } else {
            video.src = source;
        }

        video.setAttribute('data-ready', '1');
    }

    function playVideo() {
        attachSource();
        var promise = video.play();
        playButton.classList.add('is-hidden');

        if (promise && typeof promise.catch === 'function') {
            promise.catch(function () {
                playButton.classList.remove('is-hidden');
                showMessage('点击播放器即可开始播放');
            });
        }
    }

    playButton.addEventListener('click', playVideo);

    video.addEventListener('play', function () {
        playButton.classList.add('is-hidden');
    });

    video.addEventListener('pause', function () {
        if (!video.ended) {
            playButton.classList.remove('is-hidden');
        }
    });

    video.addEventListener('click', function () {
        if (video.paused) {
            playVideo();
        } else {
            video.pause();
        }
    });

    video.addEventListener('error', function () {
        playButton.classList.remove('is-hidden');
        showMessage('当前线路加载中，请稍后重试');
    });

    window.addEventListener('beforeunload', function () {
        if (hls && typeof hls.destroy === 'function') {
            hls.destroy();
        }
    });
})();
