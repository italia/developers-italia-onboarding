module.exports = {
  environment: process.env.ONBOARDING_ENVIRONMENT,
  port: process.env.ONBOARDING_PORT || 3000,
  appBaseUrl: process.env.ONBOARDING_APP_BASE_URL || 'http://localhost:3000',
  esUrl: process.env.ONBOARDING_ES_URL || 'http://localhost:9200/indicepa_pec/_search',
  smtp: {
    hostname: process.env.ONBOARDING_SMTP_HOSTNAME,
    port: process.env.ONBOARDING_SMTP_PORT || 587,
    secure: (process.env.ONBOARDING_SMTP_SECURE == 'true')
      ? true
      : false,
    username: process.env.ONBOARDING_SMTP_USERNAME,
    password: process.env.ONBOARDING_SMTP_PASSWORD
  },
  email: {
    from: process.env.ONBOARDING_EMAIL_FROM || '"Team Digitale" <noreply@teamdigitale.com>',
    cc: process.env.ONBOARDING_EMAIL_CC || '',
    bcc: process.env.ONBOARDING_EMAIL_BCC || '',
    overrideRecipientAddr: process.env.ONBOARDING_EMAIL_OVERRIDE_RECIPIENT_ADDR,
    subject: process.env.ONBOARDING_EMAIL_SUBJECT || 'Onboarding Developer Italia'
  }
};
