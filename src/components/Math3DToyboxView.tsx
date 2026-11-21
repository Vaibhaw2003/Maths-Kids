import React, { useCallback, useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import {
  ArrowLeft,
  Box,
  ChevronDown,
  ChevronUp,
  Layers,
  Sparkles,
  Star,
} from 'lucide-react';
import { ChildProfile, LanguageCode } from '../types/game';
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
  buildAppleTree,
  buildCountable3DItem,
  buildMathRobot,
  buildMeadowFlowersInstanced,
  buildRaceCar,
  buildRocket,
  buildStarTrophy,
  buildToyTrain,
} from '../three/modelBuilders';

interface Math3DToyboxViewProps {
  profile: ChildProfile;
  lang: LanguageCode;
  onBack: () => void;
  onEarnStars: (stars: number) => void;
}

type ToyboxMode = 'explore' | 'count3d';
type CameraPreset = 'hero' | 'close' | 'top';

// Pre-allocated scratch math helpers (zero GC inside animation loop)
const _scratchVec = new THREE.Vector3();
const _targetCamPos = new THREE.Vector3(5.6, 3.8, 7.2);
const _targetLookAt = new THREE.Vector3(0, 1.0, 0);

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
  onBack,
  onEarnStars,
}) => {
  const mountRef = useRef<HTMLDivElement | null>(null);

  const [mode, setMode] = useState<ToyboxMode>('explore');
  const [selectedModel, setSelectedModel] = useState<Model3DId>('parade');
  const [explodeFactor, setExplodeFactor] = useState<number>(0);
  const [cameraPreset, setCameraPreset] = useState<CameraPreset>('hero');
  const [dockCollapsed, setDockCollapsed] = useState<boolean>(false);
  const [webglError, setWebglError] = useState<boolean>(false);
  const [tappedStatus, setTappedStatus] = useState<string>('');

  // 3D Count Challenge state
  const [countChallenge, setCountChallenge] = useState<{
    kind: 'apple' | 'star' | 'car';
    target: number;
    choices: number[];
    solved: boolean;
  }>(() => buildCountChallenge(profile.difficulty));

  // Mutable refs for 60fps loop without tearing down WebGL canvas
  const langRef = useRef<LanguageCode>(lang);
  const modeRef = useRef<ToyboxMode>(mode);
  const selectedModelRef = useRef<Model3DId>(selectedModel);
  const countChallengeRef = useRef(countChallenge);
  const explodeTargetRef = useRef<number>(explodeFactor);
  const explodeCurrentRef = useRef<number>(0);
  const cameraAnimatingRef = useRef<boolean>(false);
  const bounceMapRef = useRef<Map<THREE.Object3D, number>>(new Map());
  const sceneControllersRef = useRef<{
    rebuildStage: () => void;
    applyPreset: (p: CameraPreset) => void;
  } | null>(null);

  useEffect(() => {
    langRef.current = lang;
  }, [lang]);

  useEffect(() => {
    modeRef.current = mode;
    sceneControllersRef.current?.rebuildStage();
  }, [mode]);

  useEffect(() => {
    selectedModelRef.current = selectedModel;
    sceneControllersRef.current?.rebuildStage();
  }, [selectedModel]);

  useEffect(() => {
    explodeTargetRef.current = explodeFactor;
  }, [explodeFactor]);

  useEffect(() => {
    countChallengeRef.current = countChallenge;
    sceneControllersRef.current?.rebuildStage();
  }, [countChallenge.target, countChallenge.kind]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'h' || e.key === 'H') {
        setDockCollapsed((prev) => !prev);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  const handlePresetClick = useCallback((preset: CameraPreset) => {
    audioService.playClick();
    setCameraPreset(preset);
    sceneControllersRef.current?.applyPreset(preset);
  }, []);

  // Initialize Three.js WebGL stage once
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
    controls.maxDistance = 18;
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
    const frustum = 9.5;
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

    // Procedural shared textures & resources
    const maxAniso = renderer.capabilities.getMaxAnisotropy();
    const groundTex = createMeadowGroundTexture(maxAniso);
    const bumpTex = createBrushedGrainTexture(maxAniso);
    const shadowTex = createContactShadowTexture();

    const sharedResources: Shared3DResources = {
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
    const flowers = buildMeadowFlowersInstanced(sharedResources);
    scene.add(flowers);

    const stageGroup = new THREE.Group();
    scene.add(stageGroup);

    const buildById = (id: Exclude<Model3DId, 'parade'>): THREE.Group => {
      switch (id) {
        case 'race_car':
          return buildRaceCar(sharedResources);
        case 'rocket':
          return buildRocket(sharedResources);
        case 'apple_tree':
          return buildAppleTree(sharedResources);
        case 'toy_train':
          return buildToyTrain(sharedResources);
        case 'math_robot':
          return buildMathRobot(sharedResources);
        case 'star_trophy':
          return buildStarTrophy(sharedResources);
      }
    };

    const activeModels: THREE.Group[] = [];

    const rebuildStage = () => {
      while (stageGroup.children.length > 0) {
        stageGroup.remove(stageGroup.children[0]);
      }
      activeModels.length = 0;
      bounceMapRef.current.clear();

      if (modeRef.current === 'count3d') {
        const currentChallenge = countChallengeRef.current;
        const total = currentChallenge.target;
        const cols = Math.min(5, total);
        const rows = Math.ceil(total / cols);
        for (let i = 0; i < total; i++) {
          const r = Math.floor(i / cols);
          const c = i % cols;
          const x = (c - (cols - 1) / 2) * 1.65;
          const z = (r - (rows - 1) / 2) * 1.65;
          const item = buildCountable3DItem(currentChallenge.kind, sharedResources);
          item.position.set(x, 0, z);
          item.userData.modelId = `item_${i + 1}`;
          stageGroup.add(item);
          activeModels.push(item);
        }
        _targetCamPos.set(0, 4.8, 7.6);
        _targetLookAt.set(0, 0.5, 0);
        cameraAnimatingRef.current = true;
        return;
      }

      if (selectedModelRef.current === 'parade') {
        const radius = 3.85;
        MODEL_3D_CATALOG.forEach((entry, idx) => {
          const angle = (idx / MODEL_3D_CATALOG.length) * Math.PI * 2 - Math.PI / 2;
          const model = buildById(entry.id);
          model.position.set(Math.cos(angle) * radius, 0, Math.sin(angle) * radius);
          model.rotation.y = -angle + Math.PI / 2;
          model.userData.catalogItem = entry;
          stageGroup.add(model);
          activeModels.push(model);
        });
        _targetCamPos.set(0, 5.4, 10.6);
        _targetLookAt.set(0, 1.0, 0);
        cameraAnimatingRef.current = true;
      } else {
        const entry = MODEL_3D_CATALOG.find((m) => m.id === selectedModelRef.current);
        const model = buildById(selectedModelRef.current);
        model.userData.catalogItem = entry;
        stageGroup.add(model);
        activeModels.push(model);
        _targetCamPos.set(4.2, 2.8, 5.2);
        _targetLookAt.set(0, 1.15, 0);
        cameraAnimatingRef.current = true;
      }
    };

    const applyPreset = (preset: CameraPreset) => {
      const isParade = modeRef.current === 'explore' && selectedModelRef.current === 'parade';
      if (preset === 'hero') {
        _targetCamPos.set(isParade ? 0 : 4.2, isParade ? 5.4 : 2.8, isParade ? 10.6 : 5.2);
        _targetLookAt.set(0, isParade ? 1.0 : 1.15, 0);
      } else if (preset === 'close') {
        _targetCamPos.set(isParade ? 2.6 : 2.4, isParade ? 2.8 : 1.9, isParade ? 6.2 : 3.2);
        _targetLookAt.set(0, 1.15, 0);
      } else {
        _targetCamPos.set(0.01, isParade ? 11.2 : 6.6, isParade ? 2.2 : 1.4);
        _targetLookAt.set(0, 0.5, 0);
      }
      cameraAnimatingRef.current = true;
    };

    sceneControllersRef.current = { rebuildStage, applyPreset };
    rebuildStage();

    if (!isSoftwareGl) {
      renderer.compile(scene, camera);
    }

    // Click / tap raycasting to bounce & announce 3D models
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
        let root: THREE.Object3D | null = hits[0].object;
        while (root && !activeModels.includes(root as THREE.Group)) {
          root = root.parent;
        }
        if (root) {
          bounceMapRef.current.set(root, 1.0);
          audioService.playCorrect();
          const currentLang = langRef.current;
          const cat = root.userData.catalogItem as
            | { nameEn: string; nameHi: string; partsCount: number }
            | undefined;
          if (cat) {
            const label = currentLang === 'hi' ? cat.nameHi : cat.nameEn;
            setTappedStatus(`${label} (${cat.partsCount} 3D parts)`);
            audioService.speak(label, currentLang);
          } else {
            const idx = activeModels.indexOf(root as THREE.Group) + 1;
            setTappedStatus(currentLang === 'hi' ? `गिनती: ${idx}` : `Counted #${idx}`);
            audioService.speak(String(idx), currentLang);
          }
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

      // Smoothly damp exploded view separation
      explodeCurrentRef.current = THREE.MathUtils.damp(
        explodeCurrentRef.current,
        explodeTargetRef.current,
        7.5,
        delta
      );

      // Smoothly damp camera preset transitions
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

      // Animate exploded parts + gentle showcase turntable + tap bounce
      for (let i = 0; i < activeModels.length; i++) {
        const model = activeModels[i];

        if (modeRef.current === 'explore' && selectedModelRef.current !== 'parade') {
          model.rotation.y += delta * 0.32;
        }

        // Apply tap bounce
        const bounceTimer = bounceMapRef.current.get(model) || 0;
        if (bounceTimer > 0) {
          const nextT = Math.max(0, bounceTimer - delta * 2.4);
          bounceMapRef.current.set(model, nextT);
          model.position.y = Math.sin(nextT * Math.PI) * 0.45;
        } else if (modeRef.current === 'count3d') {
          model.position.y = Math.sin(elapsed * 2.2 + i * 0.7) * 0.06;
        } else {
          model.position.y = 0;
        }

        // Apply exploded separation to composite sub-parts
        const exp = explodeCurrentRef.current;
        for (let c = 0; c < model.children.length; c++) {
          const part = model.children[c];
          if (part.userData.isShadow) continue;
          const base = part.userData.basePos as THREE.Vector3 | undefined;
          const offset = part.userData.explodeVec as THREE.Vector3 | undefined;
          if (base && offset) {
            _scratchVec.copy(offset).multiplyScalar(exp);
            part.position.copy(base).add(_scratchVec);
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
      sharedResources.geometries.forEach((g) => g.dispose());
      sharedResources.materials.forEach((m) => m.dispose());
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

  const handleCountGuess = (choice: number) => {
    if (countChallenge.solved) return;
    if (choice === countChallenge.target) {
      audioService.playCelebration();
      setCountChallenge((prev) => ({ ...prev, solved: true }));
      onEarnStars(2);
      setTappedStatus(lang === 'hi' ? 'शाबाश! +2 सितारे मिले!' : 'Great Job! +2 Stars Earned!');
      window.setTimeout(() => {
        setCountChallenge(buildCountChallenge(profile.difficulty));
      }, 1300);
    } else {
      audioService.playGentleTryAgain();
      setTappedStatus(
        lang === 'hi' ? 'फिर से गिनें! आप कर सकते हैं!' : "Let's count one more time!"
      );
    }
  };

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

      {/* Minimal Top-Left Header Bar (No backdrop-filter over WebGL, no pulsating dots) */}
      <div className="absolute top-4 left-4 right-4 z-10 flex items-center justify-between gap-4 pointer-events-none">
        <div className="pointer-events-auto flex items-center gap-3 bg-white/95 border border-slate-200 rounded-2xl px-3.5 py-2 shadow-sm">
          <button
            type="button"
            onClick={() => {
              audioService.playClick();
              onBack();
            }}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-sm font-bold transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{lang === 'hi' ? 'वापस' : 'Exit 3D'}</span>
          </button>
          <div className="pr-2">
            <h1 className="font-display font-bold text-slate-900 text-sm sm:text-base leading-tight">
              {lang === 'hi' ? 'VS 3D गणित खिलौना बॉक्स' : 'VS Math 3D Toybox'}
            </h1>
            <p className="text-xs font-semibold text-slate-500">
              {tappedStatus ||
                (lang === 'hi'
                  ? 'मॉडल घुमाने के लिए खींचें या टैप करें'
                  : 'Drag to orbit 360° · Tap any 3D model')}
            </p>
          </div>
        </div>

        <div className="pointer-events-auto bg-white/95 border border-[#FFD83D] rounded-2xl px-4 py-2 shadow-sm flex items-center gap-1.5 font-display font-bold text-amber-800 tabular-nums">
          <Star className="w-4 h-4 fill-[#FFD83D] text-amber-500" />
          <span>{profile.stars}</span>
        </div>
      </div>

      {/* Collapsible Bottom Center Control Dock (<= 15% viewport height, solid/rgba surface) */}
      <div
        className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center transition-transform duration-300"
        style={{
          width: 'min(940px, 95vw)',
          transform: dockCollapsed
            ? 'translate(-50%, calc(100% - 38px))'
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

        <div className="w-full bg-white/95 border border-slate-200 rounded-3xl px-4 py-3 shadow-md space-y-2.5">
          {/* Row 1: Mode & Camera / Explode Controls */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="inline-flex items-center gap-1 p-1 bg-slate-100 rounded-xl">
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
                }}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors whitespace-nowrap shrink-0 ${
                  mode === 'count3d'
                    ? 'bg-white text-[#35D66F] shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>{lang === 'hi' ? '3D गिनती खेल' : '3D Count Challenge'}</span>
              </button>
            </div>

            {mode === 'explore' && (
              <div className="flex flex-wrap items-center gap-3">
                <label className="inline-flex items-center gap-2 text-xs font-bold text-slate-700">
                  <Layers className="w-3.5 h-3.5 text-[#9755F5]" />
                  <span>{lang === 'hi' ? 'हिस्से खोलें' : 'Explode Parts'}</span>
                  <input
                    type="range"
                    min={0}
                    max={1}
                    step={0.05}
                    value={explodeFactor}
                    onChange={(e) => setExplodeFactor(Number(e.target.value))}
                    className="w-24 accent-[#9755F5]"
                  />
                </label>

                <div className="inline-flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
                  {(['hero', 'close', 'top'] as CameraPreset[]).map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => handlePresetClick(p)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold capitalize transition-colors ${
                        cameraPreset === p
                          ? 'bg-white text-slate-900 shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Row 2: Model Switcher OR 3D Count Choices */}
          {mode === 'explore' ? (
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
                {lang === 'hi' ? 'सभी 6 मॉडल' : 'All 6 Parade'}
              </button>

              {MODEL_3D_CATALOG.map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => {
                    audioService.playClick();
                    setSelectedModel(m.id);
                    setTappedStatus(
                      `${lang === 'hi' ? m.nameHi : m.nameEn} (${m.partsCount} 3D parts)`
                    );
                  }}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap shrink-0 border transition-colors ${
                    selectedModel === m.id
                      ? 'bg-[#287BFF] border-[#287BFF] text-white'
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  {lang === 'hi' ? m.nameHi : m.nameEn}
                </button>
              ))}
            </div>
          ) : (
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm font-bold text-slate-800">
                {lang === 'hi'
                  ? '3D मैदान में कितनी चीज़ें हैं? गिनकर चुनें:'
                  : 'How many 3D objects are in the meadow?'}
              </p>
              <div className="flex items-center gap-2">
                {countChallenge.choices.map((c) => (
                  <button
                    key={c}
                    type="button"
                    disabled={countChallenge.solved}
                    onClick={() => handleCountGuess(c)}
                    className={`w-12 h-11 rounded-xl font-display font-bold text-lg tabular-nums border-2 transition-colors ${
                      countChallenge.solved && c === countChallenge.target
                        ? 'bg-[#35D66F] border-[#16A34A] text-white'
                        : 'bg-white border-slate-200 hover:border-[#287BFF] text-slate-900'
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

function buildCountChallenge(difficulty: ChildProfile['difficulty']) {
  const max = difficulty === 'easy' ? 6 : difficulty === 'medium' ? 9 : 12;
  const target = Math.floor(Math.random() * (max - 2 + 1)) + 2;
  const kinds: Array<'apple' | 'star' | 'car'> = ['apple', 'star', 'car'];
  const kind = kinds[Math.floor(Math.random() * kinds.length)];

  const set = new Set<number>([target]);
  while (set.size < 4) {
    const delta = Math.floor(Math.random() * 5) - 2;
    const cand = target + (delta === 0 ? 1 : delta);
    if (cand >= 1 && cand <= max + 2) set.add(cand);
  }
  const choices = Array.from(set).sort((a, b) => a - b);
  return { kind, target, choices, solved: false };
}
