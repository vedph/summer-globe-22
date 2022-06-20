import {
  Component,
  Input,
  OnInit,
  Output,
  EventEmitter,
  ViewChild,
  ElementRef,
  AfterViewInit,
  ViewEncapsulation,
} from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Signal, SignalId, SignalService } from 'src/app/services/signal.service';
import { Entity } from '../../models';

@Component({
  selector: 'app-html-text',
  templateUrl: './html-text.component.html',
  styleUrls: ['./html-text.component.css'],
  encapsulation: ViewEncapsulation.None,
})
export class HtmlTextComponent implements OnInit, AfterViewInit {
  private _html$: BehaviorSubject<string>;

  @ViewChild('textEl', { static: true })
  public textRef: ElementRef | undefined;

  @Input()
  public get html(): string {
    return this._html$.value;
  }
  public set html(value: string) {
    this._html$.next(value);
  }

  @Output()
  public entityPick: EventEmitter<Entity>;

  constructor(private _signalService: SignalService) {
    this.entityPick = new EventEmitter<Entity>();
    this._html$ = new BehaviorSubject<string>('');
  }

  ngOnInit(): void {
    // handle signals
    this._signalService.signal$.subscribe(signal => {
      if (!this.textRef) {
        return;
      }
      const el = this.textRef.nativeElement as HTMLElement;
      switch (signal.id) {
        case SignalId.Pick:
          el.querySelectorAll('a').forEach((e) => {
            e.className = '';
          });
          const uri = signal.entity?.uri;
          if (!uri) {
            return;
          }
          el.querySelectorAll(`a[href*="${uri}"]`).forEach((e) => {
            e.className = 'hilite';
          });
          el.querySelector(`a[href*="${uri}"]`)?.scrollIntoView();
          break;
      }
    });

    // handle html change
    this._html$.subscribe(() => {
      setTimeout(() => {
        this.bindAnchors(this.textRef?.nativeElement);
      }, 300);
    });
  }

  ngAfterViewInit(): void {
    this._html$.next(this._html$.value);
  }

  private bindAnchors(element: HTMLElement): void {
    if (!element) {
      return;
    }

    // https://stackoverflow.com/questions/37676726/angular-2-innerhtml-click-binding/37676847#37676847
    // https://stackoverflow.com/questions/52821330/how-to-set-html-content-in-the-elementref-nativeeelement
    element.querySelectorAll('a').forEach((e) => {
      const href = e.getAttribute('href');
      if (href && !href.startsWith('#')) {
        e.addEventListener('click', this.handleLink.bind(this));
      }
    });
  }

  private handleLink(event: any): void {
    event.preventDefault();
    const href: string = event.target.getAttribute('href');
    console.log(href);
    const i = href.indexOf(':');
    if (i === -1) {
      return;
    }
    const entity: Entity = {
      type: href.substring(0, i),
      uri: href.substring(i + 1),
    };
    this.entityPick.emit(entity);
  }
}
