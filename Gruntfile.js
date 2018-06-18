module.exports = function(grunt) {
    require('load-grunt-tasks')(grunt);

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        express: {
            dev: {
                options: {
                    script: './server/index.js',
                    background: false
                }
            }
        },
        eslint: {
            options: {
                configFile: './.eslintrc.json'
            },
            src: [
                './*.js',
                './server/*.js'
            ]
        },
        watch: {
            js: {
                files: './**/*.js',
                tasks: [
                    'eslint',
                    'express'
                ],
                options: {
                    spawn: false
                }
            }
        },
        concurrent: {
            target1: ['watch', 'express'],
            options: {
                logConcurrentOutput: true
            }
        }
    });

    grunt.registerTask('default', [
        'eslint',
        'concurrent'
    ]);
};