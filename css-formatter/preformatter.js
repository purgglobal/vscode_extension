
import { textIsAFluff, getPrevNonFluffLetter, getNextNonFluffLetter, textIsASpecialChar } from "../bin/text";
let cssKeywords = [];

let cssPreformatter = function (inputCode) {
	let preformattedCode = [];
	
	let codelet = "";
	
	for (let i = 0; i < inputCode.length; i ++) {
		let letter = inputCode [i];
		
		let prevLetter = getPrevNonFluffLetter (i, inputCode);
		let nextLetter = getNextNonFluffLetter (i, inputCode);
		
		
		if (textIsAFluff (letter)) {
			if (codelet.length != 0) preformattedCode.push (codelet);
			
			if (letter == " " && inputCode [i-1] != " ") preformattedCode.push (letter);
			
			codelet = "";
		} else {
			if (textIsASpecialChar (letter)) {
				if (codelet.length != 0) preformattedCode.push (codelet);
				codelet = letter;
				preformattedCode.push (codelet);
				codelet = "";
			} else {
				codelet += letter;
			}
		}
	}
	
	return preformattedCode;
}

export default cssPreformatter;