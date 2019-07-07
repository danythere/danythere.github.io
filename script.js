'use strict';

window.onload = function () {

    /*создание двумерного массива для игровой площадки*/
    function matrixArray(rows, columns) {
        let arr = [];
        for (let i = 0; i < rows; i++) {
            arr[i] = [];
            for (let j = 0; j < columns; j++) {
                if (i < 4 || j < 4 || i > 13 || j > 13) arr[i][j] = 10;
                else arr[i][j] = 0;
            }
        }
        return arr;
    }

    /*Рандомное целое число на отрезке*/
    function getRandom(min, max) {
        let rand = min - 0.5 + Math.random() * (max - min + 1);
        rand = Math.round(rand);
        return rand;
    }

    let welcomeWindow = document.getElementById('welcome-window');
    let gamePreparation = document.getElementById('game-preparation');
    const startInstallation = document.getElementById('start-installation');

    /*
    Сессия - серия игр под одним именем
    _result-общий счет сессии
    _firstPlayer-имя первого игрока, _secondPlayer-второго
    _level-быстрая/небыстрая игра(true/false)
    start() - запуск сессии
     */
    class Session {
        constructor() {
            this._result = {firstPlayer: 0, secondPlayer: 0};
            this._firstPlayer = new Player(document.getElementById('player-name').value, 1);
            this._secondPlayer = new Player('Компьютер', 2);
            this._level = document.getElementById('check-level').checked;
        }

        get result() {
            return this._result;
        }

        start() {
            welcomeWindow.style.display = 'none';
            gamePreparation.style.display = 'block';
            let game = new Game();
            game._begin();

        }

        set result(result) {
            this._result = result;
        }
    }

    /*
    Игра-часть сессии.
    _whoseTurn-чей ход, инициализируется в начале игры рандомно
    _initBoard-доска живого игрока
    _clock-устанавливает интервал хода
    _doResult-функция подведения результата в случае окончания таймера или победы одного из игроков путем уничтожения всех кораблей противника
    _clearField-очищает таблицу - игровое поле (<table></table>)
    _changeTurn-смена ходящего игрока
    _timer-функция таймера хода
    _stopClock-останавливает таймер(очищает интервал)
    _start-старт новой игры
    _computerAttack-атака компьютера(осуществляется с помощью генерации рандомнго попадания по пустой клетке противника)
     */
    class Game extends Session {
        constructor() {
            super();
            this._whoseTurn = getRandom(1, 2);
            this._initBoard = new Field('start-board', this._firstPlayer, this._secondPlayer);
            this._clock = null;
        }

        get level() {
            return this._level;
        }

        set level(level) {
            this._level = level;
        }

        _doResult(winner) {
            this._stopClock();/*останавливаем время*/
            let crowns = document.getElementById('crowns');
            crowns.style.display = 'block';
            winner === 1 ? this._result.firstPlayer++ : this._result.secondPlayer++;
            let newGameButton = document.getElementById('new-game');
            let endSessionButton = document.getElementById('end-session');
            let winnerSpan = document.getElementById('winner');
            let total = document.getElementById('total');
            let computerField = document.getElementById('computer-board');
            for (let row of computerField.rows) {
                for (let cell of row.cells) {
                    cell.setAttribute("onclick", null);
                }
            }
            total.innerText = 'Счет в серии ' + this.result.firstPlayer + ' : ' + this.result.secondPlayer;
            newGameButton.style.display = 'block';
            endSessionButton.style.display = 'block';
            winnerSpan.innerText = (winner === 1 ? this._firstPlayer.name : this._secondPlayer.name);
            winnerSpan.style.display = 'block';
            newGameButton.onclick = () => { /*при окончании игры можно начать новую путем обнуления старой*/
                let gameDiv = document.getElementById('game');
                crowns.style.display = 'none';
                gameDiv.style.display = 'none';
                newGameButton.style.display = 'none';
                endSessionButton.style.display = 'none';
                winnerSpan.style.display = 'none';
                this._clearField('start-board');
                this._clearField('player-board');
                gamePreparation.style.display = 'block';
                const resultFirstPlayer = this._result.firstPlayer;
                const resultSecondPlayer = this._result.secondPlayer;
                let session = {firstPlayer: resultFirstPlayer, secondPlayer: resultSecondPlayer};
                this._initBoard = new Field('start-board', this._firstPlayer, this._secondPlayer);
                this.result = session; /*сохраняем новые резуьтаты игры в сессию*/
            };
            endSessionButton.onclick = () => {
                newGameButton.style.display = 'none';
                let gameDiv = document.getElementById('game');
                gameDiv.style.display = 'none';
                let checkBox = document.getElementById('check-level');
                checkBox.checked = false;
                endSessionButton.style.display = 'none';
                winnerSpan.style.display = 'none';
                crowns.style.display = 'none';
                welcomeWindow.style.display = 'block';
                let nameInput = document.getElementById('player-name');
                nameInput.value = '';
                this._initBoard = new Field('start-board', this._firstPlayer, this._secondPlayer);
                this._clearField('start-board');
                this._clearField('player-board');
            }
        }

        _clearField(selector) {
            let field = document.getElementById(selector);
            for (let row of field.rows) {
                for (let cell of row.cells) {
                    cell.classList.forEach(function (item) {
                        cell.classList.remove(item);
                    })
                }
            }
        }

        _changeTurn() {
            (this._whoseTurn === 1) ? this._whoseTurn = 2 : this._whoseTurn = 1;
            let whoseTurn = document.getElementById('now-way');
            this._whoseTurn === 1 ? whoseTurn.innerText = 'Ход: ' + this._firstPlayer.name : whoseTurn.innerText = 'Ход: ' + this._secondPlayer.name;
            this._stopClock();
            this._timer(this.level ? 5 : 10, document.getElementById('timer'));
        }

        _timer(duration, display) {
            {
                let timer = duration, minutes, seconds;
                this._clock = setInterval(() => {
                    minutes = parseInt(timer / 60, 10);
                    seconds = parseInt(timer % 60, 10);
                    minutes = minutes < 10 ? "0" + minutes : minutes;
                    seconds = seconds < 10 ? "0" + seconds : seconds;
                    display.textContent = minutes + ":" + seconds;
                    if (--timer < 0) {
                        this._doResult((this._whoseTurn === 1) ? 2 : 1)
                    }
                }, 1000);
            }
        }

        _stopClock() {
            clearInterval(this._clock);
        }

        _begin() {
            const randomShipsButton = document.getElementById('random-ship');
            let playerFirst = document.getElementsByClassName('player-name')[0];
            let playerSecond = document.getElementsByClassName('player-name')[1];
            playerFirst.textContent = this._firstPlayer.name;
            playerSecond.textContent = this._secondPlayer.name;
            let checkSet = false;
            randomShipsButton.onclick = () => { /*генерация случайной расстановки кораблей при нажатии на кнопку*/
                this._initBoard.randomSet();
                checkSet = true;
            };
            const startGameButton = document.getElementById('start-game');
            startGameButton.onclick = () => {/*начало игры при нажатии на кнопку после расстановки кораблей игрока*/
                if (checkSet) {
                    checkSet = !checkSet;
                    let seconds = this.level ? 5 : 10; /*в зависимости от галки в поле "быстрая игра" количество секунд на ход*/
                    let total = document.getElementById('total'); /*инициализация счета в серии*/
                    total.innerText = 'Счет в серии ' + this._result.firstPlayer + ' : ' + this._result.secondPlayer;
                    this._timer(seconds, document.getElementById('timer'));
                    gamePreparation.style.display = 'none';
                    let game = document.getElementById('game');
                    game.style.display = 'inline-block';
                    let computerField = document.getElementById('computer-field');
                    let computerFieldTable = computerField.querySelector('table');
                    this._computerBoard = new Field('computer-board', this._secondPlayer, this._firstPlayer);
                    this._computerBoard.randomSet();
                    this._initBoard.field = 'player-board';
                    this._initBoard._setShips();
                    let whoseTurn = document.getElementById('now-way');
                    this._whoseTurn === 1 ? whoseTurn.innerText = 'Ход: ' + this._firstPlayer.name : whoseTurn.innerText = 'Ход: ' + this._secondPlayer.name;
                    if (this._whoseTurn === 2)
                        this._computerAttack();
                    this.handleClick = (event) => { /*если ход не игрока, то ничего не происходит*/
                        if (this._whoseTurn === 1) {
                            let attackRes = this._computerBoard._attack(event.target);
                            /*возвращает результаты атаки (количество оставшихся кораблей за игру и булевское значения попадания в корабль при атаке*/
                            if (attackRes.livingShips === 0) {
                                this._doResult(1); /*если кораблей не осталось - игра окончена*/
                                return;
                            }
                            event.target.setAttribute("onclick", null); /*при попадании в клетку событие с нее снимается*/
                            if (!attackRes.hit) { /*если не попали, ход меняется*/

                                this._changeTurn();
                                setTimeout(() => {
                                    this._computerAttack();
                                }, getRandom(2, 3) * 1000);/*выстрел компьютера происходит в данный промежуток после начала хода*/
                                return;
                            }

                            this._stopClock();
                            this._timer(this.level ? 5 : 10, document.getElementById('timer'));
                        }
                    };
                    for (let row of computerFieldTable.rows) {
                        for (let cell of row.cells) {
                            cell.onclick = this.handleClick;
                        }
                    }
                }
            }
        }

        _computerAttack() {
            let move = this._secondPlayer.generateRandomMove(this._initBoard.board); /*возвращает сгенерированный случайно ход*/
            let attackRes = this._initBoard._attack(this._initBoard._field.rows[move.x - 4].cells[move.y - 4]);
            if (attackRes.livingShips === 0) {
                /*количество оставшихся кораблей равно нулю, игра окончена*/
                this._doResult(2);
                return;
            }
            if (!attackRes.hit) {
                /*не попали-ход меняется*/
                this._changeTurn();
                return;
            }
            setTimeout(() => {

                this._computerAttack();

            }, getRandom(2, 3) * 1000); /*выстрел компьютера происходит в данный промежуток после начала хода*/
            this._stopClock();
            this._timer(this.level ? 5 : 10, document.getElementById('timer'));
        }
    }

    /*
    Игровое поле.
    _ships-корабли игрового поля
    _board-двумерный массив, где 1,2-корабли одного из игроков, 3-границы кораблей, на которые нельзя ставить другие корабли,
    4-попадание вне корабля, -1 и -2 это убитые корабли соответствующих игроков, 5-раненный корабль. !!!С каждой стороын есть забор в 4 клетки
    для избежания выхода за границы массива(обозначается цифрой 10)
    _field-ссылка на таблицу игрового поля(<table></table>)
    _livingShips-количество убитых кораблей(если равно изначальному количеству кораблей - игра заканчивается)
    _player-владелец доски
    _enemy-противник доски
    _setShips-функция установки кораблей на <table> ( используется для перемещения кораблей с инициализирующей доски на игровую )
    _attack-функция атаки(проверяет наличие кораблей в данной клетке: если есть, то вызывает соответствующие функции _kill и _injury, если
    нет, то обозначает в этой клетке промах)
    _kill-функция уничтожения корабля(обозначает на матрице доски и на <table> убитый корабль, используя начальные координаты корабля,
    размер корабля и позицию (1-горизонтальное, -1 вертикальное)
    _injury-обозначает клетку раненой
    _checkShipAttack-ищет клетки, в которые можно стрелять
    _checkAddship-проверяет возможность вставки в корабль, используя начальные координаты, позицию и размер, а также имея ввиду область,
    которой ограничивается корабль ( область, занятая кораблем, за исключением самого корабля ограничивается со всех сторон и обозначена
    номером 3 в матрице поля)
    _setShipToTable-вставка корабля в <table>
    _setShip-вставляет корабль как в <table>, так и в матрицу поля по начальным координатам, позиции и размеру корабля, а так же обозначает область
    границ корабля ( номером 3)
    _randomSet-генерация случайной расстановки кораблей, начиная с самого большого(гарантировано, что все поставятся)
     */
    class Field {
        constructor(selector, player, enemy) {
            this._ships = new Array(10);
            for (let i = 0; i < this._ships.length; i++) {
                if (!i) this._ships[i] = new Ship(4);
                if (i > 0 && i < 3) this._ships[i] = new Ship(3);
                if (i > 2 && i < 6) this._ships[i] = new Ship(2);
                if (i > 5 && i < 10) this._ships[i] = new Ship(1);
            }
            this._board = matrixArray(18, 18);
            this._field = document.getElementById(selector);
            this._livingShips = this._ships.length;
            this._player = player;
            this._enemy = enemy;
        }

        _setShips() {
            for (let i = 0; i < this._ships.length; i++) {
                this.setShipToTable(this._ships[i].x, this._ships[i].y, this._ships[i], this._ships[i].position);
            }
        }

        get board() {
            return this._board;
        }


        get livingShips() {
            return this._livingShips;
        }

        set field(field) {
            this._field = document.getElementById(field);
        }

        _attack(place) {
            let checkHit = false; /*попадение в корабль*/
            let ship = this._checkShipAttack(place);
            if (ship) {
                checkHit = true;
                ship.injury++; /*увеличиваем счетчик попадания в корабль*/
                if (ship.injury === ship.size) {
                    this._kill(ship);
                } else {
                    this._board[place.parentNode.rowIndex + 4][place.cellIndex + 4] = 5;
                    this._injury(place);
                }

            } else {
                place.classList.add('miss');
                let row = place.parentNode.rowIndex + 4;
                let column = place.cellIndex + 4;
                this._board[row][column] = 4;
            }
            return {livingShips: this.livingShips, hit: checkHit};
        }

        _kill(ship) {
            if (ship.position === 1) {
                for (let i = 0; i < ship.size; i++) {
                    this._board[ship.x][ship.y + i] = -this._player.id;
                    this._field.rows[ship.x - 4].cells[ship.y + i - 4].classList.remove('injury', 'my');
                    this._field.rows[ship.x - 4].cells[ship.y + i - 4].classList.add('killed');
                    if (!i) {
                        if (ship.y - 4 - 1 >= 0) {
                            this._field.rows[ship.x - 4].cells[ship.y + i - 4 - 1].classList.remove('injury', 'my');
                            this._field.rows[ship.x - 4].cells[ship.y + i - 4 - 1].classList.add('miss');
                            this._board[ship.x][ship.y + i - 1] = 3;
                            if (ship.x - 4 - 1 >= 0) {
                                this._field.rows[ship.x - 4 - 1].cells[ship.y + i - 4 - 1].classList.remove('injury', 'my');
                                this._field.rows[ship.x - 4 - 1].cells[ship.y + i - 4 - 1].classList.add('miss');
                                this._board[ship.x - 1][ship.y + i - 1] = 3;
                            }
                            if (ship.x - 4 + 1 < 10) {
                                this._field.rows[ship.x - 4 + 1].cells[ship.y + i - 4 - 1].classList.remove('injury', 'my');
                                this._field.rows[ship.x - 4 + 1].cells[ship.y + i - 4 - 1].classList.add('miss');
                                this._board[ship.x + 1][ship.y + i - 1] = 3;
                            }
                        }
                    } if (i === ship.size - 1) {
                        if (ship.y - 4 + 1 + i < 10) {
                            this._field.rows[ship.x - 4].cells[ship.y + i - 4 + 1].classList.remove('injury', 'my');
                            this._field.rows[ship.x - 4].cells[ship.y + i - 4 + 1].classList.add('miss');
                            this._board[ship.x][ship.y + i + 1] = 3;
                            if (ship.x - 4 - 1 >= 0) {
                                this._field.rows[ship.x - 4 - 1].cells[ship.y + i - 4 + 1].classList.remove('injury', 'my');
                                this._field.rows[ship.x - 4 - 1].cells[ship.y + i - 4 + 1].classList.add('miss');
                                this._board[ship.x - 1][ship.y + i + 1] = 3;
                            }
                            if (ship.x - 4 + 1 < 10) {
                                this._field.rows[ship.x - 4 + 1].cells[ship.y + i - 4 + 1].classList.remove('injury', 'my');
                                this._field.rows[ship.x - 4 + 1].cells[ship.y + i - 4 + 1].classList.add('miss');
                                this._board[ship.x + 1][ship.y + i + 1] = 3;
                            }

                        }
                    }
                    if (ship.x - 4 - 1 >= 0) {
                        this._field.rows[ship.x - 4 - 1].cells[ship.y + i - 4].classList.remove('injury', 'my');
                        this._field.rows[ship.x - 4 - 1].cells[ship.y + i - 4].classList.add('miss');
                        this._board[ship.x - 1][ship.y + i] = 3;
                    }
                    if (ship.x - 4 + 1 < 10) {
                        this._field.rows[ship.x - 4 + 1].cells[ship.y + i - 4].classList.remove('injury', 'my');
                        this._field.rows[ship.x - 4 + 1].cells[ship.y + i - 4].classList.add('miss');
                        this._board[ship.x + 1][ship.y + i] = 3;
                    }
                    if (ship.size === 1) {
                        if (ship.y - 4 + 1 < 10) {
                            this._field.rows[ship.x - 4].cells[ship.y + i - 4 + 1].classList.remove('injury', 'my');
                            this._field.rows[ship.x - 4].cells[ship.y + i - 4 + 1].classList.add('miss');
                            this._board[ship.x][ship.y + i + 1] = 3;
                        }
                        if (ship.x - 4 - 1 >= 0) {
                            this._field.rows[ship.x - 4 - 1].cells[ship.y + i - 4].classList.remove('injury', 'my');
                            this._field.rows[ship.x - 4 - 1].cells[ship.y + i - 4].classList.add('miss');
                            this._board[ship.x - 1][ship.y + i] = 3;
                        }
                        if (ship.x - 4 + 1 < 10) {
                            this._field.rows[ship.x - 4 + 1].cells[ship.y + i - 4].classList.remove('injury', 'my');
                            this._field.rows[ship.x - 4 + 1].cells[ship.y + i - 4].classList.add('miss');
                            this._board[ship.x + 1][ship.y + i] = 3;
                        }
                    }

                }
            } else {
                for (let i = 0; i < ship.size; i++) {
                    this._board[ship.x + i][ship.y] = -this._player.id;
                    this._field.rows[ship.x - 4 + i].cells[ship.y - 4].classList.remove('injury', 'my');
                    this._field.rows[ship.x + i - 4].cells[ship.y - 4].classList.add('killed');
                    if (!i) {
                        if (ship.x - 4 - 1 >= 0) {
                            this._field.rows[ship.x - 4 - 1].cells[ship.y + i - 4].classList.remove('injury');
                            this._field.rows[ship.x - 4 - 1].cells[ship.y + i - 4].classList.add('miss');
                            this._board[ship.x - 1][ship.y + i] = 3;
                            if (ship.y - 4 - 1 >= 0) {
                                this._field.rows[ship.x - 4 - 1].cells[ship.y + i - 4 - 1].classList.remove('injury');
                                this._field.rows[ship.x - 4 - 1].cells[ship.y + i - 4 - 1].classList.add('miss');
                                this._board[ship.x - 1][ship.y + i - 1] = 3;
                            }
                            if (ship.y - 4 + 1 < 10) {
                                this._field.rows[ship.x - 4 - 1].cells[ship.y + i - 4 + 1].classList.remove('injury');
                                this._field.rows[ship.x - 4 - 1].cells[ship.y + i - 4 + 1].classList.add('miss');
                                this._board[ship.x - 1][ship.y + i + 1] = 3;
                            }
                        }
                    } else if (i === ship.size - 1) {
                        if (ship.x - 4 + ship.size < 10) {
                            this._field.rows[ship.x - 4 + ship.size].cells[ship.y - 4].classList.remove('injury');
                            this._field.rows[ship.x - 4 + ship.size].cells[ship.y - 4].classList.add('miss');
                            this._board[ship.x + ship.size][ship.y] = 3;
                            if (ship.y - 4 - 1 >= 0) {
                                this._field.rows[ship.x - 4 + ship.size].cells[ship.y - 4 - 1].classList.remove('injury');
                                this._field.rows[ship.x - 4 + ship.size].cells[ship.y - 4 - 1].classList.add('miss');
                                this._board[ship.x + ship.size][ship.y - 1] = 3;
                            }
                            if (ship.y - 4 + 1 < 10) {
                                this._field.rows[ship.x - 4 + ship.size].cells[ship.y - 4 + 1].classList.remove('injury');
                                this._field.rows[ship.x - 4 + ship.size].cells[ship.y - 4 + 1].classList.add('miss');
                                this._board[ship.x + ship.size][ship.y + 1] = 3;
                            }
                        }
                    }
                    if (ship.y - 4 - 1 >= 0) {
                        this._field.rows[ship.x - 4 + i].cells[ship.y - 4 - 1].classList.remove('injury');
                        this._field.rows[ship.x - 4 + i].cells[ship.y - 4 - 1].classList.add('miss');
                        this._board[ship.x + i][ship.y - 1] = 3;
                    }
                    if (ship.y - 4 + 1 < 10) {
                        this._field.rows[ship.x - 4 + i].cells[ship.y - 4 + 1].classList.remove('injury');
                        this._field.rows[ship.x - 4 + i].cells[ship.y - 4 + 1].classList.add('miss');
                        this._board[ship.x + i][ship.y + 1] = 3;
                    }
                    if (ship.size === 1) {

                        if (ship.x - 4 + 1 < 10) {
                            this._field.rows[ship.x - 4 + 1].cells[ship.y + i - 4].classList.remove('injury');
                            this._field.rows[ship.x - 4 + 1].cells[ship.y + i - 4].classList.add('miss');
                            this._board[ship.x + 1][ship.y + i] = 3;
                        }
                    }
                }
            }
            this._enemy.clearNextMoves();
            this._enemy.clearLineMoves();
            this._livingShips--;
        }

        _injury(place) {
            place.classList.remove('my');
            place.classList.add('injury');
        }

        _checkShipAttack(place) {
            let row = place.parentNode.rowIndex + 4;
            let column = place.cellIndex + 4;
            for (let i = 0; i < this._ships.length; i++) {
                for (let j = 0; j < this._ships[i].size; j++) {
                    if (this._ships[i].position === 1) {
                        if (row === this._ships[i].x && column === this._ships[i].y + j) {
                            return this._ships[i];
                        }
                    } else {
                        if (this._ships[i].position === -1) {
                            if (row === this._ships[i].x + j && column === this._ships[i].y) {
                                return this._ships[i];
                            }
                        }
                    }
                }
            }
            return false;
        }

        checkAddShip(ship) {
            let goodCells = [];
            if (ship.size === 1) {
                for (let i = 4; i < this._board.length - 4; i++) {
                    for (let j = 4; j < this._board[i].length - 4; j++) {
                        if (this._board[i][j] === 0 && this._board[i - 1][j] % 10 === 0 && this._board[i + 1][j] % 10 === 0 && this._board[i][j + 1] % 10 === 0 && this._board[i][j - 1] % 10 === 0) goodCells.push({
                            x: i,
                            y: j,
                            position: 1
                        });
                    }
                }
            }

            if (ship.size === 2) {
                for (let i = 4; i < this._board.length - 4; i++) {
                    for (let j = 4; j < this._board[i].length - 4; j++) {
                        if (this._board[i][j] === 0 && this._board[i + 1][j] === 0 && this._board[i - 1][j] % 10 === 0 && this._board[i + 2][j] % 10 === 0 && this._board[i][j - 1] % 10 === 0 && this._board[i][j + 1] % 10 === 0 && this._board[i + 1][j + 1] % 10 === 0 && this._board[i + 1][j - 1] % 10 === 0) goodCells.push({
                            x: i,
                            y: j,
                            position: -1
                        });
                        if (this._board[i][j] === 0 && this._board[i][j + 1] === 0 && this._board[i][j - 1] % 10 === 0 && this._board[i][j + 2] % 10 === 0 && this._board[i + 1][j + 1] % 10 === 0 && this._board[i - 1][j + 1] % 10 === 0 && this._board[i + 1][j] % 10 === 0 && this._board[i - 1][j] % 10 === 0) goodCells.push({
                            x: i,
                            y: j,
                            position: 1
                        });
                    }
                }
            }

            if (ship.size === 3) {
                for (let i = 4; i < this._board.length - 4; i++) {
                    for (let j = 4; j < this._board[i].length - 4; j++) {
                        if (this._board[i][j] === 0 && this._board[i + 1][j] === 0 && this._board[i + 2][j] === 0 && this._board[i - 1][j] % 10 === 0 && this._board[i + 3][j] % 10 === 0 && this._board[i + 1][j + 1] % 10 === 0 && this._board[i + 1][j - 1] % 10 === 0 && this._board[i + 2][j + 2] % 10 === 0 && this._board[i + 2][j - 2] % 10 === 0 && this._board[i][j - 1] % 10 === 0 && this._board[i][j + 1] % 10 === 0) goodCells.push({
                            x: i,
                            y: j,
                            position: -1
                        });
                        if (this._board[i][j] === 0 && this._board[i][j + 1] === 0 && this._board[i][j + 2] === 0 && this._board[i][j + 3] % 10 === 0 && this._board[i][j - 1] % 10 === 0 && this._board[i + 1][j + 1] % 10 === 0 && this._board[i - 1][j + 1] % 10 === 0 && this._board[i + 1][j + 2] % 10 === 0 && this._board[i - 1][j + 2] % 10 === 0 && this._board[i + 1][j] % 10 === 0 && this._board[i - 1][j] % 10 === 0) goodCells.push({
                            x: i,
                            y: j,
                            position: 1
                        });
                    }
                }
            }

            if (ship.size === 4) {
                for (let i = 4; i < this._board.length - 4; i++) {
                    for (let j = 4; j < this._board[i].length - 4; j++) {
                        if (this._board[i][j] === 0 && this._board[i + 1][j] === 0 && this._board[i + 2][j] === 0 && this._board[i + 3][j] === 0 && this._board[i - 1][j] % 10 === 0 && this._board[i + 4][j] % 10 === 0 && this._board[i + 1][j + 1] % 10 === 0 && this._board[i + 1][j - 1] % 10 === 0 && this._board[i + 2][j + 1] % 10 === 0 && this._board[i + 2][j - 1] % 10 === 0 && this._board[i + 3][j + 1] % 10 === 0 && this._board[i + 3][j - 1] % 10 === 0 && this._board[i][j - 1] % 10 === 0 && this._board[i][j + 1] % 10 === 0) goodCells.push({
                            x: i,
                            y: j,
                            position: -1
                        });
                        if (this._board[i][j] === 0 && this._board[i][j + 1] === 0 && this._board[i][j + 2] === 0 && this._board[i][j + 3] === 0 && this._board[i][j + 4] % 10 === 0 && this._board[i][j - 1] % 10 === 0 && this._board[i + 1][j] % 10 === 0 && this._board[i - 1][j] % 10 === 0 && this._board[i + 1][j + 1] % 10 === 0 && this._board[i - 1][j + 1] % 10 === 0 && this._board[i + 1][j + 2] % 10 === 0 && this._board[i - 1][j + 2] % 10 === 0 && this._board[i + 1][j + 3] % 10 === 0 && this._board[i - 1][j + 3] % 10 === 0) goodCells.push({
                            x: i,
                            y: j,
                            position: 1
                        });
                    }
                }
            }
            return goodCells;
        }

        setShipToTable(i, j, ship, position) {
            if (ship.size === 1) {
                this._field.rows[i - 4].cells[j - 4].classList.add('my');
            }

            if (ship.size === 2) {
                if (position === -1) {
                    this._field.rows[i - 4].cells[j - 4].classList.add('my');
                    this._field.rows[i + 1 - 4].cells[j - 4].classList.add('my');
                }
                if (position === 1) {
                    this._field.rows[i - 4].cells[j - 4].classList.add('my');
                    this._field.rows[i - 4].cells[j + 1 - 4].classList.add('my');
                }
            }

            if (ship.size === 3) {
                if (position === -1) {
                    this._field.rows[i - 4].cells[j - 4].classList.add('my');
                    this._field.rows[i + 1 - 4].cells[j - 4].classList.add('my');
                    this._field.rows[i + 2 - 4].cells[j - 4].classList.add('my');
                }

                if (position === 1) {
                    this._field.rows[i - 4].cells[j - 4].classList.add('my');
                    this._field.rows[i - 4].cells[j + 1 - 4].classList.add('my');
                    this._field.rows[i - 4].cells[j + 2 - 4].classList.add('my');
                }
            }

            if (ship.size === 4) {
                if (position === -1) {
                    this._field.rows[i - 4].cells[j - 4].classList.add('my');
                    this._field.rows[i + 1 - 4].cells[j - 4].classList.add('my');
                    this._field.rows[i + 2 - 4].cells[j - 4].classList.add('my');
                    this._field.rows[i + 3 - 4].cells[j - 4].classList.add('my');

                }

                if (position === 1) {
                    this._field.rows[i - 4].cells[j - 4].classList.add('my');
                    this._field.rows[i - 4].cells[j + 1 - 4].classList.add('my');
                    this._field.rows[i - 4].cells[j + 2 - 4].classList.add('my');
                    this._field.rows[i - 4].cells[j + 3 - 4].classList.add('my');
                }
            }
        }

        setShip(i, j, ship, position, computer) {
            if (ship.size === 1) {
                this._board[i][j] = this._player.id;
                if (this._board[i - 1][j] !== 10) this._board[i - 1][j] = 3;
                if (this._board[i + 1][j] !== 10) this._board[i + 1][j] = 3;
                if (this._board[i][j + 1] !== 10) this._board[i][j + 1] = 3;
                if (this._board[i][j - 1] !== 10) this._board[i][j - 1] = 3;
                if (!computer) this._field.rows[i - 4].cells[j - 4].classList.add('my');
            }

            if (ship.size === 2) {
                if (position === -1) {
                    this._board[i][j] = this._player.id;
                    this._board[i + 1][j] = this._player.id;
                    if (this._board[i - 1][j] !== 10) this._board[i - 1][j] = 3;
                    if (this._board[i + 2][j] !== 10) this._board[i + 2][j] = 3;
                    if (this._board[i][j - 1] !== 10) this._board[i][j - 1] = 3;
                    if (this._board[i][j + 1] !== 10) this._board[i][j + 1] = 3;
                    if (this._board[i + 1][j + 1] !== 10) this._board[i + 1][j + 1] = 3;
                    if (this._board[i + 1][j - 1] !== 10) this._board[i + 1][j - 1] = 3;
                    if (!computer) this._field.rows[i - 4].cells[j - 4].classList.add('my');
                    if (!computer) this._field.rows[i + 1 - 4].cells[j - 4].classList.add('my');
                }
                if (position === 1) {
                    this._board[i][j] = this._player.id;
                    this._board[i][j + 1] = this._player.id;
                    if (this._board[i][j - 1] !== 10) this._board[i][j - 1] = 3;
                    if (this._board[i][j - 1] !== 10) this._board[i][j - 1] = 3;
                    if (this._board[i + 1][j + 1] !== 10) this._board[i + 1][j + 1] = 3;
                    if (this._board[i - 1][j + 1] !== 10) this._board[i - 1][j + 1] = 3;
                    if (this._board[i + 1][j] !== 10) this._board[i + 1][j] = 3;
                    if (this._board[i - 1][j] !== 10) this._board[i - 1][j] = 3;
                    if (!computer) this._field.rows[i - 4].cells[j - 4].classList.add('my');
                    if (!computer) this._field.rows[i - 4].cells[j + 1 - 4].classList.add('my');
                }
            }

            if (ship.size === 3) {
                if (position === -1) {
                    this._board[i][j] = this._player.id;
                    this._board[i + 1][j] = this._player.id;
                    this._board[i + 2][j] = this._player.id;
                    if (this._board[i - 1][j] !== 10) this._board[i - 1][j] = 3;
                    if (this._board[i + 3][j] !== 10) this._board[i + 3][j] = 3;
                    if (this._board[i + 1][j + 1] !== 10) this._board[i + 1][j + 1] = 3;
                    if (this._board[i + 1][j - 1] !== 10) this._board[i + 1][j - 1] = 3;
                    if (this._board[i + 2][j + 2] !== 10) this._board[i + 2][j + 2] = 3;
                    if (this._board[i + 2][j - 2] !== 10) this._board[i + 2][j - 2] = 3;
                    if (this._board[i][j - 1] !== 10) this._board[i][j - 1] = 3;
                    if (this._board[i][j + 1] !== 10) this._board[i][j + 1] = 3;
                    if (!computer) this._field.rows[i - 4].cells[j - 4].classList.add('my');
                    if (!computer) this._field.rows[i + 1 - 4].cells[j - 4].classList.add('my');
                    if (!computer) this._field.rows[i + 2 - 4].cells[j - 4].classList.add('my');
                }

                if (position === 1) {
                    this._board[i][j] = this._player.id;
                    this._board[i][j + 1] = this._player.id;
                    this._board[i][j + 2] = this._player.id;
                    if (this._board[i][j + 3] !== 10) this._board[i][j + 3] = 3;
                    if (this._board[i][j - 1] !== 10) this._board[i][j - 1] = 3;
                    if (this._board[i + 1][j + 1] !== 10) this._board[i + 1][j + 1] = 3;
                    if (this._board[i - 1][j + 1] !== 10) this._board[i - 1][j + 1] = 3;
                    if (this._board[i + 1][j + 2] !== 10) this._board[i + 1][j + 2] = 3;
                    if (this._board[i - 1][j + 2] !== 10) this._board[i - 1][j + 2] = 3;
                    if (this._board[i + 1][j] !== 10) this._board[i + 1][j] = 3;
                    if (this._board[i - 1][j] !== 10) this._board[i - 1][j] = 3;
                    if (!computer) this._field.rows[i - 4].cells[j - 4].classList.add('my');
                    if (!computer) this._field.rows[i - 4].cells[j + 1 - 4].classList.add('my');
                    if (!computer) this._field.rows[i - 4].cells[j + 2 - 4].classList.add('my');

                }
            }

            if (ship.size === 4) {
                if (position === -1) {
                    this._board[i][j] = this._player.id;
                    this._board[i + 1][j] = this._player.id;
                    this._board[i + 2][j] = this._player.id;
                    this._board[i + 3][j] = this._player.id;
                    if (this._board[i - 1][j] !== 10) this._board[i - 1][j] = 3;
                    if (this._board[i + 4][j] !== 10) this._board[i + 4][j] = 3;
                    if (this._board[i + 1][j + 1] !== 10) this._board[i + 1][j + 1] = 3;
                    if (this._board[i + 1][j - 1] !== 10) this._board[i + 1][j - 1] = 3;
                    if (this._board[i + 2][j + 1] !== 10) this._board[i + 2][j + 1] = 3;
                    if (this._board[i + 2][j - 1] !== 10) this._board[i + 2][j - 1] = 3;
                    if (this._board[i + 3][j + 1] !== 10) this._board[i + 3][j + 1] = 3;
                    if (this._board[i + 3][j - 1] !== 10) this._board[i + 3][j - 1] = 3;
                    if (this._board[i][j - 1] !== 10) this._board[i][j - 1] = 3;
                    if (this._board[i][j + 1] !== 10) this._board[i][j + 1] = 3;
                    if (!computer) this._field.rows[i - 4].cells[j - 4].classList.add('my');
                    if (!computer) this._field.rows[i + 1 - 4].cells[j - 4].classList.add('my');
                    if (!computer) this._field.rows[i + 2 - 4].cells[j - 4].classList.add('my');
                    if (!computer) this._field.rows[i + 3 - 4].cells[j - 4].classList.add('my');

                }

                if (position === 1) {
                    this._board[i][j] = this._player.id;
                    this._board[i][j + 1] = this._player.id;
                    this._board[i][j + 2] = this._player.id;
                    this._board[i][j + 3] = this._player.id;
                    if (this._board[i][j + 4] !== 10) this._board[i][j + 4] = 3;
                    if (this._board[i][j - 1] !== 10) this._board[i][j - 1] = 3;
                    if (this._board[i + 1][j] !== 10) this._board[i + 1][j] = 3;
                    if (this._board[i - 1][j] !== 10) this._board[i - 1][j] = 3;
                    if (this._board[i + 1][j + 1] !== 10) this._board[i + 1][j + 1] = 3;
                    if (this._board[i - 1][j + 1] !== 10) this._board[i - 1][j + 1] = 3;
                    if (this._board[i + 1][j + 2] !== 10) this._board[i + 1][j + 2] = 3;
                    if (this._board[i - 1][j + 2] !== 10) this._board[i - 1][j + 2] = 3;
                    if (this._board[i + 1][j + 3] !== 10) this._board[i + 1][j + 3] = 3;
                    if (this._board[i - 1][j + 3] !== 10) this._board[i - 1][j + 3] = 3;
                    if (!computer) this._field.rows[i - 4].cells[j - 4].classList.add('my');
                    if (!computer) this._field.rows[i - 4].cells[j + 1 - 4].classList.add('my');
                    if (!computer) this._field.rows[i - 4].cells[j + 2 - 4].classList.add('my');
                    if (!computer) this._field.rows[i - 4].cells[j + 3 - 4].classList.add('my');
                }
            }
        }

        randomSet() {
            for (let i = 0; i < this._board.length; i++) {
                for (let j = 0; j < this._board[i].length; j++) {
                    if (i < 4 || j < 4 || i > 13 || j > 13) this._board[i][j] = 10;
                    else this._board[i][j] = 0;
                }
            }

            for (let i = 0; i < this._field.rows.length; i++) {
                for (let j = 0; j < this._field.rows[i].childElementCount; j++) {
                    this._field.rows[i].cells[j].classList.remove('my', 'injury', 'miss', 'killed');
                }
            }

            for (let j = 0; j < this._ships.length; j++) {
                let mas = this.checkAddShip(this._ships[j]);
                let num = getRandom(0, mas.length - 1);
                if (!mas.length) {
                    return this.randomSet();
                }
                this._ships[j].x = mas[num].x;
                this._ships[j].position = mas[num].position;
                this._ships[j].y = mas[num].y;
                let computerCheck = this._player.id === 1 ? 0 : 1;
                this.setShip(mas[num].x, mas[num].y, this._ships[j], mas[num].position, computerCheck);
            }
        }
    }

    /* Корабль.
    _x,_y-координаты корабля
    _size-размер корабля
    _position-позиция (1-горизонт, -1-вертикаль)
    _injury-количество ранений корабля
    */
    class Ship {
        constructor(size) {
            this._x = -1;
            this._y = -1;
            this._size = size;
            this._position = 1;
            this._injury = 0;
        }

        set x(x) {
            this._x = x;
        }

        set master(master) {
            this._master = master;
        }

        get master() {
            return this._master;
        }

        set y(y) {
            this._y = y;
        }

        set injury(injury) {
            this._injury = injury;
        }

        get injury() {
            return this._injury;
        }

        set position(position) {
            this._position = position;
        }

        get size() {
            return this._size;
        }

        get position() {
            return this._position;
        }

        get x() {
            return this._x;
        }

        get y() {
            return this._y;
        }
    }

    /*
    Игрок.
    _id-идентификатор игрока(1 или 2)
    _name-имя игрока, в случае с компьютером default="Компьютер"
    _nextMoves-массив следующих ходов (!!!при первом попадании)
    _lineMoves-массив следующих ходов, если есть два попадения в данный корабль(ходы по направлению)
    _generateRandomMove-генерация рандомного хода(используется только компьютером),  опирается на предыдущие ходы
    _clearLineMoves,_clearNextMoves-очистка соответственно массивов _nextMoves и _lineMoves
    _myIndexOf-проверка нахождения в массиве объекта {x:x1,y:y1}

     */
    class Player extends Field {
        constructor(name, id) {
            super();
            this._id = id;
            this._name = name;
            this._nextMoves = [];
            this._lineMoves = [];
        }

        get id() {
            return this._id;
        }

        myIndexOf(o) {
            for (let i = 0; i < this._lineMoves.length; i++) {
                if (this._lineMoves[i].x === o.x && this._lineMoves[i].y === o.y) {
                    return i;
                }
            }
            return -1;
        }

        generateRandomMove(board) {
            /*при наличии линейных ходов стреляем по ним, чтоб добить корабль
            линейные ходы строятся при втором попадании в корабль путем добавления в массив по три клетки в обе стороны от клетки, раненой второй
            в данном корабле по направлению раненых двух клеток
            если при стрельбе по линейным ходам мы попадаем в пустую клетку, то проверяем с какой стороны мы уже попали и удаляем все клетки,
            которые стоят по другую сторону от раненой клетки, так как там нашего корабля точно быть не может
             */
            if (this._lineMoves.length) {
                let res = this._lineMoves[0];
                if (board[res.x][res.y] === 0 || board[res.x][res.y] === 3) {
                    if (board[res.x - 1][res.y] === 5) {
                        let obj = {x: res.x + 1, y: res.y};
                        let index = this.myIndexOf(obj);
                        if (index >= 0) {
                            this._lineMoves.splice(index, 1);
                        }
                        obj = {x: res.x + 2, y: res.y};
                        index = this.myIndexOf(obj);
                        if (index >= 0) {
                            this._lineMoves.splice(index, 1);
                        }
                    }

                    if (board[res.x + 1][res.y] === 5) {
                        let obj = {x: res.x - 1, y: res.y};
                        let index = this.myIndexOf(obj);
                        if (index >= 0) {
                            this._lineMoves.splice(index, 1);
                        }
                        obj = {x: res.x - 2, y: res.y};
                        index = this.myIndexOf(obj);
                        if (index >= 0) {
                            this._lineMoves.splice(index, 1);
                        }
                    }
                    if (board[res.x][res.y + 1] === 5) {
                        let obj = {x: res.x, y: res.y - 1};
                        let index = this.myIndexOf(obj);
                        if (index >= 0) {
                            this._lineMoves.splice(index, 1);
                        }
                        obj = {x: res.x, y: res.y - 2};
                        index = this.myIndexOf(obj);
                        if (index >= 0) {
                            this._lineMoves.splice(index, 1);
                        }
                    }
                    if (board[res.x][res.y - 1] === 5) {
                        let obj = {x: res.x, y: res.y + 1};
                        let index = this.myIndexOf(obj);
                        if (index >= 0) {
                            this._lineMoves.splice(index, 1);
                        }
                        obj = {x: res.x, y: res.y + 2};
                        index = this.myIndexOf(obj);
                        if (index >= 0) {
                            this._lineMoves.splice(index, 1);
                        }
                    }
                }
                this._lineMoves.splice(0, 1);
                return res;
            }
            /*если нет не линейных, не следующих ходов, то просто генерируем рандомную СВОБОДНУЮ клетку и возвращаем ее*/
            if (!this._nextMoves.length) {
                let moves = [];
                for (let i = 4; i < board.length - 4; i++) {
                    for (let j = 4; j < board[i].length - 4; j++) {
                        if (board[i][j] === 1 || board[i][j] === 0)
                            moves.push({x: i, y: j})
                    }
                }
                let num = getRandom(0, moves.length - 1);
                if (board[moves[num].x][moves[num].y] === 1) {
                    if (moves[num].x > 4 && board[moves[num].x - 1][moves[num].y] !== 4 && board[moves[num].x - 1][moves[num].y] !== 5 && board[moves[num].x - 1][moves[num].y] >= 0) this._nextMoves.push({
                        x: moves[num].x - 1,
                        y: moves[num].y
                    });
                    if (moves[num].x < 13 && board[moves[num].x + 1][moves[num].y] !== 4 && board[moves[num].x + 1][moves[num].y] !== 5 && board[moves[num].x + 1][moves[num].y] >= 0) this._nextMoves.push({
                        x: moves[num].x + 1,
                        y: moves[num].y
                    });
                    if (moves[num].y > 4 && board[moves[num].x][moves[num].y - 1] !== 4 && board[moves[num].x][moves[num].y - 1] !== 5 && board[moves[num].x][moves[num].y - 1] >= 0) this._nextMoves.push({
                        x: moves[num].x,
                        y: moves[num].y - 1
                    });
                    if (moves[num].y < 13 && board[moves[num].x][moves[num].y + 1] !== 4 && board[moves[num].x][moves[num].y + 1] !== 5 && board[moves[num].x][moves[num].y + 1] >= 0) this._nextMoves.push({
                        x: moves[num].x,
                        y: moves[num].y + 1
                    });
                }
                return moves[num];
            }
            /*если же есть следующие ходы, то стреляем по ним
               в случае второго попадания по кораблю генерируем линейные ходы путем добавления справа и слева или сверху и снизу( в зависимости от
               направления двух раненых клеток ) и добавляем по три клетки в массив
             */
            let num = getRandom(0, this._nextMoves.length - 1);
            let res = this._nextMoves[num];
            if (board[res.x][res.y] === 1 && (board[res.x - 1][res.y] === 5 || board[res.x + 1][res.y] === 5)) {
                this.clearNextMoves();
                for (let i = 1; i < 4; i++) {
                    if (board[res.x + i][res.y] === 0 || board[res.x + i][res.y] === 1 || board[res.x + i][res.y] === 3) {
                        this._lineMoves.push({x: res.x + i, y: res.y});
                    }
                    if (board[res.x - i][res.y] === 0 || board[res.x - i][res.y] === 1 || board[res.x - i][res.y] === 3) {
                        this._lineMoves.push({x: res.x - i, y: res.y});
                    }
                }
                return res;
            }
            if (board[res.x][res.y] === 1 && (board[res.x][res.y - 1] === 5 || board[res.x][res.y + 1] === 5)) {
                this.clearNextMoves();
                for (let i = 1; i < 3; i++) {
                    if (board[res.x][res.y + i] === 0 || board[res.x][res.y + i] === 1 || board[res.x][res.y + i] === 3) {
                        this._lineMoves.push({x: res.x, y: res.y + i});
                    }
                    if (board[res.x][res.y - i] === 0 || board[res.x][res.y - i] === 1 || board[res.x][res.y - i] === 3) {
                        this._lineMoves.push({x: res.x, y: res.y - i});
                    }
                }
                return res;
            }
            if (board[res.x][res.y] === 1) {
                if (res.x > 4 && board[res.x - 1][res.y] !== 4 && board[res.x - 1][res.y] !== 5 && board[res.x - 1][res.y] >= 0) this._nextMoves.push({
                    x: res.x - 1,
                    y: res.y
                });
                if (res.x < 13 && board[res.x + 1][res.y] !== 4 && board[res.x + 1][res.y] !== 5 && board[res.x + 1][res.y] >= 0) this._nextMoves.push({
                    x: res.x + 1,
                    y: res.y
                });
                if (res.y > 4 && board[res.x][res.y - 1] !== 4 && board[res.x][res.y - 1] !== 5 && board[res.x][res.y - 1] >= 0) this._nextMoves.push({
                    x: res.x,
                    y: res.y - 1
                });
                if (res.y < 13 && board[res.x][res.y + 1] !== 4 && board[res.x][res.y + 1] !== 5 && board[res.x][res.y + 1] >= 0) this._nextMoves.push({
                    x: res.x,
                    y: res.y + 1
                });
            }
            this._nextMoves.splice(num, 1);
            return res;
        }

        clearNextMoves() {
            this._nextMoves.length = 0;
        }

        clearLineMoves() {
            this._lineMoves.length = 0;
        }

        get name() {
            return this._name;
        }
    }

    /*нажатие на кнопку начать инициализирует новую сессию, проверяет имя на длину >=3*/
    startInstallation.addEventListener('click', function () {
        let nameInput = document.getElementById('player-name');
        if (nameInput.value.trim().length < 3) {
            let error = document.getElementsByClassName('name-length-error')[0];
            error.style.display = 'inline-block';
        } else {
            let session = new Session();
            session.start();
            let error = document.getElementsByClassName('name-length-error')[0];
            error.style.display = 'none';
        }
    });
};