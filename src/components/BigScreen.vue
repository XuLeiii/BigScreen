<template>
  <div
    class="box"
    style="width: 100vw; height: 100vh; overflow: hidden; position: relative"
  >
    <div id="container" style="width: 100%; height: 100%; position: absolute">
      <!-- 背景图片 -->
      <img
        src="../../public/img/背景@2x.png"
        alt=""
        style="
          opacity: 1;
          width: 100%;
          height: 100%;
          position: absolute;
          z-index: -2;
        "
      />
      <!-- 开场视频 -->
      <video
        class="video-container"
        ref="myVideo"
        autoplay="autoplay"
        muted
        controls
        style="
          width: 100%;
          height: 100%;
          object-fit: fill;
          opacity: 1;
          z-index: 0;
        "
      >
        <source src="../../public/img/开场动画.mp4" />
      </video>
      <!-- 设备数量信息 -->
      <div
        id="hello"
        style="visibility: hidden; z-index: 5; position: absolute"
      >
        <div class="label">
          <span>4G高清执法记录仪：{{ this.Level().a || 0 }}</span>
          <div class="line1">
            <span>一体化布控球：{{ this.Level().b || 0 }}</span>
          </div>
          <div class="line2">
            <span>手持单兵：{{ this.Level().c || 0 }}</span>
          </div>
          <div class="line3">
            <span>4G车载监控终端：{{ this.Level().d || 0 }}</span>
          </div>
          <div class="angle"></div>
        </div>
      </div>
      <!-- 市级设备样式 -->

      <!-- 定位图标 -->
      <img
        id="arrow"
        src="../../public/img/定位.png"
        alt=""
        style="position: absolute; z-index: 9; visibility: hidden"
      />
      <!-- canvas threejs画布 -->
    </div>
    <!-- 高德地图 -->
    <div
      id="Amap"
      style="
        width: 100vw;
        height: 100vh;
        position: absolute;
        visibility: hidden;
        z-index: -10;
      "
    ></div>
    <!-- <button
      @click="goBack()"
      style="
        position: absolute;
        margin: 30px 0px 0px 50px;
        width: 100px;
        height: 35px;
        font-size: 18px;
        z-index: 2;
      "
    >
      返回上一级
    </button> -->
  </div>
</template>

