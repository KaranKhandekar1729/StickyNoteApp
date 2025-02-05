
const createNote = document.querySelector('.add-note')

createNote.addEventListener('click', () => {
    const note = document.createElement('div')
    note.innerHTML = `
                    <div class="note-header">
                        <div class="delete">
                            <img id="delete" src="images/x-mark.png" alt="delete icon">
                        </div>
                    </div>
                    `


    document.body.appendChild(note)

    note.classList.add('note')

    activeNote = note;

    note.querySelector('.note-header').addEventListener('mousedown', mouseDown)

    // Changing the Color for the selected note

    note.addEventListener('click', changeColor)

    // Deleting the note

    const deleteButton = note.querySelector('.delete');
    deleteButton.addEventListener('click', (e) => {
        e.stopPropagation(); // Prevents event bubbling to the note header
        note.remove(); // Remove the note from the DOM
    });
})

let startX = 0, startY = 0, newX = 0, newY = 0;

function mouseDown(e) {

    if (e.target.closest('.note-header')) {
        const note = e.target.closest(".note");

        startX = e.clientX
        startY = e.clientY


        function mouseMove(e) {
            newX = startX - e.clientX
            newY = startY - e.clientY

            startX = e.clientX
            startY = e.clientY

            note.style.top = (note.offsetTop - newY) + 'px'
            note.style.left = (note.offsetLeft - newX) + 'px'
        }

        function mouseUp() {
            document.removeEventListener('mousemove', mouseMove);
            document.removeEventListener('mouseup', mouseUp);
        }

        document.addEventListener('mousemove', mouseMove)
        document.addEventListener('mouseup', mouseUp)
    }

}

function changeColor(color) {
    if (activeNote) {
        activeNote.style.background = color;
    }
}

document.querySelector(".green").addEventListener("click", () => changeColor("#A8E6A3"));
document.querySelector(".pink").addEventListener("click", () => changeColor("#F8B9D4"));
document.querySelector(".blue").addEventListener("click", () => changeColor("#A7D8E8"));
document.querySelector(".purple").addEventListener("click", () => changeColor("#D6A6D3"));

