import { Card } from "../../../cardServ"

export default class gamePhase2 extends Phaser.Scene
{
    constructor()
    {
        super({
            key: 'gamePhase2'
        })
    }

    init(data)
    {
        this.playerCards = data.playerCards
        this.socket = data.socket
        this.podval = data.podval
        this.isPlayerA = data.isPlayerA
        this.isPlayerB = data.isPlayerB
        this.isPlayerC = data.isPlayerC
        this.isPlayerD = data.isPlayerD
        this.numOfCardsA = data.numOfCardsA
        this.numOfCardsB = data.numOfCardsB
        this.numOfCardsC = data.numOfCardsC
        this.numOfCardsD = data.numOfCardsD
    }

    preload()
    {
        this.load.image('card_0_0', 'src/assets/img/card_0_0.png')
    }

    create()
    {
        let self = this

        this.isActive = false
        this.playerNum = 0

        let cardBackObj = new Card(this)
        cardBackObj.setCardData(0, 0)

        let cardsRender = []
        let cardsRenderOpponent1 = []
        let cardsRenderOpponent2 = []
        let cardsRenderOpponent3 = []
        let cardsRenderPlayed = []

        this.input.on("dragend", (pointer, gameObject, dropped) =>
        {
            if(!dropped)
            {
                gameObject.x = gameObject.input.dragStartX;
                gameObject.y = gameObject.input.dragStartY;
            }
        })

        this.input.on("drop", (pointer, gameObject, dropZone) =>
        {
            // dropZone.data.values.cards++;
            // gameObject.x = (dropZone.x - 40) + (dropZone.data.values.cards * 50)
            // gameObject.y = dropZone.y
            gameObject.disableInteractive()
            let cardObj
            for (let i = 0; i < this.playerCards.length; i++) {
                let toCheck = `card_${this.playerCards[i].cardValue}_${this.playerCards[i].cardSuit}`
                if(toCheck === gameObject.texture.key)
                {
                    cardObj = this.playerCards[i]
                    this.playerCards = this.playerCards.filter(card => card.cardValue !== cardObj.cardValue && card.cardSuit !== cardObj.cardSuit )
                }
            }
            self.socket.emit('cardPlayed', cardObj)
        })

        this.socket.on('active', () =>
        {
            this.createDropZone(this)
            // end turn button
            this.take = this.add.text(1150, 800, ['Take']).setFontSize(18).setInteractive()

            this.take.on('pointerdown', () =>
            {
                self.socket.emit('takeCard')
                self.isActive = false
                this.disableDropZones(this)
                this.take.disableInteractive()
            })

            this.take.on('pointerover', () =>
            {
                self.take.setColor('#ff69b4')
            })

            this.take.on('pointerout', () =>
            {
                self.take.setColor('#ffffff')
            })

            self.isActive = true;
        })

        this.input.on('drag', (pointer, gameObject, dragX, dragY) =>
        {
            gameObject.x = dragX;
            gameObject.y = dragY;
        })

        this.socket.on('punish', ()=>
        {
            this.scene.launch('punish', {socket:this.socket, playerCards:this.playerCards})
        })

        this.socket.on('toPunish', (activePlayerNum) =>
        {
            this.scene.launch('toPunish', {activePlayerNum: activePlayerNum, isPlayerA: this.isPlayerA, isPlayerB: this.isPlayerB, isPlayerC: this.isPlayerC, isPlayerD: this.isPlayerD, playerCards: this.playerCards, socket:this.socket})
        })



        // render player cards
        for (let i = 0; i < this.playerCards.length; i++) {
            cardsRender.push(new Card(this))
            cardsRender[i].render(((i*100) + 500), 800, this.playerCards[i])
        }

        // render opponents cards
        if (this.isPlayerA) 
        {
            // render of playersCardsC 
            for (let i = 0; i < this.numOfCardsC; i++) {
                cardsRenderOpponent2.push(new Card(this))
                cardsRenderOpponent2[i].render(((i*100) + 500), 100, cardBackObj).disableInteractive()
            }
            // render of playersCardsB 
            for (let i = 0; i < this.numOfCardsB; i++) {
                cardsRenderOpponent1.push(new Card(this))
                cardsRenderOpponent1[i].render(150, (400 + (i * 100)), cardBackObj).disableInteractive()
                cardsRenderOpponent1[i].angle = 90
            }
            // render of playersCardsB 
            for (let i = 0; i < this.numOfCardsB; i++) {
                cardsRenderOpponent3.push(new Card(this))
                cardsRenderOpponent3[i].render(1150, (400 + (i * 100)), cardBackObj).disableInteractive()
                cardsRenderOpponent3[i].angle = 90
            }
        } else if (this.isPlayerB)
        {
            this.playerNum = 1
            // render of playersCardsD
            for (let i = 0; i < this.numOfCardsD; i++) {
                cardsRenderOpponent2.push(new Card(this))
                cardsRenderOpponent2[i].render(((i*100) + 500), 100, cardBackObj).disableInteractive()
            }
            // render of playersCardsC
            for (let i = 0; i < this.numOfCardsC; i++) {
                cardsRenderOpponent1.push(new Card(this))
                cardsRenderOpponent1[i].render(150, (400 + (i * 100)), cardBackObj).disableInteractive()
                cardsRenderOpponent1[i].angle = 90
            }
            // render of playersCardsA
            for (let i = 0; i < this.numOfCardsA; i++) {
                cardsRenderOpponent3.push(new Card(this))
                cardsRenderOpponent3[i].render(1150, (400 + (i * 100)), cardBackObj).disableInteractive()
                cardsRenderOpponent3[i].angle = 90
            }
        } else if (this.isPlayerC)
        {
            this.playerNum = 2
            // render of playersCardsA
            for (let i = 0; i < this.numOfCardsA; i++) {
                cardsRenderOpponent2.push(new Card(this))
                cardsRenderOpponent2[i].render(((i*100) + 500), 100, cardBackObj).disableInteractive()
            }
            // render of playersCardsD
            for (let i = 0; i < this.numOfCardsD; i++) {
                cardsRenderOpponent1.push(new Card(this))
                cardsRenderOpponent1[i].render(150, (400 + (i * 100)), cardBackObj).disableInteractive()
                cardsRenderOpponent1[i].angle = 90
            }
            // render of playersCardsB
            for (let i = 0; i < this.numOfCardsB; i++) {
                cardsRenderOpponent3.push(new Card(this))
                cardsRenderOpponent3[i].render(1150, (400 + (i * 100)), cardBackObj).disableInteractive()
                cardsRenderOpponent3[i].angle = 90
            }
        } else if (this.isPlayerD)
        {
            this.playerNum = 3
            // render of playersCardsB
            for (let i = 0; i < this.numOfCardsB; i++) {
                cardsRenderOpponent2.push(new Card(this))
                cardsRenderOpponent2[i].render(((i*100) + 500), 100, cardBackObj).disableInteractive()
            }
            // render of playersCardsA
            for (let i = 0; i < this.numOfCardsA; i++) {
                cardsRenderOpponent1.push(new Card(this))
                cardsRenderOpponent1[i].render(150, (400 + (i * 100)), cardBackObj).disableInteractive()
                cardsRenderOpponent1[i].angle = 90
            }
            // render of playersCardsC
            for (let i = 0; i < this.numOfCardsC; i++) {
                cardsRenderOpponent3.push(new Card(this))
                cardsRenderOpponent3[i].render(1150, (400 + (i * 100)), cardBackObj).disableInteractive()
                cardsRenderOpponent3[i].angle = 90
            }
        }

        this.socket.on('cardPlayed', (gameObject) =>
        {
            dropZone.data.values.cards++;
            cardsRenderPlayed.push(new Card(this)) 
            cardsRenderPlayed[cardsRenderPlayed.length-1].render(((dropZone.x - 40) + (dropZone.data.values.cards * 50)), dropZone.y, gameObject).disableInteractive()
        })

        this.socket.on('discard', () =>
        {
            for (let i = 0; i < cardsRenderPlayed.length; i++) {
                cardsRenderPlayed[i].destroy()
            }
        })

        this.socket.on('cardTaken', () =>
        {
            cardsRenderPlayed.shift()
        })

        if (this.playerCards.length === 0) {
            if(this.podval.length === 0)
            {
                io.emit('win')
            }
            this.playerCards.push(this.podval[this.podval.length - 1])
            this.podval.pop()
            this.playerCards.push(this.podval[this.podval.length - 1])
            this.podval.pop()
             // render player cards
            for (let i = 0; i < this.playerCards.length; i++) {
                cardsRender.push(new Card(this))
                cardsRender[i].render(((i*100) + 500), 800, this.playerCards[i])
            }
            io.emit('podval')
        }

    }

