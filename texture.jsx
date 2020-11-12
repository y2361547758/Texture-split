#target photoshop

/*
    description:
        面向汉化为目的的，方便编辑TexturePacking生成的游戏资源文件的插件
    detail:
        解析plist/xml文件，载入对应的组合图，按文件描述将各个小文件拷贝到新图层，
        并转行为智能对象或添加矢量蒙版，然后隐藏原图
*/

// debug level: 0-2 (0:disable, 1:break on error, 2:break at beginning)
$.level = 0;

function Frame(name, option) {
    this.name = name;
    this.width = option.width;
    this.height = option.height;
    // ignore original width/height
    // this.originalWidth = option.originalWidth;
    // this.originalHeight = option.originalHeight;
    this.x = option.x;
    this.y = option.y;
    // not support offset, for now
    // this.offsetX = option.offsetX;
    // this.offsetX = option.offsetX;
}

function Plist(file) {  // file: File | string
    this.remote = false;
    this.file = null;
    this.folder = null;
    this.text = null;
    this.version = null;
    this.dict = {};
    this.frames = [];
    this.texture = {
        filename: null,
        width: null,
        height: null
    }
    this.png = null;

    this._xml2dict = function(xml) {    // 递归解析xml成对象
        var dict = {};
        var key = null, value = null;
        var children = xml.children();
        for (var i in children) {
            var item = children[i];
            switch (item.name().localName) {
                case "key":
                    key = item.toString();
                    break;
                case "dict":
                    dict[key] = this._xml2dict(item);
                    break;
                case "integer":
                    dict[key] = parseInt(item);
                    break;
                case "real":
                    dict[key] = parseFloat(item);
                    break;
                case "string":
                    dict[key] = item.toString();
                    break;
                default:
                    throw "Unknow tag: " + item.name();
            }
        }
        return dict;
    }

    this.load = function(file) {
        if (file instanceof File) this.file = file;
        else if (typeof file == "string") {
            if ('https?://.*\.plist'.match(file)) {
                this.remote = true;
                // PS do not support ajax
                return 1;
            }
            this.file = new File(file);
        } else return 1;
        if (!this.file.exists) return 2;
        this.file.encoding = "UTF8";
        this.file.lineFeed = "unix";
        this.folder = this.file.parent;
        if (!this.file.open("r")) return 2;
        this.text = this.file.read();
        this.file.close();
        var xml = new XML(this.text);
        this.version = xml.attributes()[0];
        this.dict = this._xml2dict(xml.dict);
        return 0;
    }

    this.parse = function(dict) {
        if (dict.metadata.format != 0) return 11;
        this.texture.filename = dict.metadata.realTextureFileName;
        this.texture.width = dict.texture.width;
        this.texture.height = dict.texture.height;
        for (var i in dict.frames)
            this.frames.push(new Frame(i, dict.frames[i]));
        return 0;
    }

    this.findPng = function() {
        var files = this.folder.getFiles(this.texture.filename);
        if (!files || files.length == 0) {
            this.png = File.openDialog(this.texture.filename, "Image File: *.png; *.jpg; *.jpeg; *.bmp;, Any Files: *.*");
        } else this.png = files[0];
        if (!this.png || !this.png.exists) return 22;
        return 0;
    }

    var r = 0;
    r = this.load(file);
    if (r) return r;
    r = this.parse(this.dict);
    if (r) return r;
    r = this.findPng();
    if (r) return r;
}

function main() {
    var files = File.openDialog("Select the plist", "Texture File: *.plist", true)
    // var filename = prompt("Path to plist file");
    // var pfile = File(filename, {
    //     type: "text/xml"
    // });
    if (!files) return 1;
    app.preferences.rulerUnits = Units.PIXELS;
    for (var i in files) {
        var texture = new Plist(files[i]);
        if (!texture) return 4;
        if (typeof texture == "number") return texture;
        var doc = app.open(texture.png, undefined, false);
        var background = doc.layers[0];
        // background.name = texture.png.name;
        for (var j in texture.frames) {
            var frame = texture.frames[j];
            doc.activeLayer = background;
            // doc.selection.solid = true;
            doc.selection.select([
                [frame.x, frame.y],
                [frame.x, frame.y + frame.height],
                [frame.x + frame.width, frame.y + frame.height],
                [frame.x + frame.width, frame.y],
            ]);
            doc.selection.copy();
            var layer = doc.paste(true);
            layer.name = frame.name;
            // layer.kind = LayerKind.SMARTOBJECT;
        }
        background.visible = false;
    }
    return 0;
}

var r = -1;
try {
    r = main();
} catch (e) {
    alert(e);
}

switch (r) {
    case 0:
        // alert("Finished");
        break;
    case 1:
        // alert("User cancal");
        break;
    case 2:
        alert("File not found");
        break;
    case 3:
        alert("Can not open file");
        break;
    case 4:
        alert("Not a texture plist file");
        break;
    case -1:
    default:
        alert("Unknow error: " + r);
}