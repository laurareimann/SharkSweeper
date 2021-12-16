/* Quellen: 

Minesweeper-Code:
https://www.youtube.com/watch?v=W0No1JDc6vE
https://github.com/kubowania/minesweeper

*/

document.addEventListener('DOMContentLoaded', () => { // notwendig, damit html vor dem js gelesen wird

    // Sounds
    var snd_gameover = new Audio("sounds/GameOver.mp3");
    var snd_scream = new Audio("sounds/scream.mp3");

    // macht Javascript Variablen im CSS nutzbar
    const grid = document.querySelector('.grid')
    const flagsLeft = document.querySelector('#flags-left')
    const score1 = document.querySelector('#scorecounter1')
    const score2 = document.querySelector('#scorecounter2')
    const result = document.querySelector('#result')

    // Spielfeld-Grundlagen
    let width = 10 // Breite des Spielfeldes
    let bombAmount = width * 2 // legt Anzahl der Bomben fest
    let whale = 1
    let featureAmount = whale // kann um weitere Features ergänzt werden
    let squares = [] // leerer Array für die Felder

    let isGameOver = false
    let flags = 0
    let scorecounter1 = 0
    let scorecounter2 = 0
    let scorenumber = 1
    let sharks // Anzahl der Haie, die schon aufgedeckt wurden

    //Funktion: Spielfeld erstellen
    function createBoard() {
        flagsLeft.innerHTML = bombAmount
        sharks = 0

        // Bomben legen (random):

        // 1. Arrays anlegen leer vs. mit Bomben
        let bombArray = Array(bombAmount).fill('bomb') // Füllt einen Array mit "bomb"-Strings
        let featureArray = Array(featureAmount).fill('whale') // Füllt einen Array mit "whale"-Strings
        let emptyArray = Array(width * width - bombAmount - featureAmount).fill('valid') // füllt einen Array mit der Anzahl leerer Felder mit "no bomb"-string

        // 2. Arrays zusammenlegen
        let gameArray = emptyArray.concat(bombArray, featureArray) // fügt Arrays zusammen

        // 3. Gemischter Array
        let shuffledArray = gameArray.sort(() => Math.random() - 0.5) // Randomisierte Verteilung

        // Schleife legt alle Felder im Grid an
        for (let i = 0; i < width * width; i++) { // width*width = 100
            const square = document.createElement('div') // erstellt einzelne Felder
            square.setAttribute('id', i) // weißt dem Feld eine ID i zu
            square.classList.add(shuffledArray[i]) // weißt dem Feld eine oder keine Bombe zu
            grid.appendChild(square) //fügt Felder ins Grid ein
            squares.push(square) // fügt die Felder zum Array squares hinzu

            // normaler Klick:
            square.addEventListener('click', function (e) {
                click(square);
            })

            // Rechtsklick (Flagge)
            square.oncontextmenu = function (e) {
                e.preventDefault()
                addFlag(square)
            }
        }

        // Benachbarte Felder der Bomben nummerieren 
        for (let i = 0; i < squares.length; i++) {
            let total = 0

            // Ränder des Spielfeldes:
            const isLeftEdge = (i % width === 0) // am linken Rand sind die Felder 0,10,20,30 etc.
            const isRightEdge = (i % width === width - 1) // am rechten Rand sind die Felder 9,19,29,39 etc.

            if (squares[i].classList.contains('valid')) {
                if (i > 0 && !isLeftEdge && squares[i - 1].classList.contains('bomb')) total++              // links
                if (i > 9 && !isRightEdge && squares[i + 1 - width].classList.contains('bomb')) total++     // rechts oben
                if (i > 9 && squares[i - width].classList.contains('bomb')) total++                         // oben
                if (i > 9 && !isLeftEdge && squares[i - 1 - width].classList.contains('bomb')) total++      // links oben
                if (i < 99 && !isRightEdge && squares[i + 1].classList.contains('bomb')) total++            // rechts
                if (i < 90 && !isLeftEdge && squares[i - 1 + width].classList.contains('bomb')) total++     // links unten
                if (i < 89 && !isRightEdge && squares[i + 1 + width].classList.contains('bomb')) total++    // rechts unten
                if (i < 90 && squares[i + width].classList.contains('bomb')) total++                        // unten
                squares[i].setAttribute('data', total)
                //console.log(squares)
            }
        }
    }

    //Funktion: Spielfeld ohne Wal
    function createBoardnoWhale() {
        flagsLeft.innerHTML = bombAmount
        sharks = 0
        
        let bombArray = Array(bombAmount).fill('bomb')
        let emptyArray = Array(width*width - bombAmount).fill('valid')
        let gameArray = emptyArray.concat(bombArray)
        let shuffledArray = gameArray.sort(() => Math.random() -0.5)
        
        for(let i = 0; i < width*width; i++) {
            const square = document.createElement('div')
            square.setAttribute('id', i)
            square.classList.add(shuffledArray[i])
            grid.appendChild(square)
            squares.push(square)
        
            //normal click
            square.addEventListener('click', function(e) {
                click(square)
            })
        
            //cntrl and left click
            square.oncontextmenu = function(e) {
                e.preventDefault()
                addFlag(square)
            }
        }
        
        //add numbers
        for (let i = 0; i < squares.length; i++) {
            let total = 0
            const isLeftEdge = (i % width === 0)
            const isRightEdge = (i % width === width -1)
        
            if (squares[i].classList.contains('valid')) {
                if (i > 100 && !isLeftEdge && squares[i - 1].classList.contains('bomb')) total++              // links
                if (i > 109 && !isRightEdge && squares[i + 1 - width].classList.contains('bomb')) total++     // rechts oben
                if (i > 109 && squares[i - width].classList.contains('bomb')) total++                         // oben
                if (i > 109 && !isLeftEdge && squares[i - 1 - width].classList.contains('bomb')) total++      // links oben
                if (i < 199 && !isRightEdge && squares[i + 1].classList.contains('bomb')) total++            // !rechts
                if (i < 190 && !isLeftEdge && squares[i - 1 + width].classList.contains('bomb')) total++     // !links unten
                if (i < 189 && !isRightEdge && squares[i + 1 + width].classList.contains('bomb')) total++    // !rechts unten
                if (i < 190 && squares[i + width].classList.contains('bomb')) total++                        // !unten
                squares[i].setAttribute('data', total)
                console.log(squares)

            }
        }
    }

    createBoard() // Ruft Funktion zur Erstellung des Feldes auf

    // Flaggen-Funktion (rechtsklick)
    function addFlag(square) {
        if (isGameOver) return
        if (!square.classList.contains('checked') && flags < bombAmount) {
            if (!square.classList.contains('flag')) {
                square.classList.add('flag')
                square.innerHTML = "<img src='images/Assets-Auswahl/Rod.png'; width='30'; height='30''>"
                flags++
                flagsLeft.innerHTML = bombAmount - flags
                checkForWin() // PRÜFT ob schon alle Bomben gefunden wurden
            } else {
                square.classList.remove('flag')
                square.innerHTML = ''
                flags--
                flagsLeft.innerHTML = bombAmount - flags
            }
        }
    }



    // Klick-Funktion
    function click(square) {
        let currentId = square.id

        // es soll nichts passieren, wenn das Spiel vorbei ist oder wenn eine Flagge gesetzt wurde:
        if (isGameOver) return
        if (square.classList.contains('checked') || square.classList.contains('flag')) return


        // Shark
        if (square.classList.contains('bomb')) {
            if (scorenumber == 1){
                scorecounter1 -= 5
                console.log("score1: " + scorecounter1)
                score1.innerHTML = scorecounter1
                scorenumber = 2
            } else {
                scorecounter2 -= 5
                console.log("score2: " + scorecounter2)
                score2.innerHTML = scorecounter2
                scorenumber = 1
            }

            shark(square)
            playerTurn()

        } else if (square.classList.contains('whale')) {
            square.classList.add('checked')
            square.innerHTML = "<img src='images/Assets-Auswahl/BlueWhale.png'; width='30'; height='30'>"
            
            setTimeout(() => {
                for (i of squares) {
                    i.remove();
                }
                createBoardnoWhale(); 
            },1000) // ACHTUNG: soll eigentlich die Felder nacheinander langsam löschen, funktioniert aber nicht
            playerTurn()
            
        } else {
            if (square.classList.contains('valid')) {


                let total = square.getAttribute('data') // Zahlen anzeigen bei Klick
                if (scorenumber == 1){
                    scorecounter1 += parseInt(square.getAttribute('data'))
                    console.log("score1: " + scorecounter1)
                    score1.innerHTML = scorecounter1
                    scorenumber = 2
                } else {
                    scorecounter2 += parseInt(square.getAttribute('data'))
                    console.log("score2: " + scorecounter2)
                    score2.innerHTML = scorecounter2
                    scorenumber = 1
                }

                if (total == 0) square.classList.add('checked'),square.innerHTML = "<img src='images/0.png'; width='35'; height='35'>"
                if (total == 1) square.classList.add('checked'),square.innerHTML = "<img src='images/1.png'; width='30'; height='30'>"
                if (total == 2) square.classList.add('checked'),square.innerHTML = "<img src='images/2.png'; width='30'; height='30'>"
                if (total == 3) square.classList.add('checked'),square.innerHTML = "<img src='images/3.png'; width='30'; height='30'>"
                if (total == 4) square.classList.add('checked'),square.innerHTML = "<img src='images/4.png'; width='30'; height='30'>"
                if (total == 5) square.classList.add('checked'),square.innerHTML = "<img src='images/5.png'; width='30'; height='30'>"
                if (total == 6) square.classList.add('checked'),square.innerHTML = "<img src='images/6.png'; width='30'; height='30'>"
                if (total == 7) square.classList.add('checked'),square.innerHTML = "<img src='images/7.png'; width='30'; height='30'>"
                if (total == 8) square.classList.add('checked'),square.innerHTML = "<img src='images/8.png'; width='30'; height='30'>"

                playerTurn()
            }
                return
        }
        checkSquare(square, currentId)
        square.classList.add('checked')
    }
        
    


    // shark Function
    function shark(square) {
        square.innerHTML = "<img src='images/Assets-Auswahl/Shark.png'; width='30'; height='30'>"
        square.classList.remove('bomb')
        square.classList.add('checked')
        snd_scream.play();     // ACHTUNG: Sound spielt nicht, wenn man zu schnell Haie hintereinander audeckt. Fix: preload sound    
        sharks++
        if (sharks==bombAmount){
            result.innerHTML = 'GAME OVER!'
            console.log('GAME OVER')
            snd_gameover.play()
            isGameOver = true
        }
    }

    // Win Function --> dependend on flag function (muss noch geändert werden!!!)
    function checkForWin() {
        matches = 0
        for (let i = 0; i < squares.length; i++) {
            if (squares[i].classList.contains('flag') && squares[i].classList.contains('bomb')) {
                matches++
            }
            if (matches === bombAmount) {
                result.innerHTML = 'YOU WIN!'
                console.log('YOU WIN')
                setTimeout(() => { snd_gameover.play(); }, 1000);
                isGameOver = true
            }
        }
    }


    // Player turn:
    function playerTurn(){
        if (scorenumber == 1){
            scoreturn.innerHTML = 'Player 1'
        } else {
            scoreturn.innerHTML = "Player 2"
        }
    }       

    
});