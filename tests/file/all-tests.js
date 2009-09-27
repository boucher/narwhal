var assert = require("test/assert");
var fs = require("file");

function create_test_dirs()
{    
    fs.mkdirs(test_dir());
    
    var files = [
      ".dotfile",
      ".dotsubdir/.dotfile",
      ".dotsubdir/nondotfile",

      "deeply/.dotfile",
      "deeply/nested/.dotfile.ext",
      "deeply/nested/directory/structure/.ext",
      "deeply/nested/directory/structure/bar",
      "deeply/nested/directory/structure/baz",
      "deeply/nested/directory/structure/file_one",
      "deeply/nested/directory/structure/file_one.ext",
      "deeply/nested/directory/structure/foo",
      "deeply/nondotfile",
      
      "file_one.ext",
      "file_two.ext",

      "dir_filename_ordering",
      "dir/filename_ordering",

      "nondotfile",

      "subdir_one/.dotfile",
      "subdir_one/nondotfile",
      "subdir_two/nondotfile",
      "subdir_two/nondotfile.ext",

      "special/+",

      "special/^",
      "special/$",

      "special/(",
      "special/)",
      "special/[",
      "special/]",
      "special/{",
      "special/}"
    ];
    
    files.forEach(function (file)
    {
        var thisFile = fs.join(test_dir(), file);
        fs.mkdirs(fs.dirname(fs.path(thisFile)));
        fs.touch(thisFile);
    });
}

function test_dir()
{
    var base = fs.path(module.path).dirname(),
        test = fs.join(base, "test");
    
    return fs.path(test);
}

function destroy_test_dirs()
{
    fs.rmtree(test_dir());
}

exports.setup = function () 
{
    create_test_dirs();
}

exports.teardown = function ()
{
    destroy_test_dirs();
}

exports.testRmtreeDoesNotFollowSymlinks = function () {
    var here = fs.path(module.path).dirname();
    if (here.join('foo').exists())
        here.join('foo').rmtree();
    try {
        here.join('foo', 'bar').mkdirs();
        here.join('foo', 'bar').symlink(here.join('foo', 'baz'));
        here.join('foo', 'baz').rmtree();
        assert.isTrue(here.join('foo', 'bar').exists());
    } finally {
        here.join('foo').rmtree();
    }
};

exports.testGlobStar = function () {
};

exports.testGlobQuestion = function () {
};

exports.testGlobStarStar = function () {
};

exports.testGlobDotDotDot = function () {
};

exports.testGlobMatchesDotAndNonDotfiles = function ()
{
    assert.eq(
        pathsRelativeToPath(test_dir().glob("*", fs.FNM_PERIOD).sort(), test_dir()), 
        expectedPaths()
    );
};

exports.testGlobMatchesNonSpecialCharacterFileNames = function ()
{
    assert.eq(
        pathsRelativeToPath(test_dir().glob("*file").sort(), test_dir()), 
        [".dotfile", "nondotfile"]
    );
};

exports.testGlobStarStarMatchesAllFileInCurrentDirectory = function ()
{
    assert.eq(
        pathsRelativeToPath(test_dir().glob("**").sort(), test_dir()),
        expectedPaths()
    );
};

var create_fnmatch_tests = function()
{
    var iter = 0;
    
    [
    ['cat',         'cat',          true ],
    ['cat',         'category',     false],
    ['c{at,ub}s',   'cats',         false],
    ['c{at,ub}s',   'cubs',         false],
    ['c{at,ub}s',   'cat',          false],
    ['c?t',         'cat',          true ],
    ['c\\?t',       'cat',          false],
    ['c??t',        'cat',          false],
    ['c*',          'cats',         true ],
    ['c/*/t',       'c/a/b/c/t',    true ],
    ['c\at',        'cat',          true ],
    ['c\\at',       'cat',          false,  fs.FNM_NOESCAPE],
    ['a?b',         'a/b',          true ],
    ['a?b',         'a/b',          false,  fs.FNM_PATHNAME],
    ['*',           '.profile',     false],
    ['.*',          'profile',      false],
    ['.*',          '.profile',     true ],
    ['*',           '.profile',     true ,  fs.FNM_PERIOD]//,
    ].forEach(function(test){
        exports["testFNMatch"+(iter++)] = function()
        {
            assert.eq(test[2], fs.fnmatch(test[0], test[1], test[3]),
                      "expect '"+test[0]+"' "+(test[2] ? "==" : "!=" )+" '"+test[1]+"'");
        }
    });
}

create_fnmatch_tests();

