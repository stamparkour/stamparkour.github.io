//-@ts-check
class Question {
	question;
	labels;
	effect;

	/**
	 * 
	 * @param {string} question
	 * @param {Array<string>} labels
	 * @param {Array<string>} effect
	 */
	constructor(question, labels, effect) {
		this.question = question;
		this.labels = labels;
		this.effect = effect;
	}

	apply() {
		form.question.innerHTML = this.question;
		form.labels.forEach((v, i) => {
			if (i >= this.labels.length) {
				v.classList.add("hidden");
				form.buttons[i].classList.add("hidden");
			}
			else {
				v.classList.remove("hidden");
				form.buttons[i].classList.remove("hidden");
				v.innerHTML = this.labels[i];
			}
		});
	}

	applyEffect(index) {
		this.effect[index] = this.effect[index].replace(" ", "");
		let arr = this.effect[index].split(',');

		arr.forEach((val, i) => {
			let a = val.split(':');
			let num = +a[2].substring(1);
			let op = a[2][0];
			for (state in states) {
				var v = (states[state].descriptor + " all " + state).split(" ");
				if (v.includes(a[0])) {
					if (op == "+") {
						states[state][a[1]] += num;
						states[state].fix();
					}
					else if (op == "-") {
						states[state][a[1]] -= num;
						states[state].fix();
					}
					else if (op == "/") {
						states[state][a[1]] /= num;
						states[state].fix();
					}
					else if (op == "*") {
						states[state][a[1]] *= num;
						states[state].fix();
					}
				}
			}
		});
	}
}

class State {
	democrat;
	republican;
	votes;
	element;
	descriptor;
	/**
	 * 
	 * @param {Number} votes 
	 * @param {Number} democrat 
	 * @param {Number} republican 
	 * @param {HTMLElement} element 
	 * @param {string} descriptor 
	 */
	constructor(votes, democrat, republican, element, descriptor ) {
		/**
		 * 
		 * @param {MouseEvent} event
		 * @param {State} state
		 */
		let checkState = function (event, state) {
			stateStatus.element.classList.remove("hidden")
			state.element.appendChild(stateStatus.element);
			stateStatus.democrat.innerHTML = state.democratVote;
			stateStatus.republican.innerHTML = state.republicanVote;
			stateStatus.other.innerHTML = state.otherVote;
		}


		/**
		 * 
		 * @param {MouseEvent} event
		 * @param {State} state
		 */
		let checkStateLeave = function (event, state) {
			stateStatus.element.classList.add("hidden")
		}

		this.votes = votes;
		this.democrat = democrat;
		this.republican = republican;
		this.element = element;
		this.descriptor = descriptor;

		this.element.addEventListener("mouseenter", (event) => { checkState(event, this) });
		this.element.addEventListener("mouseleave", (event) => { checkStateLeave(event, this) });
	}

	set other(v) {
		this.democrat /= 1 + v;
		this.republican /= 1 + v;
	}

	get other() {
		return 1 - (this.democrat + this.republican);
	}

	fix() {
		if (this.democrat < 0) this.democrat = 0;
		if (this.republican < 0) this.republican = 0;
		let v = this.democrat + this.republican;
		if(v > 1) {
			this.democrat /= v;
			this.republican /= v;
		}
	}

	get democratVote() {
		return Math.round(this.democrat * this.votes);
	}

	get republicanVote() {
		return Math.round(this.republican * this.votes);
	}

	get otherVote() {
		return Math.round(this.votes - (this.democratVote + this.republicanVote));
	}

	applyWinner() {
		this.element.innerHTML = this.getWinner();
		this.applyColor();
	}

	applyColor() {
		let v = ((this.democrat - this.republican) / (this.democrat + this.republican)) / 2 + 0.5;
		this.element.style.backgroundColor = `rgb(${(1 - v) * 127 + 128}, 128, ${v * 127 + 128})`;
	}

	getWinner() {
		this.fix();
		if (this.democrat > this.republican) return "Democrat: " + this.democratVote;
		if (this.democrat <= this.republican) return "Republican: " + this.republicanVote;

		console.error("ERROR");
	}
}

