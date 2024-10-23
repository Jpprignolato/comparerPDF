const express = require('express');
const multer = require('multer');
const pdfParse = require('pdf-parse');
const fs = require('fs');
const path = require('path');
const app = express();
const port = 3000;

// Configuração do multer para armazenamento de uploads
const upload = multer({ dest: 'uploads/' });

app.use(express.static('public'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Função para ler e extrair texto do PDF
async function readPDF(filePath) {
    const dataBuffer = fs.readFileSync(filePath);
    const data = await pdfParse(dataBuffer);
    return data.text;
}

// Função para gerar HTML com as diferenças entre os PDFs
function generateHTMLForDifferences(differences) {
    let htmlContent = '<div class="pdf-comparison-result">';
    htmlContent += '<h2>Diferenças entre os PDFs</h2>';

    if (differences.onlyInPDF1.length > 0) {
        htmlContent += '<div class="pdf-section"><h3>Exclusivo do PDF 1</h3><ul>';
        differences.onlyInPDF1.forEach(diff => {
            htmlContent += `<li><span class="highlight-pdf1">${diff}</span></li>`;
        });
        htmlContent += '</ul></div>';
    }

    if (differences.onlyInPDF2.length > 0) {
        htmlContent += '<div class="pdf-section"><h3>Exclusivo do PDF 2</h3><ul>';
        differences.onlyInPDF2.forEach(diff => {
            htmlContent += `<li><span class="highlight-pdf2">${diff}</span></li>`;
        });
        htmlContent += '</ul></div>';
    }

    htmlContent += '</div>';
    return htmlContent;
}

// Função principal para comparar PDFs
async function comparePDFs(pdf1Path, pdf2Path) {
    const pdf1Text = await readPDF(pdf1Path);
    const pdf2Text = await readPDF(pdf2Path);

    const differences = {
        onlyInPDF1: [],
        onlyInPDF2: []
    };

    // Comparar os textos linha por linha
    const pdf1Lines = pdf1Text.split('\n');
    const pdf2Lines = pdf2Text.split('\n');

    pdf1Lines.forEach(line => {
        if (!pdf2Text.includes(line)) {
            differences.onlyInPDF1.push(line);
        }
    });

    pdf2Lines.forEach(line => {
        if (!pdf1Text.includes(line)) {
            differences.onlyInPDF2.push(line);
        }
    });

    return differences;
}

// Endpoint para upload e comparação de PDFs
app.post('/compare', upload.fields([{ name: 'pdf1' }, { name: 'pdf2' }]), async (req, res) => {
    const pdf1File = req.files['pdf1'][0];
    const pdf2File = req.files['pdf2'][0];

    try {
        // Obter o caminho dos arquivos PDF
        const pdf1Path = pdf1File.path;
        const pdf2Path = pdf2File.path;

        // Comparar os PDFs
        const differences = await comparePDFs(pdf1Path, pdf2Path);

        // Verificar se os PDFs são iguais
        if (differences.onlyInPDF1.length === 0 && differences.onlyInPDF2.length === 0) {
            res.send('<div class="message-equal">Os dois arquivos PDF são idênticos.</div>');
        } else {
            // Gerar o HTML com as diferenças
            const htmlResult = generateHTMLForDifferences(differences);
            res.send(htmlResult);
        }

    } catch (error) {
        res.status(500).send('Erro ao comparar PDFs: ' + error.message);
    }
});


// Endpoint para upload e comparação de PDFs
app.post('/compare', upload.fields([{ name: 'pdf1' }, { name: 'pdf2' }]), async (req, res) => {
    const pdf1File = req.files['pdf1'][0];
    const pdf2File = req.files['pdf2'][0];

    try {
        // Obter o caminho dos arquivos PDF
        const pdf1Path = pdf1File.path;
        const pdf2Path = pdf2File.path;

        // Comparar os PDFs
        const differences = await comparePDFs(pdf1Path, pdf2Path);

        // Gerar o HTML com as diferenças
        const htmlResult = generateHTMLForDifferences(differences);
        res.send(htmlResult);

    } catch (error) {
        res.status(500).send('Erro ao comparar PDFs: ' + error.message);
    }
});

app.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}`);
});
