function setupGameDimensions() {
    let ratio = 1056 / 691;
    CardWidth = .8 * 96;
    CardHeight = ratio * .8 * 96;
    let rect = document.getElementById("gameBoard").getBoundingClientRect();
    gameWidth = rect.width;
    gameHeight = rect.height;
    gameLeft = rect.left;
    gameTop = rect.top;
    rect = document.getElementById("player1").getBoundingClientRect();
    player1X = rect.left + rect.width / 2 - gameLeft;
    player1Y = rect.top + rect.height / 2- gameTop;
    rect = document.getElementById("player2").getBoundingClientRect();
    player2X = rect.left + rect.width / 2 - gameLeft;
    player2Y = rect.top + rect.height / 2- gameTop;
    rect = document.getElementById("player3").getBoundingClientRect();
    player3X = rect.left + rect.width / 2 - gameLeft;
    player3Y = rect.top + rect.height / 2- gameTop;
    rect = document.getElementById("player4").getBoundingClientRect();
    player4X = rect.left + rect.width / 2 - gameLeft;
    player4Y = rect.top + rect.height / 2- gameTop;
    rect = document.getElementById("drawPile").getBoundingClientRect();
    playFieldX = rect.left + rect.width / 2 - gameLeft;
    playFieldY = rect.top + rect.height / 2 - gameTop;
}
var gameLeft;
var gameTop;
var gameWidth;
var gameHeight;
var CardWidth;
var CardHeight;
var player1X;
var player1Y;
var player2X;
var player2Y;
var player3X;
var player3Y;
var player4X;
var player4Y;
var playFieldX;
var playFieldY;
setupGameDimensions();

const urlParams = new URLSearchParams(window.location.search);

class Card {
    rank;
    suit;
    img;
    src;
    backSrc;
    #isShown;
    #isSelected;
    #depth;
    constructor(rank, suit, src, backSrc) {
        this.#depth = 0;
        this.#isSelected = false;
        this.#isShown = true;
        this.rank = rank;
        this.suit = suit;
        this.img = new Image();
        this.img.src = src;
        this.img.classList.add("playingCard");
        document.getElementById("cardDisplay").appendChild(this.img);
        this.src = src;
        this.backSrc = backSrc;

        this.moveTo(Math.random()*gameWidth,Math.random()*gameHeight);
    }

    moveTo(x,y) {
        x -= .8 * 96 / 2;
        y -= 1056 / 691 * .8 * 96 / 2;
        this.img.style.left = `${x}px`;
        this.img.style.top = `${y}px`;
    }

    get isSelected() {
        return this.#isSelected;
    }
    selectable(isSelectable) {
        if(isSelectable) {
            this.img.onclick = () => {
                this.select();
            }
        }
        else {
            this.img.onclick = undefined;
        }
    }

    showFace(isShown) {
        if(isShown && !this.#isShown) {
            this.img.classList.add("cardFlip");
            setTimeout(() => {
                this.img.src = this.src;
                this.img.classList.remove("cardFlip");
            }, 300);
        }
        else if(!isShown && this.#isShown) {
            this.img.classList.add("cardFlip");
            setTimeout(() => {
                this.img.src = this.backSrc;
                this.img.classList.remove("cardFlip");
            }, 300);
        }
        this.#isShown = isShown;
    }
    depth(index) {
        this.#depth = index;
        setTimeout(() => {
            this.img.style.zIndex = index;
        }, 100);
    }

    select(isSelected) {
        if(typeof(isSelected) == "undefined") {
            if(!this.img.classList.contains("cardSelect")) {
                this.img.classList.add("cardSelect");
                this.#isSelected = true;
                this.img.style.zIndex = 1000 + this.#depth;
            }
            else {
                this.img.classList.remove("cardSelect");
                this.#isSelected = false;
                this.img.style.zIndex = this.#depth;
            }
            return;
        }
        if(isSelected) {
            if(!this.img.classList.contains("cardSelect"))
                this.img.classList.add("cardSelect");
            this.#isSelected = true;
            this.img.style.zIndex = 1000 + this.#depth;
        }
        else {
            this.img.classList.remove("cardSelect");
            this.#isSelected = false;
            this.img.style.zIndex = this.#depth;
        }
    }
}

function createDeck() {
    let deck = [];
    let label = [
        'A','2','3','4','5','6','7','8','9','10','J','Q','K'
    ];
    let suit = [
        'C','D','S','H'
    ];
    for(let i = 0; i < suit.length; i++) {
        for(let j = 0; j < label.length; j++) {
            deck[i*label.length+j] = new Card(label[i], suit[j], `cards_png/PNG/${label[j]}${suit[i]}.png`, `cards_png/PNG/red_back.png`);
        }
    }
    return deck;
}
function createRoyalsDeck() {
    let deck = [];
    let label = [
        'A','J','Q','K'
    ];
    let suit = [
        'C','D','S','H'
    ];
    for(let i = 0; i < suit.length; i++) {
        for(let j = 0; j < label.length; j++) {
            deck[i*label.length+j] = new Card(label[i], suit[j], `cards_png/PNG/${label[j]}${suit[i]}.png`, `cards_png/PNG/red_back.png`);
        }
    }
    return deck;
}


