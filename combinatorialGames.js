/**
 * Contains Classes and functions for use with Combinatorial Games.
 * 
 * author: Kyle George Burke
 * This software is licensed under the MIT License:
The MIT License (MIT)

Copyright (c) 2014 Kyle G. Burke

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
 **/

//used https://jbkflex.wordpress.com/2011/06/21/creating-dynamic-svg-elements-in-javascript/ as template for adding svg elements.  I don't know why the other stuff doesn't work.

/**
 *  Abstract Class for combinatorial rulesets.
 *  Requirements for any subclass:
 *   * must contain a clone method
 *   * must contain a getOptionsForPlayer method
 *   * must have an equals method
 *   * must have a playerNames field.  E.g. ["Left", "Right"]
 */
var CombinatorialGame = Class.create({
    
    /**
     * Determines whether the given player has an option
     */
    hasOption: function(player, position) {
        var options = this.getOptionsForPlayer(player);
        for (var i = 0; i < options.length; i++) {
            if (position.equals(options[i])) return true;
        }
        return false;
    }
    
    ,/**
     * Returns the canonical form of this game, which must be equivalent.  This should be implemented in subclasses to improve performance for dynamic-programming AIs I haven't written yet. :-P
     */
    canonize: function() {
        return this.clone();
    }
    
    ,/**
     * Gets the player's identity (Blue/Black/Vertical/etc) as a string.
     */
    getPlayerName: function(playerIndex) {
        return this.playerNames[playerIndex];
    }
    
    
});
//declare constants
CombinatorialGame.prototype.LEFT = 0;
CombinatorialGame.prototype.RIGHT = 1;
CombinatorialGame.prototype.PLAYER_NAMES = ["Left", "Right"];

//end of CombinatorialGame

var GridDistanceGame = Class.create(CombinatorialGame, {

    /**
     * Constructor.  
     */
    initialize: function(height, width, sameDistances, differentDistances, blueLocations, redLocations) {
        this.sameDistances = sameDistances;
        this.differentDistances = differentDistances;
        this.blueLocations = blueLocations || [];
        this.redLocations = redLocations || [];
        this.height = height;
        this.width = width;
    }
    
    /**
     * Checks that the piece positions are legal.
     */
    ,isPositionLegal: function() {
        //check that the blues are legal
        for (var i = 0; i < blueLocations.length; i++) {
            var blue = blueLocations[i];
            //check that the piece isn't off the board
            if (blue[0] < 0 || blue[0] >= width || blue[1] < 0 || blue[1] >= height) {
                console.log("Error: blue piece is at an illegal position.");
                return false;
            }
            //check that it doesn't overlap with one of the red pieces
            for (var j = 0; j < redLocations.length; j++) {
                var red = redLocations[j];
                if (red[0] == blue[0] && red[1] == blue[1]) {
                    console.log("Error: red piece and blue piece at the same place!");
                    return false;
                }
            }
        }
        //check that the reds are legal
        return true;
    }
    
}); //end of GridDistanceGame class

/**
 * Class for Atropos ruleset.
 */
var Atropos = Class.create(CombinatorialGame, {
    
    /**
     * Constructor.  
     */
    initialize: function(sideLength, lastPlay, filledCirclesAndColors) {
        this.playerNames = ["Left", "Right"];
        this.sideLength = sideLength;
        this.lastPlay = null;
        if (lastPlay != undefined && this.lastPlay != null) {
            this.lastPlay = [lastPlay[0], lastPlay[1]];
        }
        if (filledCirclesAndColors == undefined) {
            filledCirclesAndColors = this.getStartingColoredCircles();
        }
        filledCirclesAndColors = filledCirclesAndColors || [];
        this.filledCircles = [];
        for (var i = 0; i < filledCirclesAndColors.length; i++) {
            var circle = filledCirclesAndColors[i];
            if (circle[2] != Atropos.prototype.UNCOLORED) {
                this.filledCircles.push([circle[0], circle[1], circle[2]]);
            }
        }
    }
    
    /**
     * Returns the starting colors based on this.sideLength.
     */
    ,getStartingColoredCircles: function() {
        var startingCircles = [];
        //bottom row: yellow and blue
        for (var column = 1; column < this.sideLength + 2; column ++) {
            var row = 0;
            var possibleColors = [Atropos.prototype.YELLOW, Atropos.prototype.BLUE];
            startingCircles.push([row, column, possibleColors[column % 2]]); 
        }
        //left hand side: blue and red
        for (var row = 1; row < this.sideLength + 2; row ++) {
            var column = 0;
            var possibleColors = [Atropos.prototype.BLUE, Atropos.prototype.RED];
            startingCircles.push([row, column, possibleColors[row % 2]]);
        }
        //right hand side: red and yellow
        for (var row = 1; row < this.sideLength + 2; row ++) {
            var column = this.sideLength + 2 - row;
            var possibleColors = [Atropos.prototype.RED, Atropos.prototype.YELLOW];
            startingCircles.push([row, column, possibleColors[row % 2]]);
        }
        return startingCircles;
    }
    
    /**
     * Returns the color of a circle.
     */
    ,getCircleColor: function(row, angledColumn) {
        for (var i = 0; i < this.filledCircles.length; i++) {
            var circle = this.filledCircles[i];
            if (circle[0] == row && circle[1] == angledColumn) {
                return circle[2];
            }
        }
        return Atropos.prototype.UNCOLORED;
    }
    
    /**
     * Returns whether a circle is colored.
     */
    ,isColored: function(row, column) {
        return this.getCircleColor(row, column) != 3;
    }
    
    /**
     * Equals!
     */
    ,equals: function(other) {
        if (this.sideLength != other.sideLength) {
            return false;
        }
        if ((this.lastPlay == null && other.lastPlay != null) || 
            (this.lastPlay != null && other.lastPlay == null) ||
            (this.lastPlay != null && other.lastPlay != null && 
             (this.lastPlay[0] != other.lastPlay[0] || 
              this.lastPlay[1] != other.lastPlay[1]))) {
            return false;
        }
        if (this.filledCircles.length != other.filledCircles.length) {
            return false;
        }
        for (var i = 0; i < this.filledCircles.length; i++) {
            var circle = this.filledCircles[i];
            var row = circle[0];
            var column = circle[1];
            var color = circle[2];
            if (other.getCircleColor(row, column) != color) {
                return false;
            }
        }
        return true;
    }
    
    /**
     * Clone!
     */
    ,clone: function() {
        return new Atropos(this.sideLength, this.lastPlay, this.filledCircles);
    }
    
    /**
     * Gets any colors that can't be played adjacent to the two given circle locations.
     */
    ,getIllegalColorsNearTwo: function(circleARow, circleAColumn, circleBRow, circleBColumn) {
        if (this.isColored(circleARow, circleAColumn) && this.isColored(circleBRow, circleBColumn)) {
            var colorA = this.getCircleColor(circleARow, circleAColumn);
            var colorB = this.getCircleColor(circleBRow, circleBColumn);
            if (colorA != colorB) {
                return [3 - (colorA + colorB)];
            }
        } 
        return [];
    }
    
    /**
     * Gets an ordered list of the 6 coordinates around a given point.
     */
    ,getNeighboringCoordinates: function(row, column) {
        var neighbors = [];
        neighbors.push([row + 1, column - 1]);
        neighbors.push([row, column - 1]);
        neighbors.push([row - 1, column]);
        neighbors.push([row - 1, column + 1]);
        neighbors.push([row, column + 1]);
        neighbors.push([row + 1, column]);
        return neighbors;
    }
    
    /**
     * Returns whether a location is surrounded by colored spaces.
     */
    ,isSurrounded: function(row, column) {
        var neighbors = this.getNeighboringCoordinates(row, column);
        for (var i = 0; i < neighbors.length; i++) {
            var neighbor = neighbors[i];
            if (!this.isColored(neighbor[0], neighbor[1])) {
                return false;
            }
        }
        return true;
    }
    
    /**
     * Returns whether the next play is a jump.
     */
    ,nextIsJump: function() {
        return this.lastPlay == null || this.isSurrounded(this.lastPlay[0], this.lastPlay[1]);
    }
    
    /**
     * Gets any colors that can't be played a certain location.
     */
    ,getIllegalColorsAt: function(row, column) {
        var neighbors = this.getNeighboringCoordinates(row, column);
        var illegalColors = [];
        for (var i = 0; i < neighbors.length; i++) {
            var neighborA = neighbors[i];
            var neighborB = neighbors[(i+1) % neighbors.length];
            var moreIllegal = this.getIllegalColorsNearTwo(neighborA[0], neighborA[1], neighborB[0], neighborB[1]);
            for (var j = 0; j < moreIllegal.length; j++) {
                var illegalColor = moreIllegal[j];
                if (illegalColors.indexOf(illegalColor) < 0) {
                    illegalColors.push(moreIllegal[j]);
                }
            }
        }
        console.log("illegal colors at (" + row + ", " + column + "): " + illegalColors);
        return illegalColors;
    }
    
    /**
     * Gets any colors that can be played at a location.
     */
    ,getLegalColorsAt: function(row, column) {
        var allColors = [Atropos.prototype.RED, Atropos.prototype.BLUE, Atropos.prototype.YELLOW];
        var illegalColors = this.getIllegalColorsAt(row, column);
        var legalColors = [];
        for (var i = 0; i < allColors.length; i ++) {
            if (illegalColors.indexOf(allColors[i]) < 0) {
                legalColors.push(allColors[i]);
            }
        }
        return legalColors;
    }
    
    //override
    ,getOptionsForPlayer: function(playerId) {
        var options = [];
        if (this.nextIsJump()) {
            for (var row = 1; row < this.sideLength + 2; row ++) {
                for (var column = 1; column < this.sideLength + 2 - row; column ++) {
                    var optionsAtLocation = this.getOptionsAt(row, column);
                    options = options.concat(optionsAtLocation);
                }
            }
        } else {
            console.log("not a jump");
            options = this.getOptionsAround(this.lastPlay[0], this.lastPlay[1]);
        }
        return options;
    }
    
    /**
     * Returns a move option with an added circle.  Does not check that this isn't already colored!
     */
    ,getOptionWith: function(row, column, color) {
        var clone = this.clone();
        clone.filledCircles.push([row, column, color]);
        clone.lastPlay = [row, column];
        return clone;
    }
    
    /**
     * Returns the options around a point.
     */
    ,getOptionsAround: function(row, column) {
        var options = [];
        var neighbors = this.getNeighboringCoordinates(row, column);
        for (var i = 0; i < neighbors.length; i++) {
            options = options.concat(this.getOptionsAt(neighbors[i][0], neighbors[i][1]));
        }
        return options;
    }
    
    /**
     * Returns an array of all the options at a specific row and column.
     */
    ,getOptionsAt: function(row, column) {
        var options = [];
        if (!this.isColored(row, column)) {
            var colors = this.getLegalColorsAt(row, column);
            for (var i = 0; i < colors.length; i++) {
                options.push(this.getOptionWith(row, column, colors[i]));
            }
        }
        return options;
    }
    
}); 
//Some Atropos constants
Atropos.prototype.RED = 0;
Atropos.prototype.BLUE = 1;
Atropos.prototype.YELLOW = 2;
Atropos.prototype.UNCOLORED = 3;
//end of Atropos class
    