exports.testFNMatch = function ()
{
    assert.isTrue (fs.fnmatch('cat',       'cat'), "cat == cat");
    assert.isFalse(fs.fnmatch('cat',       'category'), "cat != category");

    assert.isFalse(fs.fnmatch('c{at,ub}s', 'cats'), "c{at,ub}s != cats");
    assert.isFalse(fs.fnmatch('c{at,ub}s', 'cubs'), "c{at,ub}s != cubs");
    assert.isFalse(fs.fnmatch('c{at,ub}s', 'cat'), "c{at,ub}s != cat");

    assert.isTrue (fs.fnmatch('c?t',    'cat'), "c?t == cat");
    assert.isFalse(fs.fnmatch('c\\?t',  'cat'), "c\\?t != cat");
    assert.isFalse(fs.fnmatch('c??t',   'cat'), "c??t != cat");
    assert.isTrue (fs.fnmatch('c*',     'cats'), "c* == cats");
    assert.isTrue (fs.fnmatch('c/*/t',  'c/a/b/c/t'), "c/*/t");
    assert.isTrue (fs.fnmatch('c*t',    'cat'), "c*t == cat");
    assert.isTrue (fs.fnmatch('c\at',   'cat'), "c\\at == cat");
    assert.isFalse(fs.fnmatch('c\\at',  'cat', fs.FNM_NOESCAPE), "c\\at != cat");

    assert.isTrue (fs.fnmatch('a?b',    'a/b'), "a?b == a/b");
    assert.isFalse(fs.fnmatch('a?b',    'a/b', fs.FNM_PATHNAME), "a?b != a/b");

    assert.isFalse(fs.fnmatch('*',   '.profile'), "* != .profile");
    assert.isFalse(fs.fnmatch('.*',  'profile'), ".* != profile");
    assert.isTrue (fs.fnmatch('.*',  '.profile'), ".* == .profile");
    assert.isTrue (fs.fnmatch('*',   '.profile', fs.FNM_PERIOD), "* == .profile");
    assert.isTrue (fs.fnmatch('*',   'dave/.profile'), "* == dave/.profile");
    assert.isTrue (fs.fnmatch('*',   'dave/.profile', fs.FNM_PERIOD), "* == dave/.profile");
    assert.isTrue (fs.fnmatch('*',   'dave/profile'), "* == dave/profile");
    assert.isFalse(fs.fnmatch('*',   'dave/profile', fs.FNM_PATHNAME), "* != dave/profile");
    assert.isFalse(fs.fnmatch('*',   'dave/.profile', fs.FNM_PATHNAME), "* != dave/.profile");
    assert.isTrue (fs.fnmatch('*/*', 'dave/profile', fs.FNM_PATHNAME), "*/* == dave/profile");
    assert.isFalse(fs.fnmatch('*/*', 'dave/.profile', fs.FNM_PATHNAME), "*/* != dave/.profile");
    assert.isTrue (fs.fnmatch('*/*', 'dave/.profile', fs.FNM_PATHNAME | fs.FNM_PERIOD), "*/* == dave/.profile")  //#=> true

    assert.isTrue (fs.fnmatch('ca[a-z]', 'cat'), "ca[a-z] == cat");
    assert.isFalse(fs.fnmatch('[a-z]', 'D'), "[a-z] != D");
    assert.isTrue (fs.fnmatch('[^a-z]', 'D'), "[^a-z] == D");
    assert.isFalse(fs.fnmatch('[A-Z]', 'd'), "[A-Z] != d");
    assert.isTrue (fs.fnmatch('[^A-Z]', 'd'), "[^A-Z] == d");
    assert.isTrue (fs.fnmatch('[a-z]', 'D', fs.FNM_CASEFOLD), "[a-z] == D");
    assert.isTrue (fs.fnmatch('[A-Z]', 'd', fs.FNM_CASEFOLD), "[A-Z] == d");
    assert.isFalse(fs.fnmatch('/ca[s][s-t]/rul[a-b]/[z]he/[x-Z]orld', '/cats/rule/the/World'), "/cats/rule/the/World");
    assert.isTrue (fs.fnmatch('/ca[t][s-t]/rul[a-e]/[t]he/[A-Z]orld', '/cats/rule/the/World'), "/cats/rule/the/World");
  
    assert.isFalse(fs.fnmatch('cat', 'CAT'), "cat != CAT");
    assert.isTrue (fs.fnmatch('cat', 'CAT', fs.FNM_CASEFOLD), "cat == CAT");

    assert.isFalse(fs.fnmatch('ca[!t]', 'cat'), "ca[!t] != cat");
    assert.isFalse(fs.fnmatch('ca[^t]', 'cat'), "ca[^t] != cat");
    
    assert.isFalse(fs.fnmatch('?', '/', fs.FNM_PATHNAME), "? != /");
    assert.isFalse(fs.fnmatch('*', '/', fs.FNM_PATHNAME), "? != *");
    
    assert.isTrue (fs.fnmatch('\\?', '?'), "\\? == ?");
    assert.isFalse(fs.fnmatch('\\?', 'a'), "\\? != a");
    assert.isTrue (fs.fnmatch('\\*', '*'), "\\* == *");
    assert.isFalse(fs.fnmatch('\\*', 'a'), "\\* != a");
    assert.isTrue (fs.fnmatch('\\a', 'a'), "\\a == a");
    assert.isTrue (fs.fnmatch('this\\b', 'thisb'), "this\\b == thisb");
    assert.isTrue (fs.fnmatch('\\a', '\\a', fs.FNM_NOESCAPE), "\\a == \\a*");
    assert.isFalse(fs.fnmatch('\\a', 'a', fs.FNM_NOESCAPE), "\\a != a");
    assert.isFalse(fs.fnmatch('\\[foo\\]\\[bar\\]', '[foo][bar]', fs.FNM_NOESCAPE), "\\[foo\\]\\[bar\\] != [foo][bar]");
    assert.isTrue (fs.fnmatch('\\[foo\\]\\[bar\\]', '[foo][bar]'), "\\[foo\\]\\[bar\\] == [foo][bar]");
    assert.isTrue (fs.fnmatch('[\\?]', '?'), "[\\?] == ?");
    assert.isTrue (fs.fnmatch('[\\*]', '*'), "[\\*] == *");
    
    assert.isFalse(fs.fnmatch("**/*.j", 'main.j'), "**/*.j != main.j");
    assert.isFalse(fs.fnmatch("**/*.j", './main.j'), "**/*.j != ./main.j");
    assert.isTrue (fs.fnmatch("**/*.j", 'lib/main.j'), "**/*.j == lib/main.j");
    assert.isTrue (fs.fnmatch("**.j", 'main.j'), "**.j == main.j");
    assert.isFalse(fs.fnmatch("**.j", './main.j'), "**.j != ./main.j");
    assert.isTrue (fs.fnmatch("**.j", 'lib/main.j'), "**.j == lib/main.j");
    assert.isTrue (fs.fnmatch("*", 'dave/.profile'), "* == dave/.profile");

    //assert.isTrue (fs.fnmatch("**/*.j", 'main.j', fs.FNM_PATHNAME), "**/*.j == main.j");
    assert.isTrue (fs.fnmatch("**/*.j", 'one/two/three/main.j', fs.FNM_PATHNAME), "**/*.j == one/two/three/main.j");
    assert.isFalse(fs.fnmatch("**/*.j", './main.j', fs.FNM_PATHNAME), "**/*.j == ./main.j");

    //assert.isTrue (fs.fnmatch("**/*.j", './main.j', fs.FNM_PATHNAME|fs.FNM_DOTMATCH), "**/*.j == ./main.j");
    assert.isTrue (fs.fnmatch("**/*.j", 'one/two/.main.j', fs.FNM_PATHNAME|fs.FNM_DOTMATCH), "**/*.j == one/two/.main.j");
    assert.isTrue (fs.fnmatch("**/best/*", "lib/my/best/song.j"), "**/best/* == lib/my/best/song.j");
    
    assert.isFalse(fs.fnmatch("**/foo", "a/.b/c/foo", fs.FNM_PATHNAME), "**/foo != a/.b/c/foo");
    //assert.isTrue (fs.fnmatch("**/foo", "a/b/c/foo", fs.FNM_PATHNAME), "**/foo == a/b/c/foo");
    //assert.isTrue (fs.fnmatch("**/foo", "/a/b/c/foo", fs.FNM_PATHNAME), "**/foo == /a/b/c/foo");
    //assert.isTrue (fs.fnmatch("**/foo", "a/.b/c/foo", fs.FNM_PATHNAME|fs.FNM_PERIOD), "**/foo == a/.b/c/foo");
}

function pathsRelativeToPath(paths, relativeTo)
{
    return paths.map(function(o) {
        return fs.relative(relativeTo+"/", o);
    });
};

function expectedPaths()
{
    return [
      ".dotfile",
      ".dotsubdir",
      "deeply",
      "dir",
      "dir_filename_ordering",
      "file_one.ext",
      "file_two.ext",
      "nondotfile",
      "special",
      "subdir_one",
      "subdir_two"
    ];
};

if (require.main === module.id)
    require("os").exit(require("test/runner").run(exports));
