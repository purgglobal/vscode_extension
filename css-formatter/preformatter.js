
//import { textIsAFluff, getPrevNonFluffLetter, getNextNonFluffLetter, textIsASpecialChar } from "../bin/text";
import { createRequire } from "module";
const require = createRequire (import.meta.url);
const { textIsAFluff, getPrevNonFluffLetter, getNextNonFluffLetter, textIsASpecialChar } = require ("../bin/text");
let cssKeywords = [];

export let cssPreformatter = function (inputCode) {
	let preformattedCode = [];
	
	let codelet = "";
	let insideAValue = false;
	
	for (let i = 0; i < inputCode.length; i ++) {
		let letter = inputCode [i];
		
		let prevLetter = getPrevNonFluffLetter (i, inputCode);
		let nextLetter = getNextNonFluffLetter (i, inputCode);
		
		if (textIsAFluff (letter)) {
			if (codelet.length != 0) preformattedCode.push (codelet);
			
			if (insideAValue) if (letter == " " && inputCode [i-1] != " ") preformattedCode.push (letter);
			else {
				if (letter == ` `) {
					for (let j = i; j < inputCode.length; j ++) {
							if (!textIsAFluff (inputCode [j])) {
							i = (j-1);
							break;
						}
					}
				}
			}
			
			codelet = "";
		} else {
			if (textIsASpecialChar (letter)) {
				if (codelet.length != 0) preformattedCode.push (codelet);
				codelet = letter;
				preformattedCode.push (codelet);
				codelet = "";
				
				if (letter == ":") insideAValue = true;
				if (letter == ";") insideAValue = false;
			} else {
				codelet += letter;
			}
		}
	}
	
	return preformattedCode;
}

//export default cssPreformatter;