// ========================================================
// BỘ TẠO ÂM THANH CHIẾN ĐẤU (WEB AUDIO API - KHÔNG CẦN FILE MP3)
// ========================================================
const SoundFX = {
    ctx: null,
    init() {
        if (!this.ctx) {
            this.ctx = new (window.AudioContext || window.webkitAudioContext)();
        }
    },
    isEnabled() {
        return document.getElementById('sound-checkbox').checked;
    },
    playTone(freq, type, duration, startTime = 0, vol = 0.25) {
        if (!this.isEnabled()) return;
        this.init();
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime + startTime);
        gain.gain.setValueAtTime(vol, this.ctx.currentTime + startTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + startTime + duration);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(this.ctx.currentTime + startTime);
        osc.stop(this.ctx.currentTime + startTime + duration);
    },
    swordSlash() {
        this.playTone(620, 'sawtooth', 0.12, 0, 0.2);
        this.playTone(220, 'triangle', 0.18, 0.05, 0.3);
    },
    criticalHit() {
        this.playTone(880, 'square', 0.1, 0, 0.25);
        this.playTone(1174, 'sawtooth', 0.25, 0.08, 0.3);
        this.playTone(140, 'sawtooth', 0.35, 0.05, 0.4);
    },
    fireball() {
        this.playTone(180, 'sawtooth', 0.35, 0, 0.35);
        this.playTone(95, 'square', 0.4, 0.1, 0.35);
    },
    dodge() {
        this.playTone(400, 'sine', 0.12, 0, 0.2);
        this.playTone(750, 'sine', 0.15, 0.08, 0.2);
    },
    victory() {
        [523.25, 659.25, 783.99, 1046.5].forEach((f, i) => {
            this.playTone(f, 'triangle', 0.3, i * 0.14, 0.3);
        });
    },
    defeat() {
        [330, 293.66, 261.63, 196].forEach((f, i) => {
            this.playTone(f, 'sawtooth', 0.35, i * 0.18, 0.25);
        });
    }
};

// ========================================================
// BIẾN LOGIC NHÂN VẬT & RỒNG (DỰA TRÊN CODE GỐC CỦA BẠN)
// ========================================================
const defaultName = "Phạm Nguyễn Minh Trang";
const MSSV = "31241024211";

let hero = {};
let dragon = {};
let maxHeroHealth = 105;
let maxDragonHealth = 600;
let isAnimating = false;
let autoInterval = null;

function initGameData(nhapTen, chonVai) {
    let level = 1;
    let xp = 0;
    let skillPoints = 5;

    level++;
    xp = 150 * (level - 1) + 200;
    skillPoints = skillPoints + xp / 10;

    let strength = 0.6 * skillPoints + 0.1 * xp;
    let agility = 0.2 * skillPoints + 0.2 * xp;
    let intel = 0.6 * skillPoints + 10 * level;

    // Lên cấp 3
    xp = xp + 300;

    // Kiểm tra trí nhớ tên nhân vật
    let memoryNote = "";
    if (nhapTen.trim() === defaultName) {
        intel = intel + 5;
        memoryNote = "Chính xác tên gốc (+5 Intel)!";
    } else {
        intel = intel - 5;
        memoryNote = "Khác tên gốc (-5 Intel)!";
    }

    // Phân cấp nhân vật
    let phanCap = "";
    switch (chonVai) {
        case "a":
            phanCap = "Chiến binh";
            strength = strength + 15;
            agility = agility - 10;
            intel = intel - 5;
            break;
        case "b":
            phanCap = "Sát thủ";
            strength = strength - 15;
            agility = agility - 10;
            intel = intel - 5;
            break;
        case "c":
            phanCap = "Thợ Săn";
            strength = strength - 15;
            intel = intel + 15;
            break;
    }

    // Lên cấp 4 và cấp 5 trước khi vào trận
    level = 4;
    xp = xp + 700;
    level = 5;
    let health = level + 100;

    maxHeroHealth = health;
    maxDragonHealth = 600;

    hero = {
        name: nhapTen.trim() || defaultName,
        phanCap: phanCap,
        level: level,
        health: health,
        strength: Math.round(strength * 10) / 10,
        agility: Math.round(agility * 10) / 10,
        intel: Math.round(intel * 10) / 10
    };

    dragon = {
        health: 600,
        str: 100,
        agi: 15,
        int: 80
    };

    // Hiển thị thông tin lên giao diện
    document.getElementById('hero-banner').innerHTML =
        `Anh hùng JS: <strong>${defaultName}</strong> (MSSV: ${MSSV}) | Cấp độ: <strong>${hero.level}</strong> | <em>${memoryNote}</em>`;
    document.getElementById('display-hero-name').textContent = hero.name;
    document.getElementById('display-hero-class').textContent = `${hero.phanCap} (Lv.${hero.level})`;

    document.getElementById('hero-stats').innerHTML = `
        <span>⚔️ STR: <b>${hero.strength}</b></span>
        <span>💨 AGI: <b>${hero.agility}%</b></span>
        <span>🎯 INT: <b>${hero.intel}%</b></span>
    `;

    document.getElementById('dragon-stats').innerHTML = `
        <span>🔥 STR: <b>${dragon.str}</b></span>
        <span>💨 AGI: <b>${dragon.agi}%</b></span>
        <span>💥 INT: <b>${dragon.int}%</b></span>
    `;

    updateHealthBars();
}

