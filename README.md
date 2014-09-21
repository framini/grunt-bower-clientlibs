> Dinamically generates CQ Clientlibs using Bower.

## Install
```bash
npm install grunt-bower-clientlibs --save-dev
```

## Usage

```js
require('load-grunt-tasks')(grunt); // npm install --save-dev load-grunt-tasks

grunt.initConfig({
  bower: {
    install: {
        options: {
            targetDir: './vendorTargetDir',
            projectName: 'projectName'
        }
    }
  }
});

```

### Options

#### options.targetDir
Type: `String`
Default value: `./lib`

A directory where you want to keep your Bower packages.

#### options.projectName
Type: `String`
Default value: `''`

String to be added to the clientlib name. i.e [libraryName].[projectName].[clientlibSuffix]

#### options.clientlibSuffix
Type: `String`
Default value: `''`

String to be added as a suffix to the clientlib name. i.e [libraryName].[projectName].[clientlibSuffix]


If you need to support custom layout then you can specify `layout` as a function of `type` and `component`:

```js
var path = require('path');

grunt.initConfig({
  bower: {
    install: {
      options: {
        layout: function(type, component) {
          var renamedType = type;
          if (type == 'js') renamedType = 'javascripts';
          else if (type == 'css') renamedType = 'stylesheets';

          return path.join(component, renamedType);
        }
      }
    }
  }
});
```

#### options.bowerOptions
Type: `Object`
Default value: `{}`

An options object passed through to the `bower.install` api, possible options are as follows:

```
{
    forceLatest: true|false,    // Force latest version on conflict
    production: true|false,     // Do not install project devDependencies
}
```

### Usage Examples

```js
grunt.initConfig({
  bower: {
    install: {
      options: {
        targetDir: 'target/vault-work/jcr_root/etc/designs/lodges/clientlibs/vendor',
        projectName: 'lodges'
      }
    }
  }
});
```


## Configure bower.json file:

You'll need to specify in your bower.json which are the files you are interested in from each listed dependency. In here you'll have the chance to override the main files defined in its related bower.json and create the clientlib using only the specified files. 

```json
{
  "name": "simple-bower",
  "version": "0.0.0",
  "dependencies": {
    "bootstrap-sass": "*",
    "owlcarousel": "git://github.com/OwlFonk/OwlCarousel2.git"
  },
  "clientlibsOverride": {
    "bootstrap-sass": {
      "js": "js/*.js",
      "scss": "lib/*.scss",
      "img": "img/*.png"
    },
    "owlcarousel": {
      "css": [
        "dist/assets/owl.carousel.css",
        "dist/assets/owl.theme.default.css"
      ],
      "js": "dist/owl.carousel.js",
      "dependencies": "main.lodges.clientlib"
    }
  }
}
```
`grunt-bower-clientlibs` will do the rest:

* If Bower package has defined `"main"` files then they will be copied to `./lib/<package>/`.
* If `"main"` files are empty then the whole package directory will be copied to `./lib`.
* When you define `"clientlibsOverride"` only asset types and files specified by you will be copied to `./lib`.

## Credits
[Ivan Yatskevich](https://github.com/yatskevich/grunt-bower-task)

## License
Licensed under the MIT license.
