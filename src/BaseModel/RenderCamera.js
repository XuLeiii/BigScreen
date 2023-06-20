import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

//1.相机
const camera = new THREE.PerspectiveCamera(
  1,
  window.innerWidth / window.innerHeight,
  0.1,
  5000000000
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
// controls.enablePan = false;//禁用鼠标右键
//操作限制
function restrictOp(bol) {
  if (bol) {
    //左右角度限制
    controls.maxAzimuthAngle = Math.PI / 6;
    controls.minAzimuthAngle = -Math.PI / 6;
    //垂直旋转
    controls.minPolarAngle = Math.PI / 3;
    controls.maxPolarAngle = (Math.PI / 6) * 4;
    // //缩放距离限制
    // controls.minDistance = 2500000;
    // controls.maxDistance = 9000000;
  } else {
    controls.minDistance = -Infinity;
    controls.maxDistance = Infinity;
  }
}
window.addEventListener("resize", () => {
  renderer.setSize(window.innerWidth, window.innerHeight);
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
});
export { camera, renderer, controls, restrictOp };
