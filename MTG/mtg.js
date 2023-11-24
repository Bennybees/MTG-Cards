// Object to hold the card data
var cardData = {};

// List of double-sided card names
var doubleSidedCards = [];

document.getElementById('cardForm').addEventListener('submit', async (event) => {
    // Prevent the form from submitting
    event.preventDefault(); 

    // Get the card name from the form
    const cardName = document.getElementById('cardNameIn').value; 

    // Clear the cardDisplay div
    document.getElementById('cardDisplay').innerHTML = '';

    // Fetch the card data from the server
    const response = await fetch(`http://localhost:3000/card/${encodeURIComponent(cardName)}`);
    const cards = await response.json();

    // Check if any cards were returned
    if (cards.length === 0) {
        // Display an error message to the user
        document.getElementById('cardDisplay').innerHTML = '<p>No cards found with that name.</p>';
        // Set the class to no-cards-found
        document.getElementById('cardDisplay').className = 'no-cards-found';
        return;
    }
    
    // Card duplicates are returned, so we need to get rid of them
    // Create a new array to hold the unique cards
    let uniqueCards = [];

    // Reverse the cards array so that the most recent printing is first
    cards.reverse();

    // Iterate over the cards array
    cards.forEach(card => {
        // Check if the card is double-sided
        // If it is, we need to create a cardData object for the first name using the data from the first time we see that name
        // Then we need to create a cardData object for the second name using the data from the second time we see that name
        // Then we need to add both cardData objects to the uniqueCards array
        // But we only have the data for one side at a time, so we need to keep track of 
            //if we've seen the first name yet to know which side of the card we're on
        if (card.name.includes(' // ')) {
            // Check if this is the first side of the card and we dont have either side in the uniqueCards array
            if (!doubleSidedCards.includes(card.name) && !uniqueCards.some(uniqueCard => uniqueCard.name === card.name)) {
                // If not, add the card name to the doubleSidedCards array
                doubleSidedCards.push(card.name);
                // Let it into the uniqueCards array
                uniqueCards.push(card);
            }
            // Check if this is the second side of the card and we have exactly one card with that name in the uniqueCards array
            else if (doubleSidedCards.includes(card.name) && uniqueCards.filter(uniqueCard => uniqueCard.name === card.name).length === 1){
                // Let it into the uniqueCards array
                uniqueCards.push(card);
            }
            // Otherwise it's a duplicate, so we dont need it
            else{
                return;
            }
        }
        // Since the card is not double-sided, we can just check if we've seen it before
        else if (!uniqueCards.some(uniqueCard => uniqueCard.name === card.name)) {
            // If we havent, add it to the uniqueCards array
            uniqueCards.push(card);
        }
        // Otherwise it's a duplicate, so we dont need it
        else{
            return;
        }
    });

    // Get the card data out
    uniqueCards.forEach(card => {
        // Check if the card is double-sided and we havent processed either side yet
        if (card.name.includes(' // ') && doubleSidedCards.includes(card.name)) {
            // Because of the order we pushed the double sided cards into the uniqueCards array, the back side will always be first
            // Remove the card name from the doubleSidedCards array so we know we got the back side
            doubleSidedCards.splice(doubleSidedCards.indexOf(card.name), 1);
            // So we take the second half of the name and use that as the name for the cardData object
            var cardName = card.name.substring(card.name.indexOf(' // ') + 4, card.name.length);
            // Create a cardData object for the back side
            createCardDiv(cardName, card);
        }
        // Check if the card is double-sided and we have already processed the back side
        else if (card.name.includes(' // ') && !doubleSidedCards.includes(card.name)) {
            // Because of the order we pushed the double sided cards into the uniqueCards array, the front side will always be second
            // So we take the first half of the name and use that as the name for the cardData object
            var cardName = card.name.substring(0, card.name.indexOf(' // '));
            // Create a cardData object for the front side
            createCardDiv(cardName, card);
        }
        // Otherwise the card is not double-sided, so we can just use the name as the name for the cardData object
        else{
            // Create a cardData object for the card
            createCardDiv(card.name, card);
        }
    });
});