var InteractiveAtroposView = Class.create({
    
    initialize: function(position) {
        this.position = position;
        this.selectedElement = undefined;
        this.popup = null;
    }
    
    /**
     * Draws the checker board and assigns the listener
     */
    ,draw: function(containerElement, listener) {
        //clear out the children of containerElement
        while (containerElement.hasChildNodes()) {
            containerElement.removeChild(containerElement.firstChild);
        }
        var svgNS = "http://www.w3.org/2000/svg";
        var boardSvg = document.createElementNS(svgNS, "svg");
        //now add the new board to the container 
        containerElement.appendChild(boardSvg);
        var boardPixelSize = Math.min(window.innerHeight, window.innerWidth - 200);
        //var boardPixelSize = 10 + (this.position.sideLength + 4) * 100
        boardSvg.setAttributeNS(null, "width", boardPixelSize);
        boardSvg.setAttributeNS(null, "height", boardPixelSize);
        var n = this.position.sideLength + 2;
        var boxSide = boardPixelSize / (n+1);
        console.log("boxSide: " + boxSide);
        var circleRadius = (boxSide - 10)/2;
        
        //draw the circles
        for (var row = this.position.sideLength + 1; row >= 0; row --) {
            for (var column = Math.max(0, 1-row); column < n+1 - Math.max(row, 1); column ++) {
                var colorInt = this.position.getCircleColor(row, column);
                var circle = document.createElementNS(svgNS, "circle");
                circle.row = row; 
                circle.column = column;
                circle.setAttributeNS(null, "cx", (column * boxSide) + (row * boxSide/2) + boxSide/2);
                circle.setAttributeNS(null, "cy", ((n - row) * boxSide));
                circle.setAttributeNS(null, "r", circleRadius);
                if (!this.position.nextIsJump() && circle.row == this.position.lastPlay[0] && circle.column == this.position.lastPlay[1]) {
                    circle.style.stroke = "pink";
                }
                if (colorInt == Atropos.prototype.RED) {
                    circle.setAttributeNS(null, "class", "redPiece");
                } else if (colorInt == Atropos.prototype.BLUE) {
                    circle.setAttributeNS(null, "class", "bluePiece");
                } else if (colorInt == Atropos.prototype.YELLOW) {
                    circle.setAttributeNS(null, "class", "yellowPiece");
                } else {
                    circle.setAttributeNS(null, "class", "whitePiece");
                    //only white circles are clickable
                    if (listener != undefined) {
                        var player = listener;
                        circle.onclick = function(event) {
                            console.log("clicked on: (" + event.target.row + ", " + event.target.column + ")"); 
                            player.handleClick(event);
                        };
                    }
                }
                boardSvg.appendChild(circle);
            }
        }
    }
    
    /**
     * Handles a mouse click.
     * @param currentPlayer  The index for the player, not the player object.
     */
    ,getNextPositionFromClick: function(event, currentPlayer, containerElement, player) {
        this.destroyPopup();
        console.log("Clicked!");
        var self = this;
        //create the popup
        this.popup = document.createElement("div");
        var redButton = document.createElement("button");
        redButton.appendChild(toNode("Red"));
        redButton.onclick = function() {
            self.destroyPopup();
            player.sendMoveToRef(self.position.getOptionWith(event.target.row, event.target.column, Atropos.prototype.RED));
        };
        this.popup.appendChild(redButton);
    
        var blueButton = document.createElement("button");
        blueButton.appendChild(toNode("Blue"));
        blueButton.onclick = function() {
            self.destroyPopup();
            player.sendMoveToRef(self.position.getOptionWith(event.target.row, event.target.column, Atropos.prototype.BLUE));
        };
        this.popup.appendChild(blueButton);
    
        var yellowButton = document.createElement("button");
        yellowButton.appendChild(toNode("Yellow"));
        yellowButton.onclick = function() {
            self.destroyPopup();
            player.sendMoveToRef(self.position.getOptionWith(event.target.row, event.target.column, Atropos.prototype.YELLOW));
        };
        this.popup.appendChild(yellowButton);
    
        this.popup.style.position = "fixed";
        this.popup.style.display = "block";
        this.popup.style.opacity = 1;
        this.popup.width = Math.min(window.innerWidth/2, 100);
        this.popup.height = Math.min(window.innerHeight/2, 50);
        this.popup.style.left = event.clientX + "px";
        this.popup.style.top = event.clientY + "px";
        document.body.appendChild(this.popup);
        return null;
        //}
    }
    
    /**
     * Destroys the popup color window.
     */
    ,destroyPopup: function() {
        if (this.popup != null) {
            this.popup.parentNode.removeChild(this.popup);
            this.selectedElement = undefined;
            this.popup = null;
        }
    }
});  //end of InteractiveAtroposView

/**
 * View Factory
 */
var InteractiveAtroposViewFactory = Class.create({
    /**
     * Constructor
     */
    initialize: function() {
        //do nothing
    }
    
    /**
     * Returns an interactive view
     */
    ,getInteractiveBoard: function(position) {
        return new InteractiveAtroposView(position);
    }
    
    ,/**
     * Returns a view.
     */
    getView: function(position) {
        return this.getInteractiveBoard(position);
    }
    
}); //end of InteractiveAtroposViewFactory

//end of Atropos stuff!

//Start of Distance Games stuff!
//TODO: move the Distance Games stuff down here.





//end of Distance Games stuff



/**************************Buttons and Scissors***************************************/

function newButtonsAndScissorsGame() {
    var viewFactory = new InteractiveButtonsAndScissorsViewFactory();
    var playDelay = 1000;
    var playerOptions = [new HumanPlayer(viewFactory), new RandomPlayer(playDelay), new DepthSearchPlayer(playDelay, 1), new DepthSearchPlayer(playDelay, 3), new DepthSearchPlayer(playDelay, 5), new DepthSearchPlayer(100, 7)];
    var width = parseInt($('boardWidth').value);
    var height = parseInt($('boardHeight').value);
    var controlForm = $('gameOptions');
    var leftPlayer = parseInt(getSelectedRadioValue(controlForm.elements['leftPlayer']));
    var rightPlayer =  parseInt(getSelectedRadioValue(controlForm.elements['rightPlayer']));
    var game = new ButtonsAndScissors(width, height);
    game.setRandomButtons(.4);
    game.setRandomBlocks(0); //no blocks
    var players = [playerOptions[leftPlayer], playerOptions[rightPlayer]];
    var ref = new Referee(game, players, viewFactory, "buttonsAndScissorsBoard", $('messageBox'), controlForm);
}
    

/**
 * Buttons and Scissors ruleset.
 */
var ButtonsAndScissors = Class.create(CombinatorialGame, {
    /**
     * Constructor.
     */
    initialize: function(width, height, buttons, blocks) {
        this.playerNames = ["Blue", "Red"];
        this.colors = ["blue", "red", "green"];
        this.colorIndices = [0, 1, 2];
        this.width = width;
        this.height = height;
        this.buttons = buttons || [];
        this.blocks = blocks || [];
    }
    
    /**
     * Returns whether there is a block at coordinates.
     */
    ,hasBlockAt: function(row, column) {
        for (var i = 0; i < this.blocks.length; i++) {
            var block = this.blocks[i];
            if (block[0] == row && block[1] == column)  return true;
        }
        return false;
    }
    
    /**
     * Gets the button color at a location.  Returns -1 if there's no button there.
     */
    ,getColorAt: function(row, column) {
        for (var color = 0; color < this.buttons.length; color++) {
            for (var i = 0; i < this.buttons[color].length; i++) {
                var button = this.buttons[color][i];
                if (button[0] == row && button[1] == column) return color;
            }
        }
        return -1;
    }
    
    /**
     * Returns whether there is a button of a specific color at a position.
     */
    ,hasButtonAt: function(row, column, color) {
        for (var i = 0; i < this.buttons[color].length; i++) {
            var button = this.buttons[color][i];
            if (button[0] == row && button[1] == column) return true;
        }
        return false;
    }
    
    /**
     * Adds random buttons.
     */
    ,setRandomButtons: function(density) {
        var buttonsToCreate = Math.floor((Math.random() / 5 + (density - .1)) * this.width * this.height);
        var buttonColors = [];
        var j = 0;
        while (j < .5 * buttonsToCreate) {
            buttonColors.push(0);
            j++;
        }
        while (j < buttonsToCreate) {
            buttonColors.push(1);
            j++;
        }
        //don't add green anymore
        while (j < buttonsToCreate) {
            buttonColors.push(2);
            j++;
        }
        
        this.buttons = [];
        for (var i = 0; i < this.colors.length; i++) {
            this.buttons.push([]);
        }
        
        while (buttonColors.length > 0) {
            var row = Math.floor(Math.random() * this.height);
            var column = Math.floor(Math.random() * this.width);
            while (this.hasBlockAt(row, column) || this.getColorAt(row, column) != -1) {
                row = Math.floor(Math.random() * this.height);
                column = Math.floor(Math.random() * this.width);
            }
            var colorIndex = buttonColors.pop();
            this.buttons[colorIndex].push([row, column]);
        }
        /*
        for (var row = 0; row < this.height; row++) {
            for (var column = 0; column < this.width; column++) {
                if (!this.hasBlockAt(row, column) && Math.random() < density) {
                    //this.buttons[randomChoice(this.colorIndices)].push([row, column]);
                    this.buttons[randomChoice([0, 0, 1, 1, 2])].push([row, column]);
                }
            }
        }*/
    }
    
    /**
     * Adds random blocks.
     */
    ,setRandomBlocks: function(density) {
        this.blocks = [];
        for (var row = 0; row < this.height; row++) {
            for (var column = 0; column < this.width; column++) {
                if (this.getColorAt(row, column) == -1 && Math.random() < density) {
                    this.blocks.push([row, column]);
                }
            }
        }
    }
    
    /**
     * equals
     */
    ,equals: function(other) {
        if (this.blocks.length != other.blocks.length || this.buttons[0].length != other.buttons[0].length || this.buttons[1].length != other.buttons[1].length) return false;
        //check that other has all the buttons
        for (var color = 0; color < this.colors.length; color++) {
            for (var i = 0; i < this.buttons[color].length; i++) {
                var button = this.buttons[color][i];
                if (!other.hasButtonAt(button[0], button[1], color)) return false;
            }
        }
        
        //check that other has all the blocks
        for (var i = 0; i < this.blocks.length; i++) {
            var block = this.blocks[i];
            if (!other.hasBlockAt(block[0], block[1])) return false;
        }
        return true;
    }
    
    /**
     * clone
     */
    ,clone: function() {
        buttonsCopy = [];
        for (var color = 0; color < this.buttons.length; color++) {
            buttonsCopy.push([]);
            for (var i = 0; i < this.buttons[color].length; i++) {
                var button = this.buttons[color][i];
                buttonsCopy[color].push([button[0], button[1]]);
            }
        }
        blocksCopy = [];
        for (var i = 0; i < this.blocks.length; i++) {
            var block = this.blocks[i];
            blocksCopy.push([block[0], block[1]]);
        }
        return new ButtonsAndScissors(this.width, this.height, buttonsCopy, blocksCopy);
    }
    
    /**
     * Determines whether two buttons can be cut.
     */
    ,areCuttable: function(locationA, locationB, playerIndex) {
        //check that the locations are different
        if (locationA[0] == locationB[0] && locationA[1] == locationB[1]) return false;
        //check that the colors are the same
        var colorA = this.getColorAt(locationA[0], locationA[1]);
        var colorB = this.getColorAt(locationB[0], locationB[1]);
        if (colorA != colorB) return false;
        //check that the player's color is correct
        if (colorA == 1 - playerIndex) return false;
        //check that the two points are connected by 8 cardinal directions
        var xDistance = locationB[0] - locationA[0];
        var yDistance = locationB[1] - locationA[1];
        if (xDistance != 0 && yDistance != 0 && Math.abs(xDistance) != Math.abs(yDistance)) return false;
        //check that everything along the path is not a button with a different color and not a block
        var xStep = xDistance > 0 ? 1 : (xDistance < 0 ? -1 : 0);
        var yStep = yDistance > 0 ? 1 : (yDistance < 0 ? -1 : 0);
        for (var i = 0; i < Math.max(Math.abs(xDistance), Math.abs(yDistance)); i++) {
            var midLocation = [locationA[0] + i*xStep, locationA[1] + i*yStep];
            var colorAtMidLocation = this.getColorAt(midLocation[0], midLocation[1]);
            console.log("midLocation: " + midLocation + ", color there: " + colorAtMidLocation);
            if ((colorAtMidLocation != -1 && colorAtMidLocation != colorA) || this.hasBlockAt(midLocation[0], midLocation[1])) return false;
        }
        return true;
    }
    
    /**
     * Removes a button.  Precondition: button must be here!
     */
    ,removeButton: function(row, column, colorIndex) {
        var i = 0;
        for (; i < this.buttons[colorIndex].length; i++) {
            var button = this.buttons[colorIndex][i];
            if (button[0] == row && button[1] == column) break;
        }
        //console.log("cutting " + i + "th button: [" + row + ", " + column + "]");
        this.buttons[colorIndex] = this.buttons[colorIndex].slice(0, i).concat(this.buttons[colorIndex].slice(i+1));
    }
    
    /**
     * Gets the option from a single cut.  Precondition: assumes the cut can be made.
     */
    ,getCutOption: function(locationA, locationB) {
        var color = this.getColorAt(locationA[0], locationA[1]);
        var copy = this.clone();
        var xStep = locationB[0] > locationA[0] ? 1 : (locationB[0] < locationA[0] ? -1 : 0);
        var yStep = locationB[1] > locationA[1] ? 1 : (locationB[1] < locationA[1] ? -1 : 0);
        var x = locationA[0];
        var y = locationA[1];
        while (true) {
            copy.removeButton(x, y, color);
            if (x == locationB[0] && y == locationB[1]) break;
            x += xStep;
            y += yStep;
        }
        //copy.removeButton(locationB[0], locationB[1], color);
        //copy.removeButton(x, y, color);
        return copy;
    }
    
    /**
     * getOptionsForPlayer
     */
    ,getOptionsForPlayer: function(playerId) {
        var options = [];
        for (var colorIndex = 0; colorIndex < this.buttons.length; colorIndex ++) {
            for (var i = 0; i < this.buttons[colorIndex].length; i++) {
                for (var j = i + 1; j < this.buttons[colorIndex].length; j++) {
                    var locationA = this.buttons[colorIndex][i];
                    var locationB = this.buttons[colorIndex][j];
                    if (this.areCuttable(locationA, locationB, playerId)) {
                        options.push(this.getCutOption(locationA, locationB));
                    }
                }
            }
        }
        return options;
    }
}); //end of ButtonsAndScissors