// ========================================================
// HIỆU ỨNG HÌNH ẢNH & CẬP NHẬT GIAO DIỆN
// ========================================================
function updateHealthBars() {
    const heroPct = Math.max(0, (hero.health / maxHeroHealth) * 100);
    const dragonPct = Math.max(0, (dragon.health / maxDragonHealth) * 100);

    document.getElementById('hero-hp-bar').style.width = heroPct + '%';
    document.getElementById('hero-hp-text').textContent = `${Math.max(0, Math.round(hero.health))} / ${maxHeroHealth}`;

    document.getElementById('dragon-hp-bar').style.width = dragonPct + '%';
    document.getElementById('dragon-hp-text').textContent = `${Math.max(0, Math.round(dragon.health))} / ${maxDragonHealth}`;
}

function addLog(message, type = '') {
    const logBox = document.getElementById('battle-log');
    const entry = document.createElement('div');
    entry.className = `log-entry ${type}`;
    entry.textContent = `▶ ${message}`;
    logBox.appendChild(entry);
    logBox.scrollTop = logBox.scrollHeight;
}

function showFloatingText(text, targetSide, styleClass) {
    const vfx = document.getElementById('vfx-layer');
    const el = document.createElement('div');
    el.className = `floating-text ${styleClass}`;
    el.textContent = text;

    if (targetSide === 'dragon') {
        el.style.right = '18%';
        el.style.bottom = '180px';
    } else {
        el.style.left = '18%';
        el.style.bottom = '180px';
    }

    vfx.appendChild(el);
    setTimeout(() => el.remove(), 1100);
}

function triggerSlashEffect() {
    const vfx = document.getElementById('vfx-layer');
    const slash = document.createElement('div');
    slash.className = 'slash-effect';
    vfx.appendChild(slash);
    setTimeout(() => slash.remove(), 450);
}

function triggerFireballEffect() {
    const vfx = document.getElementById('vfx-layer');
    const fire = document.createElement('div');
    fire.className = 'fireball-effect';
    vfx.appendChild(fire);
    setTimeout(() => fire.remove(), 500);
}

function triggerAnim(elementId, className, duration = 450) {
    const el = document.getElementById(elementId);
    if (!el) return;
    el.classList.remove(className);
    void el.offsetWidth;
    el.classList.add(className);
    setTimeout(() => el.classList.remove(className), duration);
}

