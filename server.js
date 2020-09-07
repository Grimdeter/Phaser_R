let PORT = process.env.PORT || 3000
const express = require('express')
const server = express();
const http = require('http').createServer(server);
const io = require('socket.io')(http);
let Deck = require('./deckServ').Deck
let players = []
let spectators = []
let deck 
let activePlayerNum = 0;
let oldActivePlayerNum
let timeout
let tableCards = []
let trumpSuit
let toPunishCounter

// server.use(express.static(__dirname + '/client/dist'))

// server.get('/',function(req,res){
//     res.sendFile(__dirname + '/client/dist/index.html');
// });

io.on('connection', (socket) =>
{
    console.log('user connected: ' + socket.id);

    // creates shuffled deck
    deck = new Deck()

    players[players.length] = new Array();
    players[players.length - 1].push(socket.id)
    console.log('user is pushed into players, players.lenght: ' + players.length)


    if (players.length === 1) {
        console.log('num of players: ' + players.length)
        console.log('players array: ' + players)
        socket.emit('isPlayerA');
    } else if (players.length === 2)
    {
        console.log('num of players: ' + players.length)
        console.log('players array: ' + players)
        socket.emit('isPlayerB');
        io.emit('NumPlayers2')
    } else if (players.length === 3)
    {
        console.log('num of players: ' + players.length)
        console.log('players array: ' + players)
        io.emit('NumPlayers3')
        socket.emit('isPlayerC');
    } else if (players.length === 4)
    {
        console.log('num of players: ' + players.length)
        console.log('players array: ' + players)
        io.emit('NumPlayers4')
        socket.emit('isPlayerD');
    } 
    // else 
    // {
    //     spectators.push(players[4][0])
    //     players[3].pop()
    //     socket.emit('isSpectator');
    // }

    // deployment playersReady
{
    // socket.on('playersReady', () =>
    // {
    //     for (let i = 0 ; i < players.length; i++) {
    //         console.log("socket id of player: " + players[i])
    //         io.sockets.connected[players[i][0]].emit('podvalCards', deck[deck.length - 1])
    //         deck.pop()
    //         io.sockets.connected[players[i][0]].emit('podvalCards', deck[deck.length - 1])
    //         deck.pop()
    //     }

    //     io.emit('deckCard', deck[deck.length - 1])

    //     io.sockets.connected[players[activePlayerNum][0]].emit('active')
    // })
}

    // testing playersReady, which skips directly into phase2
    socket.on('playersReady', () =>
    {
        for (let i = 0 ; i < players.length; i++) {
            console.log("socket id of player: " + players[i])
            io.sockets.connected[players[i][0]].emit('podvalCards', deck[deck.length - 1])
            deck.pop()
            io.sockets.connected[players[i][0]].emit('podvalCards', deck[deck.length - 1])
            deck.pop()
            for (let j = 0; j < 7; j++) {
                io.sockets.connected[players[i][0]].emit('newCard', deck[deck.length - 1])
                players[j].push(deck[deck.length - 1])
                deck.pop()
            }
        }

        io.emit('nextPhase', players[0].length - 1, players[1].length - 1, players[2].length - 1,players[3].length - 1)
        outputPlayersArray(players)
        setTimeout(() => {io.sockets.connected[players[activePlayerNum][0]].emit('active')}, 4500)
    })

    socket.on('turnOver', () =>
    {
        if (activePlayerNum !== (players.length - 1)) {
            activePlayerNum++
        } else
        {
            activePlayerNum = 0;
        }
        // console.log(activePlayerNum)
        io.sockets.connected[players[activePlayerNum][0]].emit('active')
    })

    socket.on('cardDraggedInto', (x, y, gameObject) =>
    {
        console.log('gameObject.cardValue: ' + gameObject.cardValue)
        if (deck[deck.length - 1].cardSuit !== 3) 
        {
            trumpSuit = deck[deck.length - 1].cardSuit  
        }
          
        if (x === 150)
        {
            console.log('card value of the top card of destination (left): ' + (players[(activePlayerNum + 1) % 4][(players[(activePlayerNum + 1) % 4].length) - 1].cardValue))
            if (players[(activePlayerNum + 1) % 4].length !== 1 )
            {
                let diff = ((players[(activePlayerNum + 1) % 4][(players[(activePlayerNum + 1 ) % 4].length) - 1].cardValue)  - gameObject.cardValue)
                console.log('difference between top card and gameOjbject (diff): ' + diff)
                if (diff !== -1 ) {
                    if (diff !== 8) {
                        console.log('Punish: ' + activePlayerNum)
                        io.sockets.connected[players[activePlayerNum][0]].emit('punish')
                        socket.broadcast.emit(`toPunish`, activePlayerNum)
                    }
                }
            }
            players[(activePlayerNum + 1) % 4].push(gameObject)
            io.sockets.connected[players[(activePlayerNum + 1) % 4][0]].emit('newCard', gameObject)
        } else if (x === 700 && y !== 800)
        {
            console.log('card value of the top card of destination (across): ' + (players[(activePlayerNum + 2) % 4][(players[(activePlayerNum + 2 ) % 4].length) - 1].cardValue))
            
            if (players[(activePlayerNum + 2) % 4].length !== 1 )
            {
                let diff = ((players[(activePlayerNum + 2) % 4][(players[(activePlayerNum + 2 ) % 4].length) - 1].cardValue)  - gameObject.cardValue)
                console.log('difference between top card and gameOjbject: ' + diff)
                if (diff !== -1 ) {
                    if (diff !== 8) {
                        console.log('Punish: ' + activePlayerNum)
                        io.sockets.connected[players[activePlayerNum][0]].emit('punish')
                        socket.broadcast.emit(`toPunish`, activePlayerNum)
                    }
                    
                }
            }
            players[(activePlayerNum + 2) % 4].push(gameObject)
            io.sockets.connected[players[(activePlayerNum + 2) % 4][0]].emit('newCard', gameObject)
        } else if (x === 1250)
        {
            console.log('card value of the top card of destination (right): ' + (players[(activePlayerNum + 3) % 4][(players[(activePlayerNum + 3 ) % 4].length) - 1].cardValue))
            if (players[(activePlayerNum + 3) % 4].length !== 1 )
            {
                let diff = ((players[(activePlayerNum + 3) % 4][(players[(activePlayerNum + 3 ) % 4].length) - 1].cardValue)  - gameObject.cardValue)
                console.log('difference between top card and gameOjbject: ' + diff)
                if (diff !== -1 ) {
                    if (diff !== 8) {
                        console.log('Punish: ' + activePlayerNum)
                        io.sockets.connected[players[activePlayerNum][0]].emit('punish')
                        socket.broadcast.emit(`toPunish`, activePlayerNum)
                    }
                }
            }
            players[(activePlayerNum + 3) % 4].push(gameObject)
            io.sockets.connected[players[(activePlayerNum + 3) % 4][0]].emit('newCard', gameObject)
        } else
        {
            console.log('card value of the top card of destination (self): ' + (players[(activePlayerNum) % 4][(players[(activePlayerNum ) % 4].length) - 1].cardValue))
            players[(activePlayerNum)].push(gameObject)
            io.sockets.connected[players[activePlayerNum][0]].emit('newCard', gameObject)
        }

        deck.pop()
        io.emit('deckCardNumber', deck.length)
        io.emit('destroyDeckCard')
        if (deck.length === 0) {
            activePlayerNum = (activePlayerNum+1)%4
            io.emit('nextPhase', players[0].length - 1, players[1].length - 1, players[2].length - 1,players[3].length - 1)
            outputPlayersArray(players)
            io.sockets.connected[players[activePlayerNum][0]].emit('active')
            setTimeout(() => {io.sockets.connected[players[activePlayerNum][0]].emit('active')}, 4500)
        } else
        {
            io.emit('deckCard', deck[deck.length - 1])
        }
    })

    socket.on('punishCard', (cardObj, playerNum) =>
    {
        for (let i = 1; i < players[playerNum].length; i++) {
            if (cardObj.cardValue === players[playerNum][i].cardValue && cardObj.cardSuit === players[activePlayerNum][i].cardSuit) {
                players[playerNum].splice(i, 1)
            }
        }
        players[activePlayerNum].push(cardObj)
        io.sockets.connected[players[activePlayerNum][0]].emit('newCard', cardObj)
    })

    socket.on('topCardA', (card) =>
    {
        io.emit('topCardA', card)
    })

    socket.on('topCardB', (card) =>
    {
        io.emit('topCardB', card)
    })

    socket.on('topCardC', (card) =>
    {
        io.emit('topCardC', card)
    })

    socket.on('topCardD', (card) =>
    {
        io.emit('topCardD', card)
    })

    //commented out the hopefully working version
    socket.on('cardPlayed', (gameObject) =>
    {
        if (tableCards.length !== 0)
        {
            console.log('last element of table cards: '+tableCards[tableCards.length-1].cardSuit + ' ' + tableCards[tableCards.length-1].cardValue)
            console.log('gameObject: '+gameObject.cardSuit + ' ' + gameObject.cardValue)
            if (gameObject.cardSuit === tableCards[tableCards.length - 1].cardSuit) 
            {
                if (gameObject.cardValue > tableCards[tableCards.length - 1].cardValue) 
                {
                    tableCards.push(gameObject)
                    io.emit('cardPlayedServ', gameObject, activePlayerNum)
                    for (let i = 1; i < players[activePlayerNum].length; i++) {
                        if (gameObject.cardValue === players[activePlayerNum][i].cardValue && gameObject.cardSuit === players[activePlayerNum][i].cardSuit) {
                            players[activePlayerNum].splice(i, 1)
                        }
                    }
                    oldActivePlayerNum = activePlayerNum
                    activePlayerNum = (activePlayerNum+1)%players.length
                    timeout = setTimeout(() => {io.sockets.connected[players[activePlayerNum][0]].emit('active')}, 1500)
                } else
                {
                    io.sockets.connected[players[activePlayerNum][0]].emit('punish')
                    socket.broadcast.emit(`toPunish`, activePlayerNum);
                }
            } else
            {
                if (gameObject.cardSuit === trumpSuit)
                {
                    if (gameObject.cardSuit === 3) 
                    {
                        io.sockets.connected[players[activePlayerNum][0]].emit('punish')
                        socket.broadcast.emit(`toPunish`, activePlayerNum);
                    } else
                    {
                        tableCards.push(gameObject)
                        io.emit('cardPlayedServ', gameObject, activePlayerNum)
                        for (let i = 1; i < players[activePlayerNum].length; i++) {
                            if (gameObject.cardValue === players[activePlayerNum][i].cardValue && gameObject.cardSuit === players[activePlayerNum][i].cardSuit) {
                                players[activePlayerNum].splice(i, 1)
                            }
                        }
                        oldActivePlayerNum = activePlayerNum
                        activePlayerNum = (activePlayerNum+1)%players.length
                        timeout = setTimeout(() => {io.sockets.connected[players[activePlayerNum][0]].emit('active')}, 1500)
                    }
                } else
                {
                    io.sockets.connected[players[activePlayerNum][0]].emit('punish')
                    socket.broadcast.emit(`toPunish`, activePlayerNum);
                }
            }
            if (tableCards.length === players.length) {
                clearTimeout(timeout)
                activePlayerNum = oldActivePlayerNum
                io.sockets.connected[players[activePlayerNum][0]].emit('active')
                tableCards.splice(0,tableCards.length)
                io.emit('discard')
            }
        } else
        {
            tableCards.push(gameObject)
            io.emit('cardPlayedServ', gameObject, activePlayerNum)
            for (let i = 1; i < players[activePlayerNum].length; i++) {
                if (gameObject.cardValue === players[activePlayerNum][i].cardValue && gameObject.cardSuit === players[activePlayerNum][i].cardSuit) {
                    players[activePlayerNum].splice(i, 1)
                }
            }
            oldActivePlayerNum = activePlayerNum
            activePlayerNum = (activePlayerNum+1)%players.length
            timeout = setTimeout(() => {io.sockets.connected[players[activePlayerNum][0]].emit('active')}, 1500)
        }
        outputState()
    })
    // testing version
{
    // socket.on('cardPlayed', (gameObject) =>
    // {
    //     tableCards.push(gameObject)
    //     io.emit('cardPlayedServ', gameObject, activePlayerNum)
    //     for (let i = 1; i < players[activePlayerNum].length; i++) {
    //         if (gameObject.cardValue === players[activePlayerNum][i].cardValue && gameObject.cardSuit === players[activePlayerNum][i].cardSuit) {
    //             players[activePlayerNum].splice(i, 1)
    //         }
    //     }
    //     oldActivePlayerNum = activePlayerNum
    //     activePlayerNum = (activePlayerNum+1)%players.length
    //     timeout = setTimeout(() => {io.sockets.connected[players[activePlayerNum][0]].emit('active')}, 1500)
    //     if (tableCards.length === players.length) {
    //         clearTimeout(timeout)
    //         activePlayerNum = oldActivePlayerNum
    //         io.sockets.connected[players[activePlayerNum][0]].emit('active')
    //         tableCards.splice(0,tableCards.length)
    //         io.emit('discard')
    //     }
    //     outputState()
    // })
}  
    socket.on('takeCard', () =>
    {
        if (tableCards.length !== 0 ) {
            io.sockets.connected[players[activePlayerNum][0]].emit('newCard', tableCards[0])
            players[activePlayerNum].push(tableCards[0])
            tableCards.shift()
            io.emit('cardTaken', activePlayerNum)
        }
        activePlayerNum = (activePlayerNum+1)%players.length
        io.sockets.connected[players[activePlayerNum][0]].emit('active')
        outputState()
    })

    socket.on('podval', (newTrumpSuit, playerNum, cards) =>
    {
        players[playerNum].push(cards[0])
        players[playerNum].push(cards[1])
        trumpSuit = newTrumpSuit
        console.log(`emitting podvalTaken of ${playerNum}`)
        io.emit('podvalTaken', playerNum)
        outputState()
    })

    socket.on('win', (playerNum) =>
    {
        players.splice(playerNum,1)
        console.log("num of players: " + players.length)
    })

    socket.on('changeSceneForToPunish', () =>
    {
        toPunishCounter++
        if (toPunishCounter === players.length-1) {
            io.emit('changeSceneForToPunish', players[0].length - 1, players[1].length - 1, players[2].length - 1,players[3].length - 1)
        }
    })

    socket.on('changeOfSceneForPunish', () =>
    {
        io.emit('changeOfSceneForPunish', players[0].length - 1, players[1].length - 1, players[2].length - 1,players[3].length - 1)
    })

    socket.on('tableCards', () =>
    {
        io.emit('tableCards', tableCards)
    })
    
    socket.on('disconnect', () =>
    {
        console.log('user disconnected: ' + socket.id);
        players = players.filter(players => players[0] !== socket.id)
        console.log("num of players: " + players.length)
    })
})

function outputState()
{
    console.log(`active player num: ${activePlayerNum}`)
    console.log(`old active player num: ${oldActivePlayerNum}`)
    console.log(`number of players : ${players.length}`)
    console.log(`trump suit: ${trumpSuit}`)
    for (let i = 0; i < players.length; i++) {
        console.log(`number of cards in hand of player${i}: ${players[i].length-1}`)
    }
    console.log('***********************************')
}

function outputPlayersArray(players)
{
    for(var i = 0; i < players.length; i++) {
        var player = players[i];
        console.log(`socket id of player: ${player[0]}`);
        for(let card in player)
        {
            console.log(`card Suit: ${player[card].cardSuit} card Value: ${player[card].cardValue}`);
        }
    }
}

http.listen(PORT, () =>
{
    console.log('listening on ' + PORT)
    console.log('server started');
})

