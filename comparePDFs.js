const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const pdf = require('pdf-parse');

const app = express();
const upload = multer({ dest: 'uploads/' });
const port = 3000;

// Servindo arquivos estáticos
app.use(express.static(path.join(__dirname, 'public')));

// Função para ler o texto de um PDF
function getPDFText(filePath) {
    return new Promise((resolve, reject) => {
        const dataBuffer = fs.readFileSync(filePath);
        pdf(dataBuffer).then(data => resolve(data.text)).catch(reject);
    });
}

// Função para encontrar diferenças entre PDFs
function findDifferences(text1, text2) {
    const lines1 = text1.split('\n').filter(line => line.trim() !== '');
    const lines2 = text2.split('\n').filter(line => line.trim() !== '');

    const onlyInPDF1 = lines1.filter(line => !lines2.includes(line));
    const onlyInPDF2 = lines2.filter(line => !lines1.includes(line));

    return { onlyInPDF1, onlyInPDF2 };
}

// Endpoint para processar PDFs
app.post('/compare-pdfs', upload.fields([{ name: 'pdf1' }, { name: 'pdf2' }]), async (req, res) => {
    const pdf1Path = req.files['pdf1'][0].path;
    const pdf2Path = req.files['pdf2'][0].path;

    try {
        const pdf1Text = await getPDFText(pdf1Path);
        const pdf2Text = await getPDFText(pdf2Path);

        const differences = findDifferences(pdf1Text, pdf2Text);
        const result = [];

        if (differences.onlyInPDF1.length > 0) {
            result.push('Diferenças no PDF1:\n');
            result.push(differences.onlyInPDF1.join('\n'));
        } else {
            result.push('PDF1 não tem diferenças únicas.\n');
        }

        result.push('\n'); // Espaço entre os blocos

        if (differences.onlyInPDF2.length > 0) {
            result.push('Diferenças no PDF2:\n');
            result.push(differences.onlyInPDF2.join('\n'));
        } else {
            result.push('PDF2 não tem diferenças únicas.\n');
        }

        // Retorna o resultado como texto para ser exibido no frontend
        res.send(result.join('\n'));
    } catch (error) {
        console.error('Erro ao processar os PDFs:', error);
        res.status(500).send('Erro ao processar os PDFs.');
    } finally {
        // Remover os arquivos temporários após a comparação
        fs.unlinkSync(pdf1Path);
        fs.unlinkSync(pdf2Path);
    }
});

// Inicia o servidor
app.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}`);
});
