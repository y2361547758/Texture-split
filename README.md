# Texture split

面向汉化工作的，方便编辑TexturePacking生成的游戏资源文件的Photoshop插件

解析xml/plist文件，载入对应的组合图，按文件描述将各个小贴图拷贝到新图层，

并转为智能对象或添加蒙版，方便美工在修图时控制显示范围

## Usage

使用Photoshop打开`texture.jsx`文件，在弹出的选项框中选择需要导入的`plist`文件，可以多选。

确认`plist`文件后，脚本会自动在同目录寻找对应的图片文件，如果找不到会弹出选项框让用户手动选择目标图片。

脚本运行完毕，会生成对应数量的图层，以及隐藏了的原图在最底层。

修改贴图时只要修改该图层内的像素，如果超出范围多余的部分会无法显示，方便美工及时调整。

善用`alt+对应图层隐藏按钮`批量隐藏/显示图层。

## Others / 闲话

`Texture`特指在游戏领域广泛应用的2D动画(spine)贴图素材储存格式，类似web下的组合多个图标成一个文件来节省请求数的技术。

在游戏汉化时往往需要将带文字的图片分离出来，修改后再拼合回图片中；但如果手头没有合适的工具，或者单纯只是偷懒不想切出一大堆临时文件时，美工往往会直接对着大图修改。如果美工比较熟练且细心那么并没有什么问题，但新手美工往往很容易就把图修到范围外去了，到游戏里就看见贴图被奇怪地裁了一刀。

由于贴图边界并不十分直观，于是就想写个脚本从`plist`中读取边界然后在PS中限制每个贴图的修改范围；查了下Adobe官网[PS插件开发](https://www.adobe.io/photoshop/)页面，发现新插件技术`UXP`（基于ES5+）必须要PS 22.0以上才支持，手头上用的CC 2019的版本号才20.0，只好转去看传统`CEP`插件开发，鉴于跨平台使用，忽略VB、AS，使用JS（基于ES3）开发。

[CEP的参考手册](https://www.adobe.com/devnet/photoshop/scripting.html)十分不易于上手，VSCode的插件补全又太羸弱了，官方`ExtendScript Toolkit`也没补全、调试功能对函数支持也不行、交互控制台简直灾难…好歹能够从“数据浏览器”看到一些特有对象的结构…这JS方言一堆非官方实现又不写文档里，亏我从实例脚本里翻出了XML这个内置XML解析器，免得象另一个实例脚本一样手动解析字符串。I18N、GUI文档里都没写，想想也用不上。

> 为什么要整这么个脚本如此复杂？直接用工具或其他脚本把图切成很多份小文件，逐个改完再工具拼起来，必要时甚至可以改尺寸改布局，不方便多了

一来方便美工没有python或者其他脚本运行环境（静态编译？美工还有Mac用户得照顾）；二来节省步骤，全部工作在PS里进行，也不会产生一堆临时文件。

毕竟是面向汉化的工具，通常是以最小修改、最大还原为目标，大刀阔斧万一哪出bug了也不好调:(

> [动作监听插件](https://helpx.adobe.com/photoshop/kb/downloadable-plugins-and-content.html#ScriptingListenerplugin)

我算懂了，Adobe根本就没打算好好维护脚本对象，他们只要把底层动作全都映射一个ID上，脚本就拿着这些ID喂给PS当做函数调用，功能固然是能跟上版本，但也不比直接调用DLL简单多少。
