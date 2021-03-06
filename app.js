const VERSION = '1.0';

// Functions
function stripHtml(html) {
  let tmp = document.createElement("DIV");
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
      let range = document.createRange();
      range.selectNodeContents(el);
      range.collapse(false);
      let sel = window.getSelection();
      sel.removeAllRanges();
      sel.addRange(range);
  } else if (typeof document.body.createTextRange != "undefined") {
      let textRange = document.body.createTextRange();
      textRange.moveToElementText(el);
      textRange.collapse(false);
      textRange.select();
  }
}

// Notes
function createNote(text = '') {
  // Template
  let textField = document.createElement('p');
  textField.setAttribute('contenteditable', 'true');
  textField.setAttribute('spellcheck', 'false');
  textField.setAttribute('onblur', 'checkAndDeleteEmptyNotes()');
  textField.innerHTML = text

  // Element
  let wrapper = document.createElement('div');
  wrapper.className = 'note text';
  wrapper.appendChild(textField);
  return wrapper;
}

function createList(checkbox = 'blank', text = '', itemOnly = false) {
  let listItem = document.createElement('div');

  let checkboxElement = document.createElement('i');
  if (checkbox === 'blank') {
    checkboxElement.className = 'material-icons checkbox-blank';
    checkboxElement.innerHTML = 'check_box_outline_blank';
    listItem.className = 'list-item';
  } else {
    checkboxElement.className = 'material-icons checkbox';
    checkboxElement.innerHTML = 'check_box';
    listItem.className = 'list-item done';
  }
  checkboxElement.addEventListener("click", checkboxToggle);
  listItem.appendChild(checkboxElement);

  // Adding it to the list item
  let textField = document.createElement('p');
  textField.setAttribute('contenteditable', 'true');
  textField.setAttribute('spellcheck', 'false');
  textField.setAttribute('onblur', 'checkAndDeleteEmptyNotes()');
  textField.innerHTML = text
  listItem.appendChild(textField);

  if (itemOnly) {
    // Returning the list item only
    return listItem;
  } else {
    // Creating note and adding the first list Item
    let wrapper = document.createElement('div');
    wrapper.className = 'note list';
    wrapper.appendChild(listItem);
    return wrapper;
  }
}

function loadList(listItems) {
  let wrapper = document.createElement('div');
  wrapper.className = 'note list';
  listItems.forEach((listItem) => {
    wrapper.insertBefore(
      createList(listItem[0], listItem[1], true),
      wrapper.firstChild
    );
  });
  return wrapper;
}

// Creating the html for the notes
function notesToBoard() {
  notes.forEach( (note) => {
    if (note !== '') {
      let board = document.querySelector(".board");
      if (note[0] == 'text') {
        board.insertBefore(
          createNote(note[1]),
          board.firstChild
        );
      } else if (note[0] == 'list') {
        board.insertBefore(
          loadList(note[1]),
          //createList(note[1][0], note[1][1]),
          board.firstChild
        );
      }
    }
  });
}


// Saving data
var savedData = [];
setInterval(function() {
  let notesData = [{version:VERSION}];
  
  document.querySelectorAll(".note").forEach( (note) => {
    if (note.classList.contains('list')) {
      // Saving list items
      let listItemsData = [];
      note.childNodes.forEach((listItem) => {
        let listData = listItem;
        let checkbox;
        if (listData.children[0].classList[1] === 'checkbox-blank') {
          checkbox = 'blank';
        } else {
          checkbox = 'done';
        }
        let text = listData.children[1].innerHTML;

        // Adding list item to the todo-list
        listItemsData.unshift([checkbox, text]);
      });

      notesData.unshift(['list', listItemsData])
    } else {
      notesData.unshift(['text', note.firstChild.innerHTML]);
    }
  });


  // Check for changes on the db
  if (notesData != savedData) { 
    //console.log('Changes detexted. Saving.')
    console.log(notesData);
    localStorage.setItem('notesData', JSON.stringify(notesData));
    savedData = notesData;
  }
}, 1000);

// Removing note
function checkAndDeleteEmptyNotes() {
  document.querySelectorAll("div.note").forEach((divNote) => {
    let currentDiv = divNote;
    let parsedText;

    if (currentDiv.classList.contains('list')) {
      if (currentDiv.firstChild != null){
        parsedText = stripHtml(currentDiv.firstChild.children[1].innerHTML)
      ;
      }
    } else { // text
      parsedText = stripHtml(currentDiv.firstChild.innerHTML);
    }

    if (parsedText === '' || parsedText === '<br>' ) {
      if (currentDiv.firstChild !== document.activeElement) {
        currentDiv.parentElement.removeChild(currentDiv);
      }
    }
  });
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

// Key events and updates
document.onkeyup = keyup;
document.onkeydown = keydown;
function keydown(event){
  let keyCode = event.which;
  if (keyCode==8) { // Delete
    if (document.activeElement.parentElement.classList.contains('list-item')) {
      if (document.activeElement.innerHTML === '' || document.activeElement.innerHTML === '<br>') {
        //TODO move caret at previous list element
        document.activeElement.parentElement.remove();
        event.preventDefault();
        return false;
      }
    }
  }
  if (keyCode==13) { // Enter
    if (document.activeElement.parentElement.classList.contains('list-item')) {
      let newElement = document.activeElement.parentElement.parentElement.appendChild(createList(checkbox = 'blank', text = '', true));
      placeCaretAtEnd(newElement.children[1]);
      // Avoid enter being added
      event.preventDefault();
      return false;
    }
  }
}
function keyup(event){
  let keyCode = event.which;
  checkAndDeleteEmptyNotes();
}

// New note button
function createAndAddNote(noteType = 'text'){
  let randomClass = randId();
  let note;
  if (noteType === 'text') {
    note = createNote();
  } else {
    note = createList();
  }
  note.className += ' ' + randomClass;
  let board = document.querySelector(".board");
  board.insertBefore(note, board.firstChild);

  // Hiding tutorial
  updateTutorialDisplay();

  let element = document.querySelector('.' + randomClass + ' p');
  placeCaretAtEnd(element);
}


// Button inputs ------------------------
document.querySelector('.button-new-note').addEventListener("click", () => {
  createAndAddNote('text');
});
// Menu
document.querySelector('nav.main i.menu').addEventListener("click", () => {
  document.querySelector('.backup-menu').classList.toggle('open');
});
// Save
document.querySelector('.backup-menu .save').addEventListener("click", () => {
  alert(JSON.stringify(savedData));
});
// Load
document.querySelector('.backup-menu .load').addEventListener("click", () => {
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


// Checkbox -----------------------------
document.querySelector('nav .list').addEventListener("click", () => {
  createAndAddNote('list');
});

function checkboxToggle(event) {
  let listElement = event.target.parentElement;
  let noteElement = listElement.parentElement;
  if (event.target.innerHTML === 'check_box') {
    event.target.innerHTML = 'check_box_outline_blank';
    event.target.className = 'material-icons checkbox-blank'
    event.target.parentElement.className = 'list-item';
    // move to top
    noteElement.insertBefore(listElement, noteElement.firstChild);
  } else {
    event.target.innerHTML = 'check_box';
    event.target.className = 'material-icons checkbox'
    event.target.parentElement.className = 'list-item done';
    // move to bottom
    noteElement.appendChild(listElement);
  }
}


// Init ---------------
var notes = [];
// Loading data
if (localStorage.getItem('notesData') !== null) {
  try {
    var notes = JSON.parse(localStorage.getItem('notesData'));
  }
  catch(err) {
    alert('Data corrupted.');
  }
}
notesToBoard();
updateTutorialDisplay();