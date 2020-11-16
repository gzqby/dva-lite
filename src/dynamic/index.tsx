// import dynamic from 'dva/dynamic';

import { useMemo, useRef, useState } from "react"
import InternalLoading from "./InternalLoading";


// const UserPageComponent = dynamic({
//   app,
//   models: () => [
//     import('./models/users'),
//   ],
//   component: () => import('./routes/UserPage'),
// });

export const dynamicWrapper = (Loading) => {
  const loadModels = (app, models) => {
    return true;
  }

  return (props) =>{
    const { app, models, component } = props;

    const modelsIsOk = loadModels(app, models);

    const Component = () => {
      const [ifLoad ,useLoad] = useState(false);
      const componentPromise = useMemo(()=>component(), [component]);
      const ComRef = useRef();

      componentPromise.then(resCom=>{
        ComRef.current = resCom;
        ifLoad !== true && useLoad(true);
      });

      return (ifLoad && modelsIsOk) ? <ComRef.current /> : <Loading />;
    }
    return <Component />
  }
}

export default dynamicWrapper(InternalLoading);