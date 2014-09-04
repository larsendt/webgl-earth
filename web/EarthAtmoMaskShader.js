var EarthAtmoMaskShader = {
    uniforms: {
        mainTexture: {type: "t", value: null},
        atmoTexture: {type: "t", value: null},
    },
    vertexShader: [
        "varying vec2 vUV;",
        "void main() {",
        "   vUV = uv;",
        "   gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);",
        "}",
    ].join("\n"),
    fragmentShader: [
        "uniform sampler2D mainTexture;",
        "uniform sampler2D atmoTexture;",
        "varying vec2 vUV;",
        "void main() {",
        "   vec4 t1 = texture2D(mainTexture, vUV);",
        "   vec4 t2 = texture2D(atmoTexture, vUV);",
        "   if(length(t1.xyz) > 0.0) {",
        "       gl_FragColor = t1;",
        "   }",
        "   else {",
        "       vec4 base_atmo_color = vec4(0.46, 0.77, 0.96, 1.0);",
        "       gl_FragColor = length(t2.xyz) * base_atmo_color;",
        "   }",
        "}",
    ].join("\n")
};



