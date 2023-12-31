//封装的计算网格体包围盒尺寸、和中心点
import * as THREE from "three";

function box3Compute(mesh) {
  const box3 = new THREE.Box3();
  box3.expandByObject(mesh); //计算group模型的包围盒
  console.log("包围盒极大极小值", box3);

  const size = new THREE.Vector3();
  box3.getSize(size);
  console.log("包围盒长宽高", size);

  const center = new THREE.Vector3();
  box3.getCenter(center); //计算包围盒几何体中心坐标
  console.log("几何中心", center);

  return box3.getCenter(center); //计算包围盒几何体中心坐标,此处用于点击网格视角切换，可随时注释。
}

export { box3Compute };
