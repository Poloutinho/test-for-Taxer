document.addEventListener("DOMContentLoaded", () => {
  require([
    'https://unpkg.com/@lapo/asn1js/asn1.js',
    'https://unpkg.com/@lapo/asn1js/hex.js'
  ], function(ASN1, _Hex) {
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
                console.log("uploading certificate...");
                console.log(certificateData);
                saveCertificate(file.name, certificateData);
                loadCertificates();
              };
              reader.readAsBinaryString(file);
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
          const result = ASN1.decode(certificateData);
            if (result.typeName() !== 'SEQUENCE') {
                throw 'Неправильна структура конверта сертифіката (очікується SEQUENCE)';
            }
            console.log(result);
            // Отримайте значення поля issuer
            const issuer = result.issuer;

            console.log(issuer);
          displayCertificateInfo(issuer);
        }
      
        // Display certificate information
        function displayCertificateInfo(issuer) {
          const certificateInfoHTML = `
            <h2>Certificate Information</h2>
            <p><strong>Issuer Name:</strong> ${issuer}</p>
          `;


          // Вивід отриманих імен
          console.log("Issuer Name:", issuer);

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
});
  