import * as THREE from "three";
// eslint-disable-next-line no-unused-vars
import * as BufferGeometryUtils from "three/examples/jsm/utils/BufferGeometryUtils";
// eslint-disable-next-line no-unused-vars
import { SimplifyModifier } from "three/examples/jsm/modifiers/SimplifyModifier.js";
import {
  generateFont,
  generateProvinceFont,
  generateCityFont,
} from "../utils/generateFont";
import { generateMap, generateTexture } from "../utils/generateMap";
import { lon2xy } from "../utils/math";
import { scene } from ".";
const loaderfile = new THREE.FileLoader();
loaderfile.setResponseType("json");

//中国
let MeshGroup = new THREE.Group(); //模型组
let lineGroup = new THREE.Group(); //线框组
function countryMesh(name) {
  loaderfile.load(`/BaseModel/${name}.json`, async (data) => {
    data.features.forEach((item) => {
      let simpleGeometry = []; //需要合并的geometry
      let simpleMaterial = []; //需要要合并的materia
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
        // 1.模型
        const shape = new THREE.Shape(pointArry); //传入矢量空间点坐标,生成二维形状平面缓冲几何体。
        shapeArr.push(shape);
        const shapeGeometry = new THREE.ExtrudeGeometry(shapeArr, {
          depth: 400000,
          bevelEnabled: false,
        });
        let shapeMesh = generateMap(shapeGeometry); //生成具有网格体的数组
        simpleGeometry.push(shapeMesh.geometry);
        simpleMaterial.push(shapeMesh.material[0]);
        //2.线框
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
      // 3.合并网格体
      const mergedGeometries = BufferGeometryUtils.mergeGeometries(
        simpleGeometry,
        true
      );
      const singleMergeMesh = generateTexture(mergedGeometries, simpleMaterial); //贴uv贴图
      singleMergeMesh.userData.name = item.properties.name; //为网格体添加名称属性name
      singleMergeMesh.userData.center = lon2xy(
        item.properties.center[0],
        item.properties.center[1]
      );
      MeshGroup.add(singleMergeMesh);
      // 4.地名文字
      let xy = lon2xy(item.properties.centroid[0], item.properties.centroid[1]); //每个网格体自带的中心点数据
      let pos = new THREE.Vector3(xy.x, xy.y, 360000);
      generateFont(item.properties.name, pos);
    });
  });
  //导出gltf
}
//省级
const provinceMeshgroup = new THREE.Group(); //模型组
const provinceLinegroup = new THREE.Group(); //线框组
function provinceMesh(name) {
  loaderfile.load(`/BaseModel/${name}.json`, async (data) => {
    data.features.forEach((item) => {
      let simpleGeometry = []; //需要合并的geometry
      let simpleMaterial = []; //需要要合并的material
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
        simpleGeometry.push(shapeMesh.geometry);
        simpleMaterial.push(shapeMesh.material[0]);
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
      //3.合并模型并贴图
      const mergedGeometries = BufferGeometryUtils.mergeGeometries(
        simpleGeometry,
        true
      );
      const singleMergeMesh = generateTexture(mergedGeometries, simpleMaterial); //uv贴图
      singleMergeMesh.userData.center = lon2xy(
        item.properties.center[0],
        item.properties.center[1]
      ); //添加省会坐标自定义属性
      singleMergeMesh.userData.name = item.properties.name;
      provinceMeshgroup.add(singleMergeMesh);
      //4.地名文字
      let xy = lon2xy(item.properties.centroid[0], item.properties.centroid[1]); //每个网格体自带的中心点数据
      let pos = new THREE.Vector3(xy.x, xy.y, 40800);
      generateProvinceFont(item.properties.name, pos); //生成文字模型
      scene.add(provinceLinegroup);
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
      let simpleGeometry = []; //需要合并的geometry
      let simpleMaterial = []; //需要要合并的material
      if (item.geometry.type === "Polygon") {
        item.geometry.coordinates = [item.geometry.coordinates];
      }
      item.geometry.coordinates.forEach((point) => {
        let pointArry = [];
        let shapeArr = [];
        point[0].forEach((val) => {
          let xy = lon2xy(val[0], val[1]); //转为墨卡托坐标系的坐标
          pointArry.push(new THREE.Vector2(xy.x, xy.y));
        });
        //1.模型
        const shape = new THREE.Shape(pointArry);
        shapeArr.push(shape);
        const ShapeGeometry = new THREE.ExtrudeGeometry(shapeArr, {
          depth: 40000,
          bevelEnabled: false,
        });
        let shapeMesh = generateMap(ShapeGeometry);
        simpleGeometry.push(shapeMesh.geometry);
        simpleMaterial.push(shapeMesh.material[0]);
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
        cityLineGroup.add(line);
      });
      //3.合并模型
      const mergedGeometries = BufferGeometryUtils.mergeGeometries(
        simpleGeometry,
        true
      );
      const singleMergeMesh = generateTexture(mergedGeometries, simpleMaterial); //uv贴图
      singleMergeMesh.userData.center = lon2xy(
        item.properties.center[0],
        item.properties.center[1]
      ); //添加省会坐标自定义属性
      singleMergeMesh.userData.name = item.properties.name;
      cityMeshgroup.add(singleMergeMesh);
      //4.地名文字
      let xy = lon2xy(item.properties.centroid[0], item.properties.centroid[1]); //每个网格体自带的中心点数据
      let pos = new THREE.Vector3(xy.x, xy.y, 40800);
      generateCityFont(item.properties.name, pos);
      scene.add(cityMeshgroup);
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
