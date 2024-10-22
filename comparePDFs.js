const express = require('express');
const path = require('path');
const fs = require('fs');
const pdf = require('pdf-parse');

const app = express();
const port = 3001;

// Servindo arquivos estáticos (HTML, CSS, JS)
app.use(express.static(path.join(__dirname, 'public')));

// Função para ler e extrair texto de um PDF
function getPDFText(filePath) {
    return new Promise((resolve, reject) => {
        const dataBuffer = fs.readFileSync(filePath);
        pdf(dataBuffer).then(data => {
            resolve(data.text);
        }).catch(reject);
    });
}

// Função para encontrar as diferenças entre os textos
function findDifferences(text1, text2) {
    const lines1 = text1.split('\n').filter(line => line.trim() !== '');
    const lines2 = text2.split('\n').filter(line => line.trim() !== '');

    const onlyInPDF1 = lines1.filter(line => !lines2.includes(line));
    const onlyInPDF2 = lines2.filter(line => !lines1.includes(line));

    return { onlyInPDF1, onlyInPDF2 };
}

// Função para criar um arquivo de texto com as diferenças
async function createDiffTXT(differences, outputFilePath) {
    const { onlyInPDF1, onlyInPDF2 } = differences;

    const textContent = [];

    if (onlyInPDF1.length > 0) {
        textContent.push('Linhas presentes no PDF1 e ausentes no PDF2:\n');
        textContent.push(onlyInPDF1.map(line => `PDF1: ${line}`).join('\n'));
    } else {
        textContent.push('Não há linhas únicas no PDF1.\n');
    }

    textContent.push('\n'); // Linha em branco

    if (onlyInPDF2.length > 0) {
        textContent.push('Linhas presentes no PDF2 e ausentes no PDF1:\n');
        textContent.push(onlyInPDF2.map(line => `PDF2: ${line}`).join('\n'));
    } else {
        textContent.push('Não há linhas únicas no PDF2.\n');
    }

    fs.writeFileSync(outputFilePath, textContent.join('\n'));
}

// Função principal
async function main() {
    const pdf1Path = 'C://Users//JoséPedroAlvesdaSilv//Desktop//ProjetosWeb//comparerPDF//PDFfolder//pdf1.pdf';
    const pdf2Path = 'C://Users//JoséPedroAlvesdaSilv//Desktop//ProjetosWeb//comparerPDF//PDFfolder//pdf2.pdf';
    const outputPath = path.join(__dirname, 'public/output.txt');

    try {
        const pdf1Text = await getPDFText(pdf1Path);
        const pdf2Text = await getPDFText(pdf2Path);

        const different = pdf1Text !== pdf2Text;

        if (different) {
            const differences = findDifferences(pdf1Text, pdf2Text);
            await createDiffTXT(differences, outputPath);
            console.log('Os PDFs são diferentes e um novo arquivo de texto com as diferenças foi criado.');
        } else {
            console.log('Os PDFs são iguais.');
        }
    } catch (error) {
        console.error('Erro ao processar os PDFs:', error);
    }
}

// Executa a função principal
main();

// Inicia o servidor
app.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}`);
});


// Teste