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
let tableCards = []
let trumpSuit

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

    socket.on('playersReady', () =>
    {
        for (let i = 0 ; i < players.length; i++) {
            console.log("socket id of player: " + players[i])
            io.sockets.connected[players[i][0]].emit('podvalCards', deck[deck.length - 1])
            deck.pop()
            io.sockets.connected[players[i][0]].emit('podvalCards', deck[deck.length - 1])
            deck.pop()
        }

        io.emit('deckCard', deck[deck.length - 1])

        io.sockets.connected[players[activePlayerNum][0]].emit('active')
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
            console.log('players array: ' + players)
            console.log('activePlayerNum: ' + activePlayerNum)
            io.sockets.connected[players[activePlayerNum][0]].emit('active')
            console.log('trump suit: ' + trumpSuit)
            setTimeout(() => {io.sockets.connected[players[activePlayerNum][0]].emit('active')}, 4500)
        } else
        {
            io.emit('deckCard', deck[deck.length - 1])
        }
    })

    socket.on('punishCard', (cardObj) =>
    {
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

    socket.on('dealCards', () =>
    {
        io.emit('dealCards')
    })

    let oldActivePlayer
    let timeout
    //commented out the hopefully working version
{
    // socket.on('cardPlayed', (gameObject) =>
    // {
    //     if (tableCards.length !== 0)
    //     {
    //         console.log('last element of table cards: '+tableCards[tableCards.length-1].cardSuit + ' ' + tableCards[tableCards.length-1].cardValue)
    //         console.log('gameObject: '+gameObject.cardSuit + ' ' + gameObject.cardValue)
    //         if (gameObject.cardSuit === tableCards[tableCards.length - 1].cardSuit) 
    //         {
    //             if (gameObject.cardValue > tableCards[tableCards.length - 1].cardValue) 
    //             {
    //                 tableCards.push(gameObject)
    //                 io.emit('cardPlayedServ', gameObject, activePlayerNum)
    //                 for (let i = 1; i <= players[activePlayerNum].length; i++) {
    //                     if (gameObject === players[activePlayerNum][i]) {
    //                         players[activePlayerNum] = players[activePlayerNum].splice(i, 1)
    //                     }
    //                 }
    //                 oldActivePlayer = activePlayerNum
    //                 activePlayerNum = (activePlayerNum+1)%players.length
    //                 timeout = setTimeout(() => {io.sockets.connected[players[activePlayerNum][0]].emit('active')}, 4500)
    //             } else
    //             {
    //                 io.sockets.connected[players[activePlayerNum][0]].emit('punish')
    //                 socket.broadcast.emit(`toPunish`, activePlayerNum);
    //             }
    //         } else
    //         {
    //             if (gameObject.cardSuit === trumpSuit)
    //             {
    //                 if (gameObject.cardSuit === 3) 
    //                 {
    //                     io.sockets.connected[players[activePlayerNum][0]].emit('punish')
    //                     socket.broadcast.emit(`toPunish`, activePlayerNum);
    //                 } else
    //                 {
    //                     tableCards.push(gameObject)
    //                     io.emit('cardPlayedServ', gameObject, activePlayerNum)
    //                     for (let i = 1; i <= players[activePlayerNum].length; i++) {
    //                         if (gameObject === players[activePlayerNum][i]) {
    //                            players[activePlayerNum] = players[activePlayerNum].splice(i, 1)
    //                         }
    //                     }
    //                     oldActivePlayer = activePlayerNum
    //                     activePlayerNum = (activePlayerNum+1)%players.length
    //                     timeout = setTimeout(() => {io.sockets.connected[players[activePlayerNum][0]].emit('active')}, 4500)
    //                 }
    //             } else
    //             {
    //                 io.sockets.connected[players[activePlayerNum][0]].emit('punish')
    //                 socket.broadcast.emit(`toPunish`, activePlayerNum);
    //             }
    //         }
    //         if (tableCards.length === players.length) {
    //             clearTimeout(timeout)
    //             activePlayerNum = oldActivePlayer
    //             io.sockets.connected[players[activePlayerNum][0]].emit('active')
    //             tableCards.splice(0,tableCards.length)
    //             io.emit('discard')
    //         }
    //     } else
    //     {
    //         tableCards.push(gameObject)
    //         io.emit('cardPlayedServ', gameObject, activePlayerNum)
    //         for (let i = 1; i <= players[activePlayerNum].length; i++) {
    //             if (gameObject === players[activePlayerNum][i]) {
    //                 players[activePlayerNum] = players[activePlayerNum].splice(i, 1)
    //             }
    //         }
    //         activePlayerNum = (activePlayerNum+1)%players.length
    //         setTimeout(() => {io.sockets.connected[players[activePlayerNum][0]].emit('active')}, 4500)
    //         // io.sockets.connected[players[(activePlayerNum+1)%players.length][0]].emit('active')
    //     }
    //     outputState()
    // })
}
    socket.on('cardPlayed', (gameObject) =>
{
    
    
    tableCards.push(gameObject)
    io.emit('cardPlayedServ', gameObject, activePlayerNum)
    for (let i = 1; i <= players[activePlayerNum].length; i++) {
        if (gameObject === players[activePlayerNum][i]) {
            players[activePlayerNum] = players[activePlayerNum].splice(i, 1)
        }
    }
    activePlayerNum = (activePlayerNum+1)%players.length
    setTimeout(() => {io.sockets.connected[players[activePlayerNum][0]].emit('active')}, 4500)
    if (tableCards.length === players.length) {
        clearTimeout(timeout)
        activePlayerNum = oldActivePlayer
        io.sockets.connected[players[activePlayerNum][0]].emit('active')
        tableCards.splice(0,tableCards.length)
        io.emit('discard')
    }
    outputState()
    })
    
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
        outputState()
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
    console.log(`number of players : ${players.length}`)
    console.log(`trump suit: ${trumpSuit}`)
    console.log(`number of cards in hand of player1: ${players[0].length-1}`)
    console.log(`number of cards in hand of player2: ${players[1].length-1}`)
    console.log(`number of cards in hand of player3: ${players[2].length-1}`)
    console.log(`number of cards in hand of player4: ${players[3].length-1}`)
}

http.listen(PORT, () =>
{
    console.log('listening on ' + PORT)
    console.log('server started');
})

