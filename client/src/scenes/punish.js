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
        this.counter = 0
        this.renderCards = []

        this.renderCards = this.renderPlayerCards(this.renderCards)
        this.socket.on('newCardP', (cardObj) =>
        {
            this.playerCards.push(cardObj)
            this.renderCards = this.renderPlayerCards(this.renderCards)
            for(let card in this.playerCards)
            {
                console.log(`card Suit: ${this.playerCards[card].cardSuit} card Value: ${this.playerCards[card].cardValue}`);
            }
            this.counter++
            if (this.counter === 3) {
                this.socket.emit('changeOfSceneForPunish')
            }
        })
        this.socket.on('changeOfSceneForPunish', (numOfCardsA, numOfCardsB, numOfCardsC, numOfCardsD) =>
        {
            if(this.sceneNum === 1)
            {
                // console.log('start Phase1')
                // this.socket.emit('turnOver')
                this.scene.stop()
                this.scene.start('gamePhase1', {playerCards:this.playerCards, socket:this.socket, podval:this.podval, isPlayerA: this.isPlayerA, isPlayerB: this.isPlayerB, isPlayerC: this.isPlayerC, isPlayerD: this.isPlayerD})
            } else
            {
                // this.socket.emit('turnOver')
                console.log('start Phase2')
                this.scene.stop()
                this.scene.start('gamePhase2', {playerCards:this.playerCards, socket:this.socket, podval:this.podval, isPlayerA: this.isPlayerA, isPlayerB: this.isPlayerB, isPlayerC: this.isPlayerC, isPlayerD: this.isPlayerD, numOfCardsA: numOfCardsA, numOfCardsB: numOfCardsB, numOfCardsC: numOfCardsC, numOfCardsD: numOfCardsD})
            }
        })
    }

    renderPlayerCards(cardsRenderFunc)
    {
        console.log(`cards render length: ${cardsRenderFunc.length}`)
        for (let i = 0; i < cardsRenderFunc.length; i++) {
            cardsRenderFunc[i].destroy()
        }
        cardsRenderFunc.splice(0, cardsRender.length)
        for (let i = 0; i < this.playerCards.length; i++) {
            cardsRenderFunc.push((new Card(this)).render(((i*100) + 500), 800, this.playerCards[i]))
        }
        return cardsRenderFunc
    }

    update()
    {
        
    }
}