/**
 * @typedef {{serverData: any, clientData: any[], connections: boolean[]}} PSWData
 */

function randInt(min, max) {
    return Math.floor(Math.random() * (max-min) + min);
}

function shuffledDeck() {
    let deck = structuredClone(cardDeck);
    let shuffleDeck = [];
    for(let i = 0; i < 52; i++) {
        let index = randInt(0, deck.length);
        shuffleDeck.push(deck[index]);
        deck.splice(index, 1);
    } 
    return shuffleDeck;
}

class PSWHost {
    /**
     * @type {WebSocket}
     */
    #socket;
    /**
     * @type {PSWData}
     */
    #data;
    #serverLocalData;
    /**
     * @type {string?}
     */
    guid;
    /**
     * @param {string} uri
     * @param {{maxClient : number, onopen: (guid: string, ev: Event) => void, onclose: (ev: Event) => void, onmessage : (data : PSWData) => void, onerror: (ev: Event) => void}?} settings 
     */
    constructor(uri, settings) {
        this.#socket = new WebSocket(uri, "psw");
        this.#data = {
            serverData : null,
            clientData : [],
            connections : [],
        };
        this.#serverLocalData = {};
        this.guid = null;

        this.#socket.onclose = (ev) => {
            console.log("[PSWHOST] close");
            if(settings.onclose) settings.onclose(ev);
        }
        this.#socket.onopen = (ev) => {
            console.log("[PSWHOST] open");
        }
        this.#socket.onmessage = (ev) => {
            console.log("[PSWHOST] message", ev.data);
            if(this.guid == null) {
                this.guid = ev.data;
                console.log("[PSWHOST] init");
                if(settings.onopen) settings.onopen(this.guid, ev);
                this.#socket.send(JSON.stringify({
                    type: "init",
                    param: {
                        maxClients: settings.maxClient
                    }
                }));
                let d = JSON.stringify({
                    type: "data",
                    param: this.#serverLocalData
                });
                console.log("[PSWHOST] data", d);
                this.#socket.send(d);
            }
            else {
                this.#data = JSON.parse(ev.data);
                if(settings.onmessage) settings.onmessage(this.#data);
            }
        }
        this.#socket.onerror = (ev) => {
            console.log("[PSWHOST] error", ev);
            if(settings.onerror) settings.onerror(ev);
        }
    }

    get data() {
        return this.#data;
    }
    set serverData(value) {
        this.#serverLocalData = value;
        if(this.#socket.readyState != WebSocket.OPEN) return;
        let d = JSON.stringify({
            type: "data",
            param: this.#serverLocalData
        });
        console.log("[PSWHOST] data", d);
        this.#socket.send(d);
    }
    get serverData() {
        return this.#serverLocalData;
    }
    get isOpen () {
        return this.#socket.readyState == WebSocket.OPEN;
    }
    close() {
        console.log("[PSWHOST] close");
        this.#socket.close();
    }
}
class PSWClient {
    /**
     * @type {WebSocket}
     */
    #socket;
    /**
     * @type {PSWData}
     */
    #data;
    #clientLocalData;
    /**
     * @type {string?}
     */
    guid;
    /**
     * @type {number}
     */
    clientID;
    /**
     * @param {string} uri
     * @param {{onopen: (ev: Event) => void, onclose: (ev: Event) => void, onmessage : (data : PSWData) => void, onerror: (ev: Event) => void}?} settings 
     */
    constructor(uri, guid, settings) {
        this.#socket = new WebSocket(uri + guid + "/", "psw");
        this.#data = {
            serverData : null,
            clientData : [],
            connections : [],
        };
        this.#clientLocalData = {};
        this.guid = guid;

