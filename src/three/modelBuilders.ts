import * as THREE from 'three';

export type Model3DId =
  | 'parade'
  | 'race_car'
  | 'rocket'
  | 'apple_tree'
  | 'toy_train'
  | 'math_robot'
  | 'star_trophy'
  | 'abacus_toy'
  | 'number_castle';

export interface Model3DCatalogItem {
  id: Exclude<Model3DId, 'parade'>;
  nameEn: string;
  nameHi: string;
  partsCount: number;
  accentColor: string;
  unlockStars: number;
}

export const MODEL_3D_CATALOG: Model3DCatalogItem[] = [
  { id: 'apple_tree', nameEn: 'Apple Tree', nameHi: 'सेब का पेड़', partsCount: 11, accentColor: '#35D66F', unlockStars: 0 },
  { id: 'toy_train', nameEn: 'Choo-Choo Train', nameHi: 'छुक-छुक ट्रेन', partsCount: 13, accentColor: '#FF963C', unlockStars: 0 },
  { id: 'math_robot', nameEn: 'Robo-Buddy', nameHi: 'रोबो दोस्त', partsCount: 10, accentColor: '#9755F5', unlockStars: 0 },
  { id: 'star_trophy', nameEn: 'Golden Star Trophy', nameHi: 'सुनहरी स्टार ट्रॉफी', partsCount: 7, accentColor: '#FFD83D', unlockStars: 0 },
  { id: 'race_car', nameEn: 'Math Race Car', nameHi: 'गणित रेस कार', partsCount: 10, accentColor: '#287BFF', unlockStars: 0 },
  { id: 'rocket', nameEn: 'Number Rocket', nameHi: 'नंबर रॉकेट', partsCount: 9, accentColor: '#FF55AE', unlockStars: 0 },
  { id: 'abacus_toy', nameEn: '3D Counting Abacus', nameHi: '3D गिनतारा', partsCount: 10, accentColor: '#287BFF', unlockStars: 10 },
  { id: 'number_castle', nameEn: 'Number Castle', nameHi: 'संख्या महल', partsCount: 10, accentColor: '#9755F5', unlockStars: 18 },
];

export interface Shared3DResources {
  geometries: THREE.BufferGeometry[];
  materials: THREE.Material[];
  shadowTexture: THREE.Texture;
  bumpTexture: THREE.Texture;
}

function trackGeo<T extends THREE.BufferGeometry>(res: Shared3DResources, geo: T): T {
  res.geometries.push(geo);
  return geo;
}

function trackMat<T extends THREE.Material>(res: Shared3DResources, mat: T): T {
  res.materials.push(mat);
  return mat;
}

function addContactShadow(group: THREE.Group, res: Shared3DResources, radius = 1.65) {
  const shadowGeo = trackGeo(res, new THREE.PlaneGeometry(radius * 2, radius * 2));
  shadowGeo.rotateX(-Math.PI / 2);
  const shadowMat = trackMat(
    res,
    new THREE.MeshBasicMaterial({
      map: res.shadowTexture,
      transparent: true,
      depthWrite: false,
      opacity: 0.85,
    })
  );
  const shadow = new THREE.Mesh(shadowGeo, shadowMat);
  shadow.position.y = 0.015;
  shadow.userData.isShadow = true;
  group.add(shadow);
}

interface TagPartOptions {
  res?: Shared3DResources;
  highlightable?: boolean;
  partCategory?: string;
  partIndex?: number;
  labelEn?: string;
  labelHi?: string;
}

function tagPart(
  mesh: THREE.Object3D,
  explodeVec: THREE.Vector3,
  modelId: string,
  partName: string,
  opts?: TagPartOptions
) {
  mesh.userData.basePos = mesh.position.clone();
  mesh.userData.explodeVec = explodeVec;
  mesh.userData.modelId = modelId;
  mesh.userData.partName = partName;
  mesh.userData.isPartRoot = true;
  if (opts?.partCategory) mesh.userData.partCategory = opts.partCategory;
  if (typeof opts?.partIndex === 'number') mesh.userData.partIndex = opts.partIndex;
  if (opts?.labelEn) mesh.userData.labelEn = opts.labelEn;
  if (opts?.labelHi) mesh.userData.labelHi = opts.labelHi;

  mesh.traverse((child) => {
    if ((child as THREE.Mesh).isMesh) {
      const m = child as THREE.Mesh;
      m.castShadow = true;
      m.receiveShadow = true;
      m.userData.modelId = modelId;
      m.userData.partRoot = mesh;

      if (opts?.highlightable && opts.res && m.material && !Array.isArray(m.material)) {
        const stdMat = m.material as THREE.MeshStandardMaterial;
        if ('emissive' in stdMat) {
          const cloned = stdMat.clone();
          opts.res.materials.push(cloned);
          m.material = cloned;
          m.userData.baseEmissive = cloned.emissive.getHex();
          m.userData.baseEmissiveIntensity = cloned.emissiveIntensity ?? 0;
        }
      }
    }
  });
}

export function setObjectHighlighted(
  obj: THREE.Object3D,
  highlighted: boolean,
  highlightHex = 0xffd83d
) {
  obj.traverse((child) => {
    if ((child as THREE.Mesh).isMesh && !child.userData.isShadow) {
      const m = child as THREE.Mesh;
      const mat = m.material as THREE.MeshStandardMaterial | undefined;
      if (mat && 'emissive' in mat) {
        if (typeof m.userData.baseEmissive !== 'number') {
          m.userData.baseEmissive = mat.emissive.getHex();
          m.userData.baseEmissiveIntensity = mat.emissiveIntensity ?? 0;
        }
        if (highlighted) {
          mat.emissive.setHex(highlightHex);
          mat.emissiveIntensity = 0.52;
        } else {
          mat.emissive.setHex(m.userData.baseEmissive);
          mat.emissiveIntensity = m.userData.baseEmissiveIntensity ?? 0;
        }
      }
    }
  });
}

/**
 * 1. Composite Math Race Car (10 parts: extruded beveled chassis, canopy, spoiler,
 *    4 two-part wheels with rubber tires & chrome hubs, twin headlights, racing stripe)
 */
