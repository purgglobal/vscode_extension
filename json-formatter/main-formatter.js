
import { createRequire } from "module";
const require = createRequire (import.meta.url);
const { indentationSpacing, padText, textIsAFluff, textIsASpecialChar, stringInitiators, openingBrackets, closingBrackets } = require ("../bin/text");

export let jsonMainFormatter = function (preformattedCode, baseIndentationLevel=0) {
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
			} else if (codelet == "/") {
				if (nextCodelet == "/") {
					// We are breaking out the normal programme flow down here.
					let commentedCodelets = [];
					let j = i;
					for (j = (i+2); j < preformattedCode.length; j ++) {
						commentedCodelets.push (preformattedCode [j]);
						if (preformattedCode [j] == '\n') {
							break; 
						}
					}
					i = j; // We are breaking out the normal programme flow down here.
					let formattedCommentedCode = jsonMainFormatter (commentedCodelets);
					let newlineFreeFormattedCommentedCode = "";
					for (let j = 0; j < formattedCommentedCode.length; j ++) {
						if (formattedCommentedCode [j] != "\n") {
							newlineFreeFormattedCommentedCode += formattedCommentedCode [j];
						}
					}
								
					if (formattedCode [formattedCode.length-1] != "\n") formattedCodelet = "\n";
					else formattedCodelet = "";

					formattedCodelet += (padText ("", indentationSpacing, (indentationLevel)) + "//" + newlineFreeFormattedCommentedCode);
					formattedCodelet += ("\n" + padText ("", indentationSpacing, (indentationLevel)));
				} else if (nextCodelet == "*") {
					let commentedCodelets = [];
					let j = 0;
					for (j = (i+2); j < preformattedCode.length; j ++) {
						if (preformattedCode [j] == "*" && preformattedCode [j+1] == "/") {
							i = (j+1); // We are breaking out the normal programme flow down here.
							break; 
						} else {
							commentedCodelets.push (preformattedCode [j]);
						}
					}
					if (commentedCodelets.length != 0) {
						let formattedCommentedCode = jsonMainFormatter (commentedCodelets, indentationLevel + 1);
						formattedCodelet = ("\n" + padText ("", indentationSpacing, (indentationLevel)) + "/*\n");
						formattedCodelet += formattedCommentedCode;
						formattedCodelet += ("\n" + padText ("", indentationSpacing, (indentationLevel)) + "*/");
					} else {
						formattedCodelet = ("\n" + padText ("", indentationSpacing, (indentationLevel)) + "/**/");
					}
					if (j != (preformattedCode.length-1)) formattedCodelet += "\n";
				}
			} else {
				if (textIsAFluff (prevCodelet)) {
					if (openingBrackets.indexOf (preformattedCode [i-2]) != -1) {
						formattedCodelet = (padText ("", indentationSpacing, (indentationLevel)) + codelet);
					}
				} else {
					if (openingBrackets.indexOf (prevCodelet) != -1) {
						formattedCodelet = (padText ("", indentationSpacing, (indentationLevel)) + codelet);
					}
					if (prevCodelet == "/" && preformattedCode [i-2] == "*") { // d check on "/" and "*" is to know if we just exited a multiline comment
						formattedCodelet = padText ("", indentationSpacing, (indentationLevel)) + codelet;
					}
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