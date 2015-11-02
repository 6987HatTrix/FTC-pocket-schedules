'use strict';

function test_process () {
	var results = processCSVrounds(document.getElementById('csv_input').value)
	var teamNames = processNames(document.getElementById('csv_teams').value)

	document.getElementById('test_output').innerText = toTextOutput(results);

	$('#test_output').append(toTablesOutput(results, teamNames))
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

function toTablesOutput (records, teamNames) {
	var list = []

	for (var j = 0; j < Object.keys(records).length; j++) {
		var div = $("<div>").addClass('oneSchedule')
		Object.keys(records)[j]

		var teamNum = Object.keys(records)[j] //TODO: this should be explicitly sorted
		var record = records[teamNum]
		
		var title = $('<div>').addClass('scheduleTitle')
		.append($('<div>').addClass('smallTitle').text('Pocket schedule from HatTrix&TBD to'))
		.append($('<div>').addClass('recipient').text(teamNum + ": " + teamNames[teamNum]))

		var table = $("<table>").addClass('teamSchedule')
		var header = $("<tr>").addClass('header_row')
		.append($("<td>").text('Round #').addClass('col1'))
		.append($("<td>").text('Partner').addClass('othercol'))
		.append($("<td>").text('Rival 1').addClass('othercol'))
		.append($("<td>").text('Rival 2').addClass('othercol'))
		
		table.append(header)
		
		for (var i = 0; i < record.length; i++) {
			var row = $('<tr>');

			function append(color, major, minor){ 
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
			var myColor = record[i].role.split(' ')[0].toLowerCase()
			var otherColor = {'red':'blue', 'blue':'red'}[myColor]

			append(myColor, record[i].roundnum, record[i].role);
			append(myColor, record[i].alliancemate);
			append(otherColor, record[i].opponents[0]);
			append(otherColor, record[i].opponents[1]);

			table.append(row)
		};
		div.append(title)
		div.append(table)
		list.push(div)
	}
	return list
}
