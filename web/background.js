var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);

var renderer = new THREE.WebGLRenderer({ antialiasing: true });
renderer.setClearColor(0x000000);
renderer.setSize(window.innerWidth, window.innerHeight - 5);
var maxAnisotropy = renderer.getMaxAnisotropy();

$("#bg-canvas").append(renderer.domElement);

var texture = THREE.ImageUtils.loadTexture("blue_marble.png");
texture.anisotropy = maxAnisotropy;
var night_texture = THREE.ImageUtils.loadTexture("earth_night_lights.png");
texture.anisotropy = maxAnisotropy;
var spec_map = THREE.ImageUtils.loadTexture("earth-norm-spec.png");
spec_map.anisotropy = maxAnisotropy;

var geometry = new THREE.SphereGeometry(3.5, 128, 128);

var sun_pos = new THREE.Vector3(0, 0, -5);

var uniforms =  {
    texMapA: {type:"t", value:texture},
    texMapSpecular: {type:"t", value:spec_map},
    texMapNight: {type:"t", value:night_texture},
    SunPosition: {type:"v3", value: sun_pos},
}

var material = new THREE.ShaderMaterial({
    vertexShader: $("#earth-vertex").text(),
    fragmentShader: $("#earth-fragment").text(),
    uniforms: uniforms,
});

var earth = new THREE.Mesh(geometry, material);
earth.position.z = -10.0;
scene.add(earth);

earth.rotation.y = 3.0;
earth.rotation.x = 0.0;

var sun_counter = 0.1;

function render() {
    requestAnimationFrame(render);
    renderer.render(scene, camera);
    sun_pos.x = Math.sin(sun_counter) * 500;
    sun_pos.z = -Math.cos(sun_counter) * 500;
    earth.rotation.y += 0.0002;
    sun_counter += 0.001;
}
render();
