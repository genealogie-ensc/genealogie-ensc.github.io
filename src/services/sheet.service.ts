import { Injectable } from '@angular/core';

import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Person } from 'src/classes/person.class';
import { IObject } from 'src/interfaces/object.interface';

@Injectable({
  providedIn: 'root',
})
export class SheetService {
  sheetUrl =
    'https://docs.google.com/spreadsheets/d/e/2PACX-1vTEogEeqRuNCXVJl9dCnGNppq2hwcAbClTt5tiOZ_zBxQtMAHZISS-CwBqepcp3xg/pubhtml';

  sheetId = '18x2PqpFsSjieyUiTN0scc71G2y7kUlH1';
  workSheetName = 'Vert';

  constructor(private http: HttpClient) {}

  getSheet(): Observable<any> {
    return this.http.get(this.sheetUrl, { responseType: 'text' });
  }

  parseHtml(html: string): Document {
    var parser = new DOMParser();
    return parser.parseFromString(html, 'text/html');
  }

  /**
   * Recherche récursivement l'élément <table> à partir d'une liste d'éléments
   * ouverts passés en entrée.
   * Le mode de recherche est un algorithme de Dijkstra.
   * @param openElements liste des Elements html ouverts et donc à explorer
   * @param closedElements liste des Elements html fermés
   * @returns
   */
  getTable(
    openElements: Element[],
    closedElements: Element[],
    tablesFound: Array<any>
  ): any {
    let targetElement: Element = openElements[0];

    if (tablesFound.length === 5) {
      return tablesFound;
    } else {
      if (targetElement.tagName === 'TABLE') {
        tablesFound.push(targetElement);
      }
      // on met le noeud actuel dans les fermés
      let elementIsClosed = closedElements
        .map((elem) => elem.id)
        .includes(targetElement.id);

      let elementToClose: Element | undefined = openElements.shift();
      if (elementToClose && !elementIsClosed) {
        closedElements.push(elementToClose);
      }

      // ajout des prochains noeuds dans les ouverts
      let children = targetElement.children;
      for (let indexChild = 0; indexChild < children.length; indexChild++) {
        let child = children[indexChild];
        openElements.push(child);
      }

      return this.getTable(openElements, closedElements, tablesFound);
    }
  }

  getRows(table: Element): Element[] {
    // récupération du body du tableau
    var tableBody: Element;
    for (let indexChild = 0; indexChild < table.children.length; indexChild++) {
      let tableChild: Element = table.children[indexChild];

      if (tableChild.tagName === 'TBODY') {
        tableBody = tableChild;
        let rows: Element[] = Array.prototype.slice.call(tableBody.children);
        rows.shift();

        return rows;
      }
    }

    return [];
  }

  private extractCells(tableLine: Element): HTMLTableCellElement[] {
    return Array.prototype.slice
      .call(tableLine.children, 1)
      .filter((cell: HTMLTableCellElement) => Boolean(cell.innerText));
  }

  getFamilyGraph(family: string, rows: Element[]) {
    console.log('getFamily graph');
    let graph: Person[] = [];

    let indexLines = 0; // index de la première ligne à considérer pour une lignée
    let linesAreRemaining = true;

    while (linesAreRemaining) {
      let oldestPersonLine = rows[indexLines];
      let rowSpan = this.getFirstPersonRowSpan(oldestPersonLine);
      let linesLignee = rows.slice(indexLines + 1, indexLines + rowSpan);

      let casesLignee = this.extractCells(oldestPersonLine);

      graph.push(Person.createPerson(casesLignee, linesLignee).newPerson);

      indexLines += rowSpan; // incrément de l'index pour sélectionner la prochaine lignée
      linesAreRemaining = indexLines !== rows.length;
    }

    const familyParentNodeNames: IObject = {
      vert: 'Famille Verte',
      jaune: 'Famille Jaune',
      rouge: 'Famille Rouge',
      orange: 'Famille Orange',
      bleu: 'Famille Bleue',
    };

    let fullGraph = Person.createParentElement(
      familyParentNodeNames[family],
      graph
    );
    console.log({ graph });
    return [fullGraph];
  }

  getFirstPersonRowSpan(ligne: Element): number {
    let firstElement: any = ligne.children[1];
    let rowSpan = firstElement.rowSpan;
    return rowSpan ? Number(rowSpan) : 1;
  }
}
