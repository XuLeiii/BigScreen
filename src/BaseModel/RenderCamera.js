import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
//1.相机
const camera = new THREE.PerspectiveCamera(
  1,
  window.innerWidth / window.innerHeight,
  0.1,
  5000000000
);

camera.position.set(11610512.75, 1071117.8125, 270000000);
//2.渲染器
const renderer = new THREE.WebGLRenderer({
  antialias: true,
  logarithmicDepthBuffer: true, //深度冲突
  alpha: true,
});

renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);

//3.轨道控制器
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.target.set(11610512.75, 4571117.8125, 0);

controls.enablePan = false; //禁用鼠标右键
//视角操作限制
//bol：是否启用限制
//level:地图层级
function restrictOp(bol, level) {
  if (bol) {
    //左右角度限制
    controls.maxAzimuthAngle = Math.PI / 6;
    controls.minAzimuthAngle = -Math.PI / 6;
    //垂直旋转
    controls.minPolarAngle = Math.PI / 3;
    controls.maxPolarAngle = (Math.PI / 6) * 4;
    //缩放距离限制
    if (level === 1) {
      controls.minDistance = 250000000;
      controls.maxDistance = 600000000;
    } else if (level === 2) {
      controls.minDistance = 10000000;
      controls.maxDistance = 100000000;
    } else {
      controls.minDistance = 8000000;
      controls.maxDistance = 80000000;
      return;
    }
  } else {
    controls.minDistance = 0;
    controls.maxDistance = Infinity;
  }
}
window.addEventListener("resize", () => {
  renderer.setSize(window.innerWidth, window.innerHeight);
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
});
export { camera, renderer, controls, restrictOp };
