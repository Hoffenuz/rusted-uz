import Phaser from 'phaser';
import {
  BATTLE_INFO,
  DEFAULT_SESSION,
  DIFFICULTY_INFO,
  type BattleId,
  type DifficultyId,
  type PlatformMode,
  type SessionConfig,
} from '../data/session';
import type { FactionId } from '../data/tanks';
import { GAME_HEIGHT, GAME_WIDTH } from '../config';
import { applyShellLayout, requestGameFullscreen } from '../layout';
import { ConfirmDialog } from '../ui/ConfirmDialog';

export class MainMenuScene extends Phaser.Scene {
  private session: SessionConfig = { ...DEFAULT_SESSION };
  private summary!: Phaser.GameObjects.Text;
  private dialog!: ConfirmDialog;
  private selected: Record<string, Phaser.GameObjects.Text[]> = {};

  constructor() {
    super('MainMenu');
  }

  create() {
    const prev = this.registry.get('session') as SessionConfig | undefined;
    if (prev) this.session = { ...prev };
    applyShellLayout(this.session.platform === 'mobile');
    this.scale.refresh();

    this.dialog = new ConfirmDialog(this);

    this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x0c1210, 1);
    if (this.textures.exists('loading-art')) {
      this.add
        .image(GAME_WIDTH / 2, GAME_HEIGHT / 2, 'loading-art')
        .setDisplaySize(GAME_WIDTH, GAME_HEIGHT)
        .setAlpha(0.18);
    }

