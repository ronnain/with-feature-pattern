import { computed, Signal } from '@angular/core';
import {
  patchState,
  signalStore,
  SignalStoreFeature,
  signalStoreFeature,
  SignalStoreFeatureResult,
  withComputed,
  withMethods,
  withProps,
  withState,
} from '@ngrx/signals';
import {
  Book,
  featureFactory,
  FeatureOutput,
  OneParams,
  StoreInput,
} from './shared';

// ! Only accept one parameter
const filterBooksFeature = (books: Signal<Book[]>) =>
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
  );

export function withBooksFilter2<
  Input extends SignalStoreFeatureResult,
  Store extends StoreInput<Input>
>(
  featureConfigFactory: (store: Store) => OneParams<typeof filterBooksFeature>
): FeatureOutput<Input, typeof filterBooksFeature> {
  return featureFactory(featureConfigFactory, filterBooksFeature);
}

const filterBooksFeatureGeneric = <Entity extends { name: string }>(
  books: Signal<Entity[]>
) =>
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
  );

export const withInnerGeneric =
  <Feature extends (data: any) => SignalStoreFeature>(feature: Feature) =>
  <Input extends SignalStoreFeatureResult, Store extends StoreInput<Input>>(
    featureConfigFactory: (store: Store) => OneParams<Feature>
  ): FeatureOutput<Input, Feature> => {
    return featureFactory(featureConfigFactory, feature) as FeatureOutput<
      Input,
      Feature
    >;
  };

export function withGenericBis<
  Feature extends (data: any) => SignalStoreFeature
>(data: Feature) {
  return withInnerGeneric<Feature>(data);
}

export const withBooksFilterGeneric = withGenericBis(
  <Entity extends { name: string }>(books: Signal<Entity[]>) =>
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

const withBasicTest = withGenericBis(
  ({ numbers }: { numbers: Signal<number[]> }) =>
    signalStoreFeature(
      withComputed(() => ({
        numbersFiltered: computed(() => numbers().filter((n) => n > 10)),
      }))
    )
);

const test = signalStore(
  withState({
    myPropTyped: [] as { name: string }[],
    numbersToShow: [1, 2, 3, 4, 5],
  }),
  withBooksFilterGeneric((store) => store.myPropTyped),
  withBasicTest(({ numbersToShow }) => ({ numbers: numbersToShow }))
);

const result = new test();
result.filteredBooks;
result.numbersFiltered;
