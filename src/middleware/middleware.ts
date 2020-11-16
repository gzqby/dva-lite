import { Action } from "redux";
import { TypeModel, Action as InternalAction } from '../dva';

export const dvaMiddleware = (dvaModels, hookLoading) => (store) => {
  const { namespace } = hookLoading;
  return next => (action: Action) => {
    const effectsCaches = dvaModels.getEffectsCaches(),
          type = action.type;
          
    const ifEffects = Object.keys(effectsCaches).includes(type);
    if (ifEffects) {
      store.dispatch({type: `${namespace}/show`, payload: {effectName: type}});
      return (() => {
        return dvaModels.models[effectsCaches[type]]['effects'][type](action, {put: async (...args)=>{store.dispatch(...args);}, call: async (fetch, payload) => fetch(payload)})
               .then(()=>{
                  store.dispatch({type: `${namespace}/hide`, payload: {effectName: type}});
               })
      })();
    }
    // why next is sync excute? there is one sentence in Reduc document: "where each middleware requires no knowledge of what comes before or after it in the chain";
    const returnValue = next(action);
    return returnValue
  }
}

export const createLoading = (opt?:TypeModel) => {
  const {
    namespace="loading",
    state={},
    reducers,
    effects
  } = opt || {};
  const loadingModel = {
    namespace: namespace,
    state,
    reducers: {
      show: (state, {payload}: InternalAction<{
        effectName: string,
      }>) => {
        return { ...state, [payload.effectName]: true, }
      },
      hide: (state, {payload}: InternalAction<{
        effectName: string,
      }>) => {
        return { ...state, [payload.effectName]: false, }
      },
      ...reducers,
    },
    effects,
  }

  return loadingModel;
}