class StateTotal {
	democrat;
	republican;
	votes;
	element;
	/**
	 * 
	 * @param {Number} votes 
	 * @param {Number} democrat 
	 * @param {Number} republican 
	 * @param {HTMLElement} element 
	 */
	constructor(votes, democrat, republican, element) {
		/**
		 * 
		 * @param {MouseEvent} event
		 * @param {State} state
		 */
		let checkState = function (event, state) {
			stateStatus.element.classList.remove("hidden")
			state.element.appendChild(stateStatus.element);
			stateStatus.democrat.innerHTML = state.democrat;
			stateStatus.republican.innerHTML = state.republican;
			stateStatus.other.innerHTML = state.other;
		}


		/**
		 * 
		 * @param {MouseEvent} event
		 * @param {State} state
		 */
		let checkStateLeave = function (event, state) {
			stateStatus.element.classList.add("hidden")
		}

		this.votes = votes;
		this.democrat = democrat;
		this.republican = republican;
		this.element = element;

		this.element.addEventListener("mouseenter", (event) => { checkState(event, this) });
		this.element.addEventListener("mouseleave", (event) => { checkStateLeave(event, this) });
	}
	get other() {
		return this.votes - (this.democrat + this.republican);
	}

	applyWinner() {
		this.element.innerHTML = this.getWinner();
		this.applyColor();
	}

	applyColor() {
		let v = ((this.democrat - this.republican) / (this.democrat + this.republican)) / 2 + 0.5;
		this.element.style.backgroundColor = `rgb(${(1 - v) * 127 + 128}, 128, ${v * 127 + 128})`;
	}

	getWinner() {
		if (this.democrat > this.republican) return "Democrat: " + this.democrat;
		if (this.democrat <= this.republican) return "Republican: " + this.republican;

		console.error("ERROR");
	}
}

var states;
var stateStatus = {
	/** @type HTMLElement */
	element: null,
	/** @type HTMLElement */
	democrat: null,
	/** @type HTMLElement */
	republican: null,
	/** @type HTMLElement */
	other: null,
};

var total;
var quest;
var form = {
	/** @type HTMLElement */
	submit : null,
	/** @type Array<HTMLElement> */
	buttons: null,
	/** @type Array<HTMLElement> */
	labels: null,
	/** @type HTMLElement */
	question: null
};
/** @type Array<Question> */
var questions = [
	new Question("Do you hate Florida", ["yes", "no"],
		[
			"north:democrat:+0.1, east:republican:+0.02, florida:democrat:-0.2, south:republican:+0.2",
			"south:democrat:+0.1, newYork:other:+0.2",
		]),
	new Question("Do you support the independence of texas", ["yes", "no", "no comment"],
		[
			"ohioBasin:democrat:+0.1, east:democrat:+0.02, florida:republican:-0.1, north:republican:+0.2",
			"newEngland:democrat:+0.1, florida:republican:+0.2",
			"south:democrat:+0.02, all:other:+0.3",
		]),
	new Question("Do you like guns", ["perhaps", "no"],
		[
			"all:republican:+0.2, florida:republican:+0.1, north:republican:-0.15",
			"newEngland:democrat:+0.1, florida:democrat:+0.2, east:other:+0.1",
		]),
];

function init() {
	stateStatus.element = document.getElementById("stateStatus");
	stateStatus.democrat = document.getElementById("stateStatusDemocrat");
	stateStatus.republican = document.getElementById("stateStatusRepublican");
	stateStatus.other = document.getElementById("stateStatusOther");

	form.question = document.getElementById("question");
	form.submit = document.getElementById("questionSubmit");
	form.submit.addEventListener("click", submitForm);
	form.buttons = [...document.getElementsByClassName("button")];
	form.labels = [...document.getElementsByClassName("buttonOption")];
	
	states = {
		newYork: new State(28, 0.8, 0.1, document.getElementById("newYork"), "north east newEngland"),
		georgia: new State(16, 0.3, 0.2, document.getElementById("georgia"), "south east"),
		florida: new State(30, 0.2, 0.5, document.getElementById("florida"), "south east"),
		massachussetts: new State(30, 0.3, 0.4, document.getElementById("massachussetts"), "east north newEngland"),
		ohio: new State(30, 0.6, 0.1, document.getElementById("ohio"), "ohioBasin east north"),
	}
	total = new StateTotal(0, 0, 0, document.getElementById("total"));

	for (state in states) {
		states[state].applyWinner();
	}

	submitForm();
}

function submitForm() {
	let selected = -1;

	form.buttons.forEach((v, i) => { if (v.checked) { selected = i; v.checked = false; } });
	if (selected >= 0) quest.applyEffect(selected);
	else if (quest) return;
	quest = questions[Math.floor(Math.random() * questions.length)];
	quest.apply();


	let dem = 0;
	let rep = 0;
	let tot = 0;
	for (state in states) {
		states[state].applyWinner();
		dem += states[state].democratVote;
		rep += states[state].republicanVote;
		tot += states[state].votes;
	}
	total.votes = tot;
	total.democrat = dem;
	total.republican = rep;

	total.applyWinner();
}