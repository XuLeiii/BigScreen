import * as THREE from "three";
import { camera } from "../RenderCamera.js";
import { scene } from "../scene/index.js";
import { listTags, arrowTags } from "./tags.js";

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
    chooseMesh.material[1].color.set(0x00a2ff);
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
    chooseMesh.material[1].color.set(0x0054ef);
    const label = listTags(level); //设备信息标签
    const arrowLabel = arrowTags(level); //箭头图片
    //几何体中心坐标
    let x = chooseMesh.geometry.boundingSphere.center.x;
    let y = chooseMesh.geometry.boundingSphere.center.y;
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
    //内蒙古
    if (x === 12425557.5) {
      arrowLabel.position.copy(pos.set(x - 200000, y - 700000, 230000));
      label.position.copy(pos.set(x + 250000, y - 700000, 220000));
    }
    //甘肃
    if (x === 11190477.5) {
      // arrowLabel.position.copy(pos.set(x - 200000, y - 700000, 230000));
      arrowLabel.position.copy(pos.set(x - 500000, y + 400000, 230000));
      label.position.copy(pos.set(x - 80000, y + 450000, 220000));
    }
    //陕西
    if (x === 12063872) {
      arrowLabel.position.copy(pos.set(x + 150000, y, 230000));
      label.position.copy(pos.set(x + 550000, y, 220000));
    }
    //江苏 13265869
    if (x === 13265869) {
      arrowLabel.position.copy(pos.set(x + 100000, y, 230000));
      label.position.copy(pos.set(x + 500000, y + 10000, 220000));
    }
    //辽宁 13616447
    if (x === 13616447) {
      arrowLabel.position.copy(pos.set(x + 100000, y, 230000));
      label.position.copy(pos.set(x + 500000, y + 10000, 220000));
    }
    //河北
    if (x === 12987491) {
      arrowLabel.position.copy(pos.set(x - 100000, y - 100000, 230000));
      label.position.copy(pos.set(x + 300000, y, 220000));
    }
    cityCenter = chooseMesh.userData.center;
    console.log("cityCenter", cityCenter);
    //边缘高光、、、、、、、、、、、、、
    // let a = selectEmissive(chooseMesh);
    // composer.addPass(a);
  } else {
    chooseMesh = 0;
  }
}
export { choose, chooseMesh, cityCenter };
