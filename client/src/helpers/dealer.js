import Card from './card.js'

export default class Dealer 
{
    constructor(scene) 
    {
        this.dealCards = () =>
        {
            let playerCard;
            let opponentSprite = 'card_0_0'
            // if(scene.isPlayerA)
            // {
            //     playerSprite = 'card_6_2'
            //     opponentSprite = 'card_back'
            // } else
            // {
            //     playerSprite = 'card_10_2'
            //     opponentSprite = 'card_back'
            // }
            for (let i = 0; i <= scene.playerCards.length; i++) {
                let playerCard = new Card(scene)
                playerCard.render(475 + (i*100), 650, playerSprite)

                let opponentCard = new Card(scene)                
                scene.opponentCards.push(opponentCard.render(475 + (i*100), 125, opponentSprite).disableInteractive())
            }
        }
    }
}