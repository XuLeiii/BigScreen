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
          z-index: -1;
        "
      />
      <!-- 开场视频 -->
      <video
        class="video-container"
        ref="myVideo"
        autoplay="autoplay"
        muted
        controls
        style="width: 100%; height: 100%; object-fit: fill; opacity: 1"
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
  </div>
</template>

<script>
// eslint-disable-next-line no-unused-vars
import AMapLoader from "@amap/amap-jsapi-loader";
import { renderer } from "@/BaseModel/RenderLoop";
import { choose, chooseMesh, cityCenter } from "@/BaseModel/utils/choose.js";
import { labelRenderer } from "@/BaseModel/utils/tags";
import gsap from "gsap";
import { camera, controls } from "@/BaseModel/RenderCamera";
import { scene } from "@/BaseModel/scene";
import { MeshGroup, lineGroup, anhuiMesh, level } from "@/BaseModel/scene/mesh";
import { fontGroup } from "@/BaseModel/utils/generateFont";
export default {
  name: "HelloWorld",
  data() {
    return {
      level2: level,
    };
  },
  methods: {
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
  },
  mounted() {
    console.log("this外层", this);
    const self = this;
    const myVideo = this.$refs.myVideo;
    const chooseEvent = (e) => {
      choose(e, MeshGroup, level);
    };
    //监听开场动画结束
    myVideo.addEventListener("ended", () => {
      //开场动画半透明消失
      let tween1 = gsap.to(myVideo, {
        opacity: 0,
        duration: 0.1,
        onComplete: () => {
          tween1.kill();
          tween1 = null;
          myVideo.parentNode.removeChild(myVideo);
          //绑定单击地图点击事件
          window.addEventListener("click", chooseEvent);
          //设置画布图层的位置与层级
          document.getElementById("container").appendChild(renderer.domElement);
          renderer.domElement.style.position = "absolute";
          renderer.domElement.style.zIndex = 2;
          //设置文字图层标签的位置与层级
          document
            .getElementById("container")
            .appendChild(labelRenderer.domElement); //插入生成好的label标签到html中去
          labelRenderer.domElement.style.zIndex = 3;
          //地图由近拉远
          let tween2 = gsap.to(camera.position, {
            z: 5000000,
            duration: 1,
            ease: "none",
            onComplete: () => {
              tween2.kill();
              tween2 = null;
            },
          });
          function chooseCity() {
            if (chooseMesh) {
              //相机拉远
              let tween1 = gsap.to(camera.position, {
                z: 50000000,
                duration: 1,
                ease: "none",
                onComplete: () => {
                  tween1.kill();
                  tween1 = null;
                  console.log("selfffffffff", self);
                  self.initMap(cityCenter);
                  const dom = document.getElementById("Amap");
                  dom.style.visibility = "visible";
                  dom.style.zIndex = 50;
                },
              });
              //
            } else {
              return;
            }
          }

          //安徽地图方法
          function chooseAnhui() {
            //隐藏箭头
            const arrowDom = document.getElementById("arrow");
            arrowDom.style.visibility = "hidden";
            if (chooseMesh) {
              //中国地图远离动画
              const tween1 = gsap.to(camera.position, {
                z: 250000000,
                duration: 1,
                ease: "none",
                onComplete: function () {
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
                  //隐藏设备信息标签
                  document.getElementById("hello").style.visibility = "hidden";
                  // scene.remove(labelgroup);
                  tween1.kill();
                  //安徽地图拉近动画
                  const tween2 = gsap.to(camera.position, {
                    x: 13124121.88,
                    y: 3776272.11,
                    z: 638806.68,
                    duration: 1,
                    ease: "none",
                    onComplete: function () {
                      tween2.kill();
                    },
                  });
                  //更改相机的目标点位置动画
                  const tween3 = gsap.to(controls.target, {
                    x: 13030745,
                    y: 3771289,
                    z: 20000,
                    duration: 1,
                    ease: "none",
                    onComplete: function () {
                      tween3.kill();
                    },
                  });
                  //移除中国地图的单击监听事件
                  window.removeEventListener("click", chooseEvent);
                  //移除中国地图的双击事件
                  window.removeEventListener("dblclick", chooseAnhui);
                  this.level2 = 2; //修改level的值用于拾取事件中修改标签的大小
                  let anhui = anhuiMesh(this.level2);
                  const anhuiChoose = (e) => {
                    choose(e, anhui, this.level2);
                  };
                  //绑定安徽地图的单击监听事件，拾取网格体
                  window.addEventListener("click", anhuiChoose);
                  //绑定安徽地图的双击监听事件，跳转到高德地图
                  window.addEventListener("dblclick", chooseCity);
                },
              });
            } else {
              return;
            }
          }
          //绑定双击中国地图事件跳转到安徽地图

          window.addEventListener("dblclick", chooseAnhui);
        },
      });
    });
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
