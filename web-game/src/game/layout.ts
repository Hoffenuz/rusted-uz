import type Phaser from 'phaser';

/** Mobile / fullscreen layout helpers. */

export function isCoarsePointer(): boolean {
  return window.matchMedia('(pointer: coarse)').matches || 'ontouchstart' in window;
}

export function applyShellLayout(mobilePreferred: boolean) {
  const root = document.documentElement;
  const shell = document.getElementById('game-root');
  const hud = document.getElementById('hud-overlay');
  const mobile = mobilePreferred || (isCoarsePointer() && Math.min(window.innerWidth, window.innerHeight) < 900);

  root.classList.toggle('fs-mobile', mobile);
  document.body.classList.toggle('fs-mobile', mobile);

  if (shell) {
    if (mobile) {
      shell.style.width = '100vw';
      shell.style.height = '100dvh';
      shell.style.maxWidth = 'none';
      shell.style.maxHeight = 'none';
      shell.style.border = 'none';
      shell.style.boxShadow = 'none';
      shell.style.borderRadius = '0';
    } else {
      shell.style.width = '';
      shell.style.height = '';
      shell.style.maxWidth = '';
      shell.style.maxHeight = '';
      shell.style.border = '';
      shell.style.boxShadow = '';
    }
  }

  if (hud) hud.style.display = mobile ? 'none' : '';
}

export async function requestGameFullscreen() {
  const el = document.getElementById('game-root') ?? document.documentElement;
  try {
    if (!document.fullscreenElement && el.requestFullscreen) {
      await el.requestFullscreen();
    }
  } catch {
    // ignored — gesture / policy
  }
}

export function exitGameFullscreen() {
  if (document.fullscreenElement) {
    void document.exitFullscreen().catch(() => undefined);
  }
}

export function bindOrientationRefresh(game: Phaser.Game) {
  const refresh = () => {
    applyShellLayout(document.documentElement.classList.contains('fs-mobile'));
    game.scale.refresh();
  };
  window.addEventListener('orientationchange', () => {
    window.setTimeout(refresh, 80);
    window.setTimeout(refresh, 300);
  });
  window.addEventListener('resize', refresh);
  document.addEventListener('fullscreenchange', refresh);
}
