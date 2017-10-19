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

function CreateItemAndSubItems(pid, data) {
    var docFragmentList = document.createDocumentFragment();

    for (var i = 0; i < data.length; i++) {
        if (data[i].pid == pid) {
            var li = document.createElement('li');
            li.textContent = data[i].name;
            li.id = data[i].id;

            docFragmentList.appendChild(li);
            var subItems = CreateItemAndSubItems(data[i].id, data);
            if (subItems) {
                var ul = document.createElement('ul');
                ul.appendChild(subItems);
                li.appendChild(ul);
            }
        }
    }
    return docFragmentList.childElementCount ? docFragmentList : null;
}

document.getElementById('mytreeview').appendChild(CreateItemAndSubItems(0, cats));