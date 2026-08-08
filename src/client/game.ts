import Phaser from 'phaser';
import MainScene from './mainScene';

import { initAuth } from './auth';

// تشغيل منطق التوثيق عند تجهيز الـ DOM
document.addEventListener('DOMContentLoaded', () => {
  initAuth();
  
  // تشغيل إعدادات Phaser Canvas هنا...
  const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: 1280,   // الأبعاد القياسية لخلفيات اللعبة 16:9
  height: 720,
  parent: 'game-container',
  title: 'The Warrior Game',
  pixelArt: true,
  scale: {
    mode: Phaser.Scale.FIT, // للتجاوب التلقائي مع المحافظة على النسبة
    autoCenter: Phaser.Scale.CENTER_BOTH
  },
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { x: 0, y: 300 },
      debug: false
    }
  },
  scene: [MainScene]
};

const game = new Phaser.Game(config);
});

