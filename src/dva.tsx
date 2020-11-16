import React, { Reducer } from "react";
import ReactDOM from "react-dom";
import { Provider } from "react-redux";
import { createStore,applyMiddleware, combineReducers, ReducersMapObject, Middleware } from 'redux';
import { createHashHistory, LocationState } from "history";

import {dvaMiddleware} from './middleware/middleware';

type TypeDvaConstructorProps = {
  history: any,
  initialState: Object,
}

type TypeEffectsCaches = {
  [propnames: string]: string
}

export type Action<P=any> = {
  type: string,
  payload?: P,
};

export type TypeModel = {
  namespace: string,
  state?: {
    [propnames: string]: any
  },
  effects?: {
    [propnames: string]: AsyncGeneratorFunction
  },
  reducers?: {
    [propnames: string]: Reducer<any, Action>
  }
}

type TypeModels = {[propnames: string]: TypeModel};

class Models {
  private models: TypeModels = {};
  // cache effect names
  private effectsCaches: TypeEffectsCaches = {};
  // private reducersCaches = {};

  setModels(model) {
    const { namespace } = model;
    const reducers = model['reducers'] || {};
    const effects = model['effects'] || {};
    Object.keys(reducers).forEach(reducerKey=>{
      model['reducers'][namespace + "/" + reducerKey] = reducers[reducerKey]
      delete reducers[reducerKey];
    });
    Object.keys(effects).forEach(effectKey=>{
      model['effects'][namespace + "/" + effectKey] = effects[effectKey];
      delete effects[effectKey];
      this.effectsCaches[namespace + "/" + effectKey] = namespace;
    });
    this.models[namespace] = model;
  }

  getModel(namespace?:string) {
    return namespace ? this.models[namespace] : this.models;
  }

  getEffectsCaches() {
    return this.effectsCaches;
  }

  deleteModel(namespace: string) {
    delete this.models[namespace];
  }
}
// export const dvaModels = new Models();

class Dva {
  private history;
  private initialState;
  private app;
  private store;
  private preBaseReducer = {};
  private dvaModels;
  private middleWares = [];
  private started = false;
  private hookLoading: TypeModel;

  constructor(props: TypeDvaConstructorProps | {} = {}) {
    const { history = createHashHistory<LocationState>(), initialState } = props as TypeDvaConstructorProps;
    this.history = history;
    this.initialState = initialState;
    this.dvaModels = new Models();
  }

  initStore() {
    const models = this.dvaModels.getModel();
    
    Object.keys(models).forEach(namespace=>{
      const model = models[namespace];
      this.preBaseReducer[namespace] = this.generateReducer(model);
    })
    this.store = createStore(combineReducers(this.preBaseReducer), this.initialState, applyMiddleware(dvaMiddleware(this.dvaModels, this.hookLoading), ...this.middleWares));
  }

  use(middleWare: Middleware | TypeModel) {
    if(typeof middleWare === "function") {
      this.middleWares.push(middleWare);
    }else{
      this.hookLoading = middleWare;
      this.model(middleWare);
    }
  }

  generateReducer(model) {
    return (state=model['state'], action) => {
      if(Object.keys(model['reducers']).includes(action.type)) {
        return model['reducers'][action.type](state, action)
      }else {
        return state;
      }
    }
  }

  model(model) {
    this.dvaModels.setModels(model);
    if(this.started){
      const namespace = model.namespace;
      this.preBaseReducer[namespace] = this.generateReducer(model);
      const rootReducers = combineReducers(this.preBaseReducer);
      this.store.replaceReducer(rootReducers);
    }
  }

  unmodel(namespace) {
    this.dvaModels.deleteModel(namespace);
    delete this.preBaseReducer[namespace];
  }

  start(selector?:string) {
    const App = this.app;
    this.started = true;
    this.initStore();
    return !selector ? App : ReactDOM.render(<Provider store={this.store}><App history={this.history} /></Provider>, document && document.querySelector(selector));
  }

  router(app) {
    this.app = app;
  }
}

export default Dva;