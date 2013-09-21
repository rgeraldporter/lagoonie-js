
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

lagoonie 								= {};
lagoonie.dom 							= {};
lagoonie.singleton						= {};
lagoonie.const							= {};

( function(global) {
	
	"use strict";
	
	lagoonie.singleton.speciesReportsCollection = function() {
		
		var elements = [];

		if ( lagoonie.singleton.speciesReportsCollection.prototype._singletonInstance )
			return lagoonie.singleton.speciesReportsCollection.prototype._singletonInstance;
		
		lagoonie.singleton.speciesReportsCollection.prototype._singletonInstance = this;
		
		this.clear = function() {
			
			elements = [];
			
		}
		
		this.add = function( data ) {
			
			if( !(data instanceof Array) && !(data instanceof lagoonie.speciesReport) ) {
			
				console.log( "speciesReport not an array or instanceof lagoonie.speciesReport" );
			
				return false;
				
			}
		
			if( data instanceof Array ) {
				
				for( var report in data ) {
				
					elements.push( data[report] );
				
				}
				
			} else {
				
				elements.push( data );
				
			}

		}
		
		this.getAll = function() {
		
			return elements;
		
		}

		lagoonie.reports	= this;
		
	};

	var a	= new lagoonie.singleton.speciesReportsCollection();
	var b	= lagoonie.singleton.speciesReportsCollection();
	
	global.result = a === b;

}(window) );

lagoonie.speciesReport 	= function( config ) {

	for( var column in config ) {
	
		this[ column ] = config[ column ];
	
	}
	
}

// CONST
lagoonie.const.START_LINE	= 2;

