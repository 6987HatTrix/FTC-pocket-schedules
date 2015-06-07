'use strict';

function test_process () {
	var results = processCSVrounds(document.getElementById('csv_input').value)
	var teamNames = processNames(document.getElementById('csv_teams').value)

	document.getElementById('test_output').innerText = 
	toTextOutput(results);

	document.getElementById('test_output').appendChild(toTableOutput(results, teamNames))
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
		if (rows[i].match("([0-9]+,)([0-9,*]+,){3}[0-9,*]+")){ //This row looks like a csv row with at least five numbers
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
		if (rows[i].match("[0-9]+([0-9]+,)")){
			var row = rows[i].split(","); 
			var num = parseInt(row[0])
			var name = row[1]

			teamNames[num] = name
		}else{
			if (rows[i].length > 0) console.error("Line "+(i+1)+" is odd: "+rows[i])
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
		console.log(list)
		return list.join('\n')
	})

	return output.join('\n\n')
}

function toTableOutput (records, teamNames) {
	var div = document.createElement('div')

	for (var j = 0; j < Object.keys(records).length; j++) {
		Object.keys(records)[j]

		var teamNum = Object.keys(records)[j]
		var record = records[teamNum]
		
		var title = document.createElement('p')
		title.innerText = "Pocket Schedule for " + teamNum + ": " + teamNames[teamNum]

		var table = document.createElement('table')
		var header = document.createElement('tr');
		header.innerHTML = "<td>Round #</td><td>Partner</td><td>Rival 1</td><td>Rival 2</td>"
		
		table.appendChild(header)
		
		for (var i = 0; i < record.length; i++) {
			var row = document.createElement('tr');

			//TODO: This function should also take a "color" argument
			function append(major, minor){ 
				if(minor == undefined){
					minor = teamNames[major]}

				var cell = document.createElement('td');
				var d1 = document.createElement('p');
				//d1.classlist.push('major')
				d1.innerText = major
				cell.appendChild(d1)

				var d2 = document.createElement('p');
				//d2.classlist.push('minor')
				d2.innerText = minor
				cell.appendChild(d2)

				row.appendChild(cell)
			}
			append(record[i].roundnum, record[i].role);
			append(record[i].alliancemate);
			append(record[i].opponents[0]);
			append(record[i].opponents[1]);

			table.appendChild(row)
		};
		div.appendChild(title)
		div.appendChild(table)
		div.appendChild(document.createElement('br'))
	}
	return div
}
