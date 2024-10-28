document.addEventListener('DOMContentLoaded', () => {
    const imageUpload = document.getElementById('image-upload');
    const piecesNumberInput = document.getElementById('pieces-number');
    const startButton = document.getElementById('start-button');
    const restartButton = document.getElementById('restart-button');
    const puzzleContainer = document.querySelector('.puzzle-container');
    const piecesContainer = document.querySelector('.pieces-container');
    const message = document.getElementById('message');

    let image = new Image();
    let piecesNumber = 4;

    startButton.addEventListener('click', startGame);
    restartButton.addEventListener('click', restartGame);
    imageUpload.addEventListener('change', handleImageUpload);
    piecesNumberInput.addEventListener('change', (e) => {
        piecesNumber = parseInt(e.target.value);
    });

    function handleImageUpload(event) {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                image.src = e.target.result;
                image.onload = () => {
                    const maxDimension = 400;
                    if (image.width > maxDimension || image.height > maxDimension) {
                        const scale = Math.min(maxDimension / image.width, maxDimension / image.height);
                        image.width *= scale;
                        image.height *= scale;
                    }
                };
            };
            reader.readAsDataURL(file);
        }
    }

    function startGame() {
        if (!image.src) {
            alert('Please upload an image.');
            return;
        }
        createPuzzle(piecesNumber);
        shufflePieces();
        toggleUI(true);
    }

    function createPuzzle(piecesNumber) {
        puzzleContainer.innerHTML = '';
        piecesContainer.innerHTML = '';

        let rows = Math.floor(Math.sqrt(piecesNumber));
        let cols = Math.ceil(piecesNumber / rows);

        while (rows * cols < piecesNumber) {
            rows++;
            cols = Math.ceil(piecesNumber / rows);
        }

        const pieceWidth = image.width / cols;
        const pieceHeight = image.height / rows;

        puzzleContainer.style.width = `${image.width}px`;
        puzzleContainer.style.height = `${image.height}px`;

        for (let i = 0; i < piecesNumber; i++) {
            const row = Math.floor(i / cols);
            const col = i % cols;

            const dropZone = document.createElement('div');
            dropZone.classList.add('drop-zone');
            dropZone.dataset.id = i;
            dropZone.style.width = `${pieceWidth}px`;
            dropZone.style.height = `${pieceHeight}px`;
            dropZone.style.left = `${col * pieceWidth}px`;
            dropZone.style.top = `${row * pieceHeight}px`;
            puzzleContainer.appendChild(dropZone);

            const piece = document.createElement('div');
            piece.classList.add('puzzle-piece');
            piece.draggable = true;
            piece.dataset.id = i;
            piece.style.width = `${pieceWidth}px`;
            piece.style.height = `${pieceHeight}px`;
            piece.style.backgroundImage = `url(${image.src})`;
            piece.style.backgroundPosition = `-${col * pieceWidth}px -${row * pieceHeight}px`;
            piece.style.backgroundSize = `${image.width}px ${image.height}px`;
            piecesContainer.appendChild(piece);

            piece.addEventListener('dragstart', dragStart);
        }

        const dropZones = document.querySelectorAll('.drop-zone');
        dropZones.forEach(zone => {
            zone.addEventListener('dragover', dragOver);
            zone.addEventListener('drop', drop);
        });
    }

    function dragStart(event) {
        event.dataTransfer.setData('text/plain', event.target.dataset.id);
    }

    function dragOver(event) {
        event.preventDefault();
    }

    function drop(event) {
        event.preventDefault();
        const id = event.dataTransfer.getData('text/plain');
        const draggableElement = document.querySelector(`.puzzle-piece[data-id='${id}']`);
        const dropZoneId = event.target.dataset.id;

        if (id === dropZoneId) {
            event.target.appendChild(draggableElement);
            draggableElement.style.cursor = 'default';
            draggableElement.setAttribute('draggable', 'false');
            checkCompletion();
        }
    }

    function restartGame() {
        image.src = '';
        piecesNumber = 4;
        piecesNumberInput.value = piecesNumber;
        piecesContainer.innerHTML = '';
        puzzleContainer.innerHTML = '';
        imageUpload.value = '';
        message.textContent = '';
        toggleUI(false);
    }

    function shufflePieces() {
        const pieces = Array.from(piecesContainer.children);
        for (let i = pieces.length; i >= 0; i--) {
            piecesContainer.appendChild(pieces[Math.random() * i | 0]);
        }
    }

    function toggleUI(gameStarted) {
        imageUpload.style.display = gameStarted ? 'none' : 'block';
        piecesNumberInput.style.display = gameStarted ? 'none' : 'block';
        startButton.style.display = gameStarted ? 'none' : 'block';
        restartButton.style.display = gameStarted ? 'block' : 'none';
        message.style.display = 'none';
    }

    function checkCompletion() {
        const dropZones = document.querySelectorAll('.drop-zone');
        const completed = Array.from(dropZones).every(zone => {
            const piece = zone.querySelector('.puzzle-piece');
            return piece && piece.dataset.id === zone.dataset.id;
        });

        if (completed) {
            message.textContent = 'Congratulations! You completed the puzzle!';
            message.style.display = 'block';
            restartButton.style.display = 'none';
            setTimeout(() => {
                toggleUI(false);
            }, 5000);
        }
    }
});