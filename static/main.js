async function loadModels() {
  await faceapi.nets.ssdMobilenetv1.loadFromUri('/');
  await faceapi.nets.faceLandmark68Net.loadFromUri('/');
  await faceapi.nets.faceRecognitionNet.loadFromUri('/');
}

async function detectFaces(image,name) {
  const detections = await faceapi.detectAllFaces(image)
    .withFaceLandmarks()
    .withFaceDescriptors();

  let canvas = document.getElementById('webcamCanvas');
  // let context =canvas.getContext("2d");
  // context.drawImage(image, 200, 200);

  faceapi.draw.drawDetections(canvas, detections);
  // faceapi.draw.drawFaceLandmarks(canvas, detections);

  detections.forEach((detection) => {
    const { alignedRect } = detection;
    const box = alignedRect.box;
    new faceapi.draw.DrawTextField([name], box.topRight).draw(canvas);
  });
}

window.onload = async () => {
  // Wait for the models to load
  await loadModels();

};