export function buildRaceCar(res: Shared3DResources): THREE.Group {
  const group = new THREE.Group();
  addContactShadow(group, res, 1.85);

  const carPaint = trackMat(
    res,
    new THREE.MeshPhysicalMaterial({
      color: 0x287bff,
      roughness: 0.22,
      metalness: 0.15,
      clearcoat: 0.85,
      clearcoatRoughness: 0.12,
      bumpMap: res.bumpTexture,
      bumpScale: 0.008,
    })
  );
  const stripeMat = trackMat(
    res,
    new THREE.MeshStandardMaterial({ color: 0xffd83d, roughness: 0.35, metalness: 0.1 })
  );
  const glassMat = trackMat(
    res,
    new THREE.MeshPhysicalMaterial({
      color: 0xbfe6ff,
      roughness: 0.08,
      metalness: 0.1,
      clearcoat: 1.0,
    })
  );
  const tireMat = trackMat(
    res,
    new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.88, metalness: 0.05 })
  );
  const chromeMat = trackMat(
    res,
    new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.18, metalness: 0.92 })
  );
  const lightMat = trackMat(
    res,
    new THREE.MeshStandardMaterial({
      color: 0xfff3b0,
      emissive: 0xffd83d,
      emissiveIntensity: 0.65,
      roughness: 0.2,
    })
  );

  // Primary silhouette: beveled side-profile extruded chassis
  const bodyShape = new THREE.Shape();
  bodyShape.moveTo(-1.35, 0.22);
  bodyShape.lineTo(1.35, 0.22);
  bodyShape.lineTo(1.42, 0.56);
  bodyShape.lineTo(0.85, 0.72);
  bodyShape.lineTo(0.38, 1.15);
  bodyShape.lineTo(-0.65, 1.15);
  bodyShape.lineTo(-1.18, 0.76);
  bodyShape.lineTo(-1.38, 0.62);
  bodyShape.closePath();

  const bodyGeo = trackGeo(
    res,
    new THREE.ExtrudeGeometry(bodyShape, {
      depth: 1.24,
      bevelEnabled: true,
      bevelThickness: 0.1,
      bevelSize: 0.08,
      bevelSegments: 3,
    })
  );
  bodyGeo.translate(0, 0, -0.62);
  const body = new THREE.Mesh(bodyGeo, carPaint);
  tagPart(body, new THREE.Vector3(0, 0.2, 0), 'race_car', 'Chassis');
  group.add(body);

  // Racing stripe
  const stripeGeo = trackGeo(res, new THREE.BoxGeometry(2.55, 0.08, 0.34));
  const stripe = new THREE.Mesh(stripeGeo, stripeMat);
  stripe.position.set(0.05, 0.78, 0);
  tagPart(stripe, new THREE.Vector3(0, 0.85, 0), 'race_car', 'Racing Stripe');
  group.add(stripe);

  // Windshield & cabin canopy
  const canopyGeo = trackGeo(res, new THREE.BoxGeometry(0.95, 0.42, 1.02));
  const canopy = new THREE.Mesh(canopyGeo, glassMat);
  canopy.position.set(-0.12, 0.96, 0);
  tagPart(canopy, new THREE.Vector3(0, 1.05, 0), 'race_car', 'Cockpit');
  group.add(canopy);

  // Rear spoiler
  const spoilerWing = new THREE.Group();
  const wingGeo = trackGeo(res, new THREE.BoxGeometry(0.34, 0.08, 1.38));
  const wingMesh = new THREE.Mesh(wingGeo, stripeMat);
  wingMesh.position.y = 0.26;
  const strutGeo = trackGeo(res, new THREE.BoxGeometry(0.12, 0.28, 0.1));
  const strutL = new THREE.Mesh(strutGeo, chromeMat);
  strutL.position.set(0, 0.1, 0.42);
  const strutR = new THREE.Mesh(strutGeo, chromeMat);
  strutR.position.set(0, 0.1, -0.42);
  spoilerWing.add(wingMesh, strutL, strutR);
  spoilerWing.position.set(-1.18, 0.8, 0);
  tagPart(spoilerWing, new THREE.Vector3(-0.7, 0.6, 0), 'race_car', 'Spoiler');
  group.add(spoilerWing);

  // Headlights
  const lampGeo = trackGeo(res, new THREE.CylinderGeometry(0.12, 0.12, 0.08, 16));
  lampGeo.rotateZ(Math.PI / 2);
  [-0.42, 0.42].forEach((zPos, i) => {
    const lamp = new THREE.Mesh(lampGeo, lightMat);
    lamp.position.set(1.46, 0.48, zPos);
    tagPart(lamp, new THREE.Vector3(0.6, 0.15, zPos * 0.4), 'race_car', `Headlight ${i + 1}`);
    group.add(lamp);
  });

  // 4 Wheels (tire + hubcap)
  const tireGeo = trackGeo(res, new THREE.CylinderGeometry(0.36, 0.36, 0.26, 24));
  tireGeo.rotateX(Math.PI / 2);
  const rimGeo = trackGeo(res, new THREE.CylinderGeometry(0.2, 0.2, 0.28, 16));
  rimGeo.rotateX(Math.PI / 2);

  const wheelPositions: Array<[number, number]> = [
    [0.85, 0.72],
    [0.85, -0.72],
    [-0.85, 0.72],
    [-0.85, -0.72],
  ];
  wheelPositions.forEach(([xPos, zPos], idx) => {
    const wheelGroup = new THREE.Group();
    wheelGroup.add(new THREE.Mesh(tireGeo, tireMat));
    wheelGroup.add(new THREE.Mesh(rimGeo, chromeMat));
    wheelGroup.position.set(xPos, 0.36, zPos);
    tagPart(
      wheelGroup,
      new THREE.Vector3(xPos * 0.25, -0.05, Math.sign(zPos) * 0.55),
      'race_car',
      `Wheel ${idx + 1}`
    );
    group.add(wheelGroup);
  });

  return group;
}

/**
 * 2. Composite Number Rocket (9 parts: Lathe hull, nose cone, collar ring,
 *    porthole rim + glass, 3 extruded fins, thruster nozzle + flame cone)
 */
