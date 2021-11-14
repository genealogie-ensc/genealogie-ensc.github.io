export class Person {
  name: string;
  id: number;
  static globalId: number = 1;
  private tableCell: any;
  children: Person[];
  private lignesRestantes: Element[];

  constructor(
    descendantsRestants: HTMLTableCellElement[],
    lignesRestantes: Element[]
  ) {
    this.tableCell = descendantsRestants[0];
    this.name = this.tableCell ? this.tableCell.innerText : '';
    this.children = [];

    // incrémentation de l'id
    this.id = Person.globalId;
    Person.globalId++;

    let lignesApresTraitement = this.defineChildren(
      descendantsRestants.slice(1),
      lignesRestantes
    );

    this.lignesRestantes = lignesApresTraitement;
  }

  static createPerson(
    descendantsRestants: HTMLTableCellElement[],
    lignesRestantes: Element[]
  ): {
    newPerson: Person;
    lignesRestantes: Element[];
  } {
    let newPerson = new Person(descendantsRestants, lignesRestantes);
    return { newPerson, lignesRestantes: newPerson.lignesRestantes };
  }

  static createParentElement(nomFamille: string, graph: Person[]): Person {
    let parentElem = new Person([], []);

    parentElem.id = 0;
    parentElem.name = nomFamille;
    parentElem.children = graph;

    return parentElem;
  }

  defineChildren(
    descendantsRestants: HTMLTableCellElement[],
    lignesRestantes: Element[]
  ) {
    // si il n'y a plus d'enfants
    if (descendantsRestants.length === 0) {
      return lignesRestantes;
    } else {
      let child1 = descendantsRestants[0];
      let createPersonResult;

      if (this.childIsValid(child1)) {
        createPersonResult = Person.createPerson(
          descendantsRestants,
          lignesRestantes
        );

        lignesRestantes = createPersonResult.lignesRestantes;
        this.children.push(createPersonResult.newPerson);
      } else {
        return lignesRestantes;
      }

      if (this.hasTwoChildren(descendantsRestants)) {
        // la prochaine ligne du tableau appartient à la même lignée
        let deuxiemeLignee: HTMLTableCellElement[] = this.extractCells(
          lignesRestantes[0]
        );
        lignesRestantes = lignesRestantes.slice(1);

        // ajout du deuxième enfant
        createPersonResult = Person.createPerson(
          deuxiemeLignee,
          lignesRestantes
        );
        lignesRestantes = createPersonResult.lignesRestantes;
        this.children.push(createPersonResult.newPerson);
      }
    }

    // on fait remonter les lignes restantes après la création récursive
    // de tous les individus
    return lignesRestantes;
  }

  hasTwoChildren(descendants: HTMLTableCellElement[]) {
    if (this.isLastChild(descendants)) {
      return false;
    } else {
      let currentRowSpan = Number(this.tableCell.rowSpan);
      let childRowSpan = descendants[0].rowSpan
        ? Number(descendants[0].rowSpan)
        : 1;

      if (currentRowSpan > childRowSpan) {
        return true;
      } else {
        return false;
      }
    }
  }

  childIsValid(child: HTMLTableCellElement) {
    if (child) {
      let childName = child.innerText;
      return childName && childName !== '';
    } else {
      return false;
    }
  }

  private extractCells(tableLine: Element): HTMLTableCellElement[] {
    return Array.prototype.slice.call(tableLine.children, 1);
  }

  isLastChild(descendants: Array<any>): boolean {
    return descendants.length === 0;
  }
}
