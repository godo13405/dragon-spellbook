module.exports = function(grunt) {
    require('load-grunt-tasks')(grunt);

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        watch: {
            js: {
                files: './**/*.js',
                tasks: [
                    'exec:clear',
                    'exec:lint',
                    'exec:express'
                ],
                options: {
                    spawn: false
                }
            }
        },
        concurrent: {
            serve: {
                target1: ['watch', 'exec:express'],
                options: {
                    logConcurrentOutput: true
                }
            }
        },
        exec: {
            clear: 'clear',
            express: 'npm start',
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
        'exec:test'
    ]);
};