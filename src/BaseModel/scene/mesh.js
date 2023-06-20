import * as THREE from "three";
import * as BufferGeometryUtils from "three/examples/jsm/utils/BufferGeometryUtils";
// eslint-disable-next-line no-unused-vars
import {
  generateFont,
  generateAnhuiFont,
  generateCityFont,
} from "../utils/generateFont";
import { generateMap } from "../utils/generateMap";
import { lon2xy } from "../utils/math";
import { scene } from ".";

let level = null; //地图层级
//中国
let lineGroup = new THREE.Group(); //线框组
const loaderfile = new THREE.FileLoader();
loaderfile.setResponseType("json");
//线框
loaderfile.load("/BaseModel/中华人民共和国.json", async (data) => {
  level = 1;
  console.log(level);
  data.features.forEach((item) => {
    let lineArry = [];
    if (item.geometry.type === "Polygon") {
      item.geometry.coordinates = [item.geometry.coordinates];
    }
    item.geometry.coordinates[0][0].forEach((val) => {
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
//模型
let MeshGroup = new THREE.Group();
loaderfile.load("/BaseModel/123.json", async (data) => {
  data.features.forEach((item) => {
    let pointArry = []; //点数组
    let shapeArr = []; //形状数组
    if (item.geometry.type === "Polygon") {
      item.geometry.coordinates = [item.geometry.coordinates];
    }
    //单独生成河北省飞地
    let texture = [];
    if (item.properties.name === "河北") {
      let mesharr = []; //用于合并网格体
      for (let i = 0; i < 4; i++) {
        let pointArry = []; //点数组
        let shapeArr = []; //形状数组
        item.geometry.coordinates[i][0].forEach((val) => {
          let xy = lon2xy(val[0], val[1]);
          pointArry.push(new THREE.Vector2(xy.x, xy.y)); //vector2是对象格式；[{},{},{}]
        });
        const shape = new THREE.Shape(pointArry);
        shapeArr.push(shape);
        const shapeGeometry = new THREE.ExtrudeGeometry(shapeArr, {
          depth: 400000,
          bevelEnabled: false,
        });
        //设置uv并贴图
        let pos = shapeGeometry.attributes.position; //网格体的轮廓的点的坐标
        // box3Compute(shapeGeometry);
        let count = pos.count;
        let xwidth = 713224;
        let ywidth = 946278;
        let xmin = 12630879;
        let ymin = 4307800;
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
        texture = new THREE.TextureLoader().load("/BaseModel/hebei.png");
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        texture.repeat.set(1, 1);
        mesharr.push(shapeGeometry);
      }
      let mergedGeometries = BufferGeometryUtils.mergeGeometries(mesharr, true);
      const upMaterial = new THREE.MeshLambertMaterial({
        color: 0x00a2ff,
        map: texture,
        side: THREE.DoubleSide,
      });

      //拉伸二维平面,并添加材质
      const mesh = new THREE.Mesh(mergedGeometries, [
        upMaterial,
        upMaterial,
        upMaterial,
        upMaterial,
      ]);
      MeshGroup.add(mesh);
      return;
    }
    //单独生成南海九段线
    if (item.properties.name === "南海") {
      const upMaterial = new THREE.MeshLambertMaterial({
        color: 0x00a2ff,
        side: THREE.DoubleSide,
      });
      const sideMaterial = new THREE.MeshLambertMaterial({
        color: 0x00a2ff,
        side: THREE.DoubleSide,
      });
      for (let i = 0; i < 10; i++) {
        let pointArry = []; //点数组
        let shapeArr = []; //形状数组
        item.geometry.coordinates[i][0].forEach((val) => {
          let xy = lon2xy(val[0], val[1]);
          pointArry.push(new THREE.Vector2(xy.x, xy.y));
        });
        const shape = new THREE.Shape(pointArry);
        shapeArr.push(shape);
        const shapeGeometry = new THREE.ExtrudeGeometry(shapeArr, {
          depth: 360000,
          bevelEnabled: false,
        });
        //拉伸二维平面,并添加材质
        const shapeMesh = new THREE.Mesh(shapeGeometry, [
          upMaterial,
          sideMaterial,
        ]);
        MeshGroup.add(shapeMesh);
      }
      return;
    }
    item.geometry.coordinates[0][0].forEach((val) => {
      let xy = lon2xy(val[0], val[1]);
      pointArry.push(new THREE.Vector2(xy.x, xy.y));
    });
    const shape = new THREE.Shape(pointArry); //传入矢量空间点坐标,生成二维形状平面。
    shapeArr.push(shape);
    const shapeGeometry = new THREE.ExtrudeGeometry(shapeArr, {
      depth: 400000,
      bevelEnabled: false,
    });

    //生成具有网格体的数组
    let shapeMesh = generateMap(shapeGeometry);
    //为网格体添加中心坐标属性center
    shapeMesh.userData.center = lon2xy(
      item.properties.center[0],
      item.properties.center[1]
    );
    MeshGroup.add(shapeMesh);
    //地名文字
    let xy = lon2xy(item.properties.centroid[0], item.properties.centroid[1]); //每个网格体自带的中心点数据
    let pos = new THREE.Vector3(xy.x, xy.y, 360000);
    generateFont(item.properties.name, pos);
  });
});

//安徽
const anhuiMeshgroup = new THREE.Group(); //模型组
const anhuiLinegroup = new THREE.Group(); //线框组
function anhuiMesh(level) {
  level = 2;
  console.log(level);
  //线框
  loaderfile.load("/BaseModel/安徽省.json", async (data) => {
    data.features.forEach(async (item) => {
      let pointArr = [];
      if (item.geometry.type === "Polygon") {
        item.geometry.coordinates = [item.geometry.coordinates];
      }
      const coordinatesArr = item.geometry.coordinates[0][0];
      await coordinatesArr.forEach((item) => {
        let xy = lon2xy(item[0], item[1]);
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
      anhuiLinegroup.add(line);
    });
    scene.add(anhuiLinegroup);
  });
  //模型
  loaderfile.load("/BaseModel/安徽省.json", async (data) => {
    data.features.forEach(async (item) => {
      let vector2Arr = [];
      let shapeArr = [];
      const coordinatesArr = item.geometry.coordinates[0][0];
      await coordinatesArr.forEach((item) => {
        let xy = lon2xy(item[0], item[1]);
        vector2Arr.push(new THREE.Vector2(xy.x, xy.y));
      });
      const shape = new THREE.Shape(vector2Arr);
      shapeArr.push(shape);
      const ShapeGeometry = new THREE.ExtrudeGeometry(shapeArr, {
        depth: 40000,
        bevelEnabled: false,
      });
      let shapeMesh = generateMap(ShapeGeometry);
      //为网格体添加中心坐标属性center
      shapeMesh.userData.center = item.properties.center;
      anhuiMeshgroup.add(shapeMesh);
      //地名文字
      let xy = lon2xy(item.properties.centroid[0], item.properties.centroid[1]); //每个网格体自带的中心点数据
      console.log("xy", xy);
      let pos = new THREE.Vector3(xy.x, xy.y, 40800);
      generateAnhuiFont(item.properties.name, pos);
      scene.add(anhuiMeshgroup);
    });
  });
  return anhuiMeshgroup;
}
//
const cityMeshgroup = new THREE.Group();
const cityLineGroup = new THREE.Group();
function cityMesh(level) {
  level = 2;
  console.log(level);
  //模型
  loaderfile.load("/BaseModel/合肥市.json", async (data) => {
    data.features.forEach(async (item) => {
      let vector2Arr = [];
      let shapeArr = [];
      const coordinatesArr = item.geometry.coordinates[0][0];
      await coordinatesArr.forEach((item) => {
        let xy = lon2xy(item[0], item[1]);
        vector2Arr.push(new THREE.Vector2(xy.x, xy.y));
      });
      const shape = new THREE.Shape(vector2Arr);
      shapeArr.push(shape);
      const ShapeGeometry = new THREE.ExtrudeGeometry(shapeArr, {
        depth: 40000,
        bevelEnabled: false,
      });
      let shapeMesh = generateMap(ShapeGeometry);
      //为网格体添加中心坐标属性center
      shapeMesh.userData.center = item.properties.center;
      cityMeshgroup.add(shapeMesh);
      //地名文字
      let xy = lon2xy(item.properties.centroid[0], item.properties.centroid[1]); //每个网格体自带的中心点数据
      console.log("xy", xy);
      let pos = new THREE.Vector3(xy.x, xy.y, 40800);
      generateCityFont(item.properties.name, pos);
      scene.add(cityMeshgroup);
    });
  });
  //线框
  loaderfile.load("/BaseModel/合肥市.json", async (data) => {
    data.features.forEach(async (item) => {
      let pointArr = [];
      if (item.geometry.type === "Polygon") {
        item.geometry.coordinates = [item.geometry.coordinates];
      }
      const coordinatesArr = item.geometry.coordinates[0][0];
      await coordinatesArr.forEach((item) => {
        let xy = lon2xy(item[0], item[1]);
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
  return cityMeshgroup;
}

export {
  lineGroup,
  MeshGroup,
  anhuiMesh,
  anhuiMeshgroup,
  anhuiLinegroup,
  cityMesh,
  cityMeshgroup,
  cityLineGroup,
  level,
};
