import { Component } from '@angular/core';
import { Observable, Observer } from 'rxjs';
import { Person } from 'src/classes/person.class';
import { IEdge } from 'src/interfaces/edge.interface';
import { INode } from 'src/interfaces/node.interface';
import { IObject } from 'src/interfaces/object.interface';

import { SheetService } from 'src/services/sheet.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent {
  title = 'arbre-genealogique';

  constructor(private sheetService: SheetService) {
    this.currentGraph = [];
  }

  families: string[] = ['vert', 'jaune', 'rouge', 'orange', 'bleu'];
  selectedFamily: string = '';
  edges: IEdge[] = [];
  nodes: INode[] = [];
  autoZoom: boolean = true;
  autoCenter: boolean = true;

  sheetData: any;
  sheetTables: any;
  currentGraph: Person[];

  // personnalisation de l'affichage des arbres
  layoutSettings = { orientation: 'TB' };
  API_KEY = 'AIzaSyCr92YBtcleWmayijkhhmHb2RCWgT_n_oU';

  ngOnInit() {
    var sheet = this.sheetService.getSheet();
    this.sheetData = sheet.subscribe((data) => {
      var parser = new DOMParser();
      var parsed = parser.parseFromString(data, 'text/html');
      let body = parsed.body;

      this.extractFamilyTables(body);
    });
  }

  extractFamilyTables(htmlBody: Element) {
    this.sheetTables = this.sheetService.getTable([htmlBody], [], []);
    this.sheetData.unsubscribe();
  }

  getFamilyClassConditions(family: string) {
    return {
      'nom-famille-vert': family === 'vert',
      'nom-famille-jaune': family === 'jaune',
      'nom-famille-rouge': family === 'rouge',
      'nom-famille-orange': family === 'orange',
      'nom-famille-bleu': family === 'bleu',
    };
  }

  getFamilyBtnClass(family: string) {
    return {
      'btn-vert': family === 'vert',
      'btn-jaune': family === 'jaune',
      'btn-rouge': family === 'rouge',
      'btn-orange': family === 'orange',
      'btn-bleu': family === 'bleu',
    };
  }

  buildFamilyGraph(family: string) {
    this.selectedFamily = family;

    const familyNumbersCorrespondance: IObject = {
      vert: 0,
      jaune: 1,
      rouge: 2,
      orange: 3,
      bleu: 4,
    };

    const familyNb = familyNumbersCorrespondance[family];
    const familyTable = this.sheetTables[familyNb];

    let rows = this.sheetService.getRows(familyTable);
    this.currentGraph = this.sheetService.getFamilyGraph(family, rows);
    this.defineNodesAndEdges(this.currentGraph, [], [], []);
  }

  defineNodesAndEdges(
    openNodes: Array<Person>,
    closedNodes: Array<INode>,
    graphNodes: INode[],
    graphEdges: IEdge[]
  ): void {
    if (openNodes.length === 0) {
      // console.log(graphNodes);
      // console.log(graphEdges);
      this.nodes = graphNodes;
      this.edges = graphEdges;
      return;
    } else {
      let currentNode: Person = openNodes[0];
      let formatedNode: INode = this.createNode(currentNode);

      openNodes = openNodes.slice(1);
      closedNodes.push(formatedNode);
      graphNodes.push(formatedNode);

      currentNode.children.forEach((child: Person) => {
        openNodes.push(child);
        graphEdges.push(this.createEdge(currentNode, child));
      });

      return this.defineNodesAndEdges(
        openNodes,
        closedNodes,
        graphNodes,
        graphEdges
      );
    }
  }

  createNode(person: Person): INode {
    return { id: String(person.id), label: person.name };
  }

  createEdge(parent: Person, child: Person): IEdge {
    return { source: String(parent.id), target: String(child.id) };
  }

  getNodesColor() {
    const nodeColors: IObject = {
      vert: '#00aa24',
      jaune: '#fede00',
      rouge: '#e71837',
      orange: '#f38407',
      bleu: '#1695ff',
    };

    return nodeColors[this.selectedFamily];
  }

  getFamilyTitle(family: string) {
    const familyTitles: IObject = {
      vert: 'Onéveronéfier',
      jaune: 'Ricard/20',
      rouge: 'Rougesaigner',
      orange: 'Orangeonrage',
      bleu: 'bloubloubloub',
    };

    return familyTitles[family];
  }
}
