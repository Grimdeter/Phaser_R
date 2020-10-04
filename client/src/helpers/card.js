export default class Card 
{
    constructor(scene)
    {
        if(arguments.length === 0)
        {
            this.setCardData = (x, y) =>
            {
                let card =
                {
                    cardValue: x,
                    cardSuit: y
                }
                return card
            }
        }
        this.render = (x, y, gameObject) =>
        {
            // console.log(gameObject)
            // let card = scene.add.image(x, y, `card_${gameObject.cardValue}_${gameObject.cardSuit}`).setScale(0.1, 0.1).setInteractive()
            let card = scene.add.image(x, y, `card_${gameObject.cardValue}_${gameObject.cardSuit}`).setScale(1.9, 1.9).setInteractive()
            scene.input.setDraggable(card)
            return card;
        }
    }
}