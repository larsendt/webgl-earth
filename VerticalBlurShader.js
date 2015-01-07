var VerticalBlurShader = {
    uniforms: {
        h: {type: "f", value: 1.0 / 512.0},
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
        "uniform float h;",
        "uniform sampler2D texture;",
        "varying vec2 vUV;",

        "void main() {",
            "vec4 sum = vec4( 0.0 );",

            "sum += texture2D( texture, vec2( vUV.x, vUV.y + 6.0 * h ) ) * 0.0125;",
            "sum += texture2D( texture, vec2( vUV.x, vUV.y - 5.0 * h ) ) * 0.025;",
            "sum += texture2D( texture, vec2( vUV.x, vUV.y - 4.0 * h ) ) * 0.051;",
            "sum += texture2D( texture, vec2( vUV.x, vUV.y - 3.0 * h ) ) * 0.092;",
            "sum += texture2D( texture, vec2( vUV.x, vUV.y - 2.0 * h ) ) * 0.122;",
            "sum += texture2D( texture, vec2( vUV.x, vUV.y - 1.0 * h ) ) * 0.153;",
            "sum += texture2D( texture, vec2( vUV.x, vUV.y ) ) * 0.163;",
            "sum += texture2D( texture, vec2( vUV.x, vUV.y + 1.0 * h ) ) * 0.153;",
            "sum += texture2D( texture, vec2( vUV.x, vUV.y + 2.0 * h ) ) * 0.122;",
            "sum += texture2D( texture, vec2( vUV.x, vUV.y + 3.0 * h ) ) * 0.092;",
            "sum += texture2D( texture, vec2( vUV.x, vUV.y + 4.0 * h ) ) * 0.051;",
            "sum += texture2D( texture, vec2( vUV.x, vUV.y + 5.0 * h ) ) * 0.025;",
            "sum += texture2D( texture, vec2( vUV.x, vUV.y + 6.0 * h ) ) * 0.0125;",

            "gl_FragColor = sum;",
        "}",
    ].join("\n")
};