// ========================================================
// MỘT LƯỢT CHIẾN ĐẤU (ANH HÙNG ĐÁNH -> RỒNG PHẢN CÔNG)
// ========================================================
function executeTurn() {
    if (isAnimating || hero.health <= 0 || dragon.health <= 0) return;
    isAnimating = true;
    document.getElementById('attack-btn').disabled = true;

    // 1. LƯỢT CỦA ANH HÙNG
    triggerAnim('hero-sprite', 'hero-attack-anim', 450);

    setTimeout(() => {
        const heroHit = Math.random() * 100 > dragon.agi;

        if (heroHit) {
            triggerSlashEffect();
            triggerAnim('dragon-sprite', 'hurt-anim', 400);
            triggerAnim('arena', 'screen-shake', 350);

            dragon.health -= hero.strength;
            addLog(`TRẢM LONG! Bạn gây sát thương ${hero.strength} điểm cho Rồng!`, 'hero');
            showFloatingText(`-${hero.strength}`, 'dragon', 'dmg-normal');

            // Kiểm tra chí mạng
            const heroCritical = Math.random() * 100 < hero.intel;
            if (heroCritical) {
                SoundFX.criticalHit();
                const critDmg = hero.strength * 2;
                dragon.health -= critDmg;
                addLog(`CHÍ MẠNG! Bạn gây thêm ${critDmg} sát thương cho Rồng!`, 'crit');
                setTimeout(() => showFloatingText(`CHÍ MẠNG -${critDmg}!`, 'dragon', 'dmg-crit'), 180);
            } else {
                SoundFX.swordSlash();
            }
        } else {
            SoundFX.dodge();
            triggerAnim('dragon-sprite', 'dodge-anim', 450);
            addLog('XÍ HỤT! Rồng đã lượn tránh được đòn tấn công của Bạn!', 'miss');
            showFloatingText('NÉ ĐÒN!', 'dragon', 'dmg-miss');
        }

        updateHealthBars();

        // Kiểm tra Rồng đã bị hạ gục chưa
        if (dragon.health <= 0) {
            SoundFX.victory();
            addLog('CHIẾN THẮNG!!! Rồng Già đã bị hạ gục! Chúc mừng bạn đã chiến thắng!!!', 'system');
            endGame();
            return;
        }

        // 2. LƯỢT PHẢN CÔNG CỦA RỒNG GIÀ
        setTimeout(() => {
            triggerAnim('dragon-sprite', 'dragon-attack-anim', 450);

            setTimeout(() => {
                const dragonHit = Math.random() * 100 > hero.agility;

                if (dragonHit) {
                    SoundFX.fireball();
                    triggerFireballEffect();

                    setTimeout(() => {
                        triggerAnim('hero-sprite', 'hurt-anim', 400);
                        triggerAnim('arena', 'screen-shake', 350);

                        hero.health -= dragon.str;
                        addLog(`HỎA CẦU! Rồng gây sát thương ${dragon.str} điểm cho Bạn!`, 'dragon');
                        showFloatingText(`-${dragon.str}`, 'hero', 'dmg-normal');

                        const dragonCritical = Math.random() * 100 < dragon.int;
                        if (dragonCritical) {
                            SoundFX.criticalHit();
                            const critDmg = dragon.str * 2;
                            hero.health -= critDmg;
                            addLog(`CHÍ MẠNG! Rồng gây sát thương chí mạng thêm ${critDmg} điểm cho Bạn!`, 'crit');
                            setTimeout(() => showFloatingText(`CHÍ MẠNG -${critDmg}!`, 'hero', 'dmg-crit'), 180);
                        }

                        updateHealthBars();

                        // Kiểm tra Anh hùng có bị nướng không
                        if (hero.health <= 0) {
                            SoundFX.defeat();
                            addLog('THẤT BẠI!!! Chúc mừng bạn đã có tên trên menu món tối của Rồng: Hiệp sĩ nướng lá lốt!', 'dragon');
                            endGame();
                            return;
                        }

                        isAnimating = false;
                        document.getElementById('attack-btn').disabled = false;
                    }, 300);
                } else {
                    SoundFX.dodge();
                    triggerAnim('hero-sprite', 'dodge-anim', 450);
                    addLog('XÍ HỤT! Bạn đã nhanh nhẹn né được Hỏa Cầu từ Rồng!', 'miss');
                    showFloatingText('NÉ ĐÒN!', 'hero', 'dmg-miss');

                    isAnimating = false;
                    document.getElementById('attack-btn').disabled = false;
                }
            }, 200);
        }, 750);

    }, 220);
}

function endGame() {
    isAnimating = false;
    if (autoInterval) {
        clearInterval(autoInterval);
        autoInterval = null;
    }
    const attackBtn = document.getElementById('attack-btn');
    const autoBtn = document.getElementById('auto-btn');
    const resetBtn = document.getElementById('reset-btn');
    
    if (attackBtn) attackBtn.classList.add('hidden');
    if (autoBtn) autoBtn.classList.add('hidden');
    if (resetBtn) resetBtn.classList.remove('hidden');
}

// ========================================================
// SỰ KIỆN NÚT BẤM GIAO DIỆN
// ========================================================
document.addEventListener('DOMContentLoaded', () => {
    const startBtn = document.getElementById('start-btn');
    if (startBtn) {
        startBtn.addEventListener('click', () => {
            SoundFX.init();
            const nameInput = document.getElementById('hero-name-input').value;
            const selectedClassInput = document.querySelector('input[name="hero-class"]:checked');
            const selectedClass = selectedClassInput ? selectedClassInput.value : 'a';

            initGameData(nameInput, selectedClass);
            document.getElementById('setup-modal').classList.add('hidden');
            document.getElementById('game-container').classList.remove('hidden');
        });
    }

    const attackBtn = document.getElementById('attack-btn');
    if (attackBtn) {
        attackBtn.addEventListener('click', executeTurn);
    }

    const autoBtn = document.getElementById('auto-btn');
    if (autoBtn) {
        autoBtn.addEventListener('click', (e) => {
            if (autoInterval) {
                clearInterval(autoInterval);
                autoInterval = null;
                e.target.textContent = '⚡ TỰ ĐỘNG ĐÁNH';
            } else {
                e.target.textContent = '⏸️ DỪNG TỰ ĐỘNG';
                executeTurn();
                autoInterval = setInterval(() => {
                    if (!isAnimating && hero.health > 0 && dragon.health > 0) {
                        executeTurn();
                    }
                }, 1600);
            }
        });
    }

    const resetBtn = document.getElementById('reset-btn');
    if (resetBtn) {
        resetBtn.addEventListener('click', () => {
            location.reload();
        });
    }
});