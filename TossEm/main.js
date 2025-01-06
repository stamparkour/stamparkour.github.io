/**
 * @typedef {{serverData: any, clientData: any[], connections: boolean[]}} PSWData
 */

function randInt(min, max) {
    return Math.floor(Math.random() * (max-min) + min);
}

function newDeck(shuffles) {
    let deck = [];
    let label = [
        'A','2','3','4','5','6','7','8','9','10','J','Q','K'
    ];
    let suit = [
        'C','D','S','H'
    ];
    for(let i = 0; i < 4; i++) {
        for(let j = 0; j < 13; j++) {
            deck[i*13+j] = {suit:i + 1, number: j + 1, label: label[j], src: `cards_png/PNG/${label[j]}${suit[i]}.png`};
        }
    }
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
     * 
     * @param {{maxClient : number, onmessage : (data : PSWData) => void}?} settings 
     */
    constructor(path, settings) {
        this.#socket = new WebSocket(path, "psw");
        this.#data = {
            serverData : null,
            clientData : [],
            connections : [],
        };
        this.serverLocalData = {};
        this.guid = null;

        this.#socket.onclose = (ev) => {
            console.log("[PSWHOST] close");
        }
        this.#socket.onopen = (ev) => {
            console.log("[PSWHOST] open");
        }
        this.#socket.onmessage = (ev) => {
            console.log("[PSWHOST] message", ev.data);
            if(this.guid == null) {
                this.guid = ev.data;
                console.log("[PSWHOST] init");
                this.#socket.send(JSON.stringify({
                    type: "init",
                    param: {
                        maxClients: settings.maxClient
                    }
                }));
                console.log("[PSWHOST] data");
                this.#socket.send(JSON.stringify({
                    type: "data",
                    param: this.#serverLocalData
                }));
            }
            else {
                this.#data = JSON.parse(ev.data);
                settings.onmessage(this.#data);
            }
        }
        this.#socket.onerror = (ev) => {
            console.log("[PSWHOST] error", ev);
        }
    }

    get data() {
        return this.#data;
    }
    set serverData(value) {
        this.#serverLocalData = value;
        if(this.#socket.readyState != WebSocket.OPEN) return;
        console.log("[PSWHOST] data");
        this.#socket.send(JSON.stringify({
            type: "data",
            param: this.#serverLocalData
        }));
    }
    get serverData() {
        return this.#serverLocalData;
    }
}

var host = new PSWHost("http://127.0.0.1:9500/psw/", {maxClient: 4});
host.serverData = {kys: true};