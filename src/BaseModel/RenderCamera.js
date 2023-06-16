import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
// import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
// import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
// import { scene } from "./scene";
//1.相机
const camera = new THREE.PerspectiveCamera(
  70,
  window.innerWidth / window.innerHeight,
  0.1,
  250000000
);
// camera.position.set(300, 300, 300);
// camera.lookAt(0, 0, 0);
camera.position.set(11610512.75, 4571117.8125, 270000000);

//2.渲染器
const renderer = new THREE.WebGLRenderer({
  antialias: true,
  logarithmicDepthBuffer: true, //深度冲突
  alpha: true,
});

renderer.setSize(window.innerWidth, window.innerHeight);
// renderer.setClearColor(0xb9d3ff, 1);
// const composer = new EffectComposer(renderer);
// composer.addPass(new RenderPass(scene, camera));
// renderer.outputEncoding = THREE.sRGBEncoding;
//3.轨道控制器
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.target.set(11610512.75, 4571117.8125, 0);
// controls.maxAzimuthAngle = Math.PI / 2;
// controls.minAzimuthAngle = -Math.PI / 2;
// controls.minDistance = 2500000;
// controls.maxDistance = 9000000;
window.addEventListener("resize", () => {
  renderer.setSize(window.innerWidth, window.innerHeight);
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
});
export { camera, renderer, controls };
