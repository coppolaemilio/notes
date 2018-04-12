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


function createNote(text = '') {
  // Template
  var textField = document.createElement('p');
  textField.setAttribute('contenteditable', 'true');
  textField.setAttribute('spellcheck', 'false');
  textField.setAttribute('onblur', 'checkAndDeleteEmptyNotes()');
  textField.innerHTML = text

  // Element
  var wrapper = document.createElement('div');
  wrapper.className = "note";
  wrapper.appendChild(textField);
  return wrapper;
}

function createList(checkbox = false, text = '') {
  var listItem = document.createElement('div');
  listItem.className = 'list-item';

  var checkbox = document.createElement('i');
  if (checkbox) {
    checkbox.className = 'material-icons checkbox-blank';
    checkbox.innerHTML = 'check_box_outline_blank';
  } else {
    checkbox.className = 'material-icons checkbox';
    checkbox.innerHTML = 'check_box';
  }
  checkbox.addEventListener("click", checkboxToggle);
  listItem.appendChild(checkbox);

  // Adding it to the list item
  var textField = document.createElement('p');
  textField.setAttribute('contenteditable', 'true');
  textField.setAttribute('spellcheck', 'false');
  textField.setAttribute('onblur', 'checkAndDeleteEmptyNotes()');
  textField.innerHTML = text
  listItem.appendChild(textField);

  // Creating note and adding the first list Item
  var wrapper = document.createElement('div');
  wrapper.className = "note";
  wrapper.appendChild(listItem);
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
function notesToBoard(){
  for (i = 0; i < notes.length; i++) {
    if (notes[i] !== '') {
      if (notes[i][0] == 'text') {
        var note = createNote(notes[i][1]);
      } else {
        var note = createList(notes[i][1][0], notes[i][1][1]);
      }
      
      // Adding the notes to the board
      var board = document.querySelector(".board");
      board.insertBefore(note, board.firstChild);
    }
  }
}
// Adding them on load
notesToBoard();

// If there are notes loaded hide the tutorial
updateTutorialDisplay();


// Saving data
var savedData = [];
setInterval(function() {
  var notesData = [];
  var divs = document.querySelectorAll(".note");
  for (var i = 0; i < divs.length; i++) {
    var currentDiv = divs[i];
    if (currentDiv.classList.contains('list')) {
      notesData.unshift(['list', currentDiv.firstChild.innerHTML])
    } else {
      notesData.unshift(['text', currentDiv.firstChild.innerHTML]);
    }
  }

  console.log(notesData);

  savedData = notesData;
  localStorage.setItem('notesData', JSON.stringify(notesData));
}, 1000);

// Removing note
function checkAndDeleteEmptyNotes(){
  var divs = document.querySelectorAll("div.note");
  for (var i = 0; i < divs.length; i++){
    var currentDiv = divs[i];
    var parsedText = stripHtml(currentDiv.firstChild.innerHTML);

    if (parsedText === '' || currentDiv.firstChild.innerHTML === '<br>' ) {
      if (currentDiv.firstChild !== document.activeElement) {
        currentDiv.parentElement.removeChild(currentDiv);
      }
    }
  }
  
  updateTutorialDisplay();
}

// Update tutorial display
function updateTutorialDisplay() {
  if (document.querySelector('.board').childElementCount) {
    document.querySelector('.no-notes').classList.remove('show');
  } else {
    document.querySelector('.no-notes').classList.add('show');
  }
}

// Key up event and updates
document.onkeyup = keyup;
function keyup(event){
  var keyCode = event.which;
  //console.log(keyCode);
  if (keyCode==13) {
    // Enter
  }
  
  checkAndDeleteEmptyNotes();
}

// New note button
function createAndAddNote(noteType = 'text'){
  var randomClass = randId();
  if (noteType === 'text') {
    var note = createNote();
  } else {
    var note = createList();
  }
  note.className += ' ' + randomClass;
  var board = document.querySelector(".board");
  board.insertBefore(note, board.firstChild);

  // Hiding tutorial
  updateTutorialDisplay();

  var element = document.querySelector('.' + randomClass + ' p');
  placeCaretAtEnd(element);
}

var noteIcon = document.querySelector('.button-new-note');
noteIcon.addEventListener("click", function() {
  createAndAddNote('text');
});

// Menu
var menuIcon = document.querySelector('nav.main i.menu');
menuIcon.addEventListener("click", function() {
  document.querySelector('.backup-menu').classList.toggle('open');
});

var saveButton = document.querySelector('.backup-menu .save');
saveButton.addEventListener("click", function() {
  alert(JSON.stringify(savedData));
});

var loadButton = document.querySelector('.backup-menu .load');
loadButton.addEventListener("click", function() {
  var loadedData = prompt("Paste your string here", "");
  if (loadedData == null || loadedData == "") {
    alert("No data was loaded.");
  } else {
    var notes = JSON.parse(loadedData);
    // clearing board
    document.querySelector('section.board').innerHTML = '';
    // ading loaded data
    notesToBoard();
  } 
});

// Checkbox

var listButton = document.querySelector('nav .list');
listButton.addEventListener("click", function() {
  createAndAddNote('list');
});

function checkboxToggle(event) {
  if (event.target.innerHTML === 'check_box') {
    event.target.innerHTML = 'check_box_outline_blank';
    event.target.className = 'material-icons checkbox-blank'
  } else {
    event.target.innerHTML = 'check_box';
    event.target.className = 'material-icons checkbox'
  }
  console.log(event.target);
}