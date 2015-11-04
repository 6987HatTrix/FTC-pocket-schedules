# -*- coding: cp1252 -*-
import itertools

teamNames = {
    535  : "TOBOR",
    3537 : "Mecha-Hamsters",
    3903 : "Jaguars",
    4217 : "Autobotics",
    4537 : "DRSS Enterprise",
    4600 : "B1nary B0ts",
    4601 : "The Sharks",
    5300 : "N.E.R.D. Nation",
    6190 : "Cyberstorm",
    6194 : "PLUMBER",
    6360 : "Bumble Bots",
    6987 : "HatTrix",
    7234 : "Cville-ized Botman",
    7419 : "System Overload",
    7965 : "Cybernetic Spartans",
    8149 : "Red Alert...",
    #8149 : "Red Alert: Panic in the Build Room",
    8578 : "Judenki Robotics",
    8711 : "The Gas Attendants",
    8791 : "Green Machine",
    8793 : "Greenwood Robotics",
    8971 : "Diamond Blades",
    8997 : "N.E.R.D.S.",
    9584 : "Sputniks",
    9611 : "Cardinal Tech",
    9645 : "R.V.C.A.",
}

teamSchedules = {}

csvFields = (['Teamnum', 'Teamname']
        +
        list(map(''.join, itertools.product(
            'r1 r2 r3 r4 r5'.split(' '),
            'Roundinfo Alliancemate Opponent1 Opponent2'.split(' '),
            'Number Name'.split(' '),
            'Red Blue'.split(' ')))))

isRed = {False: 'Blue', True: 'Red'}

#A round input is [roundNum, Red 1, Red 2, Blue 1, Blue 2]
#A team's schedule is a list [[roundndNum, position, Alliance, Opponent1, Opponent2]]

def save(filename):
    if not filename.endswith('.csv'): filename += '.csv'
    file = open(filename, 'w')
    file.write(toCsv())
    file.close()

def toCsv():
    rows = [','.join(csvFields)] #Generate header line
    for team in sorted(list(teamSchedules)):
        rows += [toCsvRow(team)]
    return '\n'.join(rows)

def toCsvRow(teamNum):
    fields = {}
    fields['Teamnum'] = teamNum
    fields['Teamname'] = getName(teamNum)
    for match in range(1,len(teamSchedules[teamNum])+1):
        matchinfo = teamSchedules[teamNum][match-1]
        color = matchinfo[1][:3].lower() == 'red'

        fields['r'+str(match)+'Roundinfo'+'Number'+isRed[color]] = matchinfo[0]
        fields['r'+str(match)+'Roundinfo'+'Name'+isRed[color]] = matchinfo[1]
        
        fields['r'+str(match)+'Alliancemate'+'Number'+isRed[color]] = matchinfo[2]
        fields['r'+str(match)+'Alliancemate'+'Name'+isRed[color]] = getName(matchinfo[2])
        fields['r'+str(match)+'Opponent1'+'Number'+isRed[not color]] = matchinfo[3]
        fields['r'+str(match)+'Opponent1'+'Name'+isRed[not color]] = getName(matchinfo[3])
        fields['r'+str(match)+'Opponent2'+'Number'+isRed[not color]] = matchinfo[4]
        fields['r'+str(match)+'Opponent2'+'Name'+isRed[not color]] = getName(matchinfo[4])

    #print(fields)
    csv = []
    for column in csvFields:
        if column in fields:
            csv.append(str(fields[column]))
        else:
            csv.append('')
    return ','.join(csv)

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
    red2 =int(red2)
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
    while(True):
        line = file.readline().split('\n')[0]
        if line == '':
            break
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

