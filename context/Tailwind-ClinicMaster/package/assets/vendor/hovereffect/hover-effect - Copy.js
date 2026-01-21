var hoverEffect = function(opts) {
    var vertex = `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
    `;

    var fragment = `
        varying vec2 vUv;

        uniform sampler2D texture;
        uniform sampler2D texture2;
        uniform sampler2D disp;
        uniform float dispFactor;
        uniform float effectFactor;

        void main() {
            vec2 uv = vUv;
            vec4 disp = texture2D(disp, uv);

            vec2 distortedPosition = vec2(
                uv.x + dispFactor * (disp.r * effectFactor),
                uv.y
            );
            vec2 distortedPosition2 = vec2(
                uv.x - (1.0 - dispFactor) * (disp.r * effectFactor),
                uv.y
            );

            vec4 _texture = texture2D(texture, distortedPosition);
            vec4 _texture2 = texture2D(texture2, distortedPosition2);

            gl_FragColor = mix(_texture, _texture2, dispFactor);
        }
    `;

    var parent = opts.parent;
    var intensity = opts.intensity || 1;
    var image1 = opts.image1;
    var image2 = opts.image2;
    var dispImage = opts.displacementImage;
    var easing = opts.easing || "power2.out";

    var scene = new THREE.Scene();
    var camera = new THREE.OrthographicCamera(
        parent.offsetWidth / -2,
        parent.offsetWidth / 2,
        parent.offsetHeight / 2,
        parent.offsetHeight / -2,
        1,
        1000
    );
    camera.position.z = 1;

    var renderer = new THREE.WebGLRenderer({ antialias: false });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(parent.offsetWidth, parent.offsetHeight);
    parent.appendChild(renderer.domElement);

    var loader = new THREE.TextureLoader();

    const textureLoader = new THREE.TextureLoader();

    const texture1 = textureLoader.load(image1, (tex) => {
        tex.minFilter = THREE.LinearFilter;
        tex.magFilter = THREE.LinearFilter;
        tex.generateMipmaps = false;
        tex.wrapS = THREE.ClampToEdgeWrapping;
        tex.wrapT = THREE.ClampToEdgeWrapping;
    });

    const texture2 = textureLoader.load(image2, (tex) => {
        tex.minFilter = THREE.LinearFilter;
        tex.magFilter = THREE.LinearFilter;
        tex.generateMipmaps = false;
        tex.wrapS = THREE.ClampToEdgeWrapping;
        tex.wrapT = THREE.ClampToEdgeWrapping;
    });


    // var texture2 = loader.load(image2);
    var disp = loader.load(dispImage);
    disp.wrapS = disp.wrapT = THREE.RepeatWrapping;

    var mat = new THREE.ShaderMaterial({
        uniforms: {
            effectFactor: { value: intensity },
            dispFactor: { value: 0.0 },
            texture: { value: texture1 },
            texture2: { value: texture2 },
            disp: { value: disp },
        },
        vertexShader: vertex,
        fragmentShader: fragment,
        transparent: true
    });

    this.material = mat;

    var geometry = new THREE.PlaneBufferGeometry(
        parent.offsetWidth,
        parent.offsetHeight,
        1
    );

    var mesh = new THREE.Mesh(geometry, mat);
    scene.add(mesh);

    this.next = function() {
        gsap.to(mat.uniforms.dispFactor, {
            value: 1,
            duration: 1.4,
            ease: easing
        });
    };

    this.previous = function() {
        gsap.to(mat.uniforms.dispFactor, {
            value: 0,
            duration: 1.2,
            ease: easing
        });
    };

    this.setTextures = function(img1, img2) {
        mat.uniforms.texture.value = loader.load(img1);
        mat.uniforms.texture2.value = loader.load(img2);
    };

    this.forceTransition = function(img1, img2) {
        const loader = new THREE.TextureLoader();

        mat.uniforms.texture.value = loader.load(img1);
        mat.uniforms.texture2.value = loader.load(img2);

        gsap.killTweensOf(mat.uniforms.dispFactor);

        mat.uniforms.dispFactor.value = 0;
        
        gsap.to(mat.uniforms.dispFactor, {
            value: 1,
            duration: 1.2,
            ease: "power2.out",
            onComplete: () => {
                mat.uniforms.texture.value = mat.uniforms.texture2.value;
                mat.uniforms.dispFactor.value = 0;
            }
        });
    };


    function animate() {
        requestAnimationFrame(animate);
        renderer.render(scene, camera);
    }
    animate();
};
