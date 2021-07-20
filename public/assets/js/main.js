const ipaInput = document.querySelector('input#ipa');
const telInput = document.querySelector('input#telReferente');
const urlInput = document.querySelector('input#url');
const esUrl = document.querySelector('input#esUrl')
  ? document.querySelector('input#esUrl').value
  : null;

if (ipaInput) {
  document.querySelector('form#pa-form').addEventListener('submit', function (e) {
    if (ipaInput.value === '') {
      document
        .querySelector('#ricercaAmministrazione')
        // eslint-disable-next-line quotes
        .setCustomValidity("Selezionare un'Amministrazione");

      e.preventDefault();
    }
  });

  telInput.addEventListener('input', function () {
    const stripped = telInput.value.replace(/\s/g,'');

    const regex = /^\+{0,1}\d{8,15}$/;
    if (!regex.test(stripped)) {
      telInput.setCustomValidity('Inserire un numero di telefono valido');
    } else {
      telInput.setCustomValidity('');
    }
  });

  urlInput.addEventListener('input', function () {
    const trimmed = urlInput.value.trim();

    try {
      const u = new URL(trimmed);
      if (u.protocol != 'https:') {
        urlInput.setCustomValidity('Specificare un URL in HTTPS');
        return;
      }

      if (u.host == 'github.com' || u.host == 'gitlab.com' || u.host == 'bitbucket.org') {
        const orgsRegexp = new RegExp('^/[^/]+?/{0,1}$');

        if (orgsRegexp.test(u.pathname)) {
          urlInput.setCustomValidity('');
        } else {
          urlInput.setCustomValidity(
            'Deve essere un URL di una organizzazione (es. https://github.com/comune-di-reuso)'
          );
        }
        return;
      }
    } catch(_) {
      urlInput.setCustomValidity('Specificare un URL valido');
      return;
    }

    urlInput.setCustomValidity('');
  });
}

function debounce(func, wait) {
  var timeout;
  return function() {
    var context = this, args = arguments;
    clearTimeout(timeout);
    timeout = setTimeout(
      function() {
        timeout = null;
        func.apply(context, args);
      }, wait
    );
  };
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
    '    <svg class="icon">' +
    '      <use xlink:href="/bootstrap-italia/dist/svg/sprite.svg#it-pa"></use>' +
    '    </svg>' +
    '    <span class="autocomplete-list-text">' +
    '      <span>' + result.value + '</span>' +
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
    value: '<span class="lead">' + result.description + '</span>'
      + '<br />'
      + 'Codice iPA: ' + result.ipa
      + '<br />'
      + result.pec,
  };
}

/**
 * populating form with remote searched data
 * @param data
 */
function populateAutocompleteBox(data) {
  $('#search-spinner').addClass('d-none');

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
      $('input#ipa').val(this.dataset.ipa);
      $('input#nomeAmministrazione').val(this.dataset.description);
      $('input#pec').val(this.dataset.pec);

      $('#ricercaAmministrazione').val(this.dataset.description + ' (' + this.dataset.pec + ')');

      resultsElem.removeClass('autocomplete-list-show');
      e.preventDefault();
    });
  }
}


/**
 * setting up key listener for autocomplete input box
 */
$('#ricercaAmministrazione').on('keyup', debounce(function (e) {
  if (this.value.length < 2) {
    $('#risultatoRicerca').removeClass('autocomplete-list-show');

    $('input#ipa').val('');
    $('input#nomeAmministrazione').val('');
    $('input#pec').val('');

    return;
  }

  $('#search-spinner').removeClass('d-none');

  if (e.which == 13) {
    e.preventDefault();
  }
  let query = $('#ricercaAmministrazione').val();

  $.getJSON({
    url: esUrl,
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
}, 200));
