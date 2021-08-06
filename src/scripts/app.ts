export class Treeview {
    container: HTMLElement;
    dataSource: Array<any>;
    constructor(data: Treeview) {
        Object.assign(this, data);
        this.container.appendChild(this.genTemplate());
    }

    genTemplate() {
        let prefix = this.container.id;
        let genLi = function (data: any) {
            let li = document.createElement('li');
            li.dataset.itemId = data.id;
            li.innerHTML = `<span>${data.title}</span><ul></ul>`;
            return li;
        }

        let template = document.createDocumentFragment();

        //Базовый элемент
        let baseElem = document.createElement('ul');
        baseElem.className = 'treeview-component';
        template.appendChild(baseElem);

        let appendChilds = (ul: HTMLElement, id: number) => {
            for (let i = 0; i < this.dataSource.length; i++) {
                if (this.dataSource[i].pid == id) {
                    if (ul.parentElement) ul.parentElement.querySelector('span').className = '--has-items';
                    appendChilds(ul.appendChild(genLi(this.dataSource[i])).querySelector('ul'), this.dataSource[i].id);
                }
            }
        }
        appendChilds(baseElem, 0);
        return template;
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
    { id: 8, pid: 1, title: 'VNUK' }
];

new Treeview(<Treeview>{ container: document.getElementById('content'), dataSource: testData })