window.onload = function() {

	lagoonie.dom.submitButton		= document.getElementById( "lagoonie-process" );
	lagoonie.dom.resetButton		= document.getElementById( "lagoonie-reset" );
	lagoonie.dom.appendButton		= document.getElementById( "lagoonie-append" );
	lagoonie.dom.textArea			= document.getElementById( "lagoonie-textarea" );
	lagoonie.dom.resultHTML			= document.getElementById( "lagoonie-result" );
	
	lagoonie.resetList	= function() {

		lagoonie.dom.appendButton.style.display 	= "none";
		lagoonie.dom.textArea.value 				= "";
	
	}
	
	lagoonie.processMetadata	= function( lines ) {
	
		var lineArr 	= lines[1].split(' '),
			location	= lines[0];
			
		return {

			location:	location,
			date:		lineArr[0],
			time:		lineArr[1],
			duration:	( !! lineArr[2] ) ? lineArr[2] : "",
			distance:	( !! lineArr[3] ) ? lineArr[3] : ""
			
		};
	
	}
	
	lagoonie.appendList		= function () {
	
		return new lagoonie.list( true );
	
	}
	
	lagoonie.speciesCount	= function() {
		
		this.total		= 0;
		this.male		= 0;
		this.female		= 0;
		this.juvenile	= 0;
		this.immature	= 0;
		this.deceased	= 0;
		this.notes		= "";
				
	}
	
	lagoonie.processList	= function() {
		
		return new lagoonie.list();
		
	}
		
	lagoonie.list 			= function( append ) {
		
		!!! append && lagoonie.reports.clear();
		
		this.lines				= lagoonie.dom.textArea.value.split(/\n/);
		this.result				= "";
		this.metadata			= lagoonie.processMetadata( this.lines );
		this.error				= false;
		this.reportCollection	= [];
		
		lagoonie.dom.appendButton.style.display = "block";
		
		// if km is appended to distance, convert to miles
		if( this.metadata.distance.search(/km/i) != -1 || this.metadata.distance.search(/k/i) != -1 )
			this.metadata.distance = parseFloat( this.metadata.distance.slice(0, -2) * 0.6214 ).toFixed(2);
			
		this.result += "<p>REPORT FOR: "+ this.lines[0] +"<br />"+ (this.lines.length-1) +" species observed.</p>"+
		"<table><tr><th>Species Name</th><th>Observed</th><th>Notes</th></tr>";
					
		for( var lineNumber = lagoonie.const.START_LINE; lineNumber < this.lines.length; lineNumber++ ) {
			
			var currentLine 	= this.lines[lineNumber].trim(),
				chunks			= currentLine.split(' '),
				bandCode 		= chunks[0],
				count			= new lagoonie.speciesCount();		
				
			if( bandCode == "" )
				continue;		

			if( !!! birdBrain[ bandCode ] ) {
			
				this.result += "<tr><td><b style='color:red'>Unreadable line:</b></td><td style='background-color:#ffeeee;'>" + currentLine + " </td><td><b>[report will not be added to CSV until corrected]</b></td></tr>";
				this.error	= true;

				continue;
			
			}
			
			for( var chunkNumber = 1; chunkNumber < chunks.length; chunkNumber++ ) {
			
				var	previousWasNote		= !! isNote ? isNote : false,
					isNote				= false,
					chunkCount			= "";
			
				if( !isNaN(chunks[chunkNumber]) ) {
					
					count.total += parseInt( chunks[chunkNumber] );
					continue;
					
				}

				var chunkCount = "";
				
				for( var characterNumber = 0; characterNumber < chunks[chunkNumber].length; characterNumber++ ) {
				
					// todo: account for 'mmfmfmffmj'-style notation
				
					var currentCharacter 		= chunks[chunkNumber][characterNumber],
						nextCharacter			= chunks[chunkNumber][characterNumber+1] ? chunks[chunkNumber][characterNumber+1] : null,
						breakFor				= false,
						addNotes				= function( singleCharacterChunk ) {
					
							if( !!singleCharacterChunk || (!!nextCharacter && isNaN(nextCharacter)) ) {
								
								count.notes 	+= ( count.notes && !previousWasNote ) ? "<br />" + chunks[chunkNumber].substring(characterNumber) + " " : chunks[chunkNumber].substring(characterNumber) + " ";
								isNote			= true;
								
								return true;
								
							}
							
							return false;
						
						}

					if( ! isNaN(currentCharacter) ) {
					
						chunkCount += currentCharacter;
					
					} else {
					
						switch( currentCharacter ) {
						
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
				
			}
			
			var fullNotes 	= ( count.female ? count.female + "f " : "" ) + ( count.male ? count.male + "m " : "" ) + ( count.immature ? count.immature + "imm " : "" ) + ( count.juvenile ? count.juvenile + "juv" : "" ) + ( count.deceased ? count.deceased + "dec" : "" ) + count.notes + ( count.deceased ? count.deceased + " found deceased." : "" ),
				fullCount	= ( count.total + count.male + count.female + count.juvenile + count.immature + count.deceased );
			
			this.result += "<tr><td>" + birdBrain[ bandCode ].name + "</td><td><b>" + ( count.total + count.male + count.female+count.juvenile + count.immature + count.deceased ) + "</b> "+ ( count.female ? count.female + "f " : "" ) + ( count.male ? count.male + "m " : "" ) + ( count.immature ? count.immature + "imm " : "" ) + ( count.juvenile ? count.juvenile + "juv" : "" ) + ( count.deceased ? count.deceased + "dec" : "" ) + "</td><td><em>"+ count.notes + ( count.deceased ? count.deceased + " found deceased." : "" ) +"</em></td></tr>";
			
			var date = new Date();
			
			// assume protocol based on metadata given
			if( !! this.metadata.distance && !! this.metadata.duration )
				this.metadata.protocol	= "Traveling";
			else if( !! this.metadata.duration && ! this.metadata.distance )
				this.metadata.protocol	= "Stationary";
			else 
				this.metadata.protocol	= "Casual";

			// adding year, assuming current year
			if( this.metadata.date.length == 5 )
				this.metadata.date += "-" + date.getFullYear();
				
			this.metadata.date = this.metadata.date.replace( /-/g, "/" );
			
			console.log( this.error );
			
			var birdReport = new lagoonie.speciesReport({
			
				"Common Name":					birdBrain[ bandCode ].name,
				"Genus":						"",
				"Species":						"",
				"Number":						fullCount,
				"Species Comments":				fullNotes,
				"Location Name":				this.metadata.location,
				"Latitude":						"",
				"Longitude":					"",
				"Date":							this.metadata.date,
				"Start Time":					this.metadata.time,
				"State/Province":				"ON",
				"Country Code":					"CA",
				"Protocol":						this.metadata.protocol,
				"Number of Observers":			1,
				"Duration":						this.metadata.duration,
				"All observations reported?":	"Y",
				"Effort Distance Miles":		this.metadata.distance,
				"Effort Area Acres":			"",
				"Submission Comments":			"List generated using Lagoonie v0.5, written by Rob Porter."
			
			});
								
			this.reportCollection.push( birdReport );
			
			console.log( this.reportCollection)
				
		
		}
		
		this.error || lagoonie.reports.add( this.reportCollection );
		
		var csvResult = toCsv( lagoonie.reports.getAll() ).split( "\n" ).slice( 1 ).join( "\n" );
		
		this.result += "</table>";
		
		this.result += "<textarea style='width: 25em; height: 15em;'>"+ csvResult +"</textarea>";
		
		lagoonie.dom.resultHTML.innerHTML = this.result;
		
		console.log( this.result );

		encodedUri = encodeURI( "data:text/csv;charset=utf-8," + csvResult );
		
		var link = document.createElement("a");
		link.setAttribute("href", encodedUri);
		link.setAttribute("target", "_blank" );
		link.setAttribute("download", "ebird-ready.csv");
		link.innerHTML = "DOWNLOAD";
		
		lagoonie.dom.resultHTML.appendChild( link );
		
		//link.click(); // This will download the data file named "my_data.csv".
	
	}

	lagoonie.dom.submitButton.addEventListener( 'touchend', lagoonie.processList );
	lagoonie.dom.submitButton.addEventListener( 'click', lagoonie.processList );
	
	lagoonie.dom.resetButton.addEventListener( 'touchend', lagoonie.resetList );
	lagoonie.dom.resetButton.addEventListener( 'click', lagoonie.resetList );
	
	lagoonie.dom.appendButton.addEventListener( 'touchend', lagoonie.appendList );
	lagoonie.dom.appendButton.addEventListener( 'click', lagoonie.appendList );

}