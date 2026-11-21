import * as THREE from 'three';

export function createMeadowGroundTexture(maxAnisotropy: number): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d');

  if (ctx) {
    // Soft sunny meadow gradient
    const bgGrad = ctx.createRadialGradient(512, 512, 60, 512, 512, 512);
    bgGrad.addColorStop(0, '#EAF5FF');
    bgGrad.addColorStop(0.38, '#DDEEFF');
    bgGrad.addColorStop(0.52, '#BCE6A8');
    bgGrad.addColorStop(1, '#8ED07B');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, 1024, 1024);

    // Subtle concentric stage rings on center play plaza
    ctx.strokeStyle = 'rgba(40, 123, 255, 0.14)';
    ctx.lineWidth = 4;
    [130, 210, 285].forEach((r) => {
      ctx.beginPath();
      ctx.arc(512, 512, r, 0, Math.PI * 2);
      ctx.stroke();
    });

    // Soft organic grass speckles in outer meadow
    for (let i = 0; i < 650; i++) {
      const angle = (i * 137.5 * Math.PI) / 180;
      const dist = 260 + ((i * 29) % 240);
      const x = 512 + Math.cos(angle) * dist;
      const y = 512 + Math.sin(angle) * dist;
      ctx.fillStyle = i % 2 === 0 ? 'rgba(53, 180, 95, 0.22)' : 'rgba(255, 216, 61, 0.16)';
      ctx.beginPath();
      ctx.arc(x, y, 3 + (i % 4), 0, Math.PI * 2);
      ctx.fill();
    }
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = Math.min(8, maxAnisotropy || 1);
  tex.needsUpdate = true;
  return tex;
}

export function createBrushedGrainTexture(maxAnisotropy: number): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');

  if (ctx) {
    ctx.fillStyle = '#808080';
    ctx.fillRect(0, 0, 256, 256);
    for (let y = 0; y < 256; y += 2) {
      const shade = 116 + ((y * 17) % 28);
      ctx.fillStyle = `rgb(${shade}, ${shade}, ${shade})`;
      ctx.fillRect(0, y, 256, 1);
    }
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(2, 2);
  tex.anisotropy = Math.min(4, maxAnisotropy || 1);
  tex.needsUpdate = true;
  return tex;
}

export function createContactShadowTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');

  if (ctx) {
    const grad = ctx.createRadialGradient(128, 128, 10, 128, 128, 124);
    grad.addColorStop(0, 'rgba(15, 23, 42, 0.42)');
    grad.addColorStop(0.55, 'rgba(15, 23, 42, 0.16)');
    grad.addColorStop(1, 'rgba(15, 23, 42, 0.0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 256, 256);
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.needsUpdate = true;
  return tex;
}
