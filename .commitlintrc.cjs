module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    // Definimos los prefijos permitidos (incluyendo los tuyos de DDD)
    'type-enum': [
      2,
      'always',
      [
        'feat',
        'fix',
        'infra',
        'app',
        'domain',
        'docs',
        'style',
        'refactor',
        'perf',
        'test',
        'build',
        'ci',
        'chore',
        'revert',
      ],
    ],

    'body-leading-blank': [2, 'always'],

    'subject-full-stop': [2, 'never', '.'],

    'header-max-length': [2, 'always', 72],
  },
};
