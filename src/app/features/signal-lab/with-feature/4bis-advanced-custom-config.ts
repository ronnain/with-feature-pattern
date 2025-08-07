import { Signal, computed } from '@angular/core';
import {
  EmptyFeatureResult,
  patchState,
  Prettify,
  signalStore,
  signalStoreFeature,
  SignalStoreFeature,
  SignalStoreFeatureResult,
  StateSignals,
  withComputed,
  withMethods,
  withProps,
  withState,
  WritableStateSource,
} from '@ngrx/signals';
import {
  StoreInput,
  Book,
  GetMatchedPaths,
  FeatureOutput,
  OneParams,
} from './shared';
import { EntityMap, withEntities } from '@ngrx/signals/entities';

type FeatureOutputFromConfig<
  Input extends SignalStoreFeatureResult,
  Feature extends SignalStoreFeature
> = Feature extends SignalStoreFeature<infer ResultInput, infer ResultOutput>
  ? SignalStoreFeature<Input, ResultOutput>
  : never;

export function withBooksFilter4bis<
  Input extends SignalStoreFeatureResult,
  Output extends SignalStoreFeatureResult
>(
  config: (
    store: Prettify<
      StateSignals<Input['state']> &
        Input['props'] &
        Input['methods'] &
        WritableStateSource<Input['state']>
    >
  ) => Output
): SignalStoreFeature<Input, Output> {
  return config as unknown as SignalStoreFeature<Input, Output>;
}

export function fSelector<CustomType>(customType: CustomType) {
  const feature = signalStoreFeature(
    withProps(() => ({ query: null as CustomType | null }))
  );
  type Re = typeof feature extends SignalStoreFeature<
    EmptyFeatureResult,
    infer Output
  >
    ? Output
    : never;
  return feature as unknown as Re;
}
const dzdz = fSelector(3);

const test4w = signalStore(
  withProps(() => ({
    customType: ' 3',
  })),
  withBooksFilter4bis((store) => fSelector(store.customType))
);
const r = new test4w();
const rr = r.query;

///////////```
// todo faire un test pour réusir à récupérer en une fois

// 👇 test pour générer withBooksFilter4bis2 & fSelector2 depuis une fonction const {..} = myCystimFin

function createGenericFeature<
  Feature extends (data: any) => SignalStoreFeatureResult
>(feature: Feature) {
  return {
    selector: feature,
    withFeature<
      Input extends SignalStoreFeatureResult,
      Output extends SignalStoreFeatureResult
    >(
      config: (
        store: Prettify<
          StateSignals<Input['state']> &
            Input['props'] &
            Input['methods'] &
            WritableStateSource<Input['state']>
        >
      ) => Output
    ): SignalStoreFeature<Input, Output> {
      return config as unknown as SignalStoreFeature<Input, Output>;
    },
  };
}

function toSignalStoreFeatureResult<Feature extends SignalStoreFeature>(
  feature: Feature
) {
  type Re = typeof feature extends SignalStoreFeature<
    EmptyFeatureResult,
    infer Output
  >
    ? Output
    : never;
  return feature as unknown as Re;
}

const { selector: testGS, withFeature: withFT } = createGenericFeature(
  <CustomType>(customType: CustomType) =>
    toSignalStoreFeatureResult(
      signalStoreFeature(withProps(() => ({ query: customType })))
    )
);
const tg = testGS('nu');

const test4w2 = signalStore(
  withProps(() => ({
    customType1: '2',
    customType2: '3',
  })),
  withFT((store) => testGS(store.customType1))
);
const ree = new test4w2();
const rre = ree.query;

const { selector: selectedEntitySelector, withFeature: withSelectedEntity } =
  createGenericFeature(<Entity>(entityMap: Signal<EntityMap<Entity>>) =>
    toSignalStoreFeatureResult(
      signalStoreFeature(
        withState<{ selectedEntityId: string | null }>({
          selectedEntityId: null,
        }),
        withComputed(({ selectedEntityId }) => ({
          selectedEntity: computed(() => {
            const selectedId = selectedEntityId();
            return selectedId ? entityMap()[selectedId] : null;
          }),
        }))
      )
    )
  );

const testPassingGenericType = signalStore(
  withEntities<Book>(),
  withSelectedEntity((store) => selectedEntitySelector(store.entityMap))
);
const myStore = new testPassingGenericType();

const result = myStore.selectedEntity; // Signal<Book | null>
//.    ^?
