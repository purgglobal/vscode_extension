
import { createRequire } from "module";
const require = createRequire (import.meta.url);
const { textIsAFluff, getPrevNonFluffLetter, getNextNonFluffLetter, textIsASpecialChar, stringInitiators } = require ("../bin/text");

let jsonKeywords = [];

export let jsonPreformatter = function (inputCode) {
	let preformattedCode = [];
	
	let insideAString = false;
	let currentStringInitiator = ""
	let insideASingleLineComment = false;
	
	let codelet = "";
	
	for (let i = 0; i < inputCode.length; i ++) {
		let letter = inputCode [i];
		
		let prevLetter = getPrevNonFluffLetter (i, inputCode);
		let nextLetter = getNextNonFluffLetter (i, inputCode);
		
		
		if (insideAString) {
			preformattedCode.push (letter);
			if (letter == currentStringInitiator) {
				insideAString = false;
				currentStringInitiator = "";
			}
		}
		else if (textIsAFluff (letter)) {
			if (codelet.length != 0) preformattedCode.push (codelet);
			
			codelet = "";
			if (insideASingleLineComment) {
				if (letter == `\n`) {
					preformattedCode.push (`\n`);
					insideASingleLineComment = false;
				} else if (letter == " ") {
					preformattedCode.push (` `);
				}
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
				
				if (stringInitiators.indexOf (letter) != -1 && !insideASingleLineComment) {
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