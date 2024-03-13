document.addEventListener('DOMContentLoaded', () => {
  const dropArea = document.getElementById('drop-area');
  const certificateList = document.getElementById('certificate-list');
  const certificateInfo = document.getElementById('certificate-info');
  const addCertificateBtn = document.getElementById('add-certificate-btn');

  // Load certificates from localStorage
  loadCertificates();

  // Handle file drop
  dropArea.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropArea.classList.add('highlight');
  });

  dropArea.addEventListener('dragleave', () => {
    dropArea.classList.remove('highlight');
  });

  dropArea.addEventListener('drop', (e) => {
    e.preventDefault();
    dropArea.classList.remove('highlight');
    const files = e.dataTransfer.files;
    handleFiles(files);
  });

  // Handle dropped files
  function handleFiles(files) {
    for (const file of files) {
        const reader = new FileReader();
        reader.onload = function (e) {
          const certificateData = e.target.result;
          console.log(certificateData);
          saveCertificate(file.name, certificateData);
          loadCertificates();
        };
        reader.readAsText(file);
    }
  }
  
  // Save certificate to localStorage
  function saveCertificate(name, data) {
    localStorage.setItem(name, data);
  }

  // Load certificates from localStorage
  function loadCertificates() {
    certificateList.innerHTML = '';
    for (let i = 0; i < localStorage.length; i++) {
      const name = localStorage.key(i);
      const row = `<tr><td><a href="#" data-name="${name}">${name}</a></td></tr>`;
      certificateList.innerHTML += row;
    }
  }

  // Handle certificate click
  certificateList.addEventListener('click', (e) => {
    e.preventDefault();
    if (e.target.tagName === 'A') {
      const name = e.target.dataset.name;
      const data = localStorage.getItem(name);
      parseCertificate(data);
    }
  });

  function parseCertificate(certificateData) {
    console.log(certificateData);
    const base64EncodedCertificate = certificateData;
    const certificateBytes = atob(base64EncodedCertificate);
    const certificateHex = Array.from(certificateBytes).map(byte => {
        return ('0' + byte.charCodeAt(0).toString(16)).slice(-2);
    }).join('');
    const certificateSchema = pkijs.fromBER(hexToArrayBuffer(certificateHex));
    const certificate = new pkijs.Certificate({ schema: certificateSchema.result });

    const serialNumber = certificate.serialNumber.valueBlock.valueHex;
    const issuerName = certificate.issuer.typesAndValues[0].value.valueBlock.value;

    // You can extract other necessary information from the certificate object

    displayCertificateInfo(serialNumber, issuerName);
  }

  function hexToArrayBuffer(hexString) {
      const buffer = new ArrayBuffer(hexString.length / 2);
      const view = new DataView(buffer);
      for (let i = 0; i < hexString.length; i += 2) {
          view.setUint8(i / 2, parseInt(hexString.substr(i, 2), 16));
      }
      return buffer;
  }

  // Display certificate information
  function displayCertificateInfo(serialNumber, issuerName) {
    const certificateInfoHTML = `
      <h2>Certificate Information</h2>
      <p><strong>Serial Number:</strong> ${serialNumber}</p>
      <p><strong>Issuer Name:</strong> ${issuerName}</p>
    `;

    certificateInfo.innerHTML = certificateInfoHTML;
  }

  // Handle add certificate button click
  addCertificateBtn.addEventListener('click', () => {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = '.pem,.der';

    fileInput.addEventListener('change', (event) => {
      const files = event.target.files;
      handleFiles(files);
    });

    fileInput.click();
  });
});
