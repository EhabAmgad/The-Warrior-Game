import Phaser from "phaser";

export default class MainScene extends Phaser.Scene {
  private player!: Phaser.Physics.Arcade.Sprite;
  private dragon!: Phaser.Physics.Arcade.Sprite;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private attackKey!: Phaser.Input.Keyboard.Key;

  // متغيرات تتبع الحالة (State Flags)
  private isGameOver: boolean = false;
  private isPlayerAttacking: boolean = false;
  private isDragonAttacking: boolean = false;
  private resultText!: Phaser.GameObjects.Text;

  constructor() {
    super({ key: "MainScene" });
  }

  preload() {
    this.load.image("background", "/img/BackGround.png");
    this.load.spritesheet("player", "/img/Player.png", {
      frameWidth: 1408 / 8,
      frameHeight: 768 / 4,
    });
    this.load.spritesheet("dragon", "/img/Dragon.png", {
      frameWidth: 1390 / 5,
      frameHeight: 768 / 4,
    });
  }

  create() {
    // 1. الخلفية والأرضية
    const bg = this.add.image(0, 0, "background").setOrigin(0, 0);
    bg.setDisplaySize(1280, 720);

    const ground = this.physics.add.staticGroup();
    const platform = ground.create(
      640,
      500,
      undefined,
    ) as Phaser.Physics.Arcade.Sprite;
    platform.setVisible(false);
    platform.body!.setSize(1280, 40);
    platform.refreshBody();

    // 2. إنشاء اللاعب والتنين
    this.player = this.physics.add.sprite(100, 400, "player");
    this.dragon = this.physics.add.sprite(650, 400, "dragon");

    // 👈 إنشاء كائن النص في دالة create()
    this.resultText = this.add
      .text(640, 200, "", {
        fontSize: "48px",
        color: "#ffffff",
        fontStyle: "bold",
      })
      .setOrigin(0.5);

    // تقليل المساحة الشفافة السفلية لتقف الأقدام على الأرض تماماً
    this.player.body!.setOffset(0, 70); // يرفع خط التلامس للمحارب
    this.dragon.body!.setOffset(0, 70); // يرفع خط التلامس للتنين

    this.player.setCollideWorldBounds(true);
    this.dragon.setCollideWorldBounds(true);
    this.dragon.flipX = true; // جعل التنين يواجه يساراً ناحية المحارب

    // تصادم مع الأرضية
    this.physics.add.collider(this.player, ground);
    this.physics.add.collider(this.dragon, ground);

    // 3. مفاتيح التحكم (الأسهم + المسافة للهجوم)
    if (this.input.keyboard) {
      this.cursors = this.input.keyboard.createCursorKeys();
      this.attackKey = this.input.keyboard.addKey(
        Phaser.Input.Keyboard.KeyCodes.SPACE,
      );
    }

    // أضف هذا السطر في نهاية create() لتسجيل التداخل بين اللاعب والتنين
    this.physics.add.overlap(
      this.player,
      this.dragon,
      this.handleCombat,
      undefined,
      this,
    );

    // 4. إنشاء الأنيميشن (Animations)
    this.anims.create({
      key: "playerIdle",
      frames: this.anims.generateFrameNumbers("player", { start: 0, end: 3 }),
      frameRate: 8,
      repeat: -1,
    });

    this.anims.create({
      key: "playerRun",
      frames: this.anims.generateFrameNumbers("player", { start: 8, end: 15 }), // تم تعديل الترتيب من 8 إلى 15
      frameRate: 10,
      repeat: -1,
    });

    this.anims.create({
      key: "playerJump",
      frames: this.anims.generateFrameNumbers("player", { start: 16, end: 20 }),
      frameRate: 10,
      repeat: -1,
    });

    this.anims.create({
      key: "playerAttack",
      frames: this.anims.generateFrameNumbers("player", { start: 24, end: 28 }),
      frameRate: 12,
      repeat: 0,
    });

    this.anims.create({
      key: "dragonIdle",
      frames: this.anims.generateFrameNumbers("dragon", { start: 10, end: 13 }),
      frameRate: 8,
      repeat: -1,
    });

    this.anims.create({
      key: "dragonAttack",
      frames: this.anims.generateFrameNumbers("dragon", { start: 5, end: 9 }),
      frameRate: 10,
      repeat: -1,
    });

    this.anims.create({
      key: "dragonHurt",
      frames: this.anims.generateFrameNumbers("dragon", { start: 15, end: 19 }),
      frameRate: 8,
      repeat: 0,
    });

    // الاستماع لانتهاء أنيميشن هجوم اللاعب لإعادة التحكم
    // 1. تسريع أو مراقبة انتهاء أنيميشن الهجوم
    this.player.on("animationcomplete", (anim: Phaser.Animations.Animation) => {
      if (anim.key === "playerAttack") {
        this.isPlayerAttacking = false; // فك تجميد الحركة فور انتهاء الضربة
      }
    });

    // 2. تأكد من تفعيل الجاذبية للاعب
    this.player.setGravityY(600); // إعطاء جاذبية للاعب ليتمكن من القفز والهبوط

    // تشغيل الوضع الافتراضي
    this.player.play("playerIdle", true);
    this.dragon.play("dragonIdle", true);
  }

