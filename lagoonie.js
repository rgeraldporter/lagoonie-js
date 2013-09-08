
/**
* Converts a value to a string appropriate for entry into a CSV table.  E.g., a string value will be surrounded by quotes.
* @param {string|number|object} theValue
* @param {string} sDelimiter The string delimiter.  Defaults to a double quote (") if omitted.
*/
function toCsvValue(theValue, sDelimiter) {
	var t = typeof (theValue), output;
 
	if (typeof (sDelimiter) === "undefined" || sDelimiter === null) {
		sDelimiter = '"';
	}
 
	if (t === "undefined" || t === null) {
		output = "";
	} else if (t === "string") {
		output = sDelimiter + theValue + sDelimiter;
	} else {
		output = String(theValue);
	}
 
	return output;
}
 
/**
* Converts an array of objects (with identical schemas) into a CSV table.
* @param {Array} objArray An array of objects.  Each object in the array must have the same property list.
* @param {string} sDelimiter The string delimiter.  Defaults to a double quote (") if omitted.
* @param {string} cDelimiter The column delimiter.  Defaults to a comma (,) if omitted.
* @return {string} The CSV equivalent of objArray.
*/
function toCsv(objArray, sDelimiter, cDelimiter) {
	var i, l, names = [], name, value, obj, row, output = "", n, nl;
 
	// Initialize default parameters.
	if (typeof (sDelimiter) === "undefined" || sDelimiter === null) {
		sDelimiter = '"';
	}
	if (typeof (cDelimiter) === "undefined" || cDelimiter === null) {
		cDelimiter = ",";
	}
 
	for (i = 0, l = objArray.length; i < l; i += 1) {
		// Get the names of the properties.
		obj = objArray[i];
		row = "";
		if (i === 0) {
			// Loop through the names
			for (name in obj) {
				if (obj.hasOwnProperty(name)) {
					names.push(name);
					row += [sDelimiter, name, sDelimiter, cDelimiter].join("");
				}
			}
			row = row.substring(0, row.length - 1);
			output += row;
		}
 
		output += "\n";
		row = "";
		for (n = 0, nl = names.length; n < nl; n += 1) {
			name = names[n];
			value = obj[name];
			if (n > 0) {
				row += ","
			}
			row += toCsvValue(value, '"');
		}
		output += row;
	}
 
	return output;
}

window.speciesReport = function( config ) {

	for( var column in config ) {
	
		this[ column ] = config[ column ];
	
	}
	
}

window.speciesReportCollection = function( speciesReports ) {

	var elements = [];
	
	for( var report in speciesReports ) {
	
		elements.push( report );
	
	}
	
	this.add = function( speciesReport ) {
	
		elements.push( speciesReport );
	
	}
	
	this.getAll = function() {
	
		return elements;
	
	}

}

