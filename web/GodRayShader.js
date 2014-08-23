var GodRayShader = {
    uniforms: {
        texture: {type: "t", value: null},
        uScreenLightPos: {type: "v2", value: new THREE.Vector2(0.5, 0.5)},
    },
    vertexShader: [
        "varying vec2 vUV;",
        "void main() {",
        "   vUV = uv;",
        "   gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);",
        "}"
    ].join("\n"),
    fragmentShader: [
        "#define SAMPLES 30",
        "varying vec2 vUV;",
        "uniform vec2 uScreenLightPos;",
        "uniform sampler2D texture;",
        "const float decay = 0.95;",
        "const float weight = 0.5;",
        "const float density = 0.97;",
        "const float exposure = 0.5;",
        "void main() {",
            "vec2 texCoord = vUV;",
            "vec2 deltaTexCoord = texCoord - uScreenLightPos;",
            "deltaTexCoord.y *= 1.0 / float(SAMPLES) * density;",
            "deltaTexCoord.x *= 1.009 / float(SAMPLES) * density;",
            "vec4 color = texture2D(texture, texCoord);",
            "float illuminationDecay = 1.0;",
            "for(int i = 0; i < SAMPLES; i++) {",
                "texCoord -= deltaTexCoord;",
                "vec4 sample = texture2D(texture, texCoord);",
                "sample *= illuminationDecay * weight;",
                "color += sample;",
                "illuminationDecay *= decay;",
            "}",
            "gl_FragColor = vec4(color.xyz * exposure, 1.0);",
        "}",
    ].join("\n")
};