    // Soft vignette
    this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x000000, 0.25);

    if (this.textures.exists('ui-panel-menu')) {
      this.add
        .image(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 20, 'ui-panel-menu')
        .setDisplaySize(720, 520)
        .setAlpha(0.55);
    }

    if (this.textures.exists('ui-title')) {
      this.add
        .image(GAME_WIDTH / 2, 70, 'ui-title')
        .setDisplaySize(320, 126)
        .setAlpha(0.95);
    } else {
      this.add
        .text(GAME_WIDTH / 2, 56, '雷鸣战场', {
          fontFamily: 'Segoe UI',
          fontSize: '40px',
          fontStyle: 'bold',
          color: '#e8d7a8',
        })
        .setOrigin(0.5);
    }

    this.add
      .text(GAME_WIDTH / 2, 148, 'Jang menyusi · Rusted Warfare ruhida', {
        fontFamily: 'Segoe UI',
        fontSize: '15px',
        color: '#9fb59a',
      })
      .setOrigin(0.5);

    this.selected.platform = this.row(188, 'Qurilma', [
      { label: 'PC', value: 'pc', kind: 'platform' },
      { label: 'Mobile', value: 'mobile', kind: 'platform' },
    ]);
    this.selected.faction = this.row(252, 'Jamoa', [
      { label: 'Axis', value: 'axis', kind: 'faction' },
      { label: 'Allies', value: 'allies', kind: 'faction' },
    ]);
    this.selected.battle = this.row(316, 'Jang', [
      { label: 'Skirmish', value: 'skirmish', kind: 'battle' },
      { label: 'Hujum', value: 'assault', kind: 'battle' },
    ]);
    this.selected.difficulty = this.row(380, 'Dushman', [
      { label: 'Oson', value: 'easy', kind: 'difficulty' },
      { label: 'Oddiy', value: 'normal', kind: 'difficulty' },
      { label: 'Qiyin', value: 'hard', kind: 'difficulty' },
    ]);

    this.summary = this.add
      .text(GAME_WIDTH / 2, 448, '', {
        fontFamily: 'Segoe UI',
        fontSize: '14px',
        color: '#c4a35a',
        align: 'center',
        wordWrap: { width: 900 },
      })
      .setOrigin(0.5);

    const start = this.add
      .text(GAME_WIDTH / 2, 520, 'JANGNI BOSHLASH', {
        fontFamily: 'Segoe UI',
        fontSize: '26px',
        fontStyle: 'bold',
        color: '#0c1210',
        backgroundColor: '#c4a35a',
        padding: { x: 36, y: 18 },
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });

    start.on('pointerover', () => start.setStyle({ backgroundColor: '#e0c070' }));
    start.on('pointerout', () => start.setStyle({ backgroundColor: '#c4a35a' }));
    start.on('pointerdown', () => this.startGame());

    const exit = this.add
      .text(GAME_WIDTH / 2, 590, 'Chiqish', {
        fontFamily: 'Segoe UI',
        fontSize: '16px',
        color: '#e8b2a4',
        backgroundColor: '#2a2020',
        padding: { x: 18, y: 10 },
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });

    exit.on('pointerdown', () => {
      this.dialog.show(
        'Chiqishni xohlaysizmi?\n(Brauzer oynasini yopishingiz mumkin)',
        () => {
          window.close();
          document.body.innerHTML =
            '<div style="display:grid;place-items:center;height:100vh;background:#0c1210;color:#e8d7a8;font-family:Segoe UI">O‘yin yopildi. Varaqni yoping.</div>';
        },
      );
    });

    this.add
      .text(GAME_WIDTH / 2, 640, 'Kredit · pastki ishlab chiqarish · dushman bazasini yo‘q qiling', {
        fontFamily: 'Segoe UI',
        fontSize: '13px',
        color: '#7a8a78',
      })
      .setOrigin(0.5);

    this.refreshSummary();
    this.refreshHighlights();
  }

  private row(
    y: number,
    title: string,
    opts: {
      label: string;
      value: string;
      kind: 'platform' | 'faction' | 'battle' | 'difficulty';
    }[],
  ) {
    this.add
      .text(GAME_WIDTH / 2 - 300, y, title, {
        fontFamily: 'Segoe UI',
        fontSize: '16px',
        color: '#d7e6d4',
      })
      .setOrigin(0, 0.5);

    const texts: Phaser.GameObjects.Text[] = [];
    const step = opts.length >= 3 ? 130 : 170;
    const startX = GAME_WIDTH / 2 - ((opts.length - 1) * step) / 2 + 40;
    opts.forEach((o, i) => {
      const x = startX + i * step;
      const t = this.add
        .text(x, y, o.label, {
          fontFamily: 'Segoe UI',
          fontSize: '16px',
          color: '#d7e6d4',
          backgroundColor: '#1a2a20',
          padding: { x: 16, y: 12 },
        })
        .setOrigin(0.5)
        .setInteractive({ useHandCursor: true });
      t.setData('value', o.value);
      t.setData('kind', o.kind);

      t.on('pointerdown', () => {
        if (o.kind === 'platform') {
          this.session.platform = o.value as PlatformMode;
          applyShellLayout(this.session.platform === 'mobile');
          this.scale.refresh();
        }
        if (o.kind === 'faction') this.session.faction = o.value as FactionId;
        if (o.kind === 'battle') this.session.battle = o.value as BattleId;
        if (o.kind === 'difficulty') this.session.difficulty = o.value as DifficultyId;
        this.refreshSummary();
        this.refreshHighlights();
        this.sound.play('sfx-select', { volume: 0.25 });
      });
      texts.push(t);
    });
    return texts;
  }

  private refreshHighlights() {
    const mark = (list: Phaser.GameObjects.Text[], current: string) => {
      for (const t of list) {
        const active = t.getData('value') === current;
        t.setStyle({
          backgroundColor: active ? '#3a4a28' : '#1a2a20',
          color: active ? '#ffe08a' : '#d7e6d4',
        });
      }
    };
    mark(this.selected.platform, this.session.platform);
    mark(this.selected.faction, this.session.faction);
    mark(this.selected.battle, this.session.battle);
    mark(this.selected.difficulty, this.session.difficulty);
  }

  private refreshSummary() {
    const battle = BATTLE_INFO[this.session.battle];
    const diff = DIFFICULTY_INFO[this.session.difficulty];
    const plat = this.session.platform === 'pc' ? 'PC' : 'Mobile';
    const fac = this.session.faction === 'axis' ? 'Axis (Germaniya)' : 'Allies (AQSH)';
    this.summary.setText(
      `${plat} · ${fac} · ${battle.title} · ${diff.title}\n${diff.desc}`,
    );
  }

  private startGame() {
    this.registry.set('session', { ...this.session });
    this.sound.play('sfx-select', { volume: 0.35 });
    applyShellLayout(this.session.platform === 'mobile');
    if (this.session.platform === 'mobile') {
      void requestGameFullscreen().finally(() => {
        this.scale.refresh();
        this.scene.start('Battle');
      });
      return;
    }
    this.scene.start('Battle');
  }
}
