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
    var q1 = new Query();
    q1.select(['companyid', 'uniqueformid', 'languageid', 'deleted', 'viewtype', 'responses']);
    q1.where('deleted').equals('no');
    q1.where('viewtype').in(['stars', 'numbers']);
    q1.limit(25);
    var query1 = q1.query('grid5x5_ratings') + '&useBeastMode=true';
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
        var q2 = new Query();
        q2.select(['companyname', 'companyid', 'uniqueformid', 'languageid', 'deleted', 'viewtype', 'subject', 'question', 'rating', 'correlation', 'npsrating']);
        q2.where('deleted').equals('no');
        q2.where('viewtype').in(['stars', 'numbers']);
        q2.where('rating').greaterThanOrEqual(1);
        q2.where('npsrating').lessThan(11);
        q2.aggregate('companyname', 'max');
        q2.aggregate('companyid', 'max');
        q2.aggregate('uniqueformid', 'max');
        q2.aggregate('languageid', 'max');
        q2.aggregate('question', 'max');
        q2.aggregate('rating', 'avg');
        q2.aggregate('npsrating', 'avg');
        q2.groupBy('subject');
        q2.limit(25);
        var query2 = q2.query('grid5x5_ratings') + '&useBeastMode=true';
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

