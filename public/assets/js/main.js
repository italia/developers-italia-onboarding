function setUpSearchbar(idx, db) {
    $('#ricercaAmministrazione').keyup(function () {
        $('#risultatoRicerca').empty();

        if (this.value.length < 3) return;

        var results = idx.search(this.value).slice(0, 50);
        if (results.length > 0) {
            var resultsElem = $('#risultatoRicerca');

            resultsElem.empty();
            results.map(function(result){
                var obj = db[result.ref];
                obj['code'] = result.ref;
                return obj;
            }).forEach(function (result) {
                resultsElem.append(getResultElement(result));
            });

            $('.result-item').click(function() {
                $('#ipa').val(this.dataset.code);
                $('#nomeAmministrazione').val(this.dataset.description);
                $('#pec').val(this.dataset.pec);
                $('#risultatoRicerca').empty();
            });
        }

    });
}

function getResultElement(result) {
    return '<li class="result-item" data-code="'+result.code+'" data-pec="'+result.pec+'" data-description="'+result.description+'">' 
         +    result.description 
         + '</li>';
}

$.get("assets/data/authorities.index.json", function (rowIndex) {
    $.get("assets/data/authorities.db.json", function (db) {
        var idx = lunr.Index.load(rowIndex);
        setUpSearchbar(idx, db);
    });
});
