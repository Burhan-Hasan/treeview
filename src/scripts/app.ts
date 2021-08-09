export class Treeview {
    properties: Properties;
    container: HTMLElement;
    dataSource: Array<any>;
    isOpenedDefault: boolean;
    onSelected: (data: any) => void;

    constructor(data: Treeview) {
        Object.assign(this, data);
        this.container.appendChild(this.genTemplate());
        this.bindEvents();
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

    genTemplate() {
        let template = document.createDocumentFragment();
        //Базовый элемент
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


        let prefix = this.container.id;
        let itemId = `${prefix}_${itemTo[this.properties.id]}`;
        let itemLiToPaste = this.container.querySelector('#' + itemId);
        if (isCopy) {
            itemLiToPaste.getElementsByTagName('ul')[0].appendChild(itemLi.cloneNode(true));
        }
        else
            itemLiToPaste.getElementsByTagName('ul')[0].appendChild(itemLi);


        itemLiToPaste.getElementsByTagName('span')[0].classList.add('--has-items');
        this.clearClass('--cut');
        this.clearClass('--copy');
    }

    getSelected() {
        let itemElem = <HTMLElement>this.container.querySelector('.--selected').closest('li');
        if (itemElem) {
            let itemElemIndex = itemElem.dataset.itemId;
            for (var i = 0; i < this.dataSource.length; i++) if (String(this.dataSource[i][this.properties.id]) == itemElemIndex) return this.dataSource[i];
        }
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
    container: document.getElementById('content'),
    dataSource: testData,
    isOpenedDefault: true,
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
    treeViewComponent.paste(treeViewComponent.getSelected());
});

*/