export function buildRocket(res: Shared3DResources): THREE.Group {
  const group = new THREE.Group();
  addContactShadow(group, res, 1.5);

  const hullMat = trackMat(
    res,
    new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      roughness: 0.26,
      metalness: 0.1,
      clearcoat: 0.7,
    })
  );
  const pinkMat = trackMat(
    res,
    new THREE.MeshStandardMaterial({ color: 0xff55ae, roughness: 0.32, metalness: 0.18 })
  );
  const metalMat = trackMat(
    res,
    new THREE.MeshStandardMaterial({ color: 0x64748b, roughness: 0.25, metalness: 0.88 })
  );
  const glassMat = trackMat(
    res,
    new THREE.MeshPhysicalMaterial({
      color: 0x38bdf8,
      roughness: 0.08,
      metalness: 0.15,
      clearcoat: 1.0,
    })
  );
  const glowMat = trackMat(
    res,
    new THREE.MeshStandardMaterial({
      color: 0xff963c,
      emissive: 0xff6b00,
      emissiveIntensity: 0.8,
      roughness: 0.4,
    })
  );

  // Lathe fuselage profile (pivoted above nozzle)
  const pts = [
    new THREE.Vector2(0.32, 0.45),
    new THREE.Vector2(0.56, 0.72),
    new THREE.Vector2(0.64, 1.45),
    new THREE.Vector2(0.56, 2.2),
    new THREE.Vector2(0.34, 2.65),
    new THREE.Vector2(0.0, 2.85),
  ];
  const hullGeo = trackGeo(res, new THREE.LatheGeometry(pts, 28));
  const hull = new THREE.Mesh(hullGeo, hullMat);
  tagPart(hull, new THREE.Vector3(0, 0.35, 0), 'rocket', 'Fuselage');
  group.add(hull);

  // Nose cone cap
  const noseGeo = trackGeo(res, new THREE.ConeGeometry(0.41, 0.65, 24));
  const nose = new THREE.Mesh(noseGeo, pinkMat);
  nose.position.set(0, 2.75, 0);
  tagPart(nose, new THREE.Vector3(0, 1.15, 0), 'rocket', 'Nose Cone');
  group.add(nose);

  // Porthole frame + glass
  const frameGeo = trackGeo(res, new THREE.TorusGeometry(0.24, 0.055, 14, 28));
  const frame = new THREE.Mesh(frameGeo, metalMat);
  frame.position.set(0, 1.68, 0.6);
  tagPart(frame, new THREE.Vector3(0, 0.4, 0.7), 'rocket', 'Window Frame');
  group.add(frame);

  const windowGeo = trackGeo(res, new THREE.SphereGeometry(0.22, 20, 16));
  windowGeo.scale(1, 1, 0.45);
  const win = new THREE.Mesh(windowGeo, glassMat);
  win.position.set(0, 1.68, 0.57);
  tagPart(win, new THREE.Vector3(0, 0.4, 0.5), 'rocket', 'Viewport');
  group.add(win);

  // 3 Extruded Tail Fins
  const finShape = new THREE.Shape();
  finShape.moveTo(0, 0);
  finShape.lineTo(0.52, -0.22);
  finShape.lineTo(0.45, 0.48);
  finShape.lineTo(0, 0.85);
  finShape.closePath();

  const finGeo = trackGeo(
    res,
    new THREE.ExtrudeGeometry(finShape, {
      depth: 0.08,
      bevelEnabled: true,
      bevelThickness: 0.02,
      bevelSize: 0.02,
      bevelSegments: 2,
    })
  );
  finGeo.translate(0, 0, -0.04);

  for (let i = 0; i < 3; i++) {
    const angle = (i * Math.PI * 2) / 3;
    const fin = new THREE.Mesh(finGeo, pinkMat);
    fin.position.set(Math.cos(angle) * 0.46, 0.52, Math.sin(angle) * 0.46);
    fin.rotation.y = -angle;
    tagPart(
      fin,
      new THREE.Vector3(Math.cos(angle) * 0.75, 0.05, Math.sin(angle) * 0.75),
      'rocket',
      `Tail Fin ${i + 1}`
    );
    group.add(fin);
  }

  // Thruster nozzle & booster flame
  const nozzleGeo = trackGeo(res, new THREE.CylinderGeometry(0.26, 0.36, 0.34, 20));
  const nozzle = new THREE.Mesh(nozzleGeo, metalMat);
  nozzle.position.set(0, 0.32, 0);
  tagPart(nozzle, new THREE.Vector3(0, -0.15, 0), 'rocket', 'Thruster');
  group.add(nozzle);

  const flameGeo = trackGeo(res, new THREE.ConeGeometry(0.22, 0.34, 16));
  flameGeo.rotateX(Math.PI);
  const flame = new THREE.Mesh(flameGeo, glowMat);
  flame.position.set(0, 0.17, 0);
  tagPart(flame, new THREE.Vector3(0, -0.25, 0), 'rocket', 'Booster Flame');
  group.add(flame);

  return group;
}

/**
 * 3. Composite Counting Apple Tree (supports 1..8 individually tappable apples
 *    plus animated addition pop-in for `addedFromIndex`)
 */
export function buildAppleTree(
  res: Shared3DResources,
  options?: { appleCount?: number; addedFromIndex?: number }
): THREE.Group {
  const group = new THREE.Group();
  addContactShadow(group, res, 1.8);

  const barkMat = trackMat(
    res,
    new THREE.MeshStandardMaterial({
      color: 0x8b5a2b,
      roughness: 0.92,
      metalness: 0.0,
      bumpMap: res.bumpTexture,
      bumpScale: 0.025,
    })
  );
  const leafMatA = trackMat(
    res,
    new THREE.MeshStandardMaterial({ color: 0x35d66f, roughness: 0.72, metalness: 0.02 })
  );
  const leafMatB = trackMat(
    res,
    new THREE.MeshStandardMaterial({ color: 0x22c55e, roughness: 0.68, metalness: 0.02 })
  );
  const appleMat = trackMat(
    res,
    new THREE.MeshPhysicalMaterial({
      color: 0xff3b4e,
      roughness: 0.2,
      metalness: 0.05,
      clearcoat: 0.9,
    })
  );
  const stemMat = trackMat(
    res,
    new THREE.MeshStandardMaterial({ color: 0x4d2c12, roughness: 0.85, metalness: 0 })
  );

  // Flared trunk using LatheGeometry
  const trunkPts = [
    new THREE.Vector2(0.46, 0),
    new THREE.Vector2(0.32, 0.35),
    new THREE.Vector2(0.25, 1.25),
    new THREE.Vector2(0.28, 1.65),
  ];
  const trunkGeo = trackGeo(res, new THREE.LatheGeometry(trunkPts, 18));
  const trunk = new THREE.Mesh(trunkGeo, barkMat);
  tagPart(trunk, new THREE.Vector3(0, 0, 0), 'apple_tree', 'Trunk', {
    partCategory: 'trunk',
    labelEn: 'Tree Trunk',
    labelHi: 'पेड़ का तना',
  });
  group.add(trunk);

  // Branch fork
  const branchGeo = trackGeo(res, new THREE.CylinderGeometry(0.11, 0.16, 0.85, 12));
  const branch = new THREE.Mesh(branchGeo, barkMat);
  branch.position.set(0.32, 1.48, 0.05);
  branch.rotation.z = -0.58;
  tagPart(branch, new THREE.Vector3(0.35, 0.25, 0), 'apple_tree', 'Branch', {
    partCategory: 'branch',
    labelEn: 'Branch',
    labelHi: 'डाली',
  });
  group.add(branch);

  // Foliage clusters
  const crownMainGeo = trackGeo(res, new THREE.SphereGeometry(0.95, 24, 20));
  const crownMain = new THREE.Mesh(crownMainGeo, leafMatA);
  crownMain.position.set(0, 2.25, 0);
  tagPart(crownMain, new THREE.Vector3(0, 0.75, 0), 'apple_tree', 'Center Canopy');
  group.add(crownMain);

  const sideGeo = trackGeo(res, new THREE.SphereGeometry(0.68, 20, 16));
  const crownLeft = new THREE.Mesh(sideGeo, leafMatB);
  crownLeft.position.set(-0.68, 1.95, 0.15);
  tagPart(crownLeft, new THREE.Vector3(-0.65, 0.45, 0.15), 'apple_tree', 'Left Canopy');
  group.add(crownLeft);

  const crownRight = new THREE.Mesh(sideGeo, leafMatB);
  crownRight.position.set(0.68, 2.02, -0.15);
  tagPart(crownRight, new THREE.Vector3(0.65, 0.5, -0.15), 'apple_tree', 'Right Canopy');
  group.add(crownRight);

  // Up to 8 well-spaced tappable apples around the canopy
  const appleBodyGeo = trackGeo(res, new THREE.SphereGeometry(0.19, 16, 14));
  const appleStemGeo = trackGeo(res, new THREE.CylinderGeometry(0.022, 0.028, 0.11, 8));
  const appleCoords: Array<[number, number, number]> = [
    [-0.56, 1.88, 0.76],
    [0.08, 2.52, 0.88],
    [0.64, 1.98, 0.58],
    [-0.86, 2.15, 0.42],
    [0.38, 2.38, 0.72],
    [-0.22, 1.72, 0.82],
    [0.82, 2.12, -0.35],
    [-0.25, 2.25, -0.82],
  ];

  const desiredCount = Math.max(1, Math.min(8, options?.appleCount ?? 5));
  const addedFrom = options?.addedFromIndex ?? desiredCount;

  appleCoords.slice(0, desiredCount).forEach(([ax, ay, az], idx) => {
    const apple = new THREE.Group();
    apple.add(new THREE.Mesh(appleBodyGeo, appleMat));
    const st = new THREE.Mesh(appleStemGeo, stemMat);
    st.position.y = 0.2;
    apple.add(st);
    apple.position.set(ax, ay, az);
    const isAdded = idx >= addedFrom;
    if (isAdded) {
      apple.scale.setScalar(0.01);
      apple.userData.popInDelay = (idx - addedFrom) * 0.28;
      apple.userData.popInProgress = 0;
      apple.userData.isAddedApple = true;
    }
    tagPart(
      apple,
      new THREE.Vector3(ax * 0.65, 0.35, az * 0.65),
      'apple_tree',
      `Apple ${idx + 1}`,
      {
        res,
        highlightable: true,
        partCategory: 'apple',
        partIndex: idx,
        labelEn: `Apple #${idx + 1}`,
        labelHi: `सेब #${idx + 1}`,
      }
    );
    group.add(apple);
  });

  return group;
}

