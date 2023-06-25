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
      <!-- 设备信息 -->
      <div
        id="hello"
        style="visibility: hidden; z-index: 5; position: absolute"
      >
        <div class="label">
          <span>4G高清执法记录仪：1</span>
          <div class="line1"><span>一体化布控球：2</span></div>
          <div class="line2"><span>手持单兵：3</span></div>
          <div class="line3"><span>4G车载监控终端：4</span></div>
          <div class="angle"></div>
        </div>
      </div>
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
    <button
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
    </button>
  </div>
</template>

<script>
import gsap from "gsap";
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
import { camera, controls, restrictOp } from "@/BaseModel/RenderCamera";
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
      city: null,
      clcikTimer: null,
      handleclick: null,
      handerDblclick: null,
      p: [],
      currentData: {},
    };
  },
  methods: {
    // 接收xxx
    recive(data) {
      let mockData = [
        {
          name: "安徽省",
          a: 1,
          b: 2,
          c: 3,
          d: 4,
          children: [
            {
              name: "合肥市",
              a: 1,
              b: 2,
              c: 3,
              d: 4,
              children: [
                {
                  deviceName: "设备1",
                  // position:[30.000,36.00],
                  lontitude: 1111,
                  latitude: 222,
                  // xx: xxx,
                },
              ],
            },
          ],
        },
      ];
      console.log(mockData);
      console.log(data);
      this.p = data;
    },
    /**
     *
     * @param {number} params
     */
    dilaog(params) {
      this.MapLevel = params;
    },

    click() {
      let p_name = "anhui";
      let d = this.p.find((_p) => _p.name == p_name);
      this.currentData = d;
    },
    //初始化高德地图
    initMap(cityCenter) {
      AMapLoader.load({
        key: "d1bd5fd8efed0733ce7a296af76eb4c8", // 申请好的Web端开发者Key，首次调用 load 时必填
        version: "2.0", // 指定要加载的 JSAPI 的版本，缺省时默认为 1.4.15
        plugins: [""], // 需要使用的的插件列表，如比例尺'AMap.Scale'等
      })
        .then((AMap) => {
          this.map = new AMap.Map("Amap", {
            //设置地图容器id
            viewMode: "3D", //是否为3D地图模式
            zoom: 11, //初始化地图级别
            center: [cityCenter[0], cityCenter[1]], //初始化地图中心点位置
          });
        })
        .catch((e) => {
          console.log(e);
        });
    },
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
    //中国地图拾取事件
    chooseEvent(e) {
      choose(e, MeshGroup, this.MapLevel);
    },
    //省级地图拾取事件
    provinceChoose(e) {
      choose(e, provinceMeshgroup, this.MapLevel);
    },
    //市级地图拾取事件
    cityChoose(e) {
      choose(e, cityMeshgroup, this.MapLevel);
    },
    //中国地图跳转省级
    switchProvince() {
      const self = this;
      document.getElementById("arrow").style.visibility = "hidden"; //隐藏箭头
      document.getElementById("hello").style.visibility = "hidden"; //隐藏设备标签
      if (chooseMesh) {
        self.MapLevel = 2; //修改地图层级
        window.removeEventListener("click", self.handleclick); //移除中国地图单击事件
        window.removeEventListener("dblclick", self.handerDblclick); //移除中国地图双击事件
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
            provinceMesh(); /////////加载省会地图卡不卡关键在这
            restrictOp(!this.isRestrict, self.MapLevel); //启用角度缩放限制
            ///////可以抽离方法，先写死。
            camera.position.set(12812204, -17631082, 45185250); //调整相机位置在省份正前方
            controls.target.set(13030745, 3771289, 20000); //调整相机指向到省份中心
            window.addEventListener("click", self.provinceChoose); //绑定省级地图的单击监听事件，拾取网格体。
            window.addEventListener("dblclick", self.switchCity); //绑定省级地图的双击监听事件，下钻市区。
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
        window.removeEventListener("click", self.provinceChoose); //移除安徽地图的单击事件
        window.removeEventListener("dblclick", self.cityChoose); //移除安徽地图的双击事件
        //相机拉近
        let tween1 = gsap.to([camera.position, this.canvasDom.style], {
          z: 10000000,
          opacity: 0,
          duration: 1,
          ease: "none",
          onComplete: async () => {
            tween1.kill();
            tween1 = null;
            await self.clearProvince(); //清空省级网格体
            setTimeout(function () {
              self.canvasDom.style.opacity = 1;
            }, 10);
            cityMesh(); //生成市级网格体
            restrictOp(this.isRestrict, self.MapLevel); //启用角度缩放限制
            ///////可以抽离方法，先写死。
            camera.position.set(13117704, -1032688, 16476457); //调整相机位置在市区正前方
            controls.target.set(13030745, 3771289, 20000); //调整相机指向市区中心
            window.addEventListener("click", self.cityChoose); //绑定市级地图单击事件
            window.addEventListener("dblclick", self.switchArea); //绑定市级地图双击事件
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
      if (chooseMesh) {
        this.MapLevel = 4;
        window.removeEventListener("click", self.provinceChoose); //移除市级地图的单击事件
        window.removeEventListener("dblclick", self.cityChoose); //移除市级地图的双击事件
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
      console.log("clear1111111111");
      //清空网格体组(未清除dom标签)
      MeshGroup.traverse((item) => {
        if (item.type === "Mesh") {
          item.geometry.dispose();
          item.material[0].dispose();
          item.material[1].dispose();
        }
      });
      scene.remove(MeshGroup);
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
          item.material[1].dispose();
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
          item.material[1].dispose();
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
    goBack() {
      if (this.MapLevel === 1) {
        //生成中国
        //清空省、市、区
        console.log("中国");
      } else if (this.MapLevel === 2) {
        //生成省,绑定省的单双击事件，解绑市的单双击事件
        //清空市、区
        console.log("省份");
      } else if (this.MapLevel === 3) {
        //生成市
        //隐藏高德区图
        console.log("市");
      } else {
        console.log("区");
      }
    },
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
          countryMesh(); //生成中国地图
          renderer.domElement.style.zIndex = 1;
          myVideo.parentNode.removeChild(myVideo); //移除video节点
          //单击显示省会设备标签
          self.handleclick = (e) => {
            // if (self.clcikTimer) {
            //   clearTimeout(self.clcikTimer);
            //   self.clcikTimer = null;
            // } else {
            //   self.clcikTimer = setTimeout(() => {
            //     self.chooseEvent(e);
            //     console.log("单击事件");
            //   }, 200);
            // }
            self.clcikTimer = setTimeout(() => {
              self.chooseEvent(e);
              console.log("单击事件");
            }, 10);
          };
          window.addEventListener("click", self.handleclick);
          //双击跳转省会界面立体图
          self.handerDblclick = () => {
            clearTimeout(self.clcikTimer);
            console.log("双击事件");
            self.switchProvince();
          };
          window.addEventListener("dblclick", self.handerDblclick);
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
              console.log(camera.position);
            },
          });
        },
      });
    });

    let mockData = [{ name: "安徽省", a: 1, b: 2, c: 3, d: 4 }];
    this.recive(mockData);
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
