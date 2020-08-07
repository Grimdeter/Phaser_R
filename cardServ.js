class Card 
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
            let card = scene.add.image(x, y, `card_${gameObject.data.values.cardValue}_${gameObject.data.values.cardSuit}`).setScale(0.2, 0.2).setInteractive()
            scene.input.setDraggable(card)
            
            return card;
        }
    }
}

module.exports = {Card: Card}