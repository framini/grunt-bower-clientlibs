'use strict';

module.exports = function(grunt) {

  var bower = require('bower'),
    path = require('path'),
    async = require('async'),
    colors = require('colors'),
    rimraf = require('rimraf').sync,
    BowerAssets = require('./lib/bower_assets'),
    AssetCopier = require('./lib/asset_copier'),
    LayoutsManager = require('./lib/layouts_manager'),
    Clientlibs = require('./lib/clientlibs_helper');

  function log(message) {
    log.logger.writeln(message);
  }

  function fail(error) {
    grunt.fail.fatal(error);
  }

  function clean(dir, callback) {
    rimraf(dir);
    callback();
  }

  function install(options, callback) {
    bower.commands.install([], options.bowerOptions)
      .on('log', function(result) {
        log(['bower', result.id.cyan, result.message].join(' '));
      })
      .on('error', fail)
      .on('end', callback);
  }

  function copy(options, callback) {
    var bowerAssets = new BowerAssets(bower, options.cwd);
    bowerAssets.on('end', function(assets) {
      var copier = new AssetCopier(assets, options, function(source, destination, isFile) {
        log('grunt-bower ' + 'copying '.cyan + ((isFile ? '' : ' dir ') + source + ' -> ' + destination).grey);
      });


      copier.on('before-copy', function(notification) {
        var fileName, clientLibLocation, clientLibName, clientLibExtension;
        fileName = path.basename(notification.source);
        clientLibLocation = path.dirname(path.dirname(notification.destination));
        clientLibName = fileName.substr(0, fileName.lastIndexOf('.')) || fileName;
        clientLibExtension = fileName.split('.').pop();

        Clientlibs.createTxtFile(path.basename(notification.source), clientLibLocation, clientLibExtension);
      });

      copier.on('oncefinished', function(notification){
        Clientlibs.createContentFile({
          clientlib: notification.clientlib, 
          destination: notification.destination, 
          dependencies: notification.dependencies, 
          options: options
        })
      });


      copier.once('copied', callback);
      copier.copy();
    }).get();
  }

  grunt.registerMultiTask('bower', 'Install Bower packages.', function() {
    var tasks = [],
      done = this.async(),
      options = this.options({
        cleanTargetDir: true,
        cleanBowerDir: true,
        targetDir: './lib',
        install: true,
        verbose: false,
        copy: true,
        projectName: '',
        clientlibSuffix: 'clientlib',
        bowerOptions: {}
      }),
      add = function(successMessage, fn) {
        tasks.push(function(callback) {
          fn(function() {
            grunt.log.ok(successMessage);
            callback();
          });
        });
      },
      bowerDir = path.resolve(bower.config.directory),
      targetDir = path.resolve(options.targetDir);

    log.logger = options.verbose ? grunt.log : grunt.verbose;
    options.layout = LayoutsManager.getLayout('byComponent', fail);
    options.cwd = grunt.option('base') || process.cwd();

    if (options.cleanup !== undefined) {
      options.cleanTargetDir = options.cleanBowerDir = options.cleanup;
    }

    if (options.cleanTargetDir) {
      add('Cleaned target dir ' + targetDir.grey, function(callback) {
        clean(targetDir, callback);
      });
    }

    if (options.install) {
      add('Installed bower packages', function(callback) {
        install(options, callback);
      });
    }

    if (options.copy) {
      add('Copied packages to ' + targetDir.grey, function(callback) {
        copy(options, callback);
      });
    }

    if (options.cleanBowerDir) {
      add('Cleaned bower dir ' + bowerDir.grey, function(callback) {
        clean(bowerDir, callback);
      });
    }

    async.series(tasks, done);
  });
};
