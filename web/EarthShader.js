EarthShader = {
    uniforms: {
        texMapA: {type:"t", value: null},
        texMapNight: {type:"t", value: null},
        texMapSpecular: {type:"t", value: null},
        SunPosition: {type:"v3", value: new THREE.Vector3(0, 0, 0)},
    },
    vertexShader: [
        "varying vec3 n;",
        "varying vec3 l;",
        "varying vec3 e;",

        "varying vec2 st;",

        "uniform vec3 SunPosition;",

        "void main(){",
        "    st = uv;",

        "    vec4 vert = modelViewMatrix * vec4(position, 1.0);",
        "    gl_Position = projectionMatrix * vert;",

        "    vec3 sun = vec3(viewMatrix * vec4(SunPosition, 0.0));",

        "    l = sun - vec3(vert);",
        "    n = normalMatrix * normal;",
        "    e = vec3(-vert);",
        "}",
    ].join("\n"),
    fragmentShader: [
        "#extension GL_OES_standard_derivatives : enable",


        "varying vec3 n;",
        "varying vec3 l;",
        "varying vec3 e;",


        "varying vec2 st;",


        "uniform sampler2D texMapA;",
        "uniform sampler2D texMapB;",
        "uniform sampler2D texMapNight;",
        "uniform sampler2D texMapSpecular;",


        "uniform float shift;",


        "// hook for lighting code",
        "vec4 lightContribution(vec3 L, vec3 N, vec3 E);",
        "void setRoughness(float rough);",




        "// Physically Based lighting model",
        "// Uses Oren-Nayar reflectance model for diffuse properties",
        "// Uses Cook-Torrance reflectance model for specular properties",
        "// Good for everything not a planet. But also good for things like earth, where there is reflectance.",


        "// standard interface is for function lightContribution to take a vector to the light in view space",
        "// and return a vec4 laid out as: (total light contribution, diffuse, specular, dot(N,L))",
        "// this allows for:",
        "// 1) retrieving the total light contribution easily",
        "// 2) managing diffuse and specular components separately if desired",
        "// 3) raw access to dot(N,L) if it's necessary for blending and/or something special",


        "const float roughness = 0.2;",
        "const float R0 = 1.0;",


        "float roughnessSquared = roughness * roughness;",


        "void setRoughness(float rough)",
        "{",
        "    roughnessSquared = rough * rough;",
        "}",


        "vec4 lightContribution(vec3 L, vec3 N, vec3 E)",
        "{",


        "    float NdotV = dot(N, E);",
        "    float NdotL = dot(N, L);",
        "    float angleVN = acos(NdotV);",


        "    float diffuse = 0.0;",
        "    float specular = 0.0;",


        "    float angleLN = acos(NdotL);",


        "    float alpha = max(angleVN, angleLN);",
        "    float beta = min(angleVN, angleLN);",
        "    float gamma = dot(E - N * dot(E, N), L - N * dot(L, N));",




        "    // calculate A and B",
        "    float A = 1.0 - 0.5 * (roughnessSquared / (roughnessSquared + 0.57));",


        "    float B = 0.45 * (roughnessSquared / (roughnessSquared + 0.09));",


        "    float C = sin(alpha) * tan(beta);",


        "    // put it all together",
        "    diffuse = max(0.0,NdotL) * (A + B * max(0.0, gamma) * C);",
        "    //L1 = max(0.0, L1);",


        "    if(NdotL > 0.0)",
        "    {",
        "        vec3 H = normalize(L + E);",


        "        float NdotH = max(dot(N,H),0.0);",
        "        float VdotH = max(dot(E,H),0.0);",


        "        // geometric attenuation",
        "        float NH2 = 2.0 * NdotH;",
        "        float g1 = (NH2 * NdotV) / VdotH;",
        "        float g2 = (NH2 * NdotL) / VdotH;",
        "        float geoAtt = min(1.0, min(g1, g2));",


        "        // roughness (or: microfacet distribution function)",
        "        // beckmann distribution function",
        "        float r1 = 1.0 / ( 4.0 * roughnessSquared * pow(NdotH, 4.0));",
        "        float r2 = (NdotH * NdotH - 1.0) / (roughnessSquared * NdotH * NdotH);",
        "        float rough = r1 * exp(r2);",


        "        // fresnel",
        "        // Schlick approximation",
        "        float fresnel = pow(1.0 - VdotH, 5.0);",
        "        fresnel *= (1.0 - R0);",
        "        fresnel += R0;",


        "        specular = NdotL * (fresnel * geoAtt * rough) / (NdotV * NdotL * 3.14);",


        "    }",
        "    return vec4(diffuse + specular,diffuse,specular,NdotL);",
        "}",


        "// http://www.thetenthplanet.de/archives/1180",
        "mat3 cotangent_frame(vec3 N, vec3 p, vec2 uv)",
        "{",
        "    // get edge vectors of the pixel triangle",
        "    vec3 dp1 = dFdx( p );",
        "    vec3 dp2 = dFdy( p );",
        "    vec2 duv1 = dFdx( uv );",
        "    vec2 duv2 = dFdy( uv );",


        "    // solve the linear system",
        "    vec3 dp2perp = cross( dp2, N );",
        "    vec3 dp1perp = cross( N, dp1 );",
        "    vec3 T = dp2perp * duv1.x + dp1perp * duv2.x;",
        "    vec3 B = dp2perp * duv1.y + dp1perp * duv2.y;",


        "    // construct a scale-invariant frame",
        "    float invmax = inversesqrt( max( dot(T,T), dot(B,B) ) );",
        "    return mat3( T * invmax, B * invmax, N );",
        "}",


        "vec3 perturb_normal( vec3 N, vec3 V, vec3 map, vec2 texcoord)",
        "{",
        "    // assume N, the interpolated vertex normal and",
        "    // V, the view vector (vertex to eye)",
        "    map = map * 255./127. - 128./127.;",
        "    mat3 TBN = cotangent_frame(N, -V, texcoord);",
        "    return normalize(TBN * map);",
        "}",


        "void main()",
        "{",
        "    vec3 N = normalize(n);",
        "    vec3 L = normalize(l);",
        "    vec3 E = normalize(e);",


        "    // sample the night time texture",
        "    vec3 night = texture2D(texMapNight, st).rgb;",


        "    // blow out the bright sections, darken the dark sections",
        "    night = pow(night,vec3(1.7));",


        "    // pull the normal from the combined Normal + Specular texture",
        "    vec4 normal_spec = texture2D(texMapSpecular,st);",


        "    // water is the specular",
        "    float water = normal_spec.a;",


        "    // perturb the normal out of the normal map",
        "    vec3 PN = perturb_normal(N, E, normal_spec.rgb, st);",


        "    // set water to be smoother than land",
        "    float roughnessValue = 1.0;",
        "    roughnessValue -= water * 0.3;",
        "    setRoughness(roughnessValue);",


        "    // calculate the light result",
        "    vec4 lightResult = lightContribution(L, PN, E);",


        "    // calculate the blending at the terminator",
        "    float texture_mix = smoothstep(-0.25,0.25,lightResult.w) * smoothstep(-0.25,0.25,dot(N,L));",


        "    if (texture_mix > 0.0)",
        "    {",
        "        // calculate the light surface mix",


        "        // what's the precision on this? just how frequently does it change?",
        "        // this should only happen a few times a day, consider moving it",
        "        // could be done on demand in separate FBO + Shader",
        "        // being able to remove a texture access would help performance",


        "        vec3 texColorA, texColorB;",
        "        texColorA = texture2D(texMapA, st).rgb;",
        "        //texColorB = texture2D(texMapB, st).rgb;",
        "        //vec3 time_adjusted = mix(texColorA,texColorB,shift);",
        "        vec3 time_adjusted = texColorA;",


        "        //float light = smoothstep(0.0,0.9,lightResult.x);",


        "        // blend in a slight amount of color based on light intensity",
        "        time_adjusted += (0.1 + vec3(0.0,0.05,0.1) * water) * lightResult.x;",


        "        // mix between adjusted day and night textures",
        "        vec3 mixed_earth = mix(night,time_adjusted,texture_mix);",

        "        float NdotE = pow(1.0 - dot(N, E), 4.0);",
        "        NdotE = mix(0.0, NdotE, texture_mix);",
        "        vec3 atmo_color = vec3(0.7, 0.7, 1.0) * NdotE;",

        "        // add in specular term",
        "        gl_FragColor.rgb = mixed_earth + lightResult.z * water * (time_adjusted + 0.1) + atmo_color;",
        "        gl_FragColor.a = 1.0;",


        "    } else {",
        "        // just night, do nothing",
        "        gl_FragColor = vec4(night,1.0);",
        "    }",


        "}"].join("\n")
};
