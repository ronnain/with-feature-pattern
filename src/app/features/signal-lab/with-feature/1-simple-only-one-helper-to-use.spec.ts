import {
  patchState,
  signalStore,
  SignalStoreFeature,
  signalStoreFeature,
  SignalStoreFeatureResult,
  withComputed,
  withFeature,
  withHooks,
  withMethods,
  withProps,
  withState,
} from '@ngrx/signals';
import { Book, FeatureOutput, OneParams, StoreInput } from './shared';
import {
  EntityMap,
  setAllEntities,
  withEntities,
} from '@ngrx/signals/entities';
import { computed, Signal } from '@angular/core';
import { expectTypeOf } from 'vitest';
import { TestBed } from '@angular/core/testing';
import {
  withBooksFilter1,
  withFeatureFactory,
} from './1-simple-only-one-helper-to-use';
import { Equal, Expect } from '../../../../../test-type';

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
    let booksArg!: Signal<Book[]>;
    type IsAny<T> = unknown extends T ? (T extends {} ? T : true) : false;
    type NotAny<T> = T extends IsAny<T> ? false : true;
    const BooksStore = signalStore(
      withEntities<Book>(),
      withBooksFilter1((store) => {
        type TestAny = Expect<Equal<NotAny<typeof store>, true>>;
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

  it('Should handle generic parameters from function that returned the feature', () => {
    // const withEntitySelected = withFeatureFactory2(
    //   <Entity>(entityMap: Signal<EntityMap<Entity>>) => {
    //     return signalStoreFeature(
    //       withState<{ selectedEntityId: string | number | null }>({
    //         selectedEntityId: null,
    //       }),
    //       withComputed(({ selectedEntityId }) => ({
    //         selectedEntity: computed(() => {
    //           const selectedId = selectedEntityId();
    //           return selectedId ? entityMap()[selectedId] : null;
    //         }),
    //       }))
    //     );
    //   }
    // );

    const withPropTyped = withFeatureFactory2((data) =>
      signalStoreFeature(
        withProps(() => ({
          myPropTyped: data,
        }))
      )
    );

    function withFeatureFactory2<InnerData, Returned>(
      feature: (data: NoInfer<InnerData>) => Returned
    ) {
      return <
        Input extends SignalStoreFeatureResult,
        Store extends StoreInput<Input>
      >(
        entries: (store: Store) => NoInfer<InnerData>
      ) =>
        // todo try to not use oneParams
        withFeature((store) =>
          //@ts-ignore
          feature(entries(store as Store))
        ) as Returned;
    }

    const test = withPropTyped(() => 42);

    type r = ReturnType<typeof test>;
    //.   ^?
    const BooksStore = signalStore(
      withEntities<Book>(),
      withPropTyped(() => 42)
    );
    TestBed.configureTestingModule({
      providers: [BooksStore],
    });
    const store = TestBed.inject(BooksStore);

    const selectedEntity = store.testInfer;
    const selectedEntity = store.myPropTyped;
    //.   ^?
    type ExpectSelectedEntityToBeBook = Expect<
      Equal<typeof selectedEntity, number>
    >;
  });
});