// Function to create a card div
function createCardDiv(functionalName, card){
     // Card name
     cardData.name = functionalName;

     // Card mana cost and colors
     cardData.manaCost = card.manaCost;
     cardData.colors = card.colors;
     cardData.cmc = card.cmc;

     // Card types
     cardData.type = card.type;
     cardData.supertypes = card.supertypes;
     cardData.types = card.types;
     cardData.subtypes = card.subtypes;

     // Card text
     cardData.text = card.text;

     // Card power and toughness
     cardData.power = card.power;
     cardData.toughness = card.toughness;

     // Card flip side name (if it has one)
     if (card.name.includes(' // ')) {
        // Determine which side of the card this is by checking which half of the name is the same as the functional name
        if (card.name.substring(0, card.name.indexOf(' // ')) === functionalName) {
            // If it's the front side, set the flip side name to the back side
            cardData.flipSideName = card.name.substring(card.name.indexOf(' // ') + 4, card.name.length);
        }
        else{
            // If it's the back side, set the flip side name to the front side
            cardData.flipSideName = card.name.substring(0, card.name.indexOf(' // '));
        }
    }
     // Card set
     cardData.set = card.set;
     

     // Handle the card data
     cardData = handleCardData(cardData);

     // Create a new div for the card and give it the card class
     const cardDiv = document.createElement('div');
     cardDiv.className = 'card';

     // Add a color class to the cardDiv based on the card's colors
     // If the card is colorless, make it default
     // If the card has more than one color, make it multicolored
     if (cardData.colors.length > 1 && cardData.colors != 'Colorless') {
         cardDiv.classList.add('card-multi');
     }
     else{
         switch (cardData.colors[0]) {
             case 'W':
                 cardDiv.classList.add('card-white');
                 break;
             case 'U':
                 cardDiv.classList.add('card-blue');
                 break;
             case 'B':
                 cardDiv.classList.add('card-black');
                 break;
             case 'R':
                 cardDiv.classList.add('card-red');
                 break;
             case 'G':
                 cardDiv.classList.add('card-green');
                 break;
             default:
                 cardDiv.classList.add('card-default');
                 break;
         }
     }

     
     // If the card is a land and not a creature, set cmc and color to undefined
     // This is to simplify the display for lands (Excluding specifically dryad arbor)
     // There are also the lands that flip into creatures or spells, but im not dealing with those here
     if (cardData.types.includes('Land') && !cardData.types.includes('Creature')) {
         cardData.cmc = undefined;
         cardData.colors = undefined;
     }

     // Set the innerHTML of the cardDiv
     cardDiv.innerHTML = `
         <h2>${cardData.name}</h2>
         <p>${cardData.manaCost ? `Mana Cost: ${cardData.manaCost}&emsp;&emsp;` : ''} ${cardData.cmc!=undefined ? `CMC: ${cardData.cmc}`: ''}</p>
         ${cardData.colors ? `<p>Colors: ${cardData.colors}</p><hr>` : ''}
         
         ${cardData.type ? `<p>${cardData.type}</p><hr>` : ''}

         ${cardData.text ? `<p>${cardData.text.replace(/\n/g, '<br><br>')}</p><hr>` : ''}

         ${cardData.keywords && cardData.keywords.length > 0 ? `<p>Keywords: ${cardData.keywords.join(', ')}</p>` : ''}
         ${cardData.power && cardData.toughness ? `<p>Power/Toughness: ${cardData.power}/${cardData.toughness}</p>` : ''}
         ${(cardData.keywords && cardData.keywords.length > 0) || (cardData.power && cardData.toughness) ? '<hr>' : ''}
         ${cardData.flipSideName ? `<p>Flip Side: ${cardData.flipSideName}</p>` : ''}
         ${cardData.set ? `<p>Set: ${cardData.set}</p>` : ''}
     `;

     // Append the cardDiv to the cardDisplay div
     document.getElementById('cardDisplay').appendChild(cardDiv);
}