var InteractiveButtonsAndScissorsView = Class.create({
    
    initialize: function(position) {
        this.position = position;
        this.selectedPiece = undefined;
    }
    
    /**
     * Draws the checker board and assigns the listener
     */
    ,draw: function(containerElement, listener) {
        //clear out the children of containerElement
        while (containerElement.hasChildNodes()) {
            containerElement.removeChild(containerElement.firstChild);
        }
        var svgNS = "http://www.w3.org/2000/svg";
        var boardSvg = document.createElementNS(svgNS, "svg");
        //now add the new board to the container 
        containerElement.appendChild(boardSvg);
        
        boardSvg.setAttributeNS(null, "width", 10 + this.position.width * 100);
        boardSvg.setAttributeNS(null, "height", 10 + this.position.height * 100);
        
        //draw the checker tiles
        for (var i = 0; i < this.position.width; i++) {
            for (var j = 0; j < this.position.height; j++) {
                var parityString = "even";
                if ((i+j) % 2 == 1) {
                    parityString = "odd";
                }
                var checkerTile = document.createElementNS(svgNS,"rect");
                checkerTile.setAttributeNS(null, "x", (i * 100) + "");
                checkerTile.setAttributeNS(null, "y", (j * 100) + "");
                checkerTile.setAttributeNS(null, "width", "100");
                checkerTile.setAttributeNS(null, "height", "100");
                checkerTile.setAttributeNS(null, "class", parityString + "Checker");
                boardSvg.appendChild(checkerTile);
                
            }
        }
        
        //draw the buttons
        for (var colorIndex = 0; colorIndex < this.position.buttons.length; colorIndex++) {
            for (var i = 0; i < this.position.buttons[colorIndex].length; i++) {
                var button = this.position.buttons[colorIndex][i];
                var svgButton = document.createElementNS(svgNS, "circle");
                var x = button[0];
                var y = button[1];
                svgButton.setAttributeNS(null, "cy", (x * 100) + 50);
                svgButton.setAttributeNS(null, "cx", (y * 100) + 50);
                svgButton.setAttributeNS(null, "r", 45);
                svgButton.setAttributeNS(null, "class", this.position.colors[colorIndex] + "Piece");
                if (listener != undefined) {
                    var player = listener;
                    svgButton.onclick = function(event) {player.handleClick(event);}
                }
                svgButton.player = colorIndex;
                svgButton.modelData = button;
                boardSvg.appendChild(svgButton);
            }
        }
        
        //TODO: draw the blocks
        for (var i = 0; i < this.position.blocks.length; i++) {
            var block = this.position.blocks[i];
            var svgBlock = document.createElementNS(svgNS, "rect");
            var x = block[0];
            var y = block[1];
            svgBlock.setAttributeNS(null, "y", (x * 100) + "");
            svgBlock.setAttributeNS(null, "x", (y * 100) + "");
            svgBlock.setAttributeNS(null, "width", "100");
            svgBlock.setAttributeNS(null, "height", "100");
            //TODO: don't append it yet.  Also, need to set the class.
        }
    }
    
    /**
     * Selects a piece.
     */
    ,selectPiece: function(piece) {
        this.selectedPiece = piece;
        this.selectedPiece.style.stroke = "Purple";
    }
    
    /**
     * Deselect piece.
     */
    ,deselectPiece: function() {
        if (this.selectedPiece != undefined) {
            this.selectedPiece.style.stroke = "Black";
            this.selectedPiece = undefined;
        }
    }
    
    /**
     *  Gets the next position using piece locations.
     */ 
    ,getNextPositionFromPieceLocations: function(firstPiece, secondPiece, containerElement) {
        var buttonA = firstPiece.modelData;
        var buttonB = secondPiece.modelData;
        if (this.position.areCuttable(buttonA, buttonB, buttonA.color)) {
            console.log("Cuttable!");
            this.deselectPiece();
            return this.position.getCutOption(buttonA, buttonB);
        } else {
            this.deselectPiece();
            return null;
        }
    } 
    
    /**
     * Handles a mouse click.
     */
    ,getNextPositionFromClick: function(event, currentPlayer, containerElement) {
        var clickedPiece = event.target;
        if (this.selectedPiece == undefined) {
            //select the clicked piece, if appropriate
            if (currentPlayer != 1 - clickedPiece.player) {
                this.selectPiece(clickedPiece);
            }
            return null; //no new move from this
        } else {
            //clicking a second piece
            if (currentPlayer != 1 - clickedPiece.player) {
                //trying to make a move
                console.log("Making a move...");
                var nextPosition = this.getNextPositionFromPieceLocations(this.selectedPiece, clickedPiece, containerElement);
                this.deselectPiece();
                return nextPosition;
            } else {
                this.deselectPiece();
                return null;
            }
        }
    }
}); //end of InteractiveButtonsAndScissorsView

/**
 * View Factory
 */
var InteractiveButtonsAndScissorsViewFactory = Class.create({
    /**
     * Constructor
     */
    initialize: function() {
        //do nothing
    }
    
    /**
     * Returns an interactive view
     */
    ,getInteractiveBoard: function(position) {
        return new InteractiveButtonsAndScissorsView(position);
    }
    
    ,/**
     * Returns a view.
     */
    getView: function(position) {
        return this.getInteractiveBoard(position);
    }
    
}); //end of InteractiveButtonsAndScissorsViewFactory

/********************************Clobber**********************************************/

/**
 * Class for Clobber ruleset.
 */
var Clobber = Class.create(CombinatorialGame, {
    
    /**
     * Constructor.  TODO: refactor to only take one positions 2-D list.
     */
    initialize: function(width, height, positions, rightPositions) {
        this.playerNames = ["Blue", "Red"];
        this.width = width;
        this.height = height;
        if (positions == undefined) {
            positions = [this.getStartingPositions(0), this.getStartingPositions(1)];
        } else if (rightPositions != undefined) {
            //TODO: deprecate this case!
            console.log("Called Clobber constructor with 4 params!");
            positions = [positions, rightPositions];
        }
        this.draughts = [new Array(), new Array()];
        for (var i = 0; i < positions.length; i++) {
            for (var j = 0; j < positions[i].length; j++) {
                var coordinates = positions[i][j];
                this.draughts[i].push(coordinates);
            }
        }
        /*
        this.bluePieces = this.pieces[0];
        this.redPieces = this.pieces[1];
        */
    }
    
    /**
     * Constructor Helper.
     */
    ,getStartingPositions: function(playerIndex) {
        var pieces = new Array();
        for (var i = 0; i < this.width; i++) {
            for (var j = 0; j < this.height; j++) {
                var coordinates = [i, j];
                if ((i+j) % 2 == playerIndex) {
                    pieces.push(coordinates);
                } 
            }
        }
        return pieces;
    }
    
    ,/**
     * Determines whether this equals another position.  Tests identical equality, not equivalence.
     */
    equals: function(other) {
        if ((this.width != other.width) || (this.height != other.height)) return false;
        //check that other has all this's pieces
        for (var i = 0; i < this.draughts.length; i++) {
            for (var j = 0; j < this.draughts[i].length; j++) {
                var hasPiece = false;
                for (var k = 0; k < other.draughts[i].length; k++) {
                    if (this.draughts[i][j][0] == other.draughts[i][k][0] &&
                    this.draughts[i][j][1] == other.draughts[i][k][1]) hasPiece = true;
                }
                if (hasPiece == false) return false;
            }
        }
        //check that this has all other's pieces
        for (var i = 0; i < other.draughts.length; i++) {
            for (var j = 0; j < other.draughts[i].length; j++) {
                var hasPiece = false;
                for (var k = 0; k < this.draughts[i].length; k++) {
                    if (this.draughts[i][k][0] == other.draughts[i][j][0] &&
                    this.draughts[i][k][1] == other.draughts[i][j][1]) hasPiece = true;
                }
                if (hasPiece == false) return false;
            }
        }
        return true;
    }
    
    ,/**
     * Returns the distance between two pieces.
     */
    areAdjacent: function(position0, position1) {
        var distance = Math.abs(position0[0] - position1[0]);
        distance += Math.abs(position0[1] - position1[1]);
        return distance == 1;
    }
    
    ,/**
     * Clones this game.
     */
    clone: function() {
        return new Clobber(this.width, this.height, this.draughts);
    }
    
    /**
     * Gets the options for a player.
     */
    ,getOptionsForPlayer: function(playerId) {
        var otherPlayerId = 1- playerId;
        var options = new Array();
        var currentPlayerPieces = this.draughts[playerId];
        var otherPlayerPieces = this.draughts[otherPlayerId];
        for (var i = 0; i < currentPlayerPieces.length; i++) {
            var currentPiece = currentPlayerPieces[i];
            for (var j = 0; j < otherPlayerPieces.length; j++) {
                var otherPiece = otherPlayerPieces[j];
                if (this.areAdjacent(currentPiece, otherPiece)) {
                    //generate a new game!
                    var nextPieces = [new Array(), new Array()];
                    
                    //add the current player's pieces
                    for (var k = 0; k < currentPlayerPieces.length; k++) {
                        if (k != i) {
                            //add the unmoving piece
                            nextPieces[playerId].push(currentPlayerPieces[k]);
                        } else {
                            //add the one that clobbered
                            nextPieces[playerId].push(otherPiece)
                        }
                    }
                    
                    //add the other player's pieces
                    for (var k = 0; k < otherPlayerPieces.length; k++) {
                        if (k != j) {
                            //add the piece (skips the clobbered one)
                            nextPieces[otherPlayerId].push(otherPlayerPieces[k]);
                        }
                    }
                    var option = new Clobber(this.width, this.height, nextPieces)
                    options.push(option); 
                    //break; //stop checking for neighbors to the current player's piece
                }
                
            }
        }
        return options;
    }
    
    ,/**
     * toString
     */
    toString: function() {
        var string = "Clobber Position\n";
        for (var i = 0; i < this.draughts.length; i++) {
            string += this.getPlayerName(i) + " positions:\n";
            for (var j = 0; j < this.draughts[i].length; j++) {
                var piece = this.draughts[i][j];
                string += "    [" + piece[0] + ", " + piece[1] + "]\n";
            }
        }
        return string;
    }
}); //end of Clobber

