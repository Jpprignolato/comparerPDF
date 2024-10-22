document.addEventListener('DOMContentLoaded', () => {
    fetch('output.txt')
        .then(response => response.text())
        .then(data => {
            const outputElement = document.getElementById('output');
            
            // Dividindo o texto em linhas
            const lines = data.split('\n');

            // Iterando por cada linha e aplicando a classe correta
            lines.forEach(line => {
                const span = document.createElement('span');
                
                if (line.startsWith('PDF1:')) {
                    span.classList.add('pdf1');
                } else if (line.startsWith('PDF2:')) {
                    span.classList.add('pdf2');
                }

                span.textContent = line;
                outputElement.appendChild(span);
                outputElement.appendChild(document.createElement('br')); // Para criar a quebra de linha
            });
        })
        .catch(err => console.error('Erro ao carregar o arquivo:', err));
});
