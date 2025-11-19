
let htmlKeywords = [];


//import { textIsAFluff, getPrevNonFluffLetter, getNextNonFluffLetter, textIsASpecialChar, } from "../bin/text";
import { createRequire } from "module";
const require = createRequire (import.meta.url);
const { textIsAFluff, getPrevNonFluffLetter, getNextNonFluffLetter, textIsASpecialChar, } = require ("../bin/text");

export let htmlPreformatter = function (inputCode) {
	let preformattedCode = [];
	
	let insideAScriptTag = false;
	
	let codelet = "";
	
	for (let i = 0; i < inputCode.length; i ++) {
		let letter = inputCode [i];
		
		let prevLetter = getPrevNonFluffLetter (i, inputCode);
		let nextLetter = getNextNonFluffLetter (i, inputCode);
		
		
		if (textIsAFluff (letter)) {
			if (codelet.length != 0) preformattedCode.push (codelet);
			
			if (letter == " ") {
				if (inputCode [i-1] != " ") preformattedCode.push (letter);
			} else {
				if (insideAScriptTag) {
					if (letter == "\n") preformattedCode.push (letter);
				}
			}
			
			codelet = "";
		} else {
			if (textIsASpecialChar (letter)) {
				if (codelet.length != 0) preformattedCode.push (codelet);
				codelet = letter;
				preformattedCode.push (codelet);
				codelet = "";
				
				if (letter == "<") {
					if (!insideAScriptTag) {
						if ((inputCode.slice ((i+1), (i+7)) == "script")) insideAScriptTag = true;
					} else {
						if ((inputCode.slice ((i+1), (i+8)) == "/script")) insideAScriptTag = false;
					}
				}
			} else {
				codelet += letter;
			}
		}
	}
	
	return preformattedCode;
}

//export default htmlPreformatter;