var ReverseClobber = Class.create(Clobber, {
    
    /**
     * Gets the options for a player.
     */
    getOptionsForPlayer: function(playerId) {
        var otherPlayerId = 1- playerId;
        var options = new Array();
        var currentPlayerPieces = this.draughts[playerId];
        var otherPlayerPieces = this.draughts[otherPlayerId];
        for (var i = 0; i < currentPlayerPieces.length; i++) {
            var currentPiece = currentPlayerPieces[i];
            for (var j = 0; j < otherPlayerPieces.length; j++) {
                var otherPiece = otherPlayerPieces[j];
                if (this.areAdjacent(currentPiece, otherPiece)) {
                    //generate a new game!
                    var nextPieces = [new Array(), new Array()];
                    for (var k = 0; k < i; k++) {
                        nextPieces[playerId].push(currentPlayerPieces[k]);
                    }
                    for (var k = i+1; k < currentPlayerPieces.length; k++) {
                        nextPieces[playerId].push(currentPlayerPieces[k]);
                    }
                    var nextOtherPlayerPieces = new Array();
                    for (var k = 0; k < otherPlayerPieces.length; k++) {
                        nextPieces[otherPlayerId].push(otherPlayerPieces[k]);
                    }
                    var option = new ReverseClobber(this.width, this.height, nextPieces)
                    options.push(option); //TODO: switch to 3-argument contstructor
                    break; //stop checking for neighbors to the current player's piece
                }
                
            }
        }
        return options;
    }
    
    ,/**
     * toString
     */
    toString: function() {
        var string = "Reverse Clobber Position\n";
        for (var i = 0; i < this.draughts.length; i++) {
            string += this.getPlayerName(i) + " positions:\n";
            for (var j = 0; j < this.draughts[i].length; j++) {
                var piece = this.draughts[i][j];
                string += "    [" + piece[0] + ", " + piece[1] + "]\n";
            }
        }
        return string;
    }
    
}); //end of ReverseClobber

/**
 * Class for Clobbineering ruleset.
 */
var Clobbineering = Class.create(CombinatorialGame, {
    
    /**
     * Constructor.  
     */
    initialize: function(width, height, draughts, dominoes, blockedSpaces) {
        this.playerNames = ["Blue/Vertical", "Red/Horizontal"];
        this.width = width || 4;
        this.height = height || 4;
        //draughts = draughts || [new Array(), new Array()];
        dominoes = dominoes || [new Array(), new Array()];
        blockedSpaces = blockedSpaces || new Array();
        this.clobber = new Clobber(this.width, this.height, draughts);
        this.domineering = new Domineering(this.width, this.height, dominoes, blockedSpaces);
    }
    
    ,/**
     * toString
     */
    toString: function() {
        var string = "Clobbineering Position:\n";
        string += this.clobber.toString();
        string += this.domineering.toString();
        return string;
    }
    
    ,/**
     * equals
     */
    equals: function(other) {
        return this.clobber.equals(other.clobber) && this.domineering.equals(other.domineering);
    }
    
    ,/**
     * clone
     */
    clone: function() {
        var clone = new Clobbineering(this.width, this.height, this.clobber.draughts, this.domineering.dominoes, this.domineering.blockedSpaces);
        return clone;
    }
    
    ,/**
     * getOptionsForPlayer
     */
    getOptionsForPlayer: function(playerId) {
        var options = new Array();
        
        //add the clobber-type moves.
        var clobberMoves = this.clobber.getOptionsForPlayer(playerId);
        for (var i = 0; i < clobberMoves.length; i++) {
            var clobberMove = clobberMoves[i];
            var option = new Clobbineering(this.width, this.height, clobberMove.draughts, this.domineering.dominoes, this.domineering.blockedSpaces);
            options.push(option);
        }
        
        //add the domineering type moves
        //put the clobber pieces in as blocks
        var domineeringWithClobberBlocks = this.domineering.clone();
        for (var i = 0; i < this.clobber.draughts.length; i++) {
            var clobberPieces = this.clobber.draughts[i];
            for (var j = 0; j < clobberPieces.length; j++) {
                domineeringWithClobberBlocks.blockedSpaces.push([clobberPieces[j][0], clobberPieces[j][1]]);
            }
        }
        
        var dominoPlacements = domineeringWithClobberBlocks.getDominoMoves(playerId);
        for (var i = 0; i < dominoPlacements.length; i++) {
            var newDomino = dominoPlacements[i];
            var column = newDomino[0];
            var row = newDomino[1];
            var option = this.clone();
            option.domineering.dominoes[playerId].push([column, row]);
            options.push(option);
        }
        
        return options;
    }
    
}); //end of Clobbineering
    

var InteractiveSVGClobbineeringView = Class.create({
    
    initialize: function(position) {
        this.position = position;
        this.selectedElement = undefined;
    }
    
    ,/**
     * Draws the checker board and assigns the listener
     */
    draw: function(containerElement, listener) {
        //clear out the children of containerElement
        while (containerElement.hasChildNodes()) {
            containerElement.removeChild(containerElement.firstChild);
        }
        var svgNS = "http://www.w3.org/2000/svg";
        var boardSvg = document.createElementNS(svgNS, "svg");
        //now add the new board to the container 
        containerElement.appendChild(boardSvg);
        boardSvg.setAttributeNS(null, "width", 10 + this.position.width * 100);
        boardSvg.setAttributeNS(null, "height", 10 + this.position.height * 100);
        
        //draw the checker tiles
        for (var i = 0; i < this.position.width; i++) {
            for (var j = 0; j < this.position.height; j++) {
                var parityString = "even";
                if ((i+j) % 2 == 1) {
                    parityString = "odd";
                }
                var checkerTile = document.createElementNS(svgNS,"rect");
                checkerTile.setAttributeNS(null, "x", (i * 100) + "");
                checkerTile.setAttributeNS(null, "y", (j * 100) + "");
                checkerTile.setAttributeNS(null, "width", "100");
                checkerTile.setAttributeNS(null, "height", "100");
                checkerTile.setAttributeNS(null, "class", parityString + "Checker");
                boardSvg.appendChild(checkerTile);
                if (listener != undefined) {
                    var player = listener;
                    checkerTile.onclick = function(event) {player.handleClick(event);}
                }
                checkerTile.normalStyleCssText  = checkerTile.style.cssText;
                checkerTile.style.fill = "gray";
                checkerTile.selectedStyleCssText = checkerTile.style.cssText;
                checkerTile.style.cssText = checkerTile.normalStyleCssText;                
            }
        }
        
        //draw the dominoes
        for (var playerId = 0; playerId < this.position.domineering.dominoes.length; playerId++) {
            var dominoes = this.position.domineering.dominoes[playerId];
            for (var i =0; i < dominoes.length; i++) {
                var domino = dominoes[i];
                var column = domino[0];
                var row = domino[1];
                var dominoRect = document.createElementNS(svgNS, "rect");
                dominoRect.setAttributeNS(null, "x", new String(10 + column * 100));
                dominoRect.setAttributeNS(null, "y", new String(10 + row * 100));
                //these two lines round the corners
                dominoRect.setAttributeNS(null, "rx", "10");
                dominoRect.setAttributeNS(null, "ry", "10");
                dominoRect.setAttributeNS(null, "width", new String(100 * (1 + playerId) - 20));
                dominoRect.setAttributeNS(null, "height", new String(100 * (2 - playerId) - 20));
                dominoRect.setAttributeNS(null, "class", "domino");
                boardSvg.appendChild(dominoRect);
            }
        }
        
        //draw the draughts
        for (var i = 0; i < this.position.clobber.draughts.length; i++) {
            var draughts = this.position.clobber.draughts[i];
            for (var j = 0; j < draughts.length; j++) {
                var draughtLocation = draughts[j];
                var draught = document.createElementNS(svgNS, "circle");
                var x = draughtLocation[0];
                var y = draughtLocation[1];
                draught.setAttributeNS(null, "cx", (x * 100) + 50);
                draught.setAttributeNS(null, "cy", (y * 100) + 50);
                draught.setAttributeNS(null, "r", 45);
                if (i == CombinatorialGame.prototype.LEFT) {
                    draught.setAttributeNS(null, "class", "bluePiece");
                } else {
                    draught.setAttributeNS(null, "class", "redPiece");
                }
                boardSvg.appendChild(draught);
                if (listener != undefined) {
                    var player = listener;
                    draught.onclick = function(event) {player.handleClick(event);}
                }
                draught.player = i;
                draught.normalStyleCssText = draught.style.cssText;
                draught.style.stroke = "Purple";
                draught.selectedStyleCssText = draught.style.cssText;
                draught.style.cssText = draught.normalStyleCssText;
            }
        }
    }
    
    ,/**
     * Selects a piece.
     */
    selectElement: function(element) {
        this.selectedElement = element;
        this.selectedElement.style.cssText = this.selectedElement.selectedStyleCssText;
        this.selectedElement;
    }
    
    ,/**
     * Deselect piece.
     */
    deselectElement: function() {
        this.selectedElement.style.cssText = this.selectedElement.normalStyleCssText;
        this.selectedElement = undefined;
    }
    
    ,/**
     * Handles a mouse click.
     * TODO: working on this!
     */
    getNextPositionFromClick: function(event, currentPlayer, containerElement) {
        var clickedElement = event.target; //this will be a tile
        if (this.selectedElement == undefined) {
            this.selectElement(clickedElement);
            return null;
        } else if (this.selectedElement.tagName == clickedElement.tagName) {
            if (clickedElement.tagName == "rect") {
                //make the appropriate domineering move
                var domineeringView = new InteractiveSVGDomineeringView(this.position.domineering);
                var domineeringMove = domineeringView.getNextPositionFromElementLocations(this.selectedElement, clickedElement, containerElement, currentPlayer);
                //var domineeringMove = domineeringView.getNextPositionFromClick(event, currentPlayer, containerElement);
                if (domineeringMove != null) {
                    return new Clobbineering(this.position.width, this.position.height, this.position.clobber.draughts, domineeringMove.dominoes, this.position.domineering.blockedSpaces);
                }
            } else if (clickedElement.tagName == "circle") {
                //make the appropriate clobber move
                var clobberView = new InteractiveSVGClobberView(this.position.clobber);
                var clobberMove = clobberView.getNextPositionFromPieceLocations(this.selectedElement, clickedElement, containerElement);
                if (clobberMove != null) {
                    var newPosition =  new Clobbineering(this.position.width, this.position.height, clobberMove.draughts, this.position.domineering.dominoes, this.position.domineering.blockedSpaces);
                    return newPosition;
                } 
            } else {
                this.deselectElement();
            }
        }
        this.deselectElement();
        return null;
    }
});  //end of InteractiveSVGClobbineeringView

