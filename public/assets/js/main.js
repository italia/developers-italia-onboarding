const ipaInput = document.querySelector('input#ipa');
const refInput = document.querySelector('input#nomeReferente');
const telInput = document.querySelector('input#telReferente');
const urlInput = document.querySelector('input#url');

if (ipaInput) {
  //validation
  ipaInput.addEventListener('input', function () {
    ipaInput.setCustomValidity('');
    ipaInput.checkValidity();
  });

  refInput.addEventListener('input', function () {
    refInput.setCustomValidity('');
    refInput.checkValidity();
  });

  telInput.addEventListener('input', function () {
    telInput.setCustomValidity('');
    telInput.checkValidity();
  });

  urlInput.addEventListener('input', function () {
    urlInput.setCustomValidity('');
    urlInput.checkValidity();
  });

  ipaInput.addEventListener('invalid', function () {
    if (ipaInput.value === '')
      ipaInput.setCustomValidity('Selezionare un\'amministrazione dal campo Ricerca Amministrazione!');
  });

  refInput.addEventListener('invalid', function () {
    if (refInput.value === '')
      refInput.setCustomValidity('Specificare un referente per l\'amministrazione!');
  });

  telInput.addEventListener('invalid', function () {
    if (telInput.value === '')
      telInput.setCustomValidity('Specificare un numero telefonico per il referente!');
  });

  urlInput.addEventListener('invalid', function () {
    if (urlInput.value === '')
      urlInput.setCustomValidity('Specificare un URL di riferimento!');
  });
}

/**
 * Creating dynamic list for autocomplete
 * @param result data from remote call
 * @returns {string}
 */
function getResultElement(result) {
  return '<li class="result-item" data-ipa="' + result.ipa + '" data-pec="' + result.pec + '" ' +
    'data-description="' + result.description + '" data-office="' + result.office + '">'
    + '<a href="#">' +
    '    <span class="autocomplete-list-text">\n' +
    '      <span>' + result.value + '</span>\n' +
    '    </span>' +
    '  </a>'
    + '</li>';
}

/**
 * Data modelling
 * @param result data
 * @param item
 * @returns {{link: string, description: *, ipa: (Document.ipa|*), value: string, pec: string}}
 */
function modelData(result) {
  return {
    ipa: result.ipa,
    description: result.description,
    pec: result.pec,
    link: '#',
    value: result.description
      + '<br />'
      + '<b>ipa: </b>' + result.ipa
      + ', <b>pec: </b>'
      + result.pec,
  };
}

/**
 * populating form with remote searched data
 * @param data
 */
function populateAutocompleteBox(data) {
  let resultsElem = $('#risultatoRicerca');
  if (data.hits.hits.length > 0) {

    resultsElem.empty();
    //modelling data
    data.hits.hits
      .map(function (result) {
        let _source = result._source;
        return modelData(_source);
      })
      .forEach(function (result) {
        resultsElem.append(getResultElement(result));
      });

    //showing list
    resultsElem.addClass('autocomplete-list-show');

    $('.result-item').click(function (e) {
      $('#ipa').val(this.dataset.ipa);
      $('label[for=\'ipa\']').addClass('active');
      $('#nomeAmministrazione').val(this.dataset.description);
      $('label[for=\'nomeAmministrazione\']').addClass('active');
      $('#pec').val(this.dataset.pec);
      $('label[for=\'pec\']').addClass('active');
      $('#risultatoRicerca').empty();
      $('#ricercaAmministrazione').val(this.dataset.description);
      resultsElem.removeClass('autocomplete-list-show');
      ipaInput.setCustomValidity('');
      ipaInput.checkValidity();

      //prevent default link action
      e.preventDefault();
    });
  }
}


/**
 * setting up key listener for autocomplete input box
 */
$('#ricercaAmministrazione').on('keyup', function (e) {
  $('#risultatoRicerca').empty();

  if (this.value.length < 2) {
    $('#risultatoRicerca').removeClass('autocomplete-list-show');
    return;
  }
  if (e.which == 13) {
    e.preventDefault();
  }
  let query = $('#ricercaAmministrazione').val();

  $.getJSON({
    /* global ES_URL */
    url: ES_URL,
    contentType: 'application/json; charset=UTF-8',
    type: 'POST',
    dataType: 'json',
    data: JSON.stringify({
      from: 0, size: 50,
      query: {
        bool: {
          should: [
            {
              multi_match: {
                query: query,
                operator: 'and',
                fields: [
                  'ipa',
                  'pec',
                  'description',
                  'type',
                  'cf'
                ]
              }
            }
          ]
        }
      }
    }),
    success: populateAutocompleteBox
  });
});

//hack to make readonly fields required and validate them
$('.readonly').on('keydown paste', function (e) {
  e.preventDefault();
});