        this.#socket.onclose = (ev) => {
            console.log("[PSWCLIENT] close");
            if(settings.onclose) settings.onclose(ev);
        }
        this.#socket.onopen = (ev) => {
            console.log("[PSWCLIENT] open");
        }
        this.#socket.onmessage = (ev) => {
            console.log("[PSWCLIENT] message", ev.data);
            if(this.clientID == null) {
                this.clientID = Number.parseInt(ev.data);
                let d = JSON.stringify(this.#clientLocalData);
                console.log("[PSWCLIENT] data", d);
                this.#socket.send(d);
                if(settings.onopen) settings.onopen(ev);
            }
            else {
                this.#data = JSON.parse(ev.data);
                if(settings.onmessage) settings.onmessage(this.#data);
            }
        }
        this.#socket.onerror = (ev) => {
            console.log("[PSWCLIENT] error", ev);
            if(settings.onerror) settings.onerror(ev);
        }
    }
    get data() {
        return this.#data;
    }
    set clientData(value) {
        this.#clientLocalData = value;
        if(this.#socket.readyState != WebSocket.OPEN) return;
        let d = JSON.stringify(value);
        console.log("[PSWCLIENT] data", d);
        this.#socket.send(d);
    }
    get clientData() {
        return this.#clientLocalData;
    }
    get isOpen () {
        return this.#socket.readyState == WebSocket.OPEN;
    }
    close() {
        console.log("[PSWCLIENT] close");
        this.#socket.close();
    }
}


var cardDeck = createRoyalsDeck();
var deckState = cardDeck.map((v,i) => 
    { return {
        x:0,
        y:0,
        show:-2, 
        state: "none",
        id:i,
        depth:i,
        click:-1};
    });

var discardCount = 0;
var playerID = -10;
function DrawDeck() {
    discardCount = 0;
    let deckPileRect = document.getElementById("deckPile").getBoundingClientRect();
    let x = deckPileRect.left + deckPileRect.width/2 - gameLeft;
    let y = deckPileRect.top + deckPileRect.height/2 - gameTop;
    let d = [];
    for(let i = deckState.length; i > 0; i--) {
        d.push(deckState.pop(randInt(0,deckState.length)));
    }
    deckState = d;
    for(let i = 0; i < deckState.length; i++) {
        deckState[i].x = x;
        deckState[i].y = y-i/3;
        deckState[i].show = -2;
        deckState[i].depth = i;
        deckState[i].state = "deck";
    }
}
function DrawCard() {
    let c = -1;
    for(let i = 0; i < deckState.length; i++) {
        if(deckState[i].state == "deck") {
            c = i;
        }
    }
    deckState[c].state = "none";
    return c;
}
function Hand(cardIDs, x, y, handID, visible, click) {
    let hand = [];
    let gap = CardWidth * 0.4;
    for(let i = 0; i < deckState.length; i++) {
        if(deckState[i].state == handID || cardIDs.includes(i)) {
            hand.push(deckState[i]);
        }
    }
    for(let i = 0; i < hand.length; i++) {
        hand[i].state = handID;
        hand[i].show = visible;
        if(typeof(click) != "undefined") hand[i].click = click;
        hand[i].depth = i;
        hand[i].y = y;
        hand[i].x = x - hand.length * gap / 2 + i * gap;
    }
}
function Discard(index) {
    let rect = document.getElementById("discardPile").getBoundingClientRect();
    let x = rect.left + rect.width/2 - gameLeft;
    let y = rect.top + rect.height/2 - gameTop;
    deckState[index].x = x;
    deckState[index].y = y-discardCount/3;
    deckState[index].show = -1;
    deckState[index].depth = discardCount;
    deckState[index].state = "discard";
    discardCount++;
}
function ApplyState() {
    for(let i = 0; i < deckState.length; i++) {
        cardDeck[deckState[i].id].moveTo(deckState[i].x, deckState[i].y);
        cardDeck[deckState[i].id].showFace(deckState[i].show == -1 || deckState[i].show == playerID);
        cardDeck[deckState[i].id].depth(deckState[i].depth);
        cardDeck[deckState[i].id].selectable(deckState[i].click == playerID || deckState[i].click == -1);
        if(deckState[i].click != playerID) cardDeck[deckState[i].id].select(false);
    }
}
/**
 * @type {PSWClient}
 */
var client;
/**
* @type {PSWHost}
*/
var host;

function ClientOpen(ev) {
    playerID = client.clientID;
    document.getElementById(`player${playerID+1}`).setAttribute("playerActive", "true");
}
/**
 * 
 * @param {PSWData} data 
 */
function ClientMessage(data) {
    deckState = data.serverData;
}
function ServerOpen(guid, ev) {
    client = new PSWClient("http://127.0.0.1:9500/psw/", guid, {onopen: ClientOpen, onmessage: ClientMessage});
}
/**
 * 
 * @param {PSWData} data 
 */
function ServerMessage(data) {
    //host.serverData = 
}

if(!window.location.search) {
    host = new PSWHost("http://127.0.0.1:9500/psw/", {maxClient: 4, onopen: ServerOpen, onmessage: ServerMessage});
}
else {
    client = new PSWClient("http://127.0.0.1:9500/psw/", urlParams.get("guid"), {onopen: ClientOpen, onmessage: ClientMessage});
}

var gameServerData = {
    gameState: "pregame", //"dealing" "game" "postgame"
    currentPlayer: 0,
    cardState: [],

}
var clientData {
    selectCard: [],
    action: "start deal draw hit suit hit rank"
}