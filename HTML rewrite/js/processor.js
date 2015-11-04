'use strict';

function test_process () {
	var results = processCSVrounds(document.getElementById('csv_input').value)
	var teamNames = processNames(document.getElementById('csv_teams').value)

	//document.getElementById('test_output').innerText = toTextOutput(results);

	$('#test_output').empty().append(wrapTables(toTablesOutput(results, teamNames), 6, false))
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
		if (rows[i].match(/([0-9]+\t)([0-9]+\*?\t){3}[0-9]+\*?/)){ //This row looks like a csv row with at least five numbers
			var row = rows[i].split("\t"); 
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
		if (rows[i].match(/[0-9]+([0-9]+\t)/)){
			var row = rows[i].split("\t"); 
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

function makePage(tables, duplicity) {
	if (duplicity === undefined){
		duplicity = 1;
	}

	// Initialize variables
	var page 	= $('<div>').addClass('printpage');
	var bigtable= $('<table>').addClass('bigtable');

	var rows = [$('<tr>').addClass('bigrow'), $('<tr>').addClass('bigrow')];

	var cells = [];
	for (var i = 0; i < 6; i++){
		cells.push($('<td>').addClass('bigcell'));
	}
	
	// Build table structure
	if (duplicity == 3){
		// We want identical cells to appear next to each other horizontally
		rows[0].append(cells.slice(0,3))
		rows[1].append(cells.slice(3,6))
	}else{
		// We want identical cells to appear next to each other vertically
		rows[0].append(cells[0]).append(cells[2]).append(cells[4])
		rows[1].append(cells[1]).append(cells[3]).append(cells[5])
	}

	bigtable.append(rows)
	page.append(bigtable)

	// Fill in cells
	for (var i = 0; i < tables.length; i++){
		cells[i].append(tables[i]);
	}
	return page
}

function wrapTables(list, numper, collate) {
	var pages = [];

	if (collate){
		var n = Math.ceil(list.length / 6) //Number of unique pages needed
		for (var i = 0; i < n; i++){
			var page = makePage(list.slice(6*i, 6*(i+1)), 1)
			for (var j = 0; j < numper; j++){
				pages.push(page.clone())
			}
		}
	}else{
		var newlist = [];

		for (var i = 0; i < list.length; i++){
			for (var j = 0; j < numper; j++){
				newlist.push(list[i].clone())
			}
		}


		var n = Math.ceil(newlist.length / 6) //Number of unique pages needed
		for (var i = 0; i < n; i++){
			var page = makePage(newlist.slice(6*i, 6*(i+1)), numper)
			pages.push(page)
		}
	}
	
	return pages
}

function toTablesOutput (records, teamNames) {
	var list = []

	var teamList = Object.keys(records);

	for (var j = 0; j < teamList.length; j++) {
		var div = $("<div>").addClass('oneSchedule')
		teamList[j]

		var teamNum = teamList[j] //TODO: this should be explicitly sorted
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
		
		var CSSnumRows = record.length;
		if (CSSnumRows < 5)
			CSSnumRows = 5;
		if (CSSnumRows > 9){
			console.log('Warning: Team %d has %d rounds listed!', teamNum, record.length);
			CSSnumRows = 9;
		}

		div.addClass('rowcount'+CSSnumRows);

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
	return list;
}
