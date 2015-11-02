'use strict';

function test_process () {
	var results = processCSVrounds(document.getElementById('csv_input').value)
	var teamNames = processNames(document.getElementById('csv_teams').value)

	document.getElementById('test_output').innerText = toTextOutput(results);

	$('#test_output').append(toTableOutput(results, teamNames))
}

function processCSVrounds (csv) {
	var records = Object();

	function addRecord (teamnum, roundnum, role, alliancemate, opponent1, opponent2) {
		if (!(teamnum in records)){
			records[teamnum] = Array();
		}

		records[teamnum].push({roundnum: roundnum, role: role, alliancemate:alliancemate, opponents:[opponent1, opponent2]});
	}

	var rows = csv.split('\n');
	for (var i = 0; i < rows.length; i++) {
		if (rows[i].match(/([0-9]+,)([0-9]+\*?,){3}[0-9]+\*?/)){ //This row looks like a csv row with at least five numbers
			var row = rows[i].split(","); 
			//TODO: These parseInt calls should be applied with a .map to the array, but it wasn't working :(
				var n = parseInt(row[0])
				var r1 = parseInt(row[1].replace('*', ''))
				var r2 = parseInt(row[2].replace('*', ''))
				var b1 = parseInt(row[3].replace('*', ''))
				var b2 = parseInt(row[4].replace('*', ''))

				addRecord(r1, n, "Red 1", r2, b1, b2);
				addRecord(r2, n, "Red 2", r1, b1, b2);
				addRecord(b1, n, "Blue 1", b2, r1, r2);
				addRecord(b2, n, "Blue 2", b1, r1, r2);
			}else{
				if (rows[i].length > 0) console.error("Line "+(i+1)+" is odd: "+rows[i])
			}

	};


	console.log(records)
	return records;
}

function processNames(csv){
	var teamNames = Object();
	
	var rows = csv.split('\n');
	for (var i = 0; i < rows.length; i++) {
		if (rows[i].match(/[0-9]+([0-9]+,)/)){
			var row = rows[i].split(","); 
			var num = parseInt(row[0])
			var name = row[1]

			teamNames[num] = name
		}else{
			if (rows[i].length > 0) console.error("Line "+(i+1)+" is strange: "+rows[i])
		}
	};

	console.log(teamNames)
	return teamNames;
}

function toTextOutput (records) {
	var output = Object.keys(records).map(function(key){
		var record = records[key];
		var list = record.map(function(round){
			return key+" is " + round.role + " with " + round.alliancemate + " in round " + round.roundnum + 
			" against " + round.opponents[0] + " and " + round.opponents[1];
		})
		//console.log(list)
		return list.join('\n')
	})

	return output.join('\n\n')
}

function toTableOutput (records, teamNames) {
	var div = $("<div>")

	for (var j = 0; j < Object.keys(records).length; j++) {
		Object.keys(records)[j]

		var teamNum = Object.keys(records)[j] //TODO: this should be explicitly sorted
		var record = records[teamNum]
		
		var title = $('<p>')
		title.text("Pocket Schedule for " + teamNum + ": " + teamNames[teamNum])

		var table = $("<table>")
		var header = $("<tr>").addClass('header_row')
		header.html("<td>Round #</td><td>Partner</td><td>Rival 1</td><td>Rival 2</td>")
		
		table.append(header)
		
		for (var i = 0; i < record.length; i++) {
			var row = $('<tr>');

			//TODO: This function should also take a "color" argument, and apply that class to the cell
			function append(major, minor, color){ 
				if(minor == undefined){
					minor = teamNames[major]}

				var cell = $('<td>').addClass('record_cell').addClass('color_'+color);
				var d1 = $('<div>').addClass('major');
				//d1.classlist.push('major')
				d1.text(major)
				cell.append(d1)

				var d2 = $('<div>').addClass('minor');
				//d2.classlist.push('minor')
				d2.text(minor)
				cell.append(d2)

				row.append(cell)
			}
			append(record[i].roundnum, record[i].role);
			append(record[i].alliancemate);
			append(record[i].opponents[0]);
			append(record[i].opponents[1]);

			table.append(row)
		};
		div.append(title)
		div.append(table)
		div.append($('<br>'))
	}
	return div
}
