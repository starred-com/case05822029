// Some DataSets are massive and will bring any web browser to its knees if you
// try to load the entire thing. To keep your app performing optimally, take
// advantage of filtering, aggregations, and group by's to bring down just the
// data your app needs. Do not include all columns in your data mapping file,
// just the ones you need.
//
// For additional documentation on how you can query your data, please refer to
// https://developer.domo.com/docs/dev-studio/dev-studio-data

function log(text) {
    console.log(text);

    if (typeof text == "object") {
        text = JSON.stringify(text)
    }
    var pre = document.createElement('pre');
    pre.innerText = text;
    document.getElementById('output').appendChild(pre);
}

document.body.onload = () => {
    log('onload ready');
    var query1 = 'data/v1/grid5x5_ratings?limit=25&useBeastMode=true&fields=companyid,uniqueformid,deleted,viewtype,responses&filter=deleted%20=%20no,viewtype%20in%20[%22stars%22,%22numbers%22]';
    log('Fire query 1');
    log(query1);
    log('Expected result is a single row:')
    domo.get(query1)
        .then(function (data) {
            data.forEach(function (row) {
                log(row)

            });
        }).catch(function (error) {
        log(error)
    }).finally(function () {
        // Nest the queries to not mix output
        var query2 = 'data/v1/grid5x5_ratings?limit=25&useBeastMode=true&fields=companyname,companyid,uniqueformid,languageid,deleted,viewtype,subject,question,rating,correlation,npsrating&groupby=subject&filter=deleted%20=%20no,viewtype%20in%20[%22stars%22,%22numbers%22],rating%20%3E=%201,npsrating%20%3C%2011&max=companyname,companyid,uniqueformid,languageid,question&avg=rating,npsrating';
        log('Fire query 2');
        log(query2);
        log('Expected result is a list of rows, which have a value for correlation')
        domo.get(query2)
            .then(function (data) {
                data.forEach(function (row) {
                    log(row)
                });
            }).catch(function (error) {
            log(error)
        });
    });


}