/**
 * View Factory
 */
var InteractiveSVGClobbineeringViewFactory = Class.create({
    /**
     * Constructor
     */
    initialize: function() {
        //do nothing
    }
    
    ,/**
     * Returns an interactive view
     */
    getInteractiveBoard: function(position) {
        return new InteractiveSVGClobbineeringView(position);
    }
    
    ,/**
     * Returns a view.
     */
    getView: function(position) {
        return this.getInteractiveBoard(position);
    }
    
}); //end of InteractiveSVGClobbineeringViewFactory
        

/**
 * Class for Domineering ruleset.
 */
var Domineering = Class.create(CombinatorialGame, {
    
    /**
     * Constructor
     */
    initialize: function(width, height, startingDominoes, blockedSpaces) {
        startingDominoes = startingDominoes || [new Array(), new Array()];
        this.dominoes = [new Array(), new Array()];
        for (var i = 0; i < startingDominoes.length; i++) {
            for (var j = 0; j < startingDominoes[i].length; j++) {
                var startingDomino = startingDominoes[i][j];
                this.dominoes[i].push([startingDomino[0], startingDomino[1]]);
            }
        }
        blockedSpaces = blockedSpaces || new Array();
        this.blockedSpaces = new Array();
        for (var i = 0; i < blockedSpaces.length; i++) {
            var blockedSpace = blockedSpaces[i];
            this.blockedSpaces.push([blockedSpace[0], blockedSpace[1]]);
        }
        this.width = width;
        this.height = height;
        this.playerNames = ["Vertical", "Horizontal"];
        //console.log("New domineering game created with " + (this.dominoes[0].length + this.dominoes[1].length) + " dominoes and " + this.blockedSpaces.length + " blocked spaces.");
    }
    
    ,/**
     * toString
     */
    toString: function() {
        var string = "Domineering position\n";
        for (var i = 0; i < this.dominoes.length; i++) {
            string += this.playerNames[i] + "'s dominoes (top-left corner) are at:\n";
            for (var j = 0; j < this.dominoes[i].length; j++) {
                string += "  " + this.dominoes[i][j] + "\n";
            }
        }
        string += "Blocked Spaces:\n";
        for (var i = 0; i < this.blockedSpaces.length; i++) {
            string += "  " + this.blockedSpaces[i] + "\n";
        }
        return string;
    }
    
    ,/**
     * Clones this, but replaces dominoes with blocked spaces
     */
    canonize: function() {
        var clone = this.clone();
        for (var playerId = 0; playerId < 2; playerId++) {
            while (clone.dominoes[playerId].length > 0) {
                //domino is upper-left corner of domino
                var domino = clone.dominoes[playerId].pop();
                clone.blockedSpaces.push(domino);
                clone.blockedSpaces.push([domino[0] + playerId, domino[1] + (1-playerId)]);
            }
        }
        return clone;
    }
    
    ,/**
     * Returns the move options.
     */
    getOptionsForPlayer: function(playerId) {
        var options = new Array();
        var dominoPlacements = this.getDominoMoves(playerId);
        for (var i = 0; i < dominoPlacements.length; i++) {
            var newDomino = dominoPlacements[i];
            var column = newDomino[0];
            var row = newDomino[1];
            var option = this.clone();
            option.dominoes[playerId].push([column, row]);
            //console.log("[" + column + ", " + row + "]");
            options.push(option);
        }
        /*
        //don't look at the bottom row for vertical player
        for (var row = 0; row < this.height + playerId - 1; row++) {
            
            //don't look at the right-most column for horizontal
            for (var column = 0; column < this.width - playerId; column++) {
                //the two spaces the domino would take up
                var dominoSpaces = new Array();
                dominoSpaces.push([column, row]);
                dominoSpaces.push([column + playerId, row + (1-playerId)]);
                
                //create the version of this with dominoes replaced by blocked spots
                var allBlocks = this.canonize();
                
                var blocked = false;
                //make sure no blocked spaces are in the way
                for (var blockIndex = 0; blockIndex < allBlocks.blockedSpaces.length; blockIndex++) {
                    var block = allBlocks.blockedSpaces[blockIndex]
                    for (var i= 0; i < dominoSpaces.length; i++) {
                        var dominoSpace = dominoSpaces[i];
                        if (block[0] == dominoSpace[0] && block[1] == dominoSpace[1]) {
                            blocked = true;
                            break;
                        }
                    }
                    if (blocked) break;
                }
                if (!blocked) {
                    var option = this.clone();
                    option.dominoes[playerId].push([column, row]);
                    //console.log("[" + column + ", " + row + "]");
                    options.push(option);
                }
            }
        }*/
        return options;
    }
    
    ,/**
     * Gets a list of single-domino placement options for the next player.  Does not return entire game states!
     */
    getDominoMoves: function(playerId) {
        var moves = new Array();
        //don't look at the bottom row for vertical player
        for (var row = 0; row < this.height + playerId - 1; row++) {
            
            //don't look at the right-most column for horizontal
            for (var column = 0; column < this.width - playerId; column++) {
                //the two spaces the domino would take up
                var dominoSpaces = new Array();
                dominoSpaces.push([column, row]);
                dominoSpaces.push([column + playerId, row + (1-playerId)]);
                
                //create the version of this with dominoes replaced by blocked spots
                var allBlocks = this.canonize();
                
                var blocked = false;
                //make sure no blocked spaces are in the way
                for (var blockIndex = 0; blockIndex < allBlocks.blockedSpaces.length; blockIndex++) {
                    var block = allBlocks.blockedSpaces[blockIndex]
                    for (var i= 0; i < dominoSpaces.length; i++) {
                        var dominoSpace = dominoSpaces[i];
                        if (block[0] == dominoSpace[0] && block[1] == dominoSpace[1]) {
                            blocked = true;
                            break;
                        }
                    }
                    if (blocked) break;
                }
                if (!blocked) {
                    moves.push([column, row]);
                }
            }
        }
        return moves;
    }
    
    ,/**
     * clone
     */
    clone: function() {
        //
        return new Domineering(this.width, this.height, this.dominoes, this.blockedSpaces);
    }
    
    ,/**
     * equals
     */ 
    equals: function(other) {
        //Check that we have matching dominoes.
        
        //check that other has all of our dominoes
        for (var player = 0; player < this.dominoes.length; player++) {
            for (var i = 0; i < this.dominoes[player].length; i++) {
                var domino = this.dominoes[player][i];
                var otherHasDomino = false;
                for (var j = 0; j < other.dominoes[player].length; j++) {
                    var otherDomino = other.dominoes[player][j];
                    if (domino[0] == otherDomino[0] && domino[1] == otherDomino[1]) {
                        otherHasDomino = true;
                        break;
                    }
                }
                if (!otherHasDomino) return false;
            }
        }
        
        //now check that we have all of other's dominoes
        //(We don't compare sizes in case there are any repeats.)
        for (var player = 0; player < other.dominoes.length; player++) {
            for (var i = 0; i < other.dominoes[player].length; i++) {
                var otherDomino = other.dominoes[player][i];
                var thisHasDomino = false;
                for (var j = 0; j < this.dominoes[player].length; j++) {
                    var domino = this.dominoes[player][j];
                    if (domino[0] == otherDomino[0] && domino[1] == otherDomino[1]) {
                        thisHasDomino = true;
                        break;
                    }
                }
                if (!thisHasDomino) return false;
            }
        }
        
        //now check that blocked spaces match
        
        //check that other has all of our blocked spaces
        for (var i = 0; i < this.blockedSpaces.length; i++) {
            var block = this.blockedSpaces[i];
            var hasBlock = false;
            for (var j = 0; j < other.blockedSpaces.length; j++) {
                var otherBlock = other.blockedSpaces[j];
                if (block[0] == otherBlock[0] && block[1] == otherBlock[1]) {
                    hasBlock = true;
                    break;
                }
            }
            if (!hasBlock) return false;
        }
        
        //check that this has all of other's blocked spaces
        for (var i = 0; i < other.blockedSpaces.length; i++) {
            var otherBlock = other.blockedSpaces[i]
            var hasBlock = false;
            for (var j = 0; j < this.blockedSpaces.length; j++) {
                var block = this.blockedSpaces[j];
                if (block[0] == otherBlock[0] && block[1] == otherBlock[1]) {
                    hasBlock = true;
                    break;
                }
            }
            if (!hasBlock) return false;
        }
        
        //all things match! :)
        return true;        
    }
    
    
}); //end of Domineering class
    