/**
 * 4. Composite Choo-Choo Toy Train (Engine + optional 2 colorful coupled compartments
 *    with highlightable wheels and compartments)
 */
export function buildToyTrain(
  res: Shared3DResources,
  includeCompartments = false
): THREE.Group {
  const group = new THREE.Group();
  addContactShadow(group, res, includeCompartments ? 2.95 : 1.9);

  const orangeMat = trackMat(
    res,
    new THREE.MeshStandardMaterial({ color: 0xff963c, roughness: 0.32, metalness: 0.12 })
  );
  const blueMat = trackMat(
    res,
    new THREE.MeshStandardMaterial({ color: 0x287bff, roughness: 0.35, metalness: 0.15 })
  );
  const redMat = trackMat(
    res,
    new THREE.MeshStandardMaterial({ color: 0xff55ae, roughness: 0.38, metalness: 0.1 })
  );
  const greenMat = trackMat(
    res,
    new THREE.MeshStandardMaterial({ color: 0x35d66f, roughness: 0.34, metalness: 0.12 })
  );
  const purpleMat = trackMat(
    res,
    new THREE.MeshStandardMaterial({ color: 0x9755f5, roughness: 0.34, metalness: 0.12 })
  );
  const brassMat = trackMat(
    res,
    new THREE.MeshStandardMaterial({ color: 0xffd83d, roughness: 0.22, metalness: 0.86 })
  );
  const darkMetal = trackMat(
    res,
    new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.45, metalness: 0.72 })
  );

  const xOffset = includeCompartments ? 1.45 : 0;

  // Chassis Base
  const baseGeo = trackGeo(res, new THREE.BoxGeometry(2.5, 0.22, 1.12));
  const base = new THREE.Mesh(baseGeo, darkMetal);
  base.position.set(xOffset, 0.38, 0);
  tagPart(base, new THREE.Vector3(0, 0.05, 0), 'toy_train', 'Chassis', {
    partCategory: 'engine',
    labelEn: 'Engine',
    labelHi: 'इंजन',
  });
  group.add(base);

  // Boiler barrel
  const boilerGeo = trackGeo(res, new THREE.CylinderGeometry(0.45, 0.45, 1.38, 24));
  boilerGeo.rotateZ(Math.PI / 2);
  const boiler = new THREE.Mesh(boilerGeo, orangeMat);
  boiler.position.set(0.32 + xOffset, 0.92, 0);
  tagPart(boiler, new THREE.Vector3(0.3, 0.45, 0), 'toy_train', 'Boiler', {
    res,
    highlightable: true,
    partCategory: 'engine',
    labelEn: 'Engine Boiler',
    labelHi: 'इंजन बॉयलर',
  });
  group.add(boiler);

  // Smokestack (Lathe)
  const stackPts = [
    new THREE.Vector2(0.12, 0),
    new THREE.Vector2(0.14, 0.42),
    new THREE.Vector2(0.24, 0.6),
    new THREE.Vector2(0.18, 0.62),
  ];
  const stackGeo = trackGeo(res, new THREE.LatheGeometry(stackPts, 18));
  const stack = new THREE.Mesh(stackGeo, brassMat);
  stack.position.set(0.72 + xOffset, 1.32, 0);
  tagPart(stack, new THREE.Vector3(0.4, 0.95, 0), 'toy_train', 'Smokestack', {
    res,
    highlightable: true,
    partCategory: 'engine',
    labelEn: 'Smokestack',
    labelHi: 'चिमनी',
  });
  group.add(stack);

  // Engineer Cabin
  const cabinGeo = trackGeo(res, new THREE.BoxGeometry(0.95, 0.98, 1.05));
  const cabin = new THREE.Mesh(cabinGeo, blueMat);
  cabin.position.set(-0.72 + xOffset, 0.98, 0);
  tagPart(cabin, new THREE.Vector3(-0.45, 0.5, 0), 'toy_train', 'Cabin', {
    res,
    highlightable: true,
    partCategory: 'engine',
    labelEn: 'Driver Cabin',
    labelHi: 'ड्राइवर केबिन',
  });
  group.add(cabin);

  // Cabin Roof
  const roofGeo = trackGeo(res, new THREE.BoxGeometry(1.12, 0.14, 1.22));
  const roof = new THREE.Mesh(roofGeo, redMat);
  roof.position.set(-0.72 + xOffset, 1.54, 0);
  tagPart(roof, new THREE.Vector3(-0.45, 1.05, 0), 'toy_train', 'Cabin Roof');
  group.add(roof);

  // Front Cowcatcher Bumper
  const bumperGeo = trackGeo(res, new THREE.CylinderGeometry(0.12, 0.42, 0.45, 4));
  bumperGeo.rotateY(Math.PI / 4);
  bumperGeo.rotateZ(-Math.PI / 2);
  const bumper = new THREE.Mesh(bumperGeo, redMat);
  bumper.position.set(1.36 + xOffset, 0.34, 0);
  tagPart(bumper, new THREE.Vector3(0.75, 0.05, 0), 'toy_train', 'Cowcatcher');
  group.add(bumper);

  // 6 Engine Wheels
  const wheelGeo = trackGeo(res, new THREE.CylinderGeometry(0.3, 0.3, 0.14, 20));
  wheelGeo.rotateX(Math.PI / 2);
  const hubGeo = trackGeo(res, new THREE.CylinderGeometry(0.13, 0.13, 0.17, 14));
  hubGeo.rotateX(Math.PI / 2);

  [
    [-0.78, 0.6],
    [-0.78, -0.6],
    [-0.08, 0.6],
    [-0.08, -0.6],
    [0.72, 0.6],
    [0.72, -0.6],
  ].forEach(([wx, wz], idx) => {
    const wg = new THREE.Group();
    wg.add(new THREE.Mesh(wheelGeo, redMat));
    wg.add(new THREE.Mesh(hubGeo, brassMat));
    wg.position.set(wx + xOffset, 0.3, wz);
    tagPart(
      wg,
      new THREE.Vector3(wx * 0.2, -0.05, Math.sign(wz) * 0.5),
      'toy_train',
      `Train Wheel ${idx + 1}`,
      {
        res,
        highlightable: true,
        partCategory: 'wheel',
        partIndex: idx,
        labelEn: `Engine Wheel #${idx + 1}`,
        labelHi: `पहिया #${idx + 1}`,
      }
    );
    group.add(wg);
  });

  // Coupled Compartments (Passenger / Cargo Cars)
  if (includeCompartments) {
    const carBodyGeo = trackGeo(res, new THREE.BoxGeometry(1.42, 0.78, 1.02));
    const carRoofGeo = trackGeo(res, new THREE.BoxGeometry(1.52, 0.14, 1.12));
    const carBaseGeo = trackGeo(res, new THREE.BoxGeometry(1.56, 0.18, 1.06));
    const linkGeo = trackGeo(res, new THREE.BoxGeometry(0.42, 0.1, 0.16));

    const cars: Array<{ x: number; mat: THREE.Material }> = [
      { x: -0.78, mat: greenMat },
      { x: -2.62, mat: purpleMat },
    ];

    cars.forEach((car, carIdx) => {
      const carGroup = new THREE.Group();
      const cBase = new THREE.Mesh(carBaseGeo, darkMetal);
      cBase.position.y = 0.34;
      const cBody = new THREE.Mesh(carBodyGeo, car.mat);
      cBody.position.y = 0.82;
      const cRoof = new THREE.Mesh(carRoofGeo, brassMat);
      cRoof.position.y = 1.28;
      const link = new THREE.Mesh(linkGeo, darkMetal);
      link.position.set(0.9, 0.34, 0);
      carGroup.add(cBase, cBody, cRoof, link);

      carGroup.position.set(car.x, 0, 0);
      tagPart(
        carGroup,
        new THREE.Vector3(-0.35 * (carIdx + 1), 0.35, 0),
        'toy_train',
        `Compartment ${carIdx + 1}`,
        {
          res,
          highlightable: true,
          partCategory: 'compartment',
          partIndex: carIdx,
          labelEn: `Train Car #${carIdx + 1}`,
          labelHi: `डिब्बा #${carIdx + 1}`,
        }
      );
      group.add(carGroup);

      // 4 wheels per compartment
      [
        [-0.45, 0.56],
        [-0.45, -0.56],
        [0.45, 0.56],
        [0.45, -0.56],
      ].forEach(([wx, wz], wIdx) => {
        const wg = new THREE.Group();
        wg.add(new THREE.Mesh(wheelGeo, blueMat));
        wg.add(new THREE.Mesh(hubGeo, brassMat));
        wg.position.set(car.x + wx, 0.28, wz);
        const totalWheelIdx = 6 + carIdx * 4 + wIdx;
        tagPart(
          wg,
          new THREE.Vector3(-0.35 * (carIdx + 1), -0.05, Math.sign(wz) * 0.45),
          'toy_train',
          `Car Wheel ${totalWheelIdx + 1}`,
          {
            res,
            highlightable: true,
            partCategory: 'wheel',
            partIndex: totalWheelIdx,
            labelEn: `Car Wheel #${totalWheelIdx + 1}`,
            labelHi: `पहिया #${totalWheelIdx + 1}`,
          }
        );
        group.add(wg);
      });
    });
  }

  return group;
}

