

import { createRequire } from "module";
const require = createRequire (import.meta.url);
const { indentationSpacing, padText, textIsASpecialChar, stringInitiators, textIsAFluff } = require ("../bin/text");
const { cssPreformatter } = require ('../css-formatter/preformatter');
const { cssMainFormatter } = require ('../css-formatter/main-formatter');
const { jsPreformatter } = require ('../js-formatter/preformatter');
const { jsMainFormatter } = require ('../js-formatter/main-formatter');
const { jsonPreformatter } = require ('../json-formatter/preformatter');
const { jsonMainFormatter } = require ('../json-formatter/main-formatter');

export let htmlMainFormatter = function (preformattedCode, baseIndentationLevel=0) {
	let formattedCode = "";
	
	let indentationLevel = baseIndentationLevel;
	formattedCode = padText ("", indentationSpacing, (indentationLevel));
	
	let insideAnOpeningTag = false;
	let insideAClosingTag = false;
	let insideAnAttributeName = false;
	let insideAnAttributeValue = false;
	let insideComment = false;
	
	let currentHtmlElement = "";
	let currentHtmlAttribute = "";
	let currentHtmlAttributeValue = "";
	
	let tagContentStack = [""];
	
	let attributes = [];
	
	for (let i = 0; i < preformattedCode.length; i ++) {
		let codelet = preformattedCode [i];
		let prevCodelet = (i != 0) ? preformattedCode [i-1] : "";
		let nextCodelet = (i != (preformattedCode.length-1)) ? preformattedCode [i+1] : "";
		
		let formattedCodelet = codelet;
		
		if (insideAnOpeningTag) {
			if (codelet == "=") {
				currentHtmlAttribute = prevCodelet;
				attributes.push ({
					"attribute": currentHtmlAttribute,
					"value": "",
				});
			} else if (codelet == ">") {
				let tagContent = ``;
				
				formattedCodelet = ">";
				
				for (let j = (i+1); j < (preformattedCode.length-1); j ++) {
					if (preformattedCode [j] == "<" && preformattedCode [j+1] == "/" && preformattedCode [j+2] == currentHtmlElement) {
						if (currentHtmlElement == "style" || currentHtmlElement == "script") i = (j-1); // we are deviating from the mormal prpgramme flow here.
						break;
					} else {
						tagContent += preformattedCode [j];
					}
				}
				tagContentStack.push (tagContent);
				
				let specialTagContent = ``;
				switch (currentHtmlElement.toLowerCase ()) {
					case "script":
						let [ scriptAttribute ] = attributes.filter ((attribute) => { if (attribute.attribute == "type") return attribute});
						
						if (!textIsAFluff (tagContent)) {
							if (scriptAttribute) {
								if ((scriptAttribute.value.indexOf ("javascript") != -1) && tagContent != "") specialTagContent = "\n" + jsMainFormatter (jsPreformatter (tagContent), indentationLevel);
								if ((scriptAttribute.value.indexOf ("json") != -1) && tagContent != "") specialTagContent = "\n" + jsonMainFormatter (jsonPreformatter (tagContent), indentationLevel);
							} else {
								specialTagContent = "\n" + jsMainFormatter (jsPreformatter (tagContent), indentationLevel);
							}
							specialTagContent += ("\n" + padText ("", indentationSpacing, (indentationLevel-1)));
						}
						break;
					case "style":
						let [ cssAttribute ] = attributes.filter ((attribute) => { if (attribute.attribute == "type") return attribute});
						
						if (!textIsAFluff (tagContent)) {
							if (cssAttribute) {
								if (cssAttribute.value.indexOf ("css") != -1 && tagContent != "") specialTagContent = "\n" + cssMainFormatter (cssPreformatter (tagContent), indentationLevel);
							} else {
								specialTagContent = "\n" + cssMainFormatter (cssPreformatter (tagContent), indentationLevel);
							}
							specialTagContent += ("\n" + padText ("", indentationSpacing, (indentationLevel-1)));
						}
						
						break;
				}
				formattedCodelet += specialTagContent;
				
				insideAnOpeningTag = false;		
			} else {
				if (insideAnAttributeValue) {
					if (codelet == "\"") {
						insideAnAttributeValue = false;
						attributes [(attributes.length-1)]["value"] = currentHtmlAttributeValue;
						currentHtmlAttributeValue = "";
					} else {
						currentHtmlAttributeValue += codelet;
					}
				} else {
					if (codelet == "\"") {
						insideAnAttributeValue = true;
						
						let [ cssAttribute ] = attributes.filter ((attribute) => { if (attribute.attribute == "style") return attribute});
						let attributeValue = "";
						
						if (cssAttribute) {
							for (let j = (i+1); j < (preformattedCode.length-1); j ++) {
								if (preformattedCode [j] == "\"") {
										i = (j-1); // we are deviating from the mormal prpgramme flow here.
										
										break;
									} else {
										attributeValue += preformattedCode [j];
									}
							}
							let specialAttributeValue = "";
							let attributeIndentationLevel = indentationLevel;
							if (currentHtmlElement == "img" || currentHtmlElement == "br" || currentHtmlElement == "hr") attributeIndentationLevel += 1;
							specialAttributeValue = "\n" + cssMainFormatter (cssPreformatter (attributeValue), attributeIndentationLevel);
	
							formattedCodelet += specialAttributeValue;
						}
					}
				}
			}
		} else if (insideAClosingTag) {
			if (codelet == ">") {
				formattedCodelet = ">";
				
				insideAClosingTag = false;
			}
		} else {
			if (codelet == "<") {
				if (nextCodelet == "/") {
					insideAClosingTag = true;
					insideAnOpeningTag = false;
					
					if (tagContentStack [tagContentStack.length-1].indexOf ("<") != -1) formattedCodelet = ("\n" + padText ("", indentationSpacing, (indentationLevel-1)) + "<");
					tagContentStack.pop ();
					
					indentationLevel -= 1;
				} else {
					currentHtmlElement = ((nextCodelet == "!") ? preformattedCode [i+2] : nextCodelet);
					attributes = [];
					
					formattedCodelet = ("\n" + padText ("", indentationSpacing, (indentationLevel)) + "<");
					
					if (nextCodelet != "!" && nextCodelet != "meta" && nextCodelet != "img" && nextCodelet != "br" && nextCodelet != "hr") {
						indentationLevel += 1;
					}
					insideAnOpeningTag = true;
					insideAClosingTag = false;
				}
			} else {
				if (prevCodelet == ">") {
					if (tagContentStack [tagContentStack.length-1].indexOf ("<") != -1) formattedCodelet = ("\n" + padText ("", indentationSpacing, (indentationLevel)) + codelet);
				}
			}
		}
		
		formattedCode += formattedCodelet;
	}
	
	return formattedCode;
}