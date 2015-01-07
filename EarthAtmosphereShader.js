var EarthAtmosphereShader = {
    uniforms: {

    },
    vertexShader: [
        "varying vec3 n;",
        "void main() {",
            "n = normalMatrix * normal;",
            "gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);",
        "}",
    ].join("\n"),
    fragmentShader: [
        "void main() {",
            "gl_FragColor = vec4(0.0, 0.0, 0.0, 0.0);",
        "}",
    ].join("\n"),
};
