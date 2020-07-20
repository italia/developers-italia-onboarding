const {VALIDATION_OK, VALIDATION_ALREADY_PRESENT,
  VALIDATION_INVALID_URL, VALIDATION_PHONE} = require('./validator-result.js');

/**
 * Ottiene il messaggio di errore
 *
 * @param validatorResult Il risultato della validazione
 *
 * @return Il messaggio di errore
 */
function getErrorMessage(validatorResult) {
  if (validatorResult == VALIDATION_OK) {
    throw new Error('Nessun messaggio di errore definito per validator result ok');
  }

  let message = '';
  switch (validatorResult) {
  case VALIDATION_PHONE:
    message = 'Numero telefonico non valido: ricompila il form';
    break;
  case VALIDATION_INVALID_URL:
    message = 'Indirizzo URL invalido: ricompila il form';
    break;
  case VALIDATION_ALREADY_PRESENT:
    message = 'Il codice IPA e l\'URL sono già presenti';
    break;
  default:
    throw new Error('Url non valido');
  }

  return message;

}

module.exports = getErrorMessage;
