var hoverEffect = function (opts) {
  const parent = opts.parent;
  const intensity = opts.intensity || 0.35;
  const easing = opts.easing || "power2.out";

  /* =============================
     SCENE / CAMERA / RENDERER
  ============================== */
  const scene = new THREE.Scene();

  const camera = new THREE.OrthographicCamera(
    parent.offsetWidth / -2,
    parent.offsetWidth / 2,
    parent.offsetHeight / 2,
    parent.offsetHeight / -2,
    1,
    10
  );
  camera.position.z = 1;

  const renderer = new THREE.WebGLRenderer({
    alpha: true,
    antialias: false,
    powerPreference: "high-performance"
  });

  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(parent.offsetWidth, parent.offsetHeight);
  parent.appendChild(renderer.domElement);

  /* =============================
     SHADERS (REAL object-fit: cover)
  ============================== */
  const vertexShader = `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `;

  const fragmentShader = `
    varying vec2 vUv;

    uniform sampler2D texture1;
    uniform sampler2D texture2;
    uniform sampler2D disp;

    uniform float dispFactor;
    uniform float effectFactor;

    uniform vec2 imageAspect;
    uniform vec2 containerAspect;

    vec2 coverUV(vec2 uv, vec2 img, vec2 cont) {
      float imgRatio = img.x / img.y;
      float contRatio = cont.x / cont.y;

      vec2 scale = vec2(1.0);

      if (contRatio > imgRatio) {
        scale.y = imgRatio / contRatio;
      } else {
        scale.x = contRatio / imgRatio;
      }

      return (uv - 0.5) * scale + 0.5;
    }

    void main() {
      vec2 uv = coverUV(vUv, imageAspect, containerAspect);

      vec4 dispTex = texture2D(disp, uv);

      vec2 pos1 = vec2(
        uv.x + dispFactor * dispTex.r * effectFactor,
        uv.y
      );

      vec2 pos2 = vec2(
        uv.x - (1.0 - dispFactor) * dispTex.r * effectFactor,
        uv.y
      );

      vec4 tex1 = texture2D(texture1, pos1);
      vec4 tex2 = texture2D(texture2, pos2);

      gl_FragColor = mix(tex1, tex2, dispFactor);
    }
  `;

  /* =============================
     TEXTURES (NPOT SAFE – NO WARNING)
  ============================== */
  const loader = new THREE.TextureLoader();

  function loadTexture(src, onLoad) {
    const tex = loader.load(src, () => onLoad && onLoad(tex));
    
    tex.minFilter = THREE.LinearFilter;
    tex.magFilter = THREE.LinearFilter;
    tex.generateMipmaps = false;
    tex.wrapS = tex.wrapT = THREE.ClampToEdgeWrapping;
    tex.anisotropy = 0;

    return tex;
  }

  const texture1 = loadTexture(opts.image1, updateImageAspect);
  const texture2 = loadTexture(opts.image2);
  const dispTexture = loadTexture(opts.displacementImage);
  dispTexture.wrapS = dispTexture.wrapT = THREE.ClampToEdgeWrapping;

  /* =============================
     MATERIAL
  ============================== */
  const material = new THREE.ShaderMaterial({
    vertexShader,
    fragmentShader,
    transparent: true,
    uniforms: {
      texture1: { value: texture1 },
      texture2: { value: texture2 },
      disp: { value: dispTexture },
      dispFactor: { value: 0 },
      effectFactor: { value: intensity },
      imageAspect: { value: new THREE.Vector2(1, 1) },
      containerAspect: {
        value: new THREE.Vector2(
          parent.offsetWidth,
          parent.offsetHeight
        )
      }
    }
  });

  /* =============================
     MESH
  ============================== */
  const geometry = new THREE.PlaneGeometry(
    parent.offsetWidth,
    parent.offsetHeight,
    1
  );
  const mesh = new THREE.Mesh(geometry, material);
  scene.add(mesh);

  /* =============================
     ASPECT HELPERS
  ============================== */
  function updateImageAspect(tex) {
    material.uniforms.imageAspect.value.set(
      tex.image.width,
      tex.image.height
    );
  }

  function updateContainerAspect() {
    material.uniforms.containerAspect.value.set(
      parent.offsetWidth,
      parent.offsetHeight
    );
  }

  /* =============================
     API
  ============================== */
  this.next = () => {
    gsap.to(material.uniforms.dispFactor, {
      value: 1,
      duration: 1.2,
      ease: easing
    });
  };

  this.previous = () => {
    gsap.to(material.uniforms.dispFactor, {
      value: 0,
      duration: 1.2,
      ease: easing
    });
  };

  this.forceTransition = (img1, img2) => {
    gsap.killTweensOf(material.uniforms.dispFactor);

    material.uniforms.texture1.value = loadTexture(img1, updateImageAspect);
    material.uniforms.texture2.value = loadTexture(img2);

    material.uniforms.dispFactor.value = 0;

    gsap.to(material.uniforms.dispFactor, {
      value: 1,
      duration: 1.2,
      ease: "power2.out",
      onComplete: () => {
        material.uniforms.texture1.value =
          material.uniforms.texture2.value;
        material.uniforms.dispFactor.value = 0;
      }
    });
  };

  /* =============================
     RENDER LOOP
  ============================== */
  function animate() {
    renderer.render(scene, camera);
    requestAnimationFrame(animate);
  }
  animate();

  /* =============================
     RESIZE
  ============================== */
  window.addEventListener("resize", () => {
  const w = parent.offsetWidth;
  const h = parent.offsetHeight;

  camera.left = w / -2;
  camera.right = w / 2;
  camera.top = h / 2;
  camera.bottom = h / -2;
  camera.updateProjectionMatrix();

  renderer.setSize(w, h);

  mesh.geometry.dispose();
  mesh.geometry = new THREE.PlaneGeometry(w, h, 1, 1);

  material.uniforms.containerAspect.value.set(w, h);
});

};
