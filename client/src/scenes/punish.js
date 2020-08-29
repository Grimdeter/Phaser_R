
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


        this.socket.on('newCard', (cardObj) =>
        {
            this.playerCards.push(cardObj)
            counter++
            if (counter === 3) {
                if(this.sceneNum === 1)
                {
                    console.log('start Phase1')
                    this.socket.emit('turnOver')
                    this.scene.start('gamePhase1', {playerCards:this.playerCards, socket:this.socket, podval:this.podval, isPlayerA: this.isPlayerA, isPlayerB: this.isPlayerB, isPlayerC: this.isPlayerC, isPlayerD: this.isPlayerD})
                } else
                {
                    console.log('start Phase2')
                    this.socket.emit('turnOver')
                    this.scene.start('gamePhase2', {playerCards:this.playerCards, socket:this.socket, podval:this.podval, isPlayerA: this.isPlayerA, isPlayerB: this.isPlayerB, isPlayerC: this.isPlayerC, isPlayerD: this.isPlayerD})
                }
            }
        })
    }

    update()
    {
        
    }
}