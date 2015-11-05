'use strict';

function process(){
	var results = processTSVrounds(document.getElementById('csv_input').value)
	var teamNames = processNames(document.getElementById('csv_teams').value)

	$('#output').empty().append(wrapTables(toTablesOutput(results, teamNames), 6, true))

	
	$('#instructions').hide();
	$('#output').show();

	window.print();

	window.setTimeout(function(){
		$('#instructions').show();
		$('#output').hide();
	}, 500)

}

/**
 * Parse the list of round schedules provided by the tournament,
 * 	reorganizng the data to be listed by team instead of by round.
 * @param {string} tsv A newline-separated list of rounds listed as "RoundNum\tRed1\tRed2\tBlue1\tBlue2"
 * @return {struct} records A object storing, for each team number, a list of rounds in which they participate,
 		packaged with information about their alliancemate and opponents.

 		Example:
 		{6987: 
			[
			{roundnum: 5, alliancemate: 1234, role:"Red 1", opponents:[2345, 3456]},
			{roundnum: 7, alliancemate: 8463, role:"Blue 2", opponents:[3532, 5837]},
			...
			],
		1234: [...]	
 		}
 */
function processTSVrounds (tsv) {

	// Object() is being used as a dictionary here. 
	var records = Object();

	/**
	 * Store the fact that one team is playing in some particular match
	 * @params {int} teamnum, alliancemate, opponent1, opponent2 Team numbers
	 * @params {int} roundnum 1-indexed qualification round number in the tournament
	 * @params {string} role One of [Red 1, Red 2, Blue 1, Blue 2]
	 */
	function addRecord (teamnum, roundnum, role, alliancemate, opponent1, opponent2) {
		if (!(teamnum in records)){
			records[teamnum] = Array();
		}

		records[teamnum].push({roundnum: roundnum, role: role, alliancemate:alliancemate, opponents:[opponent1, opponent2]});
	}

	var rows = tsv.split('\n');
	for (var i = 0; i < rows.length; i++) {

		// Don't worry too much about the scary regular expression rows[i].match(...). 
		// It just returns a list of three elements, ['1 3443 2423 2342 2523', '1', '3443 2423 2342 2523']
		var match = rows[i].match(/([0-9]+)\t((?:[0-9]+\*?(?:\t|$)){4})/)

		if (match){ //This row looks like a tsv row with five numbers
			var row = match[2].split("\t"); 
			// row should now be a 4-element array of team numbers as strings.
			//TODO: These parseInt calls should be applied with a .map to the array, but it wasn't working :(
			var n = parseInt(match[1])
			var r1 = parseInt(row[0].replace('*', ''))
			var r2 = parseInt(row[1].replace('*', ''))
			var b1 = parseInt(row[2].replace('*', ''))
			var b2 = parseInt(row[3].replace('*', ''))

			// Add records for each of the four teams in the round
			addRecord(r1, n, "Red 1", r2, b1, b2);
			addRecord(r2, n, "Red 2", r1, b1, b2);
			addRecord(b1, n, "Blue 1", b2, r1, r2);
			addRecord(b2, n, "Blue 2", b1, r1, r2);
		}else{
			// The regular expression match failed, something looks wierd about this.
			// This should probably also output something to the page so that the user can see.
			if (rows[i].length > 0) console.error("Line "+(i+1)+" is weird: "+rows[i])
		}

	};

	//console.log(records)
	return records;
}


/**
 * Parse the list of teams expected to be at the tournament.
 * @param {string} tsv A newline-separated list of teams listed as "TeamNum\tTeamName" as pasted from Excel
 * @return {struct} records A object storing, for each team number, their name

 		Example:
 		{
 			6987: 'HatTrix',
			1234: 'Cougars',
			4324: 'Flying People',
			...	
 		}
 */
function processNames(tsv){
	var teamNames = Object();
	
	var rows = tsv.split('\n');
	for (var i = 0; i < rows.length; i++) {
		var match = rows[i].match(/([0-9]+)\t([^\t]+)/)
		if (match){
			var num = parseInt(match[1])
			var name = match[2]

			teamNames[num] = name
		}else{
			if (rows[i].length > 0) console.error("Line "+(i+1)+" is strange: "+rows[i])
		}
	};

	//console.log(teamNames)
	return teamNames;
}