/**
 * 5. Composite Robo-Buddy (10 parts: 2 grounded boots, torso, glowing math chest dial,
 *    neck collar, beveled head, 2 glowing eyes, antenna spire, 2 articulated arms)
 */
export function buildMathRobot(res: Shared3DResources): THREE.Group {
  const group = new THREE.Group();
  addContactShadow(group, res, 1.5);

  const purpleMat = trackMat(
    res,
    new THREE.MeshPhysicalMaterial({
      color: 0x9755f5,
      roughness: 0.28,
      metalness: 0.25,
      clearcoat: 0.6,
    })
  );
  const silverMat = trackMat(
    res,
    new THREE.MeshStandardMaterial({ color: 0xcbd5e1, roughness: 0.2, metalness: 0.88 })
  );
  const screenMat = trackMat(
    res,
    new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      roughness: 0.15,
      metalness: 0.3,
    })
  );
  const cyanGlowMat = trackMat(
    res,
    new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      emissive: 0x38bdf8,
      emissiveIntensity: 0.85,
      roughness: 0.2,
    })
  );
  const yellowMat = trackMat(
    res,
    new THREE.MeshStandardMaterial({ color: 0xffd83d, roughness: 0.32, metalness: 0.3 })
  );

  // Boots
  const bootGeo = trackGeo(res, new THREE.BoxGeometry(0.42, 0.36, 0.56));
  const legGeo = trackGeo(res, new THREE.CylinderGeometry(0.14, 0.14, 0.42, 14));
  [-0.36, 0.36].forEach((lx, i) => {
    const legGroup = new THREE.Group();
    const boot = new THREE.Mesh(bootGeo, silverMat);
    boot.position.y = 0.18;
    const leg = new THREE.Mesh(legGeo, silverMat);
    leg.position.y = 0.55;
    legGroup.add(boot, leg);
    legGroup.position.set(lx, 0, 0);
    tagPart(legGroup, new THREE.Vector3(lx * 0.6, -0.05, 0), 'math_robot', `Leg ${i + 1}`, {
      res,
      highlightable: true,
      partCategory: 'legs',
      partIndex: i,
      labelEn: `Leg #${i + 1}`,
      labelHi: `पैर #${i + 1}`,
    });
    group.add(legGroup);
  });

  // Torso
  const torsoGeo = trackGeo(res, new THREE.BoxGeometry(1.16, 1.05, 0.78));
  const torso = new THREE.Mesh(torsoGeo, purpleMat);
  torso.position.set(0, 1.24, 0);
  tagPart(torso, new THREE.Vector3(0, 0.25, 0), 'math_robot', 'Torso', {
    res,
    highlightable: true,
    partCategory: 'torso',
    partIndex: 0,
    labelEn: 'Body Torso',
    labelHi: 'शरीर',
  });
  group.add(torso);

  // Chest Dial Screen
  const chestGeo = trackGeo(res, new THREE.BoxGeometry(0.76, 0.52, 0.12));
  const chest = new THREE.Mesh(chestGeo, screenMat);
  chest.position.set(0, 1.28, 0.38);
  tagPart(chest, new THREE.Vector3(0, 0.25, 0.65), 'math_robot', 'Chest Display', {
    res,
    highlightable: true,
    partCategory: 'chest',
    partIndex: 0,
    labelEn: 'Math Screen',
    labelHi: 'गणित स्क्रीन',
  });
  group.add(chest);

  // Head
  const headGeo = trackGeo(res, new THREE.BoxGeometry(0.92, 0.74, 0.72));
  const head = new THREE.Mesh(headGeo, silverMat);
  head.position.set(0, 2.22, 0);
  tagPart(head, new THREE.Vector3(0, 0.85, 0), 'math_robot', 'Head', {
    res,
    highlightable: true,
    partCategory: 'head',
    partIndex: 0,
    labelEn: 'Robot Head',
    labelHi: 'सिर',
  });
  group.add(head);

  // Visor Eyes
  const eyeGeo = trackGeo(res, new THREE.SphereGeometry(0.13, 16, 16));
  [-0.22, 0.22].forEach((ex, i) => {
    const eye = new THREE.Mesh(eyeGeo, cyanGlowMat);
    eye.position.set(ex, 2.26, 0.35);
    tagPart(eye, new THREE.Vector3(ex * 0.5, 0.85, 0.6), 'math_robot', `Eye ${i + 1}`, {
      res,
      highlightable: true,
      partCategory: 'eyes',
      partIndex: i,
      labelEn: `Eye #${i + 1}`,
      labelHi: `आँख #${i + 1}`,
    });
    group.add(eye);
  });

  // Antenna Spire
  const antGroup = new THREE.Group();
  const rod = new THREE.Mesh(trackGeo(res, new THREE.CylinderGeometry(0.04, 0.05, 0.35, 10)), silverMat);
  rod.position.y = 0.17;
  const bulb = new THREE.Mesh(trackGeo(res, new THREE.SphereGeometry(0.11, 14, 14)), yellowMat);
  bulb.position.y = 0.38;
  antGroup.add(rod, bulb);
  antGroup.position.set(0, 2.58, 0);
  tagPart(antGroup, new THREE.Vector3(0, 1.35, 0), 'math_robot', 'Antenna', {
    res,
    highlightable: true,
    partCategory: 'antenna',
    partIndex: 0,
    labelEn: 'Antenna',
    labelHi: 'एंटीना',
  });
  group.add(antGroup);

  // Articulated Arms
  const armCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, 0, 0),
    new THREE.Vector3(0.24, -0.18, 0.08),
    new THREE.Vector3(0.32, -0.58, 0.2),
  ]);
  const armGeo = trackGeo(res, new THREE.TubeGeometry(armCurve, 16, 0.1, 12, false));
  const handGeo = trackGeo(res, new THREE.SphereGeometry(0.14, 14, 14));

  [-1, 1].forEach((side, idx) => {
    const armGroup = new THREE.Group();
    const armMesh = new THREE.Mesh(armGeo, purpleMat);
    if (side < 0) armMesh.scale.x = -1;
    const hand = new THREE.Mesh(handGeo, yellowMat);
    hand.position.set(side * 0.32, -0.58, 0.2);
    armGroup.add(armMesh, hand);
    armGroup.position.set(side * 0.6, 1.56, 0);
    tagPart(armGroup, new THREE.Vector3(side * 0.75, 0.35, 0.2), 'math_robot', `Arm ${idx + 1}`, {
      res,
      highlightable: true,
      partCategory: 'arms',
      partIndex: idx,
      labelEn: `Arm #${idx + 1}`,
      labelHi: `हाथ #${idx + 1}`,
    });
    group.add(armGroup);
  });

  return group;
}

