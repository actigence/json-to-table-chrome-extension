/**
 * This is the main function, that reads the content of the page and renders that as a Table.
 */
function renderTable() {
    if (!isJsonOnlyPage()) {
        console.log("Page content does not seem to be simple JSON. Exiting.");
        return;
    }

    const originalJsonText = document.getElementsByTagName("pre")[0].innerText;
    const originalJsonObject = JSON.parse(originalJsonText);

    let dataArray = [];
    let dataColumns = [{
        "className": 'details-control',
        "orderable": false,
        "data": null,
        "defaultContent": ''
    }];
    let keys = [];

    let contentArray = getContentArray(originalJsonObject);
    if (contentArray === undefined) {
        alert(errorMessage());
        return;
    }

    //Find all keys in array objects.
    contentArray.forEach((item, index, array) => {
        for (let [keyItem, valueItem] of Object.entries(item)) {
            if (valueItem !== undefined && valueItem !== null && isPrimitive(valueItem)) {
                if (!keys.includes(keyItem)) {
                    keys.push(keyItem);
                }
            }
        }
        console.log('total keys: ' + keys);
    });

    if (keys.length === 0) {
        return;
    }

    //Create data array to be used by Datatables component
    contentArray.forEach((item, index, array) => {
        let itemData = {};
        keys.forEach((key, i, keyArray) => {
            if (item.hasOwnProperty(key)) {
                itemData[key] = item[key];
            } else {
                itemData[key] = "";
            }
        });
        itemData['_full_'] = JSON.stringify(item, undefined, 4);
        dataArray.push(itemData);
    });

    //Create column definition for datatables.
    keys.forEach((key, i, keyArray) => {
        dataColumns.push(
            {
                data: key,
                title: camel2title(key)
            }
        );
    });

    //Over ride content of entire page to show table.
    document.all[0].innerHTML = tableHTML();

    //Set Original JSON in collapsible panel
    document.getElementById("original-json-div").innerText
        = JSON.stringify(originalJsonObject, undefined, 4);

    //Apply Datatables.net transformation
    $(document).ready(function () {
        const table = $('#table_id')
            .DataTable({
                responsive: true,
                data: dataArray,
                columns: dataColumns,
                order: [[1, 'asc']]
            });

        //Expandable panel below each row to show original JSON of the row
        $('#table_id tbody').on('click', 'td.details-control', function () {
            const tr = $(this).closest('tr');
            const row = table.row(tr);

            if (row.child.isShown()) {
                // This row is already open - close it
                row.child.hide();
                tr.removeClass('shown');
            } else {
                // Open this row
                row.child(childPanelHTML(row.data())).show();
                tr.addClass('shown');
            }
        });
    });
}

/**
 * Default HTML to display table.
 * This table will be enhanced by DataTables.net script to render final Table.
 * @returns {string}
 */
function tableHTML() {
    return "<!DOCTYPE html>" +
        "<html lang=\"en\">" +
        "<head>" +
        "    <meta charset=\"UTF-8\">" +
        "    <title>JSON-As-Table</title>" +
        "<link href=\"https://fonts.googleapis.com/css2?family=Lateef&family=Roboto&display=swap\" rel=\"stylesheet\">" +
        "</head>" +
        "<body>" +
        "<div id='content-div' class='acs-content-div'>" +
        "<div class='acs-logo-bg'><div class='acs-logo'></div></div>" +
        "<div id='table-div' class='acs-table-div'>" +
        "<table id=\"table_id\" class=\"display\">" +
        "</table>" +
        "</div>" +
        "<br/>" +
        "<button type=\"button\" class=\"collapsible\">Click to see original JSON text</button>\n" +
        "<div class=\"content\">\n" +
        "  <pre style=\"padding-left: 50px;\" id=\"original-json-div\">" +
        "  </pre>\n" +
        "</div>" +
        "<br/>" +
        "<br/>" +
        "<hr/>" +
        "<div class=\"acs-credits\">\n" +
        "    <strong>Developed by:</strong>&nbsp;<a href=\"http://www.actigence.com\">Actigence Solutions</a><br/>" +
        "    <strong>Source\n" +
        "        Code:</strong>&nbsp;<a href=\"https://github.com/Actigence/json-to-table-chrome-extension\">Github</a><br/>" +
        "    <strong>Report Issues:</strong>&nbsp;<a href=\"https://github.com/Actigence/json-to-table-chrome-extension/issues\">Github Issues</a><br/>\n" +
        "</div>" +
        "<hr/>" +
        "</div>" +
        "</body>" +
        "</html>"
}

/**
 * Returns HTML to generate expandable panel of table rows.
 * @param d
 * @returns {string}
 */
function childPanelHTML(d) {
    return "<pre style='padding-left: 50px;'>" +
        d._full_ +
        "</pre>";
}

/**
 * Return whole base object, if it's a direct array, else
 * Return first field in base object that is an array, else
 * Return the base object in an array
 */
function getContentArray(baseObject) {
    if (baseObject === undefined || baseObject === null) {
        return undefined;
    } else if (Array.isArray(baseObject)) {
        return baseObject;
    } else {
        for (let [prop, val] of Object.entries(baseObject)) {
            if (Array.isArray(val)) {
                return val;
            }
        }
    }
    let dummyArray = [];
    dummyArray.push(baseObject);
    return dummyArray;
}

/**
 * Convert JSON fields to displayable titles of table column
 * @param camelCase
 * @returns {string}
 */
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

/**
 * Check if an object is primitive type
 * @param test
 * @returns {boolean}
 */
function isPrimitive(test) {
    return (test !== Object(test));
}

/**
 * Generic error message
 * @returns {string}
 */
function errorMessage() {
    return "Oops! We are unable to identify the page content. If you feel this is an error. " +
        "Please log an issue by visiting. https://github.com/Actigence/json-to-table-chrome-extension/issues";
}

/**
 * Page content should only have JSON text and nothing else.
 * @returns {boolean}
 */
function isJsonOnlyPage() {
    return document.body !== undefined
        && document.body.getElementsByTagName("*").length === 1
        && document.getElementsByTagName("pre").length === 1;
}

/**
 * Calling start method to convert page content to Table view
 */
try {
    renderTable();
} catch (e) {
    console.log(errorMessage());
}

