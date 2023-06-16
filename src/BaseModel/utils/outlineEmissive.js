import { OutlinePass } from "three/examples/jsm/postprocessing/OutlinePass.js";
import * as THREE from "three";
import { scene } from "../scene/index.js";
import { camera } from "../RenderCamera.js";

//传入webglrender实例化的renderer,和要高光的网格体即可。
//同时在renderLoop中调用：composer.render(),注释掉// renderer.render(scene, camera);
function selectEmissive(mesh) {
  //加入线框渲染器
  const outlinePass = new OutlinePass(
    new THREE.Vector2(window.innerWidth, window.innerHeight),
    scene,
    camera
  );
  //线框通道参数
  let params = {
    edgeStrength: 3, //边框亮度
    edgeGlow: 0.1, //光晕[0,1]
    edgeThickness: 0.1, //边缘浓度
    pulsePeriod: 3, //呼吸闪烁的速度 闪烁频率 ，默认0 ，值越大频率越低
    rotate: false,
    usePatternTexture: false, //是否使用父级的材质
  };

  //设置线框效果
  outlinePass.edgeStrength = Number(params.edgeStrength);
  outlinePass.edgeGlow = Number(params.edgeGlow);
  outlinePass.edgeThickness = Number(params.edgeThickness);
  outlinePass.pulsePeriod = Number(params.pulsePeriod);
  outlinePass.visibleEdgeColor.set("#0000ff"); // 边缘可见部分发颜色 sColor[0].color
  outlinePass.hiddenEdgeColor.set("#00ff00"); // 边缘遮挡部分发光颜色 sColor[1].color
  outlinePass.selectedObjects = [mesh]; //指定被线框渲染器渲染的模型
  return outlinePass;
}

export { selectEmissive };
