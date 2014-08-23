var scene = new THREE.Scene();
var pp_scene = new THREE.Scene();
var aspect_ratio = window.innerWidth / window.innerHeight;
var camera = new THREE.PerspectiveCamera(45, aspect_ratio, 0.1, 1000);
var pp_camera = new THREE.OrthographicCamera(-aspect_ratio, aspect_ratio, 1, -1, 1, 1000)

var renderer = new THREE.WebGLRenderer({ antialiasing: true, precision:"highp" });
renderer.setClearColor(0x000000);
renderer.setSize(window.innerWidth, window.innerHeight - 5);

var renderTargetParams = {
    minFilter: THREE.LinearFilter,
};

$("#bg-canvas").append(renderer.domElement);

var sun_geometry = new THREE.SphereGeometry(5.0, 128, 128);

var sun_material = new THREE.MeshBasicMaterial({
    color: 0xffffff,
});

var luminance_material = new THREE.MeshBasicMaterial({
    color: 0xfff0aa,
});

var shadow_material = new THREE.MeshBasicMaterial({
    color: 0x0,
    map: new THREE.ImageUtils.loadTexture("blue_marble.png"),
});

var sun = new THREE.Mesh(sun_geometry, sun_material);
sun.position.z = -500.0;
scene.add(sun);

var earth_geometry = new THREE.SphereGeometry(3.5, 128, 128);

EarthShader.uniforms.SunPosition.value = sun.position;
var earth_material = new THREE.ShaderMaterial(EarthShader);

EarthDarkShader.uniforms.SunPosition.value = sun.position;
var earth_dark_material = new THREE.ShaderMaterial(EarthDarkShader);

var earth = new THREE.Mesh(earth_geometry, earth_material);
scene.add(earth);

earth.rotation.y = 3.0;
earth.rotation.x = 0.0;

var fs_quad_geometry = new THREE.Geometry();
fs_quad_geometry.vertices.push(
    new THREE.Vector3(-aspect_ratio, -1, -1),
    new THREE.Vector3( aspect_ratio, -1, -1),
    new THREE.Vector3(-aspect_ratio,  1, -1),
    new THREE.Vector3( aspect_ratio,  1, -1)
);

fs_quad_geometry.faceVertexUvs[0].push(
    [new THREE.Vector2(0, 0),
     new THREE.Vector2(1, 0),
     new THREE.Vector2(1, 1)],
    [new THREE.Vector2(1, 1),
     new THREE.Vector2(0, 1),
     new THREE.Vector2(0, 0)]
);

fs_quad_geometry.faces.push(
    new THREE.Face3(0, 1, 3),
    new THREE.Face3(3, 2, 0)
);

var blurTargetFactor = 1.0;
var blurTarget1 = new THREE.WebGLRenderTarget(window.innerWidth / blurTargetFactor, window.innerHeight / blurTargetFactor, renderTargetParams);
var blurTarget2 = new THREE.WebGLRenderTarget(window.innerWidth / blurTargetFactor, window.innerHeight / blurTargetFactor, renderTargetParams);
var mainTarget = new THREE.WebGLRenderTarget(window.innerWidth, window.innerHeight, renderTargetParams);


AdditiveBlendingShader.uniforms.texture1.value = mainTarget;
AdditiveBlendingShader.uniforms.texture2.value = blurTarget2;
AdditiveBlendingShader.uniforms.multiplier.value = 1.0;
AdditiveBlendingShader.uniforms.exponent.value = 1.0;

VerticalBlurShader.uniforms.h.value = 1.0 / window.innerHeight;
VerticalBlurShader.uniforms.texture.value = blurTarget1;

HorizontalBlurShader.uniforms.w.value = 1.0 / window.innerWidth;
HorizontalBlurShader.uniforms.texture.value = blurTarget2;

GodRayShader.uniforms.texture.value = blurTarget1;

var god_ray_material = new THREE.ShaderMaterial(GodRayShader);
var additive_material = new THREE.ShaderMaterial(AdditiveBlendingShader);
var vblur_material = new THREE.ShaderMaterial(VerticalBlurShader);
var hblur_material = new THREE.ShaderMaterial(HorizontalBlurShader);
var fs_quad_mesh = new THREE.Mesh(fs_quad_geometry, god_ray_material);
pp_scene.add(fs_quad_mesh);

var camera_counter = 0.3;
var camera_radius = 10.0;

function render() {
    earth.rotation.y += 0.001;
    camera_counter += 0.0005;

    camera.position.x = Math.sin(camera_counter) * camera_radius;
    camera.position.z = Math.cos(camera_counter) * camera_radius;
    camera.lookAt(earth.position);
    camera.updateProjectionMatrix();

    var vector = new THREE.Vector3();
    var projector = new THREE.Projector();
    projector.projectVector( vector.setFromMatrixPosition( sun.matrixWorld ), camera );

    vector.x = (vector.x + 1.0) / 2.0;
    vector.y = (vector.y + 1.0) / 2.0;

    GodRayShader.uniforms.uScreenLightPos.value = new THREE.Vector2(vector.x, vector.y);

    sun.material = luminance_material;
    earth.material = earth_dark_material;
    renderer.render(scene, camera, blurTarget1);

    fs_quad_mesh.material = vblur_material;
    renderer.render(pp_scene, pp_camera, blurTarget2);

    fs_quad_mesh.material = hblur_material;
    renderer.render(pp_scene, pp_camera, blurTarget1);

    sun.material = sun_material;
    earth.material = earth_material;
    renderer.render(scene, camera, mainTarget);

    fs_quad_mesh.material = god_ray_material;
    renderer.render(pp_scene, pp_camera, blurTarget2);

    fs_quad_mesh.material = additive_material;
    renderer.render(pp_scene, pp_camera);

    requestAnimationFrame(render);
}
render();