/**
 * 6. Composite Golden Star Trophy (7 parts: stepped marble pedestal, fluted column,
 *    cup bowl, twin curved handles, extruded beveled 5-point star topper)
 */
export function buildStarTrophy(res: Shared3DResources): THREE.Group {
  const group = new THREE.Group();
  addContactShadow(group, res, 1.55);

  const marbleMat = trackMat(
    res,
    new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.78, metalness: 0.08 })
  );
  const goldMat = trackMat(
    res,
    new THREE.MeshPhysicalMaterial({
      color: 0xffd83d,
      roughness: 0.18,
      metalness: 0.92,
      clearcoat: 0.8,
    })
  );
  const accentMat = trackMat(
    res,
    new THREE.MeshStandardMaterial({ color: 0x287bff, roughness: 0.35, metalness: 0.2 })
  );

  // Pedestal base
  const baseGeo = trackGeo(res, new THREE.CylinderGeometry(0.75, 0.88, 0.32, 24));
  const base = new THREE.Mesh(baseGeo, marbleMat);
  base.position.set(0, 0.16, 0);
  tagPart(base, new THREE.Vector3(0, -0.05, 0), 'star_trophy', 'Pedestal', {
    res,
    highlightable: true,
    partCategory: 'pedestal',
    labelEn: 'Trophy Pedestal',
    labelHi: 'ट्रॉफी आधार',
  });
  group.add(base);

  const plaqueGeo = trackGeo(res, new THREE.BoxGeometry(0.68, 0.22, 0.14));
  const plaque = new THREE.Mesh(plaqueGeo, accentMat);
  plaque.position.set(0, 0.2, 0.76);
  tagPart(plaque, new THREE.Vector3(0, 0, 0.65), 'star_trophy', 'Nameplate', {
    res,
    highlightable: true,
    partCategory: 'plaque',
    labelEn: 'Champion Plaque',
    labelHi: 'चैंपियन पट्टिका',
  });
  group.add(plaque);

  // Lathe column + cup
  const cupPts = [
    new THREE.Vector2(0.45, 0.32),
    new THREE.Vector2(0.2, 0.58),
    new THREE.Vector2(0.18, 1.05),
    new THREE.Vector2(0.62, 1.38),
    new THREE.Vector2(0.72, 2.02),
    new THREE.Vector2(0.58, 2.02),
    new THREE.Vector2(0.32, 1.38),
    new THREE.Vector2(0, 1.38),
  ];
  const cupGeo = trackGeo(res, new THREE.LatheGeometry(cupPts, 28));
  const cup = new THREE.Mesh(cupGeo, goldMat);
  tagPart(cup, new THREE.Vector3(0, 0.35, 0), 'star_trophy', 'Trophy Cup', {
    res,
    highlightable: true,
    partCategory: 'cup',
    labelEn: 'Golden Cup',
    labelHi: 'सुनहरा कप',
  });
  group.add(cup);

  // Twin curved handles
  const handleCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0.58, 1.9, 0),
    new THREE.Vector3(0.98, 1.88, 0),
    new THREE.Vector3(0.92, 1.48, 0),
    new THREE.Vector3(0.42, 1.34, 0),
  ]);
  const handleGeo = trackGeo(res, new THREE.TubeGeometry(handleCurve, 20, 0.065, 10, false));
  [-1, 1].forEach((side, i) => {
    const h = new THREE.Mesh(handleGeo, goldMat);
    if (side < 0) h.scale.x = -1;
    tagPart(h, new THREE.Vector3(side * 0.75, 0.45, 0), 'star_trophy', `Handle ${i + 1}`, {
      res,
      highlightable: true,
      partCategory: 'handle',
      partIndex: i,
      labelEn: `Handle #${i + 1}`,
      labelHi: `हैंडल #${i + 1}`,
    });
    group.add(h);
  });

  // Extruded Beveled 5-Point Star Topper
  const starShape = createStarShape(0.46, 0.21, 5);
  const starGeo = trackGeo(
    res,
    new THREE.ExtrudeGeometry(starShape, {
      depth: 0.14,
      bevelEnabled: true,
      bevelThickness: 0.04,
      bevelSize: 0.03,
      bevelSegments: 3,
    })
  );
  starGeo.center();
  const starMesh = new THREE.Mesh(starGeo, goldMat);
  starMesh.position.set(0, 2.48, 0);
  tagPart(starMesh, new THREE.Vector3(0, 1.15, 0), 'star_trophy', 'Golden Star', {
    res,
    highlightable: true,
    partCategory: 'star',
    labelEn: 'Golden Star',
    labelHi: 'सुनहरा तारा',
  });
  group.add(starMesh);

  return group;
}

/**
 * 7. Unlockable 3D Counting Abacus (10 parts: base plinth, 2 uprights, top arch,
 *    3 steel rods, 3 bead rows)
 */
