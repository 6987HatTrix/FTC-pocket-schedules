# This file (tested in Python 2.7.3) transforms the round schedule
# and team list for the tournament into individualized, sorted schedules
# for each team. This is saved as a .csv, ready for importing to Word mail merge

# I have aspirations of making this process significantly easier, probably
# through the creation of a web interface.

# Eric Miller <eric@legoaces.org> (FTC 6987: HatTrix)

import itertools, re

schedule_file = "schedule.csv"
teamlist_file = "teams.csv"

teamNames = {}

teams = [] #ordered list of all team numbers

teamSchedules = {}

# csvFields is just a big ordered list of all the exported fields
csvFields = (['Teamnum', 'Teamname', 'overflow']
        +
        list(map(''.join, itertools.product(
            'r1 r2 r3 r4 r5 r6 r7 r8 r9'.split(' '),
            'Roundinfo Alliancemate Opponent1 Opponent2'.split(' '),
            'Number Name'.split(' '),
            'Red Blue'.split(' ')))))
maxRound = 9

isRed = {False: 'Blue', True: 'Red'} # dict

#A round input is [roundNum, Red 1, Red 2, Blue 1, Blue 2]
#A team's schedule is a list [[roundNum, position, Alliance, Opponent1, Opponent2],...]

def main(export = 'export.csv', teams = 'teams.csv', schedule = 'schedule.csv'):
    importTeams(teams)
    processAllRounds(schedule)
    save(export)

def save(filename):
    if not filename.endswith('.csv'): filename += '.csv'
    file = open(filename, 'w')
    file.write(generateCsv())
    file.close()

def generateCsv():
    rows = [','.join(csvFields)] #Generate header line
    for team in sorted(list(teamSchedules), key=lambda n: teams.index(n)):
        rows += [generateCsvRow(team)]
    return '\n'.join(rows)

def generateCsvRow(teamNum):
    fields = {}
    fields['Teamnum'] = teamNum
    fields['Teamname'] = getName(teamNum)

    overflow = []
    for match in range(1,len(teamSchedules[teamNum])+1):
        matchinfo = teamSchedules[teamNum][match-1]
        if (match > maxRound):
            overflow.append(str(matchinfo[0]))
        color = matchinfo[1][:3].lower() == 'red'

        fields['r'+str(match)+'Roundinfo'+'Number'+isRed[color]] = matchinfo[0]
        fields['r'+str(match)+'Roundinfo'+'Name'+isRed[color]] = matchinfo[1]
        
        fields['r'+str(match)+'Alliancemate'+'Number'+isRed[color]] = matchinfo[2]
        fields['r'+str(match)+'Alliancemate'+'Name'+isRed[color]] = getName(matchinfo[2])
        fields['r'+str(match)+'Opponent1'+'Number'+isRed[not color]] = matchinfo[3]
        fields['r'+str(match)+'Opponent1'+'Name'+isRed[not color]] = getName(matchinfo[3])
        fields['r'+str(match)+'Opponent2'+'Number'+isRed[not color]] = matchinfo[4]
        fields['r'+str(match)+'Opponent2'+'Name'+isRed[not color]] = getName(matchinfo[4])

    if overflow:
        if (len(overflow)>1):
            print "overflow capped at 1"
        fields['overflow'] = 'Also: '+';'.join(overflow[:1])
    #print(fields)
    csv = []
    for column in csvFields:
        if column in fields:
            csv.append(str(fields[column]))
        else:
            csv.append('')
    return ','.join(csv)

def importTeams(filename = "teams.csv"):
    f = open(filename, "r")
    for line in f.readlines():
        if re.match("[0-9]+,", line):
            num, name = line.split(',',1)
            num = int(num)
            name = name.strip()
            
            teamNames[num] = name
            teams.append(num)
    f.close()

def getName(teamNum):
    if teamNum in teamNames:
        return teamNames[teamNum]
    return 'Unknown'

def getNum(teamNum):
    return str(teamNum)

def numName(teamNum):
    return 'FTC '+getNum(teamNum)+': '+getName(teamNum)

def addScheduleElement(teamNum, roundData):
    if teamNum not in teamSchedules:
        teamSchedules[teamNum] = []
    teamSchedules[teamNum].append(roundData)

def processRound(roundNum, red1, red2, blue1, blue2):
    roundNum = int(roundNum)
    red1 = int(red1)
    red2 = int(red2)
    blue1 = int(blue1)
    blue2 = int(blue2)
    addScheduleElement(red1, [roundNum, 'red 1', red2, blue1, blue2])
    addScheduleElement(red2, [roundNum, 'red 2', red1, blue1, blue2])
    addScheduleElement(blue1, [roundNum, 'blue 1', blue2, red1, red2])
    addScheduleElement(blue2, [roundNum, 'blue 2', blue1, red1, red2])

def processAllRounds(fileName):
    teamSchedules = dict()
    file = open(fileName)
    file.readline() #removes the header row
    for line in file.readlines():
        line = line.strip()
        if not re.match('[0-9]+,', line):
            continue
        processRound(*(line.split(',')[:5]))
    file.close()

def printTeamSchedule(teamNum):
    rounds = teamSchedules[teamNum]
    for match in rounds:
        print("In round", str(match[0])+',',
              'Team ', teamNum,
              'is paired with', numName(match[2]),
              'against', numName(match[3]),
              'and', numName(match[4]))

