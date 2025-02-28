
let nameParts;
let videoStream;
let video;
let canvas;
let recognizing = false;

canvas = document.getElementById('webcamCanvas');
canvas.style.display = 'none';
//////////EXCEL//////////////////
let originalExcelFileUrl = null; 
let workbookData = null; 
    function downloadOriginalExcel() {
        window.location.href = '/download_original_excel';
    }
    function fetchExcel() {
        fetch('/get_excel_data')
            .then(response => response.arrayBuffer())
             .then(data => {
                const workbook = XLSX.read(new Uint8Array(data), { type: 'array' });
                const sheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[sheetName];
                    workbookData = {
                        worksheet: worksheet,
                        displayOptions: {
                            border: 1, 
                            showHeaders: true,
                            showGridlines: false,
                        },
                        cellStyles: true,
                    };
                    updateExcelTable();
                    originalExcelFileUrl = URL.createObjectURL(new Blob([data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }));});}
    function closeExcel() {
            workbookData = null;
            originalExcelFileUrl = null;
            updateExcelTable();
        }

        function updateExcelTable() {
            if (!workbookData) {
                document.getElementById('excel-table').innerHTML = '';
                return;
            }
            const htmlTable = XLSX.utils.sheet_to_html(workbookData.worksheet, workbookData);
            document.getElementById('excel-table').innerHTML = htmlTable;
        }

 ////////////////// CustomAlert///////////////////////
 function CustomAlert(){
    this.alert = function(message,title){
      document.body.innerHTML = document.body.innerHTML + '<div id="dialogoverlay"></div><div id="dialogbox" class="slit-in-vertical"><div><div id="dialogboxhead"></div><div id="dialogboxbody"></div><div id="dialogboxfoot"></div></div></div>';
  
      let dialogoverlay = document.getElementById('dialogoverlay');
      let dialogbox = document.getElementById('dialogbox');
      
      let winH = window.innerHeight;
      dialogoverlay.style.height = winH+"px";
      
      dialogbox.style.top = "100px";
  
      dialogoverlay.style.display = "block";
      dialogbox.style.display = "block";
      
      document.getElementById('dialogboxhead').style.display = 'block';
  
      if(typeof title === 'undefined') {
        document.getElementById('dialogboxhead').style.display = 'none';
      } else {
        document.getElementById('dialogboxhead').innerHTML = '<i class="fa fa-exclamation-circle" aria-hidden="true"></i> '+ title;
      }
      document.getElementById('dialogboxbody').innerHTML = message;
      document.getElementById('dialogboxfoot').innerHTML = '<button class="pure-material-button-contained active" onclick="customAlert.ok()">OK</button>';
    }
    
    this.ok = function(){
      document.getElementById('dialogbox').style.display = "none";
      document.getElementById('dialogoverlay').style.display = "none";
    }
  }
  
  let customAlert = new CustomAlert();
/////////////////RECOGNIZEsys/////////////////////////////
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
  
          setInterval(() => {
              captureAndRecognize();
           },1000);
  
          recognizing = true;
          document.querySelector('button').style.display = 'none';
      } catch (error) {
          console.error('Error accessing webcam:', error);
      }
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
  
      const context = canvas.getContext('2d');
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
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
          nameParts = person.name.split('_');
  
          if (nameParts.length === 2) {
            //   resultDiv.innerHTML += `<img id="recImg" src="${imageData}">` 
              resultDiv.innerHTML += `<p>Name: ${nameParts[0]}</p>`;
              resultDiv.innerHTML += `<p>Class: ${nameParts[1].split('.')[0]}</p>`;
          } else {
              resultDiv.innerHTML += `<p>Unexpected name format: ${person.name}</p>`;
          }
        });
        await detectFaces(video,nameParts[0])
        canvas.style.display = 'block';
    if (data.length > 0 && data[0].name) {
          stopWebcam();
          captureAndRecognize = false;
          recognizing = false;
          
          if (nameParts && nameParts[0]) {
              sendRequest('/send-pop', { name: nameParts[0] })
                  .catch(error => console.error('Error:', error));
                      document.getElementById("btn1").disabled = false;
                      document.getElementById("btn2").disabled = false;
                      document.getElementById("btn3").disabled = false;
                      document.getElementById("btn4").disabled = false;
                      document.getElementById("btn5").disabled = false;
  
                      document.getElementById("btn1").style.cursor = 'auto';
                      document.getElementById("btn2").style.cursor = 'auto';
                      document.getElementById("btn3").style.cursor = 'auto';
                      document.getElementById("btn4").style.cursor = 'auto';
                  
                  
          }
      }
  }
  

  
////////////////MAIN FUNCTIONs/////////////////////////

  function refreshPage() {
      location.reload();
  }

  
  async function sendRequest(route, data = {}) {
    try {
        const response = await fetch(route, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });
        return await response.json();
    } catch (error) {
        console.error('Error:', error);
        return { status: 'error', message: `Error: ${error}` };
    }
}

function updateBonus() {
    sendRequest('/send-pop', { name: nameParts[0] })
    sendRequest('/update_bonus')
        .then(data => console.log(data))
        .catch(error => console.error('Error:', error));

    }

function updateMinus() {
    sendRequest('/send-pop', { name: nameParts[0] })
    sendRequest('/update_minus')
        .then(data => console.log(data))
        .catch(error => console.error('Error:', error));
}

function updateAlert() {
    sendRequest('/send-pop', { name: nameParts[0] })
    sendRequest('/update_alert')
        .then(data => console.log(data))
        .catch(error => console.error('Error:', error));
}


function addComment() {
    const commentInput = document.getElementById("comment");
    const comment = commentInput.value;
    sendRequest('/send-pop', { name: nameParts[0] })
    sendRequest('/add_comment', { comment })
        .then(data => console.log(data))
        .catch(error => console.error('Error:', error));

    commentInput.value = "";
}
