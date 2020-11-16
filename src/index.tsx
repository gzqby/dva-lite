// 手写一个dva，没看过源码，基本按照api使用方法自己思路写的，没用过的api没实现。可能后面会去对比一下思路/
import Dva from "./dva";
import { connect } from "react-redux";

const dva = (initial?:any) => {
  return new Dva(initial);
}

export {connect};
export default dva;