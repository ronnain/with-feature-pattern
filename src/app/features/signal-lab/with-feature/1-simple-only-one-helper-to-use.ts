import {
  patchState,
  signalStoreFeature,
  SignalStoreFeature,
  SignalStoreFeatureResult,
  withComputed,
  withFeature,
  withMethods,
  withState,
} from '@ngrx/signals';
import { Book, FeatureOutput, OneParams, StoreInput } from './shared';
import { computed, Signal } from '@angular/core';

export function withFeatureFactory<
  Feature extends (data: any) => SignalStoreFeature
>(feature: Feature) {
  if (feature.length > 1) {
    throw new Error(
      `withFeatureFactory only supports functions with exactly one parameter. Got ${feature.length}.\n` +
        `If you need to pass multiple values, wrap them in a single object:\n\n` +
        `// ✅ Good:\n` +
        `withFeatureFactory(({ signalA, signalB }) => ...)\n\n` +
        `// ❌ Not allowed:\n` +
        `withFeatureFactory((signalA, signalB) => ...)`
    );
  }

  return <
    Input extends SignalStoreFeatureResult,
    Store extends StoreInput<Input>
  >(
    entries: (store: Store) => OneParams<Feature>
  ) =>
    withFeature((store) => feature(entries(store as Store))) as FeatureOutput<
      Input,
      Feature
    >;
}

// ! This technique only accepts one parameter
export const withBooksFilter1 = withFeatureFactory((books: Signal<Book[]>) =>
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
