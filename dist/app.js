var cats = [
    { id: 1, pid: 0, name: 'Mercedes' }
    , { id: 2, pid: 0, name: 'BMW' }
    , { id: 3, pid: 1, name: 'C 300' }
    , { id: 4, pid: 1, name: 'E 200' }
    , { id: 9, pid: 4, name: 'E 200 Diesel' }
    , { id: 10, pid: 4, name: 'E 200 Benzin' }
    , { id: 5, pid: 1, name: 'E 250' }
    , { id: 6, pid: 1, name: 'E 300' }
    , { id: 7, pid: 2, name: '750' }
    , { id: 8, pid: 2, name: '650' }
];

var _id = 11;
function ComponentTreeView(options) {
    options["container"] = options.element.find('.component-treeview-container');

    var _prefix = options.element.attr('id') + '-';
    var _tempActiveItem = null;
    var _tempPreActiveItem = null;

    var services = {
        cleanArray: function (actual) {
            var newArray = new Array();
            for (var i = 0; i < actual.length; i++) {
                if (actual[i]) {
                    newArray.push(actual[i]);
                }
            }
            return newArray;
        }
        , getActiveItem: function () {
            var activeItem = options.element.find('.--active');
            return {
                id: activeItem.data('uid'),
                element: activeItem,
                object: model.get(activeItem.data('uid')),
                isBaseItem: activeItem.hasClass('--base')
            }
        }
        , addHtmlItemTo: function (item, toItem) {
            var addToList = toItem.find('>ul');
            //if ul list is not then create it
            if (!addToList.length) {
                toItem.append(document.createElement('ul'));
                addToList = toItem.find('>ul');
                toItem.addClass('--opened');
                if (!toItem.find('.icon-folder-open').length)
                    toItem.prepend(getIconCode('folder-open'));
            }
            addToList.append(item);
        },

        createNewLiItem: function (id, name) {
            var li = document.createElement('li');
            var span = document.createElement('span');
            span.textContent = name;
            li.id = _prefix + id;
            li.dataset.uid = id;
            li.appendChild(span);
            return li;
        }
    }

    var model = {
        get: function (id) {
            for (var i = 0; i < options.data.length; ++i) {
                var cur = options.data[i];
                if (cur == undefined)
                    continue;
                if (cur.id == id) {
                    return cur;
                    break;
                }
            }
        },
        add: function (item) {

        },
        saveChanges: function (item) {
            for (var i = 0; i < options.data.length; ++i) {
                var cur = options.data[i];
                if (cur == undefined)
                    continue;
                if (cur.id == item.id) {
                    options.data[i] = item;
                    break;
                }
            }
        },
        delete: function (item) {
            for (var i = 0; i < options.data.length; ++i) {
                if (options.data[i].id == item.id) {
                    model.deleteChildsOfPid(options.data[i].id);
                    delete options.data[i];
                    break;
                }
            }
            options.data = services.cleanArray(options.data);
        },
        deleteChildsOfPid: function (pid) {
            for (var i = 0; i < options.data.length; ++i) {
                if (options.data[i] == undefined)
                    continue;
                if (options.data[i].pid == pid) {
                    model.deleteChildsOfPid(options.data[i].id);
                    delete options.data[i];
                    continue;
                }
            }
        }
    }

    var funcCut = function () {
        var activeItem = _tempPreActiveItem = services.getActiveItem();
        activeItem.element.addClass('--cuted')
    }
    var funcPaste = function (item, pasteTo) {
        item.element.removeClass('--cuted');
        services.addHtmlItemTo(item.element, pasteTo.element);
        item.object.pid = pasteTo.isBaseItem ? 0 : pasteTo.object.id;
        model.saveChanges(item.object);
    }

    var funcDeleteItem = function (item) {
        model.delete(item);
        $('#' + _prefix + item.id).remove();
    }

    var funcAndNewItem = function (newItem) {
        var parent = $('#' + _prefix + newItem.pid);
        var parentList = parent.find('>ul');
        if (parentList.length == 0) {
            parent.append(document.createElement('ul'));
            parentList = parent.find('>ul');
        }

        var li = services.createNewLiItem(newItem.id, newItem.name)

        if (!parent.find('.icon-folder-open').length)
            parent[0].insertAdjacentElement('afterBegin', getIconCode('folder-open'));
        parent[0].className = '--opened';

        li.appendChild(span);
        li.insertAdjacentElement('afterBegin', getIconCode('folder'));
        parentList.append(li);

        options.data.push(newItem);
    }

    var getIconCode = function (icoName) {
        var em = document.createElement('em');
        em.className = 'icon-' + icoName;
        return em;
    }

    var funcGenerateDOM = function (pid) {
        var docFragmentList = document.createDocumentFragment();
        for (var i = 0; i < options.data.length; i++) {
            if (options.data[i].pid == pid) {
                var li = services.createNewLiItem(options.data[i].id, options.data[i].name)
                docFragmentList.appendChild(li);

                var subItems = funcGenerateDOM(options.data[i].id, options.data);
                if (subItems) {
                    var ul = document.createElement('ul');
                    ul.appendChild(subItems);
                    li.appendChild(ul);
                    li.insertAdjacentElement('afterBegin', getIconCode('folder-open'));
                }
                li.insertAdjacentElement('afterBegin', getIconCode('folder'));
            }
        }
        return docFragmentList.childElementCount ? docFragmentList : null;
    }

    options["container"].append($(funcGenerateDOM(0, options.data)));

    options.element.on('click', function (e) {
        var $target = $(e.target);


        if ($target.closest('li').length) {
            var parentLi = $target.closest('li');

            options.element.find('.--active').removeClass('--active');
            parentLi.addClass('--active');
            if (!parentLi.hasClass('--base') && parentLi.find('ul').length)
                parentLi.toggleClass('--opened');
        }
        else if ($target.closest('button').length) {
            var btn = $target.closest('button');

            var activeItem = services.getActiveItem();

            if (btn.hasClass('component-treeview-options-add')) {
                options.onAdd(activeItem.object);
            }
            else if (btn.hasClass('component-treeview-options-delete')) {
                if (!activeItem.isBaseItem) {
                    funcDeleteItem(activeItem.object);
                    _tempActiveItem = null;
                }
            }
            else if (btn.hasClass('component-treeview-options-save')) {
                localStorage.setItem('treeview-ds', JSON.stringify(componentTreeView.dataSource.data()))

            }
            else if (btn.hasClass('component-treeview-options-cut')) {
                if (!activeItem.isBaseItem) {
                    funcCut();
                }
            }
            else if (btn.hasClass('component-treeview-options-paste')) {
                funcPaste(_tempPreActiveItem, activeItem);
            }
        }
    });

    this.dataSource = {
        add: function (input) {
            input.pid = _tempActiveItem.id;
            funcAndNewItem(input);
        },
        data: function () {
            return options.data;
        }
    }
}

var componentTreeView = new ComponentTreeView({
    element: $('#mytreeview'),
    data: JSON.parse(localStorage.getItem('treeview-ds')),
    onAdd: function () {
        componentTreeView.dataSource.add({ id: ++_id, pid: 0, name: 'E 200 1994' })
    }
});