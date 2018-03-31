// Functions
function stripHtml(html) {
  var tmp = document.createElement("DIV");
  tmp.innerHTML = html;
  return tmp.textContent || tmp.innerText || "";
}

function createNote(text) {
  // Template
  var template = '<p contenteditable="true" spellcheck="false" onblur="checkAndDeleteEmptyNotes()">{{ note_content }}</p>';
  // Element
  var wrapper = document.createElement('div');
  wrapper.className = "note";
  wrapper.innerHTML = template.replace('{{ note_content }}', text);
  return wrapper;
}

// Loading data
var notes = [];
if (localStorage.getItem('notesData') !== null) {
  var notes = localStorage.getItem('notesData').split('{/}'); 
}

// Creating the html for the notes
for (i = 0; i < notes.length; i++) {
  if (notes[i] !== '') {
    var note = createNote(notes[i]);
    
    // Adding the notes to the board
    var board = document.querySelector(".board");
    board.insertBefore(note, board.firstChild);
  }
}

// Saving data
setInterval(function() {
  var notesData = '';
  var divs = document.querySelectorAll("div.note");
  for (var i = 0; i < divs.length; i++) {
    var currentDiv = divs[i];
    notesData = currentDiv.firstChild.innerHTML + '{/}' + notesData;
  }
  console.log(notesData);
  localStorage.setItem('notesData', notesData);
}, 1000);



// Removing note
function checkAndDeleteEmptyNotes(){
  var divs = document.querySelectorAll("div.note");
  for (var i = 0; i < divs.length; i++){
    var currentDiv = divs[i];
    var parsedText = stripHtml(currentDiv.firstChild.innerHTML);

    if (parsedText == '') {
      if (currentDiv.firstChild !== document.activeElement) {
        currentDiv.parentElement.removeChild(currentDiv);
      }
    }
  }
}

// Key up event and updates
document.onkeyup = keyup;
function keyup(event){
  var keyCode = event.which;
  console.log(keyCode);
  if (keyCode==13) {
    console.log('enter!');
  }
  
  checkAndDeleteEmptyNotes();

  // Creating note
  var newNoteInput = document.querySelector('.new-note');
  if (newNoteInput.value != '') {
    var note = createNote(newNoteInput.value);
    var board = document.querySelector(".board");
    newNoteInput.value = '';
    board.insertBefore(note, board.firstChild);
  }
}