// Function to handle the card data
function handleCardData(cardData) {
// "Minor" housekeeping to normalize the data

// ===================================================================================================

    // Deal with undefined values

        // Name will always be defined

        // Mana cost, CMC, colors, text, power, toughness may be undefined
        if (cardData.manaCost === undefined) {
            //cardData.manaCost = '';
        }
        if (cardData.cmc === undefined) {
            cardData.cmc = 0;
        }
        if (cardData.colors === undefined) {
            cardData.colors = 'Colorless';
        }
        if (cardData.text === undefined) {
            cardData.text = '';
        }
        if (cardData.power === undefined) {
            cardData.power = '';
        }
        if (cardData.toughness === undefined) {
            cardData.toughness = '';
        }

        // Type will always be defined

        // Set will always be defined

// ===================================================================================================

    // Deal with comma separated values

        // Names are okay to have commas
        
        // Colors are okay to be comma separated

// ===================================================================================================

    // Pick out keywords from the card text

        // Give the cardData object a keywords array
        cardData.keywords = [];

        // Get the card text and split it into an array of lines if it's not empty
        var cardText = cardData.text;
        if (cardText != '') {
            var cardTextLines = cardText.split('\n');

            // Remove any modal text, parenthetical text, saga abilities, and dice roll tables
            // Before we start looking for keywords, as those will mess up the keyword search
            cardTextLines = cardTextLines.map(line => {

                // Dealing with parentheticals
                // If the line has parentheses 
                // Just remove the parenthetical text
                if (line.includes('(')) {
                    // Get the text inside the parentheses
                    var parenText = line.substring(line.indexOf('(') + 1, line.indexOf(')'));
            
                    // Replace the parenText with an empty string
                    return line.replace(`(${parenText})`, '');
                }

                // Dealing with modal cards
                // If the line has the word 'choose' or "Choose" in it, check the text after that for an em dash
                // If there is an em dash, replace it with a period
                if (line.includes('choose') || line.includes('Choose')) {
                    // Get the text after the word 'choose' or 'Choose'
                    var chooseText = line.substring(line.indexOf('choose') + 6, line.length);

                    // If the chooseText has an em dash
                    if (chooseText.includes('—')) {
                        // Replace the em dash with a period
                        return line.replace('—', '.');
                    }
                }

                // Dealing with Sagas
                // If the line has a roman numeral and an em dash
                // Just remove the em dash and put a period instead
                if ((line.includes('I')||line.includes('II')||line.includes('III')||line.includes('IV')||
                        line.includes('V')||line.includes('VI')||line.includes('VII')||line.includes('VIII')||
                        line.includes('IX')||line.includes('X')) && line.includes('—')) {
                    return line.replace('—', '.');
                }
                
                // Dealing with dice roll tables
                // If there is a line that has an em dash and a '|' in it
                // Just remove the em dash replace it with a period
                if (line.includes('—') && line.includes('|')) {
                    return line.replace('—', '.');
                }

                return line;
            });

            
            // Keywords are tricky to pick out from the text
            // Some keywords are one word, some are two words
            // But all lines that have keywords don't end with a period
            // So we just need to split the line on commas
            
            // This should get most keywords, but there are some that will be missed

            // Specifically, flavor keywords like landfall, metalcraft, etc.
            // Those all have em dashes after them, so we can just find those

            cardTextLines.forEach(line => {
                // If the line doesn't have a period in it
                if (!line.includes('.')) {
                    // Split the line on commas
                    var lineKeywords = line.split(',');

                    // Add the keywords to the cardData object
                    lineKeywords.forEach(keyword => {
                        if (keyword.trim() != ''){
                            cardData.keywords.push(' ' + keyword.trim());
                        }
                    });
                } else {
                    // If the line has an em dash
                    if (line.includes('—')) {
                        // Get the text before the em dash
                        var emDashText = line.substring(0, line.indexOf('—'));

                        // Add the em dash text to the keywords array
                        cardData.keywords.push(' ' + emDashText.trim());
                    }
                }
            });
        

            // FOR DEBUGGING
            // print out the card text lines
            cardTextLines.forEach(line => {
                console.log(line);
            });
        }
    return cardData;
}

