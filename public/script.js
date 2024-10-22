document.getElementById('pdfForm').addEventListener('submit', function (event) {
    event.preventDefault();

    const pdf1 = document.getElementById('pdf1').files[0];
    const pdf2 = document.getElementById('pdf2').files[0];

    if (!pdf1 || !pdf2) {
        alert('Por favor, selecione os dois arquivos PDF.');
        return;
    }

    const formData = new FormData();
    formData.append('pdf1', pdf1);
    formData.append('pdf2', pdf2);

    fetch('/compare-pdfs', {
        method: 'POST',
        body: formData,
    })
    .then(response => response.text())
    .then(result => {
        document.getElementById('result').classList.remove('hidden');
        document.getElementById('output').textContent = result;
    })
    .catch(error => {
        console.error('Erro ao comparar os PDFs:', error);
        alert('Ocorreu um erro ao comparar os PDFs.');
    });
});
