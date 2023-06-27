import { scene } from "./scene/index.js";
import { camera, renderer, controls } from "./RenderCamera.js";
import { labelRenderer } from "./utils/tags.js";
import Stats from "stats.js";
const stats = new Stats();
document.body.appendChild(stats.domElement);
function render() {
  stats.update();
  controls.update();
  renderer.render(scene, camera);
  labelRenderer.render(scene, camera);
  requestAnimationFrame(render);
  // composer.render();
  // console.log(camera.position);
}
render();

export { renderer };
