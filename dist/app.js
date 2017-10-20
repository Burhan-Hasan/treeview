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

function ComponentTreeView(options) {
    var _prefix = options.element.attr('id') + '-';
    var _tempActiveItem = null;

    var getElementById = function (id) {
        for (var i = 0; i < options.data.length; ++i) {
            var cur = options.data[i];
            if (cur.id == id)
                return cur;
        }
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
            if (btn.hasClass('component-treeview-options-save')) {
                var activeItem = options.element.find('.--active');
                var activeItemId = activeItem.attr('id');
                var activeItemDataId = activeItemId.slice(-(activeItemId.length - activeItemId.indexOf('-') - 1));
                _tempActiveItem = getElementById(activeItemDataId);

                var activeItemObj = {
                    elem: activeItem,
                    id: activeItemId,
                    displayName: activeItem.text(),
                    object: _tempActiveItem
                }
                options.onAdd(activeItemObj);
                _tempActiveItem = null;
            }
        }
    });

    this.dataSource = {
        add: function (input) {
            console.log('----')
            console.log(_tempActiveItem)
            console.log(input)
            console.log('----')
        }
    }
}

var componentTreeView = new ComponentTreeView({
    element: $('#mytreeview'),
    data: cats,
    onAdd: function () {
        componentTreeView.dataSource.add({ name: 'Salam' })
    }
});