module.exports = function(grunt) {
    require('load-grunt-tasks')(grunt);

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        watch: {
            js: {
                files: '**/*.js',
                tasks: [
                    'exec:clear',
                    'exec:lint',
                    'express:dev'
                ],
                options: {
                    spawn: false
                }
            },
            test: {
                files: './tests/*.js',
                tasks: [
                    'exec:clear',
                    'exec:lint',
                    'exec:test'
                ],
                options: {
                    spawn: false
                }
            }
        },
        concurrent: {
            serve: {
                tasks: ['watch:js', 'express:dev'],
                options: {
                    logConcurrentOutput: true
                }
            }
        },
        express: {
            dev: {
                options: {
                    script: 'server/index.js'
                }
            }
        },
        exec: {
            clear: 'clear',
            lint: 'npm run lint',
            test: 'npm test',
            killall: 'killall node'
        }
    });

    grunt.registerTask('default', [
        'exec:clear',
        'exec:lint',
        'concurrent:serve'
    ]);

    grunt.registerTask('test', [
        'exec:clear',
        'exec:test',
        'watch:test'
    ]);
};