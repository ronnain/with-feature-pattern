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

function generateWithFeature<
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

function genericSignalStoreFeature<Feature extends SignalStoreFeature>(
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

const { selector: testGS, withFeature: withFT } = generateWithFeature(
  <CustomType>(customType: CustomType) =>
    genericSignalStoreFeature(
      signalStoreFeature(
        withProps(() => ({ query: null as CustomType | null }))
      )
    )
);
// const { selector: testGS, withFeature: withFT } = generateWithFeature(
//   <CustomType>(customType: CustomType) => {
//     const innerF = signalStoreFeature(
//       withProps(() => ({ query: null as CustomType | null }))
//     );
//     type Re = typeof innerF extends SignalStoreFeature<
//       EmptyFeatureResult,
//       infer Output
//     >
//       ? Output
//       : never;
//     return innerF as unknown as Re;
//   }
// );
const tg = testGS('nu');

const test4w2 = signalStore(
  withProps(() => ({
    customType1: '3',
    customType2: '3',
  })),
  withFT((store) => testGS(store.customType1))
);
const ree = new test4w2();
const rre = ree.query;
