import * as THREE from "three";
// import { exportGLTF } from "../utils/exportGLTF";
// eslint-disable-next-line no-unused-vars
import * as BufferGeometryUtils from "three/examples/jsm/utils/BufferGeometryUtils";
// eslint-disable-next-line no-unused-vars
import { SimplifyModifier } from "three/examples/jsm/modifiers/SimplifyModifier.js";
import {
  generateFont,
  generateProvinceFont,
  generateCityFont,
} from "../utils/generateFont";
import { generateMap } from "../utils/generateMap";
import { lon2xy } from "../utils/math";
import { scene } from ".";
const loaderfile = new THREE.FileLoader();
loaderfile.setResponseType("json");

//中国
let MeshGroup = new THREE.Group(); //模型组
let lineGroup = new THREE.Group(); //线框组
function countryMesh() {
  loaderfile.load("/BaseModel/中国.json", async (data) => {
    data.features.forEach((item) => {
      let simpleGeometry = []; //岛屿geometry
      let simpleMaterial = []; //岛屿material
      // 1.模型
      if (item.geometry.type === "Polygon") {
        item.geometry.coordinates = [item.geometry.coordinates];
      }
      item.geometry.coordinates.forEach((point) => {
        let pointArry = []; //点数组
        let shapeArr = []; //形状数组
        point[0].forEach((val) => {
          let xy = lon2xy(val[0], val[1]);
          pointArry.push(new THREE.Vector2(xy.x, xy.y));
        });
        const shape = new THREE.Shape(pointArry); //传入矢量空间点坐标,生成二维形状平面缓冲几何体。
        shapeArr.push(shape);
        const shapeGeometry = new THREE.ExtrudeGeometry(shapeArr, {
          depth: 400000,
          bevelEnabled: false,
        });
        //生成具有网格体的数组
        let shapeMesh = generateMap(shapeGeometry);
        //简化几何体面数量
        // const modifier = new SimplifyModifier();
        // const simplifyMesh = shapeMesh.clone();
        // simplifyMesh.geometry.setAttribute(
        //   "normal",
        //   shapeMesh.geometry.attributes.normal.clone()
        // );
        // simplifyMesh.geometry.setAttribute(
        //   "uv",
        //   shapeMesh.geometry.attributes.uv.clone()
        // );
        // console.log("shapeMesh", shapeMesh);
        // console.log("simplifyMesh", simplifyMesh);

        // // simplifyMesh.material[0] = simplifyMesh.material[0].clone();
        // // simplifyMesh.material[0].flatShading = true;
        // // simplifyMesh.material[1] = simplifyMesh.material[1].clone();
        // // simplifyMesh.material[1].flatShading = true;
        // const count = Math.floor(
        //   simplifyMesh.geometry.attributes.position.count * 0.1
        // );
        // simplifyMesh.geometry = modifier.modify(simplifyMesh.geometry, count);
        //合并几何体
        // if (
        //   // item.properties.name === "南海" ||
        //   item.properties.name === "海南"
        // ) {
        //   // console.log("南海geometry", shapeMesh.geometry);
        //   islandGeometry.push(shapeMesh.geometry);
        //   islandMaterial.push(shapeMesh.material[0]);
        //   return;
        // }
        // console.log("南海geometry", shapeMesh.geometry);
        simpleGeometry.push(shapeMesh.geometry);
        simpleMaterial.push(shapeMesh.material[0]);

        // MeshGroup.add(shapeMesh);
      });
      //合并网格体
      const mergedGeometries = BufferGeometryUtils.mergeGeometries(
        simpleGeometry,
        true
      );
      const singleMergeMesh = new THREE.Mesh(mergedGeometries, simpleMaterial);
      //为网格体添加名称属性name
      singleMergeMesh.userData.name = item.properties.name;
      //为省会网格体添加省会坐标属性center
      singleMergeMesh.userData.center = lon2xy(
        item.properties.center[0],
        item.properties.center[1]
      );
      console.log("singleMergeMesh", singleMergeMesh);
      MeshGroup.add(singleMergeMesh);
      // 2.地名文字
      let xy = lon2xy(item.properties.centroid[0], item.properties.centroid[1]); //每个网格体自带的中心点数据
      let pos = new THREE.Vector3(xy.x, xy.y, 360000);
      generateFont(item.properties.name, pos);
      // 3.线框
      item.geometry.coordinates.forEach((point) => {
        let lineArry = [];
        point[0].forEach((val) => {
          let xy = lon2xy(val[0], val[1]);
          lineArry.push(xy.x, xy.y, 420000);
        });
        const lineGeometry = new THREE.BufferGeometry();
        const vertices = new Float32Array(lineArry);
        const attribute = new THREE.BufferAttribute(vertices, 3); //三个点为一个空间坐标点
        lineGeometry.attributes.position = attribute; //将空间坐标点赋值为lineGeometry
        const material = new THREE.LineBasicMaterial({
          color: 0x67cde2,
        });
        const lineMesh = new THREE.LineLoop(lineGeometry, material);
        lineGroup.add(lineMesh);
      });
    });

    // exportGLTF(MeshGroup.children[0]);
  });
  //导出gltf
}
//省级
const provinceMeshgroup = new THREE.Group(); //模型组
const provinceLinegroup = new THREE.Group(); //线框组
function provinceMesh(name) {
  // console.log("name", name);
  loaderfile.load(`/BaseModel/${name}.json`, async (data) => {
    data.features.forEach((item) => {
      if (item.geometry.type === "Polygon") {
        item.geometry.coordinates = [item.geometry.coordinates];
      }
      item.geometry.coordinates.forEach((point) => {
        //1.模型
        let pointArry = [];
        let shapeArr = [];
        point[0].forEach((val) => {
          let xy = lon2xy(val[0], val[1]); //转为墨卡托坐标系的坐标
          pointArry.push(new THREE.Vector2(xy.x, xy.y));
        });
        const shape = new THREE.Shape(pointArry);
        shapeArr.push(shape);
        const ShapeGeometry = new THREE.ExtrudeGeometry(shapeArr, {
          depth: 40000,
          bevelEnabled: false,
        });

        //为网格体添加中心坐标属性center
        let shapeMesh = generateMap(ShapeGeometry);
        shapeMesh.userData.center = item.properties.center;
        provinceMeshgroup.add(shapeMesh);
        //为网格体添加名称属性name
        shapeMesh.userData.name = item.properties.name;
        //2.线框
        let pointArr = [];
        point[0].forEach((val) => {
          let xy = lon2xy(val[0], val[1]);
          pointArr.push(xy.x, xy.y, 40800);
        });
        const geometry = new THREE.BufferGeometry(); //创建一个Buffer类型几何体对象
        const vertices = new Float32Array(pointArr);
        const attribue = new THREE.BufferAttribute(vertices, 3); //3个为一组，表示一个顶点的xyz坐标
        geometry.attributes.position = attribue;
        const material = new THREE.LineBasicMaterial({
          color: 0x67cde2, //线条颜色
        });
        const line = new THREE.LineLoop(geometry, material); //首尾顶点连线，轮廓闭合
        provinceLinegroup.add(line);
      });
      scene.add(provinceLinegroup);
      //3.地名文字
      let xy = lon2xy(item.properties.centroid[0], item.properties.centroid[1]); //每个网格体自带的中心点数据
      let pos = new THREE.Vector3(xy.x, xy.y, 40800);
      generateProvinceFont(item.properties.name, pos);
      scene.add(provinceMeshgroup);
    });
  });
  return provinceMeshgroup;
}
//市级
const cityMeshgroup = new THREE.Group();
const cityLineGroup = new THREE.Group();
function cityMesh(name) {
  loaderfile.load(`/BaseModel/${name}.json`, async (data) => {
    data.features.forEach(async (item) => {
      if (item.geometry.type === "Polygon") {
        item.geometry.coordinates = [item.geometry.coordinates];
      }
      item.geometry.coordinates.forEach((point) => {
        //1.模型
        let pointArry = [];
        let shapeArr = [];
        point[0].forEach((val) => {
          let xy = lon2xy(val[0], val[1]); //转为墨卡托坐标系的坐标
          pointArry.push(new THREE.Vector2(xy.x, xy.y));
        });
        const shape = new THREE.Shape(pointArry);
        shapeArr.push(shape);
        const ShapeGeometry = new THREE.ExtrudeGeometry(shapeArr, {
          depth: 40000,
          bevelEnabled: false,
        });
        let shapeMesh = generateMap(ShapeGeometry);
        //为网格体添加中心坐标属性center
        shapeMesh.userData.center = item.properties.center;
        cityMeshgroup.add(shapeMesh);
        //为网格体添加名称属性name
        shapeMesh.userData.name = item.properties.name;
        //2.地名文字
        let xy = lon2xy(
          item.properties.centroid[0],
          item.properties.centroid[1]
        ); //每个网格体自带的中心点数据
        let pos = new THREE.Vector3(xy.x, xy.y, 40800);
        generateCityFont(item.properties.name, pos);
        scene.add(cityMeshgroup);
        //3.线框
        let pointArr = [];
        point[0].forEach((val) => {
          let xy = lon2xy(val[0], val[1]);
          pointArr.push(xy.x, xy.y, 40800);
        });
        const geometry = new THREE.BufferGeometry(); //创建一个Buffer类型几何体对象
        const vertices = new Float32Array(pointArr);
        const attribue = new THREE.BufferAttribute(vertices, 3); //3个为一组，表示一个顶点的xyz坐标
        geometry.attributes.position = attribue;
        const material = new THREE.LineBasicMaterial({
          color: 0x67cde2, //线条颜色
        });
        const line = new THREE.LineLoop(geometry, material); //首尾顶点连线，轮廓闭合
        cityLineGroup.add(line);
      });
      scene.add(cityLineGroup);
    });
  });
  return cityMeshgroup;
}

export {
  lineGroup,
  MeshGroup,
  countryMesh,
  provinceMesh,
  provinceMeshgroup,
  provinceLinegroup,
  cityMesh,
  cityMeshgroup,
  cityLineGroup,
};