  update() {
    if (this.isGameOver) return;

    const onGround =
      this.player.body?.touching.down || this.player.body?.blocked.down;

    // 1. زر الهجوم
    if (
      this.attackKey &&
      Phaser.Input.Keyboard.JustDown(this.attackKey) &&
      !this.isPlayerAttacking &&
      onGround
    ) {
      this.isPlayerAttacking = true;
      this.player.setVelocityX(0);
      this.player.play("playerAttack", true);
    }

    // 2. الحركة والقفز
    if (!this.isPlayerAttacking) {
      if (this.cursors.up.isDown && onGround) {
        this.player.setVelocityY(-450);
        this.player.play("playerJump", true);
      } else if (this.cursors.left.isDown) {
        this.player.setVelocityX(-180);
        this.player.flipX = true;
        if (onGround) this.player.play("playerRun", true);
      } else if (this.cursors.right.isDown) {
        this.player.setVelocityX(180);
        this.player.flipX = false;
        if (onGround) this.player.play("playerRun", true);
      } else {
        this.player.setVelocityX(0);
        if (onGround) this.player.play("playerIdle", true);
      }
    }
  }

  private handleCombat() {
    if (this.isGameOver) return;

    // 1. حالة فوز اللاعب (اللاعب يهاجم أثناء التداخل)
    if (this.isPlayerAttacking) {
      this.isGameOver = true;
      this.player.setVelocityX(0);

      // إلغاء كاشف التداخل فوراً لمنع التكرار
      this.physics.world.removeCollider(
        this.physics.world.colliders
          .getActive()
          .find((c) => c.object1 === this.player || c.object2 === this.player)!,
      );

      // رد فعل الفوز: تشغيل أنيميشن تألم التنين وإخفاؤه/تلوينه
      this.dragon.play("dragonHurt", true);
      this.dragon.setTint(0xff5555); // تلوين التنين بالأحمر لدلالة الإصابة

      // عرض نص الفوز الصريح
      this.resultText.setText("🏆 فاز المحارب!");
      this.resultText.setColor("#00ff00");

      // جعل التنين يختفي تدريجياً بعد الإصابة
        // this.tweens.add({
        //   targets: this.dragon,
        //   alpha: 0,
        //   duration: 1000,
        //   ease: "Power2",
        // });
        return;
      }

      // 2. حالة خسارة اللاعب (التنين يهاجم واللاعب لم يهاجم)
      if (!this.isDragonAttacking) {
        this.isDragonAttacking = true;
        this.player.setVelocityX(0);

        // تشغيل هجوم التنين
        this.dragon.play("dragonAttack", true);

        // رد فعل فوري لخسارة اللاعب (تلوين اللاعب وإظهار النص فوراً)
        this.player.setTint(0xff0000); // تلوين اللاعب بالأحمر فوراً
        this.resultText.setText("💀 خسر المحارب!");
        this.resultText.setColor("#ff0000");

        // إنهاء اللعبة بعد انقضاء وقت أنيميشن هجوم التنين (500 مللي ثانية)
        this.time.delayedCall(500, () => {
          this.isGameOver = true;
        });
      }
    }
  }

