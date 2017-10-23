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
    var _prefix = options.element.attr('id') + '-';
    var _tempActiveItem = null;
    var _tempPreActiveItem = null;
    var cleanArray = function (actual) {
        var newArray = new Array();
        for (var i = 0; i < actual.length; i++) {
            if (actual[i]) {
                newArray.push(actual[i]);
            }
        }
        return newArray;
    }

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
            var activeItem = _tempPreActiveItem = options.element.find('.--active');
            var activeItemId = activeItem.attr('id');
            var result = {
                item: activeItem,
                id: activeItemId,
                dataId: activeItemId.slice(-(activeItemId.length - activeItemId.indexOf('-') - 1))
            }

            return result;
        }
        , addHtmlItemTo: function (item, toItem) {
            var addToList = toItem.find('ul');
            //if ul list is not then create it
            if (!addToList.length) {
                toItem.append(document.createElement('ul'));
                addToList = toItem.find('ul');
                toItem.addClass('--opened');
                if (!toItem.find('.icon-folder-open').length)
                    toItem.prepend(getIconCode('folder-open'));
            }
            addToList.append(item);
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
        delete: function (item) {
            for (var i = 0; i < options.data.length; ++i) {
                if (options.data[i].id == item.id) {
                    model.deleteChildsOfPid(options.data[i].id);
                    delete options.data[i];
                    break;
                }
            }
            options.data = cleanArray(options.data);
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
        var activeItem = services.getActiveItem();
        activeItem.item.addClass('--cuted')
    }
    var funcPaste = function (item, pasteTo) {
        item.removeClass('--cuted');
        services.addHtmlItemTo(item, pasteTo);
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

        var li = document.createElement('li');
        var span = document.createElement('span');
        span.textContent = newItem.name;
        li.id = _prefix + newItem.id;
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
                var li = document.createElement('li');
                var span = document.createElement('span');
                span.textContent = options.data[i].name;
                li.id = _prefix + options.data[i].id;
                li.appendChild(span);

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

    options.element.append($(funcGenerateDOM(0, options.data)));

    options.element.on('click', function (e) {
        var $target = $(e.target);


        if ($target.closest('li').length) {
            var parentLi = $target.closest('li');
            options.element.find('.--active').removeClass('--active');
            parentLi.addClass('--active');
            if (parentLi.find('ul').length)
                parentLi.toggleClass('--opened');
        }
        else if ($target.closest('button').length) {
            var btn = $target.closest('button');

            var activeItem = options.element.find('.--active');
            var activeItemId = activeItem.attr('id');
            var activeItemDataId = activeItemId.slice(-(activeItemId.length - activeItemId.indexOf('-') - 1));
            _tempActiveItem = model.get(activeItemDataId);

            var activeItemObj = {
                elem: activeItem,
                id: activeItemDataId,
                displayName: activeItem.text(),
                object: _tempActiveItem
            }

            if (btn.hasClass('component-treeview-options-save')) {
                options.onAdd(activeItemObj);
            }
            else if (btn.hasClass('component-treeview-options-delete')) {
                console.log('--')
                funcDeleteItem(activeItemObj);
                _tempActiveItem = null;
            }
            else if (btn.hasClass('component-treeview-options-cut')) {
                funcCut();
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
    data: cats,
    onAdd: function () {
        componentTreeView.dataSource.add({ id: ++_id, pid: 0, name: 'E 200 1994' })
    }
});