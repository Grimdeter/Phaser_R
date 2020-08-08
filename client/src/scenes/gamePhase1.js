import Card from '../helpers/card.js';
import Zone from '../helpers/zone';
import Dealer from '../helpers/dealer';
import io from 'socket.io-client';

export default class gamePhase1 extends Phaser.Scene
{
    constructor()
    {
        super({
            key: 'gamePhase1'
        })
    }

    init(data)
    {
        this.playerCards = data.playerCards || []
        console.log('start phase1')
    }

    preload()
    {
        for (let cS= 1; cS < 5; cS++) 
    	{
    		for (let cV = 6; cV < 15; cV++) 
    		{
                this.load.image(`card_${cV}_${cS}`, `src/assets/img/card_${cV}_${cS}.png`)
            }
        }
    }

    create()
    {
        let self = this;
        // player signatures
        this.isPlayerA = false
        this.isPlayerB = false
        this.isPlayerC = false
        this.isPlayerD = false
        this.isSpectator = false
        // opponents cards
        this.opponent1Cards = []
        this.opponent2Cards = []
        this.opponent3Cards = []

        // this players cards
        this.playerCards = []

        // this players podval
        this.podval = []

        this.isActive = false;

        


        // this.socket.on('numPlayers2', () =>
        // {
        //     this.zone2 = new Zone(self)
        //     this.opponent1Zone = this.zone2.renderZone()
        //     this.opponent1ZoneOutline = this.zone2.renderOutline()
        // })

        // creates a new dealer of cards
        this.dealer = new Dealer(this)
    
        //                http://localhost:3000 if local, 5000 for local heroku
        this.socket = io('https://phaser-r.herokuapp.com')

        // tells the client which player is which 
        this.socket.on('connect', () =>
        {
            console.log('connected')
        })
        this.socket.on('isPlayerA', () =>
        {
            self.isPlayerA = true
            this.readyButton = this.add.text(850, 800, ['All players are ready!']).setFontSize(18).setInteractive();

            this.readyButton.on('pointerdown', () =>
            {
                self.socket.emit('playersReady')
                this.readyButton.disableInteractive()
                this.readyButton.destroy()
            })

            this.readyButton.on('pointerover', () =>
            {
                self.readyButton.setColor('#ff69b4')
            })

            this.readyButton.on('pointerout', () =>
            {
                self.readyButton.setColor('#ffffff')
            })
            console.log('I am player A')
        })
        this.socket.on('isPlayerB', () =>
        {
            self.isPlayerB = true
            console.log('isplayerB: ' + this.isPlayerB)
        })
        this.socket.on('isPlayerC', () =>
        {
            self.isPlayerC = true
            console.log('I am player С')
        })
        this.socket.on('isPlayerD', () =>
        {
            self.isPlayerD = true
            console.log('I am player D')
        })
        this.socket.on('isSpectator', () =>
        {
            self.isSpectator = true
            console.log('I am Spectator')
        })

        this.socket.on('active', () =>
        {
            this.createDropZones(this)
            // end turn button
            this.endTurnButton = this.add.text(1150, 800, ['End Turn']).setFontSize(18).setInteractive()

            this.endTurnButton.on('pointerdown', () =>
            {
                self.socket.emit('turnOver')
                self.isActive = false
                this.disableDropZones(this)
                this.endTurnButton.disableInteractive()
            })

            this.endTurnButton.on('pointerover', () =>
            {
                self.endTurnButton.setColor('#ff69b4')
            })

            this.endTurnButton.on('pointerout', () =>
            {
                self.endTurnButton.setColor('#ffffff')
            })

            self.isActive = true;
        })

        // possible point of failure, gameObject
        this.socket.on('podvalCards', (card) =>
        {
            this.podval.push(card)
            console.log(this.podval)
        })

        this.socket.on('dealCards', () =>
        {

            // self.dealer.dealCards()
            // self.dealText.disableInteractive()
        })

        this.socket.on('deckCardNumber', (number) =>
        {
            let graphics = this.add.graphics();

            graphics.fillStyle(0x00000, 1);
            graphics.beginPath();
            graphics.moveTo(0,0);
            graphics.lineTo(300,0);
            graphics.lineTo(300,100);
            graphics.lineTo(0,100);
            graphics.lineTo(0,0);
            graphics.closePath();
            graphics.fillPath();
            this.deckCardNumber = this.add.text(50, 50, ['Cards left in deck: ' + number]).setFontSize(18).setInteractive();
        })

        this.socket.on('cardPlayed', (gameObject, isPlayerA) =>
        {
            // if (isPlayerA !== self.isPlayerA) {
            //     let sprite = gameObject.textureKey;
            //     self.opponentCards.shift().destroy()
            //     self.dropZone.data.values.cards++
            //     let card = new Card(self)
            //     card.render(((self.dropZone.x - 350)+ (self.dropZone.data.values.cards * 50)), (self.dropZone.y), sprite).disableInteractive()
            // }
        })

        let deckCardC = new Card(this)

        console.log(deckCardC)

        let deckCardRender
        let deckCardObj

        this.socket.on('deckCard', (deckCard) =>
        {
            deckCardObj = deckCard
            deckCardRender = deckCardC.render(700, 430, deckCard)
        })

        this.socket.on('newCard', (card) =>
        {
            this.playerCards.push(card)
        })

        this.socket.on('destroyDeckCard', () =>
        {
            console.log(deckCardC)
            deckCardRender.destroy()
        })

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
            dropZone.data.values.cards++;
            gameObject.x = (dropZone.x - 40) + (dropZone.data.values.cards * 50)
            gameObject.y = dropZone.y
            gameObject.disableInteractive()
            console.log(`card_${this.podval[0].cardValue}_${this.podval[0].cardSuit}`)
            console.log(gameObject.texture.key)
            // self.socket.emit('cardPlayed', gameObject, self.isPlayerA)
            self.socket.emit('cardDraggedInto', dropZone.x, dropZone.y, deckCardObj)
        })

        this.input.on('drag', (pointer, gameObject, dragX, dragY) =>
        {
            gameObject.x = dragX;
            gameObject.y = dragY;
        })

        this.socket.on('topCardA', (card) =>
        {
            if (self.isPlayerA === true) {
                let cardRender = new Card(this)
                cardRender.render(700, 800, card).disableInteractive()
            } else if (self.isPlayerB)
            {
                let cardRender = new Card(this)
                cardRender.render(1250, 425, card).disableInteractive()
            } else if (self.isPlayerC)
            {
                let cardRender = new Card(this)
                cardRender.render(700, 100, card).disableInteractive()
            } else if (self.isPlayerD)
            {
                let cardRender = new Card(this)
                cardRender.render(150, 425, card).disableInteractive()
            }
        })
        this.socket.on('topCardB', (card) =>
        {
            if (self.isPlayerB === true) {
                let cardRender = new Card(this)
                cardRender.render(700, 800, card).disableInteractive()
            } else if (self.isPlayerC)
            {
                let cardRender = new Card(this)
                cardRender.render(1250, 425, card).disableInteractive()
            } else if (self.isPlayerD)
            {
                let cardRender = new Card(this)
                cardRender.render(700, 100, card).disableInteractive()
            } else if (self.isPlayerA)
            {
                let cardRender = new Card(this)
                cardRender.render(150, 425, card).disableInteractive()
            }
        })
        this.socket.on('topCardC', (card) =>
        {
            if (self.isPlayerC === true) {
                let cardRender = new Card(this)
                cardRender.render(700, 800, card).disableInteractive()
            } else if (self.isPlayerD)
            {
                let cardRender = new Card(this)
                cardRender.render(1250, 425, card).disableInteractive()
            } else if (self.isPlayerA)
            {
                let cardRender = new Card(this)
                cardRender.render(700, 100, card).disableInteractive()
            } else if (self.isPlayerB)
            {
                let cardRender = new Card(this)
                cardRender.render(150, 425, card).disableInteractive()
            }
        })
        this.socket.on('topCardD', (card) =>
        {
            if (self.isPlayerD === true) {
                let cardRender = new Card(this)
                cardRender.render(700, 800, card).disableInteractive()
            } else if (self.isPlayerA)
            {
                let cardRender = new Card(this)
                cardRender.render(1250, 425, card).disableInteractive()
            } else if (self.isPlayerB)
            {
                let cardRender = new Card(this)
                cardRender.render(700, 100, card).disableInteractive()
            } else if (self.isPlayerC)
            {
                let cardRender = new Card(this)
                cardRender.render(150, 425, card).disableInteractive()
            }
        })

        this.socket.on('punish', ()=>
        {
            this.scene.launch('punish', {socket:this.socket, playerCards:this.playerCards})
        })

        this.socket.on('toPunish', (activePlayerNum) =>
        {
            this.scene.launch('toPunish', {activePlayerNum: activePlayerNum, isPlayerA: this.isPlayerA, isPlayerB: this.isPlayerB, isPlayerC: this.isPlayerC, isPlayerD: this.isPlayerD, playerCards: this.playerCards, socket:this.socket})
        })

        this.socket.on('nextPhase', (numOfCardsA, numOfCardsB, numOfCardsC, numOfCardsD) =>
        {
            this.scene.start('gamePhase2', {playerCards:this.playerCards, socket:this.socket, podval:this.podval, isPlayerA: this.isPlayerA, isPlayerB: this.isPlayerB, isPlayerC: this.isPlayerC, isPlayerD: this.isPlayerD, numOfCardsA: numOfCardsA, numOfCardsB: numOfCardsB, numOfCardsC: numOfCardsC, numOfCardsD: numOfCardsD})
        })

    }

    createDropZones(scene)
    {
        // // creates table drop zone
        // scene.zoneCenter = new Zone (scene)
        // // render zone creates drop zone at (x, y, width, height)
        // scene.dropZoneCenter = scene.zoneCenter.renderZone(700, 425, 200, 250)
        // scene.outlineCenter = scene.zoneCenter.renderOutline(scene.dropZoneCenter)

        // player left drop zone
        scene.zoneLeft = new Zone (scene)
        // render zone creates drop zone at (x, y, width, height)
        scene.dropZoneLeft = scene.zoneLeft.renderZone(150, 425, 200, 250)
        scene.outlineLeft = scene.zoneLeft.renderOutline(scene.dropZoneLeft)

        // player right drop zone
        scene.zoneRight = new Zone (scene)
        // render zone creates drop zone at (x, y, width, height)
        scene.dropZoneRight = scene.zoneRight.renderZone(1250, 425, 200, 250)
        scene.outlineRight = scene.zoneRight.renderOutline(scene.dropZoneRight)

        // player bot drop zone
        scene.zoneBot = new Zone (scene)
        // render zone creates drop zone at (x, y, width, height)
        scene.dropZoneBot = scene.zoneBot.renderZone(700, 800, 200, 250)
        scene.outlineBot = scene.zoneBot.renderOutline(scene.dropZoneBot)

        // player top drop zone
        scene.zoneTop = new Zone (scene)
        // render zone creates drop zone at (x, y, width, height)
        scene.dropZoneTop = scene.zoneTop.renderZone(700, 100, 200, 250)
        scene.outlineTop = scene.zoneTop.renderOutline(scene.dropZoneTop)
    }

    disableDropZones(scene)
    {
        // scene.dropZoneTop.disableInteractive()
        // scene.zoneCenter.renderOutline(scene.dropZoneTop, 0x000000)

        scene.dropZoneLeft.disableInteractive()
        scene.zoneLeft.renderOutline(scene.dropZoneLeft, 0x000000)

        scene.dropZoneTop.disableInteractive()
        scene.zoneTop.renderOutline(scene.dropZoneTop, 0x000000)

        scene.dropZoneRight.disableInteractive()
        scene.zoneRight.renderOutline(scene.dropZoneRight, 0x000000)

        scene.dropZoneBot.disableInteractive()
        scene.zoneBot.renderOutline(scene.dropZoneBot, 0x000000)
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

        if (this.playerCards.length !== 0 && this.isPlayerA === true)
        {
            this.socket.emit('topCardA', this.playerCards[this.playerCards.length - 1])
        }

        if (this.playerCards.length !== 0 && this.isPlayerB === true)
        {
            this.socket.emit('topCardB', this.playerCards[this.playerCards.length - 1])
        }

        if (this.playerCards.length !== 0 && this.isPlayerC === true)
        {
            this.socket.emit('topCardC', this.playerCards[this.playerCards.length - 1])
        }

        if (this.playerCards.length !== 0 && this.isPlayerD === true)
        {
            this.socket.emit('topCardD', this.playerCards[this.playerCards.length - 1])
        }

        // if (this.podval.length !== 0) {
        //     // console.log(this.podval[0])
        //     // console.log(this.podval[0].cardValue)
        //     let card = new Card(this)
        //     card.render(500, 500, this.podval[0])
        // }
        
        // console.log(this.podval)  
        // while(this.deck.lenght !== 0)
        // {
            // this.cardBack = new Card (this)
            // this.cardBack.setCardData(0,0)
            // this.cardBack.render(100, 100, this.cardBack)
        // } 
    }
}