
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
        this.socket = data.socket
        this.playerCards = data.playerCards
    }

    preload()
    {
        
    }

    create()
    {
        console.log('entering punish scene: ')
        let counter = 0

        this.scene.get('gamePhase1').disableDropZones(this.scene.get('gamePhase1'))

        this.socket.on('newCard', (cardObj) =>
        {
            this.scene.get('gamePhase1').playerCards.push(cardObj)
            counter++
            if (counter === 3) {
                console.log('start Phase1')
                this.socket.emit('turnOver')
                this.scene.stop()
            }
        })
    }

    update()
    {
        
    }
}