// import 'reflect-metadata';
require('reflect-metadata');

const CONTROLLER_PREFIX_META = 'CONTROLLER_PREFIX_META';
const METHOD_META = 'METHOD_META';
const PATH_META = 'PATH_META';


const controllerMap = new Map();
/**
 * 增加前缀路径到对应的controller
 * @param prefix 类路由前缀
 */
function Prefix(prefix = '') {
  return targetClass => {
    Reflect.defineMetadata(CONTROLLER_PREFIX_META, prefix, targetClass);
  };
}

function RequestMethods(methods) {
  return (target, _key, descriptor) => {
    controllerMap.set(target, target);
    methods = typeof methods === 'string' ? [methods] : methods;
    Reflect.defineMetadata(METHOD_META, methods, descriptor.value);
  };
}

function Path(path= '/') {
  return (target, _key, descriptor) => {
    controllerMap.set(target, target);
    Reflect.defineMetadata(PATH_META, path, descriptor.value);
  };
}
/**
 * 加载装饰器路由
 * @param app Application
 * @param globalPrefix 全局路由前缀,可选参数
 */
function RouteLoader(app, globalPrefix = '') {
  const { router } = app;
  controllerMap.forEach((controller) => {
    const controllerPrefix = Reflect.getMetadata(CONTROLLER_PREFIX_META, controller.constructor) || '';
    // guolv
    Object.getOwnPropertyNames(controller).filter(
      (funcName) => funcName !== 'constructor' && funcName !== 'pathName' && funcName !== 'fullPath',
    ).forEach((funcName) => {
      const path = Reflect.getMetadata(PATH_META, controller[funcName]);
      const methods = Reflect.getMetadata(METHOD_META, controller[funcName]);
      const func = (ctx, ...args) => {
        // TODO:
        const instacne = new controller.constructor(ctx);
        return instacne[funcName](...args);
      };
      // 注册路由
      methods.forEach((method) => router[method.toLowerCase()](globalPrefix + controllerPrefix + path, func));
      console.log('route:',globalPrefix + controllerPrefix + path,'func:',controller.pathName+'.'+funcName);
    });
  });
}
module.exports={
    RouteLoader,
    RequestMethods,
    Path,
    Prefix
}