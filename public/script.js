document.getElementById('pdfForm').addEventListener('submit', async function (e) {
    e.preventDefault();

    const pdf1File = document.getElementById('pdf1').files[0];
    const pdf2File = document.getElementById('pdf2').files[0];

    if (!pdf1File || !pdf2File) {
        alert('Por favor, selecione ambos os arquivos PDF.');
        return;
    }

    const formData = new FormData();
    formData.append('pdf1', pdf1File);
    formData.append('pdf2', pdf2File);

    const response = await fetch('/compare', {
        method: 'POST',
        body: formData
    });

    const result = await response.text();
    document.getElementById('result').innerHTML = result;
});
