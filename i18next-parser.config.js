export default {
  contextSeparator: '_',
  createOldCatalogs: false,
  defaultNamespace: 'translation',
  defaultValue: '',
  indentation: 2,
  keepRemoved: true,
  keySeparator: '.',
  lexers: {
    ts: [{ lexer: 'JavascriptLexer', functions: ['t', 'tFunc'] }],
    tsx: [{ lexer: 'JsxLexer', functions: ['t', 'tFunc'] }],
    js: [{ lexer: 'JavascriptLexer', functions: ['t', 'tFunc'] }],
    jsx: [{ lexer: 'JsxLexer', functions: ['t', 'tFunc'] }],

    default: [{ lexer: 'JavascriptLexer', functions: ['t', 'tFunc'] }]
  },
  lineEnding: 'auto',
  locales: ['en', 'fr'],
  namespaceSeparator: ':',
  output: 'src/i18n/locales/$LOCALE.json',
  pluralSeparator: '_',
  input: ['src/**/*.{ts,tsx}'],
  sort: true,
  useKeysAsDefaultValue: true,
  verbose: true,
  failOnWarnings: false,
  failOnUpdate: false, // Set to true in CI to fail if keys are missing
};
