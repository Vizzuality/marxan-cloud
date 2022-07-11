import { Injectable } from '@nestjs/common';
import { ICommand, ofType, Saga } from '@nestjs/cqrs';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { UserLoggedIn } from '../authentication/user-logged-in.event';
import { GarbageCollectAsyncJobs } from './garbage-collect-async-jobs.command';

@Injectable()
export class UserLoggedInSaga {
  @Saga()
  userLoggedInSaga = (events$: Observable<any>): Observable<ICommand> =>
    events$.pipe(
      ofType(UserLoggedIn),
      map((event) => new GarbageCollectAsyncJobs(event.userId)),
    );
}
