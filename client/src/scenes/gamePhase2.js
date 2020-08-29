import Card from '../helpers/card.js';
import Zone from '../helpers/zone';
import io from 'socket.io-client';

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
        // console.log('this.playerCards: ' + this.playerCards)
        // console.log('this.socket: ' + this.socket)
        // console.log('this.podval: ' + this.podval)
        // console.log('this.isPlayerA: ' + this.isPlayerA)
        // console.log('this.isPlayerB: ' + this.isPlayerB)
        // console.log('this.isPlayerC: ' + this.isPlayerC)
        // console.log('this.isPlayerD: ' + this.isPlayerD)
        // console.log('this.numOfCardsA: ' + this.numOfCardsA)
        // console.log('this.numOfCardsB: ' + this.numOfCardsB)
        // console.log('this.numOfCardsC: ' + this.numOfCardsC)
        // console.log('this.numOfCardsD: ' + this.numOfCardsD)
    }

    preload()
    {
        this.load.image('card_0_0', 'src/assets/img/card_0_0.png')
    }

    create()
    {
        window.myScene2 = this
        let self = this

        this.isActive = false
        this.playerNum = 0

        let cardBackObj = new Card().setCardData(0, 0)
        console.log(`cardbackObj: cardValue: ${cardBackObj.cardValue} cardSuit: ${cardBackObj.cardSuit}`)

        let cardsRender = []
        let cardsRenderOpponent1 = []
        let cardsRenderOpponent2 = []
        let cardsRenderOpponent3 = []
        let cardsRenderPlayed = []
        let cardsTableObj = []

        // creates table drop zone
        this.zoneCenter = new Zone (this)
        // render zone creates drop zone at (x, y, width, height)
        this.dropZoneCenter = this.zoneCenter.renderZone(700, 425, 200, 250)

        this.input.on("dragend", (pointer, gameObject, dropped) =>
        {
            if(!dropped)
            {
                gameObject.x = gameObject.input.dragStartX;
                gameObject.y = gameObject.input.dragStartY;
            }
        })

        this.input.on("drop", (pointer, gameObject, dropZoneCenter) =>
        {
            if (this.isActive === false)
            {
                gameObject.x = gameObject.input.dragStartX;
                gameObject.y = gameObject.input.dragStartY;
            } else
            {
                this.dropZoneCenter.data.values.cards++;
                gameObject.x = (this.dropZoneCenter.x - 40) + (this.dropZoneCenter.data.values.cards * 50)
                gameObject.y = this.dropZoneCenter.y
                gameObject.destroy()
                this.take.disableInteractive()
                this.outlineCenter = this.zoneCenter.renderOutline(this.dropZoneCenter, 0x000000)
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
                console.log(`cardsRender: ${cardsRender}`)
                for (let i = 0; i < cardsRender.length; i++) {
                    console.log(`cardsRender[i]: ${cardsRender[i]}`)
                    cardsRender[i].destroy()
                }

                // render player cards
                for (let i = 0; i < this.playerCards.length; i++) {
                    cardsRender.push((new Card(this)).render(((i*100) + 500), 800, this.playerCards[i]))
                }
                console.log(`sending card obj: cardValue: ${cardObj.cardValue} cardSuit: ${cardObj.cardSuit}`)
                self.socket.emit('cardPlayed', cardObj)
            }   
        })

        // add render of new cards after take 
        this.socket.on('active', () =>
        {
            // this.createDropZone(this)
            this.outlineCenter = this.zoneCenter.renderOutline(this.dropZoneCenter, 0x808080)
            // end turn button
            this.take = this.add.text(1150, 800, ['Take']).setFontSize(18).setInteractive()

            this.take.on('pointerdown', () =>
            {
                self.socket.emit('takeCard')
                self.isActive = false
                this.outlineCenter = this.zoneCenter.renderOutline(this.dropZoneCenter, 0x000000)
                this.take.destroy()
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

        if (cardsRender.length !== 0) {
            for (let i = 0; i < this.playerCards.length; i++) {
                cardsRender[i].destroy
            }    
        }
        // render player cards
        for (let i = 0; i < this.playerCards.length; i++) {
            cardsRender.push((new Card(this)).render(((i*100) + 500), 800, this.playerCards[i]))
        }
        

        // render opponents cards anc change this.playerNum
        if (this.isPlayerA) 
        {
            // render of playersCardsC 
            for (let i = 0; i < this.numOfCardsC; i++) {
                cardsRenderOpponent2.push((new Card(this)).render(((i*100) + 500), 100, cardBackObj).disableInteractive())
            }
            // render of playersCardsB 
            for (let i = 0; i < this.numOfCardsB; i++) {
                cardsRenderOpponent1.push((new Card(this)).render(150, (200 + (i * 100)), cardBackObj).disableInteractive())
                cardsRenderOpponent1[i].angle = 90
            }
            // render of playersCardsD
            for (let i = 0; i < this.numOfCardsD; i++) {
                cardsRenderOpponent3.push((new Card(this)).render(1150, (200 + (i * 100)), cardBackObj).disableInteractive())
                cardsRenderOpponent3[i].angle = 90
            }
        } else if (this.isPlayerB)
        {
            this.playerNum = 1
            // render of playersCardsD
            for (let i = 0; i < this.numOfCardsD; i++) {
                cardsRenderOpponent2.push((new Card(this)).render(((i*100) + 500), 100, cardBackObj).disableInteractive())
            }
            // render of playersCardsC
            for (let i = 0; i < this.numOfCardsC; i++) {
                cardsRenderOpponent1.push((new Card(this)).render(150, (200 + (i * 100)), cardBackObj).disableInteractive())
                cardsRenderOpponent1[i].angle = 90
            }
            // render of playersCardsA
            for (let i = 0; i < this.numOfCardsA; i++) {
                cardsRenderOpponent3.push((new Card(this)).render(1150, (200 + (i * 100)), cardBackObj).disableInteractive())
                cardsRenderOpponent3[i].angle = 90
            }
        } else if (this.isPlayerC)
        {
            this.playerNum = 2
            // render of playersCardsA
            for (let i = 0; i < this.numOfCardsA; i++) {
                cardsRenderOpponent2.push((new Card(this)).render(((i*100) + 500), 100, cardBackObj).disableInteractive())
            }
            // render of playersCardsD
            for (let i = 0; i < this.numOfCardsD; i++) {
                cardsRenderOpponent1.push((new Card(this)).render(150, (200 + (i * 100)), cardBackObj).disableInteractive())
                cardsRenderOpponent1[i].angle = 90
            }
            // render of playersCardsB
            for (let i = 0; i < this.numOfCardsB; i++) {
                cardsRenderOpponent3.push((new Card(this)).render(1150, (200 + (i * 100)), cardBackObj).disableInteractive())
                cardsRenderOpponent3[i].angle = 90
            }
        } else if (this.isPlayerD)
        {
            this.playerNum = 3
            // render of playersCardsB
            for (let i = 0; i < this.numOfCardsB; i++) {
                cardsRenderOpponent2.push((new Card(this)).render(((i*100) + 500), 100, cardBackObj).disableInteractive())
            }
            // render of playersCardsA
            for (let i = 0; i < this.numOfCardsA; i++) {
                cardsRenderOpponent1.push((new Card(this)).render(150, (200 + (i * 100)), cardBackObj).disableInteractive())
                cardsRenderOpponent1[i].angle = 90
            }
            // render of playersCardsC
            for (let i = 0; i < this.numOfCardsC; i++) {
                cardsRenderOpponent3.push((new Card(this)).render(1150, (200 + (i * 100)), cardBackObj).disableInteractive())
                cardsRenderOpponent3[i].angle = 90
            }
        }

        this.socket.on('cardPlayedServ', (gameObject, activePlayerNum) =>
        {
            console.log('cardPlayedServ')
            cardsTableObj.push(gameObject)
            this.dropZoneCenter.data.values.cards++
            cardsRenderPlayed.push((new Card(this)).render(((this.dropZoneCenter.x - 40) + (this.dropZoneCenter.data.values.cards * 50)), this.dropZoneCenter.y, gameObject).disableInteractive()) 
            console.log('cardsRenderPlayed: ' + cardsRenderPlayed)
            if(activePlayerNum !== this.playerNum)
            {
                let diff = this.playerNum - activePlayerNum
                console.log('diff: ' + diff)
                if (diff === 3 || diff === -1) 
                {
                    let toDestroy = cardsRenderOpponent1.pop()
                    toDestroy.destroy()
                }
                if (diff === 2 || diff === -2) 
                {
                    let toDestroy = cardsRenderOpponent2.pop()
                    toDestroy.destroy()
                }
                if (diff === 1 || diff === -3) 
                {
                    let toDestroy = cardsRenderOpponent3.pop()
                    toDestroy.destroy()
                }
            }
        })

        let newTrumpSuit
        //discard, win, podval, selection on new trumpSuit
        this.socket.on('discard', () =>
        {
            for (let i = 0; i < cardsRenderPlayed.length; i++) {
                cardsRenderPlayed[i].destroy()
            }
            this.dropZoneCenter.data.values.cards=0
            cardsTableObj.splice(0, cardsTableObj.length)
            if (this.playerCards.length === 0) {
                if (this.podval.length === 0) {
                    this.socket.emit('win', this.playerNum)
                    this.add.text(500, 500, ['WIN!']).setFontSize(30)
                } else 
                {
                    this.playerCards = this.podval
                    
                    // render player cards
                    for (let i = 0; i < this.playerCards.length; i++) {
                        cardsRender.push((new Card(this)).render(((i*100) + 500), 800, this.playerCards[i]))
                    }
                    //creating the button to chose new trump suit (1)
                    {
                    this.suit1 = this.add.text(500, 400, ['Черви']).setFontSize(18).setInteractive()

                    this.suit1.on('pointerdown', () =>
                    {
                        newTrumpSuit = 1
                        this.socket.emit('podval', newTrumpSuit, this.playerNum, this.playerCards)
                        this.suit1.destroy()
                        this.suit2.destroy()
                        this.suit4.destroy()
                    })

                    this.suit1.on('pointerover', () =>
                    {
                        self.suit1.setColor('#ff69b4')
                    })

                    this.suit1.on('pointerout', () =>
                    {
                        self.suit1.setColor('#ffffff')
                    })
                    }

                    //creating the button to chose new trump suit (2)
                    {
                    this.suit2 = this.add.text(500, 500, ['Крести']).setFontSize(18).setInteractive()

                    this.suit2.on('pointerdown', () =>
                    {
                        newTrumpSuit = 2
                        this.socket.emit('podval', newTrumpSuit, this.playerNum, this.playerCards)
                        this.suit1.destroy()
                        this.suit2.destroy()
                        this.suit4.destroy()
                    })

                    this.suit2.on('pointerover', () =>
                    {
                        self.suit2.setColor('#ff69b4')
                    })

                    this.suit2.on('pointerout', () =>
                    {
                        self.suit2.setColor('#ffffff')
                    })
                    }

                    //creating the button to chose new trump suit (4)
                    {
                    this.suit4 = this.add.text(500, 600, ['Буби']).setFontSize(18).setInteractive()

                    this.suit4.on('pointerdown', () =>
                    {
                        newTrumpSuit = 4
                        this.socket.emit('podval', newTrumpSuit, this.playerNum, this.playerCards)
                        this.suit1.destroy()
                        this.suit2.destroy()
                        this.suit4.destroy()
                    })

                    this.suit4.on('pointerover', () =>
                    {
                        self.suit4.setColor('#ff69b4')
                    })

                    this.suit4.on('pointerout', () =>
                    {
                        self.suit4.setColor('#ffffff')
                    })
                    }
                }
            }
        })

        this.socket.on('cardTaken', (activePlayerNum) =>
        {
            console.log('entered cardTaken')
            for (let i = 0; i < cardsRenderPlayed.length; i++) {
                cardsRenderPlayed[i].destroy()
            }
            cardsTableObj.shift()
            this.dropZoneCenter.data.values.cards=0
            
            console.log('cardTableObj: ' + cardsTableObj)
            for (let i = 0; i < cardsTableObj.length; i++) {
                cardsRenderPlayed.push((new Card(this)).render(((this.dropZoneCenter.x - 40) + (this.dropZoneCenter.data.values.cards * 50)), this.dropZoneCenter.y, cardsTableObj[i]).disableInteractive()) 
                this.dropZoneCenter.data.values.cards++
            }
            
            if(activePlayerNum !== this.playerNum)
            {
                let diff = this.playerNum - activePlayerNum
                if (diff === 3 || diff === -1) 
                {
                    cardsRenderOpponent1.push((new Card(this)).render(150, 100, cardBackObj).disableInteractive())
                    cardsRenderOpponent1[cardsRenderOpponent1.length-1].angle = 90
                }
                if (diff === 2 || diff === -2) 
                {
                    cardsRenderOpponent2.push((new Card(this)).render(400, 100, cardBackObj).disableInteractive())
                }
                if (diff === 1 || diff === -3) 
                {
                    cardsRenderOpponent3.push((new Card(this)).render(1150, 100, cardBackObj).disableInteractive())
                    cardsRenderOpponent3[cardsRenderOpponent3.length-1].angle = 90
                }
            }
            if (this.playerCards.length === 0) {
                if (this.podval.length === 0) {
                    this.socket.emit('win', this.playerNum)
                } else 
                {
                    this.playerCards = this.podval
                    
                    // render player cards
                    for (let i = 0; i < this.playerCards.length; i++) {
                        cardsRender.push((new Card(this)).render(((i*100) + 500), 800, this.playerCards[i]))
                    }
                    //creating the button to chose new trump suit (1)
                    {
                    this.suit1 = this.add.text(500, 400, ['Черви']).setFontSize(18).setInteractive()

                    this.suit1.on('pointerdown', () =>
                    {
                        newTrumpSuit = 1
                        this.socket.emit('podval', newTrumpSuit, this.playerNum, this.playerCards)
                        this.suit1.destroy()
                        this.suit2.destroy()
                        this.suit4.destroy()
                    })

                    this.suit1.on('pointerover', () =>
                    {
                        self.suit1.setColor('#ff69b4')
                    })

                    this.suit1.on('pointerout', () =>
                    {
                        self.suit1.setColor('#ffffff')
                    })
                    }

                    //creating the button to chose new trump suit (2)
                    {
                    this.suit2 = this.add.text(500, 500, ['Крести']).setFontSize(18).setInteractive()

                    this.suit2.on('pointerdown', () =>
                    {
                        newTrumpSuit = 2
                        this.socket.emit('podval', newTrumpSuit, this.playerNum, this.playerCards)
                        this.suit1.destroy()
                        this.suit2.destroy()
                        this.suit4.destroy()
                    })

                    this.suit2.on('pointerover', () =>
                    {
                        self.suit2.setColor('#ff69b4')
                    })

                    this.suit2.on('pointerout', () =>
                    {
                        self.suit2.setColor('#ffffff')
                    })
                    }

                    //creating the button to chose new trump suit (4)
                    {
                    this.suit4 = this.add.text(500, 600, ['Буби']).setFontSize(18).setInteractive()

                    this.suit4.on('pointerdown', () =>
                    {
                        newTrumpSuit = 4
                        this.socket.emit('podval', newTrumpSuit, this.playerNum, this.playerCards)
                        this.suit1.destroy()
                        this.suit2.destroy()
                        this.suit4.destroy()
                    })

                    this.suit4.on('pointerover', () =>
                    {
                        self.suit4.setColor('#ff69b4')
                    })

                    this.suit4.on('pointerout', () =>
                    {
                        self.suit4.setColor('#ffffff')
                    })
                    }
                }
            }
        })
        
        this.socket.on('newCard', (gameObject) =>
        {
            console.log('playerCards.lenght: ' + this.playerCards.length)
            // this.playerCards.push(gameObject)
            console.log('playerCards: ' + this.playerCards)

            for (let i = 0; i < this.playerCards.length; i++) {
                cardsRender[i].destroy()
            }

            // render player cards
            for (let i = 0; i < this.playerCards.length; i++) {
                cardsRender.push((new Card(this)).render(((i*100) + 500), 800, this.playerCards[i]))
            }
        })
        
        this.socket.on('podvalTaken', (playerNum) =>
        {
            console.log('entered podvalTaken')
            if(playerNum !== this.playerNum)
            {
                let diff = this.playerNum - playerNum
                if (diff === 3 || diff === -1) 
                {
                    cardsRenderOpponent1.push((new Card(this)).render(150, 100, cardBackObj).disableInteractive())
                    cardsRenderOpponent1[cardsRenderOpponent1.length-1].angle = 90
                    cardsRenderOpponent1.push((new Card(this)).render(150, 200, cardBackObj).disableInteractive())
                    cardsRenderOpponent1[cardsRenderOpponent1.length-1].angle = 90
                    console.log(`number of cards of the opponent1(left) ${cardsRenderOpponent1.length}`)
                }
                if (diff === 2 || diff === -2) 
                {
                    cardsRenderOpponent2.push((new Card(this)).render(400, 100, cardBackObj).disableInteractive())
                    cardsRenderOpponent2.push((new Card(this)).render(500, 100, cardBackObj).disableInteractive())
                    console.log(`number of cards of the opponent2(across) ${cardsRenderOpponent2.length}`)
                }
                if (diff === 1 || diff === -3) 
                {
                    cardsRenderOpponent3.push((new Card(this)).render(1150, 100, cardBackObj).disableInteractive())
                    cardsRenderOpponent3[cardsRenderOpponent3.length-1].angle = 90
                    cardsRenderOpponent3.push((new Card(this)).render(1150, 200, cardBackObj).disableInteractive())
                    cardsRenderOpponent3[cardsRenderOpponent3.length-1].angle = 90
                    console.log(`number of cards of the opponent3(right) ${cardsRenderOpponent3.length}`)
                }
            }
        })
    }

    // createDropZone(this)
    // {
    //     // creates table drop zone
    //     this.zoneCenter = new Zone (this)
    //     // render zone creates drop zone at (x, y, width, height)
    //     this.dropZoneCenter = this.zoneCenter.renderZone(700, 425, 200, 250)
    //     this.outlineCenter = this.zoneCenter.renderOutline(this.dropZoneCenter)
    // }

    // disableDropZones(scene)
    // {
    //     scene.dropZoneTop.disableInteractive()
    //     scene.zoneCenter.renderOutline(scene.dropZoneTop, 0x000000)
    // }

    // renderPlayerCards(cardsRender)
    // {
    //     for (let i = 0; i < this.playerCards.length; i++) {
    //         cardsRender.push((new Card(this)).render(((i*100) + 500), 800, this.playerCards[i]))
    //     }
    // }

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