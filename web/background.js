var scene = new THREE.Scene();
var bloom_scene = new THREE.Scene();
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

var sun_geometry = new THREE.SphereGeometry(3.5, 128, 128);

var sun_material = new THREE.MeshBasicMaterial({
    color: 0xffffff,
});


var sun = new THREE.Mesh(sun_geometry, sun_material);
sun.position.z = -500.0;
scene.add(sun);
bloom_scene.add(sun);

var earth_uniforms =  {
    texMapA: {type:"t", value:texture},
    texMapSpecular: {type:"t", value:spec_map},
    texMapNight: {type:"t", value:night_texture},
    SunPosition: {type:"v3", value: sun.position},
}

var earth_geometry = new THREE.SphereGeometry(3.5, 128, 128);

var earth_material = new THREE.ShaderMaterial({
    vertexShader: $("#earth-vertex").text(),
    fragmentShader: $("#earth-fragment").text(),
    uniforms: earth_uniforms,
});

var earth = new THREE.Mesh(earth_geometry, earth_material);
scene.add(earth);

earth.rotation.y = 3.0;
earth.rotation.x = 0.0;

var camera_counter = 0.0;
var camera_radius = 10.0;

function render() {
    earth.rotation.y += 0.0015;
    camera_counter += 0.001;

    camera.position.x = Math.sin(camera_counter) * camera_radius;
    camera.position.z = Math.cos(camera_counter) * camera_radius;
    camera.lookAt(earth.position);

    //renderer.render(scene, camera);
    renderer.render(bloom_scene, camera);
    requestAnimationFrame(render);
}
render();
