import {
  patchState,
  signalStore,
  signalStoreFeature,
  withComputed,
  withHooks,
  withMethods,
  withState,
} from '@ngrx/signals';
import { Book } from './shared';
import { setAllEntities, withEntities } from '@ngrx/signals/entities';
import { computed, Signal } from '@angular/core';
import { expectTypeOf } from 'vitest';
import { TestBed } from '@angular/core/testing';
import {
  withBooksFilter1,
  withFeatureFactory,
} from './1-simple-only-one-helper-to-use';

describe('withBooksFilter1', () => {
  it('should filter books by query', () => {
    const BooksStore = signalStore(
      withEntities<Book>(),
      withBooksFilter1(({ entities }) => entities),
      withHooks((store) => ({
        onInit: () => {
          patchState(
            store,
            setAllEntities([
              { id: '1', name: 'Angular Basics', author: 'John Doe' },
              { id: '2', name: 'React Basics', author: 'Jane Doe' },
            ])
          );
        },
      }))
    );
    TestBed.configureTestingModule({
      providers: [BooksStore],
    });
    const store = TestBed.inject(BooksStore);

    expect(store.filteredBooks()).toEqual(store.entities());

    store.setQuery('Angular');
    const filteredBooks = store.filteredBooks();
    expect(filteredBooks).toEqual([
      { id: '1', name: 'Angular Basics', author: 'John Doe' },
    ]);
  });

  it('Should be typed', () => {
    const BooksStore = signalStore(
      withEntities<Book>(),
      withBooksFilter1((store) => {
        expectTypeOf(store.entities).toEqualTypeOf<Signal<Book[]>>();
        return store.entities;
      })
    );

    const store = new BooksStore();

    expectTypeOf(store.filteredBooks).toEqualTypeOf<Signal<Book[]>>();
    expectTypeOf(store.setQuery).toEqualTypeOf<(query: string) => void>();
    expectTypeOf(store.entities).toEqualTypeOf<Signal<Book[]>>();
  });

  it('should not allow to pass several parameters to the custom feature', () => {
    let error = undefined;
    try {
      const withBooksFilter = withFeatureFactory(
        //@ts-expect-error withFeatureFactory accepts a function with only one parameter
        (books: Signal<Book[]>, arg2: boolean) =>
          signalStoreFeature(
            withState({ query: '' }),
            withComputed((store) => ({
              filteredBooks: computed(() =>
                books().filter((b) => b.name.includes(store.query()))
              ),
            })),
            withMethods((store) => ({
              setQuery(query: string): void {
                patchState(store, { query });
              },
            }))
          )
      );
    } catch (featureError) {
      error = featureError;
    }
    expect(error).toBeDefined();
  });
});
