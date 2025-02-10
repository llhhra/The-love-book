document.getElementById('upload-form').addEventListener('submit', async (e) => {

  e.preventDefault();

  const fileInput = document.getElementById('file-input');

  const file = fileInput.files[0];

  if (!file) {

    alert('Please select a PDF file.');

    return;

  }

  const formData = new FormData();

  formData.append('file', file);

  try {

    // Upload the file to the server

    const response = await fetch('/upload', {

      method: 'POST',

      body: formData,

    });

    const data = await response.json();

    if (data.success) {

      // Render the flipbook using Flipbook.js

      const flipbookContainer = document.getElementById('flipbook-container');

      flipbookContainer.innerHTML = ''; // Clear previous content

      flipbookContainer.style.display = 'block';

      const flipbook = new Flipbook({

        container: flipbookContainer,

        pages: data.pageImages, // Array of image URLs

        width: 800,

        height: 600,

      });

      flipbook.render();

    } else {

      alert('Failed to upload file.');

    }

  } catch (error) {

    console.error(error);

    alert('An error occurred while uploading the file.');

  }

});
const express = require('express');

const multer = require('multer');

const path = require('path');

const fs = require('fs');

const { PDFDocument } = require('pdf-lib');

const app = express();

const port = 3000;

// Set up storage for uploaded files

const storage = multer.diskStorage({

  destination: (req, file, cb) => {

    cb(null, 'uploads/');

  },

  filename: (req, file, cb) => {

    cb(null, Date.now() + path.extname(file.originalname)); // Append timestamp to avoid duplicates

  },

});

const upload = multer({ storage });

// Ensure the uploads directory exists

if (!fs.existsSync('uploads')) {

  fs.mkdirSync('uploads');

}

// Serve static files

app.use(express.static('public'));

// Route to handle file upload

app.post('/upload', upload.single('file'), async (req, res) => {

  if (!req.file) {

    return res.status(400).json({ success: false, message: 'No file uploaded.' });

  }

  const filePath = req.file.path;

  try {

    // Extract pages from the PDF

    const pdfBytes = fs.readFileSync(filePath);

    const pdfDoc = await PDFDocument.load(pdfBytes);

    const totalPages = pdfDoc.getPageCount();

    // Simulate generating image URLs for each page

    const pageImages = [];

    for (let i = 0; i < totalPages; i++) {

      pageImages.push(`/uploads/${req.file.filename}-page-${i + 1}.jpg`);

    }

    res.json({ success: true, pageImages });

  } catch (error) {

    console.error(error);

    res.status(500).json({ success: false, message: 'Failed to process PDF.' });

  }

});

// Start the server

app.listen(port, () => {

  console.log(`Server running at http://localhost:${port}`);

});