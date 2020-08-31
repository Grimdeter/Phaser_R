import Card from '../helpers/card.js';
import Zone from '../helpers/zone';

export default class punish extends Phaser.Scene
{
    constructor()
    {
        super({
            key: 'toPunish'
        })
    }

    init(data)
    {
        this.activePlayerNum = data.activePlayerNum
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
        this.playerNum = 0
        let self = this;
        // player signatures
        console.log('entering toPunish scene: ')
        

        console.log('active player num: ' + this.activePlayerNum)
        console.log('isPlayerA: ' + this.isPlayerA)
        console.log('isPlayerB: ' + this.isPlayerB)
        console.log('isPlayerC: ' + this.isPlayerC)
        console.log('isPlayerD: ' + this.isPlayerD)

        if (this.activePlayerNum === 0) {
            if (this.isPlayerB === true) {
                this.playerNum = 1
                // player right drop zone
                this.zoneRight = new Zone (this)
                // render zone creates drop zone at (x, y, width, height)
                this.dropZoneRight = this.zoneRight.renderZone(1250, 425, 200, 250)
                this.outlineRight = this.zoneRight.renderOutline(this.dropZoneRight)
            }
            if (this.isPlayerC === true) {
                this.playerNum = 2
                // player top drop zone
                this.zoneTop = new Zone (this)
                // render zone creates drop zone at (x, y, width, height)
                this.dropZoneTop = this.zoneTop.renderZone(700, 200, 200, 250)
                this.outlineTop = this.zoneTop.renderOutline(this.dropZoneTop)
            }
            if (this.isPlayerD === true) {
                this.playerNum = 3
                // player left drop zone
                this.zoneLeft = new Zone (this)
                // render zone creates drop zone at (x, y, width, height)
                this.dropZoneLeft = this.zoneLeft.renderZone(350, 425, 200, 250)
                this.outlineLeft = this.zoneLeft.renderOutline(this.dropZoneLeft)
            }
        }

        if (this.activePlayerNum === 1) {
            if (this.isPlayerA === true) {
                // player left drop zone
                this.zoneLeft = new Zone (this)
                // render zone creates drop zone at (x, y, width, height)
                this.dropZoneLeft = this.zoneLeft.renderZone(350, 425, 200, 250)
                this.outlineLeft = this.zoneLeft.renderOutline(this.dropZoneLeft)
            }
            if (this.isPlayerC === true) {
                this.playerNum = 2
                // player right drop zone
                this.zoneRight = new Zone (this)
                // render zone creates drop zone at (x, y, width, height)
                this.dropZoneRight = this.zoneRight.renderZone(1250, 425, 200, 250)
                this.outlineRight = this.zoneRight.renderOutline(this.dropZoneRight)
            }
            if (this.isPlayerD === true) {
                this.playerNum = 3
                // player top drop zone
                this.zoneTop = new Zone (this)
                // render zone creates drop zone at (x, y, width, height)
                this.dropZoneTop = this.zoneTop.renderZone(700, 200, 200, 250)
                this.outlineTop = this.zoneTop.renderOutline(this.dropZoneTop)
            }
        }

        if (this.activePlayerNum === 2) {
            if (this.isPlayerA === true) {
                // player top drop zone
                this.zoneTop = new Zone (this)
                // render zone creates drop zone at (x, y, width, height)
                this.dropZoneTop = this.zoneTop.renderZone(700, 200, 200, 250)
                this.outlineTop = this.zoneTop.renderOutline(this.dropZoneTop)
                
            }
            if (this.isPlayerB === true) {
                this.playerNum = 1
                // player left drop zone
                this.zoneLeft = new Zone (this)
                // render zone creates drop zone at (x, y, width, height)
                this.dropZoneLeft = this.zoneLeft.renderZone(350, 425, 200, 250)
                this.outlineLeft = this.zoneLeft.renderOutline(this.dropZoneLeft)
                
            }
            if (this.isPlayerD === true) {
                this.playerNum = 3
                // player right drop zone
                this.zoneRight = new Zone (this)
                // render zone creates drop zone at (x, y, width, height)
                this.dropZoneRight = this.zoneRight.renderZone(1250, 425, 200, 250)
                this.outlineRight = this.zoneRight.renderOutline(this.dropZoneRight)
            }
        }

        if (this.activePlayerNum === 3) {
            if (this.isPlayerA === true) {
                // player right drop zone
                this.zoneRight = new Zone (this)
                // render zone creates drop zone at (x, y, width, height)
                this.dropZoneRight = this.zoneRight.renderZone(1250, 425, 200, 250)
                this.outlineRight = this.zoneRight.renderOutline(this.dropZoneRight)
            }
            if (this.isPlayerB === true) {
                this.playerNum = 1
                // player top drop zone
                this.zoneTop = new Zone (this)
                // render zone creates drop zone at (x, y, width, height)
                this.dropZoneTop = this.zoneTop.renderZone(700, 200, 200, 250)
                this.outlineTop = this.zoneTop.renderOutline(this.dropZoneTop)
            }
            if (this.isPlayerC === true) {
                this.playerNum = 2
                // player left drop zone
                this.zoneLeft = new Zone (this)
                // render zone creates drop zone at (x, y, width, height)
                this.dropZoneLeft = this.zoneLeft.renderZone(350, 425, 200, 250)
                this.outlineLeft = this.zoneLeft.renderOutline(this.dropZoneLeft)
            }
        }

        let cardsRender = []

        for (let i = 0; i < this.playerCards.length; i++) {
            cardsRender.push((new Card(this)).render(((i*100) + 600), 800, this.playerCards[i]))
        }
        

        this.input.on("dragend", (pointer, gameObject, dropped) =>
        {
            if(!dropped)
            {
                gameObject.x = gameObject.input.dragStartX;
                gameObject.y = gameObject.input.dragStartY;
            }
        })

        this.input.on("drop", (pointer, gameObject) =>
        {
            gameObject.destroy()
            let cardObj
            for (let i = 0; i < this.playerCards.length; i++) {
                let toCheck = `card_${this.playerCards[i].cardValue}_${this.playerCards[i].cardSuit}`
                if(toCheck === gameObject.texture.key)
                {
                    cardObj = this.playerCards[i]
                    console.log(`cardObj ${cardObj.cardSuit} ${cardObj.cardValue}`)
                    this.playerCards.splice(i,1)
                }
            }
            self.socket.emit('punishCard', cardObj, this.playerNum)
            this.socket.emit('changeSceneForToPunish')
        })

        this.input.on('drag', (pointer, gameObject, dragX, dragY) =>
        {
            gameObject.x = dragX;
            gameObject.y = dragY;
        })

        this.endTurnButton = this.add.text(1150, 800, ['End Turn']).setFontSize(18).setInteractive()

        this.endTurnButton.on('pointerdown', () =>
        {
            this.socket.emit('changeSceneForToPunish')
            if(this.sceneNum === 1)
            {
                console.log('start Phase1')
                this.scene.start('gamePhase1', {playerCards:this.playerCards, socket:this.socket, podval:this.podval, isPlayerA: this.isPlayerA, isPlayerB: this.isPlayerB, isPlayerC: this.isPlayerC, isPlayerD: this.isPlayerD})
            } else
            {
                console.log('start Phase2')
                this.scene.start('gamePhase2', {playerCards:this.playerCards, socket:this.socket, podval:this.podval, isPlayerA: this.isPlayerA, isPlayerB: this.isPlayerB, isPlayerC: this.isPlayerC, isPlayerD: this.isPlayerD})
            }
        })
        
        this.endTurnButton.on('pointerover', () =>
        {
            self.endTurnButton.setColor('#ff69b4')
        })
        
        this.endTurnButton.on('pointerout', () =>
        {
            self.endTurnButton.setColor('#ffffff')
        })
    
        this.socket.on('changeSceneForToPunish', (numOfCardsA, numOfCardsB, numOfCardsC, numOfCardsD) =>
        {
            if(this.sceneNum === 1)
            {
                console.log('start Phase1')
                this.scene.start('gamePhase1', {playerCards:this.playerCards, socket:this.socket, podval:this.podval, isPlayerA: this.isPlayerA, isPlayerB: this.isPlayerB, isPlayerC: this.isPlayerC, isPlayerD: this.isPlayerD})
            } else
            {
                console.log('start Phase2')
                this.scene.start('gamePhase2', {playerCards:this.playerCards, socket:this.socket, podval:this.podval, isPlayerA: this.isPlayerA, isPlayerB: this.isPlayerB, isPlayerC: this.isPlayerC, isPlayerD: this.isPlayerD, numOfCardsA: numOfCardsA, numOfCardsB: numOfCardsB, numOfCardsC: numOfCardsC, numOfCardsD: numOfCardsD})
            }
        })
    }

    update()
    {
        if(this.playerCards.length === 1)
        {
            if(this.sceneNum === 1)
            {
                console.log('start Phase1')
                this.scene.start('gamePhase1', {playerCards:this.playerCards, socket:this.socket, podval:this.podval, isPlayerA: this.isPlayerA, isPlayerB: this.isPlayerB, isPlayerC: this.isPlayerC, isPlayerD: this.isPlayerD})
            } else
            {
                console.log('start Phase2')
                this.scene.start('gamePhase2', {playerCards:this.playerCards, socket:this.socket, podval:this.podval, isPlayerA: this.isPlayerA, isPlayerB: this.isPlayerB, isPlayerC: this.isPlayerC, isPlayerD: this.isPlayerD})
            }
        }
    }
}