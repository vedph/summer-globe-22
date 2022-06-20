import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Entity } from '../models';

export enum SignalId {
  Nop,
  Pick,
};

/**
 * A generic signal.
 */
export interface Signal {
  id: SignalId;
  entity?: Entity;
  payload?: any;
}

@Injectable({
  providedIn: 'root',
})
export class SignalService {
  private _signal$: BehaviorSubject<Signal>;

  public get signal$(): Observable<Signal> {
    return this._signal$.asObservable();
  }

  constructor() {
    this._signal$ = new BehaviorSubject<Signal>({ id: SignalId.Nop });
  }

  public emit(signal: Signal): void {
    console.log('Signal: ' + signal.id);
    this._signal$.next(signal);
  }
}
