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

/**
 * 
 * @param {[{card: {suit : number, label: string, number : number}, elm: HTMLElement}]} player
 */
function clearCards(player) {
    player.forEach((elm) => {
        elm.elm.parentElement.removeChild(elm.elm);
    });
}

/**
 * @param {string} id
 * @param {{suit : number, label: string, number : number}} card
 */
function addCard(id,card) {
    let elm = document.getElementById(id);

    let img = new Image(60, 90);
    img.src = card.src;
    elm.appendChild(img);

    return {card: card, elm: img};
}

/**
 * @param {string} id
 * @param {{suit : number, label: string, number : number}} card 
 * @param {boolean} hidden
 * @returns {card: {suit : number, label: string, number : number}, elm: HTMLElement} 
 */
 function addBlankCard(id,card, blank) {
    let elm = document.getElementById(id);

    let img = new Image(60, 90);
    img.src = blank;
    elm.appendChild(img);

    return {card: card, elm: img};
}
/**
 * 
 * @param {{card: {suit : number, label: string, number : number}, elm: HTMLElement}} card 
 */
function setCard(card) {
    card.elm.src = card.card.src;
}

function playerIncrement() {
    let v = document.getElementById("score-player");
    v.value = (+v.value) + 1;
}

function dealerIncrement() {
    let v = document.getElementById("score-dealer");
    v.value = (+v.value) + 1;
}

/**
 * 
 * @param {[{card: {suit : number, label: string, number : number}, elm: HTMLElement}]} player
 */
function getTotalOfPlayer(player) {
    let total = 0;
    let aces = 0;
    player.forEach((c) => {
        if(c.card.number == 1) {
            aces++;
        }
        else if(c.card.number <= 10){
            total += c.card.number;
        }
        else {
            total += 10;
        }
    });

    for(let i = 0; i < aces; i++) {
        if(total + aces <= 11) {
            total += 11;
        }
        else {
            total += 1;
        }
    }

    return total;
}

function setTotal(id, total) {
    document.getElementById(id).innerHTML = `Total: ${total}`;
}

function sendToPlayer(text1, text2) {
    document.getElementById("message-board1").innerHTML = text1;
    document.getElementById("message-board2").innerHTML = text2;
}

window.onload = () => {


    let dealButton = document.getElementById("button-deal");
    let hitButton = document.getElementById("button-hit");
    let stayButton = document.getElementById("button-stay");
    let againButton = document.getElementById("button-again");

    let deck = [];
    let player = [];
    let dealer = [];
    let dealerTotal = 0;
    let playerTotal = 0;

    resetGame = () => {
        hitButton.setAttribute("disabled", "");
        stayButton.setAttribute("disabled", "");
        againButton.removeAttribute("disabled");
    }

    dealButton.onclick = () => {
        dealButton.setAttribute("disabled", "");  
        hitButton.removeAttribute("disabled");
        stayButton.removeAttribute("disabled");
        deck = newDeck();
        dealer.push(addBlankCard("dealer", deck.pop(), "cards_png/PNG/blue_back.png"));
        dealer.push(addCard("dealer", deck.pop()));
        
        player.push(addCard("player", deck.pop()));
        player.push(addCard("player", deck.pop()));

        playerTotal = getTotalOfPlayer(player);
        dealerTotal = getTotalOfPlayer(dealer.slice(1, undefined));

        if(playerTotal == 21) {
            sendToPlayer("Blackjack!", "You have an Ace and a card worth 10.");
            playerIncrement();
            resetGame();
        }

        setTotal("dealer-total", dealerTotal);
        setTotal("player-total",playerTotal);
    };

    hitButton.onclick = () => {
        player.push(addCard("player", deck.pop()));
        playerTotal = getTotalOfPlayer(player);

        if(playerTotal > 21) {
            sendToPlayer("You Lose!", "Your score is over 21.");
            dealerIncrement();
            resetGame();
        }
        setTotal("player-total",playerTotal);
    }

    stayButton.onclick = () => {
        hitButton.setAttribute("disabled", "");  
        setCard(dealer[0]);
        dealerTotal = getTotalOfPlayer(dealer);
        setTotal("dealer-total",dealerTotal);

        let interval = setInterval(() => {
            if(dealerTotal > 21) {
                sendToPlayer("You Win!", `The dealer is over 21.`);
                playerIncrement();
                resetGame();
                clearInterval(interval);
            }
            else if(dealerTotal > playerTotal) {
                sendToPlayer("You Lose!", `Dealer's score is ${dealerTotal}, but your score is ${playerTotal}.`);
                dealerIncrement();
                resetGame();
                clearInterval(interval);
            }
            else {
                dealer.push(addCard("dealer", deck.pop()));
                dealerTotal = getTotalOfPlayer(dealer);
                setTotal("dealer-total",dealerTotal);
            }
        }, 500);
    };

    againButton.onclick = () => {
        againButton.setAttribute("disabled", "");
        dealButton.removeAttribute("disabled");
        
        clearCards(player);
        clearCards(dealer);
        deck = [];
        player = [];
        dealer = [];
        dealerTotal = 0;
        playerTotal = 0;

        sendToPlayer("", "");
        setTotal("dealer-total", "?");
        setTotal("player-total", "?");
    }
}