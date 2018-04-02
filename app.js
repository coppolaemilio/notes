// Functions
function stripHtml(html) {
  var tmp = document.createElement("DIV");
  tmp.innerHTML = html;
  return tmp.textContent || tmp.innerText || "";
}
function randId() {
  return Math.random().toString(36).replace(/[^a-z]+/g, '').substr(2, 10);
}
function placeCaretAtEnd(el) {
  //https://stackoverflow.com/questions/4233265/contenteditable-set-caret-at-the-end-of-the-text-cross-browser
  el.focus();
  if (typeof window.getSelection != "undefined"
          && typeof document.createRange != "undefined") {
      var range = document.createRange();
      range.selectNodeContents(el);
      range.collapse(false);
      var sel = window.getSelection();
      sel.removeAllRanges();
      sel.addRange(range);
  } else if (typeof document.body.createTextRange != "undefined") {
      var textRange = document.body.createTextRange();
      textRange.moveToElementText(el);
      textRange.collapse(false);
      textRange.select();
  }
}


function createNote(text) {
  // Template
  var template = '<p contenteditable="true" spellcheck="false" onblur="checkAndDeleteEmptyNotes()">{{ note_content }}</p>';
  // Element
  var wrapper = document.createElement('div');
  wrapper.className = "note";
  text = text.replace('<div>', '');
  text = text.replace('</div>', '');
  wrapper.innerHTML = template.replace('{{ note_content }}', text);
  return wrapper;
}

// Loading data
var notes = [];
if (localStorage.getItem('notesData') !== null) {
  try {
    var notes = JSON.parse(localStorage.getItem('notesData'));
  }
  catch(err) {
    alert('Data corrupted.');
    var notes = [];
  }
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
  var notesData = [];
  var divs = document.querySelectorAll("div.note");
  for (var i = 0; i < divs.length; i++) {
    var currentDiv = divs[i];
    notesData.unshift(currentDiv.firstChild.innerHTML)
  }
  console.log(notesData);
  localStorage.setItem('notesData', JSON.stringify(notesData));
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
    var randomClass = randId();
    var note = createNote(newNoteInput.value);
    note.className += ' ' + randomClass;
    var board = document.querySelector(".board");
    newNoteInput.value = '';
    board.insertBefore(note, board.firstChild);

    var element = document.querySelector('.' + randomClass + ' p');
    placeCaretAtEnd(element);
  }
}


// Menu
var menuIcon = document.querySelector('nav.main i.menu');
menuIcon.addEventListener("click", function() {
  document.querySelector('.backup-menu').classList.toggle('open');
});