/**
 * Assembles up to 6 html elements into a large 2x3 table for printing.
 * @param {Array} tables A list of up to 6 jquery objects representing individual printable schedules, 
 							potentially including duplicates.
 * @param [optional] {int} duplicity A number representing the number of duplicate copies of each schedule,
 										used to more intelligently arrange them on the page.
 * @return {jquery} page A single 2x3 table of size 11in x 8.5in
 */
function makePage(tables, duplicity) {
	if (duplicity === undefined){
		duplicity = 1;
	}

	// Initialize variables
	var page 	 = $('<div>').addClass('printpage');
	var bigtable = $('<table>').addClass('bigtable');

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

/**
 * Assembles a bunch of team's schedules into a list of pages for printing
 * @param {Array} list A list of many different team schedules, with no duplication.
 * @param {int} numper The number of each schedule that should be printed.
 * @param {bool} collate If false, multiple copies of the same schedule will be printed on the same page
 							If true, multiple copies of the same schedule will be printed in the same location
 								on consective pages. 
 * @return {Array} pages A list of 2x3 tables of size 11in x 8.5in
 */
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


/**
 * Processes the parsed team names and round schedules into a formatted set of pages ready for printing.
 * @param {Object} records The processed list of match schedules outputted from processTSVrounds()
 * @param {Object} teamNames The processed list of team names outputted from processNames()
 * @param {bool} collate If false, multiple copies of the same schedule will be printed on the same page
 							If true, multiple copies of the same schedule will be printed in the same location
 								on consective pages. 
 * @return {Array} pages A list of 2x3 tables of size 11in x 8.5in
 */
function toTablesOutput (records, teamNames) {
	var pages = []

	var teamList = Object.keys(records); //TODO: this should be explicitly sorted

	// Iterate over the teams on the round schedule
	for (var j = 0; j < teamList.length; j++) {
		var div = $("<div>").addClass('oneSchedule')

		var teamNum = teamList[j]
		var record = records[teamNum]
		
		// Build the "title" of the schedule, consisting of the attribution and recipient name
		var title = $('<div>').addClass('scheduleTitle')
		.append($('<div>').addClass('smallTitle').text('Pocket schedule from ... to'))
		.append($('<div>').addClass('recipient').text(teamNum + ": " + teamNames[teamNum]))

		var table = $("<table>").addClass('teamSchedule')


		// Build the header row of the schedule.
		var header = $("<tr>").addClass('header_row')
		.append($("<td>").text('Round #').addClass('col1'))
		.append($("<td>").text('Partner').addClass('othercol'))
		.append($("<td>").text('Rival 1').addClass('othercol'))
		.append($("<td>").text('Rival 2').addClass('othercol'))
		
		table.append(header)
		
		// Figure out the number of rows in the table for formatting  purposes.
		// Tournaments with many rounds need smaller fonts sizes and less padding
		// to fit on 1/6th of a page.
		var CSSnumRows = record.length;
		if (CSSnumRows < 5)
			CSSnumRows = 5;
		if (CSSnumRows > 9){
			console.error('Warning: Team %d has %d rounds listed! This program '+
				'only supports tournaments with 9 or fewer rounds.', teamNum, record.length);
			CSSnumRows = 9;
		}

		// Record the number of rows as a CSS class for formatting purposes.
		div.addClass('rowcount'+CSSnumRows);


		// Iterate through the rounds in which a team is playing.
		for (var i = 0; i < record.length; i++) {
			var row = $('<tr>');

			/*
			 * Appends a cell to the current row with the given color, large text, and small text.
			 * If the small text is unset, it automatically is filled with the team name
			 * identified by the number in major.
			*/
			function append(color, major, minor){ 
				if(minor == undefined){
					minor = teamNames[major]}

				var cell = $('<td>').addClass('record_cell').addClass('color_'+color);
				var d1 = $('<div>').addClass('major');

				d1.text(major)
				cell.append(d1)

				var d2 = $('<div>').addClass('minor');

				d2.text(minor)
				cell.append(d2)

				row.append(cell)
			}
			// Extract color information from record[i].role
			var myColor = record[i].role.split(' ')[0].toLowerCase()
			var otherColor = {'red':'blue', 'blue':'red'}[myColor]

			// Make the four cells in the row
			append(myColor, record[i].roundnum, record[i].role);
			append(myColor, record[i].alliancemate);
			append(otherColor, record[i].opponents[0]);
			append(otherColor, record[i].opponents[1]);

			table.append(row)
		};
		div.append(title)
		div.append(table)
		pages.push(div)
	}
	return pages;
}
