<!-- Audio player -->
document.addEventListener("DOMContentLoaded", function () {
  const toggles = document.querySelectorAll('[player-controls="toggle"]');

  toggles.forEach(toggle => {
    const audio = toggle.nextElementSibling;
    const widget = findNearestPlayerWidget(toggle);

    const playBtn = widget.querySelector('[audio-controls="play"]');
    const pauseBtn = widget.querySelector('[audio-controls="pause"]');
    const closeBtn = widget.querySelector('[audio-controls="close"]');

    showButton(widget, "play");
    hideButton(widget, "pause");

    toggle.addEventListener("click", () => {
      if (audio.paused) {
        audio.play();
      } else {
        audio.pause();
      }
    });

    if (playBtn) {
      playBtn.addEventListener("click", () => audio.play());
    }

    if (pauseBtn) {
      pauseBtn.addEventListener("click", () => audio.pause());
    }

    if (closeBtn) {
      closeBtn.addEventListener("click", () => {
        audio.pause();
        audio.currentTime = 0;
        showButton(widget, "play");
        hideButton(widget, "pause");
        toggle.classList.remove("is--current");
        resetUI(widget);
      });
    }

    audio.addEventListener("play", () => {
      updateWidget(audio, widget);
      showButton(widget, "pause");
      hideButton(widget, "play");
      toggle.classList.add("is--current");
    });

    audio.addEventListener("pause", () => {
      showButton(widget, "play");
      hideButton(widget, "pause");
      toggle.classList.remove("is--current");
    });

    audio.addEventListener("ended", () => {
      showButton(widget, "play");
      hideButton(widget, "pause");
      toggle.classList.remove("is--current");
      if (closeBtn) closeBtn.click();
    });

    audio.addEventListener("timeupdate", () => {
      updateElapsed(widget, audio.currentTime);
      updateProgressBar(widget, audio.currentTime, audio.duration);
    });

    audio.addEventListener("loadedmetadata", () => {
      if (audio.readyState >= 1 && audio.duration !== Infinity) {
        updateDuration(widget, audio.duration);
      }
    });

    audio.addEventListener("durationchange", () => {
      if (audio.readyState >= 1 && audio.duration !== Infinity) {
        updateDuration(widget, audio.duration);
      }
    });
  });

  function findNearestPlayerWidget(button) {
    return document.querySelector('[player="widget"]');
  }

  function showButton(widget, control) {
    const btn = widget.querySelector(`[audio-controls="${control}"]`);
    if (btn) {
      btn.style.display = "inline-block";
      btn.style.visibility = "visible";
    }
  }

  function hideButton(widget, control) {
    const btn = widget.querySelector(`[audio-controls="${control}"]`);
    if (btn) {
      btn.style.display = "none";
    }
  }

  function updateElapsed(widget, time) {
    const el = widget.querySelector('[audio-controls="elapsed"]');
    if (el) el.textContent = formatTime(time);
  }

  function updateDuration(widget, time) {
    const el = widget.querySelector('[audio-controls="duration"]');
    if (el) el.textContent = formatTime(time);
  }

  function updateProgressBar(widget, current, duration) {
    const bar = widget.querySelector('[audio-controls="progress-bar"]');
    if (bar && duration) {
      const percent = (current / duration) * 100;
      bar.style.width = `${percent}%`;
    }
  }

  function resetUI(widget) {
    updateElapsed(widget, 0);
    updateProgressBar(widget, 0, 1);
  }

  function formatTime(seconds) {
    if (!isFinite(seconds)) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60).toString().padStart(2, "0");
    return `${mins}:${secs}`;
  }

  function updateWidget(audio, widget) {
    updateDuration(widget, audio.duration);
    updateElapsed(widget, audio.currentTime);
    updateProgressBar(widget, audio.currentTime, audio.duration);
  }
});
