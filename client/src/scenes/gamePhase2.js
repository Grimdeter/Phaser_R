import Card from '../helpers/card.js';
import Zone from '../helpers/zone';

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
        this.playerNum = data.playerNum
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
        window.myScene2 = this
        let self = this
        this.changedSceneFlag = false

        this.isActive = false
        this.activePlayerNum = 0

        this.cardBackObj = new Card().setCardData(0, 0)
        console.log(`entered gamePhase2`)

        this.cardsRender = []
        this.cardsRenderOpponent1 = []
        this.cardsRenderOpponent2 = []
        this.cardsRenderOpponent3 = []
        this.cardsRenderPlayed = []

        this.cardsTableObj = []
        // creates table drop zone
        this.zoneCenter = new Zone (this)
        // render zone creates drop zone at (x, y, width, height)
        this.dropZoneCenter = this.zoneCenter.renderZone(700, 425, 200, 250)
        this.outlineCenter = this.zoneCenter.renderOutline(this.dropZoneCenter, 0x000000)

        this.input.on("dragend", (pointer, gameObject, dropped) =>
        {
            if(!dropped)
            {
                gameObject.x = gameObject.input.dragStartX;
                gameObject.y = gameObject.input.dragStartY;
            }
        })
    
        // drop in the create 
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
                this.timeout = setTimeout(()=>
                {
                    for (let i = 0; i < this.playerCards.length; i++) {
                        let toCheck = `card_${this.playerCards[i].cardValue}_${this.playerCards[i].cardSuit}`
                        if(toCheck === gameObject.texture.key)
                        {
                            this.playerCards.splice(i,1)
                        }
                    }
                }, 1000)

                for (let i = 0; i < this.playerCards.length; i++) {
                    let toCheck = `card_${this.playerCards[i].cardValue}_${this.playerCards[i].cardSuit}`
                    if(toCheck === gameObject.texture.key)
                    {
                        cardObj = this.playerCards[i]
                        console.log(`cardObj ${cardObj.cardSuit} ${cardObj.cardValue}`)
                    }
                }

                for (let i = 0; i < this.cardsRender.length; i++) {
                    this.cardsRender[i].destroy()
                }

                this.cardsRender.splice(0, this.cardsRender.length)

                // render player cards
                setTimeout(() => this.cardsRender = this.renderPlayerCards(this.cardsRender), 1100)

                console.log(`sending card obj: cardValue: ${cardObj.cardValue} cardSuit: ${cardObj.cardSuit}`)
                self.socket.emit('cardPlayed', cardObj)
            }
        })

        // add render of new cards after take 
        this.socket.on('active2', () =>
        {
            this.activePlayerNum = this.playerNum
            // this.createDropZone(this)
            this.outlineCenter = this.zoneCenter.renderOutline(this.dropZoneCenter, 0x808080)
            console.log(`I am active`)
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

        this.socket.on('punish2', ()=>
        {
            clearTimeout(this.timeout)
            // this.scene.stop()
            // this.scene.start('punish', {sceneNum: 2, playerCards:this.playerCards, socket:this.socket, podval:this.podval, isPlayerA: this.isPlayerA, isPlayerB: this.isPlayerB, isPlayerC: this.isPlayerC, isPlayerD: this.isPlayerD})
            this.changedSceneFlag = true
            this.scene.sleep()
            this.scene.run(`punish`, {sceneNum: 2, socket:this.socket})
        })

        this.socket.on('toPunish2', (activePlayerNum) =>
        {
            // this.scene.stop()
            // this.scene.start('toPunish', {sceneNum: 2, activePlayerNum: activePlayerNum, playerCards:this.playerCards, socket:this.socket, podval:this.podval, isPlayerA: this.isPlayerA, isPlayerB: this.isPlayerB, isPlayerC: this.isPlayerC, isPlayerD: this.isPlayerD})
            this.changedSceneFlag = true
            this.scene.sleep()
            this.scene.run(`toPunish`, {sceneNum: 2, activePlayerNum: activePlayerNum, socket:this.socket, isPlayerA: this.isPlayerA, isPlayerB: this.isPlayerB, isPlayerC: this.isPlayerC, isPlayerD: this.isPlayerD})
        })
    
        // // render player cards
        this.cardsRender = this.renderPlayerCards(this.cardsRender)

        // set nums 
        if (this.playerNum === 0) 
        {
            this.num1 = this.numOfCardsB
            this.num2 = this.numOfCardsC
            this.num3 = this.numOfCardsD
        } else if (this.playerNum === 1)
        {
            this.num1 = this.numOfCardsC
            this.num2 = this.numOfCardsD
            this.num3 = this.numOfCardsA
        } else if (this.playerNum === 2)
        {
            this.num1 = this.numOfCardsD
            this.num2 = this.numOfCardsA
            this.num3 = this.numOfCardsB
        } else if (this.playerNum === 3)
        {
            this.num1 = this.numOfCardsA
            this.num2 = this.numOfCardsB
            this.num3 = this.numOfCardsC
        }
        
        this.renderOpponentCards()

        this.socket.on('cardPlayedServ', (gameObject, activePlayerNum) =>
        {
            console.log('cardPlayedServ')
            this.cardsTableObj.push(gameObject)
            this.dropZoneCenter.data.values.cards++
            this.cardsRenderPlayed.push((new Card(this)).render(((this.dropZoneCenter.x - 40) + (this.dropZoneCenter.data.values.cards * 50)), this.dropZoneCenter.y, gameObject).disableInteractive()) 
            console.log('this.cardsRenderPlayed: ' + this.cardsRenderPlayed)
            if(activePlayerNum !== this.playerNum)
            {
                let diff = this.playerNum - activePlayerNum
                if (diff === 3 || diff === -1) 
                {
                    this.num1 = this.num1 - 1
                }
                if (diff === 2 || diff === -2) 
                {
                    this.num2 = this.num2 - 1
                }
                if (diff === 1 || diff === -3) 
                {
                    this.num3 = this.num3 - 1
                }
            }
            this.activePlayerNum++
            this.renderOpponentCards()
        })
        let newTrumpSuit
        //discard, win, podval, selection on new trumpSuit
        this.socket.on('discard', () =>
        {
            for (let i = 0; i < this.cardsRenderPlayed.length; i++) {
                this.cardsRenderPlayed[i].destroy()
            }
            this.dropZoneCenter.data.values.cards=0
            this.cardsRenderPlayed.splice(0,this.cardsRenderPlayed.length)
            this.cardsTableObj.splice(0, this.cardsTableObj.length)
            if (this.playerCards.length === 0) {
                if (this.podval.length === 0) {
                    this.socket.emit('win', this.playerNum)
                    this.add.text(500, 500, ['WIN!']).setFontSize(30)
                } else 
                {
                    this.playerCards = this.podval
                    
                    // render player cards
                    for (let i = 0; i < this.playerCards.length; i++) {
                        this.cardsRender.push((new Card(this)).render(((i*100) + 500), 800, this.playerCards[i]))
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
            this.activePlayerNum++
            console.log('entered cardTaken')
            for (let i = 0; i < this.cardsRenderPlayed.length; i++) {
                this.cardsRenderPlayed[i].destroy()
            }
            this.cardsTableObj.shift()
            this.dropZoneCenter.data.values.cards=0
            
            console.log('cardTableObj: ' + this.cardsTableObj)
            for (let i = 0; i < this.cardsTableObj.length; i++) {
                this.cardsRenderPlayed.push((new Card(this)).render(((this.dropZoneCenter.x - 40) + (this.dropZoneCenter.data.values.cards * 50)), this.dropZoneCenter.y, this.cardsTableObj[i]).disableInteractive()) 
                this.dropZoneCenter.data.values.cards++
            }
            
            if(activePlayerNum !== this.playerNum)
            {
                let diff = this.playerNum - activePlayerNum
                if (diff === 3 || diff === -1) 
                {
                    this.num1++
                }
                if (diff === 2 || diff === -2) 
                {
                    this.num2++
                }
                if (diff === 1 || diff === -3) 
                {
                    this.num3++
                }
            }
            this.renderOpponentCards()
            if (this.playerCards.length === 0) {
                if (this.podval.length === 0) {
                    this.socket.emit('win', this.playerNum)
                } else 
                {
                    this.playerCards = this.podval
                    
                    // render player cards
                    for (let i = 0; i < this.playerCards.length; i++) {
                        this.cardsRender.push((new Card(this)).render(((i*100) + 500), 800, this.playerCards[i]))
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
        
        this.socket.on('newCard2', (gameObject) =>
        {
            console.log('playerCards.lenght: ' + this.playerCards.length)
            this.playerCards.push(gameObject)
            console.log('playerCards: ' + this.playerCards)

            for (let i = 0; i < this.cardsRender.length; i++) {
                this.cardsRender[i].destroy()
            }

            // render player cards
            for (let i = 0; i < this.playerCards.length; i++) {
                this.cardsRender.push((new Card(this)).render(((i*100) + 500), 800, this.playerCards[i]))
            }
        })
        
        this.socket.on('podvalTaken', (playerNum) =>
        {
            if(playerNum !== this.playerNum)
            {
                let diff = this.playerNum - playerNum
                if (diff === 3 || diff === -1) 
                {
                    this.num1 = 2 
                }
                if (diff === 2 || diff === -2) 
                {
                    this.num2 = 2
                }
                if (diff === 1 || diff === -3) 
                {
                    this.num3 = 2
                }
            }
            this.renderOpponentCards(this.playerNum)
        })
        
        this.socket.emit('tableCards')
        this.renderPlayerNames()

        let functionExecuted = false 
        this.socket.on('tableCards', (tableCards) =>
        {
            if (functionExecuted === false)
            {
                this.cardsTableObj = tableCards
                // this.zoneCenter = new Zone (this)
                // // render zone creates drop zone at (x, y, width, height)
                // this.dropZoneCenter = this.zoneCenter.renderZone(700, 425, 200, 250)
                // this.outlineCenter = this.zoneCenter.renderOutline(this.dropZoneCenter, 0x000000)
                
                this.dropZoneCenter.data.values.cards = 0
                console.log(`tableCards: ${tableCards} tableCards.length: ${tableCards.length}`)
                for(let card in tableCards)
                {
                    console.log(`card Suit: ${tableCards[card].cardSuit} card Value: ${tableCards[card].cardValue}`);
                }
                for (let i = 0; i < tableCards.length; i++) {
                    this.cardsRenderPlayed.push((new Card(this)).render(((this.dropZoneCenter.x - 40) + (this.dropZoneCenter.data.values.cards * 50)), this.dropZoneCenter.y, tableCards[i]).disableInteractive()) 
                    this.dropZoneCenter.data.values.cards++
                }
                console.log(`this.cardsRenderPlayed: ${this.cardsRenderPlayed} this.cardsRenderPlayed.length: ${this.cardsRenderPlayed.length}`)
                functionExecuted = true
            }
        })
        
        this.socket.on('numberOfCardsFromServer', (numOfCardsA, numOfCardsB, numOfCardsC, numOfCardsD) =>
        {
            if (this.playerNum === 0) 
            {
                this.num1 = numOfCardsB
                this.num2 = numOfCardsC
                this.num3 = numOfCardsD
            } else if (this.playerNum === 1)
            {
                this.num1 = numOfCardsC
                this.num2 = numOfCardsD
                this.num3 = numOfCardsA
            } else if (this.playerNum === 2)
            {
                this.num1 = numOfCardsD
                this.num2 = numOfCardsA
                this.num3 = numOfCardsB
            } else if (this.playerNum === 3)
            {
                this.num1 = numOfCardsA
                this.num2 = numOfCardsB
                this.num3 = numOfCardsC
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

    renderPlayerCards(cardsRenderFunc)
    {
        let distanceBetweenCards = 100
        let halfOfWidth = 700
        let startPos = 500
        for (let i = 0; i < cardsRenderFunc.length; i++) {
            cardsRenderFunc[i].destroy()
        }
        cardsRenderFunc.splice(0, cardsRenderFunc.length)
        if (this.playerCards.length % 2 === 0) 
        {
            startPos = (halfOfWidth - distanceBetweenCards*this.playerCards.length/2) + 25
        } else
        {
            startPos = (halfOfWidth - distanceBetweenCards*(this.playerCards.length-1)/2) - 25
        }
        for (let i = 0; i < this.playerCards.length; i++) {
            cardsRenderFunc.push((new Card(this)).render(((i*distanceBetweenCards) + startPos), 800, this.playerCards[i]))
        }
        return cardsRenderFunc
    }

    renderOpponentCards()
    {
        let halfOfWidth = 700
        let halfOfHeight = 450
        let distanceBetweenCards = 100
        let startPos1 = 500
        let startPos2 = 500
        let startPos3 = 500
        //destroy and splice the existing card backs
{
        for (let i = 0; i < this.cardsRenderOpponent2.length; i++) {
            this.cardsRenderOpponent2[i].destroy()
        }
        this.cardsRenderOpponent2.splice(0, this.cardsRenderOpponent2.length)

        for (let i = 0; i < this.cardsRenderOpponent1.length; i++) {
            this.cardsRenderOpponent1[i].destroy()
        }
        this.cardsRenderOpponent1.splice(0, this.cardsRenderOpponent1.length)

        for (let i = 0; i < this.cardsRenderOpponent3.length; i++) {
            this.cardsRenderOpponent3[i].destroy()
        }
        this.cardsRenderOpponent3.splice(0, this.cardsRenderOpponent3.length)
}
        // set start positions 
{
        // set startPos2 
        if (this.num2 % 2 === 0) {
            startPos2 = (halfOfWidth - distanceBetweenCards*this.num2/2) + 25
        } else
        {
            startPos2 = (halfOfWidth - distanceBetweenCards*(this.num2-1)/2) - 25
        }

        // set startPos1 
        if (this.num1 % 2 === 0) {
            startPos1 = (halfOfHeight - distanceBetweenCards*this.num1/2) + 25
        } else
        {
            startPos1 = (halfOfHeight - distanceBetweenCards*(this.num1-1)/2) - 25
        }

        // set startPos3 
        if (this.num3 % 2 === 0) {
            startPos3 = (halfOfHeight - distanceBetweenCards*this.num3/2) + 25
        } else
        {
            startPos3 = (halfOfHeight - distanceBetweenCards*(this.num3-1)/2) - 25
        }
}
        //render card backs
{
        for (let i = 0; i < this.num2; i++) {
            this.cardsRenderOpponent2.push((new Card(this)).render(((i*distanceBetweenCards) + startPos2), 100, this.cardBackObj).disableInteractive())
        }
        for (let i = 0; i < this.num1; i++) {
            this.cardsRenderOpponent1.push((new Card(this)).render(150, (startPos1 + (i * distanceBetweenCards)), this.cardBackObj).disableInteractive())
            this.cardsRenderOpponent1[i].angle = 90
        }
        for (let i = 0; i < this.num3; i++) {
            this.cardsRenderOpponent3.push((new Card(this)).render(1150, (startPos3 + (i * distanceBetweenCards)), this.cardBackObj).disableInteractive())
            this.cardsRenderOpponent3[i].angle = 90
        }
}
    }

    renderPlayerNames()
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

    update()
    {
        if(this.changedSceneFlag === true)
        {
            // this.cardsRender = []
            this.changedSceneFlag = false
            this.cardsRender = this.renderPlayerCards(this.cardsRender)
        }
    }
}