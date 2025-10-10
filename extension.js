const vscode = require('vscode');

/**
 * @param {vscode.ExtensionContext}
 */


let padText = function (text, paddingItem, lengthOfPadding, padInFront=true) {
	let paddedText = text;
	
	for (let i = 0; i < lengthOfPadding; i ++) {
		if (padInFront) paddedText = (paddingItem + paddedText);
		else paddedText += paddingItem;
	}
	
	return paddedText;
}

let textFluffs = [`\n`, ` `, `\r`, `\t`, `
`, ``];

let textIsAFluff = function (text) {
	let textIsFluff = false;
	
	if (textFluffs.indexOf (text) != -1) {
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

let indentationSpacing = "	";

/*  CSS. */


let preformatCss = function (inputCode) {
	let preformattedCode = "";
	
	for (let i = 0; i < inputCode.length; i ++) {
		let letter = inputCode [i];
		
		let prevLetter = '';
		for (let n = (i-1); n > 0; n --) {
			if (inputCode [n].trim () != "") {
				prevLetter = inputCode [n];
				
				break;
			}
		}
		let nextLetter = '';
		for (let n = (i+1); n < inputCode.length; n ++) {
			if (inputCode [n].trim () != "") {
				nextLetter = inputCode [n];
				
				break;
			}
		}
		let preformattedText = letter;
		
		if (letter == "\n") {
			preformattedText = "";
		}
		
		preformattedCode += preformattedText;
	}
	
	return preformattedCode;
}


let formatCss = function (inputCode, defaultIndentationLevel=0) {
	let formattedCode = "";
	
	let indentationLevel = 0;
	let insideASelectorWord = false;
	let insideASelectorContent = false;
	let insideADeclarationWord = false;
	let insideADeclarationContent = false;
	
	for (let i = 0; i < inputCode.length; i ++) {
		let letter = inputCode [i];
		let prevLetter = ``;
		if (i > 0) prevLetter = inputCode [i-1];
		let nextLetter = ``;
		if (i < (inputCode.length-1)) nextLetter = inputCode [i+1];
		let formattedLetter = letter;
		
		if (letter.trim () == "") {
			if (insideASelectorWord) {
				if (prevLetter.trim () == "") {
					formattedLetter = ``;
				}
				if (letter == `\n` || letter == "\t") {
					formattedLetter = ``;
				}
			} else {
				formattedLetter = ``;
			}
			if (insideADeclarationContent) {
				//This block of code is so that we can allow for a single space in declaration
				if (prevLetter.trim () == "" || prevLetter == ":") {
					formattedLetter = ``;
				} else {
					formattedLetter = ` `;
				}
			}
		} else {
			//FOR DETERMINIBG WHEN WE GET INSIDE SELECTORS 
			//AND DECLARATIONS AND WHEN WE GET OUT OF'EM
			if (!insideASelectorContent) {
				if (!insideASelectorWord) {
					insideASelectorWord = true;
					
					let spacing =  (padText ("", indentationSpacing, (defaultIndentationLevel+indentationLevel)));
					formattedLetter = spacing + letter;
				}
			} else {
				if (!insideADeclarationWord) insideADeclarationWord = true;
			}
		}
		
		
		if (letter == `{`) {
			indentationLevel += 1;
			
			let spacing = (padText ("", indentationSpacing, (defaultIndentationLevel+indentationLevel)));
			formattedLetter = ` {\n`+spacing;
			
			insideASelectorWord = false;
			insideASelectorContent = true;
		} else if (letter == `}`) {
			indentationLevel -= 1;
			
			let spacing = (padText ("", indentationSpacing, (defaultIndentationLevel+indentationLevel)));
			formattedLetter = `\n`+spacing+`}\n\n`;
			
			insideASelectorContent = false;
		} else if (letter == `:`) {
			formattedLetter = `: `;
			
			insideADeclarationWord = false;
			insideADeclarationContent = true;
		} else if (letter == `;`) {
			for (let a = (i+1); a < inputCode.length; a ++) {
				if (inputCode [a].trim () != "") {
					if (inputCode[a] == `}`) {
						formattedLetter = `;`;
					} else {
						let spacing = (padText ("", indentationSpacing, (defaultIndentationLevel+indentationLevel)));
						formattedLetter = `;\n`+spacing;
					}
					break;
				}
			}
			insideADeclarationContent = false;
		}
		
		formattedCode += formattedLetter;
	}
	
	return formattedCode;
}

/*  JavaScript. */

/*
	The preformatter turns the whole inputCode (which 
	is a normal text) into code fragments all packed in 
	an array. "PreformattedCode" is this array.
*/


/*
	The preformatter turns the whole inputCode (which 
	is a normal text) into code fragments all packed in 
	an array. "PreformattedCode" is this array.
*/


let preformatJs = function (inputCode) {
	let stringInitiators = ["'", '"', "`"];
	let keywords = ["let", "var", "const", "true", 
				"false", "break", "continue", "do" , 
				"for", "while", "in"];
	let specialChars = [":", ";", "!", "?", "*", "+", "-", 
				"/", "\\", "&&", "||", "(", ")", "{", "}", "[", "]", "=", "==", 
				"!=", "===", "!==", "."];
	
	let preformattedCode = [];
	let preformattedText = "";
	
	let insideAString = false;
	let currentStringInitiator = "";
	
	for (let i = 0; i < inputCode.length; i ++) {
		let letter = inputCode [i];
		let prevLetter = '';
		let posOfPrevLetter = i;
		for (let n = (i-1); n > 0; n --) {
			if (inputCode [n].trim () != "") {
				prevLetter = inputCode [n];
				posOfPrevLetter = n;
				
				break;
			}
		}
		let nextLetter = '';
		let posOfNextLetter = i;
		for (let n = (i+1); n < inputCode.length; n ++) {
			if (inputCode [n].trim () != "") {
				nextLetter = inputCode [n];
				posOfNextLetter = n;
				
				break;
			}
		}
		
		
		if (!insideAString) {
			if (letter.trim () != "") {
				if (specialChars.indexOf (letter) == -1) {
					if (stringInitiators.indexOf (letter) != -1) {
						currentStringInitiator = letter;
						
						insideAString = true;
					}
					preformattedText += letter;
				} else {
					if (preformattedText.trim () != "") preformattedCode.push (preformattedText);
					preformattedText = letter;
					let operatorsThatGoWithEquality = [
						"=", "!", "+", "-", "*", "/"
					];
					if (operatorsThatGoWithEquality.indexOf (letter) != -1) {
						if (nextLetter == "=") {
							preformattedText += nextLetter;
							i = posOfNextLetter;
						}
					}
					if (letter == "+" && nextLetter == "+") {
						preformattedText += nextLetter;
						i = posOfNextLetter;
					}
					if (letter == "-" && nextLetter == "-") {
						preformattedText += nextLetter;
						i = posOfNextLetter;
					}
					if (letter == "/" || letter == "*") {
						if (specialChars.indexOf (nextLetter) != -1) {
							preformattedText += nextLetter;
							i = posOfNextLetter;
						}
					}
					if (preformattedText.trim () != "") preformattedCode.push (preformattedText);
					
					preformattedText = "";
				}
			} else {
				if (preformattedText.trim () != "") preformattedCode.push (preformattedText);
				
				preformattedText = "";
			}
		} else {
			preformattedText += letter;
			if (letter == currentStringInitiator) {
				preformattedCode.push (preformattedText);
				preformattedText = "";
				
				insideAString = false;
				currentStringInitiator = "";
			}
		}
	}
	preformattedCode.push (preformattedText);
	
	return preformattedCode;
}

let formatJs = function (preformattedCode, defaultIndentationLevel=0) { // PreformattedCode is an array
	let formattedCode = "";
	
	let stringInitiators = ["'", '"', "`"];
	let keywords = ["let", "var", "const", "true", 
				"false", "break", "continue", "do" , 
				"for", "while", "in", "if", "else", "class", "Object"];
	let newlineKeywords = ["let", "var", "const", "do", 
				"for", "while", "class", "Object"];
	let specialChars = [":", ";", "!", "?", "*", "+", "-", 
				"/", "&&", "||", "(", "{", "[", "=", "==", 
				"!=", "===", "!==", "."];
	let spaceNeedingChars = ["!", "?", "*", "+", "-", 
				"/", "&&", "||", "=", "==", 
				"!=", "===", "!=="];
	
	let variables = [];
	
	let indentationLevel = 0;
	
	let insideACurlyBracket = false;
	let insideAComment = false;
	
	
	for (let i = 0; i < preformattedCode.length; i ++) {
		let codelet = preformattedCode [i];
		let prevcodelet = (i > 0) ? (preformattedCode [i-1]) : "";
		let nextcodelet = (i < (preformattedCode.length-1)) ? (preformattedCode [i+1]) : "";
		
		let formattedText = codelet;
		if (insideAComment) { //when inside a comment
			if (codelet == "*/") {
				formattedText = ("*/" + "\n" + padText ("", indentationSpacing, indentationLevel));
				
				insideAComment = false;
			}
		} else {
			if (codelet == "{") {
				indentationLevel += 1;
				
				formattedText = ("{\n" + padText ("", indentationSpacing, (defaultIndentationLevel +indentationLevel)));
			} else if (codelet == "}") {
				indentationLevel -= 1;
				
				formattedText = ("\n" + padText ("}", indentationSpacing, (defaultIndentationLevel +indentationLevel)));
			} else if (newlineKeywords.indexOf (codelet) != -1) {
				if (prevcodelet != "(" && prevcodelet != "{") formattedText = ("\n" + padText ("", indentationSpacing, (defaultIndentationLevel +indentationLevel)) + codelet);
				else formattedText = codelet;
			} else if (codelet == "//") {
				formattedText = ("\n" + padText ("//", indentationSpacing, (defaultIndentationLevel +indentationLevel)));
			} else if (codelet == "/*") {
				formattedText = ("\n" + padText ("/*", indentationSpacing, (defaultIndentationLevel +indentationLevel)));
			}
			
			
			if (spaceNeedingChars.indexOf (nextcodelet) != -1) {
				formattedText+=" ";
			} else {
				if (specialChars.indexOf (nextcodelet) == -1 && codelet != ".") {
					formattedText+=" ";
				}
			}
		}
		
		formattedCode += formattedText;
	}
	
	return formattedCode;
}

/*  JSON. */

let preformatJson = function (inputCode) {
	let preformattedCode = inputCode;
	
	return preformattedCode;
}


let formatJson = function (inputCode, defaultIndentationLevel=0) {
	let formattedCode = ``;
	
	let indentationLevel = 0;
	let insideAnArray = false;
	let inAString = false;
	let stringInitiator = ``;
	let directlyInsideStack = [];
	
	for (let i = 0; i < inputCode.length; i ++) {
		let letter = inputCode [i];
		
		let prevLetter = '';
		let posOfPrevLetter = i;
		for (let n = (i-1); n > 0; n --) {
			if (inputCode [n].trim () != "") {
				prevLetter = inputCode [n];
				posOfPrevLetter = n;
				
				break;
			}
		}
		let nextLetter = '';
		let posOfNextLetter = i;
		for (let n = (i+1); n < inputCode.length; n ++) {
			if (inputCode [n].trim () != "") {
				nextLetter = inputCode [n];
				posOfNextLetter = n;
				
				break;
			}
		}
		
		let formattedLetter = letter;
		
		if (letter.trim () == "") {
			if (!inAString) {
				formattedLetter = '';
			}
		}
		
		if (letter == `{` || letter == `[`) { //OBJECT/ARRAY BEGIN
			let prevLetter = ``;
			if (i > 0) {
				for (let a = (i-1); a > 0; a --) {
					if (inputCode [a].trim () != "") {
						prevLetter = inputCode [a];
						break;
					}
				}
			}
			if (prevLetter != ":") {
				let spacing =  (padText ("", indentationSpacing, (defaultIndentationLevel+indentationLevel)));
				formattedLetter = spacing+letter+`\n`;
			} else if (prevLetter == ":") {
				let spacing =  (padText ("", indentationSpacing, (defaultIndentationLevel+indentationLevel)));
				formattedLetter = letter+`\n`;
			}
			
			indentationLevel += 1;
			
			let spacing =  (padText ("", indentationSpacing, (defaultIndentationLevel+indentationLevel)));
			if (nextLetter != "{" && nextLetter != "[") formattedLetter += spacing;
			
			if (letter == `[`) {
				insideAnArray = true;
				directlyInsideStack.push (`array`);
			} else if (letter == `{`) {
				//insideAnArray = true;
				directlyInsideStack.push (`object`);
			}
		} else if (letter == `}` || letter == `]`) { //OBJECT/ARRAY END
			indentationLevel -= 1;
			
			let spacing =  (padText ("", indentationSpacing, (defaultIndentationLevel+indentationLevel)));
			formattedLetter = `\n`+spacing+letter;
			
			/*let spacing = defaultIndentationLevel;
			spacing += duplicateTextNTimes (indentationSpacing, indentationLevel);
			formattedLetter = spacing+letter`\n`;*/
			
			if (letter == `]`) {
				insideAnArray = false;
			}
		} else if (letter == `:`) {
			formattedLetter = `:`+` `;
		} else if (letter == `,`) {
			if (directlyInsideStack [directlyInsideStack.length-1] == `object`) {
				let spacing =  (padText ("", indentationSpacing, (defaultIndentationLevel+indentationLevel)));
				formattedLetter = `,\n`;
				
				if (nextLetter != "{" && nextLetter != "[") formattedLetter += spacing;
			} else {
				formattedLetter = `, `;
			}
		} else if (letter == "\"" || letter == "'" || letter == "`") {
			if (!inAString) {
				stringInitiator = letter;
				inAString = true;
			} else {
				if (letter == stringInitiator) {
					inAString = false;
				}
			}
		}
		
		formattedCode += formattedLetter;
	}
	
	return formattedCode;
}

/*  HTML. */

let preformatHtml = function (inputCode) {
	let preformattedCode = "";
	
	let indentationLevel = 0;
	
	let insideAnOpeningTag = false;
	let insideATag = false;
	let insideAClosingTag = false;
	let insideAnAttributeName = false; //when we encounter "=" in a tag
	let insideAnAttributeValue = false; //when we encounter a quotation mark that signifies the start of an attribute value
	
	let canPreserveNewLine = false;
	
	let hasACorrectFluffInsideTag = false; // allows to add things like id and class etc to tags.
	let fluffInsideTagIsUsed = false;
	
	let currentHtmlElement = "";
	let currentTag = "";
	let currentTagFullContent = "";
	let startingPosOfCurrentTag = 0;
	let endingPosOfCurrentTag = 0;
	
	let currentAttributeName = "";
	let currentAttributeValue = "";
	
	let selfClosingTags = ["img", "br", "link", "hr", "input", "meta"];
	
	for (let i = 0; i < inputCode.length; i ++) {
		let letter = inputCode [i];
		let prevLetter = '';
		for (let n = (i-1); n > 0; n --) {
			if (inputCode [n].trim () != "") {
				prevLetter = inputCode [n];
				
				break;
			}
		}
		let nextLetter = ''
		for (let n = (i+1); n < inputCode.length; n ++) {
			if (inputCode [n].trim () != "") {
				nextLetter = inputCode [n];
				
				break;
			}
		}
		let preformattedText = letter;
		
		if (letter == "<") {
			if (nextLetter != "/" && nextLetter != "!") {
				insideAnOpeningTag = true;
				insideAClosingTag = false;
				insideATag = true;
				
				
				for (let n = (i+1); n < inputCode.length; n ++) {
					if (inputCode [n].trim () == "" || inputCode [n] == ">") {
						break
					} else {
						currentHtmlElement += inputCode [n];
					}
				}
				if (selfClosingTags.indexOf (currentHtmlElement) == -1) indentationLevel += 1;
				
				
				startingPosOfCurrentTag = (i+1);
				for (let n = (startingPosOfCurrentTag); n < inputCode.length; n ++) {
					if (inputCode [n] == ">") {
						break;
					} else {
						endingPosOfCurrentTag = n;
					}
				}
				currentTagFullContent = (inputCode.slice (startingPosOfCurrentTag, endingPosOfCurrentTag)).toLowerCase ();
				
				formattedText = ("<");
			} else if (nextLetter == "/") {
				indentationLevel -= 1;
				
				insideAnOpeningTag = false;
				insideAClosingTag = true;
				insideATag = true;
			}
		} else if (letter == ">") {
			if (insideATag) {
				if (insideAnOpeningTag) {
					if (currentHtmlElement == "script") {
						let posOfEndOfTag;
						for (let n = (endingPosOfCurrentTag); n < inputCode.length; n ++) {
							if (inputCode [n+1] == "<" && inputCode [n+2] == '/') {
								break;
							} else {
								posOfEndOfTag = n;
							}
						}
						let script = inputCode.slice ((endingPosOfCurrentTag+2), (posOfEndOfTag+1));
						if (currentTagFullContent.indexOf ("javascript") != -1) {
							preformattedText = (">\n" + formatJs (preformatJs (script), (indentationLevel+2)));
						} else if (currentTagFullContent.indexOf ("json") != -1) {
							preformattedText = (">\n" + formatJson (preformatJson (script), (indentationLevel+2)));
						}
						
						i += (posOfEndOfTag-endingPosOfCurrentTag);
					}
				}
				if (currentHtmlElement == "style") {
					let posOfEndOfTag = i;
					for (let n = (i+1); n < inputCode.length; n ++) {
						if (inputCode [n+1] == "<") {
							posOfEndOfTag = n;
							
							break;
						}
					}
					let style = inputCode.slice ((i+1), (posOfEndOfTag+1));
					preformattedText = (">" + formatCss (preformatCss (style), (indentationLevel)));
					
					i += (posOfEndOfTag-i); // Move past the style content
				}
				currentHtmlElement = "";
				currentTag = "";
				
				insideAnOpeningTag = false;
				insideAClosingTag = false;
				insideATag = false;
			}
		} if (letter == '"' || letter == "'") {
			if (insideAnAttributeName) {
				if (!insideAnAttributeValue) {
					let attributeInitiator = letter;
					if (currentAttributeName == "style") {
						let posOfEndOfTag = i;
						for (let n = (i+1); n < inputCode.length; n ++) {
							if (inputCode [n+1] == "'" || inputCode [n+1] == '"'  /* && inputCod [n+2] == "/" */) {
								posOfEndOfTag = n;
								
								break;
							}
						}
						let style = inputCode.slice ((i+1), (posOfEndOfTag+1));
						
						preformattedText = (attributeInitiator + "\n" + formatCss (preformatCss (style), (indentationLevel)));
						
						i += (posOfEndOfTag-i); // Move past the style content
					}
					
					
					insideAnAttributeValue = true;
					insideAnAttributeName = false;
				}
			} else {
				for (let n = (i-1); n > 0; n --) {
					if (inputCode [n] != '"' && inputCode [n] != "'") currentAttributeValue = (inputCode [n]+currentAttributeValue);
					else break;
				}
				
				if (inputCode [i+1].trim () != "") preformattedText = (letter+" ");
				
				insideAnAttributeValue = false;
				
				currentAttributeName = "";
				currentAttributeValue = "";
			}
		} else {
			if (nextLetter == "=") {
				for (let n = (i); n > 0; n --) {
					if (inputCode [n].trim () != "" && inputCode [n] != "\"" && inputCode [n] != "'") currentAttributeName = (inputCode [n]+currentAttributeName);
					else break;
				}
				
				insideAnAttributeName = true;
			}
		}
		
		
		if (letter.trim () == "") {
			if (insideATag) {
				if (!hasACorrectFluffInsideTag) {
					preformattedText = " ";
					
					hasACorrectFluffInsideTag = true;
				} else {
					if (!insideAnAttributeName) preformattedText = "";
					else {
						if (letter == "\n") preformattedText = ""; //prevent breakage (i.e. new line) in attribute value
					}
				}
			} else if (letter == "\n") {
				preformattedText = "";
			} else {
				preformattedText = letter;
			}
		} else {
			if (insideATag && hasACorrectFluffInsideTag) {
				hasACorrectFluffInsideTag = false;
			}
		}
		
		preformattedCode += preformattedText;
	}
	
	return preformattedCode;
}

let formatHtml = function (inputCode) {
	let formattedCode = "";
	
	let indentationLevel = 0;
	
	let insideAnOpe0ningTag = false;
	let insideATag = false;
	let insideAClosingTag = false;
	let insideAnAttributeName = false;
	let insideAnAttributeValue = false;
	
	let insideAComment = false;
	
	let justClosedATag = false;
	
	let currentHtmlElement = "";
	let currentTag = "";
	let currentTagFullContent = "";
	let startingPosOfCurrentTag = 0;
	let endingPosOfCurrentTag = 0;
	
	let selfClosingTags = ["img", "br", "link", "hr", "input", "meta"];
	
	for (let i = 0; i < inputCode.length; i ++) {
		let letter = inputCode [i];
		let prevLetter = '';
		for (let n = (i-1); n > 0; n --) {
			if (inputCode [n].trim () != "") {
				prevLetter = inputCode [n];
				
				break;
			}
		}
		let nextLetter = '';
		for (let n = (i+1); n < inputCode.length; n ++) {
			if (inputCode [n].trim () != "") {
				nextLetter = inputCode [n];
				
				break;
			}
		}
		
		let formattedText = letter;
		
		if (insideAComment) { //when we are inside a comment
			if (letter == ">" && prevLetter == "-") {
				formattedText = (">" + "\n" + padText ("", indentationSpacing, indentationLevel));
				
				insideAComment = false;
			}
		} else {
		// Main stuff starts here.
		if (letter == "<") {
			if (nextLetter != "/" && nextLetter != "!") {
				insideAnOpeningTag = true;
				insideAClosingTag = false;
				insideATag = true;
				
				
				for (let n = (i+1); n < inputCode.length; n ++) {
					if (inputCode [n].trim () == "" || inputCode [n] == ">") {
						break
					} else {
						currentHtmlElement += inputCode [n];
					}
				}
				
				startingPosOfCurrentTag = (i+1);
				for (let n = (startingPosOfCurrentTag); n < inputCode.length; n ++) {
					if (inputCode [n] == ">") {
						break;
					} else {
						endingPosOfCurrentTag = n;
					}
				}
				currentTagFullContent = (inputCode.slice (startingPosOfCurrentTag, (endingPosOfCurrentTag+1))).toLowerCase ();
				
				formattedText = ("\n" + padText ("<", indentationSpacing, indentationLevel));
				
				if (selfClosingTags.indexOf (currentHtmlElement) == -1) indentationLevel += 1;
			} else if (nextLetter == "/") {
				insideAnOpeningTag = false;
				insideAClosingTag = true;
				insideATag = true;
				
				for (let n = (i-1); n > 0; n --) {
					if (inputCode [n] == ">") {
						break;
					} else {
						currentTag = inputCode [n] + currentTag;
					}
				}
				
				indentationLevel -= 1;
				formattedText = ("\n" + padText ("", indentationSpacing, indentationLevel) + "<");
			} else if (nextLetter == "!") {
				formattedText = ("\n" + padText ("", indentationSpacing, indentationLevel) + "<");
				
				let secondNextLetter = ``;
				for (let n = (i+2); n < inputCode.length; n ++) {
					if (inputCode [n].trim () != "") {
						secondNextLetter = inputCode [n];
						
						break;
					}
				}
				if (secondNextLetter == "-") insideAComment = true;
			}
		} else if (letter == ">") {
			if (insideAComment) {
				if (prevLetter == "-") {
					insideAComment = false;
				}
			}
			if (insideATag) {
				if (nextLetter == "<") formattedText = ">";
				else if (currentHtmlElement == "style") formattedText = (">\n" + padText ("", indentationSpacing, (indentationLevel)));
				else formattedText = (">" + "\n" + padText ("", indentationSpacing, indentationLevel));
				
				if (insideAnOpeningTag) {
					if (currentHtmlElement == "script") {
						let posOfEndOfTag;
						for (let n = (endingPosOfCurrentTag); n < inputCode.length; n ++) {
							if (inputCode [n+1] == "<" && inputCode [n+2] == '/'  /* && inputCod [n+2] == "/" */) {
								break;
							} else {
								posOfEndOfTag = n;
							}
						}
						let script = inputCode.slice ((endingPosOfCurrentTag+2), (posOfEndOfTag+1));
						formattedText = (">" + script);
						i += (posOfEndOfTag-endingPosOfCurrentTag);
					}
				}
				
				currentHtmlElement = "";
				currentTag = "";
				
				
				justClosedATag = true;
				
				insideAnOpeningTag = false;
				insideAClosingTag = false;
				insideATag = false;
			}
		} 
		}
		
		if (formattedText.trim () == "") {
			if (justClosedATag) {
				formattedText = "";
			}
		} else {
			if (justClosedATag && letter != ">") justClosedATag = false;
		}
		
		formattedCode += formattedText;
	}
	
	return formattedCode;
}


let purg = function (inputCode, fileType="html") {
	
	fileType = fileType.toLowerCase ();
	let purgdCode = "";
	
	switch (fileType) {
		case "css":
			purgdCode = formatCss (preformatCss (inputCode));
			break;
		case "javascript":
			purgdCode = formatJs (preformatJs (inputCode));
			break;
		case "json":
			purgdCode = formatJson (preformatJson (inputCode));
			break;
		case "html":
			purgdCode = formatHtml (preformatHtml (inputCode));
			break;
	}
	
	return purgdCode;
}

function activate(context) {
	const disposable = vscode.commands.registerCommand('purg.purg', async function () {
		console.log('Welcome to Purg: a code refurbisher and organizer.');

		let file = vscode.window.activeTextEditor.document;
		//let filePath = file.fileName;
		let fileContent = file.getText ();
		let fileType = file.languageId;
		let fileUri = file.uri; // Needed in the edit function

		const newContent = purg (fileContent, fileType);

        const edit = new vscode.WorkspaceEdit();
        const fullRange = new vscode.Range(
            file.positionAt(0),
            file.positionAt(fileContent.length),
        );
        edit.replace(fileUri, fullRange, newContent);

        await vscode.workspace.applyEdit(edit);

		vscode.window.showInformationMessage('Welcome to Purg!');
	});

	context.subscriptions.push(disposable);
}

// This method is called when your extension is deactivated
function deactivate() {}

module.exports = {
	activate,
	deactivate
}
