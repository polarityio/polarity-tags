module.exports = {
  name: 'Polarity Tags',
  acronym: 'POL',
  entityTypes: ['*'],
  request: {
    // Provide the path to your certFile. Leave an empty string to ignore this option.
    // Relative paths are relative to the STAXX integration's root directory
    cert: '',
    // Provide the path to your private key. Leave an empty string to ignore this option.
    // Relative paths are relative to the STAXX integration's root directory
    key: '',
    // Provide the key passphrase if required.  Leave an empty string to ignore this option.
    // Relative paths are relative to the STAXX integration's root directory
    passphrase: '',
    // Provide the Certificate Authority. Leave an empty string to ignore this option.
    // Relative paths are relative to the STAXX integration's root directory
    ca: '',
    // An HTTP proxy to be used. Supports proxy Auth with Basic Auth, identical to support for
    // the url parameter (by embedding the auth info in the uri)
    proxy: '',
    /**
     * If set to false, the integeration will ignore SSL errors.  This will allow the integration to connect
     * to STAXX servers without valid SSL certificates.  Please note that we do NOT recommending setting this
     * to false in a production environment.
     */
    rejectUnauthorized: false
  },
  block: {
    component: {
      file: './components/polarity-block.js'
    },
    template: {
      file: './templates/polarity-block.hbs'
    }
  },
  options: [
    {
      key: 'polarityHost',
      name: 'Polarity Host',
      description:
        'The Polarity server host including the schema (e.g., https://mypolarity.server)',
      default: '',
      type: 'text',
      userCanEdit: true,
      adminOnly: false
    },
    {
      key: 'polarityUsername',
      name: 'Polarity Username',
      description: 'The Polarity username you want to authenticate as',
      default: '',
      type: 'text',
      userCanEdit: true,
      adminOnly: false
    },
    {
      key: 'polarityPassword',
      name: 'Polarity Password',
      description: 'The password for the given Polarity username',
      default: '',
      type: 'password',
      userCanEdit: true,
      adminOnly: false
    }
  ]
};
