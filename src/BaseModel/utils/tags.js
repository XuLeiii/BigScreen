//封装的一个函数，用来批量生成html标签和CSS2D模型。
import {
  // CSS3DObject,
  CSS3DRenderer,
  CSS3DSprite,
} from "three/addons/renderers/CSS3DRenderer.js";
import { camera } from "../RenderCamera";
//地名标签

//点开的详细信息的标签
function listTags(level) {
  const dom = document.getElementById("hello");
  dom.style.visibility = "visible";
  dom.style.pointerEvents = "none";
  const label = new CSS3DSprite(dom);
  if (level === 1) {
    label.scale.set(5500, 5500, 5500);
  } else if (level === 2) {
    label.scale.set(1000, 1000, 1000);
  } else {
    label.scale.set(500, 500, 500);
  }
  return label;
}
//箭头标签
function arrowTags(level) {
  const dom = document.getElementById("arrow");
  dom.style.visibility = "visible";
  dom.style.pointerEvents = "none";
  const label = new CSS3DSprite(dom);
  if (level === 1) {
    label.scale.set(3000, 3000, 3000);
  } else if (level === 2) {
    label.scale.set(500, 500, 500);
  } else {
    label.scale.set(150, 150, 150);
  }
  return label;
}
//2.创建CSS2D渲染器,想象为一个画布
let labelRenderer = new CSS3DRenderer();
labelRenderer.setSize(window.innerWidth, window.innerHeight);
labelRenderer.domElement.style.position = "absolute";
labelRenderer.domElement.style.pointerEvents = "none";

window.addEventListener("resize", () => {
  labelRenderer.setSize(window.innerWidth, window.innerHeight);
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
});

export { listTags, arrowTags, labelRenderer };
