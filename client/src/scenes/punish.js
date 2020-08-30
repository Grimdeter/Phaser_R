import Card from '../helpers/card.js';

export default class punish extends Phaser.Scene
{
    constructor()
    {
        super({
            key: 'punish'
        })
    }

    init(data)
    {
        this.sceneNum = data.sceneNum
        this.playerCards = data.playerCards
        this.socket = data.socket
        this.podval = data.podval
        this.isPlayerA = data.isPlayerA
        this.isPlayerB = data.isPlayerB
        this.isPlayerC = data.isPlayerC
        this.isPlayerD = data.isPlayerD
    }

    preload()
    {
        
    }

    create()
    {
        console.log('entering punish scene: ')
        let counter = 0
        let renderCards = []

        
        this.renderPlayerCards(renderCards)
        this.socket.on('newCard', (cardObj) =>
        {
            this.playerCards.push(cardObj)
            this.renderPlayerCards(renderCards)
            counter++
            if (counter === 3) {
                this.socket.emit('changeOfSceneForPunish')
            }
        })
        this.socket.on('changeOfSceneForPunish', (numOfCardsA, numOfCardsB, numOfCardsC, numOfCardsD) =>
        {
            if(this.sceneNum === 1)
            {
                console.log('start Phase1')
                this.socket.emit('turnOver')
                this.scene.start('gamePhase1', {playerCards:this.playerCards, socket:this.socket, podval:this.podval, isPlayerA: this.isPlayerA, isPlayerB: this.isPlayerB, isPlayerC: this.isPlayerC, isPlayerD: this.isPlayerD})
            } else
            {
                this.socket.emit('turnOver')
                console.log('start Phase2')
                this.scene.start('gamePhase2', {playerCards:this.playerCards, socket:this.socket, podval:this.podval, isPlayerA: this.isPlayerA, isPlayerB: this.isPlayerB, isPlayerC: this.isPlayerC, isPlayerD: this.isPlayerD, numOfCardsA: numOfCardsA, numOfCardsB: numOfCardsB, numOfCardsC: numOfCardsC, numOfCardsD: numOfCardsD})
            }
        })
    }

    renderPlayerCards(cardsRender)
    {
        console.log(`cards render length: ${cardsRender.length}`)
        if (cardsRender.length !== 0) {
            for (let i = 0; i < cardsRender.length; i++) {
                cardsRender[i].destroy
            }    
        }
        
        // render player cards
        for (let i = 0; i < this.playerCards.length; i++) {
            cardsRender.push((new Card(this)).render(((i*100) + 500), 800, this.playerCards[i]))
        }
    }

    update()
    {
        
    }
}