import * as THREE from "three";
// import { box3Compute } from "./box3Compute";
//shapeGeometry:每个网格体对象，用来获取网格体的位置，和设置其uv数据。
//meshGroup：网格体数组，用来计算网格体组的长宽高。
function generateMap(shapeGeometry) {
  //需要参数网格体的位置和名称，包围盒的宽高最大最小值。
  let pos = shapeGeometry.attributes.position; //传入网格体的位置属性
  let count = pos.count;
  let xwidth = 11610512.75; //包围盒宽
  let ywidth = 4571117.8125; //包围盒高
  let xmin = 8182244.5; //包围盒最小xmin值
  let ymin = 2054361.125; //包围盒最小ymin值
  let uv = []; //[x,y,x,y,x,y]
  for (let i = 0; i < count; i++) {
    let u = (pos.getX(i) - xmin) / xwidth;
    let v = (pos.getY(i) - ymin) / ywidth;
    uv.push(u);
    uv.push(v);
  }
  shapeGeometry.setAttribute(
    "uv",
    new THREE.BufferAttribute(new Float32Array(uv), 2)
  );
  const texture = new THREE.TextureLoader().load("/BaseModel/china.png");
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(1.7, 0.9);
  texture.offset.set(0.999, 1);
  const upMaterial = new THREE.MeshLambertMaterial({
    color: 0x00a2ff,
    map: texture,
    opacity: 1,
    transparent: true,
    side: THREE.DoubleSide,
  });
  const sideMaterial = new THREE.MeshLambertMaterial({
    color: 0x00a2ff,
    opacity: 1,
    transparent: true,
    side: THREE.DoubleSide,
  });
  const shapeMesh = new THREE.Mesh(shapeGeometry, [upMaterial, sideMaterial]);
  return shapeMesh;
}
function generateAnhuiMap(shapeGeometry) {
  //需要参数网格体的位置和名称，包围盒的宽高最大最小值。
  let pos = shapeGeometry.attributes.position; //传入网格体的位置属性
  let count = pos.count;
  let xwidth = 11610512.75; //包围盒宽
  let ywidth = 4571117.8125; //包围盒高
  let xmin = 8182244.5; //包围盒最小xmin值
  let ymin = 2054361.125; //包围盒最小ymin值
  let uv = []; //[x,y,x,y,x,y]
  for (let i = 0; i < count; i++) {
    let u = (pos.getX(i) - xmin) / xwidth;
    let v = (pos.getY(i) - ymin) / ywidth;
    uv.push(u);
    uv.push(v);
  }
  shapeGeometry.setAttribute(
    "uv",
    new THREE.BufferAttribute(new Float32Array(uv), 2)
  );
  const texture = new THREE.TextureLoader().load("/BaseModel/china.png");
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(1.7, 0.9);
  texture.offset.set(0.999, 1);
  const upMaterial = new THREE.MeshLambertMaterial({
    color: 0x00a2ff,
    map: texture,
    side: THREE.DoubleSide,
  });
  const sideMaterial = new THREE.MeshLambertMaterial({
    color: 0x00a2ff,
    side: THREE.DoubleSide,
  });
  const shapeMesh = new THREE.Mesh(shapeGeometry, [upMaterial, sideMaterial]);
  return shapeMesh;
}
//返回shapemesh
export { generateMap, generateAnhuiMap };
