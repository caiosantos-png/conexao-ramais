(function () {
    const canvas = document.getElementById("bgCanvas");
    const ctx = canvas.getContext("2d");
    let W, H, mouse = { x: -999, y: -999 };

    function resize() { W = canvas.width = window.innerWidth; H = canvas.height = window.innerHeight; }
    resize();
    window.addEventListener("resize", resize);
    window.addEventListener("mousemove", e => { mouse.x = e.clientX; mouse.y = e.clientY; });

    // ── BOLHAS PLASMA ──────────────────────────────────
    const blobs = Array.from({ length: 7 }, (_, i) => ({
        x: Math.random() * 1200, y: Math.random() * 800,
        vx: (Math.random() - .5) * .35, vy: (Math.random() - .5) * .35,
        r: 200 + Math.random() * 200,
        hue: [200,210,195,185,215,205,190][i],
        phase: Math.random() * Math.PI * 2,
        speed: .002 + Math.random() * .003,
    }));

    function drawBlobs() {
        blobs.forEach(b => {
            b.phase += b.speed;
            b.x += b.vx + Math.sin(b.phase * .7) * .4;
            b.y += b.vy + Math.cos(b.phase * .5) * .4;
            if (b.x < -b.r) b.x = W + b.r; if (b.x > W + b.r) b.x = -b.r;
            if (b.y < -b.r) b.y = H + b.r; if (b.y > H + b.r) b.y = -b.r;
            const pulse = 1 + .1 * Math.sin(b.phase * 1.4);
            const rad = b.r * pulse;
            const g = ctx.createRadialGradient(b.x, b.y, 0, b.x, b.y, rad);
            g.addColorStop(0,  `hsla(${b.hue},65%,62%,.16)`);
            g.addColorStop(.5, `hsla(${b.hue},55%,58%,.07)`);
            g.addColorStop(1,  `hsla(${b.hue},50%,55%,0)`);
            ctx.fillStyle = g;
            ctx.beginPath(); ctx.arc(b.x, b.y, rad, 0, Math.PI * 2); ctx.fill();
        });
    }

    // ── PARTÍCULAS + LINHAS ────────────────────────────
    const parts = Array.from({ length: 185}, () => ({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        vx: (Math.random() - .5) * .5,
        vy: (Math.random() - .5) * .5,
        r: 1.5 + Math.random() * 2,
        alpha: .25 + Math.random() * .45,
    }));

    function drawParticles() {
        parts.forEach(p => {
            const dx = mouse.x - p.x, dy = mouse.y - p.y;
            const d = Math.sqrt(dx*dx + dy*dy);
            if (d < 160) { p.vx += dx/d*.018; p.vy += dy/d*.018; }
            const spd = Math.sqrt(p.vx*p.vx + p.vy*p.vy);
            if (spd > 1.5) { p.vx *= .96; p.vy *= .96; }
            p.x += p.vx; p.y += p.vy;
            if (p.x < 0) { p.x=0; p.vx*=-1; } if (p.x > W) { p.x=W; p.vx*=-1; }
            if (p.y < 0) { p.y=0; p.vy*=-1; } if (p.y > H) { p.y=H; p.vy*=-1; }
            ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI*2);
            ctx.fillStyle = `rgba(11,90,180,${p.alpha})`; ctx.fill();
        });
        for (let i = 0; i < parts.length; i++) {
            for (let j = i+1; j < parts.length; j++) {
                const dx = parts[i].x-parts[j].x, dy = parts[i].y-parts[j].y;
                const d = Math.sqrt(dx*dx+dy*dy);
                if (d < 120) {
                    ctx.beginPath();
                    ctx.moveTo(parts[i].x, parts[i].y);
                    ctx.lineTo(parts[j].x, parts[j].y);
                    ctx.strokeStyle = `rgba(0,150,220,${(1-d/120)*.16})`;
                    ctx.lineWidth = .8; ctx.stroke();
                }
            }
        }
    }

    // ── METEOROS ───────────────────────────────────────
    const meteors = [];
    function spawnMeteor() {
        meteors.push({
            x: Math.random() * W * 0.1,
            y: -20,
            len: 85 + Math.random() * 800,
            speed: 15 + Math.random() * 22,
            alpha: .9 + Math.random() * .8,
            angle: Math.PI / 4 + (Math.random() - .5) * .3,
        });
    }
    setInterval(spawnMeteor, 1200);

    function drawMeteors() {
        for (let i = meteors.length-1; i >= 0; i--) {
            const m = meteors[i];
            m.x += Math.cos(m.angle) * m.speed;
            m.y += Math.sin(m.angle) * m.speed;
            m.alpha -= .008;


            if (m.alpha <= 0 || m.y > H + 50) { meteors.splice(i,1); continue; }
            const tx = m.x - Math.cos(m.angle) * m.len;
            const ty = m.y - Math.sin(m.angle) * m.len;
            const g = ctx.createLinearGradient(tx, ty, m.x, m.y);
            g.addColorStop(0, `rgba(248, 107, 51, 0)`);
            g.addColorStop(1, `rgba(255,255,255,${m.alpha})`);
            ctx.beginPath(); ctx.moveTo(tx, ty); ctx.lineTo(m.x, m.y);
            ctx.strokeStyle = g; ctx.lineWidth = 4.0; ctx.stroke();
            // Brilho na ponta
            const gp = ctx.createRadialGradient(m.x, m.y, 0, m.x, m.y, 6);
            gp.addColorStop(0, `rgba(255,255,255,${m.alpha})`);
            gp.addColorStop(1, `rgba(236, 200, 0, 0)`);
            ctx.fillStyle = gp;
            ctx.beginPath(); ctx.arc(m.x, m.y, 6, 0, Math.PI*2); ctx.fill();
        }
    }

    // ── ONDAS SENOIDAIS ────────────────────────────────
    let waveT = 0;
    function drawWaves() {
        waveT += .008;
        for (let w = 0; w < 3; w++) {
            ctx.beginPath();
            const amp   = 18 + w * 100;
            const freq  = .008 - w * .004;
            const yBase = H * (.3 + w * .2);
            const alpha = .06 - w * .015;
            ctx.moveTo(0, yBase);
            for (let x = 0; x <= W; x += 4) {
                const y = yBase + Math.sin(x * freq + waveT + w * 1.2) * amp
                                + Math.sin(x * freq * 1.7 + waveT * .8) * (amp * .4);
                ctx.lineTo(x, y);
            }
            ctx.strokeStyle = `rgba(0,150,220,${alpha})`;
            ctx.lineWidth = 1.5; ctx.stroke();
        }
    }

    // ── BRILHO NO CURSOR ───────────────────────────────
    function drawMouseGlow() {
        if (mouse.x < 0) return;
        const g = ctx.createRadialGradient(mouse.x, mouse.y, 0, mouse.x, mouse.y, 90);
        g.addColorStop(0,  `rgba(0,184,217,.10)`);
        g.addColorStop(.5, `rgba(0,184,217,.04)`);
        g.addColorStop(1,  `rgba(0,184,217,0)`);
        ctx.fillStyle = g;
        ctx.beginPath(); ctx.arc(mouse.x, mouse.y, 90, 0, Math.PI*2); ctx.fill();
    }

    // ── ONDAS DE CLIQUE ────────────────────────────────
    const rings = [];
    window.addEventListener("click", e => rings.push({ x:e.clientX, y:e.clientY, r:0, alpha:.6 }));
    function drawRings() {
        for (let i = rings.length-1; i >= 0; i--) {
            const rg = rings[i];
            rg.r += 4; rg.alpha -= .015;
            if (rg.alpha <= 0) { rings.splice(i,1); continue; }
            ctx.beginPath(); ctx.arc(rg.x, rg.y, rg.r, 0, Math.PI*2);
            ctx.strokeStyle = `rgba(0,184,217,${rg.alpha})`;
            ctx.lineWidth = 2; ctx.stroke();
            // Segundo anel menor
            ctx.beginPath(); ctx.arc(rg.x, rg.y, rg.r*.5, 0, Math.PI*2);
            ctx.strokeStyle = `rgba(0,184,217,${rg.alpha*.4})`;
            ctx.lineWidth = 1; ctx.stroke();
        }
    }

    // ── LOOP ───────────────────────────────────────────
    function loop() {
        ctx.clearRect(0, 0, W, H);
        drawBlobs();
        drawWaves();
        drawParticles();
        drawMeteors();
        drawMouseGlow();
        drawRings();
        requestAnimationFrame(loop);
    }
    requestAnimationFrame(loop);
})();
