var scene = new THREE.Scene();
var pp_scene = new THREE.Scene();
var aspect_ratio = window.innerWidth / window.innerHeight;
var camera = new THREE.PerspectiveCamera(30, aspect_ratio, 1, 10000);
var pp_camera = new THREE.OrthographicCamera(-aspect_ratio, aspect_ratio, 1, -1, 1, 1000)

var renderer = new THREE.WebGLRenderer({ antialias: true, precision:"highp" });
renderer.shadowMapType = THREE.PCFSoftShadowMap;
renderer.setClearColor(0x000000);
renderer.setSize(window.innerWidth, window.innerHeight - 5);
var maxAnisotropy = renderer.getMaxAnisotropy();

var blue_marble_tex = THREE.ImageUtils.loadTexture("blue_marble.png");
var night_tex = THREE.ImageUtils.loadTexture("earth_night_lights.png");
var water_tex = THREE.ImageUtils.loadTexture("earth-norm-spec.png");
var cloud_tex = THREE.ImageUtils.loadTexture("earth_clouds.png");

blue_marble_tex.anisotropy = maxAnisotropy;
night_tex.anisotropy = maxAnisotropy;
water_tex.anisotropy = maxAnisotropy;

var renderTargetParams = {
    minFilter: THREE.LinearFilter,
};

$("#bg-canvas").append(renderer.domElement);

var sun_geometry = new THREE.SphereGeometry(25.0, 128, 128);

var sun_material = new THREE.MeshBasicMaterial({
    color: 0xffffff,
});

var luminance_material = new THREE.MeshBasicMaterial({
    color: 0xfff5f2,
});

var shadow_material = new THREE.MeshBasicMaterial({
    color: 0x0,
    map: new THREE.ImageUtils.loadTexture("blue_marble.png"),
});

var sun = new THREE.Mesh(sun_geometry, sun_material);
sun.position.z = -5000.0;
scene.add(sun);

var earth_geometry = new THREE.SphereGeometry(3.5, 256, 256);

EarthShader.uniforms.SunPosition.value = sun.position;
EarthShader.uniforms.texMapA.value = blue_marble_tex;
EarthShader.uniforms.texMapNight.value = night_tex;
EarthShader.uniforms.texMapSpecular.value = water_tex;
EarthShader.uniforms.texMapClouds.value = cloud_tex;
var earth_material = new THREE.ShaderMaterial(EarthShader);

var atmosphere_material = new THREE.ShaderMaterial(EarthAtmosphereShader);
atmosphere_material.transparent = true;

var transparent_material = new THREE.MeshBasicMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: 0,
});

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
var blurTarget3 = new THREE.WebGLRenderTarget(window.innerWidth / blurTargetFactor, window.innerHeight / blurTargetFactor, renderTargetParams);
var mainTarget = new THREE.WebGLRenderTarget(window.innerWidth, window.innerHeight, renderTargetParams);


AdditiveBlendingShader.uniforms.texture1.value = mainTarget;
AdditiveBlendingShader.uniforms.texture2.value = blurTarget2;
AdditiveBlendingShader.uniforms.multiplier.value = 1.0;
AdditiveBlendingShader.uniforms.exponent.value = 1.0;

VerticalBlurShader.uniforms.texture.value = blurTarget1;

HorizontalBlurShader.uniforms.texture.value = blurTarget2;

GodRayShader.uniforms.texture.value = blurTarget1;

var god_ray_material = new THREE.ShaderMaterial(GodRayShader);
var additive_material = new THREE.ShaderMaterial(AdditiveBlendingShader);
var vblur_material = new THREE.ShaderMaterial(VerticalBlurShader);
var hblur_material = new THREE.ShaderMaterial(HorizontalBlurShader);
var earth_atmo_mask_material = new THREE.ShaderMaterial(EarthAtmoMaskShader);
var fs_quad_mesh = new THREE.Mesh(fs_quad_geometry, god_ray_material);
pp_scene.add(fs_quad_mesh);

var camera_counter = 3.14 / 16.0;
var camera_radius = 14.0;

var last_frame_time = 0.0;
var frame_counter = 0;

function render() {
    earth.rotation.y += 0.002;
    camera_counter += 0.0010;

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

    // render the primary scene
    sun.material = sun_material;
    earth.material = earth_material;
    renderer.render(scene, camera, mainTarget);

    // render a luminance pass where the sun is white and the earth is black
    sun.material = luminance_material;
    earth.material = earth_dark_material;
    renderer.render(scene, camera, blurTarget1);

    // do a vertical blur pass on the luminance texture
    VerticalBlurShader.uniforms.texture.value = blurTarget1;
    VerticalBlurShader.uniforms.h.value = 1.0 / window.innerHeight;
    fs_quad_mesh.material = vblur_material;
    renderer.render(pp_scene, pp_camera, blurTarget2);

    // do a horizontal blur pass on the luminance texture
    HorizontalBlurShader.uniforms.texture.value = blurTarget2;
    HorizontalBlurShader.uniforms.w.value = 1.0 / window.innerWidth;
    fs_quad_mesh.material = hblur_material;
    renderer.render(pp_scene, pp_camera, blurTarget1);

    // run the god ray shader on the blurred luminance texture
    GodRayShader.uniforms.texture.value = blurTarget1;
    fs_quad_mesh.material = god_ray_material;
    renderer.render(pp_scene, pp_camera, blurTarget2);

    // do a vertical blur pass on the main scene
    VerticalBlurShader.uniforms.texture.value = mainTarget;
    VerticalBlurShader.uniforms.h.value = 1.25 / window.innerHeight;
    fs_quad_mesh.material = vblur_material;
    renderer.render(pp_scene, pp_camera, blurTarget1);

    // horizontal pass
    HorizontalBlurShader.uniforms.texture.value = blurTarget1;
    HorizontalBlurShader.uniforms.w.value = 1.25 / window.innerWidth;
    fs_quad_mesh.material = hblur_material;
    renderer.render(pp_scene, pp_camera, blurTarget3);

    // blend earth blur with earth scene
    EarthAtmoMaskShader.uniforms.mainTexture.value = mainTarget;
    EarthAtmoMaskShader.uniforms.atmoTexture.value = blurTarget3;
    fs_quad_mesh.material = earth_atmo_mask_material;
    renderer.render(pp_scene, pp_camera, blurTarget1);

    // do an additive blend of the god ray texture and the main scene texture
    AdditiveBlendingShader.uniforms.texture1.value = blurTarget1;
    AdditiveBlendingShader.uniforms.texture2.value = blurTarget2;
    AdditiveBlendingShader.uniforms.multiplier.value = 1.0;
    AdditiveBlendingShader.uniforms.exponent.value = 1.0;
    fs_quad_mesh.material = additive_material;
    renderer.render(pp_scene, pp_camera);

    requestAnimationFrame(render);

    if(frame_counter == 0) {
        var ms = new Date().getTime();
        var diff = ms - last_frame_time;
        last_frame_time = ms;
        var seconds = diff / 1000.0;
        var fps = 15 / seconds;
        $("#fps-disp").text(fps.toFixed(1) + " FPS");
    }

    frame_counter = (frame_counter + 1) % 15;
}
render();