export function buildAbacusToy(res: Shared3DResources): THREE.Group {
  const group = new THREE.Group();
  addContactShadow(group, res, 1.6);

  const woodMat = trackMat(
    res,
    new THREE.MeshStandardMaterial({
      color: 0xd97706,
      roughness: 0.65,
      metalness: 0.05,
      bumpMap: res.bumpTexture,
      bumpScale: 0.015,
    })
  );
  const steelMat = trackMat(
    res,
    new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.2, metalness: 0.9 })
  );
  const beadColors = [0xff55ae, 0x35d66f, 0x287bff, 0xffd83d, 0x9755f5];

  const base = new THREE.Mesh(trackGeo(res, new THREE.BoxGeometry(2.3, 0.24, 0.85)), woodMat);
  base.position.set(0, 0.12, 0);
  tagPart(base, new THREE.Vector3(0, -0.05, 0), 'abacus_toy', 'Wood Base');
  group.add(base);

  const postGeo = trackGeo(res, new THREE.CylinderGeometry(0.11, 0.13, 1.95, 16));
  [-0.95, 0.95].forEach((px, i) => {
    const post = new THREE.Mesh(postGeo, woodMat);
    post.position.set(px, 1.12, 0);
    tagPart(post, new THREE.Vector3(Math.sign(px) * 0.55, 0.2, 0), 'abacus_toy', `Frame Post ${i + 1}`);
    group.add(post);
  });

  const topBar = new THREE.Mesh(trackGeo(res, new THREE.BoxGeometry(2.2, 0.22, 0.42)), woodMat);
  topBar.position.set(0, 2.08, 0);
  tagPart(topBar, new THREE.Vector3(0, 0.85, 0), 'abacus_toy', 'Top Beam');
  group.add(topBar);

  const rodGeo = trackGeo(res, new THREE.CylinderGeometry(0.035, 0.035, 1.88, 12));
  rodGeo.rotateZ(Math.PI / 2);
  const beadGeo = trackGeo(res, new THREE.SphereGeometry(0.16, 16, 14));
  beadGeo.scale(0.85, 1, 1);

  [0.65, 1.15, 1.65].forEach((ry, rowIdx) => {
    const rowGroup = new THREE.Group();
    rowGroup.add(new THREE.Mesh(rodGeo, steelMat));
    const beadCount = 4 + (rowIdx % 2);
    for (let b = 0; b < beadCount; b++) {
      const mat = trackMat(
        res,
        new THREE.MeshPhysicalMaterial({
          color: beadColors[(b + rowIdx) % beadColors.length],
          roughness: 0.25,
          clearcoat: 0.8,
        })
      );
      const bead = new THREE.Mesh(beadGeo, mat);
      bead.position.set(-0.62 + b * 0.32, 0, 0);
      rowGroup.add(bead);
    }
    rowGroup.position.set(0, ry, 0);
    tagPart(rowGroup, new THREE.Vector3(0, (rowIdx - 1) * 0.35, 0.45), 'abacus_toy', `Bead Row ${rowIdx + 1}`, {
      res,
      highlightable: true,
      partCategory: 'bead_row',
      partIndex: rowIdx,
      labelEn: `Bead Row #${rowIdx + 1} (${beadCount} beads)`,
      labelHi: `मोती पंक्ति #${rowIdx + 1} (${beadCount} मोती)`,
    });
    group.add(rowGroup);
  });

  return group;
}

/**
 * 8. Unlockable Number Castle (10 parts: courtyard plinth, keep, keep roof,
 *    2 side towers + 2 roofs, gatehouse, doorway, pennant flag)
 */
export function buildNumberCastle(res: Shared3DResources): THREE.Group {
  const group = new THREE.Group();
  addContactShadow(group, res, 1.9);

  const stoneMat = trackMat(
    res,
    new THREE.MeshStandardMaterial({
      color: 0xf1f5f9,
      roughness: 0.78,
      metalness: 0.04,
      bumpMap: res.bumpTexture,
      bumpScale: 0.02,
    })
  );
  const roofMat = trackMat(
    res,
    new THREE.MeshStandardMaterial({ color: 0x287bff, roughness: 0.35, metalness: 0.15 })
  );
  const goldMat = trackMat(
    res,
    new THREE.MeshStandardMaterial({ color: 0xffd83d, roughness: 0.25, metalness: 0.75 })
  );
  const doorMat = trackMat(
    res,
    new THREE.MeshStandardMaterial({ color: 0x8b5a2b, roughness: 0.82 })
  );

  const plinth = new THREE.Mesh(trackGeo(res, new THREE.CylinderGeometry(1.45, 1.55, 0.24, 24)), stoneMat);
  plinth.position.set(0, 0.12, 0);
  tagPart(plinth, new THREE.Vector3(0, -0.05, 0), 'number_castle', 'Courtyard');
  group.add(plinth);

  const keep = new THREE.Mesh(trackGeo(res, new THREE.BoxGeometry(1.15, 1.55, 1.05)), stoneMat);
  keep.position.set(0, 1.0, -0.1);
  tagPart(keep, new THREE.Vector3(0, 0.45, -0.2), 'number_castle', 'Central Keep', {
    res,
    highlightable: true,
    partCategory: 'tower',
    labelEn: 'Main Keep',
    labelHi: 'मुख्य मीनार',
  });
  group.add(keep);

  const keepRoof = new THREE.Mesh(trackGeo(res, new THREE.ConeGeometry(0.86, 0.82, 4)), roofMat);
  keepRoof.rotation.y = Math.PI / 4;
  keepRoof.position.set(0, 2.18, -0.1);
  tagPart(keepRoof, new THREE.Vector3(0, 1.05, -0.2), 'number_castle', 'Keep Roof');
  group.add(keepRoof);

  const towerGeo = trackGeo(res, new THREE.CylinderGeometry(0.34, 0.38, 1.38, 18));
  const coneGeo = trackGeo(res, new THREE.ConeGeometry(0.42, 0.62, 18));
  [-0.86, 0.86].forEach((tx, idx) => {
    const tower = new THREE.Mesh(towerGeo, stoneMat);
    tower.position.set(tx, 0.92, 0.22);
    tagPart(tower, new THREE.Vector3(Math.sign(tx) * 0.6, 0.25, 0.2), 'number_castle', `Tower ${idx + 1}`, {
      res,
      highlightable: true,
      partCategory: 'tower',
      partIndex: idx,
      labelEn: `Castle Tower #${idx + 1}`,
      labelHi: `किला मीनार #${idx + 1}`,
    });
    group.add(tower);

    const tRoof = new THREE.Mesh(coneGeo, roofMat);
    tRoof.position.set(tx, 1.9, 0.22);
    tagPart(tRoof, new THREE.Vector3(Math.sign(tx) * 0.6, 0.9, 0.2), 'number_castle', `Tower Roof ${idx + 1}`);
    group.add(tRoof);
  });

  const door = new THREE.Mesh(trackGeo(res, new THREE.BoxGeometry(0.46, 0.68, 0.14)), doorMat);
  door.position.set(0, 0.56, 0.46);
  tagPart(door, new THREE.Vector3(0, 0.1, 0.65), 'number_castle', 'Castle Gate');
  group.add(door);

  const flagGroup = new THREE.Group();
  const pole = new THREE.Mesh(trackGeo(res, new THREE.CylinderGeometry(0.03, 0.03, 0.46, 8)), goldMat);
  pole.position.y = 0.23;
  const flag = new THREE.Mesh(trackGeo(res, new THREE.BoxGeometry(0.34, 0.2, 0.03)), goldMat);
  flag.position.set(0.17, 0.36, 0);
  flagGroup.add(pole, flag);
  flagGroup.position.set(0, 2.58, -0.1);
  tagPart(flagGroup, new THREE.Vector3(0, 1.45, -0.2), 'number_castle', 'Royal Flag');
  group.add(flagGroup);

  return group;
}

