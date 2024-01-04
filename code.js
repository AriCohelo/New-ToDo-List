let notesArray = [];
let targetNote = null;

const phData = {
	title: 'Title',
	content: 'Take a note...',
};
const colors = [
	'#77172e',
	'#692b17',
	'#7c4a03',
	'#264d3b',
	'#0c625d',
	'#256377',
	'#284255',
	'#472e5b',
	'#6c394f',
	'#4b443a',
];

const creatorContainer = document.getElementById('creatorContainer');
const creatorTitle = document.getElementById('creatorTitle');
const creatorContent = document.getElementById('creatorContent');
const saveNoteButton = document.getElementById('saveNoteButton');
creatorTitle.placeholder = phData.title;
creatorContent.placeholder = phData.content;
saveNoteButton.addEventListener('click', newNote);

let notesContainer = document.createElement('div');
notesContainer.classList.add('notesContainer');
document.body.appendChild(notesContainer);

const colorDialogCont = document.createElement('dialog');
const colorDialog = document.createElement('div');
colorDialog.setAttribute('id', 'colorDialog');

class Note {
	constructor(index, title = '', content = '', backColor = '#4b443a', date) {
		this.index = index;
		this.title = title;
		this.content = content;
		this.backColor = backColor;
		this.date = date;
		this.ui = new NoteUI(this);
	}
}
class Storage {
	static save(array) {
		const arrayCopy = array.map((n) => {
			return {
				index: n.index,
				title: n.title,
				content: n.content,
				backColor: n.backColor,
				date: n.date,
			};
		});
		localStorage.setItem('notes', JSON.stringify(arrayCopy));
	}
	// Esto da el error "Uncaught TypeError: cyclic object value"
	// static save(notes) {
	// 	notes.map((note) => {
	// 		return {
	// 			index: note.index,
	// 			title: note.title,
	// 			content: note.content,
	// 			backColor: note.backColor,
	// 			date: note.date,
	// 		};
	// 	});
	// 	localStorage.setItem('notes', JSON.stringify(notes));
	// }
	static load() {
		const storedNotes = JSON.parse(localStorage.getItem('notes'));
		console.log(storedNotes);
		return storedNotes;
	}
}
class NoteUI {
	constructor(note) {
		this.note = note;
		this.render();
	}
	render() {
		const template = document.getElementById('template');
		const clone = document.importNode(template.content, true);
		const baseDiv = clone.querySelector('#baseDiv');
		const titleTextarea = clone.querySelector('#titleTextarea');
		const contentTextarea = clone.querySelector('#contentTextarea');
		const noteToolsContainer = clone.querySelector('#noteToolsContainer');
		const palleteSVG = clone.querySelector('#palleteSVG');
		const trashSVG = clone.querySelector('#trashcanSVG');
		const datePicker = clone.querySelector('#datePicker');

		baseDiv.append(titleTextarea, contentTextarea, noteToolsContainer);
		baseDiv.style.backgroundColor = this.note.backColor;
		notesContainer.appendChild(baseDiv);

		titleTextarea.textContent = this.note.title;
		contentTextarea.textContent = this.note.content;

		this.baseDiv = baseDiv;
		this.titleTextarea = titleTextarea;
		this.contentTextarea = contentTextarea;
		this.datePicker = datePicker;

		titleTextarea.addEventListener('input', () => {
			this.note.title = this.titleTextarea.value;
			this.update();
			Storage.save(notesArray);
		});
		contentTextarea.addEventListener('input', () => {
			this.note.content = this.contentTextarea.value;
			this.update();
			Storage.save(notesArray);
		});
		trashSVG.addEventListener('click', () => {
			this.deleteNote();
			Storage.save(notesArray);
		});
		palleteSVG.addEventListener('click', () => {
			targetNote = this;
			changeColor();
		});
		colorDialogCont.addEventListener('click', () => {
			colorDialog.innerHTML = '';
			colorDialogCont.close();
		});
		datePicker.addEventListener('change', () => {
			this.note.date = datePicker.value;
			this.update();
			Storage.save(notesArray);
			console.log(this.note);
		});
		this.update(); //Esta linea soluciono que la fecha no apareciese en reload
		//pero no me gusta. Porque todo lo de mas aparece en reload pero "date" no?
	}
	update() {
		this.titleTextarea.value = this.note.title;
		this.contentTextarea.value = this.note.content;
		this.baseDiv.style.backgroundColor = this.note.backColor;
		this.datePicker.value = this.note.date;
	}
	deleteNote() {
		notesContainer.removeChild(this.baseDiv);
		notesArray.splice(this.note.index, 1);
		for (let i = this.note.index; i < notesArray.length; i++) {
			notesArray[i].index = i;
		}
	}
}
function newNote() {
	const title = creatorTitle.value;
	const content = creatorContent.value;
	let newNote = new Note(notesArray.length || 0, title, content);
	notesArray.push(newNote);
	Storage.save(notesArray);
	creatorTitle.value = '';
	creatorContent.value = '';
}
function changeColor() {
	colorDialogCont.appendChild(colorDialog);
	document.body.appendChild(colorDialogCont);
	colorDialogCont.showModal();

	colors.forEach((color, index) => {
		let colorSquare = document.createElement('div');
		colorSquare.style.backgroundColor = color;
		colorSquare.classList.add('colorSquare');
		colorDialog.appendChild(colorSquare);
		colorSquare.addEventListener('click', (event) => {
			event.stopPropagation();
			targetNote.note.backColor = colors[index];
			targetNote.update();
			Storage.save(notesArray);
		});
	});
}
notesArray = (Storage.load() || []).map((n, index) => {
	return new Note(index, n.title, n.content, n.backColor, n.date);
});
