function tableContent() {
    return "<!DOCTYPE html>" +
        "<html lang=\"en\">" +
        "<head>" +
        "    <meta charset=\"UTF-8\">" +
        "    <title>Title</title>" +
        "</head>" +
        "<body>" +
        "<table id=\"table_id\" class=\"display\">" +
        "</table>" +
        "</body>" +
        "</html>"
}

function convertToTable() {
    //console.log(document.all[0]);
    //console.log("-------------------------------");
    //console.log("-------------------------------");
    //console.log("-------------------------------");
    //console.log(document.getElementsByTagName("pre")[0].innerText);
    let jsonObject = JSON.parse(document.getElementsByTagName("pre")[0].innerText);


    let dataArray = [];
    let dataColumns = [];
    let keys = [];

    for (let [key, value] of Object.entries(jsonObject)) {
        if (Array.isArray(value)) {
            //console.log(`${key}: ${value}`);

            //Find all keys in this Array
            value.forEach((item, index, array) => {
                //console.log(JSON.stringify(item));
                for (let [keyItem, valueItem] of Object.entries(item)) {
                    if (!keys.includes(keyItem)) {
                        keys.push(keyItem);
                    }
                }
                //console.log('total keys: ' + keys);
            });

            value.forEach((item, index, array) => {
                let itemData = [];
                keys.forEach((key, i, keyArray) => {
                    itemData.push(item[key]);
                });
                dataArray.push(itemData);
            });
            //console.log("data array: " + dataArray);

            keys.forEach((key, i, keyArray) => {
                dataColumns.push({title: camel2title(key)});
            });
            //console.log("data columns : " + dataColumns);
        }
    }

    document.all[0].innerHTML = tableContent();
    $(document).ready(function () {
        $('#table_id').DataTable({
            data   : dataArray,
            columns: dataColumns
        });
    });
}

function camel2title(camelCase) {
    // no side-effects
    return camelCase
        // inject space before the upper case letters
        .replace(/([A-Z])/g, function (match) {
            return " " + match;
        })
        // replace first char with upper case
        .replace(/^./, function (match) {
            return match.toUpperCase();
        });
}

convertToTable();
