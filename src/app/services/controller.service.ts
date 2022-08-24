import { DatePipe } from '@angular/common';
import { ElementRef, Injectable } from '@angular/core';
import { easepick, LockPlugin, PresetPlugin, RangePlugin } from '@easepick/bundle';
import * as moment from 'moment';
@Injectable({
  providedIn: 'root',
})
export class ControllerService {
  readonly DATEPIPE_FORMAT = 'dd-MM-YYYY h:mm:ss a'; //h:mm:ss a
  readonly MOMENT_FORMAT = 'DD-MM-YYYY h:mm:ss a';

  constructor(private datepie: DatePipe) {}

  /** Date Utility */
  dateTransform(date: Date) {
    return this.datepie.transform(date, this.DATEPIPE_FORMAT);
  }
  dateFormat(date: string) {
    return moment(date, this.MOMENT_FORMAT).toDate();
  }
  /** Nested Tree */
  traverse(data: any) {
    const tree: any = [];
    const treeObj = [tree];
    data.forEach(
      (a: any, i: any, aa: any) => {
        let lastDepth = (aa[i - 1] || {}).depth,
          o;
        if (a.depth !== 0 && a.depth > lastDepth) {
          o = treeObj[lastDepth][treeObj[lastDepth].length - 1];
          o.children = o.children || [];
          treeObj[a.depth] = o.children;
        }
        treeObj[a.depth].push({
          id: a.id,
          name: a.title,
          children: [],
          depth: a.depth,
        });
      },
      [tree]
    );
    return tree;
  }
  createSublist(container: any, args: any) {
    const ul = document.createElement('ul');
    for (let j = 0; j < args.length; j++) {
      const row = args[j];
      const li = document.createElement('li');
      li.innerText = row.name;
      const nodes = row.children;
      if (nodes && nodes.length) {
        this.createSublist(li, nodes);
      }
      ul.appendChild(li);
    }
    container.appendChild(ul);
  }
  pathTo(array: any, target: any) {
    let result: any;
    array.some((a: any) => {
      if (a.id === target) {
        return (result = a.name);
      }
      const temp = this.pathTo(a.children, target);
      if (temp) {
        return (result = a.name + '/' + temp);
      }
    });
    return result;
  }

  /** Utility */
  randomString(length: number, character?: string): string {
    let result = '';
    const characters = character
      ? character
      : 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
  }
  randomInt(min: number, max: number) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
  areDistinct(arr: any[]) {
    const n = arr.length;

    // Put all array elements in a map
    const s = new Set();
    for (let i = 0; i < n; i++) {
      s.add(arr[i]);
    }

    // If all elements are distinct, size of
    // set should be same array.
    return s.size == arr.length;
  }
  isEmptyOrSpaces(str: any) {
    return str === null || str.match(/^ *$/) !== null;
  }
  isEmptyID(str: any) {
    return str == null || str.match(/^$|^-1$/) !== null;
  }
  round(value: any) {
    return Number(Math.round((value + 'e2') as any));
  }
  easePick(ref:ElementRef) {
    return new easepick.create({
      element: ref.nativeElement,
      css: [
        'https://cdn.jsdelivr.net/npm/@easepick/bundle@1.2.0/dist/index.css',
      ],
      // css:[''],
      format: 'DD-MM-YYYY',
      plugins: [RangePlugin, LockPlugin, PresetPlugin],
      zIndex: 1000,
      inline: true,
      autoApply: false,

      RangePlugin: {
        tooltip: true,
        delimiter: ' -> ',
      },
    });
  }

  /** Images */
  setDefaultImageURL(event: any) {
    event.target.src = 'assets/img/def-stock.jpg';
  }

  /** IO */
  readImage(src: any) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = src;
    });
  }
  readFile(f: any) {
    return new Promise<any>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(f);
    });
  }
}
