// The final, corrected script.js with auto-saving content

const createNoteBtn = document.querySelector('.add-note');
const notesContainer = document.querySelector('.app');

// =================================================================
// DEBOUNCE HELPER FUNCTION
// =================================================================
function debounce(func, delay = 500) { 
    let timeoutId;
    return (...args) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
            func.apply(this, args);
        }, delay);
    };
}


// =================================================================
// 1. EVENT LISTENER FOR THE MAIN "ADD NOTE" BUTTON
// =================================================================
createNoteBtn.addEventListener('click', async () => {
    try {
        const response = await fetch('http://localhost:3000/api/notes', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                text: '',
                pos_x: 50,
                pos_y: 50,
                color: '#F8B9D4'
            })
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.details || 'Failed to create note on the server.');
        }

        const newNote = await response.json();
        const noteElement = createNoteElement(newNote.id, newNote.text, newNote.pos_x, newNote.pos_y, newNote.color);
        notesContainer.appendChild(noteElement);

    } catch (error) {
        console.error('Error creating note:', error);
        alert('Error creating note: ' + error.message);
    }
});

async function loadNotes() {
    try {
        const response = await fetch('http://localhost:3000/api/notes');
        const notes = await response.json();
        notes.forEach(note => {
            const noteElement = createNoteElement(note.id, note.text, note.pos_x, note.pos_y, note.color);
            notesContainer.appendChild(noteElement);
        });
    } catch (error) {
        console.error('Error loading notes:', error);
    }
}

let activeNote = null;
let startX = 0, startY = 0;

// Set active note to current note
const setActiveNote = (note) => {
    activeNote = note
}

// =================================================================
// REUSABLE FUNCTION TO CREATE A SINGLE NOTE
// =================================================================
function createNoteElement(id, text, posX, posY, color) {
    const note = document.createElement('div');
    note.classList.add('note');
    note.style.left = `${posX}px`;
    note.style.top = `${posY}px`;
    note.style.backgroundColor = `${color}`;
    note.dataset.id = id;

    note.innerHTML = `
        <div class="note-header">
            <div class="delete">
                <img src="/images/x-mark.png" alt="delete icon">
            </div>
        </div>
        <div class="text-area">
            <textarea class="note-content" name="textarea" placeholder="Start typing..." spellcheck="false" >${text}</textarea>
        </div>
    `;

    setActiveNote(note)

    note.addEventListener('click', () => {
        note.style.zIndex++
        setActiveNote(note)
    })

    const header = note.querySelector('.note-header');
    header.addEventListener('mousedown', mouseDown);

    const deleteButton = note.querySelector('.delete');
    deleteButton.addEventListener('click', (e) => {
        e.stopPropagation();
        deleteNote(id, note);
    });

    const noteContent = note.querySelector('.note-content');
    
    const debouncedUpdate = debounce((noteId, newContent) => {
        updateNoteContent(noteId, newContent);
    }, 500);

    noteContent.addEventListener('input', () => {
        const newContent = noteContent.value;
        debouncedUpdate(id, newContent);
    });
    
    return note;
}

async function updateNotePosition(id, posX, posY) {
    try {
        await fetch(`http://localhost:3000/api/notes/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ pos_x: posX, pos_y: posY })
        });
    } catch (error) {
        console.error('Error updating position:', error);
    }
}

async function updateNoteContent(id, newContent) {
    try {
        await fetch(`http://localhost:3000/api/notes/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text: newContent })
        });
        console.log(`Note ${id} content saved.`);
    } catch (error) {
        console.error('Error updating content:', error);
    }
}

async function deleteNote(id, noteElement) {
    try {
        const response = await fetch(`http://localhost:3000/api/notes/${id}`, {
            method: 'DELETE'
        });
        if (response.ok) {
            noteElement.remove();
        }
    } catch (error) {
        console.error('Error deleting note:', error);
    }
}


function mouseDown(e) {
    if (e.target.closest('.note-header')) {
        activeNote = e.target.closest(".note");
        startX = e.clientX - activeNote.offsetLeft;
        startY = e.clientY - activeNote.offsetTop;
        document.addEventListener('mousemove', mouseMove);
        document.addEventListener('mouseup', mouseUp);
    }
}

function mouseMove(e) {
    if (!activeNote) return;
    activeNote.style.left = `${e.clientX - startX}px`;
    activeNote.style.top = `${e.clientY - startY}px`;
}

function mouseUp() {
    if (!activeNote) return;
    const finalX = activeNote.offsetLeft;
    const finalY = activeNote.offsetTop;
    const noteId = activeNote.dataset.id;
    updateNotePosition(noteId, finalX, finalY);
    activeNote = null;
    document.removeEventListener('mousemove', mouseMove);
    document.removeEventListener('mouseup', mouseUp);
}

async function changeColor(color) {

    if (activeNote) {
        activeNote.style.background = color;
        // Get the note's ID from the data attribute
        const noteId = activeNote.dataset.id;
        
        // Save the new color to the database
        try {
            await fetch(`http://localhost:3000/api/notes/${noteId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ color: color })
            });
        } catch (error) {
            console.error('Error updating color:', error);
        }
    }
}

document.querySelector(".green").addEventListener("click", () => changeColor("#A8E6A3"));
document.querySelector(".pink").addEventListener("click", () => changeColor("#F8B9D4"));
document.querySelector(".blue").addEventListener("click", () => changeColor("#A7D8E8"));
document.querySelector(".purple").addEventListener("click", () => changeColor("#D6A6D3"));

loadNotes();