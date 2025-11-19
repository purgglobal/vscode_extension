

//import { indentationSpacing, padText, textIsAFluff, textIsASpecialChar, stringInitiators, openingBrackets, closingBrackets } from "../bin/text";
import { createRequire } from "module";
const require = createRequire (import.meta.url);
const { indentationSpacing, padText, textIsAFluff, textIsASpecialChar, stringInitiators, openingBrackets, closingBrackets } = require ("../bin/text");

export let jsMainFormatter = function (preformattedCode, baseIndentationLevel=0) {
	let formattedCode = "";
	
	let indentationLevel = baseIndentationLevel;
	formattedCode = padText ("", indentationSpacing, (indentationLevel));
	
	let insideAString = false;
	let currentStringInitiator = "";
	
	let insideAForLoopHeader = false;
	
	for (let i = 0; i < preformattedCode.length; i ++) {
		let codelet = preformattedCode [i];
		let prevCodelet = (i != 0) ? preformattedCode [i-1] : "";
		let nextCodelet = (i != (preformattedCode.length-1)) ? preformattedCode [i+1] : "";
		
		let formattedCodelet = codelet;

		
		if (insideAString) {
			if (codelet == currentStringInitiator) {
				insideAString = false;
				
				currentStringInitiator = "";
			}
		} else {
			if (openingBrackets.indexOf (codelet) != -1) {
				if (codelet == "{") {
					formattedCodelet = "{\n";
					
					if (insideAForLoopHeader) insideAForLoopHeader = false;
					
					indentationLevel += 1;
				}
			} else if (closingBrackets.indexOf (codelet) != -1) {

				if (closingBrackets.indexOf (nextCodelet) == -1) {
					if (nextCodelet != "." && nextCodelet != ":" && nextCodelet != ";") formattedCodelet = codelet+" "; // => X1		
				}
				
				if (codelet == "}") {
					formattedCodelet = ("\n" + padText ("", indentationSpacing, (indentationLevel-1)) + "}");
					if (nextCodelet != "," && (closingBrackets.indexOf (nextCodelet) == -1)) formattedCodelet += " "; // see if this can be merged with X1 above
					
					indentationLevel -= 1;
				}
			} else {
				if (prevCodelet == "{") {
					formattedCodelet = (padText ("", indentationSpacing, (indentationLevel)) + codelet);
				} else if (prevCodelet == "}") {
					if (codelet != ",") formattedCodelet = ("\n" + padText ("", indentationSpacing, (indentationLevel)) + codelet);
				} else if (prevCodelet == "\n") {
					formattedCodelet = ("\n" + padText ("", indentationSpacing, (indentationLevel)) + codelet);
				}
				
				if (closingBrackets.indexOf (nextCodelet) != -1) {
					
				} else {
					if (textIsASpecialChar (codelet) && textIsASpecialChar (nextCodelet)) {
						if (codelet == "=") {
							if (nextCodelet != ">" && nextCodelet != "=") formattedCodelet += " ";
						}

						if (codelet == ">") formattedCodelet += " ";
						
						if (codelet == ";") {
							if (!insideAForLoopHeader) formattedCodelet = ";\n";
							else formattedCodelet = "; ";
						}
						if (codelet == "/" && nextCodelet == "/") {
							// We are breaking out the normal programme flow down here.
							let commentedCodelets = [];
							for (let j = (i+2); j < preformattedCode.length; j ++) {
								if (preformattedCode [j] == "\n") {
									i = j; // We are breaking out the normal programme flow down here.
									break; 
								} else {
									commentedCodelets.push (preformattedCode [j]);
								}
							}
							let formattedCommentedCode = jsMainFormatter (commentedCodelets);
							let newlineFreeFormattedCommentedCode = "";
							for (let j = 0; j < formattedCommentedCode.length; j ++) {
								if (formattedCommentedCode [j] != "\n") {
									newlineFreeFormattedCommentedCode += formattedCommentedCode [j];
								}
							}
							
							formattedCodelet = ("\n" + padText ("", indentationSpacing, (indentationLevel)) + "//" + newlineFreeFormattedCommentedCode);
						}
					} else {
						if (codelet == ";") {
							if (!insideAForLoopHeader) formattedCodelet = ";\n";
							else formattedCodelet = "; ";
						} else {
							if (prevCodelet == ";") {
								if (!insideAForLoopHeader) formattedCodelet = padText ("", indentationSpacing, (indentationLevel)) + codelet;
							}
							
							if (textIsAFluff (codelet)) {
								formattedCodelet = "";
							} else {
								if (stringInitiators.indexOf (codelet) == -1 && codelet != "." && codelet != "_" && nextCodelet != "_" && nextCodelet != "." && nextCodelet != ":" && nextCodelet != ";" && nextCodelet != ",") {
									formattedCodelet += " ";
								}
								
								if (codelet == "for") {
									insideAForLoopHeader = true;
								}
							}
						}
					}
				}
			}
				
			if (stringInitiators.indexOf (codelet) != -1) {
				insideAString = true;
				
				currentStringInitiator = codelet;
			}
		}
		
		formattedCode += formattedCodelet;
	}
	
	return formattedCode;
}

//export default jsMainFormatter;