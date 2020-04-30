/*******************************************************
 * This file of Javascript functions and classes was written by Kyle Burke (paithanq@gmail.com).  It contains many utility functions as well as class definitions for academic use.  Everything defined here assumes use of the prototype.js file.  Any thoughts for improvement are welcome, just email me.
 * To jump to a section on topic X, search for <<X>>, instead of <X>.
 Contents:
 * <utility> Utility Functions
 * <time> Date and Time functions
 * <main> Functions that generate content for my main webpages
 * The following are all classes:
 * <MaybeLink> State pattern implementation for links.  Node that might be a link.
 * <PaitMap>  Java-like Map.
 * <PaitSlider> Slider with current value displayed.
 * <PaitImage> Encapsulation for images.
 * <Semester> Semester class
 * <WeeklySchedule> WeeklySchedule class
 * <WeeklyScheduleItem> WeeklyScheduleItem class
 * <Book> Book class.
 * <HelpfulHuman> HelpfulHuman class. (Instructor/TA/LA/SI/etc...)
 * <Offering> Offering class.
 * <Course> Course class.
 * <PlymouthCourse> Course at Plymouth State.
 * <ColbyCourse> A Course at Colby.
 * <ColbyLab> A lab offering at Colby.
 * <CourseTopic> CourseTopic class and subclasses (BookTopic, AssignmentDueDateTopic).
 * <AssignmentInOffering> AssignmentInOffering class.
 * <Assignment> Assignment class.
 * <Homework> Class.
 * <Project> Class for a project assignment.
 * <ColbyProject> Colby CS Projects for intro courses.
 * <ColbyCS151Project> Project for Colby CS151.
 * <ColbyCS231Project> Project for Colby CS231.
 * <ProjectByParts> Class for a project split up into separately-totaled parts.
 * <AssignmentPart> Class.
 * <ChapterProblems> Class.
 * <CV> Class
 * <AcademicMedia> Abstract class.
 * <AcademicPublication> Class.
 * <AcademicPresentation> Class.
 * <Conference> Class.
 *
 * TODO: followed by more stuff I haven't properly organized yet.

 This work is protected by the MIT License:

 The MIT License (MIT)

 Copyright (c) 2018 Kyle Webster Burke

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
 */

/****************** Some constants I use all over. *******************/

//a string with the school's url
SCHOOL_URL = "https://www.plymouth.edu/"

//a string with the department's url
DEPT_URL = SCHOOL_URL + "department/computer-science/";

//Colby's department URL
COLBY_DEPT_URL = "http://cs.colby.edu/";

//a string containing the homepage url
HOME = location.protocol + "//turing.plymouth.edu/~kgb1013/";

//a string containing the local space
LOCAL_HOME = "/~kgb1013/";


/*******<<utility>>*************************************************************
 *******************************************************************************
 ** Utility Functions **/


/**
 * Tries importing scripts until it finds one in the list that works.
 */
function includeFirstWorkingScript(scriptUrls, callback, inputs) {
    var successfulScript = false;
    var workingScriptUrl = "";
    for (var i = 0; i < scriptUrls.length && !successfulScript; i++) {
        var url = scriptUrls[i];

        //the following code block is modified GPrimola's answer from https://stackoverflow.com/questions/10926880/using-javascript-to-detect-whether-the-url-exists-before-display-in-iframe#
        var request;
        if(window.XMLHttpRequest)
            request = new XMLHttpRequest();
        else
            request = new ActiveXObject("Microsoft.XMLHTTP");
        request.open('GET', url, false);
        request.send(); // there will be a 'pause' here until the response to come.
        // the object request will be actually modified
        if (request.status === 404) {
            //do nothing; just keep going  TODO: change this to use !== or whatever the opposite of === is
        } else {
            successfulScript = true; //We'll break out and continue on
            workingScriptUrl = url;
        }
    }
    includeScript(workingScriptUrl, callback, inputs);
}

/**
 * Imports a JavaScript file.  Afterwards, it will call functionToCallAfterLoading.  In order to do this, the following must be true:
 * * the last line in the script to import must be: functionAfterLoading();
 * * there should be no thread of execution after the call to include script.
 */
function includeScript(scriptURL, functionToCallAfterLoading, inputs) {

    //create the script object
    var script = document.createElement('script');
    script.setAttribute('type', 'text/javascript');
    script.setAttribute('src', scriptURL);

    //now add the script to the head
    var head = document.getElementsByTagName('head')[0];
    head.appendChild(script);

    //now set the global functionAfterLoading variable to the function we specified
    functionAfterLoading = functionToCallAfterLoading;
    args = inputs;
}

//global variable used by includeScript.
var functionAfterLoading;

/**
 * Loads another .html file into a node with the given ID.
 * Adapted from code at: http://www.boutell.com/newfaq/creating/include.html
 */
function clientSideInclude(element, url) {
  var req = false;
  // For Safari, Firefox, and other non-MS browsers
  if (window.XMLHttpRequest) {
    try {
      req = new XMLHttpRequest();
    } catch (e) {
      req = false;
    }
  } else if (window.ActiveXObject) {
    // For Internet Explorer on Windows
    try {
      req = new ActiveXObject("Msxml2.XMLHTTP");
    } catch (e) {
      try {
        req = new ActiveXObject("Microsoft.XMLHTTP");
      } catch (e) {
        req = false;
      }
    }
  }
  if (req) {
    // Synchronous request, wait till we have it all
    req.open('GET', url, false);
    req.send(null);
    element.innerHTML = req.responseText;
  } else {
    element.innerHTML =
   "Sorry, your browser does not support " +
      "XMLHTTPRequest objects. This page requires " +
      "Internet Explorer 5 or better for Windows, " +
      "or Firefox for any system, or Safari. Other " +
      "compatible browsers may also exist.";
  }
}

/**
 * Returns the value of the url parameter with the given name.  If the parameter is not given in the url, the default value is returned instead.  Adapted from top answer on: http://stackoverflow.com/questions/901115/get-query-string-values-in-javascript
 */
function getParameterByName(name, defaultValue) {
    name = name.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");
    var regexS = "[\\?&]" + name + "=([^&#]*)";
    var regex = new RegExp(regexS);
    var results = regex.exec(window.location.href);
    if(results == null) {
        if (defaultValue == undefined) {
            return "";
        } else {
            return defaultValue;
        }
    } else {
        return decodeURIComponent(results[1].replace(/\+/g, " "));
    }
}

/**
 * Returns a node version of the parameter.  If it is already a node, the parameter is returned.
 */
function toNode(object) {
    //crazy = object;
    //console.log("toNode: " + object + " (" + (typeof object) + ")");
    if (object instanceof Node) {
        return object;
    } else if (object instanceof Text) {
        //this is weird.  more information about Text: http://www.w3schools.com/xml/dom_text.asp
        return toNode(object.data);
    } else if (object instanceof Array && object.length == 2) {
        //should be a list, like: ["title", "link url"]
        return createTextLink(object[0], object[1]);
    } else if ((typeof object) == "string") {
        //console.log("It's a string!");
        //put the text in a span element, just in case we want to do anything to it later
        var span = createElementWithChildren("span", [document.createTextNode(object)]);
        return span;
    } else {
        if (object === undefined || object == undefined) {
            return toNode("");
        } else if (object.toNode != undefined) {
            return object.toNode();
        } else {
            console.log("Tried to invoke toNode on " + object + ", which has type: " + (typeof object));
            messedUp = object;
        }
    }
    //TODO: add more cases as necessary!
}

/**
 * Appends all elements as children to the parent.
 */
function appendChildrenTo(parent, childList) {
    for (var i = 0; i < childList.length; i++) {
        var node = toNode(childList[i]);
        if (typeof node != "object") {
            console.log(node);
        } else {
            parent.appendChild(node);
        }
    }
}

/**
 * Creates an element with the given children.
 */
function createElementWithChildren(elementTagName, childNodes) {
    var element = document.createElement(elementTagName);
    appendChildrenTo(element, childNodes);
    return element;
}

/**
 * Creates a fragment with the given children.
 */
function createFragmentWithChildren(childNodes) {
    var fragment = document.createDocumentFragment();
    appendChildrenTo(fragment, childNodes);
    return fragment;
}

/**
 * Returns a string with the entire HTML source of the document.  (Currently just the header and body... is there more than that?)  Adds a comment explaining how terrible it is at the top.
 */
function getCurrentSource() {
    var sourceString = "<!DOCTYPE HTML>\n<!-- Auto-generated HTML code.  Apologies for the ugliness. -->\n<html>";
    sourceString += "<head>" + document.head.innerHTML + "</head>";
    sourceString += "<body>" + document.body.innerHTML + "</body>";
    sourceString += "</html>";
    return sourceString;
}

/**
 * Uses .equals to get the index of an element in an array.  (I think the normal Array.indexOf uses ==.)  Returns -1 if element is not in array.
 */
function arrayIndexOfEquals(array, element) {
    for (var i = 0; i < array.length; i++) {
        if (array[i].equals(element)) {
            return i;
        }
    }
    return -1;
}

/**
 * Removes the first occurrence of an element from an array.  Uses == to test equality. TODO: test to see if there's an equals method available?
 *
 * @param array  The array to remove an element from.
 * @param toRemove  The element to remove from array.
 */
function removePrimitiveFromArray(array, toRemove) {
    for (var i = 0; i < array.length; i++) {
        var element = array[i];
        if (element == toRemove) {
            array.splice(i, 1); //remove the ith element
            return;
        }
    }
    console.log("removePrimitiveFromArray looked for " + toRemove + " in " + array + " and didn't find anything that matched to remove!");
}

/**
 * Adds my gmail address to all elements with "gmail" as the class.
 */
function addGmailAddressToPage() {
    var gmailElements = document.getElementsByClassName("gmail");
    for (var i = 0; i < gmailElements.length; i++) {
        var gmailElement = gmailElements[i];
        appendChildrenTo(gmailElement, [createCodeNode("paithanq"), createCodeNode("@gmail.com")]);
    }
}

/**
 * Adds my plymouth address to all elements with plymouthMail as the class.
 */
function addPlymouthEmailAddressToPage() {
    var emailElements = document.getElementsByClassName("plymouthMail");
    for (var i = 0; i < emailElements.length; i++) {
        var emailElement = emailElements[i];
        appendChildrenTo(emailElement, [createCodeNode("kwburke"), createCodeNode("@plymouth.edu")]);
    }
}

/**
 * Adds my email addresses to the page, as appropriate.
 */
function addEmailAddresses() {
    addGmailAddressToPage();
    addPlymouthEmailAddressToPage();
}

/**
 * Changes a Dropbox Public folder link to a turing/DB link.
 *  Old: https://dl.dropboxusercontent.com/u/43416022/X
 *  New: http://turing.plymouth.edu/~kgb1013/DB/X
 */
function dropboxToPublic(dropboxUrl) {
    var pathMinusHeader = dropboxUrl.substring(45);
    return getPublicFileLink(pathMinusHeader);
}

/**
 * Adds the header to a filename for public use.
 * Currently, the base public directory is /Home/DB.
 */
function getPublicFileLink(pathFromPublicDir) {
    return HOME + "DB/" + pathFromPublicDir;
    //return "http://turing.plymouth.edu/~kgb1013/DB/" + pathFromPublicDir;
}

/**
 * Sets the child of an element.
 *
 * @param parent    The parent element.
 * @param index     The index of the element we're going to set.
 * @param child     The new child element.
 */
function setChild(parent, index, child) {
    while (parent.childNodes.length <= index) {
        parent.appendChild(toNode(" ")); //insert spaces to increase the length.  We'll also display an error to the console
        console.log("Warning in setChild: adding a space because parent doesn't have enough children.");
    }
    parent.replaceChild(child, parent.childNodes[index]);
}

/**
 * Removes all the links that are descendants of an element, replacing them with text.
 */
function removeLinksFrom(element) {
    if (!element.hasChildNodes()) {
        return;
    }
    for (var i = 0; i < element.childNodes.length; i++) {
        var childNode = element.childNodes[i];
        if (childNode.nodeName.toUpperCase() == "A") {
            element.replaceChild(getNonLinkVersion(childNode), childNode);
        } else {
            removeLinksFrom(childNode);
        }
    }
}

/**
 * Gets a text-only version of an anchor element.
 */
function getNonLinkVersion(anchorElement) {
    var span = document.createElement("span");
    //span.style = anchorElement.style.cloneNode();
    span.style.cssText = anchorElement.style.cssText;
    while (anchorElement.hasChildNodes()) {
        var child = anchorElement.childNodes[0];
        //child.style = anchorElement.style;
        anchorElement.removeChild(child);
        span.appendChild(child);
    }
    span.appendChild(document.createTextNode(anchorElement.text));
    return span;
}

/**
 * Returns the selected value in a radio group with a given name.
 */
function getSelectedValueByRadioGroupName(radioGroupName) {
    var radioGroup = [];
    var inputs = document.getElementsByTagName("input");
    for (var i = 0; i < inputs.length; i++) {
        var inputElement = inputs[i];
        if (inputElement.name == radioGroupName && inputElement.type == "radio") {
            radioGroup.push(inputElement);
        } else {
            //debugging
            if (inputElement.type == "radio") {
                console.log("not adding radio with name: " + inputElement.name);
            }
        }
    }
    //debugging
    //console.log("radioGroupName: " + radioGroupName);
    //console.log("radioGroup.length: " + radioGroup.length);
    return getSelectedRadioValue(radioGroup);
}

/**
 * Returns the selected value in a radio group.
 * radioGroup should be an array of radio input elements.
 */
function getSelectedRadioValue(radioGroup) {
    for (var i = 0; i < radioGroup.length; i++) {
        if (radioGroup[i].checked) {
            return radioGroup[i].value;
        }
    }
    //nothing else fit.  Throw an exception?
    console.log('ERROR!  NO Selected Value for Radio Group: ' + radioGroup.name);
    return undefined;
}

/**
 * Returns the selected option's value in a Select Element.
 */
function getSelectedOptionValue(select) {
    return select.options[select.selectedIndex].value;
}

/**
 * Sets whether the elements of a form are enabled or disabled.
 */
function setFormIsEnabled(formElement, isEnabled) {
    for (var i = 0; i < formElement.childNodes.length; i++) {
        var element = formElement.childNodes[i];
        if (element.disabled == undefined) {
            //recurse to the subelements
            setFormIsEnabled(element, isEnabled);
        } else {
            element.disabled = !isEnabled;
        }
    }
}

/**
 *  Removes all the children of an Element.
 */
function removeAllChildren(element) {
    while (element.hasChildNodes()) {
        element.removeChild(element.firstChild);
    }
}

/**
 * Returns a string of forced spaces.  These spaces will appear at the beginning of a line or wherever you put them.
 */
function getSpaces(length) {
    spaces = "";
    while (length > 0) {
        spaces += "\u00a0";
        length -=1;
    }
    return spaces;
}

/**
 * Creates a new Node using the em tag with the passed node inside.
 */
function createEmphNode(node) {
    var emNode = document.createElement("em");
    emNode.appendChild(toNode(node));
    return emNode;
}

/**
 * Creates a new Node using the code tag with the passed node inside.
 */
function createCodeNode(node) {
    var codeNode = document.createElement("code");
    codeNode.appendChild(toNode(node));
    return codeNode;
}

/**
 * Creates a new Node that looks like code-formatted text with white space incorporated.
 */
function createPreNode(text) {
    var preNode = document.createElement("pre");
    preNode.appendChild(createCodeNode(document.createTextNode(text)));
    return preNode;
}

/**
 * Creates a new Node that looks like it's from a text editor.
 */
function createEditorNode(string) {
    var preNode = createPreNode(string);
    preNode.className = "editor";
    return preNode;
}

/**
 * Creates a new black-background Terminal node.
 */
function createTerminalNode(string) {
    var terminalNode = document.createElement("pre");
    //terminalNode.style.backgroundColor = "black";
    //terminalNode.style.color = "white";
    terminalNode.appendChild(toNode(string));
    terminalNode.className = "terminal";
    return terminalNode;
}

/**
 * Creates a fragment that's a list of comma-separated elements with an and between the last two.
 */
function arrayToGrammarList(array) {
    var fragment = document.createDocumentFragment();
    for (var i = 0; i < array.length; i++) {
        var nextNode = toNode(array[i]);
        console.log("nextNode: " + nextNode);
        fragment.appendChild(nextNode);
        //now add whatever comes after that
        if (i == array.length - 2) {
            //we'll need to add an 'and'
            if (array.length > 2) {
                //comma first
                fragment.appendChild(toNode(","));
            }
            fragment.appendChild(toNode(" and "));
        } else if (i < array.length - 2) {
            //just put a comma and a space
            fragment.appendChild(toNode(", "));
        }
    }
    return fragment;
}


/**
 * Creates a nicely-formatted block quote node.
 * TODO: still not perfect!  Is there a way to get it so the right side of the attribution is flush with the right-side of the quote.  Note: a stupid table would get this done in, like, two lines.  I'm sure there's a simple way to do this that I don't know.
 */
function createQuoteNode(quote, attribution) {
    var node = document.createElement("blockquote");
    var quoteEm = document.createElement("em");
    quoteEm.style.textAlign = "center";
    appendChildrenTo(quoteEm, [quote]);
    var attributionNode = document.createElement("span");
    attributionNode.style.textAlign = "right";
    //var attributionContents = document.createElement("span");
    attributionNode.style.paddingLeft = "30%";
    appendChildrenTo(attributionNode, [" - ", attribution]);
    //appendChildrenTo(attributionNode, [attributionContents]);

    //append everything to the block quote
    appendChildrenTo(node, [quoteEm, document.createElement("br"),  attributionNode])

    //set the margins for the attribution so it goes all the way to the right
    /*
    var marginForQuote = (node.offsetWidth - quoteEm.offsetWidth) / 2;
    attributionNode.style.width = quoteEm.offsetWidth + "px";
    attributionNode.style.marginRight = marginForQuote;
    attributionNode.style.marginLeft = marginForQuote + (quoteEm.offsetWidth / 4);
    console.log("marginForQuote: " + marginForQuote);

    //for debugging
    */
    q = quoteEm;
    attrib = attributionNode;
    //cont = attributionContents;

    return node;
}

//temporary function during refactoring
//TODO: replace all calls to this with calls to createTextLink by reordering the parameters.
function createTextLinkTemp(target, text) {
    var link = document.createElement("a");
    link.href = target;
    link.appendChild(toNode(text));
    return link;
}

function createLink(linkElement, targetUrl) {
    if (targetUrl == undefined) {
        console.log("Tried to create a link without a targetUrl!  linkElement: " + linkElement + ".  Could be that you're still using a 2-element array for a person's name and link when you should use a Human object instead...");
        return toNode(linkElement);
    } else {
        var link = document.createElement("a");
        link.href = targetUrl;
        link.appendChild(toNode(linkElement));
        return link;
    }
}

/**
 * Returns a link node leading to target with visible text.
 */
function createTextLink(text, target) {
    if (target == undefined) {
        return toNode(text);
    } else {
        var link = document.createElement("a");
        link.href = target;
        link.appendChild(toNode(text));
        return link;
    }
}

/**
 * Returns a partially-shown list that can be extended by the user.
 *
 * @param list  The list you want to make only show up in pieces.
 * @param numberOfItems  The number of items to be visible at a time.
 */
function createPartiallyVisibleList(list, numberOfItems) {
    return createPartiallyVisibleListHelper(list, numberOfItems, numberOfItems);
}

function createPartiallyVisibleListHelper(list, numberOfItemsVisible, numberOfItemsToAddWithClick) {
    var wholeList = list.cloneNode(true);
    //remove the items that are not supposed to be visible
    while (list.childNodes.length > numberOfItemsVisible) {
        list.removeChild(list.lastChild);
    }
    if (wholeList.childNodes.length > numberOfItemsVisible) {
        var numberToExtend = Math.min(numberOfItemsToAddWithClick, wholeList.childNodes.length - numberOfItemsVisible);
        //button to extend list partially
        var extendButton = document.createElement("input");
        extendButton.setAttribute("type", "button");
        extendButton.value = "Click for " + numberToExtend + " more";
        extendButton.onclick = function() {
            var parent = list.parentNode;
            parent.replaceChild(createPartiallyVisibleListHelper(wholeList, numberOfItemsVisible + numberToExtend, numberOfItemsToAddWithClick), list);
        }
        list.appendChild(extendButton);
        //button to extend the list completely
        var extendFullyButton = document.createElement("input");
        extendFullyButton.setAttribute("type", "button");
        extendFullyButton.value = "Click for all";
        extendFullyButton.onclick = function() {
            var parent = list.parentNode;
            parent.replaceChild(createPartiallyVisibleListHelper(wholeList, wholeList.childNodes.length, numberOfItemsToAddWithClick), list);
        }
        list.appendChild(extendFullyButton);
    }
    return list;
}

/**
 * Creates a list node (ul or ol) with the given contents.
 *
 * @param listItemContents An array of the contents to be added to the list items (not the <li> nodes themselves).
 */
function createList(isOrdered, listItemContents) {
    var list;
    if (isOrdered) {
        list = document.createElement("ol");
    } else {
        list = document.createElement("ul");
    }
    for (var i = 0; i < listItemContents.length; i++) {
        var listItem = document.createElement("li");
        list.appendChild(listItem);
        var content = toNode(listItemContents[i]);
        //console.log("content: " + content);
        bananas = content;
        if (content === undefined) {
            console.log("pre-contents: " + listItemContents[i]);
            bananas = listItemContents[i];
        }
        listItem.appendChild(content);
    }
    return list;
}

/**
 * Creates an element from an array of humans, with commas and an appropriately-placed 'and'.
 */
function humanArrayToElement(humans) {
    var span = document.createElement("span");
    for (var i = 0; i < humans.length; i++) {
        var human = humans[i];
        appendChildrenTo(span, [human.toNode()]);
        if (i < humans.length - 1 && humans.length > 2) {
            span.appendChild(toNode(", "));
        }
        if (i == humans.length - 2) {
            if (humans.length == 2) {
                span.appendChild(toNode(" "));
            }
            span.appendChild(toNode("and "));
        }
    }
    return span;
}

/**
 * Creates a citation for a preprint.
 */
function createPreprintFragment(title, authorList, statusElement, arxivURL, abstractAbstract) {
    abstractAbstract = abstractAbstract || "";
    if (abstractAbstract != "") {
        abstractAbstract = "  (Summary: " + abstractAbstract + ")";
    }
    var arxivLinkElement = document.createElement("span");
    if (arxivURL != undefined) {
        appendChildrenTo(arxivLinkElement, ["(", createLink("arxiv preprint", arxivURL), ")"]);
    }

    //start building the fragment
    fragment = document.createDocumentFragment();
    appendChildrenTo(fragment, [createElementWithChildren("em", [title]), ".  ", humanArrayToElement(authorList), ".  ", statusElement, "  ", arxivLinkElement, "  ", abstractAbstract, document.createElement("br"), document.createElement("br")]);

    return fragment;
}

/**
 * Creates a citation for a publication.
 */
function createCitationFragment(title, authors, publishedInElement, linkList, abstractAbstract) {
    citation = document.createDocumentFragment();
    citation.appendChild(document.createElement("em"));
    citation.lastChild.appendChild(toNode(title));
    citation.appendChild(document.createTextNode(".  "));
    abstractAbstract = abstractAbstract || "";
    if (abstractAbstract != "") {
        abstractAbstract = "  (Summary: " + abstractAbstract + ")";
    }
    citation.appendChild(humanArrayToElement(authors));
    citation.appendChild(document.createTextNode(".  "));
    citation.appendChild(publishedInElement);
    citation.appendChild(document.createTextNode(".  "));
    for (var i = 0; i < linkList.length; i++) {
        citation.appendChild(document.createTextNode("("));
        citation.appendChild(linkList[i]);
        citation.appendChild(document.createTextNode(") "));
    }
    appendChildrenTo(citation, [abstractAbstract]);
    return citation;
}

/**
 * Creates a DOM node that describes a presentation.
 */
function createPresentationElement(title, webpage, dateAsString, venueNode, copresenterLinkList, slidesNode) {
    var element = document.createDocumentFragment();
    element.appendChild(document.createTextNode(dateAsString + ": "));
    //add the title of the talk
    element.appendChild(document.createElement("em"));
    if (webpage == null) {
        element.lastChild.appendChild(document.createTextNode(title));
    } else {
        element.lastChild.appendChild(createTextLink(title, webpage));
    }
    //now add the colloquia series it's a part of (if any)
    if (venueNode != null) {
        element.appendChild(document.createTextNode(", "));
        element.appendChild(venueNode);
    }
    if (copresenterLinkList.length > 0) {
        element.appendChild(document.createTextNode(".  Presented with: "));
        for (var i = 0; i < copresenterLinkList.length; i++) {
            element.appendChild(createTextLink(copresenterLinkList[i][0], copresenterLinkList[i][1]));
            //if there's yet another name, add a comma.
            if (i < copresenterLinkList.length - 1) {
                element.appendChild(document.createTextNode(", "));
            }
        }
    }
    element.appendChild(document.createTextNode("."));
    if (slidesNode != undefined) {
        element.appendChild(document.createTextNode("  ("));
        element.appendChild(slidesNode);
        element.appendChild(document.createTextNode(")"));
    }
    return element;
}

/**
 * Returns an element that looks like code on a black background.
 */
function createCodeBlock(codeLineList) {
    var block = document.createElement("div");
    block.style.textAlign = "left";
    block.style.backgroundColor = "black";
    block.style.color = "white";
    var code = document.createElement("code");
    block.appendChild(code);
    for (var i = 0; i < codeLineList.length; i++) {
        code.appendChild(toNode(codeLineList[i]));
        code.appendChild(document.createElement("br"));
    }
    return block;
}

/**
 * Returns a random element from an array, distributed uniformly.
 */
function randomChoice(array) {
    var index = Math.floor((Math.random() * array.length));
    return array[index];
}


/*******<<time>>*******************************************************************
 **********************************************************************************
 ** A bunch of utility functions for dates and times!  Awesome!  (I really think some of these should be a part of the Date class.  I should probably define my own class here...)  Javascript Date object described here: http://www.w3schools.com/jsref/jsref_obj_date.asp **/

/**
 * Constant for the days of the week.
 */
var DAYS_OF_THE_WEEK = new Array("Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday");

/**
 * Creates a new Date object, independent of the time.
 */
function createDate(day, month, year) {
    var date = new Date();
    date.setFullYear(year);
    date.setMonth(month);
    date.setDate(day);
    date.setHours(0);
    date.setMinutes(0);
    date.setSeconds(0);
    return date;
}

/**
 * Returns the index of a day (0-6) corresponding to the given string.
 */
function getDayOfTheWeekNumberFromString(dayName) {
    for (var i = 0; i < 7; i++) {
        if (dayName.toLowerCase() == DAYS_OF_THE_WEEK[i].toLowerCase()) {
            return i;
        }
    }
    alert("Incorrect name of a day given to getDayOfTheWeekNumberFromString()");
    return -1;
}

/**
 * Gets a short string version (max 5 chars) of a month. (January = 0)
 */
function getShortMonthName(monthIndex) {
    var months = ["Jan.", "Feb.", "March", "April", "May", "June", "July", "Aug.", "Sept.", "Oct.", "Nov.", "Dec."];
    return months[monthIndex];
}

/**
 * Gets a date span string from two dates.  (Doesn't print times, just the dates.)
 */
function dateSpanString(beginDate, endDate) {
    if (endDate < beginDate) {
        //out of order.  Recursive call on reverse.
        return dateSpanString(endDate, beginDate);
    }
    var string = "";
    var beginDay = beginDate.getDate();
    var beginMonth = beginDate.getMonth();
    var beginYear = beginDate.getFullYear();
    var endDay = endDate.getDate();
    var endMonth = endDate.getMonth();
    var endYear = endDate.getFullYear();
    string += getShortMonthName(beginMonth) + " " + beginDay;
    if (getDayDifference(endDate, beginDate) > 0) {
        //multiple days
        if (endYear != beginYear) {
            //years are not the same, so put the begin year in.
            string += ", " + beginYear;
        }
        string += " - ";
        if (endMonth != beginMonth || endYear != beginYear) {
            //spans two months
            string += getShortMonthName(endMonth) + " ";
        }
        string += endDay;
    }
    string +=", " + endYear;
    return string;
}

/**
 * Returns a copy of a Date.
 */
function copyDate(date) {
    return new Date(date.getTime());
}

/**
 * Copies the time of day from one date to another.
 */
function copyTimeOfDay(timeOfDayDate, dateToChange) {
    if (timeOfDayDate instanceof Date) {
        //console.log("No problem.");
        dateToChange.setHours(timeOfDayDate.getHours());
        dateToChange.setMinutes(timeOfDayDate.getMinutes());
        dateToChange.setSeconds(timeOfDayDate.getSeconds());
        dateToChange.setMilliseconds(timeOfDayDate.getMilliseconds());
    } else {
        console.log("timeOfDayDate: " + timeOfDayDate);
    }
}

/**
 * Returns a new Date numberOfDays later than the given date.
 */
function addDays(date, numberOfDays) {
    var newDate = copyDate(date);
    newDate.setDate(date.getDate() + numberOfDays);
    return newDate;
}

/**
 * Determines whether two dates are on the same day.
 */
function areSameDay(date, otherDate) {
    return (date.getFullYear() == otherDate.getFullYear() && date.getMonth() == otherDate.getMonth() && date.getDate() == otherDate.getDate());
}

/**
 * Determines the number of days between two dates.
 */
function getDayDifference(laterDate, earlierDate) {
    //these next two lines are testing the types.  Both should be dates
    laterDate.toDateString();
    earlierDate.toDateString();

    if (areSameDay(earlierDate, laterDate)) {
        return 0;
    }
    if (earlierDate > laterDate) {
        return -1 * getDayDifference(earlierDate, laterDate);
    }
    return getDayDifferenceHelper(laterDate, earlierDate);
}

/**
 * Determines the number of days between two dates.
 */
function getDayDifferenceHelper(laterDate, earlierDate) {
    //millisecondsDifference
    var msDifference = laterDate.getTime() - earlierDate.getTime();
    var millisecondsPerDay = 1000 * 60 * 60 * 24;
    var averageDayDifference = Math.floor(msDifference / millisecondsPerDay);
    var minDayDifference = averageDayDifference - 1;
    var maxDayDifference = averageDayDifference + 1;
    var possibleDayDifferences = [minDayDifference, averageDayDifference, maxDayDifference];
    for (var i = 0; i < possibleDayDifferences.length; i++) {
        var dayDifference = possibleDayDifferences[i];
        if (areSameDay(addDays(earlierDate, dayDifference), laterDate)) {
            return dayDifference;
        }
    }
    alert("getDayDifferenceHelperZero couldn't figure out the difference between " + earlierDate + " and " + laterDate + ".  millis: " + msDifference + "  avgDayDiff: " + averageDayDifference);
}

/*********************** These functions are for creating the senior project page.  ***********/


/**
 *
 * @
 */
function seniorProjectNode(presenterNode, presentationDate, programText, titleText, descriptionText, projectUrl, productUrl) {

    //create the title node with a link to the project/product page as appropriate
    titleText = titleText || "???";
    var today = new Date();
    var titleNode = toNode(titleText);
    if (projectUrl != undefined) {
        titleNode = createTextLink(titleText, projectUrl);
    }
    if (productUrl != undefined && today.getTime() > presentationDate.getTime()) {
        titleNode = createTextLink(titleText, productUrl);
    }

    //set up the program node.
    var programNode;
    if (programText != undefined) {
        programNode = toNode(" (" + programText + " major)");
    } else {
        programNode = toNode("");
    }

    //double check the presenter node
    var presenterNode = toNode(presenterNode);

    //set up the description node (usually text)
    var descriptionNode = document.createElement("p");
    if (descriptionText != undefined) {
        descriptionNode.appendChild(toNode(descriptionText));
    } else {
        descriptionNode = document.createDocumentFragment();
    }
    descriptionNode.style.fontStyle = "italic"; //TODO: fix this


    var fragment = document.createDocumentFragment();
    appendChildrenTo(fragment, [presenterNode, programNode, toNode(" : \""), titleNode, toNode("\""), descriptionNode]);
    return fragment;
}

function seniorProjectListItem(presenterNode, presentationDate, programText, titleText, descriptionText, projectUrl, productUrl) {
    var projectNode = seniorProjectNode(presenterNode, presentationDate, programText, titleText, descriptionText, projectUrl, productUrl);
    return createElementWithChildren("li", [projectNode]);
}

/*************************These functions create the flash-card-type quiz for learning student names!*************/

function nameQuiz() {
    //var table = document.createElement("table");
    //console.log("Made the table!  We've got " + table.rows.length + " rows!");
    var list = new Array();
    putPicsAndNamesInList(document.body, list);
    clearBody();
    var listCopy = new Array();
    for (var i = 0; i < list.length; i++) {
        listCopy.push(list[i]);
    }
    pictureQuiz(list, [], listCopy);
    //document.body.appendChild(table);
}

function pictureQuiz(partialList, nextRoundList, fullList) {
    document.title = "Student Name Quiz";
    clearBody();
    document.body.style.textAlign = "center";
    if (partialList.length == 0) {
        if (nextRoundList.length == 0) {
            //we've guessed all the names, now it's time to ask whether we should restart
            var youWinP = document.createElement("p");
            document.body.appendChild(youWinP);
            youWinP.appendChild(toNode("Sweet!  Nice job!  Play again?"));

            var againDiv = document.createElement("div");
            document.body.appendChild(againDiv);
            var playAgain = document.createElement("button");
            var fullListCopy = fullList;
            playAgain.onclick = function() {
                fullListCopyCopy = [];
                for (var i = 0; i < fullListCopy.length; i++) {
                    fullListCopyCopy.push(fullListCopy[i]);
                }
                pictureQuiz(fullListCopy, [], fullListCopyCopy);
            };
            playAgain.appendChild(toNode("Play again"));
            againDiv.appendChild(playAgain);

            var allDoneP = document.createElement("p");
            document.body.appendChild(allDoneP);
            allDoneP.appendChild(toNode("Otherwise, hit refresh to get back to your detailed class list."));
        } else {
            //there are still some in the next round.  Time to quiz on them!
            pictureQuiz(nextRoundList, [], fullList);
        }
    } else {
        var randomIndex = Math.floor((Math.random() * partialList.length));
        var picture = partialList[randomIndex];
        var image = document.createElement("img");
        image.src = picture[0];
        document.body.appendChild(image);

        var question = document.createElement("p");
        question.appendChild(toNode("Who is this?"));
        document.body.appendChild(question);

        var buttons = document.createElement("div");
        document.body.appendChild(buttons);
        var iKnow = document.createElement("button");
        iKnow.appendChild(toNode("I know!"));
        var partialListCopy = partialList;
        var nextRoundListCopy = nextRoundList;
        partialListCopy.splice(randomIndex, 1);
        iKnow.onclick = function() {
            pictureQuiz(partialListCopy, nextRoundListCopy, fullList);
        };
        buttons.appendChild(iKnow);

        var dontKnow = document.createElement("button");
        dontKnow.appendChild(toNode("I don't know."));
        dontKnow.onclick = function() {
            document.body.removeChild(question);
            document.body.removeChild(buttons);
            var newP = document.createElement("p");
            document.body.appendChild(newP);
            appendChildrenTo(newP, [toNode("Why that's: "), document.createElement("br"), toNode(picture[1])]);

            var moveOnDiv = document.createElement("div");
            document.body.appendChild(moveOnDiv);
            var button = document.createElement("button");
            moveOnDiv.appendChild(button);
            button.appendChild(toNode("Next student."));
            var partialListCopy = partialList;
            var nextRoundListCopy = nextRoundList;
            nextRoundListCopy.push(picture);
            var fullListCopy = fullList;
            button.onclick = function() {pictureQuiz(partialListCopy, nextRoundListCopy, fullListCopy);};
        }
        buttons.appendChild(dontKnow);
    }
}

function putPicsAndNamesInList(element, list) {
    if (element.nodeName == "TD" && element.className.toLowerCase() == "dddefault") {
        if (element.firstChild.nodeName == "IMG" && element.firstChild.alt == "Picture Not Available") {
            var studentImg = element.firstChild;
            var studentName = "";
            if (element.childNodes[2].nodeName == "A") {
                //this case: is a class page
                studentName = element.childNodes[2].innerHTML;
            } else {
                //this case: advising page
                //the name cell is the third cell (td) in the parent's list of children
                var index = 0;
                for (var tdNum = 0; tdNum < 3; index ++) {
                    var child = element.parentElement.childNodes[index];
                    if (child.nodeName == "TD") {
                        tdNum ++;
                    }
                }
                var studentNameCell = element.parentElement.childNodes[index-1];
                monkey = studentNameCell;
                studentName = studentNameCell.innerHTML;
            }
            //console.log("name: " + studentName);
            list.push([element.firstChild.src, studentName]);
            /*var row = resultingTable.insertRow(-1);
            var cell = row.insertCell(-1);
            cell.appendChild(element.firstChild.cloneNode());
            var cell = row.insertCell(-1);
            cell.appendChild(document.createTextNode(element.childNodes[2].innerHTML));
            */

        }
    } else {
        for (var i = 0; i < element.childNodes.length; i++) {
            putPicsAndNamesInList(element.childNodes[i], list);
        }
    }
}

/*******<<main>>*****************************************************************
 ********************************************************************************
 ** Functions that generate content for my main webpages. **/

/**
 * Returns a Node containing a list of my recent hightlights.
 */
function getNewsList() {

    var events = document.createElement("div");

    /* */
    var futureNews = createNiceTitledDiv("Up-and-Coming Events");
    futureNews.appendChild(createList(false, ["August 2016: Games @ Dal(housie)"]));
    events.appendChild(futureNews);
    events.appendChild(document.createElement("br"));


    var news = createNiceTitledDiv("Recent Highlights");
    var newsList = document.createElement("ul");
    news.appendChild(newsList);
    newsList.appendChild(document.createElement("li"));
    appendChildrenTo(newsList.lastChild, ["Feb. 11, 2016: Math Dept talk: ", createTextLink("Keeping Your Distance is Hard", getPublicFileLink("presentations/keepYourDistance/keepDistancePlyStateMath201602.pdf")), "."]);
    newsList.appendChild(document.createElement("li"));
    appendChildrenTo(newsList.lastChild, ["August, 2015: Attended Games at Dal 2015."]);
    newsList.appendChild(document.createElement("li"));
    appendChildrenTo(newsList.lastChild, [toNode("June 6, 2015: I spoke about "), createTextLink("2-color Graph Placement Games", "https://cms.math.ca/Events/summer15/abs/gpg#kb"), toNode(" at the "), createTextLink("CMS Summer Meeting", "https://cms.math.ca/Events/summer15/"), toNode(".")]);
    newsList.appendChild(document.createElement("li"));
    appendChildrenTo(newsList.lastChild, [toNode("April 17, 2015: CCSCNE Lightning Talk about teaching with "), createTextLink("data structures games", "http://program.ccscne.org/2015/#prog/tag:Lightning+Talk"), toNode(".")]);
    newsList.appendChild(document.createElement("li"));
    appendChildrenTo(newsList.lastChild, [toNode("April 17, 2015: CCSCNE Workshop about "), createTextLink("teaching with Chapel", "http://program.ccscne.org/2015/#prog/tag:Workshop"), toNode(".")]);
    /*
    newsList.appendChild(document.createElement("li"));
    appendChildrenTo(newsList.lastChild, [toNode("Feb. 27, 2015: BUCS Theory Seminar on "), createTextLink("data structures games", "http://www.bu.edu/cs/news/calendar/?eid=165760"), toNode(".")]);
    newsList.appendChild(document.createElement("li"));
    newsList.lastChild.appendChild(document.createTextNode("Feb. 19, 2015: Talked about "));
    newsList.lastChild.appendChild(createTextLink("voting issues", getPublicFileLink("presentations/voting/plymouthMath201502.pdf")));
    newsList.lastChild.appendChild(document.createTextNode(" at our math dept's seminar series."));
    newsList.appendChild(document.createElement("li"));
    newsList.lastChild.appendChild(document.createTextNode("Jan 22, 2015: Presented on Boolean Formula games at "));
    newsList.lastChild.appendChild(createTextLink("CGTC1", "http://cgtc.eu/1"));
    newsList.lastChild.appendChild(document.createTextNode("."));
    //newsList.appendChild(document.createElement("li"));
    //newsList.lastChild.appendChild(document.createTextNode("September 2014: Kyle starts teaching at Plymouth State!"));


    newsList.appendChild(document.createElement("li"));
    newsList.lastChild.appendChild(document.createTextNode("March 8, 2014: "));
    newsList.lastChild.appendChild(createTextLink("David Bunde", "http://faculty.knox.edu/dbunde/"));
    newsList.lastChild.appendChild(document.createTextNode(" and I presented a workshop on teaching with "));
    newsList.lastChild.appendChild(createTextLink("Chapel", "http://chapel.cray.com"));
    newsList.lastChild.appendChild(document.createTextNode(" at "));
    newsList.lastChild.appendChild(createTextLink("SIGCSE 2014", "http://sigcse2014.sigcse.org/"));
    newsList.lastChild.appendChild(document.createTextNode("."));
    newsList.appendChild(document.createElement("li"));
    newsList.lastChild.appendChild(document.createTextNode("February 4, 2014: Presented Neighboring Nim for the Math department at "));
    newsList.lastChild.appendChild(createTextLink("University of New England ", "http://www.une.edu/cas/math/"));
    newsList.lastChild.appendChild(document.createTextNode("."));
    newsList.appendChild(document.createElement("li"));
    newsList.lastChild.appendChild(document.createTextNode("January 24, 2014: I spoke about "));
    newsList.lastChild.appendChild(createTextLink("boolean formula games", "http://www.bu.edu/cs/news/calendar/?eid=148535"));
    newsList.lastChild.appendChild(document.createTextNode(" at Boston University."));
    newsList.appendChild(document.createElement("li"));
    newsList.lastChild.appendChild(document.createTextNode("January 2014: I created a "));
    newsList.lastChild.appendChild(createTextLink("Linux/Unix terminal tutorial", HOME + "?resource=terminalTutorial"));
    newsList.lastChild.appendChild(document.createTextNode(" for basic commands."));
    newsList.appendChild(document.createElement("li"));
    newsList.lastChild.appendChild(document.createTextNode("November 21, 2013: "));
    newsList.lastChild.appendChild(createTextLink("David Bunde", "http://faculty.knox.edu/dbunde/"));
    newsList.lastChild.appendChild(document.createTextNode(" and I gave a "));
    newsList.lastChild.appendChild(createTextLink("workshop", "http://sc13.supercomputing.org/schedule/event_detail.php?evid=eps110"));
    newsList.lastChild.appendChild(document.createTextNode(" on teaching with "));
    newsList.lastChild.appendChild(createTextLink("Chapel", "http://chapel.cray.com"));
    newsList.lastChild.appendChild(document.createTextNode(" at "));
    newsList.lastChild.appendChild(createTextLink("Supercomputing 2013", "http://sc13.supercomputing.org/"));
    newsList.lastChild.appendChild(document.createTextNode("."));
    newsList.appendChild(document.createElement("li"));
    newsList.lastChild.appendChild(document.createTextNode("October 25, 2013: I spoke about boolean variable games at "));
    newsList.lastChild.appendChild(createTextLink("Integers 2013", "http://www.westga.edu/~math/IntegersConference2013/"));
    newsList.lastChild.appendChild(document.createTextNode("."));
    /*
    newsList.appendChild(document.createElement("li"));
    newsList.lastChild.appendChild(document.createTextNode("September, 2013: I started my first semester at Colby College."));*/

    events.appendChild(news);
    //events.appendChild(document.createElement("br"));
    return events;
}

/**
 * Returns a Node containing a list of my current research interests.
 */
function getResearchInterestsList() {

    var researchInterests = createNiceTitledDiv("Research Interests");
    researchInterests.appendChild(document.createElement("ul"));
    researchInterests.lastChild.appendChild(document.createElement("li"));
    researchInterests.lastChild.lastChild.appendChild(document.createTextNode("("));
    researchInterests.lastChild.lastChild.appendChild(createTextLinkTemp("http://erikdemaine.org/papers/AlgGameTheory_GONC3/paper.pdf", "Algorithmic"));
    researchInterests.lastChild.lastChild.appendChild(document.createTextNode(") "));
    researchInterests.lastChild.lastChild.appendChild(createTextLinkTemp("https://en.wikipedia.org/wiki/Combinatorial_game_theory", "Combinatorial Game Theory"));
    researchInterests.lastChild.lastChild.appendChild(document.createTextNode("."));
    researchInterests.lastChild.appendChild(document.createElement("li"));
    researchInterests.lastChild.lastChild.appendChild(createTextLinkTemp("https://en.wikipedia.org/wiki/Computational_complexity_theory", "Computational Complexity"));
    researchInterests.lastChild.lastChild.appendChild(document.createTextNode("."));
    researchInterests.lastChild.appendChild(document.createElement("li"));
    researchInterests.lastChild.lastChild.appendChild(document.createTextNode("Object-Oriented Parallel Software Design."));//TODO: get a link for this...  but to whom?
    researchInterests.lastChild.appendChild(document.createElement("li"));
    researchInterests.lastChild.lastChild.appendChild(createTextLinkTemp("https://en.wikipedia.org/wiki/Computational_complexity_theory", "Parallel Algorithms"));
    researchInterests.lastChild.lastChild.appendChild(document.createTextNode("."));

    return researchInterests;
}

/**
 * Returns a list of on-going research projects.
 */
function getHtmlOngoingResearchList() {
    var ongoingList = document.createElement("ul");
    ongoingList.setAttribute("class", "disc");

    //CGT blog
    ongoingList.appendChild(document.createElement("li"));
    ongoingList.lastChild.appendChild(createTextLink("Combinatorial Game Theory Blog", "http://combinatorialgametheory.blogspot.com/"));
    ongoingList.lastChild.appendChild(document.createTextNode("."));

    //Ruleset Table
    ongoingList.appendChild(document.createElement("li"));
    ongoingList.lastChild.appendChild(createTextLink("Ruleset Properties", "rulesetTable.php"));
    ongoingList.lastChild.appendChild(document.createTextNode(".  Help me expand this!"));

    //CGT Meetings
    var meetingsList = createElementWithChildren("li", ["I maintain a list of ", createLink("Combinatorial Game Theory meetings", HOME + "CGTMeetings.php"), " including workshops and conferences."]);
    ongoingList.appendChild(meetingsList);

    //return the list
    return ongoingList;

}

/**
 * Returns a list of my not-yet-published papers.
 */
function getHtmlPreprintList() {

    //Neighboring Nim
    var neighboringNim = createPreprintFragment("A PSPACE-complete Graph Nim", [ME_NO_LINK, OLIVIA_GEORGE], "Accepted to Games of No Chance 5.", "http://arxiv.org/abs/1101.1507", "Defines vertex-based variant of NimG and shows PSPACE-hardness even with piles of just 2 sticks.");

    //Data Structures Games
    var status = createElementWithChildren("span", ["Submitted to special edition of ", createLink("IJGT", "http://www.springer.com/economics/economic+theory/journal/182"), " for ", createLink("CGTC1", "http://cgtc.eu/1/callforpapers"), "."]);
    var dataStructuresGames = createPreprintFragment("Games from Basic Data Structures", [MARA_BOVEE, ME, CRAIG_TENNENHOUSE], status, "http://arxiv.org/abs/1605.06327", "Defines Combinatorial Games for common data structures, with efficient algorithms to solve many of them.");

    //Keeping Distance
    var status = createElementWithChildren("span", ["Submitted to special edition of ", createLink("IJGT", "http://www.springer.com/economics/economic+theory/journal/182"), " for ", createLink("CGTC1", "http://cgtc.eu/1/callforpapers"), "."]);
    var keepingDistance = createPreprintFragment("Keeping Your Distance is Hard", [ME_NO_LINK, SILVIA_HEUBACH, MELISSA_HUGGAN, SVENJA_HUNTEMANN], status, "http://arxiv.org/abs/1605.06801", "Investigates hardness of distance games, finding large families that are PSPACE-complete.");

    //Hard Placement Games
    var hardPlacement = createPreprintFragment("PSPACE-complete Two-color Placement Games", [ME_NO_LINK, BOB_HEARN], "Unsubmitted.", "http://arxiv.org/abs/1602.06012", "Shows hardness of Col, Fjords, and NoGo on planar graphs.");

    return  createList(false, [neighboringNim, dataStructuresGames, keepingDistance, hardPlacement]);
}

/**
 * Returns an html list of my publications.
 */
function getHtmlPublicationList() {
    //people that might show up in multiple places
    var me = new Array("K. Burke", null);

    //set up the list
    var list = document.createElement("ul");
    list.setAttribute("class", "disc");
    list.appendChild(document.createTextNode("["));
    list.appendChild(createTextLink("DBLP", "http://www.informatik.uni-trier.de/~ley/pers/hd/b/Burke:Kyle_G=.html"));
    list.appendChild(document.createTextNode("]"));



    //Buttons & Scissors
    var buttonsAndScissors = document.createElement("li");
    list.appendChild(buttonsAndScissors);
    var jcdcgg2015 = createElementWithChildren("span", [createLink("Springer LNCS 9943: Discrete and Computational Geometry and Graphs", "http://www.springer.com/us/book/9783319485317"), ", proceedings from ", createLink("JCDCGG 2015", "http://www.kurims.kyoto-u.ac.jp/~takazawa/JCDCGG2015/", ".")])
    appendChildrenTo(buttonsAndScissors, [createCitationFragment("Single-Player and Two-Player Buttons and Scissors Games", [ME_NO_LINK, ERIK_DEMAINE, HARRISON_GREGG, BOB_HEARN, ADAM_HESTERBERG, MICHAEL_HOFFMANN, ITO_HIRO, IRINA_KOSTITSYNA, JODY_LEONARD, MAARTEN_LOFFLER, AARON_SANTIAGO, CHRISTIANE_SCHMIDT, UEHARA_RYUHEI, UNO_YUSHI, AARON_WILLIAMS], jcdcgg2015, [createLink("arXiv", "http://arxiv.org/abs/1607.01826")], "Defines many variants of Buttons-and-Scissors puzzles--including 2-player combinatorial games--then shows hardness of the variants."), document.createElement("br"), document.createElement("br")]);

    //2^3 Boolean games
    var eightBooleanGames = document.createElement("li");
    list.appendChild(eightBooleanGames);
    var sat8Title = document.createElement("span");
    var raised = document.createElement("sup");
    raised.appendChild(toNode("3"));
    appendChildrenTo(sat8Title, ["2", raised, " Quantified Boolean Formula Games and Their Complexities"]);
    var integers15A = document.createDocumentFragment();
    appendChildrenTo(integers15A, [createLink("Integers", "http://www.integers-ejcnt.org/"), " ", createLink("vol. 15A: Proceedings of Integers 2013", "http://www.integers-ejcnt.org/vol15a.html"), ", 2015"]);
    appendChildrenTo(eightBooleanGames, [createCitationFragment(sat8Title, [ME_NO_LINK], integers15A, [createLink("arXiv", "http://arxiv.org/abs/1401.3687")], "defines seven new formula games, five of which are PSPACE-complete."), document.createElement("br"), document.createElement("br")]);

    //impartial coloring games
    list.appendChild(document.createElement("li"));
    var tcs485 = document.createDocumentFragment();
    tcs485.appendChild(createTextLink("Theoretical Computer Science", "http://www.informatik.uni-trier.de/~ley/db/journals/tcs/index.html"));
    tcs485.appendChild(document.createTextNode(" "));
    tcs485.appendChild(createLink("vol. 485", "http://www.informatik.uni-trier.de/~ley/db/journals/tcs/tcs485.html#BeaulieuBD13"));
    tcs485.appendChild(document.createTextNode(", 49-60, 2013"));
    list.lastChild.appendChild(createCitationFragment("Impartial Coloring Games", [GABRIEL_BEAULIEU, ME_NO_LINK, ERIC_DUCHENE], tcs485, new Array(createTextLinkTemp("http://dx.doi.org/10.1016/j.tcs.2013.02.032", "DOI link"), createTextLinkTemp("http://arxiv.org/abs/1202.5762", "arXiv"), createTextLinkTemp("http://dblp.uni-trier.de/rec/bibtex/journals/tcs/BeaulieuBD13", "BibTeX")), "creates a bunch of impartial coloring games on graphs and digraphs; proves many are PSPACE-complete."));
    list.lastChild.appendChild(document.createElement("br"));
    list.lastChild.appendChild(document.createElement("br"));

    //splash 2010
    list.appendChild(document.createElement("li"));
    var splash2010 = document.createDocumentFragment();
    splash2010.appendChild(createTextLinkTemp("http://www.cs.pomona.edu/~kim/CCP2010.html", "Workshop on Curricula for Concurrency and Parallelism"));
    splash2010.appendChild(document.createTextNode(" at "));
    splash2010.appendChild(createTextLinkTemp("http://www.splashcon.org/2010/", "SPLASH 2010"));
    list.lastChild.appendChild(createCitationFragment("Concurrency and Parallelism as a Medium for Computer Science Concepts", [STEVE_BOGAERTS, ME_NO_LINK, BRIAN_SHELBURNE, ERIC_STAHLBERG], splash2010, [createLink("pdf", "http://www.cs.pomona.edu/~kim/CCP2010Papers/bogaerts.pdf")], "position paper regarding incorporating parallelism across a CS curriculum."));
    list.lastChild.appendChild(document.createElement("br"));
    list.lastChild.appendChild(document.createElement("br"));

    //Ph.D. Thesis
    list.appendChild(document.createElement("li"));
    list.lastChild.appendChild(createCitationFragment("Science for Fun: New Impartial Board Games", [ME_NO_LINK], toNode("Ph.D. Thesis, Boston University, May 2009"), [createLink("pdf", getPublicFileLink("thesis.pdf"))], "covers games: Atropos, Matchmaker, and Dictator."));
    list.lastChild.appendChild(document.createElement("br"));
    list.lastChild.appendChild(document.createElement("br"));

    //Atropos: Internet Mathematics
    var internetMath = createElementWithChildren("span", [createLink("Internet Mathematics", "http://www.informatik.uni-trier.de/~ley/db/journals/im/index.html"), " ", createLink("vol. 5", "http://www.informatik.uni-trier.de/~ley/db/journals/im/im5.html"), " no. 4: 477-492 (2008)"]);
    var atropos2008 = createElementWithChildren("li", [createCitationFragment("Atropos: A PSPACE-Complete Sperner Triangle Game", [ME_NO_LINK, SHANGHUA], internetMath, [createLink("DOI", "http://dx.doi.org/10.1080/15427951.2008.10129176")], "republication of 2007 WINE paper as chosen by editors."), document.createElement("br"), document.createElement("br")]);
    list.appendChild(atropos2008);

    //Atropos: WINE
    var wine = createElementWithChildren("span", [createLink("Internet and Network Economics, Third International Workshop, WINE 2007, San Diego, CA, USA, December 12-14, 2007, Proceedings", "http://link.springer.com/book/10.1007%2F978-3-540-77105-0"), ": 445-456"]);
    var atropos2007 = createElementWithChildren("li", [createCitationFragment("A PSPACE-complete Sperner Triangle Game", [ME_NO_LINK, SHANGHUA], wine, [createLink("DOI", "http://dx.doi.org/10.1007/978-3-540-77105-0_49")], "defines Atropos and shows PSPACE-completeness.")]);
    list.appendChild(atropos2007);

	return list;
}

/**
 * Returns an html list of my presentations.
 * TODO: finish changing this to return a <ul> list!
 */
function getHtmlPresentationList() {
    //presentation groups
    var a2aGroup = new Array(new Array("Steven Bogaerts", null), new Array("Brian Shelburne", "http://userpages.wittenberg.edu/bshelburne/"), new Array("Melissa Smith", "http://www.parl.clemson.edu/~smithmc/"), new Array("Eric Stahlberg", null));
    var davidBunde = new Array(new Array("David Bunde", "https://www.knox.edu/academics/faculty/bunde-david.html"));

    var list = document.createElement("ul");
    list.setAttribute("class", "disc");

    //PlyState Math - Distance Games
    list.appendChild(document.createElement("li"));
    list.lastChild.appendChild(createPresentationElement("Keeping Your Distance is Hard", null, "Feb. 11, 2016", createTextLink("Plymouth State Math Seminar", "http://www.plymouth.edu/department/math/seminars/"), new Array(),  createTextLink("Slides - pdf", getPublicFileLink("presentations/keepYourDistance/keepDistancePlyStateMath201602.pdf"))));
    list.lastChild.appendChild(document.createElement("br"));
    list.lastChild.appendChild(document.createElement("br"));

    //CMS Summer 2015
    list.appendChild(document.createElement("li"));
    list.lastChild.appendChild(createPresentationElement("Two-Color Placement Games on Graphs", "https://cms.math.ca/Events/summer15/abs/gpg#kb", "June 6, 2015", createTextLink("CMS 2015 Summer Meeting", "https://cms.math.ca/Events/summer15/"), new Array(),  createTextLink("Slides - pdf", getPublicFileLink("presentations/twoColorPlacement/UpeiCms201506.pdf"))));
    list.lastChild.appendChild(document.createElement("br"));
    list.lastChild.appendChild(document.createElement("br"));

    //CCSCNE 2015: DS Games
    list.appendChild(document.createElement("li"));
    list.lastChild.appendChild(createPresentationElement("An Abstract Game for each Data Structure", "http://program.ccscne.org/2015/#prog/tag:Lightning+Talk", "April 17, 2015", createTextLink("CCSCNE 2015", "http://ccscne.org/conferences/ccscne-2015/"), new Array(),  createTextLink("Slides - pdf", getPublicFileLink("presentations/dataStructuresGames/ccscneLightningTalk.pdf"))));
    list.lastChild.appendChild(document.createElement("br"));
    list.lastChild.appendChild(document.createElement("br"));

    //CCSCNE 2015: Chapel Workshop
    list.appendChild(document.createElement("li"));
    list.lastChild.appendChild(createPresentationElement("Chapel: A Versatile Language for Teaching Parallel Programming ", "http://program.ccscne.org/2015/#prog/tag:Workshop", "April 17, 2015", createTextLink("CCSCNE 2015", "http://ccscne.org/conferences/ccscne-2015/"), new Array(),  createTextLink("Slides - pdf", getPublicFileLink("presentations/chapel/CCSCNE2015/ccscne2015ChapelWorkshop.pdf"))));
    list.lastChild.appendChild(document.createElement("br"));
    list.lastChild.appendChild(document.createElement("br"));

    //BU Theory Seminar 2015: DS Games
    list.appendChild(document.createElement("li"));
    list.lastChild.appendChild(createPresentationElement("Abstract Games for Data Structures", "http://www.bu.edu/cs/news/calendar/?eid=165760", "Feb. 27, 2015", document.createTextNode("Boston University CS Theory Seminar"), new Array(),  createTextLink("Slides - pdf", getPublicFileLink("presentations/dataStructuresGames/buTheory201502.pdf"))));
    list.lastChild.appendChild(document.createElement("br"));
    list.lastChild.appendChild(document.createElement("br"));

    //Math Colloquium: Voting Problems
    list.appendChild(document.createElement("li"));
    list.lastChild.appendChild(createPresentationElement("Voting Problems", null, "Feb. 19, 2015", createTextLink("Plymouth State Math Seminar", "http://www.plymouth.edu/department/math/seminars/"), [],  createTextLink("Slides - pdf", getPublicFileLink("presentations/voting/plymouthMath201502.pdf"))));
    list.lastChild.appendChild(document.createElement("br"));
    list.lastChild.appendChild(document.createElement("br"));

    //CGTC1: Boolean Formula games
    list.appendChild(document.createElement("li"));
    list.lastChild.appendChild(createPresentationElement("2^3 Boolean Formula Games", "http://cgtc.eu/1/program", "Jan. 22, 2015", createTextLink("CGTC1", "http://cgtc.eu/1"), [],  createTextLink("Slides - pdf", getPublicFileLink("presentations/8BooleanGames/lisbonCGT2015.pdf"))));
    list.lastChild.appendChild(document.createElement("br"));
    list.lastChild.appendChild(document.createElement("br"));

    //Chapel Workshop SIGSCE 2014
    list.appendChild(document.createElement("li"));
    list.lastChild.appendChild(createPresentationElement("Chapel: A versatile tool for teaching undergraduates parallel programming", "https://www.openconf.org/sigcse2014/modules/request.php?module=oc_program&action=summary.php&id=1129&OPENCONF=bkbfk6857ai23aqomnpt5r3800", "March 8, 2014", createTextLink("SIGCSE 2014", "http://sigcse2014.sigcse.org/"), davidBunde,  createTextLink("Materials", "http://faculty.knox.edu/dbunde/teaching/chapel/SIGCSE14/")));
    list.lastChild.appendChild(document.createElement("br"));
    list.lastChild.appendChild(document.createElement("br"));

    //UNE 2014
    list.appendChild(document.createElement("li"));
    list.lastChild.appendChild(createPresentationElement("Neighboring Nim: A Nim Game on Graphs", getPublicFileLink("presentations/neighboringNim/UNE2014Flyer.pdf"), "Feb. 4, 2014", createTextLink("University of New England Senior Mathematics Research Seminar", "http://www.une.edu/cas/math/"), new Array(),  createTextLink("Slides - pdf", getPublicFileLink("presentations/neighboringNim/neighboringNimUNE2014.pdf"))));
    list.lastChild.appendChild(document.createElement("br"));
    list.lastChild.appendChild(document.createElement("br"));

    //BU Theory Seminar 2014: 2^3 Boolean Games
    list.appendChild(document.createElement("li"));
    list.lastChild.appendChild(createPresentationElement("2^3 SAT Games", "http://www.bu.edu/cs/news/calendar/?eid=148535", "Jan. 24, 2014", document.createTextNode("Boston University CS Theory Seminar"), new Array(),  createTextLink("Slides - pdf", getPublicFileLink("presentations/8BooleanGames/bostonUniversity201401.pdf"))));
    list.lastChild.appendChild(document.createElement("br"));
    list.lastChild.appendChild(document.createElement("br"));

    //Chapel Workshop SC13
    list.appendChild(document.createElement("li"));
    list.lastChild.appendChild(createPresentationElement("High-level Parallel Programming using Chapel", "http://sc13.supercomputing.org/schedule/event_detail.php-evid=eps110.html", "Nov. 21, 2013", createTextLink("SC13: HPC Educators", "http://sc13.supercomputing.org/content/hpc-educators.html"), davidBunde,  createTextLink("Slides - pdf", "http://faculty.knox.edu/dbunde/teaching/chapel/SC13/presentation.pdf")));
    list.lastChild.appendChild(document.createElement("br"));
    list.lastChild.appendChild(document.createElement("br"));

    //QSAT - Integers 2013
    list.appendChild(document.createElement("li"));
    list.lastChild.appendChild(createPresentationElement("2^3 SAT Games", null, "Oct. 25, 2013", createTextLink("Integers 2013", "http://www.westga.edu/~math/IntegersConference2013/"), new Array(), createTextLink("Slides - pdf", getPublicFileLink("presentations/8BooleanGames/integers2013.pdf"))));
    list.lastChild.appendChild(document.createElement("br"));
    list.lastChild.appendChild(document.createElement("br"));

    //Arrow SMACCM
    list.appendChild(document.createElement("li"));
    list.lastChild.appendChild(createPresentationElement("Fair Dictatorships: a Fundamental Voting Paradox", null, "Nov. 19, 2012", createTextLinkTemp("http://www5.wittenberg.edu/academics/computerscience/colloquia.html", "SMACCM"), new Array(), document.createTextNode("Chalk talk; no slides")));
    list.lastChild.appendChild(document.createElement("br"));
    list.lastChild.appendChild(document.createElement("br"));

    //Chapel Workshop SC2012
    list.appendChild(document.createElement("li"));
    list.lastChild.appendChild(createPresentationElement("High-level Parallel Programming using Chapel", "http://sc12.supercomputing.org/schedule/event_detail.php-evid=eps114.html", "Nov. 15, 2012", createTextLinkTemp("http://sc12.supercomputing.org/content/hpc-educators.html", "SC2012: HPC Educators"), davidBunde,  createTextLink("Slides - pdf", "http://faculty.knox.edu/dbunde/teaching/chapel/SC12/presentation.pdf")));
    list.lastChild.appendChild(document.createElement("br"));
    list.lastChild.appendChild(document.createElement("br"));

    //A2A talk SC2012
    list.appendChild(document.createElement("li"));
    list.lastChild.appendChild(createPresentationElement("A2A: Algorithms and Design (part of BoF: Parallel and Accelerated Computing Experiences for Successful Industry Careers in High-Performance Computing)", "http://sc12.supercomputing.org/schedule/event_detail.php-evid=bof191.html", "Nov. 13, 2012", createTextLink("Supercomputing 2012", "http://sc12.supercomputing.org/"), a2aGroup, createTextLink("Slides - pdf", getPublicFileLink("presentations/algorithmsAndSoftwareDesign.pdf"))));
    list.lastChild.appendChild(document.createElement("br"));
    list.lastChild.appendChild(document.createElement("br"));

    //A2A Poster SC2012
    list.appendChild(document.createElement("li"));
    list.lastChild.appendChild(createPresentationElement("Strategies for Integrating Parallel and Distributed Computing Throughout the Undergraduate Curriculum (part of Broader Engagement/HPC Educators Reception)", "http://sc12.supercomputing.org/schedule/event_detail.php-evid=pec118.html", "Nov. 11, 2012", createTextLink("Supercomputing 2012", "http://sc12.supercomputing.org/"), a2aGroup, createTextLink("Poster - pdf", getPublicFileLink("presentations/PDC-Ed-Poster2012.pdf"))));
    list.lastChild.appendChild(document.createElement("br"));
    list.lastChild.appendChild(document.createElement("br"));

    //Chapel BoF SC 2011
    list.appendChild(document.createElement("li"));
    list.lastChild.appendChild(createPresentationElement("Teaching with Chapel (part of the Chapel Lightning Talks session)", "http://sc11.supercomputing.org/schedule/event_detail.php-evid=bof184.html", "Nov. 16, 2011", createTextLink("Supercomputing 2011", "http://sc11.supercomputing.org/"), new Array(), createTextLink("Slides - pdf", "http://chapel.cray.com/presentations/SC11/02-burke-education.pdf")));
    list.lastChild.appendChild(document.createElement("br"));
    list.lastChild.appendChild(document.createElement("br"));

    //Matchmaker - Integers 2011
    list.appendChild(document.createElement("li"));
    list.lastChild.appendChild(createPresentationElement("Matchmaker: Nimber Patterns and Conjectures", null, "Oct. 27, 2011", createTextLink("Integers 2011", "http://www.westga.edu/~math/IntegersConference2011/"), new Array(), createTextLink("Slides - pdf", getPublicFileLink("presentations/integersOct2011.pdf"))));
    list.lastChild.appendChild(document.createElement("br"));
    list.lastChild.appendChild(document.createElement("br"));

    //Neighboring Nim - SMACCM 2011
    list.appendChild(document.createElement("li"));
    list.lastChild.appendChild(createPresentationElement("Neighboring Nim: A Nim Game on Graphs", null, "Oct. 10, 2011", createTextLink("SMACCM", "http://www5.wittenberg.edu/academics/computerscience/colloquia.html"), new Array(), createTextLink("Slides - pdf", getPublicFileLink("presentations/neighboringNimSMACCM2011.pdf"))));
    list.lastChild.appendChild(document.createElement("br"));
    list.lastChild.appendChild(document.createElement("br"));

    //Atropos - BIRS 2011
    list.appendChild(document.createElement("li"));
    list.lastChild.appendChild(createPresentationElement("Atropos: a Sperner Triangle Game", null, "Jan. 11, 2011", createTextLink("Games of No Chance - BIRS 2011", "http://www.birs.ca/events/2011/5-day-workshops/11w5073"), new Array(), createTextLink("Slides - pdf", getPublicFileLink("presentations/atroposBIRS20110111.pdf"))));
    list.lastChild.appendChild(document.createElement("br"));
    list.lastChild.appendChild(document.createElement("br"));

    //Neighboring Nim - BIRS 2011
    list.appendChild(document.createElement("li"));
    list.lastChild.appendChild(createPresentationElement("Neighboring Nim: a PSPACE-complete NimG", null, "Jan. 11, 2011", createTextLink("Games of No Chance - BIRS 2011", "http://www.birs.ca/events/2011/5-day-workshops/11w5073"), new Array(), createTextLink("Slides - pdf", getPublicFileLink("presentations/neighboringNimBIRS2011.pdf"))));
    list.lastChild.appendChild(document.createElement("br"));
    list.lastChild.appendChild(document.createElement("br"));

    //P vs. NP - SMACCM 2010
    list.appendChild(document.createElement("li"));
    list.lastChild.appendChild(createPresentationElement("P vs NP: Solved?", null, "Sept. 13, 2010", createTextLink("SMACCM", "http://www5.wittenberg.edu/academics/computerscience/colloquia.html"), new Array(), createTextLink("Slides - pdf", getPublicFileLink("presentations/smaccmPNP.pdf"))));
    list.lastChild.appendChild(document.createElement("br"));
    list.lastChild.appendChild(document.createElement("br"));

    //Matchmaker - Witt 2009
    list.appendChild(document.createElement("li"));
    list.lastChild.appendChild(createPresentationElement("Matchmaker: A Stable Marriage Game", null, "Dec. 3, 2009", createTextLink("MAAWUC Lecture", "http://www5.wittenberg.edu/academics/math/maawuc.html"), new Array(), createTextLink("Slides - pdf", getPublicFileLink("matchmaker200912.pdf"))));
    list.lastChild.appendChild(document.createElement("br"));
    list.lastChild.appendChild(document.createElement("br"));

    //Atropos - Vassar 2009
    list.appendChild(document.createElement("li"));
    list.lastChild.appendChild(createPresentationElement("Atropos: A Sperner Triangle Game", "http://www.cs.vassar.edu/events/individual_past_events/2009-03-02_kyle_burke", "March 2, 2009", createTextLink("Winifred Asprey Lecture Series", "http://www.vassar.edu/headlines/2007/tim-asprey.html"), new Array(), null));
    list.lastChild.appendChild(document.createElement("br"));
    list.lastChild.appendChild(document.createElement("br"));

    //Atropos - Dartmouth 2008
    list.appendChild(document.createElement("li"));
    list.lastChild.appendChild(createPresentationElement("A Sperner Triangle Game", "http://www.math.dartmouth.edu/~comb/fall08.html", "Dec. 4, 2008", createTextLink("Dartmouth Combinatorics Seminar", "http://www.math.dartmouth.edu/~comb/"), new Array(), null));
    list.lastChild.appendChild(document.createElement("br"));
    list.lastChild.appendChild(document.createElement("br"));

    //Atropos - WINE 2007
    list.appendChild(document.createElement("li"));
    list.lastChild.appendChild(createPresentationElement("A Sperner Triangle Game", null, "Dec. 14, 2007", createTextLink("WINE 2007", "http://math.ucsd.edu/~wawnwine/wine2007/"), new Array(), createTextLink("Slides - pdf", getPublicFileLink("presentations/WINEAtropos20071214.pdf"))));
    list.lastChild.appendChild(document.createElement("br"));
    list.lastChild.appendChild(document.createElement("br"));

    partialList = createPartiallyVisibleList(list, 5);
	//return list;
	return partialList;
}

/*******<<MaybeLink>>********************************************/
/**
 * A node that may be a link.
 */
var MaybeLink = Class.create({

    /**
     * Creates something that might be a link.
     */
    initialize: function(contents, url) {
        this.contents = contents;
        this.url = url;
    }

    /**
     * Returns a node version of this.
     */
    ,toNode: function() {
        if (this.url == undefined) {
            return toNode(this.contents);
        } else {
            return createLink(this.contents, this.url);
        }
    }
}); //end of MaybeLink

/*******<<PaitMap>>********************************************/
/**
 * Works like a Java Map.
 */
var PaitMap = Class.create({

    /**
     * Creates a Map.
     */
    initialize: function() {
        this.pairs = [];
    }

    /**
     * Adds a new pair.  If the key is already one of the keys here, we replace it.  Otherwise, add a new pair.
     */
    ,put: function(key, value) {
        this.remove(key);
        this.pairs.push([key, value]);
    }

    /**
     * Removes a pair based on the key.
     */
    ,remove: function(key) {
        for (var i = 0; i < this.pairs.length; i++) {
            if (this.testEquality(this.pairs[i][0], key)) {
                this.pairs.splice(i, 1);
                return;
            }
        }
    }

    /**
     * Tests whether two elements are equal.
     */
    ,testEquality: function(element0, element1) {
        return (element0 == element1 || (element0.equals != undefined && element0.equals(element1)));
    }

    /**
     * Gets a value.
     */
    ,get: function(key, alternative) {
        alternative = alternative || null;
        for (var i = 0; i < this.pairs.length; i++) {
            if (this.testEquality(key, this.pairs[i][0])) {
                return this.pairs[i][1];
            }
        }
        return alternative;
    }

    /**
     * Gets the keys.
     */
    ,getKeys: function() {
        var keys = [];
        for (var i = 0; i < this.pairs.length; i++) {
            keys.push(this.pairs[i][0]);
        }
        return keys;
    }

    /**
     * Whether this has a key.
     */
    ,hasKey: function(key) {
        for (var i = 0; i < this.pairs.length; i++) {
            if (this.testEquality(key, this.pairs[i][0])) {
                return true;
            }
        }
        return false;
    }
});

/*******<<PaitSlider>>***************************************************
 * This class is a wrapper for a slider that includes a display of the current value.
 */
var PaitSlider = Class.create({

    /**
     * Creates a slider with a visible value.
     */
    initialize: function(minValue, maxValue, step, startValue, id, formName) {
        this.slider = document.createElement("input");
        this.slider.setAttribute("type", "range");
        this.slider.min = minValue;
        this.slider.max = maxValue;
        this.slider.step = step;
        this.slider.value = startValue;
        this.slider.id = id;
        var self = this;
        this.slider.onchange = function() {
            self.changeDisplay();
        }
        if (formName != undefined) {
            //TODO: add the slider to the given form name
        }
        this.valueDisplay = document.createElement("span");
        appendChildrenTo(this.valueDisplay, ["" + startValue]);
    }

    /**
     * Changes the display number
     */
    ,changeDisplay: function() {
        removeAllChildren(this.valueDisplay);
        appendChildrenTo(this.valueDisplay, ["" + this.slider.value]);
    }

    /**
     * Sets whether the slider is enabled or not.
     */
    ,setEnabled: function(isEnabled) {
        this.slider.disabled = !isEnabled;
    }

    /**
     * Creates an element for this slider.
     */
    ,toElement: function() {
        var div = document.createElement("div");
        appendChildrenTo(div, ["" + this.slider.min, this.slider, "" + this.slider.max, document.createElement("br"), this.valueDisplay]);
        div.style.alignContent = "center";
        div.style.alignItems = "center";
        div.style.textAlign = "center";
        return div;
    }
});



/**
 * Encapsulation of a slider.
 */


/*******<<PaitImage>>*************************************************************
 ******************************************************************************/

/**
 * Encapsulation of an image.
 */
var PaitImage = Class.create({

    /**
     * Creates an image.
     */
    initialize: function(sourceUrl, description, altText) {
        this.sourceUrl = sourceUrl;
        this.description = description;
        this.altText = altText || description;
        this.isLink = false;
        this.linkUrl = this.sourceUrl;
        this.scale = 1;
    }

    /**
     * Turns the image into a link.
     */
    ,setAsLink: function(linkUrl) {
        this.isLink = true;
        this.linkUrl = linkUrl || this.sourceUrl;
    }

    /**
     * Scales the image down
     */
    ,setScale: function(scale) {
        this.scale = Math.min(scale, 1);
    }

    /**
     * Scale the image, combined with any previous scaling.
     */
    ,scaleImage: function(scale) {
        this.setScale(scale * this.scale);
    }

    /**
     * Gets the scale.
     */
    ,getScale: function() {
        return this.scale;
    }

    /**
     * Sets the height of the image.
     */
    ,setHeight: function(height) {
        var tempImg = document.createElement("img");
        tempImg.src = this.sourceUrl;
        scale = height / tempImg.naturalHeight;
        this.setScale(scale);
    }

    /**
     * Sets the height of the image.
     */
    ,setWidth: function(width) {
        var tempImg = document.createElement("img");
        tempImg.src = this.sourceUrl;
        scale = width / tempImg.naturalWidth;
        this.setScale(scale);
    }

    /**
     * Scales the image to the window size.
     */
    ,autoScale: function() {
        var tempImg = document.createElement("img");
        tempImg.src = this.sourceUrl;
        var self = this;
        tempImg.onload = function() {
            self.autoScaleHelper(tempImg);
        }
    }

    /**
     * Helper for autoScale.
     */
    ,autoScaleHelper: function(imageElement) {
        console.log("Calling AutoScale Helper.");
        scale = Math.min(window.innerWidth / imageElement.naturalWidth, window.innerHeight / imageElement.naturalHeight);
        console.log("Scale: " + scale);
        console.log("URL: " + imageElement.src);
        this.setScale(scale);
        PaitImage.prototype.scaleImage(imageElement, scale);
    }

    /**
     * Returns a Div containing the image element.
     */
    ,toDiv: function() {
        var div = document.createElement("div");
        appendChildrenTo(div, [this.toElement()]);
        return div;
    }

    /**
     * Returns a Node of this.
     */
    ,toNode: function() {
        return this.toElement();
    }

    /**
     * Returns an Image Element for this.
     */
    ,toElement: function() {
        //set up the img
        var img = document.createElement("img");
        //console.log("New image!  src: " + this.sourceUrl);
        img.src = this.sourceUrl;
        //console.log("width: " + img.width + "   naturalWidth: " + img.naturalWidth);
        img.title = this.description;
        //console.log("width: " + img.width + "   naturalWidth: " + img.naturalWidth);
        img.alt = this.altText;
        //console.log("width: " + img.width + "   naturalWidth: " + img.naturalWidth);
        img.width = img.naturalWidth * this.scale;
        //console.log("width: " + img.width + "   naturalWidth: " + img.naturalWidth);

        var scale = this.scale;
        img.onload = function() {
            PaitImage.prototype.scaleImage(img, scale);
        }
        if (this.isLink) {
            element = document.createElement("a");
            element.href = this.linkUrl;
            element.appendChild(img);
        } else {
            element = img;
        }
        return element;
    }

    /**
     * Returns an IMG element for this centered.
     */
    ,toCenteredElement: function() {
        var img = this.toElement();
        img.style.display = "block";
        img.style.marginLeft = "auto";
        img.style.marginRight = "auto";
        return img;
    }

});


//called after the image has loaded to perform scaling
//image: img element
PaitImage.prototype.scaleImage = function(image, scale) {
    //first, check whether the image is too big for the page!
    var naturalScale = Math.min(1, window.innerWidth / image.naturalWidth, window.innerHeight / image.naturalHeight);

    scale = Math.min(scale, naturalScale);

    //console.log("In scaleImage().  src: " + image.src);
    //console.log("naturalWidth: " + image.naturalWidth);
    image.width = image.naturalWidth * scale;
    /*
    var imageCopy = document.createElement("img");
    imageCopy.src = image.src;
    imageCopy.width = image.width;
    var parent = image.parentElement;
    parent.replaceChild(imageCopy, image);
    console.log(imageCopy.parentElement.innerHTML);
    */
}

//end of PaitImage definitions


/*******<<Semester>>*************************************************************
 *******************************************************************************
 ** The Semester Class definitions **/

/**
 * This defines a Semester.
 */

var Semester = Class.create({

    /**
     * Initialize a Semester.
     * title: the name of this
     * firstDayOfClasses: the first day of classes in the semester
     * readingDays: an Array consisting of the reading days as Date objects
     */
    initialize: function(title, firstDayOfClasses, readingDays, scheduleStartingTimesIndex) {
        scheduleStartingTimesIndex = scheduleStartingTimesIndex || WeeklySchedule.prototype.PLYMOUTH;
        this.title = title;
        this.firstDayOfClasses = copyDate(firstDayOfClasses);
        this.firstDayOfClasses.setHours(0);
        this.firstDayOfClasses.setMinutes(0);
        this.firstDayOfClasses.setSeconds(0);
        //now to generate the first Sunday.  I should really get rid of this...
        this.firstSunday = copyDate(this.firstDayOfClasses);
        while (this.firstSunday.getDay() > 0) {
            //move back one day
            this.firstSunday.setDate(this.firstSunday.getDate() - 1);
        }
        this.readingDays = readingDays;
        //set the readingDays to all be at the beginning of the day
        for (var i = 0; i < this.readingDays.length; i++) {
            this.readingDays[i].setHours(0);
            this.readingDays[i].setMinutes(0);
            this.readingDays[i].setSeconds(0);
        }
        this.courses = new Array();
        this.cancelledDays = new Array();
        //cancel the days happening after the last day of classes.
        //first do the reading days
        var readingDayIndex = 0;
        for (var i = 0; i < this.readingDays.length; i++) {
            var readingDay = this.readingDays[i];
            this.cancelDay(readingDay, "Reading Day");
        }
        //now for the days after reading days!
        var lastDay = this.readingDays[this.readingDays.length-1];
        while (lastDay.getDay() < 6) {
            lastDay = addDays(lastDay, 1);
            this.cancelDay(lastDay, "Finals Week");
        }
        //now calculate the number of weeks in the semester
        var millisecondsInSemester = this.readingDays[0].getTime() - this.firstSunday.getTime();
        var daysInSemester = millisecondsInSemester / 86400000;
        this.numberOfWeeks = daysInSemester/ 7;
        this.weeklySchedule = new WeeklySchedule(scheduleStartingTimesIndex);
        this.finalScheduleURL = "";
        this.tutorsByDay = [[], [], [], [], [], [], []];
    }

    ,/**
     * Gets the title.
     */
    getTitle: function() {
        return this.title;
    }


    /**
     * Adds a tutor.
     */
    ,addTutor: function(tutor, day) {
        this.tutorsByDay[day].push(tutor);
    }

    /**
     * Gets the tutors for a specific day.
     */
    ,getTutorsNodeByDay: function(dayIndex) {
        var numTutors = this.tutorsByDay[dayIndex].length;
        if (numTutors == 0) {
            return toNode("No one assigned");
        } else if (numTutors == 1) {
            return this.tutorsByDay[dayIndex][0].toElementWithSpecialities();
        } else {
            var tutorsList = document.createElement("ul");
            for (var i = 0; i < numTutors; i++) {
                var tutorItem = document.createElement("li");
                tutorItem.appendChild(this.tutorsByDay[dayIndex][i].toElementWithSpecialities());
                tutorsList.appendChild(tutorItem);
            }
            return tutorsList;
        }
    }

    ,/**
     * Sets the url for the final schedule for this semester
     */
    setFinalScheduleURL: function(url) {
        this.finalScheduleURL = url;
    }

    ,/**
     * Gets the final url.
     */
    getFinalScheduleURL: function() {
        return this.finalScheduleURL;
    }

    ,/**
     * Gets a link to the final schedule.
     */
    getFinalScheduleLink: function(linkText) {
        if (this.finalScheduleURL == "") {
            //in case a link hasn't been set yet...
            return toNode(this.finalScheduleURL);
        } else {
            return createTextLink(linkText, this.finalScheduleURL);
        }
    }

    ,/**
     * Adds a course to the semester.  TODO: should this even be here?  Right now, courses each have a pointer to the semester they're in.
     */
    addCourse: function(course) {
        this.courses.push(course);
    }

    ,/**
     * Cancel a day of classes.  Adds to a list of cancelled days.
     * date: the date being cancelled.
     * reason: a string explaining the reason there are no classes that day.
     */
    cancelDay: function(date, reason) {
        this.cancelledDays.push(new Array(date, reason));
    }

    ,/**
     * Returns the day number of the semester.  Day 0 is the first day of classes.
     */
    getSemesterDayFromDate: function(date) {
        return getDayDifference(date, this.firstDayOfClasses);
    }

    /**
     * Returns the day of the week (as an integer 0 - 6) for the day of the semester. Sunday is 0.
     */
    ,getDayOfWeekOfDayNumber: function(dayNumber) {
        var dayOfWeekOfFirstDay = this.firstDayOfClasses.getDay();
        var dayOfWeek = (dayNumber + dayOfWeekOfFirstDay) % 7;
        return dayOfWeek;
    }

    ,/**
     * Returns the date for a day in the semester.
     */
    getDateOfDayNumber: function(dayNumber) {
        return addDays(this.firstDayOfClasses, dayNumber);
    }

    ,/**
     * Adds an item to the weekly schedule for this semester.
     */
    addWeeklyScheduleItem: function(day, item) {
        this.weeklySchedule.addItem(day, item);
    }

    ,/**
     * Returns an HTML table containing the weekly schedule.
     */
    getWeeklyScheduleTable: function(isForQuestionAvailability) {
        return this.weeklySchedule.toHTMLTable(isForQuestionAvailability);
    }

    ,/**
     * Loads a page with the weekly schedule for questions.
     * Had to do it this way because I could neither pass parameters in onclick not use outside variables in an anonymous function.  TODO: fix this?
     */
    generateWeeklyScheduleQuestionPage: function() {
        this.generateWeeklySchedulePage(WeeklySchedule.prototype.FOR_CLASS_QUESTIONS);
    }

    ,/**
     * Loads a page with the weekly schedule for meetings.
     * Had to do it this way because I could neither pass parameters in onclick not use outside variables in an anonymous function.  TODO: fix this?
     */
    generateWeeklyScheduleMeetingPage: function() {
        this.generateWeeklySchedulePage(WeeklySchedule.prototype.FOR_MEETINGS);
    }

    ,/**
     * Loads a page with the weekly schedule.
     */
    generateWeeklySchedulePage: function(availabilityReason) {

        var scheduleTitle = "Kyle's Schedule: " + this.title;

        var contentNodes = new Array();

        //get the table
        var scheduleTable = this.getWeeklyScheduleTable(availabilityReason == WeeklySchedule.prototype.FOR_CLASS_QUESTIONS);

        //add the weekly schedule to the page
        contentNodes.push(scheduleTable);

        var scheduleLegendDiv = document.createElement("div");
        contentNodes.push(scheduleLegendDiv);
        scheduleLegendDiv.style.textAlign = "center";
        scheduleLegendDiv.style.fontSize = "x-large";
        var availabilityStrings = new Array(1, 1);
        availabilityStrings[WeeklySchedule.prototype.FOR_CLASS_QUESTIONS] = "When is Kyle available for questions?";
        availabilityStrings[WeeklySchedule.prototype.FOR_MEETINGS] = "When can I schedule Kyle away for a meeting?";
        scheduleLegendDiv.appendChild(document.createTextNode(availabilityStrings[availabilityReason]));
        scheduleLegendDiv.appendChild(document.createElement("br"));
        scheduleLegendDiv.appendChild(document.createElement("br"));

        //add the legend
        var legendTable = document.createElement("table");
        scheduleLegendDiv.appendChild(legendTable);
        legendTable.setAttribute("border", "1");
        legendTable.setAttribute("width", 400);
        legendTable.style.margin = "auto";
        legendTable.style.textAlign = "center";
        legendTable.style.fontSize = "medium";
        var legendRow = legendTable.insertRow(-1);
        //the cell colored to be available
        var freeCell = new WeeklyScheduleItem("Likely Available", WeeklyScheduleItem.prototype.FREE, WeeklyScheduleItem.prototype.FREE, 1).getTableCell(true);
        legendRow.appendChild(freeCell);
        //the cell colored to be maybe available
        var maybeCell = new WeeklyScheduleItem("Maybe Available", WeeklyScheduleItem.prototype.MAYBE_FREE, WeeklyScheduleItem.prototype.MAYBE_FREE, 1).getTableCell(true);
        legendRow.appendChild(maybeCell);
        //the cell colored to be probably busy
        var busyCell = new WeeklyScheduleItem("Likely Unavailable", WeeklyScheduleItem.prototype.PROBABLY_NOT_FREE, WeeklyScheduleItem.prototype.PROBABLY_NOT_FREE, 1).getTableCell(true);
        legendRow.appendChild(busyCell);
        //the cell colored to be probably busy
        var veryBusyCell = new WeeklyScheduleItem("Unavailable", WeeklyScheduleItem.prototype.DEFINITELY_NOT_FREE, WeeklyScheduleItem.prototype.DEFINITELY_NOT_FREE, 1).getTableCell(true);
        legendRow.appendChild(veryBusyCell);
        var switchRow = legendTable.insertRow(-1);
        var switchCell = switchRow.insertCell(-1);
        switchCell.colSpan = 4;
        var switchButton = document.createElement("button");
        var buttonText = "Click Here to find out: ";
        switchButton.appendChild(document.createTextNode(buttonText + availabilityStrings[1 - availabilityReason]));

        switchButton.onclick = function() {
            availabilityReason = 1 - availabilityReason;
            var isForQuestions = availabilityReason == WeeklySchedule.prototype.FOR_MEETINGS;
            location.href = "?main=schedule&forMeetings=" + isForQuestions;
        }
        switchCell.appendChild(switchButton);

        //now the note about lunches at the bottom
        var div = document.createElement("div");
        contentNodes.push(div);
        div.appendChild(document.createElement("br"));
        div.appendChild(document.createTextNode("If I'm not in my office, poke around the department for me.  I'm often in one of the labs or elsewhere nearby.  The lab is a great place to hold office hours if I have lots of visitors."));
        div.appendChild(document.createElement("br"));
        /*
        div.appendChild(document.createElement("br"));
        div.appendChild(document.createTextNode("I will often go down to Bobs for lunch.  You are completely welcome to look for me there or take me with you (see "));
        div.appendChild(createTextLink("Take-a-Professor-to-Lunch program", "http://www.colby.edu/alumni_parents_cs/parents/handbook/life_at_colby/residence.cfm"));
        div.appendChild(document.createTextNode(").  I'm very happy to answer questions while eating!")); */

        //now set up the arrows going forward and backward
        //TODO: fix this!
        /* */
        var semesterIndex = Number(getParameterByName('semesterIndex', 0));
        var backwards;
        if (semesterIndex < semesters.length - 1) {
            var backIndex = semesterIndex + 1;
            var semester = semesters[backIndex];
            backwards = createLink("Back to " + semester.getTitle(), HOME + "?main=schedule&semesterIndex=" + backIndex);
        } else {
            backwards = toNode("");
        }
        var backDiv = createElementWithChildren("span", [backwards]);
        backDiv.style.cssFloat = "left";


        var forwards;
        if (semesterIndex > 0) {
            var forwardIndex = semesterIndex - 1;
            var semester = semesters[forwardIndex];
            forwards = createLink("Forwards to " + semester.getTitle(), HOME + "?main=schedule&semesterIndex=" + forwardIndex);
        } else {
            forwards = toNode("");
        }
        var forwardsDiv = createElementWithChildren("span", [forwards]);
        forwardsDiv.style.cssFloat = "right";
        var backAndForwardsDiv = createElementWithChildren("div", [backDiv, forwardsDiv]);
        contentNodes.push(backAndForwardsDiv);
        /* */


        generateMainPage(scheduleTitle, contentNodes);
    }

    ,/**
     * Returns a string version of this Semester.
     */
    toString: function() {
        var string = "A semester object: " + this.title + " containing " + this.courses.length + " courses.";
        return string;
    }

}); //end of Semester class


/*******<<WeeklySchedule>>******************************************************
 *******************************************************************************
 ** The WeeklySchedule Class definitions **/
/**
 * This defines a weekly schedule.
 */
var WeeklySchedule = Class.create({

    /**
     * Create a WeeklySchedule.
     */
    initialize: function(startingTimesIndex) {
        this.scheduleByDay = new Array();
        this.scheduleByDay.push("Nothing to see here."); //Cooresponds to the Sunday column.
        for (var i = this.MONDAY; i <= this.FRIDAY; i++) {
            this.scheduleByDay.push(new Array());
        }
        this.startingTimes = WeeklySchedule.prototype.SLOT_STARTING_TIMES[startingTimesIndex];
    }

    ,/**
     * Adds a new WeeklyScheduleItem by appending it to the end of that day.
     */
    addItem: function(day, item) {
        this.scheduleByDay[day].push(item);
    }

    ,/**
     * Configures the table to display based on availability type.
     */
    configureScheduleTable: function(table, isForQuestionAvailability) {
        //delete the rows in the old table
        while (table.rows.length > 0) {
            table.deleteRow(-1);
        }

        var cellIndices = new Array(); //will contain the indices for each day
        var rowsToSkip = new Array(); //keeps track of the number of rowspans of cells, shrinking as new rows are added
        for (var i = 0; i <= 5; i++) {
            cellIndices.push(0);
            rowsToSkip.push(0);
        }
        //next, insert the header row with day names.
        var row = table.insertRow(-1);
        var cell = row.insertCell(-1);
        cell.style.backgroundColor = "white";
        cell.appendChild(document.createTextNode("Schedule"));
        var cell = row.insertCell(-1);
        cell.style.backgroundColor = "white";
        cell.appendChild(document.createTextNode("Monday"));
        var cell = row.insertCell(-1);
        cell.style.backgroundColor = "white";
        cell.appendChild(document.createTextNode("Tuesday"));
        var cell = row.insertCell(-1);
        cell.style.backgroundColor = "white";
        cell.appendChild(document.createTextNode("Wednesday"));
        var cell = row.insertCell(-1);
        cell.style.backgroundColor = "white";
        cell.appendChild(document.createTextNode("Thursday"));
        var cell = row.insertCell(-1);
        cell.style.backgroundColor = "white";
        cell.appendChild(document.createTextNode("Friday"));

        //now fill in the schedule
        for (var rowNumber = 0; rowNumber < this.startingTimes.length - 1; rowNumber++) {
            var row = table.insertRow(-1);
            var slotTimesCell = row.insertCell(-1);
            slotTimesCell.style.backgroundColor = "white";
            slotTimesCell.appendChild(document.createTextNode(this.startingTimes[rowNumber] + "-" + this.startingTimes[rowNumber+1]));
            for (var day = this.MONDAY; day <= this.FRIDAY; day++) {
                //first, check to see if we should be putting a new cell in for this day
                if (rowsToSkip[day] > 0) {
                    rowsToSkip[day]--; //no, we shouldn't.  Decrement and continue.
                } else {
                    //yup, time to add a new cell in day's column!
                    var scheduleItem = this.scheduleByDay[day][cellIndices[day]];
                    if (scheduleItem == undefined) {
                        scheduleItem = new WeeklyScheduleItem("Error: Undefined", WeeklyScheduleItem.prototype.PROBABLY_NOT_FREE, WeeklyScheduleItem.prototype.PROBABLY_NOT_FREE, 1);
                        //alert("Day: " + day + "  row#: " + rowNumber + "  cellIndices: " + cellIndices + ".  Error message: " + e.message);
                    }
                    var scheduleItemCell;
                    scheduleItemCell = scheduleItem.getTableCell(isForQuestionAvailability);
                    //update the number of rows that will have to skip this day
                    rowsToSkip[day] = scheduleItem.getLengthInSlots() - 1;
                    row.appendChild(scheduleItemCell);
                    //move to the next schedule item
                    cellIndices[day]++;
                }
            }
        }
        return table;
    }

    ,/**
     * Returns a table HTML object presenting this schedule.
     */
    toHTMLTable: function(isForQuestionAvailability) {
        table = document.createElement("table");
        table.setAttribute("border", "1");
        table.setAttribute("bordercolor", "#FF0000");
        table.setAttribute("width", "750");
        table.style.textAlign = "center";
        table.style.margin = "auto";
        this.configureScheduleTable(table, isForQuestionAvailability);
        return table;

    }

}); //end of WeeklySchedule definition

//...except for these constants:
WeeklySchedule.prototype.FOR_CLASS_QUESTIONS = 0;
WeeklySchedule.prototype.FOR_MEETINGS = 1;
WeeklySchedule.prototype.MONDAY = 1;
WeeklySchedule.prototype.TUESDAY = 2;
WeeklySchedule.prototype.WEDNESDAY = 3;
WeeklySchedule.prototype.THURSDAY = 4;
WeeklySchedule.prototype.FRIDAY = 5;
//Slot starting times.  In 2 arrays
WeeklySchedule.prototype.WITTENBERG = 0;
WeeklySchedule.prototype.COLBY = 1;
WeeklySchedule.prototype.PLYMOUTH_OLD = 2;
WeeklySchedule.prototype.PLYMOUTH_2018 = 3;
WeeklySchedule.prototype.SLOT_STARTING_TIMES = new Array();
//Wittenberg's schedule
WeeklySchedule.prototype.SLOT_STARTING_TIMES.push(new Array()); //times for Witt
WeeklySchedule.prototype.SLOT_STARTING_TIMES[WeeklySchedule.prototype.WITTENBERG].push("8:00");
WeeklySchedule.prototype.SLOT_STARTING_TIMES[WeeklySchedule.prototype.WITTENBERG].push("8:30");
WeeklySchedule.prototype.SLOT_STARTING_TIMES[WeeklySchedule.prototype.WITTENBERG].push("9:10");
WeeklySchedule.prototype.SLOT_STARTING_TIMES[WeeklySchedule.prototype.WITTENBERG].push("9:40");
WeeklySchedule.prototype.SLOT_STARTING_TIMES[WeeklySchedule.prototype.WITTENBERG].push("10:20");
WeeklySchedule.prototype.SLOT_STARTING_TIMES[WeeklySchedule.prototype.WITTENBERG].push("10:50");
WeeklySchedule.prototype.SLOT_STARTING_TIMES[WeeklySchedule.prototype.WITTENBERG].push("11:30");
WeeklySchedule.prototype.SLOT_STARTING_TIMES[WeeklySchedule.prototype.WITTENBERG].push("Noon");
WeeklySchedule.prototype.SLOT_STARTING_TIMES[WeeklySchedule.prototype.WITTENBERG].push("12:40");
WeeklySchedule.prototype.SLOT_STARTING_TIMES[WeeklySchedule.prototype.WITTENBERG].push("1:10");
WeeklySchedule.prototype.SLOT_STARTING_TIMES[WeeklySchedule.prototype.WITTENBERG].push("1:50");
WeeklySchedule.prototype.SLOT_STARTING_TIMES[WeeklySchedule.prototype.WITTENBERG].push("2:20");
WeeklySchedule.prototype.SLOT_STARTING_TIMES[WeeklySchedule.prototype.WITTENBERG].push("3:00");
WeeklySchedule.prototype.SLOT_STARTING_TIMES[WeeklySchedule.prototype.WITTENBERG].push("3:30");
WeeklySchedule.prototype.SLOT_STARTING_TIMES[WeeklySchedule.prototype.WITTENBERG].push("4:10");
WeeklySchedule.prototype.SLOT_STARTING_TIMES[WeeklySchedule.prototype.WITTENBERG].push("4:40");
WeeklySchedule.prototype.SLOT_STARTING_TIMES[WeeklySchedule.prototype.WITTENBERG].push("5:00");
//Colby's Schedule
var ColbyTimes = new Array(); //times for Colby
WeeklySchedule.prototype.SLOT_STARTING_TIMES.push(ColbyTimes);
ColbyTimes.push("8:00");
ColbyTimes.push("8:30");
ColbyTimes.push("9:00");
ColbyTimes.push("9:30");
ColbyTimes.push("10:00");
ColbyTimes.push("10:30");
ColbyTimes.push("11:00");
ColbyTimes.push("11:30");
ColbyTimes.push("12:00");
ColbyTimes.push("12:30");
ColbyTimes.push("1:00");
ColbyTimes.push("1:30");
ColbyTimes.push("2:00");
ColbyTimes.push("2:30");
ColbyTimes.push("3:00");
ColbyTimes.push("3:30");
ColbyTimes.push("4:00");
ColbyTimes.push("4:30");
ColbyTimes.push("5:00");

//Plymouth's Schedule 2014-2018
var PlymouthTimes = new Array();
WeeklySchedule.prototype.SLOT_STARTING_TIMES.push(PlymouthTimes);
PlymouthTimes.push("8:00");
PlymouthTimes.push("8:35");
PlymouthTimes.push("9:05");
PlymouthTimes.push("9:40");
PlymouthTimes.push("10:10");
PlymouthTimes.push("10:45");
PlymouthTimes.push("11:15");
PlymouthTimes.push("11:50");
PlymouthTimes.push("12:20");
PlymouthTimes.push("12:55");
PlymouthTimes.push("1:25");
PlymouthTimes.push("2:00");
PlymouthTimes.push("2:30");
PlymouthTimes.push("3:05");
PlymouthTimes.push("3:35");
PlymouthTimes.push("4:10");
PlymouthTimes.push("4:40");

//Plymouth State's Schedule 2018-
var PlymouthState2018Times = new Array();
WeeklySchedule.prototype.SLOT_STARTING_TIMES.push(PlymouthState2018Times);
PlymouthState2018Times.push("8:00");
PlymouthState2018Times.push("8:30");
PlymouthState2018Times.push("9:00");
PlymouthState2018Times.push("9:30");
PlymouthState2018Times.push("10:00");
PlymouthState2018Times.push("10:30");
PlymouthState2018Times.push("11:00");
PlymouthState2018Times.push("11:30");
PlymouthState2018Times.push("12:00");
PlymouthState2018Times.push("12:30");
PlymouthState2018Times.push("1:00");
PlymouthState2018Times.push("1:30");
PlymouthState2018Times.push("2:00");
PlymouthState2018Times.push("2:30");
PlymouthState2018Times.push("3:00");
PlymouthState2018Times.push("3:30");
PlymouthState2018Times.push("4:00");
PlymouthState2018Times.push("4:30");


/*******<<WeeklyScheduleItem>>**************************************************
 *******************************************************************************
 ** The WeeklyScheduleItem class definitions **/
/*****************WeeklyScheduleItem*******/
/**
 * This defines an item in a weekly schedule.
 */
var WeeklyScheduleItem = Class.create({

    /**
     * Create a WeeklyScheduleItem
     */
    initialize: function(title, meetingAvailability, questionAvailability, lengthInSlots, titleLinkHref) {
        this.title = title;
        this.titleLinkHref = titleLinkHref;
        this.meetingAvailability = meetingAvailability;
        this.questionAvailability = questionAvailability;
        this.lengthInRows = lengthInSlots;
    },

    /**
     * Returns the number of time slots this item takes up.
     */
    getLengthInSlots: function() {
        return this.lengthInRows;
    },

    /**
     * Returns the appropriate color code as a string.
     */
    getAppropriateColorCode: function(isForQuestionAvailability) {
        var colorCodes = new Array();
        colorCodes.push("#33FF00");
        colorCodes.push("#FFFF00");
        colorCodes.push("#FF9933");
        colorCodes.push("#3399FF");

        if (isForQuestionAvailability) {
            return colorCodes[this.questionAvailability];
        } else {
            return colorCodes[this.meetingAvailability];
        }
    },

    /**
     * Returns an HTML Table Cell (td) to display this.
     */
    getTableCell: function(isForQuestionAvailability) {
        var cell = document.createElement("td");
        cell.rowSpan = this.lengthInRows;
        cell.style.backgroundColor = this.getAppropriateColorCode(isForQuestionAvailability);
        if (this.titleLink == undefined) {
            cell.appendChild(toNode(this.title));
        } else {
            cell.appendChild(createTextLink(this.title, this.titleLink));
        }
        return cell;
    }

}); //end of WeeklyScheduleItem definition

//WeeklyScheduleItem "constants"
WeeklyScheduleItem.prototype.FREE = 0;
WeeklyScheduleItem.prototype.MAYBE_FREE = 1;
WeeklyScheduleItem.prototype.PROBABLY_NOT_FREE = 2;
WeeklyScheduleItem.prototype.DEFINITELY_NOT_FREE = 3;




/************************<PlymouthCourseScheduleItem>*****************************************************/

var PlymouthCourseScheduleItem = Class.create(WeeklyScheduleItem, {

    //constructor
    /**
     * Usage: new PlymouthCourseScheduleItem("CS", 2370, 2)
     */
    initialize: function($super, discipline, number, lengthInSlots) {
        $super(discipline + number, WeeklyScheduleItem.prototype.DEFINITELY_NOT_FREE, WeeklyScheduleItem.prototype.DEFINITELY_NOT_FREE, lengthInSlots, HOME + "?course=" + number);
    }

}); //end of PlymouthCourseScheduleItem definition


/************************<PlymouthLabScheduleItem>*****************************************************/

var PlymouthLabScheduleItem = Class.create(WeeklyScheduleItem, {

    //constructor
    /**
     * Usage: new PlymouthLabScheduleItem("CS", 2370, 4)
     */
    initialize: function($super, discipline, number, lengthInSlots) {
        $super(discipline + number + " Lab", WeeklyScheduleItem.prototype.DEFINITELY_NOT_FREE, WeeklyScheduleItem.prototype.DEFINITELY_NOT_FREE, lengthInSlots, HOME + "?course=" + number);
    }

}); //end of PlymouthLabScheduleItem definition


/************************<OfficeHoursScheduleItem>*****************************************************/

var OfficeHoursScheduleItem = Class.create(WeeklyScheduleItem, {

    //constructor
    /**
     * Usage: new OfficeHoursScheduleItem(2)
     */
    initialize: function($super, lengthInSlots) {
        $super("Office Hours", WeeklyScheduleItem.prototype.FREE, WeeklyScheduleItem.prototype.FREE, lengthInSlots);
    }

}); //end of OfficeHoursScheduleItem definition


/************************<OfficeHoursScheduleItem>*****************************************************/

var NotSureYetScheduleItem = Class.create(WeeklyScheduleItem, {

    //constructor
    /**
     * Usage: new OfficeHoursScheduleItem(2)
     */
    initialize: function($super, lengthInSlots) {
        $super("Not Sure Yet", WeeklyScheduleItem.prototype.MAYBE_FREE, WeeklyScheduleItem.prototype.MAYBE_FREE, lengthInSlots);
    }

}); //end of NotSureYetScheduleItem definition





/*******<<Book>>**********************************************************
 *****************************************************************************
 ** Book class definition **/
/**
 * Class definition for a book used in a course.
 */
var Book = Class.create({

	//title should be a string; authors should be a list of (authorName, website) pairs; website should be a string object.
	initialize: function(title, abbreviatedTitle, authors, website) {
		this.title = title;
		this.abbreviatedTitle = abbreviatedTitle;
		this.authors = authors;
		this.website = website;
	}

	,/**
	  * Returns a basic HTML DOM Node containing the title in an anchor (if the website was given).
	  */
	toBriefNode: function() {
		return createTextLink(this.abbreviatedTitle, this.website);
	}

	/**
	 * This adds the appropriate link for a subsectioned PDF.  Only usable with PDFs.
	 */
	,toBriefNodePDFWithSubsection: function(section, subsection) {
	    return createTextLink(this.abbreviatedTitle, this.website + "#nameddest=subsection." + section + "." + subsection);
	}

	,/**
	  * Returns an HTML DOM Node containing the book title with a list of authors, all linked appropriately.
	  */
	toNode: function() {
		var fragment = document.createDocumentFragment();
		fragment.appendChild(createTextLink(this.title, this.website));
		fragment.appendChild(document.createTextNode(" by "));
		for (var i = 0; i < this.authors.length; i++) {
		    var author = this.authors[i];
			var authorLink;
			if (author instanceof Array) {
			    //trying to phase out using an array to define a Human.
			    var authorName = author[0];
			    var authorURL = author[1];
			    authorLink = createLink(authorName, authorURL);
			} else {
			    //author is a Human object
			    authorLink = author.toNode();
			}
			fragment.appendChild(authorLink);
			if (i == this.authors.length-1) {
				fragment.appendChild(document.createTextNode("."));
			} else {
				fragment.appendChild(document.createTextNode(", "));
			}
		}
		return fragment;
	}

});//end of Book definitions


/*******<<Offering>>**********************************************************
 *****************************************************************************
 ** Offering class definition **/
/**
 * Abstract class for a semester offering at a school.  Known subclasses: Class, Lab.
 */
var Offering = Class.create({

    /**
     * Creates an offering.
     * programs: an array of (name, url) pairs of programs.
     * number: the code or number of this (as a String).
     * semester: the semester this is offered.
     * shortName: the nickname for this offering
     * fullName: the official name for this offering
     * description: the official description of this
     * meetingTimeByDay: a 7-array of integers describing the length of in-class/lab/whatever time
     * minAssignmentNumber: the lowest number for assignments.
     */
    initialize: function(programs, number, semester, shortName, fullName, description, meetingLengthByDay, minAssignmentNumber) {
        this.offeringType = "Offering";
        this.programs = programs;
        this.number = number;
        this.lectureLinks = new Array();
        this.semester = semester;
        this.shortName = shortName;
        this.fullName = fullName;
        this.description = description;
        this.meetingLengthByDay = meetingLengthByDay;
        this.passFail = false; //courses are graded by default
        this.helpfulHumans = new Array(); //will contain the instructors/TAs/LAs/SIs, etc
        this.unscheduledTopics = [];
        this.classCancelledByDay = new Array();
        //add the spaces for topics
        this.initTopicsByDay();
        this.firstWeekNumber = 0;
        //add all the cancelled classes from the semester.
        for (var i = 0; i < this.semester.cancelledDays.length; i++) {
            var date = this.semester.cancelledDays[i][0];
            var reasonForCancellation = this.semester.cancelledDays[i][1];
            var dayInSemester = this.semester.getSemesterDayFromDate(date);
            this.setTopicForSpecificDay(dayInSemester, reasonForCancellation, false);
        }
        //set up the arrays that have a category for each type of assignment.
        this.minAssignmentNumber = minAssignmentNumber || 0;
        this.assignAndDueDays = new Array();
        this.assignments = new Array();
        this.assignTimes = new Array();
        this.dueTimes = new Array();
        for (var type = 0; type < this.NUMBER_OF_ASSIGNMENT_TYPES; type++) {
            this.assignTimes.push("No time set yet.");
            this.dueTimes.push("No date set yet.");
            this.assignAndDueDays.push(new Array());
            this.assignments.push(new Array());
            for (var assignmentNumber = 0; assignmentNumber < this.minAssignmentNumber; assignmentNumber++) {
                //fill in for assignments that will never exist, because they're below the minAssignmentNumber
                this.assignAndDueDays[type].push([-1,-1]);
                this.assignments[type].push(new Assignment());
            }
        }
        this.outcomeGoals = [];
        this.moodleLink = undefined;

        this.getProgrammingRules = Offering.prototype.getNullSyllabusSection;
        this.getHomeworkRules = Offering.prototype.getNullSyllabusSection;
        this.getCodeReuseRules = Offering.prototype.getHonorableCodeReuse;
        this.scheduleBuilt = false; //this becomes true when the schedule has been set

    }

    /**
     * Resets the topics for the days to a bunch of empty lists.
     */
    ,initTopicsByDay: function() {
        this.topicsByDay = []; //we'll set this up a bit so we can add reserved days to it.  Most of it will generate on the fly later, though.
        var numDays = (this.semester.numberOfWeeks + 1) * this.meetingLengthByDay.length;
        //console.log("numDays: " + numDays); TODO: turn this into a Semester method. :)
        for (var i = 0; i < numDays; i++) {
            this.topicsByDay.push([]);
            this.classCancelledByDay.push(false);
        }
    }

    ,/**
     * Adds a learning goal.
     */
    addGoal: function(goal) {
        this.outcomeGoals.push(goal);
    }

    /**
     * Sets this as a pass-fail course.
     */
    ,setPassFail: function() {
        this.passFail = true;
    }

    ,/**
     * Gets a node of the course goals.
     */
    getOutcomeGoalsNode: function() {
        var content = document.createDocumentFragment();

        if (this.outcomeGoals.length == 0) {
            return content;
        }

        var paragraph = document.createElement("p");
        appendChildrenTo(paragraph, ["Successful students will:"]);
        content.appendChild(paragraph);

        var list = document.createElement("ul");
        for (var i = 0; i < this.outcomeGoals.length; i++) {
            var goal = document.createElement("li");
            goal.appendChild(toNode(this.outcomeGoals[i]));
            list.appendChild(goal);
        }
        content.appendChild(list);

        return this.getSyllabusSection("Goals", content);
    }

    ,/**
      * Determines the number of active days each week.
      *
      */
    getNumberOfMeetingsPerWeek: function() {
        var numberOfMeetings = 0;
        for (var i = 0; i < this.meetingLengthByDay.length; i++) {
            if (this.meetingLengthByDay[i] > 0) {
                numberOfMeetings++;
            }
        }
        return numberOfMeetings;
    }

    ,/**
      * Sets the first week number for this.
      */
    setFirstWeekNumber: function(weekNumber) {
        this.firstWeekNumber = weekNumber;
    }

    /**
     *
     */
    ,getMeetingDayBefore: function(dayIndex) {
        var dayOfWeekIndex = this.semester.getDayOfWeekOfDayNumber(dayIndex);
        //console.log("dayOfWeekIndex: " + dayOfWeekIndex);
        var daysBefore = 1;
        while (true) {
            var beforeDayIndex = dayIndex - daysBefore;
            var beforeDayOfWeekIndex = (dayOfWeekIndex - daysBefore) % 7;
            //modulus doesn't quite work for negatives, so we have to add 7 in some cases
            while (beforeDayOfWeekIndex < 0) {
                beforeDayOfWeekIndex += 7;
            }
            //console.log("beforeDayOfWeekIndex: " + beforeDayOfWeekIndex);
            if (this.meetingLengthByDay[beforeDayOfWeekIndex] > 0) {
                return beforeDayIndex;
            }
            daysBefore += 1;
        }
    }

    ,/**
     * Gets an HTML node with a header strip for this class.
     */
    getHeaderStrip: function() {
        var headerStrip = document.createElement("div");
        headerStrip.style.textAlign = "center";
        headerStrip.style.fontSize = "x-large";
        for (var i = 0; i < this.programs.length; i++) {
            var programLink = createTextLink(this.programs[i][0], this.programs[i][1]);
            headerStrip.appendChild(programLink);
            //for all but the last one, add a "/" afterwards
            if (i < this.programs.length - 1) {
                headerStrip.appendChild(document.createTextNode("/"));
            }
        }
        headerStrip.appendChild(document.createTextNode(" " + this.number + ": " + this.shortName));
        headerStrip.appendChild(document.createElement("br"));
        var semesterNameDiv = document.createElement("div");
        semesterNameDiv.style.fontSize = "medium";
        semesterNameDiv.appendChild(document.createTextNode("  (" + this.semester.title + ")"));
        headerStrip.appendChild(semesterNameDiv);
        return headerStrip;
    }

    ,/**
     * Gets the ID as a string
     */
    getID: function() {
        var id = "";
        for (var i = 0; i < this.programs.length; i++) {
            id += this.programs[i][0];
            if (i < this.programs.length - 1) {
                id += "/";
            }
        }
        id += " " + this.number;
        return id;
    }

    ,/**
     * Adds a helpful human (Instructor/LA/TA/SI/etc...)
     *
     *
     */
    addHelpfulHuman: function(human) {
        this.helpfulHumans.push(human);
    }

    ,/**
     * Sets up the header strip and the navigation sidebar.
     * TODO: is this necessary?
     */
    setupBasicCourseElements: function() {
        document.body.setAttribute("id", "course");
        document.body.appendChild(this.getHeaderStrip());
        document.body.appendChild(this.getNavigationDiv());
    }

    ,/**
     * Gets the table for the schedule for this course.
     */
    getScheduleTable: function() {
        //set up the this.topicsByDay array.
        this.fillDaysWithTopics();

        //add the due dates
        this.addDueDatesToSchedule();

        //now build the schedule
        var weekParities = new Array("Even", "Odd");
        //var weekNumber = this.firstWeekNumber - 1;
        var weekNumber = -1;
        var weekParity = weekParities[(weekNumber + 10) % 2]; //we add 10 because negatives don't work correctly with modulus in some browsers.
        var table = document.createElement("table");
        table.style.textAlign = "center";
        table.style.fontSize = "large";
        var row = table.insertRow(-1);
        var cell = row.insertCell(-1);
        cell.setAttribute("id", "schedule" + weekParity);
        cell.appendChild(document.createTextNode("Week"));
        //set the days of the week
        for (var i = 0; i < this.meetingLengthByDay.length; i++) {
            if (this.meetingLengthByDay[i] > 0) {
                cell = row.insertCell(-1);
                cell.setAttribute("id", "schedule" + weekParity);
                cell.appendChild(document.createTextNode(DAYS_OF_THE_WEEK[i]));
            }
        }

        //do the rows and inner contents
        var lastSaturday = this.semester.readingDays[this.semester.readingDays.length-1];
        lastSaturday.setDate(lastSaturday.getDate() + 6 - lastSaturday.getDay()); //shift over to first Saturday on or after the last reading day
        var lastSaturdayDay = this.semester.getSemesterDayFromDate(lastSaturday);

        for (var dayNumber = this.semester.getSemesterDayFromDate(this.semester.firstSunday); dayNumber <= lastSaturdayDay; dayNumber++) {
            var date = this.semester.getDateOfDayNumber(dayNumber);
            var dayOfWeek = date.getDay();
            if (dayOfWeek == 0) { //Sunday
                //start a new row
                weekNumber++;
                weekParity = weekParities[(weekNumber + 10) % 2]; //we add 10 because negatives don't work correctly with modulus in some browsers.
                var row = table.insertRow(-1);
                var cell = row.insertCell(-1);
                cell.setAttribute("id", "schedule" + weekParity);
                var weekNumberSpan = document.createElement("span");
                weekNumberSpan.style.fontSize = "x-large";
                weekNumberSpan.appendChild(toNode("" + weekNumber));
                cell.appendChild(weekNumberSpan);
                cell.appendChild(document.createElement("br"));
                var weekSpan = document.createElement("span");
                weekSpan.style.fontSize = "small";
                weekSpan.appendChild(toNode("Week of "));
                weekSpan.appendChild(document.createElement("br"));
                weekSpan.appendChild(toNode(getShortMonthName(date.getMonth()) + " " + date.getDate()));
                cell.appendChild(weekSpan);
            }
            var timeDuringDay = this.meetingLengthByDay[dayOfWeek];
            if (timeDuringDay > 0) {
                var cell = row.insertCell(-1);
	            var cellFragment = document.createDocumentFragment();
                if (dayNumber < 0) {
                    cell.setAttribute("id", "scheduleMiss");
                    cellFragment.appendChild(document.createTextNode("No Class Yet!"));
                } else {
                    if (this.classCancelledByDay[dayNumber]) {
                        cell.setAttribute("id", "scheduleMiss");
                    } else {
                        cell.setAttribute("id", "schedule" + weekParity);
                    }
	                var topicsForDay = this.topicsByDay[dayNumber];

	                for (var i = 0; i < topicsForDay.length; i++) {
		                cellFragment.appendChild(topicsForDay[i][0].toHTMLNode());
		                cellFragment.appendChild(document.createElement("br"));
	                }
	            }
	            cell.appendChild(cellFragment);
	        }
        }

        table.style.margin = "auto";
        return table;
    }

    /**
     *  Gets the date a topic begins.
     */
    ,getTopicBeginDate: function(soughtTopic) {
        this.fillDaysWithTopics(false);
        for (var dayIndex = 0; dayIndex < this.topicsByDay.length; dayIndex++) {
            var topicsOfDay = this.topicsByDay[dayIndex];
            for (var i = 0; i < topicsOfDay.length; i++) {
                var topic = topicsOfDay[i][0];
                if (topic == soughtTopic) {
                    return dayIndex;
                }
            }
        }
        console.log("Error: never found the date for the topic: " + soughtTopic.toString());
        return -1;
    }

    /**
     * Returns whether there are unscheduled topics.  Goal: replace scheduleBuilt field.
     */
    ,topicsNeedToBeScheduled: function() {
        return this.unscheduledTopics.length > 0;
    }


    /**
     * Fills up this.topicsByDay with things from this.topics in preparation for displaying them in a schedule.
     * If this hasn't been built yet, then this.topicsByDay is a list of lists
     */
    ,fillDaysWithTopics: function(forceRebuild) {

        if (forceRebuild == undefined) {
            forceRebuild = false;
        }

        //if the schedule has already been built, and we're not forcing a rebuild, then we're done
        //if (this.scheduleBuilt && !forceRebuild) {
        if (!this.topicsNeedToBeScheduled() && !forceRebuild) {
            console.log("Don't need to rebuild the schedule.");
            return;
        } else if (this.topicsNeedToBeScheduled()) {
            console.log("Rebuilding the schedule...");
        } else {
            console.log("Building the schedule");
        }

        //this.resetTopicsByDay();

	    var minutesIntoTopic = 0;
	    var dayNumber = 0;
        //go through each day and schedule all the extra time into unscheduled topics!
	    for (var dayNumber = 0; dayNumber < this.topicsByDay.length && this.unscheduledTopics.length > 0; dayNumber ++) {

	        //time avaiable that day
			var dayOfWeek = this.semester.getDayOfWeekOfDayNumber(dayNumber);
			var totalMinutesToday = this.meetingLengthByDay[dayOfWeek];
            var timeRemainingInDay = totalMinutesToday;


	        //subtract out all the time spent on topics already assigned for that day
	        var topicsForDay = this.topicsByDay[dayNumber];
	        for (var i = 0; i < topicsForDay.length; i++) {
	            var topic = topicsForDay[i][0];
                var timeSpentOnTopic = topicsForDay[i][1];
                timeRemainingInDay -= timeSpentOnTopic;
	        }



	        //TODO: comment this out?
            //var timeRemainingInDay = totalMinutesToday - topicsLength;

            //console.log("For day " + dayNumber + ", initial timeRemainingInDay: " + timeRemainingInDay);
            //console.log("topicsLength: " + topicsLength);

            //while there's time left, schedule some events
		    while (timeRemainingInDay > 0 && this.unscheduledTopics.length > 0) { //check whether there's any time left in this day and there are topics to schedule

                //get the next topic, and put it in the schedule
                var currentTopic = this.unscheduledTopics[0];
                //var currentTopic = this.unscheduledTopics[topicIndex];
                //console.log("Scheduling " + currentTopic.toString() + " on day " + dayNumber);
                var timeRemainingInTopic = currentTopic.time - minutesIntoTopic;
                var timeSpentOnTopicToday = Math.min(timeRemainingInDay, timeRemainingInTopic);
                this.topicsByDay[dayNumber].push([currentTopic, timeSpentOnTopicToday]);

                //console.log("timeSpentOnTopicToday: " + timeSpentOnTopicToday);

                minutesIntoTopic += timeSpentOnTopicToday;
                timeRemainingInDay -= timeSpentOnTopicToday;

                //console.log("timeRemainingInDay: " + timeRemainingInDay);

                if (minutesIntoTopic == currentTopic.time) {
                    //move to the next topic!
                    this.unscheduledTopics.shift();
                    minutesIntoTopic = 0;
                } else if (minutesIntoTopic > currentTopic.time) {
                    console.log("Error!  Somehow we went past a topic's time!  minutesIntoTopic: " + minutesIntoTopic);
                }

                /*
                if (minutesIntoDay <= totalMinutesToday) {
                    this.unscheduledTopics.shift();
                    minutesIntoTopic = 0;
                } else {
                    minutesIntoTopic = currentTopic.time - (minutesIntoDay - totalMinutesToday);
                }
                */
		    }
		    //console.log("through the loop");
	    }
	    //the schedule has been built
	    //console.log("Built the schedule");
	    this.scheduleBuilt = true;
    }

    ,/**
     * Adds assignment due dates to the schedule.
     */
    addDueDatesToSchedule: function() {
	    for (var assignmentType = 0; assignmentType < this.assignmentTypes.length; assignmentType++) {
		    for (var assignmentNumber = this.minAssignmentNumber; assignmentNumber < this.assignments[assignmentType].length; assignmentNumber++) {
			    var assignment = this.assignments[assignmentType][assignmentNumber];
                //console.log("due date: " + assignment.getDueDate());
			    var dueDay = this.semester.getSemesterDayFromDate(assignment.getDueDate());
                if (dueDay >= this.topicsByDay.length || dueDay < 0) {
                    console.log("Due day (" + dueDay + ") for assignment, " + assignment + " is not during classes!");
                } else {
                    var dueDateTopic = new AssignmentDueDateTopic(assignment);
                    if (assignment.isLinkable()) {
                        //console.log("dueDay: " + dueDay);
                        this.topicsByDay[dueDay].push([dueDateTopic, 0]);
                    }
                }
		    }
	    }
    }

    ,/**
     * Sets the topic for a specific class meeting.
     */
    setTopicForSpecificDay: function(dayNumber, topicString, classIsHeld, duration) {
        var dayOfWeek = this.semester.getDayOfWeekOfDayNumber(dayNumber);
        var entireMeetingTime = this.meetingLengthByDay[dayOfWeek];
        var topicDuration = duration || entireMeetingTime;
        if (duration != undefined) {
            //console.log("duration: " + duration);
            //console.log("topicDuration: " + topicDuration);
        }

        if (this.topicsByDay[dayNumber] == undefined) {
            this.topicsByDay[dayNumber] = [];
        }
        this.topicsByDay[dayNumber].push([new CourseTopic(topicString, topicDuration), topicDuration]);
        if (classIsHeld == undefined) {
            classIsHeld = true;
        }
        this.classCancelledByDay[dayNumber] = (!classIsHeld || this.classCancelledByDay[dayNumber]) ;
    }

    /**
     * Cancels a class meeting for a single class.
     */
    ,cancelDay: function(dayNumber, reason) {
        var dayOfWeek = this.semester.getDayOfWeekOfDayNumber(dayNumber);
        var entireMeetingTime = this.meetingLengthByDay[dayOfWeek];
        this.setTopicForSpecificDay(dayNumber, reason, false, entireMeetingTime);
    }

    /**
     * Uncancels a class meeting.
     */
    ,uncancelDay: function(dayNumber, topicString) {
        //this.setTopicForSpecificDay(dayNumber, topicString, true);
        var dayOfWeek = this.semester.getDayOfWeekOfDayNumber(dayNumber);
        var topicDuration = this.meetingLengthByDay[dayOfWeek];
        this.topicsByDay[dayNumber] = [[new CourseTopic(topicString, topicDuration), topicDuration]];
        this.classCancelledByDay[dayNumber] = false;
    }

    ,/**
     * Loads the main page for this offering.
     */
    generateMainPage: function() {
        document.title = this.getID() + ": " + this.shortName;
        this.generatePage(this.getSyllabusDiv());
    }

    ,/**
      * Creates the page for an assignment.
      */
    generateAssignmentPage: function(assignmentType, assignmentNumber) {
        var assignment = this.getAssignment(assignmentType, assignmentNumber);
        var makeVisible = getParameterByName('visible', 'false');
        document.title = this.getID() + ": " + this.assignmentTypes[assignmentType] + " " + assignmentNumber;
        this.generatePage(assignment.toNode(makeVisible.toLowerCase() == 'true'));
    }

    ,/**
      * Gets an image for the upper left-hand corner of this page.
      */
    getCornerImage: function() {
        var index = Math.floor(Math.random() * this.cornerImageSources.length);
        var image = this.cornerImageSources[index].toElement();
        image.style.maxWidth = "150px";
        image.title = "Source: " + image.src;
        return image;
    }

    ,/**
      * Loads a page for this course, with the main content specified.
      */
    generatePage: function(mainContentDiv) {

        var table = document.createElement("table");
        document.body.appendChild(table);
        table.style.borderSpacing = "0";
        table.cellPadding = "5px";
        var row = table.insertRow(-1);
        var cornerCell = row.insertCell(-1);
        cornerCell.style.maxWidth = "150px";
        cornerCell.appendChild(this.getCornerImage());
        var titleCell = row.insertCell(-1);
        this.setUpTitleBar(titleCell);
        var row = table.insertRow(-1);
        var sidebarCell = row.insertCell(-1);
        this.setUpSidebar(sidebarCell);
        var mainCell = row.insertCell(-1);
        mainCell.vAlign = "top";
        mainCell.appendChild(mainContentDiv);
        mainCell.appendChild(document.createElement("br"));
        var allowanceDiv = document.createElement("div");
        mainCell.appendChild(allowanceDiv);
        allowanceDiv.style.textAlign = "center";
        allowanceDiv.style.fontSize = "small";
        allowanceDiv.appendChild(document.createElement("br"));
        allowanceDiv.appendChild(document.createElement("br"));
        //allowanceDiv.appendChild(document.createTextNode("(Instructors: Feel free to use any material on this page.  I'd really like to know if you do, so please email me at: paithanq AT gmail DOT com .  Thanks!)"));
    }

    ,/**
      * Sets up the sidebar cell.  Subclasses can overwrite this to change the class.
      * TODO: reorganize so the page doesn't use a table for layout!
      */
    setUpSidebar: function(sidebarCell) {
        var sidebarDiv = this.getSidebarDiv();
        sidebarCell.appendChild(sidebarDiv);
        sidebarCell.className = "PlyStateClassSidebar";
        sidebarCell.vAlign = "top";
        sidebarCell.style.minWidth = "125px";
    }

    ,/**
      * Sets up the header stripe.
      */
    setUpTitleBar: function(titleCell) {
        var titleDiv = this.getHeaderStrip();
        titleCell.appendChild(titleDiv);
        titleDiv.className = "PlyStateClassHeader";
    }

    ,/**
     * Creates the title div used for all pages for this offering.
     */
    getTitleDiv: function() {
        return this.getHeaderStrip();  //TODO: refactor that method to be here?
    }

    ,/**
     * Gets a paragraph element with the description.
     */
    getDescriptionP: function() {
        var p = document.createElement("p");
        p.appendChild(document.createElement("b"));
        p.lastChild.appendChild(document.createTextNode(this.offeringType + " Description"));
        p.appendChild(document.createTextNode(": " + this.description));
        return p;
    }

    ,/**
     * Sets the moodle link for this.
     */
    setMoodleLink: function(linkUrl) {
        this.moodleLink = linkUrl;
    }

    ,/**
     * Creates the div that contains the syllabus.
     */
    getSyllabusDiv: function() {

        var div = document.createElement("div");
        div.style.textAlign = "left";

        var syllabusTitleDiv = document.createElement("div");
        div.appendChild(syllabusTitleDiv);
        syllabusTitleDiv.style.textAlign = "center";
        syllabusTitleDiv.style.fontSize = "x-large";
        syllabusTitleDiv.appendChild(document.createTextNode("Syllabus"));


        //add the course description
        div.appendChild(this.getDescriptionP());

        div.appendChild(this.getOutcomeGoalsNode());

        //add the list of human support
        div.appendChild(this.getHelpfulHumansPart());

        //get the contact info
        div.appendChild(this.getContactPart());

        //add the schedule
        var scheduleDiv = document.createElement("div");
        div.appendChild(scheduleDiv);
        scheduleDiv.appendChild(document.createElement("br"));
        scheduleDiv.style.textAlign = "center";
        scheduleDiv.style.fontSize = "x-large";
        scheduleDiv.appendChild(document.createTextNode("Schedule"));
        scheduleDiv.appendChild(document.createElement("br"));
        scheduleDiv.appendChild(this.getScheduleTable());

        return div;
    }

    /** Gets the list of class support */
    ,getHelpfulHumansPart: function() {
        var content = document.createElement("ul");
        for (var i = 0; i < this.helpfulHumans.length; i++) {
            var human = document.createElement("li");
            content.appendChild(human);
            human.appendChild(this.helpfulHumans[i].toElement());
        }
        return this.getSyllabusSection("Helpful Humans", content);
    }

    /** Gets a syllabus section with my contact info. */
    ,getContactPart: function() {
        var content = document.createDocumentFragment();
        var paragraph = document.createElement("p");
        appendChildrenTo(paragraph, ["The best ways to get in touch with me are to visit me in person or email me (kwburke@plymouth.edu).  I pay attention to my email constantly throughout the day and will try to get back to you as soon as possible.  Please give me at least one school day to respond.  If it's been longer than that and I haven't responded, don't be afraid to email me again!  My office hours are listed on my ", createTextLink("schedule", HOME + "?main=schedule"), "; my contact info is on my ", createTextLink("home page", HOME + "?"), ".  Please feel free to swing by and ask me questions even if I'm not expecting you!  Getting in-person help is often the best way to clear something up!"]);
        content.appendChild(paragraph);

        var paragraph = document.createElement("p");
        appendChildrenTo(paragraph, ["When communicating with me, it is perfectly okay to call me \"Kyle\". :)"]);
        content.appendChild(paragraph);
        return this.getSyllabusSection("Contacting Kyle", content);
    }

    ,/**
     * Gets the sidebar with navigation links for this.
     */
    getSidebarDiv: function() {

        var div = document.createElement("div");
        div.style.textAlign = "left";
        div.style.fontSize = "small";
        div.style.padding = "3px";

        //syllabus link
        div.appendChild(document.createElement("p"));
        div.lastChild.appendChild(createTextLink("Syllabus", this.getURL()));
        div.lastChild.style.fontWeight = "bold";

        if (this.moodleLink != undefined) {
            div.appendChild(document.createElement("p"));
            div.lastChild.appendChild(createTextLink("Moodle", this.moodleLink));
            div.lastChild.style.fontWeight = "bold";
        }

        //links to helpful humans
        div.appendChild(document.createElement("b"));
        div.lastChild.appendChild(document.createTextNode("Teachers"));
        div.appendChild(document.createElement("br"));
        for (var i = 0; i < this.helpfulHumans.length; i++) {
            var humanDiv = document.createElement("div");
            humanDiv.appendChild(this.helpfulHumans[i].toSmallElement());
            humanDiv.style.paddingLeft = "7px";
            div.appendChild(humanDiv);
        }
        div.appendChild(document.createElement("br"));

        //links to assignments
        if (this.hasLinkableAssignments()) {
            for (var i = 0; i < this.assignmentTypes.length; i++) {
                var type = this.assignmentTypes[i];
                if (this.getNumberOfLinkableAssignments(i) > 0) {
                    div.appendChild(document.createElement("b"));
                    div.lastChild.appendChild(document.createTextNode("Assignments"));
                    for (var assignmentNumber = this.minAssignmentNumber; assignmentNumber < this.assignments[i].length; assignmentNumber++) {
                        var assignment = this.assignments[i][assignmentNumber];
                        if (assignment.isLinkable()) {
                            div.appendChild(document.createElement("div"));
                            div.lastChild.style.paddingLeft = "7px";
                            div.lastChild.appendChild(createTextLink(type + " " + assignmentNumber, assignment.getURL()));
                            div.lastChild.appendChild(document.createElement("br"));
                        }
                    }
                }
                div.appendChild(document.createElement("br"));
            }
        }

        //Kyle links
        div.appendChild(document.createElement("b"));
        div.lastChild.appendChild(document.createTextNode("Other Pages"));
        div.appendChild(document.createElement("br"));
        var otherLinks = document.createElement("div");
        otherLinks.style.paddingLeft = "7px";
        div.appendChild(otherLinks);
        otherLinks.appendChild(createTextLink("Kyle's Teaching", HOME + "?main=teaching"));
        otherLinks.appendChild(document.createElement("br"));
        otherLinks.appendChild(createTextLink("Kyle's Schedule", HOME + "?main=schedule"));
        otherLinks.appendChild(document.createElement("br"));
        otherLinks.appendChild(createTextLink("Kyle's Resources", HOME + "?main=resources"));

        return div;
    }

    ,/**
      * Gets the next assignment number.
      */
    getNextAssignmentNumber: function(assignmentType) {
        return this.assignments[assignmentType].length;
    }

    ,/**
     * Sets the time a type of assignment will be assigned.
     */
    setAssignTime: function(assignTime, assignmentType) {
        this.assignTimes[assignmentType] = copyDate(assignTime);
    }

    ,/**
     * Sets the time a type of assignment will be due.
     */
    setDueTime: function(dueTime, assignmentType) {
        this.dueTimes[assignmentType] = copyDate(dueTime);
    }

    ,/**
     * Returns a date containing the time of day a type of assignment is due.
     */
    applyAssignTimeToDate: function(assignmentType, date) {
        copyTimeOfDay(this.assignTimes[assignmentType], date);
    }

    ,/**
     * Returns a date containing the time of day a type of assignment is due.
     */
    applyDueTimeToDate: function(assignmentType, date) {
        copyTimeOfDay(this.dueTimes[assignmentType], date);
    }

    ,/**
      * Returns whether a given assignment is visible.
      */
    assignmentIsVisible: function(assignmentType, assignmentNumber) {
        var assignment = this.getAssignment(assignmentType, assignmentNumber);
        return assignment.isVisible();
    }

    ,/**
      * Returns whether a given assignment is linkable.
      */
    assignmentIsLinkable: function(assignmentType, assignmentNumber) {
        var assignment = this.getAssignment(assignmentType, assignmentNumber);
        return assignment.isLinkable();
    }

    ,/**
      * Returns the number of visible assignments of a given type.
      */
    getNumberOfVisibleAssignments: function(assignmentType) {
        var numberVisible = 0;
        for (var i = this.minAssignmentNumber; i < this.assignments[assignmentType].length; i++) {
            if (this.assignments[assignmentType][i].isLinkable()) {
                numberVisible ++;
            }
        }
        return numberVisible;
    }

    ,/**
      * Returns the number of linkable assignments of a given type.
      */
    getNumberOfLinkableAssignments: function(assignmentType) {
        var numberLinkable = 0;
        for (var i = this.minAssignmentNumber; i < this.assignments[assignmentType].length; i++) {
            if (this.assignments[assignmentType][i].isLinkable()) {
                numberLinkable ++;
            }
        }
        return numberLinkable;
    }

    ,/**
     * Returns whether there are any linkable assignments.
     */
    hasLinkableAssignments: function() {
        for (var type = 0; type < this.assignmentTypes.length; type++) {
            if (this.getNumberOfLinkableAssignments(type) > 0) {
                return true;
            }
        }
        return false;
    }

    ,/**
     * Returns whether there are any visible assignments.
     */
    hasVisibleAssignments: function() {
        for (var type = 0; type < this.assignmentTypes.length; type++) {
            if (this.getNumberOfVisibleAssignments(type) > 0) {
                return true;
            }
        }
        return false;
    }

    ,/**
     * Returns an AssignmentInOffering in this.
     */
    getAssignment: function(assignmentType, index) {
        if (index < this.minAssignmentNumber || index >= this.assignments[assignmentType].length) {
            return new Assignment(); //the requested assignment does not exist.
        }
        return this.assignments[assignmentType][index];
    }

    /**
     * Adds an assignment to this.
     */
    ,addAssignment: function(assignment) {
        var assignmentType = assignment.getAssignmentType();
        var assignmentNumber = this.assignments[assignmentType].length;
        this.assignments[assignmentType].push(new AssignmentInOffering(assignment, this, assignmentNumber));
    }

    /**
     * Adds an assignment to be completed before a course topic.  The topic needs to have already been added to the course.
     */
    ,addTopicPrepAssignment: function(assignment, topic) {
        this.fillDaysWithTopics(false);
        var dueDayIndex = this.getTopicBeginDate(topic);
        //console.log("dueDayIndex: " + dueDayIndex);
        var assignDayIndex = this.getMeetingDayBefore(dueDayIndex);
        this.assignAndDueDays[assignment.getAssignmentType()].push([assignDayIndex, dueDayIndex]);
        this.addAssignment(assignment);
    }

    ,/**
     * Sets the due dates for an assignment type.
     * @param dayPairs  a list of pairs of integers corresponding to days of the class.  For example, [[1, 8], [8, 15]] means the first assignment is handed out on the 1eth day and due on the 8eth day.  The second is handed out on the 8eth day and due on the 15eth day.
     */
    setAssignAndDueDates: function(dayPairs, assignmentType) {
        for (var i = 0; i < dayPairs.length; i++) {
            var assignmentNumber = i + this.minAssignmentNumber;
            if (dayPairs[i].length == 2) {
                this.assignAndDueDays[assignmentType][assignmentNumber] = dayPairs[i];
            } else if (dayPairs[i].length == 1) {
                //in this case, it's just giving the due date; the assigned date is the due date of the last assignment.
                var dueDate = dayPairs[i][0];
                var assignedDate=0; //default case: this is the first assignment, so it was assigned on the first day of classes
                if (i > 0) {
                    //if this is not the first assignment
                    assignedDate = this.assignAndDueDays[assignmentType][assignmentNumber-1][1];
                }
                this.assignAndDueDays[assignmentType][assignmentNumber] = [assignedDate, dueDate];
            }
        }
    }

    /**
     * Returns the pair [assign, due] dates for an assignment.  If no pair is given by the course, it makes a pair up (to avoid crashing the page).
     */
    ,getAssignmentDays: function(assignmentType, assignmentNumber) {
        if (assignmentNumber < this.assignAndDueDays[assignmentType].length) {
            return this.assignAndDueDays[assignmentType][assignmentNumber];
        } else {
            //oops!  We don't have this date listed yet!
            if (assignmentNumber <= 0) {
                return [0, 0]; //is this broken?
            } else {
                previousDueDay = this.getDueDay(assignmentType, assignmentNumber - 1);
                return [previousDueDay + 1, previousDueDay]; //yes, I know this date doesn't make sense (it's due the day after it's assigned) but this way it won't give them unknown extra time.
            }
        }
    }

    /**
     * Returns the day of the semester an assignment is given.
     */
    ,getAssignDay: function(assignmentType, assignmentNumber) {
        return this.getAssignmentDays(assignmentType, assignmentNumber)[0];
    }

    /**
     * Returns the day of the semester an assignment is due.
     */
    ,getDueDay: function(assignmentType, assignmentNumber) {
        return this.getAssignmentDays(assignmentType, assignmentNumber)[1];
    }

    /**
     * Adds a topic to this.
     */
    ,addTopic: function(topic) {
        this.unscheduledTopics.push(topic);
        this.scheduleBuilt = false; //might need to rebuild the schedule now
    }

    ,/**
      * Sets the list of links (images) to use in lectures.
      */
    setLectureLinks: function(links) {
        this.lectureLinks = links;
    }

    ,/**
      * Loads the page for a link.
      */
    loadLinkPage: function(linkNumber) {
        var linkInfo = this.lectureLinks[linkNumber];
        var linkURL = linkInfo[0];
        var linkCaption = linkInfo[1];
        var linkShortCaption = linkInfo.length > 2 ? linkInfo[2] : linkInfo[1];
        var linkSource = linkInfo.length > 3 ? linkInfo[3] : "???";

        var threeSuffix = linkURL.substring(linkURL.length - 4).toLowerCase();
        var fourSuffix = linkURL.substring(linkURL.length - 5).toLowerCase();
        var content;
        if (threeSuffix == ".gif" || threeSuffix == ".jpg" || threeSuffix == ".bmp" || fourSuffix == ".jpeg" || threeSuffix == ".png" || threeSuffix == ".svg") {
            //var image = document.createElement("img");
            var image = new PaitImage(linkURL, linkShortCaption, linkCaption);
            image.autoScale();
            image.scaleImage(.9); //scale an additional 90%
            content = image;
            //document.body.appendChild(image);
        } else {
            //TODO: why doesn't this work?
            //clientSideInclude(document.body, linkURL);

            //temporary: for now, let's just create a link
            content = createLink(linkCaption, linkURL);
            //document.body.appendChild(link);
        }
        document.body.style.textAlign = "center";
        var contentTitle = createElementWithChildren("h1", [linkCaption]);

        appendChildrenTo(document.body, [content, contentTitle, document.createElement("hr")]);
        var backLinkUrl = null;
        if (linkNumber > 0) {
            var backLinkInfo = this.lectureLinks[linkNumber-1];
            var backLinkDescription = backLinkInfo.length > 2 ? backLinkInfo[2] : backLinkInfo[1];
            backLinkUrl = HOME + "?link=" + (linkNumber-1) + "&course=" + this.number;
            appendChildrenTo(document.body, [createLink("Back", backLinkUrl), ": " + backLinkDescription + "    "]);
        }
        var forwardLinkUrl = null;
        if (linkNumber < this.lectureLinks.length -1) {
            var forwardLinkInfo = this.lectureLinks[linkNumber+1];
            var forwardLinkDescription = forwardLinkInfo.length > 2 ? forwardLinkInfo[2] : forwardLinkInfo[1];
            forwardLinkUrl = HOME + "?link=" + (linkNumber +1) + "&course=" + this.number;
            appendChildrenTo(document.body, [createLink("Forward", forwardLinkUrl), ": " + forwardLinkDescription]);
        }

        //easier to hit the back and forward keys
        //this code modified from Felix Kling's Stackoverflow answer:
        // https://stackoverflow.com/questions/4416505/how-to-take-keyboard-input-in-javascript
        document.addEventListener('keydown', function(event) {
            //console.log("key pressed: " + event.keyCode);
            //37 is left keyboard key, 33 is left button on my presentation tool
            if (event.keyCode == 37 || event.keyCode == 33) {
                //Left was pressed
                if (backLinkUrl != null) {
                    location.href = backLinkUrl;
                }
            //39 is the right keyboard key, 34 is the right button on the presentation tool
            } else if (event.keyCode == 39 || event.keyCode == 34) {
                //Right was pressed
                if (forwardLinkUrl != null) {
                    location.href = forwardLinkUrl;
                }
            }
        });
    }

}); //end of Offering class definition


//null syllabus section
Offering.prototype.getNullSyllabusSection = function() {
    return document.createDocumentFragment();
}

/** Returns a syllabus section.  If the contents is null, then this returns an empty fragment.*/
Offering.prototype.getSyllabusSection = function(titleText, contents) {
    if (contents.childElementCount == 0) {
        return document.createDocumentFragment();
    }
    var title = document.createElement("h3");
    title.appendChild(toNode(titleText));
    var section = document.createDocumentFragment();
    appendChildrenTo(section, [title, contents]);
    return section;
}

//A SyllabusSection that reflects no late projects, since that can be turned in over and over.
//TODO: change the name?
Offering.prototype.RECURRING_ASSIGNMENTS = function() {
    var content = document.createElement("p");
    appendChildrenTo(content, ["Since missed parts on one project can be fixed and resubmitted later, assignments turned in late will be graded in the following round.  I will perform extra rounds of grading only for individual students as a result of lengthy excused absences, decided on a case-by-case basis."]);
    return Offering.prototype.getSyllabusSection("Late Assignments", content);
}

//A SyllabusSection that reflects no extensions, since projects can be turned in over and over.  This just ignores the right to extensions altogether.
Offering.prototype.NO_EXTENSIONS = function() {
    return Offering.prototype.getSyllabusSection("Catching Up", this.getMissingClassPart());
}

/** Rules for working on homework in groups. */
Offering.prototype.getHomeworkCollaboration = function() {
    var rules = document.createElement("p");
    rules.appendChild(toNode("For written homework assignments, it's important to write up answers individually.  It's okay to talk to other people about your thoughts, and even about final answers.  (I recommend everyone getting their general ideas up on a whiteboard.)  However, when it is time to write up your answer, it should be in your own words, using your own steps.  Please be sure to list the people you worked with on each assignment. "));
    return rules;
}

/** Rules: programming only as individuals. */
Offering.prototype.getNoTeams = function() {
    var content = document.createElement("p");
    content.appendChild(toNode("In this course, you will be programming individually.  You should not be sharing source code with anyone else."));
    return content;
}

/** Rules: Pair Programming ALWAYS. */
Offering.prototype.getPairProgrammingTeams = function() {
    var content = document.createDocumentFragment();

    var paragraph = document.createElement("p");
    appendChildrenTo(paragraph, ["In this course, you will be programming in teams, which is an important skill to practice and hone.  ", createTextLink("Pair Programming", "https://en.wikipedia.org/wiki/Pair_programming"), " is expected at all times.  (If there are more than two members of your group, there can be multiple navigators.)  Switching drivers frequently is highly recommended!"]);
    content.appendChild(paragraph);

    var paragraph = document.createElement("p");
    paragraph.appendChild(document.createTextNode("You should not write code for your project independently; all code must be written with all team members present.  If I learn that teams are programming separately, the team will lose points.  (It will also damage quality of the project.)"));
    content.appendChild(paragraph);
    return content;
}

/** Rules: Teams may break up. */
Offering.prototype.getSeparableTeams = function() {
    //var content = document.createDocumentFragment();
    var content = document.createElement("p");
    appendChildrenTo(content, ["A vital part of this course is learning to work in teams.  The following rules apply to teamwork.",  createList(false, ["Your group is allowed to work without the entire group present.  Although you are allowed to write code on your own, this is a purposeful pit-trap.  Pair programming is a very fast way to develop strong code!  Cowboy coding is a good way to spend 5 hours doing something that would take two people working together only 1 hour.", "Everyone should still be putting equal effort into the projects, so be certain to keep work loads balanced.  I ask for an email from each participant where they detail the percentage of effort they think each person contributed to the project.", "If a team member does not contribute adequately to a project, they will not receive any points for that project.  If it is later discovered that they did not contribute adequately, any credit for the assignment will be removed.", "If a student needs to change teams during the semester, I will try to assist in finding a new team, but it is ultimately up to the student to find a team.  If they cannot find a team to work with, they will be unable to earn points for remaining team projects."])]);
    //console.log(content.childElementCount);
    return content;
}

/** Rules: Honorably using code. */
Offering.prototype.getHonorableCodeReuse = function() {
    var content = document.createDocumentFragment();

    var paragraph = document.createElement("p");
    var never = document.createElement("em");
    never.appendChild(toNode("never"));
    appendChildrenTo(paragraph, ["It is ", never, " acceptable to use outside code and not cite your source.  (Outside code is code that no one on your assignment team wrote and that was not provided to you by the instructor or course text book, e.g. code you found on the Internet or code written by another student.)  This includes:"]);
    content.appendChild(paragraph);

    content.appendChild(createList(false, [document.createTextNode("copy-pasting code"), document.createTextNode("copying code, then making changes"), document.createTextNode("downloading code"), "transcribing code you read from any sort of media"]));

    var paragraph = document.createElement("p");
    paragraph.appendChild(toNode("Anytime you use outside code, reference the source in a comment.  For example:"));
    content.appendChild(paragraph);

    var comment = document.createElement("pre");
    comment.appendChild(toNode("//The following code block is based on the example by \n//MonkeyClone13 at: www.monkeycode.com/drag-and-drop-example.html"));
    content.appendChild(comment);

    var paragraph = document.createElement("p");
    paragraph.appendChild(toNode("In most cases, any use of outside code is not allowed.  If you're not certain what is allowed, please ask me.  Assume that code is not allowed unless it's explicitly stated elsewhere.  Here's a list of things you can do from best to worst:"));
    content.appendChild(paragraph);

    content.appendChild(createList(false, [document.createTextNode("Write your own code or use code from the textbook, provided by the assignment, or given to you in class.  (No problems here!)"), document.createTextNode("Submit code using an authorized outside source with the source cited.  (Great!  Still no problems!)"), document.createTextNode("Submit code using an unauthorized source with the source cited.  (You'll lose points, but no plagiarism here.)"), document.createTextNode("Submit code from an authorized outside source with no source cited.  (This is plagiarism, even through it may not seem like it.  You won't lose points on the assignment, but you will be given a warning.)"), document.createTextNode("Submit code using an unauthorized source without citing the source.  (You'll lose points and action will be taken as described by the academic integrity policy.)"), document.createTextNode("Submit code willingly provided by another student (outside your team).  (You'll both lose points and action will be taken as described by the academic integrity policy.)")]));

    return content;
}

//***********some constants for different assignment types*********
Offering.prototype.assignmentTypes = new Array();
Offering.prototype.HOMEWORK = Offering.prototype.assignmentTypes.length;
Offering.prototype.assignmentTypes.push("Homework");
Offering.prototype.PROJECT = Offering.prototype.assignmentTypes.length;
Offering.prototype.assignmentTypes.push("Project");
Offering.prototype.PRESENTATION = Offering.prototype.assignmentTypes.length;
Offering.prototype.assignmentTypes.push("Presentation");
Offering.prototype.FINAL = Offering.prototype.assignmentTypes.length;
Offering.prototype.assignmentTypes.push("Final");
Offering.prototype.NUMBER_OF_ASSIGNMENT_TYPES = Offering.prototype.assignmentTypes.length;

//Wittenberg programs
Offering.prototype.WITT_COMP = new Array("Comp", "http://www5.wittenberg.edu/academics/math.html");
Offering.prototype.WITT_MATH = new Array("Math", "http://www5.wittenberg.edu/academics/computerscience.html");
Offering.prototype.WITT_WITTSEM = new Array("WittSem", "http://www5.wittenberg.edu/academics/wittsems/index.html");

//Colby pictures
Offering.prototype.COLBY_IMAGES = new Array();
Offering.prototype.COLBY_IMAGES.push(new PaitImage("http://upload.wikimedia.org/wikipedia/en/thumb/b/b7/Colby_College_Seal.svg/185px-Colby_College_Seal.svg.png", "Colby Seal"));
Offering.prototype.COLBY_IMAGES.push(new PaitImage("http://www.colby.edu/environ/LandscapeConf/Images/Colby.seal.blue.jpg", "Seal from the 80's"));
Offering.prototype.COLBY_IMAGES.push(new PaitImage("http://upload.wikimedia.org/wikipedia/en/e/ea/Colby_University_Logo.png", "Old Colby Seal"));
Offering.prototype.COLBY_IMAGES.push(new PaitImage("http://upload.wikimedia.org/wikipedia/en/a/ad/Colby_college_bicentennial_seal.png", "Bicentennial Seal"));
Offering.prototype.COLBY_IMAGES.push(new PaitImage("https://www.colby.edu/tools/admin/images/EG07_00020a_2.jpg", "Colby across Johnson Pond"));
Offering.prototype.COLBY_IMAGES.push(new PaitImage("https://www.colby.edu/tools/admin/images/KS08_00334a_1.jpg", "Lorimer Chapel in Winter"));
Offering.prototype.COLBY_IMAGES.push(new PaitImage("https://sphotos-b.xx.fbcdn.net/hphotos-prn1/p480x480/311496_207035376024204_6581575_n.jpg", "Miller Library Sunset"));
Offering.prototype.COLBY_IMAGES.push(new PaitImage("http://degreedirectory.org/cimages/multimages/2/welcome_to_maine_sign.jpg", "Welcome to Maine"));

//Colby color(s)
Offering.prototype.COLBY_BANNER_COLOR = "";

//Plymouth Pictures
Offering.prototype.PLYMOUTH_IMAGES = new Array();
Offering.prototype.PLYMOUTH_IMAGES.push(new PaitImage("http://upload.wikimedia.org/wikipedia/en/e/e0/Psu_seal_lowrez.png", "Plymouth State Seal"));
Offering.prototype.PLYMOUTH_IMAGES.push(new PaitImage("http://www.mileswashburn.com/wp-content/uploads/2013/02/Plymouth-State.jpg", "Plymouth State Logo"));
//Offering.prototype.PLYMOUTH_IMAGES.push(new PaitImage("http://www.nse.org/exchange/campuses/198.jpg", "Plymouth State Beauty Shot"));
//Offering.prototype.PLYMOUTH_IMAGES.push(new PaitImage("http://cdn.stateuniversity.com/assets/logos/images/4351/large_len03.jpg", "Lenticular Clouds"));
Offering.prototype.PLYMOUTH_IMAGES.push(new PaitImage("http://media-cache-ak0.pinimg.com/736x/a4/3d/b5/a43db541143a63b343594876d7a83c85.jpg", "Welcome to NH"));
Offering.prototype.PLYMOUTH_IMAGES.push(new PaitImage("http://www.visitnhcolleges.com/wp-content/gallery/plymouth-state-university/image00008.jpg", "HUB Lawn"));
//Offering.prototype.PLYMOUTH_IMAGES.push(new PaitImage("http://www.aerialphotonh.com/img/s3/v42/p55801870-3.jpg", "Aerial Photo"));
Offering.prototype.PLYMOUTH_IMAGES.push(new PaitImage("http://www.nhsgc.sr.unh.edu/images/campus_lg.jpg", "Rounds and the North"));
//Offering.prototype.PLYMOUTH_IMAGES.push(new PaitImage("https://www.plymouth.edu/alumni/files/2013/03/Mary-Lyon-Winter-1920x1080.jpg", "Mary Lyon Winter")); no longer there
Offering.prototype.PLYMOUTH_IMAGES.push(new PaitImage(LOCAL_HOME + "photos/MaryLyon20161212.jpg", "Mary Lyon Snow"));
Offering.prototype.PLYMOUTH_IMAGES.push(new PaitImage(LOCAL_HOME + "photos/RoundsAndMoon20161019.jpg", "Rounds and the Moon"));
Offering.prototype.PLYMOUTH_IMAGES.push(new PaitImage(LOCAL_HOME + "photos/RoundsAndClouds20160922.jpg", "Rounds and Clouds"));




//end of Offering class





/*******<<Course>>*************************************************************
 *******************************************************************************
 ** Course class definition **/

/**
 * Definition for a course
 */
var Course = Class.create(Offering, {

    /**
     * Creates the course.
     * requiredTexts: an array of Book objects
     * recommendedTexts: an array of Book objects
     * gradingRubrik:
     */
    initialize: function($super, programs, number, semester, shortName, fullName, description, meetingLengthByDay, minAssignmentNumber, requiredTexts, recommendedTexts, gradingRubrik) {
        $super(programs, number, semester, shortName, fullName, description, meetingLengthByDay, minAssignmentNumber);
        this.offeringType = "Course";
        this.requiredTexts = requiredTexts || new Array();
        this.recommendedTexts = recommendedTexts || new Array();
        this.gradingRubrik = gradingRubrik; //TODO: what should we do if this is not specified???  (It's not the last thing on the list...)
        this.cornerImageSources = Offering.prototype.PLYMOUTH_IMAGES;
        this.additionalParts = [];
    }

    ,/**
      * Gets the div containing the syllabus.
      */
    getSyllabusDiv: function($super) {
        var compositeDiv = document.createElement("div");
        var offeringSyllabus = $super(); //get the super class' syllabus.
        var scheduleTable = offeringSyllabus.lastChild;
        offeringSyllabus.removeChild(scheduleTable)
        compositeDiv.appendChild(offeringSyllabus);

        //texts
        compositeDiv.appendChild(this.getTextsPart());

        //grading
        compositeDiv.appendChild(this.getGradingPart());

        //late assignments
        compositeDiv.appendChild(this.getLateAssignmentsPart());

        //final exam period (I have to list this for Plymouth State)
        compositeDiv.appendChild(this.getFinalExamPeriodPart());

        //terrible assignments  TODO: rephrase this part, then readd it.
        //compositeDiv.appendChild(this.getAssignmentQualityPart());

        //course evaluations
        compositeDiv.appendChild(this.getCourseEvalPart());

        //office hours
        compositeDiv.appendChild(this.getOfficeHoursPart());

        //evening tutoring
        compositeDiv.appendChild(this.getTutoringPart());

        //attendance
        compositeDiv.appendChild(this.getAttendancePart());

        //missing class
        compositeDiv.appendChild(this.getCatchingUpPart());

        //student expectations
        compositeDiv.appendChild(this.getExpectationsPart());

        //umbrella Academic Integrity
        compositeDiv.appendChild(this.getAcademicIntegrityPart());

        //code reuse
        compositeDiv.appendChild(this.getCodeReuseSyllabusPart());

        //working in teams
        compositeDiv.appendChild(this.getProgrammingCollaborationSyllabusPart());

        //written work
        compositeDiv.appendChild(this.getHomeworkCollaborationSyllabusPart());

        //disability statement
        compositeDiv.appendChild(this.getDisabilitySyllabusPart());

        //student support foundation
        compositeDiv.appendChild(this.getNonacademicStudentSupportPart());

        //additional parts
        for (var i = 0; i < this.additionalParts.length; i++) {
            compositeDiv.appendChild(this.additionalParts[i]);
        }

        //collect your written work  TODO: fix this to apply to all work?
        compositeDiv.appendChild(this.getOldWorkPart());

        //add the schedule back
        var div = document.createElement("div");
        div.style.textAlign = "center";
        div.appendChild(scheduleTable);
        compositeDiv.appendChild(div);

        var paragraph = document.createElement("p");
        paragraph.style.textAlign = "center";
        paragraph.style.fontSize = "small";
        appendChildrenTo(paragraph, ["Thank you for reading this ", createTextLink("long syllabus", "http://www.slate.com/articles/life/education/2014/08/college_course_syllabi_they_re_too_long_and_they_re_a_symbol_of_the_decline.html"), ".  Now that you've read the whole thing, you probably won't ", createLink("have this problem", "http://www.phdcomics.com/comics.php?f=1583"), ".  If you think something is missing or isn't clear here, please let me know so I can clarify and improve my syllabi.  The purpose of this \"contract\" is not to help you optimize your grade.  Instead it is a mechanism to promote intellectual honesty and curiosity.  I think I like ", createLink("this syllabus", "https://sonyahuber.com/2014/08/20/shadow-syllabus/"), " better, but it lacks the formality needed to address complaints."]);
        compositeDiv.appendChild(paragraph);

        //scroll of truth!
        var scrollImage = new PaitImage("https://turing.plymouth.edu/~kgb1013/images/ScrollOfTruthSyllabusMeme.jpg", "Scroll of Truth - Syllabus", "Found here: https://www.reddit.com/r/Professors/comments/ac8qv6/youve_had_the_truth_all_along/");
        //var scrollImg = scrollImage.toCenteredElement();
        compositeDiv.appendChild(scrollImage.toCenteredElement());


        return compositeDiv;
    }

    /**
     * Adds an additional part to the syllabus.
     * partTitle: string
     * contents: a single thing that toNode can be called on.
     */
    ,addAdditionalSyllabusPart: function(partTitle, contents) {
        this.additionalParts.push(Offering.prototype.getSyllabusSection(partTitle, contents));
    }

    /** Gets an element describing the supporting materials. (Textbooks, etc.) */
    ,getTextsPart: function() {
        var content = document.createDocumentFragment();

        var types = ["Required", "Recommended"];
        for (var j = 0; j < types.length; j++) {
            var texts = this.requiredTexts;
            if (j == 1) {
                texts = this.recommendedTexts;
            }
            if (texts.length > 0) {
                var header = document.createElement("h4");
                header.appendChild(toNode(types[j] + ":"));
                var list = document.createElement("ul");
                appendChildrenTo(content, [header, list]);
                for (var i = 0; i < texts.length; i++) {
                    var textItem = document.createElement("li");
                    list.appendChild(textItem);
                    appendChildrenTo(textItem, [texts[i].toNode()]);
                }
            }
        }

        return Offering.prototype.getSyllabusSection("Texts", content);
    }

    /** Gets an element describing the rubrik and grading. */
    ,getGradingPart: function() {
        var content = document.createDocumentFragment();

        //Rubrik table will go on the left side of the combined table
        var rubrikTable = document.createElement("table");
        rubrikTable.setAttribute("border", "0");
        var row = rubrikTable.insertRow(-1);
        var cell = row.insertCell(-1);
        cell.colSpan = 2;
        cell.style.textAlign = "center";
        cell.style.fontWeight = "bold";
        cell.appendChild(createTextLink("Rubric", "http://i.imgur.com/ag9bjEJ.jpg")); //changed from "Rubrik"
        for (i = 0; i < this.gradingRubrik.length; i++) {
            var row = rubrikTable.insertRow(-1);
            this.gradingRubrik[i].configureTableRow(row);
        }

        //right-hand side of the combined table
        var letterGradeTable = document.createElement("table");
        letterGradeTable.setAttribute("border", "0");
        letterGradeTable.style.fontSize = "small";
        var row = letterGradeTable.insertRow(-1);
        var cell = row.insertCell(-1);
        cell.colSpan = 4;
        cell.style.textAlign = "center";
        cell.style.fontWeight = "bold";
        cell.style.fontSize = "medium";
        cell.appendChild(document.createTextNode("Letter Grades"));
        var letterRanges = [/*["[100, &#8734;)", "A"],*/ ["[93, &#8734;)", "A"], ["[90, 93)", "A-"], ["[87, 90)", "B+"], ["[83, 87)", "B"], ["[80, 83)", "B-"], ["[77, 80)", "C+"], ["[73, 77)", "C"], ["[70, 73)", "C-"], ["[67, 70)", "D+"], ["[63, 67)", "D"], ["[60, 63)", "D-"], ["[0, 60)", "F"]];
        if (this.passFail) {
            letterRanges = [["[70, &#8734;)", "Pass"], ["[0, 70)", "Not Pass"]];
        }
        for (var i = 0; i < letterRanges.length/2; i++) {
            var row = letterGradeTable.insertRow(-1);
            for (var j = 0; j <= 1; j++) {
                var index = i + (j*(letterRanges.length/2));
                //alert(i + "..." + j);
                var range = letterRanges[index][0];
                var grade = letterRanges[index][1];
                var cell = row.insertCell(-1);
                //cell.appendChild(document.createTextNode(range));
                cell.innerHTML = range + ":"; //can't use DOM with infinity
                cell = row.insertCell(-1);
                cell.appendChild(document.createTextNode(grade));
            }
        }

        //container for the two tables.  TODO: redo this so it's not in a table
        var gradingTable = document.createElement("table");
        gradingTable.style.margin = "auto";
        gradingTable.setAttribute("border", "1");
        var row = gradingTable.insertRow(-1);
        var cell = row.insertCell(-1);
        cell.appendChild(rubrikTable);
        cell.vAlign = "top";
        var cell = row.insertCell(-1);
        cell.appendChild(letterGradeTable);
        content.appendChild(gradingTable);

        //fair grading statement
        var paragraph = document.createElement("p");
        appendChildrenTo(paragraph, ["This course follows Plymouth State's ", createTextLink("Fair Grading Policy", "https://campus.plymouth.edu/faculty-governance/wp-content/uploads/sites/20/2017/05/PSU-Fair-Grading-Policy.pdf"), ".  If you ever think I graded something incorrectly or you didn't understand how something was graded, please come talk to me about it.  Grading is hard; I'm often fixing grading mistakes I made.  I will never take off points for errors I missed because you came to talk to me!"]);
        content.appendChild(paragraph);

        /*
        //chuck norris image
        var image = new PaitImage("http://cdn.meme.am/instances/61506643.jpg", "Chuck Norris on Grading").toElement();
        image.width = image.width / 2;
        content.appendChild(image);*/

        //add the paragraphs for each type of grade
        for (i = 0; i < this.gradingRubrik.length; i++) {
            content.appendChild(this.gradingRubrik[i].getDescriptiveParagraph());
        }

        return Offering.prototype.getSyllabusSection("Grading", content);

    }

    /** Gets an element about course evaluations. */
    ,getCourseEvalPart: function() {
        var content = document.createDocumentFragment();
        var paragraph = document.createElement("p");
        appendChildrenTo(paragraph, ["Course Evaluations are an effective tool for me to improve my teaching each semester.  I want to know which parts of the course worked well for you, and which did not.  Please fill out an evaluation at the end of the semester!"]);
        content.appendChild(paragraph);

        var paragraph = document.createElement("p");
        appendChildrenTo(paragraph, ["In order to motivate evaluations, each course has the chance to earn 2 bonus (percentage) points.  Everyone in the class earns this bump if 75% or more of the students complete evaluations before the beginning of the course's ", createLink("final exam period.", FINAL_EXAM_SCHEDULE_URL)]);
        content.appendChild(paragraph);

        return Offering.prototype.getSyllabusSection("Course Evaluations", content);
    }

    /** Gets an element about when the final exam is.  */
    ,getFinalExamPeriodPart: function() {
        return Offering.prototype.getSyllabusSection("Final Exam Period", createElementWithChildren("p", ["Our final exam block is listed in this semester's ", createLink("final exam schedule",FINAL_EXAM_SCHEDULE_URL), "."]));
    }

    /** Gets an element about late assignments. */
    ,getLateAssignmentsPart: function() {
        var content = document.createElement("p");
        appendChildrenTo(content, ["Late assignments will be penalized 10 points for each day it is late.  (Fractions of days are rounded up.)  Late assignments submitted after the final day of classes receive no credit.  Far worse than any late penalty is the delay that will occur in the assignment getting graded by me.  Due dates are often planned with so that I can grade them soon after.  By missing the deadline, students risk a very long return on getting feedback."]);
        return Offering.prototype.getSyllabusSection("Late Assignments", content);
    }

    /** Gets an element about terrible assignments. */
    ,getAssignmentQualityPart: function() {
        var content = document.createDocumentFragment();
        var paragraph = document.createElement("p");
        appendChildrenTo(paragraph, ["Completed work that is overly difficult to grade slows down my ability to return prompt feedback to the rest of the course.  When I encounter submitted assignments clearly lacking in basics, I will stop early and some points for later parts will be ignored.  These sort of submissions include:"]);
        content.appendChild(paragraph);

        var list = createList(false, ["Code that doesn't compile/run.", "Unreadable handwriting.", "Written assignments where problems aren't laid out clearly.", "Code that doesn't follow basic style conventions.", "Code that crashes under normal situations."]);
        content.appendChild(list);

        var paragraph = document.createElement("p");
        appendChildrenTo(paragraph, ["Take the time to clean up your work before submitting.  (Better yet, keep it clean while working on it.)"]);
        content.appendChild(paragraph);

        return Offering.prototype.getSyllabusSection("Assignment Quality", content);
    }

    /** Gets an element about office hours. */
    ,getOfficeHoursPart: function() {
        var content = document.createDocumentFragment();
        var paragraph = document.createElement("p");
        appendChildrenTo(paragraph, ["My office hours are listed on my ", createTextLink("schedule", HOME + "?main=schedule"), ". This is special time I've put aside to take questions from anyone in any of my courses.  I love answering questions, and I love having lots of students visit during office hours.  If there are too many students to fit in my office, I'll usually move to an empty classroom.  Be sure to check the wheel on my door when you visit for office hours; it will tell you where I am if I'm not there."]);
        content.appendChild(paragraph);

        var paragraph = document.createElement("p");
        appendChildrenTo(paragraph, ["If I have a bunch of students, I usually go around the room, giving each person the chance to ask one question each time around.  I do my best to help as many people as possible."]);
        content.appendChild(paragraph);

        var paragraph = document.createElement("p");
        appendChildrenTo(paragraph, ["Office hours are not designed for private conversations.  If you need to speak to me about something sensitive, we can schedule another meeting, just send me an email.  (This philosophy may differ from that of other instructors.)"]);
        content.appendChild(paragraph);

        var paragraph = document.createElement("p");
        appendChildrenTo(paragraph, ["I keep my door open lots (this helps me stay productive).  Even if office hours aren't technically happening, I'd still rather be answering your questions than whatever else I'm doing.  Ask me if I'm available.  Sometimes I'm just too busy keeping up with grading and course bureaucracy."]);
        content.appendChild(paragraph);

        var paragraph = document.createElement("p");
        appendChildrenTo(paragraph, ["Every so often I have to cancel my office hours for different reasons.  I'll do this via email and will try to give you as much advance notice as I can."]);
        content.appendChild(paragraph);

        return Offering.prototype.getSyllabusSection("Office Hours", content);
    }

    /** Gets an element about evening tutoring */
    ,getTutoringPart: function() {
        var content = document.createDocumentFragment();
        var paragraph = document.createElement("p");
        appendChildrenTo(paragraph, ["The department holds ", createTextLink("evening tutoring hours", HOME + "eveningTutoring.php"), " on the third floor of Memorial from 6-8pm, Monday - Thursday."]);
        content.appendChild(paragraph);

        return Offering.prototype.getSyllabusSection("Evening Tutoring", content);
    }

    /** Gets an element about attendance. */
    ,getAttendancePart: function() {
        var content = document.createDocumentFragment();
        var paragraph = document.createElement("p");
        var maxDaysToMiss = this.getNumberOfMeetingsPerWeek();
        appendChildrenTo(paragraph, [toNode("During the semester, each student may only have up to " + maxDaysToMiss + " unexcused absences/late-arrivals.  Any student with " + (maxDaysToMiss + 1) + " or more unexcused absences and/or late-arrivals automatically fails the course.  Unexcusable reasons include oversleeping, weather, and workload.  ("), createTextLink("Shoveling out your car is not an excuse", HOME + "livingOffCampus.php"), " to show up late!)  Excusable reasons include travel for conferences, illnesses, and emergencies.  If you're not sure whether your reason is excusable, please ask me.  (Please see the university's ", createTextLink("Excused Absence Policy", "https://campus.plymouth.edu/faculty-governance/wp-content/uploads/sites/20/2017/05/PSU-Excused-Absence-Policy.pdf"), " for any cases I missed.)"]);
        content.appendChild(paragraph);

        var paragraph = document.createElement("p");
        var maxDaysToMiss = this.getNumberOfMeetingsPerWeek();
        appendChildrenTo(paragraph, ["If you know ahead of time that you'll be absent, please give me at least two weeks notice.  This is especially important if you'll be missing an exam!  Otherwise, to get an absence excused, please email me as soon as it is reasonable to do so."]);
        content.appendChild(paragraph);

        var paragraph = document.createElement("p");
        paragraph.appendChild(toNode("Class sessions before the add deadline count!  If you are choosing between multiple courses, you should be attending meetings and completing work for all of them!"));
        content.appendChild(paragraph);

        return Offering.prototype.getSyllabusSection("Attendance", content);
    }

    /** Gets an element describing how to catch up after an absence. */
    ,getCatchingUpPart: function() {
        var content = document.createDocumentFragment();
        appendChildrenTo(content, [this.getMissingClassPart(), this.getExtensionsPart()]);

        return Offering.prototype.getSyllabusSection("Catching Up", content);
    }

    /** Gets an element describing what to do if you miss class. */
    ,getMissingClassPart: function() {
        var content = document.createDocumentFragment();
        var paragraph = document.createElement("p");
        appendChildrenTo(paragraph, ["Even if you miss part of class, you are still responsible for everything that was discussed, including assignments, administrative changes, and other announcements.  Please do not first come to me and ask me to go over the material with you.  (It is considered especially egregious to ask \"", createTextLink("Did I Miss Anything?", "http://www.loc.gov/poetry/180/013.html"), "\")  Before coming to me:"]);
        content.appendChild(paragraph);

        var list = createList(true, ["Look at the class schedule and do any of the reading that was covered.  Don't just skim it, read it.", "Look over the notes of a classmate.  (It's best to find people you can swap notes with before you are absent!)", "Try out some of the challenge problems I gave to the class, if any."]);
        content.appendChild(list);

        var paragraph = document.createElement("p");
        appendChildrenTo(paragraph, ["If you've done all of those and still have questions, come visit me so we can get you all caught up!"]);
        content.appendChild(paragraph);

        return content;
    }

    /** Gets an element describing extensions. */
    ,getExtensionsPart: function() {
        var content = document.createDocumentFragment();
        var paragraph = document.createElement("p");
        appendChildrenTo(paragraph, ["For absences that are both unexpected and excusable, you can have some extra time to complete assignments.  These are the automatic extensions that may apply:"]);
        content.appendChild(paragraph);

        var list = createList(false, ["If you were absent for more than half of the school days during an assignment, the deadline is automatically extended by the amount of school days you were absent.", "Otherwise, if you were absent during the deadline, the deadline is automatically extended by one day after you return to school."]);
        content.appendChild(list);

        var paragraph = document.createElement("p");
        appendChildrenTo(paragraph, ["If neither of these apply, talk to me if you feel you need extra time.  Otherwise, if the new deadline goes past the last day of classes, you might need to request an extension.  The paperwork for that can be found on the registrar's page.  Please email me if this isn't clear!"]);
        content.appendChild(paragraph);

        return content;
    }

    /** Gets an element describing student expectations. */
    ,getExpectationsPart: function() {
        var content = document.createElement("p");
        appendChildrenTo(content, ["This is a university-level course, and should not be taken lightly.  There are ", createTextLink("many expectations", HOME + "expectations.php"), " I have of students planning to pass this course."]);
        return Offering.prototype.getSyllabusSection("My Expectations", content);
    }

    /** Gets an element describing general academic integrity. */
    ,getAcademicIntegrityPart: function() {
        var content = document.createElement("p");
        appendChildrenTo(content, ["Academic Integrity is taken very seriously.  Please make sure you're aware of all rules regarding working with others.  Violations are reported and handled using the ", createTextLink("Academic Integrity Policy", "https://campus.plymouth.edu/faculty-governance/wp-content/uploads/sites/20/2017/05/PSU-Academic-Integrity-Policy.pdf"), "."]);
        return Offering.prototype.getSyllabusSection("Academic Integrity", content);
    }

    /** Gets an element describing how to reuse code, if applicable. */
    ,getCodeReuseSyllabusPart: function() {
        return Offering.prototype.getSyllabusSection("Honorably Reusing Code", this.getCodeReuseRules());
    }

    /** Gets an element describing working on programming projects. */
    ,getProgrammingCollaborationSyllabusPart: function() {
        return Offering.prototype.getSyllabusSection("Programming Collaboration", this.getProgrammingRules());
    }


    /** Gets an element describing working on written homework. */
    ,getHomeworkCollaborationSyllabusPart: function() {
        return Offering.prototype.getSyllabusSection("Written Homework Collaboration", this.getHomeworkRules());
    }

    /** Gets an element describing disability accommodations. */
    ,getDisabilitySyllabusPart: function() {
        var content = document.createElement("p");
        appendChildrenTo(content, ["Plymouth State University is committed to providing students with documented disabilities equal access to all university programs and facilities. If you think you have a disability requiring accommodations, you should contact ", createTextLink("Campus Accessibility Services (CAS)", "https://campus.plymouth.edu/accessibility-services/"), ", located in Speare (535-3300) to determine whether you are eligible for such accommodations. Academic accommodations will only be considered for students who have registered with CAS. If you have authorized CAS to electronically deliver a Letter of Accommodations for this course, please communicate with your instructor to review your accommodations."]);

        return Offering.prototype.getSyllabusSection("Accessibility Accommodations", content);
    }

    /** Gets an element describing non-academic student support. */
    , getNonacademicStudentSupportPart: function() {
        var content = createElementWithChildren("p", ["Our Student Support Foundation (SSF) provides short-term emergency financial assistance and long-term student support. For more information, see the ", createTextLink("foundation's homepage", "https://campus.plymouth.edu/student-support-foundation/"), ".  SSF also runs a food pantry located in Belknap Hall. To learn more about SSF or access the food pantry, either via open hours or a private appointment, contact the SSF advisor, at psu-ssf@plymouth.edu."]);
        return Offering.prototype.getSyllabusSection("Non-academic Student Support", content);
    }

    /** Describes how to get old work from me. */
    ,getOldWorkPart: function() {
        var content = document.createElement("p");
        appendChildrenTo(content, ["I keep old completed work for at least one semester after the course has ended.  This includes written homework, exams, etc.  If you want any of your work, just come ask me.  I'm very happy to get rid of it!"]);

        return Offering.prototype.getSyllabusSection("Old Work", content);
    }

    /**
      * Returns a url for this.
      */
    ,getURL: function() {
        return HOME + "?course=" + this.number;
    }
}); //end of the Course class definition


//end of Course definitions

/*******<<PlymouthCourse>>***************************** PlymouthCourse class definition. **/

/**
 * A course at Plymouth
 */
var PlymouthCourse = Class.create(Course, {

    /**
     * Creates the course.
     */
    initialize: function($super, programs, number, semester, shortName, fullName, meetingLengthByDay, minAssignmentNumber, requiredTexts, recommendedTexts, gradingRubrik) {
        var description = ""; //we link to the listing instead
        $super(programs, number, semester, shortName, fullName, description, meetingLengthByDay, minAssignmentNumber, requiredTexts, recommendedTexts, gradingRubrik);
    }

    ,/**
     * Gets a link to the course listing.
     */
    getCourseListingURL: function() {
        return "https://www.plymouth.edu/current-students/academic-resources/course-catalog/catalog-details/?course_num=" + this.programs[0][0] + this.number;
    }

    ,/**
     * Gets a paragraph element with the description.
     */
    getDescriptionP: function() {
        var content = document.createElement("p");
        appendChildrenTo(content, ["Please see the department ", createTextLink("listing", this.getCourseListingURL()), " for important stats (credits, catalog description, pre/co-requisites, etc)."]);

        return this.getSyllabusSection(this.offeringType + " Description", content);
    }
});

/*******<<ColbyCourse>>*************************************************************
 *******************************************************************************
 ** ColbyCourse class definition **/

/**
 * A course at Colby.
 */
var ColbyCourse = Class.create(Course, {

    /**
     * Creates the course.
     */
    initialize: function($super, programs, number, semester, name, description, meetingTimeByDay, minAssignmentNumber, requiredTexts, recommendedTexts, gradingRubrik) {
        $super(programs, number, semester, name, name, description, meetingTimeByDay, minAssignmentNumber, requiredTexts, recommendedTexts, gradingRubrik);
        this.cornerImageSources = Offering.prototype.COLBY_IMAGES;
    }

    ,/**
      * Sets up the header stripe.
      */
    setUpTitleBar: function(titleCell) {
        var titleDiv = this.getHeaderStrip();
        titleCell.appendChild(titleDiv);
        titleDiv.className = "ColbyClassHeader";
    }

    ,/**
      * Sets up the sidebar cell.  Subclasses can overwrite this to change the class.
      */
    setUpSidebar: function($super, sidebarCell) {
        $super(sidebarCell);
        sidebarCell.className = "ColbyClassSidebar";
    }

}); //end of ColbyCourse definition

/************<<ColbyLab>>******************************************/

/**
 * Definition for a Lab section at Colby.
 */
var ColbyLab = Class.create(Offering, {

    /**
     * Creates the lab.
     */
    initialize: function($super, number, programs, semester, name, description, minutesByDay, courseURL, minAssignmentNumber) {
        $super(programs, number, semester, name, name, description, minutesByDay, minAssignmentNumber);
        this.offeringType = "Lab";
        this.courseURL = courseURL;
        this.cornerImageSources = Offering.prototype.COLBY_IMAGES;
    }

    ,/**
     * Gets the URL for this class.
     * TODO: move this to a Lab superclass when you create it.
     */
    getURL: function() {
        return HOME + "?lab=" + this.number;
    }

    ,
    getDescriptionP: function($super) {
        var p = $super();
        p.appendChild(document.createTextNode("  "));
        p.appendChild(createTextLink("Class section link", this.courseURL));
        return p;
    }

    ,
    getTitleDiv: function($super) {
        var div = $super();
        div.setAttribute("class", "ColbyClassHeader");
        return div;
    }

    ,/**
      * Gets the div containing the syllabus.
      */
    getSyllabusDiv: function($super) {
        var compositeDiv = document.createElement("div");
        compositeDiv.appendChild($super());
        return compositeDiv;
    }

}); //end of the ColbyLab class definition


/*******<<CourseTopic>>*************************************************************
 *******************************************************************************
 ** CourseTopic class and subclass definitions **/

/**
 * A topic covered in class, but not directly from a textbook.
 */
var CourseTopic = Class.create({

    /**
     * Create a course topic.  time specifies the number of minutes this supposedly takes.
	 * The chapter and section are made up; add them as whatever necessary so they fit in.
     */
    initialize: function(title, time) {
        this.title = title;
        this.chapter = "";
        this.section = "";
        if (time == undefined) {
            this.time = 30;
        } else {
            this.time = time;
        }
    }

    /**
     * Returns a string description of this.
     */
    ,toString: function() {
        return this.time + " mins on " + this.title;
    }

    ,/**
      * Returns a node for this topic.
      */
    toHTMLNode: function() {
        return toNode(this.title);
    }

}); //end of CourseTopic definition

/**
 * A topic covered in class from a book.
 */
var TopicFromBook = Class.create(CourseTopic, {

    /**
     * Create a course topic.  time specifies the number of minutes this supposedly takes.
     */
    initialize: function($super, book, title, sectionArray, time) {
        $super(title, time);
        this.book = book;
        this.sectionArray = sectionArray;
    }

    ,/**
      * Returns a Node describing this.
      */
    toHTMLNode: function() {
    	var fragment = document.createDocumentFragment();
    	fragment.appendChild(document.createTextNode(this.title + " ("));
    	//create the string that represents the section
    	var sectionString = "";
    	for (var i = 0; i < this.sectionArray.length; i++) {
    	    sectionString += this.sectionArray[i];
    	    if (i < this.sectionArray.length - 1) {
    	        sectionString += ".";
    	    }
    	}
    	fragment.appendChild(createTextLink(sectionString, this.book.website));
    	fragment.appendChild(document.createTextNode(")"));
    	return fragment;
    }

}); //end of TopicFromBook definition

/**
 * A topic containing the due date for an assignment.
 */
var AssignmentDueDateTopic = Class.create(CourseTopic, {

    /**
     * Create a course topic.  time specifies the number of minutes this supposedly takes.
     * assignment: an AssignmentInOffering object
     */
    initialize: function(assignment) {
		this.time = 0;
		this.assignment = assignment;
    }

    ,//doc in super class
    toHTMLNode: function() {
    	var fragment = document.createDocumentFragment();
    	var assignmentTypeName = Offering.prototype.assignmentTypes[this.assignment.getAssignmentType()];

    	fragment.appendChild(createTextLink(assignmentTypeName + " " + this.assignment.getNumber(), this.assignment.getURL()));
    	fragment.appendChild(document.createTextNode(" due"));
    	return fragment;
    }

}); //end of AssignmentDueDateTopic definition

/******<<AssignmentInOffering>>****************************/

/**
 * A class only used by Offering and subclasses.  TODO: can it be made inner?  Created whenever an assignment is added to an offering.
 */
var AssignmentInOffering = Class.create({

    /**
     * Constructor.
     */
    initialize: function(assignment, offering, number) {
        this.assignment = assignment;
        var assignmentType = this.getAssignmentType();
        this.number = number;
        this.urlString = offering.getURL() + "&" + Offering.prototype.assignmentTypes[assignmentType].toLowerCase() + "=" + this.number;
        //get the assigned date
        assignDayNumber = offering.getAssignDay(assignmentType, this.number);
        this.assignDate = offering.semester.getDateOfDayNumber(assignDayNumber);
        offering.applyAssignTimeToDate(assignmentType, this.assignDate);
        //get the due date
        dueDayNumber = offering.getDueDay(assignmentType, this.number);
        this.dueDate = offering.semester.getDateOfDayNumber(dueDayNumber);
        offering.applyDueTimeToDate(assignmentType, this.dueDate);

    }

    ,/**
      * Returns a url string for this.
      */
    getURL: function() {
        return this.urlString;
    }

    ,/**
      * Returns this assignment number.
      */
    getNumber: function() {
        return this.number;
    }

    ,/**
      * Returns whether to generate links to this.
      */
    isLinkable: function() {
        var now = new Date();
        return this.getAssignDate() <= now;
    }


    ,/**
      * Returns whether this assignment is visible.
      */
    isVisible: function() {
        var now = new Date();
        return addDays(this.getAssignDate(), -3) <= now;
    }

    ,/**
      * Returns the assigned date of this.
      */
    getAssignDate: function() {
        return copyDate(this.assignDate);
    }

    ,/**
      * Returns the due date of this.
      */
    getDueDate: function() {
        return copyDate(this.dueDate);
    }

    ,/**
      * Returns the type of this assignment (project, homework, etc).
      */
    getAssignmentType: function() {
        return this.assignment.getAssignmentType();
    }

    ,/**
      * Returns a Node describing this.
      */
    toNode: function(makeVisible) {
        if (makeVisible == undefined) {
            makeVisible = false;
        }
        if (makeVisible || this.isVisible()) {
            return this.assignment.toNode(this.getNumber(), this.getAssignDate(), this.getDueDate());
        } else {
            return document.createTextNode("Sorry, this assignment is not ready yet.");
        }

    }

}); //end of AssignmentInOffering class.

/*******<<Assignment>>*************************************************************
 *******************************************************************************
 ** Assignment class definitions **/

/**
 * Abstract superclass for assignments.
 */
var Assignment = Class.create({

    /**
     * Gets the type of this assignment.
     */
    getAssignmentType: function() {
        return this.type;
    }

    ,/**
     * Sets the expected filenames of the submission for this assigment.  Turns them into code-text.
     */
    setFileNames: function(names) {
        this.fileNames = [];
        for (var i = 0; i < names.length; i++) {
            this.fileNames.push(createCodeNode(names[i]));
        }
    }

    /**
     * Sets this to be an assignment used as the final exam.  This should be called privately, via the constructor.  This ensures that it will be called before adding it to the course.  (In which case it will go into the wrong group.)
     */
    ,setAsFinal: function() {
        this.type = Offering.prototype.FINAL;
    }

    /**
     * Gets the type of this assignment as a String
     */
    ,getTypeString: function() {
        return Offering.prototype.assignmentTypes[this.getAssignmentType()];
    }

    /**
     * Whether this has it's own assign and due dates.
     */
    ,hasDates: function() {
        return this.assignDate != undefined && this.dueDate != undefined;
    }

    ,/**
     * Returns an HTML node containing a description of this.
     */
    toNode: function(assignmentNumber, assignDate, dueDate) {
        //this version should never be called!
    	return document.createTextNode("This assignment does not exist.");
    }

}); //end of Assignment definitions.


/****************<<Homework>>***************************
 * Represents a homework assignment.
 */
var Homework = Class.create(Assignment, {

    /**
     * Constructor.
     * @param problemsByChapter  An array of ChapterProblems objects.
     */
    initialize: function(problemsByChapter) {
        this.problemsByChapter = problemsByChapter;
        this.type = Offering.prototype.HOMEWORK;
    }

    ,/**
      * Returns a Node describing this.
      */
    toNode: function(assignmentNumber, assignDate, dueDate) {
        var fragment = document.createElement("ol");
        fragment.start = "0";
        var totalPoints = 0;
        var anchor = document.createElement("a");
        anchor.setAttribute("name", "homework" + assignmentNumber);
        anchor.setAttribute("id", "homework" + assignmentNumber);
        fragment.appendChild(anchor);
        var titleFont = document.createElement("center");
        titleFont.style.fontSize = "large";
        titleFont.appendChild(document.createTextNode("Homework " + assignmentNumber));
        fragment.appendChild(titleFont);
        var dueDateFont = document.createElement("center");
        dueDateFont.appendChild(document.createTextNode("Due: " + dueDate.toDateString()));
        fragment.appendChild(dueDateFont);
        fragment.appendChild(document.createElement("br"));
        for (var i = 0; i < this.problemsByChapter.length; i++) {
            var listItem = document.createElement("li");
            listItem.appendChild(this.problemsByChapter[i].toNode());
            fragment.appendChild(listItem);
            totalPoints += this.problemsByChapter[i].getTotalPoints();
        }
        fragment.appendChild(document.createTextNode("Total Points: " + totalPoints));
        return fragment;
    }

}); //end of Homework definitions!

/****************<<Project>>********************/

/**
 * Definition of the Project class.
 */
var Project = Class.create(Assignment, {

    /**
     * Creates the lab.
     */
    initialize: function($super, title, teamSize, language) {
        $super();
        this.type = Offering.prototype.PROJECT;
        this.title = title;
        this.teamSize = teamSize;
        this.language = language;
        this.descriptionNodes = new Array();
    }

    ,/**
     * Adds to the description of this project.
     */
    addDescriptionNode: function(node) {
        this.descriptionNodes.push(node);
    }

    ,/**
      * Returns a Node with the stats of this project. (Language, team size, due date, etc.)
      */
    getStatsNode: function(assignDate, dueDate) {
        var statsNode = document.createDocumentFragment();
        var stats = document.createElement("p");
        statsNode.appendChild(stats);
        stats.style.textAlign = "left";
        stats.style.fontSize = "large";
        stats.style.fontWeight = "bold";
        stats.appendChild(document.createTextNode("Assigned: " + assignDate.toDateString()));
        stats.appendChild(document.createElement("br"));
        stats.appendChild(document.createTextNode("Due: " + dueDate.toLocaleTimeString() + " on " + dueDate.toDateString()));
        stats.appendChild(document.createElement("br"));
        stats.appendChild(document.createTextNode("Team Size: " + this.teamSize));
        stats.appendChild(document.createElement("br"));
        stats.appendChild(document.createTextNode("Language: " + this.language));
        return statsNode;
    }

    ,/**
     * Creates the page for a lab.
     */
    toNode: function(projectNumber, assignDate, dueDate) {

        //the project description will go in this
        var specsDiv = document.createElement("div");
        specsDiv.style.textAlign = "left";

        //add the header
        var headingLine = document.createElement("p");
        headingLine.style.textAlign = "center";
        headingLine.style.fontWeight = "bold";
        headingLine.style.fontSize = "xx-large";
        headingLine.appendChild(document.createTextNode(this.getTypeString() + " " + projectNumber + ":"));
        headingLine.appendChild(document.createElement("br"));
        headingLine.appendChild(document.createTextNode(this.title));
        specsDiv.appendChild(headingLine);

        //add the basic stats.
        specsDiv.appendChild(document.createElement("br"));
        specsDiv.appendChild(this.getStatsNode(assignDate, dueDate));


        //add the contents
        for (var i = 0; i < this.descriptionNodes.length; i++) {
            specsDiv.appendChild(document.createElement("br"));
            specsDiv.appendChild(this.descriptionNodes[i]);
        }

        return specsDiv;
    }


}); //end of the Project class definition

/**************<<ColbyProject>>****************
 *
 * Represents a standardized project for Colby's intro CS classes (151, 231, 232?)
 */
var ColbyProject = Class.create(Project, {

    /**
     * Constructor.
     *
     * @param title  A string.
     * @param teamSize  A string or int.
     * @param language  A string.
     * @param prefaceNode  A node describing the project as a whole.
     */
    initialize: function($super, title, teamSize, language, courseNumber, semesterCode, prefaceNode, labSteps, assignmentPreface, assignmentSteps, extensionOptions, submissionSteps) {
        $super(title, teamSize, language);
        this.courseNumber = courseNumber;
        this.semesterCode = semesterCode;
        this.prefaceNode = prefaceNode;  //an opening description of the project.
        this.labSteps = labSteps;
        this.assignmentPreface = assignmentPreface;
        this.assignmentSteps = assignmentSteps;
        this.extensionOptions = extensionOptions;
        if (submissionSteps != undefined) {
            this.submissionSteps = submissionSteps;
        } else {
            this.submissionSteps = new Array(); //TODO: finish this!  Good for 151?
        }
        this.resources = undefined;
    }

    ,/**
      * Creates a text title for a project part.
      */
    getSectionTitle: function(titleText) {
        var p = document.createElement("p");
        p.style.fontSize = "large";
        p.style.fontWeight = "bold";
        p.appendChild(document.createTextNode(titleText + ":"));
        return p;
    }

    ,/**
      * Adds resources to this.
      * @param resources  An array of Nodes.
      */
    addResources: function(resources) {
        this.resources = resources;
    }

    ,/**
      * see superclass for more doc
      * @param semesterCode: one-letter season followed by two-character year.  E.g.: s14.
      */
    toNode: function($super, projectNumber, assignDate, dueDate) {
        var mainDiv = document.createElement("div");
        mainDiv.style.textAlign = "left";
        mainDiv.appendChild(this.prefaceNode);
        mainDiv.appendChild(document.createElement("hr"));
        if (this.resources != undefined) {
            mainDiv.appendChild(this.getSectionTitle("Resources"));
            mainDiv.appendChild(createList(false, this.resources));
            mainDiv.appendChild(document.createElement("hr"));
        }
        mainDiv.appendChild(this.getSectionTitle("Setup"));
        var setupList = createList(true, this.labSteps);
        mainDiv.appendChild(setupList);
        mainDiv.appendChild(document.createElement("hr"));
        mainDiv.appendChild(this.getSectionTitle("Assignment"));
        mainDiv.appendChild(this.assignmentPreface);
        mainDiv.appendChild(this.getSectionTitle("Tasks"));
        var assignmentList = createList(true, this.assignmentSteps);
        mainDiv.appendChild(assignmentList);
        mainDiv.appendChild(document.createElement("hr"));
        mainDiv.appendChild(this.getSectionTitle("Extensions"));
        var extensionsExplanation = document.createElement("p");
        extensionsExplanation.appendChild(document.createTextNode("Each assignment will have a set of suggested extensions. The required tasks constitute about 85% of the assignment, and if you do only the required tasks and do them well you will earn a B+. To earn a higher grade, you need to undertake at least one extension. The difficulty and quality of the extension or extensions will determine your final grade for the assignment. One significant extension, or 2-3 smaller ones, done well, is typical."));
        mainDiv.appendChild(extensionsExplanation);
        var extensionList = createList(false, this.extensionOptions);
        mainDiv.appendChild(extensionList);
        mainDiv.appendChild(document.createElement("hr"));
        mainDiv.appendChild(this.getSectionTitle("Hand-In"));
        var handInIntroDiv = document.createElement("div");
        handInIntroDiv.innerHTML = "<p>Make your writeup for the project a wiki page in your personal space. If you have questions about making a wiki page, stop by my office or ask in lab.</p>\n<p>Your writeup should have a simple format:</p>";
        mainDiv.appendChild(handInIntroDiv);
        mainDiv.appendChild(createList(false, this.submissionSteps));
        var handInClosingDiv = document.createElement("div");
        handInClosingDiv.innerHTML = "<p>Once you have written up your assignment, give the page the label: <code>cs" + this.courseNumber + this.semesterCode + "project" + projectNumber + "</code>.  You can give any wiki page a label using the label field at the bottom of the page. (The label is different from the title.)</p>\n<p>Do not put code on your writeup page or anywhere it can be publicly accessed. To hand in code, put it on the Courses fileserver. Create a directory for each project inside the private folder inside your username folder.</p>";
        mainDiv.appendChild(handInClosingDiv);
        mainDiv.appendChild(document.createElement("hr"));
        this.descriptionNodes = [mainDiv];
        return $super(projectNumber, assignDate, dueDate);
    }

}); //end of ColbyProject definitions

/**************<<ColbyCS231Project>>****************
 *
 * Represents a standardized project for 231
 */
var ColbyCS231Project = Class.create(Project, {

    /**
     * Constructor.
     *
     * @param title  A string.
     * @param teamSize  A string or int.
     * @param language  A string.
     * @param prefaceNode  A node describing the project as a whole.
     */
    initialize: function($super, title, teamSize, language, courseNumber, semesterCode) {
        $super(title, teamSize, language);
        this.courseNumber = courseNumber;
        this.semesterCode = semesterCode;
        this.resources = undefined;
    }

    ,/**
      * Creates a text title for a project part.
      */
    getSectionTitle: function(titleText) {
        var p = document.createElement("p");
        p.style.fontSize = "large";
        p.style.fontWeight = "bold";
        p.appendChild(document.createTextNode(titleText + ":"));
        return p;
    }

    ,/**
      * Adds resources to this.
      * @param resources  An array of Nodes.
      */
    addResources: function(resources) {
        this.resources = resources;
    }

    ,/**
      * see superclass for more doc
      * @param semesterCode: one-letter season followed by two-character year.  E.g.: s14.
      */
    toNode: function($super, projectNumber, assignDate, dueDate) {
        var mainDiv = document.createElement("div");
        mainDiv.style.textAlign = "left";
        mainDiv.appendChild(this.getSectionTitle("Lab"));
        var labDiv = document.createElement("div");
        mainDiv.appendChild(labDiv);
        clientSideInclude(labDiv, getPublicFileLink("231/labDiv" + projectNumber + ".html"));

        mainDiv.appendChild(document.createElement("hr"));

        mainDiv.appendChild(this.getSectionTitle("Assignment"));
        var assignmentDiv = document.createElement("div");
        mainDiv.appendChild(assignmentDiv);
        clientSideInclude(assignmentDiv, getPublicFileLink("231/assignmentDiv" + projectNumber + ".html"));

        mainDiv.appendChild(document.createElement("hr"));
        this.descriptionNodes = [mainDiv];
        return $super(projectNumber, assignDate, dueDate);
    }

}); //end of ColbyCS231Project definitions

/**************<<ColbyCS151Project>>****************
 *
 * Represents a standardized project for 151
 */
var ColbyCS151Project = Class.create(Project, {

    /**
     * Constructor.
     *
     * @param title  A string.
     * @param teamSize  A string or int.
     * @param language  A string.
     * @param prefaceNode  A node describing the project as a whole.
     */
    initialize: function($super, title, teamSize, language, courseNumber, semesterCode) {
        $super(title, teamSize, language);
        this.courseNumber = courseNumber;
        this.semesterCode = semesterCode;
        this.resources = undefined;
    }

    ,/**
      * Creates a text title for a project part.
      */
    getSectionTitle: function(titleText) {
        var p = document.createElement("p");
        p.style.fontSize = "large";
        p.style.fontWeight = "bold";
        p.appendChild(document.createTextNode(titleText + ":"));
        return p;
    }

    ,/**
      * see superclass for more doc
      * @param semesterCode: one-letter season followed by two-character year.  E.g.: s14.
      */
    toNode: function($super, projectNumber, assignDate, dueDate) {
        var mainDiv = document.createElement("div");
        mainDiv.style.textAlign = "left";
        mainDiv.appendChild(this.getSectionTitle("Lab"));
        var labDiv = document.createElement("div");
        mainDiv.appendChild(labDiv);
        clientSideInclude(labDiv, getPublicFileLink("151/labDiv" + projectNumber + ".html"));

        mainDiv.appendChild(document.createElement("hr"));

        mainDiv.appendChild(this.getSectionTitle("Assignment"));
        var assignmentDiv = document.createElement("div");
        mainDiv.appendChild(assignmentDiv);
        clientSideInclude(assignmentDiv, getPublicFileLink("151/assignmentDiv" + projectNumber + ".html"));

        mainDiv.appendChild(document.createElement("hr"));
        this.descriptionNodes = [mainDiv];
        return $super(projectNumber, assignDate, dueDate);
    }

}); //end of ColbyCS151Project definitions

/**************<<ProjectByParts>>****************
 *
 * Represents a project assignment.
 */
var ProjectByParts = Class.create(Project, {

    //constructor
    initialize: function($super, title, teamSize, language, prefaceNode, submissionInstructionsFunction, isFinal) {
        $super(title, teamSize, language);
        this.prefaceNode = prefaceNode;  //an opening description of the project.
        this.parts = new Array();
        this.totalPoints = 0;
        this.submissionInstructionsFunction = submissionInstructionsFunction;
        if (isFinal) {
            this.setAsFinal();
        }
    }

    ,/**
      * Adds a part to this project
      */
    addPart: function(part) {
        this.parts.push(part);
        if (!part.isBonus()) {
            this.totalPoints += part.getMaxPoints();
        }
    }

    ,/**
      * Returns the total number of points available in this project.
      */
    getTotalPoints: function() {
        return this.totalPoints;
    }

    ,/**
      * Gets a node with the submission instructions.
      */
    getSubmissionInstructionsNode: function(projectNumber) {
        var instructionsElement = document.createElement("p");
        var instructionsHeader = document.createElement("b");
        instructionsElement.appendChild(instructionsHeader);
        instructionsHeader.appendChild(document.createTextNode("Submitting your Project: "));
        if (this.fileNames == undefined) {
            //the function may not take two parameters, so just give it one
            instructionsElement.appendChild(this.submissionInstructionsFunction(projectNumber));
        } else {
            //give it the fileNames
            instructionsElement.appendChild(this.submissionInstructionsFunction(projectNumber, this.fileNames));
        }
        return instructionsElement;
    }

    ,//doc in superclass
    getStatsNode: function($super, assignDate, dueDate) {
        var statsNode = $super(assignDate, dueDate);
        statsNode.lastChild.appendChild(document.createElement("br"));
        statsNode.lastChild.appendChild(document.createTextNode("Out of: " + this.getTotalPoints() + " points"));
        return statsNode;
    }


    ,//see superclass for doc
    toNode: function($super, projectNumber, assignDate, dueDate) {
        var mainDiv = document.createElement("div");
        mainDiv.style.textAlign = "left";
        mainDiv.appendChild(this.prefaceNode);
        for (var i = 0; i < this.parts.length; i++) {
            mainDiv.appendChild(this.parts[i].toNode(i));
        }
        mainDiv.appendChild(this.getSubmissionInstructionsNode(projectNumber));
        this.descriptionNodes = [mainDiv];
        return $super(projectNumber, assignDate, dueDate);
    }

}); //end of ProjectByParts definitions!

/************<<AssignmentPart>>*************************
 *
 * Represents one part of a project.
 */
var AssignmentPart = Class.create({

    //constructor
    initialize: function(descriptionNode, maxPoints, gradingType) {
        //this.title = title;
        this.descriptionNode = descriptionNode;
        this.maxPoints = maxPoints;
        if (gradingType == undefined) {
            this.gradingType == this.STANDARD;
        } else {
            this.gradingType = gradingType;
        }
    },

    //returns an html description of this.
    toNode: function(partNumber) {
        var partParagraph = document.createElement("p");
        partParagraph.style.textAlign = "left";
        partParagraph.appendChild(document.createElement("b"));
        var partString = "";
        if (partNumber != undefined) {
            partString += "Part " + partNumber + ", ";
        }
        if (this.gradingType == this.SUGGESTED) {
            partString += "Suggested";
        } else {
            partString += this.maxPoints + " points";
        }
        if (this.gradingType == this.BONUS) {
            partString += " (Bonus)";
        }
        partString += ": ";
        partParagraph.lastChild.appendChild(document.createTextNode(partString));
        partParagraph.appendChild(this.descriptionNode);
        return partParagraph;
    },

    //returns the maximum number of points that can be earned by completing this question
    getMaxPoints: function() {
        return this.maxPoints;
    }

    ,/**
      * Returns the total points from this part.
      */
    getTotalPoints: function() {
        return this.getMaxPoints();
    }


    ,//returns whether this is a bonus question.
    isBonus: function() {
        return (this.gradingType == this.BONUS);
    }
});

//these are the different grading types:
AssignmentPart.prototype.STANDARD = 0;
AssignmentPart.prototype.UNGRADED = 1;
AssignmentPart.prototype.SUGGESTED = 2;
AssignmentPart.prototype.BONUS = 3;
//end of the AssignmentPart definitions

/************<<ChapterProblems>>********************/
//Definition for a single chapter of problems.  The second and third elements should be strings.  The fourth should be an array of 2-element arrays, (problemNumber (or description), weight).
var ChapterProblems = Class.create({

    /**
     * Creates a new Chapter Problems instance.
     * notes: should be a string.
     */
    initialize: function(book, sectionArray, suggestedProblems, gradedProblems, notes) {
    	this.book = book;
        this.sectionArray = sectionArray;
        this.suggestedProblems = suggestedProblems;
        this.gradedProblems = gradedProblems;
        this.notes = notes;
    }

    ,/**
      * Returns the total number of points available.
      */
    getTotalPoints: function() {
        var totalPoints = 0;
        for (var i = 0; i < this.gradedProblems.length; i++) {
            var points = this.gradedProblems[i][1];
            totalPoints += points;
        }
        return totalPoints;
    }

    ,/**
     * Returns an HTML DOM table version of this.
     */
    toNode: function() {
        var problemsTable = document.createElement("table");
        problemsTable.setAttribute("border", 2);
        problemsTable.setAttribute("cellpadding", 3);
        var suggestedRow = problemsTable.insertRow(-1);
        var sectionCell = suggestedRow.insertCell(-1);
        sectionCell.setAttribute("valign", "top");
        sectionCell.setAttribute("rowspan", 4);
        sectionCell.appendChild(this.book.toBriefNode());
        sectionCell.appendChild(document.createElement("br"));
        sectionCell.appendChild(document.createTextNode("Sec. "));
        var sectionText = "";
        for (var i = 0; i < this.sectionArray.length; i++) {
            sectionText += this.sectionArray[i];
            if (i < this.sectionArray.length - 1) {
                sectionText += ".";
            }
        }
        var sectionTextNode = document.createElement("b");
        sectionTextNode.style.fontSize = "large";
        sectionTextNode.appendChild(document.createTextNode(sectionText));
        sectionCell.appendChild(sectionTextNode);
        var suggestedWordCell = suggestedRow.insertCell(-1);
        suggestedWordCell.style.fontWeight = "bold";
        suggestedWordText = document.createTextNode("Suggested: ");
        suggestedWordCell.appendChild(suggestedWordText);
        var suggestedProblemsCell = suggestedRow.insertCell(-1);
        suggestedProblemsCell.setAttribute("colspan", this.gradedProblems.length);
        //the actual problems go in here
        suggestedProblemsCell.appendChild( document.createTextNode(this.suggestedProblems));
        var gradedRow = problemsTable.insertRow(-1);
        var gradedWordCell = gradedRow.insertCell(-1);
        gradedWordCell.style.textAlign = "right";
        gradedWordCell.style.fontWeight = "bold";
        gradedWordCell.appendChild(document.createTextNode("Graded: "));
        var weightsRow = problemsTable.insertRow(-1);
        var pointWeightsWordCell = weightsRow.insertCell(-1);
        pointWeightsWordCell.appendChild(document.createTextNode("Total: "));
        pointWeightsWordCell.style.fontSize = "normal";
        pointWeightsWordCell.style.textAlign = "right";
        var notesRow = problemsTable.insertRow(-1);
        var notesWordCell = notesRow.insertCell(-1);
        notesWordCell.appendChild(document.createTextNode("Notes: "));
        notesWordCell.style.textAlign = "right";
        var notesCell = notesRow.insertCell(-1);
        notesCell.setAttribute("colspan", this.gradedProblems.length);
        var totalPoints = 0;
        var hasNotes = false;
        for (var i = 0; i < this.gradedProblems.length; i++) {
            var problemCell = gradedRow.insertCell(-1);
            problemCell.style.fontWeight = "bold";
            problemCell.style.textAlign = "center";
            var problemNumber = this.gradedProblems[i][0];
            var points = this.gradedProblems[i][1];
            problemCell.appendChild(document.createTextNode(problemNumber));
            var weightCell = weightsRow.insertCell(-1);
            weightCell.style.textAlign = "center";
            weightCell.style.fontSize = "small";
            weightCell.appendChild(document.createTextNode(points));
            totalPoints += points;
            var note = this.gradedProblems[i][2] || "";
            if (note != "") {
            	hasNotes = true;
                notesCell.appendChild(document.createTextNode(problemNumber + ": "));
                if (typeof note === "string") {
                	notesCell.appendChild(document.createTextNode(note));
                } else {
                	//I'm assuming that notes is a Node here.
                	notesCell.appendChild(note);
                }
                notesCell.appendChild(document.createElement("br"));
            }
        }
        if (!hasNotes) {
        	problemsTable.deleteRow(3);
        }
        pointWeightsWordCell.appendChild(document.createTextNode(totalPoints));
        return problemsTable;
    }

}); //end of ChapterProblems definitions

/****************<<Final>>********************/

/**
 * Definition of the Final class.
 */
var Final = Class.create(Assignment, {

    /**
     * Creates the lab.
     */
    initialize: function($super, title) {
        $super();
        this.type = Offering.prototype.FINAL;
        this.title = title;
        this.descriptionNodes = new Array();
    }

    /**
     * Adds to the description of this project.
     */
    ,addDescriptionNode: function(node) {
        this.descriptionNodes.push(node);
    }

    ,/**
      * Returns a Node with the stats of this project. (Language, team size, due date, etc.)
      */
    getStatsNode: function(assignDate, dueDate) {
        var statsNode = document.createDocumentFragment();
        var stats = document.createElement("p");
        statsNode.appendChild(stats);
        stats.style.textAlign = "left";
        stats.style.fontSize = "large";
        stats.style.fontWeight = "bold";
        stats.appendChild(document.createTextNode("Assigned: " + assignDate.toDateString()));
        stats.appendChild(document.createElement("br"));
        stats.appendChild(document.createTextNode("Due: " + dueDate.toLocaleTimeString() + " on " + dueDate.toDateString()));
        return statsNode;
    }

    ,/**
     * Creates the page for a lab.
     */
    toNode: function(projectNumber, assignDate, dueDate) {

        //the project description will go in this
        var specsDiv = document.createElement("div");
        specsDiv.style.textAlign = "left";

        //add the header
        var headingLine = document.createElement("p");
        headingLine.style.textAlign = "center";
        headingLine.style.fontWeight = "bold";
        headingLine.style.fontSize = "xx-large";
        headingLine.appendChild(document.createTextNode("Project " + projectNumber + ":"));
        headingLine.appendChild(document.createElement("br"));
        headingLine.appendChild(document.createTextNode(this.title));
        specsDiv.appendChild(headingLine);

        //add the basic stats.
        specsDiv.appendChild(document.createElement("br"));
        specsDiv.appendChild(this.getStatsNode(assignDate, dueDate));


        //add the contents
        for (var i = 0; i < this.descriptionNodes.length; i++) {
            specsDiv.appendChild(document.createElement("br"));
            specsDiv.appendChild(this.descriptionNodes[i]);
        }

        return specsDiv;
    }

}); //end of the Final class definition

/********************************CV Stuff********************************************/

/**
 * A section of a CV.
 ************<<CvSection>>*********
 */
var CvSection = Class.create({

    /**
     * Creates a CvSection.
     * title: string title of the section.
     * contents: Element representing the things inside the section.
     */
    initialize: function(title, contents) {
        this.title = title;
        this.contents = contents;
        this.isPrivate = false; //for private info such as address/social/telephone info
        this.forPlyState = true; //whether this is for Plymouth State CV
        this.forShort = true; //whether this is for the short version (common for sharing)
    }

    /**
     * toNode
     * revealPrivateInfo: boolean indicating whether to reveal private things.
     */
    ,toNode: function(revealPrivateInfo, adminVersion, shortVersion) {
        //normalize undefined parameters
        if (revealPrivateInfo == undefined) revealPrivateInfo = false;
        if (adminVersion == undefined) adminVersion = false;
        if (shortVersion == undefined) shortVersion = false;

        //create the node
        if (this.isPrivate && !revealPrivateInfo) {
            //this is private and I'm not supposed to reveal it here.
            return document.createDocumentFragment();
        } else if (adminVersion && !this.forPlyState) {
            //this is not to be included in the Plymouth State administrative version.
            return document.createDocumentFragment();
        } else if (shortVersion && !this.forShort) {
            //this is not to be included in the short version
            return document.createDocumentFragment();
        } else {
            //create the title piece
            var titleSpan = document.createElement("span");
            appendChildrenTo(titleSpan, [this.title, ": "]);

            //put it all together.
            var node = document.createElement("div");
            appendChildrenTo(node, [titleSpan, toNode(this.contents)]);
            node.style.marginBottom = "10px";
            return node;
        }
    }

    /**
     * Sets the privacy of this section.
     */
    ,setPrivate: function(isPrivate) {
        this.isPrivate = isPrivate;
    }

    /**
     * Sets whether this is for administrative use.
     */
    ,setForPlyStateAdmin: function(forAdmin) {
        this.forPlyState = forAdmin;
    }

    /**
     * Sets whether this is for the short version.
     */
    ,setForShort: function(forShort) {
        this.forShort = forShort;
    }


}); //end of CVSection

/**
 * A section of a CV containing a list of things.  If the list is empty, it doesn't display.
 ************************CvSectionList**************
 */
var CvSectionList = Class.create(CvSection, {

    /**
     * Creates a CvSectionList
     * title: string title.
     * elements: list of elements to include in the list.  Can alternatively add them later.
     */
    initialize: function($super, title, elements) {
        $super(title.toUpperCase(), createList(false, []));
        this.length = 0;
        elements = elements || [];
        for (var i = 0; i < elements.length; i++) {
            this.addElement(elements[i]);
        }
    }

    /**
     * toNode()
     */
    ,toNode: function($super, revealPrivateInfo, adminVersion, shortVersion) {
        if (this.length == 0) {
            return document.createDocumentFragment();
        } else {
            return $super(revealPrivateInfo, adminVersion, shortVersion); // this or just $super?
        }
    }

    /**
     * Adds a new element to the list.
     * element: an HTMLElement, not a ListItem.
     */
    ,addElement: function(element) {
        var listItem = createElementWithChildren("li", [toNode(element)]);
        this.length++;
        appendChildrenTo(this.contents, [listItem]);
    }

}); //end of CvSectionList

/**
 * CV Definition.
 ***********<<CV>>*****************
 */
var CV = Class.create({

    /**
     * Creates a CV.
     */
    initialize: function() {
        this.name = "";
        this.position = "";
        this.homeAddress = "";
        this.officePhone = "";
        this.homePhone = "";
        this.degrees = [];
        this.priorJobs = [];
        this.teachingInterests = [];
        this.researchInterests = [];
        this.coursesTaught = [];
        this.academicMedia = [[], [], []];
        this.refereedWork = [];
        this.preprints = [];
        this.unrefereedWork = [];
        this.fundedProjects = [];
        this.honorsAndAwards = [];
        this.consultingGigs = [];
        this.professionalMemberships = [];
        this.otherProfessionalActivities = [];
        this.professionalDevelopmentActivities = [];
        this.inHouseServiceActivities = [];
        this.outreachActivities = [];
        this.studentProjects = [];
    }

    ,/**
     * Sets the name.
     */
    setName: function(name) {
        this.name = name;
    }

    ,/**
     * Sets the name of the position.
     */
    setPosition: function(position) {
        this.position = position;
    }

    ,/**
     * Sets the home address for this person.
     */
    setHomeAddress: function(address) {
        this.homeAddress = address;
    }

    ,/**
     * Sets the office phone number as a string.
     */
    setOfficePhone: function(phone) {
        this.officePhone = phone;
    }

    ,/**
     * Sets the home phone number as a string.
     */
    setHomePhone: function(phone) {
        this.homePhone = phone;
    }

    ,/**
     * Adds a degree.
     */
    addDegree: function(credential, discipline, year, institution) {
        this.degrees.push([credential, discipline, year, institution]);
    }

    ,/**
     * Adds a job.
     */
    addJob: function(title, institution, startMonthIndex, startYear, endMonthIndex, endYear) {
        this.priorJobs.push([title, institution, startMonthIndex, startYear, endMonthIndex, endYear]);
    }

    ,/**
     * Adds a teaching interest.
     */
    addTeachingInterest: function(interest) {
        this.teachingInterests.push(interest);
    }

    ,/**
     * Adds a research interest.
     */
    addResearchInterest: function(interest) {
        this.researchInterests.push(interest);
    }

    ,/**
     * Adds a course I've taught.
     */
    addCourseTaught: function(course) {
        this.coursesTaught.push(course);
    }

    ,/**
     * Adds a scholarly work. TODO: deprecating this.
     */
    addWork: function(isRefereed, media) {
        var refereed = isRefereed ? CV.prototype.REFEREED : CV.prototype.NON_REFEREED;
        this.academicMedia[refereed].push(media);
    }

    ,/**
     * Adds a future work.
     */
    addPrepublication: function(media) {
        //this.academicMedia[CV.prototype.PREPUBLICATION].push(media);
        this.preprints.push(media);
    }

    ,/**
     * Adds a refereed work.
     */
    addRefereedWork: function(work) {
        //this.addWork(true, media);
        this.refereedWork.push(work);
    }

    ,/**
     * Adds a non-refereed work.
     */
    addNonRefereedWork: function(work) {
        //this.addWork(false, media);
        this.unrefereedWork.push(work);
    }

    ,/**
     * Adds a funded project.
     */
    addFundedProject: function(project) {
        this.fundedProjects.push(project);
    }

    /**
     * Adds an honor or award.
     * award: the name of the award
     * awarder: element
     */
    ,addHonorOrAward: function(award, awarder, year) {
        //this.honorsAndAwards.push([award, awarder]);
        var awardNode = toNode(award);
        awardNode.style.fontStyle = "italic";
        this.honorsAndAwards.push(createElementWithChildren("span", [awardNode, ", " + year + ", from ", awarder, "."]));
    }

    ,/**
     * Adds a consulting gig.
     */
    addConsultingJob: function(job) {
        this.consultingGigs.push(job);
    }

    ,/**
     * Adds a professional membership.
     */
    addProfessionalMembership: function(group, duration) {
        this.professionalMemberships.push([group, duration]);
    }

    ,/**
     * Adds a professional activity/service that doesn't fall into other categories
     */
    addOtherProfessionalActivity: function(activity) {
        this.otherProfessionalActivities.push(activity);
    }

    ,/**
     * Adds a professional development activity
     */
    addProfessionalDevelopmentActivity: function(activity) {
        this.professionalDevelopmentActivities.push(activity);
    }

    ,/**
     * Adds a service activity for the department or school
     */
    addInHouseServiceActivity: function(activity) {
        this.inHouseServiceActivities.push(activity);
    }

    ,/**
     * Adds an outreach activity.
     */
    addOutreachActivity: function(activity) {
        this.outreachActivities.push(activity);
    }

    ,/**
     * Adds an supervised student project.
     */
    addStudentProject: function(projectName) {
        this.studentProjects.push(projectName);
    }

    ,/**
     * Returns the contents of this CV as a node.
     */
    toNode: function(forAdmin, simplified) {
        //false is default value for simplified
        if (simplified == undefined) {
            simplified = false;
        }
        var revealPrivateInfo = forAdmin;

        var cvDiv = document.createElement("div");
        cvDiv.style.textAlign = "left";

        //Title
        var title = createElementWithChildren("h1", ["Curriculum Vitae"]);
        title.style.textAlign = "center";
        cvDiv.appendChild(title);

        //Date
        var dateSection = new CvSection("Date", new Date().toDateString()).toNode();
        dateSection.style.cssFloat = "right";
        cvDiv.appendChild(dateSection); //this is not listed in the other sections because we need to generate the toNode ahead of time.

        var cvSections = [];

        //Name & position
        cvSections.push(new CvSection("Name", this.name));
        cvSections.push(new CvSection("Position", this.position));

        //Home address
        /*
        if (forAdmin && !simplified) {
            var paragraph = document.createElement("p");
            cvDiv.appendChild(paragraph);
            paragraph.appendChild(toNode("Home address: "));
            paragraph.appendChild(toNode(this.homeAddress));
        }
        */
        var homeAddressSection = new CvSection("Home Address", this.homeAddress);
        homeAddressSection.setPrivate(true);
        cvSections.push(homeAddressSection);

        //telephones
        /*
        if (forAdmin && !simplified) {
            var paragraph = document.createElement("p");
            cvDiv.appendChild(paragraph);
            paragraph.appendChild(toNode("Telephone (Office): "));
            paragraph.appendChild(toNode(this.officePhone));
            paragraph.appendChild(document.createElement("br"));
            paragraph.appendChild(toNode(getSpaces(17) + " (Home): "));
            paragraph.appendChild(toNode(this.homePhone));
        }*/
        var phonesText = document.createElement("span");
        appendChildrenTo(phonesText, ["(Office): ", this.officePhone, document.createElement("br"), getSpaces(18) + " (Home): ", this.homePhone]);
        var telephonesSection = new CvSection("Telephone", phonesText);
        telephonesSection.setPrivate(true);
        cvSections.push(telephonesSection);

        //education
        var educationSection = new CvSectionList("Education");
        for (var i = 0; i < this.degrees.length; i++) {
            var degree = this.degrees[i];
            educationSection.addElement(toNode("Degree: " + degree[0] + " Year: " + degree[2] + ".  Institution: " + degree[3] + ".  Area of: " + degree[1]));
        }
        cvSections.push(educationSection);

        //prior work experience
        var workSection = new CvSectionList("Work Experience");
        for (var i = 0; i < this.priorJobs.length; i++) {
            var job = this.priorJobs[i];
            workSection.addElement(toNode(job[2] + "/" + job[3] + " - " + job[4] + "/" + job[5] + ": " + job[0] + ", " + job[1]));
        }
        cvSections.push(workSection);

        //teaching
        cvSections.push(new CvSectionList("Teaching Areas/Interests", this.teachingInterests));

        //courses taught
        /*  Who needs this?  No one cares!
        var coursesTaughtSection = new CvSectionList("Courses Taught", this.coursesTaught);
        coursesTaughtSection.setForPlyStateAdmin(false);
        coursesTaughtSection.setForShortVersion(false);
        cvSections.push(coursesTaughtSection);
        */

        //research
        cvSections.push(new CvSectionList("Research Areas/Interests", this.researchInterests));

        //publications
        cvSections.push(new CvSectionList("Refereed (Juried) Publications/Exhibitions/Performances", this.refereedWork));

        //preprints
        var preprints = new CvSectionList("Pre-publications", this.preprints);
        preprints.setForPlyStateAdmin(false);
        cvSections.push(preprints);

        //presentations
        var presentations = new CvSectionList("Non-refereed (non-juried) Presentations", this.unrefereedWork);
        presentations.setForShort(false);
        cvSections.push(presentations);

        //funded projects
        cvSections.push(new CvSectionList("Funded Projects", this.fundedProjects));

        //honors and awards
        cvSections.push(new CvSectionList("Honors and Awards", this.honorsAndAwards));

        //consulting jobs
        cvSections.push(new CvSectionList("Consulting", this.consultingGigs));

        //memberships
        cvSections.push(new CvSectionList("Professional Association Membership and Participation", this.professionalMemberships));

        //other professional stuffz
        cvSections.push(new CvSectionList("Other Professional Activity/Service", this.otherProfessionalActivities));

        //professional dev.
        cvSections.push(new CvSectionList("Professional Development Activities", this.professionalDevelopmentActivities));

        //in-house service
        cvSections.push(new CvSectionList("Department/College Service", this.inHouseServiceActivities));

        //outreach
        cvSections.push(new CvSectionList("Outreach", this.outreachActivities));


        //add all the sections to the CV
        //var cvSections = [nameSection, positionSection, homeAddressSection, telephonesSection, educationSection, workSection, teachingInterestsSection]
        for (var i = 0; i < cvSections.length; i++) {
            var section = cvSections[i];
            cvDiv.appendChild(section.toNode(revealPrivateInfo, forAdmin, simplified));
        }

        /**/

        //return the div
        return cvDiv;
    }

    ,/**
      * Resets the entire page.
      */
    resetPage: function() {
        document.title = this.name + " CV";
        document.body.innerHTML = "";
    }

    ,/**
     * Sets the entire page to be a web-formatted CV without private personal information.
     */
    getNormalCVPage: function(hasToAdminButton) {
        if (hasToAdminButton == undefined) {
            hasToAdminButton = false;
        }
        this.resetPage();
        document.body.appendChild(this.toNode(false));
        if (hasToAdminButton) {
            var toAdminButton = document.createElement("button");
            var self = this;
            toAdminButton.onclick = function() { self.getAdministrativeCVPage();}
            toAdminButton.appendChild(toNode("To Administrative Version"));
            toAdminButton.style.textAlign = "center";
            document.body.appendChild(toAdminButton);
        }

        //add the button to change to the streamlined version.  I should probably use a different boolean here.
        if (hasToAdminButton) {
            var toSimplifiedButton = document.createElement("button");
            var self = this;
            toSimplifiedButton.onclick = function() {
                self.getSimplifiedCVPage(true);
            }
            toSimplifiedButton.appendChild(toNode("To Simplified Version"));
            toSimplifiedButton.style.textAlign = "center";
            document.body.appendChild(toSimplifiedButton);
        }

        //this button just removes the other buttons
        if (hasToAdminButton) {
            var removeButtonsButton = document.createElement("button");
            var self = this;
            removeButtonsButton.onclick = function() {
                self.getNormalCVPage(false);
            }
            removeButtonsButton.appendChild(toNode("Just Remove The Buttons"));
            removeButtonsButton.style.textAlign = "center";
            document.body.appendChild(removeButtonsButton);
        }
    }

    ,/**
      * Sets the entire page to be more like a publication list-type CV.
      */
    getSimplifiedCVPage: function(keepLinks) {
        if (keepLinks == undefined) {
            keepLinks = true;
        }
        this.resetPage();
        document.body.appendChild(this.toNode(false, true));
        if (!keepLinks) {
            removeLinksFrom(document.body);
        }
    }

    ,/**
      * Sets the entire page to be the CV appropriate for PSU administration.
      */
    getAdministrativeCVPage: function() {
        this.resetPage();
        document.body.appendChild(this.toNode(true, false));
        removeLinksFrom(document.body);
    }
});
CV.prototype.REFEREED = 0;
CV.prototype.PREPUBLICATION = 1;
CV.prototype.NON_REFEREED = 2;

//end of CV definitions


/************<<AcademicMedia>>*****************
 * A scholarly work (e.g. a paper, talk, etc).
 */
var AcademicMedia = Class.create({

    /**
     * Initialize!
     */
    initialize: function(title, url) {
        this.title = title;
        this.url = url; //leave undefined if not given
        this.extraLinks = [];
    }

    ,/**
     * Adds an extra link (for arXiv, etc).
     */
    addExtraLink: function(text, url) {
        this.extraLinks.push([text, url]);
    }

    ,/**
      * Returns whether this is a paper.
      */
    isPaper: function() {
        return false;
    }

    ,/**
      * Gets the element with the extra links.
      */
    createExtraLinksNode: function() {
        //a hack to get my CVs to work
        return document.createDocumentFragment();

        //the old code
        /*
        var node = document.createDocumentFragment();
        if (this.extraLinks.length > 0) {
            node.appendChild(toNode("("));
            for (var i = 0; i < this.extraLinks.length; i++) {
                node.appendChild(toNode(this.extraLinks[i]));
                if (i < this.extraLinks.length - 1) {
                    node.appendChild(toNode(", "));
                }
            }
            node.appendChild(toNode(")"));
        }
        return node;
        */
    }


    //no toNode because this should be abstract

}); //end of AcademicMedia


/************<<AcademicPreprint>>*****************
 * Preprint of a submitted academic paper.
 */
var AcademicPreprint = Class.create(AcademicMedia, {
    /**
     * Initialize!
     */
    initialize: function($super, title, authors, arxivUrl) {
        $super(title, arxivUrl);
        this.authors = authors;
        this.status = undefined;
    }

    ,/**
      * Returns that this is a paper.
      */
    isPaper: function() {
        return true;
    }

    ,/**
      * Adds a status to the work.
      */
    setStatus: function(statusNode) {
        this.status = statusNode;
    }

    ,/**
      * Returns a node version of this.
      */
    toNode: function() {
        var node = document.createDocumentFragment();

        //title
        var titleNode = createTextLink(this.title, this.url);
        node.appendChild(titleNode);
        titleNode.style.fontStyle = "italic";
        node.appendChild(toNode(". "));

        //authors
        for (var i = 0; i < this.authors.length; i++) {
            node.appendChild(toNode(this.authors[i]));
            if (i < this.authors.length - 1) {
                    if (this.authors.length > 2) {
                        node.appendChild(toNode(","));
                    }
                    node.appendChild(toNode(" "));
                if (i == this.authors.length - 2) {
                    node.appendChild(toNode("and "));
                }
            }
        }
        node.appendChild(toNode(". "));

        //extra links
        node.appendChild(this.createExtraLinksNode());

        //status
        if (this.status != undefined) {
            appendChildrenTo(node, ["  (Status: ", this.status, ")"]);
        }

        return node;
    }

}); //end of AcademicPreprint


/************<<AcademicPublication>>*****************
 * A Scholarly Publication.
 */
var AcademicPublication = Class.create(AcademicMedia, {
    /**
     * Initialize!
     */
    initialize: function($super, title, authors, publisher, articleLocation, doiUrl) {
        $super(title, doiUrl);
        this.authors = authors;
        this.publisher = publisher;
        this.articleLocation = articleLocation;
    }

    ,/**
      * Returns that this is a paper.
      */
    isPaper: function() {
        return true;
    }

    ,/**
      * Returns a node version of this.
      */
    toNode: function() {
        var node = document.createDocumentFragment();

        //title
        var titleNode = createTextLink(this.title, this.url);
        node.appendChild(titleNode);
        titleNode.style.fontStyle = "italic";
        node.appendChild(toNode(". "));

        //authors
        for (var i = 0; i < this.authors.length; i++) {
            node.appendChild(toNode(this.authors[i]));
            if (i < this.authors.length - 1) {
                    if (this.authors.length > 2) {
                        node.appendChild(toNode(","));
                    }
                    node.appendChild(toNode(" "));
                if (i == this.authors.length - 2) {
                    node.appendChild(toNode("and "));
                }
            }
        }
        node.appendChild(toNode(". "));

        //publishing info
        node.appendChild(toNode(this.publisher));
        node.appendChild(toNode(" "));
        node.appendChild(toNode(this.articleLocation));
        node.appendChild(toNode(". "));

        //extra links
        node.appendChild(this.createExtraLinksNode());

        return node;
    }
}); //end of AcademicPublication


/************<<AcademicPresentation>>*****************
 * A Scholarly Presentation.
 */
var AcademicPresentation = Class.create(AcademicMedia, {
    /**
     * Initialize!
     */
    initialize: function($super, dateString, title, coPresenters, hostEvent, url) {
        $super(title, url);
        this.dateString = dateString;
        this.coPresenters = coPresenters;
        this.hostEvent = hostEvent;
    }

    ,/**
     * Returns a node version of this.
     */
    toNode: function() {
        var node = document.createDocumentFragment();

        //title
        var titleNode = createTextLink(this.title, this.url);
        node.appendChild(titleNode);
        titleNode.style.fontStyle = "italic";

        //details
        node.appendChild(toNode(". Presented "));
        node.appendChild(toNode(this.dateString));
        node.appendChild(toNode(" at "));
        node.appendChild(toNode(this.hostEvent));
        if (this.coPresenters.length > 0) {
            node.appendChild(toNode(" with "));
            for (var i = 0; i < this.coPresenters.length; i++) {
                node.appendChild(toNode(this.coPresenters[i]));
                if (i < this.coPresenters.length - 1) {
                    if (this.coPresenters.length > 2) {
                        node.appendChild(toNode(","));
                    }
                    node.appendChild(toNode(" "));
                    if (i == this.coPresenters.length - 2) {
                        node.appendChild(toNode("and "));
                    }
                }
            }
        }
        node.appendChild(toNode(". "));

        //extra links
        node.appendChild(this.createExtraLinksNode());

        return node;
    }

}); //end of AcademicPresentation


/*************<<OpenProblem>>***************
 * An academic question.
 */
var OpenProblem = Class.create({

    /**
     * Initialize!
     * Usage: new OpenProblem("Are games awesome?", "Exactly how awesome is every game?", [tagA, tagB, ...], [proposerA, proposerB, ...], createDate(day, month, year), "Proposed by Captain Monkeyface in No Chance Games", "https://monkeyface.com/nochancegames")
     * Parameters:
     * title: Brief name of the problem.  Must be unique!
     * problemText: String ... maybe in MathJax?
     * tags: String with no spaces, to use with anchor tags.  Must be unique.
     * proposers - array of Human objects, those who proposed the problem
     * dateProposed - Date when the problem was proposed.
     * sourceText - Description of how/when/where this was conceived.
     * sourceUrl - Link of the source of this, if it exists.
     */
    initialize: function(title, problemText, tags, proposers, dateProposed, sourceText, sourceUrl) {
        this.title = title;
        this.problemText = problemText;
        this.id = this.title.replace(" ", "").replace("\t", "").replace("\n", "");
        this.tags = tags;
        this.proposers = proposers; //TODO: copy over to avoid aliasing
        this.date = dateProposed;
        if (sourceText == undefined) {
            this.sourceElement = "";
        } else {
            this.sourceElement = new MaybeLink("Source: " + sourceText, sourceUrl);
        }
    }

    /**
     * Returns whether this is still open.
     */
    ,isOpen: function() {
        return true;
    }

    /**
     * Returns whether this has a tag.
     */
    ,hasTag: function(tag) {
        return this.tags.indexOf(tag) > -1;
    }

    /**
     * Returns a list of tag links, with spaces in between.
     */
    ,getTagLinks: function() {
        var links = [];
        for (var i = 0; i < this.tags.length; i++) {
            var tag = this.tags[i];
            links.push(createLink(tag, HOME + "OpenCGTProblems.php?tag=" + tag));
            links.push(" ");
        }
        return links;
    }

    /**
     * Returns a Node version of this.
     */
    ,toNode: function() {
        var titleNode = createElementWithChildren("h3", ["Open: ", this.title]);
        var anchor = document.createElement("a");
        anchor.href = "#" + this.id;
        var text = createElementWithChildren("p", [this.problemText]);

        //the source section
        var proposedBy = createElementWithChildren("p", ["Proposed by: "]);
        appendChildrenTo(proposedBy, this.proposers);
        appendChildrenTo(proposedBy,[", ", this.date.toLocaleDateString(), ".  ", this.sourceElement]);
        proposedBy.style.fontSize = "small";

        //permalink and tags row
        var extras = createElementWithChildren("p", [createLink("Permalink", HOME + "OpenCGTProblems.php#" + this.id), " | Tags: "]);
        appendChildrenTo(extras, this.getTagLinks());
        extras.style.fontSize = "small";



        var div = createElementWithChildren("div", [anchor, titleNode, text, proposedBy, extras]);
        return div;
    }

});

//use as a comparator for sorting lists of conferences
function compareOpenProblems(problemA, problemB) {
    if (problemA.date < problemB.date) {
        return -1;
    } else {
        return 1;
    }
}

//returns a pair of lists [stillOpen, solved]
function getOpenCGTProblems() {
    var problems = [];

    problems.push(new OpenProblem("Subtraction Games", "{\sc Subtraction games} with finite subtraction sets are known to have periodic nim-sequences. Investigate the relationship between the subtraction set and the length and structure of the period. The same question can be asked about {\bf partizan} subtraction games, in which each player is assigned an individual subtraction set. See Fraenkel \& Kotzig [1987].", ["subtraction games", "nim sequences", "periods"], [new Human("???")], createDate(1, 0, 1985), "Describes finding a polynomial-time algorithm as the \"IMPOSSIBLE DREAM\".", "http://www.math.rutgers.edu/~zeilberg/mamarim/mamarimPDF/chomp.pdf"));

    problems.push(new OpenProblem("Hardness of Chomp", "What is the computational hardness of the game Chomp?", ["chomp", "hardness"], [new Human("Doron Zeilberger")], createDate(5, 8, 2000), "Describes finding a polynomial-time algorithm as the \"IMPOSSIBLE DREAM\".", "http://www.math.rutgers.edu/~zeilberg/mamarim/mamarimPDF/chomp.pdf"));

    //filter by the tag
    var tag = getParameterByName("tag", "belugaMonkey");

    if (tag != "belugaMonkey") {
        var hasTag = []; //new array to put all the problems with matching tags into
        for (var i = 0; i < problems.length; i++) {
            var problem = problems[i];
            if (problem.hasTag(tag)) {
                hasTag.push(problem);
            }
        }
        problems = hasTag; //reset the problems array to only those with the tag
    }


    var stillOpen = [];
    var solved = [];

    for (var i = 0; i < problems.length; i++) {
        var problem = problems[i];
        if (problem.isOpen()) {
            stillOpen.push(problem);
        } else {
            solved.push(problem);
        }
    }

    stillOpen.sort(compareOpenProblems);

    solved.sort(compareOpenProblems);

    return [stillOpen, solved];
}

//end of OpenProblem class and utilities


/************<<Conference>>*****************
 * An academic meeting.
 */
var Conference = Class.create({

    /**
     * Initialize!
     * Usage: new Conference("Games at Dal", createDate(day, month, year), 3, "http://gamesAtDal.com");
     * title: name of the conference
     * beginDate: date the conference starts
     * numDays: the total number of days in the conference (inclusive)
     * url: website string of the conference
     */
    initialize: function(title, beginDate, numDays, url) {
        this.titlePart = new MaybeLink(title, url);
        this.beginDate = beginDate;
        this.endDate = addDays(this.beginDate, numDays-1);
    }

    /**
     * Returns whether this is happening now.
     */
    ,isCurrent: function() {
        var now = new Date();
        return this.beginDate <= now && now <= this.endDate;
    }

    /**
     * Returns whether this has already happened.
     */
    ,isPast: function() {
        var now = new Date();
        return this.endDate < now;
    }

    /**
     * Returns whether this will happen in the future.
     */
    ,inFuture: function() {
        var now = new Date();
        return now < this.beginDate;
    }

    /**
     * Returns a node for this.
     */
    ,toNode: function() {
        var node = createElementWithChildren("span", [this.titlePart, ": ", dateSpanString(this.beginDate, this.endDate)]);
        return node;
    }


});

//use as a comparator for sorting lists of conferences
function compareConferences(conferenceA, conferenceB) {
    if (conferenceA.beginDate < conferenceB.beginDate) {
        return -1;
    } else {
        return 1;
    }
}

//generates three lists of conferences from one based on when they occur
function toTemporalArrays(conferences) {
    //correctly sort the conferences
    var future = [];
    var past = [];
    var present = [];
    for (var i = 0; i < conferences.length; i++) {
        var conference = conferences[i];
        if (conference.isPast()) {
            past.push(conference);
        } else if (conference.isCurrent()) {
            present.push(conference);
        } else if (conference.inFuture()) {
            future.push(conference);
        }
    }
    //put the lists in the order we want
    future.sort(compareConferences);
    future.reverse();
    past.sort(compareConferences);
    past.reverse();
    present.sort(compareConferences);
    present.reverse();
    return [future, present, past];
}

//gets all the CGT conferences I know about
function getCGTConferences() {
    var events = [];
    //CGTC
    events.push(new Conference("CGTC IV", createDate(18, 0, 2021), 3, "http://cgtc.eu/4/"));
    events.push(new Conference("CGTC III", createDate(22, 0, 2019), 3, "http://cgtc.eu/3/"));
    events.push(new Conference("CGTC II", createDate(25, 0, 2017), 3, "http://cgtc.eu/2/"));
    events.push(new Conference("CGTC I", createDate(21, 0, 2015), 3, "http://cgtc.eu/1/"));

    //Sprouts
    events.push(new Conference("Sprouts 2020", createDate(24, 3, 2020), 2, HOME + "sprouts/sprouts2020/"));
    events.push(new Conference("Sprouts 2019", createDate(5, 3, 2019), 1, HOME + "sprouts/sprouts2019/"));
    events.push(new Conference("Sprouts 2018", createDate(13, 3, 2018), 2, HOME + "sprouts/sprouts2018/"));
    events.push(new Conference("Sprouts 2017", createDate(29, 3, 2017), 1, HOME + "sprouts/sprouts2017/"));

    //Games at Dal
    events.push(new Conference("Games at Dal 2016", createDate(10, 7, 2016), 4, "http://mathstat.dal.ca/~rjn/Games_Dal_2016/index.html"));
    events.push(new Conference("Games at Dal 2015", createDate(11, 7, 2015), 4));

    //Capital Games
    events.push(new Conference("Capital Games 2020", createDate(9, 5, 2020), 2));


    //Lyon
    events.push(new Conference("Games and Graphs Workshop", createDate(23, 9, 2017), 3, "http://liris.cnrs.fr/~gag/FCGW/index.html"));

    //Fundy and Games
    events.push(new Conference("Fundy and Games", createDate(17, 6, 2017), 3, "http://www2.unb.ca/~nmckay/fundyandgames/"));

    //Games@Carmel
    events.push(new Conference("Games@Carmel", createDate(14, 4, 2018), 4, "http://urbanlarsson.mine.nu/homepagestuff/gamesatcarmel/gamesatcarmel.html"));

    //CMS
    events.push(new Conference("CMS Summer 2020 Session", createDate(5, 5, 2020), 4, "https://summer20.cms.math.ca/index.php/sessions/"));
    events.push(new Conference("CMS Summer 2018 Session", createDate(1, 5, 2018), 4, "https://cms.math.ca/Events/summer18/sessions_scientific#cgt"));
    events.push(new Conference("CMS Summer 2015 Session", createDate(6, 5, 2015), 1, "https://cms.math.ca/Events/summer15/sessions_scientific#gpg"));
    events.push(new Conference("CMS Summer 2013 Session", createDate(5, 5, 2013), 1, "http://cms.math.ca/Events/summer13/sessions_scientific#cgt"));

    //BIRS
    events.push(new Conference("BIRS 2011", createDate(9, 0, 2011), 5, "http://www.birs.ca/events/2011/5-day-workshops/11w5073"));
    events.push(new Conference("BIRS 2008", createDate(20, 0, 2008), 5, "http://www.birs.ca/events/2008/5-day-workshops/08w5075"));
    events.push(new Conference("BIRS 2005", createDate(18, 5, 2005), 5, "http://www.birs.ca/events/2005/5-day-workshops/05w5048"));

    //MSRI
    events.push(new Conference("Berlekamp Memorial Workshop", createDate(21, 9, 2019), 2, "https://www.msri.org/workshops/948"));
    events.push(new Conference("MSRI 2015", createDate(1, 10, 2015), 2, "https://www.msri.org/workshops/799"));
    events.push(new Conference("MSRI 2000", createDate(24, 6, 2000), 5, "https://www.msri.org/workshops/104"));

    //INTEGERS
    events.push(new Conference("Integers 2018", createDate(3, 9, 2018), 4, "https://sites.google.com/a/westga.edu/integersconference2018/"));
    events.push(new Conference("Integers 2013", createDate(24, 9, 2013), 4, "http://www.westga.edu/~math/IntegersConference2013/"));
    events.push(new Conference("Integers 2011", createDate(26, 9, 2011), 4, "http://www.westga.edu/~math/IntegersConference2011/index.html"));
    events.push(new Conference("Integers 2009", createDate(14, 9, 2009), 4, "http://www.westga.edu/~math/IntegersConference2009/index.html"));
    events.push(new Conference("Integers 2007", createDate(24, 9, 2007), 4, "http://www.westga.edu/~math/IntegersConference2007/index.html"));

    //TRUe Games
    events.push(new Conference("TRUe Games", createDate(6, 4, 2014), 4, "http://www.tru.ca/truegames.html"));

    return events;
}

//end of Conference class and utilities


/**********Constants for People and Events!*********************/


//~~~~~~~~~~~~~~~~~~~ Outside of all Classes ~~~~~~~~~~~~~~~~~~//


/**
 * Loads the page for a course or lab
 */
function loadOfferingPage() {
    var linkNumber = getParameterByName("link", -1);
    linkNumber = parseInt(linkNumber);
    if (linkNumber > -1) {
        offering.loadLinkPage(linkNumber);
        return;
    }
    var assignmentNumber = 'none';
    var assignmentType = 0;
    for (; assignmentType < Offering.prototype.assignmentTypes.length; assignmentType++) {
        var assignmentTypeName = Offering.prototype.assignmentTypes[assignmentType].toLowerCase();
        assignmentNumber = getParameterByName(assignmentTypeName, 'none');
        if (assignmentNumber != 'none') break;
    }
    if (assignmentNumber == 'none') {
        offering.generateMainPage();
    } else {
        offering.generateAssignmentPage(assignmentType, assignmentNumber);
    }
}

/**
 * Loads the info specific to the Colby Lab section.  After completing, this calls loadLabPage.
 */
function loadLabInfo() {
    var labNumber = getParameterByName('lab', 'none');
    var scriptLocation = getPublicFileLink(labNumber + "/labInfo.js");
    includeScript(scriptLocation, loadOfferingPage);
}

/**
 * Loads the data for the class, then writes the page.
 */
function loadCourseInfo() {
    var courseNumber = getParameterByName('course', 'none');
    var scriptLocation = getPublicFileLink(courseNumber + "/courseInfo.js");
    includeScript(scriptLocation, loadOfferingPage);
}

/**
 * Helper for the loadCourseInfo function.
 * This is for classes in the Spring of 2013 and later.
 */
function loadCourseInfoHelper() {
    var semesterInfoScript = document.createElement('script');
    semesterInfoScript.setAttribute('type', 'text/javascript');
    semesterInfoScript.setAttribute('src', getPublicFileLink("SemesterInfo.js"));
    document.getElementsByTagName('head')[0].appendChild(semesterInfoScript);
}

//TODO: remove this?
coursePoliciesHTMLString = "<a name=\"policies\"></a><b><font size=\"+1\">Class Policies:</font></b><br>\n" +
"<p><b>Keeping in touch:</b>  The most convenient way to get in touch with me is to send me an email.  I will often send email to the class and thus <b>I expect you to check your Wittenberg email</b>.  During class, I'll answer lots of your questions, but some administrative questions are better answered outside of class, and I may ask you to send me an email instead.  I am often available on many IM clients, but I don't keep records of these conversations; email is better for anything that's important!  If you send me an email and don't hear back within 24 \"business\" hours, <b>I will not be offended if you email me again</b>.  The best way to get help with assignments is in a face-to-face conversation, so please come stop by my office.  My basic schedule for this semester is available <a href = \"http://www4.wittenberg.edu/academics/mathcomp/kburke/schedule.html\">here</a>.  Naturally, if you have a question about class, then office hours are a great time to come by!  Even if it's not my office hours, if I'm around, my door is almost always open.  Outside my office, I keep a wheel that can tell you where I am and when I'll be back if I'm not there.  Once you are in touch with me, it is perfectly fine to call me \"Kyle\".</p>" +
"<p><b>Submitting Programming Assignments:</b>  Some classes are taught using Moodle.  For those classes, be sure to submit all your projects using Moodle's online tools.  If you can't submit a project via Moodle (and it's before the deadline) I probably set it up incorrectly.  Email me so I can fix it!  For other classes, you can email projects to me.</p>" +
"<p><b>Late Assignments:</b>  Assignments turned in after the due date suffer two penalties:</p> \n" +
"  <ul class=\"disc\">" +
"    <li>I will subtract 10 points from the total score for each weekday late, <it>rounded up</it>.  For example, if you turn in an assignment 4 minutes late, you will lose 10 points.  If you turn in an assignment 26 hours late, you will lose 20 points. </li> \n" +
"    <li>I do my best to grade assignments directly after they are due.  It is much easier to do them at once instead of one at a time.  If you don't turn yours in before I grade the rest, I might not be able to come back to your single assignment for a while.  I cannot guarantee how long it will be before I return yours.  <b>This is generally a worse penalty than missing a few points!</b>  Feedback from your assignment is useful to complete the following assignments.</li></ul>\n" +
"<p><i>Important</i>: I do not accept late assignments turned in after the last day of classes.  Be sure to get all assignments in by then!  Naturally, if you have a legitimate reason for turning in assignments late, I will definitely accomodate.</p>\n" +
"<p><b>Returning Graded Assignments:</b>  I will hand back graded (\"feedback-ed?\") assignments, exams and quizzes in class as soon as they are graded.  If you miss class when I hand something back, just remind me in class or in my office and I'll give them to you.</p>\n" +
"<p><b>Grades:</b>  I try to keep my grading methods as transparent as possible, but they sometimes get a bit complex.  If you are ever unsure how you are doing in the class, just ask me!  You can ask me as many times as you'd like!  Do not be afraid to ask!</p>" +
"<p><b>Academic Integrity:</b>  I've seen too many problems students have had when violations of the honor code are tolerated.  Thus, all of my courses will adhere strictly to the <a href=\"http://www5.wittenberg.edu/sites/default/files/media/honorcouncil/honorcode_0.pdf\">Wittenberg Code of Academic Integrity</a> and any infractions will be reported to the honor council.  Please take the time to read and understand the code, then review the following section: </p>" +
"<p><b>Collaborating with Others:</b> Assignments in math and computer science often consist of written homework and/or programming projects.  For other types of assignments (tests, papers, presentations, etc.) definitions of plagarism are fairly standard." +
"  <ul class=\"disc\">" +
"    <li>For <b>written homework</b>, you may talk to other students about assignments and potential solutions, but you must write up all your final answers individually.  As soon as you start writing up a solution, you should keep that work private from others.  You may explain general concepts , but it should be clear from what you submit that you worked through the final stages of the answer alone and did not copy from others.</li>" +
"    <li>For <b>programming projects</b>, the rules are similar to those above, except that some classes have group projects.  The basic rule is that you may not look at someone's project who is not in your group!  Although for most classes, it is completely acceptable to look at test runs of other code, it is <b>not okay</b> to view their source code.  (With the Python IDLE, this means it is acceptable to share examples from the interactive mode, but not to share from your script files.)  Any sharing of source code is considered plagarism!</li>" +
"    <li><b>Working within your group:</b> In most classes, it is assumed that you will be <a href = \"https://en.wikipedia.org/wiki/Pair_programming\">pair programming</a> with other members of your team.  Unless otherwise instructed, any actual programming for the project should be done with <b>all group members present</b>.  It is <b>not acceptable</b> to code parts of the project on your own, though it is okay to test cases of the program looking for bugs.</li>" +
"  </ul>Any violation of the above rules will be reported to the <a href=\"http://www5.wittenberg.edu/academics/academicintegrity/index.html\">honor council</a>.  If you're not sure about these rules, <b>please ask me</b>.  Naturally, if you or your group needs any additional assistance on a project or assignment, please come by my office or send me an email!  It is completely normal to be stuck on the same problem several times.</p>" +
"<p><b>Missing Class:</b> If you miss class, you are responsible for getting a hold of whatever notes and information you missed on that class.  If anything you missed is unclear, please get the notes and material from someone else in class and then come talk to me about the parts you're having trouble with.  " +
"  <ul class = \"disc\">" +
"    <li><b>Sudden Absences</b> (illness, family emergency, etc.): If possible, relax.  When you are able, please send me an email (or have a friend send me an email).  You do not need any more stress.  If you are sick, please do not wait until the end of your illness to get in touch.</li> " +
"    <li><b>Excusable Planed Absences</b> (academic travelling, sports, etc.): If you have an excusable reason, please let me know--via email--<b>at least two weeks</b> before you will be absent!  If you miss this deadline, I may not be able to excuse you from the class.  This is especially important if you might miss an in-class exam!  If you submit any assignments late, I <b>must</b> be able to find an email where I agreed to accept them late.  </li>" +
"    <li><b>Unexcused Absences</b>: If I record that you are absent for five or more class periods (four or more for Tuesday-Thursday courses; two or more for once-per-week classes) you will automatically fail the course.  Being late to class is considered an absence.  It is unlikely that you'll get a warning about this, so please pay attention to your absences." +
"  </ul></p>" +
"<p><b>Questions?</b>  Email me about them! :)</p>";

/** <<RubrikCategory>>~~~~~~~~~~~~~~~
 *
 * Represents a part of a grading rubrik; one type of assessment.
 */
var RubrikCategory = Class.create({

    //initialize a new category.
    initialize: function(name, percentage, description) {
        this.name = name;
        this.percentage = percentage;
        this.descriptionNode = toNode(description);
    },

    //Sets one row of the rubrik table to represent this.
    configureTableRow: function(row) {
        var nameCell = row.insertCell(-1);
        nameCell.style.textAlign = "left";
        nameCell.appendChild(document.createTextNode(this.name + ":"));
        var percentageCell = row.insertCell(-1);
        percentageCell.appendChild(document.createTextNode(this.percentage + "%"));
    },

    //gets a paragraph describing these assignments
    getDescriptiveParagraph: function() {
        var paragraph = document.createElement("p");
        paragraph.appendChild(document.createElement("b"));
        paragraph.lastChild.appendChild(document.createTextNode(this.name));
        paragraph.appendChild(document.createElement("div"));
        paragraph.lastChild.appendChild(this.descriptionNode);
        return paragraph;
    }
});

//description for Pop Quizzes
RubrikCategory.prototype.QUIZZES = function(percentage) {
    var quizDiv = document.createElement("div");
    var symposium = document.createElement("span");
    appendChildrenTo(symposium, ["Attend a poster ", createTextLink("symposium", "https://www.plymouth.edu/office/research-engagement/research/showcaseofexcellence/"), ", ask a question of one of the poster presenters, and ", createTextLink("fill out this form", getPublicFileLink("posterQuestionForm.pdf")), ".  (There are four copies of the form in the pdf, you only need to print one page out.  I have extra copies of the form if you don't want to print them out.)"]);
    appendChildrenTo(quizDiv, ["One-question quizzes will be given at the beginning of random classes.  These will be one-question true-false quizzes and students will be given less than five minutes to complete them.  Students can earn 'quiz drops' many ways: ", createList(false, ["Attend a seminar or talk that I also attend (in any department).", /*"Attend a meeting of the Technology Development Club.  (Maximum of 2 per course.)",*/ "Attend the senior project presentations at the end of the semester.", symposium]), "If you miss a quiz due to an excused absence, remind me after the next quiz you take.  I'll double-count that one to replace your missed quiz."]);
    return new RubrikCategory("Quizzes", percentage, quizDiv);
}




//description for Wittenberg quizzes
var descriptionNode = document.createElement("div");
descriptionNode.appendChild(document.createTextNode("Surprise ('pop') quizzes may be given at the beginning of class.  These will be one-question true-false quizzes and students will be given less than five minutes to complete them.  Students can earn 'quiz drops' many ways: "));
descriptionNode.appendChild(document.createElement("ul"));
descriptionNode.lastChild.setAttribute("class", "disc");
descriptionNode.lastChild.appendChild(document.createElement("li"));
descriptionNode.lastChild.lastChild.appendChild(document.createElement("b"));
descriptionNode.lastChild.lastChild.lastChild.appendChild(document.createTextNode("Attend a Colloquium"));
descriptionNode.lastChild.lastChild.appendChild(document.createTextNode(": Attending any seminar or talk that I also attend.  This is usually through our "));
descriptionNode.lastChild.lastChild.appendChild(createTextLinkTemp("http://www5.wittenberg.edu/academics/computerscience/colloquia.html", "SMACCM colloquium series"));
descriptionNode.lastChild.lastChild.appendChild(document.createTextNode("."));
descriptionNode.lastChild.appendChild(document.createElement("li"));
descriptionNode.lastChild.lastChild.appendChild(document.createElement("b"));
descriptionNode.lastChild.lastChild.lastChild.appendChild(document.createTextNode("Practice a Presentation"));
descriptionNode.lastChild.lastChild.appendChild(document.createTextNode(": Print out "));
descriptionNode.lastChild.lastChild.appendChild(createTextLinkTemp(getPublicFileLink("forms/oralCommunicationCenterAttendanceForm.pdf"), "this slip"));
descriptionNode.lastChild.lastChild.appendChild(document.createTextNode(", and bring it and a presentation you're working on to the "));
descriptionNode.lastChild.lastChild.appendChild(createTextLinkTemp("http://www5.wittenberg.edu/academics/occ.html", "Oral Communication Center (OCC)"));
descriptionNode.lastChild.lastChild.appendChild(document.createTextNode(".  (The presentation does not have to be for this class.)  Meet with a consultant there about your presentation.  Have the consultant fill out their part of the slip and bring it back to me.  You can do this a maximum of one time per semester."));
descriptionNode.lastChild.appendChild(document.createElement("li"));
descriptionNode.lastChild.lastChild.appendChild(document.createElement("b"));
descriptionNode.lastChild.lastChild.lastChild.appendChild(document.createTextNode("Visit a Poster Session"));
descriptionNode.lastChild.lastChild.appendChild(document.createTextNode(": Print out "));
descriptionNode.lastChild.lastChild.appendChild(createTextLinkTemp(getPublicFileLink("forms/posterSymposiumAttendanceForm.pdf"), "this slip"));
descriptionNode.lastChild.lastChild.appendChild(document.createTextNode(", and bring it to a student poster symposium at Wittenberg.  Ask a good question, fill out the sheet and bring it back to me.  Limit: one per event."));
descriptionNode.appendChild(document.createTextNode("You do not have to have already gotten a low quiz score prior to the 'dropping event'; I'll automatically deduct the lowest quiz grade or grades.   There are no make up quizzes."));

RubrikCategory.prototype.WITTENBERG_QUIZZES = new RubrikCategory("Quizzes", 10, descriptionNode);

//end of RubrikCategory definitions

FINAL_EXAM_SCHEDULE_URL = "https://campus.plymouth.edu/registrar/academic-calendar-and-exam-schedules/";

/**
 ******************<<InClassExamsRubrik>>*********************************
 * This is a class representing the rubrik for an entire exams grade, including midterms and a final, all taken in class.
 */
var InClassExamsRubrik = Class.create(RubrikCategory, {

    //initialize
    initialize: function($super, percentage, description, semester) {
        $super("Exams", percentage, createElementWithChildren("span", ["There will be one or more midterm exams during the semester and a final exam.  Please check the ", createLink("final exam schedule", FINAL_EXAM_SCHEDULE_URL), " to make sure you can attend it.  If not, please talk to Kyle and make sure you can find a makeup time before enrolling in the course."]));
        this.semester = semester;
    }
//
}); //end of InClassExamsRubrik

/**
 ********<<FinalRubrik>>**********************************************************
 * This should be an uninstantiated class for all finals.
 */
var FinalRubrik = Class.create(RubrikCategory, {

    //initialize
    initialize: function($super, name, percentage, description, semester) {
        $super(name, percentage, description);
        this.semester = semester;
    }

    ,getDescriptiveParagraph: function($super) {
        var p = $super();
        p.lastChild.appendChild(toNode("  Please see the "));
        p.lastChild.appendChild(this.semester.getFinalScheduleLink("final exam schedule"));
        p.lastChild.appendChild(toNode(" to make sure you can follow this."));
        return p;
    }
}); //end of FinalRubrik

/**
 ********<<InClassFinalRubrik>>**********************************************************
 * This should be an uninstantiated class for all finals.
 */
var InClassFinalRubrik = Class.create(FinalRubrik, {

    //initialize
    initialize: function($super, percentage, semester) {
        $super("Final Exam (In Class)", percentage, "The final exam will be given in the classroom.  Make up finals are not available for unexcuseable reasons.  If you will be unable to attend the final exam, you should not be registered for this course.", semester);
    }
}); //end of InClassFinalRubrik

/**
 ********<<TakeHomeFinalRubrik>>**********************************************************
 * This should be an uninstantiated class for all finals.
 */
var TakeHomeFinalRubrik = Class.create(FinalRubrik, {

    //initialize
    initialize: function($super, percentage, semester) {
        $super("\"Take Home\" Final", percentage, "The final exam will be handed out at the end of classes.  It will be due at the end of this course's final exam period, though you may turn it in later.  Failure to turn it in on time results in a score of zero.  If you are going to be unable to work on the final during exam week, you should not be registered for this course.", semester);
    }
}); //end of TakeHomeFinalRubrik



/**
 * This is incomplete!
 */
function generateAtroposPage() {
    //set up the page title
    var pageTitle = document.createElement("title");
    pageTitle.appendChild(document.createTextNode("Atropos"));
    var head = document.getElementsByTagName('head')[0];
    head.appendChild(pageTitle);

    //add the header
    var headingLine = document.createElement("center");
    headingLine.style.fontSize = "xx-large";
    headingLine.appendChild(document.createTextNode("Atropos: The Sperner Game"));
    document.body.appendChild(headingLine);
    document.body.appendChild(document.createElement("br"));
    document.body.appendChild(document.createElement("br"));

    //next: add the reference to the myth.
}

/**
 * Builds the page with the lecture notes.
 */
function generatePairProgrammingPage() {
    //set up the page title
    var pageTitle = document.createElement("title");
    pageTitle.appendChild(document.createTextNode("Pair Programming Resources"));
    var head = document.getElementsByTagName('head')[0];
    head.appendChild(pageTitle);

	//add the main menu
	document.body.appendChild(getMainMenu());
	document.body.appendChild(document.createElement("br"));
	document.body.appendChild(document.createElement("br"));
	document.body.appendChild(document.createElement("br"));

    //add the header
    var headingLine = document.createElement("p");
    headingLine.style.textAlign = "center";
    headingLine.style.fontSize = "xx-large";
    headingLine.appendChild(document.createTextNode("Pair Programming Resources"));
    document.body.appendChild(headingLine);

    //subtitle
    document.body.appendChild(document.createElement("p"));
    document.body.lastChild.style.fontSize = "large";
    document.body.lastChild.appendChild(document.createTextNode("Here are some links about pair programming."));

    //the style file and examples
    document.body.appendChild(document.createElement("div"));
    document.body.lastChild.setAttribute("class", "niceTextBox");
    document.body.lastChild.appendChild(document.createTextNode("Pair programming is a technique where two people are coding the same file at the same time.  It's very helpful for avoiding errors and is a good skill to learn in programming courses."));
    document.body.lastChild.appendChild(document.createElement("ul"));
    document.body.lastChild.lastChild.style.textAlign = "left";
    //wikipedia
    document.body.lastChild.lastChild.appendChild(document.createElement("li"));
    document.body.lastChild.lastChild.lastChild.appendChild(document.createTextNode("Wikipedia's definition of "));
    document.body.lastChild.lastChild.lastChild.appendChild(document.createElement("a"));
    document.body.lastChild.lastChild.lastChild.lastChild.href = "http://en.wikipedia.org/wiki/Pair_programming";
    document.body.lastChild.lastChild.lastChild.lastChild.appendChild(document.createTextNode("pair programming"));
    document.body.lastChild.lastChild.appendChild(document.createElement("li"));
    //screenhero link

    document.body.lastChild.lastChild.lastChild.appendChild(document.createElement("a"));
    document.body.lastChild.lastChild.lastChild.lastChild.href = "http://www.screenhero.com/index.html";
    document.body.lastChild.lastChild.lastChild.lastChild.appendChild(document.createTextNode("Screenhero"));
    document.body.lastChild.lastChild.lastChild.appendChild(document.createTextNode(" is a cool tool for remote pair programming."));

}

/**
 * Builds the page for inductionRoadMap.html
 */
function generateInductionPage() {

    //set up the page title
    var pageTitle = document.createElement("title");
    pageTitle.appendChild(document.createTextNode("Proof-by-Induction Help"));
    var head = document.getElementsByTagName('head')[0];
    head.appendChild(pageTitle);

	//add the main menu
	document.body.appendChild(getMainMenu());
	document.body.appendChild(document.createElement("br"));
	document.body.appendChild(document.createElement("br"));
	document.body.appendChild(document.createElement("br"));

    //add the header
    var headingLine = document.createElement("p");
    headingLine.style.textAlign = "center";
    headingLine.style.fontSize = "xx-large";
    headingLine.appendChild(document.createTextNode("Induction Resources"));
    document.body.appendChild(headingLine);

    //adding the text.
    var description = document.createElement("p");
    document.body.appendChild(description);
    description.style.fontSize = "large";
    description.appendChild(document.createTextNode("Learning to write a proof-by-induction can be tricky!  Maybe these things can help."));

    document.body.appendChild(document.createElement("div"));
    document.body.lastChild.setAttribute("class", "niceTextBox");
    document.body.lastChild.appendChild(document.createTextNode("Induction Guides for Beginners:"));
    var resourceList = document.createElement("ul");
    document.body.lastChild.appendChild(resourceList);
    resourceList.style.textAlign = "left";
    //the road map
    var resource = document.createElement("li");
    resourceList.appendChild(resource);
    resource.appendChild(document.createTextNode("A road map for laying out a proof by (regular or strong) induction.  ("));
    var roadMapAnchor = document.createElement("a");
    resource.appendChild(roadMapAnchor);
    roadMapAnchor.href = getPublicFileLink("teaching/InductionRoadMap.pdf");
    roadMapAnchor.appendChild(document.createTextNode(".pdf"));
    resource.appendChild(document.createTextNode(")"));
    //the examples
    var resource = document.createElement("li");
    resourceList.appendChild(resource);
    resource.appendChild(document.createTextNode("Induction examples You Won't Be Assigned.  ("));
    var examplesAnchor = document.createElement("a");
    resource.appendChild(examplesAnchor);
    examplesAnchor.href = getPublicFileLink("teaching/inductionExamples.pdf");
    examplesAnchor.appendChild(document.createTextNode(".pdf"));
    resource.appendChild(document.createTextNode(")"));

    //now put the nice quote from HPMOR in there
    document.body.appendChild(document.createElement("br"));
    document.body.appendChild(document.createElement("p"));
    document.body.lastChild.style.fontSize = "small";
    document.body.lastChild.appendChild(document.createTextNode("\"It is not life they desire, but immortality; and they are so driven to grasp at it that they will sacrifice their very souls!  Do you want to live forever, Harry?\""));
    document.body.appendChild(document.createElement("p"));
    document.body.lastChild.style.fontSize = "small";
    document.body.lastChild.appendChild(document.createTextNode("\"Yes, and so do you,\" said Harry. \"I want to live one more day. Tomorrow I will still want to live one more day. Therefore I want to live forever, proof by induction on the positive integers. If you don't want to die, it means you want to live forever. If you don't want to live forever, it means you want to die. You've got to do one or the other... \""));
    document.body.appendChild(document.createElement("p"));
    document.body.lastChild.style.fontSize = "small";
    document.body.lastChild.appendChild(document.createTextNode("-- from "));
    document.body.lastChild.appendChild(document.createElement("a"));
    document.body.lastChild.lastChild.href = "http://hpmor.com/";
    document.body.lastChild.lastChild.appendChild(document.createTextNode("Harry Potter and the Methods of Rationality"));
    document.body.lastChild.appendChild(document.createTextNode(", "));
    document.body.lastChild.appendChild(document.createElement("a"));
    document.body.lastChild.lastChild.href = "http://hpmor.com/chapter/39";
    document.body.lastChild.lastChild.appendChild(document.createTextNode("Chapter 39"));
}

/**
 * Builds a page for playing a game.
 */
function playGame() {
    var gameName = getParameterByName("game");
    if (gameName == "atropos") {
        playAtropos();
    }
}

/** TODO: remove?
 * Builds a page for playing Atropos.
 */
function playAtropos() {
    var circlesPerSide = 10;
    clearBody();
    var canvasWidth = 1000;
    var canvasHeight = 1500;
    var canvas = document.createElement("canvas");
    //do we need to set the height/width?
    canvas.setAttribute("width", "" + canvasWidth);
    canvas.setAttribute("height", "" + canvasHeight);
    canvas.style.backgroundColor = "white";
    //document.body.appendChild(canvas);
    var gameDiv = document.createElement("div");
    gameDiv.setAttribute("id", "gameBoard");
    document.body.appendChild(gameDiv);

    function colorSelectedCircle(color) {
        document.selectedCircle.setFill(color);
        colorButtonMenu.style.display = "none";
        if (document.lastColoredCircle != undefined) {
            document.lastColoredCircle.setStroke('black');
        }
        document.lastColoredCircle = document.selectedCircle;
        document.lastColoredCircle.setStroke('gray');
        gameLayer.draw();
        //TODO: change the colors, etc, here! :)
    }

    //create the color button menu
    var blueButton = document.createElement("button");
    blueButton.setAttribute("id", "blue");
    blueButton.appendChild(document.createTextNode("blue"));
    blueButton.onclick = function() {
        colorSelectedCircle("blue");
    }
    var yellowButton = document.createElement("button");
    yellowButton.setAttribute("id", "yellow");
    yellowButton.appendChild(document.createTextNode("yellow"));
    yellowButton.onclick = function() {
        colorSelectedCircle("yellow");
    }
    var redButton = document.createElement("button");
    redButton.setAttribute("id", "red");
    redButton.appendChild(document.createTextNode("red"));
    redButton.onclick = function() {
        colorSelectedCircle("red");
    }
    var colorButtonMenu = document.createElement("div");
    colorButtonMenu.style.display = "none";
    document.body.appendChild(colorButtonMenu);
    colorButtonMenu.appendChild(redButton);
    colorButtonMenu.appendChild(yellowButton);
    colorButtonMenu.appendChild(blueButton);

    var stage = new Kinetic.Stage({
        container: 'gameBoard',
        width: canvasWidth,
        height: canvasHeight});
    var gameLayer = new Kinetic.Layer();
    var context = canvas.getContext("2d");
    var horizonCenter = canvas.width/2;
    var sideLength = Math.min(canvas.width, canvas.height);
    var heightDifference = sideLength / (circlesPerSide + 2);
    var centerDistance = 2 * heightDifference / Math.sqrt(3);
    var radius = centerDistance / 2.5;
    var lineWidth = 8;
    context.lineWidth = lineWidth;
    var circles = [];
    for (var i = 1; i < circlesPerSide; i++) {
        var circleRow = new Array();
        circles.push(circleRow);
        for (var j = 0; j <= i; j++) {
            if (i < circlesPerSide - 1 || (j !=0 && i != j)) {
                var fillColor = "white";
                if (j == 0) {//left side
                    if (i % 2 == 0) {
                        fillColor = "yellow";
                    } else {
                        fillColor = "blue";
                    }
                } else if (j == i) {//right side
                    if (i % 2 == 0) {
                        fillColor = "blue";
                    } else {
                        fillColor = "red";
                    }
                } else if (i == circlesPerSide - 1) { //bottom row
                    if (j % 2 == 0) {
                        fillColor = "red";
                    } else {
                        fillColor = "yellow";
                    }
                }
                var startX = horizonCenter + centerDistance * (j - i / 2.0);
                var startY = radius + heightDifference * i;
                var circle = new Kinetic.Circle({
                    x: startX,
                    y: startY,
                    radius: radius,
                    fill: fillColor,
                    stroke: "black",
                    strokeWidth: lineWidth});
                circleRow.push(circle);
                circle.row = i;
                circle.column = j;
                //set the left neighbor
                var leftNeighbor = circles[i][j-1]
                circle.leftNeighbor = leftNeighbor;
                leftNeighbor.rightNeighbor = circle;
                //next: set the right neighbor
                gameLayer.add(circle);
                circle.setFillEnabled(true);
                circle.on('click tap', function(event) {
                    if (this.getFill() == 'white') {
                        colorButtonMenu.style.display = "";
                        colorButtonMenu.style.position = "absolute";

                        colorButtonMenu.style.left = event.clientX + "px";
                        colorButtonMenu.style.top = event.clientY + "px";
                        document.selectedCircle = this;
                    }
                });
                //now add some of my own things to the circle
                /*
                context.beginPath();
                context.arc(startX, startY, radius, 0, 2 * Math.PI);
                context.stroke();
                context.fillStyle = fillColor;
                context.fill();*/
            }
        }
    }

    stage.add(gameLayer);

    //set some global (yuck!) variables.  Refactor these! :-D
    document.selectedCircle;
    document.lastCircle = undefined;
}

/**
 * Builds the page for a unix terminal tutorial.
 */
function generateTerminalTutorial() {
    var titleText = "Terminal Tutorial";
    var summaryText = "An introduction to using a Unix/Linux/Something-else-nix Terminal.";
    var paragraphArray = new Array();

    //the comic from thedesignteam.io
    var terminalImage = new PaitImage("https://i.redd.it/g587rx8jp0g01.jpg", "Terminal comic from thedesignteam.io");
    terminalImage.setAsLink("https://www.reddit.com/r/ProgrammerHumor/comments/7xb5l9/as_a_designer_this_is_me_every_time_an_engineer/");
    terminalImage.setScale(.5);
    var comicNode = terminalImage.toNode();
    comicNode.style.textAlign = "center";
    paragraphArray.push(comicNode);


    var paragraph = createNiceDiv();
    paragraphArray.push(paragraph);
    paragraph.appendChild(document.createTextNode("First, find the Terminal or Konsole program.  In Ubuntu, it's located on the side bar.  In Mac OSX, it's often already on the dock.  If not, it's in the Applications -> Utilities folder.  Run the program and you should see a window that looks something like the following."));
    paragraph.appendChild(createTerminalNode("something-here:~$ "));

    var paragraph = createNiceDiv();
    paragraphArray.push(paragraph);
    paragraph.appendChild(document.createTextNode("The characters before the $ will be different depending on your computer.  We'll simplify things by removing everything before the $, like so:"));
    paragraph.appendChild(createTerminalNode("$ "));

    var paragraph = createNiceDiv();
    paragraphArray.push(paragraph);
    paragraph.appendChild(document.createTextNode("The Terminal is a way to interact with the computer using a Command Line (Text) interface instead of a Graphical User Interface (GUI).  You can enter commands and press enter to execute them.  For example, if you want to find out what the working directory is, use pwd:"));
    paragraph.appendChild(createTerminalNode("$ pwd\n/home/urawesome\n$"));
    paragraph.appendChild(document.createTextNode("(Your terminal will say something different depending on the settings and your username.)"));

    var paragraph = createNiceDiv();
    paragraphArray.push(paragraph);
    paragraph.appendChild(document.createTextNode("You can see which files and subdirectories are in the current directory by typing ls:"));
    paragraph.appendChild(createTerminalNode("$ ls\nDesktop       monkey.txt\nDocuments     zebra.txt\n$"));
    paragraph.appendChild(document.createTextNode("(Again, your results will be different.)"));

    var paragraph = createNiceDiv();
    paragraphArray.push(paragraph);
    paragraph.appendChild(document.createTextNode("You can create a new directory using mkdir:"));
    paragraph.appendChild(createTerminalNode("$ mkdir programs\n$ ls\nDesktop       programs\nDocuments     zebra.txt\nmonkey.txt\n$"));

    var paragraph = createNiceDiv();
    paragraphArray.push(paragraph);
    paragraph.appendChild(document.createTextNode("Change to a new directory by using cd:"));
    paragraph.appendChild(createTerminalNode("$ cd programs\n$ ls\n$"));
    paragraph.appendChild(document.createTextNode("Notice there are no files in the new directory.  Now let's use pwd to show the current directory:"));
    paragraph.appendChild(createTerminalNode("$ pwd\n/home/urawesome/programs\n$"));

    var paragraph = createNiceDiv();
    paragraphArray.push(paragraph);
    paragraph.appendChild(document.createTextNode("You can create a new empty file using touch:"));
    paragraph.appendChild(createTerminalNode("$ touch textFile.txt\n$ ls\ntextFile.txt\n$"));

    var paragraph = createNiceDiv();
    paragraphArray.push(paragraph);
    paragraph.appendChild(document.createTextNode("Let's find out more about the new file by using ls with the -l parameter, like so:"));
    paragraph.appendChild(createTerminalNode("$ ls -l\n-rw-rw-r-- 1 urawesome urawesome 0 Jan  1 14:11 textFile.txt\n$"));

    var paragraph = createNiceDiv();
    paragraphArray.push(paragraph);
    paragraph.appendChild(document.createTextNode("We can see any hidden files or folders by using the -a parameter:"));
    paragraph.appendChild(createTerminalNode("$ ls -a\n.  ..  textFile.txt\n$"));
    paragraph.appendChild(document.createTextNode(". refers to this directory, while .. refers to the parent directory (where you were before changing directory)."));

    var paragraph = createNiceDiv();
    paragraphArray.push(paragraph);
    paragraph.appendChild(document.createTextNode("Command parameters can be combined, like so:"));
    paragraph.appendChild(createTerminalNode("$ ls -al\ndrwxr-xr-x  2 urawesome urawesome 4096 Jan  1 14:09 .\ndrwxr-xr-x 49 urawesome urawesome 4096 Jan  1 14:10 ..\n-rw-rw-r--  1 urawesome urawesome    0 Jan  1 14:11 textFile.txt\n$"));

    var paragraph = createNiceDiv();
    paragraphArray.push(paragraph);
    paragraph.appendChild(document.createTextNode("There's more we can do with ls!  We can list the elements in a place other than the current working directory by specifying the directory:"));
    paragraph.appendChild(createTerminalNode("$ ls ..\nDesktop       programs\nDocuments     zebra.txt\nmonkey.txt\n$ ls ../\nDesktop       programs\nDocuments     zebra.txt\nmonkey.txt\n$"));
    paragraph.appendChild(document.createTextNode("Or we can specify only specific types of files:"));
    paragraph.appendChild(createTerminalNode("$ ls *.txt\ntextFile.txt\n$"));
    paragraph.appendChild(document.createTextNode("* is a 'wildcard' symbol, so that command will display all files ending in .txt (all text files).  We can combine the two parts like so:"));
    paragraph.appendChild(createTerminalNode("$ ls ../*.txt\nmonkey.txt  zebra.txt\n$"));
    paragraph.appendChild(document.createTextNode("However:"));
    paragraph.appendChild(createTerminalNode("$ ls ..*.txt\nls: cannot access ..*.txt: No such file or directory\n$"));

    var paragraph = createNiceDiv();
    paragraphArray.push(paragraph);
    paragraph.appendChild(document.createTextNode("Folders are separated using the / (slash).  For example, another way to list the files in the current (programs) directory is:"));
    paragraph.appendChild(createTerminalNode("$ ls ../programs\ntextFile.txt\n$ ls ../programs/*.txt\ntextFile.txt\n$"));

    var paragraph = createNiceDiv();
    paragraphArray.push(paragraph);
    paragraph.appendChild(document.createTextNode("Let's play around with cd a bit more:"));
    paragraph.appendChild(createTerminalNode("$ cd ..\n$ pwd\n/home/urawesome\n$ cd ..\n$ pwd\n/home\n$"));
    paragraph.appendChild(document.createTextNode("Alternatively, you can specify the full directory path:"));
    paragraph.appendChild(createTerminalNode("$ cd /home/urawesome/programs\n$ pwd\n/home/urawesome/programs\n$ cd ~\n$ pwd\n/home/urawesome\n$ "));
    paragraph.appendChild(document.createTextNode("(The tilde, ~, is shorthand for the home directory.)"));

    var paragraph = createNiceDiv();
    paragraphArray.push(paragraph);
    paragraph.appendChild(document.createTextNode("Let's change the name of the file we created before!"));
    paragraph.appendChild(createTerminalNode("$ cd programs\n$ ls\ntextFile.txt\n$ mv textFile.txt emptyFile.txt\n$ ls\nemptyFile.txt\n$"));

    var paragraph = createNiceDiv();
    paragraphArray.push(paragraph);
    paragraph.appendChild(document.createTextNode("mv is short for move.  We can use it to move files from one place to another:"));
    paragraph.appendChild(createTerminalNode("$ mv emptyFile.txt ../emptyFile.txt\n$ ls\n$ cd ..\n$ ls\nDesktop     emptyFile.txt   monkey.txt\nDocuments   programs        zebra.txt\n$"));
    paragraph.appendChild(document.createTextNode("The signature for mv always looks like: mv <source> <destination>"));
    paragraph.appendChild(createTerminalNode("$ mv emptyFile.txt programs/emptyFile.txt\n$ cd programs\n$ ls\nemptyFile.txt\n$"));
    paragraph.appendChild(document.createTextNode("If we specify the destination folder name, but not the destination filename, it will preserve the old name:"));
    paragraph.appendChild(createTerminalNode("$ mkdir textFiles\n$ ls\nemptyFile.txt   textFiles\n$ mv emptyFile.txt textFiles/\n$ ls\ntextFiles\n$ cd textFiles\n$ ls\nemptyFile.txt\n$"));

    var paragraph = createNiceDiv();
    paragraphArray.push(paragraph);
    paragraph.appendChild(document.createTextNode("We can move entire directories!"));
    paragraph.appendChild(createTerminalNode("$ cd ..\n$ ls\ntextFiles\n$ mv textFiles textOnly\n$ ls\ntextOnly\n$ ls textOnly/\nemptyFile.txt\n$"));

    var paragraph = createNiceDiv();
    paragraphArray.push(paragraph);
    paragraph.appendChild(document.createTextNode("cp (copy) is nearly the same as mv, except that it doesn't delete the original file or folder:"));
    paragraph.appendChild(createTerminalNode("$ cp textOnly/emptyFile.txt textOnly/blankFile.txt\n$ ls textOnly/\nblankFile.txt   emptyFile.txt\n$"));

    var paragraph = createNiceDiv();
    paragraphArray.push(paragraph);
    paragraph.appendChild(document.createTextNode("cp is a bit more ornery with folders.  Let's try to (re)create our textFiles directory by copying textOnly:"));
    paragraph.appendChild(createTerminalNode("$ cp textOnly textFiles\ncp: omitting directory `textOnly'\n$"));
    paragraph.appendChild(document.createTextNode("We can get around this by using the -r parameter:"));
    paragraph.appendChild(createTerminalNode("$ cp -r textOnly textFiles\n$ ls\ntextFiles   textOnly\n$"));

    var paragraph = createNiceDiv();
    paragraphArray.push(paragraph);
    paragraph.appendChild(document.createTextNode("Sometimes you have excess files that you don't need around anymore.  We can delete them with rm (remove), like this:"));
    paragraph.appendChild(createTerminalNode("$ ls textFiles/\nblankFile.txt   emptyFile.txt\n$ rm textFiles/blankFile.txt\n$ ls textFiles/\nemptyFile.txt\n$ "));

    var paragraph = createNiceDiv();
    paragraphArray.push(paragraph);
    paragraph.appendChild(document.createTextNode("You can remove multiple files by using a star (*):"));
    paragraph.appendChild(createTerminalNode("$ rm textOnly/*.tx\nrm: cannot remove `textOnly/*.tx': No such file or directory\n$ rm textOnly/*.txt\n$ ls textOnly/\n$ "));
    paragraph.appendChild(document.createTextNode("Warning: there is no undo command!  rm will permanently delete your files!  Always proceed with caution, especially when using wildcards!  As a safeguard, rm won't delete directories unless you include the -r parameter.  Don't type in the following commands unless you want to remove all files, then all folders in the directory you're in."));
    paragraph.appendChild(createTerminalNode("$ rm *\nrm: cannot remove `textFiles': Is a directory\nrm: cannot remove `textOnly': Is a directory\n$ rm -r *\n$ ls \n$"));
    paragraph.appendChild(document.createTextNode("Do not use rm lightly!"));

    var paragraph = createNiceDiv();
    paragraphArray.push(paragraph);
    paragraph.appendChild(document.createTextNode("Using tab completion will make your Terminal maneuvering much faster!  Whenever you are typing in a string (a sequence of characters) and you think there is only one possible file/folder/command that starts with those characters, try pressing tab.  For example, type the following commands, but don't hit enter at the end of the last one."));
    paragraph.appendChild(createTerminalNode("$ mkdir superMonkeyBonusDirectory\n$ mkdir superMonk"));
    paragraph.appendChild(document.createTextNode("We don't want to type out the whole thing.  Instead, hit tab.  Since there is only one possibility, it will automatically fill out the rest for you:"));
    paragraph.appendChild(createTerminalNode("$ mkdir superMonkeyBonusDirectory\n$ mkdir superMonkeyBonusDirectory/"));
    paragraph.appendChild(document.createTextNode("We're not done with that line yet; we're going to make a subdirectory of the previous one:"));
    paragraph.appendChild(createTerminalNode("$ mkdir superMonkeyBonusDirectory\n$ mkdir superMonkeyBonusDirectory/jackalCupcake\n$"));
    paragraph.appendChild(document.createTextNode("Let's make yet another directory inside that last one.  Use tab completion to make it easy:"));
    paragraph.appendChild(createTerminalNode("$ mkdir s"));
    paragraph.appendChild(document.createTextNode("Since there is only one file/folder in the working directory starting with 's', press tab:"));
    paragraph.appendChild(createTerminalNode("$ mkdir superMonkeyBonusDirectory/"));
    paragraph.appendChild(document.createTextNode("Since there is only one file/folder in the subdirectory, press tab again:"));
    paragraph.appendChild(createTerminalNode("$ mkdir superMonkeyBonusDirectory/jackalCupcake/"));
    paragraph.appendChild(document.createTextNode("Now type in the name of the new (subsub)directory you're creating:"));
    paragraph.appendChild(createTerminalNode("$ mkdir superMonkeyBonusDirectory/jackalCupcake/oleOleBiscuitBarrel\n$"));

    var paragraph = createNiceDiv();
    paragraphArray.push(paragraph);
    paragraph.appendChild(document.createTextNode("Often you'll want to execute a command identical or similar to one you've recently written.  You can scroll through these by pressing the up (and down) arrows.  Perhaps we want to create (yet another) subdirectory inside the one we just created.  Consider the previous command:"));
    paragraph.appendChild(createTerminalNode("$ mkdir superMonkeyBonusDirectory/jackalCupcake/oleOleBiscuitBarrel\n$"));
    paragraph.appendChild(document.createTextNode("Press up once to see:"));
    paragraph.appendChild(createTerminalNode("$ mkdir superMonkeyBonusDirectory/jackalCupcake/oleOleBiscuitBarrel\n$ mkdir superMonkeyBonusDirectory/jackalCupcake/oleOleBiscuitBarrel"));
    paragraph.appendChild(document.createTextNode("Tab to get the slash:"));
    paragraph.appendChild(createTerminalNode("$ mkdir superMonkeyBonusDirectory/jackalCupcake/oleOleBiscuitBarrel\n$ mkdir superMonkeyBonusDirectory/jackalCupcake/oleOleBiscuitBarrel/"));
    paragraph.appendChild(document.createTextNode("And now enter the name of the new folder."));
    paragraph.appendChild(createTerminalNode("$ mkdir superMonkeyBonusDirectory/jackalCupcake/oleOleBiscuitBarrel\n$ mkdir superMonkeyBonusDirectory/jackalCupcake/oleOleBiscuitBarrel/cheeseWeasel\n$ "));
    paragraph.appendChild(document.createTextNode("You can press up multiple times to see old commands.  This is very useful if you're running the same program multiple times between editing files."));

    var paragraph = createNiceDiv();
    paragraphArray.push(paragraph);
    paragraph.appendChild(document.createTextNode("Awesome, now you've got a handle on basic terminal commands!  This is only the start!  Sorry I didn't say anything about how to edit files, but I don't want to "));
    paragraph.appendChild(createTextLink("choose a side", "http://xkcd.com/378/"));
    paragraph.appendChild(document.createTextNode("."));

    var paragraph = createNiceTitledDiv("Acknowledgements");
    paragraphArray.push(paragraph);
    paragraph.appendChild(document.createTextNode("Thanks to Dale Skrien and Eric Mann for helpful comments on drafts of this.  If you notice some way to improve this, please let me know! :)"));

    createResourcePage(titleText, summaryText, paragraphArray);


}


/**
 * Builds the page for the Chapel Tutorial.
 */
function generateChapelTutorial() {

    var titleText = "Chapel Tutorial for Programmers";
    var summaryText = "This tutorial is a quick introduction to Chapel for programmers.  (It expects you to already be comfortable programming in another language.)  This code is currently compatible with the version 1.8.0 Chapel compiler.  (Last Updated Nov. 2013.)  If you are waiting for it to work for a new version, it is okay to let me know I'm being slow!"
    var paragraphArray = new Array();

    var paragraph = document.createElement("div");
    paragraph.appendChild(document.createTextNode("More information about Chapel is available "));
    paragraph.appendChild(createTextLink("here", "http://chapel.cray.com/"));
    paragraph.appendChild(document.createTextNode(".  I'm assuming you're on a Linux/Unix system with it already installed or you will follow the directions there to install it yourself."));
    paragraphArray.push(paragraph);

    var paragraph = document.createElement("div");
    paragraph.appendChild(document.createTextNode("Let's get started!  First, create a file, "));
    paragraph.appendChild(createCodeNode(document.createTextNode("test.chpl")));
    paragraph.appendChild(document.createTextNode(" in your favorite text editor.  Then, let's declare our first variable.  Add the following line to your code:"));
    paragraphArray.push(paragraph);

    var codeLines = new Array();
    codeLines.push("var maximum: real = 0.0;");
    paragraphArray.push(createCodeBlock(codeLines));

    var paragraph = document.createElement("div");
    paragraph.appendChild(document.createTextNode("This creates a new real (float) variable with value 0.  Chapel derives the type of a variable itself in initialization statements, so you avoid declaring the type and instead write:"));
    paragraphArray.push(paragraph);

    var codeLines = new Array();
    codeLines.push("var maximum = 0.0;");
    paragraphArray.push(createCodeBlock(codeLines));

    var paragraph = document.createElement("div");
    paragraph.appendChild(document.createTextNode("Print statements are important!  Let's add one after the line we just added:"));
    paragraphArray.push(paragraph);

    var codeLines = new Array();
    codeLines.push("writeln(\"maximum: \", maximum);");
    paragraphArray.push(createCodeBlock(codeLines));
    var paragraph = document.createElement("div");
    paragraph.appendChild(document.createTextNode("We can initialize an array in the following way:"));
    paragraphArray.push(paragraph);

    var codeLines = new Array();
    codeLines.push("var n: int = 10;");
    codeLines.push("var realArray: [0..n-1] real;");
    codeLines.push("realArray[0] = 1.0;");
    codeLines.push("realArray[1] = 2.0;");
    codeLines.push("realArray[2] = 3.0;");
    codeLines.push("realArray[3] = 4.0;");
    codeLines.push("realArray[4] = 5.0;");
    codeLines.push("realArray[5] = 4.0;");
    codeLines.push("realArray[6] = 3.0;");
    codeLines.push("realArray[7] = 2.0;");
    codeLines.push("realArray[8] = 1.0;");
    codeLines.push("realArray[9] = 0.0;");
    paragraphArray.push(createCodeBlock(codeLines));

    var paragraph = document.createElement("div");
    paragraph.appendChild(document.createTextNode("Cool!  We have an array!  We can print it out with just one line:"));
    paragraphArray.push(paragraph);

    var codeLines = new Array();
    codeLines.push("writeln(\"realArray: \", realArray);");
    paragraphArray.push(createCodeBlock(codeLines));

    var paragraph = document.createElement("div");
    paragraph.appendChild(document.createTextNode("Okay, now open a terminal, make sure the Chapel command is loaded into the terminal window (see the Chapel installation instructions), and navigate to the directory where your file is located.  Then type:"));
    paragraphArray.push(paragraph);

    var paragraph = document.createElement("div");
    paragraph.appendChild(createCodeNode(document.createTextNode("$ chpl test.chpl")));
    paragraphArray.push(paragraph);

    var paragraph = document.createElement("div");
    paragraph.appendChild(document.createTextNode("To compile and create the executable file.  After that's finished, type:"));
    paragraphArray.push(paragraph);

    var paragraph = document.createElement("div");
    paragraph.appendChild(createCodeNode(document.createTextNode("$ ./a.out")));
    paragraphArray.push(paragraph);

    var paragraph = document.createElement("div");
    paragraph.appendChild(document.createTextNode("to run the executable file.  The output should look something like:"));
    paragraphArray.push(paragraph);

    var paragraph = document.createElement("div");
    paragraph.appendChild(createCodeNode(document.createTextNode("maximum: 0.0")));
    paragraph.appendChild(document.createElement("br"));
    paragraph.appendChild(createCodeNode(document.createTextNode("realArray: 1.0 2.0 3.0 4.0 5.0 4.0 3.0 2.0 1.0 0.0")));
    paragraphArray.push(paragraph);

    var paragraph = document.createElement("div");
    paragraph.appendChild(document.createTextNode("If an error occurs, go back to your code and try to fix it.  At this point, not all of the error messages are super helpful.  If you get a weird message that doesn't tell you anything, you might need to ask for more help.  I recommend checking out the archives of the Chapel mailing list."));
    paragraphArray.push(paragraph);

    var paragraph = document.createElement("div");
    paragraph.appendChild(document.createTextNode("Next, let's write a loop to find the maximum element in an array.  Add the following to the end of your file:"));
    paragraphArray.push(paragraph);

    var codeLines = new Array();
    codeLines.push("for realNumber in realArray {");
    codeLines.push(getSpaces(4) + "if (realNumber > maximum) {");
    codeLines.push(getSpaces(8) + "maximum = realNumber;");
    codeLines.push(getSpaces(4) + "}");
    codeLines.push("}");
    codeLines.push("writeln(\"Max: \", maximum);");
    paragraphArray.push(createCodeBlock(codeLines));

    var paragraph = document.createElement("div");
    paragraph.appendChild(document.createTextNode("Compile and run this and make sure it reports that the max is 5.0.  Next, let's encapsulate that loop into a function.  Replace it with the following:"));
    paragraphArray.push(paragraph);

    var codeLines = new Array();
    codeLines.push("proc findMax(array) {");
    codeLines.push(getSpaces(4) + "var arrayMax = array[0];");
    codeLines.push(getSpaces(4) + "for number in array {");
    codeLines.push(getSpaces(8) + "if (number > arrayMax) {");
    codeLines.push(getSpaces(12) + "arrayMax = number;");
    codeLines.push(getSpaces(8) + "}");
    codeLines.push(getSpaces(4) + "}");
    codeLines.push(getSpaces(4) + "return arrayMax;");
    codeLines.push("}");
    paragraphArray.push(createCodeBlock(codeLines));

    var paragraph = document.createElement("div");
    paragraph.appendChild(document.createTextNode("Now call the function after the array has been initialized:"));
    paragraphArray.push(paragraph);

    var codeLines = new Array();
    codeLines.push("writeln(\"Max of realArray is: \", findMax(realArray));");
    paragraphArray.push(createCodeBlock(codeLines));

    var paragraph = document.createElement("div");
    paragraph.appendChild(document.createTextNode("Get rid of the old "));
    paragraph.appendChild(createCodeNode(document.createTextNode("maximum")));
    paragraph.appendChild(document.createTextNode(" variable, compile, and run the code to make sure it's still working."));
    paragraphArray.push(paragraph);

    var paragraph = document.createElement("div");
    paragraph.appendChild(document.createTextNode("One nice part of Chapel is that you can easily measure the running time of your code using the "));
    paragraph.appendChild(createCodeNode(document.createTextNode("Time")));
    paragraph.appendChild(document.createTextNode(" package.  Let's do that next!  Add this to the top of your code (first line):"));
    paragraphArray.push(paragraph);

    var codeLines = new Array();
    codeLines.push("use Time;");
    paragraphArray.push(createCodeBlock(codeLines));

    var paragraph = document.createElement("div");
    paragraph.appendChild(document.createTextNode("Now we can create "));
    paragraph.appendChild(createCodeNode(document.createTextNode("Timer")));
    paragraph.appendChild(document.createTextNode(" objects inside the code.  Add lines before and after the printing line like so: "));
    paragraphArray.push(paragraph);

    var codeLines = new Array();
    codeLines.push("var timer: Timer;");
    codeLines.push("timer.start();");
    codeLines.push("writeln(\"Max of realArray is: \", findMax(realArray));");
    codeLines.push("timer.stop();");
    codeLines.push("writeln(\"That took \", timer.elapsed(), \" seconds.\");");
    paragraphArray.push(createCodeBlock(codeLines));

    var paragraph = document.createElement("div");
    paragraph.appendChild(document.createTextNode("You may not want the printing to be timed.  We can change that by splitting the print statement into two lines: "));
    paragraphArray.push(paragraph);

    var codeLines = new Array();
    codeLines.push("var timer: Timer;");
    codeLines.push("timer.start();");
    codeLines.push("maximum = findMax(realArray);");
    codeLines.push("timer.stop();");
    codeLines.push("writeln(\"Max of realArray is: \", maximum);");
    codeLines.push("writeln(\"That took \", timer.elapsed(), \" seconds.\");");
    paragraphArray.push(createCodeBlock(codeLines));

    var paragraph = document.createElement("div");
    paragraph.appendChild(document.createTextNode("Compile and run your code to see how long it takes to find the maximum element.  We would like to see how this changes with different values of "));
    paragraph.appendChild(createCodeNode(document.createTextNode("n")));
    paragraph.appendChild(document.createTextNode(".  The main problem is that we don't want to have to explicitly initialize each element of "));
    paragraph.appendChild(createCodeNode(document.createTextNode("realArray")));
    paragraph.appendChild(document.createTextNode(" in the code.  So, next, let's learn how to create arrays of random values.  We will use the "));
    paragraph.appendChild(createCodeNode(document.createTextNode("Random")));
    paragraph.appendChild(document.createTextNode(" package.  Just like before, add a "));
    paragraph.appendChild(createCodeNode(document.createTextNode("use")));
    paragraph.appendChild(document.createTextNode(" statement to the top of your code:"));
    paragraphArray.push(paragraph);

    var codeLines = new Array();
    codeLines.push("use Time;");
    codeLines.push("use Random;");
    paragraphArray.push(createCodeBlock(codeLines));

    var paragraph = document.createElement("div");
    paragraph.appendChild(document.createTextNode("Now change the section initializing "));
    paragraph.appendChild(createCodeNode(document.createTextNode("realArray")));
    paragraph.appendChild(document.createTextNode(" to the following:"));
    paragraphArray.push(paragraph);

    var codeLines = new Array();
    codeLines.push("var n = 10;");
    codeLines.push("var realArray : [0..n-1] real;");
    codeLines.push("var randomStream = new RandomStream(SeedGenerator.currentTime);");
    codeLines.push("randomStream.fillRandom(realArray);");
    codeLines.push("writeln(\"realArray: \", realArray);");
    paragraphArray.push(createCodeBlock(codeLines));

    var paragraph = document.createElement("div");
    paragraph.appendChild(document.createTextNode("Compile and run your code to make sure this new code is working.  You'll see that the array is now populated by random values.  Now go back and change "));
    paragraph.appendChild(createCodeNode(document.createTextNode("n")));
    paragraph.appendChild(document.createTextNode(" to be larger:"));
    paragraphArray.push(paragraph);

    var codeLines = new Array();
    codeLines.push("var n = 500;");
    paragraphArray.push(createCodeBlock(codeLines));

    var paragraph = document.createElement("div");
    paragraph.appendChild(document.createTextNode("Compile and run again.  Wouldn't it be great to not have to recompile just because you change "));
    paragraph.appendChild(createCodeNode(document.createTextNode("n")));
    paragraph.appendChild(document.createTextNode("?  Absolutely!  Let's make that happen using configurable constants.  Change the initialization of "));
    paragraph.appendChild(createCodeNode(document.createTextNode("n")));
    paragraph.appendChild(document.createTextNode(" to the following:"));
    paragraphArray.push(paragraph);

    var codeLines = new Array();
    codeLines.push("config const n = 500;");
    paragraphArray.push(createCodeBlock(codeLines));

    var paragraph = document.createElement("div");
    paragraph.appendChild(document.createTextNode("Now if you want to run the code with a value of "));
    paragraph.appendChild(createCodeNode(document.createTextNode("n")));
    paragraph.appendChild(document.createTextNode(" different from the code, you declare the new value like so:"));
    paragraphArray.push(paragraph);

    var paragraph = document.createElement("div");
    paragraph.appendChild(createCodeNode(document.createTextNode("./a.out --n=5000")));
    paragraph.appendChild(document.createElement("br"));
    paragraphArray.push(paragraph);

    var paragraph = document.createElement("div");
    paragraph.appendChild(document.createTextNode("Great!  Now let's try harnessing the power of extra processors!  Chapel does this by creating new tasks, which are then run on available processors. For example, if we had two processors available to find the maximum value of an array, we could have two tasks: one to search each half of the array.  Let's work towards that by first adding a function that looks in a range of the array.  We'll use a while loop to iterate here instead of a for loop (for example's sake).  Add this function to your code: "));
    paragraphArray.push(paragraph);

    var codeLines = new Array();
    codeLines.push("proc findMaxInRange(array, lower, upper) {");
    codeLines.push(getSpaces(4) + "var arrayMax = array[lower];");
    codeLines.push(getSpaces(4) + "while (lower <= upper) {");
    codeLines.push(getSpaces(8) + "if (array[lower] > arrayMax) {");
    codeLines.push(getSpaces(12) + "arrayMax = array[lower];");
    codeLines.push(getSpaces(8) + "}");
    codeLines.push(getSpaces(8) + "lower += 1;");
    codeLines.push(getSpaces(4) + "}");
    codeLines.push(getSpaces(4) + "return arrayMax;");
    codeLines.push("}");
    paragraphArray.push(createCodeBlock(codeLines));

    var paragraph = document.createElement("div");
    paragraph.appendChild(document.createTextNode("If you try to use this function right away, Chapel complains about the line where lower is incremented, saying: \""));
    paragraph.appendChild(createCodeNode(document.createTextNode("error: non-lvalue actual passed to ref argument")));
    paragraph.appendChild(document.createTextNode("\".  This happens because Chapel treats passed integers as constants; you can't modify them.  You can fix this by changing the function signature:"));
    paragraphArray.push(paragraph);

    var codeLines = new Array();
    codeLines.push("proc findMaxInRange(array, in lower, upper) {");
    paragraphArray.push(createCodeBlock(codeLines));

    var paragraph = document.createElement("div");
    paragraph.appendChild(document.createTextNode("Here, "));
    paragraph.appendChild(createCodeNode(document.createTextNode("in")));
    paragraph.appendChild(document.createTextNode(" tells Chapel not to treat that variable as a constant.  Another option to fix this problem is to create a separate index variable.  Instead of using "));
    paragraph.appendChild(createCodeNode(document.createTextNode("in")));
    paragraph.appendChild(document.createTextNode(", I will continue from the following example, using index "));
    paragraph.appendChild(createCodeNode(document.createTextNode("i")));
    paragraph.appendChild(document.createTextNode(", which might make the code easier to read:"));
    paragraphArray.push(paragraph);

    var codeLines = new Array();
    codeLines.push("proc findMaxInRange(array, lower, upper) {");
    codeLines.push(getSpaces(4) + "var i = lower;");
    codeLines.push(getSpaces(4) + "var arrayMax = array[i];");
    codeLines.push(getSpaces(4) + "while (i <= upper) {");
    codeLines.push(getSpaces(8) + "if (array[i] > arrayMax) {");
    codeLines.push(getSpaces(12) + "arrayMax = array[i];");
    codeLines.push(getSpaces(8) + "}");
    codeLines.push(getSpaces(8) + "i += 1;");
    codeLines.push(getSpaces(4) + "}");
    codeLines.push(getSpaces(4) + "return arrayMax;");
    codeLines.push("}");
    paragraphArray.push(createCodeBlock(codeLines));

    var paragraph = document.createElement("div");
    paragraph.appendChild(document.createTextNode("Compile to check that you don't have any syntax errors.  Now let's change "));
    paragraph.appendChild(createCodeNode(document.createTextNode("findMax")));
    paragraph.appendChild(document.createTextNode(" to use that new function:"));
    paragraphArray.push(paragraph);

    var codeLines = new Array();
    codeLines.push("proc findMax(array) {");
    codeLines.push(getSpaces(4) + "var middle = array.numElements/2;");
    codeLines.push(getSpaces(4) + "var lowerMax, upperMax: real;");
    codeLines.push(getSpaces(4) + "lowerMax = findMaxInRange(array, 0, middle);");
    codeLines.push(getSpaces(4) + "upperMax = findMaxInRange(array, middle+1, array.numElements - 1);");
    codeLines.push(getSpaces(4) + "if (lowerMax > upperMax) { return lowerMax; }");
    codeLines.push(getSpaces(4) + "return upperMax;");
    codeLines.push("}");
    paragraphArray.push(createCodeBlock(codeLines));

    var paragraph = document.createElement("div");
    paragraph.appendChild(document.createTextNode("The comparison at the end can be replaced with a call to the built-in "));
    paragraph.appendChild(createCodeNode(document.createTextNode("max")));
    paragraph.appendChild(document.createTextNode(" function:"));
    paragraphArray.push(paragraph);

    var codeLines = new Array();
    codeLines.push("proc findMax(array) {");
    codeLines.push(getSpaces(4) + "var middle = array.numElements/2;");
    codeLines.push(getSpaces(4) + "var lowerMax, upperMax: real;");
    codeLines.push(getSpaces(4) + "lowerMax = findMaxInRange(array, 0, middle);");
    codeLines.push(getSpaces(4) + "upperMax = findMaxInRange(array, middle+1, array.numElements - 1);");
    codeLines.push(getSpaces(4) + "return max(lowerMax, upperMax);");
    codeLines.push("}");
    paragraphArray.push(createCodeBlock(codeLines));

    var paragraph = document.createElement("div");
    paragraph.appendChild(document.createTextNode("If we have two processors, we can have separate tasks find the values of the two partial-maximums in parallel.  That part then may take only half as long!  Chapel let's us do this really easily: just wrap them in a "));
    paragraph.appendChild(createCodeNode(document.createTextNode("cobegin")));
    paragraph.appendChild(document.createTextNode(":"));
    paragraphArray.push(paragraph);

    var codeLines = new Array();
    codeLines.push("proc findMax(array) {");
    codeLines.push(getSpaces(4) + "var middle = array.numElements/2;");
    codeLines.push(getSpaces(4) + "var lowerMax, upperMax: real;");
    codeLines.push(getSpaces(4) + "cobegin ref(lowerMax, upperMax) {");
    codeLines.push(getSpaces(8) + "lowerMax = findMaxInRange(array, 0, middle);");
    codeLines.push(getSpaces(8) + "upperMax = findMaxInRange(array, middle+1, array.numElements - 1);");
    codeLines.push(getSpaces(4) + "}");
    codeLines.push(getSpaces(4) + "return max(lowerMax, upperMax);");
    codeLines.push("}");
    paragraphArray.push(createCodeBlock(codeLines));

    var paragraph = document.createElement("div");
    paragraph.appendChild(document.createTextNode("The "));
    paragraph.appendChild(createCodeNode(document.createTextNode("cobegin")));
    paragraph.appendChild(document.createTextNode(" creates a new task for each line (with the hope they will get assigned to their own hardware thread) then waits for all of them to finish before continuing with the rest of the code.  The "));
    paragraph.appendChild(createCodeNode(document.createTextNode("ref(lowerMax, upperMax)")));
    paragraph.appendChild(document.createTextNode(" tells Chapel it can modify those variables that were declared outside the "));
    paragraph.appendChild(createCodeNode(document.createTextNode("cobegin")));
    paragraph.appendChild(document.createTextNode(".  (Without this statement, it treats most of those \"outside\" variables as constants.)  Awesome!  Compile and run your code again."));
    paragraphArray.push(paragraph);

    var paragraph = document.createElement("div");
    paragraph.appendChild(document.createElement("b"));
    paragraph.lastChild.appendChild(document.createTextNode("Challenge"));
    paragraph.appendChild(document.createTextNode(": write "));
    paragraph.appendChild(createCodeNode(document.createTextNode("fastFindMaxInRange")));
    paragraph.appendChild(document.createTextNode(", a recursive version of "));
    paragraph.appendChild(createCodeNode(document.createTextNode("findMaxInRange")));
    paragraph.appendChild(document.createTextNode(".  Important: Chapel doesn't automatically determine the return type of recursive functions, so your signature needs to declare this: "));
    paragraphArray.push(paragraph);

    var codeLines = new Array();
    codeLines.push("proc fastFindMaxInRange(array, lower, upper) : real {");
    paragraphArray.push(createCodeBlock(codeLines));

    var paragraph = document.createElement("div");
    paragraph.appendChild(document.createTextNode("Try to get this to work before continuing.  Hint: try getting it to work serially before adding a "));
    paragraph.appendChild(createCodeNode(document.createTextNode("cobegin")));
    paragraph.appendChild(document.createTextNode(".  If you get stuck, my solution is below. "));
    paragraphArray.push(paragraph);

    var codeLines = new Array();
    codeLines.push("proc fastFindMaxInRange(array, lower, upper) : real {");
    codeLines.push(getSpaces(4) + "if (lower == upper) { return array[lower]; }");
    codeLines.push(getSpaces(4) + "var lowerMax, upperMax: real;");
    codeLines.push(getSpaces(4) + "var middle = ((upper - lower) / 2) + lower;");
    codeLines.push(getSpaces(4) + "cobegin ref(lowerMax, upperMax) {");
    codeLines.push(getSpaces(8) + "lowerMax = fastFindMaxInRange(array, lower, middle);");
    codeLines.push(getSpaces(8) + "upperMax = fastFindMaxInRange(array, middle + 1, upper);");
    codeLines.push(getSpaces(4) + "}");
    codeLines.push(getSpaces(4) + "return max(lowerMax, upperMax);");
    codeLines.push("}");
    paragraphArray.push(createCodeBlock(codeLines));

    var paragraph = document.createElement("div");
    paragraph.appendChild(document.createTextNode("Okay, let's see what kind of speedup we attained!  Add two wrapper functions to test the parallel and serial versions. "));
    paragraphArray.push(paragraph);

    var codeLines = new Array();
    codeLines.push("proc serialFindMax(array) {");
    codeLines.push(getSpaces(4) + "return findMaxInRange(array, 0, array.numElements - 1);");
    codeLines.push("}");
    codeLines.push("");
    codeLines.push("proc parallelFindMax(array) {");
    codeLines.push(getSpaces(4) + "return fastFindMaxInRange(array, 0, array.numElements - 1);");
    codeLines.push("}");
    paragraphArray.push(createCodeBlock(codeLines));

    var paragraph = document.createElement("div");
    paragraph.appendChild(document.createTextNode("... then write some code to time them both:"));
    paragraphArray.push(paragraph);

    var codeLines = new Array();
    codeLines.push("timer.clear();");
    codeLines.push("timer.start();");
    codeLines.push("var serialMax = serialFindMax(realArray);");
    codeLines.push("timer.stop();");
    codeLines.push("var serialSeconds = timer.elapsed();");
    codeLines.push("timer.clear();");
    codeLines.push("timer.start();");
    codeLines.push("var parallelMax = parallelFindMax(realArray);");
    codeLines.push("timer.stop();");
    codeLines.push("var parallelSeconds = timer.elapsed();");
    codeLines.push("timer.clear();");
    codeLines.push("writeln(\"SERIAL test: found the max to be \", serialMax, \" in \", serialSeconds, \" seconds.\");");
    codeLines.push("writeln(\"PARALLEL test: found the max to be \", parallelMax, \" in \", parallelSeconds, \" seconds.\");");
    codeLines.push("var speedup = serialSeconds / parallelSeconds;");
    codeLines.push("if (speedup > 1) {");
    codeLines.push(getSpaces(4) + "writeln(\"    The parallel trial achieved a \", speedup, \"x speedup over the serial!\");");
    codeLines.push("} else {");
    codeLines.push(getSpaces(4) + "writeln(\"    No speedup attained!\");");
    codeLines.push("}");
    paragraphArray.push(createCodeBlock(codeLines));

    var paragraph = document.createElement("div");
    paragraph.appendChild(document.createTextNode("Running this with "));
    paragraph.appendChild(createCodeNode(document.createTextNode("n = 5000")));
    paragraph.appendChild(document.createTextNode(" on my 8-CPU machine gives me the following output:"));
    paragraphArray.push(paragraph);

    var paragraph = document.createElement("div");
    paragraph.appendChild(createCodeNode(document.createTextNode("$ ./a.out --n=5000")));
    paragraph.appendChild(document.createElement("br"));
    paragraph.appendChild(createCodeNode(document.createTextNode("...")));
    paragraph.appendChild(document.createElement("br"));
    paragraph.appendChild(createCodeNode(document.createTextNode("Serial test: found the max to be 0.999846 in 0.0008 seconds.")));
    paragraph.appendChild(document.createElement("br"));
    paragraph.appendChild(createCodeNode(document.createTextNode("Parallel test: found the max to be 0.999846 in 0.55384 seconds.")));
    paragraph.appendChild(document.createElement("br"));
    paragraph.appendChild(createCodeNode(document.createTextNode("Achieved a 0.00144446x speedup!")));
    paragraph.appendChild(document.createElement("br"));
    paragraphArray.push(paragraph);

    var paragraph = document.createElement("div");
    paragraph.appendChild(document.createTextNode("Yuck!  One problem here is that there is too much overhead creating a bunch of different tasks that aren't able to run simultaneously.  It's not advantageous to create too many tasks.  (If you have more processors, you're probably getting better results.)  To fix this problem, let's cap the number of tasks we create.  The idea is that we'll specify the number of tasks we are allowed to use.  To do this, create a new function, "));
    paragraph.appendChild(createCodeNode(document.createTextNode("hybridFindMaxInRange")));
    paragraph.appendChild(document.createTextNode(", similar to "));
    paragraph.appendChild(createCodeNode(document.createTextNode("fastFindMaxInRange")));
    paragraph.appendChild(document.createTextNode(", except with an extra parameter, "));
    paragraph.appendChild(createCodeNode(document.createTextNode("numTasks")));
    paragraph.appendChild(document.createTextNode(", which specifies the maximum number of tasks to use in this function call.  Try to write this yourself; my solution is below if you get stuck. "));
    paragraphArray.push(paragraph);

    var codeLines = new Array();
    codeLines.push("proc hybridFindMaxInRange(array, lower, upper, numTasks) : real {");
    codeLines.push(getSpaces(4) + "if (lower == upper) { return array[lower]; }");
    codeLines.push(getSpaces(4) + "if (numTasks == 1) {");
    codeLines.push(getSpaces(8) + "return findMaxInRange(array, lower, upper);");
    codeLines.push(getSpaces(4) + "}");
    codeLines.push(getSpaces(4) + "var lowerMax, upperMax: real;");
    codeLines.push(getSpaces(4) + "var middle = ((upper - lower) / 2) + lower;");
    codeLines.push(getSpaces(4) + "var lowerTasks = numTasks / 2;");
    codeLines.push(getSpaces(4) + "var upperTasks = numTasks - lowerTasks;");
    codeLines.push(getSpaces(4) + "cobegin ref(lowerMax, upperMax) {");
    codeLines.push(getSpaces(8) + "lowerMax = hybridFindMaxInRange(array, lower, middle, lowerTasks);");
    codeLines.push(getSpaces(8) + "upperMax = hybridFindMaxInRange(array, middle+1, upper, upperTasks);");
    codeLines.push(getSpaces(4) + "}");
    codeLines.push(getSpaces(4) + "return max(lowerMax, upperMax);");
    codeLines.push("}");
    codeLines.push("");
    codeLines.push("proc hybridFindMax(array, numTasks) {");
    codeLines.push(getSpaces(4) + "return hybridFindMaxInRange(array, 0, array.numElements-1, numTasks);");
    codeLines.push("}");
    paragraphArray.push(createCodeBlock(codeLines));

    var paragraph = document.createElement("div");
    paragraph.appendChild(document.createTextNode("After this, add some code to test this just like the parallel version, including reporting the speedup over the serial.  I added another configurable constant for the number of threads I wanted to use.  I actually ran a number of tests, slowly increasing n.  The parallel test started taking too much time, so I had to comment it out.  Here are the results of one of my tests:"));
    paragraph.appendChild(document.createElement("br"));
    paragraph.appendChild(createCodeNode(document.createTextNode("$ ./a.out --n=100000000 --threads=8")));
    paragraph.appendChild(document.createElement("br"));
    paragraph.appendChild(createCodeNode(document.createTextNode("...")));
    paragraph.appendChild(document.createElement("br"));
    paragraph.appendChild(createCodeNode(document.createTextNode("SERIAL test: found the max to be 1.0 in 6.5324 seconds.")));
    paragraph.appendChild(document.createElement("br"));
    paragraph.appendChild(createCodeNode(document.createTextNode("HYBRID test: found the max to be 1.0 in 0.816864 seconds.")));
    paragraph.appendChild(document.createElement("br"));
    paragraph.appendChild(createCodeNode(document.createTextNode("The hybrid achieved a 7.99692x speedup over the serial trial!")));
    paragraphArray.push(paragraph);

    var paragraph = document.createElement("div");
    paragraph.appendChild(document.createTextNode("That's much better!  This gave us some actual speedup!  We've done a lot here.  There is, however, one way to do this entire thing in just one line of Chapel code.  This uses a parallel algorithm style called a reduction, which is a single pairwise operation applied to an array using a parallel divide-and-conquer as appropriate.  Here's how to write that single line:"));
    paragraphArray.push(paragraph);

    var codeLines = new Array();
    codeLines.push("maximum = max reduce realArray;");
    paragraphArray.push(createCodeBlock(codeLines));

    var paragraph = document.createElement("div");
    paragraphArray.push(paragraph);
    paragraph.appendChild(document.createTextNode("For comparison, here is "));
    paragraph.appendChild(createTextLink("my code", getPublicFileLink("chapel/ChapelTutorial.chpl")));
    paragraph.appendChild(document.createTextNode(" for this tutorial.  Inside I commented out sections instead of deleted them so you might be able to find whatever section you were working on."));

    var paragraph = document.createElement("div");
    paragraphArray.push(paragraph);
    paragraph.innerHTML += "<b>Acknowledgements</b>: Thanks to Ernie Heyder for doing ALL the proofreading for early versions of this.  Thanks to Brad Chamberlain both for pointing out errors and all his work on the Chapel project.  Thanks to David Bunde for his own <a href = \"http://faculty.knox.edu/dbunde/teaching/chapel/\">excellent tutorial</a> and for working with me on our workshops at SC.";

    createResourcePage(titleText, summaryText, paragraphArray);
}


/**
 * Builds the page describing the resources I have for advising Plymouth State students.
 */
function generateAdvisingPage() {

    var titleText = "Plymouth State CS&T Advising Resources";
    var summaryText = "Resources: I'm happy to print any of these out for you.  If you're getting ready for an advising meeting, please let me know you need them beforehand.";

    var paragraphContentsArray = new Array();

    //list of resources
    var courseSelection = document.createDocumentFragment();
    var courseSelectionHeader = document.createElement("h2");
    courseSelectionHeader.appendChild(toNode("Course Selection"));

    //instructions before your meeting
    var prepInstructions = document.createElement("p");
    prepInstructions.appendChild(document.createTextNode("Before you meet with your advisor, you should be prepared with courses you want to take next semester as well as having your major requirements planned out to graduation.  For Gen Ed choices, you should have at least one or two alternates for each course already chosen.  Do not show up to your meeting unprepared!"));

    var resourceList = document.createElement("ul");

    //next add the flowchart
    var courseRequirementChart = document.createElement("li");
    resourceList.appendChild(courseRequirementChart);
    appendChildrenTo(resourceList.lastChild, [toNode("Requirements Charts: a flowchart showing course pre-requirements.  ("), createTextLink("CS", getPublicFileLink("advising/csAdvisingFlowChart.pdf")), toNode(", "), createTextLink("IT", getPublicFileLink("advising/itAdvisingFlowChart.pdf")), ", ", createTextLink("EMTR", getPublicFileLink("advising/emtrAdvisingFlowChart.pdf")), toNode(")")]);

    //suggested schedules
    /*
    resourceList.appendChild(document.createElement("li"));
    appendChildrenTo(resourceList.lastChild, [toNode("Suggested Schedules: reasonable course options to take each semester  ("), createTextLink("CS", getPublicFileLink("advising/csSuggestedSchedules.pdf")), toNode(", "), createTextLink("IT", getPublicFileLink("advising/itSuggestedSchedules.pdf")), toNode(")")]);
    */

    //Degree Checklist
    resourceList.appendChild(document.createElement("li"));
    appendChildrenTo(resourceList.lastChild, ["Degree checklists are available outside the department office."]);

    //Schedule Grid
    resourceList.appendChild(document.createElement("li"));
    appendChildrenTo(resourceList.lastChild, ["The ", createTextLink("Course Schedule Planning Grid", "http://www.plymouth.edu/office/registrar/files/2011/04/0000014285-planning_grid.pdf"), " is very helpful for making sure you don't have overlapping courses."]);

    //new students info
    //TODO: add your own document
    resourceList.appendChild(document.createElement("li"));
    appendChildrenTo(resourceList.lastChild, [toNode("New students Info: "), createTextLink("Registrar's guide", "https://www.plymouth.edu/office/registrar/new-students/"), toNode(", "), createTextLink("CS&T guide", getPublicFileLink("advising/firstSemesterCourses.pdf")), toNode(".")]);

    appendChildrenTo(courseSelection, [courseSelectionHeader, prepInstructions, resourceList]);

    //class schedule grid
    /*
    resourceList.appendChild(document.createElement("li"));
    resourceList.lastChild.appendChild(document.createTextNode("Empty Course Schedule Grid.  Nice for planning out your semester.  ("));
    resourceList.lastChild.appendChild(document.createElement("a"));
    resourceList.lastChild.lastChild.href = "http://www5.wittenberg.edu/sites/default/files/u7/classschedulegrid.pdf";
    resourceList.lastChild.lastChild.appendChild(document.createTextNode(".pdf"));
    resourceList.lastChild.appendChild(document.createTextNode(")"));

    //major info page
    resourceList.appendChild(document.createElement("li"));
    resourceList.lastChild.appendChild(document.createTextNode("General major information.  ("));
    resourceList.lastChild.appendChild(document.createElement("a"));
    resourceList.lastChild.lastChild.href = "http://www5.wittenberg.edu/sites/default/files/media/computer_science/forms/ComputerScience-DeptInfoSheet.pdf";
    resourceList.lastChild.lastChild.appendChild(document.createTextNode(".pdf"));
    resourceList.lastChild.appendChild(document.createTextNode(")"));

    //open course listings
    resourceList.appendChild(document.createElement("li"));
    resourceList.lastChild.appendChild(document.createElement("a"));
    resourceList.lastChild.lastChild.href = "http://www.wittenberg.edu/academics/courselisting.php";
    resourceList.lastChild.lastChild.appendChild(document.createTextNode("Open Course Listings"));

    //registrar's catalog
    resourceList.appendChild(document.createElement("li"));
    resourceList.lastChild.appendChild(document.createElement("a"));
    resourceList.lastChild.lastChild.href = "http://www5.wittenberg.edu/academics/cataloghome.html";
    resourceList.lastChild.lastChild.appendChild(document.createTextNode("Registrar's Course Catalog"));

    //registrar's forms
    resourceList.appendChild(document.createElement("li"));
    resourceList.lastChild.appendChild(document.createElement("a"));
    resourceList.lastChild.lastChild.href = "http://www5.wittenberg.edu/administration/registrar/forms.html";
    resourceList.lastChild.lastChild.appendChild(document.createTextNode("Registrar Forms"));

    //My Witt
    resourceList.appendChild(document.createElement("li"));
    resourceList.lastChild.appendChild(document.createElement("a"));
    resourceList.lastChild.lastChild.href = "https://my.wittenberg.edu/";
    resourceList.lastChild.lastChild.appendChild(document.createTextNode("MyWitt"));*/

    //add the resource list to the contents
    paragraphContentsArray.push(courseSelection);

    //list of resources
    var generalAdvice = document.createDocumentFragment();
    var generalAdviceHeader = document.createElement("h2");
    generalAdviceHeader.appendChild(toNode("Info for all CS&T Students"));

    var resourceList = document.createElement("ul");

    //my expectations
    resourceList.appendChild(document.createElement("li"));
    appendChildrenTo(resourceList.lastChild, ["My ", createTextLink("expectations for CS&T students", HOME + "expectations.php"), "."]);

    //tutoring info
    resourceList.appendChild(document.createElement("li"));
    appendChildrenTo(resourceList.lastChild, [createTextLink("Evening tutoring ", HOME + "eveningTutoring.php"), "information."]);

    appendChildrenTo(generalAdvice, [generalAdviceHeader, resourceList]);
    paragraphContentsArray.push(generalAdvice);

    createResourcePage(titleText, summaryText, paragraphContentsArray);
}

/**
 * Builds the page describing what is helpful for me for recommendations.
 */
function generateReferencesPage() {

    var titleText = "Reference Request FAQ";
    //first created in Spring 2013
    var summaryText = "I get a lot of requests for references and recommendation letters in the spring semesters.  I created this page to help answer the questions students have about recommendations.  It seemed prudent for me to organize some common thoughts so that I could put my expectations all in one place and provide as many excellent references as possible.";

    var paragraphs = new Array();

    //will you write a rec for me?
    var div = document.createElement("div");
    div.appendChild(document.createElement("b"));
    div.lastChild.appendChild(document.createTextNode("Will you write a recommendation for me?"));
    div.appendChild(document.createElement("br"));
    div.appendChild(document.createTextNode("The answer to this question is almost always \"Yes\".  I really enjoy providing a reference for excellent students.  If you're not certain whether you deserve such a thing, here's a list of some reasons you might be excellent:"));
    div.appendChild(document.createElement("ul"));
    div.lastChild.appendChild(document.createElement("li"));
    div.lastChild.lastChild.appendChild(document.createTextNode("You do really well in my classes.  (An A- or better is usually good, but this depends on the level of the class.)  The more courses you've taken from me, the more I can use that to write about you.  Improvement over time is definitely something I would like to tell people you've done!"));
    div.lastChild.appendChild(document.createElement("li"));
    div.lastChild.lastChild.appendChild(document.createTextNode("You've been an helpful assistant to me in some way.  Examples: supplemental instructor, grader, teaching assistant, faculty aide, or departmental assistant.  Responsibility and work ethic really come through in these roles.  This is especially true if you did any teaching during that time, because then I've gotten lots of feedback about you."));
    div.lastChild.appendChild(document.createElement("li"));
    div.lastChild.lastChild.appendChild(document.createTextNode("You've done some cool independent project(s) with me.  In this case, I really want to tell people about it!  Usually you'll be applying for jobs where this sort of accomplishment is highly valued.  Let's make sure you get the proper recognition for it when you're hunting around!"));
    div.lastChild.appendChild(document.createElement("li"));
    div.lastChild.lastChild.appendChild(document.createTextNode("You've done the above things... just not with me.  Although I won't be able to write about these accomplishments in the same personal way, it's still good for me to mention them."));
    paragraphs.push(div);

    //how do I ask for a recommendation?
    var div = document.createElement("div");
    div.appendChild(document.createElement("b"));
    div.lastChild.appendChild(document.createTextNode("How do I ask you for a recommendation?"));
    div.appendChild(document.createElement("br"));
    div.appendChild(document.createTextNode("Send me an email.  Okay, there are a few things I should be clear about:"));
    div.appendChild(document.createElement("ul"));
    div.lastChild.appendChild(document.createElement("li"));
    div.lastChild.lastChild.appendChild(document.createTextNode("Ask before you commit me.  Please don't tell me I should expect a call or an email from someone before I agree to say nice things about you."));
    div.lastChild.appendChild(document.createElement("li"));
    div.lastChild.lastChild.appendChild(document.createTextNode("Let me know what kind of reference you need.  Do I need to talk to someone or fill out an online form or write a recommendation letter?"));
    div.lastChild.appendChild(document.createElement("li"));
    div.lastChild.lastChild.appendChild(document.createTextNode("Let me know what your timeline is.  When will I need to submit the first recommendation by?"));
    div.lastChild.appendChild(document.createElement("li"));
    div.lastChild.lastChild.appendChild(document.createTextNode("If you want a written recommendation, give me lots of time so I can make sure to include all the appropriate awesomeness.  Two weeks is generally enough time, but my queue for recommendations-to-write can get pretty long in late January and February.  More time is definitely better.  Keep in mind that if I've written something for you before, that will really speed up the process."));
    paragraphs.push(div);

    //what do I do after asking?
    var div = document.createElement("div");
    div.appendChild(document.createElement("b"));
    div.lastChild.appendChild(document.createTextNode("What should I do after you say okay?"));
    div.appendChild(document.createElement("ul"));
    div.lastChild.appendChild(document.createElement("li"));
    div.lastChild.lastChild.appendChild(document.createTextNode("Tell me what I have to do.  Do I need to: email letters to people; hand you a letter in a signed, sealed envelope; mail a sealed letter to someone; follow the directions I'll get in an email; or do something else entirely?"));
    div.lastChild.appendChild(document.createElement("li"));
    div.lastChild.lastChild.appendChild(document.createTextNode("If I need to physically mail a letter somewhere, please give me an envelope to mail it in, with all the proper postage and the address already filled out.  I'll put my letter in that envelope."));
    div.lastChild.appendChild(document.createElement("li"));
    div.lastChild.lastChild.appendChild(document.createTextNode("Remind me about your awesomeness.  It's generally a good idea to point out which classes you've taken with me and how you did in them.  It's especially helpful to let me know about other things you've done that I might not be aware of.  You don't have to send me a complete resume; a brief list is okay."));
    div.lastChild.appendChild(document.createElement("li"));
    div.lastChild.lastChild.appendChild(document.createTextNode("Pay attention to the dates.  I'll let you know each time I provide a reference.  If it's getting close to a due date, it's completely acceptable to remind me.  I will not be offended in any way if you check in on my progress!"));
    div.lastChild.appendChild(document.createElement("li"));
    div.lastChild.lastChild.appendChild(document.createTextNode("If new opportunities arise you want to apply for, let me know about them so I can help you out with them too.  It's completely normal for more options to become available than the initial list you send me."));
    paragraphs.push(div);

    //Add another section: what am I going to do/write about?

    createResourcePage(titleText, summaryText, paragraphs);

}

/**
 * Creates a page with the weekly schedule.
 */
function loadSchedulePage() {
    var semesterIndex = getParameterByName('semesterIndex', 0);
    var semester = semesters[semesterIndex];

    //get the type of schedule
	var availabilityReason = WeeklySchedule.prototype.FOR_CLASS_QUESTIONS;
	if (getParameterByName('forMeetings', 'false') == 'true') {
		availabilityReason = WeeklySchedule.prototype.FOR_MEETINGS;
	}
    semester.generateWeeklySchedulePage(availabilityReason);
}

/**
 * Builds the page describing the resources I have for advising students
 */
function generateResourcesPage() {

    var titleText = "Kyle's Resources";
    var summaryText = "These are various resources I've compiled into one helpful (for me) site.  They are broad and mostly unorganized.  Enjoy!";

    var paragraphContents = new Array();

    //academic resources
    var academicResources = document.createDocumentFragment();
    academicResources.appendChild(document.createTextNode("Academic Resources:"));
    academicResources.appendChild(document.createElement("ul"));
    academicResources.lastChild.setAttribute("class", "disc");

    //Expectations
    academicResources.lastChild.appendChild(document.createElement("li"));
    appendChildrenTo(academicResources.lastChild.lastChild, [createTextLink("Expectations", "expectations.php"), toNode(" I have of students.")]);

    //Advising
    academicResources.lastChild.appendChild(document.createElement("li"));
    appendChildrenTo(academicResources.lastChild.lastChild, [createTextLink("Advising resources", "advising.php"), toNode(" for CS, IT, and EMTR majors.")]);

    //Evening Tutoring
    academicResources.lastChild.appendChild(createElementWithChildren("li", [createLink("Evening Tutoring", "eveningTutoring.php"), " occurs four nights a week (Monday, Tuesday, Wednesday, Thursday).  Department tutors are on-hand to help answer questions!"]));

    //Recommendations
    academicResources.lastChild.appendChild(createElementWithChildren("li", ["My ", createLink("Recommendations FAQ", "references.php"),  " should answer many of your questions about using me as a reference or getting a letter of recommendation."]));

    //LaTeX lecture notes
    academicResources.lastChild.appendChild(createElementWithChildren("li", [createLink("LaTeX lecture notes package", "lectureNotesLatexStyle.php"), ".  It's designed around the Socratic Method and generates both Instructor and Student versions of the notes in case you want to distribute them without giving away all the answers to questions and exercises."]));

    //Induction
    academicResources.lastChild.appendChild(createElementWithChildren("li", [createLink("Induction Helpers", "inductionRoadMap.php"), ": a few documents I made to help understand mathematical induction."]));
    //add it!
    paragraphContents.push(academicResources);

    //Department Student Help
    academicResources.lastChild.appendChild(createElementWithChildren("li", [createLink("I want to be a tutor or lab assistant", "departmentTutors.php"), " has some notes about how you can get hired to work for the department."]));



    //programming resources
    var programmingResources = document.createDocumentFragment();
    programmingResources.appendChild(document.createTextNode("Programming Resources:"));
    programmingResources.appendChild(document.createElement("ul"));
    programmingResources.lastChild.setAttribute("class", "disc");
    //terminal tutorial
    programmingResources.lastChild.appendChild(document.createElement("li"));
    appendChildrenTo(programmingResources.lastChild.lastChild, [toNode("I wrote a "), createTextLink("terminal tutorial", HOME + "?resource=terminalTutorial"), toNode(" for Linux/Unix/Mac.")]);
    programmingResources.lastChild.appendChild(document.createElement("li"));
    appendChildrenTo(programmingResources.lastChild.lastChild, [toNode("I made an FAQ to help get your computer to "), createTextLink("do things the department computers do", HOME + "labVsHomeComputer.php"), toNode(".")]);
    //web-interpreter
    programmingResources.lastChild.appendChild(document.createElement("li"));
    programmingResources.lastChild.lastChild.appendChild(document.createTextNode("Multi-language Web Tools: "));
    programmingResources.lastChild.lastChild.appendChild(document.createElement("ul"));
    programmingResources.lastChild.lastChild.lastChild.appendChild(document.createElement("li"));
    programmingResources.lastChild.lastChild.lastChild.lastChild.appendChild(createTextLink("repl.it","http://repl.it/"));
    programmingResources.lastChild.lastChild.lastChild.lastChild.appendChild(document.createTextNode(" is an elegant web-interpreter for many languages."));
    programmingResources.lastChild.lastChild.lastChild.appendChild(document.createElement("li"));
    programmingResources.lastChild.lastChild.lastChild.lastChild.appendChild(createTextLink("Compile Online","http://www.compileonline.com/"));
    programmingResources.lastChild.lastChild.lastChild.lastChild.appendChild(document.createTextNode(" can compile/interpret a bunch of common languages."));
    //chapel
    programmingResources.lastChild.appendChild(document.createElement("li"));
    programmingResources.lastChild.lastChild.appendChild(createTextLinkTemp("http://chapel.cray.com/", "Chapel"));
    programmingResources.lastChild.lastChild.appendChild(document.createTextNode(":"));
    var chapelCheetSheat = document.createElement("div");
    chapelCheetSheat.innerHTML = "Cray's Chapel <a href = \"http://chapel.cray.com/spec/quickReference.pdf\">Cheat Sheet</a> (Quick Reference Sheet).";
    var davidTutorial = document.createElement("div");
    davidTutorial.appendChild(createTextLink("David Bunde", "http://faculty.knox.edu/dbunde/"));
    davidTutorial.innerHTML += "'s <a href = \"http://faculty.knox.edu/dbunde/teaching/chapel/\">tutorial</a>.";
    var myTutorial = document.createElement("div");
    myTutorial.innerHTML = "My <a href = \"" + HOME + "?resource=chapelTutorial\">tutorial</a> for programmers.";
    var chapelList = createList(false, [chapelCheetSheat, davidTutorial, myTutorial]);
    programmingResources.lastChild.lastChild.appendChild(chapelList);
    //LaTeX
    var latexResources = document.createElement("li");
    var libreOfficeDotRemoval = document.createElement("span");
    appendChildrenTo(libreOfficeDotRemoval, ["I make my figures in ", createTextLink("LibreOffice", "http://www.libreoffice.org/"), ".  Unfortunately, the pdfs it creates have extra dots that are viewable in default Adobe settings.  Here are ", createTextLink("instructions to remove the dots", "http://stackoverflow.com/questions/14521626/false-dots-around-circles-in-pdf-export-of-libreoffice-draw"), "."]);
    appendChildrenTo(latexResources, ["LaTeX:", createList(false, [createTextLink("deTeXify", "http://detexify.kirelabs.org/classify.html"), createTextLink("TeXmaker", "http://www.xm1math.net/texmaker/"), createTextLink("Sage Math Cloud", "https://cloud.sagemath.com/"), libreOfficeDotRemoval])]);
    programmingResources.lastChild.appendChild(latexResources);
    //java
    programmingResources.lastChild.appendChild(document.createElement("li"));
    programmingResources.lastChild.lastChild.appendChild(createTextLinkTemp("http://www.java.com/en/", "Java"));
    programmingResources.lastChild.lastChild.appendChild(document.createTextNode(":  "));

    var pythonToJavaTutorial = document.createElement("span");
    appendChildrenTo(pythonToJavaTutorial, ["My ", createTextLink("Python-to-Java tutorial", HOME + "pythonToJavaTutorial/start.php"), ".  All you need is about a semester of Python."]);
    programmingResources.lastChild.lastChild.appendChild(createList(false, [createTextLink("Java 8 API", "http://docs.oracle.com/javase/8/docs/api/"), createTextLink("Java 7 API", "http://docs.oracle.com/javase/7/docs/api/index.html"), pythonToJavaTutorial]));
    //HTML and Javascript
    programmingResources.lastChild.appendChild(document.createElement("li"));
    programmingResources.lastChild.lastChild.appendChild(toNode("JavaScript:"));
    var dynamicallyLoadingJS = document.createElement("span");
    appendChildrenTo(dynamicallyLoadingJS, ["I've used this ", createTextLink("tutorial for dynamically loading JS", "http://www.sergiopereira.com/articles/prototype.js.html"), "."]);
    programmingResources.lastChild.lastChild.appendChild(createList(false, [createTextLink("w3school's Javascript reference", "http://www.w3schools.com/jsref/default.asp"), createTextLink("w3schools home", "http://www.w3schools.com/"), createTextLink("prototype.js", "http://prototypejs.org/"), dynamicallyLoadingJS]));

    //Python
    programmingResources.lastChild.appendChild(document.createElement("li"));
    var python = document.createDocumentFragment();
    var thinkPython = document.createDocumentFragment();
    appendChildrenTo(thinkPython, ["I use ", createTextLink("Allen Downey", "http://www.allendowney.com/"), "'s book ", createTextLink("Think Python", "http://www.greenteapress.com/thinkpython/thinkpython.html"), "."]);
    var pyenv = document.createDocumentFragment();
    appendChildrenTo(pyenv, ["I use ", createTextLink("pyenv to automate environments", "https://www.brianthicks.com/2015/04/10/pyenv-your-python-environment-automated/"), " since Python has many versions."]);
    appendChildrenTo(python, [createTextLink("Python", "https://www.python.org/"), createList(false, [thinkPython, pyenv])]);
    programmingResources.lastChild.lastChild.appendChild(python);

    //R
    programmingResources.lastChild.appendChild(document.createElement("li"));
    programmingResources.lastChild.lastChild.appendChild(createTextLinkTemp("http://www.r-project.org/", "R"));
    programmingResources.lastChild.lastChild.appendChild(document.createTextNode(": I created a very basic "));
    programmingResources.lastChild.lastChild.appendChild(createTextLinkTemp("http://www4.wittenberg.edu/academics/mathcomp/kburke/rTutorial.html", "R tutorial"));
    programmingResources.lastChild.lastChild.appendChild(document.createTextNode(" for those interested in trying it out.  It assumes you have programming experience."));
    //pair programming
    programmingResources.lastChild.appendChild(document.createElement("li"));
    programmingResources.lastChild.lastChild.appendChild(document.createTextNode("Pair Programming: here are some "));
    programmingResources.lastChild.lastChild.appendChild(createTextLink("resources", HOME + "?resource=pairProgramming"));
    programmingResources.lastChild.lastChild.appendChild(document.createTextNode(" for pair programming."));
    var programmingGames = document.createElement("li");
    var codeMonkey = document.createDocumentFragment();
    appendChildrenTo(codeMonkey, [createTextLink("Code Monkey", "https://www.brainpop.com/games/codemonkeyrealcoding/"), ", a fun game for learning Python-esque programming."]);
    var helloWorld = document.createDocumentFragment();
    appendChildrenTo(helloWorld, [createTextLink("Hello World Quiz", "http://helloworldquiz.com/#/game"), ": see if you can identify the programming language from the Hello, World! program."]);
    var codeCombat = createElementWithChildren("span", [createTextLink("Code Combat", "https://codecombat.com/"), ", a dungeon-crawler adventure game that uses coding to control the main character!"]);
    var codinGame = document.createDocumentFragment();
    appendChildrenTo(codinGame, [createTextLink("CodinGame", "https://www.codingame.com/start"), ", a coding game with multiple languages you can use to choose from!"]);
    var elevatorSaga = document.createDocumentFragment();
    appendChildrenTo(elevatorSaga, [createTextLink("Elevator Saga", "http://play.elevatorsaga.com/"), ", a sequence of JavaScript challenges that use elevator efficiency."]);
    var untrustedGame = document.createDocumentFragment();
    appendChildrenTo(untrustedGame, [createTextLink("Untrusted", "http://alexnisnevich.github.io/untrusted/"), ", a really difficult JavaScript game where you write code to solve 2-D puzzles."]);
    appendChildrenTo(programmingGames, ["Programming Games:", createList(false, [codeMonkey, helloWorld, codeCombat, codinGame, elevatorSaga, untrustedGame])]);
    programmingResources.lastChild.lastChild.appendChild(programmingGames);
    //add it!
    paragraphContents.push(programmingResources);



    //magic resources
    var magicResources = document.createDocumentFragment();
    magicResources.appendChild(toNode("Magic:TG Resources:"));

    //CardPriceMonkey
    var bot = createElementWithChildren("span", [createElementWithChildren("strong", ["CardPriceMonkey"]), ": I maintain a ", createLink("PostgreSQL", "http://www.postgresql.org/"), " database of my cards.  You can find out more about this by talking to the GoogleTalk bot CardPriceMonkey@gmail.com.  (Sometimes the bot is down, sorry!)  The bot can tell you which cards I own and shows prices from ", createLink("TCGPlayer", "http://shop.tcgplayer.com/magic/product/show?partner=CDPCMKY"), "."]);

    //AMTGRPG
    var amtgrpg = createElementWithChildren("span", [createElementWithChildren("strong", ["AMTGRPG"]), ": I created a ", createLink("Magic:TG role-playing game", HOME + "magicRPG.php"), ".  There are lots of homebrewed Magic RPGs out there.  This one is different because: ", createList(false, ["There are no character sheets, just the deck each player is using.", "Players build their decks from a limited, but random, card pool.", "The GM does not have a deck; enemies are similar to Planeswalkers.", "Encounters have a strategy board game feel (the role-playing factor is a bit low)."])]);

    //chaosDraft
    var chaosDraft = createElementWithChildren("span", [createElementWithChildren("strong", ["Chaos Draft"]), ": I created a ", createLink("Chaos Draft", HOME + "gaming/chaosDraft/"), " format that adds random effects to the drafting process."]);

    //mediocre magic
    var mediocreMagic = createElementWithChildren("span", [createElementWithChildren("strong", ["Mediocre Magic"]), ": I seldom post to ", createLink("Mediocre Magic", "http://mediocre-magic.blogspot.com/"), ", my casual magicking blog."]);

    //lands
    var manaGathering = createElementWithChildren("span", [createElementWithChildren("strong", ["Lands Guide"]), ": ", createLink("Mana Gathering", "http://www.managathering.com/"), ", is a good page with multi-colored lands all listed out."]);

    //guide to shipping cards
    var shippingCards = createElementWithChildren("span", [createElementWithChildren("strong", ["Shipping Cards"]), ": Pucatrade's guide to ", createTextLink("shipping magic cards", "https://pucatrade.com/shipping"), "."]);

    //guide to insuring collections
    var insuringCards = createElementWithChildren("span", [createElementWithChildren("strong", ["Insuring Cards"]), ": A post on ", createTextLink("MTGPrice.com", "http://www.mtgprice.com/"), " covers ", createTextLink("insuring your collection", "http://blog.mtgprice.com/2014/10/26/circle-of-protection-life/"), "."]);

    //add all the Magic resources
    magicResources.appendChild(createList(false, [bot, amtgrpg, chaosDraft, mediocreMagic, manaGathering, shippingCards, insuringCards]));
    //add it!
    paragraphContents.push(magicResources);


    //Pokemon Go Resources
    var pogoResources = document.createDocumentFragment();
    appendChildrenTo(pogoResources, ["Pokemon Go Resources:"]);

    //countdownTimer
    var p337Countdowns = createElementWithChildren("span", [createLink("Event Countdown Timer", "https://www.p337.info/pokemongo/"), ": gives timers for all current and upcoming events."]);

    //DPS/TDO Spreadsheet for choosing best moves
    var dpsSpreadsheet = createElementWithChildren("span", [createLink("Comprehensive DPS/TDO Spreadsheet", "https://pokemongo.gamepress.gg/comprehensive-dps-spreadsheet"), ", which I use for figuring out which moves are best."]);

    //Evolution Calculator
    var evolutionCalculator = createElementWithChildren("span", [createLink("Evolution Calculator", "https://pokemon.gameinfo.io/en/tools/evolution-calculator"), ": Gives a CP range for evolving a pokemon."]);

    //Silph Road
    var silphRoad = createElementWithChildren("span", [createLink("Silph Road", "https://thesilphroad.com/"), ", which has just about everything else you need (except the Pokedex was broken the last time I checked)."]);

    pogoResources.appendChild(createList(false, [p337Countdowns, dpsSpreadsheet, evolutionCalculator, silphRoad]));
    paragraphContents.push(pogoResources);


    //D&D resources
    var dndResources = document.createDocumentFragment();
    dndResources.appendChild(document.createElement("a"));
    dndResources.lastChild.href = "https://www.wizards.com/DnD/";
    dndResources.lastChild.appendChild(document.createTextNode("D&D"));
    dndResources.appendChild(document.createTextNode(" resources:"));
    dndResources.appendChild(document.createElement("ul"));
    dndResources.lastChild.setAttribute("class", "disc");
    //Kiznit's Sheet
    dndResources.lastChild.appendChild(document.createElement("li"));
    dndResources.lastChild.lastChild.appendChild(document.createTextNode("I often use Kiznit's Nice "));
    dndResources.lastChild.lastChild.appendChild(document.createElement("a"));
    dndResources.lastChild.lastChild.lastChild.href = "http://www.koboldstyle.org/stuff/4eCharacterSht_kiznit_v1.pdf";
    dndResources.lastChild.lastChild.lastChild.appendChild(document.createTextNode("Character Sheet"));
    dndResources.lastChild.lastChild.appendChild(document.createTextNode("."));
    //Power Cards
    dndResources.lastChild.appendChild(document.createElement("li"));
    dndResources.lastChild.lastChild.appendChild(document.createTextNode("Power cards are very helpful for keeping the game moving.  I made my own template cards for printing and handwriting ("));
    dndResources.lastChild.lastChild.appendChild(document.createElement("a"));
    dndResources.lastChild.lastChild.lastChild.href = getPublicFileLink("gaming/DnD/powerCardsBlankAndTemplate.pdf");
    dndResources.lastChild.lastChild.lastChild.appendChild(document.createTextNode(".pdf"));
    dndResources.lastChild.lastChild.appendChild(document.createTextNode(").  Alternatively, if you use "));
    dndResources.lastChild.lastChild.appendChild(document.createElement("a"));
    dndResources.lastChild.lastChild.lastChild.href = "http://www.openoffice.org/";
    dndResources.lastChild.lastChild.lastChild.appendChild(document.createTextNode("Open"));
    dndResources.lastChild.lastChild.appendChild(document.createTextNode("/"));
    dndResources.lastChild.lastChild.appendChild(document.createElement("a"));
    dndResources.lastChild.lastChild.lastChild.href = "https://www.libreoffice.org/";
    dndResources.lastChild.lastChild.lastChild.appendChild(document.createTextNode("LibreOffice"));
    dndResources.lastChild.lastChild.appendChild(document.createTextNode(", you can use my raw template ("));
    dndResources.lastChild.lastChild.appendChild(document.createElement("a"));
    dndResources.lastChild.lastChild.lastChild.href = getPublicFileLink("gaming/DnD/powerCardsBlankAndTemplate.otg");
    dndResources.lastChild.lastChild.lastChild.appendChild(document.createTextNode(".otg"));
    dndResources.lastChild.lastChild.appendChild(document.createTextNode(") to create your own cards.  I made some sample cards ("));
    dndResources.lastChild.lastChild.appendChild(document.createElement("a"));
    dndResources.lastChild.lastChild.lastChild.href = getPublicFileLink("gaming/DnD/dorhailThistlefistPowers.pdf");
    dndResources.lastChild.lastChild.lastChild.appendChild(document.createTextNode(".pdf"));
    dndResources.lastChild.lastChild.appendChild(document.createTextNode(") for one character."));
    //add it!
    paragraphContents.push(dndResources);

    //Video Game resources
    var videoGameResources = document.createDocumentFragment();
    videoGameResources.appendChild(document.createTextNode("I play a bunch of the older Final Fantasy and Dragon Quest (Warrior) games.  Here are some .txt checklists I've made:"));
    videoGameResources.appendChild(document.createElement("ul"));
    videoGameResources.lastChild.setAttribute("class", "disc");
    //DQ V monster list
    videoGameResources.lastChild.appendChild(document.createElement("li"));
    videoGameResources.lastChild.lastChild.appendChild(document.createTextNode("Dragon Quest V alphabetical "));
    videoGameResources.lastChild.lastChild.appendChild(document.createElement("a"));
    videoGameResources.lastChild.lastChild.lastChild.href = getPublicFileLink("gaming/dragonQuest5MonsterChecklist.txt");
    videoGameResources.lastChild.lastChild.lastChild.appendChild(document.createTextNode("recruitable monster list"));
    videoGameResources.lastChild.lastChild.appendChild(document.createTextNode(" (DS version names)."));
    //FFVI rage list
    videoGameResources.lastChild.appendChild(document.createElement("li"));
    videoGameResources.lastChild.lastChild.appendChild(document.createTextNode("Final Fantasy VI alphabetical "));
    videoGameResources.lastChild.lastChild.appendChild(document.createElement("a"));
    videoGameResources.lastChild.lastChild.lastChild.href = getPublicFileLink("gaming/finalFantasy6RageChecklist.txt");
    videoGameResources.lastChild.lastChild.lastChild.appendChild(document.createTextNode("rage list"));
    videoGameResources.lastChild.lastChild.appendChild(document.createTextNode(" (GBA version names)."));
    //add it!
    paragraphContents.push(videoGameResources);

    createResourcePage(titleText, summaryText, paragraphContents);
}

/**
 * Creates a page with information about independent projects I've done with students.
 */
function createStudentProjectsPage() {

    var paragraphs = new Array();

    var current = createNiceTitledDiv("Current Projects");
    paragraphs.push(current);
    //Ben Borchard!
    var btborchardChrome = document.createDocumentFragment();
    btborchardChrome.appendChild(document.createTextNode("Ben Borchard '14: \"Chrome Applications and Extensions\".  (Independent Study, JanPlan 2014)"));
    //Hieu Phan!
    var hnphanJS = document.createDocumentFragment();
    hnphanJS.appendChild(document.createTextNode("Hieu Phan '14: \"HTML5 Game Developement\".  (Independent Study, JanPlan 2014)"));
    current.appendChild(createList(false, [btborchardChrome, hnphanJS]));

    var witt = createNiceTitledDiv("Projects with Wittenberg Students");
    paragraphs.push(witt);
    //Brittany Rickards!
    var brickardsUnicorn = document.createDocumentFragment();
    brickardsUnicorn.appendChild(document.createTextNode("Brittany Rickards '13: \"Earning Your Horn\".  (Independent Study: Comp 353, Fall 2012)  Brittany learned good OO design (sequential and parallel) and used that knowledge to implement a Java \"falling block\" game with unicorns!"));
    //Patrick Copeland!
    var patrickCopelandGo = document.createDocumentFragment();
    patrickCopelandGo.appendChild(createTextLink("Patrick Copeland", "http://userpages.wittenberg.edu/s12.pcopeland/index.html"));
    patrickCopelandGo.appendChild(document.createTextNode(" '12: \"Go and Monte-Carlo Tree Search Algorithm\".  (Honors Project, Fall 2011 and Spring 2012.)  Patrick wrote a game-playing program in Chapel and Python using advanced techniques and applied it to Go."));
    //Will Herrmann!
    var wherrmannWildCard = document.createDocumentFragment();
    wherrmannWildCard.appendChild(createTextLink("Will Herrmann", "http://www.journeymangames.net/about/"));
    wherrmannWildCard.appendChild(document.createTextNode(" '12: \"Creating a Fun Program that is Simple and Easy to Use\".  (Honors Project, Fall 2011.)  Will created "));
    wherrmannWildCard.appendChild(createTextLink("Wild Card Creator", "http://www.journeymangames.net/wild-card-creator/"));
    wherrmannWildCard.appendChild(document.createTextNode(", a character generator for the "));
    wherrmannWildCard.appendChild(createTextLink("Savage Worlds", "http://www.peginc.com/games.html#SavageWorlds"));
    wherrmannWildCard.appendChild(document.createTextNode(" tabletop role-playing game.  His Java implementation focused on user-centered and object-oriented design and utilized a SQLite database to manage content.  After graduating, Will formed "));
    wherrmannWildCard.appendChild(createTextLink("Journeyman Games", "http://www.journeymangames.net/"));
    wherrmannWildCard.appendChild(document.createTextNode(" and raised money through a successful Kickstarter drive to sell an improved version of his program, which he publicly released in August 2013."));
    //Andy Heinlein!
    var andyHeinleinMadRooks = document.createDocumentFragment();
    andyHeinleinMadRooks.appendChild(document.createTextNode("Andrew Heinlein '11: \"Mad Rooks\".  (Independent Study, Spring 2011.)  Andy created an Android app for the combinatorial game "));
    andyHeinleinMadRooks.appendChild(createTextLink("Mad Rooks", "http://www.marksteeregames.com/Mad_Rooks_rules.pdf"));
    andyHeinleinMadRooks.appendChild(document.createTextNode("."));
    //Aaron Dugger!
    var aaronDuggerMerkle = document.createDocumentFragment();
    aaronDuggerMerkle.appendChild(document.createTextNode("Aaron Dugger '10: \"Merkle Hash Trees\".  (Independent Study, Spring 2010.)  Aaron implemented the Merkle Tree Hash Scheme in Python.  This was the culmination of a semester of studying pseudorandomness and cryptography."));

    witt.appendChild(createList(false, [brickardsUnicorn, patrickCopelandGo, wherrmannWildCard, andyHeinleinMadRooks, aaronDuggerMerkle]));

    //Boston University
    var bu = createNiceTitledDiv("Projects with Boston University Students");
    paragraphs.push(bu);
    //Ryan & Bob
    var ryanAndBobAtropos = document.createDocumentFragment();
    ryanAndBobAtropos.appendChild(document.createTextNode("Ryan Fleisher '09 & Bob Solorio '09: \"Atropos for Facebook\".  (Independent Study, Spring 2009.)  Ryan and Bob implemented elements of Atropos in php to use in a Facebook app."));
    bu.appendChild(createList(false, [ryanAndBobAtropos]));

    //Working with Kyle
    var expectations = createNiceTitledDiv("Working with Kyle");
    paragraphs.push(expectations);
    //My expectations
    expectations.innerHTML += "Working on an independent project is like taking a class, but with extra responsibility.  You have to work the same 6-10 hours per week as with a regular upper-level course, plus 3 hours of personal study to replace the missed in-class time, <em>and</em> meet with me for an additional hour per week.  This seems like a lot, but the good news is that once you start working on original research you'll <em>want</em> to spend more time improving what you've made!";

    //Future Projects?
    var potentialProjects = createNiceTitledDiv("Potential Topics");
    paragraphs.push(potentialProjects);
    potentialProjects.appendChild(document.createTextNode("Here are some options for projects, in case you are looking for inspiration.  Please feel free to ask me about anything below or propose an idea of your own!"));

    futureProjectsList = new Array();
    var atroposUpdate = document.createTextNode("Atropos: add an HTML/JS version or an improved mechanical adversary.");
    futureProjectsList.push(atroposUpdate);
    var matchmakerUpdate = document.createTextNode("Matchmaker: add an HTML/JS version or a mechanical adversary.  A while back I did loads of analysis on states of this game; I would enjoy taking another look at this.");
    futureProjectsList.push(matchmakerUpdate);
    var dictatorUpdate = document.createTextNode("Dictator: a 2-player voting game that desperately needs a web interface.  Come ask me about this and I'll show you how it's played.");
    futureProjectsList.push(dictatorUpdate);
    var ncaafRanker = document.createDocumentFragment();
    ncaafRanker.appendChild(document.createTextNode("College Football Ranking: I'm really curious about ranking college football teams in a fair way.  I have a "));
    ncaafRanker.appendChild(createTextLink("ranking algorithm", "http://robotswatchingfootball.blogspot.com/"));
    ncaafRanker.appendChild(document.createTextNode(", but I'd like to improve it and measure it's performance.  I'm especially interested in finding algorithms that minimize the number of upsets and total point differences in upsets.  I'd really like to determine whether finding such a ranking is an NP-hard problem.  If so, does the algorithm I'm using create good approximations?"));
    futureProjectsList.push(ncaafRanker);
    var fjords = document.createDocumentFragment();
    fjords.appendChild(createTextLink("Fjords", "https://en.wikipedia.org/wiki/Fjords_%28board_game%29"));
    fjords.appendChild(document.createTextNode(": How hard is it to play this game?  What is the best strategy for the second phase (placing fields)?"));
    futureProjectsList.push(fjords);
    var tsuro = document.createDocumentFragment();
    tsuro.appendChild(createTextLink("Tsuro", "https://en.wikipedia.org/wiki/Tsuro"));
    tsuro.appendChild(document.createTextNode(": If all 8 players collude and can select whichever tiles are available on any move, can all 8 pieces survive placing all 35 tiles?  How would you write a program to determine this?"));
    futureProjectsList.push(tsuro);
    var collatz = document.createDocumentFragment();
    collatz.appendChild(createTextLink("Collatz Game", "http://combinatorialgametheory.blogspot.com/2010/08/game-description-collatz-game.html"));
    collatz.appendChild(document.createTextNode(": What are the nimbers for different game states?  How simply can you describe one state?  How would you write a program to evaluate this?  Can we find the nimbers for the first 100?"));
    futureProjectsList.push(collatz);
    var mcTrees = document.createTextNode("Randomized Tree Searches: How well does a Monte-Carlo Tree Search algorithm work on different games?  It performs well on Go, but what about Chess or Clobber or even an impartial game such as Nim?");
    futureProjectsList.push(mcTrees);


    potentialProjects.appendChild(createList(false, futureProjectsList));

    createResourcePage("Independent Projects", "I've supervised lots of student projects!", paragraphs);
}

/**
 * Creates a nice page that has a list of resources around a specific topic.
 */
function createResourcePage(titleText, summaryText, paragraphNodeList) {
    var contentNodeArray = new Array();

    //summary at top of the page
    //TODO: change this to have a maximum width.  Buffer more from the sides.
    var summaryParagraph = document.createElement("p");
    summaryParagraph.style.fontSize = "large";
    summaryParagraph.appendChild(document.createTextNode(summaryText));
    //add the summary to the content list
    contentNodeArray.push(summaryParagraph);

    //format all the paragraphs and add them to the list
    for (var i = 0; i < paragraphNodeList.length; i++) {
        var paragraphDiv = createNiceDiv();
        paragraphDiv.appendChild(paragraphNodeList[i]);
        contentNodeArray.push(paragraphDiv);
    }

    //add the closing comment to the end
    var closingDiv = document.createElement("div");
    closingDiv.style.textAlign = "center";
    closingDiv.style.fontSize = "small";
    closingDiv.appendChild(document.createTextNode("I'd love to add more things to this page; please let me know of anything you could suggest!"));
    contentNodeArray.push(closingDiv);

    //create the page
    generateMainPage(titleText, contentNodeArray);
}

/**
 * Creates Kyle's Research Main Page.
 */
function generateResearchPage() {

    var contentNodes = new Array();

    //research interests
    contentNodes.push(getResearchInterestsList());

    //ongoing research!
    var ongoing = createNiceTitledDiv("Ongoing Projects");
    contentNodes.push(ongoing);
    ongoing.appendChild(getHtmlOngoingResearchList());

    //student projects
    var students = createNiceTitledDiv("Student Research");
    contentNodes.push(students);
    students.appendChild(document.createElement("p"));
    students.lastChild.appendChild(document.createTextNode("I have had students work on awesome "));
    students.lastChild.appendChild(createTextLink("independent projects", HOME + "independentProjects.php"));
    students.lastChild.appendChild(document.createTextNode("."));

    //preprints
    var preprints = createNiceTitledDiv("Not-Yet Published");
    contentNodes.push(preprints);
    preprints.appendChild(getHtmlPreprintList());

    //publications
    var publications = createNiceTitledDiv("Publications");
    contentNodes.push(publications);
    publications.appendChild(getHtmlPublicationList());

    //presentations
    var presentations = createNiceTitledDiv("Presentations");
    contentNodes.push(presentations);
    presentations.appendChild(getHtmlPresentationList());


    generateMainPage("Kyle's Research", contentNodes);

}

/**
 * Gets a nice titled div with the current courses.
 */
function getCurrentCoursesDiv() {
    var currentSemester = createNiceTitledDiv("Current (Spring 2020) Courses:");
    currentSemester.appendChild(createList(false, [createTextLink("CS 2370: Intro Programming", HOME + "?course=2370"), createTextLink("CS 2990: Timed Programming", HOME + "?course=2990"), createTextLink("CS 4760: Senior Project", HOME + "?course=4760")]));

    //last semester
    //currentSemester.appendChild(createList(false, [createTextLink("CS 2370: Intro Programming", HOME + "?course=2370"), createTextLink("CS 2381: Data Structures", HOME + "?course=2381"), createLink("CS 4310: Operating Systems", HOME + "?course=4310"), createLink("CS 4760: Senior Project", HOME + "?course=4760")]));
    return currentSemester;
}

/**
 * Creates Kyle's Teaching Main Page.
 */
function generateTeachingPage() {

    var contentNodes = new Array();

    //current courses!
    contentNodes.push(getCurrentCoursesDiv());

    //past PlyState courses
    var plymouthPast = createNiceTitledDiv("Previous Plymouth State Courses:");
    var pastCourses = [];
    var courseListing = document.createElement("span");
    appendChildrenTo(courseListing, [createLink("CS 2370: Intro Programming", HOME + "?course=2370"), "  (Spring 2015, 2016, 2017, 2018, and 2019)"]);
    pastCourses.push(courseListing);
    var courseListing = document.createElement("span");
    appendChildrenTo(courseListing, [createLink("CS 2381: Data Structures", HOME + "?course=2381"), "  (Fall 2014, Spring 2015, Fall 2015, Spring 2016, Fall 2016, Fall 2017, Spring 2018 (for 3 weeks), and Fall 2018)"]);
    pastCourses.push(courseListing);
    var courseListing = document.createElement("span");
    appendChildrenTo(courseListing, [createLink("MA 3120: Linear Algebra", HOME + "?course=3120"), "  (Fall 2017)"]);
    pastCourses.push(courseListing);
    var courseListing = document.createElement("span");
    appendChildrenTo(courseListing, [createLink("CS 3240: Data Communication and Networks", HOME + "?course=3240"), toNode("  (Fall 2014 and 2015)")]);
    pastCourses.push(courseListing);
    var courseListing = createElementWithChildren("span", [createLink("CS 3780: Theory of Computation", HOME + "?course=3780"), "  (Fall 2016, 2017, 2018, and 2019)"]);
    pastCourses.push(courseListing);
    var courseListing = document.createElement("span");
    appendChildrenTo(courseListing, [createLink("CS 4140: Software Engineering", HOME + "?course=4140"), "  (Fall 2014, 2015, 2016, 2017, 2018, Summer 2019, and Fall 2019)"]);
    pastCourses.push(courseListing);
    var courseListing = document.createElement("span");
    appendChildrenTo(courseListing, [createLink("CS 4310: Operating Systems", HOME + "?course=4310"), "  (Spring 2017, 2018 and 2019)"]);
    pastCourses.push(courseListing);
    var courseListing = document.createElement("span");
    appendChildrenTo(courseListing, [createLink("CS 4760: Senior Project", HOME + "?course=4760"), toNode("  (Spring 2015, 2016, 2017, 2018, and 2019)")]);
    pastCourses.push(courseListing);
    plymouthPast.appendChild(createList(false, pastCourses));
    contentNodes.push(plymouthPast);

    //a2a
    var a2a = createNiceTitledDiv("A2A: Teaching Parallelism");
    a2a.appendChild(document.createTextNode("I contributed to the "));
    a2a.appendChild(createTextLinkTemp("http://www.accel2apps.org/home/index.php", "Accelerators to Applications (A2A)"));
    a2a.appendChild(document.createTextNode(" NSF project to introduce parallel computing concepts across an undergraduate program.  I wrote the materials for the Software Design and Algorithms curricula.  (Materials are still being added to the A2A site.)"));
    //add it!
    contentNodes.push(a2a);

    //colby courses!
    var currentSemester = createNiceTitledDiv("At Colby (2013-2014) I taught:");
    currentSemester.appendChild(document.createElement("ul"));
    currentSemester.lastChild.appendChild(document.createElement("li"));
    currentSemester.lastChild.lastChild.appendChild(createTextLink("Lab for CS 151: Computational Thinking", HOME + "?lab=151"));
    currentSemester.lastChild.lastChild.appendChild(document.createTextNode(" (Fall 2013 and Spring 2014)"));
    currentSemester.lastChild.appendChild(document.createElement("li"));
    currentSemester.lastChild.lastChild.appendChild(createTextLink("Lab for CS 231: Data Structures and Algorithms", HOME + "?lab=231"));
    currentSemester.lastChild.lastChild.appendChild(document.createTextNode(" (Fall 2013)"));
    currentSemester.lastChild.appendChild(document.createElement("li"));
    currentSemester.lastChild.lastChild.appendChild(createTextLink("CS 232: Computer Organization", HOME + "?course=232"));
    currentSemester.lastChild.lastChild.appendChild(document.createTextNode(" (Spring 2014)"));
    currentSemester.lastChild.appendChild(document.createElement("li"));
    currentSemester.lastChild.lastChild.appendChild(createTextLink("CS 325: Web Programming", HOME + "?course=325"));
    currentSemester.lastChild.lastChild.appendChild(document.createTextNode(" (Spring 2014)"));
    currentSemester.lastChild.appendChild(document.createElement("li"));
    currentSemester.lastChild.lastChild.appendChild(createTextLink("CS 333: Programming Languages", HOME + "?course=333"));
    currentSemester.lastChild.lastChild.appendChild(document.createTextNode(" (Fall 2013)"));
    //add it!
    contentNodes.push(currentSemester);

    //Wittenberg Courses  TODO: add links!
    var wittenbergCourses = createNiceTitledDiv("At Wittenberg (2009-2013) I taught:");
    wittenbergCourses.appendChild(document.createElement("ul"));
    wittenbergCourses.lastChild.appendChild(document.createElement("li"));
    wittenbergCourses.lastChild.lastChild.appendChild(document.createTextNode("WittSem 100: How to Play Board Games"));
    wittenbergCourses.lastChild.lastChild.appendChild(document.createTextNode(" (Fall 2011)"));
    wittenbergCourses.lastChild.appendChild(document.createElement("li"));
    wittenbergCourses.lastChild.lastChild.appendChild(document.createTextNode("Comp 121: Computing in the Arts & Sciences"));
    wittenbergCourses.lastChild.lastChild.appendChild(document.createTextNode(" (Fall 2009 and Spring 2012)"));
    wittenbergCourses.lastChild.appendChild(document.createElement("li"));
    wittenbergCourses.lastChild.lastChild.appendChild(document.createTextNode("Comp 150: Introduction to Computer Science"));
    wittenbergCourses.lastChild.lastChild.appendChild(document.createTextNode(" (Spring 2010, 2011, 2012 and Fall 2012)"));
    wittenbergCourses.lastChild.appendChild(document.createElement("li"));
    wittenbergCourses.lastChild.lastChild.appendChild(document.createTextNode("Math 171: Discrete Mathematical Structures"));
    wittenbergCourses.lastChild.lastChild.appendChild(document.createTextNode(" (Fall 2011, 2012)"));
    wittenbergCourses.lastChild.appendChild(document.createElement("li"));
    wittenbergCourses.lastChild.lastChild.appendChild(document.createTextNode("Comp 265: Programming Languages"));
    wittenbergCourses.lastChild.lastChild.appendChild(document.createTextNode(" (Spring 2010, 2011)"));
    wittenbergCourses.lastChild.appendChild(document.createElement("li"));
    wittenbergCourses.lastChild.lastChild.appendChild(document.createTextNode("Comp 275: Design and Analysis of Algorithms"));
    wittenbergCourses.lastChild.lastChild.appendChild(document.createTextNode(" (Fall 2010, 2011 and Spring 2013)"));
    wittenbergCourses.lastChild.appendChild(document.createElement("li"));
    wittenbergCourses.lastChild.lastChild.appendChild(document.createTextNode("Comp/Math 280: Introduction to Combinatorial Game Theory"));
    wittenbergCourses.lastChild.lastChild.appendChild(document.createTextNode(" (Fall 2010)"));
    wittenbergCourses.lastChild.appendChild(document.createElement("li"));
    wittenbergCourses.lastChild.lastChild.appendChild(document.createTextNode("Honr 300: Abstracting Games"));
    wittenbergCourses.lastChild.lastChild.appendChild(document.createTextNode(" (Spring 2013)"));
    wittenbergCourses.lastChild.appendChild(document.createElement("li"));
    wittenbergCourses.lastChild.lastChild.appendChild(document.createTextNode("Comp 353: Software Design"));
    wittenbergCourses.lastChild.lastChild.appendChild(document.createTextNode(" (Fall 2009, Fall 2010 and Spring 2012)"));
    wittenbergCourses.lastChild.appendChild(document.createElement("li"));
    wittenbergCourses.lastChild.lastChild.appendChild(document.createTextNode("Comp 380: Matrix Algorithms"));
    wittenbergCourses.lastChild.lastChild.appendChild(document.createTextNode(" (Fall 2011, 2012)"));
    //add it!
    contentNodes.push(wittenbergCourses);

    //BU courses
    var buCourses = createNiceTitledDiv("At Boston University (2007-2009) I taught:");
    buCourses.appendChild(document.createElement("ul"));
    buCourses.lastChild.appendChild(document.createElement("li"));
    buCourses.lastChild.lastChild.appendChild(document.createTextNode("CS 131: Combinatoric Structures"));
    buCourses.lastChild.lastChild.appendChild(document.createTextNode(" (Fall 2007)"));
    buCourses.lastChild.appendChild(document.createElement("li"));
    buCourses.lastChild.lastChild.appendChild(document.createTextNode("CS 132: Geometric Algorithms"));
    buCourses.lastChild.lastChild.appendChild(document.createTextNode(" (Spring 2008, 2009)"));
    //add it!
    contentNodes.push(buCourses);

    generateMainPage("Kyle's Teaching", contentNodes);

}

/**
 * Creates Kyle's homepage.
 */
function generateHomepage() {

    var contentNodeArray = new Array();

    //some pictures up top.
    var pictureRow = document.createElement("div");
    var pictureHeight = "200";
    pictureRow.style.textAlign = "center";
    pictureRow.appendChild(document.createElement("img"));
    pictureRow.lastChild.height = pictureHeight;
    pictureRow.lastChild.src = getPublicFileLink("KyleInSuit.jpg");
    pictureRow.lastChild.title = "Kyle might be clean-shaven.";
    pictureRow.appendChild(document.createTextNode(" "));
    pictureRow.appendChild(document.createElement("img"));
    pictureRow.lastChild.height = pictureHeight;
    pictureRow.lastChild.src = getPublicFileLink("images/ColbyBicentennialLibrary.jpg");
    pictureRow.lastChild.title = "Colby College during the Bicentennial";
    pictureRow.appendChild(document.createTextNode(" "));
    pictureRow.appendChild(document.createElement("img"));
    pictureRow.lastChild.height = pictureHeight;
    pictureRow.lastChild.src = getPublicFileLink("images/plymouthStateTreeFall.jpg");
    pictureRow.lastChild.title = "Plymouth State in the Fall";
    pictureRow.appendChild(document.createTextNode(" "));
    pictureRow.appendChild(document.createElement("img"));
    pictureRow.lastChild.height = pictureHeight;
    pictureRow.lastChild.src = getPublicFileLink("2015Beard.jpg");
    pictureRow.lastChild.title = "... or he might be working on his beard again.";
    contentNodeArray.push(pictureRow);


    //intro paragraph
    var introDiv = createNiceTitledDiv("Vital Info");
    var kyleSummary = document.createElement("p");
    appendChildrenTo(kyleSummary, ["Kyle is an Associate Professor and Chair of ", createTextLink("Computer Science and Technology", "http://www.plymouth.edu/department/computer-science/"), " at ", createTextLink("Plymouth State University", "http://www.plymouth.edu/"), "."]);
    var pmail = document.createElement("span");
    pmail.className = "plymouthMail";
    pmail.appendChild(toNode("Email: "));
    var schedule = document.createElement("span");
    appendChildrenTo(schedule, ["Spring 2020 ", createTextLink("Weekly Schedule", HOME + "?main=schedule")]);
    var vitalStats = createList(false, ["Office: Memorial 204", pmail, schedule, createTextLink("Weekly Game Lunch", HOME + "gameLunch.php")]);
    appendChildrenTo(introDiv, [kyleSummary, vitalStats]);
    //add it!
    contentNodeArray.push(introDiv);

    //current courses
    contentNodeArray.push(getCurrentCoursesDiv());

    //news items
    //contentNodeArray.push(getNewsList());

    //research interests
    contentNodeArray.push(getResearchInterestsList());

    //link to student projects
    var div = createNiceTitledDiv("Student Projects");
    var studentProjectsP = createElementWithChildren("p", ["Kyle has supervised many ", createLink("student projects", HOME + "independentProjects.php"), "."]);
    studentProjectsP.style.marginLeft = "10px";
    appendChildrenTo(div, [studentProjectsP]);
    contentNodeArray.push(div);

    //Social Media
    var div = createNiceTitledDiv("Social Media");
    var department = createElementWithChildren("span", [createLink("Department social media page", "https://www.plymouth.edu/department/computer-science/department-community/"), "."]);
    var linkedIn = createElementWithChildren("span", ["LinkedIn: ", createLink("My LinkedIn", "https://www.linkedin.com/in/kyle-burke-b1491a121/"), "; ", createLink("Department LinkedIn Group", "https://www.linkedin.com/groups/8593377"), ".  I don't connect with people I don't know, so please introduce yourself to me."]);
    var facebook = createElementWithChildren("span", ["Facebook: ", createLink("Department Facebook Group", "https://www.facebook.com/groups/607809675985989/"), ".  You must be an alum, member, or friend of the department to join.  (My personal policy towards students is that I won't attempt to friend you, but I will gladly accept all friend requests from you.)  Also, join the ", createLink("Combinatorial Games Facebook group", "https://www.facebook.com/groups/413534538978745/"), "."]);
    var reddit = createElementWithChildren("span", ["reddit: ", createLink("/r/abstractgames/", "https://www.reddit.com/r/abstractgames/"), "; ", createLink("/r/plymouthstate/", "https://www.reddit.com/r/plymouthstate/"), "."]);
    var github = createElementWithChildren("span", ["GitHub: ", createLink("My GitHub", "https://github.com/paithan/"), ".  I am slowly moving my public projects to GitHub."]);
    var stackExchange = createElementWithChildren("span", ["StackExchange: ", createLink("My account", "https://stackexchange.com/users/1162210/kyle"), "."]);
    var mathGenes = createElementWithChildren("span", ["Mathematics Geneaology Project", ": ", createLink("Me", "https://www.genealogy.math.ndsu.nodak.edu/id.php?id=134508"), "."]);
    //twitter stuff
    var dataWidth = Math.min(window.innerWidth, 400);
    var twitterFeed = document.createElement("span");
    twitterFeed.innerHTML += "<a class=\"twitter-timeline\" data-height=\"400\" data-width=\"" + dataWidth + "\" data-theme=\"dark\" href=\"https://twitter.com/CGTKyle\">Tweets by CGTKyle</a>";
    var twitter = createElementWithChildren("span", ["Twitter: ", createLink("@CGTKyle", "https://twitter.com/CGTKyle"), ".", document.createElement("br"), twitterFeed]);
    appendChildrenTo(div, [createList(false, [department, linkedIn, facebook, reddit, github, stackExchange, mathGenes, twitter])]);
    contentNodeArray.push(div);

    //TODO: more to add?


    generateMainPage("Kyle's Homepage", contentNodeArray);

    addEmailAddresses();
}

/**
 * Creates one of the main webpages.  E.g.: Home page, Teaching, Research, Resources.
 */
function generateMainPage(titleText, contentNodeArray) {

    //clear the body
    clearBody();

    //background time
    document.body.style.backgroundColor = "#CCCC99";

    //set up the page title
    document.title = titleText;

	//add the main menu
	document.body.appendChild(getMainMenu());

    //add the header
    var headingLine = document.createElement("p");
    headingLine.style.textAlign = "center";
    headingLine.style.fontSize = "xx-large";
    headingLine.appendChild(document.createTextNode(titleText));
    document.body.appendChild(headingLine);

    //add the contents
    for (var i = 0; i < contentNodeArray.length; i++) {
        document.body.appendChild(document.createElement("br"));
        document.body.appendChild(contentNodeArray[i]);
    }
}


/**
 * Returns a div object containing the main menu: Home, Teaching, Research, Resources.
 */
function getMainMenu() {

	var menuDiv = document.createElement("div");
	menuDiv.setAttribute("class", "topButtonHolder");
	menuDiv.style.textAlign = "center";

	var menuTable = document.createElement("table");
	menuTable.style.backgroundColor = "white";
	menuTable.style.margin = "auto";
	menuTable.style.minWidth = "80%";
	menuTable.cellSpacing = "10";
	menuDiv.appendChild(menuTable);
	menuTable.insertRow(-1);
	var imageHeight = "65";
        var linksImagesAltsTitles = [["?", "homepageLink.gif", "Homepage", "Atropos"], ["?main=teaching", "teachingPageLink.gif", "Teaching Page", "Matchmaker"], ["?main=research", "researchPageLink.gif", "Research Page", "Neighboring Nim"], ["?main=resources", "resourcesPageLink.gif", "Resources Page", "Battle Sudoku"]];
        for (var cellIndex = 0; cellIndex < linksImagesAltsTitles.length; cellIndex +=1) {
            var linkLocation = linksImagesAltsTitles[cellIndex][0];
            var imageSource = linksImagesAltsTitles[cellIndex][1];
            var altText = linksImagesAltsTitles[cellIndex][2];
            var gameName = linksImagesAltsTitles[cellIndex][3];
            menuTable.rows[0].insertCell(-1);
            menuTable.rows[0].cells[cellIndex].appendChild(document.createElement("a"));
            menuTable.rows[0].cells[cellIndex].lastChild.href = HOME + linkLocation;
            menuTable.rows[0].cells[cellIndex].lastChild.appendChild(document.createElement("img"));
            menuTable.rows[0].cells[cellIndex].lastChild.lastChild.height = imageHeight;
            menuTable.rows[0].cells[cellIndex].lastChild.lastChild.src = getPublicFileLink(imageSource);
            menuTable.rows[0].cells[cellIndex].lastChild.lastChild.alt = altText;
            menuTable.rows[0].cells[cellIndex].lastChild.lastChild.title = gameName;
        }
	return menuDiv
}

/**
 * Creates a div with the nice background color and a title.
 */
function createNiceTitledDiv(title) {
    var div = createNiceDiv();
    div.appendChild(document.createElement("b"));
    div.lastChild.appendChild(document.createTextNode(title));
    div.appendChild(document.createElement("br"));
    return div;
}

/**
 * Creates a div with it's own nice background color.  Is the same as the niceTextBox class from paithan.css.
 */
function createNiceDiv() {
    var div = document.createElement("div");
    div.style.textAlign = "left";
    div.style.backgroundColor = "#CCFFCC";
    div.style.margin = "7px";
    div.style.padding = "3px";
    return div;
}

/**
 * Removes all children from the body of the page.
 */
function clearBody() {
    while (document.body.childNodes.length > 0) {
        document.body.removeChild(document.body.childNodes[0]);
    }
}

/**
 * Chooses the type of page to load based on the url variables.
 */
function loadAppropriatePage() {
    var mainPage = getParameterByName("main", 0);
    var courseNumber = getParameterByName("course", 0);
    var labNumber = getParameterByName("lab", 0);
    var resource = getParameterByName("resource", 0);
    var game = getParameterByName("game", 0);
    if (resource != 0) {
        //load the appropriate resource page.
        if (resource == "chapelTutorial") {
            generateChapelTutorial();
        } else if (resource == "terminalTutorial") {
            generateTerminalTutorial();
        } else if (resource == "pairProgramming") {
            generatePairProgrammingPage();
        } else if (resource == "independentProjects") {
            createStudentProjectsPage();
        }
    } else if (courseNumber != 0) {
        //load the course page
        includeScript(getPublicFileLink("SemesterInfo.js"), loadCourseInfo);
    } else if (labNumber != 0) {
        //load the lab page
        includeScript(getPublicFileLink("SemesterInfo.js"), loadLabInfo);
    } else if (game != 0) {
        playGame();
    } else {
        //choose the appropriate main page
        if (mainPage == 0 || mainPage == "home") {
            generateHomepage();
        } else if (mainPage == "teaching") {
            generateTeachingPage();
        } else if (mainPage == "research") {
            generateResearchPage();
        } else if (mainPage == "resources") {
            generateResourcesPage();
        } else if (mainPage == "schedule") {
            includeScript(getPublicFileLink("SemesterInfo.js"), loadSchedulePage);
        } else {
            //um... we didn't find a page to load...
            generateHomepage(); //TODO: do something else?
        }
    }
}

/*******<<Human>>********************************************/
/**
 * Human object.
 */
var Human = Class.create({

    /**
     * Creates a Human
     */
    initialize: function(name, url) {
        this.name = name;
        this.url = url;
    }

    /**
     * Returns a node version of this.
     */
    ,toNode: function() {
        if (this.url == undefined) {
            return toNode(this.name);
        } else {
            return createLink(this.name, this.url);
        }
    }

    /**
     * Returns an element version of this.
     */
    ,toElement: function() {
        return this.toNode();
    }
});  //end of the Human class.

/*******<<HelpfulHuman>>**********************************************************
 *****************************************************************************
 ** HelpfulHuman class definition **/
/**
 * Represents a class leader or support person (Instructor, SI, TA, etc...)
 */
var HelpfulHuman = Class.create(Human, {

    /**
     * Constructor.
     */
    initialize: function($super, title, fullName, nickname, homepage) {
        $super(fullName, homepage);
        this.title = title;
        this.fullName = fullName;
        this.nickname = nickname;
        this.homepage = homepage;
        this.specialities = [];
    }

    /**
     * Returns and HTML DOM Element describing this.
     */
    ,toElement: function() {
        var element = document.createDocumentFragment();
        element.appendChild(document.createElement("b"));
        element.lastChild.appendChild(document.createTextNode(this.title));
        element.appendChild(document.createTextNode(": "));
        element.appendChild(createTextLink(this.fullName, this.homepage));
        return element;
    }

    ,toNode: function($super) {
        return $super();
    }

    /**
     * Adds a speciality to this. (As a string.)
     */
    ,addSpeciality: function(speciality) {
        this.specialities.push(speciality);
    }

    /**
     * Returns a node with the specialities.
     */
    ,toElementWithSpecialities: function() {
        var fragment = document.createDocumentFragment();
        var specialitiesString = "";
        if (this.specialities.length > 0) {
            specialitiesString += " (Bonus expertise: ";
            for (var i = 0; i < this.specialities.length; i++) {
                specialitiesString += this.specialities[i];
                if (i < this.specialities.length - 1) {
                    specialitiesString += ", ";
                }
            }
            specialitiesString += ")";
        }
        appendChildrenTo(fragment, [createTextLink(this.nickname, this.homepage), specialitiesString]);
        return fragment;
    }

    ,/**
      * Returns a smaller HTML DOM Element describing this.
      */
    toSmallElement: function() {
        return createTextLink(this.nickname, this.homepage);
    }

}); //end of HelpfulHuman definitions

/************<<StudentProject>>********************************/
/**
 * Student Project Object.
 */
var StudentProject = Class.create({

    /**
     * Constructor.  Example usage: new StudentProject(BETH_LONGE, "'16W", "Dawn Patrol", undefined, "CS 4760 Project", "A mobile app for surfers, detailing coastal weather and ocean conditions.");
     * human: Human object.
     * classYear: string describing the (expected) graduation year of the student.
     *
     */
    initialize: function(humans, classYear, projectName, homepageUrl, courseNumber, description) {
        this.humans = humans;
        this.classYear = classYear;
        this.courseNumber = courseNumber;
        if (homepageUrl != undefined) {
            //the node is a link
            this.nameNode = createLink(projectName, homepageUrl);
        } else {
            //the node is not a link
            this.nameNode = toNode(projectName);
        }
        this.nameNode.style.fontStyle = "italic";
        this.description = toNode(description);
    }

    /**
     * toNode.
     *
     */
    ,toNode: function() {
        var node = document.createElement("span");
        //console.log(this.human);
        //console.log(this.human.name);
        appendChildrenTo(node, [arrayToGrammarList(this.humans), " (" + this.classYear + ") - ", this.nameNode, ". ", this.description]);
        return node;
    }
});  //end of the StudentProject class.

//coauthors!
GABRIEL_BEAULIEU = new Human("Gabriel Beaulieu", "http://www.informatik.uni-trier.de/~ley/pers/hd/b/Beaulieu:Gabriel.html");
STEVE_BOGAERTS = new Human("Steven Bogaerts", "http://www.depauw.edu/academics/departments-programs/computer-science/faculty--staff/detail/1819876526649/");
MARA_BOVEE = new Human("Mara Bovee");
DAVID_BUNDE = new Human("David Bunde", "http://faculty.knox.edu/dbunde/");
ME = new Human("K. Burke", HOME);
ME_NO_LINK = new Human("K. Burke");
ERIK_DEMAINE = new Human("Erik D. Demaine", "http://erikdemaine.org");
ERIC_DUCHENE = new Human("Eric Duchene", "http://liris.cnrs.fr/~educhene/");
OLIVIA_GEORGE = new Human("Olivia George");
HARRISON_GREGG = new Human("Harrison Gregg");
BOB_HEARN = new Human("Robert A Hearn");
ADAM_HESTERBERG = new Human("Adam Hesterberg", "http://math.mit.edu/directory/profile.php?pid=1468");
SILVIA_HEUBACH = new Human("Silvia Heubach", "http://web.calstatela.edu/faculty/sheubac/");
MICHAEL_HOFFMANN = new Human("Michael Hoffmann", "https://www.inf.ethz.ch/personal/hoffmann/");
MELISSA_HUGGAN = new Human("Melissa Huggan", "http://www.dal.ca/faculty/science/math-stats/programs/graduate-studies/graduate-students.html");
SVENJA_HUNTEMANN = new Human("Svenja Huntemann", "http://mathstat.dal.ca/~svenjah/");
ITO_HIRO = new Human("Ito Hiro", "http://www.alg.cei.uec.ac.jp/itohiro/");
IRINA_KOSTITSYNA = new Human("Irina Kostitsyna", "https://www.win.tue.nl/~ikostits/");
JODY_LEONARD = new Human("Jody Leonard");
MAARTEN_LOFFLER = new Human("Maarten Löffler", "http://www.staff.science.uu.nl/~loffl001/about.html");
AARON_SANTIAGO = new Human("Aaron Santiago");
CHRISTIANE_SCHMIDT = new Human("Christiane Schmidt", "http://webstaff.itn.liu.se/~chrsc91/");
BRIAN_SHELBURNE = new Human("Brian Shelburne", "http://userpages.wittenberg.edu/bshelburne/");
MELISSA_SMITH = new Human("Melissa Smith", "http://www.parl.clemson.edu/~smithmc/");
ERIC_STAHLBERG = new Human("Eric Stahlberg", "http://www.openfpga.org/pages/AboutUs.aspx");
SHANGHUA = new Human("Shang-Hua Teng", "http://www-bcf.usc.edu/~shanghua/");
CRAIG_T = new Human("Craig Tennenhouse", "http://www.une.edu/people/craig-tennenhouse");
CRAIG_TENNENHOUSE = CRAIG_T;
UEHARA_RYUHEI = new Human("Uehara Ryuhei", "https://www.jaist.ac.jp/~uehara/index-e.html");
UNO_YUSHI = new Human("Uno Yushi", "http://jazz.cias.osakafu-u.ac.jp/~uno/index-e.htm");
AARON_WILLIAMS = new Human("Aaron Williams", "http://simons-rock.edu/academics/faculty-bios/science-mathematics-and-computing-faculty/aaron-williams.php");

//student project advisees
CHARLIE_MACDOUGALL = new Human("Charlie MacDougall");

DAN_BURGESS = new Human("Dan Burgess");
JEREMY_MCLEOD = new Human("Jeremy McLeod", "https://www.linkedin.com/in/jeremy-mcleod-2a332812b");
KENNY_MANIVONG = new Human("Kenny Manivong", "https://www.linkedin.com/in/kenneth-manivong-92427b123");
CHARLIE_MILLER_NELSON = new Human("Charlie Miller-Nelson", "https://www.linkedin.com/in/charlie-miller-nelson");
FRANK_PATTIASINA = new Human("Frank Pattiasina", "https://www.linkedin.com/in/frankpattiasina/");

MIHAI_ENE = new Human("Mihai Ene", "https://www.linkedin.com/in/michael-ene-5bb816131");
GAGE_LIRETTE = new Human("Gage Lirette", "https://www.linkedin.com/in/gage-lirette-609bb3126");

TOMMY_GUTHRIE = new Human("Tommy Guthrie");
KELSEY_NEIL = new Human("Kelsey Neil", "https://www.linkedin.com/in/kelsey-neil-b95794ab");

JOSH_BARTON = new Human("Josh Barton", "https://www.linkedin.com/in/joshua-barton-88354a52");
ZACK_LYONS = new Human("Zack Lyons", "https://www.linkedin.com/in/zachary-lyons-92000a115");
CJ_MORRISON = new Human("CJ Morrison");
STEPHEN_SCHATZL = new Human("Stephen Schatzl", "https://www.linkedin.com/in/stephen-schatzl-78341656");
BRYAN_SOPKO = new Human("Bryan Sopko", "https://www.linkedin.com/in/bryansopko");

//colby student advisees
MICHAEL_GOLDENBERG = new Human("Michael Goldenberg", "https://www.linkedin.com/in/michael-goldenberg-15341889");
BEN_BORCHARD = new Human("Ben Borchard", "https://www.linkedin.com/in/ben-borchard-17380980");
HIEU_PHAN = new Human("Hieu Phan", "https://www.linkedin.com/in/hieu-phan-10990013");

//Wittenberg student advisees
//2013
BRITTANY_RICKARDS = new Human("Brittany Rickards", "https://www.linkedin.com/in/brittanyrickards");
//2012
PATRICK_COPELAND = new Human("Patrick Copeland", "https://www.linkedin.com/in/ptcopeland");
WILL_HERRMANN = new Human("Will Herrmann", "http://www.journeymangames.net/about/");
//2011
ANDY_HEINLEIN = new Human("Andy Heinlein", "https://www.linkedin.com/in/andrew-heinlein-0a510324");
//2010
AARON_DUGGER = new Human("Aaron Dugger", "");

//BU student advisees
RYAN_FLEISHER = new Human("Ryan Fleisher", "https://www.linkedin.com/in/ryan-fleisher-8b70571a");
BOB_SOLORIO = new Human("Bob Solorio", "https://www.linkedin.com/in/bob-solorio");

//student helpers



GAGE_LEIPOLD = new HelpfulHuman("Department Fellow", "Gage Leipold", "Gage");
GAGE_LEIPOLD.addSpeciality("2010");
GAGE_LEIPOLD.addSpeciality("2370");
GAGE_LEIPOLD.addSpeciality("2381");
GAGE_LEIPOLD.addSpeciality("2220");

ROB_KRAM = new HelpfulHuman("Tutor", "Robert Kram", "Rob");
ROB_KRAM.addSpeciality("2010");
ROB_KRAM.addSpeciality("2370");
ROB_KRAM.addSpeciality("2381");

RYAN_SHATTUCK = new HelpfulHuman("Lab Assistant", "Ryan Shattuck", "Ryan");
RYAN_SHATTUCK.addSpeciality("2010");
RYAN_SHATTUCK.addSpeciality("2370");
RYAN_SHATTUCK.addSpeciality("2381");

MADELEINE_GIBSON = new HelpfulHuman("Lab Assistant", "Madeleine Gibson", "Madeleine");
MADELEINE_GIBSON.addSpeciality("2381");
MADELEINE_GIBSON.addSpeciality("MA 2250");
MADELEINE_GIBSON.addSpeciality("MA 3221");

COLBY_WHITE = new HelpfulHuman("Lab Assistant", "Colby White", "Colby");
COLBY_WHITE.addSpeciality("2010");
COLBY_WHITE.addSpeciality("2220");
COLBY_WHITE.addSpeciality("2370");
COLBY_WHITE.addSpeciality("2381");

CASSIE_STIMSON = new HelpfulHuman("Lab Assistant", "Cassie Stimson", "Cassie");
CASSIE_STIMSON.addSpeciality("2010");
CASSIE_STIMSON.addSpeciality("2220");
CASSIE_STIMSON.addSpeciality("2370");
CASSIE_STIMSON.addSpeciality("2381");

MARCUS_GOBIS = new HelpfulHuman("Lab Assistant", "Marcus Gobis", "Marcus", "https://www.linkedin.com/in/marcusgobis/");
MARCUS_GOBIS.addSpeciality("2010");
MARCUS_GOBIS.addSpeciality("2220");
MARCUS_GOBIS.addSpeciality("2370");
MARCUS_GOBIS.addSpeciality("2381");
MARCUS_GOBIS.addSpeciality("2470");
MARCUS_GOBIS.addSpeciality("3240");

AUSTIN_ASH = new HelpfulHuman("Department Tutor", "Austin Ash", "Ash", "https://www.linkedin.com/in/austin-ash-6b5673116/");
AUSTIN_ASH.addSpeciality("1300");
AUSTIN_ASH.addSpeciality("2220");
AUSTIN_ASH.addSpeciality("2370");
AUSTIN_ASH.addSpeciality("2381");
AUSTIN_ASH.addSpeciality("3780");

STEPH_LABECK = new HelpfulHuman("Lab Assistant", "Stephanie Labeck", "Steph", "https://linkedin.com/in/stephanie-l-b47353a7");
STEPH_LABECK.addSpeciality("2010");
STEPH_LABECK.addSpeciality("2370");
STEPH_LABECK.addSpeciality("2381");

MATT_FERLAND = new HelpfulHuman("Department Fellow", "Matthew Ferland", "Matt", "https://linkedin.com/in/matthew-ferland-2557b9b2");
MATT_FERLAND.addSpeciality("2010");
MATT_FERLAND.addSpeciality("2220");
MATT_FERLAND.addSpeciality("2370");
MATT_FERLAND.addSpeciality("2381");
MATT_FERLAND.addSpeciality("3240");

//Cory Walker
CORY_WALKER = new HelpfulHuman("Lab Assistant", "Cory Walker", "Cory");
CORY_WALKER.addSpeciality("2010");
CORY_WALKER.addSpeciality("2370");
CORY_WALKER.addSpeciality("2381");
CORY_WALKER.addSpeciality("3240");

//Candace Boris
CANDACE_BORIS = new HelpfulHuman("Department Tutor", "Candace Boris", "Candace");
CANDACE_BORIS.addSpeciality("2010");
CANDACE_BORIS.addSpeciality("2220");
CANDACE_BORIS.addSpeciality("2370");
CANDACE_BORIS.addSpeciality("2381");

//Beth
BETH_LONGE = new HelpfulHuman("Department Tutor", "Beth Longe", "Beth", "https://www.linkedin.com/in/bethany-longe-70930743");
BETH_LONGE.addSpeciality("2010");
BETH_LONGE.addSpeciality("2220");
BETH_LONGE.addSpeciality("2370");
BETH_LONGE.addSpeciality("2381");
BETH_LONGE.addSpeciality("3240");

//Greg
GREG_MALLON = new HelpfulHuman("Department Fellow", "Greg Mallon", "Greg", "https://www.linkedin.com/in/gregory-mallon-b44a89115");
GREG_MALLON.addSpeciality("2010");
GREG_MALLON.addSpeciality("2220");
GREG_MALLON.addSpeciality("2370");
GREG_MALLON.addSpeciality("2381");
GREG_MALLON.addSpeciality("2400");
GREG_MALLON.addSpeciality("3240");

//Kristi
KRISTI_KING = new HelpfulHuman("Lab Assistant", "Kristi King", "Kristi", "https://www.linkedin.com/in/kristi-king-457a34111");
KRISTI_KING.addSpeciality("2010");
KRISTI_KING.addSpeciality("2220");
KRISTI_KING.addSpeciality("2370");
KRISTI_KING.addSpeciality("2381");

//Amie
AMELIA_ROWLAND = new HelpfulHuman("Department Fellow", "Amelia Rowland", "Amie");
AMELIA_ROWLAND.addSpeciality("2010");
AMELIA_ROWLAND.addSpeciality("2220");
AMELIA_ROWLAND.addSpeciality("2370");
AMELIA_ROWLAND.addSpeciality("2381");

//Ben Higman
BEN_HIGMAN = new HelpfulHuman("Department Fellow", "Ben Higman", "Ben");
BEN_HIGMAN.addSpeciality("2010");
BEN_HIGMAN.addSpeciality("2370");
BEN_HIGMAN.addSpeciality("2381");
