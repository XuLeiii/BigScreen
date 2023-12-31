import * as THREE from "three";
import { FontLoader } from "three/addons/loaders/FontLoader.js";
import { TextGeometry } from "three/addons/geometries/TextGeometry.js";
//传入要生成的字和字体的位置
let provinceFontGroup = new THREE.Group();
let cityFontGroup = new THREE.Group();
let fontGroup = new THREE.Group();
/**
 * 生成地图上省会名字的网格体
 * @param {String} fontContent 文字名称
 * @param {Object} fontPosition 省会中心坐标
 */
function generateFont(fontContent, fontPosition) {
  const textLoader = new FontLoader();
  textLoader.load("/Fonts/DengXian_Bold_name.json", function (font) {
    let text = new TextGeometry(fontContent, {
      font: font,
      size: 100000,
      height: 100000,
      curveSegments: 1,
    });
    let textmaterial1 = new THREE.MeshBasicMaterial({
      // wireframe: true,
      color: 0xffffff,
    });
    let textmaterial2 = new THREE.MeshBasicMaterial({
      // wireframe: true,
      color: 0x0070ff,
    });
    text.translate(-90000, 0, 0);
    let textMesh = new THREE.Mesh(text, [textmaterial1, textmaterial2]);
    textMesh.position.copy(fontPosition);
    fontGroup.add(textMesh);
    return fontGroup;
  });
}

function generateProvinceFont(fontContent, fontPosition) {
  const textLoader = new FontLoader();
  textLoader.load("/Fonts/DengXian_Bold_name.json", function (font) {
    let text = new TextGeometry(fontContent, {
      font: font,
      size: 15000,
      height: 10000,
      curveSegments: 1,
    });
    let textmaterial1 = new THREE.MeshBasicMaterial({
      color: 0xffffff,
    });
    let textmaterial2 = new THREE.MeshBasicMaterial({
      color: 0x0070ff,
    });
    text.translate(-25000, 0, 0);
    let textMesh = new THREE.Mesh(text, [textmaterial1, textmaterial2]);
    textMesh.position.copy(fontPosition);
    provinceFontGroup.add(textMesh);
    return provinceFontGroup;
  });
}

function generateCityFont(fontContent, fontPosition) {
  const textLoader = new FontLoader();
  textLoader.load("/Fonts/DengXian_Bold_name.json", function (font) {
    let text = new TextGeometry(fontContent, {
      font: font,
      size: 4000,
      height: 5000,
      curveSegments: 1,
    });
    let textmaterial1 = new THREE.MeshBasicMaterial({
      color: 0xffffff,
    });
    let textmaterial2 = new THREE.MeshBasicMaterial({
      color: 0x0070ff,
    });
    text.translate(-8000, 0, 0);
    let textMesh = new THREE.Mesh(text, [textmaterial1, textmaterial2]);
    textMesh.position.copy(fontPosition);
    cityFontGroup.add(textMesh);
    return cityFontGroup;
  });
}
export {
  fontGroup,
  cityFontGroup,
  provinceFontGroup,
  generateFont,
  generateProvinceFont,
  generateCityFont,
};
