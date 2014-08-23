EarthDarkShader = {
    uniforms: {
        texMapA: {type:"t", value: THREE.ImageUtils.loadTexture("blue_marble.png")},
        texMapNight: {type:"t", value: THREE.ImageUtils.loadTexture("earth_night_lights.png")},
        texMapSpecular: {type:"t", value: THREE.ImageUtils.loadTexture("earth-norm-spec.png")},
        SunPosition: {type:"v3", value: new THREE.Vector3(0, 0, 0)},
    },
    vertexShader: [
        "uniform vec3 SunPosition;",
        "void main(){",
        "    vec4 vert = modelViewMatrix * vec4(position, 1.0);",
        "    gl_Position = projectionMatrix * vert;",
        "}",
    ].join("\n"),
    fragmentShader: [
        "uniform sampler2D texMapA;",
        "uniform sampler2D texMapB;",
        "uniform sampler2D texMapNight;",
        "uniform sampler2D texMapSpecular;",


        "void main()",
        "{",
        "   gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);",
        "}"].join("\n")
};

