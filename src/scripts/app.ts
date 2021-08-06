export class Treeview {
    container: HTMLElement;
    dataSource: Array<any>;

    onSelected: () => void;

    constructor(data: Treeview) {
        Object.assign(this, data);
        this.container.appendChild(this.genTemplate());
        this.bindEvents();
    }

    genLi(data: any) {
        let prefix = this.container.id;
        let li = document.createElement('li');
        li.dataset.itemId = data.id;
        li.id = `${prefix}_${data.id}`;
        li.innerHTML = `<span>${data.title}</span><ul></ul>`;
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
                if (this.dataSource[i].pid == id) {
                    if (ul.parentElement) ul.parentElement.querySelector('span').classList.add('--has-items');
                    appendChilds(ul.appendChild(this.genLi(this.dataSource[i])).querySelector('ul'), this.dataSource[i].id);
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
            if (item) {
                item.getElementsByTagName('span')[0].classList.toggle('--opened');
                item.getElementsByTagName('ul')[0].classList.toggle('--opened');
            }
        });
    }

    addItem(item: any) {
        let prefix = this.container.id;
        let itemId = `${prefix}_${item.pid}`;
        let parent = this.container.querySelector('#' + itemId);
        parent.getElementsByTagName('ul')[0].appendChild(this.genLi(item));
        this.dataSource.push(item);
    }
}


var testData = <Array<any>>[
    { id: 9, pid: 0, title: 'Base' },
    { id: 1, pid: 9, title: 'Child' },
    { id: 2, pid: 9, title: 'Child' },
    { id: 3, pid: 9, title: 'Child' },
    { id: 4, pid: 1, title: 'VNUK' },
    { id: 5, pid: 2, title: 'VNUK' },
    { id: 6, pid: 3, title: 'VNUK' },
    { id: 7, pid: 3, title: 'VNUK' },
    { id: 8, pid: 1, title: 'VNUK' },
    { id: 11, pid: 4, title: 'VNUK' },
    { id: 12, pid: 4, title: 'VNUK' },
    { id: 13, pid: 4, title: 'VNUK' },
    { id: 14, pid: 4, title: 'VNUK' },
];

var treeViewComponent = new Treeview(<Treeview>{ container: document.getElementById('content'), dataSource: testData });

document.getElementById('addItem').addEventListener('click', () => {
    treeViewComponent.addItem({
        id: 16,
        pid: 2,
        title: 'Burhan'
    })
});