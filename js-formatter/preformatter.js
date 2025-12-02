
import { createRequire } from "module";
const require = createRequire (import.meta.url);
const { textIsAFluff, getPrevNonFluffLetter, getNextNonFluffLetter, textIsASpecialChar, stringInitiators } = require ("../bin/text");

let jsKeywords = ["let", "var", "const", "if", "else", "for",
	"while", "switch", "case", "in", "of"];

export let jsPreformatter = function (inputCode) {
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
			if (letter == currentStringInitiator && prevLetter != "\\") {
				if (codelet.length != 0) preformattedCode.push (codelet);
				preformattedCode.push (letter);
				
				insideAString = false;
				currentStringInitiator = "";
				codelet = "";
			} else {
				if (textIsAFluff (letter)) {
					if (!textIsAFluff (inputCode [i-1])) {
						if (codelet.length != 0) preformattedCode.push (codelet);
						
						if (currentStringInitiator != "`") {
							if (letter == "\n") codelet = "\\n"
							else codelet = letter;
						} else codelet = letter;
					} else {
						if (!textIsAFluff (inputCode [i+1])) {
							if (codelet.length != 0) preformattedCode.push (codelet);
							codelet = "";
						} else {
							codelet += letter;
						}
					}
				} else {
					if (textIsAFluff (inputCode [i-1])) {
						if (codelet.length != 0) preformattedCode.push (codelet);
						codelet = "";
					}
					codelet += letter;
				}
			}
		} else if (textIsAFluff (letter)) {
			if (codelet.length != 0) preformattedCode.push (codelet);
			
			codelet = "";
			if (insideASingleLineComment) {
				if (letter == `\n`) {			
					preformattedCode.push (`\n`);
					insideASingleLineComment = false;
				}
			}
		} else {
			if (textIsASpecialChar (letter)) {
				if (letter == "/") {
					if (nextLetter == "/") {
						if (codelet.length != 0) preformattedCode.push (codelet);
						preformattedCode.push ("/");
						preformattedCode.push ("/");
						insideASingleLineComment = true;
						
						let j = i;
						let commentedCode = "";
						for (j = (i+2); j < inputCode.length; j ++) {
							if (inputCode [j] == "\n") {
								break;
							} else {
								commentedCode += inputCode [j];
							}
						}
						i = j;
						preformattedCode.push (commentedCode);
						codelet = "";
					} else if (nextLetter == "*") {
						if (codelet.length != 0) preformattedCode.push (codelet);
						preformattedCode.push ("/");
						preformattedCode.push ("*");
						insideASingleLineComment = true;
						
						let j = i;
						let commentedCode = "";
						for (j = (i+2); j < inputCode.length; j ++) {
							if (inputCode [j] == "*" && inputCode [j+1] == "/") {
								break;
							} else {
								commentedCode += inputCode [j];
							}
						}
						i = (j+1);
						preformattedCode.push (commentedCode);
						preformattedCode.push ("*");
						preformattedCode.push ("/");
						
						codelet = "";
					}
				} else {
					if (codelet.length != 0) preformattedCode.push (codelet);
					codelet = letter;
					preformattedCode.push (codelet);
					codelet = "";
				}
				
				if (stringInitiators.indexOf (letter) != -1 && !insideASingleLineComment) {
					insideAString = true;
					
					currentStringInitiator = letter;
				}
			} else {
				codelet += letter;
			}
		}
	}
	
	if (codelet.length != 0) preformattedCode.push (codelet);
	return preformattedCode;
}