const {VALIDATION_OK, VALIDATION_NOT_WHITELIST, VALIDATION_INVALID_URL} = require('./validator-result.js');


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
  case VALIDATION_INVALID_URL:
    message = 'Indirizzo URL invalido: ricompila il form';
    break;
  case VALIDATION_NOT_WHITELIST:
    message = 'Indirizzo URL non presente nella whitelist: ricompila il form';
    break;
  default:
    throw new Error('Url non valido');
  }

  return message;

}

module.exports = getErrorMessage;
