/**
 * Contains Classes and functions for use with Combinatorial Games.
 *
 * author: Kyle Webster Burke, paithanq@gmail.com
 * This software is licensed under the MIT License:
The MIT License (MIT)

Copyright (c) 2021 Kyle W. Burke

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
        if (position == null || position === undefined) {
            return false;
        }
        var options = this.getOptionsForPlayer(player);
        // console.log("Player " + player + " has " + options.length + " options.");
        for (var i = 0; i < options.length; i++) {
            // console.log("The option is: " + options[i]);
            if (options[i].equals(position)) return true;
        }
        return false;
    }

    /**
     * Returns a simplified form of this game, which must be equivalent.  This should be implemented in subclasses to improve performance for dynamic-programming AIs I haven't written yet. :-P
     */
    ,simplify: function() {
        return this.clone();
    }

    /**
     * Gets the player's identity (Blue/Black/Vertical/etc) as a string.
     */
    ,getPlayerName: function(playerIndex) {
        return this.__proto__.PLAYER_NAMES[playerIndex];
    }


});
//declare constants
CombinatorialGame.prototype.LEFT = 0;
CombinatorialGame.prototype.RIGHT = 1;
CombinatorialGame.prototype.PLAYER_NAMES = ["Left", "Right"];


//end of CombinatorialGame

var NoGo = Class.create(CombinatorialGame, {

    /**
     * Constructor.  Creates a distance game on a grid where you aren't allowed to play at the sameDistances or differentDistances.  Either columnsOrWidth are both natural numbers as the dimensions, or height is undefined and columnsOrWidth is the columns to copy.
     */
    initialize: function(columnsOrWidth, height) {
        this.UNCOLORED = 2;
        if (height === undefined) {
            //no fourth parameter, so columnsOrWidth represents the columns.
            this.columns = columnsOrWidth; //this will get replaced shortly
            this.columns = this.cloneColumns(columnsOrWidth);
        } else {
            this.columns = [];
            for (var i = 0; i < columnsOrWidth; i++) {
                var column = [];
                this.columns.push(column);
                for (var j = 0; j < height; j++) {
                    column.push(this.UNCOLORED);
                }
            }
        }
        this.playerNames = ["Black", "White"];
    }

    /**
     * Clones the columns.
     */
    ,cloneColumns: function(columns) {
        var columnsClone = [];
        for (var i = 0; i < this.getWidth(); i++) {
            var columnClone = [];
            columnsClone.push(columnClone);
            for (var j = 0; j < this.getHeight(); j++) {
                columnClone.push(columns[i][j]);
            }
        }
        return columnsClone;
    }

    /**
     * Clones this.
     */
    ,clone: function() {
        return new NoGo(this.columns);
    }

    /**
     * Returns the width of this board.
     */
    ,getWidth: function() {
        return this.columns.length;
    }

    /**
     * Returns the height of this board.
     */
    ,getHeight: function() {
        if (this.getWidth() == 0) {
            return 0;
        } else {
            return this.columns[0].length;
        }
    }

    /**
     * Equals!
     */
    ,equals: function(other) {
        //check that the dimensions match
        if (this.getWidth() != other.getWidth() || this.getHeight() != other.getHeight()) {
            return false;
        }
        //now check that all the cells are equal
        for (var col = 0; col < this.columns.length; col++) {
            for (var row = 0; row < this.columns[col].length; row++) {
                if (this.columns[col][row] != other.columns[col][row]) {
                    return false;
                }
            }
        }
        return true;
    }

    /**
     * Returns a list of all connected components.
     */
    ,getConnectedComponents: function() {
        var components = this.getConnectedComponentsWithColor(CombinatorialGame.prototype.LEFT);
        var rightComponents = this.getConnectedComponentsWithColor(CombinatorialGame.prototype.RIGHT);
        for (var i = 0; i < rightComponents.length; i++) {
            components.push(rightComponents[i]);
        }
        return components;
    }

    /**
     * Returns a list of lists of connected components of a color.
     */
    ,getConnectedComponentsWithColor: function(playerId) {
        //create a 2-d array of booleans
        var marked = [];
        for (var i = 0; i < this.getWidth(); i++) {
            var markedColumn = [];
            marked.push(markedColumn);
            for (var j = 0; j < this.getHeight(); j++) {
                markedColumn.push(false);
            }
        }

        var components = [];
        //go through each vertex, build a component around it if it's the right color and not marked
        for (var column = 0; column < this.getWidth(); column++) {
            for (var row = 0; row < this.getHeight(); row++) {
                if (!marked[column][row] && this.columns[column][row] == playerId) {
                    var component = [];
                    this.addToConnectedComponentAround(column, row, component, playerId, marked);
                    components.push(component);
                }
            }
        }
        return components;
    }

    /**
     * Returns the connected same-color component around a vertex.  Only
     */
    ,addToConnectedComponentAround: function(column, row, component, playerId, marked) {
        if (!marked[column][row] && this.columns[column][row] == playerId) {
            marked[column][row] = true;
            component.push([column, row]);

            //check the four neighboring vertices
            var neighborCol;
            var neighborRow;
            //check above
            if (row > 0) {
                neighborCol = column;
                neighborRow = row - 1;
                this.addToConnectedComponentAround(neighborCol, neighborRow, component, playerId, marked);
            }
            //check to the right
            if (column < this.getWidth() - 1) {
                neighborCol = column + 1;
                neighborRow = row;
                this.addToConnectedComponentAround(neighborCol, neighborRow, component, playerId, marked);
            }
            //check below
            if (row < this.getHeight() - 1) {
                neighborCol = column;
                neighborRow = row + 1;
                this.addToConnectedComponentAround(neighborCol, neighborRow, component, playerId, marked);
            }
            //check left
            if (column > 0) {
                neighborCol = column - 1;
                neighborRow = row;
                this.addToConnectedComponentAround(neighborCol, neighborRow, component, playerId, marked);
            }
        }
    }

    /**
     * Checks that all components have a liberty.
     */
    ,allComponentsHaveLiberty: function() {
        var components = this.getConnectedComponents();
        for (var i = 0; i < components.length; i++) {
            var component = components[i];
            if (!this.componentHasLiberty(component)) {
                return false;
            }
        }
        return true;
    }

    /**
     * Checks that a component has a liberty.
     */
    ,componentHasLiberty: function(component) {
        for (var i = 0; i < component.length; i++) {
            var vertex = component[i];
            var column = vertex[0];
            var row = vertex[1];
            //check the four neighbors
            //check above
            if (row > 0 && this.columns[column][row-1] == this.UNCOLORED) {
                return true;
            }
            //check right
            if (column < this.getWidth() -1 && this.columns[column+1][row] == this.UNCOLORED) {
                return true;
            }
            //check below
            if (row < this.getHeight() - 1 && this.columns[column][row+1] == this.UNCOLORED) {
                return true;
            }
            //check left
            if (column > 0 && this.columns[column-1][row] == this.UNCOLORED) {
                return true;
            }
        }
        return false;
    }

    /**
     * Gets the options.
     */
    ,getOptionsForPlayer: function(playerId) {
        var options = [];

        for (var column = 0; column < this.getWidth(); column ++) {
            for (var row = 0; row < this.getHeight(); row++) {
                if (this.columns[column][row] == this.UNCOLORED) {
                    if (this.isMoveLegal(column, row, playerId)) {
                        //the move is legal!  Let's put it in there! :)
                        var option = this.getOption(column, row, playerId);
                        options.push(option);
                    }
                }
            }
        }
        return options;
    }

    /**
     * Gets a single option.  This assumes that the move is legal.
     */
    ,getOption: function(column, row, playerId) {
        var option = this.clone();
        option.columns[column][row] = playerId;
        return option;
    }

    /**
     * Checks that changing the vertex at [column, row] to color is a legal move.
     */
    ,isMoveLegal: function(column, row, color) {
        //
        if (this.columns[column][row] != this.UNCOLORED) {
            return false;
        } else {
            //[column, row] is uncolored, good!
            var move = this.getOption(column, row, color);
            axe = this;
            return move.allComponentsHaveLiberty();
        }
    }

}); //end of NoGo class
NoGo.prototype.PLAYER_NAMES = ["Black", "White"];


var NoGoInteractiveView = Class.create({

    /**
     * Constructor.
     */
    initialize: function(position) {
        this.position = position;
    }

    /**
     * Draws the board.
     */
    ,draw: function(containerElement, listener) {
        //clear out the other children of the container element
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

        var width = this.position.getWidth();
        var height = this.position.getHeight();

        //get some dimensions based on the canvas size
        var maxCircleWidth = (boardPixelSize - 10) / width;
        var maxCircleHeight = (boardPixelSize - 10) / (height + 2);
        var maxDiameter = Math.min(maxCircleWidth, maxCircleHeight);
        var padPercentage = .2;
        var boxSide = maxDiameter;
        var nodeRadius = Math.floor(.5 * maxDiameter * (1-padPercentage));
        var nodePadding = Math.floor(maxDiameter * padPercentage);

        //draw the board
        for (var colIndex = 0; colIndex < width; colIndex++) {
            //draw the boxes in this column
            for (var rowIndex = 0; rowIndex < height; rowIndex ++) {
                var circle = document.createElementNS(svgNS,"circle");
                var centerX = 5 + Math.floor((colIndex + .5) * boxSide);
                circle.setAttributeNS(null, "cx", centerX);
                var centerY = 5 + Math.floor((rowIndex + .5) * boxSide);
                circle.setAttributeNS(null, "cy", centerY);
                circle.setAttributeNS(null, "r", nodeRadius);
                circle.style.stroke = "black";
                circle.style.strokeWidth = 5;
                if (this.position.columns[colIndex][rowIndex] == CombinatorialGame.prototype.LEFT) {
                    circle.style.fill = "black";
                } else if (this.position.columns[colIndex][rowIndex] == CombinatorialGame.prototype.RIGHT) {
                    circle.style.fill = "white";
                } else {
                    circle.style.fill = "gray";
                    if (listener != undefined) {
                        var player = listener;
                        //circle will be event.target, so give it some extra attributes.
                        circle.column = colIndex;
                        circle.row = rowIndex;
                        circle.onclick = function(event) {player.handleClick(event);}
                    }
                }
                boardSvg.appendChild(circle);
                //now add the edges
                if (colIndex < width - 1) {
                    var line = document.createElementNS(svgNS, "line");
                    line.setAttributeNS(null, "x1", centerX + nodeRadius);
                    line.setAttributeNS(null, "y1", centerY);
                    line.setAttributeNS(null, "x2", centerX + boxSide - nodeRadius);
                    line.setAttributeNS(null, "y2", centerY);
                    line.style.stroke = "black";
                    line.style.strokeWidth = 5;
                    boardSvg.appendChild(line);
                }
                if (rowIndex < height - 1) {
                    var line = document.createElementNS(svgNS, "line");
                    line.setAttributeNS(null, "x1", centerX);
                    line.setAttributeNS(null, "y1", centerY + nodeRadius);
                    line.setAttributeNS(null, "x2", centerX);
                    line.setAttributeNS(null, "y2", centerY + boxSide - nodeRadius);
                    line.style.stroke = "black";
                    line.style.strokeWidth = 5;
                    boardSvg.appendChild(line);
                }
            }
        }
    }

    /**
     * Handles the mouse click.
     */
    ,getNextPositionFromClick: function(event, currentPlayer, containerElement, player) {
        var column = event.target.column;
        var row = event.target.row;

        if (this.position.isMoveLegal(column, row, currentPlayer)) {
            var option = this.position.getOption(column, row, currentPlayer);
            player.sendMoveToRef(option);
        }
    }

}); //end of NoGoInteractiveView class

/**
 * View Factory for NoGo
 */
var NoGoInteractiveViewFactory = Class.create({
    /**
     * Constructor
     */
    initialize: function() {
    }

    /**
     * Returns an interactive view
     */
    ,getInteractiveBoard: function(position) {
        return new NoGoInteractiveView(position);
    }

    /**
     * Returns a view.
     */
    ,getView: function(position) {
        return this.getInteractiveBoard(position);
    }

}); //end of NoGoInteractiveViewFactory

/**
 * Launches a new NoGo game.
 */
function newNoGoGame() {
    var viewFactory = new NoGoInteractiveViewFactory();
    var playDelay = 1000;
    var playerOptions = getCommonPlayerOptions(viewFactory, playDelay, 1, 5);
    var width = parseInt($('boardWidth').value);
    var height = parseInt($('boardHeight').value);
    var controlForm = $('gameOptions');
    var leftPlayer = parseInt(getSelectedRadioValue(controlForm.elements['leftPlayer']));
    var rightPlayer =  parseInt(getSelectedRadioValue(controlForm.elements['rightPlayer']));
    var game = new NoGo(width, height);
    var players = [playerOptions[leftPlayer], playerOptions[rightPlayer]];
    var ref = new Referee(game, players, viewFactory, "MainGameBoard", $('messageBox'), controlForm);

}





var GridDistanceGame = Class.create(CombinatorialGame, {

    /**
     * Constructor.  Creates a distance game on a grid where you aren't allowed to play at the sameDistances or differentDistances.  Either columnsOrWidth are both natural numbers as the dimensions, or height is undefined and columnsOrWidth is the columns to copy.
     */
    initialize: function(sameDistances, differentDistances, columnsOrWidth, height) {
        this.UNCOLORED = 2;
        this.sameDistances = sameDistances || [];
        this.differentDistances = differentDistances || [];
        if (height === undefined) {
            //no fourth parameter, so columnsOrWidth represents the columns.
            this.columns = columnsOrWidth; //this will get replaced shortly
            this.columns = this.cloneColumns(columnsOrWidth);
        } else {
            this.columns = [];
            for (var i = 0; i < columnsOrWidth; i++) {
                var column = [];
                this.columns.push(column);
                for (var j = 0; j < height; j++) {
                    column.push(this.UNCOLORED);
                }
            }
        }
        this.playerNames = ["Blue", "Red"];
    }

    /**
     * Clones the columns.
     */
    ,cloneColumns: function(columns) {
        var columnsClone = [];
        for (var i = 0; i < this.getWidth(); i++) {
            var columnClone = [];
            columnsClone.push(columnClone);
            for (var j = 0; j < this.getHeight(); j++) {
                columnClone.push(columns[i][j]);
            }
        }
        return columnsClone;
    }

    /**
     * Clones this.
     */
    ,clone: function() {
        return new GridDistanceGame(this.sameDistances, this.differentDistances, this.columns);
    }

    /**
     * Returns the width of this board.
     */
    ,getWidth: function() {
        return this.columns.length;
    }

    /**
     * Returns the height of this board.
     */
    ,getHeight: function() {
        if (this.getWidth() == 0) {
            return 0;
        } else {
            return this.columns[0].length;
        }
    }

    /**
     * Equals!
     */
    ,equals: function(other) {
        //check that the dimensions match
        if (this.getWidth() != other.getWidth() || this.getHeight() != other.getHeight()) {
            return false;
        }
        //now check that all the cells are equal
        for (var col = 0; col < this.columns.length; col++) {
            for (var row = 0; row < this.columns[col].length; row++) {
                if (this.columns[col][row] != other.columns[col][row]) {
                    return false;
                }
            }
        }
        return true;
    }

    /**
     * Gets an array of all coordinates (2-tuple) that are at a given distance from the given coordinates on this board.
     */
    ,getDistanceCoordinatesFrom: function(column, row, distance) {
        var coordinates = [];
        //these will be laid out in a diamond from (column, row).

        //first do those along the top-right edge
        for (var i = 0; i < distance; i++) {
            var coordinate = [column + i, row - distance + i];
            if (coordinate[0] < this.getWidth() && coordinate[1] >= 0) {
                coordinates.push(coordinate);
            }
        }
        //now the bottom-right edge
        for (var i = 0; i < distance; i++) {
            var coordinate = [column + distance - i, row + i];
            if (coordinate[0] < this.getWidth() && coordinate[1] < this.getHeight()) {
                coordinates.push(coordinate);
            }
        }
        //now the bottom-left edge
        for (var i = 0; i < distance; i++) {
            var coordinate = [column - i, row + distance - i];
            if (coordinate[0] >= 0 && coordinate[1] < this.getHeight()) {
                coordinates.push(coordinate);
            }
        }
        //now the top-left edge
        for (var i = 0; i < distance; i++) {
            var coordinate = [column - distance + i, row - i];
            if (coordinate[0] >= 0 && coordinate[1] >= 0) {
                coordinates.push(coordinate);
            }
        }
        return coordinates;
    }

    /**
     * Gets the options.
     */
    ,getOptionsForPlayer: function(playerId) {
        var options = [];

        for (var column = 0; column < this.getWidth(); column ++) {
            for (var row = 0; row < this.getHeight(); row++) {
                if (this.columns[column][row] == this.UNCOLORED) {
                    if (this.isMoveLegal(column, row, playerId)) {
                        //the move is legal!  Let's put it in there! :)
                        var option = this.getOption(column, row, playerId);
                        options.push(option);
                    }
                }
            }
        }
        return options;
    }

    /**
     * Gets a single option.  This assumes that the move is legal.
     */
    ,getOption: function(column, row, playerId) {
        var option = this.clone();
        option.columns[column][row] = playerId;
        return option;
    }

    /**
     * Checks that changing the vertex at [column, row] to color is a legal move.
     */
    ,isMoveLegal: function(column, row, color) {
        //
        if (this.columns[column][row] != this.UNCOLORED) {
            return false;
        } else {
            //[column, row] is uncolored, good!

            //now check that the vertices at the illegal same distances have a different color
            for (var i = 0; i < this.sameDistances; i++) {
                var distance = this.sameDistances[i];
                var coordinates = this.getDistanceCoordinatesFrom(column, row, distance);
                for (var j = 0; j < coordinates.length; j++) {
                    var coordinate = coordinates[j];
                    var colorAtCoordinate = this.columns[coordinate[0]][coordinate[1]];
                    //make sure none of these have the same color  (color won't be uncolored, so we're safe there too!)
                    if (colorAtCoordinate == color) {
                        return false;
                    }
                }
            }

            //now check that it doesn't have a different color from the illegal different distances
            for (var i = 0; i < this.differentDistances; i++) {
                var distance = this.differentDistances[i];
                var coordinates = this.getDistanceCoordinatesFrom(column, row, distance);
                for (var j = 0; j < coordinates.length; j++) {
                    var coordinate = coordinates[j];
                    var colorAtCoordinate = this.columns[coordinate[0]][coordinate[1]];
                    //make sure none of these have the same color  (color won't be uncolored, so we're safe there too!)
                    if (colorAtCoordinate != this.UNCOLORED && colorAtCoordinate != color) {
                        return false;
                    }
                }
            }
            return true;
        }
    }

}); //end of GridDistanceGame class
GridDistanceGame.prototype.PLAYER_NAMES = ["Blue", "Red"];


var GridDistanceGameInteractiveView = Class.create({

    /**
     * Constructor.
     */
    initialize: function(position) {
        this.position = position;
    }

    /**
     * Draws the board.
     */
    ,draw: function(containerElement, listener) {
        //clear out the other children of the container element
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

        var width = this.position.getWidth();
        var height = this.position.getHeight();

        //get some dimensions based on the canvas size
        var maxCircleWidth = (boardPixelSize - 10) / width;
        var maxCircleHeight = (boardPixelSize - 10) / (height + 2);
        var maxDiameter = Math.min(maxCircleWidth, maxCircleHeight);
        var padPercentage = .2;
        var boxSide = maxDiameter;
        var nodeRadius = Math.floor(.5 * maxDiameter * (1-padPercentage));
        var nodePadding = Math.floor(maxDiameter * padPercentage);

        //draw the board
        for (var colIndex = 0; colIndex < width; colIndex++) {
            //draw the boxes in this column
            for (var rowIndex = 0; rowIndex < height; rowIndex ++) {
                var circle = document.createElementNS(svgNS,"circle");
                var centerX = 5 + Math.floor((colIndex + .5) * boxSide);
                circle.setAttributeNS(null, "cx", centerX);
                var centerY = 5 + Math.floor((rowIndex + .5) * boxSide);
                circle.setAttributeNS(null, "cy", centerY);
                circle.setAttributeNS(null, "r", nodeRadius);
                circle.style.stroke = "black";
                circle.style.strokeWidth = 5;
                if (this.position.columns[colIndex][rowIndex] == CombinatorialGame.prototype.LEFT) {
                    circle.style.fill = "blue";
                } else if (this.position.columns[colIndex][rowIndex] == CombinatorialGame.prototype.RIGHT) {
                    circle.style.fill = "red";
                } else {
                    circle.style.fill = "white";
                    if (listener != undefined) {
                        var player = listener;
                        //circle will be event.target, so give it some extra attributes.
                        circle.column = colIndex;
                        circle.row = rowIndex;
                        circle.onclick = function(event) {player.handleClick(event);}
                    }
                }
                boardSvg.appendChild(circle);
                //now add the edges
                if (colIndex < width - 1) {
                    var line = document.createElementNS(svgNS, "line");
                    line.setAttributeNS(null, "x1", centerX + nodeRadius);
                    line.setAttributeNS(null, "y1", centerY);
                    line.setAttributeNS(null, "x2", centerX + boxSide - nodeRadius);
                    line.setAttributeNS(null, "y2", centerY);
                    line.style.stroke = "black";
                    line.style.strokeWidth = 5;
                    boardSvg.appendChild(line);
                }
                if (rowIndex < height - 1) {
                    var line = document.createElementNS(svgNS, "line");
                    line.setAttributeNS(null, "x1", centerX);
                    line.setAttributeNS(null, "y1", centerY + nodeRadius);
                    line.setAttributeNS(null, "x2", centerX);
                    line.setAttributeNS(null, "y2", centerY + boxSide - nodeRadius);
                    line.style.stroke = "black";
                    line.style.strokeWidth = 5;
                    boardSvg.appendChild(line);
                }
            }
        }
    }

    /**
     * Handles the mouse click.
     */
    ,getNextPositionFromClick: function(event, currentPlayer, containerElement, player) {
        var column = event.target.column;
        var row = event.target.row;

        if (this.position.isMoveLegal(column, row, currentPlayer)) {
            var option = this.position.getOption(column, row, currentPlayer);
            player.sendMoveToRef(option);
        }
    }

}); //end of GridDistanceGameInteractiveView class

