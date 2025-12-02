
/*
	The main formatters take in codelets, format the codelets 
	and return a string consisting of this codelet
*/

import { createRequire } from "module";
const require = createRequire (import.meta.url);
const { indentationSpacing, padText } = require ("../bin/text");

export let cssMainFormatter = function (preformattedCode, baseIndentationLevel=0) {
	let formattedCode = "";
	
	let indentationLevel = baseIndentationLevel;
	formattedCode = padText ("", indentationSpacing, (indentationLevel));
	
	let insideASelector = true;
	let insideAnAttributeName = false;
	let insideAnAttributeValue = false;
	
	for (let i = 0; i < preformattedCode.length; i ++) {
		let codelet = preformattedCode [i];
		let prevCodelet = (i != 0) ? preformattedCode [i-1] : "";
		let nextCodelet = (i != (preformattedCode.length-1)) ? preformattedCode [i+1] : "";
		
		let formattedCodelet = codelet;
		
		if (insideASelector) {
			if (codelet == "{") {
				if (prevCodelet == " ") formattedCodelet = "{\n";
				else formattedCodelet = " {\n";
				
				indentationLevel += 1;
				
				if (nextCodelet != "}") {
					insideASelector = false;
					insideAnAttributeName = true;
				}
			} else if (codelet == "}") {
				formattedCodelet = padText ("", indentationSpacing, (indentationLevel-1)) + "}";
				if (i != (preformattedCode.length-1)) formattedCodelet += "\n\n";
				
				indentationLevel -= 1;
			} else {
				if (prevCodelet == "}") formattedCodelet = padText ("", indentationSpacing, (indentationLevel)) + codelet;
				
				if (codelet == ":") {
					if (nextCodelet == " ") formattedCodelet = ":";
					else formattedCodelet = ": ";
					
					insideASelector = false;
					insideAnAttributeName = false;
					insideAnAttributeValue = true;
				}
			}
		} else {
			if (insideAnAttributeName) {
				if (prevCodelet == "{" || prevCodelet == ";") {
					formattedCodelet = padText ("", indentationSpacing, (indentationLevel));
					if (codelet != " ") formattedCodelet += codelet;
				}
				
				if (codelet == ":") {
					if (nextCodelet == " ") formattedCodelet = ":";
					else formattedCodelet = ": ";
					
					insideASelector = false;
					insideAnAttributeName = false;
					insideAnAttributeValue = true;
				}
			} else {
				if (insideAnAttributeValue) {
					if (codelet == ";") {
						formattedCodelet = ";";
						if (i != (preformattedCode.length-1)) formattedCodelet += "\n";
						
						insideAnAttributeValue = false;
						if (nextCodelet != "}") {
							insideAnAttributeName = true;
						} else {
							insideASelector = true;
						}
					} else {
						if (codelet == "}" && prevCodelet != ";") {
							formattedCodelet = "\n" + padText ("", indentationSpacing, (indentationLevel-1)) + "}\n\n";
							
							indentationLevel -= 1;
							insideAnAttributeName = true;
							insideAnAttributeValue = false;
							insideASelector = true;
						}
					}
				}
			}
		}
		
		
		if (codelet == " " && prevCodelet == " ") formattedCodelet = "";
		
		formattedCode += formattedCodelet;
	}
	
	return formattedCode;
}