
import { createRequire } from "module";
const require = createRequire (import.meta.url);
const { indentationSpacing, padText, textIsAFluff, textIsASpecialChar, stringInitiators, openingBrackets, closingBrackets } = require ("../bin/text");

let variableDeclaraingKeywords = ["var", "let", "const"];
let isAVariableDeclaringKeyword = function (text) {
	if (variableDeclaraingKeywords.indexOf (text) == -1) return false;
	else return true;
}

export let jsMainFormatter = function (preformattedCode, baseIndentationLevel=0) {
	let formattedCode = "";
	
	let indentationLevel = baseIndentationLevel;
	formattedCode = padText ("", indentationSpacing, (indentationLevel));
	
	let insideAString = false;
	let currentStringInitiator = "";
	
	let insideAForLoopHeader = false;
	let insideImportOrDestructuringStatement = false;
	
	for (let i = 0; i < preformattedCode.length; i ++) {
		let codelet = preformattedCode [i];
		let prevCodelet = (i != 0) ? preformattedCode [i-1] : "";
		let nextCodelet = (i != (preformattedCode.length-1)) ? preformattedCode [i+1] : "";
		
		let formattedCodelet = codelet;
		
		if (insideAString) {
			if (codelet == currentStringInitiator && prevCodelet != "\\") {
				if (!textIsASpecialChar (nextCodelet)) formattedCodelet += " ";
				insideAString = false;
				
				currentStringInitiator = "";
			}
		} else {
			if (openingBrackets.indexOf (codelet) != -1) {
				if (codelet == "{") {
					if (prevCodelet == "import" || isAVariableDeclaringKeyword (prevCodelet)) insideImportOrDestructuringStatement = true;
					
					if (!insideImportOrDestructuringStatement) formattedCodelet = "{\n";
					
					indentationLevel += 1;
				} else if (codelet == "(") {
					if ((prevCodelet == "function" || prevCodelet == "=") && nextCodelet == "{") insideImportOrDestructuringStatement = true;
				}
			} else if (closingBrackets.indexOf (codelet) != -1) {

				if (closingBrackets.indexOf (nextCodelet) == -1) {
					if (nextCodelet != "." && nextCodelet != ":" && nextCodelet != ";") formattedCodelet = codelet+" "; // => X1		
				}
				
				if (codelet == ")") {
					if (insideAForLoopHeader) insideAForLoopHeader = false;
				}
				
				if (codelet == "}") {
					if (insideImportOrDestructuringStatement) formattedCodelet = (" " + codelet);
					else formattedCodelet = ("\n" + padText ("", indentationSpacing, (indentationLevel-1)) + "}");
					
					if (nextCodelet != "," && nextCodelet != ";" && (closingBrackets.indexOf (nextCodelet) == -1)) formattedCodelet += " "; // see if this can be merged with X1 above
					
					if (insideImportOrDestructuringStatement) insideImportOrDestructuringStatement = false;
					indentationLevel -= 1;
				}
			} else {
				if (prevCodelet == "{") {
					if (insideImportOrDestructuringStatement) formattedCodelet = (" " + codelet);
					else formattedCodelet = (padText ("", indentationSpacing, (indentationLevel)) + codelet);

				} else if (prevCodelet == "}") {
					if (codelet != "," && codelet != ";" && codelet != "=" && codelet != "from") formattedCodelet = ("\n" + padText ("", indentationSpacing, (indentationLevel)) + codelet);
				} else if (prevCodelet == "\n") {
					formattedCodelet = ("\n" + padText ("", indentationSpacing, (indentationLevel)) + codelet);
				}
				
				if (closingBrackets.indexOf (nextCodelet) != -1) {
					
				} else {
					if (textIsASpecialChar (codelet) && textIsASpecialChar (nextCodelet)) {
						if (codelet == "=") {
							if (nextCodelet != ">" && nextCodelet != "=") formattedCodelet += " ";
						} else if (codelet == ">") {
							formattedCodelet += " ";
						} else if (codelet == ";") {
							if (!insideAForLoopHeader) formattedCodelet = ";\n";
							else formattedCodelet = "; ";
						}
						else if (codelet == "/") {
							if (nextCodelet == "/") {
								// We are breaking out the normal programme flow down here.
								let commentedCode = preformattedCode [i+2];
								
								//let formattedCommentedCode = jsMainFormatter (jsPreformatter (commentedCode), indentationLevel + 1);
								let formattedCommentedCode = commentedCode;
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
								i += 2;
							} else if (nextCodelet == "*") {
								let commentedCode = preformattedCode [i+2];
								
								if (commentedCode.length != 0) {
									let formattedCommentedCode = jsMainFormatter (jsPreformatter (commentedCode), indentationLevel + 1);
											
									formattedCodelet = ("\n" + padText ("", indentationSpacing, (indentationLevel)) + "/*\n");
									formattedCodelet += formattedCommentedCode;
									formattedCodelet += ("\n" + padText ("", indentationSpacing, (indentationLevel)) + "*/");
								} else {
									formattedCodelet = ("\n" + padText ("", indentationSpacing, (indentationLevel)) + "/**/");
								}
								i+=4;
								if ((i) != (preformattedCode.length-1)) formattedCodelet += "\n";
							}
						}
					} else {
						if (codelet == ";") {
							if (!insideAForLoopHeader && (i != preformattedCode.length-1)) formattedCodelet = ";\n";
							else formattedCodelet = "; ";
						} else {
							if (prevCodelet == ";" || (prevCodelet == "/" && preformattedCode [i-2] == "*")) { // d check on "/" and "*" is to know if we just exited a multiline comment
								if (!insideAForLoopHeader) formattedCodelet = padText ("", indentationSpacing, (indentationLevel)) + codelet;
							} else {
								if (isAVariableDeclaringKeyword (codelet)) {
									if (formattedCode [formattedCode.length-1] != "\n") {
										if (prevCodelet != "(" && prevCodelet != "export") {
											formattedCodelet = ("\n" + padText ("", indentationSpacing, (indentationLevel)) + codelet);
										}
									}
								}
							}
							
							if (textIsAFluff (codelet)) {
								formattedCodelet = "";
							} else {
								if (stringInitiators.indexOf (codelet) == -1 && codelet != "." && codelet != "!" && codelet != "_" && nextCodelet != "_" && nextCodelet != "." && nextCodelet != ":" && nextCodelet != ";" && nextCodelet != ",") {
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