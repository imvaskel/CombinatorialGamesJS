To create a new game, you will have to implement five things:

* Create the model for the game (in combinatorialGames.js).  E.g. 

  var TransverseWave = Class.create(CombinatorialGame, {
    ...
  });

* Create the InteractiveView class (in combinatorialGames.js).  E.g. 

  var InteractiveTransverseWaveView = Class.create({ 
    ...
  });

* Create the InteractiveViewFactory class (in combinatorialGames.js).  E.g.

  var InteractiveTransverseWaveViewFactory = Class.create({
    ...
  });

* Create the function that launches the new game (in combinatorialGames.js).  E.g.: 
  
  function newTransverseWaveGame() {
    ...
  }
  
* Create the html page for the game.  (E.g. transverseWave.html.)  See the other htmls for a template.




Notes:

This directory holds the other .js files that I keep online.  The rest of the games are in the combGames folder.  They are all there so that the .html files in the combGames directory can be uploaded to:

https://turing.plymouth.edu/~kgb1013/DB/combGames/

as is and everything will work fine.