var InteractiveSVGDomineeringView = Class.create({
    
    initialize: function(position) {
        this.position = position;
        this.selectedTile = undefined;
    }
    
    ,/**
     * Draws the checker board and assigns the listener
     */
    draw: function(containerElement, listener) {
        //clear out the children of containerElement
        while (containerElement.hasChildNodes()) {
            containerElement.removeChild(containerElement.firstChild);
        }
        var svgNS = "http://www.w3.org/2000/svg";
        var boardSvg = document.createElementNS(svgNS, "svg");
        //now add the new board to the container 
        containerElement.appendChild(boardSvg);
        boardSvg.setAttributeNS(null, "width", 10 + this.position.width * 100);
        boardSvg.setAttributeNS(null, "height", 10 + this.position.height * 100);
        
        //draw the checker tiles
        for (var i = 0; i < this.position.width; i++) {
            for (var j = 0; j < this.position.height; j++) {
                var parityString = "even";
                if ((i+j) % 2 == 1) {
                    parityString = "odd";
                }
                var checkerTile = document.createElementNS(svgNS,"rect");
                checkerTile.setAttributeNS(null, "x", (i * 100) + "");
                checkerTile.setAttributeNS(null, "y", (j * 100) + "");
                checkerTile.setAttributeNS(null, "width", "100");
                checkerTile.setAttributeNS(null, "height", "100");
                checkerTile.setAttributeNS(null, "class", parityString + "Checker");
                boardSvg.appendChild(checkerTile);
                if (listener != undefined) {
                    var player = listener;
                    checkerTile.onclick = function(event) {player.handleClick(event);}
                }
                
            }
        }
        
        //draw the dominoes
        for (var playerId = 0; playerId < 2; playerId++) {
            for (var i =0; i < this.position.dominoes[playerId].length; i++) {
                var domino = this.position.dominoes[playerId][i];
                var column = domino[0];
                var row = domino[1];
                var dominoRect = document.createElementNS(svgNS, "rect");
                dominoRect.setAttributeNS(null, "x", new String(10 + column * 100));
                dominoRect.setAttributeNS(null, "y", new String(10 + row * 100));
                //these two lines round the corners
                dominoRect.setAttributeNS(null, "rx", "10");
                dominoRect.setAttributeNS(null, "ry", "10");
                dominoRect.setAttributeNS(null, "width", new String(100 * (1 + playerId) - 20));
                dominoRect.setAttributeNS(null, "height", new String(100 * (2 - playerId) - 20));
                dominoRect.setAttributeNS(null, "class", "domino");
                boardSvg.appendChild(dominoRect);
            }
        }
        
        //draw the blocked spaces
        for (var i = 0; i < this.position.blockedSpaces.length; i++) {
            var block = this.position.blockedSpaces[i];
            var column = block[0];
            var row = block[1];
            var blockRect = document.createElementNS(svgNS, "rect");
            blockRect.setAttributeNS(null, "x", new String(5 + column * 100));
            blockRect.setAttributeNS(null, "y", new String(5 + row * 100));
            blockRect.setAttributeNS(null, "width", "90");
            blockRect.setAttributeNS(null, "height", "90");
            blockRect.setAttributeNS(null, "class", "domino");
            boardSvg.appendChild(blockRect);
        }
        
    }
    
    ,/**
     * Selects a tile.
     */
    selectTile: function(tile) {
        this.selectedTile = tile;
        this.selectedTile.oldColor = this.selectedTile.style.fill;
        this.selectedTile.style.fill = "gray";
    }
    
    ,/**
     * Deselect piece.
     */
    deselectTile: function() {
        this.selectedTile.style.fill = this.selectedTile.oldColor;
        this.selectedTile = undefined;
    }
    
    ,/**
     * 
     */
    getNextPositionFromElementLocations: function(firstElement, secondElement, containerElement, currentPlayer) {
        //measure the distance between rectangle corners
        var xDistance = Math.abs(secondElement.x.baseVal.value - firstElement.x.baseVal.value);
        var yDistance = Math.abs(secondElement.y.baseVal.value - firstElement.y.baseVal.value);
        //make sure this is correct for the current player
        if ((xDistance == 100 * currentPlayer) && (yDistance == 100*(1-currentPlayer))) {
            var column = parseInt(Math.min(secondElement.x.baseVal.value, firstElement.x.baseVal.value) / 100);
            var row = parseInt(Math.min(secondElement.y.baseVal.value, firstElement.y.baseVal.value) / 100);
            var nextPosition = this.position.clone();
            //console.log("New domino at [" + column + ", " + row + "]");
            nextPosition.dominoes[currentPlayer].push([column, row]);
            return nextPosition;
        } else {
            return null;
        }
    }
    
    ,/**
     * Handles a mouse click.
     */
    getNextPositionFromClick: function(event, currentPlayer, containerElement) {
        var clickedTile = event.target; //this will be a tile
        if (this.selectedTile == undefined) {
            this.selectTile(clickedTile);
            return null;
        } else {
            var nextPosition = this.getNextPositionFromElementLocations(this.selectedTile, clickedTile, containerElement, currentPlayer);
            this.deselectTile();
            return nextPosition;
            /*
            //measure the distance between rectangle corners
            var xDistance = Math.abs(clickedTile.x.baseVal.value - this.selectedTile.x.baseVal.value);
            var yDistance = Math.abs(clickedTile.y.baseVal.value - this.selectedTile.y.baseVal.value);
            //make sure this is correct for the current player
            if ((xDistance == 100 * currentPlayer) && (yDistance == 100*(1-currentPlayer))) {
                var column = parseInt(Math.min(clickedTile.x.baseVal.value, this.selectedTile.x.baseVal.value) / 100);
                var row = parseInt(Math.min(clickedTile.y.baseVal.value, this.selectedTile.y.baseVal.value) / 100);
                var nextPosition = this.position.clone();
                //console.log("New domino at [" + column + ", " + row + "]");
                nextPosition.dominoes[currentPlayer].push([column, row]);
                this.deselectTile();
                return nextPosition;
            } else {
                this.deselectTile();
                return null;
            }
            */
        }
    }
});  //end of InteractiveSVGDomineeringView

/**
 * View Factory
 */
var InteractiveSVGDomineeringViewFactory = Class.create({
    /**
     * Constructor
     */
    initialize: function() {
        //do nothing
    }
    
    ,/**
     * Returns an interactive view
     */
    getInteractiveBoard: function(position) {
        return new InteractiveSVGDomineeringView(position);
    }
    
    ,/**
     * Returns a view.
     */
    getView: function(position) {
        return this.getInteractiveBoard(position);
    }
    
}); //end of InteractiveSVGDomineeringViewFactory

/**
 * Launches a new Clobbineering Game.
 */
function newClobbineeringGame() {
    var viewFactory = new InteractiveSVGClobbineeringViewFactory();
    var playDelay = 1000;
    var playerOptions = [new HumanPlayer(viewFactory), new RandomPlayer(playDelay), new DepthSearchPlayer(playDelay, 1), new DepthSearchPlayer(playDelay, 3), new DepthSearchPlayer(playDelay, 5), new DepthSearchPlayer(200, 7)];
    var width = parseInt($('boardWidth').value);
    var height = parseInt($('boardHeight').value);
    var controlForm = $('gameOptions');
    var leftPlayer = parseInt(getSelectedRadioValue(controlForm.elements['leftPlayer']));
    var rightPlayer =  parseInt(getSelectedRadioValue(controlForm.elements['rightPlayer']));
    game = new Clobbineering(width, height);
    var players = [playerOptions[leftPlayer], playerOptions[rightPlayer]];
    ref = new Referee(game, players, viewFactory, "gameCanvas", $('messageBox'), controlForm);
}

/**
 * Launches a new Domineering Game.
 */
function newDomineeringGame() {
    var viewFactory = new InteractiveSVGDomineeringViewFactory();
    var playDelay = 1000;
    var playerOptions = [new HumanPlayer(viewFactory), new RandomPlayer(playDelay), new DepthSearchPlayer(playDelay, 1), new DepthSearchPlayer(playDelay, 3), new DepthSearchPlayer(playDelay, 5), new DepthSearchPlayer(200, 7)];
    var width = parseInt($('boardWidth').value);
    var height = parseInt($('boardHeight').value);
    var controlForm = $('gameOptions');
    var leftPlayer = parseInt(getSelectedRadioValue(controlForm.elements['leftPlayer']));
    var rightPlayer =  parseInt(getSelectedRadioValue(controlForm.elements['rightPlayer']));
    game = new Domineering(width, height);
    var players = [playerOptions[leftPlayer], playerOptions[rightPlayer]];
    ref = new Referee(game, players, viewFactory, "gameCanvas", $('messageBox'), controlForm);
}

/**
 * Launches a new Atropos game.
 */
function newAtroposGame() {
    var viewFactory = new InteractiveAtroposViewFactory();
    var playDelay = 1000;
    var playerOptions = [new HumanPlayer(viewFactory), new RandomPlayer(playDelay), new DepthSearchPlayer(playDelay, 1), new DepthSearchPlayer(playDelay, 3), new DepthSearchPlayer(playDelay, 5), new DepthSearchPlayer(100, 7)];
    var width = parseInt($('boardSize').value);
    var controlForm = $('gameOptions');
    var leftPlayer = parseInt(getSelectedRadioValue(controlForm.elements['leftPlayer']));
    var rightPlayer =  parseInt(getSelectedRadioValue(controlForm.elements['rightPlayer']));
    var game = new Atropos(width);
    var players = [playerOptions[leftPlayer], playerOptions[rightPlayer]];
    var ref = new Referee(game, players, viewFactory, "atroposBoard", $('messageBox'), controlForm);
}

/**
 * Launches a new Clobber game.
 */
function newClobberGame(isReverse) {
    var viewFactory = new InteractiveClobberViewFactory(isReverse);
    var playDelay = 1000;
    var playerOptions = [new HumanPlayer(viewFactory), new RandomPlayer(playDelay), new DepthSearchPlayer(playDelay, 1), new DepthSearchPlayer(playDelay, 3), new DepthSearchPlayer(playDelay, 5), new DepthSearchPlayer(200, 7)];
    var width = parseInt($('boardWidth').value);
    var height = parseInt($('boardHeight').value);
    var controlForm = $('gameOptions');
    var leftPlayer = parseInt(getSelectedRadioValue(controlForm.elements['leftPlayer']));
    var rightPlayer =  parseInt(getSelectedRadioValue(controlForm.elements['rightPlayer']));
    if (isReverse) {
        var game = new ReverseClobber(width, height);
    } else {
        var game = new Clobber(width, height);
    }
        
    var players = [playerOptions[leftPlayer], playerOptions[rightPlayer]];
    var ref = new Referee(game, players, viewFactory, "clobberBoard", $('messageBox'), controlForm);
}
    