/**
 * View Factory for BinaryGeography
 */
var GridDistanceGameInteractiveViewFactory = Class.create({
    /**
     * Constructor
     */
    initialize: function() {
    }

    /**
     * Returns an interactive view
     */
    ,getInteractiveBoard: function(position) {
        return new GridDistanceGameInteractiveView(position);
    }

    /**
     * Returns a view.
     */
    ,getView: function(position) {
        return this.getInteractiveBoard(position);
    }

}); //end of GridDistanceGameInteractiveViewFactory

/**
 * Launches a new Col game.
 */
function newColGame() {
    var viewFactory = new GridDistanceGameInteractiveViewFactory();
    var playDelay = 1000;
    var playerOptions = getCommonPlayerOptions(viewFactory, playDelay, 1, 5);
    var width = parseInt($('boardWidth').value);
    var height = parseInt($('boardHeight').value);
    var controlForm = $('gameOptions');
    var leftPlayer = parseInt(getSelectedRadioValue(controlForm.elements['leftPlayer']));
    var rightPlayer =  parseInt(getSelectedRadioValue(controlForm.elements['rightPlayer']));
    var game = new GridDistanceGame([1], [], width, height);
    var players = [playerOptions[leftPlayer], playerOptions[rightPlayer]];
    var ref = new Referee(game, players, viewFactory, "MainGameBoard", $('messageBox'), controlForm);

}


//TODO: make a SquareGridGame class that all these grid games inherit from.


///////////////////////////// Binary Geography ////////////////////////////////

/**
 * Binary Geography, the impartial version.
 *
 * Grid is stored as a 2D array of booleans.
 * @author Kyle Burke
 */
var BinaryGeography = Class.create(CombinatorialGame, {

    /**
     * Constructor.
     */
    initialize: function(height, width, blackStartColumn, blackStartRow, whiteStartColumn, whiteStartRow) {

        this.EMPTY = 0;
        this.BLACK = 1;
        this.WHITE = -1;
        this.playerNames = ["Left", "Right"];
        if (blackStartColumn == null) {
            blackStartColumn = Math.floor(Math.random() * height);
        }
        if (blackStartRow == null) {
            blackStartRow = Math.floor(Math.random() * width);
        }
        if (whiteStartColumn == null) {
            whiteStartColumn = Math.floor(Math.random() * height);
        }
        if (whiteStartRow == null) {
            whiteStartRow = Math.floor(Math.random() * width);
        }
        while (whiteStartColumn == blackStartColumn && whiteStartRow == blackStartRow) {
            whiteStartColumn = Math.floor(Math.random() * height);
            whiteStartRow = Math.floor(Math.random() * width);
        }

        this.lastBlackColumn = blackStartColumn;
        this.lastBlackRow = blackStartRow;
        this.lastWhiteColumn = whiteStartColumn;
        this.lastWhiteRow = whiteStartRow;

        this.columns = new Array();
        for (var colI = 0; colI < width; colI++) {
            var column = new Array();
            for (var rowI = 0; rowI < height; rowI++) {
                column.push(this.EMPTY);
            }
            this.columns.push(column);
        }
        this.columns[blackStartColumn][blackStartRow] = this.BLACK;
        this.columns[whiteStartColumn][whiteStartRow] = this.WHITE;
    }

    /**
     * Returns the width of this board.
     */
    ,getWidth: function() {
        return this.columns.length;
    }

    /**
     * Returns the height of this board.
     */
    ,getHeight: function() {
        if (this.getWidth() == 0) {
            return 0;
        } else {
            return this.columns[0].length;
        }
    }

    /**
     * Equals!
     */
    ,equals: function(other) {
        //check that the dimensions match
        if (this.getWidth() != other.getWidth() || this.getHeight() != other.getHeight()) {
            return false;
        }
        //now check that all the cells are equal
        for (var col = 0; col < this.columns.length; col++) {
            for (var row = 0; row < this.columns[col].length; row++) {
                if (this.columns[col][row] != other.columns[col][row]) {
                    return false;
                }
            }
        }
        return true;
    }

    /**
     * Clone.
     */
    ,clone: function() {
        var width = this.getWidth();
        var height = this.getHeight();
        var other = new BinaryGeography(height, width);
        for (var col = 0; col < width; col++) {
            for (var row = 0; row < height; row++) {
                other.columns[col][row] = this.columns[col][row];
            }
        }
        other.lastBlackColumn = this.lastBlackColumn;
        other.lastBlackRow = this.lastBlackRow;
        other.lastWhiteColumn = this.lastWhiteColumn;
        other.lastWhiteRow = this.lastWhiteRow;
        return other;
    }

    /**
     * Gets the options.
     */
    ,getOptionsForPlayer: function(playerId) {
        var options = new Array();
        //options for adding to the black path
        var lastTokens = [[this.lastBlackColumn, this.lastBlackRow], [this.lastWhiteColumn, this.lastWhiteRow]];
        for (var i = 0; i < lastTokens.length; i++) {
            var color = (i * -2) + 1; //to get BLACK or WHITE
            var token = lastTokens[i];
            var col = token[0];
            var row = token[1];
            var nextTokens = [[col - 1, row], [col, row - 1], [col + 1, row], [col, row + 1]];
            for (var j = 0; j < nextTokens.length; j++) {
                var nextToken = nextTokens[j];
                var nextCol = nextToken[0];
                var nextRow = nextToken[1];
                //check to see whether we can add this option
                if (0 <= nextCol && nextCol < this.getWidth() && 0 <= nextRow && nextRow < this.getHeight() && this.columns[nextCol][nextRow] == this.EMPTY) {
                    //we can add this option!  Do it!
                    var option = this.getOption(color, nextCol, nextRow);
                    options.push(option);
                }
            }
        }
        return options;
    }

    /**
     * Gets the result of a play.  (This is not a required (inheriting) function.)
     */
    ,getOption: function(color, column, row) {
        var option = this.clone();
        option.columns[column][row] = color;
        if (color == this.BLACK) {
            option.lastBlackColumn = column;
            option.lastBlackRow = row;
        } else {
            option.lastWhiteColumn = column;
            option.lastWhiteRow = row;
        }
        return option;
    }

}); //end of BinaryGeography class