window.onload = function() {

	var submitButton	= document.getElementById( "lagoonie-process" );
	var resetButton		= document.getElementById( "lagoonie-reset" );
	var speciesReports	= new window.speciesReportCollection();
	
	window.resetList	= function() {
	
		var textarea	= document.getElementById( "lagoonie-textarea" );
		
		textarea.value = "";
	
	}

	window.processList	= function() {
	
		var textarea	= document.getElementById( "lagoonie-textarea" ),
			listContent	= textarea.value,
			lines		= listContent.split(/\n/),
			result		= "",
			resultHTML	= document.getElementById( "lagoonie-result" );
		
		result = "<p>REPORT FOR: "+ lines[0] +"<br />"+ (lines.length-1) +" species observed.</p>"+
					"<table><tr><th>Species Name</th><th>Observed</th><th>Notes</th></tr>";
					
		for( var i = 1; i < lines.length; i++ ) {
		
			lines[i] = lines[i].trim();
		
			var chunks		= lines[i].split(' '),
				bandCode 	= chunks[0],
				count		= { total: 0, male: 0, female: 0, juvenile: 0, immature: 0, deceased: 0, notes: "" };				
			
			if( !!! birdBrain[ bandCode ] ) {
			
				result += "<tr><td><b>Unreadable line:</b></td><td>" + lines[i] + "</td></tr>";
				
				continue;
			
			}
			
			for( var ii = 1; ii < chunks.length; ii++ ) {
			
				var	prevNote	= !! isNote ? isNote : false,
					isNote		= false;
			
				if( isNaN(chunks[ii]) ) {

					var chunkCount = "";
					
					for( var char = 0; char < chunks[ii].length; char++ ) {
					
						// todo: account for 'mmfmfmffmj'-style notation
					
						var character 		= chunks[ii][char],
							nextCharacter	= chunks[ii][char+1] ? chunks[ii][char+1] : null,
							breakFor		= false,
							addNotes		= function( singleCharacterChunk ) {
						
								if( !!singleCharacterChunk || (!!nextCharacter && isNaN(nextCharacter)) ) {
									
									count.notes 	+= ( count.notes && !prevNote ) ? "<br />" + chunks[ii].substring(char) + " " : chunks[ii].substring(char) + " ";
									isNote			= true;
									
									return true;
									
								}
								
								return false;
							
							}
						
						if( ! isNaN(character) ) {
						
							chunkCount += character;
						
						} else {
						
							switch( character ) {
							
								case "m":
								
									if( addNotes() ) {
									
										breakFor = true;
										
										break;
									
									}
								
									if( chunkCount )
										count.male += parseInt( chunkCount );
									else 
										count.male++;
										
									break;
									
								case "f":
								
									if( addNotes() ) {
									
										breakFor = true;
										
										break;
									
									}
								
									if( chunkCount )
										count.female += parseInt( chunkCount );
									else
										count.female++;
										
									break;
									
								case "j":
								
									if( addNotes() ) {
									
										breakFor = true;
										
										break;
									
									}
								
									if( chunkCount )
										count.juvenile += parseInt( chunkCount );
									else
										count.juvenile++;
										
									break;
									
								case "i":
								
									if( addNotes() ) {
									
										breakFor = true;
										
										break;
									
									}
								
									if( chunkCount )
										count.immature += parseInt( chunkCount );
									else
										count.immature++;
										
									break;
									
								case "d":
								
									// append as note for eBird as well
									if( addNotes() ) {
									
										breakFor = true;
										
										break;
									
									}
								
									if( chunkCount )
										count.deceased += parseInt( chunkCount );
									else
										count.deceased++;
										
									break;
									
								default:
								
									if( addNotes(true) ) {
									
										breakFor = true;
										
										break;
									
									}
									
									break;

							}
							
							chunkCount = "";
						
						}
						
						if( !!breakFor )
							break;
					
					}
				
					continue;
					
				}
				
				count.total += parseInt( chunks[ii] );
			
			}
			
			var fullNotes 	= ( count.female ? count.female + "f " : "" ) + ( count.male ? count.male + "m " : "" ) + ( count.immature ? count.immature + "imm " : "" ) + ( count.juvenile ? count.juvenile + "juv" : "" ) + ( count.deceased ? count.deceased + "dec" : "" ) + count.notes + ( count.deceased ? count.deceased + " found deceased." : "" ),
				fullCount	= ( count.total + count.male + count.female + count.juvenile + count.immature + count.deceased );
			
			result += "<tr><td>" + birdBrain[ bandCode ].name + "</td><td><b>" + ( count.total + count.male + count.female+count.juvenile + count.immature + count.deceased ) + "</b> "+ ( count.female ? count.female + "f " : "" ) + ( count.male ? count.male + "m " : "" ) + ( count.immature ? count.immature + "imm " : "" ) + ( count.juvenile ? count.juvenile + "juv" : "" ) + ( count.deceased ? count.deceased + "dec" : "" ) + "</td><td><em>"+ count.notes + ( count.deceased ? count.deceased + " found deceased." : "" ) +"</em></td></tr>";
				
			speciesReports.add( new window.speciesReport({
			
					"Common Name":					birdBrain[ bandCode ].name,
					"Genus":						"",
					"Species":						"",
					"Number":						fullCount,
					"Species Comments":				fullNotes,
					"Location Name":				"My test location",
					"Latitude":						"",
					"Longitude":					"",
					"Date":							"09/07/2013",
					"Start Time":					"13:30",
					"State/Province":				"ON",
					"Country Code":					"CA",
					"Protocol":						"Traveling",
					"Number of Observers":			1,
					"Duration":						60,
					"All observations reported?":	"Y",
					"Effort Distance Miles":		1,
					"Effort Area Acres":			"",
					"Submission Comments":			"This is a test.."
			
				})
				
			);
				
		
		}
		
		var csvResult = toCsv( speciesReports.getAll() ).split( "\n" ).slice( 1 ).join( "\n" );
		
		result += "</table>";
		
		result += "<textarea style='width: 25em; height: 15em;'>"+ csvResult +"</textarea>";
		
		resultHTML.innerHTML = result;
		
		speciesReports = new window.speciesReportCollection();
	
	}

	submitButton.addEventListener( 'touchend', window.processList );
	submitButton.addEventListener( 'click', window.processList );
	
	resetButton.addEventListener( 'touchend', window.resetList );
	resetButton.addEventListener( 'click', window.resetList );


}