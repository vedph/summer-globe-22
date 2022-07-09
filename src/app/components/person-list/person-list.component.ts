import { Component, OnInit, Input } from '@angular/core';
import { Entity, RdfTerm } from 'src/app/models';
import { PersonService, PersonInfo } from 'src/app/services/person.service';
import { RealiaService } from 'src/app/services/realia.service';
import { FormGroup, FormControl, FormBuilder } from '@angular/forms';
import { AssetService } from 'src/app/services/asset.service';
import { take } from 'rxjs/operators';
import { SignalId, SignalService } from 'src/app/services/signal.service';

@Component({
  selector: 'app-person-list',
  templateUrl: './person-list.component.html',
  styleUrls: ['./person-list.component.css'],
})
export class PersonListComponent implements OnInit {
  private _langMap: Map<string, string> | undefined;

  @Input()
  public entities: Entity[] | undefined;

  public selectedEntity: Entity | undefined;
  public infoExpanded: boolean | undefined;
  public lastQuery: string | undefined;
  public info: PersonInfo | null;
  public languages: string[] | undefined;
  public language: FormControl<string | null>;
  public form: FormGroup;
  public selectedAbstract: string | undefined;

  public busy: boolean | undefined;

  constructor(
    formBuilder: FormBuilder,
    private _personService: PersonService,
    private _realiaService: RealiaService,
    private _signalService: SignalService,
    assetService: AssetService
  ) {
    this.info = null;
    this.language = formBuilder.control(null);
    this.form = formBuilder.group({
      language: this.language,
    });
    assetService
      .loadIsoCodes()
      .pipe(take(1))
      .subscribe((map) => {
        this._langMap = map;
      });
  }

  public getLangName(code: string): string {
    const name = this._langMap?.get(code);
    return name ? name : code;
  }

  ngOnInit(): void {
    this.language.valueChanges.subscribe((_) => {
      if (this.languages && this.info?.abstracts) {
        const i = this.languages.findIndex((l) => {
          return this.language.value === l;
        });
        this.selectedAbstract = this.info.abstracts[i].value;
      }
    });
    this._signalService.signal$.subscribe((signal) => {
      switch (signal.id) {
        case SignalId.Pick:
          if (signal.entity) {
            this.selectEntity(signal.entity);
          }
          break;
      }
    });
  }

  public selectEntity(entity: Entity) {
    this.selectedEntity = entity;
    if (this.info?.uri === entity.uri) {
      this.infoExpanded = true;
      return;
    }

    const id = this._realiaService.getIdFromUri(entity.uri);

    this.lastQuery = this._personService.buildQuery(id);

    this.busy = true;
    this._personService.getInfo(id).subscribe({
      next: (i) => {
        this.busy = false;
        if (i) {
          this.info = i;
          this.languages = this._realiaService.getLanguages(i.abstracts);
          this.selectedAbstract = undefined;
          this.infoExpanded = true;
          if (this.languages.length) {
            if (this.languages.find((l) => l === 'en')) {
              this.language.setValue('en');
            } else {
              this.language.setValue(this.languages[0]);
            }
          }
        }
      },
      error: (error) => {
        this.busy = false;
        console.error('Error querying for ' + entity.uri);
        console.error(error);
      },
    });
  }

  public getYear(date: string): number {
    const m = /^([0-9]+)/.exec(date);
    return m ? parseInt(m[1], 10) : 0;
  }

  public getIdFromUri(uri: string): string {
    return this._realiaService.getIdFromUri(uri);
  }

  public getAge(birthDate?: RdfTerm, deathDate?: RdfTerm) {
    if (!birthDate || !deathDate) {
      return 0;
    }
    return this.getYear(deathDate.value) - this.getYear(birthDate.value);
  }
}
