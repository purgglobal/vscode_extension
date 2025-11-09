
import { indentationSpacing, padText, textIsAFluff, textIsASpecialChar, stringInitiators, openingBrackets, closingBrackets } from "../bin/text";

let jsonMainFormatter = function (preformattedCode, baseIndentationLevel=0) {
	let formattedCode = "";

	let indentationLevel = baseIndentationLevel;
	formattedCode = padText ("", indentationSpacing, (indentationLevel));
	
	let insideAString = false;
	let currentStringInitiator = "";
	let currentBracketOpener = "";
	
	for (let i = 0; i < preformattedCode.length; i ++) {
		let codelet = preformattedCode [i];
		let prevCodelet = (i != 0) ? preformattedCode [i-1] : "";
		let nextCodelet = (i != (preformattedCode.length-1)) ? preformattedCode [i+1] : "";
		
		let formattedCodelet = codelet;
		
		if (!insideAString) {
			if (openingBrackets.indexOf (codelet) != -1) {
				currentBracketOpener = codelet;
				
				if (openingBrackets.indexOf (prevCodelet) != -1) {
					formattedCodelet = (padText ("", indentationSpacing, (indentationLevel)) + codelet);
					
					if (closingBrackets.indexOf (nextCodelet) == -1) formattedCodelet = (formattedCodelet + "\n");
				} else {

					formattedCodelet = (codelet);
					
					if (closingBrackets.indexOf (nextCodelet) == -1) {
						formattedCodelet = codelet + "\n";
					}
				}
				
				indentationLevel += 1;
			} else if (closingBrackets.indexOf (codelet) != -1) {
				formattedCodelet = codelet;
				
				if (openingBrackets.indexOf (prevCodelet) == -1) formattedCodelet = ("\n" + padText ("", indentationSpacing, (indentationLevel-1)) + codelet);
				
				indentationLevel -= 1;
			} else if (codelet == ",") {
				if (closingBrackets.indexOf (nextCodelet) == -1) {
					formattedCodelet += ("\n"+padText ("", indentationSpacing, (indentationLevel)));
				}
			} else if (textIsAFluff (codelet)) {
				formattedCodelet = "";
			} else if (codelet == ":") {
				formattedCodelet = ": ";
			} else {
				if (openingBrackets.indexOf (prevCodelet) != -1) {
					formattedCodelet = (padText ("", indentationSpacing, (indentationLevel)) + codelet);
				}
			}
			
			if (stringInitiators.indexOf (codelet) != -1) {
				insideAString = true;
				
				currentStringInitiator = codelet;
			}
		} else {
			if (codelet == currentStringInitiator) {
				insideAString = false;
				
				currentStringInitiator = "";
			}
		}
		
		formattedCode += formattedCodelet;
	}
	
	return formattedCode;
}

export default jsonMainFormatter;