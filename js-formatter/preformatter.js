

import { textIsAFluff, getPrevNonFluffLetter, getNextNonFluffLetter, textIsASpecialChar, stringInitiators } from "../bin/text";

let jsKeywords = ["let", "var", "const", "if", "else", "for",
	"while", "switch", "case", "in", "of"];

let jsPreformatter = function (inputCode) {
	let preformattedCode = [];
	
	let insideAString = false;
	let currentStringInitiator = ""
	let insideASingleLineComment = false;
	
	let codelet = "";
	
	for (let i = 0; i < inputCode.length; i ++) {
		let letter = inputCode [i];
		
		let prevLetter = getPrevNonFluffLetter (i, inputCode);
		let nextLetter = getNextNonFluffLetter (i, inputCode);
		
		
		if (textIsAFluff (letter)) {
			if (letter == "\n" && insideASingleLineComment) {
				preformattedCode.push ("\n");
				insideASingleLineComment = false;
			} else {
				if (codelet.length != 0) preformattedCode.push (codelet);
				
				//if (letter == " " && inputCode [i-1] != " ") preformattedCode.push (letter);
				if (insideAString) {
					if (letter == " ") preformattedCode.push (letter);
				} 
				
				codelet = "";
			}
		} else {
			if (textIsASpecialChar (letter)) {
				if (letter == "/" && nextLetter == "/") {
					insideASingleLineComment = true;
				}
				
				if (codelet.length != 0) preformattedCode.push (codelet);
				codelet = letter;
				preformattedCode.push (codelet);
				codelet = "";
				
				if (insideAString) {
					if (letter == currentStringInitiator) {
						insideAString = false;
						
						currentStringInitiator = "";
					}
				} else if (stringInitiators.indexOf (letter) != -1) {
					insideAString = true;
					
					currentStringInitiator = letter;
				}
			} else {
				codelet += letter;
			}
		}
	}
	
	return preformattedCode;
}

export default jsPreformatter;