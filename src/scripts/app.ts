export class Treeview {
    properties: Properties;
    container: HTMLElement;
    dataSource: Array<any>;
    isOpenedDefault: boolean;
    isFoldersSelectable: boolean;
    onSelected: (data: any) => void;

    constructor(data: Treeview) {
        Object.assign(this, data);
        if (this.dataSource != null) this.container.appendChild(this.genTemplate());
        this.bindEvents();
        if (this.isOpenedDefault) {
            let lines = this.container.querySelectorAll('.--has-items');
            for (var i = 0; i < lines.length; i++) {
                lines[i].classList.add('--opened');
                lines[i].parentElement.getElementsByTagName('ul')[0].classList.add('--opened');
            }
        }
    }

    setDataSource(ds: Array<any>) {
        this.dataSource = ds;
        this.container.innerHTML = '';
        if (this.dataSource != null) this.container.appendChild(this.genTemplate());

        if (this.isOpenedDefault) {
            let lines = this.container.querySelectorAll('.--has-items');
            for (var i = 0; i < lines.length; i++) {
                lines[i].classList.add('--opened');
                lines[i].parentElement.getElementsByTagName('ul')[0].classList.add('--opened');
            }
        }
    }

    genLi(data: any) {
        let prefix = this.container.id;
        let li = document.createElement('li');
        li.dataset.itemId = data[this.properties.id];
        li.id = `${prefix}_${data[this.properties.id]}`;
        li.innerHTML = `<span>${data[this.properties.tittle]}</span><ul></ul>`;
        return li;
    }

    getElemById(id: string) {
        for (var i = 0; i < this.dataSource.length; i++) {
            if (this.dataSource[i][this.properties.id] == id) return this.dataSource[i];
        }
        return null;
    }

    genTemplate() {
        let template = document.createDocumentFragment();
        //������� �������
        let baseElem = document.createElement('ul');
        baseElem.className = 'treeview-component';
        template.appendChild(baseElem);

        let appendChilds = (ul: HTMLElement, id: number) => {
            let anyChilds = false;
            for (let i = 0; i < this.dataSource.length; i++) {
                anyChilds = true;
                if (this.dataSource[i][this.properties.pid] == id) {
                    if (ul.parentElement) ul.parentElement.querySelector('span').classList.add('--has-items');
                    appendChilds(ul.appendChild(this.genLi(this.dataSource[i])).querySelector('ul'), this.dataSource[i][this.properties.id]);
                }
            }
            if (!anyChilds) ul.closest('ul').classList.add('--has-items');

        }
        appendChilds(baseElem, 0);
        return template;
    }

    bindEvents() {
        this.container.addEventListener('click', (e) => {
            let target = <HTMLElement>e.target;
            let item = target.closest('li');
            let contains = item.getElementsByTagName('span')[0].classList.contains('--selected');;
            if (item) {
                this.clearClass('--selected');
                if (contains)
                    item.getElementsByTagName('span')[0].classList.remove('--selected');
                else {
                    if (item.getElementsByTagName('span')[0].classList.contains('--has-items') && !this.isFoldersSelectable) return;
                    item.getElementsByTagName('span')[0].classList.add('--selected');
                    this.onSelected && this.onSelected(this.getSelected());
                }
            }
        });

        this.container.addEventListener('dblclick', function (e) {
            let target = <HTMLElement>e.target;
            let item = target.closest('li');
            item.getElementsByTagName('span')[0].classList.toggle('--opened');
            item.getElementsByTagName('ul')[0].classList.toggle('--opened');
        });
    }

    funcCopyCut(item: any, mode: string) {
        let prefix = this.container.id;
        let itemId = `${prefix}_${item[this.properties.id]}`;
        let itemElem = this.container.querySelector('#' + itemId);
        let itemSpan = itemElem.getElementsByTagName('span')[0];
        let contains = itemSpan.classList.contains('--' + mode);

        this.clearClass('--selected');
        this.clearClass('--copy');
        this.clearClass('--cut');
        if (contains) itemSpan.classList.remove('--' + mode);
        else itemSpan.classList.add('--' + mode);
    }

    copy(item: any) { this.funcCopyCut(item, 'copy'); }
    cut(item: any) { this.funcCopyCut(item, 'cut'); }

    paste(itemTo: any) {
        let isCopy: boolean = false;
        let itemLi = this.container.querySelector('.--copy') == null ? null : this.container.querySelector('.--copy').closest('li');
        if (itemLi == null)
            itemLi = this.container.querySelector('.--cut') == null ? null : this.container.querySelector('.--cut').closest('li');
        else
            isCopy = true;

        if (itemLi == null) return;
        let item = this.getElemById(itemLi.dataset.itemId);


        
        let ulToPaste: HTMLElement = null;
        if (itemTo != null) {
            let prefix = this.container.id;
            let itemId = `${prefix}_${itemTo[this.properties.id]}`;
            ulToPaste = this.container.querySelector('#' + itemId).getElementsByTagName('ul')[0];
        }
        else {
            ulToPaste = this.container.getElementsByTagName('ul')[0];
        }

        if (!isCopy && this.isSubFolder(itemLi, ulToPaste.closest('li'))) {
            this.clearClass('--cut');
            this.clearClass('--copy');
            return <TreeviewOperationResult>{
                isSuccess: false,
                isCopy: isCopy,
                item: item,
                pasteTo: itemTo
            };
        }
        if (isCopy) {
            itemLi.dataset.itemId = '';
            itemLi.id = '';
            let subLiItems = itemLi.querySelectorAll('li');
            for (var i = 0; i < subLiItems.length; i++) {
                subLiItems[i].dataset.itemId = '';
                subLiItems[i].id = '';
            }
        }

        if (isCopy)
            ulToPaste.appendChild(itemLi.cloneNode(true));
        else
            ulToPaste.appendChild(itemLi);

        let spanTitle = ulToPaste.parentElement.getElementsByTagName('span');
        if (spanTitle) {
            spanTitle[0].classList.add('--has-items');
        }
        
        this.clearClass('--cut');
        this.clearClass('--copy');
        return <TreeviewOperationResult>{
            isSuccess: true,
            isCopy: isCopy,
            item: item,
            pasteTo: itemTo
        };;
    }

    getSelected() {
        let itemSelected = <HTMLElement>this.container.querySelector('.--selected');
        if (itemSelected == null) return null;
        let itemElem = itemSelected.closest('li');
        if (itemElem) {
            let itemElemIndex = itemElem.dataset.itemId;
            for (var i = 0; i < this.dataSource.length; i++) if (String(this.dataSource[i][this.properties.id]) == itemElemIndex) return this.dataSource[i];
        }
    }

    getSelectedParent() {
        let itemSelected = <HTMLElement>this.container.querySelector('.--selected');
        if (itemSelected == null) return null;
        let itemElemParent = itemSelected.closest('li').parentElement.closest('li');
        if (itemElemParent) {
            let itemElemIndex = itemElemParent.dataset.itemId;
            for (var i = 0; i < this.dataSource.length; i++) if (String(this.dataSource[i][this.properties.id]) == itemElemIndex) return this.dataSource[i];
        }
    }


    isSubFolder(parent: HTMLElement, child: HTMLElement) {
        if (parent == null || child == null) return false;
        let curElem: HTMLElement = child;
        while (!curElem.classList.contains('treeview-component')) {
            if (curElem.parentElement == parent) return true;
            else curElem = curElem.parentElement;
        }
        return false;
    }
    clearClass(className: string) {
        let selected = this.container.querySelectorAll('.' + className);
        for (var i = 0; i < selected.length; i++)
            selected[i].classList.remove(className);
    }

    addItem(item: any) {
        let prefix = this.container.id;
        let itemId = `${prefix}_${item[this.properties.pid]}`;
        let parent = this.container.querySelector('#' + itemId);
        parent.getElementsByTagName('ul')[0].appendChild(this.genLi(item));
        this.dataSource.push(item);
    }

    removeItem(item: any) {
        let prefix = this.container.id;
        let itemId = `${prefix}_${item[this.properties.id]}`;
        let itemElem = this.container.querySelector('#' + itemId);
        itemElem.remove();

        let itemIndex = -1;
        for (var i = 0; i < this.dataSource.length; i++) if (this.dataSource[i][this.properties.id] == item[this.properties.id]) itemIndex = i;
        if (itemIndex > -1) this.dataSource.splice(itemIndex, 1);
    }
}

