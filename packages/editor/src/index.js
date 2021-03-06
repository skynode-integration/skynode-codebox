require("./stylesheets/main.less");

var ace = require("./ace");
var aceModes = ace.require("ace/ext/modelist");
var Tab = require("./tab");
var settings = require("./settings");
var editorCommands = require("./commands");

var Q = codebox.require("q");
var _ = codebox.require("hr.utils");
var commands = codebox.require("core/commands");
var dialogs = codebox.require("utils/dialogs");
var File = codebox.require("models/file");

var openFile = function(f) {
    if (f.isDirectory()) return Q.reject(new Error("Could not open a folder"));

    return codebox.tabs.add(Tab, {
        model: f
    }, {
        type: "editor",
        title: f.get("name"),
        uniqueId: "editor://"+f.get("path"),
        context: {
            file: f
        }
    });
};

var openNewfile = function() {
    var f = File.buffer("untitled", "");
    openFile(f);
};

// Default tab is an empty buffer
codebox.tabs.on("tabs:opennew", openNewfile);
openNewfile();

// Add command to open a file
commands.register({
    id: "file.open",
    title: "File: Open",
    run: function(args, ctx) {
        return Q()
        .then(function() {
            if (args.file) return args.file;
            if (args.path) return File.get(args.path);

            return File.buffer("untitled", "");
        })
        .then(openFile)
        .then(function(tag) {
            // Set line
            if (args.line || args.column) {
                tag.moveCursor(args.column || 0, args.line || 0);
            }
        });
    }
});

// Save the file
commands.register({
    id: "editor.save",
    title: "File: Save",
    shortcuts: [
        "mod+s"
    ],
    context: ["editor"],
    run: function(args, ctx) {
        return ctx.editor.save();
    }
});

// Save all files
commands.register({
    id: "editor.save.all",
    title: "File: Save All",
    shortcuts: [
        "mod+alt+s"
    ],
    run: function(args) {
        return codebox.tabs.tabs.reduce(function(prev, tab) {
            if (tab.get("type") != "editor") return prev;

            return prev.then(function() {
                return tab.view.save();
            })
        }, Q());
    }
});

// Map ace commands
commands.register(editorCommands);

// Set syntax
commands.register(_.map(aceModes.modesByName, function(mode) {
    return {
        id: "editor.syntax."+mode.name,
        title: "Set Syntax: "+mode.caption,
        context: ["editor"],
        run: function(args, ctx) {
            ctx.editor.setMode(mode.name);
        }
    }
}));

// Syntax menu
codebox.menubar.createMenu("view", {
    id: "syntax",
    caption: "Syntax",
    position: 10,
    items: _.map(aceModes.modesByName, function(mode) {
        return {
            command: "editor.syntax."+mode.name,
            caption: mode.caption
        }
    })
});

codebox.editor = require("./api");

