'use strict';

module.exports = {
  'clean': {
    'cmd': ['cat .gitignore | xargs rm -rf']
  },
  'composer:setup': {
    'out': ['tools/composer'],
    'pre': ['tools'],
    'cmd': ['curl -sS https://getcomposer.org/installer | php -- --filename=composer']
  },
  'composer:install': {
    'out': ['vendor'],
    'pre': ['composer:setup'],
    'cmd': ['php composer install --optimize-autoloader']
  },
  'npm:install': {
    'out': ['node_modules'],
    'cmd': ['npm install']
  },
  'lint:php': {
    'pre': ['composer:install'],
    'cmd': ['vendor/bin/phpcs --standard=PSR2 src/php']
  },
  'lint:js': {
    'pre': ['npm:install'],
    'cmd': ['node_modules/.bin/eslint --env browser src/js']
  },
  'lint': {
    'pre': ['lint:php', 'lint:js']
  },
  'test:php': {
    'spawn': true,
    'pre': ['composer:install'],
    'cmd': ['vendor/bin/phpunit --configuration phpunit.xml']
  },
  'test:js': {
    'spawn': true,
    'pre': ['npm:install'],
    'cmd': ['node_modules/.bin/mocha -c test/js/ --recursive']
  },
  'test': {
    'pre': ['test:php', 'test:js']
  },
  'js': {
    'pre': ['npm:install'],
    'cmd': [
      'mkdir -p static',
      'node_modules/.bin/browserify js/main.js | node_modules/.bin/uglifyjs --compress --mangle > static/script.js'
    ]
  },
  'css': {
    'pre': ['npm:install'],
    'cmd': [
      'node_modules/.bin/lessc less/main.less --clean-css="--s0 --advanced" --autoprefix="last 2 versions"'
    ]
  },
  'build': {
    'pre': ['css', 'js']
  },
  'watch': {
    'spawn': true,
    'pre': ['npm:install'],
    'cmd': ['node_modules/.bin/wr --exec "mike css" less']
  }
};
