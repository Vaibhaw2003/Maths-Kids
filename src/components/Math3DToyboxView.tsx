import React, { useCallback, useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import {
  ArrowLeft,
  Award,
  Box,
  ChevronDown,
  ChevronUp,
  Layers,
  Lock,
  RotateCcw,
  Sparkles,
  Star,
  Unlock,
  Volume2,
  VolumeX,
  ZoomIn,
  ZoomOut,
} from 'lucide-react';
import { ACHIEVEMENT_CATALOG, ChildProfile, LanguageCode } from '../types/game';
import { audioService } from '../services/audioService';
import {
  createBrushedGrainTexture,
  createContactShadowTexture,
  createMeadowGroundTexture,
} from '../three/proceduralTextures';
import {
  MODEL_3D_CATALOG,
  Model3DId,
  Shared3DResources,
  buildAbacusToy,
  buildAppleTree,
  buildCelebrationStarMesh,
  buildCountable3DItem,
  buildGhostSlotItem,
  buildMathRobot,
  buildMeadowFlowersInstanced,
  buildNumberCastle,
  buildRaceCar,
  buildRocket,
  buildStarTrophy,
  buildToyTrain,
  setObjectHighlighted,
} from '../three/modelBuilders';
import {
  Challenge3DFilter,
  Math3DChallenge,
  RobotMicroQuiz,
  TrainActivityKind,
  TrainMicroQuiz,
  formatChallengeVoice,
  generateMath3DChallenge,
  generateRobotQuiz,
  generateTrainQuiz,
} from '../three/toyboxChallenges';

export interface Math3DToyboxViewProps {
  profile: ChildProfile;
  lang: LanguageCode;
  soundEnabled?: boolean;
  onToggleSound?: () => void;
  onBack: () => void;
  onEarnStars: (stars: number) => void;
  onUnlock3DModel?: (modelId: string) => void;
}

type ToyboxMode = 'explore' | 'count3d';
type CameraPreset = 'hero' | 'close' | 'top';

// Pre-allocated scratch math helpers (zero GC inside animation loop)
const _scratchVec = new THREE.Vector3();
const _targetCamPos = new THREE.Vector3(5.6, 3.8, 7.2);
const _targetLookAt = new THREE.Vector3(0, 1.0, 0);

interface CelebrationParticle {
  mesh: THREE.Mesh;
  vel: THREE.Vector3;
  age: number;
  life: number;
  rotSpeed: number;
}

function disposeResourcePool(pool: Shared3DResources) {
  pool.geometries.forEach((g) => g.dispose());
  pool.materials.forEach((m) => m.dispose());
  pool.geometries.length = 0;
  pool.materials.length = 0;
}

function detectSoftwareWebGL(): boolean {
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl2');
    if (!gl) return true;
    const ext = gl.getExtension('WEBGL_debug_renderer_info');
    const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
    const gpu = String(gl.getParameter(param) || '');
    gl.getExtension('WEBGL_lose_context')?.loseContext();
    return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
  } catch {
    return true;
  }
}