export class Properties {
    id: string;
    pid: string;
    tittle: string;
}

export class TreeviewOperationResult {
    isSuccess: boolean;
    isCopy: boolean;
    item: any;
    pasteTo: any;
}

/*

var testData = <Array<any>>[
    { id: 9, pid: 0, title: 'Garage' },
    { id: 1, pid: 9, title: 'Mercedes' },
    { id: 2, pid: 9, title: 'BMW' },
    { id: 3, pid: 9, title: 'Mitsubishi' },
    { id: 4, pid: 1, title: 'C500' },
    { id: 5, pid: 1, title: 'C300' },
    { id: 6, pid: 1, title: 'E500' },

    { id: 7, pid: 2, title: 'M3' },
    { id: 8, pid: 2, title: 'M6' },
    { id: 11, pid: 2, title: 'X6' },

    { id: 12, pid: 3, title: 'Lancer' },
    { id: 13, pid: 3, title: 'Pajero' },
    { id: 14, pid: 3, title: 'Crub' },
];

var treeViewComponent = new Treeview(<Treeview>{
    properties: { id: 'id', pid: 'pid', tittle: 'title' },
    container: document.getElementById('content'),
    dataSource: testData,
    isOpenedDefault: true,
    isFoldersSelectable: true,
    onSelected: (selectedRow) => {
        console.log(selectedRow);
    }
});

document.getElementById('addItem').addEventListener('click', () => {
    treeViewComponent.addItem({
        id: 16,
        pid: 2,
        title: 'Burhan'
    })
});

document.getElementById('removeItem').addEventListener('click', () => {
    treeViewComponent.removeItem({
        id: 16,
        pid: 2,
        title: 'Burhan'
    })
});

document.getElementById('copy').addEventListener('click', () => {
    treeViewComponent.copy(treeViewComponent.getSelected());
});

document.getElementById('cut').addEventListener('click', () => {
    treeViewComponent.cut(treeViewComponent.getSelected());
});

document.getElementById('paste').addEventListener('click', () => {
    console.log(treeViewComponent.paste(treeViewComponent.getSelected()));
});

document.getElementById('isSub').addEventListener('click', () => {
    console.log(treeViewComponent.isSubFolder(document.getElementById('content_2'), document.getElementById('content_12')))
});
*/