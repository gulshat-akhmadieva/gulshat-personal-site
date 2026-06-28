(function () {
  "use strict";

  function initMusicRoomCharacter() {
    var character = document.getElementById("music-room-character");
    if (!character) return;

    var audios = document.querySelectorAll("#main [data-audio-player] audio");
    if (!audios.length) return;

    var updateTimer = null;

    function isAnyPlaying() {
      return Array.prototype.some.call(audios, function (audio) {
        return !audio.paused && !audio.ended;
      });
    }

    function applyCharacterState() {
      character.setAttribute("data-state", isAnyPlaying() ? "playing" : "idle");
    }

    function scheduleCharacterUpdate() {
      if (updateTimer) {
        cancelAnimationFrame(updateTimer);
      }

      updateTimer = requestAnimationFrame(function () {
        updateTimer = requestAnimationFrame(function () {
          updateTimer = null;
          applyCharacterState();
        });
      });
    }

    audios.forEach(function (audio) {
      audio.addEventListener("play", scheduleCharacterUpdate);
      audio.addEventListener("pause", scheduleCharacterUpdate);
      audio.addEventListener("ended", scheduleCharacterUpdate);
    });

    applyCharacterState();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initMusicRoomCharacter);
  } else {
    initMusicRoomCharacter();
  }
})();
