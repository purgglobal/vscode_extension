
let getObjectContent = function (object, indentationLevel=-1) {
	let objectContent = ``;
	let indentationSpacing = `    `;
	
	let n = 0;
	for (let prop in object) {
		//let spacing = duplicateTextNTimes (indentationSpacing, indentationLevel);
		let spacing = padText ("", indentationSpacing, indentationLevel);
		
		if (typeof (object [prop]) != `object`) {
			try {
				if (parseInt (prop)) {
					if (n == 1) objectContent += spacing+`[${object [prop]}, `;
					else if ((n % 3) == 0 && n != (object.length-1)) objectContent += `\n`+spacing+`${object [prop]}, `;
					else if (n < (object.length-2)) objectContent += `${object [prop]}, `;
					if (n == (object.length-1)) objectContent += `${object [prop]}]`;
				} else {
					objectContent += spacing+`"${prop}":  ${object [prop]}\n`;
				}
			} catch (e) {
				console.log (e);
			}
		} else if (Array.isArray (object [prop])) {
			for (let a = 0; a < object [prop].length; a ++) { //THIS 'FOR LOOP' CHECKS IF NONE OF THE CONTENT OF AN ARRAY IS AN OBJECT
				if (typeof (object [prop][a]) == `object`) {
					indentationLevel += 1;
					objectContent += getObjectContent (object [prop][a],  indentationLevel);
					
					indentationLevel -= 1;
				} else { // THE IF STATEMENT BELOW IF TO AVOID DUPLICATION
					if (a == 0) objectContent += spacing+`"${prop}":  [${object [prop]}]\n`;								
				}
			}
		} else if (typeof (object [prop]) == `object`) {
			indentationLevel += 1;
			objectContent += spacing+getObjectContent (object [prop],  indentationLevel);
			indentationLevel -= 1;
		}
		
		n ++;
	}
	
	return objectContent;
}

export default getObjectContent;