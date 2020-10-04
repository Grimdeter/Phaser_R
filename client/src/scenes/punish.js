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
        this.changedSceneFlag = false
        console.log(`i entered from ${this.sceneNum}`)
        console.log(`i entered from ${this.socket}`)
        this.sceneToAccess = this.scene.manager.getScene(`gamePhase${this.sceneNum}`)
        console.log('entering punish scene: ')
        this.counter = 0
        this.renderCards = []

        this.renderCards = this.renderPlayerCards(this.renderCards)
        this.socket.on('newCardP', (cardObj) =>
        {
            this.scene.get(`gamePhase${this.sceneNum}`).playerCards.push(cardObj)
            this.renderCards = this.renderPlayerCards(this.renderCards)
            for(let card in this.scene.get(`gamePhase${this.sceneNum}`).playerCards)
            {
                // console.log(`card Suit: ${this.playerCards[card].cardSuit} card Value: ${this.playerCards[card].cardValue}`);
                // console.log(`playerCards in gamePhase2 card Suit: ${this.scene.get(`gamePhase2`).playerCards[card].cardSuit} card Value: ${this.scene.get(`gamePhase2`).playerCards[card].cardValue}`);
                // console.log(`second method playerCards in gamePhase2 card Suit: ${sceneToAccess.playerCards[card].cardSuit} card Value: ${sceneToAccess.playerCards[card].cardValue}`);
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
                this.changedSceneFlag = true
                // this.socket.emit('turnOver')
                console.log('start Phase2')
                // this.scene.stop()
                // this.scene.start('gamePhase2', {playerCards:this.playerCards, socket:this.socket, podval:this.podval, isPlayerA: this.isPlayerA, isPlayerB: this.isPlayerB, isPlayerC: this.isPlayerC, isPlayerD: this.isPlayerD, numOfCardsA: numOfCardsA, numOfCardsB: numOfCardsB, numOfCardsC: numOfCardsC, numOfCardsD: numOfCardsD})
                this.scene.sleep()
                // this.scene.run(`gamePhase${this.sceneNum}`, {numOfCardsA: numOfCardsA, numOfCardsB: numOfCardsB, numOfCardsC: numOfCardsC, numOfCardsD: numOfCardsD})
                this.scene.wake(`gamePhase${this.sceneNum}`)
            }
        })
    }

    renderPlayerCards(cardsRenderFunc)
    {
        for (let i = 0; i < cardsRenderFunc.length; i++) {
            cardsRenderFunc[i].destroy()
        }
        cardsRenderFunc.splice(0, cardsRenderFunc.length)
        for (let i = 0; i < this.scene.get(`gamePhase${this.sceneNum}`).playerCards.length; i++) {
            cardsRenderFunc.push((new Card(this)).render(((i*100) + 500), 800, this.scene.get(`gamePhase${this.sceneNum}`).playerCards[i]))
        }
        return cardsRenderFunc
    }

    update()
    {
        if(this.changedSceneFlag === true)
        {
            // this.cardsRender = []
            this.changedSceneFlag = false
            this.renderCards = this.renderPlayerCards(this.renderCards)
        }
    }
}