var InteractiveSVGClobberView = Class.create({
    
    initialize: function(position) {
        this.position = position;
        this.selectedPiece = undefined;
    }
    
    /**
     * Draws the checker board and assigns the listener
     */
    ,draw: function(containerElement, listener) {
        //clear out the children of containerElement
        while (containerElement.hasChildNodes()) {
            containerElement.removeChild(containerElement.firstChild);
        }
        var svgNS = "http://www.w3.org/2000/svg";
        var boardSvg = document.createElementNS(svgNS, "svg");
        //now add the new board to the container 
        containerElement.appendChild(boardSvg);
        boardSvg.setAttributeNS(null, "width", 10 + this.position.width * 100);
        boardSvg.setAttributeNS(null, "height", 10 + this.position.height * 100);
        
        //draw the checker tiles
        for (var i = 0; i < this.position.width; i++) {
            for (var j = 0; j < this.position.height; j++) {
                var parityString = "even";
                if ((i+j) % 2 == 1) {
                    parityString = "odd";
                }
                var checkerTile = document.createElementNS(svgNS,"rect");
                checkerTile.setAttributeNS(null, "x", (i * 100) + "");
                checkerTile.setAttributeNS(null, "y", (j * 100) + "");
                checkerTile.setAttributeNS(null, "width", "100");
                checkerTile.setAttributeNS(null, "height", "100");
                checkerTile.setAttributeNS(null, "class", parityString + "Checker");
                boardSvg.appendChild(checkerTile);
                
            }
        }
        
        //draw the draughts
        for (var i = 0; i < this.position.draughts.length; i++) {
            for (var j = 0; j < this.position.draughts[i].length; j++) {
                
                var draught = document.createElementNS(svgNS, "circle");
                var x = this.position.draughts[i][j][0];
                var y = this.position.draughts[i][j][1];
                draught.setAttributeNS(null, "cx", (x * 100) + 50);
                draught.setAttributeNS(null, "cy", (y * 100) + 50);
                draught.setAttributeNS(null, "r", 45);
                if (i == CombinatorialGame.prototype.LEFT) {
                    draught.setAttributeNS(null, "class", "bluePiece");
                } else {
                    draught.setAttributeNS(null, "class", "redPiece");
                }
                if (listener != undefined) {
                    var player = listener;
                    draught.onclick = function(event) {player.handleClick(event);}
                }
                draught.player = i;
                boardSvg.appendChild(draught);
            }
        }
    }
    
    ,/**
     * Selects a piece.
     */
    selectPiece: function(piece) {
        this.selectedPiece = piece;
        this.selectedPiece.style.stroke = "Purple";
    }
    
    ,/**
     * Deselect piece.
     */
    deselectPiece: function() {
        if (this.selectedPiece != undefined) {
            this.selectedPiece.style.stroke = "Black";
            this.selectedPiece = undefined;
        }
    }
    
    /**
     *  Gets the next position using piece locations.
     */ 
    ,getNextPositionFromPieceLocations: function(firstPiece, secondPiece, containerElement) {
        var xDistance = Math.abs(secondPiece.cx.baseVal.value - firstPiece.cx.baseVal.value);
        var yDistance = Math.abs(secondPiece.cy.baseVal.value - firstPiece.cy.baseVal.value);
        var pieceDistance = Math.sqrt(Math.pow(xDistance, 2) + Math.pow(yDistance, 2));
        if (pieceDistance < 105) {
            var nextPieces = [[], []]; //nextPieces: 0th list will be blue, 1th red
            var boardSvg = containerElement.lastChild;
            var boardElements = boardSvg.childNodes;
            for (var i = 0; i < boardElements.length; i++) {
                if (boardElements[i] == firstPiece) {
                    nextPieces[firstPiece.player].push([(secondPiece.cx.baseVal.value - 50) / 100, (secondPiece.cy.baseVal.value - 50) / 100]);
                } else if (boardElements[i] != secondPiece && boardElements[i].player != undefined) {
                    var piece = boardElements[i];
                    nextPieces[piece.player].push([(piece.cx.baseVal.value - 50)/100, (piece.cy.baseVal.value - 50) / 100]);
                }
            }
            this.deselectPiece();
            return new Clobber(this.position.width, this.position.height, nextPieces);
            
        } else {
            this.deselectPiece();
            return null;
        }
        
    }
    
    ,/**
     * Handles a mouse click.
     */
    getNextPositionFromClick: function(event, currentPlayer, containerElement) {
        var clickedPiece = event.target;
        if (this.selectedPiece == undefined) {
            //select the clicked piece, if appropriate
            if (currentPlayer == clickedPiece.player) {
                this.selectPiece(clickedPiece);
            }
            return null; //no new move from this
        } else {
            if (currentPlayer == clickedPiece.player) {
                this.deselectPiece();
                return null;
            } else {
                /*
                //measure the distance between centers
                var xDistance = Math.abs(clickedPiece.cx.baseVal.value - this.selectedPiece.cx.baseVal.value);
                var yDistance = Math.abs(clickedPiece.cy.baseVal.value - this.selectedPiece.cy.baseVal.value);
                var pieceDistance = Math.sqrt(Math.pow(xDistance, 2) + Math.pow(yDistance, 2));
                if (pieceDistance < 105) {
                    var nextPieces = [[], []]; //nextPieces: 0th list will be blue, 1th red
                    var boardSvg = containerElement.lastChild;
                    var boardElements = boardSvg.childNodes;
                    for (var i = 0; i < boardElements.length; i++) {
                        if (boardElements[i] == this.selectedPiece) {
                            nextPieces[this.selectedPiece.player].push([(clickedPiece.cx.baseVal.value - 50) / 100, (clickedPiece.cy.baseVal.value - 50) / 100]);
                        } else if (boardElements[i] != clickedPiece && boardElements[i].player != undefined) {
                            var piece = boardElements[i];
                            nextPieces[piece.player].push([(piece.cx.baseVal.value - 50)/100, (piece.cy.baseVal.value - 50) / 100]);
                        }
                    }
                    this.deselectPiece();
                    return new Clobber(this.position.width, this.position.height, nextPieces);
                    
                } else {
                    this.deselectPiece();
                    return null;
                }
                */
                var nextPosition = this.getNextPositionFromPieceLocations(this.selectedPiece, clickedPiece, containerElement);
                this.deselectPiece();
                return nextPosition;
            }
        }
    }
}); //end of InteractiveSVGClobberView

var InteractiveSVGReverseClobberView = Class.create(InteractiveSVGClobberView, {
    
    /**
     * Handles a mouse click.
     */
    getNextPositionFromClick: function(event, currentPlayer, containerElement) {
        var clickedPiece = event.target;
        if (this.selectedPiece == undefined) {
            //select the clicked piece, if appropriate
            if (currentPlayer == clickedPiece.player) {
                this.selectPiece(clickedPiece);
            }
            return null; //no new move from this
        } else {
            if (currentPlayer == clickedPiece.player) {
                this.deselectPiece();
                return null;
            } else {
                //measure the distance between centers
                //console.log(clickedPiece.cx.baseVal.value + ", " + this.selectedPiece.cx.baseVal.value);
                var xDistance = Math.abs(clickedPiece.cx.baseVal.value - this.selectedPiece.cx.baseVal.value);
                var yDistance = Math.abs(clickedPiece.cy.baseVal.value - this.selectedPiece.cy.baseVal.value);
                var pieceDistance = Math.sqrt(Math.pow(xDistance, 2) + Math.pow(yDistance, 2));
                if (pieceDistance < 105) {
                    var nextPieces = [[], []]; //nextPieces: 0th list will be blue, 1th red
                    var boardSvg = containerElement.lastChild;
                    var boardElements = boardSvg.childNodes;
                    for (var i = 0; i < boardElements.length; i++) {
                        if (boardElements[i] == this.selectedPiece) {
                            //add nothing!
                        } else if (boardElements[i].player != undefined) {
                            var piece = boardElements[i];
                            nextPieces[piece.player].push([(piece.cx.baseVal.value - 50)/100, (piece.cy.baseVal.value - 50) / 100]);
                        }
                    }
                    this.deselectPiece();
                    return new ReverseClobber(this.position.width, this.position.height, nextPieces);
                    
                } else {
                    this.deselectPiece();
                    return null;
                }
            }
        }
    }
}); //end of InteractiveSVGReverseClobberView

/**
 * View Factory
 */
var InteractiveClobberViewFactory = Class.create({
    /**
     * Constructor
     */
    initialize: function(isReverse) {
        this.isReverse = isReverse || false;
    }
    
    ,/**
     * Returns an interactive view
     */
    getInteractiveBoard: function(position) {
        if (this.isReverse) {
            return new InteractiveSVGReverseClobberView(position);
        } else {
            return new InteractiveSVGClobberView(position);
        }
    }
    
    ,/**
     * Returns a view.
     */
    getView: function(position) {
        return this.getInteractiveBoard(position);
    }
    
}); //end of InteractiveClobberViewFactory


/******************* end of Clobber & Variants **********************/

/**
 * Controller for game play.
 * TODO: change viewElementId to viewElement
 */
var Referee = Class.create({
    initialize: function(position, players, viewFactory, viewElementId, messageContainer, optionsPanel) {
        this.viewFactory = viewFactory;
        this.position = position;
        this.players = players; //TODO: clone players?
        viewElementId = viewElementId || "gameBoard";
        this.viewElement = document.getElementById(viewElementId);
        this.currentPlayer = CombinatorialGame.prototype.LEFT;
        this.messageContainer = messageContainer || document.createElement("p"); 
        this.optionsPanel = optionsPanel || document.createElement("p");
        
        this.setOptionsAbleness(false);
        this.setStringMessage(this.position.playerNames[this.currentPlayer] + " goes first.");
        this.view = this.viewFactory.getView(this.position);
        if (!this.players[this.currentPlayer].hasView()) {
            this.view.draw(this.viewElement);
        }
        console.log("In ref!");
        this.requestNextMove();
    }
    
    ,/**
     * Determines whether the options will be enabled.
     */
    setOptionsAbleness: function(areEnabled) {
        var areDisabled = !areEnabled;
        var descendants = Element.descendants(this.optionsPanel);
        for (var i = 0; i < descendants.length; i++) {
            descendants[i].disabled = areDisabled;
        }
    }
    
    ,/**
     * Sets the message to players.
     */
    setStringMessage: function(message) {
        this.messageContainer.innerHTML = message;
    }
    
    ,/**
     * Gets the element that contains the view for this.
     */
    getViewContainer: function() {
        return this.viewElement;
    }
    
    ,/**
     * Sets fields.
     */
    moveTo: function(option) {
        if (this.position.hasOption(this.currentPlayer, option)) {
            this.position = option;
            this.currentPlayer = 1 - this.currentPlayer;
            if (!this.players[this.currentPlayer].hasView()) {
                this.view = this.viewFactory.getView(this.position);
                this.view.draw(this.viewElement);
            }
            if (this.position.getOptionsForPlayer(this.currentPlayer).length == 0) {
                this.setStringMessage("There are no moves for " + this.position.playerNames[this.currentPlayer] + ".  " + this.position.playerNames[1-this.currentPlayer] + " wins!");
                this.setOptionsAbleness(true);
            } else {
                //TODO: globals for debugging!
                /*
                curP = this.currentPlayer;
                gameState = this.position;
                moves = this.position.getOptionsForPlayer(this.currentPlayer);
                */
                this.setStringMessage("It's " + this.position.playerNames[this.currentPlayer] + "'s turn.");
            }
            this.requestNextMove();
        } else {
            if (option != null) {
                console.log("Tried to move to a non-option, stored in global debugVar");
                debugVar = option;
            }
        }
    }
    
    ,/**
     * Requests the next move.
     */
    requestNextMove: function() {
        var self = this;
        //perform a delayed call so that the display will redraw
        window.setTimeout(function() {self.requestNextMoveHelper();}, 20);
    }
    
    /**
     * Helper for requestNextMove
     */
    ,requestNextMoveHelper: function() {
        this.players[this.currentPlayer].givePosition(this.currentPlayer, this.position, this);
    }
}); //end of Referee

/**
 * A human interactive player.
 */
var HumanPlayer = Class.create({
    /**
     * Constructor
     */
    initialize: function(viewFactory) { 
        this.viewFactory = viewFactory;
    }
    
    /**
     * Whether this uses a view.
     */
    ,hasView: function() {
        return true;
    }
    
    /**
     * Returns the view.
     */
    ,getView: function() {
        return this.view;
    }
    
    /**
     * Chooses a move.
     */
    ,givePosition: function(playerIndex, position, referee) {
        this.playerIndex = playerIndex;
        this.position = position;
        this.referee = referee;
        this.view = this.viewFactory.getInteractiveBoard(position);
        this.view.draw(this.referee.getViewContainer(), this);
    }
   
    /**
     * Handle a mouse click, possibly getting a new position.
     */
    ,handleClick: function(event) {
        var option = this.view.getNextPositionFromClick(event, this.playerIndex, this.referee.getViewContainer(), this);
        this.sendMoveToRef(option);
        console.log("Human sent move to the ref.");
    }
    
    /**
     * Sends a move to the Referee.  Confirms that option is a legal move.
     */
    ,sendMoveToRef: function(option) {
        if (option == null || option == undefined) {
            return;
        } else if (this.position.hasOption(this.playerIndex, option)) {
            this.referee.moveTo(option);
        } else {
            //TODO: comment this out for production
            console.log("Tried to move to a non-option, child stored in global childGame; parent stored in global parentGame");
            childGame = option;
            parentGame = this.position;
            return;
        }
    }
    
    /**
     * toString
     */
    ,toString: function() {
        return "A Human player.";
    }
}); //end of HumanPlayer