<script>
import gsap from "gsap";
import { camera, controls, restrictOp } from "@/BaseModel/RenderCamera";
import AMapLoader from "@amap/amap-jsapi-loader";
import { renderer } from "@/BaseModel/RenderLoop";
import { labelRenderer } from "@/BaseModel/utils/tags";
import { scene } from "@/BaseModel/scene";
import {
  fontGroup,
  provinceFontGroup,
  cityFontGroup,
} from "@/BaseModel/utils/generateFont";
// eslint-disable-next-line no-unused-vars
import { choose, chooseMesh, cityCenter } from "@/BaseModel/utils/choose.js";
import {
  MeshGroup,
  lineGroup,
  countryMesh,
  provinceMesh,
  provinceMeshgroup,
  provinceLinegroup,
  cityMesh,
  cityMeshgroup,
  cityLineGroup,
} from "@/BaseModel/scene/mesh";
export default {
  name: "HelloWorld",
  data() {
    return {
      canvasDom: renderer.domElement,
      MapLevel: 1, //地图层级
      isRestrict: true, //是否开启相机限制
      chooseMeshName: null, //选中网格体名称
      provinceData: [], //全部省份设备数据
      currentData: {}, //当前省份的数据
      currentData1: {}, //当前市级的数据
      currentData2: {}, //当前区县的数据
      geodata: {
        type: "FeatureCollection",
        features: [
          {
            type: "Feature",
            properties: {
              type: 0,
              ratio: 0.0369,
              lineWidthRatio: 1,
            },
            geometry: {
              type: "LineString",
              coordinates: [
                [115.482331, 38.867657],
                [85.7970604, 38.8346096],
                // [108.6905470,25.7015323]
              ],
            },
          },
          {
            type: "Feature",
            properties: {
              type: 1,
              ratio: 0.035,
              lineWidthRatio: 0.5,
            },
            geometry: {
              type: "LineString",
              coordinates: [
                [85.7970604, 38.8346096],
                [108.690547, 25.7015323],
              ],
            },
          },
        ],
      },
    };
  },
  methods: {
    //判断层级并返回对应层级的数据信息
    Level() {
      if (this.MapLevel === 1) {
        return this.currentData;
      } else if (this.MapLevel === 2) {
        return this.currentData1;
      } else {
        return this.currentData2;
      }
    },
    // 模拟接收xxx
    reciveData(data) {
      this.provinceData = data;
    },
    //初始化高德地图
    initMap(cityCenter) {
      AMapLoader.load({
        key: "d1bd5fd8efed0733ce7a296af76eb4c8", // 申请好的Web端开发者Key，首次调用 load 时必填
        version: "2.0", // 指定要加载的 JSAPI 的版本，缺省时默认为 1.4.15
        plugins: [""], // 需要使用的的插件列表，如比例尺'AMap.Scale'等
        Loca: {
          version: "2.0.0",
        },
      })
        .then((AMap) => {
          /* eslint-disable */
          let map = new AMap.Map("Amap", {
            //设置地图容器id
            mapStyle: "amap://styles/blue", //设置地图的显示样式
            viewMode: "3D", //是否为3D地图模式
            zoom: 18, //初始化地图级别
            pitch: 80, // 地图倾斜
            center: [cityCenter.longitude, cityCenter.latitude], //初始化地图中心点位置
          });
          let loca = new window.Loca.Container({
            map: map,
          });

          // 弧线
          var pulseLink = new window.Loca.PulseLinkLayer({
            // loca,
            zIndex: 10,
            opacity: 1,
            visible: true,
            zooms: [2, 22],
            depth: true,
          });

          // var geo = new window.Loca.GeoJSONSource({
          //   url: "https://a.amap.com/Loca/static/loca-v2/demos/mock_data/data-line-out.json",
          // });
          // [117.2724232, 31.8571347],
          // [115.8743238, 32.8744899],
          var geo = new window.Loca.GeoJSONSource({
            data: this.geodata,
          });

          pulseLink.setSource(geo);
          pulseLink.setStyle({
            unit: "meter",
            // dash: [40000, ],
            lineWidth: function () {
              return [20000, 20000];
            },
            height: function (index, feat) {
              return feat.distance / 3 + 10;
            },
            // altitude: 1000,
            smoothSteps: 30,
            speed: function (index, prop) {
              return 1000 + Math.random() * 200000;
            },
            flowLength: 50000,
            lineColors: function (index, feat) {
              return [
                "rgb(255,228,105)",
                "rgb(255,164,105)",
                "rgba(1, 34, 249,1)",
              ];
            },
            maxHeightScale: 0.3, // 弧顶位置比例
            headColor: "rgba(255, 255, 0, 1)",
            trailColor: "rgba(255, 255,0,0)",
          });
          loca.add(pulseLink);
          loca.animate.start();

          var dat = new window.Loca.Dat();
          dat.addLayer(pulseLink);
        })
        .catch((e) => {
          console.log(e);
        });
    },
    //初始化画布
    initCanvas() {
      renderer.domElement.style.position = "absolute";
      renderer.domElement.style.zIndex = -1;
      this.canvasDom.style.opacity = 1;
      document.getElementById("container").appendChild(renderer.domElement); //设置canvas图层属性并插入节点中
      labelRenderer.domElement.style.zIndex = 3;
      document
        .getElementById("container")
        .appendChild(labelRenderer.domElement); //设置标签图层属性并插入节点中
    },
    //相机位置自适应
    cameraPosition() {
      camera.position.set(
        chooseMesh.geometry.boundingSphere.center.x,
        -((chooseMesh.geometry.boundingSphere.center.y * 10) / 3),
        chooseMesh.geometry.boundingSphere.radius * 105
      );
      controls.target.set(
        chooseMesh.geometry.boundingSphere.center.x,
        chooseMesh.geometry.boundingSphere.center.y,
        20000
      );
    },
    //中国地图跳转省级
    switchProvince() {
      const self = this;
      document.getElementById("arrow").style.visibility = "hidden"; //隐藏箭头
      document.getElementById("hello").style.visibility = "hidden"; //隐藏设备标签
      if (chooseMesh) {
        self.MapLevel = 2; //修改地图层级
        window.onclick = null; //移除中国地图单击事件
        window.ondblclick = null; //移除中国地图双击事件
        //相机拉近
        let tween1 = gsap.to([camera.position, this.canvasDom.style], {
          z: 250000000,
          opacity: 0,
          duration: 1,
          ease: "none",
          onComplete: async function () {
            tween1.kill();
            tween1 = null;
            await self.clearChina(); //清空中国地图占用的内存
            setTimeout(function () {
              self.canvasDom.style.opacity = 1;
            }, 10);
            provinceMesh(self.chooseMeshName); /////////加载省会地图卡不卡关键在这
            restrictOp(!this.isRestrict, self.MapLevel); //启用角度缩放限制
            //调整相机位置与目标点位置
            self.cameraPosition();
            //绑定省级地图的单击监听事件，拾取网格体。

            window.onclick = (e) => {
              self.chooseMeshName = choose(e, provinceMeshgroup, self.MapLevel);
              self.currentData1 = self.currentData.children.find((val) => {
                return val.name === self.chooseMeshName;
              });
              if (self.currentData1 === undefined) {
                self.currentData1 = 0;
              }
            };
            //绑定省级地图的双击监听事件，下钻市区。
            window.ondblclick = () => {
              if (!self.currentData1) {
                return;
              } else {
                self.switchCity();
              }
            };
          },
        });
      } else {
        return;
      }
    },
    //省级跳转市级
    switchCity() {
      const self = this;
      if (chooseMesh) {
        this.MapLevel = 3;
        window.onclick = null; //移除安徽地图的单击事件
        window.ondblclick = null; //移除安徽地图的双击事件
        //相机拉近
        let tween1 = gsap.to([camera.position, this.canvasDom.style], {
          z: 10000000,
          opacity: 0,
          duration: 1,
          ease: "none",
          onComplete: () => {
            tween1.kill();
            tween1 = null;
            self.clearProvince(); //清空省级网格体
            setTimeout(function () {
              self.canvasDom.style.opacity = 1;
            }, 10);
            cityMesh(self.chooseMeshName); //生成市级网格体
            restrictOp(this.isRestrict, self.MapLevel); //启用角度缩放限制
            //调整相机位置与目标点位置
            self.cameraPosition();
            //绑定市级地图单击事件
            window.onclick = (e) => {
              self.chooseMeshName = choose(e, cityMeshgroup, this.MapLevel);
              self.currentData2 = self.currentData1.children.find((val) => {
                return val.name === self.chooseMeshName;
              });
              if (self.currentData2 === undefined) {
                self.currentData2 = 0;
              }
            };
            //绑定市级地图双击事件
            window.ondblclick = () => {
              if (!self.currentData2) {
                return;
              } else {
                self.switchArea();
              }
            };
          },
        });
        document.getElementById("arrow").style.visibility = "hidden"; //隐藏箭头
        document.getElementById("hello").style.visibility = "hidden"; //隐藏设备标签
      } else {
        return;
      }
    },
    //市级跳转高德
    switchArea() {
      const self = this;
      document.getElementById("arrow").style.visibility = "hidden"; //隐藏箭头
      document.getElementById("hello").style.visibility = "hidden"; //隐藏设备标签
      if (chooseMesh) {
        this.MapLevel = 4;
        window.onclick = null; //移除市级地图的单击事件
        window.ondblclick = null; //移除市级地图的双击事件
        let tween1 = gsap.to([camera.position, this.canvasDom.style], {
          z: 10000000,
          opacity: 0,
          duration: 1,
          ease: "none",
          onComplete: async function () {
            tween1.kill();
            tween1 = null;
            await self.clearCity(); //清空市级网格体、字体
            setTimeout(function () {
              self.canvasDom.style.opacity = 1;
            }, 1000);
            self.initMap(cityCenter);
            const dom = document.getElementById("Amap");
            dom.style.visibility = "visible";
            dom.style.zIndex = 50;
          },
        });
      } else {
        return;
      }
    },
    //清空中国网格体、字体
    clearChina() {
      //清空网格体组(未清除dom标签)
      MeshGroup.traverse((item) => {
        if (item.type === "Mesh") {
          item.geometry.dispose();
          item.material[0].dispose();
          // item.material[1].dispose();
        }
      });
      scene.remove(MeshGroup);
      // MeshGroup = null;
      //清空线框
      lineGroup.traverse((item) => {
        if (item.type === "Mesh") {
          item.geometry.dispose();
          item.material.dispose();
        }
      });
      scene.remove(lineGroup);
      //清空字体
      fontGroup.traverse((item) => {
        if (item.type === "Mesh") {
          item.geometry.dispose();
          item.material[0].dispose();
          item.material[1].dispose();
        }
      });
      scene.remove(fontGroup);
      const tagarr = document.getElementsByClassName("tag");
      while (tagarr.length > 0) {
        tagarr[0].remove();
      }
    },
    //清空省级网格体、字体
    clearProvince() {
      provinceMeshgroup.traverse((item) => {
        if (item.type === "Mesh") {
          item.geometry.dispose();
          item.material[0].dispose();
          // item.material[1].dispose();
        }
      });
      scene.remove(provinceMeshgroup);
      //清空线框
      provinceLinegroup.traverse((item) => {
        if (item.type === "Mesh") {
          item.geometry.dispose();
          item.material.dispose();
        }
      });
      scene.remove(provinceLinegroup);
      //清空字体
      provinceFontGroup.traverse((item) => {
        if (item.type === "Mesh") {
          item.geometry.dispose();
          item.material[0].dispose();
          item.material[1].dispose();
        }
      });
      scene.remove(provinceFontGroup);
      const tagarr = document.getElementsByClassName("tag");
      while (tagarr.length > 0) {
        tagarr[0].remove();
      }
    },
    //清空市级网格体、字体
    clearCity() {
      cityMeshgroup.traverse((item) => {
        if (item.type === "Mesh") {
          item.geometry.dispose();
          item.material[0].dispose();
          // item.material[1].dispose();
        }
      });
      scene.remove(cityMeshgroup);
      //清空线框
      cityLineGroup.traverse((item) => {
        if (item.type === "Mesh") {
          item.geometry.dispose();
          item.material.dispose();
        }
      });
      scene.remove(cityLineGroup);
      //清空字体
      cityFontGroup.traverse((item) => {
        if (item.type === "Mesh") {
          item.geometry.dispose();
          item.material[0].dispose();
          item.material[1].dispose();
        }
      });
      scene.remove(cityFontGroup);
      const tagarr = document.getElementsByClassName("tag");
      while (tagarr.length > 0) {
        tagarr[0].remove();
      }
    },
    //返回上一级事件
    //1：中国，2：省，3：市，4：区
    // goBack() {
    //   if (this.MapLevel === 1) {
    //     //生成中国
    //     //清空省、市、区
    //     console.log("中国");
    //   } else if (this.MapLevel === 2) {
    //     //生成省,绑定省的单双击事件，解绑市的单双击事件
    //     //清空市、区
    //     console.log("省份");
    //   } else if (this.MapLevel === 3) {
    //     //生成市
    //     //隐藏高德区图
    //     console.log("市");
    //   } else {
    //     console.log("区");
    //   }
    // },
  },
  mounted() {
    const self = this;
    const myVideo = this.$refs.myVideo;
    this.initCanvas(); //初始化Canvas画布
    //监听开场动画结束
    myVideo.addEventListener("ended", () => {
      //开场动画半透明消失
      let tween1 = gsap.to(myVideo, {
        opacity: 0,
        duration: 1,
        onComplete: function () {
          tween1.kill();
          tween1 = null;
          countryMesh("中国"); //生成中国地图
          renderer.domElement.style.zIndex = 1;
          myVideo.parentNode.removeChild(myVideo); //移除video节点
          //单击显示省会设备标签
          window.onclick = (e) => {
            self.chooseMeshName = choose(e, MeshGroup, self.MapLevel);
            self.currentData = self.provinceData.find((val) => {
              return val.name === self.chooseMeshName;
            });
            if (self.currentData === undefined) {
              self.currentData = 0;
            }
          };
          //双击跳转省会界面立体图
          window.ondblclick = () => {
            if (!self.currentData) {
              return;
            } else {
              self.switchProvince();
            }
          };
          //进场动画
          let tween2 = gsap.to(camera.position, {
            z: 302228637,
            y: -170312569,
            x: 5851739,
            duration: 1,
            ease: "none",
            onStart: () => {
              restrictOp(!this.isRestrict, self.MapLevel); //禁用角度限制
              // {x: 5851739.247058666, y: -170312569.5972976, z: 302228637.66853005,
            },
            onComplete: () => {
              tween2.kill();
              tween2 = null;
              restrictOp(this.isRestrict, self.MapLevel); //启用角度缩放限制
            },
          });
        },
      });
    });
    //模拟客户端调用数据
    let mockData = [
      {
        name: "安徽",
        a: 10,
        b: 10,
        c: 10,
        d: 10,
        children: [
          {
            name: "合肥市",
            a: 2,
            b: 2,
            c: 1,
            d: 1,
            children: [
              {
                name: "蜀山区",
                a: 2,
                b: 0,
                c: 0,
                d: 0,
                deviceName: [
                  {
                    name: "设备a",
                    position: [30.0, 36.0],
                  },
                  {
                    name: "设备b",
                    position: [30.0, 36.0],
                  },
                ],
              },
              {
                name: "巢湖市",
                a: 0,
                b: 2,
                c: 0,
                d: 0,
                deviceName: [
                  {
                    name: "设备a",
                    position: [30.0, 36.0],
                  },
                  {
                    name: "设备b",
                    position: [30.0, 36.0],
                  },
                ],
              },
              {
                name: "肥西县",
                a: 0,
                b: 0,
                c: 1,
                d: 0,
                deviceName: [
                  {
                    name: "设备c",
                    position: [30.0, 36.0],
                  },
                ],
              },
              {
                name: "庐江县",
                a: 0,
                b: 0,
                c: 0,
                d: 1,
                deviceName: [
                  {
                    name: "设备d",
                    position: [30.0, 36.0],
                  },
                ],
              },
            ],
          },
          {
            name: "阜阳市",
            a: 99,
            b: 88,
            c: 77,
            d: 66,
            children: [
              {
                name: "颍上县",
                a: 2,
                b: 0,
                c: 0,
                d: 0,
                deviceName: [
                  {
                    name: "设备a",
                    position: [30.0, 36.0],
                  },
                ],
              },
            ],
          },
        ],
      },
      {
        name: "四川",
        a: 233,
        b: 233,
        c: 233,
        d: 233,
        children: [
          {
            name: "成都市",
            a: 133,
            b: 133,
            c: 133,
            d: 133,
            children: [
              {
                name: "金牛区",
                a: 133,
                b: 133,
                c: 133,
                d: 133,
                deviceName: [
                  {
                    name: "设备a",
                    position: [30.0, 36.0],
                  },
                ],
              },
            ],
          },
          {
            name: "乐山市",
            a: 1,
            b: 2,
            c: 3,
            d: 4,
            children: [
              {
                name: "沙湾区",
                a: 1,
                b: 2,
                c: 3,
                d: 4,
                deviceName: [
                  {
                    name: "设备a",
                    position: [30.0, 36.0],
                  },
                ],
              },
            ],
          },
        ],
      },
    ];
    this.reciveData(mockData);

    window.HOME = {
      reciveData: this.reciveData,
    };
    // 1.接收设备数据
    // reciveData(data)
    //data:Array
    //name:String
    //a,b,c,d:Number
    //children:Array
    //2.参考数据
    // data: [
    //   {
    //     name: "xx省",
    //     a: 22,
    //     b: 33,
    //     c: 44,
    //     d: 55,
    //     children: [
    //       {
    //         name: "xx市",
    //         a: 22,
    //         b: 33,
    //         c: 44,
    //         d: 55,
    //         children: [
    //           {
    //             name: "xx区",
    //             a: 22,
    //             b: 33,
    //             c: 44,
    //             d: 55,
    //             deviceName: [
    //               {
    //                 name: "设备a",
    //                 position: [30.0, 36.0],
    //               },
    //             ],
    //           },
    //         ],
    //       },
    //     ],
    //   },
    // ];
    // window.window_external.JS_funtionName('111')客户端调用网页
  },
};
</script>
<style scoped>
#hello {
  width: 100px;
  height: 100px;
  position: absolute;
  background-color: pink;
}
.label {
  width: 155px;
  height: 113px;
  background: linear-gradient(
    180deg,
    rgba(41, 122, 243, 0.95) 27%,
    #033c90 100%
  );
  border-radius: 0px 0px 0px 0px;
  opacity: 1;
  border: 1px solid;
  border-image: linear-gradient(
      180deg,
      rgba(6, 234, 249, 1),
      rgba(6, 190, 249, 0),
      rgba(6, 249, 234, 1)
    )
    1 1;
}