function createStarShape(outerR: number, innerR: number, points = 5): THREE.Shape {
  const shape = new THREE.Shape();
  for (let i = 0; i < points * 2; i++) {
    const r = i % 2 === 0 ? outerR : innerR;
    const angle = (i * Math.PI) / points + Math.PI / 2;
    const x = Math.cos(angle) * r;
    const y = Math.sin(angle) * r;
    if (i === 0) shape.moveTo(x, y);
    else shape.lineTo(x, y);
  }
  shape.closePath();
  return shape;
}

/**
 * Miniature composite 3D collectible for the 3D Count Challenge
 */
export function buildCountable3DItem(
  kind: 'apple' | 'star' | 'car',
  res: Shared3DResources
): THREE.Group {
  if (kind === 'car') {
    const g = buildRaceCar(res);
    g.scale.setScalar(0.55);
    return g;
  }
  const g = new THREE.Group();
  addContactShadow(g, res, 0.65);

  if (kind === 'apple') {
    const body = new THREE.Mesh(
      trackGeo(res, new THREE.SphereGeometry(0.42, 20, 16)),
      trackMat(
        res,
        new THREE.MeshPhysicalMaterial({ color: 0xff3b4e, roughness: 0.2, clearcoat: 0.9 })
      )
    );
    body.position.y = 0.42;
    const stem = new THREE.Mesh(
      trackGeo(res, new THREE.CylinderGeometry(0.04, 0.05, 0.22, 10)),
      trackMat(res, new THREE.MeshStandardMaterial({ color: 0x6b4423, roughness: 0.9 }))
    );
    stem.position.y = 0.88;
    const leaf = new THREE.Mesh(
      trackGeo(res, new THREE.BoxGeometry(0.24, 0.06, 0.14)),
      trackMat(res, new THREE.MeshStandardMaterial({ color: 0x35d66f, roughness: 0.65 }))
    );
    leaf.position.set(0.14, 0.92, 0);
    leaf.rotation.z = 0.35;
    g.add(body, stem, leaf);
  } else {
    const starShape = createStarShape(0.48, 0.22, 5);
    const starGeo = trackGeo(
      res,
      new THREE.ExtrudeGeometry(starShape, {
        depth: 0.16,
        bevelEnabled: true,
        bevelThickness: 0.04,
        bevelSize: 0.03,
        bevelSegments: 2,
      })
    );
    starGeo.center();
    const starMat = trackMat(
      res,
      new THREE.MeshPhysicalMaterial({ color: 0xffd83d, roughness: 0.2, metalness: 0.85 })
    );
    const star = new THREE.Mesh(starGeo, starMat);
    star.position.y = 0.56;
    const ped = new THREE.Mesh(
      trackGeo(res, new THREE.CylinderGeometry(0.28, 0.36, 0.12, 16)),
      trackMat(res, new THREE.MeshStandardMaterial({ color: 0x287bff, roughness: 0.45 }))
    );
    ped.position.y = 0.06;
    g.add(star, ped);
  }

  g.traverse((c) => {
    if ((c as THREE.Mesh).isMesh && !c.userData.isShadow) {
      const m = c as THREE.Mesh;
      m.castShadow = true;
      m.receiveShadow = true;
      const mat = m.material as THREE.MeshStandardMaterial | undefined;
      if (mat && 'emissive' in mat) {
        m.userData.baseEmissive = mat.emissive.getHex();
        m.userData.baseEmissiveIntensity = mat.emissiveIntensity ?? 0;
      }
    }
  });
  return g;
}

/**
 * Translucent glowing slot cube/ring for 3D Missing Numbers (e.g. 2 + ? = 5)
 */
export function buildGhostSlotItem(res: Shared3DResources): THREE.Group {
  const g = new THREE.Group();
  addContactShadow(g, res, 0.55);
  const ring = new THREE.Mesh(
    trackGeo(res, new THREE.TorusGeometry(0.36, 0.06, 12, 24)),
    trackMat(
      res,
      new THREE.MeshStandardMaterial({
        color: 0x9755f5,
        emissive: 0x9755f5,
        emissiveIntensity: 0.5,
        roughness: 0.3,
        transparent: true,
        opacity: 0.85,
      })
    )
  );
  ring.rotation.x = Math.PI / 2;
  ring.position.y = 0.45;
  const orb = new THREE.Mesh(
    trackGeo(res, new THREE.OctahedronGeometry(0.22, 0)),
    trackMat(
      res,
      new THREE.MeshStandardMaterial({
        color: 0xffd83d,
        emissive: 0xffd83d,
        emissiveIntensity: 0.45,
        transparent: true,
        opacity: 0.72,
      })
    )
  );
  orb.position.y = 0.52;
  g.add(ring, orb);
  g.userData.isGhostSlot = true;
  return g;
}

/**
 * Miniature 3D celebration star used in the burst particle effect
 */
export function buildCelebrationStarMesh(res: Shared3DResources, colorHex: number): THREE.Mesh {
  const shape = createStarShape(0.24, 0.11, 5);
  const geo = trackGeo(
    res,
    new THREE.ExtrudeGeometry(shape, {
      depth: 0.06,
      bevelEnabled: true,
      bevelThickness: 0.02,
      bevelSize: 0.015,
      bevelSegments: 2,
    })
  );
  geo.center();
  const mat = trackMat(
    res,
    new THREE.MeshStandardMaterial({
      color: colorHex,
      emissive: colorHex,
      emissiveIntensity: 0.55,
      roughness: 0.25,
      metalness: 0.6,
    })
  );
  return new THREE.Mesh(geo, mat);
}

/**
 * InstancedMesh outdoor meadow wildflowers (> 30 items) for natural perimeter grounding
 */
export function buildMeadowFlowersInstanced(res: Shared3DResources): THREE.InstancedMesh {
  const count = 44;
  const flowerGeo = trackGeo(res, new THREE.CylinderGeometry(0.22, 0.08, 0.28, 7));
  flowerGeo.translate(0, 0.14, 0);
  const flowerMat = trackMat(
    res,
    new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.72, metalness: 0.0 })
  );

  const inst = new THREE.InstancedMesh(flowerGeo, flowerMat, count);
  const dummy = new THREE.Object3D();
  const color = new THREE.Color();
  const palette = [0xffd83d, 0xff55ae, 0xffffff, 0x9755f5, 0xff963c];

  for (let i = 0; i < count; i++) {
    const angle = (i / count) * Math.PI * 2 + (i % 3) * 0.12;
    const radius = 8.2 + (i % 5) * 1.45;
    dummy.position.set(Math.cos(angle) * radius, 0, Math.sin(angle) * radius);
    const scale = 0.85 + ((i * 7) % 30) / 100;
    dummy.scale.setScalar(scale);
    dummy.rotation.y = angle;
    dummy.updateMatrix();
    inst.setMatrixAt(i, dummy.matrix);
    color.setHex(palette[i % palette.length]);
    inst.setColorAt(i, color);
  }

  inst.instanceMatrix.needsUpdate = true;
  if (inst.instanceColor) inst.instanceColor.needsUpdate = true;
  inst.computeBoundingSphere();
  return inst;
}
