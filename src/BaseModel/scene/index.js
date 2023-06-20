import * as THREE from "three";
// import { box3Compute } from "../utils/box3Compute.js";
import {
  fontGroup,
  fontAnhuiGroup,
  cityFontGroup,
} from "../utils/generateFont.js";
import { lineGroup, MeshGroup } from "./mesh.js";
//1.场景
const scene = new THREE.Scene();

//2.灯光

const lightTarget = new THREE.Object3D();
lightTarget.position.set(11610512.75, 4571117.8125, 0); // 设置目标位置
scene.add(lightTarget);
const directionalLight1 = new THREE.DirectionalLight(0xffffff, 1);
directionalLight1.position.set(21610512.75, 4571117.8125, 10000000);
directionalLight1.target = lightTarget;

directionalLight1.target.target = MeshGroup;
const directionalLight2 = new THREE.DirectionalLight(0xffffff, 1);
directionalLight2.position.set(5610512.75, 4571117.8125, 7000000);
directionalLight2.target = lightTarget;

const directionalLight3 = new THREE.DirectionalLight(0xffffff, 0.5);
directionalLight3.position.set(11610512.75, 8571117.8125, 0);
directionalLight3.target = lightTarget;

const directionalLight4 = new THREE.DirectionalLight(0xffffff, 0.5);
directionalLight4.position.set(11610512.75, -8571117.8125, 0);
directionalLight4.target = lightTarget;

// const helper1 = new THREE.DirectionalLightHelper(directionalLight1, 5000000);
// scene.add(helper1);
// const helper2 = new THREE.DirectionalLightHelper(directionalLight2, 5000000);
// scene.add(helper2);
// const helper3 = new THREE.DirectionalLightHelper(directionalLight3, 5000000);
// scene.add(helper3);
scene.add(
  directionalLight1,
  directionalLight2,
  directionalLight3,
  directionalLight4
);
//3.坐标系
// const axies = new THREE.AxesHelper(300000000, 300000000, 300000000);
// scene.add(axies);

console.log("MeshGroup", MeshGroup);
//4.添加网格体s
scene.add(lineGroup, MeshGroup, fontAnhuiGroup, cityFontGroup);
// scene.add(chinaFace);
scene.add(fontGroup);
export { scene };
