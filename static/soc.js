let videoStream;
let video;
let canvas;
let recognizedNameDiv;
let recognizing = false;

async function toggleWebcam() {
    if (recognizing) {
        stopWebcam();
    } else {
        startWebcam();
    }
}

async function startWebcam() {
    try {
        await fetch('/recognize');

        videoStream = await navigator.mediaDevices.getUserMedia({ video: true });
        video = document.createElement('video');
        video.srcObject = videoStream;
        video.autoplay = true;

        const targetSection = document.getElementById('webcamContainer');
        targetSection.appendChild(video);

        canvas = document.getElementById('webcamCanvas');

    setInterval(() => {
           captureAndRecognize();
        },1000); 

        recognizing = true;
        document.querySelector('button').style.display = 'none';
    } catch (error) {
        console.error('Error accessing webcam:', error);
    }
}

function refreshPage() {
    location.reload();

}


function stopWebcam() {
    if (videoStream) {
        videoStream.getTracks().forEach(track => track.stop());
        video.remove();

        recognizing = false;
        document.querySelector('button').innerText = 'Start'; 
    }
}

async function captureAndRecognize() {
    if (!videoStream) {
        console.error('Webcam not started.');
        return;
    }
    const imageData = canvas.toDataURL('image/jpeg');

    const response = await fetch('/recognize', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ image: imageData }),
    });

    const data = await response.json();
    const resultDiv = document.getElementById('result');
    resultDiv.innerHTML = '';
    data.forEach(person => {
        const nameParts = person.name.split('_');
        if (nameParts.length === 2) {
            resultDiv.innerHTML += `<p>Name: ${nameParts[0]}</p>`;
            resultDiv.innerHTML += `<p>Class: ${nameParts[1].split('.')[0]}</p>`;
        } else {
            resultDiv.innerHTML += `<p>Unexpected name format: ${person.name}</p>`;
        }

       //resultDiv.innerHTML += `<p>Name: ${person.name} </p>`;
        
        // Check if a name is recognized
        if (person.name) {
            stopWebcam();
            captureAndRecognize = false;
            recognizing = false;
            document.querySelector('button').style.display = 'none';
            
            fetch('/send-pop', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ name: nameParts[0] }),
            });

            
        }
    });

}

// document.addEventListener('DOMContentLoaded', initializeWebcam);
