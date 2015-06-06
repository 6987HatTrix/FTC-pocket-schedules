'use strict';

function test_process () {
	var results = processCSVrounds(document.getElementById('csv_input').value)

	document.getElementById('test_output').innerText = 
	toTextOutput(results);

	document.getElementById('test_output').appendChild(toTableOutput(results))
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
		if (rows[i].match("([0-9]+,){4}[0-9]+")){ //This row looks like a csv row with at least five numbers
			var row = rows[i].split(","); 
			//TODO: These parseInt calls should be applied with a .map to the array, but it wasn't working :(
				var n = parseInt(row[0])
				var r1 = parseInt(row[1])
				var r2 = parseInt(row[2])
				var b1 = parseInt(row[3])
				var b2 = parseInt(row[4])

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

function inventTeamNames(){
	var adjectives = "Mighty Roaring Flying Diving Running Nutty Robotic New Reformed".split(' ')
	var nouns = "Robots Team Monkeys Bears Cats Flies Children Monsters Ravens".split(' ')

	var teamNames = {}
	for (var i = 0; i < adjectives.length*nouns.length; i++) {
		teamNames[i] = adjectives[i%adjectives.length] + ' ' + nouns[Math.floor(i/adjectives.length)]
	};

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
	if (!teamNames) teamNames = inventTeamNames();

	var div = document.createElement('div')

	for (var j = 0; j < Object.keys(records).length; j++) {
		Object.keys(records)[j]

		var teamNum = Object.keys(records)[0]
		var record = records[teamNum]

		var table = document.createElement('table')
		for (var i = 0; i < record.length; i++) {
			var row = document.createElement('tr');

			//TODO: This function should also take a "color" argument
			function append(major, minor){ 
				if(minor == undefined) 
					minor = teamNames[major]

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
		div.appendChild(table)
		div.appendChild(document.createElement('br'))
	}
	return div
}