var InteractiveBinaryGeographyView = Class.create({

    /**
     * Constructor.
     */
    initialize: function(position) {
        this.position = position;
    }

    /**
     * Draws the board.
     */
    ,draw: function(containerElement, listener) {
        //clear out the other children of the container element
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

        var width = this.position.getWidth();
        var height = this.position.getHeight();

        //get some dimensions based on the canvas size
        var maxCircleWidth = (boardPixelSize - 10) / width;
        var maxCircleHeight = (boardPixelSize - 10) / (height + 2);
        var maxDiameter = Math.min(maxCircleWidth, maxCircleHeight);
        var padPercentage = .2;
        var boxSide = maxDiameter;
        var nodeRadius = Math.floor(.5 * maxDiameter * (1-padPercentage));
        var nodePadding = Math.floor(maxDiameter * padPercentage);

        //draw the board
        for (var colIndex = 0; colIndex < width; colIndex++) {
            //draw the boxes in this column
            for (var rowIndex = 0; rowIndex < height; rowIndex ++) {
                var circle = document.createElementNS(svgNS,"circle");
                circle.setAttributeNS(null, "cx", 5 + Math.floor((colIndex + .5) * boxSide));
                circle.setAttributeNS(null, "cy", 5 + Math.floor((rowIndex + .5) * boxSide));
                circle.setAttributeNS(null, "r", nodeRadius);
                circle.style.stroke = "black";
                circle.style.strokeWidth = 5;
                if ((colIndex == this.position.lastBlackColumn && rowIndex == this.position.lastBlackRow) || (colIndex == this.position.lastWhiteColumn && rowIndex == this.position.lastWhiteRow)) {
                    circle.style.stroke = "green";
                }
                if (this.position.columns[colIndex][rowIndex] == this.position.BLACK) {
                    circle.style.fill = "black";
                } else if (this.position.columns[colIndex][rowIndex] == this.position.WHITE) {
                    circle.style.fill = "white";
                } else {
                    circle.style.fill = "gray";
                    //if this is distance 1 from either of the last plays...
                    if (Math.abs(colIndex - this.position.lastBlackColumn) + Math.abs(rowIndex - this.position.lastBlackRow) == 1 || Math.abs(colIndex - this.position.lastWhiteColumn) + Math.abs(rowIndex - this.position.lastWhiteRow) == 1) {
                        if (listener != undefined) {
                            var player = listener;
                            circle.column = colIndex;
                            circle.row = rowIndex;
                            circle.onclick = function(event) {player.handleClick(event);}
                        }
                    }
                }
                boardSvg.appendChild(circle);
            }
        }
    }

    /**
     * Handles the mouse click.
     */
    ,getNextPositionFromClick: function(event, currentPlayer, containerElement, player) {
        var column = event.target.column;
        var row = event.target.row;
        var blackDistance = Math.abs(column - this.position.lastBlackColumn) + Math.abs(row - this.position.lastBlackRow);
        var whiteDistance = Math.abs(column - this.position.lastWhiteColumn) + Math.abs(row - this.position.lastWhiteRow);
        var nearLastBlack = blackDistance == 1;
        var nearLastWhite = whiteDistance == 1;
        if (nearLastBlack && !nearLastWhite) {
            var chosenOption = this.position.getOption(this.position.BLACK, column, row);
        } else if (!nearLastBlack && nearLastWhite) {
            var chosenOption = this.position.getOption(this.position.WHITE, column, row);
        } else if (nearLastBlack && nearLastWhite) {
            //I don't know how to handle this case yet!
            this.destroyPopup();
            console.log("Clicked!");
            var self = this;
            //create the popup
            this.popup = document.createElement("div");
            var blackButton = document.createElement("button");
            blackButton.appendChild(toNode("Black"));
            blackButton.onclick = function() {
                self.destroyPopup();
                var option = self.position.getOption(self.position.BLACK, column, row);
                player.sendMoveToRef(option);
            };
            this.popup.appendChild(blackButton);

            var whiteButton = document.createElement("button");
            whiteButton.appendChild(toNode("White"));
            whiteButton.onclick = function() {
                self.destroyPopup();
                var option = self.position.getOption(self.position.WHITE, column, row);
                player.sendMoveToRef(option);
            };
            this.popup.appendChild(whiteButton);

            this.popup.style.position = "fixed";
            this.popup.style.display = "block";
            this.popup.style.opacity = 1;
            this.popup.width = Math.min(window.innerWidth/2, 100);
            this.popup.height = Math.min(window.innerHeight/2, 50);
            this.popup.style.left = event.clientX + "px";
            this.popup.style.top = event.clientY + "px";
            document.body.appendChild(this.popup);
            return null;
        } else {
            console.log("The click wasn't near either last play!  This shouldn't happen!");
            console.log("Black Distnace: " + blackDistance);
            console.log("column: " + column);
            console.log("lastBlackColumn: " + this.position.lastBlackColumn);
            console.log("White Distance: " + whiteDistance);
        }
        player.sendMoveToRef(chosenOption);
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

}); //end of InteractiveBinaryGeographyView class

/**
 * View Factory for BinaryGeography
 */
var InteractiveBinaryGeographyViewFactory = Class.create({
    /**
     * Constructor
     */
    initialize: function() {
    }

    /**
     * Returns an interactive view
     */
    ,getInteractiveBoard: function(position) {
        return new InteractiveBinaryGeographyView(position);
    }

    /**
     * Returns a view.
     */
    ,getView: function(position) {
        return this.getInteractiveBoard(position);
    }

}); //end of InteractiveBinaryGeographyViewFactory

/**
 * Launches a new BinaryGeography game.
 */
function newBinaryGeographyGame() {
    var viewFactory = new InteractiveBinaryGeographyViewFactory();
    var playDelay = 1000;
    var playerOptions = getCommonPlayerOptions(viewFactory, playDelay, 1, 5);
    var width = parseInt($('boardWidth').value);
    var height = parseInt($('boardHeight').value);
    var controlForm = $('gameOptions');
    var leftPlayer = parseInt(getSelectedRadioValue(controlForm.elements['leftPlayer']));
    var rightPlayer =  parseInt(getSelectedRadioValue(controlForm.elements['rightPlayer']));
    var game = new BinaryGeography(height, width);
    var players = [playerOptions[leftPlayer], playerOptions[rightPlayer]];
    var ref = new Referee(game, players, viewFactory, "MainGameBoard", $('messageBox'), controlForm);

}


///////////////////////////// Popping Balloons ////////////////////////////////

/**
 * Popping Balloons.
 *
 * Grid is stored as a 2D array of booleans.
 * @author Kyle Burke
 */
var PoppingBalloons = Class.create(CombinatorialGame, {

    /**
     * Constructor.
     */
    initialize: function(height, width) {
        var balloonLikelihood = .85;

        this.playerNames = ["Left", "Right"];

        this.columns = new Array();
        for (var colI = 0; colI < width; colI++) {
            var column = new Array();
            for (var rowI = 0; rowI < height; rowI++) {
                column.push(Math.random() <= balloonLikelihood);
            }
            this.columns.push(column);
        }
    }

    /**
     * Returns the width of this board.
     */
    ,getWidth: function() {
        return this.columns.length;
    }

    /**
     * Returns the height of this board.
     */
    ,getHeight: function() {
        if (this.getWidth() == 0) {
            return 0;
        } else {
            return this.columns[0].length;
        }
    }

    /**
     * Equals!
     */
    ,equals: function(other) {
        //check that the dimensions match
        if (this.getWidth() != other.getWidth() || this.getHeight() != other.getHeight()) {
            return false;
        }
        //now check that all the cells are equal
        for (var col = 0; col < this.columns.length; col++) {
            for (var row = 0; row < this.columns[col].length; row++) {
                if (this.columns[col][row] != other.columns[col][row]) {
                    return false;
                }
            }
        }
        return true;
    }

    /**
     * Clone.
     */
    ,clone: function() {
        var width = this.getWidth();
        var height = this.getHeight();
        var other = new PoppingBalloons(height, width);
        for (var col = 0; col < width; col++) {
            for (var row = 0; row < height; row++) {
                other.columns[col][row] = this.columns[col][row];
            }
        }
        return other;
    }

    /**
     * Gets the options.
     */
    ,getOptionsForPlayer: function(playerId) {
        var options = new Array();
        var width = this.getWidth();
        var height = this.getHeight();
        //single balloon options
        for (var col = 0; col < width; col++) {
            for (var row = 0; row < height; row++) {
                if (this.columns[col][row]) {
                    //create the option for popping that one balloon
                    options.push(this.getSingleBalloonOption(col, row));
                }
            }
        }

        //horizontal balloon pair options
        for (var col = 0; col < width-1; col++) {
            for (var row = 0; row < height; row++) {
                if (this.columns[col][row] && this.columns[col+1][row]) {
                    //create the option for popping the two balloons
                    options.push(this.getHorizontalBalloonOption(col, row));
                }
            }
        }

        //vertical balloon pair options
        for (var col = 0; col < width; col++) {
            for (var row = 0; row < height-1; row++) {
                if (this.columns[col][row] && this.columns[col][row+1]) {
                    //create the option for popping the two balloons
                    options.push(this.getVerticalBalloonOption(col, row));
                }
            }
        }

        //all balloons in a 2x2 square options
        for (var col = 0; col < width-1; col++) {
            for (var row = 0; row < height-1; row++) {
                //we just have to check that two diagonal balloons are there, otherwise we will be covered by any of the prior cases
                if ((this.columns[col][row] && this.columns[col+1][row+1]) || (this.columns[col+1][row] && this.columns[col][row+1])) {
                    //create the option for popping the two balloons
                    options.push(this.getSquareBalloonOption(col, row));
                }
            }
        }
        return options;
    }

    /**
     * Gets the result of a single balloon pop.  (This is not a required (inheriting) function.)
     */
    ,getSingleBalloonOption: function(column, row) {
        var option = this.clone();
        option.columns[column][row] = false;
        return option;
    }

    /**
     * Gets the result of popping two balloons next to each other (horizontally).
     */
    ,getHorizontalBalloonOption: function(column, row) {
        var option = this.clone();
        option.columns[column][row] = false;
        option.columns[column+1][row] = false;
        return option;
    }

    /**
     * Gets the result of popping two balloons on top of each other (vertically).
     */
    ,getVerticalBalloonOption: function(column, row) {
        var option = this.clone();
        option.columns[column][row] = false;
        option.columns[column][row+1] = false;
        return option;
    }

    /**
     * Gets the result of popping two balloons on top of each other (vertically).
     */
    ,getSquareBalloonOption: function(column, row) {
        var option = this.clone();
        option.columns[column][row] = false;
        option.columns[column][row+1] = false;
        option.columns[column+1][row] = false;
        option.columns[column+1][row+1] = false;
        return option;
    }

}); //end of PoppingBalloons class


var NonInteractivePoppingBalloonsView = Class.create({

    /**
     * Constructor.
     */
    initialize: function(position) {
        this.position = position;
    }

    /**
     * Draws the board.
     */
    ,draw: function(containerElement, listener) {
        //clear out the other children of the container element
        while (containerElement.hasChildNodes()) {
            containerElement.removeChild(containerElement.firstChild);
        }
        var svgNS = "http://www.w3.org/2000/svg";
        var boardSvg = document.createElementNS(svgNS, "svg");
        //now add the new board to the container
        containerElement.appendChild(boardSvg);
        var boardWidth = Math.min(getAvailableHorizontalPixels(containerElement), window.innerWidth - 200);
        var boardPixelSize = Math.min(window.innerHeight, boardWidth);
        //var boardPixelSize = 10 + (this.position.sideLength + 4) * 100
        boardSvg.setAttributeNS(null, "width", boardPixelSize);
        boardSvg.setAttributeNS(null, "height", boardPixelSize);

        var width = this.position.getWidth();
        var height = this.position.getHeight();

        //get some dimensions based on the canvas size
        var maxCircleWidth = (boardPixelSize - 10) / width;
        var maxCircleHeight = (boardPixelSize - 10) / (height + 2);
        var maxDiameter = Math.min(maxCircleWidth, maxCircleHeight);
        var padPercentage = .2;
        var boxSide = maxDiameter;
        var nodeRadius = Math.floor(.5 * maxDiameter * (1-padPercentage));
        var nodePadding = Math.floor(maxDiameter * padPercentage);

        //draw the board
        for (var colIndex = 0; colIndex < width; colIndex++) {
            //draw the boxes in this column
            for (var rowIndex = 0; rowIndex < height; rowIndex ++) {
                var cx = 5 + Math.floor((colIndex + .5) * boxSide);
                var cy = 5 + Math.floor((rowIndex + .5) * boxSide);
                if (this.position.columns[colIndex][rowIndex]) {
                    //there is a balloon here
                    var circle = document.createElementNS(svgNS,"circle"); //the balloon
                    circle.setAttributeNS(null, "cx", cx);
                    circle.setAttributeNS(null, "cy", cy);
                    circle.setAttributeNS(null, "r", nodeRadius);
                    circle.style.stroke = "black";
                    circle.style.strokeWidth = 1;
                    circle.style.fill = "red";
                    if (listener != undefined) {
                        var player = listener;
                        circle.popType = "single";
                        circle.column = colIndex;
                        circle.row = rowIndex;
                        circle.onclick = function(event) {player.handleClick(event);}
                        this.position.getSingleBalloonOption(colIndex, rowIndex);
                    }
                    boardSvg.appendChild(circle);
                }
            }
        }
    }

}); //end of NonInteractivePoppingBalloonsView class.

/**
 * Non-interactive View Factory for PoppingBalloons
 */
var NonInteractivePoppingBalloonsViewFactory = Class.create({
    /**
     * Constructor
     */
    initialize: function() {
    }

    /**
     * Returns an interactive view
     */
    ,getNonInteractiveBoard: function(position) {
        return new NonInteractivePoppingBalloonsView(position);
    }

    /**
     * Returns a view.
     */
    ,getView: function(position) {
        return this.getNonInteractiveBoard(position);
    }

}); //end of InteractivePoppingBalloonsViewFactory




var InteractivePoppingBalloonsView = Class.create({

    /**
     * Constructor.
     */
    initialize: function(position) {
        this.position = position;
    }

    /**
     * Draws the board.
     */
    ,draw: function(containerElement, listener) {
        //clear out the other children of the container element
        while (containerElement.hasChildNodes()) {
            containerElement.removeChild(containerElement.firstChild);
        }
        var svgNS = "http://www.w3.org/2000/svg";
        var boardSvg = document.createElementNS(svgNS, "svg");
        //now add the new board to the container
        containerElement.appendChild(boardSvg);
        var boardWidth = Math.min(getAvailableHorizontalPixels(containerElement), window.innerWidth - 200);
        var boardPixelSize = Math.min(window.innerHeight, boardWidth);
        //var boardPixelSize = 10 + (this.position.sideLength + 4) * 100
        boardSvg.setAttributeNS(null, "width", boardPixelSize);
        boardSvg.setAttributeNS(null, "height", boardPixelSize);

        var width = this.position.getWidth();
        var height = this.position.getHeight();

        //get some dimensions based on the canvas size
        var maxCircleWidth = (boardPixelSize - 10) / width;
        var maxCircleHeight = (boardPixelSize - 10) / (height + 2);
        var maxDiameter = Math.min(maxCircleWidth, maxCircleHeight);
        var padPercentage = .2;
        var boxSide = maxDiameter;
        var nodeRadius = Math.floor(.5 * maxDiameter * (1-padPercentage));
        var nodePadding = Math.floor(maxDiameter * padPercentage);

        //draw the board
        for (var colIndex = 0; colIndex < width; colIndex++) {
            //draw the boxes in this column
            for (var rowIndex = 0; rowIndex < height; rowIndex ++) {
                var cx = 5 + Math.floor((colIndex + .5) * boxSide);
                var cy = 5 + Math.floor((rowIndex + .5) * boxSide);
                if (this.position.columns[colIndex][rowIndex]) {
                    //there is a balloon here
                    var circle = document.createElementNS(svgNS,"circle"); //the balloon
                    circle.setAttributeNS(null, "cx", cx);
                    circle.setAttributeNS(null, "cy", cy);
                    circle.setAttributeNS(null, "r", nodeRadius);
                    circle.style.stroke = "black";
                    circle.style.strokeWidth = 1;
                    circle.style.fill = "red";
                    if (listener != undefined) {
                        var player = listener;
                        circle.popType = "single";
                        circle.column = colIndex;
                        circle.row = rowIndex;
                        circle.onclick = function(event) {player.handleClick(event);}
                        this.position.getSingleBalloonOption(colIndex, rowIndex);
                    }
                    boardSvg.appendChild(circle);

                    //code to add the number to the balloon
                    //adapted from fiveelements' answer at https://stackoverflow.com/questions/57515197/how-to-add-text-inside-a-circle-svg-using-javascript
                    const balloonIndex = rowIndex * width + colIndex;
                    const number = document.createElementNS(svgNS, 'text');
                    number.setAttributeNS(null, 'x', cx);
                    number.setAttributeNS(null, 'y', cy);
                    number.setAttributeNS(null, 'text-anchor', 'middle');
                    number.setAttributeNS(null, 'dominant-baseline', 'central');
                    number.setAttributeNS(null, 'stroke', 'black');
                    number.setAttributeNS(null, 'fill', 'black');
                    number.setAttributeNS(null, 'stroke-width', '1px');
                    number.textContent = '' + balloonIndex;
                    boardSvg.appendChild(number);
                    //console.log("added number");

                    //now check for other nearby balloons
                    if (colIndex + 1 < width && this.position.columns[colIndex+1][rowIndex]) {
                        //there is a balloon to the right (as well)
                        var square = document.createElementNS(svgNS,"rect");
                        var squareWidth = boxSide * padPercentage;
                        var squareX = cx + nodeRadius;
                        var squareY = cy - squareWidth/2;
                        square.setAttributeNS(null, "x", squareX + "");
                        square.setAttributeNS(null, "y", squareY + "");
                        square.setAttributeNS(null, "width", squareWidth + "");
                        square.setAttributeNS(null, "height", squareWidth + "");
                        square.style.stroke = "black";
                        square.style.strokeWidth = 1;
                        square.style.fill = "blue";
                        if (listener != undefined) {
                            var player = listener;
                            square.popType = "horizontal";
                            square.column = colIndex;
                            square.row = rowIndex;
                            square.onclick = function(even) {player.handleClick(event);}
                        }
                        boardSvg.appendChild(square);
                    }

                    if (rowIndex + 1 < height && this.position.columns[colIndex][rowIndex + 1]) {
                        //there is a balloon below this one (as well)
                        var square = document.createElementNS(svgNS,"rect");
                        var squareWidth = boxSide * padPercentage;
                        var squareX = cx - squareWidth/2;
                        var squareY = cy + nodeRadius;
                        square.setAttributeNS(null, "x", squareX + "");
                        square.setAttributeNS(null, "y", squareY + "");
                        square.setAttributeNS(null, "width", squareWidth + "");
                        square.setAttributeNS(null, "height", squareWidth + "");
                        square.style.stroke = "black";
                        square.style.strokeWidth = 1;
                        square.style.fill = "blue";
                        if (listener != undefined) {
                            var player = listener;
                            square.popType = "vertical";
                            square.column = colIndex;
                            square.row = rowIndex;
                            square.onclick = function(even) {player.handleClick(event);}
                        }
                        boardSvg.appendChild(square);

                    }

                }
                //check to see if there should be a quad balloon popper
                if (colIndex + 1 < width && rowIndex + 1 < height &&
                    ((this.position.columns[colIndex + 1][rowIndex + 1] &&
                      this.position.columns[colIndex][rowIndex]) ||
                     (this.position.columns[colIndex + 1][rowIndex] &&
                      this.position.columns[colIndex][rowIndex + 1]))) {
                    //there are diagonal balloons, so we should be able to pop the quad

                    var square = document.createElementNS(svgNS,"rect");
                    var squareWidth = 2.2 * boxSide * padPercentage;
                    var squareX = cx + .707 * nodeRadius;
                    var squareY = cy + .707 * nodeRadius;
                    square.setAttributeNS(null, "x", squareX + "");
                    square.setAttributeNS(null, "y", squareY + "");
                    square.setAttributeNS(null, "width", squareWidth + "");
                    square.setAttributeNS(null, "height", squareWidth + "");
                    square.style.stroke = "black";
                    square.style.strokeWidth = 1;
                    square.style.fill = "yellow";
                    if (listener != undefined) {
                        var player = listener;
                        square.popType = "square";
                        square.column = colIndex;
                        square.row = rowIndex;
                        square.onclick = function(even) {player.handleClick(event);}
                    }
                    boardSvg.appendChild(square);
                }
            }
        }
    }

    /**
     * Handles the mouse click.
     */
    ,getNextPositionFromClick: function(event, currentPlayer, containerElement, player) {
        var column = event.target.column;
        var row = event.target.row;
        var chosenOption; //
        var self = this;
        if (event.target.popType == "single") {
            chosenOption = self.position.getSingleBalloonOption(column, row);
        } else if (event.target.popType == "horizontal") {
            chosenOption = self.position.getHorizontalBalloonOption(column, row);
        } else if (event.target.popType == "vertical") {
            chosenOption = self.position.getVerticalBalloonOption(column, row);
        } else if (event.target.popType == "square") {
            chosenOption = self.position.getSquareBalloonOption(column, row);
        } else {
            console.log("Didn't recognize the popType: " + event.target.popType);
        }

        player.sendMoveToRef(chosenOption);
    }

}); //end of InteractivePoppingBalloonsView class

/**
 * View Factory for PoppingBalloons
 */
var InteractivePoppingBalloonsViewFactory = Class.create({
    /**
     * Constructor
     */
    initialize: function() {
    }

    /**
     * Returns an interactive view
     */
    ,getInteractiveBoard: function(position) {
        return new InteractivePoppingBalloonsView(position);
    }

    /**
     * Returns a view.
     */
    ,getView: function(position) {
        return this.getInteractiveBoard(position);
    }

}); //end of InteractivePoppingBalloonsViewFactory

/**
 * Launches a new PoppingBalloons game.
 */
function newPoppingBalloonsGame() {
    var viewFactory = new InteractivePoppingBalloonsViewFactory();
    var playDelay = 1000;
    var playerOptions = getCommonPlayerOptions(viewFactory, playDelay, 1, 5);
    var width = parseInt($('boardWidth').value);
    var height = parseInt($('boardHeight').value);
    var controlForm = $('gameOptions');
    var leftPlayer = parseInt(getSelectedRadioValue(controlForm.elements['leftPlayer']));
    var rightPlayer =  parseInt(getSelectedRadioValue(controlForm.elements['rightPlayer']));
    var game = new PoppingBalloons(height, width);
    var players = [playerOptions[leftPlayer], playerOptions[rightPlayer]];
    var ref = new Referee(game, players, viewFactory, "MainGameBoard", $('messageBox'), controlForm);
}

///////////////////////// End of Popping Balloons




///////////////////////////// Flag Coloring ////////////////////////////////

/**
 * Flag Coloring.
 *
 * Grid is stored as a 2D array of strings.
 * @author Kyle Burke
 */
var FlagColoring = Class.create(CombinatorialGame, {

    /**
     * Constructor.
     */
    initialize: function(height, width, colorsList) {
        this.colorsList = colorsList || ["red", "yellow", "green", "blue", "black", "white"];

        this.playerNames = ["Left", "Right"];

        this.columns = new Array();
        for (var colI = 0; colI < width; colI++) {
            var column = new Array();
            for (var rowI = 0; rowI < height; rowI++) {
                column.push(this.colorsList[Math.floor(Math.random() * this.colorsList.length)]);
            }
            this.columns.push(column);
        }
    }

    /**
     * Returns the width of this board.
     */
    ,getWidth: function() {
        return this.columns.length;
    }

    /**
     * Returns the height of this board.
     */
    ,getHeight: function() {
        if (this.getWidth() == 0) {
            return 0;
        } else {
            return this.columns[0].length;
        }
    }

    /**
     * Equals!
     */
    ,equals: function(other) {
        //check that the dimensions match
        if (this.getWidth() != other.getWidth() || this.getHeight() != other.getHeight()) {
            return false;
        }
        //now check that all the cells are equal
        for (var col = 0; col < this.columns.length; col++) {
            for (var row = 0; row < this.columns[col].length; row++) {
                if (!this.columns[col][row] == other.columns[col][row]) {
                    return false;
                }
            }
        }
        return true;
    }

    /**
     * Clone.
     */
    ,clone: function() {
        var width = this.getWidth();
        var height = this.getHeight();
        var other = new FlagColoring(height, width, this.colorsList);
        for (var col = 0; col < width; col++) {
            for (var row = 0; row < height; row++) {
                other.columns[col][row] = this.columns[col][row];
            }
        }
        return other;
    }

    /**
     * Gets two lists, a list of the vertices in the same region as the current vertex and the neighbors of that region.
     */
    ,getRegionAndNeighbors: function(column, row) {

        //unmark all the vertices
        var marks = [];
        for (var i = 0; i < this.getWidth(); i++) {
            var columnMarks = [];
            for (var j = 0; j < this.getHeight(); j++) {
                columnMarks.push(false);
            }
            marks.push(columnMarks);
        }

        //clone the current board (might not need this)
        var clone = this.clone();

        //grow the region out from the current vertex
        var region = [];
        var neighbors = [];

        var regionColor = this.columns[column][row];

        this.getRegionAndNeighborsHelper(column, row, regionColor, marks, region, neighbors);

        return [region, neighbors];
    }

    /**
     * Helper function for getRegionAndNeighbors.  This is void, instead modifying marks, region, and neighbors.
     */
    ,getRegionAndNeighborsHelper: function(column, row, regionColor, marks, region, neighbors) {
        if (marks[column][row]) {
            return;
        }
        marks[column][row] = true;

        //check whether we're in the same region
        if (regionColor == this.columns[column][row]) {
            //yes!  Add and keep expanding
            region.push([column, row]);

            //check the four adjacent vertices to keep expanding
            //first to the left
            var nextCol = column - 1;
            var nextRow = row;
            if (nextCol >= 0) {
                this.getRegionAndNeighborsHelper(nextCol, nextRow, regionColor, marks, region, neighbors);
            }

            //next above
            nextCol = column;
            nextRow = row-1;
            if (nextRow >= 0) {
                this.getRegionAndNeighborsHelper(nextCol, nextRow, regionColor, marks, region, neighbors);
            }

            //next right
            nextCol = column + 1;
            nextRow = row;
            if (nextCol <= this.getWidth() - 1) {
                this.getRegionAndNeighborsHelper(nextCol, nextRow, regionColor, marks, region, neighbors);
            }

            //next below
            nextCol = column;
            nextRow = row + 1;
            if (nextRow <= this.getHeight() - 1) {
                this.getRegionAndNeighborsHelper(nextCol, nextRow, regionColor, marks, region, neighbors);
            }

        } else {
            //we're just a neighbor
            neighbors.push([column, row]);
        }

    }

    /**
     * Gets the options.
     */
    ,getOptionsForPlayer: function(playerId) {
        var options = new Array();
        var width = this.getWidth();
        var height = this.getHeight();

        //check which vertices we've already seen using an array of booleans
        var inRegionAlreadySeen = [];
        for (var col = 0; col < width; col++) {
            var inRegionAlreadySeenColumn = [];
            for (var row = 0; row < height; row++) {
                inRegionAlreadySeenColumn.push(false);
            }
            inRegionAlreadySeen.push(inRegionAlreadySeenColumn);
        }

        //traverse all vertices and add the options there if we haven't yet
        for (var col = 0; col < width; col++) {
            for (var row = 0; row < height; row++) {
                if (!inRegionAlreadySeen[col][row]) {
                    var regionAndNeighbors = this.getRegionAndNeighbors(col, row);
                    var region = regionAndNeighbors[0];
                    var neighbors = regionAndNeighbors[1];
                    //get all the neighboring colors
                    var neighborColors = [];
                    for (var i = 0; i < neighbors.length; i++) {
                        var neighbor = neighbors[i];
                        var neighborColor = this.columns[neighbor[0]][neighbor[1]];
                        var hasColor = false;
                        for (var j = 0; j < neighborColors.length; j++) {
                            if (neighborColors[j] == neighborColor) {
                                hasColor = true;
                                break;
                            }
                        }
                        if (!hasColor) {
                            neighborColors.push(neighborColor);
                        }
                    }

                    //add moves to each color
                    for (var i = 0; i < neighborColors.length; i++) {
                        var option = this.colorRegion(region, neighborColors[i]);
                        options.push(option);
                    }

                    //mark all vertices in the region as already seen
                    for (var i = 0; i < region.length; i++) {
                        var vertex = region[i];
                        inRegionAlreadySeen[vertex[0]][vertex[1]]  = true;
                    }
                }
            }
        }
        return options;
    }

    /**
     * Gets a new position where the given region (list of coordinates) is colored.
     */
    ,colorRegion: function(region, color) {
        var clone = this.clone();
        for (var i = 0; i < region.length; i++) {
            var vertex = region[i];
            clone.columns[vertex[0]][vertex[1]] = color;
        }
        return clone;
    }

}); //end of FlagColoring class


var NonInteractiveFlagColoringView = Class.create({

    /**
     * Constructor.
     */
    initialize: function(position) {
        this.position = position;
    }

    /**
     * Draws the board.
     */
    ,draw: function(containerElement, listener) {
        //clear out the other children of the container element
        while (containerElement.hasChildNodes()) {
            containerElement.removeChild(containerElement.firstChild);
        }
        var svgNS = "http://www.w3.org/2000/svg";
        var boardSvg = document.createElementNS(svgNS, "svg");
        //now add the new board to the container
        containerElement.appendChild(boardSvg);
        var boardWidth = Math.min(getAvailableHorizontalPixels(containerElement), window.innerWidth - 200);
        var boardPixelSize = Math.min(window.innerHeight, boardWidth);
        //var boardPixelSize = 10 + (this.position.sideLength + 4) * 100
        boardSvg.setAttributeNS(null, "width", boardPixelSize);
        boardSvg.setAttributeNS(null, "height", boardPixelSize);

        var width = this.position.getWidth();
        var height = this.position.getHeight();

        //get some dimensions based on the canvas size
        var maxCircleWidth = (boardPixelSize - 10) / width;
        var maxCircleHeight = (boardPixelSize - 10) / (height + 2);
        var maxDiameter = Math.min(maxCircleWidth, maxCircleHeight);
        var padPercentage = .2;
        var boxSide = maxDiameter;
        var nodeRadius = Math.floor(.5 * maxDiameter * (1-padPercentage));
        var nodePadding = Math.floor(maxDiameter * padPercentage);

        //draw the board
        for (var colIndex = 0; colIndex < width; colIndex++) {
            //draw the vertices in this column
            for (var rowIndex = 0; rowIndex < height; rowIndex ++) {
                var cx = 5 + Math.floor((colIndex + .5) * boxSide);
                var cy = 5 + Math.floor((rowIndex + .5) * boxSide);
                var circle = document.createElementNS(svgNS,"circle"); //the balloon
                circle.setAttributeNS(null, "cx", cx);
                circle.setAttributeNS(null, "cy", cy);
                circle.setAttributeNS(null, "r", nodeRadius);
                circle.style.stroke = "black";
                circle.style.strokeWidth = 1;
                circle.style.fill = this.position.columns[colIndex][rowIndex]; //value is the color
                if (listener != undefined) {
                    var player = listener;
                    circle.popType = "single";
                    circle.column = colIndex;
                    circle.row = rowIndex;
                    circle.onclick = function(event) {player.handleClick(event);}
                    this.position.getSingleBalloonOption(colIndex, rowIndex);
                }
                boardSvg.appendChild(circle);
            }
        }
    }

}); //end of NonInteractiveFlagColoringView class.

/**
 * Non-interactive View Factory for FlagColoring
 */
var NonInteractiveFlagColoringViewFactory = Class.create({
    /**
     * Constructor
     */
    initialize: function() {
    }

    /**
     * Returns an interactive view
     */
    ,getNonInteractiveBoard: function(position) {
        return new NonInteractiveFlagColoringView(position);
    }

    /**
     * Returns a view.
     */
    ,getView: function(position) {
        return this.getNonInteractiveBoard(position);
    }

}); //end of InteractiveFlagColoringViewFactory




var InteractiveFlagColoringView = Class.create({

    /**
     * Constructor.
     */
    initialize: function(position) {
        this.position = position;
    }

    /**
     * Draws the board.
     */
    ,draw: function(containerElement, listener) {
        //clear out the other children of the container element
        while (containerElement.hasChildNodes()) {
            containerElement.removeChild(containerElement.firstChild);
        }
        var svgNS = "http://www.w3.org/2000/svg";
        var boardSvg = document.createElementNS(svgNS, "svg");
        //now add the new board to the container
        containerElement.appendChild(boardSvg);
        var boardWidth = Math.min(getAvailableHorizontalPixels(containerElement), window.innerWidth - 200);
        var boardPixelSize = Math.min(window.innerHeight, boardWidth);
        //var boardPixelSize = 10 + (this.position.sideLength + 4) * 100
        boardSvg.setAttributeNS(null, "width", boardPixelSize);
        boardSvg.setAttributeNS(null, "height", boardPixelSize);

        var width = this.position.getWidth();
        var height = this.position.getHeight();

        //get some dimensions based on the canvas size
        var maxCircleWidth = (boardPixelSize - 10) / width;
        var maxCircleHeight = (boardPixelSize - 10) / (height + 2);
        var maxDiameter = Math.min(maxCircleWidth, maxCircleHeight);
        var padPercentage = .2;
        var boxSide = maxDiameter;
        var nodeRadius = Math.floor(.5 * maxDiameter * (1-padPercentage));
        var nodePadding = Math.floor(maxDiameter * padPercentage);

        //draw a gray frame around everything
        var frame = document.createElementNS(svgNS, "rect");
        frame.setAttributeNS(null, "x", 5);
        frame.setAttributeNS(null, "y", 5);
        frame.setAttributeNS(null, "width", width * boxSide);
        frame.setAttributeNS(null, "height", height * boxSide);
        frame.style.strokeWidth = 4;
        frame.style.stroke = "gray";
        boardSvg.appendChild(frame);

        //draw the board
        for (var colIndex = 0; colIndex < width; colIndex++) {
            //draw the boxes in this column
            for (var rowIndex = 0; rowIndex < height; rowIndex ++) {

                var square = document.createElementNS(svgNS, "rect");
                var x = 5 + Math.floor((colIndex) * boxSide);
                var y = 5 + Math.floor((rowIndex) * boxSide);
                square.setAttributeNS(null, "x", x);
                square.setAttributeNS(null, "y", y);
                square.setAttributeNS(null, "width", boxSide+1);
                square.setAttributeNS(null, "height", boxSide+1);
                //square.style.stroke = "black";
                square.style.strokeWith = 0;
                square.style.fill = this.position.columns[colIndex][rowIndex];
                if (listener != undefined) {
                    var player = listener;
                    square.popType = "single";
                    square.column = colIndex;
                    square.row = rowIndex;
                    square.onclick = function(event) {player.handleClick(event);}
                }
                boardSvg.appendChild(square);
            }
        }
    }

    /**
     * Handles the mouse click.
     */
    ,getNextPositionFromClick: function(event, currentPlayer, containerElement, player) {
        this.destroyPopup();
        console.log("Clicked!");
        var self = this;
        var circle = event.target;
        var column = event.target.column;
        var row = event.target.row;

        //get the list of colors (as neighborColors)

        var regionAndNeighbors = this.position.getRegionAndNeighbors(column, row);
        var region = regionAndNeighbors[0];
        var neighbors = regionAndNeighbors[1];
        //get all the neighboring colors
        var neighborColors = [];
        for (var i = 0; i < neighbors.length; i++) {
            var neighbor = neighbors[i];
            var neighborColor = this.position.columns[neighbor[0]][neighbor[1]];
            var hasColor = false;
            for (var j = 0; j < neighborColors.length; j++) {
                if (neighborColors[j] == neighborColor) {
                    hasColor = true;
                    break;
                }
            }
            if (!hasColor) {
                neighborColors.push(neighborColor);
            }
        }

        //console.log("neighborColors: " + neighborColors);


        //create the popup
        this.popup = document.createElement("div");
        for (var i = 0; i < neighborColors.length; i++) {
            var color = neighborColors[i];
            //console.log("color: " + color);
            var button = document.createElement("button");
            button.appendChild(toNode(color));
            const colorX = color;
            button.onclick = function() {
                self.destroyPopup();
                player.sendMoveToRef(self.position.colorRegion(region, colorX));
            }
            this.popup.appendChild(button);
        }

        this.popup.style.position = "fixed";
        this.popup.style.display = "block";
        this.popup.style.opacity = 1;
        this.popup.width = Math.min(window.innerWidth/2, 100);
        this.popup.height = Math.min(window.innerHeight/2, 50);
        this.popup.style.left = event.clientX + "px";
        this.popup.style.top = event.clientY + "px";
        document.body.appendChild(this.popup);
        return null;
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

}); //end of InteractiveFlagColoringView class

/**
 * View Factory for FlagColoring
 */
var InteractiveFlagColoringViewFactory = Class.create({
    /**
     * Constructor
     */
    initialize: function() {
    }

    /**
     * Returns an interactive view
     */
    ,getInteractiveBoard: function(position) {
        return new InteractiveFlagColoringView(position);
    }

    /**
     * Returns a view.
     */
    ,getView: function(position) {
        return this.getInteractiveBoard(position);
    }

}); //end of InteractiveFlagColoringViewFactory

/**
 * Launches a new FlagColoring game.
 */
function newFlagColoringGame() {
    var viewFactory = new InteractiveFlagColoringViewFactory();
    var playDelay = 1000;
    var playerOptions = getCommonPlayerOptions(viewFactory, playDelay, 1, 5);
    var width = parseInt($('boardWidth').value);
    var height = parseInt($('boardHeight').value);
    var controlForm = $('gameOptions');
    var leftPlayer = parseInt(getSelectedRadioValue(controlForm.elements['leftPlayer']));
    var rightPlayer =  parseInt(getSelectedRadioValue(controlForm.elements['rightPlayer']));
    var game = new FlagColoring(height, width);
    var players = [playerOptions[leftPlayer], playerOptions[rightPlayer]];
    var ref = new Referee(game, players, viewFactory, "MainGameBoard", $('messageBox'), controlForm);
}

///////////////////////// End of Flag Coloring




/////////////////////////////// Quantum Nim /////////////////////////////////////////

/**
 * Quantum Nim position.
 *
 * Piles are stored in a 2D array of ints.  Each element is a realization.
 */
var QuantumNim = Class.create(CombinatorialGame, {

    /**
     * Constructor.
     */
    initialize: function(numRealizations, numPiles, maxPileSize) {
        this.playerNames = ["Left", "Right"];
        this.realizations = new Array();
        for (var i = 0; i < numRealizations; i++) {
            var realization = new Array();
            for (var j = 0; j < numPiles; j++) {
                var pile = Math.floor(Math.random() * (maxPileSize + 1));
                realization.push(pile);
            }
            this.realizations.push(realization);
        }
    }

    /**
     * Returns the width of this board.
     */
    ,getWidth: function() {
        if (this.getHeight() == 0) {
            return 0;
        } else {
            return this.realizations[0].length;
        }
    }

    /**
     * Returns the number of realizations.
     */
    ,getNumRealizations: function() {
        return this.getHeight();
    }

    /**
     * Returns the height of this board.
     */
    ,getHeight: function() {
        return this.realizations.length;
    }

    /**
     * Returns the number of piles.
     */
    ,getNumPiles: function() {
        return this.getWidth();
    }

    /**
     * Equals!
     */
    ,equals: function(other) {
        //check that the dimensions match
        if (this.getWidth() != other.getWidth() || this.getHeight() != other.getHeight()) {
            return false;
        }
        //now check that all the cells are equal
        for (var realization = 0; realization < this.realizations.length; realization++) {
            for (var pile = 0; pile < this.realizations[realization].length; pile++) {
                if (this.realizations[realization][pile] != other.realizations[realization][pile]) {
                    return false;
                }
            }
        }
        return true;
    }

    /**
     * Clone.
     */
    ,clone: function() {
        var width = this.getWidth();
        var height = this.getHeight();
        var other = new QuantumNim(height, width, 5);
        for (var realization = 0; realization < height; realization++) {
            for (var pile = 0; pile < width; pile++) {
                other.realizations[realization][pile] = this.realizations[realization][pile];
            }
        }
        return other;
    }

    /**
     * Returns whether a realization is collapsed out.
     */
    ,isRealizationCollapsed: function(realizationIndex) {
        //console.log("realizationIndex: " + realizationIndex);
        for (var pileIndex = 0; pileIndex < this.getNumPiles(); pileIndex++) {
            if (this.realizations[realizationIndex][pileIndex] < 0) {
                return true;
            }
        }
        return false;
    }

    /**
     * Returns whether a player can play on one of the columns.
     */
    ,canPlayPile: function(pileIndex) {
        //var column = this.columns[columnIndex];
        for (var rIndex = 0; rIndex < this.getNumRealizations(); rIndex++) {
            if (this.realizations[rIndex][pileIndex] > 0 && ! this.isRealizationCollapsed(rIndex)) {
                //there are positive sticks in this pile in a non-collapsed realization
                return true;
            }
        }
        return false;
    }

    /**
     * Returns whether a player can play on one of the columns.
     */
    ,maxTakeableFromPile: function(pileIndex) {
        //var column = this.columns[columnIndex];
        var maxPileSize = 0;
        for (var rIndex = 0; rIndex < this.getNumRealizations(); rIndex++) {
            if (!this.isRealizationCollapsed(rIndex)) {
                maxPileSize = Math.max(maxPileSize, this.realizations[rIndex][pileIndex]);
            }
        }
        return maxPileSize;
    }

    /**
     * Returns the position after a player removes numSticks from pile # pileIndex.
     */
    ,playAtPile: function(pileIndex, numSticks) {
        if (this.maxTakeableFromPile(pileIndex) < numSticks) {
            return null;  //TODO: throw an error?
        }
        var option = this.clone();
        for (var rIndex = 0; rIndex < this.getNumRealizations(); rIndex++) {
            if (!this.isRealizationCollapsed(rIndex)) {
                var realization = option.realizations[rIndex];
                realization[pileIndex] -= numSticks;
            }
        }
        return option;
    }

    /**
     * Returns the position resulting from a player making a quantum move: numSticksA from pileIndexA and numSticksB from pileIndexB.
     */
    ,playAtTwoPiles: function(pileIndexA, numSticksA, pileIndexB, numSticksB) {
        if (pileIndexA == pileIndexB && numSticksA == numSticksB) {
            return this.playAtPile(pileIndexA, numSticksA);
        } else if (pileIndexA > pileIndexB || (pileIndexA == pileIndexB && numSticksA > numSticksB)) {
            //reordering the moves for consistency
            return this.playAtTwoPiles(pileIndexB, numSticksB, pileIndexA, numSticksA);
        } else {
            var option = this.clone();
            var oldRealizations = option.realizations;
            var newRealizations = new Array();
            for (var rIndex = 0; rIndex < this.getNumRealizations(); rIndex++) {
                var realization = oldRealizations[rIndex];
                if (!this.isRealizationCollapsed(rIndex)) {
                    var newRealizationA = new Array();
                    var newRealizationB = new Array();
                    for (var pileIndex = 0; pileIndex < this.getWidth(); pileIndex++) {
                        newRealizationA.push(realization[pileIndex]);
                        newRealizationB.push(realization[pileIndex]);
                        if (pileIndex == pileIndexA) {
                            newRealizationA[pileIndex] -= numSticksA;
                        }
                        if (pileIndex == pileIndexB) {
                            newRealizationB[pileIndex] -= numSticksB;
                        }
                    }
                    newRealizations.push(newRealizationA);
                    newRealizations.push(newRealizationB);
                } else {
                    newRealizations.push(realization);
                }
            }
            option.realizations = newRealizations;
            return option;

            /*
            //get the two individual options
            var optionA = this.playAtPile(pileIndexA, numSticksA);
            var optionB = this.playAtPile(pileIndexB, numSticksB);
            //combine the realizations, by adding optionB's realizations to optionA
            for (var rIndex = 0; rIndex < optionB.getNumRealizations(); rIndex++) {
                var realization = optionB.realizations[rIndex];
                optionA.realizations.push(realization);
            }
            return optionA;*/
        }
    }

    /**
     * Gets the options.
     */
    ,getOptionsForPlayer: function(playerId) {
        //first get the options from classical moves
        var options = new Array();
        for (var pileIndex = 0; pileIndex < this.getNumPiles(); pileIndex++) {
            var maxSticks = this.maxTakeableFromPile(pileIndex);
            for (var numSticks = 1; numSticks <= maxSticks; numSticks++) {
                options.push(this.playAtPile(pileIndex, numSticks));
            }
        }

        //next get the options from quantum moves
        for (var pileIndexA = 0; pileIndexA < this.getNumPiles(); pileIndexA++) {
            for (var pileIndexB = pileIndexA; pileIndexB < this.getNumPiles(); pileIndexB++) {
                var maxSticksA = this.maxTakeableFromPile(pileIndexA);
                var maxSticksB = this.maxTakeableFromPile(pileIndexB);
                for (var numSticksA = 1; numSticksA <= maxSticksA; numSticksA++) {
                    var numSticksB = 1;
                    if (pileIndexA == pileIndexB) {
                        numSticksB = numSticksA + 1;
                    }
                    for ( ; numSticksB <= maxSticksB; numSticksB++) {
                        options.push(this.playAtTwoPiles(pileIndexA, numSticksA, pileIndexB, numSticksB));
                    }
                }
            }
        }

        return options;
    }

}); //end of QuantumNim class




var InteractiveQuantumNimView = Class.create({

    /**
     * Constructor.
     */
    initialize: function(position) {
        this.position = position;
        this.movesChosen = 0;
        this.firstPileIndex = -1;
        this.firstNumSticks = -1;
    }

    /**
     * Draws the board.
     */
    ,draw: function(containerElement, listener) {
        //clear out the other children of the container element
        while (containerElement.hasChildNodes()) {
            containerElement.removeChild(containerElement.firstChild);
        }
        var svgNS = "http://www.w3.org/2000/svg";
        var boardSvg = document.createElementNS(svgNS, "svg");
        //now add the new board to the container
        containerElement.appendChild(boardSvg);
        var boardPixelSize = Math.min(window.innerHeight - 100, window.innerWidth - 200);
        //var boardPixelSize = 10 + (this.position.sideLength + 4) * 100
        boardSvg.setAttributeNS(null, "width", boardPixelSize);
        //boardSvg.setAttributeNS(null, "height", boardPixelSize);

        var width = this.position.getWidth();
        var height = this.position.getHeight(); //plus 1 for the triangles

        //get some dimensions based on the canvas size
        var maxBoxWidth = (boardPixelSize - 10) / width;
        //the boxes get too small as the board increases in height, so we're not doing this here.
        var maxBoxHeight = (boardPixelSize - 10) / (height + 2);
        //var maxBoxSide = Math.min(maxBoxWidth, maxBoxHeight);
        var maxBoxSide = Math.min(maxBoxWidth, maxBoxHeight, 200);
        var boardHeight = maxBoxSide * (height + 2) + 10;
        boardSvg.setAttributeNS(null, "height", boardHeight);

        //draw the board
        for (var colIndex = 0; colIndex < width; colIndex++) {
            //draw the triangle at the top of the column
            if (this.position.canPlayPile(colIndex)) {
                //draw the triangle above the column.  This is where the player will press to select the column.
                //from Robert Longson's answer here: https://stackoverflow.com/questions/45773273/draw-svg-polygon-from-array-of-points-in-javascript
                var triangle = document.createElementNS(svgNS, "polygon");
                triangle.style.stroke = "black";
                var topLeftPoint = boardSvg.createSVGPoint();
                topLeftPoint.x = colIndex * maxBoxSide + 15;
                topLeftPoint.y = 10;
                triangle.points.appendItem(topLeftPoint);
                var topRightPoint = boardSvg.createSVGPoint();
                topRightPoint.x = (colIndex+1) * maxBoxSide + 5;
                topRightPoint.y = 10;
                triangle.points.appendItem(topRightPoint);
                var bottomPoint = boardSvg.createSVGPoint();
                bottomPoint.x = (colIndex + .5) * maxBoxSide + 10;
                bottomPoint.y = 5 + maxBoxSide;
                triangle.points.appendItem(bottomPoint);
                triangle.style.fill = "black";
                boardSvg.appendChild(triangle);
                //set the listener for the triangle
                if (listener != undefined) {
                    triangle.column = colIndex;
                    var player = listener;
                    triangle.onclick = function(event) {player.handleClick(event);}
                }
                //console.log("drawing triangle: " + triangle);
            }
            //draw the boxes in this column
            for (var rowIndex = 0; rowIndex < height; rowIndex ++) {
                var box = document.createElementNS(svgNS,"rect");
                var boxX = (10 + colIndex * maxBoxSide);
                var boxY = (10 + (rowIndex + 1) * maxBoxSide);
                box.setAttributeNS(null, "x", boxX + "");
                box.setAttributeNS(null, "y", boxY + "");
                box.setAttributeNS(null, "width", maxBoxSide + "");
                box.setAttributeNS(null, "height", maxBoxSide + "");
                //box.setAttributeNS(null, "class", parityString + "Checker");
                box.style.stroke = "black";
                box.style.fill = "white";
                boardSvg.appendChild(box);

                var text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
                var textX = boxX + 2 * maxBoxSide / 6;
                var textY = boxY + 2 * maxBoxSide / 3;
                text.style.fontSize = maxBoxSide / 2 + "px";
                text.setAttributeNS(null, "x", textX + "");
                text.setAttributeNS(null, "y", textY + "");
                text.innerHTML = "" + this.position.realizations[rowIndex][colIndex];
                if (this.position.isRealizationCollapsed(rowIndex)) {
                    text.style.fill = "red";
                } else {
                    text.style.fill = "black";
                }
                boardSvg.appendChild(text);
            }
        }
    }

    /**
     * Handles the mouse click.
     */
    ,getNextPositionFromClick: function(event, currentPlayer, containerElement, player) {
        var pileIndex = event.target.column;
        var maxSticks = this.position.maxTakeableFromPile(pileIndex);
        this.destroyPopup();
        //console.log("Clicked triangle!");
        var self = this;
        //create the popup
        this.popup = document.createElement("div");
        for (var i = 1; i <= maxSticks; i++) {
            var button = document.createElement("button");
            button.appendChild(toNode("" + i));
            button.number = i;
            var extraNum = i;
            button.onclick = function(event) {
                var source = event.currentTarget; //event.target doesn't work!
                self.destroyPopup();
                if (self.movesChosen == 1) {
                    //we've already chosen one move; this is the second part
                    var option = self.position.playAtTwoPiles(self.firstPileIndex, self.firstNumSticks, pileIndex, source.number);
                    self.movesChosen = 0;
                    player.sendMoveToRef(option);
                } else {
                    //prompt to ask whether we're making a second move
                    self.popup = document.createElement("div");
                    var doneButton = document.createElement("button");
                    doneButton.appendChild(toNode("Just that move."));
                    doneButton.onclick = function() {
                        var option = self.position.playAtPile(pileIndex, source.number);
                        self.destroyPopup();
                        player.sendMoveToRef(option);
                    };
                    self.popup.appendChild(doneButton);
                    var quantumButton = document.createElement("button");
                    quantumButton.appendChild(toNode("Add a second move."));
                    quantumButton.onclick = function() {
                        console.log("Choose another pile!");
                        self.movesChosen = 1;
                        self.firstPileIndex = pileIndex;
                        self.firstNumSticks = source.number;
                        self.destroyPopup();
                    };
                    self.popup.appendChild(quantumButton);

                    self.popup.style.position = "fixed";
                    self.popup.style.display = "block";
                    self.popup.style.opacity = 1;
                    self.popup.width = Math.min(window.innerWidth/2, 100);
                    self.popup.height = Math.min(window.innerHeight/2, 50);
                    self.popup.style.left = event.clientX + "px";
                    self.popup.style.top = event.clientY + "px";
                    document.body.appendChild(self.popup);
                }


            };
            this.popup.appendChild(button);
        }

        this.popup.style.position = "fixed";
        this.popup.style.display = "block";
        this.popup.style.opacity = 1;
        this.popup.width = Math.min(window.innerWidth/2, 100);
        this.popup.height = Math.min(window.innerHeight/2, 50);
        this.popup.style.left = event.clientX + "px";
        this.popup.style.top = event.clientY + "px";
        document.body.appendChild(this.popup);
        return null;


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


});  //end of InteractiveQuantumNimView

/**
 * View Factory for Quantum Nim
 */
var InteractiveQuantumNimViewFactory = Class.create({
    /**
     * Constructor
     */
    initialize: function() {
    }

    /**
     * Returns an interactive view
     */
    ,getInteractiveBoard: function(position) {
        return new InteractiveQuantumNimView(position);
    }

    /**
     * Returns a view.
     */
    ,getView: function(position) {
        return this.getInteractiveBoard(position);
    }

}); //end of InteractiveQuantumNimViewFactory

/**
 * Launches a new Quantum Nim game.
 * TODO: add an option to choose the initial density of purple cells
 */
function newQuantumNimGame() {
    var viewFactory = new InteractiveQuantumNimViewFactory();
    var playDelay = 1000;
    var playerOptions = getCommonPlayerOptions(viewFactory, playDelay, 1, 5);
    var width = parseInt($('boardWidth').value);
    var height = parseInt($('boardHeight').value);
    var controlForm = $('gameOptions');
    var leftPlayer = parseInt(getSelectedRadioValue(controlForm.elements['leftPlayer']));
    var rightPlayer =  parseInt(getSelectedRadioValue(controlForm.elements['rightPlayer']));
    var game = new QuantumNim(height, width, 4);
    var players = [playerOptions[leftPlayer], playerOptions[rightPlayer]];
    var ref = new Referee(game, players, viewFactory, "MainGameBoard", $('messageBox'), controlForm);
}



/////////////////////////////// Demi-Quantum Nim /////////////////////////////////////////

/**
 * Demi-Quantum Nim position.
 *
 * Piles are stored in a 2D array of ints.  Each element is a realization.
 */
var DemiQuantumNim = Class.create(CombinatorialGame, {

    /**
     * Constructor.
     */
    initialize: function(numRealizations, numPiles, maxPileSize) {
        this.playerNames = ["Left", "Right"];
        this.realizations = new Array();
        for (var i = 0; i < numRealizations; i++) {
            var realization = new Array();
            for (var j = 0; j < numPiles; j++) {
                var pile = Math.floor(Math.random() * (maxPileSize + 1));
                realization.push(pile);
            }
            this.realizations.push(realization);
        }
    }

    /**
     * Returns the width of this board.
     */
    ,getWidth: function() {
        if (this.getHeight() == 0) {
            return 0;
        } else {
            return this.realizations[0].length;
        }
    }

    /**
     * Returns the number of realizations.
     */
    ,getNumRealizations: function() {
        return this.getHeight();
    }

    /**
     * Returns the height of this board.
     */
    ,getHeight: function() {
        return this.realizations.length;
    }

    /**
     * Returns the number of piles.
     */
    ,getNumPiles: function() {
        return this.getWidth();
    }

    /**
     * Equals!
     */
    ,equals: function(other) {
        //check that the dimensions match
        if (this.getWidth() != other.getWidth() || this.getHeight() != other.getHeight()) {
            return false;
        }
        //now check that all the cells are equal
        for (var realization = 0; realization < this.realizations.length; realization++) {
            for (var pile = 0; pile < this.realizations[realization].length; pile++) {
                if (this.realizations[realization][pile] != other.realizations[realization][pile]) {
                    return false;
                }
            }
        }
        return true;
    }

    /**
     * Clone.
     */
    ,clone: function() {
        var width = this.getWidth();
        var height = this.getHeight();
        var other = new DemiQuantumNim(height, width, 5);
        for (var realization = 0; realization < height; realization++) {
            for (var pile = 0; pile < width; pile++) {
                other.realizations[realization][pile] = this.realizations[realization][pile];
            }
        }
        return other;
    }

    /**
     * Returns whether a realization is collapsed out.
     */
    ,isRealizationCollapsed: function(realizationIndex) {
        //console.log("realizationIndex: " + realizationIndex);
        for (var pileIndex = 0; pileIndex < this.getNumPiles(); pileIndex++) {
            if (this.realizations[realizationIndex][pileIndex] < 0) {
                return true;
            }
        }
        return false;
    }

    /**
     * Returns whether a player can play on one of the columns.
     */
    ,canPlayPile: function(pileIndex) {
        //var column = this.columns[columnIndex];
        for (var rIndex = 0; rIndex < this.getNumRealizations(); rIndex++) {
            if (this.realizations[rIndex][pileIndex] > 0 && ! this.isRealizationCollapsed(rIndex)) {
                //there are positive sticks in this pile in a non-collapsed realization
                return true;
            }
        }
        return false;
    }

    /**
     * Returns whether a player can play on one of the columns.
     */
    ,maxTakeableFromPile: function(pileIndex) {
        //var column = this.columns[columnIndex];
        var maxPileSize = 0;
        for (var rIndex = 0; rIndex < this.getNumRealizations(); rIndex++) {
            if (!this.isRealizationCollapsed(rIndex)) {
                maxPileSize = Math.max(maxPileSize, this.realizations[rIndex][pileIndex]);
            }
        }
        return maxPileSize;
    }

    /**
     * Returns the position that results in a player playing in a column.
     */
    ,playAtPile: function(pileIndex, numSticks) {
        if (this.maxTakeableFromPile(pileIndex) < numSticks) {
            return null;  //TODO: throw an error?
        }
        var option = this.clone();
        for (var rIndex = 0; rIndex < this.getNumRealizations(); rIndex++) {
            if (!this.isRealizationCollapsed(rIndex)) {
                var realization = option.realizations[rIndex];
                realization[pileIndex] -= numSticks;
            }
        }
        return option;
    }

    /**
     * Gets the options.
     */
    ,getOptionsForPlayer: function(playerId) {
        var options = new Array();
        for (var pileIndex = 0; pileIndex < this.getNumPiles(); pileIndex++) {
            var maxSticks = this.maxTakeableFromPile(pileIndex);
            for (var numSticks = 1; numSticks <= maxSticks; numSticks++) {
                options.push(this.playAtPile(pileIndex, numSticks));
            }
        }
        return options;
    }

}); //end of DemiQuantumNim class




var InteractiveDemiQuantumNimView = Class.create({

    /**
     * Constructor.
     */
    initialize: function(position) {
        this.position = position;
    }

    /**
     * Draws the board.
     */
    ,draw: function(containerElement, listener) {
        //clear out the other children of the container element
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

        var width = this.position.getWidth();
        var height = this.position.getHeight();

        //get some dimensions based on the canvas size
        var maxBoxWidth = (boardPixelSize - 10) / width;
        var maxBoxHeight = (boardPixelSize - 10) / (height + 1);
        var maxBoxSide = Math.min(maxBoxWidth, maxBoxHeight);

        //draw the board
        for (var colIndex = 0; colIndex < width; colIndex++) {
            //draw the triangle at the top of the column
            if (this.position.canPlayPile(colIndex)) {
                //draw the triangle above the column.  This is where the player will press to select the column.
                //from Robert Longson's answer here: https://stackoverflow.com/questions/45773273/draw-svg-polygon-from-array-of-points-in-javascript
                var triangle = document.createElementNS(svgNS, "polygon");
                triangle.style.stroke = "black";
                var topLeftPoint = boardSvg.createSVGPoint();
                topLeftPoint.x = colIndex * maxBoxSide + 15;
                topLeftPoint.y = 10;
                triangle.points.appendItem(topLeftPoint);
                var topRightPoint = boardSvg.createSVGPoint();
                topRightPoint.x = (colIndex+1) * maxBoxSide + 5;
                topRightPoint.y = 10;
                triangle.points.appendItem(topRightPoint);
                var bottomPoint = boardSvg.createSVGPoint();
                bottomPoint.x = (colIndex + .5) * maxBoxSide + 10;
                bottomPoint.y = 5 + maxBoxSide;
                triangle.points.appendItem(bottomPoint);
                triangle.style.fill = "black";
                boardSvg.appendChild(triangle);
                //set the listener for the triangle
                if (listener != undefined) {
                    triangle.column = colIndex;
                    var player = listener;
                    triangle.onclick = function(event) {player.handleClick(event);}
                }
                console.log("drawing triangle: " + triangle);
            }
            //draw the boxes in this column
            for (var rowIndex = 0; rowIndex < height; rowIndex ++) {
                var box = document.createElementNS(svgNS,"rect");
                var boxX = (10 + colIndex * maxBoxSide);
                var boxY = (10 + (rowIndex + 1) * maxBoxSide);
                box.setAttributeNS(null, "x", boxX + "");
                box.setAttributeNS(null, "y", boxY + "");
                box.setAttributeNS(null, "width", maxBoxSide + "");
                box.setAttributeNS(null, "height", maxBoxSide + "");
                //box.setAttributeNS(null, "class", parityString + "Checker");
                box.style.stroke = "black";
                box.style.fill = "white";
                boardSvg.appendChild(box);

                var text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
                var textX = boxX + maxBoxSide / 3;
                var textY = boxY + 2* maxBoxSide / 3;
                text.style.fontSize = maxBoxSide / 2 + "px";
                text.setAttributeNS(null, "x", textX + "");
                text.setAttributeNS(null, "y", textY + "");
                text.innerHTML = "" + this.position.realizations[rowIndex][colIndex];
                if (this.position.isRealizationCollapsed(rowIndex)) {
                    text.style.fill = "red";
                } else {
                    text.style.fill = "black";
                }
                boardSvg.appendChild(text);
            }
        }
    }

    /**
     * Handles the mouse click.
     */
    ,getNextPositionFromClick: function(event, currentPlayer, containerElement, player) {
        var pileIndex = event.target.column;
        var maxSticks = this.position.maxTakeableFromPile(pileIndex);
        this.destroyPopup();
        //console.log("Clicked triangle!");
        var self = this;
        //create the popup
        this.popup = document.createElement("div");
        for (var i = 1; i <= maxSticks; i++) {
            var button = document.createElement("button");
            button.appendChild(toNode("" + i));
            button.number = i;
            var extraNum = i;
            button.onclick = function(event) {
                //console.log("event: " + event);
                var source = event.currentTarget;
                //console.log("source: " + source);
                //console.log("I think my number is: " + source.number);
                //console.log("Other possible number: " + i);
                //console.log("Other possible number: " + extraNum);
                self.destroyPopup();
                var option = self.position.playAtPile(pileIndex, source.number);
                player.sendMoveToRef(option);
            };
            this.popup.appendChild(button);
        }

        this.popup.style.position = "fixed";
        this.popup.style.display = "block";
        this.popup.style.opacity = 1;
        this.popup.width = Math.min(window.innerWidth/2, 100);
        this.popup.height = Math.min(window.innerHeight/2, 50);
        this.popup.style.left = event.clientX + "px";
        this.popup.style.top = event.clientY + "px";
        document.body.appendChild(this.popup);
        return null;


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


});  //end of InteractiveDemiQuantumNimView

/**
 * View Factory for Demi-Quantum Nim
 */
var InteractiveDemiQuantumNimViewFactory = Class.create({
    /**
     * Constructor
     */
    initialize: function() {
    }

    /**
     * Returns an interactive view
     */
    ,getInteractiveBoard: function(position) {
        return new InteractiveDemiQuantumNimView(position);
    }

    /**
     * Returns a view.
     */
    ,getView: function(position) {
        return this.getInteractiveBoard(position);
    }

}); //end of InteractiveDemiQuantumNimViewFactory

/**
 * Launches a new Demi-Quantum Nim game.
 * TODO: add an option to choose the initial density of purple cells
 */
function newDemiQuantumNimGame() {
    var viewFactory = new InteractiveDemiQuantumNimViewFactory();
    var playDelay = 1000;
    var playerOptions = getCommonPlayerOptions(viewFactory, playDelay, 1, 5);
    var width = parseInt($('boardWidth').value);
    var height = parseInt($('boardHeight').value);
    var controlForm = $('gameOptions');
    var leftPlayer = parseInt(getSelectedRadioValue(controlForm.elements['leftPlayer']));
    var rightPlayer =  parseInt(getSelectedRadioValue(controlForm.elements['rightPlayer']));
    var game = new DemiQuantumNim(height, width, 4);
    var players = [playerOptions[leftPlayer], playerOptions[rightPlayer]];
    var ref = new Referee(game, players, viewFactory, "MainGameBoard", $('messageBox'), controlForm);
}




/////////////////////////////// Transverse Wave /////////////////////////////////////


/**
 * Transverse Wave game
 *
 * Grid is stored as a 2D array of booleans.  (Array of columns of cells.)
 */
var TransverseWave = Class.create(CombinatorialGame, {

    /**
     * Constructor.
     * purpleProbability is the likelihood that a single cell is purple
     */
    initialize: function(height, width, purpleProbability) {
        this.playerNames = ["Left", "Right"];
        this.columns = new Array();
        //default probability
        var purpleChance = purpleProbability || .35;
        for (var i = 0; i < width; i++) {
            var column = new Array();
            for (var j = 0; j < height; j++) {
                var isPurple = Math.random() < purpleChance;
                column.push(isPurple);
            }
            this.columns.push(column);
        }
    }

    /**
     * Returns the width of this board.
     */
    ,getWidth: function() {
        return this.columns.length;
    }

    /**
     * Returns the height of this board.
     */
    ,getHeight: function() {
        if (this.getWidth() == 0) {
            return 0;
        } else {
            return this.columns[0].length;
        }
    }

    /**
     * Equals!
     */
    ,equals: function(other) {
        //check that the dimensions match
        if (this.getWidth() != other.getWidth() || this.getHeight() != other.getHeight()) {
            return false;
        }
        //now check that all the cells are equal
        for (var col = 0; col < this.columns.length; col++) {
            for (var row = 0; row < this.columns[col].length; row++) {
                if (this.columns[col][row] != other.columns[col][row]) {
                    return false;
                }
            }
        }
        return true;
    }

    /**
     * Clone.
     */
    ,clone: function() {
        var width = this.getWidth();
        var height = this.getHeight();
        var other = new TransverseWave(height, width);
        for (var col = 0; col < width; col++) {
            for (var row = 0; row < height; row++) {
                other.columns[col][row] = this.columns[col][row];
            }
        }
        return other;
    }

    /**
     * Returns whether a player can play on one of the columns.
     */
    ,canPlayColumn: function(columnIndex) {
        var column = this.columns[columnIndex];
        for (var rowIndex = 0; rowIndex < column.length; rowIndex++) {
            if (! column[rowIndex]) {
                //the cell is not green, so this column can be played on.
                return true;
            }
        }
        return false;
    }

    /**
     * Returns the position that results in a player playing in a column.
     */
    ,playAtColumn: function(columnIndex) {
        if (!this.canPlayColumn(columnIndex)) {
            return null;  //TODO: throw an error?
        }
        var option = this.clone();
        var column = option.columns[columnIndex];
        for (var rowIndex = 0; rowIndex < column.length; rowIndex++) {
            if (column[rowIndex]) {
                //it's already purple in this column; spread the transverse wave; and make all the others purple!
                for (var colIndex = 0; colIndex < option.columns.length; colIndex ++) {
                    option.columns[colIndex][rowIndex] = true;
                }
            } else {
                //it's green here, so make it purple
                option.columns[columnIndex][rowIndex] = true;
            }
        }
        return option;
    }

    /**
     * Gets the options.
     */
    ,getOptionsForPlayer: function(playerId) {
        var options = new Array();
        for (var colIndex = 0; colIndex < this.columns.length; colIndex++) {
            if (this.canPlayColumn(colIndex)) {
                options.push(this.playAtColumn(colIndex));
            }
        }
        return options;
    }

}); // end of TransverseWave class




var InteractiveTransverseWaveView = Class.create({

    /**
     * Constructor.
     */
    initialize: function(position) {
        this.position = position;
    }

    /**
     * Draws the board.
     */
    ,draw: function(containerElement, listener) {
        //clear out the other children of the container element
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

        var width = this.position.getWidth();
        var height = this.position.getHeight();

        //get some dimensions based on the canvas size
        var maxBoxWidth = (boardPixelSize - 10) / width;
        var maxBoxHeight = (boardPixelSize - 10) / (height + 2);
        var maxBoxSide = Math.min(maxBoxWidth, maxBoxHeight);

        //draw the board
        for (var colIndex = 0; colIndex < width; colIndex++) {
            //draw the triangle at the top of the column
            if (this.position.canPlayColumn(colIndex)) {
                //draw the triangle above the column.  This is where the player will press to select the column.
                //from Robert Longson's answer here: https://stackoverflow.com/questions/45773273/draw-svg-polygon-from-array-of-points-in-javascript
                var triangle = document.createElementNS(svgNS, "polygon");
                triangle.style.stroke = "black";
                var topLeftPoint = boardSvg.createSVGPoint();
                topLeftPoint.x = colIndex * maxBoxSide + 15;
                topLeftPoint.y = 10;
                triangle.points.appendItem(topLeftPoint);
                var topRightPoint = boardSvg.createSVGPoint();
                topRightPoint.x = (colIndex+1) * maxBoxSide + 5;
                topRightPoint.y = 10;
                triangle.points.appendItem(topRightPoint);
                var bottomPoint = boardSvg.createSVGPoint();
                bottomPoint.x = (colIndex + .5) * maxBoxSide + 10;
                bottomPoint.y = 5 + maxBoxSide;
                triangle.points.appendItem(bottomPoint);
                triangle.style.fill = "black";
                boardSvg.appendChild(triangle);
                //set the listener for the triangle
                if (listener != undefined) {
                    triangle.column = colIndex;
                    var player = listener;
                    triangle.onclick = function(event) {player.handleClick(event);}
                }
                console.log("drawing triangle: " + triangle);
            }
            //draw the boxes in this column
            for (var rowIndex = 0; rowIndex < height; rowIndex ++) {
                var box = document.createElementNS(svgNS,"rect");
                box.setAttributeNS(null, "x", (10 + colIndex * maxBoxSide) + "");
                box.setAttributeNS(null, "y", (10 + (rowIndex + 2) * maxBoxSide) + "");
                box.setAttributeNS(null, "width", maxBoxSide + "");
                box.setAttributeNS(null, "height", maxBoxSide + "");
                //box.setAttributeNS(null, "class", parityString + "Checker");
                box.style.stroke = "black";
                if (this.position.columns[colIndex][rowIndex]) {
                    box.style.fill = "orchid";
                } else {
                    box.style.fill = "green";
                }
                boardSvg.appendChild(box);
            }
        }
    }

    /**
     * Handles the mouse click.
     */
    ,getNextPositionFromClick: function(event, currentPlayer, containerElement, player) {
        var columnIndex = event.target.column;
        var chosenOption = this.position.playAtColumn(columnIndex);
        player.sendMoveToRef(chosenOption);
    }

}); //end of InteractiveTransverseWaveView class

/**
 * View Factory for Transverse Wave
 */
var InteractiveTransverseWaveViewFactory = Class.create({
    /**
     * Constructor
     */
    initialize: function() {
    }

    /**
     * Returns an interactive view
     */
    ,getInteractiveBoard: function(position) {
        return new InteractiveTransverseWaveView(position);
    }

    /**
     * Returns a view.
     */
    ,getView: function(position) {
        return this.getInteractiveBoard(position);
    }

}); //end of InteractiveTransverseWaveViewFactory

/**
 * Launches a new TransverseWave game.
 * TODO: add an option to choose the initial density of purple cells
 */
function newTransverseWaveGame() {
    var viewFactory = new InteractiveTransverseWaveViewFactory();
    var playDelay = 1000;
    var playerOptions = getCommonPlayerOptions(viewFactory, playDelay, 1, 5);
    var width = parseInt($('boardWidth').value);
    var height = parseInt($('boardHeight').value);
    var controlForm = $('gameOptions');
    var leftPlayer = parseInt(getSelectedRadioValue(controlForm.elements['leftPlayer']));
    var rightPlayer =  parseInt(getSelectedRadioValue(controlForm.elements['rightPlayer']));
    var game = new TransverseWave(height, width);
    var players = [playerOptions[leftPlayer], playerOptions[rightPlayer]];
    var ref = new Referee(game, players, viewFactory, "MainGameBoard", $('messageBox'), controlForm);
}



/////////////////////////////////////// Atropos //////////////////////////////////////////////////////


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
            // console.log(filledCirclesAndColors);
            var circle = filledCirclesAndColors[i];
            // console.log("circle: " + circle);
            if (circle[2] != Atropos.prototype.UNCOLORED) {
                // console.log("Circle array thing: " + [circle[0], circle[1], circle[2]]);
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




function getCommonPlayerOptions(viewFactory, delay, lowAIDifficulty, highAIDifficulty) {
    var highAI = highAIDifficulty || 7;
    var lowAI = lowAIDifficulty || 1;
    var playDelay = delay || 1000;
    var playerOptions = [new HumanPlayer(viewFactory), new RandomPlayer(playDelay)];
    for (var i = lowAI; i <= highAI; i++) {
        playerOptions.push(new DepthSearchPlayer(playDelay, i));
    }
    return playerOptions;

}



/**************************Buttons and Scissors***************************************/

function newButtonsAndScissorsGame() {
    var viewFactory = new InteractiveButtonsAndScissorsViewFactory();
    var playDelay = 1000;
    //var playerOptions = [new HumanPlayer(viewFactory), new RandomPlayer(playDelay), new DepthSearchPlayer(playDelay, 1), new DepthSearchPlayer(playDelay, 3), new DepthSearchPlayer(playDelay, 5), new DepthSearchPlayer(100, 7)];
    var playerOptions = getCommonPlayerOptions(viewFactory, playDelay, 1, 5);
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
ButtonsAndScissors.prototype.PLAYER_NAMES = ["Blue", "Red"];

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
            this.selectedPiece.style.stroke = "Blue";
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

/**
 * Class for ConnectFour ruleset.
 */
var ConnectFour = Class.create(CombinatorialGame, {
    /**
     * Constructor.
     */
    initialize: function(width, height, blockers) {
        this.blocks = [new Array(), new Array()];
        blockers = blockers || [new Array(), new Array()];
        for(var playerId = 0; playerId < blockers.length; playerId++) {
            for (var i = 0; i < blockers[playerId].length; i++) {
                var block = blockers[playerId][i];
                this.blocks[playerId].push([block[0], block[1]]);
            }
        }
        this.playerNames = ["Yellow", "Red"];
        this.width = width;
        this.height = height;
    }

    ,/**
     * toString
     */
    toString: function() {
        for (var i = 0; i < this.blocks.length; i++) {
            if(i == 0) {
                string = "Yellow player currently has blocks at: ";
            }
            else {
                string = "Red player currently has blocks at: ";
            }
            for (var j = 0; j < this.blocks[i].length; j++) {
                string += this.blocks[i][j] + ",";
            }
        }
    }

    ,/**
     * Returns the move options.
     */
    getOptionsForPlayer: function(playerId) {
        var moves = new Array();

        var numberOfBlocks = this.blocks[0].length + this.blocks[1].length;
        for (var player = 0; player < 2; player++) {
            for (var blockNumber = 0; blockNumber < this.blocks[player].length; blockNumber++) {
                var blockX = this.blocks[player][blockNumber][0];
                var blockY = this.blocks[player][blockNumber][1];
                var threeToTheRight = 0;
                if (this.indexOf(this.blocks[player], [blockX+1, blockY]) != -1) {
                    threeToTheRight++;
                }
                if (this.indexOf(this.blocks[player], [blockX+2, blockY]) != -1) {
                    threeToTheRight++;
                }
                if (this.indexOf(this.blocks[player], [blockX+3, blockY]) != -1) {
                    threeToTheRight++;
                }
                if(threeToTheRight == 3) {
                    return moves;
                }

                var threeGoingDown = 0;
                if (this.indexOf(this.blocks[player], [blockX, blockY+1]) != -1) {
                    threeGoingDown++;
                }
                if (this.indexOf(this.blocks[player], [blockX, blockY+2]) != -1) {
                    threeGoingDown++;
                }
                if (this.indexOf(this.blocks[player], [blockX, blockY+3]) != -1) {
                    threeGoingDown++;
                }
                if(threeGoingDown == 3) {
                    return moves;
                }

                var threeGoingUpDiagonally = 0;
                if (this.indexOf(this.blocks[player], [blockX+1, blockY-1]) != -1) {
                    threeGoingUpDiagonally++;
                }
                if (this.indexOf(this.blocks[player], [blockX+2, blockY-2]) != -1) {
                    threeGoingUpDiagonally++;
                }
                if (this.indexOf(this.blocks[player], [blockX+3, blockY-3]) != -1) {
                    threeGoingUpDiagonally++;
                }
                if(threeGoingUpDiagonally == 3) {
                    return moves;
                }

                var threeGoingDownDiagonally = 0;
                if (this.indexOf(this.blocks[player], [blockX+1, blockY+1]) != -1) {
                    threeGoingDownDiagonally++;
                }
                if (this.indexOf(this.blocks[player], [blockX+2, blockY+2]) != -1) {
                    threeGoingDownDiagonally++;
                }
                if (this.indexOf(this.blocks[player], [blockX+3, blockY+3]) != -1) {
                    threeGoingDownDiagonally++;
                }
                if(threeGoingDownDiagonally == 3) {
                    return moves;
                }

            }
        }

        for (var column = 0; column < this.width; column++) {
            var row = this.height-1;
            while((this.indexOf(this.blocks[0],[column,row]) != -1) || (this.indexOf(this.blocks[1],[column,row]) != -1)) {
                if(row < 0) {
                    break;
                }
                row--;
            }
            if(row >= 0) {
                var option = this.clone();
                option.blocks[playerId].push([column, row]);
                moves.push(option);
            }
        }
        return moves;
    }

    ,/**
     * equals
     */
    equals: function(other) {
        for (var player = 0; player < this.blocks.length; player++) {
            for (var i = 0; i < this.blocks[player].length; i++) {
                var block = this.blocks[player][i];
                var otherHasBlock = false;
                for (var j = 0; j < other.blocks[player].length; j++) {
                    var otherBlock = other.blocks[player][j];
                    if (block[0] == otherBlock[0] && block[1] == otherBlock[1]) {
                        otherHasBlock = true;
                        break;
                    }
                }
                if (!otherHasBlock) return false;
            }
        }

        for (var player = 0; player < other.blocks.length; player++) {
            for (var i = 0; i < other.blocks[player].length; i++) {
                var otherBlock = other.blocks[player][i];
                var thisHasBlock = false;
                for (var j = 0; j < this.blocks[player].length; j++) {
                    var block = this.blocks[player][j];
                    if (block[0] == otherBlock[0] && block[1] == otherBlock[1]) {
                        thisHasBlock = true;
                        break;
                    }
                }
                if (!thisHasBlock) return false;
            }
        }
        return true;
    }

    ,/**
     * Clones
     */
    clone: function() {
        return new ConnectFour(this.width, this.height, this.blocks);
    }

    ,/**
     * Creates an indexOf with arrays in arrays
     */
    indexOf: function(array, element) {
        for (var i = 0; i < array.length; i++) {
            if ((array[i][0] == element[0]) && (array[i][1] == element[1])) {
                return i;
            }
        }
        return -1;
    }

}); //end of ConnectFour class
ConnectFour.prototype.PLAYER_NAMES = ["Yellow", "Red"];


var InteractiveSVGConnectFourView = Class.create({

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
                // var parityString = "even";
                // if ((i+j) % 2 == 1) {
                //     parityString = "odd";
                // }
                var checkerTile = document.createElementNS(svgNS,"rect");
                checkerTile.setAttributeNS(null, "x", (i * 100) + "");
                checkerTile.setAttributeNS(null, "y", (j * 100) + "");
                checkerTile.setAttributeNS(null, "width", "100");
                checkerTile.setAttributeNS(null, "height", "100");
                // checkerTile.setAttributeNS(null, "class", parityString + "Checker");
                checkerTile.setAttributeNS(null, "class", "connectFour");
                boardSvg.appendChild(checkerTile);
                if (listener != undefined) {
                    var player = listener;
                    checkerTile.onclick = function(event) {player.handleClick(event);}
                }

            }
        }

        //draw the pieces
        for (var playerId = 0; playerId < 2; playerId++) {
            for (var i =0; i < this.position.blocks[playerId].length; i++) {
                var block = this.position.blocks[playerId][i];
                var column = block[0];
                var row = block[1];
                var piece = document.createElementNS(svgNS, "circle");
                piece.setAttributeNS(null, "cx", new String((10 + column * 100)+40));
                piece.setAttributeNS(null, "cy", new String((10 + row * 100)+40));
                //these two lines round the corners
                piece.setAttributeNS(null, "r", "50");
                // dominoRect.setAttributeNS(null, "ry", "10");
                // dominoRect.setAttributeNS(null, "width", new String(100 * (1 + playerId) - 20));
                // dominoRect.setAttributeNS(null, "height", new String(100 * (2 - playerId) - 20));
                piece.setAttributeNS(null, "class", "piece");
                if(playerId == 1) {
                    piece.setAttributeNS(null, "class", "red");
                }
                if(playerId == 0) {
                    piece.setAttributeNS(null, "class", "yellow");
                }
                boardSvg.appendChild(piece);
            }
        }

    }

    ,/**
     * Selects a tile.
     */
    selectTile: function(tile) {
        this.selectedTile = tile;
        this.selectedTile.oldColor = this.selectedTile.style.fill;
        this.selectedTile.style.fill = "red";
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
    getNextPositionFromElementLocations: function(element, containerElement, currentPlayer) {
        // //measure the distance between rectangle corners
        // var xDistance = Math.abs(secondElement.x.baseVal.value - firstElement.x.baseVal.value);
        // var yDistance = Math.abs(secondElement.y.baseVal.value - firstElement.y.baseVal.value);
        // //make sure this is correct for the current player
        // if ((xDistance == 100 * currentPlayer) && (yDistance == 100*(1-currentPlayer))) {
            var column = element.x.baseVal.value / 100;
            console.log("The column is: " + column);
            var row = element.y.baseVal.value/ 100;
            // if(row != )
            var nextPosition = this.position.clone();
            //console.log("New domino at [" + column + ", " + row + "]");
            nextPosition.blocks[currentPlayer].push([column, row]);
            return nextPosition;
        // } else {
        //     return null;
        // }
    }

    ,/**
     * Handles a mouse click.
     */
    getNextPositionFromClick: function(event, currentPlayer, containerElement) {
        var clickedTile = event.target; //this will be a tile
        console.log("clickedTile: " + clickedTile);
        // if (this.selectedTile == undefined) {
        //     this.selectTile(clickedTile);
        //     return null;
        // } else {
            var nextPosition = this.getNextPositionFromElementLocations(clickedTile, containerElement, currentPlayer);
            // this.deselectTile();
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
        // }
    }
});  //end of InteractiveSVGConnectFourView

var InteractiveSVGConnectFourViewFactory = Class.create({
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
        return new InteractiveSVGConnectFourView(position);
    }

    ,/**
     * Returns a view.
     */
    getView: function(position) {
        return this.getInteractiveBoard(position);
    }

}); //end of InteractiveSVGDomineeringViewFactory

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
Clobber.prototype.PLAYER_NAMES = ["Blue", "Red"];

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
Clobbineering.prototype.PLAYER_NAMES = ["Blue/Vertical", "Red/Horizontal"];


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
                checkerTile.style.fill = "red";
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
    simplify: function() {
        var clone = this.clone();
        for (var playerId = 0; playerId < 2; playerId++) {
            while (clone.dominoes[playerId].length > 0) {
                //domino is upper-left corner of domino
                var domino = clone.dominoes[playerId].pop();
                console.log("Pushing the domino: " + domino);
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
            // console.log("options: " + options);
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
                var allBlocks = this.simplify();

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
                var allBlocks = this.simplify();

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
Domineering.prototype.PLAYER_NAMES = ["Vertical", "Horizontal"];


/**
 * Class for Manalath
 * @author: Christina Shatney.
 */
var Manalath = Class.create(CombinatorialGame, {

    /**
     * Constructor
     */
    initialize: function(width, height, blockedSpaces) {
        blockedSpaces = blockedSpaces || [new Array(), new Array()];
        this.blockedSpaces = [new Array(), new Array()];
        for (var i = 0; i < blockedSpaces.length; i++) {
            for (var j = 0; j < blockedSpaces[i].length; j++) {
                var blockedSpace = blockedSpaces[i][j];
                this.blockedSpaces[i].push([blockedSpace[0], blockedSpace[1]]);
            }
        }
        this.width = width;
        this.height = height;
        this.playerNames = ["Blue", "Red"];
    }

    /**
     * toString
     */
    ,toString: function() {
        string = "Manalath position: \n";
        for (var i = 0; i < this.blockedSpaces.length; i++) {
            string += "  " + this.playerNames[i] + "-colored: ";
            for (var j = 0; j < this.blockedSpaces[i].length; j++) {
                string += "(" + this.blockedSpaces[i][j] + "), ";
            }
            string += "\n";
        }
        return string;
    }

    ,/**
     * indexOf for arrays in arrays
     */
     indexOf: function(array, block) {
        for (var i = 0; i < array.length; i++) {
            if((array[i][0] == block[0]) && (array[i][1] == block[1])) {
                return i;
            }
        }
        return -1;
    }

    ,/**
     * Looks at what group a block is a part of
     */
    sameColorGroupABlockIsIn: function(block, player) {
        var group = new Array();
        group.push(block);
        for (var i = 0; i < group.length; i++) {
            var block = group[i];
            if(block[1] < Math.floor(this.height/2)) {
                var down = block[1]+1;
                var up = block[1]-1;
                var toTheRight = block[0]+1;
                var toTheLeft = block[0]-1;
                for (var j = 0; j < this.blockedSpaces[player].length; j++) {
                    //Same x, down to the left
                    if (((block[0] == this.blockedSpaces[player][j][0]) && (down == this.blockedSpaces[player][j][1]))) {
                        if (this.indexOf(group, this.blockedSpaces[player][j]) == -1) {
                            group.push(this.blockedSpaces[player][j]);
                        }
                    }
                    //down to the right
                    else if (((toTheRight == this.blockedSpaces[player][j][0]) && (down == this.blockedSpaces[player][j][1]))) {
                        if (this.indexOf(group, this.blockedSpaces[player][j]) == -1) {
                            group.push(this.blockedSpaces[player][j]);
                        }
                    }
                    //Same y, to the right
                    else if (((toTheRight == this.blockedSpaces[player][j][0]) && (block[1] == this.blockedSpaces[player][j][1]))) {
                        if (this.indexOf(group, this.blockedSpaces[player][j]) == -1) {
                            group.push(this.blockedSpaces[player][j]);
                        }
                    }
                    //Same y, to the left
                    else if (((toTheLeft == this.blockedSpaces[player][j][0]) && (block[1] == this.blockedSpaces[player][j][1]))) {
                        if (this.indexOf(group, this.blockedSpaces[player][j]) == -1) {
                            group.push(this.blockedSpaces[player][j]);
                        }
                    }
                    //up, to the right
                    else if (((block[0] == this.blockedSpaces[player][j][0]) && (up == this.blockedSpaces[player][j][1]))) {
                        if (this.indexOf(group, this.blockedSpaces[player][j]) == -1) {
                            group.push(this.blockedSpaces[player][j]);
                        }
                    }
                    //up, to the left
                    else if (((toTheLeft == this.blockedSpaces[player][j][0]) && (up == this.blockedSpaces[player][j][1]))) {
                        if (this.indexOf(group, this.blockedSpaces[player][j]) == -1) {
                            group.push(this.blockedSpaces[player][j]);
                        }
                    }
                }
            }

            else if(block[1] == Math.floor(this.height/2)) {
                var down = block[1]+1;
                var up = block[1]-1;
                var toTheRight = block[0]+1;
                var toTheLeft = block[0]-1;
                for (var j = 0; j < this.blockedSpaces[player].length; j++) {
                    //down to the left
                    if (((toTheLeft == this.blockedSpaces[player][j][0]) && (down == this.blockedSpaces[player][j][1]))) {
                        if (this.indexOf(group, this.blockedSpaces[player][j]) == -1) {
                            group.push(this.blockedSpaces[player][j]);
                        }
                    }
                    //down to the right
                    else if (((block[0] == this.blockedSpaces[player][j][0]) && (down == this.blockedSpaces[player][j][1]))) {
                        if (this.indexOf(group, this.blockedSpaces[player][j]) == -1) {
                            group.push(this.blockedSpaces[player][j]);
                        }
                    }
                    //Same y, to the right
                    else if (((toTheRight == this.blockedSpaces[player][j][0]) && (block[1] == this.blockedSpaces[player][j][1]))) {
                        if (this.indexOf(group, this.blockedSpaces[player][j]) == -1) {
                            group.push(this.blockedSpaces[player][j]);
                        }
                    }
                    //Same y, to the left
                    else if (((toTheLeft == this.blockedSpaces[player][j][0]) && (block[1] == this.blockedSpaces[player][j][1]))) {
                        if (this.indexOf(group, this.blockedSpaces[player][j]) == -1) {
                            group.push(this.blockedSpaces[player][j]);
                        }
                    }
                    //up, to the right
                    else if (((block[0] == this.blockedSpaces[player][j][0]) && (up == this.blockedSpaces[player][j][1]))) {
                        if (this.indexOf(group, this.blockedSpaces[player][j]) == -1) {
                            group.push(this.blockedSpaces[player][j]);
                        }
                    }
                    //up, to the left
                    else if (((toTheLeft == this.blockedSpaces[player][j][0]) && (up == this.blockedSpaces[player][j][1]))) {
                        if (this.indexOf(group, this.blockedSpaces[player][j]) == -1) {
                            // console.log("Pushing the block6: " + this.blockedSpaces[player][j]);
                            group.push(this.blockedSpaces[player][j]);
                        }
                    }
                }
            }


            else if(block[1] > Math.floor(this.height/2)) {
                var down = block[1]+1;
                var up = block[1]-1;
                var toTheRight = block[0]+1;
                var toTheLeft = block[0]-1;
                for (var j = 0; j < this.blockedSpaces[player].length; j++) {
                    //down to the left
                    if (((toTheLeft == this.blockedSpaces[player][j][0]) && (down == this.blockedSpaces[player][j][1]))) {
                        if (this.indexOf(group, this.blockedSpaces[player][j]) == -1) {
                            group.push(this.blockedSpaces[player][j]);
                        }
                    }
                    //down to the right
                    else if (((block[0] == this.blockedSpaces[player][j][0]) && (down == this.blockedSpaces[player][j][1]))) {
                        if (this.indexOf(group, this.blockedSpaces[player][j]) == -1) {
                            group.push(this.blockedSpaces[player][j]);
                        }
                    }
                    //Same y, to the right
                    else if (((toTheRight == this.blockedSpaces[player][j][0]) && (block[1] == this.blockedSpaces[player][j][1]))) {
                        if (this.indexOf(group, this.blockedSpaces[player][j]) == -1) {
                            group.push(this.blockedSpaces[player][j]);
                        }
                    }
                    //Same y, to the left
                    else if (((toTheLeft == this.blockedSpaces[player][j][0]) && (block[1] == this.blockedSpaces[player][j][1]))) {
                        if (this.indexOf(group, this.blockedSpaces[player][j]) == -1) {
                            // console.log("Pushing the block4: " + this.blockedSpaces[player][j]);
                            group.push(this.blockedSpaces[player][j]);
                        }
                    }
                    //up, to the right
                    else if (((toTheRight == this.blockedSpaces[player][j][0]) && (up == this.blockedSpaces[player][j][1]))) {
                        if (this.indexOf(group, this.blockedSpaces[player][j]) == -1) {
                            // console.log("Pushing the block5: " + this.blockedSpaces[player][j]);
                            group.push(this.blockedSpaces[player][j]);
                        }
                    }
                    //up, to the left
                    else if (((block[0] == this.blockedSpaces[player][j][0]) && (up == this.blockedSpaces[player][j][1]))) {
                        if (this.indexOf(group, this.blockedSpaces[player][j]) == -1) {
                            // console.log("Pushing the block6: " + this.blockedSpaces[player][j]);
                            group.push(this.blockedSpaces[player][j]);
                        }
                    }
                }
            }

        }
        return group;
    }


    ,/**
     * indexOf for arrays in arrays
     */
    indexOfArray: function(mainArray, array) {
        var counter = 0;
        for (var i = 0; i < mainArray.length; i++) {
            for (var j = 0; j < mainArray[i].length; j++) {
                for (var k=0; k < array.length; k++) {
                    if ((mainArray[i][j][0] == array[k][0]) && (mainArray[i][j][1] == array[k][1])) {
                        counter++;
                    }
                }
                if (counter == mainArray[i].length) {
                    return i;
                }
            }
        }
        return -1;
    }


    ,/**
     * Returns an array of arrays of groups for each player
     */
    allGroupsOfSameColor: function() {
        var allGroups = [new Array(), new Array()];
        var array = new Array();
        for (var player = 0; player < this.blockedSpaces.length; player++) {
            for (var i = 0; i < this.blockedSpaces[player].length; i++) {
                array = this.sameColorGroupABlockIsIn(this.blockedSpaces[player][i], player)
                if (this.indexOfArray(allGroups[player], array) == -1) {
                    allGroups[player].push(array);
                }
            }
        }
        return allGroups;
    }



    ,/**
     * Clone
     */
    clone: function() {
        return new Manalath(this.width, this.height, this.blockedSpaces);
    }

    ,/**
     * Equals
     */
    equals: function(other) {
        for (var player = 0; player < this.blockedSpaces.length; player++) {
            for (var i = 0; i < this.blockedSpaces[player].length; i++) {
                var block = this.blockedSpaces[player][i];
                var otherHasBlock = false;
                for (var j = 0; j < other.blockedSpaces[player].length; j++) {
                    var otherBlock = other.blockedSpaces[player][j];
                    if (block[0] == otherBlock[0] && block[1] == otherBlock[1]) {
                        otherHasBlock = true;
                        break;
                    }
                }
                if (!otherHasBlock) return false;
            }
        }

        for (var player = 0; player < other.blockedSpaces.length; player++) {
            for (var i = 0; i < other.blockedSpaces[player].length; i++) {
                var otherBlock = other.blockedSpaces[player][i];
                var thisHasBlock = false;
                for (var j = 0; j < this.blockedSpaces[player].length; j++) {
                    var block = this.blockedSpaces[player][j];
                    if (block[0] == otherBlock[0] && block[1] == otherBlock[1]) {
                        thisHasBlock = true;
                        break;
                    }
                }
                if (!thisHasBlock) return false;
            }
        }
        return true;
    }

    ,/**
     * Returns boards with available moves
     */
    getOptionsForPlayer: function(playerId) {
        //Follows proper rules assuming you can only play your color
        var options = new Array();
        var option0;
        var option;
        var option1;

        var groups = this.allGroupsOfSameColor();
        for(var i = 0; i < groups[playerId].length; i++) {
            if (groups[playerId][i].length == 4){
                for (var row = 0; row < this.height; row++) {
                    var widthMeasure;
                    if (row == Math.floor(this.height/2)) {
                        widthMeasure = this.width+Math.floor(this.height/2)
                    } else if (row > Math.floor(this.height/2)) {
                        widthMeasure = this.width+(this.height-row-1);
                    } else if (row < Math.floor(this.height/2)) {
                        widthMeasure = this.width+row;
                    }
                    for (var column = 0; column < widthMeasure; column++) {
                        option0 = this.clone();
                        option0.blockedSpaces[playerId].push([column, row]);
                        var allGroupsOfSameColor0 = option0.allGroupsOfSameColor();
                        var counter0 = 0;
                        for (var i = 0; i < allGroupsOfSameColor0[playerId].length; i++) {
                            if (allGroupsOfSameColor0[playerId][i].length == 5) {
                                counter0++;
                            }
                        }
                        var counter2 = 0;
                        for (var player = 0; player < this.blockedSpaces.length; player++) {
                            for (var i = 0; i < this.blockedSpaces[player].length; i++) {
                                if ((this.blockedSpaces[player][i][0] == column) && (this.blockedSpaces[player][i][1] == row)) {
                                    counter2++;
                                    break;
                                }
                            }
                        }
                        if((counter0 > 0) && (counter2 == 0)) {
                            options.push(option0);
                        }
                    }
                }
                return options;
            }
        }





        for (var i = 0; i < groups[Math.abs((playerId%2)-1)].length; i++) {
            if (groups[Math.abs((playerId%2)-1)][i].length == 5) {
                return options;
            }
        }

        for (var row = 0; row < this.height; row++) {
            var widthMeasure;
            if (row == Math.floor(this.height/2)) {
                widthMeasure = this.width+Math.floor(this.height/2)
            } else if (row > Math.floor(this.height/2)) {
                widthMeasure = this.width+(this.height-row-1);
            } else if (row < Math.floor(this.height/2)) {
                widthMeasure = this.width+row;
            }
            for (var column = 0; column < widthMeasure; column++) {
                option = this.clone();
                option.blockedSpaces[playerId].push([column, row]);
                var allGroupsOfSameColor = option.allGroupsOfSameColor();
                var counter = 0;
                var counter1 = 0;
                var newGroupsOfFour;
                for (var i = 0; i < allGroupsOfSameColor[playerId].length; i++) {
                    if ((allGroupsOfSameColor[playerId][i].length == 4) || (allGroupsOfSameColor[playerId][i].length > 5)) {
                        counter++;
                    }
                }
                for (var player = 0; player < this.blockedSpaces.length; player++) {
                    for (var i = 0; i < this.blockedSpaces[player].length; i++) {
                        if ((this.blockedSpaces[player][i][0] == column) && (this.blockedSpaces[player][i][1] == row)) {
                            counter++;
                            counter1++;
                            break;
                        }
                    }
                }

                option1 = this.clone();
                option1.blockedSpaces[Math.abs((playerId%2)-1)].push([column, row]);
                var allGroupsOfSameColor1 = option1.allGroupsOfSameColor();
                for (var i = 0; i < allGroupsOfSameColor1[Math.abs((playerId%2)-1)].length; i++) {
                    if (allGroupsOfSameColor1[Math.abs((playerId%2)-1)][i].length > 4) {
                        counter1++;
                    }
                }
                if(counter1 == 0) {
                    options.push(option1);
                }

                if(counter == 0) {
                    options.push(option);
                }
            }
        }
        return options;
    }

    /**
     * Returns the color of a circle.
     */
    ,getCircleColor: function(column, row) {
        for (var i = 0; i < this.blockedSpaces.length; i++) {
            for (var j = 0; j< this.blockedSpaces[i].length; j++) {
                var blockedSpace = this.blockedSpaces[i][j];
                if ((blockedSpace[0] == column) && (blockedSpace[1] == row)) {
                    return i;
                }
            }
        }
        return Manalath.prototype.UNCOLORED;
    }

    ,/**
     * Returns the board with a possible move
     */
    getOptionWith: function(column, row, color) {
        var clone = this.clone();
        clone.blockedSpaces[color].push([column, row]);
        return clone;
    }
});
Manalath.prototype.BLUE = 0;
Manalath.prototype.RED = 1;
Manalath.prototype.UNCOLORED = 2;
Manalath.prototype.PLAYER_NAMES = ["Blue", "Red"];



var InteractiveManalathView = Class.create({

    initialize: function(position) {
        this.position = position;
        this.selectedElement = undefined;
        this.popup = null;
    }

    // //Adapted from https://gist.github.com/bencates/5b490ed79796cbd35863
    // ,hexPoints: function(x, y, radius) {
    //   var points = [];
    //   for (var theta = 0; theta < Math.PI * 2; theta += Math.PI / 3) {
    //     var pointX, pointY;
    //
    //     pointX = x + radius * Math.sin(theta);
    //     pointY = y + radius * Math.cos(theta);
    //
    //     points.push(pointX + ',' + pointY);
    //   }
    //
    //   return points.join(' ');
    // }

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
        //var boardPixelSize = 10 + (this.position.sideLength + 4) * 100
        boardSvg.setAttributeNS(null, "width", 10 + (this.position.width+Math.floor(this.position.height/2)) * 100);
        boardSvg.setAttributeNS(null, "height", 10 + this.position.height * 100);
        var columnNumber = 0;
        //draw the circles
        for (var row = 0; row < this.position.height; row++) {

            // console.log("column: " + column);
            // console.log("columnNumber: " + columnNumber);
            // if((row == 0) || (row == this.position.height-1)){
            //     for (var column = 0; column < this.position.width; column++) {
            //         console.log("row: " + row);
            //         // columnNumber = column;
            //         var colorInt = this.position.getCircleColor(column, row);
            //         var circle = document.createElementNS(svgNS, "circle");
            //         circle.row = row;
            //         circle.column = column;
            //
            //         circle.setAttributeNS(null, "cx", (column * 100) + 50);
            //         circle.setAttributeNS(null, "cy", (row * 100) + 50);
            //         circle.setAttributeNS(null, "r", 40);
            //         if (colorInt == Manalath.prototype.GRAY) {
            //             circle.setAttributeNS(null, "class", "grayPiece");
            //         } else if (colorInt == Manalath.prototype.BLACK) {
            //             circle.setAttributeNS(null, "class", "blackPiece");
            //         } else {
            //             circle.setAttributeNS(null, "class", "whitePiece");
            //             //only white circles are clickable
            //             if (listener != undefined) {
            //                 var player = listener;
            //                 circle.onclick = function(event) {
            //                     console.log("clicked on: (" + event.target.row + ", " + event.target.column + ")");
            //                     player.handleClick(event);
            //                 };
            //             }
            //         }
            //         boardSvg.appendChild(circle);
            //     }
            // }
            if (row == Math.floor(this.position.height/2)) {
                // console.log("In the other if: " + row);
                for (var column = 0; column < this.position.width+Math.floor(this.position.height/2); column++) {
                    // console.log("row: " + row);
                    // columnNumber = column;
                    var colorInt = this.position.getCircleColor(column, row);
                    var circle = document.createElementNS(svgNS, "circle");
                    circle.row = row;
                    circle.column = column;

                    circle.setAttributeNS(null, "cx", (column * 100) + 50);
                    circle.setAttributeNS(null, "cy", (row * 100) + 50);
                    circle.setAttributeNS(null, "r", 40);
                    if (colorInt == Manalath.prototype.RED) {
                        circle.setAttributeNS(null, "class", "redPiece");
                    } else if (colorInt == Manalath.prototype.BLUE) {
                        circle.setAttributeNS(null, "class", "bluePiece");
                    } else {
                        circle.setAttributeNS(null, "class", "whitePiece");
                        //only white circles are clickable
                        if (listener != undefined) {
                            var player = listener;
                            circle.onclick = function(event) {
                                console.log("clicked on: (" + event.target.column + ", " + event.target.row + ")");
                                player.handleClick(event);
                            };
                        }
                    }
                    boardSvg.appendChild(circle);
                }
            }
            if(row > Math.floor(this.position.height/2)){
                for (var column = 0; column < this.position.width+(this.position.height-row-1); column++) {
                    // console.log("row: " + row);
                    // columnNumber = column;
                    var colorInt = this.position.getCircleColor(column, row);
                    var circle = document.createElementNS(svgNS, "circle");
                    circle.row = row;
                    circle.column = column;

                    circle.setAttributeNS(null, "cx", (column * 100) + ((row-Math.floor(this.position.height/2)+1)*50));
                    circle.setAttributeNS(null, "cy", (row * 100) + 50);
                    circle.setAttributeNS(null, "r", 40);

                    // circle.setAttributeNS(null, "cx", (column * 100) + 50);
                    // circle.setAttributeNS(null, "cy", (row * 100) + 50);
                    // circle.setAttributeNS(null, "r", 40);
                    if (colorInt == Manalath.prototype.RED) {
                        circle.setAttributeNS(null, "class", "redPiece");
                    } else if (colorInt == Manalath.prototype.BLUE) {
                        circle.setAttributeNS(null, "class", "bluePiece");
                    } else {
                        circle.setAttributeNS(null, "class", "whitePiece");
                        //only white circles are clickable
                        if (listener != undefined) {
                            var player = listener;
                            circle.onclick = function(event) {
                                console.log("clicked on: (" + event.target.column + ", " + event.target.row + ")");
                                player.handleClick(event);
                            };
                        }
                    }
                    boardSvg.appendChild(circle);
                }
            }
            if(row < Math.floor(this.position.height/2)){
                for (var column = 0; column < this.position.width+row; column++) {
                    // console.log("row: " + row);
                    // columnNumber = column;
                    var colorInt = this.position.getCircleColor(column, row);
                    var circle = document.createElementNS(svgNS, "circle");
                    circle.row = row;
                    circle.column = column;

                    circle.setAttributeNS(null, "cx", (column * 100) + ((Math.abs(row-Math.floor(this.position.height/2))+1)*50));
                    circle.setAttributeNS(null, "cy", (row * 100) + 50);
                    circle.setAttributeNS(null, "r", 40);
                    if (colorInt == Manalath.prototype.RED) {
                        circle.setAttributeNS(null, "class", "redPiece");
                    } else if (colorInt == Manalath.prototype.BLUE) {
                        circle.setAttributeNS(null, "class", "bluePiece");
                    } else {
                        circle.setAttributeNS(null, "class", "whitePiece");
                        //only white circles are clickable
                        if (listener != undefined) {
                            var player = listener;
                            circle.onclick = function(event) {
                                console.log("clicked on: (" + event.target.column + ", " + event.target.row + ")");
                                player.handleClick(event);
                            };
                        }
                    }
                    boardSvg.appendChild(circle);
                }
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
            player.sendMoveToRef(self.position.getOptionWith(event.target.column, event.target.row, Manalath.prototype.RED));
        };
        this.popup.appendChild(redButton);

        var blueButton = document.createElement("button");
        blueButton.appendChild(toNode("Blue"));
        blueButton.onclick = function() {
            self.destroyPopup();
            player.sendMoveToRef(self.position.getOptionWith(event.target.column, event.target.row, Manalath.prototype.BLUE));
        };
        this.popup.appendChild(blueButton);

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
var InteractiveManalathViewFactory = Class.create({
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
        return new InteractiveManalathView(position);
    }

    ,/**
     * Returns a view.
     */
    getView: function(position) {
        return this.getInteractiveBoard(position);
    }

}); //end of InteractiveAtroposViewFactory



/**
 * Class for NoCanDo ruleset.
 */
var NoCanDo = Class.create(CombinatorialGame, {

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
    simplify: function() {
        var clone = this.clone();
        for (var playerId = 0; playerId < 2; playerId++) {
            while (clone.dominoes[playerId].length > 0) {
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
            options.push(option);
        }
        return options;
    }

    ,/**
     * Checks that a vertical domino has at least one liberty
     */
    isVerticalDominoHappy: function(dominoBlock) {
        var x = dominoBlock[0];
        var y = dominoBlock[1];
        var simplifiedBoard = this.simplify();
        var topToTheLeft = dominoBlock[0]+1;
        var blockedTop = false;
        var blockedBottom = false;
        var blockedTopRight = false;
        var blockedTopLeft = false;
        var blockedBottomLeft = false;
        var blockedBottomRight = false;
        for (var blockIndex = 0; blockIndex < simplifiedBoard.blockedSpaces.length; blockIndex++) {
            var block = simplifiedBoard.blockedSpaces[blockIndex]
            var toTheRight = dominoBlock[0]+1;
            var toTheLeft = dominoBlock[0]-1;
            var topAndAbove = dominoBlock[1]-1;
            var bottomY = dominoBlock[1]+1;
            var bottomAndBelow = dominoBlock[1]+2;
            if(((block[0] == toTheRight) && (block[1] == dominoBlock[1])) || (dominoBlock[0] == this.width-1)) {
                blockedTopRight = true;
            }
            if(((block[0] == toTheLeft) && (block[1] == dominoBlock[1])) || (dominoBlock[0] == 0)) {
                blockedTopLeft = true;
            }
            if(((block[0] == dominoBlock[0]) && (block[1] == topAndAbove)) || (dominoBlock[1] == 0)) {
                blockedTop = true;
            }
            if(((block[0] == toTheRight) && (block[1] == bottomY)) || (dominoBlock[0] == this.width-1)) {
                blockedBottomRight = true;
            }
            if(((block[0] == toTheLeft) && (block[1] == bottomY)) || (dominoBlock[0] == 0)) {
                blockedBottomLeft = true;
            }
            if(((block[0] == dominoBlock[0]) && (block[1] == bottomAndBelow)) || (dominoBlock[1] == this.height-2)) {
                blockedBottom = true;
            }
        }
        if((blockedTop == true) && (blockedBottom == true) && (blockedTopLeft == true) && (blockedTopRight == true) && (blockedBottomLeft == true) && (blockedBottomRight == true)) {
            return false;
        } else {
            return true;
        }
    }

    ,/**
     * Checks that a horizontal domino has at least one liberty
     */
    ishorizontalDominoHappy: function(dominoBlock) {
        var simplifiedBoard = this.simplify();
        var topToTheLeft = dominoBlock[0]+1;
        var blockedLeft = false;
        var blockedRight = false;
        var blockedTopRight = false;
        var blockedTopLeft = false;
        var blockedBottomLeft = false;
        var blockedBottomRight = false;
        for (var blockIndex = 0; blockIndex < simplifiedBoard.blockedSpaces.length; blockIndex++) {
            var block = simplifiedBoard.blockedSpaces[blockIndex]
            var top = dominoBlock[1]-1;
            var bottom = dominoBlock[1]+1;
            var right = dominoBlock[0]+1;
            var left = dominoBlock[0]-1;
            var allTheWayRight = dominoBlock[0]+2;
            if(((block[0] == dominoBlock[0]) && (block[1] == top)) || (dominoBlock[1] == 0)) {
                blockedTopLeft = true;
            }
            if(((block[0] == right) && (block[1] == top)) || (dominoBlock[1] == 0)) {
                blockedTopRight = true;
            }
            if(((block[0] == left) && (block[1] == dominoBlock[1])) || (dominoBlock[0] == 0)) {
                blockedLeft = true;
            }
            if(((block[0] == allTheWayRight) && (block[1] == dominoBlock[1])) || (dominoBlock[0] == this.width-2)) {
                blockedRight = true;
            }
            if(((block[0] == dominoBlock[0]) && (block[1] == bottom)) || (dominoBlock[1] == this.height-1)) {
                blockedBottomLeft = true;
            }
            if(((block[0] == right) && (block[1] == bottom)) || (dominoBlock[1] == this.height-1)) {
                blockedBottomRight = true;
            }
        }
        if((blockedLeft == true) && (blockedRight == true) && (blockedTopLeft == true) && (blockedTopRight == true) && (blockedBottomLeft == true) && (blockedBottomRight == true)) {
            return false;
        } else {
            return true;
        }
    }

    ,/**
     * Checks that every domino on the board has at least one liberty
     */
     isBoardHappy: function() {
         var happyDominoes = 0;
         if(this.dominoes[0] != undefined) {
             for(var i = 0; i < this.dominoes[0].length; i++) {
                 if(this.isVerticalDominoHappy(this.dominoes[0][i])) {
                     happyDominoes++;
                 }
             }
        }
         if(this.dominoes[1] != undefined) {
             for(var i = 0; i < this.dominoes[1].length; i++) {
                 if(this.ishorizontalDominoHappy(this.dominoes[1][i])) {
                     happyDominoes++;
                 }
             }
        }
        var verticalDominoes = 0;
        if (this.dominoes[0] != undefined) {
            verticalDominoes = this.dominoes[0].length;
        }
        var horizontalDominoes = 0;
        if (this.dominoes[1] != undefined) {
            horizontalDominoes = this.dominoes[1].length;
        }
         if(happyDominoes == (verticalDominoes + horizontalDominoes)) {
             return true;
         } else {
             return false;
         }
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
                var allBlocks = this.simplify();
                allBlocks.dominoes = JSON.parse(JSON.stringify(this.dominoes));
                var blocked = false;
                var blocksAroundDomino = 0;
                for (var blockIndex = 0; blockIndex < allBlocks.blockedSpaces.length; blockIndex++) {

                    var block = allBlocks.blockedSpaces[blockIndex]
                    for (var i= 0; i < dominoSpaces.length; i++) {

                        universalBlock = block;
                        universalDomino = dominoSpaces[i];
                        var dominoSpace = dominoSpaces[i];

                        if (block[0] == dominoSpace[0] && block[1] == dominoSpace[1]) {
                            blocked = true;
                            break;
                        }
                    }
                    if (blocked) break;
                }
                if (!blocked) {
                    allBlocks.dominoes[playerId].push([column, row]);
                    if(allBlocks.isBoardHappy()) {
                        moves.push([column, row]);
                    }
                    else{
                        allBlocks.dominoes[playerId].pop();
                    }
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
        return new NoCanDo(this.width, this.height, this.dominoes, this.blockedSpaces);
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


}); //end of NoCanDo class
NoCanDo.prototype.PLAYER_NAMES = ["Vertical", "Horizontal"];


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
            // console.log("Adding the block: " + this.position.blockedSpaces[i]);
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
        this.selectedTile.style.fill = "red";
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
    //var playerOptions = [new HumanPlayer(viewFactory), new RandomPlayer(playDelay), new DepthSearchPlayer(playDelay, 1), new DepthSearchPlayer(playDelay, 3), new DepthSearchPlayer(playDelay, 5), new DepthSearchPlayer(200, 7)];
    var playerOptions = getCommonPlayerOptions(viewFactory, playDelay, 1, 5);
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
    //var playerOptions = [new HumanPlayer(viewFactory), new RandomPlayer(playDelay), new DepthSearchPlayer(playDelay, 1), new DepthSearchPlayer(playDelay, 3), new DepthSearchPlayer(playDelay, 5), new DepthSearchPlayer(200, 7)];
    var playerOptions = getCommonPlayerOptions(viewFactory, playDelay, 1, 5);
    var width = parseInt($('boardWidth').value);
    var height = parseInt($('boardHeight').value);
    var controlForm = $('gameOptions');
    var leftPlayer = parseInt(getSelectedRadioValue(controlForm.elements['leftPlayer']));
    var rightPlayer =  parseInt(getSelectedRadioValue(controlForm.elements['rightPlayer']));
    game = new Domineering(width, height);
    var players = [playerOptions[leftPlayer], playerOptions[rightPlayer]];
    ref = new Referee(game, players, viewFactory, "gameCanvas", $('messageBox'), controlForm);
}

function newConnectFourGame() {
    var viewFactory = new InteractiveSVGConnectFourViewFactory();
    var playDelay = 1000;
    //var playerOptions = [new HumanPlayer(viewFactory), new RandomPlayer(playDelay), new DepthSearchPlayer(playDelay, 1), new DepthSearchPlayer(playDelay, 3), new DepthSearchPlayer(playDelay, 5), new DepthSearchPlayer(200, 7)];
    var playerOptions = getCommonPlayerOptions(viewFactory, playDelay, 1, 5);
    var width = parseInt($('boardWidth').value);
    var height = parseInt($('boardHeight').value);
    var controlForm = $('gameOptions');
    var leftPlayer = parseInt(getSelectedRadioValue(controlForm.elements['leftPlayer']));
    var rightPlayer =  parseInt(getSelectedRadioValue(controlForm.elements['rightPlayer']));
    game = new ConnectFour(width, height);
    var players = [playerOptions[leftPlayer], playerOptions[rightPlayer]];
    ref = new Referee(game, players, viewFactory, "gameCanvas", $('messageBox'), controlForm);
}

function newManalathGame() {
    var viewFactory = new InteractiveManalathViewFactory();
    var playDelay = 1000;
    //var playerOptions = [new HumanPlayer(viewFactory), new RandomPlayer(playDelay), new DepthSearchPlayer(playDelay, 1), new DepthSearchPlayer(playDelay, 3), new DepthSearchPlayer(playDelay, 5), new DepthSearchPlayer(200, 7)];
    var playerOptions = getCommonPlayerOptions(viewFactory, playDelay, 1, 5);
    var width = parseInt($('boardWidth').value);
    var height = parseInt($('boardHeight').value);
    var controlForm = $('gameOptions');
    var leftPlayer = parseInt(getSelectedRadioValue(controlForm.elements['leftPlayer']));
    var rightPlayer =  parseInt(getSelectedRadioValue(controlForm.elements['rightPlayer']));
    game = new Manalath(width, height);
    var players = [playerOptions[leftPlayer], playerOptions[rightPlayer]];
    ref = new Referee(game, players, viewFactory, "gameCanvas", $('messageBox'), controlForm);
}

/**
 * Launches a new NoCanDo Game.
 */
function newNoCanDoGame() {
    var viewFactory = new InteractiveSVGDomineeringViewFactory();
    var playDelay = 1000;
    //var playerOptions = [new HumanPlayer(viewFactory), new RandomPlayer(playDelay), new DepthSearchPlayer(playDelay, 1), new DepthSearchPlayer(playDelay, 3), new DepthSearchPlayer(playDelay, 5), new DepthSearchPlayer(200, 7)];
    var playerOptions = getCommonPlayerOptions(viewFactory, playDelay, 1, 5);
    var width = parseInt($('boardWidth').value);
    var height = parseInt($('boardHeight').value);
    var controlForm = $('gameOptions');
    var leftPlayer = parseInt(getSelectedRadioValue(controlForm.elements['leftPlayer']));
    var rightPlayer =  parseInt(getSelectedRadioValue(controlForm.elements['rightPlayer']));
    game = new NoCanDo(width, height);
    var players = [playerOptions[leftPlayer], playerOptions[rightPlayer]];
    ref = new Referee(game, players, viewFactory, "gameCanvas", $('messageBox'), controlForm);
}

/**
 * Launches a new Atropos game.
 */
function newAtroposGame() {
    var viewFactory = new InteractiveAtroposViewFactory();
    var playDelay = 1000;
    //var playerOptions = [new HumanPlayer(viewFactory), new RandomPlayer(playDelay), new DepthSearchPlayer(playDelay, 1), new DepthSearchPlayer(playDelay, 3), new DepthSearchPlayer(playDelay, 5), new DepthSearchPlayer(100, 7)];
    var playerOptions = getCommonPlayerOptions(viewFactory, playDelay, 1, 5);
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
    //var playerOptions = [new HumanPlayer(viewFactory), new RandomPlayer(playDelay), new DepthSearchPlayer(playDelay, 1), new DepthSearchPlayer(playDelay, 3), new DepthSearchPlayer(playDelay, 5), new DepthSearchPlayer(200, 7)];
    var playerOptions = getCommonPlayerOptions(viewFactory, playDelay, 1, 5);
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
            this.selectedPiece.style.stroke = "Blue";
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
 * autoStart is a boolean for whether the referee should start running at creation.
 * alertWhenDone is a list of objects that want to know when this is done.  All those objects should have a gameIsOver(Referee) method.
 */
var Referee = Class.create({
    initialize: function(position, players, viewFactory, viewElementId, messageContainerOrId, optionsPanel, autoStart, alertWhenDone) {
        this.isComplete = false;
        this.viewFactory = viewFactory;
        this.position = position;
        this.players = players; //TODO: clone players?
        this.viewElementId = viewElementId || "gameBoard";
        //this.viewElement = document.getElementById(viewElementId);
        this.currentPlayer = CombinatorialGame.prototype.LEFT;
        if (typeof messageContainerOrId === 'string') {
            this.messageContainerId = messageContainerOrId;
        } else {
            try {
                this.messageContainerId = messageContainerOrId.id;
            } catch (error) {
                //okay, let's just set it equal to a terrible string that won't be an id.
                this.messageContainerId = "mustardMcMonkey";
            }
        }
        //this.messageContainer = messageContainer || document.createElement("p");
        this.optionsPanel = optionsPanel || document.createElement("p");
        if (autoStart === undefined) {
            autoStart = true;
        }
        this.alertWhenDone = alertWhenDone || [];

        this.setOptionsAbleness(false);
        this.setStringMessage(this.position.playerNames[this.currentPlayer] + " goes first.");
        this.view = this.viewFactory.getView(this.position);
        if (!this.players[this.currentPlayer].hasView()) {
            this.view.draw(this.getViewContainer());
        }
        //console.log("In ref!");
        //console.log("  this.position: " + this.position);
        if (autoStart) this.requestNextMove();
    }

    /**
     * Determines whether the options will be enabled.
     */
    ,setOptionsAbleness: function(areEnabled) {
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
        var messageContainer = $(this.messageContainerId);
        if (messageContainer != undefined) {
            messageContainer.innerHTML = message;
        }
    }

    ,/**
     * Gets the element that contains the view for this.
     */
    getViewContainer: function() {
        return $(this.viewElementId);
    }

    /**
     * Sets fields.
     */
    ,moveTo: function(option) {
        if (option == undefined || option == null) {
            console.log("option is undefined or null in Referee.moveTo(option)");
            console.log("We're counting that as a forfeit!");
            this.endGame();
        }
        if (this.position.hasOption(this.currentPlayer, option)) {
            //the move is legal.  Make it.
            this.position = option;
            this.currentPlayer = 1 - this.currentPlayer;
            if (!this.players[this.currentPlayer].hasView()) {
                this.view = this.viewFactory.getView(this.position);
                this.view.draw(this.getViewContainer());
            }

            if (this.position.getOptionsForPlayer(this.currentPlayer).length == 0) {
                this.endGame();
            } else {
                //TODO: globals for debugging!
                /*
                curP = this.currentPlayer;
                gameState = this.position;
                moves = this.position.getOptionsForPlayer(this.currentPlayer);
                */
                this.setStringMessage("It's " + this.position.playerNames[this.currentPlayer] + "'s turn.");
                this.requestNextMove();
            }
            //this.requestNextMove();
        } else {
            if (option != null) {
                console.log("Tried to move to a non-option!  Parent stored in debugPar; bad option stored in debugVar.");
                console.log("  From: " + this.position);
                console.log("  To: " + option);
                debugVar = option;
                debugPar = this.position;
            }
        }
    }

    /**
     * Ends the game.
     */
    ,endGame: function() {
        this.isComplete = true;
        this.view = this.viewFactory.getView(this.position);
        this.view.draw(this.getViewContainer());
        //console.log("Game over!");
        this.setStringMessage("There are no moves for " + this.position.playerNames[this.currentPlayer] + ".  " + this.position.playerNames[1-this.currentPlayer] + " wins!");
        this.setOptionsAbleness(true);
        this.alertGameOver();
    }

    /**
     * Requests the next move.
     */
    ,requestNextMove: function() {
        var self = this;
        //perform a delayed call so that the display will redraw
        window.setTimeout(function() {self.requestNextMoveHelper();}, 20);
    }

    /**
     * Helper for requestNextMove
     */
    ,requestNextMoveHelper: function() {
        //console.log("this: " + this);
        //console.log("this.position: " + this.position);
        this.players[this.currentPlayer].givePosition(this.currentPlayer, this.position, this);
    }

    /**
     * Returns whether this game is over.
     */
    ,isDone: function() {
        return this.isComplete;
        //return this.position.getOptionsForPlayer(this.currentPlayer).length == 0;
    }

    /**
     *  Lets the relevant objects know that the game is over.
     */
    ,alertGameOver: function() {
        for (var i = 0; i < this.alertWhenDone.length; i++) {
            this.alertWhenDone[i].gameIsOver(this);
        }
    }

    /**
     * Returns the winner.
     */
    ,getWinnerIndex: function() {
        if (! this.isDone()) {
            console.log("Asked for the winner before the game is done!!!!");
        } else {
            return 1 - this.currentPlayer;
        }
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
        if (option == null || option == undefined || option === undefined) {
            return;
        } else if (this.position.hasOption(this.playerIndex, option)) {
            this.referee.moveTo(option);
        } else {
            //TODO: comment this out for production
            console.log("Tried to move to a non-option, child stored in global childGame; parent stored in global parentGame");
            // console.log(universalBlock[0]);
            // console.log(universalDomino[0]);
            // console.log("Blocks around domino: " + universalBlocksAroundDomino);
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



var RESULT_WIN = 1;
var RESULT_DUNNO = 0;
var RESULT_LOSS = -1;

//abstract version
var BestMoveAndResults = Class.create( {

    /**
     * Constructor.
     */
    initialize: function(moves, depth) {
        this.moves = moves;
        this.depth = depth;
    }

    /**
     * Returns whether this is a winning move.
     */
    ,winnability: function() {
        console.log("Tried calling BestMoveAndResults.winnability!");
    }

    /**
     * Returns the depth of the knowledge.
     */
    ,getDepth: function() {
        return this.depth;
    }

    /**
     * Returns the better choice of this and a winning move.
     */
    ,addtoWin: function(other) {
        return other;//we want the other one because it's a win
    }

    /**
     * Returns the better choice of this and a losing move.
     */
    ,addToLoss: function(other) {
        return this; //we want this one, because the other one is a loss.
    }

    /**
     * Returns a move chosen at random.
     */
    ,getMove: function() {
        //using Jacob Relkin's answer here: https://stackoverflow.com/questions/4550505/getting-a-random-value-from-a-javascript-array
        index = Math.floor(Math.random() * this.moves.length);
        move =  this.moves[index];
        if (move == undefined) {
            console.log("Found a problem in getMove():");
            console.log("    index: " + index);
            console.log("    move: " + move.toString());
        }
        return move;
    }

    /**
     * Checks for parentage and prints a message.
     */
    ,checkLegalOption: function(parent, playerId) {
        for (var i = 0; i < this.moves.length; i++) {
            option = this.moves[i];
            if (! parent.hasOption(playerId, option)) {
                /*console.log("checkLegalOption found a problem!");
                console.log("    parent: " + parent.toString());
                console.log("    option: " + option.toString());
                console.log("    i: " + i);
                console.log("    this.moves.length: " + this.moves.length);
                console.log("    depth: " + this.depth);
                console.log("    playerId: " + playerId);
                */
                return false;
            }
        }
        //console.log("Success in checkLegalOption!");
    }


}); //end of BestMoveAndResults

var WinningMoveAndResults = Class.create(BestMoveAndResults, {

    /**
     * Constructor.
     */
    initialize: function($super, moves, depth) {
        $super(moves, depth);
    }

    ,winnability: function() {
        return RESULT_WIN;
    }

    ,addTo: function(other) {
        return other.addToWin(this);
    }

    ,addtoWin: function(other) {
        if (this.depth > other.depth) {
            //the other one can lead to a win faster.  Choose that one.
            return other;
        } else if (this.depth < other.depth) {
            //this can lead to a win faster.  Choose this one.
            return this;
        } else {
            //both lead to a win in the same amount of time.
            return new WinningMoveAndResults(this.moves.concat(other.moves), this.depth);
        }
    }

    ,addToDunno: function(other) {
        return this; //this is a win.
    }

    ,reverseForParent: function(parent, playerId) {
        this.checkLegalOption(parent, playerId);
        return new LosingMoveAndResults([parent], this.depth + 1);
    }

});


var LosingMoveAndResults = Class.create(BestMoveAndResults, {
    winnability: function() {
        return RESULT_LOSS;
    }

    ,addTo: function(other) {
        return other.addToLoss(this);
    }

    //addToWin: not needed because it's in the superclass

    ,addToDunno: function(other) {
        return other; //other is better
    }

    ,addToLoss: function(other) {
        if (this.depth > other.depth) {
            //we can drag it on longer with this.
            return this;
        } else if (this.depth < other.depth) {
            return other;
        } else {
            return new LosingMoveAndResults(this.moves.concat(other.moves), this.depth);
        }
    }

    ,reverseForParent: function(parent, playerId) {
        this.checkLegalOption(parent, playerId);
        return new WinningMoveAndResults([parent], this.depth + 1);
    }
});


var UndecidedMoveAndResults = Class.create(BestMoveAndResults, {
   winnability: function() {
       return RESULT_DUNNO;
   }

   ,addTo: function(other) {
       return other.addToDunno(this);
   }

   ,addToDunno: function(other) {
       if (this.depth == other.depth) {
           //same depth, so use both
           return new UndecidedMoveAndResults(this.moves.concat(other.moves), this.depth);
       } else {
           if (Math.random() > .5) {
               return this;
           } else {
               return other;
           }
       }
    }

    ,reverseForParent: function(parent, playerId) {
        this.checkLegalOption(parent, playerId);
        return new UndecidedMoveAndResults([parent], this.depth + 1);
    }
});


//represents a BestMoveAndResults with no options
var NullBestMoveAndResults = Class.create(LosingMoveAndResults, {

   /**
    * Constructor.
    */
   initialize: function($super) {
        $super([], 0);
   }

   ,checkLegalOption: function(parent, playerId) {
       //do nothing.  Nothing is a legal option.
   }

    ,getMove: function() {
        console.log("Called getMove() on NullBestMoveAndResults!  Yikes!");
    }

});





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
        var bestMoves = this.getBestMovesFrom(playerIndex, position, this.maxDepth);
        //console.log("Looking for a move from: " + position);
        /*
        if (bestMoves.winnability() == RESULT_WIN) {
            console.log("AI is feeling real good.");
        } else if (bestMoves.winnability() == RESULT_DUNNO) {
            console.log("AI doesn't know how to feel.  Depth: " + bestMoves.getDepth());
        } else {
            console.log("AI doesn't feel too good about this.  Death likely in " + bestMoves.getDepth() + " moves.");
        }*/
        var option = bestMoves.getMove();
        window.setTimeout(function(){referee.moveTo(option);}, this.delayMilliseconds);
    }

    /**
     * Returns a BestMoveAndResults from the options of a position.
     * @param playerIndex index of current player
     * @param position    The position to search options from.
     * @param depth       The maximum depth to search to.
     */
    ,getBestMovesFrom: function(playerIndex, position, depth) {
        var options = position.getOptionsForPlayer(playerIndex);
        var bestOptions = new NullBestMoveAndResults();
        if (options.length == 0) {
            //console.log("Asked to get the best move from position monkey with no options.");
            //monkeyPosition = position;
            return bestOptions;
        }
        if (depth <= 1) {
            return new UndecidedMoveAndResults(options, 0);
        } else {
            for (var i = 0; i < options.length; i++) {
                var option = options[i];
                var nextOptions = this.getBestMovesFrom(1 - playerIndex, option, depth - 1);
                var reversed = nextOptions.reverseForParent(option, 1 - playerIndex);
                bestOptions = bestOptions.addTo(reversed);

                if (bestOptions.winnability() == 1) {
                    //we found a win.  Let's shortcut and return that instead of getting fancy.
                    return bestOptions;
                }
            }
            //console.log("Returning a " + bestOptions.winnability() + " from depth " + depth + "...");
            return bestOptions;
        }
    }

});

/**
 *  Brute-Force AI to play games.  Does not avoid losing moves.
 */
var DepthSearchPlayerOld = Class.create(ComputerPlayer, {
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
    return createRadioGroup(playerName + "Player",  ["Human", "Random", "Very Easy AI", "Easy AI", "Medium AI", "Tricky AI (slow)", "Hard AI (very slow)"], defaultIndex); // "Professional (hangs your browser)"
}

/**
 * Gets an HTML Element for 1-d board sizes.
 */
function createBasicOneDimensionalSizeOptions(minSize, maxSize, defaultSize, ruleset) {
    defaultSize = defaultSize || (minSize + maxSize) / 2;
    ruleset = ruleset || CombinatorialGame;
    var leftName = ruleset.prototype.PLAYER_NAMES[0];
    var rightName = ruleset.prototype.PLAYER_NAMES[1];

    var container = document.createElement("div");

    var sizeElement = document.createDocumentFragment();
    var sizeRange = createRangeInput(minSize, maxSize, defaultSize, "boardSize");
    container.appendChild(createGameOptionDiv("Size", sizeRange));

    //duplicated code from createBasicGridGameOptions
    var leftPlayerElement = document.createDocumentFragment();
    leftPlayerElement.appendChild(document.createTextNode("(" + leftName + " plays first.)"));
    leftPlayerElement.appendChild(document.createElement("br"));
    var leftRadio = getRadioPlayerOptions(CombinatorialGame.prototype.LEFT);
    leftPlayerElement.appendChild(leftRadio);
    container.appendChild(createGameOptionDiv(leftName + ":", leftPlayerElement));

    var rightRadio = getRadioPlayerOptions(CombinatorialGame.prototype.RIGHT);
    container.appendChild(createGameOptionDiv(rightName + ":", rightRadio));

    var seedInput = document.createElement("input");
    seedInput.type = "text"
    seedInput.id = "seed";
    container.appendChild(createGameOptionDiv("Seed", seedInput));

    var startButton = document.createElement("input");
    startButton.type = "button";
    startButton.id = "starter";
    startButton.value = "Start Game";
    startButton.style.fontSize = "large";
    startButton.onclick = startGame;
    container.appendChild(startButton);
    //end duplicated code.

    return container;
}

/**
 * Gets an HTML Element containing the basic game options for a 2-dimensional grid.
 */
function createBasicGridGameOptions(minWidth, maxWidth, defaultWidth, minHeight, maxHeight, defaultHeight, ruleset) {
    //do some normalization for games with only one size parameter (e.g. Atropos)
    minHeight = minHeight || minWidth;
    maxHeight = maxHeight || maxWidth;
    defaultHeight = defaultHeight || defaultWidth;

    ruleset = ruleset || CombinatorialGame;
    var leftName = ruleset.prototype.PLAYER_NAMES[0];
    var rightName = ruleset.prototype.PLAYER_NAMES[1];

    var container = document.createElement("div");

    var widthElement = document.createDocumentFragment();
    var widthRange = createRangeInput(minWidth, maxWidth, defaultWidth, "boardWidth");
    container.appendChild(createGameOptionDiv("Width", widthRange));

    var heightElement = document.createDocumentFragment();
    var heightRange = createRangeInput(minHeight, maxHeight, defaultHeight, "boardHeight");
    container.appendChild(createGameOptionDiv("Height", heightRange));

    var leftPlayerElement = document.createDocumentFragment();
    leftPlayerElement.appendChild(document.createTextNode("("+leftName+ " plays first.)"));
    leftPlayerElement.appendChild(document.createElement("br"));
    var leftRadio = getRadioPlayerOptions(CombinatorialGame.prototype.LEFT);
    leftPlayerElement.appendChild(leftRadio);
    container.appendChild(createGameOptionDiv(leftName + ":", leftPlayerElement));

    var rightRadio = getRadioPlayerOptions(CombinatorialGame.prototype.RIGHT);
    container.appendChild(createGameOptionDiv(rightName + ":", rightRadio));

    var seedInput = document.createElement("input");
    seedInput.type = "text"
    seedInput.id = "seed";
    container.appendChild(createGameOptionDiv("Seed", seedInput));

    var startButton = document.createElement("input");
    startButton.type = "button";
    startButton.id = "starter";
    startButton.value = "Start Game";
    startButton.style.fontSize = "large";
    startButton.onclick = startGame;
    container.appendChild(startButton);



    return container;
}

/**
 * Gets an HTML Element containing the basic game options for a 2-dimensional grid.
 */
function createBasicGridGameOptionsForNoCanDo(minWidth, maxWidth, defaultWidth, minHeight, maxHeight, defaultHeight) {
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
    leftPlayerElement.appendChild(document.createTextNode("(Vertical plays first.)"));
    leftPlayerElement.appendChild(document.createElement("br"));
    var leftRadio = getRadioPlayerOptions(CombinatorialGame.prototype.LEFT);
    leftPlayerElement.appendChild(leftRadio);
    container.appendChild(createGameOptionDiv("Vertical:", leftPlayerElement));

    var rightRadio = getRadioPlayerOptions(CombinatorialGame.prototype.RIGHT);
    container.appendChild(createGameOptionDiv("Horizontal:", rightRadio));

    var seedInput = document.createElement("input");
    seedInput.type = "text"
    seedInput.id = "seed";
    container.appendChild(createGameOptionDiv("Seed", seedInput));

    var startButton = document.createElement("input");
    startButton.type = "button";
    startButton.id = "starter";
    startButton.value = "Start Game";
    startButton.onclick = startGame;
    container.appendChild(startButton);

    return container;
}

/**
 * Gets an HTML Element containing the basic game options for a 2-dimensional grid.
 */
function createBasicGridGameOptionsForConnectFour(minWidth, maxWidth, defaultWidth, minHeight, maxHeight, defaultHeight) {
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
    leftPlayerElement.appendChild(document.createTextNode("(Yellow plays first.)"));
    leftPlayerElement.appendChild(document.createElement("br"));
    var leftRadio = getRadioPlayerOptions(CombinatorialGame.prototype.LEFT);
    leftPlayerElement.appendChild(leftRadio);
    container.appendChild(createGameOptionDiv("Yellow:", leftPlayerElement));

    var rightRadio = getRadioPlayerOptions(CombinatorialGame.prototype.RIGHT);
    container.appendChild(createGameOptionDiv("Red:", rightRadio));

    var seedInput = document.createElement("input");
    seedInput.type = "text"
    seedInput.id = "seed";
    container.appendChild(createGameOptionDiv("Seed", seedInput));

    var startButton = document.createElement("input");
    startButton.type = "button";
    startButton.id = "starter";
    startButton.value = "Start Game";
    startButton.onclick = startGame;
    container.appendChild(startButton);

    return container;
}

/**
 * Gets an HTML Element containing the basic game options for a 2-dimensional grid.
 */
function createBasicGridGameOptionsForManalath(minWidth, maxWidth, defaultWidth, minHeight, maxHeight, defaultHeight) {
    //do some normalization for games with only one size parameter (e.g. Atropos)
    minHeight = minHeight || minWidth;
    maxHeight = maxHeight || maxWidth;
    defaultHeight = defaultHeight || defaultWidth;

    var container = document.createElement("div");

    var widthElement = document.createDocumentFragment();
    var widthRange = createRangeInput(minWidth, maxWidth, defaultWidth, "boardWidth");
    container.appendChild(createGameOptionDiv("Width", widthRange));

    var heightElement = document.createDocumentFragment();
    var heightRange = createRangeInputForManalath(minHeight, maxHeight, defaultHeight, "boardHeight");
    container.appendChild(createGameOptionDiv("Height", heightRange));

    var leftPlayerElement = document.createDocumentFragment();
    leftPlayerElement.appendChild(document.createTextNode("(Blue plays first.)"));
    leftPlayerElement.appendChild(document.createElement("br"));
    var leftRadio = getRadioPlayerOptions(CombinatorialGame.prototype.LEFT);
    leftPlayerElement.appendChild(leftRadio);
    container.appendChild(createGameOptionDiv("Blue:", leftPlayerElement));

    var rightRadio = getRadioPlayerOptions(CombinatorialGame.prototype.RIGHT);
    container.appendChild(createGameOptionDiv("Red:", rightRadio));

    var seedInput = document.createElement("input");
    seedInput.type = "text"
    seedInput.id = "seed";
    container.appendChild(createGameOptionDiv("Seed", seedInput));

    var startButton = document.createElement("input");
    startButton.type = "button";
    startButton.id = "starter";
    startButton.value = "Start Game";
    startButton.onclick = startGame;
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
 * Creates an input range element.
 * TODO: move to paithanLibraries
 */
function createRangeInputForManalath(min, max, defaultValue, id) {
    var slider = new PaitSlider(min, max, 2, defaultValue, id);
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

/**
 *
 */
function startGame() {
    const seedElement = $('seed');
    const seed = seedElement.value;

    // if there is a seed element and it has a value, decode the seed and then use it.
    if (seed !== undefined && seed !== "") {
        const decodedSeed = window.atob(seed);

        Math.seedrandom(decodedSeed);
    }
    // else we just make a new seedrandom and give it to the user
    else {
        const rand = Math.seedrandom();
        const encodedRand = window.btoa(rand);

        seedElement.value = encodedRand;
    }
    newGame();
}
