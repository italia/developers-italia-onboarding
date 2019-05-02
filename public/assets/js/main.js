const ipaInput = document.querySelector('input#ipa');
const refInput = document.querySelector('input#nomeReferente');
const urlInput = document.querySelector('input#url');


ipaInput.addEventListener('input', () => {
  ipaInput.setCustomValidity('');
  ipaInput.checkValidity();
});

refInput.addEventListener('input', () => {
  refInput.setCustomValidity('');
  refInput.checkValidity();
});

urlInput.addEventListener('input', () => {
  urlInput.setCustomValidity('');
  urlInput.checkValidity();
});

ipaInput.addEventListener('invalid', () => {
  if (ipaInput.value === '')
    ipaInput.setCustomValidity('Selezionare un\'amministrazione dal campo Ricerca Amministrazione!');
});

refInput.addEventListener('invalid', () => {
  if (refInput.value === '')
    refInput.setCustomValidity('Specificare un referente per l\'amministrazione!');
});

urlInput.addEventListener('invalid', () => {
  if (urlInput.value === '')
    urlInput.setCustomValidity('Specificare un URL di riferimento!');
});

function setUpSearchbar(idx, db) {
  $('#ricercaAmministrazione').keyup(function () {
    $('#risultatoRicerca').empty();

    if (this.value.length < 3) return;
    let query = 'description:' + this.value + ' code:' + this.value;
    let results = idx.search(query).slice(0, 50);
    if (results.length > 0) {
      var resultsElem = $('#risultatoRicerca');

      resultsElem.empty();
      results.map(function (result) {
        var obj = db[result.ref];
        obj['code'] = result.ref;
        return obj;
      }).forEach(function (result) {
        resultsElem.append(getResultElement(result));
      });

      resultsElem.addClass('autocomplete-list-show');

      $('.result-item').click(function () {
        $('#ipa').val(this.dataset.code);
        $("label[for='ipa']").addClass('active');
        $('#nomeAmministrazione').val(this.dataset.description);
        $("label[for='nomeAmministrazione']").addClass('active');
        $('#pec').val(this.dataset.pec);
        $("label[for='pec']").addClass('active');
        $('#risultatoRicerca').empty();
        resultsElem.removeClass('autocomplete-list-show');
        ipaInput.setCustomValidity('');
        ipaInput.checkValidity();
      });
    }
  });
}

function getResultElementOld(result) {
  return '<li class="result-item" data-code="' + result.code + '" data-pec="' + result.pec + '" data-description="' + result.description + '">'
    + result.description
    + '</li>';
}
function getResultElement(result) {
  return '<li class="result-item" data-code="' + result.code + '" data-pec="' + result.pec + '" data-description="' + result.description + '">'
    + '<a href="#">' +
    '    <span class="autocomplete-list-text">\n' +
    '      <span>'+result.description+'</span>\n' +
    '    </span>' +
    '  </a>'
    + '</li>';
}

$.get("assets/data/authorities.index.json", function (rowIndex) {
  $.get("assets/data/authorities.db.json", function (db) {
    var idx = lunr.Index.load(rowIndex);
    setUpSearchbar(idx, db);
  });
});

//hack to make readonly fields required and validate them
$(".readonly").on('keydown paste', function (e) {
  e.preventDefault();
});