    createDropZone(scene)
    {
        // creates table drop zone
        scene.zoneCenter = new Zone (scene)
        // render zone creates drop zone at (x, y, width, height)
        scene.dropZoneCenter = scene.zoneCenter.renderZone(700, 425, 200, 250)
        scene.outlineCenter = scene.zoneCenter.renderOutline(scene.dropZoneCenter)
    }

    disableDropZones(scene)
    {
        scene.dropZoneTop.disableInteractive()
        scene.zoneCenter.renderOutline(scene.dropZoneTop, 0x000000)
    }

    update()
    {
        if (this.isPlayerA) {
            this.add.text(650, 650, ['Player A']).setFontSize(18);
            this.add.text(250, 400, ['Player B']).setFontSize(18);
            this.add.text(650, 250, ['Player C']).setFontSize(18);
            this.add.text(1020, 400, ['Player D']).setFontSize(18);
        } else if (this.isPlayerB) {
            this.add.text(650, 650, ['Player B']).setFontSize(18);
            this.add.text(1020, 400, ['Player A']).setFontSize(18);
            this.add.text(250, 400, ['Player C']).setFontSize(18);
            this.add.text(650, 250, ['Player D']).setFontSize(18);
        } else if (this.isPlayerC) {
            this.add.text(650, 650, ['Player С']).setFontSize(18);
            this.add.text(250, 400, ['Player D']).setFontSize(18);
            this.add.text(650, 250, ['Player A']).setFontSize(18);
            this.add.text(1020, 400, ['Player B']).setFontSize(18);
        } else if (this.isPlayerD) {
            this.add.text(650, 650, ['Player D']).setFontSize(18);
            this.add.text(250, 400, ['Player A']).setFontSize(18);
            this.add.text(650, 250, ['Player B']).setFontSize(18);
            this.add.text(1020, 400, ['Player C']).setFontSize(18);
        }
    }
}