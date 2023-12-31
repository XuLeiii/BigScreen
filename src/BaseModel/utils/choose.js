import * as THREE from "three";
import { camera } from "../RenderCamera.js";
import { scene } from "../scene/index.js";
import { listTags, arrowTags } from "./tags.js";
import { xy2lon } from "./math.js";
let labelArry = []; //标签数组
let arrowArry = []; //箭头数组
let chooseMesh = 0;
let cityCenter = 0;
// 拾取函数
//event:鼠标坐标
//mesh:网格体组
//level:地图层级
function choose(event, mesh, level) {
  if (chooseMesh) {
    chooseMesh.material[0].color.set(0x00a2ff); //当选A模型后，再选择B模型，此时需要将A模型的颜色设为本身的颜色
    // chooseMesh.material[1].color.set(0x00a2ff);
    if (labelArry.length > 1) {
      labelArry.shift();
    }
    labelArry[0].visible = false;
    if (arrowArry.length > 1) {
      arrowArry.shift();
    }
    arrowArry[0].visible = false;
  }
  //1.获取当前鼠标的坐标
  let Sx = event.clientX;
  let Sy = event.clientY;
  //2.转换屏幕坐标系为webgl坐标系
  let x = (Sx / window.innerWidth) * 2 - 1;
  let y = -(Sy / window.innerHeight) * 2 + 1;
  //3.引入射线类
  let raycaster = new THREE.Raycaster();
  //4.根据摄像机生成射线向量
  raycaster.setFromCamera(new THREE.Vector2(x, y), camera);
  //5.计算和射线相交的网格模型,若有相交则返回一个数组对象，否则返回一个空数组
  let intersetc = raycaster.intersectObjects(mesh.children);
  //6.如果intersetc的大于零，说明有模型被选中，可以对该模型进行后续操作
  if (intersetc.length > 0) {
    //1.取出被选中的模型
    chooseMesh = intersetc[0].object;
    //射线与网格的交点坐标
    chooseMesh.material[0].color.set(0x0054ef);
    // chooseMesh.material[1].color.set(0x0054ef);
    const label = listTags(level); //设备信息标签
    const arrowLabel = arrowTags(level); //箭头图片
    //几何体中心坐标确定标签的位置
    let x = chooseMesh.userData.center.x;
    let y = chooseMesh.userData.center.y;
    let pos = new THREE.Vector3(x, y, 220000);
    label.rotation.x = Math.PI / 2;
    if (level === 1) {
      label.position.copy(pos.set(x + 400000, y + 10000, 220000));
      arrowLabel.position.copy(pos.set(x, y, 125000));
    } else if (level === 2) {
      label.position.copy(pos.set(x + 80000, y, 40000));
      arrowLabel.position.copy(pos.set(x, y, 40000));
    } else {
      label.position.copy(pos.set(x + 40000, y, 40000));
      arrowLabel.position.copy(pos.set(x, y, 40000));
    }
    scene.add(arrowLabel);
    labelArry.push(label);
    arrowArry.push(arrowLabel);
    scene.add(label);
    const lon = xy2lon(x, y);
    cityCenter = lon;
    return chooseMesh.userData.name;
  } else {
    chooseMesh = 0;
  }
}
export { choose, chooseMesh, cityCenter };
