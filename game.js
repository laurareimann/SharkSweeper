// Quelle: https://www.youtube.com/watch?v=W0No1JDc6vE
// https://github.com/kubowania/minesweeper

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
        const bombArray = Array(bombAmount).fill('bomb') // Füllt einen Array mit "bomb"-Strings
        const featureArray = Array(featureAmount).fill('whale') // Füllt einen Array mit "whale"-Strings
        const emptyArray = Array(width * width - bombAmount - featureAmount).fill('valid') // füllt einen Array mit der Anzahl leerer Felder mit "no bomb"-string

        // 2. Arrays zusammenlegen
        const gameArray = emptyArray.concat(bombArray, featureArray) // fügt Arrays zusammen

        // 3. Gemischter Array
        const shuffledArray = gameArray.sort(() => Math.random() - 0.5) // Randomisierte Verteilung

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
        
        const bombArray = Array(bombAmount).fill('bomb')
        const emptyArray = Array(width*width - bombAmount).fill('valid')
        const gameArray = emptyArray.concat(bombArray)
        const shuffledArray = gameArray.sort(() => Math.random() -0.5)
        
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
                if (i > 0 && !isLeftEdge && squares[i - 1].classList.contains('bomb')) total++              // links
                if (i > 9 && !isRightEdge && squares[i + 1 - width].classList.contains('bomb')) total++     // rechts oben
                if (i > 9 && squares[i - width].classList.contains('bomb')) total++                         // oben
                if (i > 9 && !isLeftEdge && squares[i - 1 - width].classList.contains('bomb')) total++      // links oben
                if (i < 99 && !isRightEdge && squares[i + 1].classList.contains('bomb')) total++            // !rechts
                if (i < 90 && !isLeftEdge && squares[i - 1 + width].classList.contains('bomb')) total++     // !links unten
                if (i < 89 && !isRightEdge && squares[i + 1 + width].classList.contains('bomb')) total++    // !rechts unten
                if (i < 90 && squares[i + width].classList.contains('bomb')) total++                        // !unten
                squares[i].setAttribute('data', total)
                console.log(squares)

                // ACHTUNG: Bug --> Zahlen werden nach Wal nicht mehr richtig angezeigt
                // Richtungen funktionieren nicht: alle unten und rechts
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


        // Game Over
        if (square.classList.contains('bomb')) {

            shark(square)

        } else if (square.classList.contains('whale')) {
            square.classList.add('checked')
            square.innerHTML = "<img src='images/Assets-Auswahl/BlueWhale.png'; width='30'; height='30'>"
            
            setTimeout(() => {
                for (i of squares) {
                    i.remove();
                }
                createBoardnoWhale(); 
            },1000) // ACHTUNG: soll eigentlich die Felder nacheinander langsam löschen, funktioniert aber nicht
            
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

                if (total == 0) square.classList.add('checked')
                if (total == 1) square.classList.add('one')
                if (total == 2) square.classList.add('two')
                if (total == 3) square.classList.add('three')
                if (total == 4) square.classList.add('four')
                if (total == 5) square.classList.add('five')
                if (total == 6) square.classList.add('six')
                if (total == 7) square.classList.add('seven')
                if (total == 8) square.classList.add('eight')

                square.innerHTML = total
                return
            }
            checkSquare(square, currentId)
        }
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



    
});