var HorizontalBlurShader = {
    uniforms: {
        w: {type: "f", value: 1024},
        texture: {type: "t", value: null}
    },
    vertexShader: [
        "varying vec2 vUV;",
        "void main() {",
        "   vUV = uv;",
        "   gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);",
        "}"
    ].join("\n"),
    fragmentShader: [
        "uniform float w;",
        "uniform sampler2D texture;",
        "varying vec2 vUV;",

        "void main() {",
            "vec4 sum = vec4( 0.0 );",
            "sum += texture2D( texture, vec2( vUV.x - 4.0 * w, vUV.y ) ) * 0.051;",
            "sum += texture2D( texture, vec2( vUV.x - 3.0 * w, vUV.y ) ) * 0.092;",
            "sum += texture2D( texture, vec2( vUV.x - 2.0 * w, vUV.y ) ) * 0.122;",
            "sum += texture2D( texture, vec2( vUV.x - 1.0 * w, vUV.y ) ) * 0.153;",
            "sum += texture2D( texture, vec2( vUV.x, vUV.y ) ) * 0.163;",
            "sum += texture2D( texture, vec2( vUV.x + 1.0 * w, vUV.y ) ) * 0.153;",
            "sum += texture2D( texture, vec2( vUV.x + 2.0 * w, vUV.y ) ) * 0.122;",
            "sum += texture2D( texture, vec2( vUV.x + 3.0 * w, vUV.y ) ) * 0.092;",
            "sum += texture2D( texture, vec2( vUV.x + 4.0 * w, vUV.y ) ) * 0.051;",
            "gl_FragColor = sum;",
        "}",
    ].join("\n")
};
