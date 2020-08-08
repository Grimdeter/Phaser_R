import Card from './card.js'

export default class Deck
{
    constructor() {
        let deck = []
        for (let cS= 1; cS < 5; cS++) 
        {
        	for (let cV = 6; cV < 15; cV++) 
        	{
                deck.push(new Card().setCardData(cV, cS))
            }
        }

        let m = deck.length, t, i;

        // While there remain elements to shuffle…
        while (m) {
            // Pick a remaining element…
            i = Math.floor(Math.random() * m--);
            
            // And swap it with the current element.
            t = deck[m];
            deck[m] = deck[i];
            deck[i] = t;
        }
        return deck
    }
}

// import Card from './card.js'

// class Deck
// {
//     constructor() {
//         let deck = []
//         for (let cS= 1; cS < 5; cS++) 
//         {
//         	for (let cV = 6; cV < 15; cV++) 
//         	{
//                 deck.push(new Card().setCardData(cV, cS))
//             }
//         }

//         let m = deck.length, t, i;

//         // While there remain elements to shuffle…
//         while (m) {
//             // Pick a remaining element…
//             i = Math.floor(Math.random() * m--);
            
//             // And swap it with the current element.
//             t = deck[m];
//             deck[m] = deck[i];
//             deck[i] = t;
//         }
//         return deck
//     }
// }

// module.exports = {Deck: Deck}