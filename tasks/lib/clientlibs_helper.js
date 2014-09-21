var fs = require("fs");
var path = require("path");
var _ = require("lodash");
var handlebars = require("handlebars");

module.exports = {

    writeFile : function(content, file) {
        fs.writeFileSync(file, content);
    },

    updateFile : function(content, file) {

        var currentContent, updatedContent;

        currentContent = fs.readFileSync(file, 'utf8');
        updatedContent = currentContent + "\n" + content;

        fs.writeFileSync(file, updatedContent);
    },

    createContentFile : function(options) {
        var clientlibNameSuffixed, 
            contentFile, 
            content, 
            opt,
            xmlContent,
            compiledContentTemplate,
            contentTemplate;


        opt = options.options;

        content = {
            clientlibName: options.clientlib + "." + opt.projectName + "." + opt.clientlibSuffix,
        };

        if (options.dependencies && _.isString(options.dependencies)) {
            content['dependencies'] = options.dependencies.replace(/,\s/g, ',');
        };

        contentTemplate = fs.readFileSync(__dirname + "/templates/contentxml.handlebars", "utf8");
        compiledContentTemplate = handlebars.compile(contentTemplate);
        xmlContent = compiledContentTemplate(content);

        if (options.destination) {
            contentFile = path.join(options.destination, ".content.xml");
            this.writeFile(xmlContent, contentFile)
        }
    },

    createTxtFile: function(clientlib, location, extension) {
        var content, contentFile;

        content = '#base=' + extension + '\n' + clientlib;

        contentFile = path.join(location, extension + ".txt");

        if (!fs.existsSync(contentFile)) {
            this.writeFile(content, contentFile);
        } else {
            this.updateFile(clientlib, contentFile)
        }
    }
}
