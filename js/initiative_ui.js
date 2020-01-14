
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
            for (var j=0; j<4; j++)
                row.insertCell(0);
        }
        row.cells[0].innerHTML = v.name;
        row.cells[1].innerHTML = v.initiative || '...';
        row.cells[2].innerHTML = v.critical || false;
        row.cells[3].innerHTML = v.surprised || false;
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
            initiative: map[k].initiative,
            critical: map[k].critical,
            surprised: map[k].surprised
        }
    }
    table.sort(
        function(a, b) {
            let ia = Number(a.initiative || -20);
            let ib = Number(b.initiative || -20);
            if (a.critical === 'true' || false)
                ia += 20;
            if (b.critical === 'true' || false)
                ib += 20;
            if (ia.surprised === 'true' || false)
                ia -= 20;
            if (ib.surprised === 'true' || false)
                ib -= 20;
            return ib - ia;
        }
    );
    console.log(JSON.stringify(table));
    return table;
}

updateInitiative = function(data) {
    if (data.session == sessionCode) {
        let name = data.name;
        if (!(name in initiativeMap))
            initiativeMap[name] = {}; // create a blank entry in initiativeMap
        for (var k in data.values) {
            initiativeMap[name][k] = data.values[k]; // update property in initiativeMap entry
        }
        refreshInitiatives(sortInitiatives(initiativeMap));
    } else {
        // received message for wrong session
    }
}
