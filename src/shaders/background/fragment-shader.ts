export const fragmentShader = `
uniform float uTime;
uniform vec2 uResolution;
uniform float uBattery;

float sun(vec2 uv) {
 	float val = smoothstep(0.3, 0.29, length(uv));
 	float bloom = smoothstep(0.7, 0.0, length(uv));
    float cut = 3.0 * sin((uv.y + uTime * 0.2 * (uBattery + 0.02)) * 100.0)
				+ clamp(uv.y * 14.0 + 1.0, -6.0, 6.0);
	cut = clamp(cut, 0.0, 1.0);
    return clamp(val * cut, 0.0, 1.0) + bloom * 0.6;
}

float grid(vec2 uv) {
    vec2 size = vec2(uv.y, uv.y * uv.y * 0.2) * 0.01;
    uv += vec2(0.0, uTime * 4.0 * (uBattery + 0.05));
    uv = abs(fract(uv) - 0.5);
 	vec2 lines = smoothstep(size, vec2(0.0), uv);
 	lines += smoothstep(size * 5.0, vec2(0.0), uv) * 0.4 * uBattery;
    return clamp(lines.x + lines.y, 0.0, 3.0);
}

void main(void) {
    vec2 uv = (2.0 * gl_FragCoord.xy - uResolution) / uResolution.y;

    float fog = smoothstep(0.1, -0.02, abs(uv.y + 0.2));
    vec3 col = vec3(0.0, 0.1, 0.2);

    if (uv.y < -0.2) {
        uv.y = 3.0 / (abs(uv.y + 0.2) + 0.05);
        uv.x *= uv.y * 1.0;
        float gridVal = grid(uv);
    	col = mix(col, vec3(0.4, 0.6, 1.0), gridVal);
    } else {
        uv.y -= uBattery * 1.1 - 0.51;
        col = vec3(0.4, 0.6, 1.0);
        float sunVal = sun(uv);
        col = mix(col, vec3(1.0, 0.4, 0.1), uv.y * 2.0 + 0.2);
        col = mix(vec3(0.0, 0.0, 0.0), col, sunVal);
        col += vec3(0.0, 0.1, 0.2);
    }

    col += fog * fog * fog;
    col = mix(vec3(col.r, col.r, col.r) * 0.5, col, uBattery * 0.7);

    gl_FragColor = vec4(col,1.0);
}
`
