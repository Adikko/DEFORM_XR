/*
license:
THREE.js is licensed under the MIT license. Further reading: https://github.com/mrdoob/three.js/blob/dev/LICENSE
WebXR is licensed under the W3C license. FUrther reading: https://www.w3.org/Consortium/Legal/2015/copyright-software-and-document
This app contains parts of code copied from: developers.google.com/ar/develop/webxr/hello-webxr
developers.google.com code snippets are licensed under the Creative Commons Attribution 4.0 License. Further reading: https://creativecommons.org/licenses/by/4.0/
*/

async function activateXR() {
  // Add a canvas element and initialize a WebGL context that is compatible with WebXR.
  const canvas = document.createElement("canvas");
  document.body.appendChild(canvas);
  const gl = canvas.getContext("webgl", {xrCompatible: true});

  // Create three.js scene
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
        logo3d.scale.set(0.05,0.05,0.05);
    });
  });

  scene.add(logo3d);

  // Setting up a light source
  let light = new THREE.PointLight(0xFFFFFF);
  light.position.set(-10, 15, 50);
  scene.add(light);

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
  const session = await navigator.xr.requestSession("immersive-ar", {requiredFeatures: ['hit-test']});
  session.updateRenderState({
    baseLayer: new XRWebGLLayer(session, gl)
  });

  // A 'local' reference space has a native origin that is located
  // near the viewer's position at the time the session was created.
  const referenceSpace = await session.requestReferenceSpace('local');

  // Create another XRReferenceSpace that has the viewer as the origin.
  const viewerSpace = await session.requestReferenceSpace('viewer');
  // Perform hit testing using the viewer as origin.
  const hitTestSource = await session.requestHitTestSource({ space: viewerSpace });

  // Reticle helps the user with placing the 3D object in the scene
  const loader = new THREE.GLTFLoader();
  let reticle;
  loader.load("https://immersive-web.github.io/webxr-samples/media/gltf/reticle/reticle.gltf", function(gltf) {
    reticle = gltf.scene;
    reticle.visible = false;
    scene.add(reticle);
  })

  session.addEventListener("select", (event) => {
      if (logo3d) {
        const clone = logo3d.clone();
        clone.position.copy(reticle.position);
        scene.add(clone);
      }
  });

  /*
  // Add an exit button
  const exitButton = document.createElement("button");
  document.body.appendChild(exitButton);
  exitButton.classList.toggle('deform_xr_exitButton');
  document.getElementsByClassName('deform_xr_exitButton')[0].innerText = "EXIT AR";
  exitButton.addEventListener('click', onButtonClicked);

  function onButtonClicked() {
    session.end();
  }
  */

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

      const hitTestResults = frame.getHitTestResults(hitTestSource);
      if (hitTestResults.length > 0 && reticle) {
          const hitPose = hitTestResults[0].getPose(referenceSpace);
          reticle.visible = true;
          reticle.position.set(hitPose.transform.position.x, hitPose.transform.position.y, hitPose.transform.position.z)
          reticle.updateMatrixWorld(true);
      }

      if (hitTestResults.length > 0 && reticle) {
        const hitPose = hitTestResults[0].getPose(referenceSpace);
        reticle.visible = true;
        reticle.position.set(hitPose.transform.position.x, hitPose.transform.position.y, hitPose.transform.position.z)
        reticle.updateMatrixWorld(true);
    }

      // Render the scene with THREE.WebGLRenderer.
      renderer.render(scene, camera)
    }

  }
  session.requestAnimationFrame(onXRFrame);
}