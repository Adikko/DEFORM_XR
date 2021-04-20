async function activateXR() {
    // Add a canvas element and initialize a WebGL context that is compatible with WebXR.
    const canvas = document.createElement("canvas");
    document.body.appendChild(canvas);
    const gl = canvas.getContext("webgl", {xrCompatible: true});
  
    const scene = new THREE.Scene();
  

    // Loading a model

    let logo3d = null;

    const mtlLoader = new THREE.MTLLoader();
    mtlLoader.load('./3D/3d_logo_opened.mtl', function(materials) {
        materials.preload();
        const objLoader = new THREE.OBJLoader();
        objLoader.setMaterials(materials);
        objLoader.load('./3D/3d_logo_opened.obj', function(object) {

            logo3d = object; //accessing the global variable
            logo3d.position.x = -10;
            logo3d.position.y = 0;
            logo3d.position.z = 0;
            logo3d.scale.x = 10;
            logo3d.scale.y = 10;
            logo3d.scale.z = 10;
            logo3d.rotation.x = Math.PI * 0.25;
            logo3d.rotation.y = Math.PI * -0.25;
        });
    });
  
    // Create the cube and add it to the demo scene.
    const cube = new THREE.Mesh(new THREE.BoxBufferGeometry(0.2, 0.2, 0.2), materials);
    cube.position.set(1, 1, 1);
    scene.add(cube);
  
    // Set up the WebGLRenderer, which handles rendering to the session's base layer.
    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      preserveDrawingBuffer: true,
      canvas: canvas,
      context: gl
    });
    renderer.autoClear = false;
  
    // The API directly updates the camera matrices.
    // Disable matrix auto updates so three.js doesn't attempt
    // to handle the matrices independently.
    const camera = new THREE.PerspectiveCamera();
    camera.matrixAutoUpdate = false;
  
    // Initialize a WebXR session using "immersive-ar".
    const session = await navigator.xr.requestSession("immersive-ar");
    session.updateRenderState({
      baseLayer: new XRWebGLLayer(session, gl)
    });
  
    // A 'local' reference space has a native origin that is located
    // near the viewer's position at the time the session was created.
    const referenceSpace = await session.requestReferenceSpace('local');
  
    // Create a render loop that allows us to draw on the AR view.
    const onXRFrame = (time, frame) => {
      // Queue up the next draw request.
      session.requestAnimationFrame(onXRFrame);
  
      // Bind the graphics framebuffer to the baseLayer's framebuffer
      gl.bindFramebuffer(gl.FRAMEBUFFER, session.renderState.baseLayer.framebuffer)
  
      // Retrieve the pose of the device.
      // XRFrame.getViewerPose can return null while the session attempts to establish tracking.
      const pose = frame.getViewerPose(referenceSpace);
      if (pose) {
        // In mobile AR, we only have one view.
        const view = pose.views[0];
  
        const viewport = session.renderState.baseLayer.getViewport(view);
        renderer.setSize(viewport.width, viewport.height)
  
        // Use the view's transform matrix and projection matrix to configure the THREE.camera.
        camera.matrix.fromArray(view.transform.matrix)
        camera.projectionMatrix.fromArray(view.projectionMatrix);
        camera.updateMatrixWorld(true);
  
        // Render the scene with THREE.WebGLRenderer.
        renderer.render(scene, camera)
      }
    }
    session.requestAnimationFrame(onXRFrame);
  }