.line1 {
  position: absolute;
  margin-top: 28.25px;
  width: 144px;
  height: 1px;
  background: linear-gradient(
    270deg,
    rgba(69, 144, 255, 0) 0%,
    #4590ff 54%,
    rgba(69, 144, 255, 0) 100%
  );
  border-radius: 0px 0px 0px 0px;
  opacity: 1;
}

.line2 {
  position: absolute;
  margin-top: 56.5px;
  width: 144px;
  height: 1px;
  background: linear-gradient(
    270deg,
    rgba(69, 144, 255, 0) 0%,
    #4590ff 54%,
    rgba(69, 144, 255, 0) 100%
  );
  border-radius: 0px 0px 0px 0px;
  opacity: 1;
}

.line3 {
  position: absolute;
  margin-top: 84.75px;
  width: 144px;
  height: 1px;
  background: linear-gradient(
    270deg,
    rgba(69, 144, 255, 0) 0%,
    #4590ff 54%,
    rgba(69, 144, 255, 0) 100%
  );
  border-radius: 0px 0px 0px 0px;
  opacity: 1;
}
span {
  position: absolute;
  width: 150px;
  margin: 10px 0px 0px 13px;
  color: #ffffff;
  /* transform: scale(0.7); */
  /* transform-origin: left top; */
  font-size: 12px;
  font-weight: 50;
}
.angle {
  width: 0px;
  height: 0px;
  border-top: 12px solid #06bef9;
  border-right: 12px solid transparent;
  /* box-shadow: 0px 0px 6px 0px #02536C; */
  opacity: 1;
}
</style>
