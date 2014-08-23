var AdditiveBlendingShader = {
    uniforms: {
        texture1: {type: "t", value: null},
        texture2: {type: "t", value: null},
        exponent: {type: "f", value: 1.0},
        multiplier: {type: "f", value: 1.0}
    },
    vertexShader: [
        "varying vec2 vUV;",
        "void main() {",
        "   vUV = uv;",
        "   gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);",
        "}",
    ].join("\n"),
    fragmentShader: [
        "uniform sampler2D texture1;",
        "uniform sampler2D texture2;",
        "uniform float exponent;",
        "uniform float multiplier;",
        "varying vec2 vUV;",
        "void main() {",
        "   vec4 t1 = texture2D(texture1, vUV);",
        "   vec4 t2 = texture2D(texture2, vUV);",
        "   gl_FragColor = t1 + multiplier * pow(t2, vec4(exponent));",
        "}",
    ].join("\n")
};