export const Math3DToyboxView: React.FC<Math3DToyboxViewProps> = ({
  profile,
  lang,
  soundEnabled = true,
  onToggleSound,
  onBack,
  onEarnStars,
  onUnlock3DModel,
}) => {
  const mountRef = useRef<HTMLDivElement | null>(null);

  const [mode, setMode] = useState<ToyboxMode>('explore');
  const [selectedModel, setSelectedModel] = useState<Model3DId>('parade');
  const [explodeFactor, setExplodeFactor] = useState<number>(0);
  const [cameraPreset, setCameraPreset] = useState<CameraPreset>('hero');
  const [dockCollapsed, setDockCollapsed] = useState<boolean>(false);
  const [webglError, setWebglError] = useState<boolean>(false);
  const [tappedStatus, setTappedStatus] = useState<string>('');
  const [celebratingBanner, setCelebratingBanner] = useState<boolean>(false);

  // Interactive Apple Tree state
  const [treeSessionId, setTreeSessionId] = useState<string>(() => `tree_${Date.now()}`);
  const [treeAppleTotal, setTreeAppleTotal] = useState<number>(5);
  const [tappedAppleIndices, setTappedAppleIndices] = useState<number[]>([]);

  // Interactive Choo-Choo Train state
  const [trainQuiz, setTrainQuiz] = useState<TrainMicroQuiz>(() => generateTrainQuiz('wheels'));
  const [tappedWheelIndices, setTappedWheelIndices] = useState<number[]>([]);
  const [tappedCompartmentIndices, setTappedCompartmentIndices] = useState<number[]>([]);
  const [trainSolvedId, setTrainSolvedId] = useState<string | null>(null);

  // Interactive Robo-Buddy state
  const [robotQuiz, setRobotQuiz] = useState<RobotMicroQuiz>(() => generateRobotQuiz('eyes'));
  const [robotSolvedId, setRobotSolvedId] = useState<string | null>(null);
  const [lastRobotPartLabel, setLastRobotPartLabel] = useState<string>('');

  // 3D Math Challenges state
  const [challengeFilter, setChallengeFilter] = useState<Challenge3DFilter>('all');
  const [challenge, setChallenge] = useState<Math3DChallenge>(() =>
    generateMath3DChallenge(profile.difficulty, 'all')
  );
  const [countedStageIndices, setCountedStageIndices] = useState<number[]>([]);

  // Prevent duplicate rewards for any completed question / activity ID
  const rewardedIdsRef = useRef<Set<string>>(new Set());

  // Mutable refs for 60fps loop without tearing down WebGL canvas
  const profileRef = useRef<ChildProfile>(profile);
  const langRef = useRef<LanguageCode>(lang);
  const modeRef = useRef<ToyboxMode>(mode);
  const selectedModelRef = useRef<Model3DId>(selectedModel);
  const challengeRef = useRef<Math3DChallenge>(challenge);
  const treeAppleTotalRef = useRef<number>(treeAppleTotal);
  const explodeTargetRef = useRef<number>(explodeFactor);
  const explodeCurrentRef = useRef<number>(0);
  const cameraAnimatingRef = useRef<boolean>(false);
  const bounceMapRef = useRef<Map<THREE.Object3D, number>>(new Map());
  const highlightedPartRef = useRef<THREE.Object3D | null>(null);
  const highlightedPartsSetRef = useRef<Set<THREE.Object3D>>(new Set());
  const onPartTapCallbackRef = useRef<(part: THREE.Object3D | null, root: THREE.Object3D) => void>(
    () => {}
  );

  useEffect(() => {
    profileRef.current = profile;
  }, [profile]);

  const sceneControllersRef = useRef<{
    rebuildStage: () => void;
    applyPreset: (p: CameraPreset) => void;
    resetCamera: () => void;
    zoomCamera: (factor: number) => void;
    triggerCelebration: () => void;
  } | null>(null);

  const awardStarOnce = useCallback(
    (questionId: string) => {
      if (rewardedIdsRef.current.has(questionId)) {
        return false;
      }
      rewardedIdsRef.current.add(questionId);
      onEarnStars(1);
      setCelebratingBanner(true);
      audioService.playCelebration();
      sceneControllersRef.current?.triggerCelebration();
      window.setTimeout(() => setCelebratingBanner(false), 1400);
      return true;
    },
    [onEarnStars]
  );

  useEffect(() => {
    langRef.current = lang;
  }, [lang]);

  useEffect(() => {
    modeRef.current = mode;
    setCountedStageIndices([]);
    sceneControllersRef.current?.rebuildStage();
  }, [mode]);

  useEffect(() => {
    selectedModelRef.current = selectedModel;
    setTappedAppleIndices([]);
    setTappedWheelIndices([]);
    setTappedCompartmentIndices([]);
    setLastRobotPartLabel('');
    sceneControllersRef.current?.rebuildStage();
  }, [selectedModel]);

  useEffect(() => {
    treeAppleTotalRef.current = treeAppleTotal;
    if (modeRef.current === 'explore' && selectedModelRef.current === 'apple_tree') {
      sceneControllersRef.current?.rebuildStage();
    }
  }, [treeAppleTotal, treeSessionId]);

  useEffect(() => {
    explodeTargetRef.current = explodeFactor;
  }, [explodeFactor]);

  useEffect(() => {
    challengeRef.current = challenge;
    setCountedStageIndices([]);
    if (modeRef.current === 'count3d') {
      sceneControllersRef.current?.rebuildStage();
    }
  }, [challenge.id]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'h' || e.key === 'H') {
        setDockCollapsed((prev) => !prev);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  // Keep raycast tap handler fresh via ref
  useEffect(() => {
    onPartTapCallbackRef.current = (part, root) => {
      const currentLang = langRef.current;

      // Clear temporary single highlight if switching away
      if (highlightedPartRef.current && highlightedPartRef.current !== part) {
        if (!highlightedPartsSetRef.current.has(highlightedPartRef.current)) {
          setObjectHighlighted(highlightedPartRef.current, false);
        }
      }

      if (modeRef.current === 'count3d') {
        // Check if tapping an apple directly on the 3D Addition Tree OR a stage item
        const stageIdx = root.userData.stageItemIndex as number | undefined;
        const partCat = part?.userData.partCategory as string | undefined;
        const partIdx = part?.userData.partIndex as number | undefined;

        if (typeof stageIdx === 'number') {
          if (part) {
            setObjectHighlighted(root, true, 0xffd83d);
            highlightedPartsSetRef.current.add(root);
          }
          setCountedStageIndices((prev) => {
            if (prev.includes(stageIdx)) {
              audioService.playClick();
              return prev;
            }
            const next = [...prev, stageIdx];
            audioService.playCorrect();
            setTappedStatus(
              currentLang === 'hi' ? `गिनती: ${next.length}` : `Counted: ${next.length}`
            );
            audioService.speak(String(next.length), currentLang);
            return next;
          });
          return;
        }

        if (partCat === 'apple' && typeof partIdx === 'number' && part) {
          setObjectHighlighted(part, true, 0xffd83d);
          highlightedPartsSetRef.current.add(part);
          setCountedStageIndices((prev) => {
            if (prev.includes(partIdx)) {
              audioService.playClick();
              return prev;
            }
            const next = [...prev, partIdx];
            audioService.playCorrect();
            setTappedStatus(
              currentLang === 'hi' ? `सेब गिनें: ${next.length}` : `Apples counted: ${next.length}`
            );
            audioService.speak(String(next.length), currentLang);
            return next;
          });
          return;
        }
      }

      // Explore Mode interactions
      const cat = root.userData.catalogItem as
        | { id: Exclude<Model3DId, 'parade'>; nameEn: string; nameHi: string; partsCount: number }
        | undefined;

      // If in Parade view and child taps a model, highlight it and open its interactive view!
      if (selectedModelRef.current === 'parade' && cat) {
        audioService.playCorrect();
        const label = currentLang === 'hi' ? cat.nameHi : cat.nameEn;
        setTappedStatus(
          currentLang === 'hi' ? `${label} खोला गया!` : `Opened ${label}!`
        );
        audioService.speak(label, currentLang);
        setSelectedModel(cat.id);
        return;
      }

      const partCat = part?.userData.partCategory as string | undefined;
      const partIdx = part?.userData.partIndex as number | undefined;

      // 1. Apple Tree individual apple tapping & counting
      if (selectedModelRef.current === 'apple_tree' && partCat === 'apple' && typeof partIdx === 'number' && part) {
        setObjectHighlighted(part, true, 0xffd83d);
        highlightedPartsSetRef.current.add(part);
        bounceMapRef.current.set(part, 1.0);

        setTappedAppleIndices((prev) => {
          if (prev.includes(partIdx)) {
            audioService.playClick();
            const pos = prev.indexOf(partIdx) + 1;
            audioService.speak(String(pos), currentLang);
            return prev;
          }
          const next = [...prev, partIdx];
          const total = treeAppleTotalRef.current;
          if (next.length >= total) {
            setTappedStatus(
              currentLang === 'hi'
                ? `शाबाश! पूरे ${total} सेब गिने! +1 सितारा`
                : `All ${total} apples counted! +1 Star!`
            );
            audioService.speak(
              currentLang === 'hi' ? `${total} सेब! शाबाश!` : `${total} apples! Great counting!`,
              currentLang
            );
            awardStarOnce(treeSessionId);
          } else {
            audioService.playCorrect();
            setTappedStatus(
              currentLang === 'hi'
                ? `सेब गिने: ${next.length} / ${total}`
                : `Apples counted: ${next.length} / ${total}`
            );
            audioService.speak(String(next.length), currentLang);
          }
          return next;
        });
        return;
      }

      // 2. Choo-Choo Train wheels & compartments tapping
      if (selectedModelRef.current === 'toy_train' && part) {
        if (partCat === 'wheel' && typeof partIdx === 'number') {
          setObjectHighlighted(part, true, 0xffd83d);
          highlightedPartsSetRef.current.add(part);
          bounceMapRef.current.set(part, 1.0);
          setTappedWheelIndices((prev) => {
            const next = prev.includes(partIdx) ? prev : [...prev, partIdx];
            audioService.playCorrect();
            setTappedStatus(
              currentLang === 'hi'
                ? `पहिए गिने: ${next.length}`
                : `Wheels counted: ${next.length}`
            );
            audioService.speak(String(next.length), currentLang);
            return next;
          });
          return;
        }
        if (partCat === 'compartment' && typeof partIdx === 'number') {
          setObjectHighlighted(part, true, 0x35d66f);
          highlightedPartsSetRef.current.add(part);
          bounceMapRef.current.set(part, 1.0);
          setTappedCompartmentIndices((prev) => {
            const next = prev.includes(partIdx) ? prev : [...prev, partIdx];
            audioService.playCorrect();
            setTappedStatus(
              currentLang === 'hi'
                ? `ट्रेन डिब्बा #${partIdx + 1} (${next.length} डिब्बे)`
                : `Train Car #${partIdx + 1} (${next.length} tapped)`
            );
            audioService.speak(
              currentLang === 'hi' ? `डिब्बा ${next.length}` : `Car ${next.length}`,
              currentLang
            );
            return next;
          });
          return;
        }
      }

      // 3. Robo-Buddy body part identification & counting
      if (selectedModelRef.current === 'math_robot' && part) {
        setObjectHighlighted(part, true, 0x38bdf8);
        highlightedPartRef.current = part;
        bounceMapRef.current.set(part, 1.0);
        const pLabel =
          currentLang === 'hi'
            ? (part.userData.labelHi as string) || (part.userData.partName as string)
            : (part.userData.labelEn as string) || (part.userData.partName as string);
        const infoMap: Record<string, { en: string; hi: string }> = {
          eyes: { en: `${pLabel} — Robo-Buddy has 2 eyes!`, hi: `${pLabel} — रोबो की 2 आँखें हैं!` },
          arms: { en: `${pLabel} — Robo-Buddy has 2 arms!`, hi: `${pLabel} — रोबो के 2 हाथ हैं!` },
          legs: { en: `${pLabel} — Robo-Buddy has 2 legs!`, hi: `${pLabel} — रोबो के 2 पैर हैं!` },
          head: { en: `${pLabel} — 1 smart robot head!`, hi: `${pLabel} — 1 स्मार्ट सिर!` },
          antenna: { en: `${pLabel} — 1 signal antenna!`, hi: `${pLabel} — 1 एंटीना!` },
          torso: { en: `${pLabel} — 1 strong purple body!`, hi: `${pLabel} — मजबूत शरीर!` },
          chest: { en: `${pLabel} — Math display screen!`, hi: `${pLabel} — गणित स्क्रीन!` },
        };
        const msg =
          partCat && infoMap[partCat]
            ? currentLang === 'hi'
              ? infoMap[partCat].hi
              : infoMap[partCat].en
            : pLabel;
        audioService.playCorrect();
        setLastRobotPartLabel(msg);
        setTappedStatus(msg);
        audioService.speak(msg, currentLang);
        return;
      }

      // 4. Golden Star Trophy or general part highlight + bounce
      if (part) {
        setObjectHighlighted(part, true, 0xffd83d);
        highlightedPartRef.current = part;
      }
      bounceMapRef.current.set(root, 1.0);
      audioService.playCorrect();

      if (selectedModelRef.current === 'star_trophy') {
        const msg =
          currentLang === 'hi'
            ? `सुनहरी ट्रॉफी! आपके पास ${profile.stars} सितारे हैं!`
            : `Golden Trophy! You have ${profile.stars} stars!`;
        setTappedStatus(msg);
        audioService.speak(msg, currentLang);
      } else if (cat) {
        const label = currentLang === 'hi' ? cat.nameHi : cat.nameEn;
        setTappedStatus(`${label} (${cat.partsCount} 3D parts)`);
        audioService.speak(label, currentLang);
      }
    };
  }, [awardStarOnce, profile.stars, treeSessionId]);

  const handlePresetClick = useCallback((preset: CameraPreset) => {
    audioService.playClick();
    setCameraPreset(preset);
    sceneControllersRef.current?.applyPreset(preset);
  }, []);

  const handleResetCamera = useCallback(() => {
    audioService.playClick();
    setCameraPreset('hero');
    sceneControllersRef.current?.resetCamera();
  }, []);

  const handleZoom = useCallback((direction: 'in' | 'out') => {
    audioService.playClick();
    sceneControllersRef.current?.zoomCamera(direction === 'in' ? 0.78 : 1.25);
  }, []);

  // Initialize Three.js WebGL stage strictly once
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return undefined;

    const isSoftwareGl = detectSoftwareWebGL();
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: !isSoftwareGl,
        powerPreference: 'high-performance',
      });
    } catch {
      setWebglError(true);
      return undefined;
    }

    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;
    renderer.setSize(width, height);
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.08;
    renderer.shadowMap.enabled = !isSoftwareGl;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderer.domElement);

    const onContextLost = (e: Event) => {
      e.preventDefault();
      setWebglError(true);
    };
    const onContextRestored = () => {
      setWebglError(false);
    };
    renderer.domElement.addEventListener('webglcontextlost', onContextLost);
    renderer.domElement.addEventListener('webglcontextrestored', onContextRestored);

    const scene = new THREE.Scene();
    const skyHex = 0xdbeeff;
    scene.background = new THREE.Color(skyHex);
    scene.fog = new THREE.FogExp2(skyHex, 0.021);

    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    const roomEnv = new RoomEnvironment();
    const envTex = pmremGenerator.fromScene(roomEnv, 0.04).texture;
    scene.environment = envTex;
    roomEnv.dispose();
    pmremGenerator.dispose();

    const camera = new THREE.PerspectiveCamera(44, width / height, 0.1, 120);
    camera.position.copy(_targetCamPos);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = !isSoftwareGl;
    controls.dampingFactor = 0.07;
    controls.maxPolarAngle = Math.PI / 2 - 0.04;
    controls.minDistance = 2.6;
    controls.maxDistance = 20;
    controls.target.copy(_targetLookAt);

    controls.addEventListener('start', () => {
      cameraAnimatingRef.current = false;
    });

    // Warm key light + cool HemisphereLight fill + rim light
    const hemiLight = new THREE.HemisphereLight(0xcfe8ff, 0x7bc96f, 0.72);
    scene.add(hemiLight);

    const keyLight = new THREE.DirectionalLight(0xfff3d6, 1.85);
    keyLight.position.set(7, 11, 6);
    keyLight.castShadow = !isSoftwareGl;
    keyLight.shadow.mapSize.set(1024, 1024);
    keyLight.shadow.camera.near = 1;
    keyLight.shadow.camera.far = 32;
    const frustum = 10.5;
    keyLight.shadow.camera.left = -frustum;
    keyLight.shadow.camera.right = frustum;
    keyLight.shadow.camera.top = frustum;
    keyLight.shadow.camera.bottom = -frustum;
    keyLight.shadow.bias = -0.0005;
    keyLight.shadow.normalBias = 0.02;
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0xbce0ff, 0.55);
    rimLight.position.set(-7, 5, -6);
    scene.add(rimLight);

    // Procedural persistent textures & resources
    const maxAniso = renderer.capabilities.getMaxAnisotropy();
    const groundTex = createMeadowGroundTexture(maxAniso);
    const bumpTex = createBrushedGrainTexture(maxAniso);
    const shadowTex = createContactShadowTexture();

    const persistentResources: Shared3DResources = {
      geometries: [],
      materials: [],
      shadowTexture: shadowTex,
      bumpTexture: bumpTex,
    };

    const stageResources: Shared3DResources = {
      geometries: [],
      materials: [],
      shadowTexture: shadowTex,
      bumpTexture: bumpTex,
    };

    // Extended outdoor meadow ground plane (natural horizon fade, no box walls)
    const groundGeo = new THREE.CircleGeometry(42, 64);
    groundGeo.rotateX(-Math.PI / 2);
    const groundMat = new THREE.MeshStandardMaterial({
      map: groundTex,
      roughness: 0.88,
      metalness: 0.0,
    });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.receiveShadow = true;
    scene.add(ground);

    // Instanced meadow perimeter flowers
    const flowers = buildMeadowFlowersInstanced(persistentResources);
    scene.add(flowers);

    const stageGroup = new THREE.Group();
    scene.add(stageGroup);

    const fxGroup = new THREE.Group();
    scene.add(fxGroup);

    const celebrationParticles: CelebrationParticle[] = [];

    const buildById = (id: Exclude<Model3DId, 'parade'>): THREE.Group => {
      let grp: THREE.Group;
      switch (id) {
        case 'race_car':
          grp = buildRaceCar(stageResources);
          if (profileRef.current.equippedCosmetics?.carSkin && profileRef.current.equippedCosmetics.carSkin !== 'default') {
            const cHex = profileRef.current.equippedCosmetics.carSkin === 'car_emerald' ? 0x35d982 : 0xa855f7;
            grp.traverse((child) => {
              const mesh = child as THREE.Mesh;
              if (mesh.isMesh && mesh.material && !Array.isArray(mesh.material)) {
                const mat = mesh.material as THREE.MeshStandardMaterial;
                if (mat.color && mat.color.getHex() === 0x287bff) mat.color.setHex(cHex);
              }
            });
          }
          return grp;
        case 'rocket':
          return buildRocket(stageResources);
        case 'apple_tree':
          return buildAppleTree(stageResources, {
            appleCount: selectedModelRef.current === 'apple_tree' ? treeAppleTotalRef.current : 5,
          });
        case 'toy_train':
          return buildToyTrain(stageResources, selectedModelRef.current === 'toy_train');
        case 'math_robot':
          grp = buildMathRobot(stageResources);
          if (profileRef.current.equippedCosmetics?.robotSkin && profileRef.current.equippedCosmetics.robotSkin !== 'default') {
            const rHex = profileRef.current.equippedCosmetics.robotSkin === 'robot_gold' ? 0xffd43b : 0x287bff;
            grp.traverse((child) => {
              const mesh = child as THREE.Mesh;
              if (mesh.isMesh && mesh.material && !Array.isArray(mesh.material)) {
                const mat = mesh.material as THREE.MeshStandardMaterial;
                if (mat.color && (mat.color.getHex() === 0x9755f5 || mat.color.getHex() === 0x7c3aed)) {
                  mat.color.setHex(rHex);
                }
              }
            });
          }
          return grp;
        case 'star_trophy':
          return buildStarTrophy(stageResources);
        case 'abacus_toy':
          return buildAbacusToy(stageResources);
        case 'number_castle':
          return buildNumberCastle(stageResources);
      }
    };

    const activeModels: THREE.Group[] = [];
    let challengeTime = 0;

    const triggerCelebration = () => {
      const palette = [0xffd83d, 0x35d66f, 0x287bff, 0xff55ae, 0xff963c];
      for (let i = 0; i < 12; i++) {
        const starMesh = buildCelebrationStarMesh(persistentResources, palette[i % palette.length]);
        const angle = (i / 12) * Math.PI * 2;
        const speed = 2.0 + (i % 3) * 0.7;
        starMesh.position.set(Math.cos(angle) * 0.4, 1.4, Math.sin(angle) * 0.4);
        fxGroup.add(starMesh);
        celebrationParticles.push({
          mesh: starMesh,
          vel: new THREE.Vector3(
            Math.cos(angle) * speed,
            3.2 + (i % 4) * 0.65,
            Math.sin(angle) * speed
          ),
          age: 0,
          life: 1.35,
          rotSpeed: 4.5 + (i % 3) * 1.5,
        });
      }
    };

    const rebuildStage = () => {
      while (stageGroup.children.length > 0) {
        stageGroup.remove(stageGroup.children[0]);
      }
      disposeResourcePool(stageResources);
      activeModels.length = 0;
      bounceMapRef.current.clear();
      highlightedPartRef.current = null;
      highlightedPartsSetRef.current.clear();
      challengeTime = 0;

      if (modeRef.current === 'count3d') {
        const ch = challengeRef.current;

        if (ch.type === 'addition' && ch.onTree) {
          // Display countA apples + pop-in animation for countB more apples on the Apple Tree
          const tree = buildAppleTree(stageResources, {
            appleCount: ch.countA + ch.countB,
            addedFromIndex: ch.countA,
          });
          stageGroup.add(tree);
          activeModels.push(tree);
          _targetCamPos.set(3.2, 2.5, 4.8);
          _targetLookAt.set(0, 1.65, 0);
          cameraAnimatingRef.current = true;
          return;
        }

        if (ch.type === 'compare') {
          // Left group vs Right group on meadow
          const spawnSide = (count: number, offsetX: number, startIdx: number) => {
            const cols = Math.min(3, count);
            const rows = Math.ceil(count / cols);
            for (let i = 0; i < count; i++) {
              const r = Math.floor(i / cols);
              const c = i % cols;
              const x = offsetX + (c - (cols - 1) / 2) * 1.2;
              const z = (r - (rows - 1) / 2) * 1.25;
              const item = buildCountable3DItem(ch.kind, stageResources);
              item.position.set(x, 0, z);
              item.userData.stageItemIndex = startIdx + i;
              stageGroup.add(item);
              activeModels.push(item);
            }
          };
          spawnSide(ch.countA, -2.55, 0);
          spawnSide(ch.countB, 2.55, ch.countA);
          _targetCamPos.set(0, 5.2, 8.8);
          _targetLookAt.set(0, 0.6, 0);
          cameraAnimatingRef.current = true;
          return;
        }

        if (ch.type === 'missing') {
          const total = ch.countA + ch.countB;
          const cols = Math.min(4, total);
          const rows = Math.ceil(total / cols);
          for (let i = 0; i < total; i++) {
            const r = Math.floor(i / cols);
            const c = i % cols;
            const x = (c - (cols - 1) / 2) * 1.55;
            const z = (r - (rows - 1) / 2) * 1.55;
            const isSlot = i >= ch.countA;
            const item = isSlot
              ? buildGhostSlotItem(stageResources)
              : buildCountable3DItem(ch.kind, stageResources);
            item.position.set(x, 0, z);
            if (!isSlot) item.userData.stageItemIndex = i;
            stageGroup.add(item);
            activeModels.push(item);
          }
          _targetCamPos.set(0, 4.8, 7.6);
          _targetLookAt.set(0, 0.5, 0);
          cameraAnimatingRef.current = true;
          return;
        }

        // Count, Matching, Meadow Addition, Subtraction
        const total = ch.type === 'addition' ? ch.countA + ch.countB : ch.countA;
        const cols = Math.min(5, total);
        const rows = Math.ceil(total / cols);
        for (let i = 0; i < total; i++) {
          const r = Math.floor(i / cols);
          const c = i % cols;
          const x = (c - (cols - 1) / 2) * 1.6;
          const z = (r - (rows - 1) / 2) * 1.6;
          const item = buildCountable3DItem(ch.kind, stageResources);
          item.position.set(x, 0, z);
          item.userData.stageItemIndex = i;

          if (ch.type === 'addition' && i >= ch.countA) {
            item.scale.setScalar(0.01);
            item.userData.popInDelay = (i - ch.countA) * 0.25;
            item.userData.popInProgress = 0;
          } else if (ch.type === 'subtraction' && i >= ch.countA - ch.countB) {
            item.userData.flyAwayDelay = 0.7 + (i - (ch.countA - ch.countB)) * 0.24;
            item.userData.flyAwayProgress = 0;
          }

          stageGroup.add(item);
          activeModels.push(item);
        }
        _targetCamPos.set(0, 4.9, 7.9);
        _targetLookAt.set(0, 0.55, 0);
        cameraAnimatingRef.current = true;
        return;
      }

      if (selectedModelRef.current === 'parade') {
        const latestProfile = profileRef.current;
        const unlockedParade = MODEL_3D_CATALOG.filter(
          (m) =>
            m.unlockStars === 0 ||
            (latestProfile.unlocked3DModels && latestProfile.unlocked3DModels.includes(m.id)) ||
            latestProfile.stars >= m.unlockStars
        );
        const radius = unlockedParade.length > 6 ? 4.4 : 3.85;
        unlockedParade.forEach((entry, idx) => {
          const angle = (idx / unlockedParade.length) * Math.PI * 2 - Math.PI / 2;
          const model = buildById(entry.id);
          model.position.set(Math.cos(angle) * radius, 0, Math.sin(angle) * radius);
          model.rotation.y = -angle + Math.PI / 2;
          model.userData.catalogItem = entry;
          stageGroup.add(model);
          activeModels.push(model);
        });
        _targetCamPos.set(0, 5.4, 10.8);
        _targetLookAt.set(0, 1.0, 0);
        cameraAnimatingRef.current = true;
      } else {
        const entry = MODEL_3D_CATALOG.find((m) => m.id === selectedModelRef.current);
        const model = buildById(selectedModelRef.current);
        model.userData.catalogItem = entry;
        stageGroup.add(model);
        activeModels.push(model);
        if (selectedModelRef.current === 'toy_train') {
          _targetCamPos.set(3.2, 2.7, 6.4);
          _targetLookAt.set(-0.35, 0.95, 0);
        } else {
          _targetCamPos.set(4.2, 2.8, 5.2);
          _targetLookAt.set(0, 1.15, 0);
        }
        cameraAnimatingRef.current = true;
      }
    };

    const applyPreset = (preset: CameraPreset) => {
      const isParade = modeRef.current === 'explore' && selectedModelRef.current === 'parade';
      const isTrain = modeRef.current === 'explore' && selectedModelRef.current === 'toy_train';
      if (preset === 'hero') {
        _targetCamPos.set(
          isParade ? 0 : isTrain ? 3.2 : 4.2,
          isParade ? 5.4 : 2.8,
          isParade ? 10.8 : isTrain ? 6.4 : 5.2
        );
        _targetLookAt.set(isTrain ? -0.35 : 0, isParade ? 1.0 : 1.15, 0);
      } else if (preset === 'close') {
        _targetCamPos.set(isParade ? 2.6 : 2.4, isParade ? 2.8 : 1.95, isParade ? 6.2 : 3.3);
        _targetLookAt.set(0, 1.25, 0);
      } else {
        _targetCamPos.set(0.01, isParade ? 11.4 : 6.8, isParade ? 2.2 : 1.4);
        _targetLookAt.set(0, 0.5, 0);
      }
      cameraAnimatingRef.current = true;
    };

    const resetCamera = () => {
      applyPreset('hero');
    };

    const zoomCamera = (factor: number) => {
      cameraAnimatingRef.current = false;
      _scratchVec.copy(camera.position).sub(controls.target);
      const len = _scratchVec.length();
      const nextLen = THREE.MathUtils.clamp(len * factor, controls.minDistance, controls.maxDistance);
      _scratchVec.normalize().multiplyScalar(nextLen);
      _targetCamPos.copy(controls.target).add(_scratchVec);
      _targetLookAt.copy(controls.target);
      cameraAnimatingRef.current = true;
    };

    sceneControllersRef.current = {
      rebuildStage,
      applyPreset,
      resetCamera,
      zoomCamera,
      triggerCelebration,
    };
    rebuildStage();

    if (!isSoftwareGl) {
      renderer.compile(scene, camera);
    }

    // Raycasting for models & individual sub-parts
    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();
    let pointerDownPos = { x: 0, y: 0 };

    const handlePointerDown = (e: PointerEvent) => {
      pointerDownPos = { x: e.clientX, y: e.clientY };
    };

    const handlePointerUp = (e: PointerEvent) => {
      const dist = Math.hypot(e.clientX - pointerDownPos.x, e.clientY - pointerDownPos.y);
      if (dist > 8) return; // Ignore orbit drag

      const rect = renderer.domElement.getBoundingClientRect();
      pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(pointer, camera);
      const hits = raycaster.intersectObjects(activeModels, true);
      if (hits.length > 0) {
        const hitMesh = hits[0].object;
        if (hitMesh.userData.isShadow) return;
        const partRoot = (hitMesh.userData.partRoot as THREE.Object3D | undefined) || null;
        let modelRoot: THREE.Object3D | null = hitMesh;
        while (modelRoot && !activeModels.includes(modelRoot as THREE.Group)) {
          modelRoot = modelRoot.parent;
        }
        if (modelRoot) {
          onPartTapCallbackRef.current(partRoot, modelRoot);
        }
      }
    };

    renderer.domElement.addEventListener('pointerdown', handlePointerDown);
    renderer.domElement.addEventListener('pointerup', handlePointerUp);

    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth || window.innerWidth;
      const h = container.clientHeight || window.innerHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    // Main animation loop with software-WebGL fence sync pacing
    let rafId = 0;
    let timerId = 0;
    let disposed = false;
    const clock = new THREE.Clock();

    const afterDraw = (cb: () => void) => {
      const gl = renderer.getContext() as WebGL2RenderingContext;
      const sync = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
      gl.flush();
      const poll = () => {
        if (disposed) return;
        const state = sync && gl.getSyncParameter(sync, gl.SYNC_STATUS);
        if (state === gl.UNSIGNALED) {
          timerId = window.setTimeout(poll, 5);
        } else {
          if (sync) gl.deleteSync(sync);
          timerId = window.setTimeout(cb, 80);
        }
      };
      timerId = window.setTimeout(poll, 5);
    };

    const tick = () => {
      if (disposed) return;
      const delta = Math.min(clock.getDelta(), 0.08);
      const elapsed = clock.getElapsedTime();
      challengeTime += delta;

      // Smoothly damp exploded view separation
      explodeCurrentRef.current = THREE.MathUtils.damp(
        explodeCurrentRef.current,
        explodeTargetRef.current,
        7.5,
        delta
      );

      // Smoothly damp camera preset / reset transitions
      if (cameraAnimatingRef.current) {
        const dampAlpha = 1 - Math.exp(-5.5 * delta);
        camera.position.lerp(_targetCamPos, dampAlpha);
        controls.target.lerp(_targetLookAt, dampAlpha);
        if (
          camera.position.distanceTo(_targetCamPos) < 0.04 &&
          controls.target.distanceTo(_targetLookAt) < 0.04
        ) {
          cameraAnimatingRef.current = false;
        }
      }

      // Animate celebration star burst particles
      for (let p = celebrationParticles.length - 1; p >= 0; p--) {
        const pt = celebrationParticles[p];
        pt.age += delta;
        pt.vel.y -= 6.5 * delta;
        pt.mesh.position.addScaledVector(pt.vel, delta);
        pt.mesh.rotation.y += pt.rotSpeed * delta;
        pt.mesh.rotation.z += pt.rotSpeed * 0.6 * delta;
        const s = Math.max(0.01, 1 - pt.age / pt.life);
        pt.mesh.scale.setScalar(s);
        if (pt.age >= pt.life) {
          fxGroup.remove(pt.mesh);
          celebrationParticles.splice(p, 1);
        }
      }

      // Animate active 3D models & sub-parts
      const isExploreSingle =
        modeRef.current === 'explore' &&
        selectedModelRef.current !== 'parade' &&
        selectedModelRef.current !== 'apple_tree' &&
        selectedModelRef.current !== 'toy_train' &&
        selectedModelRef.current !== 'math_robot';

      for (let i = 0; i < activeModels.length; i++) {
        const model = activeModels[i];

        if (isExploreSingle) {
          model.rotation.y += delta * 0.32;
        }

        // Animated addition pop-in for stage items
        if (typeof model.userData.popInDelay === 'number') {
          if (challengeTime >= model.userData.popInDelay) {
            const nextScale = THREE.MathUtils.damp(model.scale.x, 1, 9, delta);
            model.scale.setScalar(nextScale);
          }
        }

        // Animated subtraction lift & shrink away for stage items
        if (typeof model.userData.flyAwayDelay === 'number') {
          if (challengeTime >= model.userData.flyAwayDelay) {
            const p = Math.min(1, (challengeTime - model.userData.flyAwayDelay) * 1.15);
            model.position.y = p * 2.2;
            model.scale.setScalar(Math.max(0.001, 1 - p));
          } else {
            model.position.y = Math.sin(elapsed * 2.2 + i * 0.7) * 0.05;
          }
        } else {
          // Root bounce
          const bounceTimer = bounceMapRef.current.get(model) || 0;
          if (bounceTimer > 0) {
            const nextT = Math.max(0, bounceTimer - delta * 2.4);
            bounceMapRef.current.set(model, nextT);
            model.position.y = Math.sin(nextT * Math.PI) * 0.42;
          } else if (modeRef.current === 'count3d' && !model.userData.catalogItem) {
            model.position.y = Math.sin(elapsed * 2.2 + i * 0.7) * 0.06;
          } else {
            model.position.y = 0;
          }
        }

        if (model.userData.isGhostSlot) {
          model.rotation.y += delta * 1.3;
        }

        // Exploded parts + sub-part tap bounce + added apple pop-in
        const exp = explodeCurrentRef.current;
        for (let c = 0; c < model.children.length; c++) {
          const part = model.children[c];
          if (part.userData.isShadow) continue;

          if (typeof part.userData.popInDelay === 'number') {
            if (challengeTime >= part.userData.popInDelay) {
              const s = THREE.MathUtils.damp(part.scale.x, 1, 10, delta);
              part.scale.setScalar(s);
            }
          }

          const base = part.userData.basePos as THREE.Vector3 | undefined;
          const offset = part.userData.explodeVec as THREE.Vector3 | undefined;
          if (base && offset) {
            _scratchVec.copy(offset).multiplyScalar(exp);
            part.position.copy(base).add(_scratchVec);
          }

          const partBounce = bounceMapRef.current.get(part) || 0;
          if (partBounce > 0) {
            const nextPb = Math.max(0, partBounce - delta * 2.8);
            bounceMapRef.current.set(part, nextPb);
            part.position.y += Math.sin(nextPb * Math.PI) * 0.16;
            const pulseScale = 1 + Math.sin(nextPb * Math.PI) * 0.25;
            if (!part.userData.isAddedApple || part.scale.x > 0.6) {
              part.scale.setScalar(pulseScale);
            }
          }
        }
      }

      controls.update();
      renderer.render(scene, camera);

      if (isSoftwareGl) {
        afterDraw(tick);
      } else {
        rafId = requestAnimationFrame(tick);
      }
    };

    if (isSoftwareGl) {
      afterDraw(tick);
    } else {
      rafId = requestAnimationFrame(tick);
    }

    return () => {
      disposed = true;
      cancelAnimationFrame(rafId);
      clearTimeout(timerId);
      window.removeEventListener('resize', handleResize);
      renderer.domElement.removeEventListener('pointerdown', handlePointerDown);
      renderer.domElement.removeEventListener('pointerup', handlePointerUp);
      renderer.domElement.removeEventListener('webglcontextlost', onContextLost);
      renderer.domElement.removeEventListener('webglcontextrestored', onContextRestored);

      controls.dispose();
      disposeResourcePool(stageResources);
      disposeResourcePool(persistentResources);
      groundGeo.dispose();
      groundMat.dispose();
      groundTex.dispose();
      bumpTex.dispose();
      shadowTex.dispose();
      envTex.dispose();
      renderer.dispose();
      if (renderer.domElement.parentNode === container) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  const handleNextChallenge = useCallback(
    (nextFilter?: Challenge3DFilter) => {
      const f = nextFilter ?? challengeFilter;
      setChallenge(generateMath3DChallenge(profile.difficulty, f));
    },
    [challengeFilter, profile.difficulty]
  );

  const handleChallengeAnswer = (choice: string) => {
    if (challenge.solved) return;
    if (choice === challenge.answer) {
      setChallenge((prev) => ({ ...prev, solved: true }));
      const earned = awardStarOnce(challenge.id);
      setTappedStatus(
        lang === 'hi'
          ? earned
            ? 'शाबाश! +1 सितारा मिला!'
            : 'सही उत्तर!'
          : earned
          ? 'Great Job! +1 Star Earned!'
          : 'Great Job!'
      );
      window.setTimeout(() => {
        handleNextChallenge();
      }, 1350);
    } else {
      audioService.playGentleTryAgain();
      setTappedStatus(
        lang === 'hi' ? 'फिर से कोशिश करें! आप कर सकते हैं!' : "Let's Try Again! Count closely!"
      );
    }
  };

  const handleTrainQuizChoice = (val: number) => {
    if (trainSolvedId === trainQuiz.id) return;
    if (val === trainQuiz.answer) {
      setTrainSolvedId(trainQuiz.id);
      awardStarOnce(trainQuiz.id);
      setTappedStatus(
        lang === 'hi' ? 'शाबाश! ट्रेन पहेली हल हुई! +1 सितारा' : 'Choo-Choo! Correct! +1 Star!'
      );
    } else {
      audioService.playGentleTryAgain();
      setTappedStatus(
        lang === 'hi' ? 'फिर से पहिए या डिब्बे गिनें!' : 'Tap the wheels or cars to count again!'
      );
    }
  };

  const handleRobotQuizChoice = (val: number) => {
    if (robotSolvedId === robotQuiz.id) return;
    if (val === robotQuiz.answer) {
      setRobotSolvedId(robotQuiz.id);
      awardStarOnce(robotQuiz.id);
      setTappedStatus(
        lang === 'hi' ? 'रोबो दोस्त खुश हुआ! +1 सितारा!' : 'Robo-Buddy cheers! +1 Star!'
      );
      const kinds: RobotMicroQuiz['targetPartKind'][] = ['eyes', 'arms', 'legs', 'antenna', 'head'];
      const nextKind = kinds[(kinds.indexOf(robotQuiz.targetPartKind) + 1) % kinds.length];
      window.setTimeout(() => {
        setRobotSolvedId(null);
        setRobotQuiz(generateRobotQuiz(nextKind));
      }, 1250);
    } else {
      audioService.playGentleTryAgain();
      setTappedStatus(
        lang === 'hi' ? 'रोबो दोस्त के अंग टैप करके गिनें!' : 'Tap Robo-Buddy’s parts to count!'
      );
    }
  };

  const isModelUnlocked = (item: (typeof MODEL_3D_CATALOG)[number]) =>
    item.unlockStars === 0 ||
    profile.stars >= item.unlockStars ||
    Boolean(profile.unlocked3DModels?.includes(item.id));

  const unlockedAchievementCount = profile.unlockedAchievements?.length || 0;

  return (
    <div className="fixed inset-0 z-40 bg-[#DBEEFF] overflow-hidden select-none">
      {/* Isolated WebGL Canvas Mount */}
      <div ref={mountRef} className="w-full h-full" />

      {/* Fallback if WebGL unavailable */}
      {webglError && (
        <div className="absolute inset-0 flex items-center justify-center p-6 bg-[#EEF5FF]">
          <div className="bg-white border border-slate-200 rounded-3xl p-8 max-w-md text-center space-y-4 shadow-sm">
            <Box className="w-12 h-12 text-[#287BFF] mx-auto" />
            <h2 className="text-2xl font-display font-bold text-slate-900">
              3D Toybox Studio
            </h2>
            <p className="text-sm text-slate-600">
              WebGL 3D acceleration is unavailable in this browser context.
            </p>
            <button
              type="button"
              onClick={onBack}
              className="px-6 py-3 rounded-2xl bg-[#287BFF] text-white font-bold"
            >
              {lang === 'hi' ? 'वापस जाएँ' : 'Back to Home'}
            </button>
          </div>
        </div>
      )}

      {/* Minimal Top Header Bar (No backdrop-filter over WebGL, no pulsating dots) */}
      <div className="absolute top-3 left-2 right-2 sm:top-4 sm:left-4 sm:right-4 z-10 flex items-center justify-between gap-2 pointer-events-none">
        <div className="pointer-events-auto flex items-center gap-2 sm:gap-3 bg-white/95 border border-slate-200 rounded-2xl px-2.5 sm:px-3.5 py-2 shadow-sm min-w-0 max-w-[calc(100%-108px)] sm:max-w-[65%]">
          <button
            type="button"
            onClick={() => {
              audioService.playClick();
              onBack();
            }}
            className="inline-flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs sm:text-sm font-bold transition-colors whitespace-nowrap shrink-0"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{lang === 'hi' ? 'वापस' : 'Exit 3D'}</span>
          </button>
          <div className="pr-1 min-w-0">
            <h1 className="font-display font-bold text-slate-900 text-xs sm:text-base leading-tight truncate">
              {lang === 'hi' ? 'VS 3D गणित खिलौना बॉक्स' : 'VS Math 3D Toybox'}
            </h1>
            <p className="text-[11px] sm:text-xs font-semibold text-slate-500 truncate">
              {tappedStatus ||
                (lang === 'hi'
                  ? '360° घुमाएँ · किसी भी 3D मॉडल या हिस्से को टैप करें'
                  : 'Drag to orbit 360° · Tap any 3D model or part')}
            </p>
          </div>
        </div>

        <div className="pointer-events-auto flex items-center gap-1.5 sm:gap-2 shrink-0">
          {onToggleSound && (
            <button
              type="button"
              onClick={() => {
                onToggleSound();
              }}
              aria-label={soundEnabled ? 'Mute sound' : 'Unmute sound'}
              className="bg-white/95 border border-slate-200 hover:border-[#287BFF] rounded-2xl p-2 sm:p-2.5 shadow-sm text-slate-700 transition-colors"
            >
              {soundEnabled ? (
                <Volume2 className="w-4 h-4 text-[#35D66F]" />
              ) : (
                <VolumeX className="w-4 h-4 text-slate-400" />
              )}
            </button>
          )}

          <div
            className={`bg-white/95 border rounded-2xl px-3 sm:px-4 py-1.5 sm:py-2 shadow-sm flex items-center gap-1.5 font-display font-bold text-sm sm:text-base text-amber-800 tabular-nums transition-transform duration-300 ${
              celebratingBanner
                ? 'border-[#35D66F] scale-110'
                : 'border-[#FFD83D] scale-100'
            }`}
          >
            <Star className="w-4 h-4 fill-[#FFD83D] text-amber-500" />
            <span>{profile.stars}</span>
          </div>
        </div>
      </div>

      {/* Collapsible Bottom Center Control Dock (solid/rgba surface, zero viewport center occlusion, responsive width) */}
      <div
        className="absolute bottom-2 sm:bottom-4 left-1/2 z-10 flex flex-col items-center transition-transform duration-300 max-w-full"
        style={{
          width: 'min(960px, calc(100vw - 16px))',
          transform: dockCollapsed
            ? 'translate(-50%, calc(100% - 36px))'
            : 'translate(-50%, 0)',
        }}
      >
        <button
          type="button"
          onClick={() => {
            audioService.playClick();
            setDockCollapsed((c) => !c);
          }}
          className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-t-2xl bg-white/95 border border-b-0 border-slate-200 text-xs font-bold text-slate-700 hover:text-[#287BFF] shadow-xs"
        >
          {dockCollapsed ? (
            <>
              <ChevronUp className="w-4 h-4" />
              <span>{lang === 'hi' ? 'कंट्रोल दिखाएँ (H)' : 'Show Controls (H)'}</span>
            </>
          ) : (
            <>
              <ChevronDown className="w-4 h-4" />
              <span>{lang === 'hi' ? 'कंट्रोल छुपाएँ (H)' : 'Hide Controls (H)'}</span>
            </>
          )}
        </button>

        <div className="w-full max-w-full bg-white/95 border border-slate-200 rounded-2xl sm:rounded-3xl px-2.5 sm:px-4 py-2.5 sm:py-3 shadow-md space-y-2 max-h-[46vh] overflow-y-auto overflow-x-hidden">
          {/* Row 1: Mode Switcher & Camera / Zoom / Explode Controls */}
          <div className="flex flex-wrap items-center justify-between gap-2 max-w-full">
            <div className="inline-flex items-center gap-1 p-1 bg-slate-100 rounded-xl max-w-full overflow-x-auto">
              <button
                type="button"
                onClick={() => {
                  audioService.playClick();
                  setMode('explore');
                }}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors whitespace-nowrap shrink-0 ${
                  mode === 'explore'
                    ? 'bg-white text-[#287BFF] shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Box className="w-3.5 h-3.5" />
                <span>{lang === 'hi' ? '3D मॉडल देखें' : 'Explore 3D Models'}</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  audioService.playClick();
                  setMode('count3d');
                  audioService.speak(formatChallengeVoice(challenge, lang), lang);
                }}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors whitespace-nowrap shrink-0 ${
                  mode === 'count3d'
                    ? 'bg-white text-[#35D66F] shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>{lang === 'hi' ? '3D गणित खेल' : '3D Math Challenges'}</span>
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 max-w-full">
              {mode === 'explore' && (
                <label className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-700">
                  <Layers className="w-3.5 h-3.5 text-[#9755F5]" />
                  <span>{lang === 'hi' ? 'हिस्से खोलें' : 'Explode'}</span>
                  <input
                    type="range"
                    min={0}
                    max={1}
                    step={0.05}
                    value={explodeFactor}
                    onChange={(e) => setExplodeFactor(Number(e.target.value))}
                    className="w-16 sm:w-20 accent-[#9755F5]"
                  />
                </label>
              )}

              <div className="inline-flex flex-wrap items-center gap-1 bg-slate-100 p-1 rounded-xl max-w-full">
                {(['hero', 'close', 'top'] as CameraPreset[]).map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => handlePresetClick(p)}
                    className={`px-2 py-1 rounded-lg text-[11px] sm:text-xs font-bold capitalize transition-colors ${
                      cameraPreset === p
                        ? 'bg-white text-slate-900 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {p}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => handleZoom('in')}
                  title={lang === 'hi' ? 'ज़ूम इन' : 'Zoom In'}
                  className="p-1 rounded-lg text-slate-600 hover:bg-white hover:text-slate-900 transition-colors"
                >
                  <ZoomIn className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => handleZoom('out')}
                  title={lang === 'hi' ? 'ज़ूम आउट' : 'Zoom Out'}
                  className="p-1 rounded-lg text-slate-600 hover:bg-white hover:text-slate-900 transition-colors"
                >
                  <ZoomOut className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={handleResetCamera}
                  title={lang === 'hi' ? 'कैमरा रीसेट करें' : 'Reset Camera'}
                  className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] sm:text-xs font-bold text-slate-600 hover:bg-white hover:text-[#287BFF] transition-colors"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>{lang === 'hi' ? 'रीसेट' : 'Reset'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Row 2A: Explore Mode — Interactive Activity Strip + Model Switcher */}
          {mode === 'explore' ? (
            <div className="space-y-2">
              {/* Contextual Interactive Learning Activity Bar for the 4 Hero Objects */}
              {selectedModel === 'apple_tree' && (
                <div className="flex flex-wrap items-center justify-between gap-2 bg-[#ECFFF2] border border-emerald-200 rounded-2xl px-3.5 py-2">
                  <div className="text-xs sm:text-sm font-bold text-emerald-950">
                    {lang === 'hi'
                      ? `पेड़ के सेब टैप करके गिनें: ${tappedAppleIndices.length} / ${treeAppleTotal}`
                      : `Tap each apple on the tree! Counted: ${tappedAppleIndices.length} / ${treeAppleTotal}`}
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        const msg =
                          lang === 'hi'
                            ? `पेड़ पर ${treeAppleTotal} सेब हैं। हर सेब को दबाकर गिनें!`
                            : `There are ${treeAppleTotal} apples on the tree. Tap each apple to count!`;
                        audioService.speak(msg, lang, true);
                      }}
                      className="px-2.5 py-1 rounded-xl bg-white border border-emerald-200 text-xs font-bold text-emerald-800 hover:bg-emerald-50"
                    >
                      {lang === 'hi' ? 'आवाज़ सुनें' : 'Hear Prompt'}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        audioService.playClick();
                        const nextTotal = treeAppleTotal === 5 ? 6 : treeAppleTotal === 6 ? 7 : 5;
                        setTreeAppleTotal(nextTotal);
                        setTreeSessionId(`tree_${Date.now()}`);
                        setTappedAppleIndices([]);
                      }}
                      className="px-2.5 py-1 rounded-xl bg-[#35D66F] text-white text-xs font-bold hover:bg-emerald-600"
                    >
                      {lang === 'hi' ? 'नए सेब' : 'New Tree'}
                    </button>
                  </div>
                </div>
              )}

              {selectedModel === 'toy_train' && (
                <div className="flex flex-wrap items-center justify-between gap-2 bg-[#FFF4E8] border border-orange-200 rounded-2xl px-3.5 py-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <div className="inline-flex items-center gap-1 bg-white p-0.5 rounded-xl border border-orange-200">
                      {(
                        [
                          { id: 'wheels', labelEn: 'Wheels', labelHi: 'पहिए' },
                          { id: 'compartments', labelEn: 'Cars', labelHi: 'डिब्बे' },
                          { id: 'addition', labelEn: '1 + 2 = ?', labelHi: '1 + 2 = ?' },
                        ] as Array<{ id: TrainActivityKind; labelEn: string; labelHi: string }>
                      ).map((tab) => (
                        <button
                          key={tab.id}
                          type="button"
                          onClick={() => {
                            audioService.playClick();
                            setTrainSolvedId(null);
                            setTrainQuiz(generateTrainQuiz(tab.id));
                          }}
                          className={`px-2 py-1 rounded-lg text-[11px] font-bold transition-colors ${
                            trainQuiz.kind === tab.id
                              ? 'bg-[#FF963C] text-white'
                              : 'text-orange-900 hover:bg-orange-50'
                          }`}
                        >
                          {lang === 'hi' ? tab.labelHi : tab.labelEn}
                        </button>
                      ))}
                    </div>
                    <span className="text-xs font-bold text-orange-950">
                      {lang === 'hi' ? trainQuiz.promptHi : trainQuiz.promptEn}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] font-bold text-orange-700 mr-1">
                      {lang === 'hi'
                        ? `टैप: ${tappedWheelIndices.length} पहिए, ${tappedCompartmentIndices.length} डिब्बे`
                        : `Tapped: ${tappedWheelIndices.length} wheels, ${tappedCompartmentIndices.length} cars`}
                    </span>
                    {trainQuiz.choices.map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => handleTrainQuizChoice(c)}
                        className={`w-9 h-8 rounded-lg font-display font-bold text-sm border transition-colors ${
                          trainSolvedId === trainQuiz.id && c === trainQuiz.answer
                            ? 'bg-[#35D66F] border-emerald-600 text-white'
                            : 'bg-white border-orange-200 text-slate-900 hover:border-[#FF963C]'
                        }`}
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {selectedModel === 'math_robot' && (
                <div className="flex flex-wrap items-center justify-between gap-2 bg-[#F4EEFF] border border-purple-200 rounded-2xl px-3.5 py-2">
                  <div className="text-xs font-bold text-purple-950">
                    <span>{lang === 'hi' ? robotQuiz.promptHi : robotQuiz.promptEn}</span>
                    {lastRobotPartLabel && (
                      <span className="ml-2 text-purple-700">· {lastRobotPartLabel}</span>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5">
                    {robotQuiz.choices.map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => handleRobotQuizChoice(c)}
                        className={`w-9 h-8 rounded-lg font-display font-bold text-sm border transition-colors ${
                          robotSolvedId === robotQuiz.id && c === robotQuiz.answer
                            ? 'bg-[#35D66F] border-emerald-600 text-white'
                            : 'bg-white border-purple-200 text-slate-900 hover:border-[#9755F5]'
                        }`}
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {selectedModel === 'star_trophy' && (
                <div className="flex flex-wrap items-center justify-between gap-2 bg-[#FFFBEB] border border-[#FFD83D] rounded-2xl px-3.5 py-2">
                  <div className="flex flex-wrap items-center gap-3 text-xs font-bold text-amber-950">
                    <span className="inline-flex items-center gap-1">
                      <Star className="w-3.5 h-3.5 fill-[#FFD83D] text-amber-500" />
                      {profile.stars} {lang === 'hi' ? 'कुल सितारे' : 'Stars Collected'}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Award className="w-3.5 h-3.5 text-[#9755F5]" />
                      {unlockedAchievementCount}/{ACHIEVEMENT_CATALOG.length}{' '}
                      {lang === 'hi' ? 'उपलब्धियाँ' : 'Achievements'}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-1.5">
                    {MODEL_3D_CATALOG.filter((m) => m.unlockStars > 0).map((m) => {
                      const alreadyUnlocked = profile.unlocked3DModels?.includes(m.id);
                      const eligible = profile.stars >= m.unlockStars;
                      return (
                        <button
                          key={m.id}
                          type="button"
                          onClick={() => {
                            if (alreadyUnlocked || eligible) {
                              audioService.playCelebration();
                              onUnlock3DModel?.(m.id);
                              setSelectedModel(m.id);
                            } else {
                              audioService.playGentleTryAgain();
                              setTappedStatus(
                                lang === 'hi'
                                  ? `${m.nameHi} के लिए ${m.unlockStars} सितारे चाहिए`
                                  : `Earn ${m.unlockStars}★ to unlock ${m.nameEn}`
                              );
                            }
                          }}
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-[11px] font-bold border transition-colors ${
                            alreadyUnlocked || eligible
                              ? 'bg-[#35D66F] border-emerald-600 text-white'
                              : 'bg-white border-amber-300 text-amber-900'
                          }`}
                        >
                          {alreadyUnlocked || eligible ? (
                            <Unlock className="w-3 h-3" />
                          ) : (
                            <Lock className="w-3 h-3" />
                          )}
                          <span>
                            {lang === 'hi' ? m.nameHi : m.nameEn} ({m.unlockStars}★)
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Model Switcher Carousel */}
              <div className="flex items-center gap-2 overflow-x-auto pb-0.5">
                <button
                  type="button"
                  onClick={() => {
                    audioService.playClick();
                    setSelectedModel('parade');
                  }}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap shrink-0 border transition-colors ${
                    selectedModel === 'parade'
                      ? 'bg-[#287BFF] border-[#287BFF] text-white'
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  {lang === 'hi' ? 'सभी मॉडल' : 'All Parade'}
                </button>

                {MODEL_3D_CATALOG.map((m) => {
                  const unlocked = isModelUnlocked(m);
                  return (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => {
                        if (!unlocked) {
                          audioService.playGentleTryAgain();
                          setTappedStatus(
                            lang === 'hi'
                              ? `${m.nameHi} खोलने के लिए ${m.unlockStars} सितारे जीतें!`
                              : `Earn ${m.unlockStars} stars to unlock ${m.nameEn}!`
                          );
                          return;
                        }
                        audioService.playClick();
                        if (m.unlockStars > 0 && !profile.unlocked3DModels?.includes(m.id)) {
                          onUnlock3DModel?.(m.id);
                        }
                        setSelectedModel(m.id);
                        setTappedStatus(
                          `${lang === 'hi' ? m.nameHi : m.nameEn} (${m.partsCount} 3D parts)`
                        );
                      }}
                      className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap shrink-0 border transition-colors ${
                        selectedModel === m.id
                          ? 'bg-[#287BFF] border-[#287BFF] text-white'
                          : unlocked
                          ? 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                          : 'bg-slate-100 border-slate-200 text-slate-400'
                      }`}
                    >
                      {!unlocked && <Lock className="w-3 h-3" />}
                      <span>{lang === 'hi' ? m.nameHi : m.nameEn}</span>
                      {!unlocked && <span>({m.unlockStars}★)</span>}
                    </button>
                  );
                })}
              </div>
            </div>
          ) : (
            /* Row 2B: 3D Math Challenges Mode — All 6 Challenge Filters + Visual Equation & Choices */
            <div className="space-y-2">
              <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5">
                {(
                  [
                    { id: 'all', en: 'All Mix', hi: 'मिश्रित' },
                    { id: 'count', en: 'Count', hi: 'गिनती' },
                    { id: 'addition', en: 'Addition', hi: 'जोड़' },
                    { id: 'subtraction', en: 'Subtraction', hi: 'घटाव' },
                    { id: 'matching', en: 'Number Match', hi: 'मिलान' },
                    { id: 'compare', en: 'Compare', hi: 'तुलना' },
                    { id: 'missing', en: 'Missing ?', hi: 'गायब अंक' },
                  ] as Array<{ id: Challenge3DFilter; en: string; hi: string }>
                ).map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => {
                      audioService.playClick();
                      setChallengeFilter(cat.id);
                      const next = generateMath3DChallenge(profile.difficulty, cat.id);
                      setChallenge(next);
                      audioService.speak(formatChallengeVoice(next, lang), lang);
                    }}
                    className={`px-3 py-1 rounded-xl text-xs font-bold whitespace-nowrap shrink-0 border transition-colors ${
                      challengeFilter === cat.id
                        ? 'bg-[#35D66F] border-[#16A34A] text-white'
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    {lang === 'hi' ? cat.hi : cat.en}
                  </button>
                ))}
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="px-3 py-1.5 rounded-xl bg-[#EEF5FF] text-[#287BFF] font-display font-bold text-base sm:text-lg tabular-nums whitespace-nowrap shrink-0">
                    {challenge.equationText}
                  </span>
                  <div className="min-w-0">
                    <p className="text-xs sm:text-sm font-bold text-slate-800 truncate">
                      {lang === 'hi' ? challenge.promptHi : challenge.promptEn}
                    </p>
                    {countedStageIndices.length > 0 && (
                      <p className="text-[11px] font-bold text-[#35D66F]">
                        {lang === 'hi'
                          ? `टैप गिनती: ${countedStageIndices.length}`
                          : `Tapped count: ${countedStageIndices.length}`}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {challenge.choices.map((c) => (
                    <button
                      key={c}
                      type="button"
                      disabled={challenge.solved}
                      onClick={() => handleChallengeAnswer(c)}
                      className={`min-w-12 px-3 h-11 rounded-xl font-display font-bold text-lg tabular-nums border-2 transition-colors ${
                        challenge.solved && c === challenge.answer
                          ? 'bg-[#35D66F] border-[#16A34A] text-white'
                          : 'bg-white border-slate-200 hover:border-[#287BFF] text-slate-900'
                      }`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
