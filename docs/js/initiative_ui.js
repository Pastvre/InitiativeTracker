
initiativeMap = {}


// rebuild the initiative table from rows in data[]
refreshInitiatives = function(data) {
    let table = document.getElementById("initiative-table");
    for (var i in data) {
        index = parseInt(i)+1;
        let v = data[i];
        var row;
        if (index < table.rows.length) {
            row = table.rows[index];
        } else {
            row = table.insertRow(index);
            for (var j=0; j<6; j++)
                row.insertCell(0);
        }
        row.cells[0].innerHTML = index;
        row.cells[0].colSpan = "1";
        row.cells[1].innerHTML = encodeURIComponent(v.name).replace('%20', ' ').replace('%20', ' ');
        row.cells[2].innerHTML = v.initiative == '0' ? 0 : (Number(v.initiative) || '...');
        row.cells[3].innerHTML = (v.critical && true) || false;
        row.cells[4].innerHTML = (v.surprised && true) || false;
        row.cells[5].innerHTML = Number(v.modifier) || 0;
    }
    while (table.rows.length - 1 > data.length) {
        table.deleteRow(table.rows.length - 1); // delete extra rows
    }
}

function sortInitiatives(map) {
    let table = [];
    for (var k in map) {
        table[table.length] = {
            name: k,
            initiative: Number(map[k].initiative) || 0,
            critical: map[k].critical == 'true' || map[k].critical == true || false,
            surprised: map[k].surprised == 'true' || map[k].surprised == true || false,
            modifier: Number(map[k].modifier) || 0
        }
    }
    table.sort(
        function(a, b) {
            let ia = Number(a.initiative || -20);
            let ib = Number(b.initiative || -20);

            if (a.surprised == 'true' || a.surprised == true || false)
                ia -= 20;
            else if (a.critical == 'true' || a.critical == true || false)
                ia += 20;

            if (b.surprised == 'true' || b.surprised == true || false)
                ib -= 20;
            else if (b.critical == 'true' || b.critical == true || false)
                ib += 20;

            if (ia == ib)
                return (b.modifier || 0) - (a.modifier || 0); // higher modifier goes first in a tie

            return ib - ia;
        }
    );
    console.log('sort:'+JSON.stringify(table));
    return table;
}

updateInitiative = function(data) {
    if (data.session == sessionCode) {
        let name = data.name;
        if (!(name in initiativeMap))
            initiativeMap[name] = {}; // create a blank entry in initiativeMap
        for (var k in data) {
            if (k !== 'name') {
                initiativeMap[name][k] = data[k]; // update property in initiativeMap entry
                console.log(name+'['+k+']'+'='+initiativeMap[name][k]);
            }
        }
        refreshInitiatives(sortInitiatives(initiativeMap));
    } else {
        // received message for wrong session
        console.log('received an event for a different session code.');
    }
}

var resetInitiativesTable = function() {
    alert("The Dungeon Master has called for new initiative rolls.");
    console.log('resetting table');
    initiativeMap = {}; // reset the initiative mappings
    refreshInitiatives([]);
}

var validateInputs = function() {
}

var validateConnection = function() {
}
