/**
 * Logic smoke-test for mobile joystick math + UI hit zones.
 * Run: node scripts/test-mobile-controls.mjs
 */
const GAME_WIDTH = 1280;
const GAME_HEIGHT = 720;
const maxRadius = 58;
const origin = { x: 120, y: GAME_HEIGHT - 120 };
const uiBottom = 220;

function driveFrom(px, py) {
  const dx = px - origin.x;
  const dy = py - origin.y;
  const len = Math.hypot(dx, dy) || 1;
  const dead = 10;
  if (len < dead) return { throttle: 0, steer: 0 };
  const clamped = Math.min(len, maxRadius);
  const nx = (dx / len) * clamped;
  const ny = (dy / len) * clamped;
  return {
    throttle: Math.max(-1, Math.min(1, -ny / maxRadius)),
    steer: Math.max(-1, Math.min(1, nx / maxRadius)),
  };
}

function blocksWorld(x, y) {
  if (y > GAME_HEIGHT - uiBottom) return true;
  if (x > GAME_WIDTH - 90 && y < 90) return true;
  return false;
}

let failed = 0;
function assert(name, cond) {
  if (!cond) {
    console.error('FAIL', name);
    failed++;
  } else console.log('OK  ', name);
}

const up = driveFrom(origin.x, origin.y - 50);
assert('up = forward throttle', up.throttle > 0.7 && Math.abs(up.steer) < 0.15);

const down = driveFrom(origin.x, origin.y + 50);
assert('down = reverse', down.throttle < -0.7);

const right = driveFrom(origin.x + 50, origin.y);
assert('right = steer+', right.steer > 0.7 && Math.abs(right.throttle) < 0.15);

const left = driveFrom(origin.x - 50, origin.y);
assert('left = steer-', left.steer < -0.7);

const dead = driveFrom(origin.x + 3, origin.y - 3);
assert('deadzone', dead.throttle === 0 && dead.steer === 0);

assert('block joystick zone', blocksWorld(120, GAME_HEIGHT - 40));
assert('block menu zone', blocksWorld(GAME_WIDTH - 40, 40));
assert('allow map center', !blocksWorld(GAME_WIDTH / 2, GAME_HEIGHT / 2));
assert('allow upper map', !blocksWorld(200, 200));

if (failed) {
  console.error(`\n${failed} failed`);
  process.exit(1);
}
console.log('\nAll mobile control logic checks passed.');
