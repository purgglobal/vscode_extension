

let indentationSpacing = "	";

let padText = function (text, paddingItem, lengthOfPadding, padInFront=true) {
	let paddedText = text;
	
	for (let i = 0; i < lengthOfPadding; i ++) {
		if (padInFront) paddedText = (paddingItem + paddedText);
		else paddedText += paddingItem;
	}
	
	return paddedText;

}


// FLUFFS

let fluffTexts = [`\n`, " ", `\r`, `\t`, `
`, ``];
/*
	fluffTexts are mostly whitespaces or other 
	texts that can be disposed of without 
	affecting the code.
*/

let textIsAFluff = function (text) {
	let textIsFluff = false;
	
	if (fluffTexts.indexOf (text) != -1) {
		textIsFluff = true;
	}
	
	return textIsFluff;
}
let defluffText = function (text) {
	let defluffedText = '';
	
	for (let i = 0; i < text.length; i ++) {
		if (!textIsAFluff (text [i])) {
			defluffedText += text [i];
		}
	}
	
	return defluffedText
}

let getPrevNonFluffLetter = function (currentPos, text) {
	let prevLetter = ""; 
	
	for (let n = (currentPos-1); n > 0; n --) {
		if (!textIsAFluff (text [n])) {
			prevLetter = text [n];
			
			break;
		}
	}
	
	return prevLetter;
}
let getNextNonFluffLetter = function (currentPos, text) {
	let prevLetter = ""; 
	
	for (let n = (currentPos+1); n < text.length; n ++) {
		if (!textIsAFluff (text [n])) {
			prevLetter = text [n];
			
			break;
		}
	}
	
	return prevLetter;
}


// Special Characters and String Initiators
let textIsASpecialChar = function (text) {
	let textIsSpecialChar = false;
	
	if (specialChars.indexOf (text) != -1) {
		textIsSpecialChar = true;
	}
	
	return textIsSpecialChar;
}
let specialChars = [
	"{", "}", ":", ";", "'", "\"", "`", 
	"!", "+", "×", "÷", "=", "/", "_", 
	"<", ">", "[", "]", "&", "%", "*", 

	"(", ")", "?", ",", ".", "-", "'", "\"", "`"
];

let stringInitiators = ["'", "\"", "`"];

let openingBrackets = ["(", "[", "{"];
let closingBrackets = [")", "]", "}"];

module.exports = {
	indentationSpacing: indentationSpacing,
	padText: padText,
	textIsAFluff: textIsAFluff,
	defluffText: defluffText,
	getPrevNonFluffLetter: getPrevNonFluffLetter,
	getNextNonFluffLetter: getNextNonFluffLetter,
	textIsASpecialChar: textIsASpecialChar,
	stringInitiators: stringInitiators,
	openingBrackets: openingBrackets,
	closingBrackets: closingBrackets
}