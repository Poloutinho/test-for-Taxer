

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
        saveCertificate(file.name, certificateData);
        loadCertificates();
      };
      reader.readAsDataURL(file);
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

// Функція для розбору сертифіката та відображення інформації
  function parseCertificate(certificateData) {
    // Декодування сертифіката з формату base64
    const decodedCertificate = atob(certificateData);

    // Розбір ASN.1 структури сертифіката за допомогою бібліотеки asn1js
    const asn1 = asn1js.fromBER(stringToArrayBuffer(decodedCertificate));
    const certificate = new Certificate({ schema: asn1.result });

    // Отримання необхідних полів з сертифіката
    const serialNumber = certificate.serialNumber.valueBlock.valueHex;
    // Отримання інших полів інформації про сертифікат

    // Відображення інформації про сертифікат на сторінці
    displayCertificateInfo(serialNumber, /* інші дані */);
  }

  // Функція для відображення інформації про сертифікат
  function displayCertificateInfo(serialNumber, validity, subject, issuer, publicKeyInfo, signatureAlgorithm) {
    const certificateInfoHTML = `
        <h2>Certificate Information</h2>
        <p><strong>Serial Number:</strong> ${serialNumber}</p>
        <p><strong>Validity:</strong> ${validity}</p>
        <p><strong>Subject:</strong> ${subject}</p>
        <p><strong>Issuer:</strong> ${issuer}</p>
        <p><strong>Public Key Info:</strong> ${publicKeyInfo}</p>
        <p><strong>Signature Algorithm:</strong> ${signatureAlgorithm}</p>
    `;

    // Отримуємо елемент, куди ми будемо відображати інформацію про сертифікат
    const certificateInfoContainer = document.getElementById('certificate-info');

    // Відображаємо інформацію про сертифікат на сторінці
    certificateInfoContainer.innerHTML = certificateInfoHTML;
  }

  // Handle dropped files
  function handleFiles(files) {
    for (const file of files) {
        const reader = new FileReader();
        reader.onload = function (e) {
            const certificateData = e.target.result;
            const base64Certificate = btoa(certificateData); // Перетворення в Base64
            saveCertificate(file.name, base64Certificate); // Збереження сертифіката
            loadCertificates(); // Оновлення списку сертифікатів
        };
        reader.readAsBinaryString(file); // Читання файлу як бінарний рядок
    }
  }

  // Обробник події для вибору сертифіката зі списку
  certificateList.addEventListener('click', (e) => {
    e.preventDefault();
    if (e.target.tagName === 'A') {
        const name = e.target.dataset.name;
        const data = localStorage.getItem(name);
        parseCertificate(data);
    }
  });

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