/**
 * Abstract class for an automated player.
 */
var ComputerPlayer = Class.create({
   
    /**
     * Handle a mouse click, possibly getting a new position.
     */
    handleClick: function(event) { /*do nothing */ }
    
    ,hasView: function() {
        return false;
    }
    
}); //end of Computer Player

/**
 *  
 */
var RandomPlayer = Class.create(ComputerPlayer, {
    /**
     * Constructor
     * The delay doesn't work!  There's no way to pause a fruitful function.
     */
    initialize: function(delay) {
        this.delayMilliseconds = delay;
    }
    
    /**
     * Chooses a move.
     */
    ,givePosition: function(playerIndex, position, referee) {
        //var arrayForSemaphore = [false]; //use an array so we can pass by reference
        var options = position.getOptionsForPlayer(playerIndex);
        var randomIndex = Math.floor(Math.random() * options.length);
        window.setTimeout(function(){referee.moveTo(options[randomIndex]);/*arrayForSemaphore[0] = true;*/}, this.delayMilliseconds);
        //while (!arrayForSemaphore[0]) { /* do nothing */}
        //return options[randomIndex];
    }
    
}); //end of RandomPlayer



/**
 *  Updated Brute-Force AI to play games.  This one will look for both wins (to head towards) and losses (to avoid).
 */
var DepthSearchPlayer = Class.create(ComputerPlayer, {
    /**
     * Constructor
     * The delay doesn't work!  There's no way to pause a fruitful function.
     */
    initialize: function(delay, maxDepth) {
        this.delayMilliseconds = delay;
        this.maxDepth = maxDepth;
    }
    
    /**
     * Chooses a move.
     */
    ,givePosition: function(playerIndex, position, referee) {
        var winningMove = this.getWinningMove(playerIndex, position);
        var option;
        if (winningMove != null) {
            option = winningMove;
            console.log("Found a winning move!");
        } else {
            var options = position.getOptionsForPlayer(playerIndex);
            var randomIndex = Math.floor(Math.random() * options.length);
            option = options[randomIndex];
        }
        window.setTimeout(function(){referee.moveTo(option);}, this.delayMilliseconds);
    }
    
    /**
     * Returns a subset of moves.  If I can find a winning move, I return that one.  Otherweise, if I find moves that don't lead to death, then I return
    
    ,/**
     * Returns a winning move.
     */
    getWinningMove: function(playerIndex, position) {
        var options = position.getOptionsForPlayer(playerIndex);
        var opponentHasWinningMove = false;
        for (var i = 0; i < options.length; i++) {
            var option = options[i];
            var otherWins = this.playerCanWin(1 - playerIndex, option, 1);
            if (otherWins == "maybe") {
                //do nothing
            } else if (otherWins == false) {
                return option;
            }
        }
        return null;
    }
    
    ,/**
     * Returns whether a player can win, given the depth.  Can return a boolean or "maybe".
     */
    playerCanWin: function(playerIndex, position, depth) {
        if (depth > this.maxDepth) {
            //console.log("Hit max search depth.");
            return "maybe";
        }
        var maybeWins = false;
        var options = position.getOptionsForPlayer(playerIndex);
        for (var i = 0; i < options.length; i++) {
            var option = options[i];
            var otherWins = this.playerCanWin(1-playerIndex, option, depth + 1);
            if (otherWins == "maybe") {
                maybeWins = true;
            } else if (!otherWins) {
                return true;
            }
        }
        if (maybeWins) {
            return "maybe";
        } else {
            return false;
        }
        
    }
    
});

/**
 *  Brute-Force AI to play games.
 */
var DepthSearchPlayer = Class.create(ComputerPlayer, {
    /**
     * Constructor
     * The delay doesn't work!  There's no way to pause a fruitful function.
     */
    initialize: function(delay, maxDepth) {
        this.delayMilliseconds = delay;
        this.maxDepth = maxDepth;
    }
    
    /**
     * Chooses a move.
     */
    ,givePosition: function(playerIndex, position, referee) {
        var winningMove = this.getWinningMove(playerIndex, position);
        var option;
        if (winningMove != null) {
            option = winningMove;
            console.log("Found a winning move!");
        } else {
            var options = position.getOptionsForPlayer(playerIndex);
            var randomIndex = Math.floor(Math.random() * options.length);
            option = options[randomIndex];
        }
        window.setTimeout(function(){referee.moveTo(option);}, this.delayMilliseconds);
    }
    
    ,/**
     * Returns a winning move.
     */
    getWinningMove: function(playerIndex, position) {
        var options = position.getOptionsForPlayer(playerIndex);
        var opponentHasWinningMove = false;
        for (var i = 0; i < options.length; i++) {
            var option = options[i];
            var otherWins = this.playerCanWin(1 - playerIndex, option, 1);
            if (otherWins == "maybe") {
                //do nothing
            } else if (otherWins == false) {
                return option;
            }
        }
        return null;
    }
    
    ,/**
     * Returns whether a player can win, given the depth.  Can return a boolean or "maybe".
     */
    playerCanWin: function(playerIndex, position, depth) {
        if (depth > this.maxDepth) {
            //console.log("Hit max search depth.");
            return "maybe";
        }
        var maybeWins = false;
        var options = position.getOptionsForPlayer(playerIndex);
        for (var i = 0; i < options.length; i++) {
            var option = options[i];
            var otherWins = this.playerCanWin(1-playerIndex, option, depth + 1);
            if (otherWins == "maybe") {
                maybeWins = true;
            } else if (!otherWins) {
                return true;
            }
        }
        if (maybeWins) {
            return "maybe";
        } else {
            return false;
        }
        
    }
    
});

/**
 * Gets a radio group of buttons for a player's controller options.
 */
function getRadioPlayerOptions(playerId) {
    var playerName;
    var defaultIndex;
    if (playerId == CombinatorialGame.prototype.LEFT) {
        playerName = "left";
        defaultIndex = 0;
    } else if (playerId == CombinatorialGame.prototype.RIGHT) {
        playerName = "right";
        defaultIndex = 2;
    } else {
        console.log("getRadioPlayerOptions got an incorrect playerId");
    }
    return createRadioGroup(playerName + "Player",  ["Human", "Random", "Easy AI", "Medium AI", "Hard AI (very slow)"], defaultIndex); // "Professional (hangs your browser)"
}

/**
 * Gets an HTML Element for 1-d board sizes.
 */
function createBasicOneDimensionalSizeOptions(minSize, maxSize, defaultSize) {  
    defaultSize = defaultSize || (minSize + maxSize) / 2;
    
    var container = document.createElement("div");
    
    var sizeElement = document.createDocumentFragment();
    var sizeRange = createRangeInput(minSize, maxSize, defaultSize, "boardSize");
    container.appendChild(createGameOptionDiv("Size", sizeRange));
    
    //duplicated code from createBasicGridGameOptions
    var leftPlayerElement = document.createDocumentFragment();
    leftPlayerElement.appendChild(document.createTextNode("(Blue plays first.)"));
    leftPlayerElement.appendChild(document.createElement("br"));
    var leftRadio = getRadioPlayerOptions(CombinatorialGame.prototype.LEFT);
    leftPlayerElement.appendChild(leftRadio);
    container.appendChild(createGameOptionDiv("Blue:", leftPlayerElement));
    
    var rightRadio = getRadioPlayerOptions(CombinatorialGame.prototype.RIGHT);
    container.appendChild(createGameOptionDiv("Red:", rightRadio));
    
    var startButton = document.createElement("input");
    startButton.type = "button";
    startButton.id = "starter";
    startButton.value = "Start Game";
    startButton.onclick = newGame;
    container.appendChild(startButton);
    //end duplicated code.
    
    return container;
}

/**
 * Gets an HTML Element containing the basic game options for a 2-dimensional grid.
 */
function createBasicGridGameOptions(minWidth, maxWidth, defaultWidth, minHeight, maxHeight, defaultHeight) {
    //do some normalization for games with only one size parameter (e.g. Atropos)
    minHeight = minHeight || minWidth;
    maxHeight = maxHeight || maxWidth;
    defaultHeight = defaultHeight || defaultWidth;
    
    var container = document.createElement("div");
    
    var widthElement = document.createDocumentFragment();
    var widthRange = createRangeInput(minWidth, maxWidth, defaultWidth, "boardWidth");
    container.appendChild(createGameOptionDiv("Width", widthRange));
    
    var heightElement = document.createDocumentFragment();
    var heightRange = createRangeInput(minHeight, maxHeight, defaultHeight, "boardHeight");
    container.appendChild(createGameOptionDiv("Height", heightRange));
    
    var leftPlayerElement = document.createDocumentFragment();
    leftPlayerElement.appendChild(document.createTextNode("(Blue plays first.)"));
    leftPlayerElement.appendChild(document.createElement("br"));
    var leftRadio = getRadioPlayerOptions(CombinatorialGame.prototype.LEFT);
    leftPlayerElement.appendChild(leftRadio);
    container.appendChild(createGameOptionDiv("Blue:", leftPlayerElement));
    
    var rightRadio = getRadioPlayerOptions(CombinatorialGame.prototype.RIGHT);
    container.appendChild(createGameOptionDiv("Red:", rightRadio));
    
    var startButton = document.createElement("input");
    startButton.type = "button";
    startButton.id = "starter";
    startButton.value = "Start Game";
    startButton.onclick = newGame;
    container.appendChild(startButton);
    
    return container;
}

/**
 * Creates an input range element.
 * TODO: move to paithanLibraries
 */
function createRangeInput(min, max, defaultValue, id) {
    var slider = new PaitSlider(min, max, 1, defaultValue, id);
    return slider.toElement();
    /*
    var range = document.createElement("input");
    range.type = "range";
    range.min = min;
    range.max = max;
    range.value = defaultValue;
    if (id != undefined) {
        range.id = id;
    }
    return range;
    */
}

/**
 * Creates a radio group.  Values will be indexes.
 * TODO: move to paithanLibraries
 */
function createRadioGroup(name, descriptions, initiallyCheckedIndex) {
    var fragment = document.createDocumentFragment();
    for (var i = 0; i < descriptions.length; i++) {
        var radio = document.createElement("input");
        radio.type = "radio";
        radio.name = name;
        radio.value = i;
        if (i==initiallyCheckedIndex) {
            radio.checked = true;
        }
        fragment.appendChild(radio);
        fragment.appendChild(document.createTextNode(descriptions[i]));
        fragment.appendChild(document.createElement("br"));
    }
    return fragment;
}

/**
 * Creates a game option control Element.
 */
function createGameOptionDiv(titleString, inputElement) {
    var gameOption = document.createElement("div");
    gameOption.className = "gameOption";
    var titleElement = document.createElement("div");
    gameOption.appendChild(titleElement);
    titleElement.className = "controlTitle";
    titleElement.appendChild(document.createTextNode(titleString));
    gameOption.appendChild(inputElement);
    return gameOption;
}

/**
 * Shows the rules for the game.
 */
function showRules(event) {
    $('rules').appendChild(document.createTextNode(rulesText));
    event.target.onclick = hideRules;
    event.target.innerHTML = "Hide Rules";
}

/**
 * Hides the rules for the current game.
 */
function hideRules(event) {
    removeAllChildren($('rules'));
    event.target.onclick = showRules;
    event.target.innerHTML = "Show";
}

